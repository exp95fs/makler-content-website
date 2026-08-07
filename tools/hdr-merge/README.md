# HDR Merge – Belichtungsreihen zu neutralen Basisbildern

Werkzeug für die Immobilienfotografie: Es liest einen ganzen Ordner mit
Aufnahmen ein, **erkennt die einzelnen Belichtungsreihen selbst** und rechnet
jede Reihe zu einem technisch sauberen Basisbild zusammen – inklusive Window
Pull, also der Rückgewinnung der Fensteransicht aus der dunkelsten Belichtung.

Es gibt zwei Wege, es zu benutzen:

* **Fenster-Oberfläche** (`HDR-Merge starten.bat`) – Ordner wählen, fertig.
* **Kommandozeile** (`hdr_merge.py`) – für Stapelverarbeitung und Feinjustage.

**Was das Werkzeug bewusst NICHT tut:** keinen Look. Keine S-Kurve, kein
Kontrast-Boost, keine Sättigungsanhebung, kein Clarity, keine Vignette, kein
Schärfen, kein Himmelsersatz, keine KI. Das Ergebnis ist die Vorlage für das
eigene Lightroom-Preset, nicht das fertige Bild.

Der einzige tonale Eingriff ist die **tonale Normalisierung**: ein
deterministischer, regelbasierter Schritt, der jedes Bild auf dieselben
Zielwerte bringt. Abschaltbar mit `--base-tone off`.

---

## Schnellstart mit der Oberfläche

1. **Python installieren** (einmalig): python.org/downloads, beim Installieren
   den Haken **„Add python.exe to PATH"** setzen.
2. Doppelklick auf **`Verknuepfung auf Desktop.bat`** – legt ein Symbol
   „HDR Merge" auf den Desktop.
3. Doppelklick auf das Symbol. Beim ersten Start bietet das Programm an, die
   fehlenden Bausteine einzurichten – mit „Ja" bestätigen, ein bis zwei
   Minuten warten.
4. **Ordner wählen** → die Reihen werden erkannt und die erste erscheint als
   Vorschau.
5. An den Reglern justieren, bis es passt – die Vorschau rechnet mit.
6. **„Alle Reihen verarbeiten"** → fertige 16-Bit-TIFFs im Zielordner.

Ein Bilderordner kann auch direkt auf das Desktop-Symbol gezogen werden.

### Die Vorschau

Links stehen die Regler in Klartext (Helligkeit, Kontrast, Zeichnung,
Schärfe, Helligkeit des Raums, Was gilt als draußen, Fensterhelligkeit,
Fensterzeichnung), rechts das Bild. Nach jeder
Reglerbewegung wird neu gerechnet – auf einem verkleinerten Bild, deshalb in
rund zwei Sekunden statt einer Minute.

**Ins Bild klicken und halten** zeigt die unbearbeitete Aufnahme. Das ist der
schnellste Weg, die Wirkung der Regler zu beurteilen.

Entscheidend ist, dass die Vorschau **denselben Rechenweg** nimmt wie der
Endlauf: Beide rufen `verarbeite_bilder` auf, es gibt keine zweite
Implementierung. Alle Radien im Programm sind Anteile der Bildbreite, deshalb
wirkt jeder Regler auf dem kleinen Bild maßstabsgetreu. Zwei Tests halten das
fest — auf identischer Eingabe muss die Vorschau bitgleich zum Endergebnis
sein, und auf halber Kantenlänge müssen die Tonwert-Kennwerte übereinstimmen.
Ein dritter Test vergleicht jeden Regler mit der Voreinstellung im Programm,
damit die Oberfläche nicht unbemerkt abdriften kann.

Nur der Endlauf schreibt Dateien. Er läuft weiterhin als eigener Prozess, mit
genau den Werten, die in der Vorschau eingestellt waren.

---

### Wenn bei der Einrichtung etwas klemmt

Das Programm richtet die Bausteine **einzeln** ein, damit ein einzelnes
Problem nicht alles blockiert.

* **„Python wurde nicht gefunden"** – bei der Python-Installation wurde der
  Haken „Add python.exe to PATH" vergessen. Python noch einmal installieren,
  diesmal mit Haken.
* **„RAW-Entwicklung nicht verfügbar"** – für sehr neue Python-Versionen gibt
  es zeitweise noch kein fertiges `rawpy`-Paket. 16-Bit-TIFFs funktionieren
  dann trotzdem; für RAW-Dateien zusätzlich **Python 3.12** installieren und
  das Programm damit starten. Das Programm sagt das von sich aus und arbeitet
  weiter, statt abzubrechen.
* **„Einrichtung fehlgeschlagen"** bei numpy/opencv/tifffile – gleiche
  Ursache, gleiche Abhilfe (Python 3.12).

---

## Einrichtung für die Kommandozeile

```bat
python -m venv .venv && .venv\Scripts\activate && pip install -r requirements.txt
```

Unter macOS/Linux entsprechend `source .venv/bin/activate`.

```bat
python hdr_merge.py EINGABE_ORDNER AUSGABE_ORDNER --preview
```

Weitere typische Aufrufe:

```bat
:: Stativaufnahmen, feste Dreiergruppen
python hdr_merge.py C:\Objekt\raw C:\Objekt\basis --bracket-size 3 --no-align --preview

:: Flache Rohfusion ohne jede tonale Anpassung
python hdr_merge.py C:\Objekt\raw C:\Objekt\basis --base-tone off

:: Mehr Zeichnung im Fenster (dafür etwas dunklerer Himmel)
python hdr_merge.py C:\Objekt\raw C:\Objekt\basis --window-ceiling 0.70 --window-rolloff 0.8

:: Heller Himmel statt Zeichnung, dafür flacherer Fensterinhalt
python hdr_merge.py C:\Objekt\raw C:\Objekt\basis --window-ceiling 0.85

:: Ohne die gemessene Kontrastkurve (rein lineare Normalisierung wie früher)
python hdr_merge.py C:\Objekt\raw C:\Objekt\basis --tone-contrast 0
```

---

## Ausgabe

* **16-Bit-TIFF, unkomprimiert, sRGB** – volle Tonwerttiefe, ohne jeden
  Qualitätsverlust in Photoshop und Lightroom weiterverarbeitbar. Die
  Oberfläche schreibt grundsätzlich unkomprimiert; auf der Kommandozeile ist
  `--compression lzw` möglich (verlustfrei, aber benötigt `imagecodecs`).
