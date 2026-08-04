#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
make_reference_scene.py -- Benchmark-Szene nach dem Fotello-Referenzbild.

Die Szene ist dem Referenzfoto nachempfunden, an dem sich die Qualitaet
messen lassen muss: Dachgeschoss-Kueche mit zwei schraegen Dachfenstern
(blauer Himmel mit Wolken), weissen Waenden und Schraegen, hellen Fronten,
warmem Eichenboden, schwarzen Pendelleuchten und einer Marmorplatte mit
feiner Aderung.

Damit sind genau die Eigenschaften pruefbar, die das kommerzielle Ergebnis
auszeichnen:

  * Der Himmel bleibt **blau** (Saettigung erhalten) statt milchig weiss.
  * Im Himmel bleibt **Wolkenzeichnung** erhalten.
  * Die Waende werden hell und **neutral**, nicht farbstichig.
  * Der **Eichenboden bleibt warm** (der Weissabgleich darf ihn nicht
    neutralisieren).
  * **Schwarz bleibt schwarz** - die Pendelleuchten duerfen nicht ausgrauen.
  * Die feine **Marmoraderung** darf nicht verschluckt werden.
  * Keine Halos an den kontrastreichen Fensterrahmen.

Die Szene wird in linearem Licht gebaut; das Fenster liegt rund 6
Blendenstufen ueber dem Innenraum, wie in der echten Aufnahme.

Aufruf:
    python make_reference_scene.py AUSGABE_ORDNER
