#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
hdr_merge_gui.pyw -- Fenster-Oberflaeche fuer hdr_merge.py.

Ablauf aus Sicht des Anwenders:

    Ordner waehlen  ->  Reihen werden erkannt und angezeigt
                    ->  eine Reihe erscheint als Vorschau
                    ->  an den Reglern justieren, bis es passt
                    ->  "Alle Reihen verarbeiten"
                    ->  fertige 16-Bit-TIFFs im Zielordner

Zwei Dinge sind an der Aufteilung wichtig:

  * Die **Vorschau** rechnet im Programm selbst, auf verkleinerten Bildern.
    Sie nimmt dabei exakt denselben Weg wie der spaetere Endlauf
    (``hdr_merge.berechne_vorschau`` ruft denselben Rechenkern auf). Waeren
    es zwei Implementierungen, koennte die Vorschau etwas zeigen, das das
    Ergebnis nicht einloest - und genau darauf muss man sich beim Justieren
    verlassen koennen. Alle Radien im Programm sind Anteile der Bildbreite,
    deshalb wirkt jeder Regler auf dem kleinen Bild massstabsgetreu.

  * Der **Endlauf** laeuft unveraendert als eigener Prozess. Damit ist das
    Ergebnis identisch, egal ob ueber die Kommandozeile oder ueber dieses
    Fenster gestartet wird - und ein Absturz der Verarbeitung kann die
    Oberflaeche nicht mitreissen.

Verwendet ausschliesslich tkinter aus der Standardbibliothek, also keine
zusaetzliche Abhaengigkeit. Auch die Bildanzeige kommt ohne Pillow aus: Das
Vorschaubild wird als PNG im Speicher erzeugt und base64-kodiert an
tk.PhotoImage uebergeben. PNG und nicht PPM, weil Tk base64 nur fuer die
Formate annimmt, deren Handler das ausdruecklich koennen - PPM gehoert
nicht dazu. Die Endung .pyw sorgt unter Windows dafuer, dass kein
schwarzes Konsolenfenster mitstartet.

