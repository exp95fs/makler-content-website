#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
test_reference.py -- Qualitaets-Benchmark gegen das kommerzielle Vorbild.

Diese Tests messen an der Referenzszene (make_reference_scene.py) genau die
Eigenschaften, die das kommerzielle Ergebnis auszeichnen, an dem sich dieses
Werkzeug messen lassen muss. Jeder Test entspricht einer Eigenschaft, die im
Vergleichsbild sichtbar ist:

  * Der Himmel im Fenster ist BLAU mit weissen Wolken - nicht milchig weiss.
  * Im Himmel ist Wolkenzeichnung vorhanden, obwohl das Referenzbild dort
    vollstaendig ausgebrannt ist (Streuung exakt 0).
  * Nichts clippt.
  * Weisse Waende werden hell und neutral, nicht grau und nicht farbstichig.
  * Der Eichenboden bleibt warm - der Weissabgleich darf ihn nicht
    neutralisieren.
  * Feine Strukturen (Marmoraderung) ueberleben.
  * Keine Halos an den kontrastreichen Fensterkanten.

Aufruf:
    python -m unittest -v test_reference.py
"""

from __future__ import annotations

import shutil
import tempfile
import unittest
from pathlib import Path

import numpy as np
import tifffile

import hdr_merge
import make_reference_scene as referenz

# --- Messfenster (in Bildkoordinaten) --------------------------------------
# Reine Himmelsflaeche im linken Dachfenster, ohne Rahmen und ohne die
# Pendelleuchte davor.
HIMMEL_REIN = (230, 200, 330, 290)
# Band mit Wolkenzeichnung
WOLKENBAND = (240, 150, 340, 200)
# Kern der schwarzen Pendelleuchte, dort wo sie vor dem Fenster haengt
LEUCHTENKERN = (356, 165, 368, 185)
# Weisse Dachschraege rechts
WAND = (900, 120, 1130, 300)
# Eichenboden
BODEN = (980, 640, 1180, 780)
# Marmor-Arbeitsplatte
MARMOR = (430, 560, 900, 660)


def bereich(bild: np.ndarray, box: tuple[int, int, int, int]) -> np.ndarray:
    x0, y0, x1, y1 = box
    return bild[y0:y1, x0:x1]


def saettigung(bild: np.ndarray) -> float:
    """Mittlere Saettigung als (max-min)/max je Pixel.

    Bewusst als Verhaeltnis: Diese Groesse ist unabhaengig davon, wie stark
    das Bild insgesamt aufgehellt wurde, und misst damit genau das, was
    unveraendert bleiben soll.
    """
    maximum = bild.max(axis=2)
    minimum = bild.min(axis=2)
    return float(np.mean((maximum - minimum) / np.maximum(maximum, 1e-6)))


class ReferenzLauf:
    """Erzeugt die Referenzszene und verarbeitet sie einmal."""

    def __init__(self, zusatz: list[str] | None = None):
        self.ordner = Path(tempfile.mkdtemp(prefix="hdrref_"))
        self.eingabe = self.ordner / "in"
        self.ausgabe = self.ordner / "out"
        referenz.schreibe_reihe(self.eingabe)
        argumente = [str(self.eingabe), str(self.ausgabe), "--bracket-size", "3",
                     "--no-align", "--jobs", "1"] + (zusatz or [])
        assert hdr_merge.main(argumente) == 0

    def bild(self, name: str) -> np.ndarray:
        if name == "ergebnis":
            pfad = self.ausgabe / "dach01_1_hdr.tif"
        else:
            pfad = self.eingabe / f"dach01_{name}.tif"
        return tifffile.imread(str(pfad)).astype(np.float32) / 65535.0

    def aufraeumen(self) -> None:
        shutil.rmtree(self.ordner, ignore_errors=True)


class TestQualitaetsBenchmark(unittest.TestCase):

    @classmethod
    def setUpClass(cls) -> None:
        cls.lauf = ReferenzLauf()
        cls.dunkel = cls.lauf.bild("1")      # dunkelste Belichtung
        cls.mittel = cls.lauf.bild("2")      # Referenzbelichtung
        cls.ergebnis = cls.lauf.bild("ergebnis")

    @classmethod
    def tearDownClass(cls) -> None:
        cls.lauf.aufraeumen()

    # -- Ausgangslage: das Referenzbild hat im Fenster wirklich nichts -------

    def test_referenzbild_ist_im_fenster_vollstaendig_ausgebrannt(self):
        """Ohne diesen Nachweis waeren alle folgenden Tests aussagelos."""
        for box in (HIMMEL_REIN, WOLKENBAND):
            with self.subTest(box=box):
                lum = hdr_merge.berechne_luminanz(bereich(self.mittel, box))
                self.assertGreater(float(lum.mean()), 0.995)
                self.assertLess(float(lum.std()), 0.001)

    # -- Kernkriterium 1: der Himmel bleibt blau -----------------------------

    def test_himmel_behaelt_seine_farbe(self):
        """Der Himmel muss blau bleiben, nicht milchig weiss werden.

        Verglichen wird gegen die dunkelste Belichtung - dort ist die wahre
        Farbe des Himmels aufgezeichnet.
        """
        for box in (HIMMEL_REIN, WOLKENBAND):
            with self.subTest(box=box):
                quelle = saettigung(bereich(self.dunkel, box))
                ergebnis = saettigung(bereich(self.ergebnis, box))
                self.assertGreater(
                    ergebnis, quelle * 0.85,
                    f"Himmel entsaettigt: {ergebnis:.3f} statt {quelle:.3f}")

    def test_himmel_bleibt_blaustichig(self):
        """Blaukanal muss ueber dem Rotkanal liegen - sonst ist es kein Himmel."""
        feld = bereich(self.ergebnis, HIMMEL_REIN).reshape(-1, 3).mean(axis=0)
        self.assertGreater(float(feld[2]), float(feld[0]) * 1.05,
                           f"Himmel ist nicht mehr blau: RGB {feld}")

    # -- Kernkriterium 2: Wolkenzeichnung ist zurueck ------------------------

    def test_wolkenzeichnung_wird_zurueckgeholt(self):
        quelle = float(hdr_merge.berechne_luminanz(
            bereich(self.dunkel, WOLKENBAND)).std())
        ergebnis = float(hdr_merge.berechne_luminanz(
            bereich(self.ergebnis, WOLKENBAND)).std())
        self.assertGreater(ergebnis, 0.015,
                           "Keine Wolkenzeichnung im Ergebnis")
        self.assertGreater(ergebnis, quelle * 0.5,
                           f"Weniger als die Haelfte der Zeichnung erhalten: "
                           f"{ergebnis:.4f} von {quelle:.4f}")

    # -- Kernkriterium 3: nichts clippt --------------------------------------

    def test_kein_nennenswertes_clipping(self):
        anteil = float((self.ergebnis > 0.998).mean())
        self.assertLess(anteil, 0.002,
                        f"{anteil * 100:.2f} % der Pixel sind ausgebrannt")

    def test_fenster_bleibt_unter_der_obergrenze(self):
        lum = hdr_merge.berechne_luminanz(bereich(self.ergebnis, HIMMEL_REIN))
        self.assertLess(float(lum.max()), 0.97)

    # -- Kernkriterium 4: heller, neutraler Innenraum ------------------------

    def test_weisse_wand_wird_hell(self):
        lum = hdr_merge.berechne_luminanz(bereich(self.ergebnis, WAND))
        self.assertGreater(float(lum.mean()), 0.60,
                           "Weisse Waende duerfen nicht grau werden")

    def test_weisse_wand_bleibt_neutral(self):
        self.assertLess(saettigung(bereich(self.ergebnis, WAND)), 0.05,
                        "Weisse Wand hat einen Farbstich")

    def test_eichenboden_bleibt_warm(self):
        """Der Weissabgleich darf warmes Holz nicht neutralisieren."""
        quelle = saettigung(bereich(self.dunkel, BODEN))
        ergebnis = saettigung(bereich(self.ergebnis, BODEN))
        self.assertGreater(ergebnis, quelle * 0.8,
                           f"Holz entsaettigt: {ergebnis:.3f} statt "
                           f"{quelle:.3f}")
        feld = bereich(self.ergebnis, BODEN).reshape(-1, 3).mean(axis=0)
        self.assertGreater(float(feld[0]), float(feld[2]) * 1.1,
                           "Der Boden ist nicht mehr warm")

    def test_saettigung_wird_nicht_angehoben(self):
        """Ausdrueckliche Vorgabe: keine Saettigungsanhebung.

        Ein kanalweise gerechnetes Gamma wuerde hier zuschlagen - deshalb
        wird es im Werkzeug ueber die Luminanz gerechnet.
        """
        for name, box in (("Boden", BODEN), ("Wand", WAND)):
            with self.subTest(bereich=name):
                quelle = saettigung(bereich(self.dunkel, box))
                ergebnis = saettigung(bereich(self.ergebnis, box))
                self.assertLess(ergebnis, quelle * 1.25 + 0.02,
                                f"{name}: Saettigung von {quelle:.3f} auf "
                                f"{ergebnis:.3f} angehoben")

    # -- Kernkriterium 5: feine Struktur bleibt ------------------------------

    def test_marmoraderung_bleibt_erhalten(self):
        std = float(hdr_merge.berechne_luminanz(
            bereich(self.ergebnis, MARMOR)).std())
        self.assertGreater(std, 0.015,
                           "Die feine Aderung der Arbeitsplatte ist weg")

    # -- Kernkriterium 6: keine Halos ----------------------------------------

    def test_kein_halo_an_dunklem_gegenstand_im_fenster(self):
        """Die Pendelleuchte haengt vor dem Fenster.

        Direkt neben einem dunklen Gegenstand vor hellem Hintergrund
        entsteht leicht ein heller Ueberschwinger. Geprueft wird, dass der
        Bereich neben der Leuchte nicht deutlich heller ist als der Himmel
        weiter entfernt.
        """
        lum = hdr_merge.berechne_luminanz(self.ergebnis)
        himmel = float(np.mean(hdr_merge.berechne_luminanz(
            bereich(self.ergebnis, HIMMEL_REIN))))
        # Schmales Band links und rechts direkt neben der Leuchte
        links = lum[168:185, 336:353]
        rechts = lum[168:185, 372:389]
        for name, band in (("links", links), ("rechts", rechts)):
            with self.subTest(seite=name):
                self.assertLess(
                    float(band.mean()), himmel * 1.12,
                    f"Heller Saum neben der Pendelleuchte ({name}): "
                    f"{float(band.mean()):.3f} gegen Himmel {himmel:.3f}")

    def test_dunkler_gegenstand_bleibt_dunkel(self):
        """Die schwarze Leuchte darf nicht zum Himmel werden."""
        lum = hdr_merge.berechne_luminanz(bereich(self.ergebnis, LEUCHTENKERN))
        himmel = float(np.mean(hdr_merge.berechne_luminanz(
            bereich(self.ergebnis, HIMMEL_REIN))))
        self.assertLess(float(lum.mean()), himmel * 0.55,
                        "Der Fensterinhalt wurde ueber die Leuchte gelegt")

    # -- Ausgabeformat --------------------------------------------------------

    def test_ausgabe_ist_unkomprimiertes_16bit(self):
        pfad = self.lauf.ausgabe / "dach01_1_hdr.tif"
        with tifffile.TiffFile(str(pfad)) as datei:
            seite = datei.pages[0]
            self.assertEqual(seite.dtype, np.uint16)
            self.assertEqual(int(seite.compression), 1,  # 1 = unkomprimiert
                             "Die Ausgabe muss unkomprimiert sein")
            self.assertEqual(seite.samplesperpixel, 3)


class TestHelligkeitsverhalten(unittest.TestCase):
    """Weisse Waende duerfen nicht heruntergedunkelt werden."""

    def test_lift_dunkelt_helle_raeume_nicht_ab(self):
        """Mit einem niedrigen Zielwert darf 'lift' nicht abdunkeln."""
        hell = ReferenzLauf(["--mid-target", "0.45"])
        exakt = ReferenzLauf(["--mid-target", "0.45", "--mid-mode", "exact"])
        try:
            lum_lift = hdr_merge.berechne_luminanz(
                bereich(hell.bild("ergebnis"), WAND)).mean()
            lum_exakt = hdr_merge.berechne_luminanz(
                bereich(exakt.bild("ergebnis"), WAND)).mean()
            self.assertGreater(float(lum_lift), float(lum_exakt),
                               "--mid-mode lift muesste heller sein als exact")
        finally:
            hell.aufraeumen()
            exakt.aufraeumen()


if __name__ == "__main__":
    unittest.main(verbosity=2)