"""

from __future__ import annotations

import sys
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import tifffile

from make_test_scene import BELICHTUNGEN, BELICHTUNGSZEITEN, _exif_tags, belichte

BREITE, HOEHE = 1200, 800

# --- Messbereiche, die von den Tests ausgewertet werden ---------------------
# Innenflaechen der beiden Dachfenster (grosszuegig innen liegend)
HIMMEL_LINKS = (250, 150, 430, 330)      # x0, y0, x1, y1
HIMMEL_RECHTS = (600, 210, 720, 320)
WAND_RECHTS = (900, 120, 1130, 300)      # weisse Schraege
BODEN = (980, 640, 1180, 780)            # Eichenboden, muss warm bleiben
PENDELLEUCHTE = (352, 60, 372, 190)      # tiefes Schwarz
MARMOR = (430, 560, 900, 660)            # feine Aderung
FENSTERRAHMEN_KANTE_Y = (170, 320)       # Hoehenband fuer den Halo-Test
FENSTERKANTE_X = 430                     # rechte Kante des linken Fensters

# Lineare Szenenwerte: der Himmel liegt rund 6 Blendenstufen ueber der Wand.
WAND_LINEAR = 0.0105
HIMMEL_LINEAR = 0.68

HIMMEL_FARBE = np.array([0.46, 0.63, 0.88], dtype=np.float32)   # klares Blau
WOLKEN_FARBE = np.array([0.94, 0.96, 1.00], dtype=np.float32)
WAND_FARBE = np.array([1.00, 0.99, 0.97], dtype=np.float32)     # fast neutral
EICHE_FARBE = np.array([1.00, 0.74, 0.47], dtype=np.float32)    # warm
MARMOR_FARBE = np.array([1.00, 0.99, 0.98], dtype=np.float32)


def _glattes_rauschen(rng: np.random.Generator, form: tuple[int, int],
                      skala: int) -> np.ndarray:
    """Deterministisches, glattes Rauschen (Wolken, Verlaeufe)."""
    klein = rng.random((max(form[0] // skala, 2), max(form[1] // skala, 2)))
    y = np.linspace(0, klein.shape[0] - 1, form[0])
    x = np.linspace(0, klein.shape[1] - 1, form[1])
    y0, x0 = np.floor(y).astype(int), np.floor(x).astype(int)
    y1 = np.minimum(y0 + 1, klein.shape[0] - 1)
    x1 = np.minimum(x0 + 1, klein.shape[1] - 1)
    fy, fx = (y - y0)[:, None], (x - x0)[None, :]
    oben = klein[np.ix_(y0, x0)] * (1 - fx) + klein[np.ix_(y0, x1)] * fx
    unten = klein[np.ix_(y1, x0)] * (1 - fx) + klein[np.ix_(y1, x1)] * fx
    return (oben * (1 - fy) + unten * fy).astype(np.float32)


def _polygon_maske(punkte: list[tuple[int, int]]) -> np.ndarray:
    """Fuellt ein Polygon (ohne OpenCV, damit das Skript eigenstaendig ist)."""
    maske = np.zeros((HOEHE, BREITE), dtype=bool)
    punkte = list(punkte)
    n = len(punkte)
    for y in range(HOEHE):
        schnitte = []
        for i in range(n):
            x1, y1 = punkte[i]
            x2, y2 = punkte[(i + 1) % n]
            if (y1 <= y < y2) or (y2 <= y < y1):
                t = (y - y1) / float(y2 - y1)
                schnitte.append(x1 + t * (x2 - x1))
        schnitte.sort()
        for i in range(0, len(schnitte) - 1, 2):
            links = max(int(np.ceil(schnitte[i])), 0)
            rechts = min(int(np.floor(schnitte[i + 1])) + 1, BREITE)
            if rechts > links:
                maske[y, links:rechts] = True
    return maske


def _aussenszene(rng: np.random.Generator) -> np.ndarray:
    """Blauer Himmel mit Wolken - das Motiv, das der Window Pull retten muss."""
    verlauf = np.linspace(0.86, 1.12, HOEHE, dtype=np.float32)[:, None]
    grund = np.repeat(verlauf, BREITE, axis=1)

    wolken = _glattes_rauschen(rng, (HOEHE, BREITE), 40)
    wolken = np.clip((wolken - 0.48) * 3.4, 0.0, 1.0)
    wolken *= _glattes_rauschen(rng, (HOEHE, BREITE), 14) * 1.3
    wolken = np.clip(wolken, 0.0, 1.0)

    himmel = (HIMMEL_FARBE[None, None, :] * grund[..., None] * (1.0 - wolken[..., None])
              + WOLKEN_FARBE[None, None, :] * (grund[..., None] * 1.06) * wolken[..., None])
    # Feine Detailtextur, damit die Strukturpruefung greifen kann
    himmel *= 1.0 + 0.02 * (rng.random(himmel.shape).astype(np.float32) - 0.5)
    return (himmel * HIMMEL_LINEAR).astype(np.float32)


def baue_szene() -> np.ndarray:
    """Baut die lineare RGB-Szene der Referenzumgebung."""
    rng = np.random.default_rng(4711)
    szene = np.zeros((HOEHE, BREITE, 3), dtype=np.float32)

    # --- Waende und Dachschraege -------------------------------------------
    verlauf = np.linspace(1.16, 0.82, HOEHE, dtype=np.float32)[:, None]
    wand = np.repeat(verlauf, BREITE, axis=1)
    wand *= 1.0 + 0.03 * _glattes_rauschen(rng, (HOEHE, BREITE), 90)
    szene[:] = (wand[..., None] * WAND_FARBE * WAND_LINEAR)

    # Dachschraege links etwas dunkler (streifendes Licht)
    yy, xx = np.mgrid[0:HOEHE, 0:BREITE]
    schraege = xx < (120 + yy * 0.55)
    szene[schraege] *= 0.86

    # --- Eichenboden --------------------------------------------------------
    boden = yy > (620 + (xx - BREITE) * 0.06)
    holz = (0.0125 * (1.0 + 0.16 * _glattes_rauschen(rng, (HOEHE, BREITE), 8)))
    dielen = (np.sin(xx * 0.09 + yy * 0.02) > 0.93).astype(np.float32) * 0.18
    szene[boden] = ((holz[boden] * (1.0 - dielen[boden]))[:, None]
                    * EICHE_FARBE)

    # --- Kuechenzeile, Fronten, Marmor --------------------------------------
    def flaeche(x0, y0, x1, y1, linear, farbe):
        szene[y0:y1, x0:x1] = np.float32(linear) * np.array(farbe, np.float32)

    flaeche(760, 250, 980, 700, 0.0150, WAND_FARBE)       # Hochschrank
    flaeche(790, 330, 950, 470, 0.0011, [1.0, 1.0, 1.02])  # schwarzer Backofen
    flaeche(400, 520, 960, 560, 0.0175, MARMOR_FARBE)      # Ruecklehne
    flaeche(380, 560, 980, 680, 0.0205, MARMOR_FARBE)      # Arbeitsplatte

    # Marmoraderung: feine, kontrastarme Struktur, die erhalten bleiben muss
    adern = _glattes_rauschen(rng, (HOEHE, BREITE), 5)
    adern = (np.abs(adern - 0.5) < 0.035).astype(np.float32)
    bereich = np.zeros((HOEHE, BREITE), dtype=bool)
    bereich[560:680, 380:980] = True
    bereich[520:560, 400:960] = True
    szene[bereich] *= (1.0 - 0.22 * adern[bereich])[:, None]

    # --- Dachfenster (schraeg, wie im Referenzbild) --------------------------
    aussen = _aussenszene(rng)

    fenster_links = [(210, 120), (455, 175), (430, 355), (185, 300)]
    fenster_rechts = [(575, 190), (755, 230), (735, 350), (560, 330)]

    for punkte in (fenster_links, fenster_rechts):
        oeffnung = _polygon_maske(punkte)
        # Heller Rahmen (Kunststoff, weiss) rundherum
        rahmen = _polygon_maske([(int(x + (x - sum(p[0] for p in punkte) / 4) * 0.10),
                                  int(y + (y - sum(p[1] for p in punkte) / 4) * 0.10))
                                 for x, y in punkte])
        szene[rahmen] = np.float32(0.0230) * WAND_FARBE
        szene[oeffnung] = aussen[oeffnung]

    # --- Schwarze Pendelleuchten (duerfen nicht ausgrauen) -------------------
    for x0 in (352, 690):
        szene[0:60, x0 + 8:x0 + 11] = 0.0009 * np.array([1, 1, 1], np.float32)
        szene[60:190, x0:x0 + 20] = 0.00055 * np.array([1.0, 1.0, 1.05],
                                                       np.float32)

    # --- Dunkle Kaffeemaschine im Vordergrund -------------------------------
    szene[600:790, 60:260] = 0.0013 * np.array([1.0, 1.0, 1.04], np.float32)

    # Sensorrauschen, klein und deterministisch
    szene *= 1.0 + 0.005 * (rng.random(szene.shape).astype(np.float32) - 0.5)
    return np.maximum(szene, 0.0)


def schreibe_reihe(ziel: Path, name: str = "dach01") -> list[Path]:
    """Schreibt die drei Belichtungen der Referenzszene als 16-Bit-TIFF."""
    ziel.mkdir(parents=True, exist_ok=True)
    szene = baue_szene()
    zeitbasis = datetime(2026, 5, 20, 11, 30, 0)
    pfade = []
    for i, faktor in enumerate(BELICHTUNGEN):
        bild = belichte(szene, faktor)
        pfad = ziel / f"{name}_{i + 1}.tif"
        zeitstempel = (zeitbasis + timedelta(seconds=i)).strftime(
            "%Y:%m:%d %H:%M:%S")
        tifffile.imwrite(str(pfad),
                         np.round(bild * 65535.0).astype(np.uint16),
                         photometric="rgb", compression=None,
                         extratags=_exif_tags(zeitstempel,
                                              BELICHTUNGSZEITEN[i]))
        pfade.append(pfad)
    return pfade


if __name__ == "__main__":
    ordner = Path(sys.argv[1] if len(sys.argv) > 1 else "referenzszene")
    for p in schreibe_reihe(ordner):
        print("geschrieben:", p)