* **Mit eingebettetem sRGB-Farbprofil.** Ohne Profil ist ein TIFF farblich
  mehrdeutig: Photoshop fragt beim Öffnen nach oder weist stillschweigend den
  eingestellten Arbeitsfarbraum zu – ist der Adobe RGB oder ProPhoto, werden
  dieselben Zahlen anders interpretiert und das Bild wirkt kräftiger, als es
  ist. Genau das darf einer Vorlage für ein Lightroom-Preset nicht passieren.
  Das Profil wird ohne zusätzliche Abhängigkeit selbst erzeugt; vier Tests
  prüfen seine Struktur (Kopf, Pflicht-Tags, Ausrichtung, Kennlinie) statt
  nur seine Anwesenheit.
* Dateiname `<erste Datei der Reihe>_hdr.tif`.
* EXIF der Referenzaufnahme wird übernommen, soweit möglich (siehe unten).
* Mit `--preview` zusätzlich ein JPEG-Kontaktbogen je Reihe:
  Einzelbelichtungen, Maskenüberlagerung und Ergebnis nebeneinander.

---

## Geschwindigkeit und Arbeitsspeicher

Gemessen an einer Dreierreihe mit 24 Megapixeln (6000 × 4000):

| | Wert |
|---|---|
| Rechenzeit je Reihe | rund 60 Sekunden (ein Prozess, ohne Ausrichtung) |
| Spitzenspeicher je Reihe | rund 3,5 GB |

Der Speicherbedarf ist der Grund, warum **nicht blind über alle Kerne
parallelisiert wird**: Acht gleichzeitige Prozesse bräuchten bei 24 Megapixeln
fast 30 GB. Das Werkzeug schätzt vor dem Start den Bedarf aus Bildgröße und
Reihenlänge, liest den freien Arbeitsspeicher aus und wählt die Prozessanzahl
entsprechend. Im Protokoll steht die Entscheidung mit Begründung:

```
Verarbeitung startet (3 Prozess(e), 24.0 MP, geschaetzt 3.5 GB je Reihe, 15.7 GB frei) ...
```

Mit `--jobs N` lässt sich die Automatik überstimmen. Für ein Objekt mit 30
Reihen à 24 Megapixeln ist mit rund 10 bis 30 Minuten zu rechnen, je nach
Kernanzahl und Arbeitsspeicher. `--no-align` bei Stativaufnahmen spart davon
spürbar.

---

## Qualitäts-Benchmark gegen den kommerziellen Dienst

Die Verarbeitung wird nicht nach Augenmaß beurteilt, sondern gemessen — gegen
**fünf echte Ergebnisse des kommerziellen Dienstes** (Wohnräume, Küchen,
Esszimmer) und gegen **echte Sony-ARW-Belichtungsreihen** derselben Objekte.

### Die gemessenen Zielwerte

| Kennwert | Dienst | Dieses Werkzeug |
|---|---|---|
| Schwarzpunkt (p0,2) | 0,034 | **0,034** |
| Median | 0,625 | **0,619** |
| Weißpunkt (p99,5) | 0,836 | **0,856** |
| Hellster Punkt | 0,963 | **0,977** |
| Ausgebrannte Pixel | 0,000 % | **0,000 %** |
| Hellste 5 % | 0,804 | **0,792** |
| **Gesamtabweichung** | – | **0,052** über drei echte Szenen (vorher 0,160) |

Im **Fensterbereich derselben Szene** (Schiebetür mit Blick auf einen Hang):

| | Dienst | Dieses Werkzeug |
|---|---|---|
| Luminanz | 0,630 | **0,636** |
| Zeichnung (lokale Streuung) | 0,033 | **0,049** |

Also gleiche Fensterhelligkeit bei mehr erhaltener Struktur.

### Die Prüfliste am Ende

Der eigentliche Zeitfresser bei einem Objekt mit dreißig Reihen ist nicht das
Rechnen, sondern das Durchsehen. Am Ende jedes Laufs steht deshalb:

```
Pruefliste: 2 von 30 Reihen bitte ansehen, der Rest ist unauffaellig.
  DSC03613
      Dunkelbild ist im Fensterbereich zu 2.6 % selbst ausgebrannt - die
      Belichtungsreihe war zu knapp gestuft, mehr Blendenstufen nach unten.
  DSC03701
      Fenstermaske umfasst 31.2 % des Bildes - das ist meist eine
      Fehlerkennung.
```

Alles, was nicht aufgeführt ist, kann ungesehen weiterverarbeitet werden. Die
Oberfläche zeigt dieselbe Aussage nach dem Lauf in der Statuszeile.

### Tests

```bat
python test_hdr_merge.py     :: Bildverarbeitung (86 Tests)
python test_gui.py           :: Oberfläche (15 Tests)
```

`test_gui.py` stellt tkinter durch einen Ersatz, der jeden Aufruf annimmt.
Damit läuft der komplette Aufbau des Fensters auch dort durch, wo kein
Fenstersystem vorhanden ist — auf einem Bauserver oder in einer schlanken
Umgebung. Das fängt nicht alles (ob eine ttk-Option gültig ist, weiß nur das
echte tkinter), aber die häufigsten Fehler: falsch geschriebene
Methodennamen, in falscher Reihenfolge angelegte Variablen, kaputte
Signaturen. Zwei der Tests rechnen eine echte Vorschau durch.

Der `PhotoImage`-Ersatz ist bewusst **streng**: Er lehnt base64-Daten für
Formate ab, die das echte Tk nicht als base64 annimmt. Genau daran ist die
Oberfläche einmal gestorben — sie übergab PPM als base64, Tk wies es zurück,
und weil die Meldungsschleife das Wiedereinplanen erst nach dem `try`-Block
hatte, stand danach das ganze Fenster still: keine Vorschau, kein
Fortschritt, kein „fertig", während die Verarbeitung im Hintergrund
weiterlief. Vier Tests decken das jetzt ab.

`benchmark_fotello.py` misst ein beliebiges Ergebnis gegen diese Zielwerte:

```bat
python benchmark_fotello.py C:\Objekt\basis
```

### Was diese Messungen an Fehlern aufgedeckt haben

Alles davon wurde erst durch den Vergleich sichtbar und ist behoben:

1. **Der Himmel wurde milchig weiß.** Die Lichterkompression rechnete auf der
   Luminanz. Ein blauer Himmel hat im Blaukanal höhere Werte — Blau lief über
   1,0 und wurde abgeschnitten. Jetzt wird auf dem stärksten Kanal je Pixel
   gerechnet; die Sättigung bleibt exakt erhalten.
