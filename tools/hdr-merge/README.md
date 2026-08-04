# hdr_merge.py – Belichtungsreihen zu einem neutralen Basisbild

Kommandozeilen-Werkzeug für die Immobilienfotografie: Es rechnet
Belichtungsreihen (3, 5 oder 7 Aufnahmen) zu **einem technisch sauberen
Basisbild** zusammen – inklusive Window Pull, also der Rückgewinnung der
Fensteransicht aus der dunkelsten Belichtung.

**Was das Werkzeug bewusst NICHT tut:** keinen Look. Keine S-Kurve, kein
Kontrast-Boost, keine Sättigungsanhebung, kein Clarity, keine Vignette, kein
Schärfen, kein Himmelsersatz, keine KI. Das Ergebnis ist die Vorlage für das
eigene Lightroom-Preset, nicht das fertige Bild.

Der einzige tonale Eingriff ist die **tonale Normalisierung**: ein
deterministischer, regelbasierter Schritt, der jedes Bild auf dieselben
Zielwerte bringt (Weißpunkt, Schwarzpunkt, Mittelton, Graupunkt). Er
existiert, weil ein rohes Exposure-Fusion-Ergebnis deutlich dunkler und
flauer ist als die Ausgabe kommerzieller Dienste – ein darauf kalibriertes
Preset würde sonst völlig anders reagieren. Abschaltbar mit
`--base-tone off`.

---

## Einrichtung (Windows, Python 3.11+)

```bat
python -m venv .venv && .venv\Scripts\activate && pip install -r requirements.txt
```

Unter macOS/Linux entsprechend `source .venv/bin/activate`.

Optional, nur für LZW-komprimierte TIFFs: `pip install imagecodecs`. Ohne das
Paket schreibt das Werkzeug unkomprimiert und weist im Protokoll darauf hin.

---

## Aufruf

```bat
python hdr_merge.py EINGABE_ORDNER AUSGABE_ORDNER ^
  --bracket-size auto --window-strength 0.8 --window-wb 0.5 --preview
```

Weitere typische Aufrufe:

```bat
:: Stativaufnahmen, feste Dreiergruppen, alle Kerne
python hdr_merge.py C:\Objekt\raw C:\Objekt\basis --bracket-size 3 --no-align --preview

:: Flache Rohfusion ohne jede tonale Anpassung
python hdr_merge.py C:\Objekt\raw C:\Objekt\basis --base-tone off

:: Fenster kräftiger ziehen, Fensterfarbe stärker an den Raum angleichen
python hdr_merge.py C:\Objekt\raw C:\Objekt\basis --window-strength 1.0 --window-wb 0.8

:: Stürzende Linien mitkorrigieren (nur bis 8 Grad, darüber nur Warnung)
python hdr_merge.py C:\Objekt\raw C:\Objekt\basis --straighten
```

**Eingabe:** Ordner mit RAW-Dateien (CR2, NEF, ARW, DNG, RAF) oder
16-Bit-TIFFs.
**Ausgabe:** je Reihe ein 16-Bit-TIFF `<erste Datei der Reihe>_hdr.tif`
(sRGB), mit `--preview` zusätzlich ein JPEG-Kontaktbogen
`<...>_preview.jpg`: Einzelbelichtungen, Maskenüberlagerung und Ergebnis
nebeneinander, damit sich 30 Merges in einem Blick prüfen lassen.

---

## Was das Werkzeug der Reihe nach macht

1. **RAW-Entwicklung** über `rawpy.postprocess` mit `no_auto_bright=True`,
   `use_camera_wb=True`, `output_bps=16`, sRGB, Standard-Gamma. Keinerlei
   Auto-Korrekturen; alle Bilder einer Reihe zwingend mit identischen
   Parametern.
2. **Gruppierung** der Reihen über EXIF (`DateTimeOriginal` plus EV-Muster).
   Eine neue Reihe beginnt bei einer Zeitlücke oder wenn das EV-Muster
   zurückspringt. Die erkannte Gruppierung wird vor der Verarbeitung
   protokolliert.
