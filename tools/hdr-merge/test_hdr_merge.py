#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
test_hdr_merge.py -- automatisierte Tests gegen die synthetische Szene.

Aufruf:
    python -m unittest -v test_hdr_merge.py

Die Tests belegen die Wirkung objektiv, statt sich auf "sieht gut aus" zu
verlassen:

  * Der Window Pull muss die Streuung im ausgebrannten Fensterbereich
    messbar anheben (im Referenzbild ist sie dort praktisch null).
  * Die Maske muss Deckenleuchte, weisse Wand und kleines Glanzlicht
    verwerfen.
  * Ueber die Fensterkante darf kein Ueberschwinger (Halo) entstehen.
  * Die tonale Normalisierung muss die konfigurierten Zielwerte treffen.
  * Zweimal derselbe Input muss bitgleich dasselbe Ergebnis liefern.
"""

from __future__ import annotations

import shutil
import tempfile
import unittest
from pathlib import Path

import numpy as np
import tifffile

import hdr_merge
import make_test_scene
from make_test_scene import (DECKENLEUCHTE, FENSTER, GLANZLICHT, WEISSE_WAND)

# Bereiche innerhalb des Fensters, die in der mittleren Belichtung vollstaendig
# ausgebrannt sind (Himmel und Haeuserzeile) - dort muss der Window Pull
# Zeichnung zurueckbringen.
HIMMEL = (690, 130, 825, 240)     # x0, y0, x1, y1
HAEUSER = (700, 268, 825, 290)


def _bereich(bild: np.ndarray, box: tuple[int, int, int, int]) -> np.ndarray:
    x0, y0, x1, y1 = box
    return bild[y0:y1, x0:x1]


def _mitte(box: tuple[int, int, int, int]) -> tuple[int, int]:
    x0, y0, x1, y1 = box
    return (y0 + y1) // 2, (x0 + x1) // 2


class SzenenLauf:
    """Fuehrt die Verarbeitung einmal aus und stellt die Ergebnisse bereit."""

    def __init__(self, zusatz_argumente: list[str] | None = None):
        self.ordner = Path(tempfile.mkdtemp(prefix="hdrtest_"))
        self.eingabe = self.ordner / "in"
        self.ausgabe = self.ordner / "out"
        make_test_scene.schreibe_reihe(self.eingabe)
        argumente = [str(self.eingabe), str(self.ausgabe),
                     "--bracket-size", "3", "--no-align", "--jobs", "1"]
        argumente += (zusatz_argumente or [])
        rueckgabe = hdr_merge.main(argumente)
        assert rueckgabe == 0, f"hdr_merge.main() lieferte {rueckgabe}"
        self.ergebnis_pfad = self.ausgabe / "raum01_1_hdr.tif"

    @property
    def ergebnis(self) -> np.ndarray:
        return tifffile.imread(str(self.ergebnis_pfad)).astype(np.float32) / 65535.0

    def belichtung(self, nummer: int) -> np.ndarray:
        pfad = self.eingabe / f"raum01_{nummer}.tif"
        return tifffile.imread(str(pfad)).astype(np.float32) / 65535.0

    def aufraeumen(self) -> None:
        shutil.rmtree(self.ordner, ignore_errors=True)


class TestSynthetischeSzene(unittest.TestCase):
    """Tests gegen den kompletten Durchlauf mit Standardparametern."""

    @classmethod
    def setUpClass(cls) -> None:
        cls.lauf = SzenenLauf()
        cls.ergebnis = cls.lauf.ergebnis
        cls.referenz = cls.lauf.belichtung(2)   # mittlere Belichtung
        cls.dunkel = cls.lauf.belichtung(1)
        cls.lum_ergebnis = hdr_merge.berechne_luminanz(cls.ergebnis)
        cls.lum_referenz = hdr_merge.berechne_luminanz(cls.referenz)

    @classmethod
    def tearDownClass(cls) -> None:
        cls.lauf.aufraeumen()

    # -- Grundlegendes -----------------------------------------------------

    def test_ausgabe_ist_16bit_rgb(self):
        roh = tifffile.imread(str(self.lauf.ergebnis_pfad))
        self.assertEqual(roh.dtype, np.uint16)
        self.assertEqual(roh.shape, (make_test_scene.HOEHE,
                                     make_test_scene.BREITE, 3))

    def test_fusion_hat_plausible_helligkeit(self):
        """Schuetzt gegen den 1/255-Skalierungsfehler in MergeMertens."""
        bilder = [self.lauf.belichtung(i) for i in (1, 2, 3)]
        fusion = hdr_merge.fusioniere_mertens(bilder, 1.0, 1.0, 1.0)
        self.assertGreater(float(fusion.mean()), 0.15)
        self.assertLess(float(fusion.mean()), 0.85)

    # -- Fenstererkennung --------------------------------------------------

    def _maske(self) -> tuple[np.ndarray, np.ndarray]:
        bilder = [self.lauf.belichtung(i) for i in (1, 2, 3)]
        fusion = hdr_merge.fusioniere_mertens(bilder, 1.0, 1.0, 1.0)
        return hdr_merge.erkenne_fenstermaske(
            referenz=bilder[1], dunkel=bilder[0], fusion=fusion,
            schwelle=0.90, detail_schwelle=0.010, detail_anteil=0.10,
            min_flaeche_anteil=0.001, blur_anteil=0.02, protokoll=[])

    def test_maske_enthaelt_fenster(self):
        binaer, _ = self._maske()
        y, x = _mitte(HIMMEL)
        self.assertEqual(binaer[y, x], 1, "Himmel im Fenster fehlt in der Maske")

    def test_maske_enthaelt_fenstersprossen(self):
        """Loecherfuellen: die Sprossen duerfen die Maske nicht zerreissen."""
        binaer, _ = self._maske()
        y = (make_test_scene.SPROSSE_SENKRECHT[1]
             + make_test_scene.SPROSSE_SENKRECHT[3]) // 2
        x = (make_test_scene.SPROSSE_SENKRECHT[0]
             + make_test_scene.SPROSSE_SENKRECHT[2]) // 2
        self.assertEqual(binaer[y, x], 1, "Fenstersprosse fehlt in der Maske")

    def test_maske_verwirft_deckenleuchte(self):
        binaer, _ = self._maske()
        y, x = _mitte(DECKENLEUCHTE)
        self.assertEqual(binaer[y, x], 0,
                         "Deckenleuchte wurde faelschlich als Fenster erkannt")

    def test_maske_verwirft_weisse_wand(self):
        binaer, _ = self._maske()
        y, x = _mitte(WEISSE_WAND)
        self.assertEqual(binaer[y, x], 0,
                         "Weisse Wand wurde faelschlich als Fenster erkannt")

    def test_maske_verwirft_kleines_glanzlicht(self):
        binaer, _ = self._maske()
        y, x = _mitte(GLANZLICHT)
        self.assertEqual(binaer[y, x], 0,
                         "Kleines Glanzlicht haette der Groessenfilter "
                         "verwerfen muessen")

    def test_maskenanteil_plausibel(self):
        binaer, _ = self._maske()
        anteil = float(binaer.mean())
        self.assertGreater(anteil, 0.10)
        self.assertLess(anteil, 0.20)

    # -- Kernnachweis: Window Pull ----------------------------------------

    def test_window_pull_bringt_zeichnung_zurueck(self):
        """Streuung im ausgebrannten Fensterbereich muss deutlich steigen."""
        for name, box in (("Himmel", HIMMEL), ("Haeuserzeile", HAEUSER)):
            with self.subTest(bereich=name):
                std_ref = float(_bereich(self.lum_referenz, box).std())
                std_erg = float(_bereich(self.lum_ergebnis, box).std())
                self.assertLess(std_ref, 0.002,
                                "Testszene: Bereich ist im Referenzbild nicht "
                                "ausgebrannt, der Test waere aussagelos")
                self.assertGreater(std_erg, 0.005,
                                   f"{name}: keine messbare Zeichnung im "
                                   f"Ergebnis")
                self.assertGreater(std_erg, std_ref * 8.0,
                                   f"{name}: Zeichnung nicht deutlich ueber "
                                   f"dem Referenzbild")

    def test_fenster_brennt_nicht_erneut_aus(self):
        fenster = _bereich(self.lum_ergebnis, FENSTER)
        anteil_weiss = float((fenster > 0.995).mean())
        self.assertLess(anteil_weiss, 0.01,
                        "Fensterbereich ist im Ergebnis wieder ausgebrannt")

    def test_fenster_bleibt_heller_als_innenraum(self):
        """Ein Fenster darf nicht dunkler werden als der Raum (unnatuerlich)."""
        fenster = float(_bereich(self.lum_ergebnis, HIMMEL).mean())
        innen = float(self.lum_ergebnis[300:500, 60:460].mean())
        self.assertGreater(fenster, innen)

    # -- Halo-Test ---------------------------------------------------------

    def test_kein_halo_an_der_fensterkante(self):
        """Luminanzprofil senkrecht ueber die rechte Fensterkante.

        Ein Halo zeigt sich als Ueberschwinger direkt neben der Kante: die
        Wand wird dort heller (oder dunkler) als weiter entfernt. Genau das
        entsteht, wenn man die Maske mit einem Gauss statt kantenbewusst
        weichzeichnet.
        """
        fensterkante_x = FENSTER[2]
        rahmen_ende = fensterkante_x + 12
        zeile = self.lum_ergebnis[130:240, :]           # Himmelshoehe
        profil = zeile.mean(axis=0)

        nahe = profil[rahmen_ende:rahmen_ende + 30]     # direkt neben dem Rahmen
        fern = profil[rahmen_ende + 45:rahmen_ende + 60]  # ungestoerte Wand
        referenz = float(fern.mean())

        self.assertLess(float(nahe.max()), referenz * 1.03,
                        f"Heller Ueberschwinger neben der Fensterkante: "
                        f"{float(nahe.max()):.4f} gegen {referenz:.4f}")
        self.assertGreater(float(nahe.min()), referenz * 0.90,
                           f"Dunkler Ueberschwinger neben der Fensterkante: "
                           f"{float(nahe.min()):.4f} gegen {referenz:.4f}")

    # -- Tonale Normalisierung --------------------------------------------

    def test_normalisierung_trifft_zielwerte(self):
        binaer, _ = self._maske()
        innen = ~binaer.astype(bool)
        lum = self.lum_ergebnis[innen]
        self.assertAlmostEqual(float(np.median(lum)), 0.55, delta=0.05)
        self.assertAlmostEqual(float(np.percentile(lum, 99.5)), 0.95, delta=0.05)
        self.assertAlmostEqual(float(np.percentile(lum, 0.2)), 0.02, delta=0.05)

    def test_base_tone_off_liefert_flachere_rohfusion(self):
        lauf = SzenenLauf(["--base-tone", "off"])
        try:
            flach = hdr_merge.berechne_luminanz(lauf.ergebnis)
            self.assertLess(float(np.median(flach)),
                            float(np.median(self.lum_ergebnis)),
                            "--base-tone off muesste dunkler/flacher sein")
        finally:
            lauf.aufraeumen()

    # -- Determinismus -----------------------------------------------------

    def test_zwei_laeufe_sind_bitgleich(self):
        lauf = SzenenLauf()
        try:
            a = tifffile.imread(str(self.lauf.ergebnis_pfad))
            b = tifffile.imread(str(lauf.ergebnis_pfad))
            self.assertTrue(np.array_equal(a, b),
                            "Ergebnis ist nicht reproduzierbar")
        finally:
            lauf.aufraeumen()


class TestGuidedFilter(unittest.TestCase):
    """Belegt, warum die Maske kantenbewusst statt per Gauss geglaettet wird."""

    def setUp(self):
        # Kuenstliche Kante: links dunkel, rechts hell - und eine Maske, die
        # exakt an dieser Kante endet.
        self.fuehrung = np.zeros((200, 200), dtype=np.float32)
        self.fuehrung[:, 100:] = 0.9
        self.maske = np.zeros((200, 200), dtype=np.float32)
        self.maske[:, 100:] = 1.0

    def test_guided_filter_haelt_die_kante(self):
        import cv2
        radius = 12
        weich_guided = hdr_merge.guided_filter(self.fuehrung, self.maske,
                                               radius, 1e-4)
        weich_gauss = cv2.GaussianBlur(self.maske, (2 * radius + 1,) * 2, 0)

        # 10 Pixel links der Kante: dort gehoert die Maske auf 0. Der Gauss
        # schmiert hinueber (= Halo), der Guided Filter nicht.
        leck_guided = float(weich_guided[:, 90:99].mean())
        leck_gauss = float(weich_gauss[:, 90:99].mean())
        self.assertLess(leck_guided, leck_gauss * 0.5,
                        f"Guided Filter schmiert genauso wie der Gauss "
                        f"({leck_guided:.4f} gegen {leck_gauss:.4f})")
        self.assertLess(leck_guided, 0.05)

    def test_werte_bleiben_im_bereich(self):
        weich = hdr_merge.guided_filter(self.fuehrung, self.maske, 8, 1e-4)
        self.assertGreaterEqual(float(weich.min()), -0.05)
        self.assertLessEqual(float(weich.max()), 1.05)


class TestRolloff(unittest.TestCase):

    def test_streng_monoton_und_begrenzt(self):
        x = np.linspace(0.0, 4.0, 500, dtype=np.float32)
        y = hdr_merge.weicher_rolloff(x, knie=0.6, obergrenze=0.92)
        self.assertTrue(np.all(np.diff(y) > 0), "Kurve ist nicht monoton")
        self.assertLess(float(y.max()), 0.92)

    def test_unterhalb_des_knies_unveraendert(self):
        x = np.linspace(0.0, 0.6, 100, dtype=np.float32)
        y = hdr_merge.weicher_rolloff(x, knie=0.6, obergrenze=0.92)
        np.testing.assert_allclose(x, y, atol=1e-6)


class TestGruppierung(unittest.TestCase):
    """Gruppierung ueber EXIF-Zeit und EV-Muster."""

    @staticmethod
    def _reihe(start: float, evs: list[float], abstand: float = 1.0):
        return [hdr_merge.Aufnahme(pfad=Path(f"IMG_{int(start)}_{i}.CR2"),
                                   zeit=start + i * abstand, ev=ev)
                for i, ev in enumerate(evs)]

    def test_ev_ruecksprung_beginnt_neue_reihe(self):
        aufnahmen = (self._reihe(0.0, [10.0, 12.0, 14.0])
                     + self._reihe(10.0, [10.0, 12.0, 14.0]))
        gruppen = hdr_merge.gruppiere_nach_exif(aufnahmen, max_luecke=6.0)
        self.assertEqual([len(g) for g in gruppen], [3, 3])

    def test_zeitluecke_beginnt_neue_reihe(self):
        aufnahmen = (self._reihe(0.0, [10.0, 12.0, 14.0])
                     + self._reihe(600.0, [16.0, 18.0, 20.0]))
        gruppen = hdr_merge.gruppiere_nach_exif(aufnahmen, max_luecke=6.0)
        self.assertEqual([len(g) for g in gruppen], [3, 3])

    def test_fuenferreihen(self):
        aufnahmen = (self._reihe(0.0, [8.0, 10.0, 12.0, 14.0, 16.0])
                     + self._reihe(20.0, [8.0, 10.0, 12.0, 14.0, 16.0]))
        gruppen = hdr_merge.gruppiere_nach_exif(aufnahmen, max_luecke=6.0)
        self.assertEqual([len(g) for g in gruppen], [5, 5])

    def test_feste_gruppierung(self):
        aufnahmen = self._reihe(0.0, [10.0] * 9)
        gruppen = hdr_merge.gruppiere_belichtungsreihen(aufnahmen, "3", 6.0)
        self.assertEqual([len(g) for g in gruppen], [3, 3, 3])

    def test_fallende_ev_reihenfolge(self):
        """Manche Kameras schiessen hell -> dunkel."""
        aufnahmen = (self._reihe(0.0, [14.0, 12.0, 10.0])
                     + self._reihe(10.0, [14.0, 12.0, 10.0]))
        gruppen = hdr_merge.gruppiere_nach_exif(aufnahmen, max_luecke=6.0)
        self.assertEqual([len(g) for g in gruppen], [3, 3])


class TestAusrichtung(unittest.TestCase):
    """Ausrichtung von Freihandaufnahmen ueber cv2.findTransformECC."""

    @classmethod
    def setUpClass(cls) -> None:
        cls.ordner = Path(tempfile.mkdtemp(prefix="hdralign_"))
        make_test_scene.schreibe_reihe(cls.ordner / "in", freihand=True)
        cls.bilder = [
            tifffile.imread(str(cls.ordner / "in" / f"raum01_{i}.tif")
                            ).astype(np.float32) / 65535.0
            for i in (1, 2, 3)]

    @classmethod
    def tearDownClass(cls) -> None:
        shutil.rmtree(cls.ordner, ignore_errors=True)

    def test_versatz_wird_erkannt_und_korrigiert(self):
        """Nach der Ausrichtung muss der Versatz messbar kleiner sein."""
        referenz = self.bilder[1]
        protokoll: list = []
        ausgerichtet = hdr_merge.richte_reihe_aus(list(self.bilder), 1, protokoll)

        def versatz_energie(bild):
            """Kantenversatz gegen die Referenz, robust gegen Helligkeit."""
            a = hdr_merge.berechne_luminanz(referenz)
            b = hdr_merge.berechne_luminanz(bild)
            a = (a - a.mean()) / (a.std() + 1e-6)
            b = (b - b.mean()) / (b.std() + 1e-6)
            rand = 40  # Randbereich ausklammern (dort fuellt warpAffine auf)
            return float(np.abs(a - b)[rand:-rand, rand:-rand].mean())

        for i in (0, 2):
            with self.subTest(bild=i):
                vorher = versatz_energie(self.bilder[i])
                nachher = versatz_energie(ausgerichtet[i])
                self.assertLess(nachher, vorher,
                                "Ausrichtung hat den Versatz nicht verringert")

    def test_ausrichtung_bricht_nicht_ab(self):
        """Rauschbilder: ECC konvergiert nicht - es darf trotzdem weiterlaufen."""
        rng = np.random.default_rng(7)
        bilder = [rng.random((120, 160, 3)).astype(np.float32) for _ in range(3)]
        protokoll: list = []
        ergebnis = hdr_merge.richte_reihe_aus(bilder, 1, protokoll)
        self.assertEqual(len(ergebnis), 3)
        for bild in ergebnis:
            self.assertEqual(bild.shape, (120, 160, 3))


class TestMehrereReihen(unittest.TestCase):
    """Kompletter Lauf ueber mehrere Reihen inkl. Gruppierung und Parallelitaet."""

    @classmethod
    def setUpClass(cls) -> None:
        cls.ordner = Path(tempfile.mkdtemp(prefix="hdrobjekt_"))
        cls.eingabe = cls.ordner / "in"
        cls.ausgabe = cls.ordner / "out"
        make_test_scene.schreibe_objekt(cls.eingabe, reihen=3)
        rueckgabe = hdr_merge.main([str(cls.eingabe), str(cls.ausgabe),
                                    "--bracket-size", "auto", "--no-align",
                                    "--preview", "--jobs", "2"])
        assert rueckgabe == 0

    @classmethod
    def tearDownClass(cls) -> None:
        shutil.rmtree(cls.ordner, ignore_errors=True)

    def test_automatische_gruppierung_findet_drei_reihen(self):
        aufnahmen = hdr_merge.sammle_aufnahmen(self.eingabe)
        gruppen = hdr_merge.gruppiere_nach_exif(aufnahmen, max_luecke=6.0)
        self.assertEqual([len(g) for g in gruppen], [3, 3, 3])

    def test_ein_ergebnis_je_reihe(self):
        tiffs = sorted(p.name for p in self.ausgabe.glob("*_hdr.tif"))
        self.assertEqual(tiffs, ["raum01_1_hdr.tif", "raum02_1_hdr.tif",
                                 "raum03_1_hdr.tif"])

    def test_kontaktbogen_wird_geschrieben(self):
        jpgs = sorted(p.name for p in self.ausgabe.glob("*_preview.jpg"))
        self.assertEqual(len(jpgs), 3)
        import cv2
        bogen = cv2.imread(str(self.ausgabe / "raum01_1_preview.jpg"))
        self.assertIsNotNone(bogen)
        # 3 Einzelbelichtungen + Maske + Ergebnis nebeneinander
        self.assertGreater(bogen.shape[1], bogen.shape[0] * 4)

    def test_exif_wird_uebernommen(self):
        tags = hdr_merge.lies_exif(self.ausgabe / "raum01_1_hdr.tif")
        self.assertEqual(tags.get(hdr_merge.TAG_MAKE), "Testkamera")
        self.assertEqual(tags.get(hdr_merge.TAG_MODEL), "Synthetik 1")
        self.assertTrue(str(tags.get(hdr_merge.TAG_DATETIME, "")).startswith(
            "2026:03:14"))


class TestPerspektive(unittest.TestCase):
    """--straighten: korrigiert nur unterhalb des Schwellwerts."""

    def setUp(self):
        self.szene = make_test_scene.belichte(make_test_scene.baue_szene(), 8.0)

    def test_gerades_bild_bleibt_unveraendert(self):
        protokoll: list = []
        ergebnis = hdr_merge.begradige_perspektive(self.szene, 8.0, protokoll)
        # Ohne stuerzende Linien darf hoechstens minimal beschnitten werden.
        self.assertLessEqual(ergebnis.shape[0], self.szene.shape[0])
        self.assertGreater(ergebnis.shape[0], self.szene.shape[0] * 0.8)

    def test_starke_korrektur_wird_abgelehnt(self):
        """Bei sehr kleinem Schwellwert darf nichts veraendert werden."""
        import cv2
        h, w = self.szene.shape[:2]
        keystone = np.array([[1.0, 0.0, 0.0], [0.0, 1.0, 0.0],
                             [0.0, 0.00035, 1.0]], dtype=np.float64)
        zentrieren = np.array([[1, 0, -w / 2.0], [0, 1, -h / 2.0], [0, 0, 1]])
        zurueck = np.array([[1, 0, w / 2.0], [0, 1, h / 2.0], [0, 0, 1]])
        schraeg = cv2.warpPerspective(self.szene,
                                      zurueck @ keystone @ zentrieren, (w, h))
        protokoll: list = []
        ergebnis = hdr_merge.begradige_perspektive(schraeg, 0.2, protokoll)
        self.assertEqual(ergebnis.shape, schraeg.shape)
        self.assertTrue(any(stufe == 30 for stufe, _ in protokoll),
                        "Es haette gewarnt werden muessen")


class TestExifLeser(unittest.TestCase):

    def test_liest_tiff_tags(self):
        ordner = Path(tempfile.mkdtemp(prefix="hdrexif_"))
        try:
            pfad = ordner / "probe.tif"
            tifffile.imwrite(str(pfad), np.zeros((8, 8, 3), dtype=np.uint16),
                             photometric="rgb",
                             extratags=[(271, "s", 0, "Canon", True),
                                        (306, "s", 0, "2026:01:02 03:04:05",
                                         True)])
            tags = hdr_merge.lies_exif(pfad)
            self.assertEqual(tags.get(hdr_merge.TAG_MAKE), "Canon")
            self.assertEqual(tags.get(hdr_merge.TAG_DATETIME),
                             "2026:01:02 03:04:05")
        finally:
            shutil.rmtree(ordner, ignore_errors=True)

    def test_ev_berechnung(self):
        # 1/125 s, f/8, ISO 100 -> EV = log2(64 * 125) = log2(8000)
        tags = {hdr_merge.TAG_EXPOSURE_TIME: 1 / 125.0,
                hdr_merge.TAG_FNUMBER: 8.0,
                hdr_merge.TAG_ISO: 100}
        self.assertAlmostEqual(hdr_merge.berechne_ev(tags),
                               np.log2(8000.0), places=6)
        # ISO 400 statt 100 -> zwei Blendenstufen weniger EV
        tags[hdr_merge.TAG_ISO] = 400
        self.assertAlmostEqual(hdr_merge.berechne_ev(tags),
                               np.log2(8000.0) - 2.0, places=6)

    def test_ev_ohne_daten(self):
        self.assertIsNone(hdr_merge.berechne_ev({}))


if __name__ == "__main__":
    unittest.main(verbosity=2)
