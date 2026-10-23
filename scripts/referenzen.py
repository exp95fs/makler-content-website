"""
Beispiel-Inserate: liest referenzen-manifest.json, prüft es gegen
referenzen-input/ und erzeugt die Bildvarianten NUR für freigegebene
Listings. Ausführen nach jeder Änderung am Manifest:

    python3 scripts/referenzen.py

Ergebnis:
  public/images/beispiele/<slug>-<nr>-<breite>.(avif|webp|jpg)
  src/content/beispiele.json  (bereinigte Daten für die Website)

Grundsätze:
  - Nicht freigegebene Listings werden weder gelesen noch verarbeitet.
    Dateien, die zu keinem freigegebenen Listing mehr gehören, löscht der
    Lauf aus public/images/beispiele/ (z. B. wenn eine Freigabe
    zurückgenommen wird).
  - In beispiele.json landen nur öffentliche Felder. Originaldateinamen,
    Ordnernamen und `drive_ordner` verlassen dieses Skript nicht.
  - Fehlende oder mehrdeutige Dateien brechen den Lauf ab, bevor etwas
    geschrieben wird.
  - "vorschau" (optional): genau 4 Bilder aus "bilder", nicht das
    Titelbild, für das Raster neben dem Titelbild. Fehlt das Feld, gelten
    die Bilder 2-5 der Galerie (ohne Titelbild), mit Warnung.
  - "hauptbeispiel": true steht bei genau einem freigegebenen Listing; es
    wird in der Sektion groß gezeigt. 0 oder mehrere brechen den Lauf ab.

Manifest und referenzen-input/ liegen nur lokal (.gitignore), weil sie
Kunden- und Ordnernamen enthalten und das Repository öffentlich ist.
"""
import hashlib
import json
import os
import re
import sys
import unicodedata
from concurrent.futures import ProcessPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bilder import oeffnen, varianten  # noqa: E402

MANIFEST = 'referenzen-manifest.json'
EINGANG = 'referenzen-input'
ZIEL = 'public/images/beispiele'
BASIS = '/images/beispiele'
DATEN = 'src/content/beispiele.json'
CACHE = os.path.join(EINGANG, '.verarbeitet.json')

# 320 für die Thumbnail-Leiste, 640/960 für Karten, 1600 für die Großansicht.
BREITEN = [320, 640, 960, 1600]
JPEG = 960

# Begriffe, die nirgends öffentlich erscheinen dürfen.
GESPERRT = re.compile(r'ferien', re.I)
# Platzhalter wie "ORT_FEHLT" oder "TODO" in öffentlichen Texten
PLATZHALTER = re.compile(r'\b[A-ZÄÖÜ]{2,}_[A-ZÄÖÜ_]+\b|TODO|FEHLT|XXX')

N = lambda s: unicodedata.normalize('NFC', s)  # noqa: E731


class Fehler(Exception):
    pass


# ---------------------------------------------------------------- Raumnamen

TIPPFEHLER = {'Fur': 'Flur', 'Terasse': 'Terrasse', 'Klo': 'WC'}
EBENEN = {'EG': 'Erdgeschoss', 'OG': 'Obergeschoss', 'DG': 'Dachgeschoss',
          'Einliegerwohnung': 'Einliegerwohnung', 'Praxis': 'Praxis', 'Wohnung': 'Wohnung'}
WEGLASSEN = {'Haus'}
WENDUNGEN = {
    'Gebäude Flur': 'Hausflur',
    'Keller Heizung': 'Heizungskeller',
    'Keller Flur': 'Kellerflur',
    'Ausblick Schlafzimmer': 'Ausblick aus dem Schlafzimmer',
}
MIT = {'Außenansicht', 'Terrasse'}


def raum(dateiname):
    """Raumbezeichnung aus dem Originalnamen, z. B.
    '14_Wohnung_Fur_01.jpg' -> 'Flur (Wohnung)',
    '23_Haus_DG_Zimmer1.jpg' -> 'Zimmer 1 (Dachgeschoss)'."""
    name = os.path.splitext(N(dateiname).split('/')[-1])[0]
    name = re.sub(r'^\d+_', '', name)            # laufende Nummer vorn
    name = re.sub(r'[-_]\d+$', '', name)         # Bildindex hinten
    woerter = [w for w in re.split(r'[-_ ]+', name) if w]
    woerter = [re.sub(r'(?<=[a-zäöüß])(\d+)$', r' \1', w) for w in woerter]
    woerter = [TIPPFEHLER.get(w, w) for w in woerter]
    ebene = [EBENEN[w] for w in woerter if w in EBENEN]
    rest = [w for w in woerter if w not in EBENEN and w not in WEGLASSEN]
    text = ' '.join(rest)
    if text in WENDUNGEN:
        text = WENDUNGEN[text]
    elif len(rest) == 2 and rest[0] in MIT:
        text = f'{rest[0]} mit {rest[1]}'
    if not text:
        raise Fehler(f'Keine Raumbezeichnung ableitbar aus "{dateiname}"')
    return f'{text} ({ebene[0]})' if ebene else text


