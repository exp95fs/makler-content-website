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
4. **Ordner wählen** → die Reihen werden erkannt, angezeigt und automatisch
   verarbeitet.

Ein Bilderordner kann auch direkt auf das Desktop-Symbol gezogen werden.

Die Oberfläche zeigt vor dem Start eine Tabelle aller erkannten Reihen mit
Dateinamen und EV-Muster. Reihen mit unerwarteter Bildanzahl werden gelb
markiert – so fällt eine falsche Gruppierung sofort auf, bevor gerechnet wird.

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
python hdr_merge.py C:\Objekt\raw C:\Objekt\basis --window-ceiling 0.88 --window-rolloff 0.8
```

---

## Ausgabe

* **16-Bit-TIFF, unkomprimiert, sRGB** – volle Tonwerttiefe, ohne jeden
  Qualitätsverlust in Photoshop und Lightroom weiterverarbeitbar. Die
  Oberfläche schreibt grundsätzlich unkomprimiert; auf der Kommandozeile ist
  `--compression lzw` möglich (verlustfrei, aber benötigt `imagecodecs`).
* Dateiname `<erste Datei der Reihe>_hdr.tif`.
* EXIF der Referenzaufnahme wird übernommen, soweit möglich (siehe unten).
* Mit `--preview` zusätzlich ein JPEG-Kontaktbogen je Reihe:
  Einzelbelichtungen, Maskenüberlagerung und Ergebnis nebeneinander.

---

## Qualitäts-Benchmark gegen den kommerziellen Dienst

Die Verarbeitung wird nicht nach Augenmaß beurteilt, sondern gegen eine
Referenzszene gemessen (`make_reference_scene.py`), die einer echten
Dachgeschoss-Kücheaufnahme nachgebaut ist: zwei schräge Dachfenster mit
blauem Himmel und Wolken, weiße Wände, warmer Eichenboden, schwarze
Pendelleuchten vor dem Fenster, Marmorplatte mit feiner Aderung. Der Himmel
liegt rund 6 Blendenstufen über dem Innenraum.

Im Referenzbild (mittlere Belichtung) ist das Fenster **vollständig**
ausgebrannt: Luminanz 1,000, Streuung 0,0000, Sättigung 0,000 – dort ist
keinerlei Information mehr vorhanden. Gemessene Ergebnisse:

| Kriterium | Quelle (dunkelste Belichtung) | Ergebnis |
|---|---|---|
| Himmelsfarbe (Sättigung) | 0,184 | **0,183** |
| Wolkenzeichnung (Streuung) | 0,042 | **0,032** (76 %) |
| Weiße Wand (Luminanz) | 0,132 | **0,698**, Sättigung 0,008 |
| Eichenboden (Sättigung) | 0,290 | **0,315** |
| Marmoraderung (Streuung) | 0,006 | **0,029** |
| Ausgebrannte Pixel | – | **0,02 %** |

`test_reference.py` prüft genau diese Eigenschaften automatisch (15 Tests).

### Was diese Messung an Fehlern aufgedeckt hat

Vier Fehler wurden erst durch den Vergleich mit dem kommerziellen Ergebnis
sichtbar – alle sind behoben:

1. **Der Himmel wurde milchig weiß.** Die Lichterkompression rechnete auf der
   Luminanz. Ein blauer Himmel hat im Blaukanal aber deutlich höhere Werte als
   in der Luminanz – Blau lief über 1,0 und wurde beim Speichern abgeschnitten.
   Jetzt wird auf dem stärksten Kanal je Pixel gerechnet, dadurch clippt
   garantiert nichts und die Sättigung bleibt exakt erhalten.
2. **Der lokale Weißabgleich im Fenster zerstörte die Himmelsfarbe.** Er zog
   die Fensterfarbe zum Innenraum – aus weißen Wolken wurden orange Flecken,
   die Sättigung halbierte sich (0,152 → 0,073). Standard ist jetzt **aus**
   (`--window-wb 0`).
3. **Das Gamma hob die Sättigung an.** Kanalweise gerechnet verschiebt ein
   Gamma die Kanalverhältnisse: die Sättigung eines Eichenbodens stieg von
   0,29 auf 0,51. Jetzt wird das Gamma über die Luminanz gerechnet und als
   gemeinsamer Faktor auf R, G und B gelegt.
4. **Weiße Wände wurden grau.** Der feste Mittelton-Zielwert zog auch helle
   Räume auf 0,55 herunter. Standard ist jetzt `--mid-mode lift`: es wird nur
   aufgehellt, nie abgedunkelt.

Dazu kamen zwei Halo-Ursachen: ein weißer Saum entlang der Fensterkante und
ein heller Schein um dunkle Gegenstände vor dem Fenster (Pendelleuchte).
Beides kam daher, dass der Guided Filter die Maske an dunklen Kanten
einbrechen lässt – richtig fürs Überblenden, fatal für die Lichterkompression.
Es gibt jetzt zwei getrennte Masken für die zwei Aufgaben.

---

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
7. **Ausbrenn-Gewichtung:** Ersetzt wird nur dort, wo im Referenzbild
   wirklich Information fehlt. Ein dunkler Gegenstand vor dem Fenster – eine
   Pendelleuchte, ein Fensterkreuz – bleibt unangetastet, sonst entsteht
   mitten im Objekt ein Helligkeitssprung an der Fenstergrenze.
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
| `--window-strength` | `0.8` | Deckkraft des Effekts. `0` = aus. |
| `--window-wb` | `0.0` | Lokaler Weißabgleich im Fenster. **Standard aus** – bei Tageslichtfenstern zerstört er die Himmelsfarbe (siehe Benchmark). Nur sinnvoll, wenn ein Fenster tatsächlich unnatürlich kalt wirkt. |
| `--window-threshold` | `0.90` | Ab welcher Luminanz ein Bereich als ausgebrannt gilt. |
| `--window-detail` | `0.010` | Mindest-Standardabweichung im Dunkelbild (Struktur). |
| `--window-detail-fraction` | `0.10` | Anteil strukturierter Pixel, ab dem eine Fläche als Fenster gilt. Höher = strenger gegen Fehlerkennungen. |
| `--window-min-area` | `0.001` | Mindestgröße einer Fläche als Bildanteil (0,1 %). |
| `--window-close` | `0.015` | Breite des Schließ-Kernels als Anteil der Bildbreite. Muss breiter sein als eine Fenstersprosse. |
| `--window-ceiling` | `0.92` | Obergrenze für den Fensterinhalt. Niedriger = mehr Zeichnung, grauerer Himmel. |
| `--window-rolloff` | `1.0` | Steilheit der Lichterkompression. Kleiner = mehr Zeichnung, dunklerer Himmel. |
| `--window-blur` | `0.02` | Guided-Filter-Radius als Anteil der Bildbreite. |

### Tonale Normalisierung

| Parameter | Standard | Wirkung |
|---|---|---|
| `--base-tone` | `on` | `off` liefert die flache Rohfusion. |
| `--white-target` | `0.95` | Zielwert für den Weißpunkt des Innenraums. |
| `--black-target` | `0.02` | Zielwert für den Schwarzpunkt. |
| `--mid-target` | `0.55` | Zielwert für den Mittelton. |
| `--mid-mode` | `lift` | `lift` hellt nur auf (weiße Wände bleiben weiß); `exact` erzwingt den Zielwert in beide Richtungen. |
| `--white-percentile` | `99.5` | Perzentil für den Weißpunkt. |
| `--black-percentile` | `0.2` | Perzentil für den Schwarzpunkt. |
| `--wb-strength` | `0.7` | Stärke des globalen Weißabgleichs. `0` = aus. |

### Perspektive und Ausgabe

| Parameter | Standard | Wirkung |
|---|---|---|
| `--straighten` | aus | Begradigt stürzende Linien. |
| `--straighten-max-deg` | `8.0` | Darüber wird nicht korrigiert, sondern nur gewarnt. |
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