Ein Ordner kann auch direkt auf das Programmsymbol gezogen werden - er wird
dann als Argument uebergeben und sofort analysiert.
"""

from __future__ import annotations

import base64
import importlib.util
import os
import queue
import re
import subprocess
import sys
import tempfile
import threading
import tkinter as tk
from pathlib import Path
from tkinter import filedialog, messagebox, ttk

ORDNER = Path(__file__).resolve().parent
HDR_MERGE = ORDNER / "hdr_merge.py"

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

FERTIG_MUSTER = re.compile(r"\[(?P<name>[^\]]+)\]\s+Fertig:")
# Die Pruefliste am Ende des Laufs - sie sagt, welche Reihen eine
# Sichtpruefung verdienen. Bei dreissig Reihen ist das der Unterschied
# zwischen "alle durchsehen" und "drei durchsehen".
PRUEFLISTE_MUSTER = re.compile(r"Pruefliste: (?P<text>.+)$")

# Breite, in der die Vorschau gerechnet wird. Der Kompromiss ist bewusst
# gewaehlt: Bei 1100 px dauert ein Durchlauf rund zwei Sekunden, das Bild
# ist aber gross genug, um Zeichnung und Fenster wirklich beurteilen zu
# koennen.
VORSCHAU_BREITE = 1100


# ---------------------------------------------------------------------------
# Farben und Schrift
# ---------------------------------------------------------------------------

class Farben:
    """Dunkles, ruhiges Schema - damit die Bilder die Aufmerksamkeit haben.

    Eine Bildoberflaeche muss neutral sein: Jede kraeftige Flaeche daneben
    verschiebt die Wahrnehmung von Helligkeit und Farbe des Bildes. Die
    Toene sind deshalb bewusst unbunt gehalten, der einzige Akzent ist ein
    gedaempftes Blau fuer bedienbare Elemente.
    """
    grund = "#1c1e22"
    flaeche = "#24272c"
    erhoben = "#2c3036"
    linie = "#383d45"
    text = "#e8eaed"
    text_leise = "#9aa1ab"
    akzent = "#5b9dd9"
    akzent_hell = "#7fb5e6"
    warnung = "#d9a55b"
    fehler = "#d97a7a"
    gut = "#7fbf8a"
    # Neutrales Grau als Bildumfeld - siehe oben.
    buehne = "#15171a"


def schrift(groesse: int = 10, fett: bool = False) -> tuple:
    familie = "Segoe UI" if os.name == "nt" else "DejaVu Sans"
    return (familie, groesse, "bold" if fett else "normal")


# ---------------------------------------------------------------------------
# Einrichtung
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# Die Regler
# ---------------------------------------------------------------------------

class Regler:
    """Ein Regler mit Klartext-Beschriftung und dem zugehoerigen Schalter.

    ``schalter`` ist der Name auf der Kommandozeile. Die Oberflaeche gibt
    ausschliesslich Werte weiter, die vom Standard abweichen - so bleibt
    der Aufruf lesbar und die Voreinstellungen bleiben die eine Wahrheit
    im Programm.
    """

    def __init__(self, schluessel, schalter, titel, erklaerung,
                 minimum, maximum, standard, schritt=0.01, nachkomma=2):
        self.schluessel = schluessel
        self.schalter = schalter
        self.titel = titel
        self.erklaerung = erklaerung
        self.minimum = minimum
        self.maximum = maximum
        self.standard = standard
        self.schritt = schritt
        self.nachkomma = nachkomma


# Bewusst nur die Regler, die den Look bestimmen und die man am Bild
# beurteilen kann. Alles Weitere bleibt der Kommandozeile vorbehalten -
# eine Oberflaeche mit vierzig Reglern hilft niemandem.
REGLER = [
    Regler("helligkeit", "--mid-target", "Helligkeit",
           "Wie hell der Raum insgesamt wird.", 0.42, 0.80, 0.587),
    Regler("kontrast", "--tone-contrast", "Kontrast",
           "Die am Vorbild gemessene Kennlinie. 0 = flach.", 0.0, 1.5, 1.0),
    # Beide bewusst niedriger als frueher. Am lokalen Kontrast gemessen lag
    # das Ergebnis mit den alten Werten 21 Prozent UEBER dem kommerziellen
    # Vorbild (0.0357 gegenueber 0.0295) - also nicht zu weich, sondern zu
    # hart. Die "uebersteuerten Kanten" kamen von hier.
    Regler("zeichnung", "--clarity", "Zeichnung",
           "Holt Struktur zurueck, die das Aufhellen kostet.", 0.0, 2.0, 0.6),
    Regler("schaerfe", "--sharpen", "Schaerfe",
           "Gleicht die Weichheit der RAW-Entwicklung aus.", 0.0, 2.5, 0.7),
    # Der Regler, der beim Weg ueber die Strahlungskarte an die Stelle der
    # gesamten Fensterbehandlung tritt. Kleiner = hellerer Raum, ohne dass
    # die Fenster ausbrennen - das leistet keine globale Kurve.
    Regler("raum", "--hdr-compression", "Helligkeit des Raums",
           "Reine Belichtung - der Raum bleibt so, wie die Kamera ihn "
           "gesehen hat.", 0.25, 0.85, 0.62),
    # Ab welcher Helligkeit ein Bereich als "draussen" gilt. Bewusst ueber
    # 1.0: Fenster liegen drei bis vier Blendenstufen ueber dem Raum,
    # sonnenbeschienene Innenflaechen nur eine halbe. Zu tief eingestellt
    # werden auch sie gezogen - dann legt sich ein Schleier ueber
    # Arbeitsplatten und helle Waende.
    Regler("fenster", "--hdr-knee", "Was gilt als draussen",
           "Tiefer = mehr Flaechen werden als Fenster behandelt.",
           0.60, 2.50, 1.0),
    # Der Regler, der den Fenstereindruck bestimmt: die Helligkeit der
    # FLAECHE. Der Inhalt liegt darueber und darunter.
    Regler("fensterhelligkeit", "--hdr-highlight", "Fensterhelligkeit",
           "Wohin die Fensterflaeche gezogen wird. Tiefer = dichter.",
           0.25, 0.80, 0.45),
    Regler("fensterzeichnung", "--hdr-window-contrast", "Fensterzeichnung",
           "Wieviel Tonwertumfang das Fenster behaelt. Zu hoch = es "
           "brennt wieder aus.", 0.0, 1.0, 0.55),
    # Gemessen am kommerziellen Dienst: Der entsaettigt deutlich, und zwar
    # ueber den ganzen Bereich. Bei 1.0 trifft dieser Regler dessen Profil
    # ueber drei Szenen hinweg fast genau (Esszimmer p90: Dienst 0.354,
    # hier 0.343). Voreingestellt bleibt 0 - wer ein eigenes Preset fahrt,
    # will die Farben unangetastet.
    Regler("zurueckhaltung", "--color-match", "Farbzurueckhaltung",
           "0 = Farben wie aufgenommen. 1 = so zurueckhaltend wie der "
           "kommerzielle Dienst.", 0.0, 1.0, 0.0),
]


# ---------------------------------------------------------------------------
# Anwendung
# ---------------------------------------------------------------------------

class Anwendung(tk.Tk):

    def __init__(self, startordner: str | None = None) -> None:
        super().__init__()
        self.title("HDR Merge")
        self.geometry("1500x900")
        self.minsize(1150, 700)
        self.configure(bg=Farben.grund)

        symbol = ORDNER / "hdr_merge.ico"
        if symbol.exists() and os.name == "nt":
            try:
                self.iconbitmap(str(symbol))
            except Exception:
                pass

        self.meldungen: queue.Queue = queue.Queue()
        self.prozess: subprocess.Popen | None = None
        self.laeuft = False
        self.reihen: list = []
        self.vorschau_bilder: list = []       # verkleinerte Belichtungen
        self.vorschau_reihe = -1              # welche Reihe geladen ist
        self.vorschau_marke = 0               # verwirft veraltete Ergebnisse
        self.foto = None                      # Referenz halten, sonst leer
        self.roh_vorschau = None              # letztes gerechnetes Bild
        self.zeige_original = False
        self.pruefliste = ""
        self.werte: dict[str, tk.DoubleVar] = {}

        self._setze_stil()
        self._baue_oberflaeche()
        self.protocol("WM_DELETE_WINDOW", self._beim_schliessen)
        self.after(100, self._verarbeite_meldungen)
        self.after(300, self._pruefe_pakete)

        if startordner:
            self.eingabe_pfad.set(startordner)
            self.after(700, self._analysiere)

    # -- Aussehen ---------------------------------------------------------

    def _setze_stil(self) -> None:
        stil = ttk.Style(self)
        stil.theme_use("clam")
        stil.configure("TFrame", background=Farben.grund)
        stil.configure("Flaeche.TFrame", background=Farben.flaeche)
        stil.configure("Buehne.TFrame", background=Farben.buehne)
        stil.configure("TLabel", background=Farben.grund,
                       foreground=Farben.text, font=schrift(10))
        stil.configure("Flaeche.TLabel", background=Farben.flaeche,
                       foreground=Farben.text, font=schrift(10))
        stil.configure("Leise.TLabel", background=Farben.flaeche,
                       foreground=Farben.text_leise, font=schrift(9))
        stil.configure("Titel.TLabel", background=Farben.grund,
                       foreground=Farben.text, font=schrift(17, True))
        stil.configure("Abschnitt.TLabel", background=Farben.flaeche,
                       foreground=Farben.text_leise, font=schrift(9, True))
        stil.configure("Wert.TLabel", background=Farben.flaeche,
                       foreground=Farben.akzent_hell, font=schrift(10, True))

        stil.configure("TButton", background=Farben.erhoben,
                       foreground=Farben.text, font=schrift(10),
                       borderwidth=0, focuscolor=Farben.erhoben, padding=(14, 9))
        stil.map("TButton",
                 background=[("active", Farben.linie),
                             ("disabled", Farben.flaeche)],
                 foreground=[("disabled", Farben.text_leise)])
        stil.configure("Start.TButton", background=Farben.akzent,
                       foreground="#10141a", font=schrift(11, True),
                       padding=(16, 12))
        stil.map("Start.TButton",
                 background=[("active", Farben.akzent_hell),
                             ("disabled", Farben.linie)],
                 foreground=[("disabled", Farben.text_leise)])

        stil.configure("TScale", background=Farben.flaeche,
                       troughcolor=Farben.grund, borderwidth=0)
        stil.configure("Horizontal.TScale", background=Farben.flaeche,
                       troughcolor=Farben.grund, borderwidth=0, lightcolor=Farben.akzent,
                       darkcolor=Farben.akzent)
        stil.configure("TCheckbutton", background=Farben.flaeche,
                       foreground=Farben.text, font=schrift(10),
                       focuscolor=Farben.flaeche)
        stil.map("TCheckbutton", background=[("active", Farben.flaeche)])
        stil.configure("TCombobox", fieldbackground=Farben.erhoben,
                       background=Farben.erhoben, foreground=Farben.text,
                       arrowcolor=Farben.text_leise, borderwidth=0)
        stil.configure("TProgressbar", background=Farben.akzent,
                       troughcolor=Farben.grund, borderwidth=0)
        stil.configure("Treeview", background=Farben.flaeche,
                       fieldbackground=Farben.flaeche, foreground=Farben.text,
                       borderwidth=0, font=schrift(9), rowheight=24)
        stil.configure("Treeview.Heading", background=Farben.erhoben,
                       foreground=Farben.text_leise, font=schrift(9, True),
                       borderwidth=0)
        stil.map("Treeview", background=[("selected", Farben.akzent)],
                 foreground=[("selected", "#10141a")])

    def _baue_oberflaeche(self) -> None:
        self.eingabe_pfad = tk.StringVar()
        self.ausgabe_pfad = tk.StringVar()
        self.status = tk.StringVar(value="Ordner mit Belichtungsreihen waehlen.")

        # --- Kopfzeile ----------------------------------------------------
        kopf = ttk.Frame(self, padding=(20, 16, 20, 12))
        kopf.pack(fill="x")
        ttk.Label(kopf, text="HDR Merge", style="Titel.TLabel").pack(side="left")
        ttk.Label(kopf, text="   Belichtungsreihen zu neutralen Basisbildern",
                  foreground=Farben.text_leise).pack(side="left", pady=(6, 0))
        self.knopf_ordner = ttk.Button(kopf, text="Ordner waehlen …",
                                       command=self._waehle_eingabe)
        self.knopf_ordner.pack(side="right")

        # --- Pfadzeile ----------------------------------------------------
        # Beide Ordner immer sichtbar. Wer dreissig Reihen rechnen laesst,
        # will vorher sehen, wohin sie geschrieben werden - und den Ort
        # aendern koennen, ohne die Kommandozeile zu bemuehen.
        pfade = ttk.Frame(self, padding=(20, 0, 20, 10))
        pfade.pack(fill="x")
        pfade.columnconfigure(1, weight=1)
        for zeile, (beschriftung, variable, befehl) in enumerate((
                ("Aufnahmen", self.eingabe_pfad, self._waehle_eingabe),
                ("Zielordner", self.ausgabe_pfad, self._waehle_ausgabe))):
            ttk.Label(pfade, text=beschriftung,
                      foreground=Farben.text_leise).grid(
                          row=zeile, column=0, sticky="w", padx=(0, 10),
                          pady=(0, 4))
            feld = tk.Entry(pfade, textvariable=variable,
                            bg=Farben.flaeche, fg=Farben.text,
                            insertbackground=Farben.text, relief="flat",
                            font=schrift(9))
            feld.grid(row=zeile, column=1, sticky="ew", ipady=5, pady=(0, 4))
            ttk.Button(pfade, text="…", width=3, command=befehl).grid(
                row=zeile, column=2, padx=(8, 0), pady=(0, 4))

        # --- Hauptbereich -------------------------------------------------
        haupt = ttk.Frame(self, padding=(20, 0, 20, 8))
        haupt.pack(fill="both", expand=True)
        haupt.columnconfigure(0, weight=0, minsize=340)
        haupt.columnconfigure(1, weight=1)
        haupt.rowconfigure(0, weight=1)

        self._baue_seitenleiste(haupt)
        self._baue_buehne(haupt)

        # --- Fusszeile ----------------------------------------------------
        fuss = ttk.Frame(self, padding=(20, 4, 20, 14))
        fuss.pack(fill="x")
        self.fortschritt = ttk.Progressbar(fuss, mode="determinate", length=200)
        self.fortschritt.pack(side="left", fill="x", expand=True, padx=(0, 14))
        ttk.Label(fuss, textvariable=self.status,
                  foreground=Farben.text_leise).pack(side="left")
        self.knopf_protokoll = ttk.Button(fuss, text="Protokoll",
                                          command=self._zeige_protokoll)
        self.knopf_protokoll.pack(side="right")
        self.knopf_ausgabe = ttk.Button(fuss, text="Zielordner oeffnen",
                                        command=self._oeffne_ausgabe,
                                        state="disabled")
        self.knopf_ausgabe.pack(side="right", padx=(0, 8))

        self.protokoll_text: tk.Text | None = None
        self.protokoll_zeilen: list[tuple[str, str]] = []

    def _baue_seitenleiste(self, eltern) -> None:
        leiste = ttk.Frame(eltern, style="Flaeche.TFrame", padding=(16, 14))
        leiste.grid(row=0, column=0, sticky="nsew", padx=(0, 14))
        leiste.columnconfigure(0, weight=1)

        # Erkannte Reihen
        ttk.Label(leiste, text="ERKANNTE REIHEN",
                  style="Abschnitt.TLabel").grid(row=0, column=0, sticky="w")
        self.reihen_liste = ttk.Combobox(leiste, state="readonly",
                                         font=schrift(10))
        self.reihen_liste.grid(row=1, column=0, sticky="ew", pady=(6, 4))
        self.reihen_liste.bind("<<ComboboxSelected>>", self._reihe_gewechselt)
        self.reihen_hinweis = ttk.Label(leiste, text="Noch kein Ordner gewaehlt.",
                                        style="Leise.TLabel", wraplength=300)
        self.reihen_hinweis.grid(row=2, column=0, sticky="w", pady=(0, 14))

        # Regler
        ttk.Label(leiste, text="FEINJUSTIERUNG",
                  style="Abschnitt.TLabel").grid(row=3, column=0, sticky="w")
        kasten = ttk.Frame(leiste, style="Flaeche.TFrame")
        kasten.grid(row=4, column=0, sticky="ew", pady=(8, 0))
        kasten.columnconfigure(0, weight=1)
        for zeile, regler in enumerate(REGLER):
            self._baue_regler(kasten, zeile, regler)

        # Schalter
        schalter = ttk.Frame(leiste, style="Flaeche.TFrame")
        schalter.grid(row=5, column=0, sticky="ew", pady=(14, 0))
        self.ausrichten = tk.BooleanVar(value=True)
        self.aufrichten = tk.BooleanVar(value=False)
        ttk.Checkbutton(schalter, text="Bilder zueinander ausrichten",
                        variable=self.ausrichten,
                        command=self._vorschau_anfordern).pack(anchor="w")
        ttk.Checkbutton(schalter, text="Stuerzende Linien aufrichten",
                        variable=self.aufrichten,
                        command=self._vorschau_anfordern).pack(anchor="w",
                                                               pady=(4, 0))
        # Der Weissabgleich der Rohentwicklung. Gemessen an einer Dachkueche
        # mit Mischlicht bringt "automatisch" die neutralen Flaechen
        # deutlich naeher an neutral (Abstand 0.180 auf 0.140). Voreingestellt
        # bleibt die Kameraeinstellung, weil sie ueber eine ganze Serie
        # hinweg garantiert gleich bleibt - die Automatik entscheidet je
        # Bild neu und kann zwei Aufnahmen desselben Raums unterschiedlich
        # abstimmen.
        self.auto_wb = tk.BooleanVar(value=False)
        ttk.Checkbutton(schalter,
                        text="Weissabgleich automatisch statt Kamera",
                        variable=self.auto_wb,
                        command=self._lade_neu).pack(anchor="w", pady=(4, 0))

        leiste.rowconfigure(6, weight=1)

        # Aktionen
        aktionen = ttk.Frame(leiste, style="Flaeche.TFrame")
        aktionen.grid(row=7, column=0, sticky="ew", pady=(14, 0))
        aktionen.columnconfigure(0, weight=1)
        ttk.Button(aktionen, text="Auf Standard zuruecksetzen",
                   command=self._setze_zurueck).grid(row=0, column=0, sticky="ew")
        self.knopf_start = ttk.Button(aktionen, text="Alle Reihen verarbeiten",
                                      style="Start.TButton",
                                      command=self._starte_verarbeitung,
                                      state="disabled")
        self.knopf_start.grid(row=1, column=0, sticky="ew", pady=(8, 0))

    def _baue_regler(self, eltern, zeile: int, regler: Regler) -> None:
        rahmen = ttk.Frame(eltern, style="Flaeche.TFrame")
        rahmen.grid(row=zeile, column=0, sticky="ew", pady=(0, 10))
        rahmen.columnconfigure(0, weight=1)

        kopf = ttk.Frame(rahmen, style="Flaeche.TFrame")
        kopf.grid(row=0, column=0, sticky="ew")
        ttk.Label(kopf, text=regler.titel,
                  style="Flaeche.TLabel").pack(side="left")
        wert_anzeige = ttk.Label(kopf, text=f"{regler.standard:.2f}",
                                 style="Wert.TLabel")
        wert_anzeige.pack(side="right")

        variable = tk.DoubleVar(value=regler.standard)
        self.werte[regler.schluessel] = variable

        def geaendert(_=None, r=regler, v=variable, a=wert_anzeige):
            a.configure(text=f"{v.get():.{r.nachkomma}f}")
            self._vorschau_anfordern()

        skala = ttk.Scale(rahmen, from_=regler.minimum, to=regler.maximum,
                          variable=variable, orient="horizontal",
                          command=geaendert)
        skala.grid(row=1, column=0, sticky="ew", pady=(3, 1))
        ttk.Label(rahmen, text=regler.erklaerung, style="Leise.TLabel",
                  wraplength=300).grid(row=2, column=0, sticky="w")

    def _baue_buehne(self, eltern) -> None:
        buehne = ttk.Frame(eltern, style="Buehne.TFrame")
        buehne.grid(row=0, column=1, sticky="nsew")
        buehne.rowconfigure(0, weight=1)
        buehne.columnconfigure(0, weight=1)

        self.bild_flaeche = tk.Label(buehne, bg=Farben.buehne,
                                     text="Ordner waehlen, um die Vorschau zu sehen.",
                                     fg=Farben.text_leise, font=schrift(11))
        self.bild_flaeche.grid(row=0, column=0, sticky="nsew")
        self.bild_flaeche.bind("<Configure>", self._buehne_veraendert)
        # Gedrueckt halten zeigt das unbearbeitete Bild - der schnellste Weg,
        # die Wirkung der Regler zu beurteilen.
        self.bild_flaeche.bind("<ButtonPress-1>", self._zeige_vorher)
        self.bild_flaeche.bind("<ButtonRelease-1>", self._zeige_nachher)

        leiste = ttk.Frame(buehne, style="Buehne.TFrame", padding=(12, 8))
        leiste.grid(row=1, column=0, sticky="ew")
        self.vorschau_status = ttk.Label(leiste, text="",
                                         background=Farben.buehne,
                                         foreground=Farben.text_leise,
                                         font=schrift(9))
        self.vorschau_status.pack(side="left")
        ttk.Label(leiste, text="Ins Bild klicken und halten zeigt die Rohfusion",
                  background=Farben.buehne, foreground=Farben.text_leise,
                  font=schrift(9)).pack(side="right")

    # -- Vorschau ---------------------------------------------------------

    def _vorschau_anfordern(self, verzoegerung: int = 320) -> None:
        """Rechnet die Vorschau neu - aber erst, wenn der Regler ruht.

        Ohne diese Verzoegerung wuerde jede Zwischenstellung eines Reglers
        einen eigenen Durchlauf ausloesen und die Oberflaeche haengt.
        """
        if not self.vorschau_bilder:
            return
        self.vorschau_marke += 1
        marke = self.vorschau_marke
        self.vorschau_status.configure(text="rechnet …")
        self.after(verzoegerung, lambda: self._vorschau_starten(marke))

    def _vorschau_starten(self, marke: int) -> None:
        if marke != self.vorschau_marke:
            return          # inzwischen wurde weitergedreht
        threading.Thread(target=self._vorschau_rechnen, args=(marke,),
                         daemon=True).start()

    def _vorschau_rechnen(self, marke: int) -> None:
        try:
            sys.path.insert(0, str(ORDNER))
            import hdr_merge
            args = hdr_merge.baue_parser().parse_args(["x", "y"])
            for regler in REGLER:
                setattr(args, regler.schalter.lstrip("-").replace("-", "_"),
                        float(self.werte[regler.schluessel].get()))
            args.no_align = not self.ausrichten.get()
            args.straighten = bool(self.aufrichten.get())
            bild = hdr_merge.berechne_vorschau(self.vorschau_bilder, args,
                                               self.vorschau_evs)
        except Exception as fehler:      # pragma: no cover - Oberflaeche
            self.meldungen.put(("fehler", f"Vorschau fehlgeschlagen: {fehler}"))
            return
        if marke == self.vorschau_marke:
            self.meldungen.put(("vorschau", bild))

    def _buehne_veraendert(self, _ereignis=None) -> None:
        if self.roh_vorschau is not None:
            self._zeichne_bild(self.roh_vorschau)

    def _zeige_vorher(self, _ereignis=None) -> None:
        if self.vorschau_bilder:
            self.zeige_original = True
            self._zeichne_bild(self._rohfusion())

    def _zeige_nachher(self, _ereignis=None) -> None:
        self.zeige_original = False
        if self.roh_vorschau is not None:
            self._zeichne_bild(self.roh_vorschau)

    def _rohfusion(self):
        """Die mittlere Belichtung als Vergleichsbild."""
        return self.vorschau_bilder[len(self.vorschau_bilder) // 2]

    def _zeichne_bild(self, bild) -> None:
        """Zeigt ein Float-RGB-Bild ohne Umweg ueber Pillow an.

        Uebergeben wird PNG, nicht PPM. Das ist der Kern eines Fehlers, der
        die gesamte Oberflaeche lahmgelegt hat: Tk nimmt Bilddaten als
        base64-Text nur fuer die Formate an, deren Handler das ausdruecklich
        koennen - GIF und PNG. Der PPM-Handler liest ausschliesslich
        Rohbytes und quittiert base64 mit einem Fehler. Der wiederum riss
        die Meldungsschleife mit, und das Fenster stand still.

        Beide Wege bleiben erhalten: PNG ueber den Speicher als Regelfall,
        eine PPM-Datei als Rueckfallebene fuer sehr alte Tk-Fassungen, die
        PNG noch nicht kennen (vor 8.6). So haengt die Anzeige nicht an
        einer einzigen Annahme ueber die Tk-Version des Anwenders.
        """
        import numpy as np
        import cv2

        breite = max(self.bild_flaeche.winfo_width() - 16, 200)
        hoehe = max(self.bild_flaeche.winfo_height() - 16, 150)
        h, w = bild.shape[:2]
        skalierung = min(breite / w, hoehe / h)
        ziel = (max(int(w * skalierung), 1), max(int(h * skalierung), 1))
        klein = cv2.resize(np.clip(bild, 0.0, 1.0), ziel,
                           interpolation=cv2.INTER_AREA)
        acht_bit = np.ascontiguousarray((klein * 255.0 + 0.5).astype(np.uint8))

        erfolg, puffer = cv2.imencode(".png",
                                      cv2.cvtColor(acht_bit, cv2.COLOR_RGB2BGR))
        if erfolg:
            try:
                daten = base64.b64encode(puffer.tobytes()).decode("ascii")
                self.foto = tk.PhotoImage(data=daten)
                self.bild_flaeche.configure(image=self.foto, text="")
                return
            except Exception:
                pass    # sehr altes Tk ohne PNG - unten weiter

        kopf = f"P6 {ziel[0]} {ziel[1]} 255 ".encode("ascii")
        pfad = Path(tempfile.gettempdir()) / "hdr_merge_vorschau.ppm"
        pfad.write_bytes(kopf + acht_bit.tobytes())
        self.foto = tk.PhotoImage(file=str(pfad))
        self.bild_flaeche.configure(image=self.foto, text="")

    # -- Meldungen --------------------------------------------------------

    def _schreibe(self, text: str, kennzeichen: str = "") -> None:
        self.protokoll_zeilen.append((text, kennzeichen))
        if self.protokoll_text is not None and self.protokoll_text.winfo_exists():
            self.protokoll_text.configure(state="normal")
            self.protokoll_text.insert("end", text + "\n", kennzeichen)
            self.protokoll_text.see("end")
            self.protokoll_text.configure(state="disabled")

    def _verarbeite_meldungen(self) -> None:
        """Die Meldungsschleife - sie darf unter keinen Umstaenden sterben.

        Sie ist der einzige Weg, auf dem Ergebnisse aus den Arbeitsfaeden
        und aus der laufenden Verarbeitung ins Fenster gelangen. Frueher
        stand das Wiedereinplanen NACH dem try-Block: Warf einer der
        Zweige eine Ausnahme, wurde die Zeile nie erreicht - und damit war
        die gesamte Oberflaeche tot. Nicht nur die Vorschau: auch der
        Fortschrittsbalken, die Statuszeile und die Meldung "fertig". Das
        Fenster blieb in genau dem Zustand stehen, in dem es gerade war,
        waehrend die Verarbeitung im Hintergrund unbemerkt weiterlief.

        Genau das ist passiert. Deshalb steht das Wiedereinplanen jetzt in
        einem finally, und jede einzelne Meldung wird fuer sich
        abgesichert: Eine kaputte Meldung darf hoechstens sich selbst
        kosten, niemals die Schleife.
        """
        try:
            while True:
                try:
                    art, nutzlast = self.meldungen.get_nowait()
                except queue.Empty:
                    break
                try:
                    self._behandle_meldung(art, nutzlast)
                except Exception as fehler:      # pragma: no cover
                    self._schreibe(f"ERROR Meldung '{art}' fehlgeschlagen: "
                                   f"{fehler!r}", "fehler")
        finally:
            self.after(100, self._verarbeite_meldungen)

    def _behandle_meldung(self, art: str, nutzlast) -> None:
        if art == "zeile":
            self._zeige_zeile(nutzlast)
        elif art == "vorschau":
            self.roh_vorschau = nutzlast
            if not self.zeige_original:
                self._zeichne_bild(nutzlast)
            self.vorschau_status.configure(
                text=f"Vorschau {nutzlast.shape[1]} × {nutzlast.shape[0]} px")
        elif art == "reihen":
            self._zeige_analyse(nutzlast)
        elif art == "geladen":
            self.vorschau_bilder = nutzlast
            self._vorschau_anfordern(verzoegerung=10)
        elif art == "fehler":
            self.status.set(nutzlast)
            self.vorschau_status.configure(text="")
            self._schreibe(nutzlast, "fehler")
        elif art == "fertig":
            self._verarbeitung_beendet(nutzlast)

    def _zeige_zeile(self, zeile: str) -> None:
        kennzeichen = ""
        if zeile.startswith("ERROR") or "Traceback" in zeile:
            kennzeichen = "fehler"
        elif zeile.startswith("WARNING"):
            kennzeichen = "warnung"
        self._schreibe(zeile, kennzeichen)
        pruefung = PRUEFLISTE_MUSTER.search(zeile)
        if pruefung:
            self.pruefliste = pruefung.group("text")
        treffer = FERTIG_MUSTER.search(zeile)
        if treffer:
            self.fortschritt["value"] = self.fortschritt["value"] + 1
            fertig = int(self.fortschritt["value"])
            self.status.set(f"{fertig} von {len(self.reihen)} Reihen fertig")

    # -- Pakete -----------------------------------------------------------

    def _pruefe_pakete(self) -> None:
        fehlend = fehlende_pakete()
        optional = fehlende_optionale_pakete()
        if not fehlend and not optional:
            return
        namen = ", ".join(BENOETIGTE_PAKETE[m][0] for m in fehlend)
        namen += (", " if namen and optional else "")
        namen += ", ".join(OPTIONALE_PAKETE[m][0] for m in optional)
        if messagebox.askyesno(
                "Bausteine fehlen",
                f"Es fehlen noch: {namen}.\n\n"
                "Sollen sie jetzt automatisch eingerichtet werden?\n"
                "Das dauert ein bis zwei Minuten."):
            self.status.set("Bausteine werden eingerichtet …")
            threading.Thread(target=self._richte_ein, daemon=True).start()

    def _richte_ein(self) -> None:
        melde = lambda zeile: self.meldungen.put(("zeile", zeile))
        gescheitert = installiere_pakete(BENOETIGTE_PAKETE, melde)
        gescheitert += installiere_pakete(OPTIONALE_PAKETE, melde)
        self.meldungen.put(("zeile", "--- Einrichtung abgeschlossen."))
        self.after(0, lambda: self.status.set(
            "Einrichtung abgeschlossen." if not gescheitert
            else "Einrichtung teilweise fehlgeschlagen – siehe Protokoll."))

    # -- Ordner und Analyse -----------------------------------------------

    def _waehle_eingabe(self) -> None:
        ordner = filedialog.askdirectory(title="Ordner mit den Aufnahmen")
        if ordner:
            self.eingabe_pfad.set(ordner)
            self._analysiere()

    def _zaehle_vorhandene(self, ausgabe) -> int:
        """Wie viele der erkannten Reihen schon ein Ergebnis haben."""
        if not ausgabe.is_dir():
            return 0
        return sum(1 for reihe in self.reihen
                   if (ausgabe / f"{reihe[0].pfad.stem}_hdr.tif").exists())

    def _waehle_ausgabe(self) -> None:
        ordner = filedialog.askdirectory(title="Zielordner fuer die TIFFs")
        if ordner:
            self.ausgabe_pfad.set(ordner)

    def _analysiere(self) -> None:
        eingabe = Path(self.eingabe_pfad.get())
        if not eingabe.is_dir():
            messagebox.showerror("Ordner", "Der Ordner existiert nicht.")
            return
        if not self.ausgabe_pfad.get():
            self.ausgabe_pfad.set(str(eingabe.parent / f"{eingabe.name}_basis"))
        self.status.set("Reihen werden erkannt …")
        self.reihen_hinweis.configure(text="Reihen werden erkannt …")
        threading.Thread(target=self._analysiere_im_hintergrund,
                         args=(eingabe,), daemon=True).start()

    def _analysiere_im_hintergrund(self, eingabe: Path) -> None:
        try:
            sys.path.insert(0, str(ORDNER))
            import hdr_merge
            aufnahmen = hdr_merge.sammle_aufnahmen(eingabe)
            reihen = hdr_merge.gruppiere_belichtungsreihen(aufnahmen, "auto", 6.0)
        except Exception as fehler:
            self.meldungen.put(("fehler", f"Analyse fehlgeschlagen: {fehler}"))
            return
        self.meldungen.put(("reihen", reihen))

    def _zeige_analyse(self, reihen: list) -> None:
        self.reihen = [r for r in reihen if len(r) >= 2]
        verworfen = len(reihen) - len(self.reihen)
        if not self.reihen:
            self.reihen_hinweis.configure(
                text="Keine verwertbare Belichtungsreihe gefunden.")
            self.status.set("Keine Reihen gefunden.")
            self.knopf_start.configure(state="disabled")
            return

        eintraege = []
        for nummer, reihe in enumerate(self.reihen, start=1):
            eintraege.append(f"Reihe {nummer:02d} · {reihe[0].pfad.stem} "
                             f"({len(reihe)} Bilder)")
        self.reihen_liste.configure(values=eintraege)
        self.reihen_liste.current(0)
        hinweis = f"{len(self.reihen)} Reihen erkannt."
        if verworfen:
            hinweis += f" {verworfen} mit zu wenig Bildern uebersprungen."
        self.reihen_hinweis.configure(text=hinweis)
        self.status.set(f"{len(self.reihen)} Reihen bereit.")
        self.knopf_start.configure(state="normal")
        self._reihe_gewechselt()

    def _reihe_gewechselt(self, _ereignis=None) -> None:
        index = self.reihen_liste.current()
        if index < 0 or index >= len(self.reihen) or index == self.vorschau_reihe:
            return
        self.vorschau_reihe = index
        self.vorschau_bilder = []
        self.vorschau_evs = [a.ev for a in self.reihen[index]]
        self.vorschau_status.configure(text="Reihe wird geladen …")
        self.bild_flaeche.configure(image="", text="Reihe wird geladen …")
        self.foto = None
        threading.Thread(target=self._lade_vorschau_reihe,
                         args=(index,), daemon=True).start()

    def _lade_neu(self) -> None:
        """Erzwingt ein erneutes Laden der Vorschau-Reihe.

        Noetig fuer alles, was schon in der Rohentwicklung wirkt - der
        Weissabgleich zum Beispiel. Ein blosses Neurechnen wuerde die
        bereits entwickelten Bilder weiterverwenden und die Aenderung
        stillschweigend verschlucken.
        """
        aktuell = self.vorschau_reihe
        self.vorschau_reihe = -1
        if aktuell >= 0:
            self.reihen_liste.current(aktuell)
            self._reihe_gewechselt()

    def _lade_vorschau_reihe(self, index: int) -> None:
        try:
            sys.path.insert(0, str(ORDNER))
            import hdr_merge
            klein = hdr_merge.lade_reihe_klein(
                self.reihen[index], VORSCHAU_BREITE,
                "auto" if self.auto_wb.get() else "camera")
        except Exception as fehler:
            self.meldungen.put(("fehler", f"Laden fehlgeschlagen: {fehler}"))
            return
        if index == self.vorschau_reihe:
            self.meldungen.put(("geladen", klein))

    def _setze_zurueck(self) -> None:
        for regler in REGLER:
            self.werte[regler.schluessel].set(regler.standard)
        self.ausrichten.set(True)
        self.aufrichten.set(False)
        self.auto_wb.set(False)
        self._vorschau_anfordern(verzoegerung=10)

    # -- Verarbeitung -----------------------------------------------------

    def _baue_argumente(self, eingabe: Path, ausgabe: Path) -> list[str]:
        # "-u" ist nicht kosmetisch: Ohne ungepufferte Ausgabe haelt Python
        # die Protokollzeilen im Blockpuffer zurueck, solange stdout eine
        # Pipe ist. Der Fortschritt erschiene dann erst, wenn der ganze
        # Lauf fertig ist - bei dreissig Reihen also nach einer halben
        # Stunde Stillstand.
        argumente = [python_programm(), "-u", str(HDR_MERGE), str(eingabe),
                     str(ausgabe), "--verbose", "--compression", "none"]
        for regler in REGLER:
            wert = float(self.werte[regler.schluessel].get())
            if abs(wert - regler.standard) > 1e-6:
                argumente += [regler.schalter, f"{wert:.4f}"]
        if not self.ausrichten.get():
            argumente.append("--no-align")
        if self.aufrichten.get():
            argumente.append("--straighten")
        if self.auto_wb.get():
            argumente += ["--raw-wb", "auto"]
        return argumente

    def _starte_verarbeitung(self) -> None:
        if self.laeuft:
            return
        eingabe = Path(self.eingabe_pfad.get())
        ausgabe = Path(self.ausgabe_pfad.get() or
                       str(eingabe.parent / f"{eingabe.name}_basis"))
        if fehlende_pakete():
            messagebox.showerror(
                "Bausteine fehlen",
                "Die Verarbeitung braucht numpy, opencv und tifffile. "
                "Bitte zuerst einrichten lassen.")
            return
        # Liegen schon Ergebnisse im Zielordner, wird gefragt statt still
        # entschieden. Beides waere sonst eine boese Ueberraschung: stumm
        # ueberspringen laesst geaenderte Regler wirkungslos verpuffen,
        # stumm neu rechnen kostet bei dreissig Reihen eine Stunde.
        schon_da = self._zaehle_vorhandene(ausgabe)
        ueberspringen = False
        if schon_da:
            antwort = messagebox.askyesnocancel(
                "Ergebnisse vorhanden",
                f"Im Zielordner liegen bereits {schon_da} von "
                f"{len(self.reihen)} Ergebnissen.\n\n"
                "Ja  – nur die fehlenden rechnen (schnell)\n"
                "Nein – alles neu rechnen (mit den jetzigen Reglern)")
            if antwort is None:
                return
            ueberspringen = bool(antwort)

        self.ausgabe_pfad.set(str(ausgabe))
        self.laeuft = True
        self.knopf_start.configure(state="disabled", text="Verarbeitung laeuft …")
        self.knopf_ausgabe.configure(state="disabled")
        self.fortschritt.configure(maximum=max(len(self.reihen), 1), value=0)
        self.status.set(f"0 von {len(self.reihen)} Reihen fertig")
        self._schreibe(f"--- Start: {eingabe} -> {ausgabe}", "hinweis")
        argumente = self._baue_argumente(eingabe, ausgabe)
        if ueberspringen:
            argumente.append("--skip-existing")
        threading.Thread(target=self._arbeite_ab, args=(argumente,),
                         daemon=True).start()

    def _arbeite_ab(self, argumente: list[str]) -> None:
        erfolgreich = False
        try:
            self.prozess = subprocess.Popen(
                argumente, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                text=True, encoding="utf-8", errors="replace", bufsize=1,
                **ohne_konsolenfenster())
            for zeile in self.prozess.stdout:
                self.meldungen.put(("zeile", zeile.rstrip()))
            erfolgreich = self.prozess.wait() == 0
        except Exception as fehler:      # pragma: no cover - Oberflaeche
            self.meldungen.put(("zeile", f"ERROR {fehler}"))
        finally:
            self.prozess = None
            self.meldungen.put(("fertig", erfolgreich))

    def _verarbeitung_beendet(self, erfolgreich: bool) -> None:
        self.laeuft = False
        self.knopf_start.configure(state="normal", text="Alle Reihen verarbeiten")
        self.knopf_ausgabe.configure(state="normal")
        if not erfolgreich:
            self.status.set("Mit Fehlern beendet – siehe Protokoll.")
        elif self.pruefliste:
            # Nicht nur "fertig": Der Fotograf soll sofort sehen, ob und
            # welche Bilder er anschauen muss.
            self.status.set(self.pruefliste + "  (Details im Protokoll)")
        else:
            self.status.set("Fertig – nichts auffaellig.")

    def _oeffne_ausgabe(self) -> None:
        ziel = Path(self.ausgabe_pfad.get())
        if not ziel.is_dir():
            messagebox.showinfo("Zielordner", "Es wurde noch nichts geschrieben.")
            return
        try:
            if os.name == "nt":
                os.startfile(str(ziel))       # type: ignore[attr-defined]
            elif sys.platform == "darwin":
                subprocess.Popen(["open", str(ziel)])
            else:
                subprocess.Popen(["xdg-open", str(ziel)])
        except Exception as fehler:
            messagebox.showerror("Zielordner", str(fehler))

    # -- Protokoll --------------------------------------------------------

    def _zeige_protokoll(self) -> None:
        fenster = tk.Toplevel(self)
        fenster.title("Protokoll")
        fenster.geometry("900x520")
        fenster.configure(bg=Farben.grund)
        text = tk.Text(fenster, bg=Farben.flaeche, fg=Farben.text,
                       insertbackground=Farben.text, relief="flat",
                       font=("Consolas" if os.name == "nt" else "monospace", 9),
                       wrap="word", padx=12, pady=10)
        text.pack(fill="both", expand=True, padx=12, pady=12)
        text.tag_configure("fehler", foreground=Farben.fehler)
        text.tag_configure("warnung", foreground=Farben.warnung)
        text.tag_configure("hinweis", foreground=Farben.akzent_hell)
        for zeile, kennzeichen in self.protokoll_zeilen:
            text.insert("end", zeile + "\n", kennzeichen)
        text.configure(state="disabled")
        text.see("end")
        self.protokoll_text = text

    def _beim_schliessen(self) -> None:
        if self.laeuft and not messagebox.askyesno(
                "Beenden", "Die Verarbeitung laeuft noch. Wirklich beenden?"):
            return
        if self.prozess is not None:
            try:
                self.prozess.terminate()
            except Exception:
                pass
        self.destroy()


def main(argv: list[str] | None = None) -> None:
    argumente = list(sys.argv[1:] if argv is None else argv)
    startordner = argumente[0] if argumente else None
    Anwendung(startordner).mainloop()


if __name__ == "__main__":
    main()