2. **Der lokale Weißabgleich im Fenster zerstörte die Himmelsfarbe** (weiße
   Wolken wurden orange, Sättigung halbiert). Standard ist jetzt aus.
3. **Das Gamma hob die Sättigung an** — kanalweise gerechnet stieg die
   Sättigung eines Eichenbodens von 0,29 auf 0,51. Jetzt über die Luminanz.
4. **Weiße Wände wurden grau**, weil ein fester Mittelton-Zielwert auch helle
   Räume herunterzog. Neuer Standard `--mid-mode lift`: nur aufhellen.
5. **Die Gruppierung zerriss echte Belichtungsreihen.** Sony belichtet in der
   Reihenfolge normal–dunkel–hell (gemessen: EV 10,2 / 12,3 / 8,2). Die alte
   Regel setzte eine monotone EV-Folge voraus. Jetzt endet eine Reihe, wenn
   sich ein EV-Wert wiederholt — unabhängig von der Reihenfolge.
6. **Das Gamma verschob die verankerten Endpunkte wieder.** Bei kräftiger
   Aufhellung landete der Schwarzpunkt statt bei 0,035 bei 0,059 — die Tiefen
   grauten aus. Ein zweiter, rein linearer Durchgang setzt beide Endpunkte
   jetzt exakt.
7. **Die Lichterrücknahme hing an einer Heuristik.** In einer Messreihe sprang
   die Fensterhelligkeit dadurch zwischen 0,80 und 0,97 (1,7 % geclippt), je
   nachdem auf welcher Seite einer Schwelle eine Szene landete. Sie greift
   jetzt immer.
8. **Das Kompressionsknie saß auf der Rahmenhelligkeit.** Bei hellem
   Fensterrahmen blieben nur vier Hundertstel bis zur Obergrenze — der
   Fensterinhalt verlor zwei Drittel seiner Zeichnung. `--window-range` hält
   jetzt immer ein ausreichendes Band frei.
9. **Zwei Halo-Ursachen:** ein weißer Saum entlang der Fensterkante und ein
   heller Schein um dunkle Gegenstände vor dem Fenster. Beides kam daher, dass
   der Guided Filter die Maske an dunklen Kanten einbrechen lässt — richtig
   fürs Überblenden, fatal für die Lichterkompression. Es gibt jetzt zwei
   getrennte Masken, dazu eine Aussichts-Gewichtung, die nur dort ersetzt, wo
   tatsächlich die Szene außerhalb des Fensters liegt.

### Wenn das Preset auf den Dienst kalibriert ist

Das bestehende Lightroom-Preset erwartet die Ausgabe des kommerziellen
Dienstes. Die kommt gemessen **entsättigter** heraus als ein neutrales
Basisbild. Zwei Schalter gleichen das an – in der Oberfläche als
„Farbgebung an den Dienst angleichen", auf der Kommandozeile:

```bat
python hdr_merge.py C:\Objekt\raw C:\Objekt\basis --raw-wb auto --color-match 1.0
```

Gemessen an der echten Aufnahme: Sättigung 0,160 → **0,105** (Dienst: 0,098),
weiße Wand R/B 1,114 → 1,043 (Dienst: 1,004). Im direkten Bildvergleich ist
das die sichtbar nächste Annäherung.

Beides ist **standardmäßig aus**, weil die Grundregel gilt: der Look gehört
ins Preset, nicht ins Basisbild.

### Wo der Dienst bewusst nicht nachgebaut wird

Zwei gemessene Unterschiede sind **Absicht**, keine Mängel:

* **Sättigung** (Dienst 0,098, hier 0,157). Die Quelle selbst liegt bei 0,184 —
  dieses Werkzeug fügt also keine Sättigung hinzu, der Dienst *nimmt* welche
  weg. Laut Vorgabe bleibt Sättigung Sache des Presets.
* **Kontrastkurve.** Beim Dienst liegen weiße Wände bei 0,76 bei einem Median
  von 0,63 — die oberen Mitteltöne sind angehoben. Das ist eine S-Kurve; sie
  gehört ins Preset, nicht ins Basisbild.

Ein dritter Unterschied ist eine **echte Grenze**: Der Dienst macht weiße Wände
*und* Decke exakt neutral (Sättigung 0,009 bzw. 0,000). In der vermessenen
Aufnahme ist die Wand von warmem Sonnenlicht beschienen, die Decke nicht —
beide gleichzeitig zu neutralisieren geht nur mit einem **lokalen**
Weißabgleich. Der hier vorgegebene globale, zurückhaltende Weißabgleich kann
das nicht und lässt die Wand leicht warm (0,084).

### Aufrichten (Upright)

Der Dienst richtet erkennbar auf: Seine Senkrechten haben eine gemessene
Neigung von 0,00°. `--straighten` korrigiert beides getrennt — die **Kippung**
um die optische Achse und die **Neigung** (stürzende Linien). An der echten
Aufnahme: Kippung −0,81° → **0,00°**, Beschnitt 2,9 %. Die Brennweite kommt
aus dem EXIF (Kleinbild-Äquivalent); bei der vermessenen Aufnahme 16 mm — die
frühere Annahme „Brennweite = Bildbreite" lag um Faktor 2,25 daneben.

Die Korrektur stürzender Linien bleibt bewusst zurückhaltend: Sie greift nur
bei einem plausiblen Fluchtpunkt, den ein Konsensverfahren über alle
Linienpaare bestimmt (Sofakanten und Dachschrägen sollen ihn nicht verziehen).
An der echten Aufnahme schätzte das Verfahren eine Neigung von 26° – über dem
Schwellwert und damit abgelehnt. Das ist der gewollte Fall: Lieber nur die
sichere Kippung korrigieren als eine unsichere Entzerrung anwenden.

### Objektivverzeichnung

Innenaufnahmen entstehen mit sehr weitwinkligen Objektiven – bei der
vermessenen Aufnahme einem Sigma 14–24 mm bei 16 mm. Solche Objektive
verzeichnen tonnenförmig, und der Vergleich legt nahe, dass der kommerzielle
Dienst das korrigiert.

Zwei Wege stehen bereit:

* `--lens-k1 WERT` – ein **fester** Koeffizient. Das ist der empfohlene Weg:
  Wer immer dasselbe Objektiv benutzt, ermittelt den Wert einmal (mit einer
  Aufnahme, die lange Geraden enthält) und verwendet ihn dauerhaft.
