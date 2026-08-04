#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
make_icon.py -- erzeugt das Programmsymbol hdr_merge.ico.

Das Motiv ist das, worum es im Werkzeug geht: ein dunkler Innenraum mit
einem durchgezeichneten Fenster. Die ICO-Datei wird direkt geschrieben
(Header plus eingebettete PNGs), damit ausser OpenCV und NumPy nichts
zusaetzlich noetig ist.

Aufruf:
    python make_icon.py
"""

from __future__ import annotations

import struct
from pathlib import Path

import cv2
import numpy as np

GROESSEN = (256, 64, 48, 32, 16)


def zeichne_symbol(kante: int = 256) -> np.ndarray:
    """Zeichnet das Symbol als BGRA-Bild."""
    bild = np.zeros((kante, kante, 4), dtype=np.uint8)
    s = kante / 256.0  # Skalierungsfaktor gegenueber der Entwurfsgroesse

    def p(wert: float) -> int:
        return int(round(wert * s))

    # Abgerundeter dunkler Hintergrund = der Innenraum
    hintergrund = np.zeros((kante, kante), dtype=np.uint8)
    cv2.rectangle(hintergrund, (p(6), p(6)), (p(250), p(250)), 255, -1,
                  cv2.LINE_AA)
    radius = p(46)
    kern = cv2.getStructuringElement(cv2.MORPH_ELLIPSE,
                                     (2 * radius + 1, 2 * radius + 1))
    hintergrund = cv2.morphologyEx(hintergrund, cv2.MORPH_OPEN, kern)

    raum = np.zeros((kante, kante, 3), dtype=np.uint8)
    verlauf = np.linspace(64, 34, kante, dtype=np.float32)[:, None]
    raum[..., 0] = verlauf   # B
    raum[..., 1] = verlauf + 4
    raum[..., 2] = verlauf + 10

    # Fensteroeffnung mit Himmelsverlauf
    fx0, fy0, fx1, fy1 = p(56), p(48), p(200), p(186)
    hoehe = fy1 - fy0
    himmel = np.zeros((hoehe, fx1 - fx0, 3), dtype=np.uint8)
    hell = np.linspace(252, 206, hoehe, dtype=np.float32)[:, None]
    himmel[..., 0] = np.clip(hell + 6, 0, 255)    # leicht kuehler Himmel
    himmel[..., 1] = np.clip(hell, 0, 255)
    himmel[..., 2] = np.clip(hell - 16, 0, 255)

    # Horizont mit angedeuteter Bebauung - das Motiv, das der Window Pull
    # zurueckholt.
    horizont = int(hoehe * 0.66)
    himmel[horizont:] = (150, 158, 150)
    for links, breite, tiefe in ((0.06, 0.16, 0.20), (0.30, 0.13, 0.32),
                                 (0.52, 0.18, 0.14), (0.76, 0.15, 0.26)):
        x0 = int((fx1 - fx0) * links)
        x1 = x0 + int((fx1 - fx0) * breite)
        y0 = horizont - int(hoehe * tiefe)
        himmel[y0:horizont, x0:x1] = (172, 180, 172)

    raum[fy0:fy1, fx0:fx1] = himmel

    # Fensterrahmen und Sprossen
    rahmen_farbe = (196, 205, 214)
    dicke = max(p(9), 2)
    cv2.rectangle(raum, (fx0, fy0), (fx1, fy1), rahmen_farbe, dicke, cv2.LINE_AA)
    mitte_x, mitte_y = (fx0 + fx1) // 2, (fy0 + fy1) // 2
    sprosse = max(p(7), 1)
    cv2.line(raum, (mitte_x, fy0), (mitte_x, fy1), rahmen_farbe, sprosse,
             cv2.LINE_AA)
    cv2.line(raum, (fx0, mitte_y), (fx1, mitte_y), rahmen_farbe, sprosse,
             cv2.LINE_AA)

    # Lichtkeil auf dem Boden - deutet das aufgehellte Innere an
    keil = np.array([[fx0, fy1], [fx1, fy1], [p(236), p(238)], [p(28), p(238)]],
                    dtype=np.int32)
    licht = raum.copy()
    cv2.fillPoly(licht, [keil], (128, 132, 140), cv2.LINE_AA)
    raum = cv2.addWeighted(raum, 0.72, licht, 0.28, 0)

    bild[..., :3] = raum
    bild[..., 3] = hintergrund
    return bild


def schreibe_ico(ziel: Path) -> None:
    """Schreibt eine ICO-Datei mit mehreren eingebetteten PNG-Groessen."""
    grundbild = zeichne_symbol(256)
    pngs = []
    for kante in GROESSEN:
        if kante == 256:
            bild = grundbild
        else:
            bild = cv2.resize(grundbild, (kante, kante),
                              interpolation=cv2.INTER_AREA)
        erfolg, daten = cv2.imencode(".png", bild)
        if not erfolg:
            raise RuntimeError("PNG konnte nicht erzeugt werden")
        pngs.append((kante, daten.tobytes()))

    kopf = struct.pack("<HHH", 0, 1, len(pngs))  # Reserve, Typ 1 = Symbol
    offset = 6 + 16 * len(pngs)
    eintraege, rumpf = b"", b""
    for kante, daten in pngs:
        masz = 0 if kante >= 256 else kante  # 0 steht fuer 256
        eintraege += struct.pack("<BBBBHHII", masz, masz, 0, 0, 1, 32,
                                 len(daten), offset)
        offset += len(daten)
        rumpf += daten
    ziel.write_bytes(kopf + eintraege + rumpf)


if __name__ == "__main__":
    ziel = Path(__file__).resolve().parent / "hdr_merge.ico"
    schreibe_ico(ziel)
    print("geschrieben:", ziel)
