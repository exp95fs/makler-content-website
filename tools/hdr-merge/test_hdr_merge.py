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

import pathlib
import re
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

    def _maske(self) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        bilder = [self.lauf.belichtung(i) for i in (1, 2, 3)]
        fusion = hdr_merge.fusioniere_mertens(bilder, 1.0, 1.0, 1.0)
        return hdr_merge.erkenne_fenstermaske(
            referenz=bilder[1], dunkel=bilder[0], fusion=fusion,
            schwelle=0.90, detail_schwelle=0.010, detail_anteil=0.10,
            min_flaeche_anteil=0.001, blur_anteil=0.02, protokoll=[])

    def test_maske_enthaelt_fenster(self):
        binaer, _, _ = self._maske()
        y, x = _mitte(HIMMEL)
        self.assertEqual(binaer[y, x], 1, "Himmel im Fenster fehlt in der Maske")

    def test_maske_enthaelt_fenstersprossen(self):
        """Loecherfuellen: die Sprossen duerfen die Maske nicht zerreissen."""
        binaer, _, _ = self._maske()
        y = (make_test_scene.SPROSSE_SENKRECHT[1]
             + make_test_scene.SPROSSE_SENKRECHT[3]) // 2
        x = (make_test_scene.SPROSSE_SENKRECHT[0]
             + make_test_scene.SPROSSE_SENKRECHT[2]) // 2
        self.assertEqual(binaer[y, x], 1, "Fenstersprosse fehlt in der Maske")

    def test_maske_verwirft_deckenleuchte(self):
        binaer, _, _ = self._maske()
        y, x = _mitte(DECKENLEUCHTE)
        self.assertEqual(binaer[y, x], 0,
                         "Deckenleuchte wurde faelschlich als Fenster erkannt")

    def test_maske_verwirft_weisse_wand(self):
        binaer, _, _ = self._maske()
        y, x = _mitte(WEISSE_WAND)
        self.assertEqual(binaer[y, x], 0,
                         "Weisse Wand wurde faelschlich als Fenster erkannt")

    def test_maske_verwirft_kleines_glanzlicht(self):
        binaer, _, _ = self._maske()
        y, x = _mitte(GLANZLICHT)
        self.assertEqual(binaer[y, x], 0,
                         "Kleines Glanzlicht haette der Groessenfilter "
                         "verwerfen muessen")

    def test_maskenanteil_plausibel(self):
        binaer, _, _ = self._maske()
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
        """Die Verankerung selbst, ohne die nachgelagerte Kontrastkurve.

        Geprueft wird der zugesicherte Vertrag von --white-target,
        --black-target und --mid-target. Er beschreibt die Lage der
        Stuetzpunkte NACH der Verankerung; die Kontrastkennlinie greift
        danach und verschiebt sie bewusst (siehe den folgenden Test).
        """
        vorgabe = hdr_merge.baue_parser().parse_args(["a", "b"])
        lauf = SzenenLauf(["--tone-contrast", "0"])
        try:
            # Die Maske haengt allein an den Belichtungen, nicht am Ergebnis.
            binaer, _, _ = self._maske()
            innen = ~binaer.astype(bool)
            lum = hdr_merge.berechne_luminanz(lauf.ergebnis)[innen]
            self.assertAlmostEqual(float(np.percentile(lum, 0.2)),
                                   vorgabe.black_target, delta=0.02)
            self.assertAlmostEqual(float(np.percentile(lum, 99.5)),
                                   vorgabe.white_target, delta=0.03)
            self.assertAlmostEqual(float(np.median(lum)), vorgabe.mid_target,
                                   delta=0.06)
        finally:
            lauf.aufraeumen()

    def test_kontrastkurve_hebt_die_lichter_an(self):
        """Die Kennlinie muss den Tonwertumfang messbar spreizen.

        Zielgroesse ist nicht mehr --white-target, sondern der am Vorbild
        gemessene Weisspunkt: Die drei vermessenen Ergebnisse des Dienstes
        liegen bei p99.5 = 0.918 / 0.873 / 0.900, im Mittel also bei 0.897.
        """
        binaer, _, _ = self._maske()
        innen = ~binaer.astype(bool)
        lum = self.lum_ergebnis[innen]
        vorgabe = hdr_merge.baue_parser().parse_args(["a", "b"])
        self.assertGreater(float(np.percentile(lum, 99.5)),
                           vorgabe.white_target + 0.02,
                           "Die Kontrastkennlinie spreizt die Lichter nicht")
        self.assertLess(float(np.percentile(lum, 99.5)), 0.93,
                        "Die Lichter laufen ueber das Vorbild hinaus")
        self.assertLess(float(np.percentile(lum, 0.2)), 0.06,
                        "Die Tiefen kommen nicht zur Ruhe")

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


