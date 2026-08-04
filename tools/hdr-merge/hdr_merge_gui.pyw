#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
hdr_merge_gui.pyw -- Fenster-Oberflaeche fuer hdr_merge.py.

Ablauf aus Sicht des Anwenders:

    Ordner waehlen  ->  Reihen werden automatisch erkannt und angezeigt
                    ->  Verarbeitung laeuft automatisch los
                    ->  fertige 16-Bit-TIFFs im Zielordner

Die Oberflaeche ist bewusst nur eine Huelle: Die Bildverarbeitung laeuft
unveraendert in hdr_merge.py als eigener Prozess. Damit ist das Ergebnis
identisch, egal ob ueber die Kommandozeile oder ueber dieses Fenster
gestartet wird - und ein Absturz der Verarbeitung kann die Oberflaeche
nicht mitreissen.

Verwendet ausschliesslich tkinter aus der Standardbibliothek, also keine
zusaetzliche Abhaengigkeit. Die Endung .pyw sorgt unter Windows dafuer, dass
kein schwarzes Konsolenfenster mitstartet.

Ein Ordner kann auch direkt auf das Programmsymbol gezogen werden - er wird
dann als Argument uebergeben und sofort analysiert.
"""

from __future__ import annotations

import importlib.util
import os
import queue
import re
import subprocess
import sys
import threading
import tkinter as tk
from pathlib import Path
from tkinter import filedialog, messagebox, ttk

ORDNER = Path(__file__).resolve().parent
HDR_MERGE = ORDNER / "hdr_merge.py"
TESTSZENE_SKRIPT = ORDNER / "make_reference_scene.py"
BEISPIEL_EINGABE = ORDNER / "Beispiel" / "aufnahmen"
BEISPIEL_AUSGABE = ORDNER / "Beispiel" / "ergebnis"

# Ohne diese drei laeuft gar nichts.
BENOETIGTE_PAKETE = {
    "numpy": ("Rechenkern", "numpy"),
    "cv2": ("Bildverarbeitung", "opencv-python"),
    "tifffile": ("TIFF-Dateien", "tifffile"),
}
# rawpy wird nur fuer RAW-Dateien gebraucht. Fuer sehr neue Python-Versionen
# gibt es manchmal noch kein fertiges Paket - dann funktioniert die
# Verarbeitung von TIFFs trotzdem, und das Programm sagt das auch.
OPTIONALE_PAKETE = {
    "rawpy": ("RAW-Entwicklung (CR2, NEF, ARW, DNG, RAF)", "rawpy"),
}

# Erkennt im Protokoll der Verarbeitung, dass eine Reihe fertig ist.
FERTIG_MUSTER = re.compile(r"\[(?P<name>[^\]]+)\]\s+Fertig:")


def python_programm() -> str:
    """Pfad zum Python-Programm fuer die Unterprozesse.

    Beim Start ueber .pyw laeuft die Oberflaeche in pythonw.exe. Fuer die
    Verarbeitung wird nach Moeglichkeit die normale python.exe genommen,
    weil die Parallelverarbeitung darauf zuverlaessiger arbeitet.
    """
    programm = Path(sys.executable)
    if programm.name.lower() == "pythonw.exe":
        normal = programm.with_name("python.exe")
        if normal.exists():
            return str(normal)
    return str(programm)


def ohne_konsolenfenster() -> dict:
    """Sorgt dafuer, dass Unterprozesse unter Windows kein Fenster aufblitzen."""
    if os.name != "nt":
        return {}
    return {"creationflags": getattr(subprocess, "CREATE_NO_WINDOW", 0)}


def fehlende_pakete() -> list[str]:
    """Pflichtpakete, die noch fehlen."""
    return [name for name in BENOETIGTE_PAKETE
            if importlib.util.find_spec(name) is None]


def fehlende_optionale_pakete() -> list[str]:
    return [name for name in OPTIONALE_PAKETE
            if importlib.util.find_spec(name) is None]


def installiere_pakete(namen: dict, meldung) -> list[str]:
    """Installiert Pakete EINZELN und meldet, was nicht geklappt hat.

    Einzeln deshalb, weil ein einziges nicht verfuegbares Paket sonst den
    gesamten Aufruf abbricht und damit auch die Pakete blockiert, die
    problemlos installierbar waeren.
    """
    gescheitert = []
    for modul, (beschreibung, paket) in namen.items():
        if importlib.util.find_spec(modul) is not None:
            continue
        meldung(f"--- {beschreibung} wird eingerichtet ({paket}) ...")
        ergebnis = subprocess.run(
            [python_programm(), "-m", "pip", "install", paket],
            capture_output=True, text=True, encoding="utf-8",
            errors="replace", **ohne_konsolenfenster())
        for zeile in (ergebnis.stdout or "").splitlines()[-6:]:
            meldung(zeile)
        if ergebnis.returncode != 0:
            gescheitert.append(modul)
            for zeile in (ergebnis.stderr or "").splitlines()[-4:]:
                meldung("ERROR " + zeile)
    return gescheitert


class Anwendung(tk.Tk):

    def __init__(self, startordner: str | None = None) -> None:
        super().__init__()
        self.title("HDR Merge - Basisbilder fuer Lightroom")
        self.minsize(900, 720)

        self.prozess: subprocess.Popen | None = None
        self.meldungen: queue.Queue = queue.Queue()
        self.letzter_ausgabeordner: Path | None = None
        self.gruppen: list[list] = []
        self.fertige_reihen = 0
        self.abgebrochen = False

        self._baue_oberflaeche()
        self.after(100, self._verarbeite_meldungen)
        self.protocol("WM_DELETE_WINDOW", self._beim_schliessen)

        if startordner:
            self.eingabe_feld.insert(0, startordner)
            self.after(400, self._analysiere)
        self.after(300, self._pruefe_pakete)

    # -----------------------------------------------------------------
    # Aufbau
    # -----------------------------------------------------------------

    def _baue_oberflaeche(self) -> None:
        rahmen = ttk.Frame(self, padding=12)
        rahmen.pack(fill="both", expand=True)
        rahmen.columnconfigure(0, weight=1)
        rahmen.rowconfigure(3, weight=3)
        rahmen.rowconfigure(7, weight=2)

        # --- Schritt 1: Ordner --------------------------------------------
        schritt1 = ttk.LabelFrame(rahmen, padding=10,
                                  text="1. Ordner mit den Aufnahmen")
        schritt1.grid(row=0, column=0, sticky="ew")
        schritt1.columnconfigure(0, weight=1)

        self.eingabe_feld = ttk.Entry(schritt1)
        self.eingabe_feld.grid(row=0, column=0, sticky="ew")
        ttk.Button(schritt1, text="Ordner waehlen ...",
                   command=self._waehle_eingabe).grid(row=0, column=1,
                                                      padx=(8, 0))
        ttk.Button(schritt1, text="Neu einlesen",
                   command=self._analysiere).grid(row=0, column=2, padx=(8, 0))
        ttk.Label(schritt1, foreground="#5a5a5a",
                  text="RAW (CR2, NEF, ARW, DNG, RAF) oder 16-Bit-TIFF. "
                       "Unterordner werden nicht durchsucht.").grid(
            row=1, column=0, columnspan=3, sticky="w", pady=(6, 0))

        # --- Schritt 2: erkannte Reihen -----------------------------------
        schritt2 = ttk.LabelFrame(rahmen, padding=10,
                                  text="2. Erkannte Belichtungsreihen")
        schritt2.grid(row=1, column=0, sticky="nsew", pady=(10, 0))
        rahmen.rowconfigure(1, weight=3)
        schritt2.columnconfigure(0, weight=1)
        schritt2.rowconfigure(0, weight=1)

        spalten = ("reihe", "anzahl", "dateien", "ev", "status")
        self.tabelle = ttk.Treeview(schritt2, columns=spalten, show="headings",
                                    height=8)
        for spalte, text, breite in (("reihe", "Reihe", 60),
                                     ("anzahl", "Bilder", 60),
                                     ("dateien", "Dateien", 380),
                                     ("ev", "EV-Muster", 150),
                                     ("status", "Status", 120)):
            self.tabelle.heading(spalte, text=text)
            self.tabelle.column(spalte, width=breite,
                                anchor="w" if spalte == "dateien" else "center")
        self.tabelle.grid(row=0, column=0, sticky="nsew")
        leiste = ttk.Scrollbar(schritt2, orient="vertical",
                               command=self.tabelle.yview)
        leiste.grid(row=0, column=1, sticky="ns")
        self.tabelle.configure(yscrollcommand=leiste.set)
        self.tabelle.tag_configure("warnung", background="#fff4d6")
        self.tabelle.tag_configure("fertig", background="#e4f6e4")

        self.zusammenfassung = ttk.Label(schritt2, text="Noch kein Ordner "
                                                        "eingelesen.")
        self.zusammenfassung.grid(row=1, column=0, columnspan=2, sticky="w",
                                  pady=(8, 0))

        # --- Schritt 3: Einstellungen --------------------------------------
        schritt3 = ttk.LabelFrame(rahmen, padding=10, text="3. Einstellungen")
        schritt3.grid(row=2, column=0, sticky="ew", pady=(10, 0))
        schritt3.columnconfigure(3, weight=1)

        self.stativ = tk.BooleanVar(value=False)
        ttk.Checkbutton(schritt3, text="Vom Stativ (Ausrichtung ueberspringen)",
                        variable=self.stativ).grid(row=0, column=0, sticky="w")
        self.vorschau = tk.BooleanVar(value=True)
        ttk.Checkbutton(schritt3, text="Kontaktbogen zum Pruefen",
                        variable=self.vorschau).grid(row=0, column=1,
                                                     sticky="w", padx=(16, 0))
        self.begradigen = tk.BooleanVar(value=False)
        ttk.Checkbutton(schritt3, text="Stuerzende Linien begradigen",
                        variable=self.begradigen).grid(row=0, column=2,
                                                       sticky="w", padx=(16, 0))
        self.sofort_starten = tk.BooleanVar(value=True)
        ttk.Checkbutton(schritt3, text="Nach dem Einlesen sofort starten",
                        variable=self.sofort_starten).grid(row=1, column=0,
                                                           sticky="w",
                                                           pady=(6, 0))
        self.basiston = tk.BooleanVar(value=True)
        ttk.Checkbutton(schritt3, text="Auf einheitliche Helligkeit bringen",
                        variable=self.basiston).grid(row=1, column=1,
                                                     sticky="w", padx=(16, 0),
                                                     pady=(6, 0))

        regler = ttk.Frame(schritt3)
        regler.grid(row=2, column=0, columnspan=4, sticky="ew", pady=(10, 0))
        regler.columnconfigure(1, weight=1)
        regler.columnconfigure(4, weight=1)

        ttk.Label(regler, text="Helligkeit:").grid(row=0, column=0, sticky="w")
        self.helligkeit = tk.DoubleVar(value=0.55)
        ttk.Scale(regler, from_=0.35, to=0.75, variable=self.helligkeit,
                  command=lambda _: self.helligkeit_text.configure(
                      text=f"{self.helligkeit.get():.2f}")).grid(
            row=0, column=1, sticky="ew", padx=8)
        self.helligkeit_text = ttk.Label(regler, text="0.55", width=5)
        self.helligkeit_text.grid(row=0, column=2)

        ttk.Label(regler, text="Fenster zurueckholen:").grid(row=0, column=3,
                                                             sticky="w",
                                                             padx=(20, 0))
        self.staerke = tk.DoubleVar(value=0.8)
        ttk.Scale(regler, from_=0.0, to=1.0, variable=self.staerke,
                  command=lambda _: self.staerke_text.configure(
                      text=f"{self.staerke.get():.2f}")).grid(
            row=0, column=4, sticky="ew", padx=8)
        self.staerke_text = ttk.Label(regler, text="0.80", width=5)
        self.staerke_text.grid(row=0, column=5)

        # --- Schritt 4: Zielordner und Start --------------------------------
        schritt4 = ttk.LabelFrame(rahmen, padding=10, text="4. Zielordner")
        schritt4.grid(row=3, column=0, sticky="ew", pady=(10, 0))
        schritt4.columnconfigure(0, weight=1)
        self.ausgabe_feld = ttk.Entry(schritt4)
        self.ausgabe_feld.grid(row=0, column=0, sticky="ew")
        ttk.Button(schritt4, text="Waehlen ...",
                   command=self._waehle_ausgabe).grid(row=0, column=1,
                                                      padx=(8, 0))
        ttk.Label(schritt4, foreground="#5a5a5a",
                  text="Ausgabe: unkomprimiertes 16-Bit-TIFF (sRGB), direkt in "
                       "Lightroom und Photoshop weiterverarbeitbar.").grid(
            row=1, column=0, columnspan=2, sticky="w", pady=(6, 0))

        knopfreihe = ttk.Frame(rahmen)
        knopfreihe.grid(row=4, column=0, sticky="ew", pady=(12, 0))
        self.start_knopf = ttk.Button(knopfreihe, text="Verarbeitung starten",
                                      command=self._starte_verarbeitung,
                                      state="disabled")
        self.start_knopf.pack(side="left")
        self.abbruch_knopf = ttk.Button(knopfreihe, text="Abbrechen",
                                        command=self._brich_ab,
                                        state="disabled")
        self.abbruch_knopf.pack(side="left", padx=(8, 0))
        ttk.Button(knopfreihe, text="Probelauf mit Beispielbildern",
                   command=self._starte_probelauf).pack(side="left", padx=(8, 0))
        self.oeffnen_knopf = ttk.Button(knopfreihe, text="Ergebnisordner oeffnen",
                                        command=self._oeffne_ausgabe,
                                        state="disabled")
        self.oeffnen_knopf.pack(side="right")

        self.fortschritt = ttk.Progressbar(rahmen, mode="determinate")
        self.fortschritt.grid(row=5, column=0, sticky="ew", pady=(10, 0))

        # --- Protokoll -------------------------------------------------------
        ttk.Label(rahmen, text="Protokoll").grid(row=6, column=0, sticky="w",
                                                 pady=(10, 2))
        protokoll_rahmen = ttk.Frame(rahmen)
        protokoll_rahmen.grid(row=7, column=0, sticky="nsew")
        protokoll_rahmen.columnconfigure(0, weight=1)
        protokoll_rahmen.rowconfigure(0, weight=1)
        self.protokoll = tk.Text(protokoll_rahmen, height=10, wrap="word",
                                 state="disabled", background="#1e1e1e",
                                 foreground="#e6e6e6", relief="flat")
        self.protokoll.grid(row=0, column=0, sticky="nsew")
        leiste2 = ttk.Scrollbar(protokoll_rahmen, orient="vertical",
                                command=self.protokoll.yview)
        leiste2.grid(row=0, column=1, sticky="ns")
        self.protokoll.configure(yscrollcommand=leiste2.set)
        self.protokoll.tag_configure("warnung", foreground="#ffc861")
        self.protokoll.tag_configure("fehler", foreground="#ff8a80")
        self.protokoll.tag_configure("erfolg", foreground="#9ae6a0")
        self.protokoll.tag_configure("hinweis", foreground="#8fc7ff")

        self.status = ttk.Label(rahmen, text="Bereit.", anchor="w")
        self.status.grid(row=8, column=0, sticky="ew", pady=(8, 0))

    # -----------------------------------------------------------------
    # Protokoll
    # -----------------------------------------------------------------

    def _schreibe(self, text: str, kennzeichen: str = "") -> None:
        self.protokoll.configure(state="normal")
        self.protokoll.insert("end", text + "\n", kennzeichen)
        self.protokoll.see("end")
        self.protokoll.configure(state="disabled")

    def _verarbeite_meldungen(self) -> None:
        try:
            while True:
                art, nutzlast = self.meldungen.get_nowait()
                if art == "zeile":
                    self._zeige_zeile(nutzlast)
                elif art == "ende":
                    self._verarbeitung_beendet(nutzlast)
                elif art == "analyse":
                    self._zeige_analyse(nutzlast)
                elif art == "einrichtung":
                    self._einrichtung_beendet(nutzlast)
        except queue.Empty:
            pass
        self.after(100, self._verarbeite_meldungen)

    def _zeige_zeile(self, zeile: str) -> None:
        kennzeichen = ""
        if zeile.startswith("WARNING"):
            kennzeichen = "warnung"
        elif zeile.startswith(("ERROR", "CRITICAL", "Traceback")):
            kennzeichen = "fehler"
        elif "Fertig:" in zeile or "Successfully" in zeile:
            kennzeichen = "erfolg"
        self._schreibe(zeile, kennzeichen)

        treffer = FERTIG_MUSTER.search(zeile)
        if treffer:
            self.fertige_reihen += 1
            self.fortschritt["value"] = self.fertige_reihen
            gesamt = max(len(self.gruppen), self.fertige_reihen)
            self.status.configure(
                text=f"Verarbeitet: {self.fertige_reihen} von {gesamt} Reihen")
            self._markiere_fertig(treffer.group("name"))

    def _markiere_fertig(self, name: str) -> None:
        for eintrag in self.tabelle.get_children():
            werte = self.tabelle.item(eintrag, "values")
            if werte and werte[2].split(",")[0].strip().startswith(name):
                self.tabelle.item(eintrag, values=(werte[0], werte[1], werte[2],
                                                   werte[3], "fertig"),
                                  tags=("fertig",))
                return

    # -----------------------------------------------------------------
    # Pakete
    # -----------------------------------------------------------------

    def _pruefe_pakete(self) -> None:
        pflicht = fehlende_pakete()
        optional = fehlende_optionale_pakete()
        if not pflicht and not optional:
            self._schreibe("Alle benoetigten Bausteine sind vorhanden.",
                           "erfolg")
            return

        zeilen = [f"  - {BENOETIGTE_PAKETE[n][0]}" for n in pflicht]
        zeilen += [f"  - {OPTIONALE_PAKETE[n][0]}" for n in optional]
        if not messagebox.askyesno(
                "Einrichtung noetig",
                "Beim ersten Start fehlen noch diese Bausteine:\n\n"
                + "\n".join(zeilen) +
                "\n\nSollen sie jetzt heruntergeladen und eingerichtet "
                "werden?\nDas dauert ein bis zwei Minuten und ist nur "
                "einmal noetig."):
            self._schreibe("Einrichtung abgelehnt - die Verarbeitung kann noch "
                           "nicht starten.", "warnung")
            return

        self.start_knopf.configure(state="disabled")
        self.status.configure(text="Bausteine werden eingerichtet ...")
        threading.Thread(target=self._richte_ein, daemon=True).start()

    def _richte_ein(self) -> None:
        """Installiert die fehlenden Pakete im Hintergrund."""
        def melde(text: str) -> None:
            self.meldungen.put(("zeile", text))

        gescheitert = installiere_pakete(BENOETIGTE_PAKETE, melde)
        gescheitert += installiere_pakete(OPTIONALE_PAKETE, melde)
        self.meldungen.put(("einrichtung", gescheitert))

    def _einrichtung_beendet(self, gescheitert: list[str]) -> None:
        pflicht = [n for n in gescheitert if n in BENOETIGTE_PAKETE]
        if pflicht:
            namen = ", ".join(BENOETIGTE_PAKETE[n][1] for n in pflicht)
            self._schreibe(f"ERROR Diese Bausteine liessen sich nicht "
                           f"einrichten: {namen}", "fehler")
            messagebox.showerror(
                "Einrichtung fehlgeschlagen",
                f"Diese Bausteine liessen sich nicht einrichten:\n\n{namen}"
                "\n\nHaeufigste Ursache: eine sehr neue Python-Version, fuer "
                "die es noch keine fertigen Pakete gibt.\n\nAbhilfe: Python "
                "3.12 zusaetzlich installieren und das Programm damit starten.")
            self.status.configure(text="Einrichtung fehlgeschlagen.")
            return

        if "rawpy" in gescheitert:
            self._schreibe(
                "WARNING Die RAW-Entwicklung (rawpy) liess sich nicht "
                "einrichten. 16-Bit-TIFFs funktionieren, RAW-Dateien nicht. "
                "Meist liegt das an einer sehr neuen Python-Version - mit "
                "Python 3.12 klappt es.", "warnung")
            messagebox.showwarning(
                "RAW-Entwicklung nicht verfuegbar",
                "Alles Wichtige ist eingerichtet, nur die RAW-Entwicklung "
                "nicht.\n\nDas Programm verarbeitet damit 16-Bit-TIFFs, aber "
                "keine CR2-, NEF-, ARW-, DNG- oder RAF-Dateien.\n\n"
                "Haeufigste Ursache ist eine sehr neue Python-Version. Mit "
                "Python 3.12 laesst sich rawpy nachinstallieren.")
        else:
            self._schreibe("Einrichtung abgeschlossen.", "erfolg")
        self.status.configure(text="Bereit.")
        if self.gruppen:
            self.start_knopf.configure(state="normal")

    # -----------------------------------------------------------------
    # Analyse der Belichtungsreihen
    # -----------------------------------------------------------------

    def _waehle_eingabe(self) -> None:
        ordner = filedialog.askdirectory(title="Ordner mit den Aufnahmen")
        if not ordner:
            return
        self.eingabe_feld.delete(0, "end")
        self.eingabe_feld.insert(0, ordner)
        self._analysiere()

    def _waehle_ausgabe(self) -> None:
        ordner = filedialog.askdirectory(title="Zielordner")
        if ordner:
            self.ausgabe_feld.delete(0, "end")
            self.ausgabe_feld.insert(0, ordner)

    def _analysiere(self) -> None:
        """Liest den Ordner ein und erkennt die Belichtungsreihen."""
        eingabe = Path(self.eingabe_feld.get().strip())
        if not eingabe.is_dir():
            messagebox.showerror("Ordner fehlt",
                                 "Bitte zuerst einen Ordner mit Aufnahmen "
                                 "auswaehlen.")
            return
        if fehlende_pakete():
            self._schreibe("Bausteine fehlen noch - Analyse nicht moeglich.",
                           "warnung")
            return
        if not self.ausgabe_feld.get().strip():
            self.ausgabe_feld.insert(0, str(eingabe.parent / "Basisbilder"))

        self.status.configure(text="Ordner wird eingelesen ...")
        self._schreibe(f"--- Lese {eingabe} ein ...", "hinweis")
        threading.Thread(target=self._analysiere_im_hintergrund,
                         args=(eingabe,), daemon=True).start()

    def _analysiere_im_hintergrund(self, eingabe: Path) -> None:
        try:
            import hdr_merge
            aufnahmen = hdr_merge.sammle_aufnahmen(eingabe)
            gruppen = hdr_merge.gruppiere_belichtungsreihen(aufnahmen, "auto",
                                                            6.0)
            self.meldungen.put(("analyse", (aufnahmen, gruppen)))
        except Exception as fehler:  # pragma: no cover
            self.meldungen.put(("zeile", f"ERROR Analyse fehlgeschlagen: "
                                         f"{fehler}"))

    def _zeige_analyse(self, daten: tuple) -> None:
        aufnahmen, gruppen = daten
        self.gruppen = gruppen
        for eintrag in self.tabelle.get_children():
            self.tabelle.delete(eintrag)

        auffaellig = 0
        for i, gruppe in enumerate(gruppen, 1):
            namen = ", ".join(a.pfad.name for a in gruppe)
            evs = ", ".join(f"{a.ev:.1f}" if a.ev is not None else "?"
                            for a in gruppe)
            passend = len(gruppe) in (3, 5, 7)
            if not passend:
                auffaellig += 1
            self.tabelle.insert(
                "", "end",
                values=(f"{i:02d}", len(gruppe),
                        namen if len(namen) < 90 else namen[:87] + "...",
                        evs if len(evs) < 30 else evs[:27] + "...",
                        "bereit" if passend else "pruefen!"),
                tags=() if passend else ("warnung",))

        text = (f"{len(aufnahmen)} Dateien, {len(gruppen)} Belichtungsreihen "
                f"erkannt.")
        if auffaellig:
            text += (f"  {auffaellig} Reihe(n) mit unerwarteter Bildanzahl - "
                     f"bitte pruefen.")
        self.zusammenfassung.configure(text=text)
        self._schreibe(text, "warnung" if auffaellig else "erfolg")

        self.fortschritt["maximum"] = max(len(gruppen), 1)
        self.fortschritt["value"] = 0
        self.status.configure(text="Bereit zum Starten.")
        self.start_knopf.configure(state="normal" if gruppen else "disabled")

        if gruppen and self.sofort_starten.get():
            self._starte_verarbeitung()

    # -----------------------------------------------------------------
    # Verarbeitung
    # -----------------------------------------------------------------

    def _baue_argumente(self, eingabe: Path, ausgabe: Path) -> list[str]:
        argumente = [python_programm(), str(HDR_MERGE), str(eingabe),
                     str(ausgabe),
                     "--window-strength", f"{self.staerke.get():.2f}",
                     "--mid-target", f"{self.helligkeit.get():.2f}",
                     # Ausgabe bewusst immer unkomprimiert - volle Qualitaet
                     # fuer die Weiterverarbeitung in Photoshop/Lightroom.
                     "--compression", "none"]
        if self.stativ.get():
            argumente.append("--no-align")
        if self.vorschau.get():
            argumente.append("--preview")
        if self.begradigen.get():
            argumente.append("--straighten")
        if not self.basiston.get():
            argumente += ["--base-tone", "off"]
        return argumente

    def _starte_verarbeitung(self) -> None:
        eingabe = Path(self.eingabe_feld.get().strip())
        ziel = self.ausgabe_feld.get().strip()
        if not eingabe.is_dir():
            messagebox.showerror("Ordner fehlt",
                                 "Bitte einen Ordner mit Aufnahmen waehlen.")
            return
        if not ziel:
            messagebox.showerror("Zielordner fehlt",
                                 "Bitte einen Zielordner waehlen.")
            return
        self.letzter_ausgabeordner = Path(ziel)
        self.fertige_reihen = 0
        self.fortschritt["value"] = 0
        self.fortschritt["maximum"] = max(len(self.gruppen), 1)
        self._starte_prozesskette(
            [(self._baue_argumente(eingabe, Path(ziel)),
              f"Verarbeite {len(self.gruppen)} Reihe(n) ...")],
            gesamt=len(self.gruppen))

    def _starte_probelauf(self) -> None:
        """Erzeugt die Referenzszene und verarbeitet sie."""
        if fehlende_pakete():
            messagebox.showinfo("Einrichtung noetig",
                                "Die Bausteine sind noch nicht eingerichtet.")
            return
        self.letzter_ausgabeordner = BEISPIEL_AUSGABE
        self.gruppen = [[]]
        self.fertige_reihen = 0
        self.fortschritt["maximum"] = 1
        self.fortschritt["value"] = 0
        self._starte_prozesskette([
            ([python_programm(), str(TESTSZENE_SKRIPT), str(BEISPIEL_EINGABE)],
             "Beispielbilder werden erzeugt ..."),
            ([python_programm(), str(HDR_MERGE), str(BEISPIEL_EINGABE),
              str(BEISPIEL_AUSGABE), "--bracket-size", "3", "--no-align",
              "--preview", "--compression", "none"],
             "Beispiel wird verarbeitet ..."),
        ], gesamt=1)

    def _starte_prozesskette(self, schritte: list[tuple[list[str], str]],
                             gesamt: int) -> None:
        if self.prozess is not None:
            messagebox.showinfo("Laeuft bereits",
                                "Es laeuft gerade eine Verarbeitung.")
            return
        self.abgebrochen = False
        self.start_knopf.configure(state="disabled")
        self.abbruch_knopf.configure(state="normal")
        self.oeffnen_knopf.configure(state="disabled")
        self.status.configure(text=schritte[0][1])
        threading.Thread(target=self._arbeite_kette_ab, args=(schritte,),
                         daemon=True).start()

    def _arbeite_kette_ab(self, schritte: list[tuple[list[str], str]]) -> None:
        umgebung = dict(os.environ, PYTHONIOENCODING="utf-8",
                        PYTHONUNBUFFERED="1")
        erfolgreich = True
        try:
            for befehl, statustext in schritte:
                self.meldungen.put(("zeile", f"--- {statustext}"))
                self.prozess = subprocess.Popen(
                    befehl, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                    text=True, encoding="utf-8", errors="replace",
                    cwd=str(ORDNER), env=umgebung, **ohne_konsolenfenster())
                assert self.prozess.stdout is not None
                for zeile in self.prozess.stdout:
                    self.meldungen.put(("zeile", zeile.rstrip()))
                rueckgabe = self.prozess.wait()
                self.prozess = None
                if rueckgabe != 0:
                    erfolgreich = False
                    if not self.abgebrochen:
                        self.meldungen.put(
                            ("zeile", f"ERROR Verarbeitung abgebrochen "
                                      f"(Rueckgabewert {rueckgabe})."))
                    break
        except FileNotFoundError as fehler:
            erfolgreich = False
            self.meldungen.put(("zeile", f"ERROR Programm nicht gefunden: "
                                         f"{fehler}"))
        except Exception as fehler:  # pragma: no cover
            erfolgreich = False
            self.meldungen.put(("zeile", f"ERROR Unerwarteter Fehler: {fehler}"))
        finally:
            self.prozess = None
            self.meldungen.put(("ende", erfolgreich))

    def _verarbeitung_beendet(self, erfolgreich: bool) -> None:
        self.start_knopf.configure(
            state="normal" if self.gruppen else "disabled")
        self.abbruch_knopf.configure(state="disabled")
        if self.abgebrochen:
            self.status.configure(text="Abgebrochen.")
        elif erfolgreich:
            self.status.configure(
                text=f"Fertig - {self.fertige_reihen} Reihe(n) verarbeitet.")
            self.fortschritt["value"] = self.fortschritt["maximum"]
        else:
            self.status.configure(text="Mit Fehlern beendet - siehe Protokoll.")
        if (self.letzter_ausgabeordner is not None
                and self.letzter_ausgabeordner.is_dir()):
            self.oeffnen_knopf.configure(state="normal")
            self._schreibe(f"Ergebnisse liegen in: "
                           f"{self.letzter_ausgabeordner}", "hinweis")

    def _brich_ab(self) -> None:
        if self.prozess is not None:
            self.abgebrochen = True
            self.prozess.terminate()
            self._schreibe("Abbruch angefordert ...", "warnung")

    def _oeffne_ausgabe(self) -> None:
        if self.letzter_ausgabeordner is None:
            return
        ordner = str(self.letzter_ausgabeordner)
        try:
            if os.name == "nt":
                os.startfile(ordner)  # noqa: S606
            elif sys.platform == "darwin":
                subprocess.Popen(["open", ordner])
            else:
                subprocess.Popen(["xdg-open", ordner])
        except Exception as fehler:  # pragma: no cover
            messagebox.showinfo("Ordner", f"{ordner}\n\n({fehler})")

    def _beim_schliessen(self) -> None:
        if self.prozess is not None:
            if not messagebox.askyesno("Verarbeitung laeuft",
                                       "Es laeuft noch eine Verarbeitung. "
                                       "Wirklich beenden?"):
                return
            self.abgebrochen = True
            self.prozess.terminate()
        self.destroy()


def main(argv: list[str] | None = None) -> None:
    argv = list(sys.argv[1:] if argv is None else argv)
    if not HDR_MERGE.exists():
        wurzel = tk.Tk()
        wurzel.withdraw()
        messagebox.showerror(
            "Datei fehlt",
            f"hdr_merge.py wurde nicht gefunden.\n\nErwartet in:\n{ORDNER}\n\n"
            "Bitte alle Dateien im selben Ordner belassen.")
        return
    startordner = None
    if argv and Path(argv[0]).is_dir():
        startordner = str(Path(argv[0]).resolve())
    Anwendung(startordner).mainloop()


if __name__ == "__main__":
    main()