3. **Ausrichtung** mit `cv2.findTransformECC` (`MOTION_EUCLIDEAN`), geschätzt
   auf viertelaufgelösten Graustufenbildern, Matrix danach hochskaliert.
4. **Fusion** mit `cv2.createMergeMertens` – bewusst kein
   Debevec/Robertson mit Tonemapping: Mertens braucht keine Schätzung der
   Kamerakurve und ist dadurch robuster.
5. **Window Pull** (siehe unten).
6. **Tonale Normalisierung** auf feste Zielwerte.
7. Optional **Perspektivkorrektur**, dann Speichern.

### Window Pull im Detail

1. Referenzbild = mittlere Belichtung, Dunkelbild = niedrigste Belichtung.
2. Ausgebrannte Bereiche im Referenzbild maskieren (Luminanz >
   `--window-threshold`).
3. Morphologisches Schließen und Löcherfüllen, damit ein Fenster **inklusive
   Sprossen** eine zusammenhängende Fläche ist.
4. **Gegenprüfung am Dunkelbild:** Eine Fläche gilt nur als Fenster, wenn ein
   ausreichender Anteil ihrer Pixel dort echte Struktur zeigt (lokale
   Standardabweichung). Das verwirft weiße Wände, Deckenleuchten,
   Lampenschirme und Reflexionen. Gemessen wird nur im **erodierten Inneren**
   – der Rand einer ausgebrannten Fläche zeigt immer Struktur, dort liegt ja
   die Kante zur Umgebung. Die Prüfung läuft bewusst **pro Fläche statt pro
   Pixel**, sonst würde glatter Himmel innerhalb eines echten Fensters aus
   der Maske fallen.
5. Größenfilter: Flächen unter `--window-min-area` (Standard 0,1 % der
   Bildfläche) verwerfen – Glanzlichter auf Armaturen und Türklinken.
6. **Kantenbewusstes Weichzeichnen der Maske über einen Guided Filter** mit
   dem fusionierten Bild als Guide (selbst in NumPy implementiert, ca. 20
   Zeilen, damit keine Abhängigkeit auf `opencv-contrib` entsteht).
   Ausdrücklich **kein** Gauß auf der Maske – genau das erzeugt die Halos,
   die dieses Werkzeug vermeiden soll.
7. **Komposition:** Fensterinhalt aus dem Dunkelbild, helligkeitsangepasst
   über die mittlere Luminanz in einem dilatierten Ring um die Maskengrenze
   (typischerweise der Fensterrahmen), damit der Übergang nicht springt.
8. **Lokaler Weißabgleich** (`--window-wb`): Farbtemperatur des
   Fensterbereichs anteilig Richtung Innenraum. Verändert nur die
   Kanalverhältnisse, nicht die Luminanz und nicht die Sättigung.
9. `--window-strength` steuert die Deckkraft des gesamten Effekts.

### Tonale Normalisierung im Detail

1. **Weißpunkt:** 99,5-Perzentil der Luminanz **außerhalb** der Fenstermaske
   auf `--white-target`. Das Fenster wird bewusst ausgeschlossen, sonst
   verankert der Himmel den Weißpunkt und der Innenraum bleibt dunkel.
2. **Schwarzpunkt:** 0,2-Perzentil auf `--black-target`.
3. **Mittelton:** Median der Innenraum-Luminanz per Gamma auf `--mid-target`.
   Nur Gamma, keine Kurve mit Schultern.
4. **Globaler Weißabgleich:** Graupunkt über große, gering gesättigte, helle
   zusammenhängende Flächen (Wände, Decken) schätzen und zurückhaltend
   neutralisieren (`--wb-strength`), damit warmes Holz warm bleibt.