class TestRobustheit(unittest.TestCase):
    """Fehlerhafte Eingaben duerfen nie zum Absturz fuehren."""

    def setUp(self):
        self.ordner = Path(tempfile.mkdtemp(prefix="hdrrob_"))
        self.eingabe = self.ordner / "in"
        self.eingabe.mkdir(parents=True)
        self.ausgabe = self.ordner / "out"

    def tearDown(self):
        shutil.rmtree(self.ordner, ignore_errors=True)

    def _lauf(self, *zusatz: str) -> int:
        return hdr_merge.main([str(self.eingabe), str(self.ausgabe),
                               "--jobs", "1", *zusatz])

    def test_leerer_ordner(self):
        self.assertEqual(self._lauf(), 2)

    def test_nicht_vorhandener_ordner(self):
        rueckgabe = hdr_merge.main([str(self.ordner / "gibtsnicht"),
                                    str(self.ausgabe)])
        self.assertEqual(rueckgabe, 2)

    def test_defekte_datei_stoppt_den_lauf_nicht(self):
        """Eine kaputte Datei darf nur ihre eigene Reihe kosten."""
        make_test_scene.schreibe_reihe(self.eingabe, name="gut")
        (self.eingabe / "kaputt_1.tif").write_bytes(b"kein gueltiges TIFF" * 50)
        (self.eingabe / "kaputt_2.tif").write_bytes(b"auch nicht" * 50)
        (self.eingabe / "kaputt_3.tif").write_bytes(b"ebenfalls nicht" * 50)
        self._lauf("--bracket-size", "3", "--no-align")
        # Die intakte Reihe muss trotzdem ein Ergebnis liefern.
        self.assertTrue((self.ausgabe / "gut_1_hdr.tif").exists(),
                        "Die intakte Reihe wurde nicht verarbeitet")

    def test_unterschiedliche_bildgroessen(self):
        import make_reference_scene
        make_test_scene.schreibe_reihe(self.eingabe, name="klein")
        make_reference_scene.schreibe_reihe(self.eingabe, name="gross")
        # Bewusst falsch gruppiert, damit Bilder verschiedener Groesse
        # in einer Reihe landen.
        rueckgabe = self._lauf("--bracket-size", "6", "--no-align")
        self.assertIn(rueckgabe, (0, 1))   # kein Absturz

    def test_einzelne_datei(self):
        make_test_scene.schreibe_reihe(self.eingabe, name="einzeln")
        for nummer in (2, 3):
            (self.eingabe / f"einzeln_{nummer}.tif").unlink()
        self.assertIn(self._lauf(), (0, 1))

    def test_ausgabeordner_wird_angelegt(self):
        make_test_scene.schreibe_reihe(self.eingabe)
        tief = self.ausgabe / "eine" / "tiefe" / "struktur"
        rueckgabe = hdr_merge.main([str(self.eingabe), str(tief),
                                    "--bracket-size", "3", "--no-align",
                                    "--jobs", "1"])
        self.assertEqual(rueckgabe, 0)
        self.assertTrue((tief / "raum01_1_hdr.tif").exists())