* `--lens-correct` – **automatische** Schätzung aus den Bildkanten.

Zur Automatik ehrlich: Sie funktioniert nur, wenn genügend lange, wirklich
gerade Kanten im Bild sind. An der Testaufnahme fand sie 10 brauchbare
Kantenzüge und schlug k1 = −0,17 vor, verbesserte die Geradheit damit aber nur
um 6 % – unter der Sicherheitsschwelle von 10 %, also **nicht angewendet**.
Der Vorschlag steht im Protokoll. In einem Wohnraum sehen Sofakanten und
Teppichmuster fast wie Geraden aus; eine Profildatenbank wäre genauer, würde
aber eine weitere Abhängigkeit bedeuten.

## Was das Werkzeug der Reihe nach macht

1. **RAW-Entwicklung** über `rawpy.postprocess` mit `no_auto_bright=True`,
   `use_camera_wb=True`, `output_bps=16`, sRGB. Keinerlei Auto-Korrekturen;
   alle Bilder einer Reihe zwingend mit identischen Parametern.
2. **Gruppierung** über EXIF (`DateTimeOriginal` plus EV-Muster). Eine neue
   Reihe beginnt bei einer Zeitlücke oder wenn das EV-Muster zurückspringt.
3. **Ausrichtung** mit `cv2.findTransformECC` (`MOTION_EUCLIDEAN`), geschätzt
   auf viertelaufgelösten Graustufenbildern, Matrix danach hochskaliert.
4. **Fusion** mit `cv2.createMergeMertens` – bewusst kein Debevec/Robertson
   mit Tonemapping: Mertens braucht keine Schätzung der Kamerakurve.
5. **Window Pull** (siehe unten).
6. **Tonale Normalisierung** auf feste Zielwerte.
7. Optional **Perspektivkorrektur**, dann Speichern.

### Window Pull im Detail

1. Referenzbild = mittlere Belichtung, Dunkelbild = niedrigste Belichtung.
2. Ausgebrannte Bereiche im Referenzbild maskieren (Luminanz >
   `--window-threshold`).
3. Morphologisches Schließen und Löcherfüllen, damit ein Fenster **inklusive
   Sprossen** eine zusammenhängende Fläche ist.
4. **Gegenprüfung am Dunkelbild**, bewusst pro Fläche statt pro Pixel: Eine
   Fläche gilt nur als Fenster, wenn genügend ihrer Pixel dort echte Struktur
   zeigen. Das verwirft weiße Wände, Deckenleuchten und Lampenschirme, hält
   aber glatten Himmel innerhalb eines echten Fensters in der Maske. Gemessen
   wird nur im **erodierten Inneren** – der Rand jeder ausgebrannten Fläche
   zeigt immer Struktur, dort liegt ja die Kante zur Umgebung.
5. Größenfilter gegen Glanzlichter auf Armaturen und Türklinken.
6. **Kantenbewusstes Weichzeichnen der Maske über einen Guided Filter**
   (selbst in NumPy implementiert, damit keine Abhängigkeit auf
   `opencv-contrib` entsteht). Ausdrücklich **kein** Gauß auf der Maske –
   genau das erzeugt Halos.
7. **Aussichts-Gewichtung:** Ersetzt wird nur dort, wo tatsächlich die Szene
   außerhalb des Fensters liegt. Ein dunkler Gegenstand vor dem Fenster – eine
   Pendelleuchte, ein Fensterkreuz, ein Sofakissen – bleibt unangetastet, sonst
   entsteht mitten im Objekt ein Helligkeitssprung an der Fenstergrenze.

   Entscheidend ist, **woran** Aussicht erkannt wird. Früher wurde gefragt, ob
   das Referenzbild ausgebrannt war. Das ist zu eng: Eine Fensterscheibe hinter
   einem Insektengitter ist Aussicht, brennt aber nicht aus (gemessen:
   Referenz-Luminanz 0,52 gegenüber 0,96 bei der Nachbarscheibe). Sie blieb
   deshalb komplett die flaue Fusion, während direkt daneben der klare dunkle
   Auszug stand — zwei verschiedene Darstellungen derselben Aussicht
   nebeneinander, getrennt durch eine sichtbare Kante. Das waren die
   „schattierten Bereiche" im Fenster.

   Gefragt wird stattdessen, ob der zurückgeholte Fensterinhalt **heller liegt
   als der Fensterrahmen**. Das trennt ohne freien Parameter, weil es die
   Geometrie der Szene abbildet: Was draußen ist, ist heller als der Rahmen;
   was im Raum davor steht, ist dunkler. Gemessen an derselben Szene bei
   Rahmenluminanz 0,48 — Aussicht hinter Gitter 0,82, freie Aussicht 1,67,
   Sofakissen 0,14, Holzwand 0,36. Was im Referenzbild ausgebrannt war, gilt
   zusätzlich immer als Aussicht; das ist die Rückfallebene, falls die
   Rahmenhelligkeit einmal schlecht geschätzt wird.
8. **Komposition:** Fensterinhalt aus dem Dunkelbild, helligkeitsangepasst
   über die mittlere Luminanz in einem dilatierten Ring um die Maskengrenze
   (den Fensterrahmen), damit der Übergang nicht springt.
9. **Lichterkompression** oberhalb der Rahmenhelligkeit, gerechnet auf dem
   stärksten Kanal. Erst überblenden, dann komprimieren – umgekehrt schlägt
   das ausgebrannte Grundbild durch und clippt.

### Tonale Normalisierung im Detail

1. **Weißpunkt:** 99,5-Perzentil der Luminanz **außerhalb** der Fenstermaske
   auf `--white-target`. Das Fenster wird ausgeschlossen, sonst verankert der
   Himmel den Weißpunkt und der Innenraum bleibt dunkel.
2. **Schwarzpunkt:** 0,2-Perzentil auf `--black-target`.
3. **Mittelton:** Median der Innenraum-Luminanz per Gamma auf `--mid-target`,
   standardmäßig nur aufhellend (`--mid-mode lift`). Das Gamma wird auf der
   Luminanz gerechnet, damit die Sättigung unverändert bleibt.
4. **Globaler Weißabgleich** über den Graupunkt großer, gering gesättigter,
   heller Flächen (`--wb-strength`), damit warmes Holz warm bleibt.
5. **Highlight-Schutz:** Fällt die Streuung im Fenster durch das Anheben ab,
   wird der Fensterbereich aus den **unkomprimierten Rohdaten** neu aufgebaut –
   nicht aus dem bereits abgeschnittenen Ergebnis, dort wäre die Zeichnung
   schon vernichtet.

