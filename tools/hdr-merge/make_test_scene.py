#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
make_test_scene.py -- erzeugt eine synthetische Innenraum-Belichtungsreihe.

Die Szene wird in linearem Licht aufgebaut und anschliessend zu drei
Belichtungen simuliert (Skalierung + Clipping + sRGB-Gamma). Sie enthaelt
bewusst auch Fallen, an denen sich die Fenstererkennung messen lassen muss:

  * ein Fenster mit strukturierter Aussenszene, linear rund 6 Blendenstufen
    heller als der Innenraum,
  * Fenstersprossen (duerfen die Maske nicht zerreissen),
  * eine Deckenleuchte: ausgebrannt, aber ohne Struktur im Dunkelbild,
  * eine weisse Wandflaeche: ebenfalls ausgebrannt, ohne Struktur,
  * ein kleines Glanzlicht auf einer Armatur: ausgebrannt UND strukturiert,
    aber zu klein - muss vom Groessenfilter verworfen werden.

Aufruf:
    python make_test_scene.py AUSGABE_ORDNER
"""

from __future__ import annotations

import sys
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import tifffile

BREITE, HOEHE = 900, 600

# Bildbereiche als (x0, y0, x1, y1) - werden auch von den Tests verwendet.
FENSTER = (520, 120, 830, 400)
SPROSSE_SENKRECHT = (668, 120, 680, 400)
SPROSSE_WAAGERECHT = (520, 252, 830, 264)
DECKENLEUCHTE = (150, 40, 260, 110)
WEISSE_WAND = (300, 380, 420, 500)
GLANZLICHT = (120, 430, 140, 450)

# Belichtungsstufen der simulierten Reihe (3 Blendenstufen Abstand).
BELICHTUNGEN = (1.0, 8.0, 64.0)

# Lichtfarben: Innenraum warm (Kunstlicht), Aussenszene kuehl (Tageslicht).
INNEN_FARBE = np.array([1.28, 1.00, 0.62], dtype=np.float32)
AUSSEN_FARBE = np.array([0.82, 0.95, 1.30], dtype=np.float32)


def _glattes_rauschen(rng: np.random.Generator, form: tuple[int, int],
                      skala: int) -> np.ndarray:
    """Deterministisches, glattes Rauschen (grobe Wolken-/Fleckenstruktur)."""
    klein = rng.random((max(form[0] // skala, 2), max(form[1] // skala, 2)))
    # Bilineare Vergroesserung ohne OpenCV-Abhaengigkeit.
    y = np.linspace(0, klein.shape[0] - 1, form[0])
    x = np.linspace(0, klein.shape[1] - 1, form[1])
    y0 = np.floor(y).astype(int)
    x0 = np.floor(x).astype(int)
    y1 = np.minimum(y0 + 1, klein.shape[0] - 1)
    x1 = np.minimum(x0 + 1, klein.shape[1] - 1)
    fy = (y - y0)[:, None]
    fx = (x - x0)[None, :]
    oben = klein[np.ix_(y0, x0)] * (1 - fx) + klein[np.ix_(y0, x1)] * fx
    unten = klein[np.ix_(y1, x0)] * (1 - fx) + klein[np.ix_(y1, x1)] * fx
    return (oben * (1 - fy) + unten * fy).astype(np.float32)


def baue_szene() -> np.ndarray:
    """Baut die lineare RGB-Szene (Werte sind Szenenluminanz, nicht 0..1)."""
    rng = np.random.default_rng(20240517)
    szene = np.zeros((HOEHE, BREITE, 3), dtype=np.float32)

    # --- Innenraum: Wand mit sanftem Helligkeitsverlauf ---------------------
    verlauf = np.linspace(0.011, 0.0055, HOEHE, dtype=np.float32)[:, None]
    wand = np.repeat(verlauf, BREITE, axis=1)
    wand *= 1.0 + 0.05 * _glattes_rauschen(rng, (HOEHE, BREITE), 60)
    szene[:] = wand[..., None] * INNEN_FARBE

    # --- Boden --------------------------------------------------------------
    boden_start = int(HOEHE * 0.76)
    szene[boden_start:] = (0.0042 * np.array([1.35, 1.0, 0.55], dtype=np.float32))
    szene[boden_start:] *= (1.0 + 0.08 * _glattes_rauschen(
        rng, (HOEHE - boden_start, BREITE), 25))[..., None]

    # --- Moebel als einfache Rechtecke ---------------------------------------
    def rechteck(x0, y0, x1, y1, linear, farbe):
        szene[y0:y1, x0:x1] = np.array(linear, dtype=np.float32) * np.array(
            farbe, dtype=np.float32)

    rechteck(60, 300, 300, 470, 0.0075, [1.30, 1.00, 0.70])   # helles Sofa
    rechteck(330, 330, 470, 400, 0.0030, [1.10, 1.00, 0.85])  # dunkler Tisch
    rechteck(760, 400, 890, 520, 0.0060, [1.35, 1.00, 0.60])  # Sideboard

    # Weisse Wandflaeche: brennt in der mittleren Belichtung aus, hat aber
    # keine Struktur im Dunkelbild -> darf NICHT als Fenster gelten.
    x0, y0, x1, y1 = WEISSE_WAND
    rechteck(x0, y0, x1, y1, 0.145, [1.05, 1.00, 0.95])

    # Deckenleuchte: dito, ausgebrannt und strukturlos.
    x0, y0, x1, y1 = DECKENLEUCHTE
    rechteck(x0, y0, x1, y1, 0.190, [1.20, 1.00, 0.80])

    # --- Fenster: strukturierte Aussenszene ---------------------------------
    fx0, fy0, fx1, fy1 = FENSTER
    fh, fw = fy1 - fy0, fx1 - fx0
    aussen = np.zeros((fh, fw), dtype=np.float32)

    # Himmel mit Verlauf und Wolken
    himmel = np.linspace(0.62, 0.34, fh, dtype=np.float32)[:, None]
    himmel = np.repeat(himmel, fw, axis=1)
    himmel += 0.09 * _glattes_rauschen(rng, (fh, fw), 18)
    aussen[:] = himmel

    # Horizont mit Haeuserzeile
    horizont = int(fh * 0.58)
    aussen[horizont:] = 0.30
    for i in range(6):
        hx0 = int(i * fw / 6.0) + 3
        hx1 = int((i + 1) * fw / 6.0) - 3
        hoehe = int(fh * (0.10 + 0.055 * ((i * 7) % 5)))
        aussen[horizont - hoehe:horizont, hx0:hx1] = 0.20 + 0.03 * (i % 3)
        # Fensterreihen in den Haeusern (feine, harte Struktur)
        for yy in range(horizont - hoehe + 4, horizont - 3, 7):
            aussen[yy:yy + 3, hx0 + 3:hx1 - 3:6] = 0.42

    # Baum als weiche Blobstruktur
    yy, xx = np.mgrid[0:fh, 0:fw]
    baum = ((xx - fw * 0.18) ** 2 / (fw * 0.13) ** 2
            + (yy - fh * 0.52) ** 2 / (fh * 0.22) ** 2) < 1.0
    aussen[baum] = 0.16 + 0.10 * _glattes_rauschen(rng, (fh, fw), 6)[baum]

    # Boden vor dem Fenster
    aussen[int(fh * 0.86):] = 0.24

    # Feine Detailtextur ueber die gesamte Aussenszene
    aussen *= 1.0 + 0.06 * (rng.random((fh, fw)).astype(np.float32) - 0.5)

    szene[fy0:fy1, fx0:fx1] = aussen[..., None] * AUSSEN_FARBE

    # Fenstersprossen: deutlich dunkler, brennen nicht aus -> Loecher in der
    # Maske, die vom Loecherfuellen geschlossen werden muessen.
    sx0, sy0, sx1, sy1 = SPROSSE_SENKRECHT
    szene[sy0:sy1, sx0:sx1] = 0.030 * INNEN_FARBE
    sx0, sy0, sx1, sy1 = SPROSSE_WAAGERECHT
    szene[sy0:sy1, sx0:sx1] = 0.030 * INNEN_FARBE

    # Fensterrahmen aussen herum
    rahmen = 10
    szene[fy0 - rahmen:fy0, fx0 - rahmen:fx1 + rahmen] = 0.026 * INNEN_FARBE
    szene[fy1:fy1 + rahmen, fx0 - rahmen:fx1 + rahmen] = 0.026 * INNEN_FARBE
    szene[fy0 - rahmen:fy1 + rahmen, fx0 - rahmen:fx0] = 0.026 * INNEN_FARBE
    szene[fy0 - rahmen:fy1 + rahmen, fx1:fx1 + rahmen] = 0.026 * INNEN_FARBE

    # --- Kleines Glanzlicht auf einer Armatur --------------------------------
    # Ausgebrannt UND strukturiert, aber weit unter 0,1 % der Bildflaeche.
    gx0, gy0, gx1, gy1 = GLANZLICHT
    glanz = 0.50 * (1.0 + 0.5 * (rng.random((gy1 - gy0, gx1 - gx0))
                                 .astype(np.float32) - 0.5))
    szene[gy0:gy1, gx0:gx1] = glanz[..., None] * INNEN_FARBE

    # Sensorrauschen (klein, deterministisch)
    szene *= 1.0 + 0.004 * (rng.random(szene.shape).astype(np.float32) - 0.5)
    return np.maximum(szene, 0.0)


def belichte(szene: np.ndarray, faktor: float) -> np.ndarray:
    """Simuliert eine Aufnahme: Skalierung, Clipping, sRGB-Gamma."""
    linear = np.clip(szene * faktor, 0.0, 1.0)
    return np.power(linear, 1.0 / 2.2, dtype=np.float32)


# Belichtungszeiten passend zu BELICHTUNGEN (jeweils 3 Blendenstufen).
BELICHTUNGSZEITEN = ((1, 500), (1, 60), (1, 8))


def _exif_tags(zeitstempel: str, belichtungszeit: tuple[int, int]) -> list:
    """EXIF-Tags fuer die Gruppierungstests.

    Die Aufnahmeparameter werden bewusst direkt in IFD0 abgelegt - der
    Minimal-Parser in hdr_merge liest IFD0 und das Exif-Unter-IFD, und
    tifffile kann kein verschachteltes Exif-IFD schreiben.
    """
    return [
        (306, "s", 0, zeitstempel, True),           # DateTime
        (36867, "s", 0, zeitstempel, True),         # DateTimeOriginal
        (33434, "2I", 1, belichtungszeit, True),    # ExposureTime
        (33437, "2I", 1, (8, 1), True),             # FNumber f/8
        (34855, "H", 1, 100, True),                 # ISO
        (271, "s", 0, "Testkamera", True),          # Make
        (272, "s", 0, "Synthetik 1", True),         # Model
    ]


# Verwacklung je Einzelbelichtung (Zeile, Spalte) fuer Freihandaufnahmen.
WACKELN = ((0, 0), (4, -6), (-3, 5))


def schreibe_reihe(ziel: Path, name: str = "raum01",
                   zeitbasis: datetime | None = None,
                   versatz: tuple[int, int] = (0, 0),
                   freihand: bool = False) -> list[Path]:
    """Schreibt die drei Belichtungen einer Reihe als 16-Bit-TIFF.

    ``versatz`` verschiebt die gesamte Reihe (unterschiedliche Raeume),
    ``freihand`` verschiebt jede Einzelbelichtung fuer sich - damit laesst
    sich die Ausrichtung testen.
    """
    ziel.mkdir(parents=True, exist_ok=True)
    zeitbasis = zeitbasis or datetime(2026, 3, 14, 10, 0, 0)
    szene = baue_szene()
    if versatz != (0, 0):
        szene = np.roll(szene, versatz, axis=(0, 1))

    pfade = []
    for i, faktor in enumerate(BELICHTUNGEN):
        einzel = np.roll(szene, WACKELN[i], axis=(0, 1)) if freihand else szene
        bild = belichte(einzel, faktor)
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


def schreibe_objekt(ziel: Path, reihen: int = 3) -> list[Path]:
    """Schreibt mehrere Reihen mit realistischem zeitlichem Abstand.

    Bildet den Alltagsfall ab: mehrere Raeume hintereinander, zwischen den
    Reihen liegt eine deutliche Pause (Stativ umstellen).
    """
    pfade = []
    for r in range(reihen):
        pfade += schreibe_reihe(
            ziel, name=f"raum{r + 1:02d}",
            zeitbasis=datetime(2026, 3, 14, 10, 0, 0) + timedelta(minutes=2 * r),
            versatz=(r * 3, r * 2))
    return pfade


if __name__ == "__main__":
    ordner = Path(sys.argv[1] if len(sys.argv) > 1 else "testszene")
    anzahl = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    erzeugt = (schreibe_reihe(ordner) if anzahl == 1
               else schreibe_objekt(ordner, anzahl))
    for p in erzeugt:
        print("geschrieben:", p)