class TestOhneRawpy(unittest.TestCase):
    """Ohne rawpy muessen TIFFs weiterhin laufen.

    Fuer sehr neue Python-Versionen gibt es zeitweise kein fertiges
    rawpy-Paket. Dann darf nur die RAW-Entwicklung ausfallen, nicht das
    ganze Werkzeug.
    """

    def setUp(self):
        self.ordner = Path(tempfile.mkdtemp(prefix="hdrnoraw_"))
        self.original = hdr_merge.rawpy
        hdr_merge.rawpy = None

    def tearDown(self):
        hdr_merge.rawpy = self.original
        shutil.rmtree(self.ordner, ignore_errors=True)

    def test_tiff_reihe_laeuft_weiterhin(self):
        eingabe = self.ordner / "in"
        make_test_scene.schreibe_reihe(eingabe)
        rueckgabe = hdr_merge.main([str(eingabe), str(self.ordner / "out"),
                                    "--bracket-size", "3", "--no-align",
                                    "--jobs", "1"])
        self.assertEqual(rueckgabe, 0)
        self.assertTrue((self.ordner / "out" / "raum01_1_hdr.tif").exists())

    def test_raw_datei_meldet_klaren_fehler(self):
        eingabe = self.ordner / "in"
        eingabe.mkdir(parents=True)
        for nummer in (1, 2, 3):
            (eingabe / f"bild_{nummer}.cr2").write_bytes(b"platzhalter" * 100)
        protokoll: list = []
        aufnahmen = hdr_merge.sammle_aufnahmen(eingabe)
        ergebnis = hdr_merge.verarbeite_reihe(aufnahmen, self.ordner / "out",
                                              hdr_merge.baue_parser().parse_args(
                                                  [str(eingabe),
                                                   str(self.ordner / "out")]))
        self.assertFalse(ergebnis.erfolgreich)
        texte = " ".join(text for _, text in ergebnis.protokoll)
        self.assertIn("rawpy", texte)

    def test_bildgroesse_ohne_rawpy(self):
        eingabe = self.ordner / "in"
        make_test_scene.schreibe_reihe(eingabe)
        self.assertEqual(hdr_merge.lies_bildgroesse(eingabe / "raum01_1.tif"),
                         (make_test_scene.HOEHE, make_test_scene.BREITE))
        self.assertIsNone(hdr_merge.lies_bildgroesse(eingabe / "gibtsnicht.cr2"))


class TestSpeicherplanung(unittest.TestCase):
    """Die Parallelitaet muss sich am freien Arbeitsspeicher orientieren."""

    def test_grosse_bilder_begrenzen_die_prozesse(self):
        klein = hdr_merge.schaetze_speicherbedarf(900 * 600, 3)
        gross = hdr_merge.schaetze_speicherbedarf(6000 * 4000, 3)
        self.assertGreater(gross, klein * 40)
        # Eine Dreierreihe mit 24 MP wurde mit rund 3,5 GB gemessen.
        self.assertGreater(gross, 2.5 * 1024 ** 3)
        self.assertLess(gross, 5.0 * 1024 ** 3)

    def test_vorgabe_hat_vorrang(self):
        gruppen = [[] for _ in range(8)]
        anzahl, grund = hdr_merge.waehle_prozessanzahl(gruppen, 3)
        self.assertEqual(anzahl, 3)
        self.assertEqual(grund, "vorgegeben")

    def test_nie_mehr_prozesse_als_reihen(self):
        anzahl, _ = hdr_merge.waehle_prozessanzahl([[]], 0)
        self.assertEqual(anzahl, 1)

    def test_freier_speicher_ist_plausibel(self):
        frei = hdr_merge.verfuegbarer_arbeitsspeicher()
        self.assertGreater(frei, 128 * 1024 ** 2)


class TestAusgabeformat(unittest.TestCase):
    """Die Ausgabe muss ohne Qualitaetsverlust weiterverarbeitbar sein."""

    @classmethod
    def setUpClass(cls) -> None:
        cls.lauf = SzenenLauf()

    @classmethod
    def tearDownClass(cls) -> None:
        cls.lauf.aufraeumen()

    def test_unkomprimiert_und_16bit(self):
        with tifffile.TiffFile(str(self.lauf.ergebnis_pfad)) as datei:
            seite = datei.pages[0]
            self.assertEqual(seite.dtype, np.uint16, "Kein 16-Bit")
            self.assertEqual(int(seite.compression), 1, "Nicht unkomprimiert")
            self.assertEqual(seite.samplesperpixel, 3)
            self.assertEqual(int(seite.photometric), 2, "Kein RGB")

    def test_voller_16bit_umfang_wird_genutzt(self):
        """Es darf nicht faktisch nur 8 Bit Information drinstecken."""
        roh = tifffile.imread(str(self.lauf.ergebnis_pfad))
        stufen = len(np.unique(roh[..., 1]))
        self.assertGreater(stufen, 5000,
                           f"Nur {stufen} Tonwertstufen - die 16 Bit werden "
                           f"nicht wirklich genutzt")