Weiß-, Schwarzpunkt und Mittelton werden gemeinsam gelöst: Ein Gamma nach der
Schwarzpunkt-Verankerung würde den Schwarzpunkt wieder anheben (0,02 hoch 0,57
sind 0,11).

---

## Parameter

### Gruppierung

| Parameter | Standard | Wirkung |
|---|---|---|
| `--bracket-size` | `auto` | `auto` = EXIF-Zeit + EV-Muster. Eine feste Zahl (z. B. `3`) gruppiert stur in N aufeinanderfolgende Dateien. |
| `--group-gap` | `6.0` | Max. Sekunden zwischen zwei Aufnahmen derselben Reihe. |

### Ausrichtung und Fusion

| Parameter | Standard | Wirkung |
|---|---|---|
| `--no-align` | aus | Ausrichtung überspringen (Stativ) – spürbar schneller. |
| `--contrast` | `1.0` | Mertens-Gewicht für lokalen Kontrast bei der Auswahl. |
| `--saturation` | `1.0` | Mertens-Gewicht für Farbigkeit. Beeinflusst nur die **Auswahl**, hebt die Sättigung nicht an. |
| `--exposure` | `1.0` | Mertens-Gewicht für gut belichtete Bildanteile. |

### Window Pull

| Parameter | Standard | Wirkung |
|---|---|---|
| `--window-strength` | `1.0` | Deckkraft des Effekts. `0` = aus. |
| `--window-wb` | `0.0` | Lokaler Weißabgleich im Fenster. **Standard aus** – bei Tageslichtfenstern zerstört er die Himmelsfarbe (siehe Benchmark). Nur sinnvoll, wenn ein Fenster tatsächlich unnatürlich kalt wirkt. |
| `--window-threshold` | `0.90` | Ab welcher Luminanz ein Bereich als ausgebrannt gilt. |
| `--window-detail` | `0.010` | Mindest-Standardabweichung im Dunkelbild (Struktur). |
| `--window-detail-fraction` | `0.10` | Anteil strukturierter Pixel, ab dem eine Fläche als Fenster gilt. Höher = strenger gegen Fehlerkennungen. |
| `--window-min-area` | `0.001` | Mindestgröße einer Fläche als Bildanteil (0,1 %). |
| `--window-close` | `0.015` | Breite des Schließ-Kernels als Anteil der Bildbreite. Muss breiter sein als eine Fenstersprosse. |
| `--window-ceiling` | `0.75` | Obergrenze für den Fensterinhalt. Niedriger = mehr Zeichnung, grauerer Himmel. An einer echten Fensterfläche gemessen: `0.90` ergab Luminanz 0.73, das Vorbild liegt bei 0.58. |
| `--window-rolloff` | `1.6` | Steilheit der Lichterkompression. Kleiner = mehr Zeichnung, dunklerer Himmel. |
| `--window-range` | `0.50` | Mindestbreite des Tonwertbands für den Fensterinhalt. Größer = mehr Zeichnung im Fenster. |
| `--window-blur` | `0.008` | Guided-Filter-Radius als Anteil der Bildbreite. |
| `--window-texture` | `0.9` | Anteil der Feinzeichnung, der die Lichterkompression unverändert übersteht. `0` = alte, flachere Kompression; `1` = volle Wolken- und Wiesenzeichnung. Die Kompression ist eine flache Kennlinie und würde die feine Zeichnung sonst mitstauchen (gemessen: 0.014 statt 0.049 beim Vorbild). |

### Tonale Normalisierung

| Parameter | Standard | Wirkung |
|---|---|---|
| `--base-tone` | `on` | `off` liefert die flache Rohfusion. |
| `--white-target` | `0.755` | Zielwert für den Weißpunkt des Innenraums. Am Vorbild kalibriert: die nachgelagerte Kontrastkennlinie hebt den Weißpunkt noch um rund 0,06, entsprechend liegt der Zielwert darunter. |
| `--black-target` | `0.053` | Zielwert für den Schwarzpunkt. |
| `--mid-target` | `0.587` | Zielwert für den Mittelton. Ebenfalls am Vorbild kalibriert (siehe `--white-target`). |
| `--mid-mode` | `lift` | `lift` hellt nur auf (weiße Wände bleiben weiß); `exact` erzwingt den Zielwert in beide Richtungen. |
| `--white-percentile` | `99.5` | Perzentil für den Weißpunkt. |
| `--black-percentile` | `0.2` | Perzentil für den Schwarzpunkt. |
| `--wb-strength` | `0.0` | Stärke des globalen Weißabgleichs. `0` = aus. |
| `--raw-wb` | `camera` | Weißabgleich der RAW-Entwicklung. `auto` berechnet ihn neu und liefert ein neutraleres Bild (gemessen: weiße Wand R/B 1,043 statt 1,114). |
| `--tone-contrast` | `1.0` | Anteil der am kommerziellen Dienst **gemessenen** Kontrastkennlinie. `0` = rein lineare Normalisierung wie bisher. Ohne sie wirkt das Ergebnis flach und verschleiert: Was hier bei 0.30 lag, liegt beim Vorbild bei 0.18, was hier bei 0.70 lag, dort bei 0.77. |
| `--shadow-gain` | `8.0` | Obergrenze für die Aufhellung eines einzelnen Pixels. Begrenzt die Rauschverstärkung in den Tiefen. |
| `--local-wb` | `0.0` | Stärke des lokalen Weißabgleichs. Ein Innenraum ist fast nie von einer einzigen Lichtquelle beleuchtet (gemessen: Boden R/B 3.4 durch Kunstlicht, Decke 0.92 durch Tageslicht); global heben sich beide Stiche auf. Die örtliche Lichtfarbe wird **nur aus nahezu neutralen Flächen** geschätzt, damit ein Eichenboden warm bleibt. `0` = aus. |
| `--local-wb-radius` | `0.15` | Radius der Schätzung als Anteil der Bildbreite. Groß, damit großflächige Lichtstimmungen erfasst werden und nicht die Farbe einzelner Gegenstände. |
| `--local-wb-limit` | `0.35` | Obergrenze der Korrektur je Kanal. |
| `--highlight-ceiling` | `0.98` | Obergrenze für Spitzlichter im ganzen Bild (`0` = aus). Verhindert hartes Clipping. |
| `--color-match` | `0.0` | Sättigung anteilig an den kommerziellen Dienst angleichen (`0` = aus, `1` = vollständig). In der Oberfläche der Regler **Farbzurückhaltung**. Der Dienst entsättigt deutlich, dieses Werkzeug nicht — nachgemessen über drei Szenen liegt er über den ganzen Bereich um Faktor 1,5 bis 2,5 niedriger. Bei `1` trifft dieser Schalter dessen Profil fast genau: |