5. **Highlight-Schutz:** Nach dem Anheben wird geprüft, ob die Streuung im
   Fensterbereich abgefallen ist. Falls ja, wird der Fensterbereich per
   weicher Rolloff-Kurve zurückgenommen – und zwar aus den **unkomprimierten
   Rohdaten** des Window Pull, nicht aus dem bereits abgeschnittenen
   Ergebnis, weil dort die Zeichnung schon vernichtet wäre.

Die drei Zielwerte werden gemeinsam gelöst statt nacheinander: ein Gamma nach
der Schwarzpunkt-Verankerung würde den Schwarzpunkt wieder anheben
(0,02 hoch 0,57 sind 0,11). Deshalb erst auf 0..1 normieren, dann Gamma, dann
auf die Zielspanne legen – alle drei Werte werden exakt getroffen.

---

## Parameter

### Gruppierung

| Parameter | Standard | Wirkung |
|---|---|---|
| `--bracket-size` | `auto` | `auto` = EXIF-Zeit + EV-Muster. Eine feste Zahl (z. B. `3`) gruppiert stur in N aufeinanderfolgende Dateien. |
| `--group-gap` | `6.0` | Maximaler Abstand in Sekunden zwischen zwei Aufnahmen derselben Reihe. Größere Lücke = neue Reihe. |

### Ausrichtung

| Parameter | Standard | Wirkung |
|---|---|---|
| `--no-align` | aus | Überspringt die Ausrichtung. Für Stativaufnahmen – spart spürbar Zeit. |

### Fusion (Mertens-Gewichte)

| Parameter | Standard | Wirkung |
|---|---|---|
| `--contrast` | `1.0` | Gewicht für lokalen Kontrast bei der Auswahl der Bildanteile. |
| `--saturation` | `1.0` | Gewicht für Farbigkeit. Beeinflusst nur die **Auswahl**, hebt die Sättigung nicht an. |
| `--exposure` | `1.0` | Gewicht für gut belichtete Bildanteile (Werte nahe der Bildmitte). |

### Window Pull

| Parameter | Standard | Wirkung |
|---|---|---|
| `--window-strength` | `0.8` | Deckkraft des gesamten Effekts. `0` = aus, `1` = Fensterinhalt vollständig aus dem Dunkelbild. |
| `--window-wb` | `0.5` | Lokaler Weißabgleich im Fenster. `0` = aus (Fenster bleibt kalt/blau), `1` = vollständig an den Innenraum angeglichen. |
| `--window-threshold` | `0.90` | Ab welcher Luminanz ein Bereich im Referenzbild als ausgebrannt gilt. Niedriger = mehr wird als Fenster erkannt. |
| `--window-detail` | `0.010` | Mindest-Standardabweichung im Dunkelbild, ab der ein Pixel als „strukturiert" zählt. |
| `--window-detail-fraction` | `0.10` | Anteil strukturierter Pixel, ab dem eine Fläche als Fenster gilt. Höher = strenger gegen Fehlerkennungen, riskiert aber echte Fenster mit viel glattem Himmel. |
| `--window-min-area` | `0.001` | Mindestgröße einer Fläche als Bildanteil (0,1 %). Verwirft Glanzlichter auf Armaturen und Türklinken. |
| `--window-close` | `0.015` | Breite des Schließ-Kernels als Anteil der Bildbreite. Muss breiter sein als eine Fenstersprosse, sonst zerfällt das Fenster in Einzelflächen. |
| `--window-ceiling` | `0.92` | Obergrenze, auf die der Fensterinhalt weich komprimiert wird. Höher = hellerer Himmel mit weniger Zeichnung, niedriger = mehr Zeichnung, aber grauerer Himmel. |
| `--window-rolloff` | `1.0` | Steilheit der Lichterkompression im Fenster. Kleiner = mehr Zeichnung bei dunklerem Himmel, größer = hellerer, flacherer Himmel. |
| `--window-blur` | `0.02` | Guided-Filter-Radius als Anteil der Bildbreite (Weichheit der Maskenkante). |