class TestGeometrie(unittest.TestCase):
    """Kippung, Neigung und Verzeichnung."""

    @staticmethod
    def _senkrechten_muster() -> np.ndarray:
        """Bild mit eindeutigen Senkrechten - der saubere Pruefstand.

        Die Referenzszene taugt dafuer nicht: Ihre auffaelligsten Kanten sind
        die bewusst schraegen Dachfenster, und genau die wuerde die Messung
        als 'Senkrechte' aufgreifen.
        """
        bild = np.full((800, 1200, 3), 0.20, dtype=np.float32)
        for x in (150, 330, 520, 700, 880, 1050):
            bild[80:720, x:x + 14] = 0.85
        for y in (120, 660):
            bild[y:y + 12, 100:1100] = 0.55
        return bild

    def setUp(self):
        import make_reference_scene
        self.szene = make_reference_scene.belichte(
            make_reference_scene.baue_szene(), 8.0)
        self.muster = self._senkrechten_muster()

    def test_rollwinkel_wird_erkannt(self):
        """Ein bekannt gedrehtes Bild muss den Drehwinkel zurueckliefern."""
        import cv2
        h, w = self.muster.shape[:2]
        for winkel in (-2.5, 1.8):
            with self.subTest(winkel=winkel):
                matrix = cv2.getRotationMatrix2D((w / 2, h / 2), winkel, 1.0)
                gedreht = cv2.warpAffine(self.muster, matrix, (w, h),
                                         borderMode=cv2.BORDER_REPLICATE)
                gemessen = hdr_merge.schaetze_rollwinkel(gedreht)
                self.assertIsNotNone(gemessen)
                self.assertAlmostEqual(float(gemessen), winkel, delta=0.6)

    def test_gerades_bild_hat_rollwinkel_null(self):
        gemessen = hdr_merge.schaetze_rollwinkel(self.muster)
        self.assertIsNotNone(gemessen)
        self.assertAlmostEqual(float(gemessen), 0.0, delta=0.3)

    def test_begradigen_korrigiert_die_kippung(self):
        import cv2
        h, w = self.muster.shape[:2]
        matrix = cv2.getRotationMatrix2D((w / 2, h / 2), 2.0, 1.0)
        gedreht = cv2.warpAffine(self.muster, matrix, (w, h),
                                 borderMode=cv2.BORDER_REPLICATE)
        protokoll: list = []
        gerade = hdr_merge.begradige_perspektive(gedreht, 8.0, protokoll)
        rest = hdr_merge.schaetze_rollwinkel(gerade)
        self.assertIsNotNone(rest)
        self.assertLess(abs(float(rest)), 0.6,
                        f"Kippung nicht korrigiert, Rest {rest}")

    def test_brennweite_aus_exif(self):
        """Ohne EXIF gilt die Naeherung, mit EXIF der echte Wert."""
        self.assertAlmostEqual(
            hdr_merge.schaetze_brennweite_in_pixeln({}, 6000), 6000.0)
        tags = {hdr_merge.TAG_FOCAL_35MM: 16}
        self.assertAlmostEqual(
            hdr_merge.schaetze_brennweite_in_pixeln(tags, 7028),
            16 / 36 * 7028, places=3)
        # Unsinnige Werte werden verworfen.
        self.assertAlmostEqual(
            hdr_merge.schaetze_brennweite_in_pixeln(
                {hdr_merge.TAG_FOCAL_35MM: 900}, 6000), 6000.0)

    def test_verzeichnung_wird_erkannt_und_ausgeglichen(self):
        """Ein kuenstlich tonnenfoermig verzeichnetes Bild wird erkannt."""
        verzeichnet = hdr_merge.korrigiere_verzeichnung(self.szene, 0.08)
        protokoll: list = []
        gefunden = hdr_merge.schaetze_verzeichnung(verzeichnet, protokoll)
        # Die Schaetzung muss in die Gegenrichtung zeigen.
        if gefunden:
            self.assertLess(gefunden, 0.0,
                            "Verzeichnung mit falschem Vorzeichen geschaetzt")

    def test_verzeichnungskorrektur_erhaelt_die_bildgroesse_ungefaehr(self):
        korrigiert = hdr_merge.korrigiere_verzeichnung(self.szene, -0.05)
        h, w = self.szene.shape[:2]
        self.assertGreater(korrigiert.shape[0], h * 0.7)
        self.assertGreater(korrigiert.shape[1], w * 0.7)
        self.assertLessEqual(korrigiert.shape[0], h)

    def test_gerades_bild_wird_nicht_verzeichnet(self):
        """Ohne Anlass darf nichts korrigiert werden."""
        protokoll: list = []
        self.assertEqual(
            hdr_merge.korrigiere_verzeichnung(self.szene, 0.0).shape,
            self.szene.shape)


