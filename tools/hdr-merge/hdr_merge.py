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
                                 rate: float = ROLLOFF_RATE) -> np.ndarray:
    """Wendet den Rolloff luminanzbasiert auf den maskierten Bereich an.

    Gerechnet wird auf der Luminanz; die RGB-Kanaele werden anschliessend mit
    demselben Faktor skaliert. Dadurch bleiben Farbton und Saettigung exakt
    erhalten - der Himmel wird heller oder dunkler, aber nicht bunter.
    """
    lum = berechne_luminanz(bild)
    ziel = weicher_rolloff(lum, knie, obergrenze, rate)
    faktor = np.where(lum > 1e-5, ziel / np.maximum(lum, 1e-5), 1.0)
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


def entwickle_raw(pfad: Path) -> np.ndarray:
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
    with rawpy.imread(str(pfad)) as raw:
        rgb = raw.postprocess(
            no_auto_bright=True,
            use_camera_wb=True,
            use_auto_wb=False,
            output_bps=16,
            output_color=rawpy.ColorSpace.sRGB,
            gamma=(2.222, 4.5),          # Standard-sRGB-Kurve, keine Kreativkurve
            demosaic_algorithm=rawpy.DemosaicAlgorithm.AHD,
            half_size=False,
            user_flip=None,              # Kamera-Orientierung uebernehmen
            highlight_mode=rawpy.HighlightMode.Clip,
            median_filter_passes=0,
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


def lade_bild(pfad: Path) -> np.ndarray:
    """Laedt RAW oder TIFF als RGB-Float32 im Bereich 0..1."""
    endung = pfad.suffix.lower()
    if endung in RAW_ENDUNGEN:
        return entwickle_raw(pfad)
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
    richtung = 0  # +1 = EV steigt (wird dunkler), -1 = EV faellt

    for a in aufnahmen:
        if not aktuell:
            aktuell = [a]
            richtung = 0
            continue

        vorher = aktuell[-1]
        neue_reihe = False

        if a.zeit - vorher.zeit > max_luecke:
            neue_reihe = True
        elif a.ev is not None and vorher.ev is not None:
            delta = a.ev - vorher.ev
            if abs(delta) < 1e-6:
                # Gleiche Belichtung zweimal -> das ist keine Fortsetzung.
                neue_reihe = True
            else:
                schritt = 1 if delta > 0 else -1
                if richtung == 0:
                    richtung = schritt
                elif schritt != richtung:
                    neue_reihe = True  # EV-Muster springt zurueck

        if neue_reihe:
            gruppen.append(aktuell)
            aktuell = [a]
            richtung = 0
        else:
            aktuell.append(a)

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
    ausgerichtet: list[np.ndarray] = []
    kriterien = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6)

    for i, bild in enumerate(bilder):
        if i == referenz_index:
            ausgerichtet.append(bild)
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
            ausgerichtet.append(bild)
            continue

        # Translationsanteil auf volle Aufloesung hochskalieren.
        warp_voll = warp.copy()
        warp_voll[0, 2] *= 4.0
        warp_voll[1, 2] *= 4.0
        ausgerichtet.append(
            cv2.warpAffine(bild, warp_voll, (w, h),
                           flags=cv2.INTER_LINEAR + cv2.WARP_INVERSE_MAP,
                           borderMode=cv2.BORDER_REPLICATE)
        )
    return ausgerichtet


# ---------------------------------------------------------------------------
# Fusion
# ---------------------------------------------------------------------------


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
    ergebnis = merger.process([(b * 255.0).astype(np.float32) for b in bilder])
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
    fuehrung = berechne_luminanz(fusion)
    radius = max(2, int(round(w * blur_anteil)))
    weich = guided_filter(fuehrung, maske.astype(np.float32), radius, 1e-4)
    weich = np.clip(weich, 0.0, 1.0).astype(np.float32)

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

    fenster = setze_fensterinhalt(fenster_roh, ring_luminanz,
                                  args.window_ceiling, args.window_rolloff)

    alpha = (maske_weich * float(args.window_strength))[..., None]
    ergebnis = np.clip(fusion * (1.0 - alpha) + fenster * alpha, 0.0, 1.0)
    return WindowPullErgebnis(ergebnis.astype(np.float32), maske_weich,
                              maske_binaer, anteil, fenster_roh, ring,
                              ring_luminanz)