| Sättigungs-Perzentil | p50 | p75 | p90 | p95 | p99 |
|---|---|---|---|---|---|
| Dienst | 0,066 | 0,107 | 0,354 | 0,442 | 0,500 |
| ohne | 0,077 | 0,180 | 0,529 | 0,602 | 0,716 |
| mit `--color-match 1.0` | 0,046 | **0,110** | **0,343** | 0,395 | **0,481** |

Voreingestellt bleibt `0`: Wer ein eigenes Preset fährt, will die Farben
unangetastet. Wer den zurückhaltenden Look des Dienstes will, zieht den Regler
auf 1 und sieht die Wirkung sofort in der Vorschau.
| `--color-match-target` | `0.098` | Zielwert der Sättigung, am Dienst gemessen. Wirkt nur zusammen mit `--color-match`. |

### Strahlungskarte (Standardweg)

Aus den EV-Werten der Aufnahmen wird eine echte Strahlungskarte
rekonstruiert und anschließend lokal tonemappt. **Ohne jede Fenstermaske** —
es gibt keinen Schwellwert, der Fenster von Wand unterscheiden müsste.

| Parameter | Standard | Wirkung |
|---|---|---|
| `--hdr` | `on` | `off` fällt auf die alte Belichtungsfusion mit Fenstermaske zurück. |
| `--hdr-compression` | `0.62` | **Helligkeit des Raums.** Das Bild wird mit einem reinen Faktor auf dieses Niveau belichtet — wie an der Kamera. Ein Faktor verzerrt keine Tonwertabstände: Der Raum wird hell, ohne flach zu werden. In der Oberfläche der Regler **Helligkeit des Raums**. |
| `--hdr-structure` | – | *(fest im Programm)* Ein heller Bereich gilt nur dann als Fenster, wenn er auch **Struktur** hat. Gemessen an einer Küchenszene, jeweils relativ zum Raumniveau: die vom Spot angestrahlte Decke liegt bei **+2,2 Blenden**, das Fenster im Median bei **+1,8** — die Decke ist also *heller* als das Fenster. Über die Helligkeit allein sind sie grundsätzlich nicht trennbar, und jede Schwelle, die das Fenster erfasst, zieht die Decke mit herunter: der graue Hof auf der weißen Decke. Der Tonwertumfang *innerhalb* des Bereichs trennt sie dagegen sauber — Decke 0,08 Blenden lokale Streuung, Fenster 0,85. |
| `--hdr-knee` | `0.9` | **Was gilt als draußen.** Ab dieser Helligkeit wird ein Bereich als Fensterfläche behandelt und heruntergezogen. Bewusst über `1.0`: Fenster liegen drei bis vier Blendenstufen über dem Raum, sonnenbeschienene Innenflächen nur eine halbe. Zu tief eingestellt werden auch sie gezogen — dann legt sich ein Schleier über Arbeitsplatten und helle Wände. In der Oberfläche der Regler **Was gilt als draußen**. |
| `--hdr-detail` | `1.0` | Erhalt der Feinzeichnung. `1.0` = unangetastet. |
| `--hdr-radius` | `0.02` | Radius der Trennung von Beleuchtung und Zeichnung, als Anteil der Bildbreite. |
| `--hdr-highlight` | `0.40` | **Fensterhelligkeit** — wohin die Fensterfläche gezogen wird. Das ist die Helligkeit der *Fläche*; der Inhalt (Himmel, Laub, Ziegel) liegt darüber und darunter. Tiefer = dichtere Fenster. In der Oberfläche der Regler **Fensterhelligkeit**. |
| `--profile` | `log` | **Die wichtigste Entscheidung.** `log` legt den *gesamten* Szenenumfang flach auf den Anzeigebereich — gleichmäßige Verteilung, oben bewusst freie Reserve. Das Ergebnis ist absichtlich flach: Es ist die Vorlage für das eigene Preset, nicht das fertige Bild. `bild` nimmt den früheren Weg (Belichtung auf Raumniveau, danach Lichterschulter) — dabei landet ein Fenster zwangsläufig oben am Anschlag, und genau dann brennt es aus, sobald man zum Aufhellen die Belichtung anhebt. |
| `--log-floor` | `0.06` | Wohin die dunkelste Stelle der Szene gelegt wird. |
| `--log-ceiling` | `0.85` | Wohin die hellste Stelle gelegt wird. Die 15 % darüber sind **freie Reserve** für die spätere Belichtungskorrektur — der Kern der ganzen Betriebsart. |
| `--hdr-range` | `1.0` | Staucht den Helligkeitsumfang zwischen Raum und Fenster **global** (also ohne Maske, damit ohne Saum). Voreingestellt `1.0`, also aus — gemessen bringt er das Fenster kaum herunter, hebt aber die Tiefen deutlich an: Bei `0.45` steigt das Perzentil 1 von 0,09 auf 0,32, während das Fenster bei 0,92 stehen bleibt. Das ist genau der flache Look mit angehobenen Tiefen, der nicht gewünscht ist. Der Schalter bleibt für den Fall, dass jemand ein bewusst flaches Ausgangsbild will. |
| `--hdr-local` | `off` | **Ortsabhängiger Zug der Fensterfläche** auf Raumhelligkeit. Eine globale Kennlinie *kann* ein Fenster, das physikalisch vier Blenden heller ist als der Raum, nicht auf dessen Helligkeit bringen — das verbietet die Monotonie. Der Zug leistet das, arbeitet dafür aber über eine weiche Maske, und Masken folgen keiner Objektkante: Übrig bleibt ein dunkler Hof um kleine Fenster und ein grauer Streifen auf der Decke daneben. Ein Saum macht ein Bild unbrauchbar, ein etwas helleres Fenster nur weniger gut — deshalb ist `off` die Voreinstellung. Gemessen an der Testszene: Fensterzeichnung 0,0033 ohne, 0,0050 mit. |
| `--hdr-saturation` | `0.65` | **Fensterfarbe** — wie stark die Farbe draußen zurückgenommen wird. Bei `1.0` bleibt das Kanalverhältnis exakt erhalten; ein sehr helles Pixel liegt aber dicht an Weiß, und wird die Fläche um mehrere Blendenstufen heruntergezogen, wird aus blassem Blau ein kräftiges Cyan — der klassische HDR-Himmel. Gemessen an einer Haustür-Szene: Sättigung 0,218 bei `1.0` gegenüber 0,161 beim kommerziellen Vorbild. Wirkt nur auf die gezogene Fläche, der Innenraum bleibt unberührt. In der Oberfläche der Regler **Fensterfarbe**. |
| `--hdr-window-contrast` | `0.55` | **Fensterzeichnung** — wie viel Tonwertumfang die Fensterfläche behält. `1.0` heißt voller Umfang: Die Fläche wird korrekt heruntergezogen und anschließend mit ihren dreieinhalb Blendenstufen wieder nach oben geschoben, brennt also erneut aus. `0` ergibt eine flache Fläche ohne Aussicht. In der Oberfläche der Regler **Fensterzeichnung**. |

