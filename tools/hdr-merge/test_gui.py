#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
test_gui.py -- Tests fuer die Oberflaeche ohne Fenstersystem.

Warum es diese Tests gibt: Die Oberflaeche ist inzwischen der Hauptweg ins
Programm. Sie laesst sich aber nur dort starten, wo tkinter vorhanden ist -
auf einem Bauserver oder in einer schlanken Umgebung ist es das nicht. Ein
Tippfehler im Aufbau des Fensters wuerde also erst beim Anwender auffallen,
und dann ist das gesamte Werkzeug unerreichbar.

Deshalb wird tkinter hier durch einen Ersatz gestellt, der jeden Aufruf
annimmt und protokolliert. Damit laeuft der komplette Aufbau des Fensters
durch. Das faengt nicht alles - ob eine ttk-Option gueltig ist, weiss nur
das echte tkinter -, aber es faengt die haeufigsten Fehler: falsch
geschriebene Methodennamen, in der falschen Reihenfolge angelegte
Variablen, vergessene Rueckgabewerte, kaputte Signaturen.

Aufruf:
    python test_gui.py
"""

from __future__ import annotations

import importlib.util
import sys
import types
import unittest
from pathlib import Path

ORDNER = Path(__file__).resolve().parent


class Attrappe:
    """Nimmt jeden Aufruf, jedes Attribut und jeden Index an.

    Bewusst so nachgiebig: Der Zweck ist, den Aufbau des Fensters bis zum
    Ende durchlaufen zu lassen. Alles, was dabei wirklich schiefgeht -
    fehlende Namen, falsche Reihenfolgen - schlaegt trotzdem durch, weil
    Python es vor dem Ersatz bemerkt.
    """

    def __init__(self, *args, **kwargs):
        self._kinder: dict = {}

    def __call__(self, *args, **kwargs):
        return Attrappe()

    def __getattr__(self, name):
        if name.startswith("__"):
            raise AttributeError(name)
        return Attrappe()

    def __getitem__(self, name):
        return 0

    def __setitem__(self, name, wert):
        pass

    def __iter__(self):
        return iter(())


class Variable(Attrappe):
    """StringVar/BooleanVar/DoubleVar - der Wert muss echt sein."""

    def __init__(self, value=None, **kwargs):
        super().__init__()
        self._wert = value

    def get(self):
        return self._wert

    def set(self, wert):
        self._wert = wert


class Fenster(Attrappe):
    """Ersatz fuer tk.Tk: merkt sich, was zeitversetzt aufgerufen wurde."""

    def __init__(self, *args, **kwargs):
        super().__init__()
        self.aufgeschoben: list = []

    def after(self, verzoegerung, rueckruf=None, *args):
        if rueckruf is not None:
            self.aufgeschoben.append((verzoegerung, rueckruf))
        return "id"


def baue_tkinter_ersatz() -> tuple[types.ModuleType, types.ModuleType]:
    tk = types.ModuleType("tkinter")
    for name in ("Frame", "Label", "Entry", "Text", "Canvas", "Toplevel",
                 "PhotoImage", "Menu", "Scrollbar"):
        setattr(tk, name, Attrappe)
    tk.Tk = Fenster
    tk.StringVar = Variable
    tk.BooleanVar = Variable
    tk.DoubleVar = Variable
    tk.IntVar = Variable
    tk.TclError = Exception

    ttk = types.ModuleType("tkinter.ttk")
    for name in ("Frame", "Label", "Button", "Scale", "Checkbutton",
                 "Combobox", "Progressbar", "Treeview", "Style",
                 "Separator", "Notebook"):
        setattr(ttk, name, Attrappe)

    dialoge = types.ModuleType("tkinter.filedialog")
    dialoge.askdirectory = lambda **kwargs: ""
    kaesten = types.ModuleType("tkinter.messagebox")
    kaesten.showerror = lambda *a, **k: None
    kaesten.showinfo = lambda *a, **k: None
    kaesten.askyesno = lambda *a, **k: False
    kaesten.askyesnocancel = lambda *a, **k: False

    tk.filedialog = dialoge
    tk.messagebox = kaesten
    tk.ttk = ttk
    return tk, ttk


def lade_oberflaeche():
    """Laedt hdr_merge_gui.pyw mit dem tkinter-Ersatz."""
    tk, ttk = baue_tkinter_ersatz()
    gesichert = {name: sys.modules.get(name) for name in
                 ("tkinter", "tkinter.ttk", "tkinter.filedialog",
                  "tkinter.messagebox")}
    sys.modules["tkinter"] = tk
    sys.modules["tkinter.ttk"] = ttk
    sys.modules["tkinter.filedialog"] = tk.filedialog
    sys.modules["tkinter.messagebox"] = tk.messagebox
    try:
        spezifikation = importlib.util.spec_from_loader(
            "hdr_merge_gui",
            importlib.machinery.SourceFileLoader(
                "hdr_merge_gui", str(ORDNER / "hdr_merge_gui.pyw")))
        modul = importlib.util.module_from_spec(spezifikation)
        spezifikation.loader.exec_module(modul)
        return modul
    finally:
        for name, wert in gesichert.items():
            if wert is None:
                sys.modules.pop(name, None)
            else:
                sys.modules[name] = wert


class TestOberflaecheLaedt(unittest.TestCase):

    @classmethod
    def setUpClass(cls) -> None:
        cls.gui = lade_oberflaeche()

    def test_modul_laedt_durch(self):
        self.assertTrue(hasattr(self.gui, "Anwendung"))
        self.assertTrue(hasattr(self.gui, "REGLER"))

    def test_fenster_baut_sich_vollstaendig_auf(self):
        """Der eigentliche Zweck: Der komplette Aufbau muss durchlaufen.

        Hier faellt auf, wenn eine Methode falsch heisst, eine Variable zu
        spaet angelegt wird oder eine Signatur nicht passt.
        """
        anwendung = self.gui.Anwendung()
        self.assertIsNotNone(anwendung)
        # Die Regler muessen tatsaechlich angelegt worden sein.
        for regler in self.gui.REGLER:
            self.assertIn(regler.schluessel, anwendung.werte)
            self.assertAlmostEqual(
                float(anwendung.werte[regler.schluessel].get()),
                regler.standard, places=6)

    def test_zuruecksetzen_stellt_die_standards_her(self):
        anwendung = self.gui.Anwendung()
        for regler in self.gui.REGLER:
            anwendung.werte[regler.schluessel].set(regler.minimum)
        anwendung._setze_zurueck()
        for regler in self.gui.REGLER:
            self.assertAlmostEqual(
                float(anwendung.werte[regler.schluessel].get()),
                regler.standard, places=6)

    def test_aufruf_enthaelt_nur_abweichende_werte(self):
        """Bei unveraenderten Reglern darf kein Schalter uebergeben werden.

        Sonst wuerde die Oberflaeche die Voreinstellungen des Programms
        ueberschreiben - und zwar mit denselben Zahlen, aber eingefroren:
        Eine spaetere Nachkalibrierung im Programm kaeme nie an.
        """
        anwendung = self.gui.Anwendung()
        argumente = anwendung._baue_argumente(Path("/ein"), Path("/aus"))
        for regler in self.gui.REGLER:
            self.assertNotIn(regler.schalter, argumente)
        self.assertIn("/ein", argumente)
        self.assertIn("/aus", argumente)

    def test_geaenderter_regler_landet_im_aufruf(self):
        anwendung = self.gui.Anwendung()
        anwendung.werte["helligkeit"].set(0.50)
        argumente = anwendung._baue_argumente(Path("/ein"), Path("/aus"))
        self.assertIn("--mid-target", argumente)
        self.assertEqual(argumente[argumente.index("--mid-target") + 1],
                         "0.5000")

    def test_schalter_fuer_ausrichten_und_aufrichten(self):
        anwendung = self.gui.Anwendung()
        anwendung.ausrichten.set(False)
        anwendung.aufrichten.set(True)
        argumente = anwendung._baue_argumente(Path("/ein"), Path("/aus"))
        self.assertIn("--no-align", argumente)
        self.assertIn("--straighten", argumente)

    def test_vorhandene_ergebnisse_werden_gezaehlt(self):
        import tempfile
        anwendung = self.gui.Anwendung()

        class Aufnahme:
            def __init__(self, stamm):
                self.pfad = Path(f"/x/{stamm}.ARW")

        anwendung.reihen = [[Aufnahme("A")], [Aufnahme("B")]]
        with tempfile.TemporaryDirectory() as ordner:
            ziel = Path(ordner)
            self.assertEqual(anwendung._zaehle_vorhandene(ziel), 0)
            (ziel / "A_hdr.tif").write_bytes(b"x")
            self.assertEqual(anwendung._zaehle_vorhandene(ziel), 1)

    def test_vorschau_rechnet_wirklich(self):
        """Der Vorschau-Pfad der Oberflaeche, mit echten Bilddaten.

        Er baut aus den Reglerstellungen die Argumente zusammen und ruft
        den Rechenkern - genau hier faellt auf, wenn ein Reglername nicht
        zum Schalter im Programm passt.
        """
        import numpy as np
        anwendung = self.gui.Anwendung()
        hoehe, breite = 90, 140
        rauschen = np.random.default_rng(7).random((hoehe, breite, 3))
        anwendung.vorschau_bilder = [
            (rauschen * faktor).astype(np.float32).clip(0, 1)
            for faktor in (0.25, 0.55, 0.95)]
        anwendung.vorschau_marke = 1
        anwendung._vorschau_rechnen(1)
        art, nutzlast = anwendung.meldungen.get_nowait()
        self.assertEqual(art, "vorschau",
                         f"Vorschau meldete stattdessen: {nutzlast}")
        self.assertEqual(nutzlast.shape, (hoehe, breite, 3))
        self.assertGreaterEqual(float(nutzlast.min()), 0.0)
        self.assertLessEqual(float(nutzlast.max()), 1.0)

    def test_veraltete_vorschau_wird_verworfen(self):
        """Wer schnell dreht, darf kein altes Bild zu sehen bekommen."""
        import numpy as np
        anwendung = self.gui.Anwendung()
        rauschen = np.random.default_rng(3).random((60, 90, 3))
        anwendung.vorschau_bilder = [
            (rauschen * f).astype(np.float32).clip(0, 1) for f in (0.3, 0.6, 0.9)]
        anwendung.vorschau_marke = 5          # inzwischen weitergedreht
        anwendung._vorschau_rechnen(4)        # veralteter Auftrag
        self.assertTrue(anwendung.meldungen.empty())

    def test_regler_bleiben_innerhalb_ihrer_grenzen(self):
        for regler in self.gui.REGLER:
            with self.subTest(regler=regler.titel):
                self.assertLess(regler.minimum, regler.maximum)
                self.assertGreaterEqual(regler.standard, regler.minimum)
                self.assertLessEqual(regler.standard, regler.maximum)


if __name__ == "__main__":
    unittest.main(verbosity=2)
