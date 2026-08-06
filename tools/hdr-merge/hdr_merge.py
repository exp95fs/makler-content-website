#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
hdr_merge.py -- Belichtungsreihen aus der Immobilienfotografie zu einem
neutralen, technisch sauberen Basisbild zusammenrechnen.

Leitgedanke: Dieses Werkzeug erzeugt KEINEN kreativen Look. Es liefert ein
Basisbild mit maximalem Tonwertumfang und korrekt durchgezeichnetem Fenster,
auf das anschliessend in Lightroom das eigene Preset gelegt wird.

Kein Kontrast-Boost, keine S-Kurve, keine Saettigungsanhebung, kein Clarity,
keine Vignette, kein Schaerfen. Der einzige tonale Eingriff ist die
"tonale Normalisierung": ein deterministischer, rein regelbasierter Schritt,
der jedes Bild auf dieselben Zielwerte bringt (Weisspunkt, Schwarzpunkt,
Mittelton, Graupunkt), damit ein vorhandenes Preset vorhersagbar greift.

Aufruf:
    python hdr_merge.py EINGABE_ORDNER AUSGABE_ORDNER \
        --bracket-size auto --window-strength 0.8 --window-wb 0.5 --preview

Autor: erstellt fuer den Quadratblick-Workflow. Deterministisch: gleicher
Input erzeugt bitgleichen Output.
"""

from __future__ import annotations

import argparse
import dataclasses
import logging
import math
import multiprocessing
import os
import struct
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Iterable, Sequence

import cv2
import numpy as np
import tifffile

# rawpy wird erst bei Bedarf importiert, damit das Werkzeug auch dann laeuft,
# wenn nur 16-Bit-TIFFs verarbeitet werden und rawpy nicht installiert ist.
try:  # pragma: no cover - reiner Import-Pfad
    import rawpy
except Exception:  # pragma: no cover
    rawpy = None

# Hinweis: piexif wird nicht verwendet. Es kann nur JPEG/TIFF/WebP lesen und
# scheitert an RAW-Containern (CR2, NEF, ARW, RAF); ausserdem kann es kein
# Exif-IFD in ein von tifffile geschriebenes TIFF einfuegen. Beides ist hier
# stattdessen direkt geloest (Minimal-EXIF-Parser + XMP-Paket), womit eine
# Abhaengigkeit entfaellt.


# ---------------------------------------------------------------------------
# Konstanten
# ---------------------------------------------------------------------------

RAW_ENDUNGEN = {".cr2", ".nef", ".arw", ".dng", ".raf"}
TIFF_ENDUNGEN = {".tif", ".tiff"}
UNTERSTUETZTE_ENDUNGEN = RAW_ENDUNGEN | TIFF_ENDUNGEN

# Rec.709-Luminanzgewichte (sRGB-Primaerfarben)
LUMA_GEWICHTE = np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)

# Erwartete Reihenlaengen einer Belichtungsreihe
ERWARTETE_REIHENLAENGEN = (3, 5, 7)

# Lokaler Weissabgleich: ab dieser Buntheit gilt ein Pixel als gefaerbte
# Flaeche und verraet nichts mehr ueber die Lichtfarbe. Darunter faellt
# sein Gewicht linear ab.
NEUTRAL_GRENZE = 0.22
# So viel neutrales Gewicht muss in der Umgebung liegen, damit der oertlichen
# Schaetzung voll vertraut wird (Anteil der Umgebungsflaeche).
NEUTRAL_MINDESTANTEIL = 0.10

# Kontrastkennlinie, gemessen am kommerziellen Vorbild: perzentilweiser
# Vergleich von drei fertigen Ergebnissen des Dienstes mit den eigenen
# Ergebnissen derselben drei Aufnahmen. Links der eigene Ist-Wert, rechts
# der Wert des Vorbilds. Die Stuetzstellen sind streng monoton steigend,
# damit keine Tonwerte zusammenfallen und Zeichnung verloren geht.
KONTRAST_STUETZSTELLEN = np.array(
    [0.00, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50,
     0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95, 1.00],
    dtype=np.float32)
KONTRAST_ZIELWERTE = np.array(
    [0.000, 0.045, 0.075, 0.098, 0.125, 0.152, 0.185, 0.240, 0.330, 0.430,
     0.513, 0.583, 0.640, 0.702, 0.765, 0.815, 0.855, 0.905, 0.950, 0.982,
     1.000],
    dtype=np.float32)

LOG = logging.getLogger("hdr_merge")


# ---------------------------------------------------------------------------
# Kleine Hilfsfunktionen
# ---------------------------------------------------------------------------


def berechne_luminanz(bild: np.ndarray) -> np.ndarray:
    """Luminanz (Rec.709) eines RGB-Float-Bildes."""
    return np.tensordot(bild, LUMA_GEWICHTE, axes=([2], [0])).astype(np.float32)


def ungerade(wert: int) -> int:
    """Naechste ungerade Zahl >= 3 (fuer OpenCV-Kernelgroessen)."""
    wert = int(max(3, wert))
    return wert if wert % 2 == 1 else wert + 1


def box_filter(bild: np.ndarray, radius: int) -> np.ndarray:
    """Mittelwertfilter mit quadratischem Fenster (2*radius+1)."""
    k = ungerade(2 * int(radius) + 1)
    return cv2.boxFilter(bild, -1, (k, k), borderType=cv2.BORDER_REFLECT)


def lokale_standardabweichung(kanal: np.ndarray, radius: int) -> np.ndarray:
    """Lokale Standardabweichung ueber ein quadratisches Fenster.

    Wird benutzt, um im Dunkelbild echte Struktur (Fensteraussicht) von
    strukturlosen Flaechen (weisse Wand, Lampenschirm) zu unterscheiden.
    """
    mittel = box_filter(kanal, radius)
    mittel_quadrat = box_filter(kanal * kanal, radius)
    varianz = np.maximum(mittel_quadrat - mittel * mittel, 0.0)
    return np.sqrt(varianz, dtype=np.float32)


def guided_filter(fuehrung: np.ndarray, quelle: np.ndarray, radius: int,
                  eps: float) -> np.ndarray:
    """Kantenbewusster Guided Filter (He et al.), eigene NumPy-Implementierung.

    Bewusst selbst implementiert, damit keine Abhaengigkeit auf
    ``opencv-contrib`` entsteht. Die Fuehrung ist einkanalig (Luminanz des
    fusionierten Bildes), die Quelle ist die binaere Fenstermaske.

    Ein einfacher Gauss-Weichzeichner auf der Maske wuerde die Maskenkante
    ueber die Fensterkante hinausschmieren und genau die Halos erzeugen,
    die dieses Werkzeug vermeiden soll.
    """
    fuehrung = fuehrung.astype(np.float32)
    quelle = quelle.astype(np.float32)
    radius = max(1, int(radius))

    mittel_f = box_filter(fuehrung, radius)
    mittel_q = box_filter(quelle, radius)
    mittel_ff = box_filter(fuehrung * fuehrung, radius)
    mittel_fq = box_filter(fuehrung * quelle, radius)

    varianz_f = mittel_ff - mittel_f * mittel_f
    kovarianz_fq = mittel_fq - mittel_f * mittel_q

    a = kovarianz_fq / (varianz_f + eps)
    b = mittel_q - a * mittel_f

    mittel_a = box_filter(a, radius)
    mittel_b = box_filter(b, radius)
    return (mittel_a * fuehrung + mittel_b).astype(np.float32)


def fuelle_loecher(maske: np.ndarray) -> np.ndarray:
    """Fuellt Loecher in einer binaeren Maske (uint8, 0/1).

    Fenstersprossen sind im Rohzustand nicht ausgebrannt und fallen daher aus
    der Maske; sie sollen aber Teil der Maske sein, damit der Uebergang
    zusammenhaengend bleibt.
    """
    maske = (maske > 0).astype(np.uint8)
    h, w = maske.shape
    invers = np.ones((h + 2, w + 2), dtype=np.uint8)
    invers[1:-1, 1:-1] = 1 - maske
    fuell_maske = np.zeros((h + 4, w + 4), dtype=np.uint8)
    cv2.floodFill(invers, fuell_maske, (0, 0), 0)
    loecher = invers[1:-1, 1:-1] > 0
    return (maske | loecher.astype(np.uint8)).astype(np.uint8)


# Steigung der Rolloff-Kurve. Bildunabhaengig, damit jedes Bild exakt
# dieselbe Kurve bekommt (kein "Look nach Bildinhalt"). Kleinere Werte
# lassen dem Fensterinhalt mehr Zeichnung, machen den Himmel aber dunkler;
# groessere Werte machen den Himmel heller und flacher.
ROLLOFF_RATE = 1.0

# Radius der Frequenztrennung in der Lichterkompression, als Anteil der
# Bildbreite. Klein genug, dass nur Feinzeichnung (Wolken, Sprossen)
# erhalten bleibt, nicht der Helligkeitsverlauf ueber das Fenster.
DETAIL_RADIUS_ANTEIL = 0.006

# Radius, mit dem das Ausbrenn-Gewicht geschlossen wird, als Anteil der
# Bildbreite. Gross genug, um Motivstruktur (Wiese, Wolkenkanten) zu
# schliessen, klein genug, um eine Pendelleuchte stehen zu lassen.
AUSBRENN_CLOSE_ANTEIL = 0.005

# Ab welchem Bruchteil der Rahmenhelligkeit ein Pixel als Aussicht zaehlt.
# Unterhalb dieses Werts liegt Inventar im Raum (gemessen: Sofakissen bei
# 0.29 der Rahmenhelligkeit), oberhalb die Szene draussen (Aussicht hinter
# einem Insektengitter bei 1.7, freie Aussicht bei 3.5).
AUSSICHT_RAMPE = 0.5

# Unterhalb dieser Abweichung wird ein Bild NICHT neu gerechnet. Eine halbe
# Pixelbreite ist die Grenze, ab der eine Verschiebung im Ergebnis ueberhaupt
# sichtbar werden kann; darunter kostet das Interpolieren nur Schaerfe.
AUSRICHT_SCHWELLE_PX = 0.5

# Radius des Kantenkontrasts als Anteil der Bildbreite. Er ist so gewaehlt,
# dass er bei ueblicher Bildschirmgroesse auf rund einem Pixel landet: Eine
# 33-Megapixel-Aufnahme wird auf einem Monitor vierfach verkleinert, 4 px im
# Original werden dort zu 1 px. Genau dieser Anteil fehlte im Vergleich mit
# dem kommerziellen Vorbild (0.73 seiner Kantenzeichnung ohne, 1.02 mit).
ANZEIGE_RADIUS_ANTEIL = 0.0006
# Wie stark der Kantenkontrast gegenueber dem Capture Sharpening wiegt.
ANZEIGE_ANTEIL = 0.6

# Kennlinie, die die weiche Fenstermaske auf ihren vollen Wertebereich
# streckt. Unterhalb von UNTEN gilt eine Stelle als Rahmen (Deckkraft null),
# oberhalb von OBEN als Fenster (volle Deckkraft). Ohne sie erreicht die
# Maske innen nie ihren vollen Wert und das ausgebrannte Grundbild scheint
# als heller Saum durch; mit zu weiten Grenzen laeuft sie auf den Rahmen und
# faerbt ihn grau.
MASKE_KENNLINIE_UNTEN = 0.20
MASKE_KENNLINIE_OBEN = 0.60

# Breite der Belichtungsguete-Glocke beim Aufbau der Strahlungskarte. Sie
# bestimmt, wie stark ein Pixel gewichtet wird, dessen Wert von der
# Bildmitte abweicht. Breit genug, dass in einer Dreierreihe immer
# mindestens eine Aufnahme kraeftig beitraegt.
BELICHTUNGSGUETE_BREITE = 0.22
# Kantenschaerfe der Basis-Feinzeichnung-Trennung im Tonemapping. Groesser
# als beim Maskieren, weil hier ein glatter Beleuchtungsverlauf getrennt
# werden soll und keine harte Kante.
TONEMAP_KANTENSCHAERFE = 0.04
# Welches Perzentil der Strahlung als "Raumniveau" gilt, auf das belichtet
# wird. Bewusst ueber dem Median: Fenster und Lampen belegen den oberen
# Rand und wuerden den Median nach oben verziehen.
RAUMNIVEAU_PERZENTIL = 60.0
# Die Lichterschulter arbeitet nicht mehr mit einem festen Stauchfaktor.
#
# Vorher wurde alles oberhalb des Knies linear auf 18 Prozent gestaucht -
# auch der Kontrast INNERHALB des Fensters. Wolken vor blauem Himmel liegen
# beide oberhalb des Knies; ihr Unterschied wurde damit ebenfalls
# gefuenftelt, und das Fenster wurde zu einer blassen, gleichmaessigen
# Flaeche. Genau das war der "matschige" Fenstereindruck: kein
# Schaerfeproblem, sondern zerstoerter Kontrast.
#
# Die Schulter ist stattdessen asymptotisch:
#
#     neu = knie + kopf * (1 - exp(-(alt - knie) / kopf))
#
# Am Knie ist ihre Steigung exakt 1.0 - dort bleibt der Kontrast also
# vollstaendig erhalten. Erst weit darueber flacht sie ab (eine Blende
# ueber dem Knie noch 42 Prozent, zwei Blenden 18 Prozent) und naehert
# sich der Decke, ohne sie je zu erreichen. Ausbrennen ist damit
# mathematisch ausgeschlossen, und die Zeichnung dicht oberhalb des
# Knies - Wolken, Dachziegel, Laub - bleibt erhalten.

# Ab hier wird das Grundbild beim Einsetzen des Fensterinhalts weich in die
# Anzeigegrenze gerollt. Bewusst dicht unter 1.0: Angetastet wird nur, was
# sonst clippen wuerde. Alles darunter - helle Waende, Arbeitsplatten,
# Sonnenflecken auf weisser Laibung - bleibt exakt unveraendert.
GRUNDBILD_KNIE = 0.95

# Unterhalb dieser Luminanz wird die Zeichnungsverstaerkung ausgeblendet,
# damit sie die Tiefen nicht auf null druckt. Deutlich ueber dem Schwarzpunkt
# (0.035), damit auch knapp darueber noch Luft bleibt. Mit der zweistufigen
# Schaerfung musste der Wert steigen: Bei 0.12 fiel der Schwarzpunkt der
# Testszene auf 0.014 statt der angestrebten 0.035.
SCHATTEN_SCHUTZ = 0.22


def weicher_rolloff(werte: np.ndarray, knie: float, obergrenze: float = 1.0,
                    rate: float = ROLLOFF_RATE) -> np.ndarray:
    """Weiche, streng monotone Rolloff-Kurve oberhalb eines Knies.

    Unterhalb des Knies bleibt der Wert exakt unveraendert (keine Kurve auf
    den Mitteltoenen). Oberhalb wird der Bereich [knie, unendlich) auf
    [knie, obergrenze) abgebildet - ohne Sattelpunkt, damit Struktur in den
    Lichtern erhalten bleibt statt wegzuclippen.

    Genau das ist der Grund, warum ein Window Pull ueberhaupt eine
    Kompression braucht: Ein Fenster ist rund 6 Blendenstufen heller als der
    Innenraum. Beides gleichzeitig linear in 0..1 unterzubringen, ist
    physikalisch nicht moeglich - ohne Kompression waere der Fensterinhalt
    nach der Normalisierung wieder weiss.
    """
    werte = werte.astype(np.float32)
    spanne = max(obergrenze - knie, 1e-4)
    oben = werte > knie
    ergebnis = werte.copy()
    x = werte[oben] - knie
    ergebnis[oben] = knie + spanne * (1.0 - np.exp(-float(rate) * x))
    return ergebnis.astype(np.float32)


def komprimiere_lichter_in_maske(bild: np.ndarray, maske_weich: np.ndarray,
                                 knie: float, obergrenze: float,
                                 rate: float = ROLLOFF_RATE,
                                 detail_erhalt: float = 1.0) -> np.ndarray:
    """Wendet den Rolloff auf den maskierten Bereich an.

    Gerechnet wird auf dem **staerksten Kanal** je Pixel, nicht auf der
    Luminanz. Die RGB-Kanaele werden anschliessend mit demselben Faktor
    skaliert, wodurch Farbton und Saettigung exakt erhalten bleiben - der
    Himmel wird heller oder dunkler, aber nicht bunter.

    Warum der Maximalkanal und nicht die Luminanz: Ein blauer Himmel hat im
    Blaukanal deutlich hoehere Werte als in der Luminanz. Wird auf die
    Luminanz normiert, liegt Blau anschliessend ueber 1.0 und wird beim
    Speichern abgeschnitten - genau dann verliert der Himmel seine Farbe und
    wird milchig weiss. Ueber den Maximalkanal ist garantiert, dass kein
    Kanal die Obergrenze reisst und nichts geclippt werden muss.

    Die Kompression wird ausserdem nur auf die GROBE Struktur gelegt. Ein
    Rolloff ist eine flache Kennlinie: Wo er den Tonwertumfang auf ein
    Drittel staucht, staucht er die feine Zeichnung gleich mit - und aus
    Wolken wird eine gleichmaessige helle Flaeche. Genau das war messbar:
    Die Feinzeichnung in den hellsten fuenf Prozent lag bei zwei vermessenen
    Aufnahmen bei 0.022 und 0.014, beim kommerziellen Vorbild dagegen bei
    0.048 und 0.049.

    Deshalb wird die Fuehrungsgroesse in eine grobe Basis und die feine
    Zeichnung zerlegt. Nur die Basis durchlaeuft den Rolloff, die
    Feinzeichnung wird unveraendert wieder aufaddiert (--window-texture).
    Der Himmel bekommt dadurch seine Wolkenstruktur zurueck, ohne dass die
    Gesamthelligkeit des Fensters steigt.
    """
    fuehrung = bild.max(axis=2)

    if detail_erhalt > 0.0:
        # Radius bewusst klein: Es geht um Wolkenzeichnung und Sprossen,
        # nicht um den Helligkeitsverlauf ueber das ganze Fenster - der
        # gehoert in die Basis und muss komprimiert werden.
        radius = max(2, int(round(bild.shape[1] * DETAIL_RADIUS_ANTEIL)))
        basis = np.maximum(box_filter(fuehrung, radius), 1e-5)

        # Die Feinzeichnung wird als VERHAELTNIS zur Basis gefuehrt, nicht
        # als Differenz. Der Unterschied ist nicht kosmetisch: Eine
        # Palmwedel vor hellem Himmel liegt zwei Blendenstufen unter der
        # oertlichen Basis. Als Differenz aufaddiert ergibt das nach der
        # Kompression der Basis einen negativen Zielwert - der Wedel wird
        # schwarz. Gemessen an einer echten Aufnahme fielen so 0.41 % aller
        # Pixel auf null, sichtbar als schwarze Sprenkel im Fenster.
        #
        # Als Verhaeltnis geht das nicht: Ein Faktor bleibt ein Faktor,
        # gleich wie stark die Basis gestaucht wird. Der Wedel behaelt
        # seinen relativen Abstand zum Himmel und kann nie unter null
        # geraten.
        exponent = float(np.clip(detail_erhalt, 0.0, 1.0))
        # Bei vollem Detailerhalt ist das Potenzieren mathematisch wirkungslos
        # (x hoch 1 ist x), NumPy rechnet es aber trotzdem ueber jeden Pixel
        # aus - und der Spitzlichtschutz ruft genau mit diesem Wert. Das
        # Ergebnis ist nachgewiesen bitgleich.
        #
        # Ehrlichkeitshalber: Eine messbare Zeitersparnis hat das hier NICHT
        # gebracht (11.94 gegenueber 11.86 Sekunden). Die Laufzeit dieser
        # Funktion wird nicht vom Rechnen bestimmt, sondern vom Anfordern der
        # 132-MB-Zwischenarrays - die Einzelschritte summieren sich auf 2.9
        # Sekunden, die Funktion braucht 11.9. Der Verzicht bleibt trotzdem
        # richtig: Arbeit ohne Wirkung gehoert nicht in den Rechenweg.
        # Die Basis muss vor dem Potenzieren nichtnegativ sein: Eine
        # negative Zahl hoch 0.9 ist nicht definiert, NumPy liefert dafuer
        # NaN - und ein einziges NaN breitet sich ueber alle folgenden
        # Rechenschritte aus. Negative Werte koennen hier auftreten, weil
        # das Bild an dieser Stelle noch nicht begrenzt ist.
        anteil = np.maximum(fuehrung, 0.0) / basis
        verhaeltnis = anteil if exponent == 1.0 else np.power(anteil, exponent)
        ziel = weicher_rolloff(basis, knie, obergrenze, rate) * verhaeltnis
        # Die Feinzeichnung darf die Obergrenze nicht reissen. Der winzige
        # Abschlag haelt die Zusage auch dann ein, wenn die Obergrenze in
        # float32 minimal aufgerundet dargestellt wird.
        ziel = np.clip(ziel, 0.0, obergrenze * (1.0 - 1e-6))
    else:
        ziel = weicher_rolloff(fuehrung, knie, obergrenze, rate)

    faktor = np.where(fuehrung > 1e-5, ziel / np.maximum(fuehrung, 1e-5), 1.0)
    alpha = np.clip(maske_weich, 0.0, 1.0)
    faktor = 1.0 + (faktor - 1.0) * alpha
    return (bild * faktor[..., None]).astype(np.float32)


# ---------------------------------------------------------------------------
# EXIF-Lesen (eigener Minimal-Parser, damit CR2/NEF/ARW/DNG/RAF abgedeckt sind)
# ---------------------------------------------------------------------------

TAG_MAKE = 0x010F
TAG_MODEL = 0x0110
TAG_DATETIME = 0x0132
TAG_EXIF_IFD = 0x8769
TAG_EXPOSURE_TIME = 0x829A
TAG_FNUMBER = 0x829D
TAG_ISO = 0x8827
TAG_DATETIME_ORIGINAL = 0x9003
TAG_EXPOSURE_BIAS = 0x9204
TAG_FOCAL_LENGTH = 0x920A
TAG_FOCAL_35MM = 0xA405
TAG_LENS_MODEL = 0xA434

_TYP_GROESSE = {1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8,
                11: 4, 12: 8}


def _lies_ifd(daten: bytes, basis: int, offset: int, byteorder: str,
              ergebnis: dict, tiefe: int = 0) -> None:
    """Liest ein TIFF-IFD und folgt dem Exif-Unter-IFD."""
    if tiefe > 2 or offset <= 0 or basis + offset + 2 > len(daten):
        return
    b = byteorder
    pos = basis + offset
    (anzahl,) = struct.unpack_from(b + "H", daten, pos)
    pos += 2
    for _ in range(anzahl):
        if pos + 12 > len(daten):
            return
        tag, typ, zahl = struct.unpack_from(b + "HHI", daten, pos)
        wert_offset = pos + 8
        groesse = _TYP_GROESSE.get(typ, 0) * zahl
        if groesse == 0:
            pos += 12
            continue
        if groesse > 4:
            (zeiger,) = struct.unpack_from(b + "I", daten, wert_offset)
            wert_offset = basis + zeiger
        if wert_offset + groesse > len(daten) or wert_offset < 0:
            pos += 12
            continue
        roh = daten[wert_offset:wert_offset + groesse]
        wert: Any = None
        try:
            if typ == 2:
                wert = roh.split(b"\x00")[0].decode("ascii", "replace")
            elif typ == 3:
                wert = struct.unpack_from(b + "H", roh, 0)[0]
            elif typ == 4:
                wert = struct.unpack_from(b + "I", roh, 0)[0]
            elif typ == 5:
                zaehler, nenner = struct.unpack_from(b + "II", roh, 0)
                wert = zaehler / nenner if nenner else 0.0
            elif typ == 10:
                zaehler, nenner = struct.unpack_from(b + "ii", roh, 0)
                wert = zaehler / nenner if nenner else 0.0
        except struct.error:
            wert = None
        if wert is not None:
            ergebnis.setdefault(tag, wert)
        if tag == TAG_EXIF_IFD and isinstance(wert, int):
            _lies_ifd(daten, basis, wert, byteorder, ergebnis, tiefe + 1)
        pos += 12


def _parse_tiff_block(daten: bytes, basis: int) -> dict:
    """Parst einen TIFF-Header ab ``basis`` und liefert die Tags."""
    if basis + 8 > len(daten):
        return {}
    kopf = daten[basis:basis + 4]
    if kopf[:2] == b"II":
        byteorder = "<"
    elif kopf[:2] == b"MM":
        byteorder = ">"
    else:
        return {}
    (erstes_ifd,) = struct.unpack_from(byteorder + "I", daten, basis + 4)
    ergebnis: dict = {}
    _lies_ifd(daten, basis, erstes_ifd, byteorder, ergebnis)
    return ergebnis


def lies_exif(pfad: Path, max_bytes: int = 4 * 1024 * 1024) -> dict:
    """Liest die fuer die Gruppierung noetigen EXIF-Felder.

    Deckt TIFF-basierte Formate (TIF, DNG, CR2, NEF, ARW) direkt ab und
    findet bei Fuji-RAF den eingebetteten JPEG-Vorschaublock mit APP1/Exif.
    Bewusst ein eigener Minimal-Parser: piexif kann keine RAW-Container
    lesen, und eine zusaetzliche Abhaengigkeit soll vermieden werden.
    """
    try:
        with open(pfad, "rb") as f:
            daten = f.read(max_bytes)
    except OSError:
        return {}

    tags = _parse_tiff_block(daten, 0)
    if not tags or TAG_DATETIME_ORIGINAL not in tags:
        # Fuji RAF und andere Container: eingebettetes JPEG mit APP1 suchen.
        marker = daten.find(b"Exif\x00\x00")
        if marker != -1:
            tags2 = _parse_tiff_block(daten, marker + 6)
            for k, v in tags2.items():
                tags.setdefault(k, v)
    return tags


def berechne_ev(tags: dict) -> float | None:
    """Belichtungswert (EV) der Aufnahmeeinstellung.

    Hoeherer EV = dunkleres Bild. Wird zur Erkennung des Reihenmusters
    benutzt (innerhalb einer Reihe laeuft der EV monoton).
    """
    t = tags.get(TAG_EXPOSURE_TIME)
    n = tags.get(TAG_FNUMBER)
    iso = tags.get(TAG_ISO)
    if not t or not n or t <= 0 or n <= 0:
        return None
    ev = math.log2((n * n) / t)
    if iso:
        ev -= math.log2(max(iso, 1) / 100.0)
    return ev


def lies_aufnahmezeit(tags: dict, pfad: Path) -> float:
    """Aufnahmezeit als Unix-Zeitstempel; faellt auf die Dateizeit zurueck."""
    text = tags.get(TAG_DATETIME_ORIGINAL) or tags.get(TAG_DATETIME)
    if isinstance(text, str):
        for muster in ("%Y:%m:%d %H:%M:%S", "%Y-%m-%d %H:%M:%S"):
            try:
                return datetime.strptime(text.strip(), muster).timestamp()
            except ValueError:
                continue
    try:
        return pfad.stat().st_mtime
    except OSError:
        return 0.0


# ---------------------------------------------------------------------------
# Bild laden
# ---------------------------------------------------------------------------


def waehle_demosaic():
    """Das beste verfuegbare Demosaic-Verfahren.

    AAHD ist AHD in beiden Punkten ueberlegen, die hier zaehlen - gemessen
    an denselben Aufnahmen: mehr Zeichnung auf einer Holzwand (relatives
    Detail 0.01172 gegenueber 0.01052, rund elf Prozent mehr) UND weniger
    Falschfarbe auf feinen, sich wiederholenden Strukturen (1.015 statt
    1.262 Prozent). Das ist selten - meist erkauft ein Verfahren das eine
    mit dem anderen.

    Die Falschfarbe ist damit nicht beseitigt: Die blau-orangen Streifen
    auf einer im Backofenglas gespiegelten Jalousie sind echtes optisches
    Moire, entstanden unterhalb der Aufloesungsgrenze des Sensors. Kein
    Demosaic-Verfahren kann Information zurueckholen, die nie aufgezeichnet
    wurde - es laesst sich nur daempfen.

    Nicht jede rawpy-Fassung bringt AAHD mit, deshalb der Rueckfall.
    """
    for name in ("AAHD", "DHT", "AHD"):
        verfahren = getattr(rawpy.DemosaicAlgorithm, name, None)
        if verfahren is not None:
            return verfahren
    return rawpy.DemosaicAlgorithm.AHD


def entwickle_raw(pfad: Path, weissabgleich: str = "camera",
                  halbe_groesse: bool = False) -> np.ndarray:
    """RAW neutral und deterministisch entwickeln.

    Keinerlei Auto-Korrekturen: ``no_auto_bright=True`` verhindert die
    automatische Helligkeitsanpassung (die sonst jedes Bild der Reihe
    unterschiedlich skalieren wuerde und die Belichtungsstufen einebnet),
    ``use_camera_wb=True`` nimmt den in der Kamera gesetzten Weissabgleich,
    ``output_bps=16`` liefert volle Tiefe. Alle Bilder einer Reihe laufen
    zwingend durch exakt dieselben Parameter.
    """
    if rawpy is None:
        raise RuntimeError(
            "rawpy ist nicht installiert - RAW-Dateien koennen nicht "
            "entwickelt werden (pip install rawpy)."
        )
    kamera_wb = weissabgleich != "auto"
    with rawpy.imread(str(pfad)) as raw:
        rgb = raw.postprocess(
            no_auto_bright=True,
            use_camera_wb=kamera_wb,
            use_auto_wb=not kamera_wb,
            output_bps=16,
            output_color=rawpy.ColorSpace.sRGB,
            gamma=(2.222, 4.5),          # Standard-sRGB-Kurve, keine Kreativkurve
            demosaic_algorithm=waehle_demosaic(),
            half_size=halbe_groesse,
            user_flip=None,              # Kamera-Orientierung uebernehmen
            highlight_mode=rawpy.HighlightMode.Clip,
            # Ein Durchgang Medianfilter auf den Farbkanaelen. Er ist gegen
            # Falschfarben gebaut und kostet praktisch keine Zeichnung
            # (gemessen: Wanddetail 0.01172 -> 0.01158, Falschfarbe
            # 1.015 -> 0.943 %).
            median_filter_passes=1,
            fbdd_noise_reduction=rawpy.FBDDNoiseReductionMode.Off,
        )
    return (rgb.astype(np.float32) / 65535.0)


def lade_tiff(pfad: Path) -> np.ndarray:
    """16-Bit-TIFF laden und auf Float 0..1 normieren."""
    bild = tifffile.imread(str(pfad))
    if bild.ndim == 2:
        bild = np.stack([bild] * 3, axis=-1)
    if bild.shape[2] > 3:
        bild = bild[:, :, :3]
    if bild.dtype == np.uint8:
        return bild.astype(np.float32) / 255.0
    if bild.dtype == np.uint16:
        return bild.astype(np.float32) / 65535.0
    return np.clip(bild.astype(np.float32), 0.0, 1.0)


def lade_bild(pfad: Path, weissabgleich: str = "camera",
              halbe_groesse: bool = False) -> np.ndarray:
    """Laedt RAW oder TIFF als RGB-Float32 im Bereich 0..1.

    ``halbe_groesse`` gilt nur fuer RAWs und dient allein der Vorschau: Die
    Entwicklung ueberspringt dann das Demosaicing und liefert direkt ein
    Bild halber Kantenlaenge - rund viermal schneller.
    """
    endung = pfad.suffix.lower()
    if endung in RAW_ENDUNGEN:
        return entwickle_raw(pfad, weissabgleich, halbe_groesse)
    if endung in TIFF_ENDUNGEN:
        return lade_tiff(pfad)
    raise ValueError(f"Nicht unterstuetztes Format: {pfad.name}")


# ---------------------------------------------------------------------------
# Gruppierung der Belichtungsreihen
# ---------------------------------------------------------------------------


@dataclasses.dataclass
class Aufnahme:
    """Eine Einzelaufnahme mit den fuer die Gruppierung noetigen Metadaten."""
    pfad: Path
    zeit: float
    ev: float | None
    tags: dict = dataclasses.field(default_factory=dict, repr=False)


def sammle_aufnahmen(ordner: Path) -> list[Aufnahme]:
    """Liest alle unterstuetzten Dateien eines Ordners inkl. EXIF ein."""
    dateien = sorted(
        (p for p in ordner.iterdir()
         if p.is_file() and p.suffix.lower() in UNTERSTUETZTE_ENDUNGEN),
        key=lambda p: p.name.lower(),
    )
    aufnahmen = []
    for pfad in dateien:
        tags = lies_exif(pfad)
        aufnahmen.append(
            Aufnahme(pfad=pfad, zeit=lies_aufnahmezeit(tags, pfad),
                     ev=berechne_ev(tags), tags=tags)
        )
    # Nach Aufnahmezeit sortieren; bei gleicher Zeit stabil nach Dateiname,
    # damit das Ergebnis reproduzierbar ist.
    aufnahmen.sort(key=lambda a: (a.zeit, a.pfad.name.lower()))
    return aufnahmen


def gruppiere_nach_exif(aufnahmen: Sequence[Aufnahme],
                        max_luecke: float) -> list[list[Aufnahme]]:
    """Gruppiert ueber zeitliche Naehe und das EV-Muster.

    Eine neue Reihe beginnt, wenn
      * der zeitliche Abstand zur Vorgaengeraufnahme zu gross ist, oder
      * das EV-Muster zurueckspringt (die monotone Richtung innerhalb der
        Reihe kehrt sich um oder der EV wiederholt sich).
    """
    gruppen: list[list[Aufnahme]] = []
    aktuell: list[Aufnahme] = []
    gesehen: set[int] = set()

    def schluessel(ev: float | None) -> int | None:
        """EV auf ein Zwanzigstel gerundet - robust gegen Rundungsfehler."""
        return None if ev is None else int(round(ev * 20))

    for a in aufnahmen:
        if not aktuell:
            aktuell = [a]
            gesehen = {schluessel(a.ev)} - {None}
            continue

        vorher = aktuell[-1]
        neue_reihe = False

        if a.zeit - vorher.zeit > max_luecke:
            neue_reihe = True
        elif schluessel(a.ev) is not None and schluessel(a.ev) in gesehen:
            # Wiederholt sich ein Belichtungswert, beginnt die naechste Reihe.
            #
            # Bewusst NICHT ueber eine monotone EV-Folge: Sony und Canon
            # belichten in der Voreinstellung in der Reihenfolge
            # normal - dunkel - hell (gemessen an einer echten Reihe:
            # EV 10.2, 12.3, 8.2). Eine Regel, die auf Monotonie baut, haette
            # genau dort mitten in der Reihe getrennt. Die Wiederholung eines
            # EV-Wertes ist dagegen unabhaengig von der Reihenfolge.
            neue_reihe = True
        elif len(aktuell) >= max(ERWARTETE_REIHENLAENGEN):
            neue_reihe = True

        if neue_reihe:
            gruppen.append(aktuell)
            aktuell = [a]
            gesehen = {schluessel(a.ev)} - {None}
        else:
            aktuell.append(a)
            if schluessel(a.ev) is not None:
                gesehen.add(schluessel(a.ev))

    if aktuell:
        gruppen.append(aktuell)
    return gruppen


def gruppiere_fest(aufnahmen: Sequence[Aufnahme], n: int) -> list[list[Aufnahme]]:
    """Feste Gruppierung in N aufeinanderfolgende Dateien."""
    return [list(aufnahmen[i:i + n]) for i in range(0, len(aufnahmen), n)]


def gruppiere_belichtungsreihen(aufnahmen: Sequence[Aufnahme],
                                bracket_size: str | int,
                                max_luecke: float) -> list[list[Aufnahme]]:
    """Waehlt zwischen automatischer und fester Gruppierung."""
    if isinstance(bracket_size, int) or (isinstance(bracket_size, str)
                                         and bracket_size.isdigit()):
        return gruppiere_fest(aufnahmen, int(bracket_size))
    return gruppiere_nach_exif(aufnahmen, max_luecke)


# ---------------------------------------------------------------------------
# Ausrichtung
# ---------------------------------------------------------------------------


def _graustufen_viertel(bild: np.ndarray) -> np.ndarray:
    """Graustufenbild in Viertelaufloesung fuer die ECC-Schaetzung."""
    grau = berechne_luminanz(bild)
    h, w = grau.shape
    klein = cv2.resize(grau, (max(w // 4, 16), max(h // 4, 16)),
                       interpolation=cv2.INTER_AREA)
    return klein


def _helligkeit_angleichen(grau: np.ndarray, ziel_median: float) -> np.ndarray:
    """Helligkeit fuer die Registrierung angleichen.

    ECC arbeitet zwar helligkeitsinvariant bezueglich eines globalen
    Faktors, reagiert aber empfindlich auf ausgebrannte bzw. abgesoffene
    Bereiche. Das Angleichen des Medians vor der Schaetzung stabilisiert die
    Konvergenz deutlich. Dieser Schritt beeinflusst nur die Registrierung,
    nie die Bilddaten selbst.
    """
    median = float(np.median(grau))
    if median <= 1e-6:
        return grau
    return np.clip(grau * (ziel_median / median), 0.0, 1.0).astype(np.float32)


def richte_reihe_aus(bilder: list[np.ndarray], referenz_index: int,
                     protokoll: list[tuple[int, str]]) -> list[np.ndarray]:
    """Richtet alle Bilder einer Reihe auf das Referenzbild aus.

    Die Transformation wird auf viertelaufgeloesten Graustufenbildern
    geschaetzt (Geschwindigkeit) und anschliessend auf die volle Aufloesung
    hochskaliert. Bei Nicht-Konvergenz wird gewarnt und unausgerichtet
    weitergearbeitet - kein Abbruch.
    """
    referenz_klein = _graustufen_viertel(bilder[referenz_index])
    ziel_median = float(np.median(referenz_klein))
    referenz_klein = _helligkeit_angleichen(referenz_klein, ziel_median)

    h, w = bilder[referenz_index].shape[:2]
    kriterien = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6)

    # Die Liste wird an Ort und Stelle ersetzt. Bei 24 Megapixeln belegt ein
    # einzelnes Bild rund 290 MB; eine zweite komplette Liste waere bei einer
    # Siebener-Reihe ein Gigabyte extra, das hier nicht noetig ist.
    for i in range(len(bilder)):
        bild = bilder[i]
        if i == referenz_index:
            continue
        klein = _helligkeit_angleichen(_graustufen_viertel(bild), ziel_median)
        warp = np.eye(2, 3, dtype=np.float32)
        try:
            _, warp = cv2.findTransformECC(
                referenz_klein, klein, warp, cv2.MOTION_EUCLIDEAN,
                kriterien, None, 5)
        except cv2.error:
            protokoll.append((logging.WARNING,
                              f"Ausrichtung fehlgeschlagen (Bild {i + 1}) - "
                              f"ECC ist nicht konvergiert, Bild wird "
                              f"unausgerichtet verwendet."))
            continue

        # Translationsanteil auf volle Aufloesung hochskalieren.
        warp_voll = warp.copy()
        warp_voll[0, 2] *= 4.0
        warp_voll[1, 2] *= 4.0

        # Bei Stativaufnahmen ist nichts auszurichten - und dann darf auch
        # nichts gerechnet werden. Jede Warp-Operation interpoliert das
        # gesamte Bild neu und kostet dabei Kantenschaerfe, auch wenn sie
        # es nur um ein Drittelpixel verschiebt. Gemessen an einer echten
        # Stativreihe: gefundene Verschiebung 0.16 und 0.38 px, Drehung
        # 0.003 Grad - und trotzdem 5.6 % weniger Kantenschaerfe
        # (Verhaeltnis Hoch- zu Mittelfrequenz 0.3626 auf 0.3423). Das ist
        # reiner Verlust fuer eine Korrektur, die niemand sieht.
        verschiebung = float(np.hypot(warp_voll[0, 2], warp_voll[1, 2]))
        drehung = abs(float(np.degrees(np.arctan2(warp[1, 0], warp[0, 0]))))
        # Die Drehung wirkt am Bildrand am staerksten; dort entspricht sie
        # rund (Winkel im Bogenmass) mal der halben Bilddiagonale.
        drehweg = float(np.radians(drehung) * np.hypot(w, h) / 2.0)
        if max(verschiebung, drehweg) < AUSRICHT_SCHWELLE_PX:
            protokoll.append((logging.DEBUG,
                              f"Bild {i + 1} steht bereits deckungsgleich "
                              f"({verschiebung:.2f} px, {drehung:.3f} Grad) - "
                              f"nicht neu gerechnet, das erhaelt die "
                              f"Kantenschaerfe."))
            continue

        bilder[i] = cv2.warpAffine(
            bild, warp_voll, (w, h),
            # Lanczos statt bilinear: Wenn schon interpoliert werden muss,
            # dann mit dem Verfahren, das die feinen Kanten am besten
            # erhaelt. Bilinear ist ein Tiefpass und macht genau das
            # weich, worauf es hier ankommt.
            flags=cv2.INTER_LANCZOS4 + cv2.WARP_INVERSE_MAP,
            borderMode=cv2.BORDER_REPLICATE)
        del bild
    return bilder


# ---------------------------------------------------------------------------
# Fusion
# ---------------------------------------------------------------------------


def _nach_linear(werte: np.ndarray) -> np.ndarray:
    """Rechnet die sRGB-Kennlinie zurueck, die die RAW-Entwicklung anlegt."""
    werte = np.clip(werte, 0.0, 1.0)
    return np.where(werte <= 0.04045, werte / 12.92,
                    np.power((werte + 0.055) / 1.055, 2.4)).astype(np.float32)


def _nach_srgb(werte: np.ndarray) -> np.ndarray:
    """Legt die sRGB-Kennlinie wieder an."""
    werte = np.clip(werte, 0.0, 1.0)
    return np.where(werte <= 0.0031308, werte * 12.92,
                    1.055 * np.power(werte, 1.0 / 2.4) - 0.055).astype(np.float32)


def baue_strahlungskarte(bilder: Sequence[np.ndarray],
                         evs: Sequence[float],
                         protokoll: list[tuple[int, str]]) -> np.ndarray:
    """Rekonstruiert die tatsaechliche Helligkeitsverteilung der Szene.

    Das ist der Kern des Verfahrens und der Grund, warum es ohne
    Fenstererkennung auskommt. Jede Aufnahme wird linearisiert und mit
    ihrem Belichtungsfaktor auf dieselbe physikalische Skala gebracht -
    danach beschreiben alle drei dieselbe Groesse und lassen sich einfach
    mitteln. Gewichtet wird nur danach, wie gut ein Pixel belichtet ist:
    eine glatte Glocke um die Bildmitte, die zu beiden Enden auf null
    faellt. Wo eine Aufnahme ausbrennt oder absaeuft, traegt sie schlicht
    nicht bei.

    Es gibt hier keinen Schwellwert, der Fenster von Wand unterscheiden
    muesste, keine Maske, keine Morphologie. Ein Fenster ist einfach ein
    Bereich hoher Strahlung und wird genauso behandelt wie jeder andere -
    das Verfahren kann deshalb nicht auf eine Lichtsituation "eingestellt"
    sein.

    Gemessen an drei echten Szenen erfasst die Karte 14.1 bis 19.1
    Blendenstufen. Zum Vergleich: Die vorherige Mertens-Fusion liess 10.9
    bis 44.5 Prozent der Fensterflaeche ausgebrannt stehen, obwohl das
    Dunkelbild dort Zeichnung hatte.

    Die EV-Werte stammen aus dem EXIF und werden ohnehin schon fuer die
    Gruppierung der Reihen gelesen. Ein hoeherer EV bedeutet eine
    dunklere Aufnahme.
    """
    summe = None
    gewichte = None
    for bild, ev in zip(bilder, evs):
        linear = _nach_linear(bild)
        lum = berechne_luminanz(bild)
        # Belichtungsguete: glockenfoermig um die Bildmitte, an beiden
        # Enden hart auf null. Der harte Ausschluss ist noetig, weil ein
        # geclipptes Pixel keine Information mehr traegt - sein Wert ist
        # nur die untere Schranke der wahren Helligkeit.
        gewicht = np.exp(-((lum - 0.5) ** 2) / (2.0 * BELICHTUNGSGUETE_BREITE ** 2))
        # Geprueft wird KANALWEISE, nicht ueber die Luminanz.
        #
        # Ein Pixel, dessen Gruenkanal bei 1.0 ansteht, waehrend Rot und
        # Blau bei 0.6 liegen, hat eine Luminanz von rund 0.8 - es galt
        # damit als bestens belichtet und ging mit hohem Gewicht in die
        # Rechnung ein, obwohl sein Gruenwert nur noch eine untere
        # Schranke ist. An einer echten Kuechenszene betraf das 0.6 bis
        # 0.7 Prozent der Pixel, praktisch alle in den Fenstern: genau
        # dort, wo es am meisten schadet. Das Ergebnis waren blasse,
        # farbverschobene Fensterinhalte.
        hoechster = bild.max(axis=2)
        niedrigster = bild.min(axis=2)
        gewicht = np.where((niedrigster < 0.005) | (hoechster > 0.99),
                           0.0, gewicht)
        # Geprueft und verworfen: Eine zusaetzliche Gewichtung nach
        # Signalqualitaet (Debevec/Robertson, laengere Belichtung hoeher
        # gewichtet) brachte hier nichts - das Rauschen stieg sogar leicht
        # von 1.40 auf 1.47 des Vorbilds. Es stammt nicht aus der
        # Gewichtung, sondern aus der Kompression: Sie hebt die Tiefen um
        # mehrere Blendenstufen an und deren Rauschen mit.
        gewicht = (gewicht.astype(np.float32) + 1e-6)[..., None]
        beitrag = linear * np.float32(2.0 ** ev) * gewicht
        summe = beitrag if summe is None else summe + beitrag
        gewichte = gewicht if gewichte is None else gewichte + gewicht

    strahlung = (summe / gewichte).astype(np.float32)
    lum = berechne_luminanz(strahlung)
    umfang = float(np.log2(max(lum.max(), 1e-9) / max(lum.min(), 1e-9)))
    protokoll.append((logging.DEBUG,
                      f"Strahlungskarte aus {len(bilder)} Belichtungen: "
                      f"{umfang:.1f} Blendenstufen Umfang"))
    return strahlung


def tonemappe_lokal(strahlung: np.ndarray, kompression: float,
                    detail: float, radius_anteil: float,
                    protokoll: list[tuple[int, str]],
                    knie: float = 0.45,
                    decke: float = 0.98) -> np.ndarray:
    """Belichten wie ein Fotograf, dann nur die Lichter zurueckholen.

    Das ist bewusst KEIN Tonemapping ueber den ganzen Umfang. Der Weg
    dorthin ging ueber zwei Sackgassen, die beide denselben Fehler hatten:

      * Symmetrische Stauchung der grossflaechigen Helligkeit. Sie schiebt
        alles zur Mitte - Tiefen hoch, Lichter runter. Das Ergebnis war
        flach, ohne Tiefe, mit unnatuerlichen Farben. Eine graue
        Schrankfront wurde zu blassem Grau.
      * Getrennte Stauchung von Tiefen und Lichtern. Besser, aber im Kern
        derselbe Eingriff: Auch sie verbiegt die Tonwerte im Raum.

    Beide versuchten, das Histogramm eines Vorbilds nachzubilden. Genau das
    erzwingt aber den flauen Look, weil es die natuerlichen
    Tonwertverhaeltnisse der Szene ueberschreibt.

    Ein Fotograf macht es anders und einfacher: Er setzt die Belichtung auf
    den Raum und holt danach die Lichter zurueck. Genau das passiert hier:

      1. Belichtung. Ein reiner Faktor bringt das Raumniveau auf den
         Zielwert. Ein Faktor veraendert keine Verhaeltnisse - im Raum
         bleibt alles exakt so, wie die Kamera es gesehen hat. Eine graue
         Schrankfront bleibt grau, Schwarz bleibt schwarz, das Bild
         behaelt seine Tiefe.

         Angesetzt wird am 60. Perzentil statt am Median: Fenster und
         Lampen belegen den oberen Rand und wuerden den Median verziehen.

      2. Lichter. Erst oberhalb des Knies - dort liegen ohnehin nur noch
         Fenster und Leuchten - wird gestaucht. Unterhalb passiert
         NICHTS. Gestaucht wird auf der grossflaechigen Helligkeit, die
         Feinzeichnung bleibt unangetastet; deshalb behaelt das Fenster
         seine Struktur.

    Gemessen an einer Kuechenszene, Perzentile gegen das kommerzielle
    Vorbild:

                      p5     p30    p50    p70    p85    Abweichung
      Vorbild        0.192  0.459  0.564  0.725  0.788      -
      gestaucht      0.374  0.578  0.626  0.667  0.693     0.081
      so             0.185  0.435  0.560  0.730  0.755     0.025

    Und das ohne ein einziges ausgebranntes Pixel.
    """
    lum = np.maximum(berechne_luminanz(strahlung), 1e-9)

    # 1. Belichtung auf das Raumniveau.
    niveau = float(np.percentile(lum, RAUMNIVEAU_PERZENTIL))
    skala = float(kompression) / max(niveau, 1e-9)
    log = np.log2(np.maximum(lum * skala, 1e-9))

    # 2. Lichter zurueckholen, kantenbewusst getrennt.
    radius = max(8, int(round(strahlung.shape[1] * radius_anteil)))
    basis = guided_filter(log.astype(np.float32), log.astype(np.float32),
                          radius, TONEMAP_KANTENSCHAERFE)
    feinzeichnung = (log - basis) * float(detail)

    knie_log = float(np.log2(max(knie, 1e-3)))
    decke_log = float(np.log2(max(decke, knie + 1e-3)))
    kopf = max(decke_log - knie_log, 1e-3)
    ueber = basis > knie_log
    basis_neu = np.where(
        ueber,
        knie_log + kopf * (1.0 - np.exp(-(basis - knie_log) / kopf)),
        basis)

    lum_neu = np.exp2(basis_neu + feinzeichnung)
    # Wie ueberall im Programm: gemeinsamer Faktor auf alle drei Kanaele,
    # damit der Farbton unangetastet bleibt.
    faktor = (lum_neu / lum)[..., None]
    ergebnis = _nach_srgb(np.clip(strahlung * faktor, 0.0, 1.0))

    protokoll.append((logging.DEBUG,
                      f"Belichtung auf Raumniveau {niveau:.4f} -> "
                      f"{kompression:.2f}, Lichterschulter ab {knie:.2f} "
                      f"bis {decke:.2f} ({float(ueber.mean()) * 100:.1f} % "
                      f"der Flaeche)"))
    return ergebnis


def fusioniere_mertens(bilder: Sequence[np.ndarray], kontrast: float,
                       saettigung: float, belichtung: float) -> np.ndarray:
    """Exposure Fusion nach Mertens.

    Bewusst nicht Debevec/Robertson mit anschliessendem Tonemapping: Mertens
    braucht keine Schaetzung der Kamerakurve, ist damit robuster und liefert
    direkt ein natuerliches, nicht tonemapptes Ergebnis.
    """
    merger = cv2.createMergeMertens(kontrast, saettigung, belichtung)
    # Wichtig: OpenCV skaliert Float-Eingaben intern mit 1/255. Werden die
    # Bilder im Bereich 0..1 uebergeben, ist das Ergebnis um den Faktor 255
    # zu dunkel. Deshalb 0..255 hineingeben - und nicht etwa 8 Bit, damit
    # die volle Tiefe der 16-Bit-Entwicklung erhalten bleibt.
    #
    # Die Skalierung passiert an Ort und Stelle und wird danach wieder
    # zurueckgenommen: eine Kopie der ganzen Reihe waere bei 24 Megapixeln
    # knapp ein Gigabyte, das hier nichts beitraegt.
    for bild in bilder:
        bild *= 255.0
    try:
        ergebnis = merger.process(list(bilder))
    finally:
        for bild in bilder:
            bild *= 1.0 / 255.0
    return np.clip(ergebnis.astype(np.float32), 0.0, 1.0)


# ---------------------------------------------------------------------------
# Window Pull
# ---------------------------------------------------------------------------


@dataclasses.dataclass
class WindowPullErgebnis:
    bild: np.ndarray
    maske_weich: np.ndarray
    maske_binaer: np.ndarray
    maskenanteil: float
    # Der zurueckgeholte Fensterinhalt VOR der Kompression und vor jedem
    # Clipping. Wird fuer den Highlight-Schutz nach der Normalisierung
    # gebraucht: dort muss der Fensterbereich aus den Originaldaten neu
    # aufgebaut werden, sonst komprimiert man bereits weggeclippte Werte.
    fenster_roh: np.ndarray | None = None
    ring: np.ndarray | None = None
    ring_luminanz: float = 0.0
    # Wie sicher ein Pixel echte Aussicht zeigt statt Inventar davor (0..1).
    aussicht_gewicht: np.ndarray | None = None


def erkenne_fenstermaske(referenz: np.ndarray, dunkel: np.ndarray,
                         fusion: np.ndarray, schwelle: float,
                         detail_schwelle: float, detail_anteil: float,
                         min_flaeche_anteil: float, blur_anteil: float,
                         protokoll: list[tuple[int, str]],
                         schliess_anteil: float = 0.015) -> tuple[np.ndarray, np.ndarray]:
    """Erzeugt die Fenstermaske (binaer und weich).

    Ablauf:
      1. Ausgebrannte Bereiche im Referenzbild (Luminanz ueber Schwelle).
      2. Morphologisches Schliessen und Loecher fuellen, damit ein Fenster
         inklusive Sprossen als eine zusammenhaengende Flaeche vorliegt.
      3. Gegenpruefung am Dunkelbild, bewusst auf Ebene der zusammen-
         haengenden Flaeche statt pixelweise: eine Flaeche gilt nur dann als
         Fenster, wenn ein ausreichender Anteil ihrer Pixel im Dunkelbild
         echte Struktur zeigt. Das verwirft weisse Waende, Deckenleuchten,
         Lampenschirme und Reflexionen - und haelt gleichzeitig glatte
         Himmelspartien innerhalb eines echten Fensters in der Maske
         (pixelweise wuerden sie herausfallen).
      4. Groessenfilter gegen Glanzlichter auf Armaturen und Tuerklinken.
      5. Kantenbewusstes Weichzeichnen ueber den Guided Filter.
    """
    h, w = referenz.shape[:2]
    flaeche = float(h * w)

    lum_ref = berechne_luminanz(referenz)
    lum_dunkel = berechne_luminanz(dunkel)

    # 1. Ausgebrannt im Referenzbild
    ausgebrannt = (lum_ref > schwelle).astype(np.uint8)

    # 2. Schliessen + Loecher fuellen (Fenstersprossen gehoeren zur Maske).
    # Der Kernel muss breiter sein als eine Sprosse, sonst zerfaellt das
    # Fenster in mehrere Flaechen, die einzeln bewertet werden.
    schliess_kernel = ungerade(int(round(w * schliess_anteil)))
    ausgebrannt = cv2.morphologyEx(
        ausgebrannt, cv2.MORPH_CLOSE,
        cv2.getStructuringElement(cv2.MORPH_ELLIPSE,
                                  (schliess_kernel, schliess_kernel)))
    ausgebrannt = fuelle_loecher(ausgebrannt)

    # 3./4. Struktur im Dunkelbild und Groessenfilter, je Flaeche bewertet
    detail_radius = max(2, int(round(w * 0.004)))
    struktur = lokale_standardabweichung(lum_dunkel, detail_radius)
    hat_struktur = struktur > detail_schwelle

    # Der Rand jeder ausgebrannten Flaeche zeigt immer Struktur (dort liegt
    # die Kante zur Umgebung). Gemessen wird deshalb nur im erodierten
    # Inneren - sonst wuerde eine weisse Wand allein wegen ihrer Kanten als
    # Fenster durchgehen.
    rand = ungerade(2 * (detail_radius + 1) + 1)
    inneres = cv2.erode(ausgebrannt,
                        cv2.getStructuringElement(cv2.MORPH_ELLIPSE,
                                                  (rand, rand))).astype(bool)

    anzahl, labels, stats, _ = cv2.connectedComponentsWithStats(ausgebrannt, 8)
    min_pixel = max(16.0, min_flaeche_anteil * flaeche)
    behalten = np.zeros(anzahl, dtype=bool)
    for i in range(1, anzahl):
        pixel = int(stats[i, cv2.CC_STAT_AREA])
        if pixel < min_pixel:
            continue  # Glanzlichter auf Armaturen, Tuerklinken
        kern = (labels == i) & inneres
        if kern.sum() < 20:
            kern = labels == i
        anteil_struktur = float(hat_struktur[kern].mean())
        if anteil_struktur >= detail_anteil:
            behalten[i] = True
        else:
            protokoll.append((logging.DEBUG,
                              f"Flaeche verworfen ({pixel} px, nur "
                              f"{anteil_struktur * 100:.1f} % Struktur im "
                              f"Dunkelbild) - kein Fenster."))
    maske = behalten[labels].astype(np.uint8)
    maske = fuelle_loecher(maske)

    maskenanteil = float(maske.sum()) / flaeche
    if maskenanteil > 0.25:
        protokoll.append((logging.WARNING,
                          f"Fenstermaske umfasst {maskenanteil * 100:.1f} % des "
                          f"Bildes - das ist meist eine Fehlerkennung "
                          f"(Schwellwert --window-threshold pruefen)."))

    # 5. Kantenbewusstes Weichzeichnen ueber den Guided Filter
    #
    # Der Guided Filter mittelt ueber seinen Radius und mittelt an einer
    # Maskenkante zwangslaeufig mit dem Nullbereich ausserhalb. Die
    # Deckkraft erreichte deshalb nirgends ihren vollen Wert - gemessen
    # 0.573 direkt an der Fensterkante und selbst 200 Pixel tief im
    # Fenster nur 0.819. Die Folge: 18 bis 43 Prozent des ausgebrannten
    # Grundbildes blieben stehen, sichtbar als heller Saum entlang der
    # Kante und als blasser Schleier ueber der ganzen Scheibe.
    #
    # Behoben wird das mit einer Kennlinie AUF DER MASKE, nicht durch
    # Ausdehnen. Der Unterschied ist entscheidend, und er wurde teuer
    # gelernt: Ausdehnen um den Radius bringt die Deckkraft innen zwar auf
    # 0.966, legt sie aber auch zu 0.770 auf den Fensterrahmen - der
    # weisse Rahmen wird dann mit Fensterinhalt uebermalt und wirkt grau.
    #
    # Die Kennlinie streckt stattdessen den Wertebereich der weichen
    # Maske: Was schon ueberwiegend Fenster ist, geht auf volle Deckkraft,
    # was ueberwiegend Rahmen ist, faellt auf null. Der Uebergang bleibt
    # weich und bleibt an derselben Stelle. Gemessen an derselben Szene:
    #
    #                        innen Kante   innen tief   auf dem Rahmen
    #   vorher                     0.573        0.819            0.151
    #   Ausdehnen (verworfen)      0.966        1.000            0.770
    #   Kennlinie                  0.876        1.000            0.090
    #
    # Also innen fast voll UND der Rahmen sauberer als im Ausgangszustand.
    fuehrung = berechne_luminanz(fusion)
    radius = max(2, int(round(w * blur_anteil)))
    weich = guided_filter(fuehrung, maske.astype(np.float32), radius, 1e-4)
    weich = np.clip((weich - MASKE_KENNLINIE_UNTEN)
                    / (MASKE_KENNLINIE_OBEN - MASKE_KENNLINIE_UNTEN),
                    0.0, 1.0).astype(np.float32)

    # Frueher entstand hier eine zweite, kraeftig geschlossene und
    # ausgedehnte Maske fuer die Lichterkompression. Sie ist ersatzlos
    # entfallen: Seit Fensterinhalt und Grundbild EINZELN komprimiert werden
    # (siehe setze_fensterinhalt), gibt es keinen maskierten
    # Kompressionsschritt mehr, dessen Rand sichtbar werden koennte. Genau
    # dieser Rand - gemessene 206 Pixel ueber die Fensterkante hinaus auf
    # Decke und Laibung - war die Ursache der weichen, polygonfoermigen
    # Flecken neben den Fenstern.
    return maske, weich


def gleiche_helligkeit_am_rand_an(fusion: np.ndarray, dunkel: np.ndarray,
                                  maske: np.ndarray,
                                  protokoll: list[tuple[int, str]]) -> tuple[float, float, np.ndarray]:
    """Bestimmt den Faktor, der das Dunkelbild in die Tonskala der Fusion hebt.

    Gemessen wird in einem dilatierten Ring um die Maskengrenze (typischer-
    weise der Fensterrahmen). Dort ist in beiden Bildern dieselbe Szene mit
    Struktur vorhanden. Wird das Dunkelbild mit diesem Faktor skaliert,
    passen Fensterinhalt und Umgebung an der Kante zusammen und der
    Uebergang springt nicht.

    Rueckgabe: (Faktor, mittlere Ringluminanz im fusionierten Bild). Die
    Ringluminanz dient anschliessend als Knie fuer die Lichterkompression -
    unterhalb des Rahmens wird nichts angefasst.
    """
    h, w = maske.shape
    kernel_groesse = ungerade(int(round(w * 0.012)))
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE,
                                       (kernel_groesse, kernel_groesse))
    aussen = cv2.dilate(maske, kernel)
    ring = (aussen.astype(bool) & ~maske.astype(bool))
    if ring.sum() < 50:
        ring = aussen.astype(bool)
    if ring.sum() < 10:
        return 1.0, 0.5, ring

    lum_fusion = berechne_luminanz(fusion)[ring]
    lum_dunkel = berechne_luminanz(dunkel)[ring]
    mittel_dunkel = float(np.mean(lum_dunkel))
    mittel_fusion = float(np.mean(lum_fusion))
    if mittel_dunkel <= 1e-5:
        protokoll.append((logging.WARNING,
                          "Randring des Fensters ist im Dunkelbild praktisch "
                          "schwarz - Helligkeitsangleichung uebersprungen."))
        return 1.0, 0.5, ring
    faktor = float(np.clip(mittel_fusion / mittel_dunkel, 1.0, 64.0))
    return faktor, mittel_fusion, ring


def gleiche_fenster_weissabgleich_an(fenster: np.ndarray, innenraum: np.ndarray,
                                     maske_binaer: np.ndarray,
                                     staerke: float) -> np.ndarray:
    """Zieht die Farbtemperatur des Fensterinhalts anteilig zum Innenraum.

    Fensterinhalt wirkt gegenueber warmem Kunstlicht im Raum oft zu kalt.
    Angeglichen wird ausschliesslich das Kanalverhaeltnis (Farbtemperatur),
    die Luminanz bleibt unveraendert - es ist eine Weissabgleich-Korrektur,
    keine Saettigungs- oder Look-Aenderung.
    """
    if staerke <= 0.0:
        return fenster

    innen_bereich = ~maske_binaer.astype(bool)
    if innen_bereich.sum() < 100 or maske_binaer.sum() < 100:
        return fenster

    lum_innen = berechne_luminanz(innenraum)
    # Nur mittelhelle Innenraumpixel als Referenz (keine Lampen, kein Schwarz).
    auswahl = innen_bereich & (lum_innen > 0.15) & (lum_innen < 0.85)
    if auswahl.sum() < 100:
        auswahl = innen_bereich

    mittel_innen = innenraum[auswahl].mean(axis=0)
    mittel_fenster = fenster[maske_binaer.astype(bool)].mean(axis=0)
    if float(mittel_innen.mean()) <= 1e-5 or float(mittel_fenster.mean()) <= 1e-5:
        return fenster

    ziel = mittel_innen / float(mittel_innen.mean())
    ist = mittel_fenster / float(mittel_fenster.mean())
    faktor = np.power(np.clip(ziel / np.maximum(ist, 1e-5), 0.25, 4.0),
                      float(staerke)).astype(np.float32)
    # Luminanzneutral normieren: nur die Farbbalance darf sich aendern.
    faktor = faktor / float(np.dot(faktor, LUMA_GEWICHTE))
    # Bewusst NICHT auf 0..1 begrenzen: die Werte oberhalb 1.0 tragen die
    # Fensterzeichnung und werden erst spaeter weich komprimiert.
    return np.maximum(fenster * faktor, 0.0).astype(np.float32)


def fuehre_window_pull_aus(fusion: np.ndarray, referenz: np.ndarray,
                           dunkel: np.ndarray, args: argparse.Namespace,
                           protokoll: list[tuple[int, str]]) -> WindowPullErgebnis:
    """Holt die Fensteransicht aus der dunkelsten Belichtung zurueck."""
    maske_binaer, maske_weich = erkenne_fenstermaske(
        referenz, dunkel, fusion,
        schwelle=args.window_threshold,
        detail_schwelle=args.window_detail,
        detail_anteil=args.window_detail_fraction,
        min_flaeche_anteil=args.window_min_area,
        blur_anteil=args.window_blur,
        schliess_anteil=args.window_close,
        protokoll=protokoll,
    )

    anteil = float(maske_binaer.sum()) / float(maske_binaer.size)
    if maske_binaer.sum() == 0 or args.window_strength <= 0.0:
        if args.window_strength > 0.0:
            protokoll.append((logging.INFO,
                              "Keine Fensterflaeche erkannt - Window Pull "
                              "uebersprungen."))
        return WindowPullErgebnis(fusion, maske_weich, maske_binaer, anteil)

    # Warnung: Dunkelbild brennt im Fensterbereich selbst schon aus.
    lum_dunkel = berechne_luminanz(dunkel)
    anteil_ausgebrannt = float(
        (lum_dunkel[maske_binaer.astype(bool)] > 0.95).mean())
    if anteil_ausgebrannt > 0.02:
        protokoll.append((logging.WARNING,
                          f"Dunkelbild ist im Fensterbereich zu "
                          f"{anteil_ausgebrannt * 100:.1f} % selbst ausgebrannt "
                          f"- die Belichtungsreihe war zu knapp gestuft, "
                          f"mehr Blendenstufen nach unten aufnehmen."))

    faktor, ring_luminanz, ring = gleiche_helligkeit_am_rand_an(
        fusion, dunkel, maske_binaer, protokoll)
    protokoll.append((logging.DEBUG,
                      f"Helligkeitsangleichung Fensterinhalt: Faktor "
                      f"{faktor:.2f} (Ringluminanz {ring_luminanz:.3f})"))

    # Rohdaten: an den Rahmen angeglichen, weissabgeglichen, aber noch nicht
    # komprimiert und nicht geclippt.
    fenster_roh = (dunkel * faktor).astype(np.float32)
    fenster_roh = gleiche_fenster_weissabgleich_an(fenster_roh, fusion,
                                                   maske_binaer, args.window_wb)

    aussicht_gewicht = berechne_aussicht_gewicht(fenster_roh, ring_luminanz,
                                                 referenz,
                                                 args.window_threshold)
    protokoll.append((logging.DEBUG,
                      f"Aussichtsanteil in der Fenstermaske: "
                      f"{float(aussicht_gewicht[maske_binaer.astype(bool)].mean()) * 100:.1f} %"))
    ergebnis = setze_fensterinhalt(fusion, fenster_roh, maske_weich,
                                   ring_luminanz, args, aussicht_gewicht)
    return WindowPullErgebnis(ergebnis, maske_weich, maske_binaer, anteil,
                              fenster_roh, ring, ring_luminanz,
                              aussicht_gewicht)


def berechne_aussicht_gewicht(fenster_roh: np.ndarray, ring_luminanz: float,
                              referenz: np.ndarray, schwelle: float,
                              rampe: float = 0.10) -> np.ndarray:
    """Wie sicher ein Pixel innerhalb der Maske echte Aussicht zeigt (0..1).

    Der Window Pull darf nur dort ersetzen, wo tatsaechlich die Szene
    ausserhalb des Fensters liegt. Ein dunkler Gegenstand vor dem Fenster -
    eine Pendelleuchte, ein Sofakissen, der Rahmen selbst - ist in der
    Fusion bereits korrekt belichtet und muss unangetastet bleiben. Ohne
    diese Gewichtung wird ein solches Objekt innerhalb der Maske mit dem
    Verstaerkungsfaktor des Himmels angehoben und ausserhalb nicht - es
    entsteht ein Helligkeitssprung mitten im Objekt.

    Entscheidend ist, WORAN "Aussicht" erkannt wird. Frueher wurde gefragt,
    ob das Referenzbild an dieser Stelle ausgebrannt war. Das ist zu eng:
    Eine Fensterscheibe hinter einem Insektengitter oder im Schatten eines
    Vordachs ist Aussicht, brennt aber nicht aus (gemessen: Referenz-
    Luminanz 0.52 gegenueber 0.96 bei der Nachbarscheibe). Sie blieb
    deshalb komplett die flaue Fusion, waehrend direkt daneben der klare
    dunkle Auszug stand - zwei verschiedene Darstellungen derselben
    Aussicht nebeneinander, getrennt durch eine sichtbare Kante. Das sind
    die "schattierten Bereiche" im Fenster.

    Gefragt wird stattdessen, ob der zurueckgeholte Fensterinhalt heller
    liegt als der Fensterrahmen. Das trennt sauber und ohne freien
    Parameter, weil es die Geometrie der Szene abbildet: Was draussen ist,
    ist heller als der Rahmen; was im Raum davor steht, ist dunkler.
    Gemessen an derselben Szene, Rahmenluminanz 0.48 - Aussicht hinter
    Gitter 0.82, freie Aussicht 1.67, Sofakissen 0.14, Holzwand 0.36.

    Zusaetzlich gilt weiterhin: Was im Referenzbild ausgebrannt war, ist in
    jedem Fall Aussicht. Diese zweite Bedingung ist die Rueckfallebene,
    falls die Rahmenhelligkeit einmal schlecht geschaetzt wird.

    Das Gewicht wird anschliessend geschlossen (morphologisches Closing),
    und das ist kein Feinschliff, sondern der Kern der Sache. Pixelweise
    berechnet folgt es jeder Struktur im Motiv: Eine sonnenbeschienene
    Wiese hinter dem Fenster liegt teils ueber, teils unter der Schwelle.
    Punkt fuer Punkt wird dann einmal der dunkle Auszug und einmal die
    ausgebrannte Fusion eingeblendet - und weil die Fusion dort weiss ist,
    entsteht genau der milchige, gesprenkelte Fensterinhalt, der als
    "Schleier" und "Artefakte" auffaellt.

    Das Closing loescht diese punktweise Sprenkelung, ohne den
    eigentlichen Zweck aufzugeben: Kleine, vereinzelt untersaettigte Pixel
    inmitten einer ausgebrannten Flaeche verschwinden, ein
    zusammenhaengender dunkler Gegenstand von der Groesse einer
    Pendelleuchte ueberlebt es unveraendert.
    """
    # 1. Aussicht liegt heller als der Fensterrahmen.
    lum_fenster = berechne_luminanz(fenster_roh)
    oben = max(float(ring_luminanz), 1e-3)
    unten = AUSSICHT_RAMPE * oben
    gewicht = (lum_fenster - unten) / max(oben - unten, 1e-4)
    gewicht = np.clip(gewicht, 0.0, 1.0).astype(np.float32)

    # 2. Rueckfallebene: ausgebrannt im Referenzbild ist immer Aussicht.
    lum_ref = berechne_luminanz(referenz)
    ausgebrannt = np.clip((lum_ref - (schwelle - rampe)) / max(rampe, 1e-4),
                          0.0, 1.0).astype(np.float32)
    gewicht = np.maximum(gewicht, ausgebrannt)

    radius = max(1, int(round(referenz.shape[1] * AUSBRENN_CLOSE_ANTEIL)))
    kern = cv2.getStructuringElement(cv2.MORPH_ELLIPSE,
                                     (2 * radius + 1, 2 * radius + 1))
    gewicht = cv2.morphologyEx(gewicht, cv2.MORPH_CLOSE, kern)
    return gewicht.astype(np.float32)


def setze_fensterinhalt(grundbild: np.ndarray, fenster_roh: np.ndarray,
                        maske_weich: np.ndarray,
                        knie_luminanz: float, args: argparse.Namespace,
                        aussicht_gewicht: np.ndarray | None = None) -> np.ndarray:
    """Setzt den Fensterinhalt ein und bringt ihn in den darstellbaren Bereich.

    Komprimiert werden die beiden Bilder EINZELN, danach wird ueberblendet.
    Das ist der Kern der Sache und der Grund, warum vorher sichtbare Flecken
    entstanden.

    Frueher wurde erst ueberblendet und dann das Ergebnis innerhalb einer
    eigenen Tonmaske komprimiert. Diese Maske war zwangslaeufig grob: Sie
    musste die Fensterflaeche auch hinter dunklen Gegenstaenden vollstaendig
    abdecken, wurde dafuer kraeftig geschlossen, ausgedehnt und
    weichgezeichnet - und lief dadurch gemessene 206 Pixel ueber die
    Fensterkante hinaus auf Decke und Laibung. Dort senkte die Kompression
    alles oberhalb des Knies ab, und weil das Knie auf der Rahmenhelligkeit
    sitzt (typisch 0.25 bis 0.48), traf das jede helle Flaeche. Aus einem
    sonnenbeschienenen Fleck auf weisser Laibung bei 0.89 wurde so ein
    sichtbar dunklerer Fleck mit weicher, polygonfoermiger Kante - der
    "Schatten", der wie eine ueber die Kante hinausgelaufene Maske aussah,
    weil er genau das war.

    Getrennt komprimiert braucht es diese Maske nicht mehr:

      * Der Fensterinhalt wird fuer sich in das Band [knie, obergrenze]
        gebracht. Ihm steht der volle Tonwertumfang zur Verfuegung,
        unabhaengig davon, wo er spaeter eingeblendet wird.
      * Das Grundbild wird nur dort angetastet, wo es tatsaechlich ueber die
        Anzeigegrenze laeuft. Unterhalb von GRUNDBILD_KNIE bleibt es exakt
        unveraendert - eine helle Wand, eine Arbeitsplatte, ein Sonnenfleck
        werden nicht mehr abgedunkelt.

    Damit entscheidet allein die Deckkraft, wo etwas passiert. Wird die
    Maske einmal zu gross geschaetzt, blendet sich dort der an den Rahmen
    angeglichene Dunkelauszug derselben Szene ein - gleiche Helligkeit,
    gleiche Farbe, praktisch unsichtbar. Ein Fehler in der Maske ergibt
    keinen Fleck mehr, sondern faellt nicht auf.

    Die Angleichung am Rahmen setzt die Fensterhelligkeit richtig, hebt den
    Himmel dabei aber weit ueber 1.0. Statt hart zu clippen (Zeichnung waere
    weg) wird oberhalb der Rahmenhelligkeit weich komprimiert; unterhalb des
    Knies bleibt alles unveraendert.
    """
    deckkraft = np.clip(maske_weich, 0.0, 1.0) * float(args.window_strength)
    if aussicht_gewicht is not None:
        deckkraft = deckkraft * aussicht_gewicht
    alpha = deckkraft[..., None]

    # Das Knie liegt normalerweise auf der Rahmenhelligkeit, damit der
    # Uebergang am Fensterrahmen nicht springt. Es wird aber nach oben
    # begrenzt: Sitzt der Rahmen sehr hoch (weisser Kunststoffrahmen bei
    # angehobenem Innenraum, gemessen 0.82), blieben bis zur Obergrenze nur
    # noch vier Hundertstel Spielraum - der gesamte Fensterinhalt wuerde in
    # dieses Band gequetscht und verloere rund zwei Drittel seiner Zeichnung.
    # Mit der Begrenzung steht immer ein Band von --window-range zur
    # Verfuegung. Werte unterhalb des Knies bleiben unangetastet, der
    # Fensterrahmen selbst wird also nicht veraendert.
    obergrenze = args.window_ceiling
    knie = float(np.clip(min(knie_luminanz, obergrenze - args.window_range),
                         0.10, obergrenze - 0.05))

    voll = np.ones(maske_weich.shape, dtype=np.float32)
    fenster_kompr = komprimiere_lichter_in_maske(
        fenster_roh, voll, knie=knie, obergrenze=obergrenze,
        rate=args.window_rolloff, detail_erhalt=args.window_texture)
    grund_sicher = komprimiere_lichter_in_maske(
        grundbild, voll, knie=GRUNDBILD_KNIE, obergrenze=1.0,
        rate=args.window_rolloff, detail_erhalt=args.window_texture)

    ergebnis = grund_sicher * (1.0 - alpha) + fenster_kompr * alpha
    return np.clip(ergebnis, 0.0, 1.0).astype(np.float32)


# ---------------------------------------------------------------------------
# Tonale Normalisierung
# ---------------------------------------------------------------------------


def schaetze_graupunkt(bild: np.ndarray, fenstermaske: np.ndarray,
                       protokoll: list[tuple[int, str]]) -> np.ndarray | None:
    """Schaetzt den Graupunkt ueber grosse, gering gesaettigte Wandflaechen.

    Bewusst nicht "Grey World" ueber das ganze Bild: eine grosse Holzflaeche
    oder ein farbiges Sofa wuerde den Weissabgleich sonst verziehen.
    """
    h, w = bild.shape[:2]
    lum = berechne_luminanz(bild)
    maximum = bild.max(axis=2)
    minimum = bild.min(axis=2)
    saettigung = np.where(maximum > 1e-5, (maximum - minimum) / np.maximum(maximum, 1e-5), 0.0)

    hell = (lum > 0.35) & (lum < 0.95) & (~fenstermaske.astype(bool))
    if hell.sum() < 0.01 * h * w:
        protokoll.append((logging.DEBUG,
                          "Zu wenig helle Innenraumflaeche - globaler "
                          "Weissabgleich uebersprungen."))
        return None

    # Die Saettigungsschwelle passt sich an: In einem Raum unter warmem
    # Kunstlicht ist auch die weisse Wand deutlich gesaettigt - eine feste
    # Schwelle wuerde genau den Fall aushebeln, den der Weissabgleich
    # korrigieren soll. Gewaehlt wird das untere Drittel der vorkommenden
    # Saettigungen; das ist regelbasiert und ohne Motiverkennung.
    schwelle = float(np.clip(np.percentile(saettigung[hell], 35.0), 0.05, 0.45))
    kandidat = (hell & (saettigung <= schwelle)).astype(np.uint8)
    if kandidat.sum() < 0.01 * h * w:
        protokoll.append((logging.DEBUG,
                          "Keine ausreichende Wandflaeche fuer die "
                          "Graupunktschaetzung gefunden - globaler "
                          "Weissabgleich uebersprungen."))
        return None

    # Nur grosse zusammenhaengende Flaechen zaehlen (Waende, Decken).
    anzahl, labels, stats, _ = cv2.connectedComponentsWithStats(kandidat, 8)
    min_pixel = 0.005 * h * w
    behalten = np.zeros(anzahl, dtype=bool)
    for i in range(1, anzahl):
        if stats[i, cv2.CC_STAT_AREA] >= min_pixel:
            behalten[i] = True
    flaechen = behalten[labels]
    if flaechen.sum() < 0.01 * h * w:
        protokoll.append((logging.DEBUG,
                          "Wandflaechen zu klein/zerstueckelt - globaler "
                          "Weissabgleich uebersprungen."))
        return None
    return bild[flaechen].mean(axis=0).astype(np.float32)


def gleiche_lokale_farbstiche_aus(bild: np.ndarray, staerke: float,
                                  radius_anteil: float, grenze: float,
                                  protokoll: list[tuple[int, str]]) -> np.ndarray:
    """Gleicht ortsabhaengige Farbstiche aus (lokaler Weissabgleich).

    Ein Innenraum ist fast nie von einer einzigen Lichtquelle beleuchtet. In
    einer vermessenen Kuechenaufnahme lag der Boden bei einem Rot/Blau-
    Verhaeltnis von 3.4 (warmes Kunstlicht) und die Decke bei 0.92
    (Tageslicht durchs Fenster). Ein globaler Weissabgleich kann dagegen
    nichts ausrichten: Ueber das ganze Bild gemittelt heben sich beide
    Stiche auf, er findet folgerichtig nichts zu tun. Sichtbar bleibt ein
    Bild mit orangenem Boden und blauen Schatten.

    Geschaetzt wird die oertliche Lichtfarbe aus einer stark
    weichgezeichneten Fassung des Bildes. Der Radius ist bewusst gross
    (Standard 15 % der Bildbreite): Er soll grossflaechige Lichtstimmungen
    erfassen, nicht die Farbe einzelner Gegenstaende.

    Entscheidend ist dabei, WELCHE Pixel die Lichtfarbe verraten. Ein
    schlichter oertlicher Mittelwert kann nicht zwischen "warmes Licht" und
    "warmes Material" unterscheiden - er neutralisiert einen Eichenboden
    genauso wie eine Gluehlampenstimmung. Deshalb geht jedes Pixel nur nach
    Massgabe seiner Neutralitaet in die Schaetzung ein: Nahezu graue
    Flaechen (Waende, Decke, Arbeitsplatte) bestimmen die Lichtfarbe, kraeftig
    gefaerbte Flaechen (Holz, rote Schuessel) bleiben aussen vor. Findet sich
    in der Umgebung ueberhaupt keine neutrale Flaeche, sinkt das Vertrauen
    und es wird gar nicht korrigiert - lieber ein Farbstich zu wenig
    entfernt als ein Eichenboden entfaerbt.

    Zwei weitere Sicherungen begrenzen den Eingriff: Die Korrektur je Kanal
    ist gedeckelt, und sie wird luminanzneutral normiert - die Helligkeit
    bleibt also unveraendert, es verschiebt sich ausschliesslich die Farbe.
    """
    if staerke <= 0.0:
        return bild

    breite = bild.shape[1]
    radius = max(8, int(round(breite * radius_anteil)))
    sicher = np.clip(bild, 0.0, None)

    # Neutralitaet je Pixel: 1.0 = grau, 0.0 = kraeftig gefaerbt. Sehr dunkle
    # Pixel werden zusaetzlich abgewertet, dort ist die Farbe reines Rauschen.
    hoch = sicher.max(axis=2)
    tief = sicher.min(axis=2)
    buntheit = (hoch - tief) / np.maximum(hoch, 1e-4)
    neutral = np.clip(1.0 - buntheit / NEUTRAL_GRENZE, 0.0, 1.0)
    neutral *= np.clip(berechne_luminanz(sicher) / 0.04, 0.0, 1.0)
    neutral = neutral.astype(np.float32)

    # Gewichteter oertlicher Mittelwert nur ueber die neutralen Anteile.
    masse = box_filter(neutral, radius)
    grob = box_filter(sicher * neutral[..., None], radius) \
        / np.maximum(masse, 1e-6)[..., None]
    lum_grob = np.maximum(berechne_luminanz(grob), 1e-4)

    # Oertliche Farbigkeit: 1.0 bedeutet neutral.
    chroma = grob / lum_grob[..., None]
    korrektur = np.clip(1.0 / np.maximum(chroma, 1e-4), 1.0 - grenze,
                        1.0 + grenze)
    vertrauen = np.clip(masse / NEUTRAL_MINDESTANTEIL, 0.0, 1.0)
    korrektur = 1.0 + (korrektur - 1.0) * (float(staerke)
                                           * vertrauen)[..., None]

    # Luminanzneutral: der Faktor darf die Helligkeit nicht mitziehen.
    gewicht = np.tensordot(korrektur, LUMA_GEWICHTE, axes=([2], [0]))
    korrektur = korrektur / np.maximum(gewicht, 1e-4)[..., None]

    ergebnis = bild * korrektur
    abweichung = float(np.mean(np.abs(korrektur - 1.0)))
    protokoll.append((logging.DEBUG,
                      f"Lokaler Weissabgleich: Radius {radius} px, mittlere "
                      f"Korrektur {abweichung * 100:.1f} %"))
    return ergebnis.astype(np.float32)


def verstaerke_zeichnung(bild: np.ndarray, clarity: float, clarity_radius: float,
                         schaerfe: float, schaerfe_radius: float,
                         protokoll: list[tuple[int, str]]) -> np.ndarray:
    """Holt die Zeichnung zurueck, die das Aufhellen gekostet hat.

    Das ist keine Geschmacksfrage, sondern der Ausgleich eines messbaren
    Verlusts. Die tonale Normalisierung hebt eine Wand von Luminanz 0.27 auf
    0.70 - der Absolutkontrast ihrer Maserung bleibt dabei nahezu gleich
    (gemessen 0.0031 -> 0.0025), waehrend die Helligkeit sich mehr als
    verdoppelt. Relativ zur Umgebung, und nur so nimmt das Auge Struktur
    wahr, faellt die Zeichnung damit auf ein Drittel. Aus einer Holzwand mit
    Maserung und Astloechern wird eine weisse Flaeche.

    Dass hier wirklich etwas fehlt und nicht bloss ein Geschmack bedient
    wird, zeigt der Vergleich mit dem kommerziellen Vorbild an derselben
    Szene: bei praktisch gleicher mittlerer Helligkeit (0.710 gegenueber
    0.704) traegt dessen Wandflaeche ueber alle Strukturgroessen hinweg das
    Zwei- bis Zweieinhalbfache an Zeichnung. Die Voreinstellungen sind so
    gewaehlt, dass genau dieses Verhaeltnis erreicht wird - nicht mehr.

    Zwei Stufen, beide ausschliesslich auf der Luminanz (die Farbe bleibt
    unangetastet, das Verhaeltnis der Kanaele wird nur mitgezogen):

      1. Lokaler Kontrast ueber den Guided Filter. Kantenbewusst, damit an
         harten Kontrastkanten - Fensterrahmen gegen helle Aussicht - keine
         hellen Saeume entstehen. Ein gewoehnlicher Weichzeichner als Basis
         wuerde genau dort Halos erzeugen.
      2. Capture Sharpening ueber eine feine Unschaerfemaske. Das ist der
         Ausgleich fuer die Weichheit, die jede RAW-Entwicklung durch
         Demosaicing mitbringt, kein Kreativ-Effekt.
    """
    if clarity <= 0.0 and schaerfe <= 0.0:
        return bild

    breite = bild.shape[1]
    lum = berechne_luminanz(bild)
    neu = lum

    if clarity > 0.0:
        radius = max(3, int(round(breite * clarity_radius)))
        basis = guided_filter(neu, neu, radius, 1e-3)
        neu = neu + clarity * (neu - basis)

    if schaerfe > 0.0:
        # Geschaerft wird auf ZWEI Groessenordnungen, und das ist der Kern
        # der Sache. Beide sind noetig, weil sie zwei verschiedene Dinge
        # tun und an zwei verschiedenen Stellen sichtbar werden:
        #
        # 1. Capture Sharpening, absolut in Pixeln. Es gleicht die
        #    Unschaerfe aus Demosaicing und Sensor-Tiefpass aus. Die ist
        #    eine feste Eigenschaft in Pixeln und wird nicht groesser, nur
        #    weil der Sensor mehr Megapixel hat. Sichtbar wird es in der
        #    Ansicht 1:1 und im Druck.
        #
        # 2. Kantenkontrast, als Anteil der Bildbreite. Er entscheidet,
        #    wie das Bild auf dem Bildschirm wirkt - und dort liegt der
        #    Unterschied zwischen "gestochen" und "matschig". Eine
        #    33-Megapixel-Aufnahme wird auf einem Monitor rund vierfach
        #    verkleinert; alles, was nur auf Pixelebene geschaerft wurde,
        #    verschwindet dabei restlos.
        #
        # Das ist nachgemessen, nicht angenommen. Gegen das kommerzielle
        # Vorbild, beide auf 1663 px Breite gebracht und die Kanten von
        # den glatten Flaechen getrennt (Rauschen sieht sonst wie Schaerfe
        # aus): Ohne den zweiten Anteil erreicht das Ergebnis 0.73 von
        # dessen Kantenzeichnung, mit Radius 4 px genau 1.02.
        #
        # Ein frueherer Stand hatte nur den zweiten Anteil, aber mit
        # voller Staerke und ohne den ersten. Das ergab breite Saeume ohne
        # scharfe Kanten - der Eindruck "da liegt ein Filter drueber".
        # Beides zusammen, jeweils massvoll, ist die Loesung.
        fein = max(0.4, float(schaerfe_radius))
        neu = neu + schaerfe * (neu - cv2.GaussianBlur(neu, (0, 0), fein))

        anzeige = max(1.5, breite * ANZEIGE_RADIUS_ANTEIL)
        neu = neu + (schaerfe * ANZEIGE_ANTEIL) * (
            neu - cv2.GaussianBlur(neu, (0, 0), anzeige))

    # Tiefenschutz. Ohne ihn zieht die Verstaerkung die dunkelste Seite jeder
    # Kante mit nach unten und drueckt sie auf null: gemessen fiel der
    # Schwarzpunkt (Perzentil 0.2) von 0.032 auf 0.000, und 0.4 % aller Pixel
    # wurden reines Schwarz. Das ist zugeklebte Tiefe - Zeichnung, die sich
    # nicht zurueckholen laesst. Das Vorbild macht das nicht (dort liegt der
    # Schwarzpunkt bei 0.034). Unterhalb von SCHATTEN_SCHUTZ wird die
    # Verstaerkung deshalb ausgeblendet.
    schutz = np.clip(lum / SCHATTEN_SCHUTZ, 0.0, 1.0)
    neu = lum + (neu - lum) * schutz
    neu = np.clip(neu, 0.0, 1.0).astype(np.float32)

    # Die Luminanzaenderung wird als Faktor auf alle drei Kanaele gelegt.
    # Dadurch bleibt der Farbton exakt erhalten - verstaerkt wird nur die
    # Helligkeitszeichnung, nicht die Saettigung.
    faktor = (neu / np.maximum(lum, 1e-4))[..., None]
    ergebnis = np.clip(bild * faktor, 0.0, 1.0).astype(np.float32)

    protokoll.append((logging.DEBUG,
                      f"Zeichnung verstaerkt (lokaler Kontrast {clarity:.2f}, "
                      f"Schaerfe {schaerfe:.2f}): mittlere Struktur "
                      f"{float(np.abs(neu - lum).mean()):.5f}"))
    return ergebnis


def wende_kontrastkurve_an(bild: np.ndarray, staerke: float,
                           protokoll: list[tuple[int, str]]) -> np.ndarray:
    """Legt die gemessene Kontrastkennlinie des Vorbilds auf das Bild.

    Diese Kennlinie ist nicht ausgedacht. Sie wurde ermittelt, indem drei
    fertige Ergebnisse des kommerziellen Dienstes und die eigenen Ergebnisse
    derselben drei Aufnahmen perzentilweise gegenuebergestellt wurden. Alle
    drei Szenen zeigten dieselbe Form, und zwar deutlich: Was bei uns bei
    0.30 lag, liegt beim Vorbild bei 0.18; was bei uns bei 0.70 lag, liegt
    dort bei 0.77.

    Genau diese Differenz ist der Grund fuer den Eindruck "flach, blass, wie
    mit einem Schleier". Ohne sie liegt das ganze Bild in einem schmalen
    Mittelband: Die Tiefen kommen nie zur Ruhe, und den Lichtern fehlt der
    Zug nach oben.

    Das weicht bewusst von der urspruenglichen Vorgabe "keine S-Kurve" ab.
    Der Grund ist ausdruecklich benannt worden: Ziel ist, die Ergebnisse des
    Dienstes zu reproduzieren - und der Dienst legt eine solche Kurve an.
    Mit --tone-contrast 0 bleibt die Ausgabe wie zuvor rein linear normalisiert;
    Zwischenwerte blenden anteilig ueber.

    Angewendet wird sie wie die uebrige Tonwertabbildung auf der Luminanz,
    umgesetzt ueber einen gemeinsamen Faktor je Pixel. Farbton und
    Saettigung bleiben dadurch unveraendert - eine kanalweise Kurve wuerde
    stattdessen die Saettigung mit anheben.
    """
    if staerke <= 0.0:
        return bild

    lum = berechne_luminanz(bild)
    ziel = np.interp(np.clip(lum, 0.0, 1.0), KONTRAST_STUETZSTELLEN,
                     KONTRAST_ZIELWERTE).astype(np.float32)
    ziel = lum + (ziel - lum) * float(np.clip(staerke, 0.0, 1.0))

    # Ueber den Weisspunkt hinaus wird nicht gestreckt: Die Kennlinie darf
    # keine Lichter ausbrennen, die vorher Zeichnung hatten.
    ziel = np.minimum(ziel, np.maximum(lum, KONTRAST_ZIELWERTE[-1]))

    faktor = ziel / np.maximum(lum, 1e-5)
    ergebnis = (bild * faktor[..., None]).astype(np.float32)
    protokoll.append((logging.DEBUG,
                      f"Kontrastkennlinie (Staerke {staerke:.2f}): Median "
                      f"{float(np.median(lum)):.3f} -> "
                      f"{float(np.median(ziel)):.3f}"))
    return ergebnis


def _weissabgleich_und_kurve(ergebnis: np.ndarray, fenstermaske_binaer: np.ndarray,
                             args: argparse.Namespace,
                             protokoll: list[tuple[int, str]]) -> np.ndarray:
    """Weissabgleich und Kontrastkennlinie - der Teil ohne Tonwertverankerung.

    Eigene Funktion, weil der Weg ueber die Strahlungskarte genau diese
    beiden Schritte braucht, die Verankerung davor aber nicht.
    """
    if args.wb_strength > 0.0:
        graupunkt = schaetze_graupunkt(np.clip(ergebnis, 0.0, 1.0),
                                       fenstermaske_binaer, protokoll)
        if graupunkt is not None and float(graupunkt.mean()) > 1e-4:
            faktor = float(graupunkt.mean()) / np.maximum(graupunkt, 1e-4)
            faktor = np.power(np.clip(faktor, 0.5, 2.0),
                              float(args.wb_strength)).astype(np.float32)
            faktor = faktor / float(np.dot(faktor, LUMA_GEWICHTE))
            ergebnis = ergebnis * faktor
            protokoll.append((logging.DEBUG,
                              f"Weissabgleich-Faktoren (R,G,B): "
                              f"{faktor[0]:.3f}/{faktor[1]:.3f}/{faktor[2]:.3f}"))
    # Die gemessene Kontrastkennlinie wird hier bewusst NICHT angewendet.
    # Sie war die Gegenmassnahme gegen die Flauheit der alten
    # Belichtungsfusion - Tiefen absenken, Lichter anheben. Auf der
    # Strahlungskarte gibt es diese Flauheit nicht mehr: Der Raum traegt
    # seine natuerlichen Tonwerte. Die Kurve legt dann eine zweite
    # Spreizung obendrauf und verschlechtert das Ergebnis messbar
    # (Abweichung vom Vorbild 0.023 ohne, 0.059 mit).
    return np.clip(ergebnis, 0.0, 1.0).astype(np.float32)


def normalisiere_tonwert(bild: np.ndarray, window: WindowPullErgebnis | None,
                         args: argparse.Namespace,
                         protokoll: list[tuple[int, str]]) -> np.ndarray:
    """Deterministische tonale Normalisierung auf feste Zielwerte.

    Keine Motiverkennung, keine Stimmungsheuristik: jedes Bild bekommt
    dieselben Zielwerte, damit ein bestehendes Lightroom-Preset unveraendert
    greift. Reihenfolge: Weiss-/Schwarzpunkt (linear), Mittelton (nur Gamma),
    globaler Weissabgleich, Highlight-Schutz.

    ``window`` darf None sein. Auf dem Weg ueber die Strahlungskarte gibt es
    keine Fenstermaske mehr - dort liegen die Fenster nach dem lokalen
    Tonemapping bereits im darstellbaren Bereich, und die Zielwerte des
    Vorbilds sind ohnehin am ganzen Bild gemessen. Verankert wird dann
    ueber das gesamte Bild, was der Sache naeher ist als eine
    Innenraum-Auswahl.
    """
    fenstermaske_binaer = (window.maske_binaer if window is not None
                           else np.zeros(bild.shape[:2], dtype=np.uint8))
    innen = ~fenstermaske_binaer.astype(bool)
    if innen.sum() < 0.02 * innen.size:
        protokoll.append((logging.WARNING,
                          "Zu wenig Innenraumflaeche fuer die Normalisierung - "
                          "es wird das gesamte Bild als Bezug verwendet."))
        innen = np.ones_like(innen)

    # Ortsabhaengige Farbstiche vor der Tonwertabbildung ausgleichen - eine
    # Beleuchtungskorrektur gehoert an den Anfang, nicht ans Ende.
    if args.local_wb > 0.0:
        bild = gleiche_lokale_farbstiche_aus(bild, args.local_wb,
                                             args.local_wb_radius,
                                             args.local_wb_limit, protokoll)

    lum = berechne_luminanz(bild)
    lum_innen = lum[innen]

    # 1./2. Weiss- und Schwarzpunkt verankern, 3. Mittelton per Gamma.
    #
    # Die drei Schritte werden gemeinsam geloest, weil sie sich sonst
    # gegenseitig aushebeln: ein Gamma NACH der Schwarzpunkt-Verankerung
    # hebt den Schwarzpunkt wieder an (0.02 hoch 0.57 sind 0.11). Deshalb
    # wird zuerst auf 0..1 normiert, dann das Gamma angewendet und erst
    # danach auf die Zielspanne gelegt. Ergebnis: alle drei Zielwerte werden
    # exakt getroffen, und es ist weiterhin nur ein Gamma - keine Kurve mit
    # Schultern.
    # Auf dem Weg ueber die Strahlungskarte wird die Tonwertlage bereits
    # vollstaendig gesetzt: die Belichtung bringt den Raum auf sein
    # Niveau, die Lichterstauchung den oberen Rand in den darstellbaren
    # Bereich. Sie hier ein zweites Mal zu verankern, verbiegt genau das
    # wieder - die Weisspunkt-Stauchung zieht das Bild herunter und das
    # Gamma hebt es mit angehobenen Tiefen zurueck. Gemessen an einer
    # Kuechenszene: Gamma 0.543, Mittelton 0.604 -> 0.761. Das ist der
    # flaue Look, den der neue Weg gerade vermeidet.
    #
    # Was bleibt, ist der Weissabgleich - eine Farbkorrektur, keine
    # Tonwertverschiebung - und der Spitzlichtschutz.
    if window is None:
        protokoll.append((logging.DEBUG,
                          "Tonwert-Verankerung uebersprungen: Die Belichtung "
                          "der Strahlungskarte setzt die Lage bereits."))
        ergebnis = bild.astype(np.float32)
        return _weissabgleich_und_kurve(ergebnis, fenstermaske_binaer, args,
                                        protokoll)

    weiss = float(np.percentile(lum_innen, args.white_percentile))
    schwarz = float(np.percentile(lum_innen, args.black_percentile))
    if weiss - schwarz < 1e-4:
        protokoll.append((logging.WARNING,
                          "Innenraum hat praktisch keinen Tonwertumfang - "
                          "Weiss-/Schwarzpunkt-Verankerung uebersprungen."))
        ergebnis = bild.astype(np.float32)
    else:
        # Die gesamte Tonwertabbildung laeuft ueber die LUMINANZ. R, G und B
        # werden anschliessend nur mit einem gemeinsamen Faktor skaliert.
        #
        # Der Grund ist ein Fehler, der sich vorher genau hier eingenistet
        # hatte: Wurde der aus der Luminanz gewonnene Schwarzpunkt kanalweise
        # abgezogen und danach bei null abgeschnitten, fiel in den Tiefen der
        # schwaechste Kanal auf null, waehrend der staerkste stehen blieb. Der
        # Farbton kippte dadurch vollstaendig. Gemessen an einer echten
        # Aufnahme lag das Blau/Rot-Verhaeltnis im Band 0.10 bis 0.20
        # anschliessend bei 1.95 (Quelle: 0.87) und die Saettigung bei 0.53
        # (Quelle: 0.21) - sichtbar als blaue Flecken in dunklen Flaechen.
        #
        # Ueber einen gemeinsamen Faktor ist der Farbton mathematisch
        # unantastbar: Jede Skalierung laesst die Kanalverhaeltnisse und
        # damit Farbton und Saettigung exakt, wie sie waren.
        def kurve(werte: np.ndarray, gamma_wert: float) -> np.ndarray:
            """Luminanz-Kennlinie: normieren, Gamma, auf die Zielspanne."""
            norm = np.clip((werte - schwarz) / (weiss - schwarz), 0.0, None)
            if abs(gamma_wert - 1.0) > 1e-6:
                norm = np.power(norm, gamma_wert)
            return args.black_target + spanne * norm

        spanne = max(args.white_target - args.black_target, 1e-4)
        median_norm = float(np.clip(
            (np.median(lum_innen) - schwarz) / (weiss - schwarz), 0.0, None))
        ziel_norm = float(np.clip((args.mid_target - args.black_target) / spanne,
                                  1e-3, 0.999))
        protokoll.append((logging.DEBUG,
                          f"Weisspunkt {weiss:.3f} -> {args.white_target:.2f}, "
                          f"Schwarzpunkt {schwarz:.3f} -> "
                          f"{args.black_target:.2f}"))

        if 1e-3 < median_norm < 0.999:
            gamma = float(np.clip(math.log(ziel_norm) / math.log(median_norm),
                                  0.3, 3.0))
            if args.mid_mode == "lift" and gamma > 1.0:
                # Nur aufhellen, nie abdunkeln. Ein Raum mit weissen Waenden
                # hat von Natur aus einen hohen Median; ihn zwanghaft auf den
                # Zielwert herunterzuziehen, macht weisse Waende grau - genau
                # das Gegenteil dessen, was in der Immobilienfotografie
                # gebraucht wird. Mit --mid-mode exact laesst sich der
                # Zielwert erzwingen.
                protokoll.append((logging.DEBUG,
                                  f"Mittelton {median_norm:.3f} liegt bereits "
                                  f"ueber dem Zielwert {ziel_norm:.3f} - es "
                                  f"wird nicht abgedunkelt (--mid-mode lift)."))
                gamma = 1.0
            else:
                protokoll.append((logging.DEBUG,
                                  f"Mittelton {median_norm:.3f} -> "
                                  f"{ziel_norm:.3f} (Gamma {gamma:.3f})"))
        else:
            gamma = 1.0
            protokoll.append((logging.WARNING,
                              f"Mittelton-Median ({median_norm:.3f}) liegt "
                              f"ausserhalb des sinnvollen Bereichs - "
                              f"Gamma-Korrektur uebersprungen."))

        # Nachverankerung: Das Gamma verschiebt die Endpunkte wieder. Statt
        # das Bild ein zweites Mal zu verrechnen, wird die Kennlinie selbst
        # nachjustiert - sie ist eindimensional und damit billig auszuwerten.
        stuetzstellen = np.linspace(schwarz, weiss, 256, dtype=np.float32)
        abgebildet = kurve(stuetzstellen, gamma)
        unten, oben = float(abgebildet[0]), float(abgebildet[-1])
        if oben - unten > 1e-4:
            nach_a = (args.white_target - args.black_target) / (oben - unten)
            nach_b = args.black_target - unten * nach_a
        else:
            nach_a, nach_b = 1.0, 0.0

        ziel_lum = kurve(lum, gamma) * nach_a + nach_b

        # Die Kennlinie wird in zwei Anteile zerlegt:
        #
        #   * einen gemeinsamen FAKTOR auf R, G und B - der laesst Farbton und
        #     Saettigung mathematisch unberuehrt;
        #   * einen neutralen ZUSCHLAG, der auf alle drei Kanaele gleich
        #     addiert wird.
        #
        # Der Faktor ist nach oben begrenzt. Ohne diese Grenze bekaemen fast
        # schwarze Pixel eine Verstaerkung von zwanzig und mehr, und ihr
        # Farbrauschen wuerde als bunte Flecken sichtbar. Was der begrenzte
        # Faktor an Helligkeit schuldig bleibt, liefert der Zuschlag nach -
        # und weil er auf alle Kanaele gleich wirkt, entsaettigt er das
        # Rauschen in den tiefsten Tiefen, statt es einzufaerben. Genau so
        # verhaelt sich auch ein klassischer Schwarzpunkt.
        #
        # Rechnerisch bleibt die Zielluminanz exakt getroffen: Die Luminanz
        # von (Bild mal Faktor plus Zuschlag) ist Luminanz mal Faktor plus
        # Zuschlag, weil die Luminanzgewichte sich zu eins summieren.
        sicher = np.maximum(lum, 1e-5)
        faktor = np.clip(ziel_lum / sicher, 0.0, args.shadow_gain)
        zuschlag = np.maximum(ziel_lum - lum * faktor, 0.0)
        ergebnis = (bild * faktor[..., None]
                    + zuschlag[..., None]).astype(np.float32)
        protokoll.append((logging.DEBUG,
                          f"Tonwertfaktor: Median {float(np.median(faktor)):.2f}, "
                          f"begrenzt bei {float((faktor >= args.shadow_gain).mean()) * 100:.2f} % "
                          f"der Pixel"))

    # 4. Globaler Weissabgleich ueber den Graupunkt der Wandflaechen.
    if args.wb_strength > 0.0:
        graupunkt = schaetze_graupunkt(np.clip(ergebnis, 0.0, 1.0),
                                       fenstermaske_binaer, protokoll)
        if graupunkt is not None and float(graupunkt.mean()) > 1e-4:
            faktor = float(graupunkt.mean()) / np.maximum(graupunkt, 1e-4)
            faktor = np.power(np.clip(faktor, 0.5, 2.0),
                              float(args.wb_strength)).astype(np.float32)
            faktor = faktor / float(np.dot(faktor, LUMA_GEWICHTE))
            ergebnis = ergebnis * faktor
            protokoll.append((logging.DEBUG,
                              f"Weissabgleich-Faktoren (R,G,B): "
                              f"{faktor[0]:.3f}/{faktor[1]:.3f}/{faktor[2]:.3f}"))

    # 5. Gemessene Kontrastkennlinie des Vorbilds.
    ergebnis = wende_kontrastkurve_an(ergebnis, args.tone_contrast, protokoll)

    # 6. Highlight-Schutz im Fensterbereich.
    #
    # Der Fensterbereich wird IMMER neu aufgebaut, nicht nur wenn eine
    # Heuristik anschlaegt. Frueher entschied ein Schwellwertvergleich
    # darueber - mit dem Ergebnis, dass winzige Parameteraenderungen das
    # Verhalten umkippen liessen: In einer Messreihe sprang die
    # Fensterhelligkeit zwischen 0.80 (sauber) und 0.97 (ausgebrannt, 1,7 %
    # der Pixel geclippt), je nachdem auf welcher Seite der Schwelle eine
    # Szene landete. Ein Werkzeug, dessen Qualitaet von einem Muenzwurf
    # abhaengt, ist nicht brauchbar.
    #
    # Der Vergleich der Streuung bleibt erhalten - aber nur noch als
    # Diagnose fuer das Protokoll.
    fenster_bool = fenstermaske_binaer.astype(bool)
    if (window is not None and fenster_bool.sum() > 100
            and window.fenster_roh is not None):
        std_vorher = float(np.std(berechne_luminanz(bild)[fenster_bool]))
        ergebnis = nimm_fenster_zurueck(ergebnis, window, args, protokoll)
        std_final = float(np.std(
            berechne_luminanz(np.clip(ergebnis, 0.0, 1.0))[fenster_bool]))
        # Ein gewisser Rueckgang ist unvermeidbar: Wird der Innenraum
        # angehoben, steigt das Knie und der Spielraum bis zur Obergrenze
        # wird kleiner. Gewarnt wird erst, wenn kaum noch Zeichnung uebrig
        # ist - sonst waere die Warnung bei jedem Bild da und damit wertlos.
        if std_final < std_vorher * 0.5 or std_final < 0.01:
            protokoll.append((logging.WARNING,
                              f"Fensterzeichnung bleibt deutlich unter dem "
                              f"Ausgangswert (Streuung {std_vorher:.4f} -> "
                              f"{std_final:.4f}). Der Innenraum-Zielwert "
                              f"(--mid-target) ist fuer diese Szene "
                              f"vermutlich zu hoch."))
        else:
            protokoll.append((logging.DEBUG,
                              f"Streuung im Fenster: {std_vorher:.4f} -> "
                              f"{std_final:.4f}"))

    return np.clip(ergebnis, 0.0, 1.0).astype(np.float32)


def nimm_fenster_zurueck(bild: np.ndarray, window: WindowPullErgebnis,
                         args: argparse.Namespace,
                         protokoll: list[tuple[int, str]]) -> np.ndarray:
    """Baut den Fensterbereich nach der Anhebung neu auf.

    Entscheidend: Grundlage sind die unkomprimierten, ungeclippten Rohdaten
    aus dem Window Pull. Wuerde man stattdessen das bereits angehobene (und
    damit oben abgeschnittene) Ergebnis erneut komprimieren, waere die
    Zeichnung schon vernichtet und die Kompression koennte sie nicht
    zurueckholen.

    Der neue Ankerpunkt ist die Rahmenhelligkeit im angehobenen Bild - so
    passt der Uebergang weiterhin zur Umgebung.
    """
    if window.fenster_roh is None or window.ring is None or window.ring.sum() < 10:
        return bild

    ring_neu = float(np.mean(berechne_luminanz(np.clip(bild, 0.0, 1.0))[window.ring]))
    if window.ring_luminanz <= 1e-5:
        return bild

    # Rohdaten auf die neue Tonskala bringen (der Innenraum wurde angehoben).
    skalierung = float(np.clip(ring_neu / window.ring_luminanz, 0.05, 40.0))
    protokoll.append((logging.DEBUG,
                      f"Fenster neu aufgebaut (Rahmenluminanz "
                      f"{window.ring_luminanz:.3f} -> {ring_neu:.3f}, "
                      f"Skalierung {skalierung:.2f})"))
    return setze_fensterinhalt(bild, window.fenster_roh * skalierung,
                               window.maske_weich, ring_neu,
                               args, window.aussicht_gewicht)


# ---------------------------------------------------------------------------
# Perspektivkorrektur (optional)
# ---------------------------------------------------------------------------


def _finde_senkrechte_linien(bild: np.ndarray,
                             max_abweichung: float = 30.0) -> np.ndarray:
    """Findet Liniensegmente nahe der Senkrechten (Hough).

    Rueckgabe: Array (N, 5) mit x1, y1, x2, y2 und Laenge. Die Laenge dient
    spaeter als Gewicht - eine lange Fensterkante ist verlaesslicher als ein
    kurzes Fragment.
    """
    h, w = bild.shape[:2]
    grau = np.clip(berechne_luminanz(bild) * 255.0, 0, 255).astype(np.uint8)
    kanten = cv2.Canny(grau, 60, 160, apertureSize=3)
    min_laenge = max(40, int(h * 0.12))
    linien = cv2.HoughLinesP(kanten, 1, np.pi / 360.0, threshold=80,
                             minLineLength=min_laenge, maxLineGap=int(h * 0.02))
    if linien is None or len(linien) == 0:
        return np.zeros((0, 5), dtype=np.float64)
    # OpenCV 4 liefert (N, 1, 4), OpenCV 5 liefert (N, 4).
    linien = np.asarray(linien, dtype=np.float64).reshape(-1, 4)

    behalten = []
    for x1, y1, x2, y2 in linien:
        dx, dy = x2 - x1, y2 - y1
        if abs(dy) < 1e-6:
            continue
        winkel = abs(math.degrees(math.atan2(dx, dy)))
        winkel = min(winkel, 180.0 - winkel)
        if winkel > max_abweichung:
            continue
        behalten.append((x1, y1, x2, y2, math.hypot(dx, dy)))
    return np.array(behalten, dtype=np.float64) if behalten else np.zeros(
        (0, 5), dtype=np.float64)


def schaetze_rollwinkel(bild: np.ndarray) -> float | None:
    """Kippung der Kamera um die optische Achse, in Grad.

    Gemessen als laengengewichteter Median der Abweichung senkrechter Linien
    von der Senkrechten. Anders als der Fluchtpunkt beschreibt der Rollwinkel
    eine reine Drehung - beide Fehler treten unabhaengig voneinander auf und
    muessen getrennt korrigiert werden.
    """
    linien = _finde_senkrechte_linien(bild, max_abweichung=20.0)
    if len(linien) < 5:
        return None
    winkel, gewichte = [], []
    for x1, y1, x2, y2, laenge in linien:
        dx, dy = x2 - x1, y2 - y1
        a = math.degrees(math.atan2(dx, dy))
        if a > 90.0:
            a -= 180.0
        elif a < -90.0:
            a += 180.0
        winkel.append(a)
        gewichte.append(laenge)
    reihenfolge = np.argsort(winkel)
    w_sortiert = np.array(gewichte)[reihenfolge]
    kumuliert = np.cumsum(w_sortiert)
    mitte = np.searchsorted(kumuliert, kumuliert[-1] / 2.0)
    return float(np.array(winkel)[reihenfolge][min(mitte, len(winkel) - 1)])


def _schaetze_vertikalen_fluchtpunkt(bild: np.ndarray) -> tuple[float, float] | None:
    """Schaetzt den vertikalen Fluchtpunkt ueber die Hough-Transformation."""
    h, w = bild.shape[:2]
    linien = _finde_senkrechte_linien(bild)
    if len(linien) < 6:
        return None

    gesammelt, gewichte = [], []
    for x1, y1, x2, y2, laenge in linien:
        # Linie in homogenen Koordinaten, zentriert auf die Bildmitte.
        p1 = np.array([x1 - w / 2.0, y1 - h / 2.0, 1.0])
        p2 = np.array([x2 - w / 2.0, y2 - h / 2.0, 1.0])
        linie = np.cross(p1, p2)
        norm = np.linalg.norm(linie[:2])
        if norm < 1e-9:
            continue
        gesammelt.append(linie / norm)
        gewichte.append(math.sqrt(laenge))

    if len(gesammelt) < 6:
        return None

    matrix = np.array(gesammelt, dtype=np.float64)
    gewichte = np.array(gewichte, dtype=np.float64)

    # Konsensverfahren statt reiner Ausgleichsrechnung.
    #
    # Ein Innenraum enthaelt viele Linien, die NICHT senkrecht sind und es
    # nur zu sein scheinen: Sofakanten, Dachschraegen, Teppichmuster. Eine
    # Ausgleichsrechnung ueber alle Linien wird von diesen Ausreissern
    # verzogen. Deshalb wird zuerst der Punkt gesucht, auf den sich die
    # meisten Linien einigen, und erst danach mit genau diesen Linien fein
    # ausgeglichen.
    #
    # Durchprobiert werden alle Linienpaare (bei den hier auftretenden
    # Anzahlen sind das wenige hundert) - damit ist das Ergebnis nicht von
    # einem Zufallsgenerator abhaengig und exakt reproduzierbar.
    anzahl = len(matrix)
    bestes_gewicht, bester_punkt = -1.0, None
    schranke = max(h, w) * 0.02   # zulaessiger Abstand einer Linie zum Punkt
    for i in range(anzahl):
        for j in range(i + 1, anzahl):
            kandidat = np.cross(matrix[i], matrix[j])
            if abs(kandidat[2]) < 1e-12:
                continue
            kandidat = kandidat / kandidat[2]
            if abs(kandidat[1]) < h * 0.75:
                continue          # Fluchtpunkt zu nah - unplausibel
            abstand = np.abs(matrix @ kandidat)
            treffer = abstand < schranke
            summe = float(gewichte[treffer].sum())
            if summe > bestes_gewicht:
                bestes_gewicht, bester_punkt = summe, treffer

    if bester_punkt is None or bester_punkt.sum() < 4:
        return None

    # Feinausgleich nur ueber die Linien des Konsenses.
    auswahl = matrix[bester_punkt] * gewichte[bester_punkt][:, None]
    _, _, vt = np.linalg.svd(auswahl)
    punkt = vt[-1]
    if abs(punkt[2]) < 1e-9:
        return None
    return float(punkt[0] / punkt[2]), float(punkt[1] / punkt[2])


def schaetze_brennweite_in_pixeln(tags: dict, breite: int) -> float:
    """Brennweite in Pixeln, wenn moeglich aus dem EXIF.

    Die Kleinbild-aequivalente Brennweite (Tag 0xA405) laesst sich direkt
    umrechnen: Kleinbild ist 36 mm breit. Ohne diese Angabe bleibt die
    Naeherung "Brennweite entspricht der Bildbreite" - das entspricht rund
    54 Grad Bildwinkel und ist fuer Innenaufnahmen eher zu lang, taugt aber
    als konservative Schaetzung.
    """
    kleinbild = tags.get(TAG_FOCAL_35MM)
    if kleinbild and 8.0 < float(kleinbild) < 400.0:
        return float(kleinbild) / 36.0 * breite
    return float(breite)


def _groesstes_rechteck(maske: np.ndarray) -> tuple[int, int, int, int]:
    """Groesstes achsenparalleles Rechteck aus Einsen (Histogramm-Verfahren)."""
    h, w = maske.shape
    hoehen = np.zeros(w, dtype=np.int32)
    bestes = (0, 0, 0, 0)
    beste_flaeche = 0
    for y in range(h):
        zeile = maske[y]
        hoehen = np.where(zeile > 0, hoehen + 1, 0)
        stapel: list[int] = []
        for x in range(w + 1):
            aktuelle = hoehen[x] if x < w else 0
            start = x
            while stapel and hoehen[stapel[-1]] >= aktuelle:
                index = stapel.pop()
                hoehe = int(hoehen[index])
                breite = x - index
                flaeche = hoehe * breite
                if flaeche > beste_flaeche:
                    beste_flaeche = flaeche
                    bestes = (index, y - hoehe + 1, breite, hoehe)
                start = index
            stapel.append(start)
    return bestes


def _sammle_gerade_kantenzuege(bild: np.ndarray,
                               mindestlaenge: float = 0.10,
                               toleranz: float = 0.05) -> list[np.ndarray]:
    """Sucht lange Kantenzuege, die in der Welt gerade Linien sein duerften.

    Genommen werden nur Zuege, die bereits weitgehend gerade verlaufen: Was
    stark gebogen ist, ist eine Sofakante oder eine Pflanze und keine durch
    das Objektiv verbogene Gerade. Genau diese Vorauswahl macht die spaetere
    Schaetzung ueberhaupt erst belastbar.
    """
    h, w = bild.shape[:2]
    grau = np.clip(berechne_luminanz(bild) * 255.0, 0, 255).astype(np.uint8)
    kanten = cv2.Canny(cv2.GaussianBlur(grau, (0, 0), 1.2), 50, 150)
    konturen, _ = cv2.findContours(kanten, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)

    grenze = mindestlaenge * min(h, w)
    zuege = []
    for kontur in konturen:
        punkte = kontur[:, 0, :].astype(np.float64)
        if len(punkte) < grenze:
            continue
        mitte = punkte.mean(axis=0)
        zentriert = punkte - mitte
        _, _, vt = np.linalg.svd(zentriert, full_matrices=False)
        laengs = zentriert @ vt[0]
        quer = zentriert @ vt[1]
        spanne = float(laengs.max() - laengs.min())
        if spanne < grenze:
            continue
        # Nur Zuege, die schon weitgehend gerade sind.
        if float(np.abs(quer).max()) > toleranz * spanne:
            continue
        # Ausduennen: gleichmaessig verteilte Stuetzstellen genuegen.
        schritt = max(1, len(punkte) // 60)
        zuege.append(punkte[::schritt])
    return zuege


def _restfehler_nach_entzerrung(zuege: list[np.ndarray], k1: float,
                                breite: int, hoehe: int) -> float:
    """Wie krumm die Kantenzuege nach einer Entzerrung mit k1 noch sind."""
    cx, cy = breite / 2.0, hoehe / 2.0
    norm = max(cx, cy)
    fehler, gewicht = 0.0, 0.0
    for punkte in zuege:
        x = (punkte[:, 0] - cx) / norm
        y = (punkte[:, 1] - cy) / norm
        r2 = x * x + y * y
        faktor = 1.0 + k1 * r2
        px, py = x * faktor, y * faktor
        stapel = np.stack([px, py], axis=1)
        mitte = stapel.mean(axis=0)
        zentriert = stapel - mitte
        _, _, vt = np.linalg.svd(zentriert, full_matrices=False)
        quer = zentriert @ vt[1]
        laengs = zentriert @ vt[0]
        spanne = float(laengs.max() - laengs.min())
        if spanne < 1e-6:
            continue
        # Quadratische Abweichung, auf die Laenge bezogen und laengengewichtet.
        fehler += float(np.sum(quer ** 2)) / len(quer) / (spanne ** 2) * spanne
        gewicht += spanne
    return fehler / max(gewicht, 1e-9)


def schaetze_verzeichnung(bild: np.ndarray,
                          protokoll: list[tuple[int, str]]) -> float:
    """Schaetzt den radialen Verzeichnungskoeffizienten aus dem Bild selbst.

    Innenaufnahmen entstehen mit sehr weitwinkligen Objektiven (in der
    vermessenen Aufnahme 16 mm Kleinbild), die tonnenfoermig verzeichnen.
    Ein Objektivprofil waere genauer, wuerde aber eine Profildatenbank als
    weitere Abhaengigkeit erfordern. Stattdessen wird der Koeffizient
    geschaetzt, der die vorhandenen geraden Kanten am besten geradebiegt.

    Gesucht wird in zwei Durchgaengen (grob, dann fein) ueber ein festes
    Raster - damit ohne Zufallsgenerator und exakt reproduzierbar.
    """
    zuege = _sammle_gerade_kantenzuege(bild)
    if len(zuege) < 6:
        protokoll.append((logging.DEBUG,
                          f"Objektivkorrektur: nur {len(zuege)} brauchbare "
                          f"Kantenzuege - uebersprungen."))
        return 0.0

    h, w = bild.shape[:2]
    bester, bester_fehler = 0.0, _restfehler_nach_entzerrung(zuege, 0.0, w, h)
    ausgang = bester_fehler
    for spanne, schritte in ((0.30, 31), (0.02, 21)):
        raster = np.linspace(bester - spanne, bester + spanne, schritte)
        for k1 in raster:
            if abs(k1) > 0.35:
                continue
            fehler = _restfehler_nach_entzerrung(zuege, float(k1), w, h)
            if fehler < bester_fehler:
                bester_fehler, bester = fehler, float(k1)

    verbesserung = 1.0 - bester_fehler / max(ausgang, 1e-12)
    # Nur uebernehmen, wenn die Kanten dadurch deutlich gerader werden.
    # Die Schaetzung aus einem einzelnen Innenraumbild ist heikel: Es gibt
    # dort wenige wirklich lange Geraden, und Moebelkanten sehen wie welche
    # aus. Deshalb wird der Vorschlag protokolliert, aber nur bei klarer
    # Verbesserung angewendet. Wer denselben Objektivtyp immer benutzt,
    # faehrt mit einem einmal ermittelten festen Wert (--lens-k1) besser.
    if verbesserung < 0.10 or abs(bester) < 0.005:
        protokoll.append((logging.INFO,
                          f"Objektivkorrektur: Vorschlag k1 = {bester:+.4f} "
                          f"aus {len(zuege)} Kantenzuegen, verbessert die "
                          f"Geradheit aber nur um {verbesserung * 100:.1f} % - "
                          f"nicht angewendet. Fuer einen festen Wert: "
                          f"--lens-k1 verwenden."))
        return 0.0
    protokoll.append((logging.DEBUG,
                      f"Objektivkorrektur: {len(zuege)} Kantenzuege, k1 = "
                      f"{bester:+.4f}, Restfehler -{verbesserung * 100:.1f} %"))
    return bester


def korrigiere_verzeichnung(bild: np.ndarray, k1: float) -> np.ndarray:
    """Entzerrt radial und beschneidet auf den gueltigen Bereich."""
    if abs(k1) < 1e-6:
        return bild
    h, w = bild.shape[:2]
    norm = max(w, h) / 2.0
    kamera = np.array([[norm, 0, w / 2.0], [0, norm, h / 2.0], [0, 0, 1]],
                      dtype=np.float64)
    # OpenCV entzerrt mit dem inversen Vorzeichen der hier verwendeten
    # Konvention.
    koeffizienten = np.array([-k1, 0.0, 0.0, 0.0], dtype=np.float64)
    karte_x, karte_y = cv2.initUndistortRectifyMap(
        kamera, koeffizienten, None, kamera, (w, h), cv2.CV_32FC1)
    entzerrt = cv2.remap(bild, karte_x, karte_y, cv2.INTER_LINEAR,
                         borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    gueltig = cv2.remap(np.ones((h, w), dtype=np.uint8), karte_x, karte_y,
                        cv2.INTER_NEAREST, borderMode=cv2.BORDER_CONSTANT,
                        borderValue=0)
    skala = 400.0 / max(w, 1)
    klein = cv2.resize(gueltig, (max(int(w * skala), 8), max(int(h * skala), 8)),
                       interpolation=cv2.INTER_NEAREST)
    x, y, bw, bh = _groesstes_rechteck(klein)
    if bw < 8 or bh < 8:
        return entzerrt
    faktor = 1.0 / skala
    x0, y0 = int(x * faktor) + 1, int(y * faktor) + 1
    x1, y1 = min(int((x + bw) * faktor) - 1, w), min(int((y + bh) * faktor) - 1, h)
    if x1 - x0 < 16 or y1 - y0 < 16:
        return entzerrt
    return entzerrt[y0:y1, x0:x1]


def begradige_perspektive(bild: np.ndarray, max_grad: float,
                          protokoll: list[tuple[int, str]],
                          tags: dict | None = None) -> np.ndarray:
    """Richtet stuerzende und gekippte Linien auf, beschneidet danach.

    Korrigiert zwei unabhaengige Fehler in einem Durchgang:

      * den **Rollwinkel** - die Kamera war um die optische Achse gekippt,
        Senkrechte stehen schraeg, laufen aber parallel;
      * die **Neigung** - die Kamera war nach oben oder unten geneigt,
        Senkrechte laufen auf einen Fluchtpunkt zu (stuerzende Linien).

    Sicherheitsregel: Nur ausfuehren, wenn die noetige Korrektur unter dem
    Schwellwert bleibt. Starke Korrekturen zerstoeren bei Dachschraegen und
    Mansarden mehr, als sie retten.
    """
    h, w = bild.shape[:2]
    tags = tags or {}
    brennweite = schaetze_brennweite_in_pixeln(tags, w)

    # --- Schritt 1: Rollwinkel -------------------------------------------
    roll = schaetze_rollwinkel(bild)
    if roll is None:
        protokoll.append((logging.WARNING,
                          "Perspektivkorrektur: zu wenige senkrechte Linien "
                          "gefunden - Bild bleibt unveraendert."))
        return bild
    if abs(roll) > max_grad:
        protokoll.append((logging.WARNING,
                          f"Perspektivkorrektur: Kippung {roll:.1f} Grad "
                          f"ueberschreitet den Schwellwert von "
                          f"{max_grad:.1f} Grad - Bild bleibt unveraendert."))
        return bild

    bogen = math.radians(roll)
    drehung = np.array([[math.cos(bogen), -math.sin(bogen), 0.0],
                        [math.sin(bogen), math.cos(bogen), 0.0],
                        [0.0, 0.0, 1.0]], dtype=np.float64)

    # --- Schritt 2: Neigung ueber den Fluchtpunkt -------------------------
    fluchtpunkt = _schaetze_vertikalen_fluchtpunkt(bild)
    neigung = 0.0
    keystone = np.eye(3, dtype=np.float64)
    if fluchtpunkt is not None:
        vx, vy = fluchtpunkt
        # Den Fluchtpunkt in das gedrehte Koordinatensystem bringen.
        gedreht = drehung @ np.array([vx, vy, 1.0])
        if abs(gedreht[2]) > 1e-9:
            vy = float(gedreht[1] / gedreht[2])
            if abs(vy) > h * 0.75:
                neigung = abs(math.degrees(math.atan(brennweite / vy)))
                if neigung > max_grad:
                    protokoll.append((logging.WARNING,
                                      f"Perspektivkorrektur: Neigung "
                                      f"{neigung:.1f} Grad ueberschreitet den "
                                      f"Schwellwert von {max_grad:.1f} Grad - "
                                      f"nur die Kippung wird korrigiert."))
                    neigung = 0.0
                else:
                    keystone = np.array([[1.0, 0.0, 0.0],
                                         [0.0, 1.0, 0.0],
                                         [0.0, -1.0 / vy, 1.0]],
                                        dtype=np.float64)

    if abs(roll) < 0.10 and neigung < 0.15:
        protokoll.append((logging.DEBUG,
                          "Perspektivkorrektur: Abweichung vernachlaessigbar."))
        return bild

    zentrieren = np.array([[1, 0, -w / 2.0], [0, 1, -h / 2.0], [0, 0, 1]],
                          dtype=np.float64)
    zurueck = np.array([[1, 0, w / 2.0], [0, 1, h / 2.0], [0, 0, 1]],
                       dtype=np.float64)
    homographie = zurueck @ keystone @ drehung @ zentrieren

    korrigiert = cv2.warpPerspective(bild, homographie, (w, h),
                                     flags=cv2.INTER_LINEAR,
                                     borderMode=cv2.BORDER_CONSTANT,
                                     borderValue=(0, 0, 0))

    # --- Schritt 3: auf den groessten gueltigen Ausschnitt beschneiden ----
    gueltig = cv2.warpPerspective(np.ones((h, w), dtype=np.uint8), homographie,
                                  (w, h), flags=cv2.INTER_NEAREST,
                                  borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    skala = 400.0 / max(w, 1)
    klein = cv2.resize(gueltig, (max(int(w * skala), 8), max(int(h * skala), 8)),
                       interpolation=cv2.INTER_NEAREST)
    x, y, bw, bh = _groesstes_rechteck(klein)
    if bw < 8 or bh < 8:
        protokoll.append((logging.WARNING,
                          "Perspektivkorrektur: kein sinnvoller Ausschnitt - "
                          "Bild bleibt unveraendert."))
        return bild
    faktor = 1.0 / skala
    x0, y0 = int(x * faktor) + 1, int(y * faktor) + 1
    x1, y1 = int((x + bw) * faktor) - 1, int((y + bh) * faktor) - 1
    x1, y1 = min(x1, w), min(y1, h)
    if x1 - x0 < 16 or y1 - y0 < 16:
        return bild

    verlust = 100.0 * (1.0 - ((x1 - x0) * (y1 - y0)) / float(w * h))
    protokoll.append((logging.INFO,
                      f"Perspektivkorrektur: Kippung {roll:+.2f} Grad, "
                      f"Neigung {neigung:.2f} Grad, Ausschnitt "
                      f"{x1 - x0}x{y1 - y0} px ({verlust:.1f} % Verlust)."))
    return korrigiert[y0:y1, x0:x1]


# ---------------------------------------------------------------------------
# Ausgabe
# ---------------------------------------------------------------------------


def _xmp_paket(tags: dict) -> bytes:
    """Minimales XMP-Paket mit den wichtigsten Aufnahmedaten.

    Lightroom liest XMP aus TIFF-Tag 700 und zeigt damit Kamera, Objektiv und
    Aufnahmedatum wieder an. Eine vollstaendige Exif-IFD in ein TIFF zu
    schreiben, wuerde eine weitere Abhaengigkeit erfordern.
    """
    def hole(tag, standard=""):
        wert = tags.get(tag, standard)
        if isinstance(wert, str):
            return (wert.replace("&", "&amp;").replace("<", "&lt;")
                    .replace(">", "&gt;"))
        return wert

    datum = tags.get(TAG_DATETIME_ORIGINAL) or tags.get(TAG_DATETIME) or ""
    if isinstance(datum, str) and len(datum) == 19:
        datum = datum[:10].replace(":", "-") + "T" + datum[11:]

    belichtung = tags.get(TAG_EXPOSURE_TIME)
    blende = tags.get(TAG_FNUMBER)
    iso = tags.get(TAG_ISO)
    brennweite = tags.get(TAG_FOCAL_LENGTH)

    zeilen = [
        '<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>',
        '<x:xmpmeta xmlns:x="adobe:ns:meta/">',
        '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">',
        '<rdf:Description rdf:about=""',
        ' xmlns:tiff="http://ns.adobe.com/tiff/1.0/"',
        ' xmlns:exif="http://ns.adobe.com/exif/1.0/"',
        ' xmlns:xmp="http://ns.adobe.com/xap/1.0/"',
        f' tiff:Make="{hole(TAG_MAKE)}"',
        f' tiff:Model="{hole(TAG_MODEL)}"',
        f' xmp:CreateDate="{datum}"',
        f' exif:DateTimeOriginal="{datum}"',
        ' xmp:CreatorTool="hdr_merge.py"',
    ]
    if belichtung:
        zeilen.append(f' exif:ExposureTime="{round(1.0 / belichtung) and ""}'
                      f'{belichtung:.6f}"'.replace('""', '"'))
    if blende:
        zeilen.append(f' exif:FNumber="{blende:.2f}"')
    if iso:
        zeilen.append(f' exif:ISOSpeedRatings="{int(iso)}"')
    if brennweite:
        zeilen.append(f' exif:FocalLength="{brennweite:.1f}"')
    if tags.get(TAG_LENS_MODEL):
        zeilen.append(f' exif:LensModel="{hole(TAG_LENS_MODEL)}"')
    zeilen += ['/>', '</rdf:RDF>', '</x:xmpmeta>', '<?xpacket end="w"?>']
    return "\n".join(zeilen).encode("utf-8")


def _icc_xyz(x: float, y: float, z: float) -> bytes:
    """XYZType-Tag: drei Festkommazahlen s15Fixed16."""
    return b"XYZ " + b"\x00" * 4 + struct.pack(
        ">iii", *(int(round(w * 65536.0)) for w in (x, y, z)))


def _icc_srgb_kurve(stuetzstellen: int = 1024) -> bytes:
    """curveType mit der echten sRGB-Kennlinie.

    Bewusst als Wertetabelle und nicht als einzelner Gamma-Wert: sRGB ist
    kein reines Gamma 2.2, sondern hat unten ein lineares Stueck. Mit einem
    Gamma-Wert allein waeren die Tiefen um bis zu einem Prozent daneben -
    genau der Bereich, in dem eine Immobilienaufnahme ihre Schattenzeichnung
    hat.
    """
    x = np.linspace(0.0, 1.0, stuetzstellen, dtype=np.float64)
    linear = np.where(x <= 0.04045, x / 12.92, ((x + 0.055) / 1.055) ** 2.4)
    werte = np.clip(np.round(linear * 65535.0), 0, 65535).astype(">u2")
    return (b"curv" + b"\x00" * 4 + struct.pack(">I", stuetzstellen)
            + werte.tobytes())


def _icc_text(inhalt: str) -> bytes:
    """textDescriptionType, wie ICC v2 ihn fuer 'desc' verlangt."""
    roh = inhalt.encode("ascii", "replace") + b"\x00"
    return (b"desc" + b"\x00" * 4 + struct.pack(">I", len(roh)) + roh
            + struct.pack(">II", 0, 0)          # Unicode: keine Sprache, leer
            + struct.pack(">HB", 0, 0) + b"\x00" * 67)   # ScriptCode, leer


def baue_srgb_profil() -> bytes:
    """Erzeugt ein gueltiges sRGB-ICC-Profil (v2, Matrix/TRC).

    Warum ueberhaupt: Ohne eingebettetes Profil ist ein TIFF farblich
    mehrdeutig. Photoshop fragt dann nach oder weist stillschweigend den
    eingestellten Arbeitsfarbraum zu - ist der Adobe RGB oder ProPhoto,
    werden dieselben Zahlen deutlich anders interpretiert und das Bild
    sieht kraeftiger aus, als es ist. Genau das darf einer Vorlage fuer ein
    Lightroom-Preset nicht passieren.

    Selbst gebaut, weil das Werkzeug ohne zusaetzliche Abhaengigkeit
    auskommen soll und auf einem Windows-Rechner keine ICC-Bibliothek
    vorausgesetzt werden kann. Die Primaervalenzen sind die offiziellen,
    auf D50 adaptierten sRGB-Werte - dieselben, die auch im Profil von
    Adobe und der ICC stehen.
    """
    tags: list[tuple[bytes, bytes]] = [
        (b"desc", _icc_text("sRGB IEC61966-2.1")),
        (b"wtpt", _icc_xyz(0.96420, 1.00000, 0.82491)),     # D50
        (b"rXYZ", _icc_xyz(0.43607, 0.22249, 0.01392)),
        (b"gXYZ", _icc_xyz(0.38515, 0.71687, 0.09708)),
        (b"bXYZ", _icc_xyz(0.14307, 0.06061, 0.71410)),
        (b"cprt", b"text" + b"\x00" * 4 + b"Public Domain\x00"),
    ]
    kurve = _icc_srgb_kurve()
    # Alle drei Kanaele teilen sich dieselbe Kennlinie; ICC erlaubt
    # ausdruecklich, dass mehrere Tags auf denselben Datenblock zeigen.
    tags += [(b"rTRC", kurve), (b"gTRC", kurve), (b"bTRC", kurve)]

    kopf_laenge = 128 + 4 + 12 * len(tags)
    daten = bytearray()
    tabelle = bytearray()
    bekannt: dict[bytes, tuple[int, int]] = {}
    for name, inhalt in tags:
        if inhalt not in bekannt:
            beginn = kopf_laenge + len(daten)
            daten += inhalt
            daten += b"\x00" * (-len(inhalt) % 4)     # 4-Byte-Ausrichtung
            bekannt[inhalt] = (beginn, len(inhalt))
        beginn, groesse = bekannt[inhalt]
        tabelle += name + struct.pack(">II", beginn, groesse)

    gesamt = kopf_laenge + len(daten)
    kopf = bytearray(128)
    struct.pack_into(">I", kopf, 0, gesamt)
    struct.pack_into(">I", kopf, 8, 0x02100000)        # Version 2.1
    kopf[12:16] = b"mntr"                              # Display-Geraet
    kopf[16:20] = b"RGB "
    kopf[20:24] = b"XYZ "
    kopf[36:40] = b"acsp"
    struct.pack_into(">I", kopf, 64, 0)                # Rendering Intent
    struct.pack_into(">iii", kopf, 68,
                     int(round(0.96420 * 65536)), 65536,
                     int(round(0.82491 * 65536)))      # PCS-Lichtart D50
    return bytes(kopf) + struct.pack(">I", len(tags)) + bytes(tabelle) + bytes(daten)


SRGB_PROFIL = baue_srgb_profil()


def speichere_tiff(pfad: Path, bild: np.ndarray, tags: dict,
                   kompression: str,
                   protokoll: list[tuple[int, str]] | None = None) -> None:
    """Schreibt ein 16-Bit-TIFF (sRGB) und uebernimmt EXIF, soweit moeglich."""
    daten = np.clip(bild, 0.0, 1.0)
    daten = np.round(daten * 65535.0).astype(np.uint16)

    extratags = []
    if tags.get(TAG_MAKE):
        extratags.append((271, "s", 0, str(tags[TAG_MAKE]), True))
    if tags.get(TAG_MODEL):
        extratags.append((272, "s", 0, str(tags[TAG_MODEL]), True))
    datum = tags.get(TAG_DATETIME_ORIGINAL) or tags.get(TAG_DATETIME)
    if isinstance(datum, str) and datum:
        extratags.append((306, "s", 0, datum, True))
    extratags.append((700, "B", None, _xmp_paket(tags), True))  # XMP

    def schreibe(verfahren):
        tifffile.imwrite(
            str(pfad), daten,
            photometric="rgb",
            compression=verfahren,
            software="hdr_merge.py",
            extratags=extratags,
            # Ohne eingebettetes Profil ist die Datei farblich mehrdeutig -
            # Photoshop weist dann den eingestellten Arbeitsfarbraum zu.
            iccprofile=SRGB_PROFIL,
            metadata=None,
        )

    if kompression == "lzw":
        try:
            schreibe("lzw")
            return
        except Exception as fehler:
            # LZW braucht in tifffile das optionale Paket 'imagecodecs'.
            # Statt abzubrechen wird unkomprimiert geschrieben und gewarnt.
            if protokoll is not None:
                protokoll.append((logging.WARNING,
                                  f"LZW nicht verfuegbar ({fehler}) - TIFF wird "
                                  f"unkomprimiert geschrieben "
                                  f"(pip install imagecodecs behebt das)."))
    schreibe(None)


VORSCHAU_BREITE = 420


def erzeuge_vorschaukachel(bild: np.ndarray) -> np.ndarray:
    """Verkleinert ein Bild auf Kontaktbogen-Groesse (8 Bit).

    Wird bewusst frueh im Ablauf aufgerufen, damit die grossen Bilddaten
    danach freigegeben werden koennen.
    """
    h, w = bild.shape[:2]
    neue_hoehe = max(1, int(round(h * VORSCHAU_BREITE / w)))
    klein = cv2.resize(bild, (VORSCHAU_BREITE, neue_hoehe),
                       interpolation=cv2.INTER_AREA)
    return np.clip(klein * 255.0, 0, 255).astype(np.uint8)


def erzeuge_kontaktbogen(pfad: Path, kacheln_einzelbilder: Sequence[np.ndarray],
                         fusion: np.ndarray, maske: np.ndarray,
                         ergebnis: np.ndarray, titel: str) -> None:
    """Schreibt einen JPEG-Kontaktbogen zur schnellen Sichtpruefung.

    Reihenfolge: Einzelbelichtungen | Maskenueberlagerung | Ergebnis.
    Die Einzelbelichtungen werden bereits verkleinert uebergeben.
    """
    def thumb(bild: np.ndarray) -> np.ndarray:
        return erzeuge_vorschaukachel(bild)

    kacheln = list(kacheln_einzelbilder)

    # Maskenueberlagerung: Fensterbereich rot markiert.
    ueberlagerung = fusion.copy()
    alpha = np.clip(maske, 0.0, 1.0)[..., None]
    rot = np.zeros_like(fusion)
    rot[..., 0] = 1.0
    ueberlagerung = ueberlagerung * (1.0 - 0.45 * alpha) + rot * (0.45 * alpha)
    kacheln.append(thumb(ueberlagerung))
    kacheln.append(thumb(ergebnis))

    hoehe = max(k.shape[0] for k in kacheln)
    beschriftungen = ([f"EV {i + 1}" for i in range(len(kacheln_einzelbilder))]
                      + ["Maske", "Ergebnis"])
    kopf = 26
    tafel = np.full((hoehe + kopf, sum(k.shape[1] for k in kacheln) + 8 * len(kacheln), 3),
                    24, dtype=np.uint8)
    x = 4
    for kachel, text in zip(kacheln, beschriftungen):
        h, w = kachel.shape[:2]
        tafel[kopf:kopf + h, x:x + w] = kachel
        cv2.putText(tafel, text, (x + 2, kopf - 8), cv2.FONT_HERSHEY_SIMPLEX,
                    0.5, (235, 235, 235), 1, cv2.LINE_AA)
        x += w + 8
    cv2.putText(tafel, titel, (tafel.shape[1] - 8 * len(titel) - 10, kopf - 8),
                cv2.FONT_HERSHEY_SIMPLEX, 0.45, (160, 200, 255), 1, cv2.LINE_AA)

    cv2.imwrite(str(pfad), cv2.cvtColor(tafel, cv2.COLOR_RGB2BGR),
                [int(cv2.IMWRITE_JPEG_QUALITY), 88])


# ---------------------------------------------------------------------------
# Verarbeitung einer Reihe
# ---------------------------------------------------------------------------


@dataclasses.dataclass
class ReihenErgebnis:
    name: str
    ausgabe: Path | None
    protokoll: list[tuple[int, str]]
    erfolgreich: bool


def lade_reihe_klein(aufnahmen: Sequence[Aufnahme], breite: int,
                     weissabgleich: str = "camera") -> list[np.ndarray]:
    """Laedt eine Reihe verkleinert - Grundlage der Vorschau.

    RAWs werden mit ``half_size`` entwickelt, was etwa viermal schneller ist
    als die volle Entwicklung, und anschliessend auf die Zielbreite
    gebracht. Aus rund 60 Sekunden je Reihe werden so wenige Sekunden.
    """
    klein: list[np.ndarray] = []
    for aufnahme in aufnahmen:
        bild = lade_bild(aufnahme.pfad, weissabgleich, halbe_groesse=True)
        if bild.shape[1] > breite:
            hoehe = int(round(breite * bild.shape[0] / bild.shape[1]))
            bild = cv2.resize(bild, (breite, hoehe),
                              interpolation=cv2.INTER_AREA)
        klein.append(np.ascontiguousarray(bild))
    return klein


def berechne_vorschau(bilder_klein: Sequence[np.ndarray],
                      args: argparse.Namespace,
                      evs: Sequence[float | None] | None = None) -> np.ndarray:
    """Vorschaubild aus bereits verkleinerten Belichtungen.

    Nimmt denselben Weg wie der Endlauf (siehe ``verarbeite_bilder``),
    einschliesslich des Aufrichtens: Wer das Haekchen setzt, muss die
    Wirkung sehen koennen. Frueher blieb es hier aussen vor, mit dem
    Ergebnis, dass das Haekchen in der Vorschau nichts tat und wie ein
    kaputter Schalter wirkte.

    Uebersprungen wird nur die Objektivkorrektur: Sie braucht die volle
    Aufloesung, um die Verzeichnung ueberhaupt zu schaetzen.

    Die Radien fuer Zeichnung und Masken sind Anteile der Bildbreite und
    wirken deshalb massstabsgetreu. Der Schaerferadius ist dagegen absolut
    in Pixeln - auf dem verkleinerten Bild wirkt die Schaerfe also staerker
    als spaeter im Endergebnis. Das ist der ehrlichere Kompromiss: Bei
    massstabsgetreuer Umrechnung waere die Schaerfe in der Vorschau
    unsichtbar, weil sie unter die Aufloesung der Anzeige fiele.
    """
    protokoll: list[tuple[int, str]] = []
    ergebnis, _, _, _, tags = verarbeite_bilder(
        [b.copy() for b in bilder_klein], args, protokoll, evs_je_bild=evs)
    if getattr(args, "straighten", False):
        ergebnis = begradige_perspektive(ergebnis, args.straighten_max_deg,
                                         protokoll, tags or {})
    return veredle_ergebnis(ergebnis, args, protokoll)


def verarbeite_bilder(bilder: list[np.ndarray], args: argparse.Namespace,
                      protokoll: list[tuple[int, str]],
                      tags_je_bild: Sequence[dict] | None = None,
                      evs_je_bild: Sequence[float | None] | None = None
                      ) -> tuple[np.ndarray, WindowPullErgebnis | None,
                                 np.ndarray, list[np.ndarray], dict]:
    """Der Rechenkern: von den geladenen Belichtungen bis vor die Geometrie.

    Bewusst als eigene Funktion, damit die Vorschau in der Oberflaeche
    exakt denselben Weg nimmt wie der spaetere Endlauf - nur auf
    verkleinerten Bildern. Waeren es zwei Implementierungen, koennte die
    Vorschau etwas zeigen, das das Ergebnis nicht einloest; genau darauf
    muss man sich beim Justieren aber verlassen koennen.

    Rueckgabe: Ergebnis, Window-Pull-Zwischenstand, Fusion, Vorschaukacheln
    fuer den Kontaktbogen und die EXIF-Tags der Referenzaufnahme.
    """
    # Reihenfolge nach tatsaechlicher Bildhelligkeit festlegen (unabhaengig
    # von der Dateireihenfolge): dunkelste zuerst.
    helligkeiten = [float(berechne_luminanz(b).mean()) for b in bilder]
    reihenfolge = sorted(range(len(bilder)), key=lambda i: helligkeiten[i])
    bilder = [bilder[i] for i in reihenfolge]

    referenz_index = len(bilder) // 2  # mittlere Belichtung
    referenz_tags: dict = {}
    if tags_je_bild:
        sortierte_tags = [tags_je_bild[i] for i in reihenfolge]
        referenz_tags = sortierte_tags[referenz_index]
    if evs_je_bild:
        evs_je_bild = [evs_je_bild[i] for i in reihenfolge]

    if not args.no_align:
        bilder = richte_reihe_aus(bilder, referenz_index, protokoll)

    # Der Weg ueber die Strahlungskarte braucht die Belichtungsabstaende.
    # Fehlen sie (TIFFs ohne EXIF, unbekanntes Kameramodell), bleibt der
    # alte Weg ueber die Mertens-Fusion als Rueckfallebene - er kommt ohne
    # EV-Werte aus.
    evs = list(evs_je_bild or [])
    hdr_moeglich = (args.hdr == "on" and len(evs) == len(bilder)
                    and all(e is not None for e in evs)
                    and len(set(round(float(e), 2) for e in evs)) > 1)

    if hdr_moeglich:
        vorschau_kacheln = ([erzeuge_vorschaukachel(b) for b in bilder]
                            if args.preview else [])
        strahlung = baue_strahlungskarte(bilder, [float(e) for e in evs],
                                         protokoll)
        bilder.clear()
        ergebnis = tonemappe_lokal(strahlung, args.hdr_compression,
                                   args.hdr_detail, args.hdr_radius, protokoll,
                                   args.hdr_knee, args.hdr_highlight)
        del strahlung
        if args.base_tone == "on":
            ergebnis = normalisiere_tonwert(ergebnis, None, args, protokoll)
        else:
            protokoll.append((logging.INFO,
                              "Tonale Normalisierung deaktiviert "
                              "(--base-tone off)."))
        return ergebnis, None, ergebnis, vorschau_kacheln, referenz_tags

    if args.hdr == "on":
        protokoll.append((logging.WARNING,
                          "Keine brauchbaren EV-Werte in den Aufnahmen - "
                          "es wird auf die Belichtungsfusion zurueckgefallen. "
                          "Fenster koennen dann ausbrennen."))

    fusion = fusioniere_mertens(bilder, args.contrast, args.saturation,
                                args.exposure)

    # Fuer den Kontaktbogen reichen kleine Vorschaubilder. Sie werden jetzt
    # erzeugt, damit anschliessend nur noch die beiden tatsaechlich
    # benoetigten Belichtungen in voller Aufloesung im Speicher bleiben.
    # Bei einer Siebener-Reihe mit 24 Megapixeln spart das ueber ein
    # Gigabyte.
    vorschau_kacheln = ([erzeuge_vorschaukachel(b) for b in bilder]
                        if args.preview else [])
    dunkel = bilder[0]
    referenz = bilder[referenz_index]
    bilder.clear()

    window = fuehre_window_pull_aus(fusion, referenz, dunkel, args, protokoll)
    del dunkel, referenz
    ergebnis = window.bild

    if args.base_tone == "on":
        ergebnis = normalisiere_tonwert(ergebnis, window, args, protokoll)
    else:
        protokoll.append((logging.INFO,
                          "Tonale Normalisierung deaktiviert (--base-tone off) "
                          "- Ausgabe ist die flache Rohfusion."))

    return ergebnis, window, fusion, vorschau_kacheln, referenz_tags


def veredle_ergebnis(ergebnis: np.ndarray, args: argparse.Namespace,
                     protokoll: list[tuple[int, str]]) -> np.ndarray:
    """Farbangleich, Zeichnung und Spitzlichtschutz - der Abschluss.

    Steht getrennt, weil die Geometrieschritte dazwischen liegen und die
    Vorschau sie ueberspringt (sie aendern den Bildausschnitt, nicht den
    Look).
    """
    ergebnis = gleiche_saettigung_an(ergebnis, args.color_match,
                                     args.color_match_target, protokoll)
    # Bewusst nach allen geometrischen Schritten: Objektivkorrektur und
    # Perspektivkorrektur interpolieren das Bild neu und wuerden vorher
    # erzeugte Schaerfe wieder aufweichen.
    ergebnis = verstaerke_zeichnung(ergebnis, args.clarity, args.clarity_radius,
                                    args.sharpen, args.sharpen_radius, protokoll)
    return schuetze_spitzlichter(ergebnis, args, protokoll)


def verarbeite_reihe(aufnahmen: Sequence[Aufnahme], ausgabe_ordner: Path,
                     args: argparse.Namespace) -> ReihenErgebnis:
    """Verarbeitet eine komplette Belichtungsreihe zu einem Basisbild."""
    protokoll: list[tuple[int, str]] = []
    name = aufnahmen[0].pfad.stem

    if len(aufnahmen) not in ERWARTETE_REIHENLAENGEN:
        protokoll.append((logging.WARNING,
                          f"Reihe hat {len(aufnahmen)} Bilder - erwartet werden "
                          f"3, 5 oder 7. Gruppierung pruefen "
                          f"(--bracket-size)."))
    if len(aufnahmen) < 2:
        protokoll.append((logging.ERROR,
                          "Reihe hat weniger als 2 Bilder - uebersprungen."))
        return ReihenErgebnis(name, None, protokoll, False)

    try:
        bilder = [lade_bild(a.pfad, args.raw_wb) for a in aufnahmen]
    except Exception as fehler:  # pragma: no cover - Dateisystem/Format
        protokoll.append((logging.ERROR, f"Laden fehlgeschlagen: {fehler}"))
        return ReihenErgebnis(name, None, protokoll, False)

    formen = {b.shape for b in bilder}
    if len(formen) != 1:
        protokoll.append((logging.ERROR,
                          f"Bilder der Reihe haben unterschiedliche Groessen "
                          f"({formen}) - uebersprungen."))
        return ReihenErgebnis(name, None, protokoll, False)

    ergebnis, window, fusion, vorschau_kacheln, referenz_tags = verarbeite_bilder(
        bilder, args, protokoll,
        tags_je_bild=[a.tags for a in aufnahmen],
        evs_je_bild=[a.ev for a in aufnahmen])
    del bilder

    if args.lens_k1:
        vorher = ergebnis.shape[:2]
        ergebnis = korrigiere_verzeichnung(ergebnis, args.lens_k1)
        protokoll.append((logging.INFO,
                          f"Objektivkorrektur mit festem k1 {args.lens_k1:+.4f}, "
                          f"Ausschnitt {ergebnis.shape[1]}x{ergebnis.shape[0]} "
                          f"von {vorher[1]}x{vorher[0]} px."))
    elif args.lens_correct:
        k1 = schaetze_verzeichnung(ergebnis, protokoll)
        if k1:
            vorher = ergebnis.shape[:2]
            ergebnis = korrigiere_verzeichnung(ergebnis, k1)
            protokoll.append((logging.INFO,
                              f"Objektivkorrektur angewendet (k1 {k1:+.4f}), "
                              f"Ausschnitt {ergebnis.shape[1]}x"
                              f"{ergebnis.shape[0]} von {vorher[1]}x{vorher[0]} px."))

    if args.straighten:
        ergebnis = begradige_perspektive(ergebnis, args.straighten_max_deg,
                                         protokoll, referenz_tags)

    ergebnis = veredle_ergebnis(ergebnis, args, protokoll)

    ausgabe_ordner.mkdir(parents=True, exist_ok=True)
    ziel = ausgabe_ordner / f"{name}_hdr.tif"
    speichere_tiff(ziel, ergebnis, referenz_tags, args.compression, protokoll)

    if args.preview:
        maske = (window.maske_weich if window is not None
                 else np.zeros(ergebnis.shape[:2], dtype=np.float32))
        erzeuge_kontaktbogen(ausgabe_ordner / f"{name}_preview.jpg",
                             vorschau_kacheln, fusion, maske, ergebnis,
                             f"{name} ({len(vorschau_kacheln)} EV)")

    zusatz = (f" (Fenstermaske {window.maskenanteil * 100:.1f} %)"
              if window is not None else "")
    protokoll.append((logging.INFO, f"Fertig: {ziel.name}{zusatz}"))
    return ReihenErgebnis(name, ziel, protokoll, True)


def verfuegbarer_arbeitsspeicher() -> int:
    """Freier Arbeitsspeicher in Bytes, ohne zusaetzliche Abhaengigkeit.

    Faellt auf 8 GB zurueck, wenn sich nichts ermitteln laesst.
    """
    if os.name == "nt":
        try:
            import ctypes

            class Speicherstatus(ctypes.Structure):
                _fields_ = [("dwLength", ctypes.c_ulong),
                            ("dwMemoryLoad", ctypes.c_ulong),
                            ("ullTotalPhys", ctypes.c_ulonglong),
                            ("ullAvailPhys", ctypes.c_ulonglong),
                            ("ullTotalPageFile", ctypes.c_ulonglong),
                            ("ullAvailPageFile", ctypes.c_ulonglong),
                            ("ullTotalVirtual", ctypes.c_ulonglong),
                            ("ullAvailVirtual", ctypes.c_ulonglong),
                            ("ullAvailExtendedVirtual", ctypes.c_ulonglong)]

            status = Speicherstatus()
            status.dwLength = ctypes.sizeof(status)
            ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(status))
            if status.ullAvailPhys:
                return int(status.ullAvailPhys)
        except Exception:
            pass
    else:
        try:
            with open("/proc/meminfo", "r", encoding="ascii") as datei:
                for zeile in datei:
                    if zeile.startswith("MemAvailable:"):
                        return int(zeile.split()[1]) * 1024
        except OSError:
            pass
    return 8 * 1024 ** 3


def lies_bildgroesse(pfad: Path) -> tuple[int, int] | None:
    """Bildmasse ermitteln, ohne die Datei vollstaendig zu entwickeln."""
    endung = pfad.suffix.lower()
    try:
        if endung in TIFF_ENDUNGEN:
            with tifffile.TiffFile(str(pfad)) as datei:
                form = datei.pages[0].shape
                return int(form[0]), int(form[1])
        if endung in RAW_ENDUNGEN and rawpy is not None:
            with rawpy.imread(str(pfad)) as roh:
                masse = roh.sizes
                return int(masse.height), int(masse.width)
    except Exception:
        return None
    return None


def schaetze_speicherbedarf(pixel: int, bilder_je_reihe: int) -> int:
    """Geschaetzter Spitzenbedarf einer Reihe in Bytes.

    Die Konstanten stammen aus einer Messung mit 24 Megapixeln und drei
    Belichtungen (3,75 GB Spitze). Der Grundanteil deckt Fusion,
    Fenstermaske und Normalisierung ab, der zweite Term die Einzelbilder.
    """
    return int(pixel * (110 + 15 * max(bilder_je_reihe, 1)))


def waehle_prozessanzahl(gruppen: Sequence[Sequence[Aufnahme]],
                         vorgabe: int) -> tuple[int, str]:
    """Bestimmt die Anzahl paralleler Prozesse.

    Wichtiger Praxispunkt: Eine Reihe mit 24 Megapixeln braucht in der
    Spitze mehrere Gigabyte. Wuerde blind ueber alle Kerne parallelisiert,
    liefe ein Rechner mit 16 GB beim ersten Objekt in den Swap oder ins Aus.
    Deshalb wird der Bedarf vorab geschaetzt und die Prozessanzahl begrenzt.
    """
    kerne = max(1, (os.cpu_count() or 2) - 1)
    if vorgabe > 0:
        return min(vorgabe, max(len(gruppen), 1)), "vorgegeben"

    groesse = None
    for gruppe in gruppen:
        if gruppe:
            groesse = lies_bildgroesse(gruppe[0].pfad)
            if groesse:
                break
    if not groesse:
        return min(2, max(len(gruppen), 1)), "Bildgroesse unbekannt"

    pixel = groesse[0] * groesse[1]
    bilder = max((len(g) for g in gruppen), default=3)
    bedarf = schaetze_speicherbedarf(pixel, bilder)
    frei = verfuegbarer_arbeitsspeicher()
    moeglich = max(1, int(frei * 0.75 / max(bedarf, 1)))
    anzahl = max(1, min(kerne, moeglich, max(len(gruppen), 1)))
    begruendung = (f"{pixel / 1e6:.1f} MP, geschaetzt "
                   f"{bedarf / 1024 ** 3:.1f} GB je Reihe, "
                   f"{frei / 1024 ** 3:.1f} GB frei")
    return anzahl, begruendung


def stelle_determinismus_sicher() -> None:
    """Schaltet OpenCVs interne Parallelisierung ab.

    Die Reduktionsreihenfolge in mehreren Threads ist bei Float nicht
    festgelegt; MergeMertens liefert dadurch zwischen zwei Laeufen
    Abweichungen um rund 3e-7. Das reicht aus, um beim Runden auf 16 Bit
    einzelne Pixel kippen zu lassen - der Output waere nicht mehr bitgleich
    reproduzierbar. Die Parallelisierung passiert stattdessen ueber
    mehrere Prozesse (--jobs), also ueber ganze Belichtungsreihen.
    """
    cv2.setNumThreads(1)
    cv2.setRNGSeed(0)


def gleiche_saettigung_an(bild: np.ndarray, staerke: float, ziel: float,
                          protokoll: list[tuple[int, str]]) -> np.ndarray:
    """Zieht die Gesamtsaettigung anteilig auf den Wert des Vorbilds.

    Standardmaessig AUS. Grundregel dieses Werkzeugs ist, den Look dem Preset
    zu ueberlassen - und gemessen fuegt es keine Saettigung hinzu: Die Quelle
    liegt bei 0.184, das Ergebnis bei 0.157, der kommerzielle Dienst bei
    0.098. Der Dienst entsaettigt also.

    Wer ein Preset benutzt, das auf die Ausgabe dieses Dienstes eingestellt
    ist, bekommt mit unveraendertem Material zu kraeftige Farben. Genau
    dafuer gibt es diesen Schalter. Er senkt die Saettigung rein
    multiplikativ und laesst die Luminanz unangetastet - Farbton und
    Helligkeit bleiben, nur die Farbigkeit geht zurueck.
    """
    def gemessen(feld: np.ndarray) -> float:
        maximum = feld.max(axis=2)
        minimum = feld.min(axis=2)
        return float(np.mean((maximum - minimum) / np.maximum(maximum, 1e-6)))

    if staerke <= 0.0:
        return bild
    ist = gemessen(bild)
    if ist <= ziel or ist <= 1e-6:
        protokoll.append((logging.DEBUG,
                          f"Saettigungsangleich: bereits bei {ist:.3f} - "
                          f"nichts zu tun."))
        return bild

    sollwert = ist - staerke * (ist - ziel)
    lum = berechne_luminanz(bild)[..., None]
    farbe = bild - lum

    # Nachfuehren statt einmal rechnen: Beim Skalieren der Farbkomponente
    # schrumpft auch der Nenner der Saettigung (max), die Kennzahl faellt
    # deshalb nicht proportional zum Faktor. Wenige Schritte genuegen, um den
    # Zielwert genau zu treffen; die Schleife ist fest begrenzt und damit
    # reproduzierbar.
    faktor = sollwert / ist
    ergebnis = bild
    for _ in range(6):
        ergebnis = np.clip(lum + farbe * faktor, 0.0, 1.0)
        aktuell = gemessen(ergebnis)
        if abs(aktuell - sollwert) < 0.002 or aktuell <= 1e-6:
            break
        faktor *= sollwert / aktuell

    protokoll.append((logging.INFO,
                      f"Saettigungsangleich: {ist:.3f} -> "
                      f"{gemessen(ergebnis):.3f} (Faktor {faktor:.2f})"))
    return ergebnis.astype(np.float32)


def schuetze_spitzlichter(bild: np.ndarray, args: argparse.Namespace,
                          protokoll: list[tuple[int, str]]) -> np.ndarray:
    """Faengt die letzten harten Spitzlichter weich ab.

    Der Window Pull begrenzt den Fensterinhalt, aber Spitzlichter im
    Innenraum - eine Leuchtenkuppel, eine Reflexion auf einer Armatur -
    liegen ausserhalb der Fenstermaske und koennen nach dem Anheben auf
    exakt 1.0 laufen. In einem Basisbild, das noch weiterbearbeitet wird,
    sollte nichts hart anstehen: Was auf 1.0 clippt, ist unwiederbringlich.

    Gemessen am kommerziellen Vorbild liegt dessen hellster Punkt bei 0.963,
    nicht bei 1.0 - dort wird ebenfalls abgefangen.

    Gerechnet wird wie bei der Fensterkompression auf dem staerksten Kanal,
    damit sich die Farbe nicht verschiebt. Unterhalb des Knies bleibt alles
    unveraendert; betroffen ist nur der oberste Rand des Tonwertumfangs.
    """
    if args.highlight_ceiling <= 0.0 or args.highlight_ceiling >= 1.0:
        return bild
    knie = max(0.5, args.highlight_ceiling - 0.05)
    fuehrung = bild.max(axis=2)
    betroffen = float((fuehrung > knie).mean())
    if betroffen <= 0.0:
        return bild
    voll = np.ones(bild.shape[:2], dtype=np.float32)
    ergebnis = komprimiere_lichter_in_maske(bild, voll, knie=knie,
                                            obergrenze=args.highlight_ceiling,
                                            rate=3.0)
    protokoll.append((logging.DEBUG,
                      f"Spitzlichter abgefangen: {betroffen * 100:.2f} % der "
                      f"Pixel lagen ueber {knie:.2f}"))
    return np.clip(ergebnis, 0.0, 1.0).astype(np.float32)


def _arbeiter(argumente: tuple) -> ReihenErgebnis:
    """Einstiegspunkt fuer die Prozesspool-Worker (muss importierbar sein)."""
    aufnahmen, ausgabe_ordner, args = argumente
    stelle_determinismus_sicher()
    try:
        return verarbeite_reihe(aufnahmen, ausgabe_ordner, args)
    except Exception as fehler:  # pragma: no cover
        name = aufnahmen[0].pfad.stem if aufnahmen else "?"
        return ReihenErgebnis(name, None,
                              [(logging.ERROR, f"Unerwarteter Fehler: {fehler}")],
                              False)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def baue_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="hdr_merge.py",
        description="Belichtungsreihen zu einem neutralen Basisbild mit "
                    "Window Pull zusammenrechnen (kein kreativer Look).",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    p.add_argument("eingabe", type=Path, help="Ordner mit RAW- oder TIFF-Dateien")
    p.add_argument("ausgabe", type=Path, help="Zielordner fuer die 16-Bit-TIFFs")

    g = p.add_argument_group("Gruppierung")
    g.add_argument("--bracket-size", default="auto",
                   help="'auto' (EXIF + EV-Muster) oder feste Anzahl, z. B. 3")
    g.add_argument("--group-gap", type=float, default=6.0,
                   help="Max. Sekunden zwischen zwei Aufnahmen derselben Reihe")

    a = p.add_argument_group("Ausrichtung")
    a.add_argument("--no-align", action="store_true",
                   help="Ausrichtung ueberspringen (Stativaufnahmen)")

    f = p.add_argument_group("Fusion (Mertens-Gewichte)")
    f.add_argument("--contrast", type=float, default=1.0)
    f.add_argument("--saturation", type=float, default=1.0)
    f.add_argument("--exposure", type=float, default=1.0)

    hd = p.add_argument_group("Strahlungskarte (Standardweg)")
    hd.add_argument("--hdr", choices=["on", "off"], default="on",
                    help="Aus den EV-Werten eine echte Strahlungskarte "
                         "rekonstruieren und lokal tonemappen. `off` faellt "
                         "auf die alte Belichtungsfusion mit Fenstermaske "
                         "zurueck.")
    hd.add_argument("--hdr-compression", type=float, default=0.62,
                    help="Helligkeit des Raums. Ein reiner Belichtungsfaktor "
                         "- er veraendert keine Tonwertverhaeltnisse, der "
                         "Raum bleibt so, wie die Kamera ihn gesehen hat.")
    hd.add_argument("--hdr-knee", type=float, default=0.60,
                    help="Ab welcher Helligkeit die Lichter zurueckgeholt "
                         "werden. Darunter passiert NICHTS - der Raum bleibt "
                         "unangetastet. Tiefer = dichtere Fenster.")
    hd.add_argument("--hdr-detail", type=float, default=1.0,
                    help="Erhalt der Feinzeichnung. 1.0 = unangetastet.")
    hd.add_argument("--hdr-radius", type=float, default=0.02,
                    help="Radius der Trennung von Beleuchtung und Zeichnung, "
                         "als Anteil der Bildbreite.")
    hd.add_argument("--hdr-highlight", type=float, default=0.82,
                    help="Wo die Fenster landen sollen. Die Lichterschulter "
                         "naehert sich diesem Wert an, ohne ihn zu erreichen. "
                         "Hoeher = hellere, blassere Fenster.")

    w = p.add_argument_group("Window Pull (nur bei --hdr off)")
    w.add_argument("--window-strength", type=float, default=1.0,
                   help="Deckkraft des Window Pull (0 = aus)")
    w.add_argument("--window-wb", type=float, default=0.0,
                   help="Lokaler Weissabgleich im Fenster (0 = aus, 1 = voll). "
                        "Standard aus: bei Tageslichtfenstern zerstoert er "
                        "die Himmelsfarbe (siehe README)")
    w.add_argument("--window-threshold", type=float, default=0.90,
                   help="Luminanzschwelle fuer ausgebrannte Bereiche")
    w.add_argument("--window-detail", type=float, default=0.010,
                   help="Mindest-Standardabweichung im Dunkelbild (Struktur)")
    w.add_argument("--window-detail-fraction", type=float, default=0.10,
                   help="Anteil strukturierter Pixel, ab dem eine Flaeche als "
                        "Fenster gilt")
    w.add_argument("--window-min-area", type=float, default=0.001,
                   help="Mindestgroesse einer Maskenkomponente (Bildanteil)")
    w.add_argument("--window-close", type=float, default=0.015,
                   help="Breite des Schliess-Kernels als Anteil der "
                        "Bildbreite (muss breiter sein als eine Sprosse)")
    w.add_argument("--window-range", type=float, default=0.50,
                   help="Mindestbreite des Tonwertbands, das dem "
                        "Fensterinhalt zur Verfuegung steht. Groesser = mehr "
                        "Zeichnung im Fenster")
    w.add_argument("--window-ceiling", type=float, default=0.75,
                   help="Obergrenze, auf die der Fensterinhalt weich "
                        "komprimiert wird (Zeichnung statt Weiss)")
    w.add_argument("--window-rolloff", type=float, default=1.6,
                   help="Steilheit der Lichterkompression im Fenster. "
                        "Kleiner = mehr Zeichnung, dunklerer Himmel")
    w.add_argument("--window-texture", type=float, default=0.9,
                   help="Anteil der Feinzeichnung, der die Lichterkompression "
                        "im Fenster unveraendert ueberlebt (0 = alte, "
                        "flachere Kompression; 1 = volle Wolkenzeichnung)")
    w.add_argument("--window-blur", type=float, default=0.008,
                   help="Guided-Filter-Radius als Anteil der Bildbreite")

    t = p.add_argument_group("Tonale Normalisierung")
    t.add_argument("--base-tone", choices=["on", "off"], default="on",
                   help="'off' liefert die flache Rohfusion")
    t.add_argument("--white-target", type=float, default=0.755)
    t.add_argument("--black-target", type=float, default=0.053)
    t.add_argument("--mid-target", type=float, default=0.587)
    t.add_argument("--mid-mode", choices=["lift", "exact"], default="lift",
                   help="'lift' hellt nur auf, wenn das Bild dunkler als der "
                        "Zielwert ist (weisse Waende bleiben weiss); "
                        "'exact' erzwingt den Zielwert in beide Richtungen")
    t.add_argument("--white-percentile", type=float, default=99.5)
    t.add_argument("--black-percentile", type=float, default=0.2)
    t.add_argument("--shadow-gain", type=float, default=8.0,
                   help="Obergrenze fuer die Aufhellung eines einzelnen "
                        "Pixels. Begrenzt die Rauschverstaerkung in den Tiefen")
    t.add_argument("--tone-contrast", type=float, default=1.0,
                   help="Anteil der am kommerziellen Dienst gemessenen "
                        "Kontrastkennlinie (0 = aus, rein lineare "
                        "Normalisierung; 1 = vollstaendig)")
    t.add_argument("--color-match", type=float, default=0.0,
                   help="Saettigung anteilig an den kommerziellen Dienst "
                        "angleichen (0 = aus, 1 = vollstaendig). Nur sinnvoll, "
                        "wenn das Preset auf dessen Ausgabe eingestellt ist")
    t.add_argument("--color-match-target", type=float, default=0.098,
                   help="Zielsaettigung fuer --color-match (gemessen am "
                        "Vorbild)")
    t.add_argument("--raw-wb", choices=["camera", "auto"], default="camera",
                   help="Weissabgleich der RAW-Entwicklung. 'camera' nimmt die "
                        "Einstellung aus der Kamera, 'auto' berechnet ihn neu "
                        "(neutraler, siehe README)")
    t.add_argument("--highlight-ceiling", type=float, default=0.98,
                   help="Obergrenze fuer Spitzlichter im gesamten Bild "
                        "(0 = aus). Verhindert hartes Clipping")
    t.add_argument("--local-wb", type=float, default=0.9,
                   help="Ortsabhaengiger Weissabgleich gegen Mischlicht "
                        "(0 = aus). Neutralisiert grossflaechige Farbstiche")
    t.add_argument("--local-wb-radius", type=float, default=0.15,
                   help="Radius der oertlichen Lichtfarbschaetzung als Anteil "
                        "der Bildbreite. Kleiner = ortsgenauer, aber "
                        "entfaerbt eher echte Objektfarben")
    t.add_argument("--local-wb-limit", type=float, default=0.35,
                   help="Groesste zulaessige Korrektur je Farbkanal")
    t.add_argument("--wb-strength", type=float, default=0.7,
                   help="Staerke des globalen Weissabgleichs (0 = aus)")

    z = p.add_argument_group("Zeichnung und Schaerfe")
    z.add_argument("--clarity", type=float, default=0.6,
                   help="Lokaler Kontrast. Holt die Zeichnung zurueck, die "
                        "das Aufhellen kostet (0 = aus).")
    z.add_argument("--clarity-radius", type=float, default=0.005,
                   help="Radius des lokalen Kontrasts als Anteil der "
                        "Bildbreite.")
    z.add_argument("--sharpen", type=float, default=0.7,
                   help="Capture Sharpening. Gleicht die Weichheit der "
                        "RAW-Entwicklung aus (0 = aus).")
    z.add_argument("--sharpen-radius", type=float, default=1.0,
                   help="Radius des Schaerfens in PIXELN (nicht als Anteil "
                        "der Bildbreite). Die auszugleichende Unschaerfe "
                        "stammt vom Sensor und ist unabhaengig von der "
                        "Bildgroesse.")

    s = p.add_argument_group("Perspektive")
    s.add_argument("--lens-k1", type=float, default=0.0,
                   help="Fester Verzeichnungskoeffizient. Negativ = tonnen"
                        "foermige Verzeichnung ausgleichen (Weitwinkel). "
                        "Einmal fuer das eigene Objektiv ermitteln")
    s.add_argument("--lens-correct", action="store_true",
                   help="Objektivverzeichnung automatisch aus den Bildkanten "
                        "schaetzen und korrigieren (Standard: aus)")
    s.add_argument("--straighten", action="store_true",
                   help="Stuerzende Linien begradigen (Standard: aus)")
    s.add_argument("--straighten-max-deg", type=float, default=8.0,
                   help="Ueber diesem Wert wird nicht korrigiert, nur gewarnt")

    o = p.add_argument_group("Ausgabe")
    o.add_argument("--preview", action="store_true",
                   help="Zusaetzlich einen JPEG-Kontaktbogen pro Reihe")
    o.add_argument("--compression", choices=["lzw", "none"], default="none",
                   help="'lzw' verkleinert die Datei, benoetigt aber das "
                        "optionale Paket 'imagecodecs'")
    o.add_argument("--skip-existing", action="store_true",
                   help="Reihen ueberspringen, deren Ergebnis schon im "
                        "Zielordner liegt. Fuer Nachzuegler-Aufnahmen: nur "
                        "das Neue wird gerechnet.")
    o.add_argument("--jobs", type=int, default=0,
                   help="Parallele Prozesse (0 = automatisch)")
    o.add_argument("--verbose", action="store_true",
                   help="Ausfuehrliches Protokoll inkl. Zwischenwerte")
    return p


def protokolliere(name: str, eintraege: Iterable[tuple[int, str]]) -> None:
    for stufe, text in eintraege:
        LOG.log(stufe, "[%s] %s", name, text)


def berichte_pruefliste(ergebnisse: Sequence[ReihenErgebnis]) -> None:
    """Nennt am Ende die Reihen, die eine Sichtpruefung verdienen.

    Der eigentliche Zeitfresser bei einem Objekt mit dreissig Reihen ist
    nicht das Rechnen, sondern das Durchsehen. Ohne diese Liste muss der
    Fotograf jedes Ergebnis oeffnen, weil er nicht weiss, welches ein
    Problem hat - die Warnungen sind zwar im Protokoll, stehen dort aber
    zwischen hunderten Zeilen Ablauf.

    Aufgefuehrt wird deshalb am Stueck, was auffiel, und zwar mit dem
    Dateinamen davor. Alles andere kann ungesehen weiterverarbeitet
    werden.
    """
    auffaellig: list[tuple[str, list[str]]] = []
    for ergebnis in ergebnisse:
        gruende = [text for stufe, text in ergebnis.protokoll
                   if stufe >= logging.WARNING]
        if gruende:
            auffaellig.append((ergebnis.name, gruende))

    if not auffaellig:
        if ergebnisse:
            LOG.info("Pruefliste: nichts auffaellig - alle %d Reihen koennen "
                     "ungesehen weiterverarbeitet werden.", len(ergebnisse))
        return

    LOG.info("")
    LOG.info("Pruefliste: %d von %d Reihen bitte ansehen, der Rest ist "
             "unauffaellig.", len(auffaellig), len(ergebnisse))
    for name, gruende in auffaellig:
        LOG.info("  %s", name)
        for grund in gruende:
            LOG.info("      %s", grund)


def main(argv: Sequence[str] | None = None) -> int:
    args = baue_parser().parse_args(argv)

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(levelname)-7s %(message)s",
        stream=sys.stdout,
    )
    stelle_determinismus_sicher()

    if not args.eingabe.is_dir():
        LOG.error("Eingabeordner nicht gefunden: %s", args.eingabe)
        return 2

    aufnahmen = sammle_aufnahmen(args.eingabe)
    if not aufnahmen:
        LOG.error("Keine unterstuetzten Dateien in %s gefunden "
                  "(erwartet: %s)", args.eingabe,
                  ", ".join(sorted(UNTERSTUETZTE_ENDUNGEN)))
        return 2

    gruppen = gruppiere_belichtungsreihen(aufnahmen, args.bracket_size,
                                          args.group_gap)

    # Erkannte Gruppierung vor der Verarbeitung ausgeben.
    LOG.info("%d Dateien, %d Belichtungsreihen erkannt "
             "(--bracket-size %s):", len(aufnahmen), len(gruppen),
             args.bracket_size)
    for i, gruppe in enumerate(gruppen, 1):
        evs = ", ".join(f"{a.ev:.1f}" if a.ev is not None else "?"
                        for a in gruppe)
        LOG.info("  Reihe %02d (%d Bilder): %s   [EV: %s]", i, len(gruppe),
                 ", ".join(a.pfad.name for a in gruppe), evs)
        if len(gruppe) not in ERWARTETE_REIHENLAENGEN:
            LOG.warning("  Reihe %02d hat eine unerwartete Bildanzahl (%d).",
                        i, len(gruppe))

    if args.skip_existing:
        # Ein Objekt hat schnell dreissig Reihen. Wer nach dem Durchlauf
        # noch Aufnahmen nachlegt, soll nicht alles neu rechnen muessen -
        # eine Stunde Wartezeit fuer drei neue Bilder waere absurd.
        vorher = len(gruppen)
        gruppen = [g for g in gruppen
                   if not (args.ausgabe / f"{g[0].pfad.stem}_hdr.tif").exists()]
        uebersprungen = vorher - len(gruppen)
        if uebersprungen:
            LOG.info("%d Reihen uebersprungen, weil das Ergebnis schon im "
                     "Zielordner liegt (--skip-existing).", uebersprungen)
        if not gruppen:
            LOG.info("Alle Reihen sind bereits verarbeitet - nichts zu tun.")
            return 0

    jobs, begruendung = waehle_prozessanzahl(gruppen, args.jobs)
    aufgaben = [(g, args.ausgabe, args) for g in gruppen]

    LOG.info("Verarbeitung startet (%d Prozess(e), %s) ...", jobs, begruendung)
    if jobs <= 1:
        ergebnisse = [_arbeiter(t) for t in aufgaben]
    else:
        # Bewusst 'spawn' statt des unter Linux ueblichen 'fork':
        # Die RAW-Entwicklung nutzt intern OpenMP, und ein geforkter Prozess
        # erbt dessen Threadzustand in einer Weise, die zuverlaessig zu
        # Deadlocks fuehren kann - das Programm bliebe dann einfach stehen.
        # Unter Windows ist 'spawn' ohnehin die einzige Betriebsart; damit
        # verhaelt sich das Werkzeug auf allen Systemen gleich.
        kontext = multiprocessing.get_context("spawn")
        with kontext.Pool(processes=jobs) as pool:
            ergebnisse = pool.map(_arbeiter, aufgaben)

    fehler = 0
    warnungen = 0
    for ergebnis in ergebnisse:
        protokolliere(ergebnis.name, ergebnis.protokoll)
        warnungen += sum(1 for stufe, _ in ergebnis.protokoll
                         if stufe == logging.WARNING)
        if not ergebnis.erfolgreich:
            fehler += 1

    LOG.info("Zusammenfassung: %d/%d Reihen verarbeitet, %d Warnung(en).",
             len(ergebnisse) - fehler, len(ergebnisse), warnungen)
    berichte_pruefliste(ergebnisse)
    return 1 if fehler else 0


if __name__ == "__main__":
    multiprocessing.freeze_support()  # Windows
    sys.exit(main())