#### Warum Tiefen und Lichter getrennt gestaucht werden

Symmetrisch gestaucht wandert alles zur Mitte: Die Tiefen werden aufgehellt,
die Lichter abgedunkelt, das Bild sitzt in einem schmalen Band und wirkt flau.
Gebraucht wird aber beides gleichzeitig — tiefe Schatten **und** gebändigte
Fenster. Gemessen als Perzentil-Profil gegen den kommerziellen Dienst,
gemittelt über drei Szenen:

| | p1 | p5 | p15 | p50 | p85 | p95 | Abweichung |
|---|---|---|---|---|---|---|---|
| Dienst | 0,063 | 0,198 | 0,417 | 0,658 | 0,788 | 0,830 | – |
| symmetrisch | 0,189 | 0,374 | 0,503 | 0,626 | 0,693 | 0,756 | 0,081 |
| **getrennt** | 0,131 | 0,256 | 0,423 | 0,626 | 0,721 | 0,769 | **0,044** |

Dazu liegt das „Raumniveau", an dem die Stauchung ihr Vorzeichen wechselt,
nicht auf dem Median, sondern auf dem 75. Perzentil. Auf dem Median bekam die
halbe Bildfläche die harte Lichterstauchung ab — auch helle Wände, Schränke
und Decken, die nur ein bis zwei Blendenstufen über dem Raum liegen.

### Zeichnung und Schärfe

Das Aufhellen kostet Zeichnung, und zwar messbar: Eine Holzwand steigt von
Luminanz 0,27 auf 0,70, der Absolutkontrast ihrer Maserung bleibt dabei fast
gleich (0,0031 → 0,0025). Relativ zur Umgebung — und nur so nimmt das Auge
Struktur wahr — fällt die Zeichnung damit auf ein Drittel. Aus einer Holzwand
mit Maserung und Astlöchern wird eine weiße Fläche.

Die Voreinstellungen sind am kommerziellen Dienst **gemessen**, nicht
geschätzt: Bei praktisch gleicher mittlerer Helligkeit (0,710 gegenüber 0,704)
trägt dessen Wandfläche über alle Strukturgrößen hinweg das Zwei- bis
Zweieinhalbfache an Zeichnung. Nachgemessen über vier Bildzonen liegt das
Ergebnis mit diesen Werten bei 0,78 bis 1,20 des Vorbilds.

| Parameter | Standard | Wirkung |
|---|---|---|
| `--clarity` | `0.6` | Lokaler Kontrast über den Guided Filter. Kantenbewusst, damit an harten Kontrastkanten (Fensterrahmen gegen helle Aussicht) keine hellen Säume entstehen. `0` = aus. |
| `--clarity-radius` | `0.005` | Radius als Anteil der Bildbreite. |
| `--sharpen` | `0.7` | Capture Sharpening. Gleicht die Weichheit aus, die jede RAW-Entwicklung durch Demosaicing mitbringt — kein Kreativ-Effekt. `0` = aus. |
| `--sharpen-radius` | `1.0` | Radius **in Pixeln**, nicht als Anteil der Bildbreite. Die auszugleichende Unschärfe stammt aus Demosaicing und Sensor-Tiefpass und ist eine feste Pixel-Eigenschaft – sie wird nicht größer, nur weil der Sensor mehr Megapixel hat. Siehe die Messung unten. |

#### Warum der Schärfe-Radius absolut ist

Er war zunächst ein Anteil der Bildbreite und ergab auf einer
33-Megapixel-Aufnahme **4,2 px Sigma**. Das ist kein Capture Sharpening mehr,
sondern ein breiter Saum um jede Kante — gemessen an derselben Aufnahme:

| Sigma | feine Kanten | breite Halos | Verhältnis |
|---|---|---|---|
| ohne Schärfen | 0,00945 | 0,02431 | 0,389 |
| 1,0 px | 0,01402 | 0,02496 | **0,562** |
| 1,5 px | 0,01461 | 0,02569 | **0,569** |
| 4,2 px (alt) | 0,01495 | **0,03063** | 0,488 |

Bei 4,2 px springt die Energie in breiten Übergängen um 26 % hoch, während die
feinen Kanten kaum mehr gewinnen als bei 1,0 px. Genau dieser breite Saum ist
der Eindruck „da liegt ein Filter drüber" — und die eigentlichen Kanten
bleiben trotzdem weich.

### Perspektive und Ausgabe

| Parameter | Standard | Wirkung |
|---|---|---|
| `--straighten` | aus | Richtet auf: korrigiert Kippung (Drehung) und Neigung (stürzende Linien). |
| `--straighten-max-deg` | `8.0` | Darüber wird nicht korrigiert, sondern nur gewarnt. |
| `--lens-k1` | `0.0` | Fester Verzeichnungskoeffizient. Negativ gleicht tonnenförmige Verzeichnung aus (Weitwinkel). Einmal für das eigene Objektiv ermitteln. |
| `--lens-correct` | aus | Verzeichnung automatisch aus den Bildkanten schätzen. Experimentell – siehe Grenzen. |
| `--skip-existing` | aus | Reihen überspringen, deren Ergebnis schon im Zielordner liegt. Für Nachzügler-Aufnahmen: Nach dem Nachlegen weiterer Reihen wird nur das Neue gerechnet, statt eine Stunde lang alles zu wiederholen. Die Oberfläche fragt von sich aus, sobald sie Ergebnisse im Zielordner findet. |
| `--preview` | aus | JPEG-Kontaktbogen je Reihe. |
| `--compression` | `none` | `lzw` ist verlustfrei, benötigt aber `imagecodecs`. |
| `--jobs` | `0` | Parallele Prozesse (`0` = Kerne minus 1). |
| `--verbose` | aus | Ausführliches Protokoll inklusive aller Zwischenwerte. |

