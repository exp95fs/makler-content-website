#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
benchmark_fotello.py -- misst ein Ergebnis gegen das kommerzielle Vorbild.

Die Zielwerte stammen aus der Vermessung von fuenf echten Ergebnissen des
kommerziellen Dienstes (Wohnraeume, Kuechen, Esszimmer, jeweils mit
Fenstern). Sie sind damit keine Schaetzung, sondern gemessen.

Aufruf:
    python benchmark_fotello.py ERGEBNIS.tif [WEITERE.tif ...]
    python benchmark_fotello.py AUSGABE_ORDNER

Ausgegeben wird je Bild eine Tabelle mit Ist- und Zielwert sowie eine
Gesamtabweichung. Kleinere Abweichung = naeher am Vorbild.
"""

from __future__ import annotations

import sys
from pathlib import Path

import cv2
import numpy as np
import tifffile

from hdr_merge import berechne_luminanz

# Gemessen an fuenf Ergebnissen des kommerziellen Dienstes.
ZIELWERTE = {
    "p0.2":      (0.034, "Schwarzpunkt"),
    "Median":    (0.625, "Gesamthelligkeit"),
    "p99.5":     (0.836, "Weisspunkt"),
    "Maximum":   (0.963, "hellster Punkt"),
    "Clipping":  (0.000, "Anteil ausgebrannter Pixel"),
    "Lichter":   (0.804, "mittlere Luminanz der hellsten 5 %"),
}

# Werte, die bewusst NICHT angeglichen werden - siehe README.
NUR_INFORMATIV = {
    "Saettigung": (0.098, "der Dienst entsaettigt, dieses Werkzeug nicht"),
    "Detail":     (0.047, "enthaelt beim Vorbild auch dessen Schaerfung"),
}


def kennwerte(rgb: np.ndarray) -> dict[str, float]:
    lum = berechne_luminanz(rgb)
    hell = lum >= np.percentile(lum, 95)
    lokal = cv2.GaussianBlur(lum, (0, 0), 3.0)
    maximum, minimum = rgb.max(axis=2), rgb.min(axis=2)
    return {
        "p0.2": float(np.percentile(lum, 0.2)),
        "Median": float(np.median(lum)),
        "p99.5": float(np.percentile(lum, 99.5)),
        "Maximum": float(lum.max()),
        "Clipping": float((lum > 0.99).mean()),
        "Lichter": float(lum[hell].mean()),
        "Saettigung": float(np.mean((maximum - minimum)
                                    / np.maximum(maximum, 1e-6))),
        "Detail": float(np.std((lum - lokal)[hell])),
    }


def lade(pfad: Path) -> np.ndarray:
    if pfad.suffix.lower() in (".tif", ".tiff"):
        bild = tifffile.imread(str(pfad))
        teiler = 65535.0 if bild.dtype == np.uint16 else 255.0
        return bild[..., :3].astype(np.float32) / teiler
    bild = cv2.imread(str(pfad), cv2.IMREAD_UNCHANGED)
    if bild is None:
        raise ValueError(f"Nicht lesbar: {pfad}")
    return cv2.cvtColor(bild[:, :, :3], cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0


def bewerte(pfad: Path) -> float:
    k = kennwerte(lade(pfad))
    print(f"\n{pfad.name}")
    print(f"  {'Kennwert':<12s} {'Ziel':>7s} {'Ist':>7s} {'Abw.':>8s}  Bedeutung")
    summe = 0.0
    for name, (ziel, bedeutung) in ZIELWERTE.items():
        abw = k[name] - ziel
        summe += abs(abw)
        marke = "  " if abs(abw) < 0.03 else ("! " if abs(abw) < 0.08 else "!!")
        print(f"{marke}{name:<12s} {ziel:7.3f} {k[name]:7.3f} {abw:+8.3f}  "
              f"{bedeutung}")
    for name, (wert, hinweis) in NUR_INFORMATIV.items():
        print(f"  {name:<12s} {wert:7.3f} {k[name]:7.3f} {'':>8s}  {hinweis}")
    print(f"  {'ABWEICHUNG':<12s} {'':>7s} {'':>7s} {summe:8.3f}")
    return summe


def main(argumente: list[str]) -> int:
    if not argumente:
        print(__doc__)
        return 2
    pfade: list[Path] = []
    for eintrag in argumente:
        p = Path(eintrag)
        if p.is_dir():
            pfade += sorted(p.glob("*_hdr.tif"))
        elif p.exists():
            pfade.append(p)
        else:
            print(f"Nicht gefunden: {p}")
    if not pfade:
        print("Keine auswertbaren Dateien gefunden.")
        return 2
    werte = [bewerte(p) for p in pfade]
    if len(werte) > 1:
        print(f"\nMittlere Abweichung ueber {len(werte)} Bilder: "
              f"{sum(werte) / len(werte):.3f}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