def setze_fensterinhalt(fenster_roh: np.ndarray, knie_luminanz: float,
                        obergrenze: float, rate: float) -> np.ndarray:
    """Bringt den angeglichenen Fensterinhalt in den darstellbaren Bereich.

    Die Angleichung am Rahmen setzt den Fensterrahmen richtig, hebt den
    Himmel dabei aber weit ueber 1.0. Statt hart zu clippen (Zeichnung waere
    weg) wird oberhalb der Rahmenhelligkeit weich komprimiert; unterhalb des
    Knies bleibt alles unveraendert.
    """
    knie = float(np.clip(knie_luminanz, 0.15, obergrenze - 0.05))
    voll = np.ones(fenster_roh.shape[:2], dtype=np.float32)
    fenster = komprimiere_lichter_in_maske(fenster_roh, voll, knie=knie,
                                           obergrenze=obergrenze, rate=rate)
    return np.clip(fenster, 0.0, 1.0).astype(np.float32)


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


def normalisiere_tonwert(bild: np.ndarray, window: WindowPullErgebnis,
                         args: argparse.Namespace,
                         protokoll: list[tuple[int, str]]) -> np.ndarray:
    """Deterministische tonale Normalisierung auf feste Zielwerte.

    Keine Motiverkennung, keine Stimmungsheuristik: jedes Bild bekommt
    dieselben Zielwerte, damit ein bestehendes Lightroom-Preset unveraendert
    greift. Reihenfolge: Weiss-/Schwarzpunkt (linear), Mittelton (nur Gamma),
    globaler Weissabgleich, Highlight-Schutz.
    """
    fenstermaske_binaer = window.maske_binaer
    innen = ~fenstermaske_binaer.astype(bool)
    if innen.sum() < 0.02 * innen.size:
        protokoll.append((logging.WARNING,
                          "Zu wenig Innenraumflaeche fuer die Normalisierung - "
                          "es wird das gesamte Bild als Bezug verwendet."))
        innen = np.ones_like(innen)

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
    weiss = float(np.percentile(lum_innen, args.white_percentile))
    schwarz = float(np.percentile(lum_innen, args.black_percentile))
    if weiss - schwarz < 1e-4:
        protokoll.append((logging.WARNING,
                          "Innenraum hat praktisch keinen Tonwertumfang - "
                          "Weiss-/Schwarzpunkt-Verankerung uebersprungen."))
        ergebnis = bild.astype(np.float32)
    else:
        normiert = (bild - schwarz) / (weiss - schwarz)
        protokoll.append((logging.DEBUG,
                          f"Weisspunkt {weiss:.3f} -> {args.white_target:.2f}, "
                          f"Schwarzpunkt {schwarz:.3f} -> "
                          f"{args.black_target:.2f}"))

        # Gamma so waehlen, dass der Innenraum-Median auf dem Zielwert landet.
        median_norm = float(np.median(
            berechne_luminanz(np.clip(normiert, 0.0, 1.0))[innen]))
        spanne = max(args.white_target - args.black_target, 1e-4)
        ziel_norm = float(np.clip((args.mid_target - args.black_target) / spanne,
                                  1e-3, 0.999))
        if 1e-3 < median_norm < 0.999:
            gamma = float(np.clip(math.log(ziel_norm) / math.log(median_norm),
                                  0.3, 3.0))
            protokoll.append((logging.DEBUG,
                              f"Mittelton {median_norm:.3f} -> "
                              f"{ziel_norm:.3f} (Gamma {gamma:.3f})"))
        else:
            gamma = 1.0
            protokoll.append((logging.WARNING,
                              f"Mittelton-Median ({median_norm:.3f}) liegt "
                              f"ausserhalb des sinnvollen Bereichs - "
                              f"Gamma-Korrektur uebersprungen."))

        positiv = np.maximum(normiert, 0.0)
        ergebnis = (args.black_target
                    + spanne * np.power(positiv, gamma, dtype=np.float32))

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

    # 5. Highlight-Schutz im Fensterbereich.
    fenster_bool = fenstermaske_binaer.astype(bool)
    if fenster_bool.sum() > 100:
        std_vorher = float(np.std(berechne_luminanz(bild)[fenster_bool]))
        std_nachher = float(np.std(
            berechne_luminanz(np.clip(ergebnis, 0.0, 1.0))[fenster_bool]))
        if std_nachher < std_vorher * 0.98:
            # Regelfall: Das Anheben des Innenraums drueckt den Fensterinhalt
            # nach oben. Der Fensterbereich wird deshalb neu aufgebaut.
            protokoll.append((logging.DEBUG,
                              f"Fensterzeichnung faellt durch die Anhebung ab "
                              f"(Streuung {std_vorher:.4f} -> "
                              f"{std_nachher:.4f}) - Rolloff wird angewendet."))
            ergebnis = nimm_fenster_zurueck(ergebnis, window, args, protokoll)
            std_final = float(np.std(
                berechne_luminanz(np.clip(ergebnis, 0.0, 1.0))[fenster_bool]))
            # Gewarnt wird nur, wenn die Rolloff-Kurve die Zeichnung NICHT
            # retten konnte - sonst waere die Warnung bei jedem Bild da und
            # damit wertlos. Ein gewisser Rueckgang ist unvermeidbar: wird
            # der Innenraum angehoben, steigt das Knie und der verbleibende
            # Spielraum bis zur Obergrenze wird kleiner.
            if std_final < std_vorher * 0.5 or std_final < 0.01:
                protokoll.append((logging.WARNING,
                                  f"Fensterzeichnung bleibt nach dem Rolloff "
                                  f"deutlich unter dem Ausgangswert "
                                  f"(Streuung {std_vorher:.4f} -> "
                                  f"{std_final:.4f}). Der Innenraum-Zielwert "
                                  f"(--mid-target) ist fuer diese Szene "
                                  f"vermutlich zu hoch."))
            else:
                protokoll.append((logging.DEBUG,
                                  f"Streuung im Fenster nach Rolloff: "
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
    fenster = setze_fensterinhalt(window.fenster_roh * skalierung, ring_neu,
                                  args.window_ceiling, args.window_rolloff)
    protokoll.append((logging.DEBUG,
                      f"Fenster neu aufgebaut (Rahmenluminanz "
                      f"{window.ring_luminanz:.3f} -> {ring_neu:.3f}, "
                      f"Skalierung {skalierung:.2f})"))

    alpha = (window.maske_weich * float(args.window_strength))[..., None]
    return (bild * (1.0 - alpha) + fenster * alpha).astype(np.float32)


# ---------------------------------------------------------------------------
# Perspektivkorrektur (optional)
# ---------------------------------------------------------------------------


def _schaetze_vertikalen_fluchtpunkt(bild: np.ndarray) -> tuple[float, float] | None:
    """Schaetzt den vertikalen Fluchtpunkt ueber die Hough-Transformation."""
    h, w = bild.shape[:2]
    grau = np.clip(berechne_luminanz(bild) * 255.0, 0, 255).astype(np.uint8)
    kanten = cv2.Canny(grau, 60, 160, apertureSize=3)
    min_laenge = max(40, int(h * 0.12))
    linien = cv2.HoughLinesP(kanten, 1, np.pi / 360.0, threshold=80,
                             minLineLength=min_laenge, maxLineGap=int(h * 0.02))
    if linien is None or len(linien) == 0:
        return None
    # OpenCV 4 liefert (N, 1, 4), OpenCV 5 liefert (N, 4).
    linien = np.asarray(linien).reshape(-1, 4)

    # Nur Linien nahe der Senkrechten (< 30 Grad Abweichung) verwenden.
    gesammelt = []
    for x1, y1, x2, y2 in linien:
        dx, dy = float(x2 - x1), float(y2 - y1)
        if abs(dy) < 1e-6:
            continue
        winkel = abs(math.degrees(math.atan2(dx, dy)))
        winkel = min(winkel, 180.0 - winkel)
        if winkel > 30.0:
            continue
        # Linie in homogenen Koordinaten, zentriert auf die Bildmitte.
        p1 = np.array([x1 - w / 2.0, y1 - h / 2.0, 1.0])
        p2 = np.array([x2 - w / 2.0, y2 - h / 2.0, 1.0])
        linie = np.cross(p1, p2)
        norm = np.linalg.norm(linie[:2])
        if norm < 1e-9:
            continue
        gesammelt.append(linie / norm)

    if len(gesammelt) < 6:
        return None

    # Fluchtpunkt = Punkt mit minimalem Abstand zu allen Linien (SVD).
    matrix = np.array(gesammelt, dtype=np.float64)
    _, _, vt = np.linalg.svd(matrix)
    punkt = vt[-1]
    if abs(punkt[2]) < 1e-9:
        return None
    return float(punkt[0] / punkt[2]), float(punkt[1] / punkt[2])


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


def begradige_perspektive(bild: np.ndarray, max_grad: float,
                          protokoll: list[tuple[int, str]]) -> np.ndarray:
    """Richtet stuerzende Linien auf und beschneidet auf gueltigen Bereich.

    Sicherheitsregel: Nur ausfuehren, wenn die noetige Korrektur unter dem
    Schwellwert bleibt. Starke Korrekturen zerstoeren bei Dachschraegen und
    Mansarden mehr, als sie retten.
    """
    h, w = bild.shape[:2]
    fluchtpunkt = _schaetze_vertikalen_fluchtpunkt(bild)
    if fluchtpunkt is None:
        protokoll.append((logging.WARNING,
                          "Perspektivkorrektur: kein stabiler Fluchtpunkt "
                          "gefunden - Bild bleibt unveraendert."))
        return bild

    _, vy = fluchtpunkt
    if abs(vy) < h * 0.75:
        protokoll.append((logging.WARNING,
                          "Perspektivkorrektur: Fluchtpunkt liegt zu nah am "
                          "Bild (unplausibel) - Bild bleibt unveraendert."))
        return bild

    # Naeherung der Kameraneigung ueber eine angenommene Brennweite von 1.0*Breite.
    brennweite = float(w)
    neigung = abs(math.degrees(math.atan(brennweite / vy)))
    if neigung > max_grad:
        protokoll.append((logging.WARNING,
                          f"Perspektivkorrektur: noetige Korrektur "
                          f"{neigung:.1f} Grad ueberschreitet den Schwellwert "
                          f"von {max_grad:.1f} Grad - Bild bleibt unveraendert."))
        return bild
    if neigung < 0.15:
        protokoll.append((logging.DEBUG,
                          "Perspektivkorrektur: Abweichung vernachlaessigbar."))
        return bild

    # Homographie in zentrierten Koordinaten: der Fluchtpunkt wandert ins
    # Unendliche, senkrechte Linien werden dadurch parallel.
    zentrieren = np.array([[1, 0, -w / 2.0], [0, 1, -h / 2.0], [0, 0, 1]],
                          dtype=np.float64)
    keystone = np.array([[1.0, 0.0, 0.0],
                         [0.0, 1.0, 0.0],
                         [0.0, -1.0 / vy, 1.0]], dtype=np.float64)
    zurueck = np.array([[1, 0, w / 2.0], [0, 1, h / 2.0], [0, 0, 1]],
                       dtype=np.float64)
    homographie = zurueck @ keystone @ zentrieren

    korrigiert = cv2.warpPerspective(bild, homographie, (w, h),
                                     flags=cv2.INTER_LINEAR,
                                     borderMode=cv2.BORDER_CONSTANT,
                                     borderValue=(0, 0, 0))

    # Groessten gueltigen Rechteckausschnitt bestimmen (auf verkleinerter
    # Maske, aus Geschwindigkeitsgruenden) und beschneiden.
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
    protokoll.append((logging.INFO,
                      f"Perspektivkorrektur angewendet ({neigung:.1f} Grad), "
                      f"Ausschnitt {x1 - x0}x{y1 - y0} px."))
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


def erzeuge_kontaktbogen(pfad: Path, einzelbilder: Sequence[np.ndarray],
                         fusion: np.ndarray, maske: np.ndarray,
                         ergebnis: np.ndarray, titel: str) -> None:
    """Schreibt einen JPEG-Kontaktbogen zur schnellen Sichtpruefung.

    Reihenfolge: Einzelbelichtungen | Maskenueberlagerung | Ergebnis.
    """
    ziel_breite = 420

    def thumb(bild: np.ndarray) -> np.ndarray:
        h, w = bild.shape[:2]
        neue_hoehe = max(1, int(round(h * ziel_breite / w)))
        klein = cv2.resize(bild, (ziel_breite, neue_hoehe),
                           interpolation=cv2.INTER_AREA)
        return np.clip(klein * 255.0, 0, 255).astype(np.uint8)

    kacheln = [thumb(b) for b in einzelbilder]

    # Maskenueberlagerung: Fensterbereich rot markiert.
    ueberlagerung = fusion.copy()
    alpha = np.clip(maske, 0.0, 1.0)[..., None]
    rot = np.zeros_like(fusion)
    rot[..., 0] = 1.0
    ueberlagerung = ueberlagerung * (1.0 - 0.45 * alpha) + rot * (0.45 * alpha)
    kacheln.append(thumb(ueberlagerung))
    kacheln.append(thumb(ergebnis))

    hoehe = max(k.shape[0] for k in kacheln)
    beschriftungen = ([f"EV {i + 1}" for i in range(len(einzelbilder))]
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
        bilder = [lade_bild(a.pfad) for a in aufnahmen]
    except Exception as fehler:  # pragma: no cover - Dateisystem/Format
        protokoll.append((logging.ERROR, f"Laden fehlgeschlagen: {fehler}"))
        return ReihenErgebnis(name, None, protokoll, False)

    formen = {b.shape for b in bilder}
    if len(formen) != 1:
        protokoll.append((logging.ERROR,
                          f"Bilder der Reihe haben unterschiedliche Groessen "
                          f"({formen}) - uebersprungen."))
        return ReihenErgebnis(name, None, protokoll, False)

    # Reihenfolge nach tatsaechlicher Bildhelligkeit festlegen (unabhaengig
    # von der Dateireihenfolge): dunkelste zuerst.
    helligkeiten = [float(berechne_luminanz(b).mean()) for b in bilder]
    reihenfolge = sorted(range(len(bilder)), key=lambda i: helligkeiten[i])
    bilder = [bilder[i] for i in reihenfolge]
    sortierte_aufnahmen = [aufnahmen[i] for i in reihenfolge]

    referenz_index = len(bilder) // 2  # mittlere Belichtung

    if not args.no_align:
        bilder = richte_reihe_aus(bilder, referenz_index, protokoll)

    fusion = fusioniere_mertens(bilder, args.contrast, args.saturation,
                                args.exposure)

    window = fuehre_window_pull_aus(fusion, bilder[referenz_index], bilder[0],
                                    args, protokoll)
    ergebnis = window.bild

    if args.base_tone == "on":
        ergebnis = normalisiere_tonwert(ergebnis, window, args, protokoll)
    else:
        protokoll.append((logging.INFO,
                          "Tonale Normalisierung deaktiviert (--base-tone off) "
                          "- Ausgabe ist die flache Rohfusion."))

    if args.straighten:
        ergebnis = begradige_perspektive(ergebnis, args.straighten_max_deg,
                                         protokoll)

    ausgabe_ordner.mkdir(parents=True, exist_ok=True)
    ziel = ausgabe_ordner / f"{name}_hdr.tif"
    referenz_tags = sortierte_aufnahmen[referenz_index].tags
    speichere_tiff(ziel, ergebnis, referenz_tags, args.compression, protokoll)

    if args.preview:
        erzeuge_kontaktbogen(ausgabe_ordner / f"{name}_preview.jpg", bilder,
                             fusion, window.maske_weich, ergebnis,
                             f"{name} ({len(bilder)} EV)")

    protokoll.append((logging.INFO,
                      f"Fertig: {ziel.name} "
                      f"(Fenstermaske {window.maskenanteil * 100:.1f} %)"))
    return ReihenErgebnis(name, ziel, protokoll, True)


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

    w = p.add_argument_group("Window Pull")
    w.add_argument("--window-strength", type=float, default=0.8,
                   help="Deckkraft des Window Pull (0 = aus)")
    w.add_argument("--window-wb", type=float, default=0.5,
                   help="Lokaler Weissabgleich im Fenster (0 = aus, 1 = voll)")
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
    w.add_argument("--window-ceiling", type=float, default=0.92,
                   help="Obergrenze, auf die der Fensterinhalt weich "
                        "komprimiert wird (Zeichnung statt Weiss)")
    w.add_argument("--window-rolloff", type=float, default=ROLLOFF_RATE,
                   help="Steilheit der Lichterkompression im Fenster. "
                        "Kleiner = mehr Zeichnung, dunklerer Himmel")
    w.add_argument("--window-blur", type=float, default=0.02,
                   help="Guided-Filter-Radius als Anteil der Bildbreite")

    t = p.add_argument_group("Tonale Normalisierung")
    t.add_argument("--base-tone", choices=["on", "off"], default="on",
                   help="'off' liefert die flache Rohfusion")
    t.add_argument("--white-target", type=float, default=0.95)
    t.add_argument("--black-target", type=float, default=0.02)
    t.add_argument("--mid-target", type=float, default=0.55)
    t.add_argument("--white-percentile", type=float, default=99.5)
    t.add_argument("--black-percentile", type=float, default=0.2)
    t.add_argument("--wb-strength", type=float, default=0.7,
                   help="Staerke des globalen Weissabgleichs (0 = aus)")

    s = p.add_argument_group("Perspektive")
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
    o.add_argument("--jobs", type=int, default=0,
                   help="Parallele Prozesse (0 = automatisch)")
    o.add_argument("--verbose", action="store_true",
                   help="Ausfuehrliches Protokoll inkl. Zwischenwerte")
    return p


def protokolliere(name: str, eintraege: Iterable[tuple[int, str]]) -> None:
    for stufe, text in eintraege:
        LOG.log(stufe, "[%s] %s", name, text)


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

    jobs = args.jobs if args.jobs > 0 else max(1, (os.cpu_count() or 2) - 1)
    jobs = min(jobs, len(gruppen))
    aufgaben = [(g, args.ausgabe, args) for g in gruppen]

    LOG.info("Verarbeitung startet (%d Prozess(e)) ...", jobs)
    if jobs <= 1:
        ergebnisse = [_arbeiter(t) for t in aufgaben]
    else:
        with multiprocessing.Pool(processes=jobs) as pool:
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
    return 1 if fehler else 0


if __name__ == "__main__":
    multiprocessing.freeze_support()  # Windows
    sys.exit(main())