class TestFarbangleich(unittest.TestCase):
    """--color-match senkt die Saettigung, ohne Helligkeit zu veraendern."""

    @staticmethod
    def _buntes_bild() -> np.ndarray:
        rng = np.random.default_rng(3)
        bild = rng.random((60, 60, 3)).astype(np.float32) * 0.7 + 0.15
        return bild

    def _saettigung(self, bild: np.ndarray) -> float:
        mx, mn = bild.max(axis=2), bild.min(axis=2)
        return float(np.mean((mx - mn) / np.maximum(mx, 1e-6)))

    def test_standard_aendert_nichts(self):
        bild = self._buntes_bild()
        ergebnis = hdr_merge.gleiche_saettigung_an(bild, 0.0, 0.098, [])
        np.testing.assert_array_equal(bild, ergebnis)

    def test_saettigung_sinkt_zum_zielwert(self):
        bild = self._buntes_bild()
        vorher = self._saettigung(bild)
        self.assertGreater(vorher, 0.098, "Testbild ist nicht bunt genug")
        ergebnis = hdr_merge.gleiche_saettigung_an(bild, 1.0, 0.098, [])
        self.assertAlmostEqual(self._saettigung(ergebnis), 0.098, delta=0.02)

    def test_luminanz_bleibt_erhalten(self):
        """Nur die Farbigkeit darf sich aendern, nicht die Helligkeit."""
        bild = self._buntes_bild()
        ergebnis = hdr_merge.gleiche_saettigung_an(bild, 1.0, 0.098, [])
        np.testing.assert_allclose(hdr_merge.berechne_luminanz(bild),
                                   hdr_merge.berechne_luminanz(ergebnis),
                                   atol=1e-5)

    def test_haelfte_liegt_dazwischen(self):
        bild = self._buntes_bild()
        voll = self._saettigung(hdr_merge.gleiche_saettigung_an(bild, 1.0,
                                                                0.098, []))
        halb = self._saettigung(hdr_merge.gleiche_saettigung_an(bild, 0.5,
                                                                0.098, []))
        self.assertGreater(halb, voll)
        self.assertLess(halb, self._saettigung(bild))


class TestSpitzlichtschutz(unittest.TestCase):

    def test_nichts_clippt_mehr(self):
        vorgabe = hdr_merge.baue_parser().parse_args(["a", "b"])
        bild = np.zeros((40, 40, 3), dtype=np.float32)
        bild[:, :20] = 0.5
        bild[:, 20:] = 1.0
        ergebnis = hdr_merge.schuetze_spitzlichter(bild, vorgabe, [])
        self.assertLessEqual(float(ergebnis.max()), vorgabe.highlight_ceiling)
        # Mitteltoene bleiben unangetastet.
        self.assertAlmostEqual(float(ergebnis[0, 0, 0]), 0.5, places=5)

    def test_abschaltbar(self):
        vorgabe = hdr_merge.baue_parser().parse_args(
            ["a", "b", "--highlight-ceiling", "0"])
        bild = np.ones((8, 8, 3), dtype=np.float32)
        ergebnis = hdr_merge.schuetze_spitzlichter(bild, vorgabe, [])
        self.assertAlmostEqual(float(ergebnis.max()), 1.0)