# ---------------------------------------------------------------- Prüfung

def dateien(ordner):
    alle = []
    for wurzel, _, namen in os.walk(ordner):
        for n in namen:
            alle.append(N(os.path.relpath(os.path.join(wurzel, n), ordner).replace(os.sep, '/')))
    return alle


def aufloesen(eintrag, alle, slug):
    e = N(eintrag)
    treffer = [a for a in alle if a.startswith(e[:-1])] if e.endswith('*') else [a for a in alle if a == e]
    if len(treffer) != 1:
        art = 'fehlt' if not treffer else f'mehrdeutig ({", ".join(treffer)})'
        raise Fehler(f'{slug}: "{eintrag}" {art}')
    return treffer[0]


def oeffentlich_pruefen(slug, text):
    if text and GESPERRT.search(text):
        raise Fehler(f'{slug}: gesperrter Begriff in "{text}"')
    if text and PLATZHALTER.search(text):
        raise Fehler(f'{slug}: Platzhalter in "{text}"')


def pruefen(m):
    klassen = m.get('klassen') or {}
    listings = m.get('listings') or []
    slugs = [l['slug'] for l in listings]
    if len(slugs) != len(set(slugs)):
        raise Fehler('Slugs im Manifest sind nicht eindeutig')
    for l in listings:
        if not re.fullmatch(r'[a-z0-9]+(-[a-z0-9]+)*', l['slug']):
            raise Fehler(f'Slug "{l["slug"]}" ist nicht URL-tauglich')
        if l['klasse'] not in klassen:
            raise Fehler(f'{l["slug"]}: unbekannte Klasse "{l["klasse"]}"')
    haupt = [l for l in listings if l.get('hauptbeispiel') is True]
    if len(haupt) != 1:
        raise Fehler(f'"hauptbeispiel": true muss bei genau einem Listing stehen, steht bei {len(haupt)}')
    if haupt[0].get('freigegeben') is not True:
        raise Fehler(f'Hauptbeispiel "{haupt[0]["slug"]}" ist nicht freigegeben')

    plan = []
    for l in (l for l in listings if l.get('freigegeben') is True):
        slug = l['slug']
        ordner = os.path.join(EINGANG, slug)
        if not os.path.isdir(ordner):
            raise Fehler(f'{slug}: Ordner {ordner} fehlt')
        if not l.get('bilder'):
            raise Fehler(f'{slug}: keine Bilder')
        alle = dateien(ordner)
        pfade = [aufloesen(b, alle, slug) for b in l['bilder']]
        if len(pfade) != len(set(pfade)):
            raise Fehler(f'{slug}: Datei doppelt in "bilder"')
        titel = aufloesen(l['titelbild'], alle, slug)
        if titel not in pfade:
            raise Fehler(f'{slug}: Titelbild steht nicht in "bilder"')
        vorschau = vorschau_pruefen(l, alle, pfade, titel)
        for feld in ('titel', 'untertitel'):
            oeffentlich_pruefen(slug, l.get(feld))
        for x in l.get('extras') or []:
            oeffentlich_pruefen(slug, x)
        raeume = [raum(p) for p in pfade]
        for r in raeume:
            oeffentlich_pruefen(slug, r)
        plan.append((l, pfade, pfade.index(titel), raeume, vorschau))
    return klassen, plan, haupt[0]['slug']


VORSCHAU = 4


def vorschau_pruefen(l, alle, pfade, titel):
    """Positionen (0-basiert in "bilder") der 4 Bilder im Raster neben dem
    Titelbild. Ohne Feld "vorschau": Bilder 2-5 der Galerie ohne Titelbild."""
    slug = l['slug']
    if 'vorschau' not in l:
        auswahl = [p for p in pfade[1:] if p != titel][:VORSCHAU]
        print(f'Warnung: {slug} ohne "vorschau", nehme Galeriebilder '
              f'{", ".join(str(pfade.index(p) + 1) for p in auswahl)}')
        return [pfade.index(p) for p in auswahl]
    eintraege = l['vorschau']
    if not isinstance(eintraege, list) or len(eintraege) != VORSCHAU:
        raise Fehler(f'{slug}: "vorschau" braucht genau {VORSCHAU} Einträge')
    auswahl = [aufloesen(e, alle, slug) for e in eintraege]
    for e, p in zip(eintraege, auswahl):
        if p == titel:
            raise Fehler(f'{slug}: "vorschau" enthält das Titelbild ("{e}")')
        if p not in pfade:
            raise Fehler(f'{slug}: "vorschau"-Bild "{e}" steht nicht in "bilder"')
    if len(set(auswahl)) != VORSCHAU:
        raise Fehler(f'{slug}: "vorschau" enthält ein Bild doppelt')
    return [pfade.index(p) for p in auswahl]