### Tonale Normalisierung

| Parameter | Standard | Wirkung |
|---|---|---|
| `--base-tone` | `on` | `off` schaltet den gesamten Schritt ab und liefert die flache Rohfusion. |
| `--white-target` | `0.95` | Zielwert für den Weißpunkt des Innenraums. |
| `--black-target` | `0.02` | Zielwert für den Schwarzpunkt. |
| `--mid-target` | `0.55` | Zielwert für den Mittelton (hell, wie in der Immobilienfotografie üblich). |
| `--white-percentile` | `99.5` | Welches Perzentil als Weißpunkt gemessen wird. |
| `--black-percentile` | `0.2` | Welches Perzentil als Schwarzpunkt gemessen wird. |
| `--wb-strength` | `0.7` | Stärke des globalen Weißabgleichs. `0` = aus. Bewusst unter 1, damit warmes Holz warm bleibt. |

### Perspektive

| Parameter | Standard | Wirkung |
|---|---|---|
| `--straighten` | aus | Begradigt stürzende Linien (Hough → Fluchtpunkt → Homographie → größter gültiger Ausschnitt). |
| `--straighten-max-deg` | `8.0` | Oberhalb dieser nötigen Korrektur wird **nicht** korrigiert, sondern nur gewarnt – bei Dachschrägen und Mansarden zerstören starke Korrekturen mehr, als sie retten. |

### Ausgabe

| Parameter | Standard | Wirkung |
|---|---|---|
| `--preview` | aus | Zusätzlich ein JPEG-Kontaktbogen je Reihe. |
| `--compression` | `none` | `lzw` verkleinert die Datei, benötigt aber `imagecodecs`. |
| `--jobs` | `0` | Parallele Prozesse. `0` = automatisch (Kerne minus 1). |
| `--verbose` | aus | Ausführliches Protokoll inklusive aller Zwischenwerte (Gamma, Faktoren, verworfene Flächen). |

---

## Warnungen im Protokoll

Das Werkzeug bricht nicht ab, sondern warnt und arbeitet weiter. Protokolliert
wird unter anderem:

* Die Fenstermaske nimmt mehr als 25 % des Bildes ein – meist eine
  Fehlerkennung.
* Das Dunkelbild brennt im Fensterbereich selbst schon aus – die
  Belichtungsreihe war zu knapp gestuft, mehr Stufen nach unten aufnehmen.
* Die Ausrichtung ist fehlgeschlagen (ECC nicht konvergiert) – es wird
  unausgerichtet weitergearbeitet.
* Eine Gruppe hat eine unerwartete Bildanzahl (nicht 3, 5 oder 7).
* Die Fensterzeichnung bleibt auch nach dem Rolloff deutlich unter dem
  Ausgangswert – dann ist `--mid-target` für diese Szene zu hoch.
* Die Perspektivkorrektur wurde wegen Überschreitung des Schwellwerts
  abgelehnt.

---

## Tests

```bat
python make_test_scene.py testszene        :: synthetische Reihe erzeugen
python make_test_scene.py testobjekt 3     :: drei Reihen mit EXIF
python -m unittest -v test_hdr_merge.py    :: alle Tests
```

Die synthetische Szene ist ein gerenderter Innenraum (Wandverlauf, Möbel,
Boden) mit einem Fenster, dessen Außenszene linear rund 6 Blendenstufen heller
ist als der Innenraum. Sie enthält absichtlich Fallen: Fenstersprossen, eine
ausgebrannte Deckenleuchte ohne Struktur, eine ausgebrannte weiße Wandfläche
und ein kleines, strukturiertes Glanzlicht.

Die Tests belegen die Wirkung objektiv statt „sieht gut aus":

* **Window Pull:** Die Streuung im ausgebrannten Fensterbereich muss deutlich
  über der des Referenzbildes liegen (dort ist sie exakt null).
* **Maske:** Deckenleuchte, weiße Wand und Glanzlicht müssen verworfen, die
  Sprossen aber eingeschlossen werden.