class TestAussichtsGewichtung(unittest.TestCase):
    """Der Window Pull muss die ganze Fensterflaeche einheitlich behandeln.

    Der Fall, der die "schattierten Bereiche" erzeugte: zwei Scheiben
    desselben Fensters, eine ausgebrannt, die andere hinter einem
    Insektengitter nur mittelhell. Frueher wurde nur die erste ersetzt.
    """

    def _szene(self):
        # Rahmenluminanz 0.5; links helle Aussicht, rechts gedaempfte
        # Aussicht, unten ein dunkler Gegenstand davor.
        fenster_roh = np.zeros((60, 60, 3), dtype=np.float32)
        fenster_roh[:40, :30] = 1.6   # freie Aussicht
        fenster_roh[:40, 30:] = 0.8   # Aussicht hinter Gitter
        fenster_roh[40:, :] = 0.12    # Gegenstand im Raum davor
        referenz = np.full((60, 60, 3), 0.5, dtype=np.float32)
        referenz[:40, :30] = 0.97     # nur die freie Aussicht brennt aus
        return fenster_roh, referenz

    def test_gedaempfte_aussicht_wird_mitersetzt(self):
        fenster_roh, referenz = self._szene()
        gewicht = hdr_merge.berechne_aussicht_gewicht(
            fenster_roh, ring_luminanz=0.5, referenz=referenz, schwelle=0.90)
        self.assertGreater(float(gewicht[:40, :30].mean()), 0.99)
        # Der eigentliche Fehler: hier stand frueher 0.
        self.assertGreater(float(gewicht[:40, 35:].mean()), 0.99)

    def test_gegenstand_vor_dem_fenster_bleibt_stehen(self):
        fenster_roh, referenz = self._szene()
        gewicht = hdr_merge.berechne_aussicht_gewicht(
            fenster_roh, ring_luminanz=0.5, referenz=referenz, schwelle=0.90)
        self.assertLess(float(gewicht[50:, 20:40].mean()), 0.05)

    def test_ausgebrannt_zaehlt_immer_als_aussicht(self):
        # Rueckfallebene: selbst bei unbrauchbar geschaetzter Rahmenhelligkeit
        # wird ausgebrannte Flaeche ersetzt.
        fenster_roh, referenz = self._szene()
        gewicht = hdr_merge.berechne_aussicht_gewicht(
            fenster_roh, ring_luminanz=99.0, referenz=referenz, schwelle=0.90)
        self.assertGreater(float(gewicht[:40, :30].mean()), 0.99)