---

## Warnungen im Protokoll

Das Werkzeug bricht nicht ab, sondern warnt und arbeitet weiter:

* Fenstermaske über 25 % des Bildes – meist eine Fehlerkennung.
* Dunkelbild brennt im Fensterbereich selbst schon aus – Reihe war zu knapp
  gestuft.
* Ausrichtung fehlgeschlagen (ECC nicht konvergiert).
* Gruppe mit unerwarteter Bildanzahl (nicht 3, 5 oder 7).
* Fensterzeichnung bleibt auch nach dem Rolloff deutlich unter dem
  Ausgangswert – dann ist `--mid-target` für diese Szene zu hoch.
* Perspektivkorrektur wegen Schwellwertüberschreitung abgelehnt.

Defekte Dateien, gemischte Bildgrößen, leere Ordner und Einzeldateien werden
abgefangen: Die betroffene Reihe wird übersprungen, der Rest läuft weiter.

---

## Tests

```bat
python -m unittest test_hdr_merge test_reference
```

58 Tests: Window Pull, Maskenlogik, Halofreiheit, Zielwerte, Bitgleichheit
zweier Läufe, Gruppierung, Ausrichtung, Robustheit, Ausgabeformat und der
komplette Qualitäts-Benchmark gegen die Referenzszene.

Testszenen zum Anschauen erzeugen:

```bat
python make_test_scene.py testszene 3      :: Wohnraum, drei Reihen mit EXIF
python make_reference_scene.py refszene    :: Dachgeschoss-Benchmark
```

---

## Grenzen – ehrlich

* **Der Himmel bleibt komprimiert.** Ein Fenster ist rund 6 Blendenstufen
  heller als der Innenraum; beides gleichzeitig linear in 0..1 unterzubringen
  ist physikalisch unmöglich. In der Benchmark bleiben 76 % der
  Wolkenzeichnung erhalten – sichtbar, aber flacher als im Dunkelbild. Mit
  `--window-ceiling` und `--window-rolloff` lässt sich zugunsten von Zeichnung
  nachregeln, der Himmel wird dann grauer.
* **Dunkle Gegenstände vor dem Fenster hellen leicht auf.** Exposure Fusion
  arbeitet über Laplace-Pyramiden; die extrem helle Umgebung blutet über
  mehrere Pixel in das dunkle Objekt. Eine schwarze Pendelleuchte vor einem
  Dachfenster wird dadurch zum Fenster hin etwas heller. Das ist ein
  Verfahrensmerkmal von Mertens, kein Einstellungsfehler.
* **Der Weißabgleich ist eine Schätzung.** Bei sehr warmem Kunstlicht oder
  großen farbigen Flächen kann der Graupunkt danebenliegen. `--wb-strength 0`
  schaltet ihn ab.
* **Die Fenstererkennung ist regelbasiert, nicht semantisch.** Eine große,
  ausgebrannte, strukturierte Fläche, die kein Fenster ist, kann durchgehen.
  Dagegen hilft die Maskenüberlagerung im Kontaktbogen und die 25-%-Warnung.
* **Die Perspektivkorrektur setzt eine Brennweite von 1,0 × Bildbreite an**,
  weil die reale Brennweite nicht zuverlässig in Pixel umzurechnen ist. Der
  angezeigte Korrekturwinkel ist deshalb eine Näherung.
* **Mischlicht bleibt Mischlicht.** In einer der vermessenen echten Aufnahmen
  (Küche mit Fenster) liegt der Boden bei einem Rot/Blau-Verhältnis von 3,4
  und die Decke bei 0,92 – warmes Kunstlicht unten, Tageslicht oben. Dieses
  Werkzeug gibt das originalgetreu wieder (Ergebnis 3,19 und 0,96), fügt also
  nichts hinzu. Wer es neutral will, braucht eine lokale Korrektur; global
  heben sich die beiden Stiche gegenseitig auf, der Weißabgleich findet
  korrekt nichts zu tun. In Lightroom ist das mit einem Pinsel schnell erledigt.
* **Freihandreihen mit starker Rotation oder Parallaxe** kann
  `MOTION_EUCLIDEAN` nicht auflösen (nur Verschiebung und Drehung).
* **Noch nicht an echten RAW-Dateien erprobt.** Alle `rawpy`-Parameter sind
  verifiziert, aber der Durchlauf mit echten CR2/NEF stand bisher nicht zur
  Verfügung. Demosaicing, Orientierung und EXIF-Übernahme aus echten RAWs sind
  daher der erste Punkt, der an eigenem Material zu prüfen ist.

## Hinweise zur Umsetzung

* **EXIF-Übernahme:** Kamera, Modell und Aufnahmedatum werden als
  TIFF-Basistags geschrieben, dazu ein XMP-Paket mit Aufnahmedatum,
  Belichtungszeit, Blende, ISO, Brennweite und Objektiv – Lightroom liest das.
  `piexif` wird bewusst nicht verwendet: Es liest keine RAW-Container und kann
  kein Exif-IFD in ein tifffile-TIFF einfügen.
* **Determinismus:** OpenCVs interne Parallelisierung ist bei Float nicht
  reihenfolgestabil (`MergeMertens` weicht zwischen zwei Läufen um rund 3e-7
  ab – genug, um beim Runden auf 16 Bit einzelne Pixel kippen zu lassen).
  Sie wird deshalb abgeschaltet; parallelisiert wird über mehrere Prozesse.
* **MergeMertens und Float:** OpenCV skaliert Float-Eingaben intern mit 1/255.
  Bilder im Bereich 0..1 hineinzugeben liefert ein um Faktor 255 zu dunkles
  Ergebnis. Übergeben wird daher 0..255 als Float – nicht 8 Bit, damit die
  volle Tiefe der 16-Bit-Entwicklung erhalten bleibt.
* **Die Oberfläche ist nur eine Hülle.** Sie startet `hdr_merge.py` als
  eigenen Prozess und zeigt dessen Protokoll an. Dadurch ist das Ergebnis
  identisch, egal über welchen Weg gestartet wird, und ein Fehler in der
  Verarbeitung kann die Oberfläche nicht mitreißen.