* **Halo:** Luminanzprofil senkrecht über die Fensterkante, Prüfung auf
  Überschwinger. Zusätzlich der direkte Vergleich Guided Filter gegen Gauß.
* **Normalisierung:** Die konfigurierten Zielwerte müssen getroffen werden.
* **Determinismus:** Zwei Läufe müssen bitgleiche Dateien liefern.

---

## Grenzen – ehrlich

* **Der Himmel bleibt komprimiert.** Ein Fenster ist rund 6 Blendenstufen
  heller als der Innenraum; beides gleichzeitig linear in 0..1 unterzubringen
  ist physikalisch unmöglich. Der Fensterinhalt wird deshalb oberhalb der
  Rahmenhelligkeit weich komprimiert. In der synthetischen Szene bleibt vom
  Himmel eine Streuung von rund 0,019 statt 0,000 im Referenzbild – Struktur
  ist klar vorhanden, aber flacher als im Dunkelbild. Wer mehr Zeichnung
  will, senkt `--window-ceiling` oder `--window-rolloff`; der Himmel wird
  dann grauer.
* **Der Weißabgleich ist eine Schätzung.** Bei sehr warmem Kunstlicht oder
  großen farbigen Flächen kann der Graupunkt danebenliegen. `--wb-strength 0`
  schaltet ihn ab; das Preset korrigiert dann selbst.
* **Die Fenstererkennung ist regelbasiert, nicht semantisch.** Eine große
  strukturierte, ausgebrannte Fläche, die kein Fenster ist (etwa ein hell
  angestrahltes gemustertes Bild an der Wand), kann als Fenster durchgehen.
  Dafür gibt es die Maskenüberlagerung im Kontaktbogen und die 25-%-Warnung.
* **Sehr dünne Sprossen und Sprossenfenster** mit vielen kleinen Scheiben
  brauchen ggf. ein größeres `--window-close`.
* **Die Perspektivkorrektur setzt eine Brennweite von 1,0 × Bildbreite an**,
  weil die reale Brennweite nicht zuverlässig aus dem EXIF in Pixel
  umzurechnen ist. Der angezeigte Korrekturwinkel ist deshalb eine Näherung;
  die Korrektur selbst nicht, sie folgt dem gemessenen Fluchtpunkt.
* **Freihandreihen mit starker Rotation oder Parallaxe** kann
  `MOTION_EUCLIDEAN` nicht auflösen (nur Verschiebung und Drehung, keine
  Perspektive). Bei Nicht-Konvergenz wird gewarnt, nicht abgebrochen.

## Hinweise zur Umsetzung

* **EXIF-Übernahme:** Kamera, Modell und Aufnahmedatum werden als
  TIFF-Basistags geschrieben, dazu ein XMP-Paket mit Aufnahmedatum,
  Belichtungszeit, Blende, ISO, Brennweite und Objektiv – Lightroom liest
  das. Ein vollständiges Exif-IFD in ein TIFF zu schreiben, würde eine
  weitere Abhängigkeit erfordern; `piexif` kann es nicht.
* **Determinismus:** OpenCVs interne Parallelisierung ist bei Float nicht
  reihenfolgestabil (`MergeMertens` weicht zwischen zwei Läufen um rund 3e-7
  ab, genug um beim Runden auf 16 Bit einzelne Pixel kippen zu lassen).
  Deshalb wird sie abgeschaltet; parallelisiert wird über mehrere Prozesse,
  also über ganze Belichtungsreihen.
* **MergeMertens und Float:** OpenCV skaliert Float-Eingaben intern mit
  1/255. Bilder im Bereich 0..1 hineinzugeben, liefert ein um Faktor 255 zu
  dunkles Ergebnis. `hdr_merge.py` übergibt daher 0..255 als Float – und
  nicht 8 Bit, damit die volle Tiefe der 16-Bit-Entwicklung erhalten bleibt.