# ---------------------------------------------------------------- Verarbeitung

def kennung(quelle):
    st = os.stat(quelle)
    return hashlib.sha1(f'{quelle}|{st.st_size}|{st.st_mtime_ns}|{BREITEN}|{JPEG}'.encode()).hexdigest()


def erzeugen(auftrag):
    quelle, name = auftrag
    return name, varianten(oeffnen(quelle), ZIEL, name, BREITEN, jpeg=JPEG)


def main():
    if not os.path.isfile(MANIFEST):
        sys.exit(f'{MANIFEST} fehlt im Projekt-Root.')
    with open(MANIFEST, encoding='utf-8') as f:
        m = json.load(f)
    try:
        klassen, plan, haupt = pruefen(m)
    except Fehler as e:
        sys.exit(f'Abbruch, nichts geschrieben: {e}')

    os.makedirs(ZIEL, exist_ok=True)
    try:
        with open(CACHE, encoding='utf-8') as f:
            cache = json.load(f)
    except (OSError, ValueError):
        cache = {}

    auftraege, metas, neu_cache = [], {}, {}
    for l, pfade, *_ in plan:
        for i, p in enumerate(pfade, 1):
            quelle = os.path.join(EINGANG, l['slug'], *p.split('/'))
            name = f'{l["slug"]}-{i:02d}'
            k = kennung(quelle)
            neu_cache[name] = {'kennung': k}
            alt = cache.get(name)
            if alt and alt.get('kennung') == k and all(
                    os.path.isfile(f'{ZIEL}/{name}-{b}.{x}') for b in alt['meta']['breiten'] for x in ('avif', 'webp')):
                metas[name] = alt['meta']
            else:
                auftraege.append((quelle, name))

    print(f'{len(plan)} freigegebene Listings, {len(metas) + len(auftraege)} Bilder, '
          f'{len(auftraege)} neu zu erzeugen')
    with ProcessPoolExecutor() as pool:
        for name, meta in pool.map(erzeugen, auftraege):
            metas[name] = meta
            print('  ', name)
    for name, meta in metas.items():
        neu_cache[name]['meta'] = meta

    # Alles entfernen, was zu keinem freigegebenen Listing mehr gehört
    erlaubt = {f'{n}-{b}.{x}' for n, meta in metas.items() for b in meta['breiten'] for x in ('avif', 'webp')}
    erlaubt |= {f'{n}-{meta["fallback"]}.jpg' for n, meta in metas.items()}
    weg = [d for d in os.listdir(ZIEL) if d not in erlaubt]
    for d in weg:
        os.remove(os.path.join(ZIEL, d))
    if weg:
        print(f'{len(weg)} veraltete Dateien entfernt')

    daten = {
        '_hinweis': 'Erzeugt von scripts/referenzen.py aus referenzen-manifest.json. Nicht von Hand bearbeiten.',
        'hauptbeispiel': haupt,
        'klassen': [{'key': key, 'label': k['label']} for key, k in klassen.items()],
        'listings': [
            {
                'slug': l['slug'],
                'klasse': l['klasse'],
                'titel': l['titel'],
                'untertitel': l.get('untertitel') or None,
                # "auswahl_hinweis": false blendet "Auswahl aus X gelieferten
                # Bildern" aus; X wird dann gar nicht erst ausgeliefert.
                'bilder_geliefert': l.get('bilder_geliefert') if l.get('auswahl_hinweis', True) else None,
                'hinweis_nebenraeume': bool(l.get('hinweis_nebenraeume')),
                'extras': l.get('extras') or [],
                'titelbild': titel,
                'vorschau': vorschau,
                'bilder': [
                    {'basis': f'{BASIS}/{l["slug"]}-{i:02d}', 'raum': r, **metas[f'{l["slug"]}-{i:02d}']}
                    for i, r in enumerate(raeume, 1)
                ],
            }
            for l, _, titel, raeume, vorschau in plan
        ],
    }
    with open(DATEN, 'w', encoding='utf-8') as f:
        json.dump(daten, f, ensure_ascii=False, indent=1)
    with open(CACHE, 'w', encoding='utf-8') as f:
        json.dump(neu_cache, f)
    print(f'{DATEN} geschrieben, {len(os.listdir(ZIEL))} Dateien in {ZIEL}')


if __name__ == '__main__':
    main()