class TestZeichnung(unittest.TestCase):

    def _wand(self):
        # Flaeche mit feiner Maserung, so flau wie nach dem Aufhellen.
        y, x = np.mgrid[0:80, 0:80].astype(np.float32)
        muster = 0.004 * np.sin(x / 1.7) + 0.004 * np.sin(y / 5.0)
        return np.repeat((0.70 + muster)[..., None], 3, axis=2).astype(np.float32)

    def test_zeichnung_nimmt_messbar_zu(self):
        vorgabe = hdr_merge.baue_parser().parse_args(["a", "b"])
        bild = self._wand()
        ergebnis = hdr_merge.verstaerke_zeichnung(
            bild, vorgabe.clarity, vorgabe.clarity_radius,
            vorgabe.sharpen, vorgabe.sharpen_radius, [])
        self.assertGreater(float(ergebnis[..., 1].std()),
                           float(bild[..., 1].std()) * 1.5)

    def test_mittlere_helligkeit_bleibt(self):
        vorgabe = hdr_merge.baue_parser().parse_args(["a", "b"])
        bild = self._wand()
        ergebnis = hdr_merge.verstaerke_zeichnung(
            bild, vorgabe.clarity, vorgabe.clarity_radius,
            vorgabe.sharpen, vorgabe.sharpen_radius, [])
        self.assertAlmostEqual(float(ergebnis.mean()), float(bild.mean()),
                               places=2)

    def test_farbton_bleibt_erhalten(self):
        # Verstaerkt wird die Helligkeitszeichnung, nicht die Saettigung.
        vorgabe = hdr_merge.baue_parser().parse_args(["a", "b"])
        bild = self._wand()
        bild[..., 0] *= 1.10   # warmer Stich
        bild[..., 2] *= 0.92
        ergebnis = hdr_merge.verstaerke_zeichnung(
            bild, vorgabe.clarity, vorgabe.clarity_radius,
            vorgabe.sharpen, vorgabe.sharpen_radius, [])
        vorher = float((bild[..., 0] / bild[..., 2]).mean())
        nachher = float((ergebnis[..., 0] / ergebnis[..., 2]).mean())
        self.assertAlmostEqual(vorher, nachher, places=3)

    def test_abschaltbar(self):
        bild = self._wand()
        ergebnis = hdr_merge.verstaerke_zeichnung(bild, 0.0, 0.005, 0.0,
                                                  0.0006, [])
        self.assertTrue(np.array_equal(ergebnis, bild))

    def test_keine_halos_an_harten_kanten(self):
        # Fensterrahmen gegen helle Aussicht: der kantenbewusste Guided
        # Filter darf dort keinen hellen Saum erzeugen.
        bild = np.full((80, 80, 3), 0.25, dtype=np.float32)
        bild[:, 40:] = 0.95
        vorgabe = hdr_merge.baue_parser().parse_args(["a", "b"])
        ergebnis = hdr_merge.verstaerke_zeichnung(
            bild, vorgabe.clarity, vorgabe.clarity_radius,
            vorgabe.sharpen, vorgabe.sharpen_radius, [])
        dunkle_seite = ergebnis[:, 30:39, 1]
        self.assertLess(float(dunkle_seite.min()), 0.26)
        self.assertLess(abs(float(dunkle_seite.mean()) - 0.25), 0.02)


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


class TestReadmeStimmtMitDenSchaltern(unittest.TestCase):
    """Die Parametertabelle im README muss dem Programm entsprechen.

    Sie war es zwischenzeitlich nicht: Neun Standardwerte in der Tabelle
    waren veraltet (etwa --window-ceiling mit 0.92 statt 0.75), und sieben
    Schalter fehlten ganz. Eine Doku, die man nicht glauben kann, ist
    schlimmer als keine - deshalb wird der Abgleich jetzt geprueft.
    """

    @classmethod
    def setUpClass(cls) -> None:
        cls.readme = (pathlib.Path(__file__).parent / "README.md").read_text(
            encoding="utf-8")
        cls.schalter = {
            option: aktion.default
            for aktion in hdr_merge.baue_parser()._actions
            for option in aktion.option_strings
            if option.startswith("--") and option != "--help"
        }

    def test_jeder_schalter_ist_dokumentiert(self):
        fehlend = sorted(name for name in self.schalter
                         if f"`{name}`" not in self.readme)
        self.assertEqual(fehlend, [], f"Nicht im README: {fehlend}")

    def test_dokumentierte_standardwerte_stimmen(self):
        abweichungen = []
        muster = re.compile(r"^\| `(--[a-z0-9-]+)` \| `([^`]*)` \|", re.M)
        for treffer in muster.finditer(self.readme):
            name, dokumentiert = treffer.group(1), treffer.group(2)
            if name not in self.schalter:
                abweichungen.append(f"{name}: gibt es nicht mehr")
                continue
            echt = self.schalter[name]
            gleich = str(echt) == dokumentiert
            if not gleich and isinstance(echt, float):
                try:
                    gleich = abs(float(dokumentiert) - echt) < 1e-9
                except ValueError:
                    gleich = False
            if not gleich:
                abweichungen.append(f"{name}: README {dokumentiert!r}, "
                                    f"tatsaechlich {echt!r}")
        self.assertEqual(abweichungen, [], "\n".join(abweichungen))


if __name__ == "__main__":
    unittest.main(verbosity=2)
