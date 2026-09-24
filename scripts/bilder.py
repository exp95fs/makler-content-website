"""
Erzeugt responsive Bildvarianten (AVIF, WebP, JPEG-Fallback) aus den
vorhandenen Originalen und schreibt ein Manifest für die <Bild>-Komponente.

Einmalig bzw. bei neuen Bildern ausführen:  python3 scripts/bilder.py
Benötigt nur Pillow (mit AVIF-Unterstützung), keine npm-Abhängigkeit.

Die Originale unter public/images/ bleiben unverändert erhalten.
"""
import json
import os
from PIL import Image

QUELLE = 'public'
ZIEL = 'public/images/opt'
MANIFEST = 'src/content/bilder.json'

# Original -> beschreibender Dateiname, Zielbreiten
BILDER = {
    '/images/hero/hero.jpg': ('immobilienfoto-wohnhaus-holzfassade', [640, 960, 1280, 1920]),
    '/images/inserate/inserat-2-aussen.jpg': ('immobilienfoto-mehrfamilienhaus-aussenansicht', [480, 960, 1400]),
    '/images/inserate/inserat-2-wohnen-1.jpg': ('immobilienfoto-essplatz-verglaste-tuer', [480, 960, 1400]),
    '/images/inserate/inserat-2-wohnen-2.jpg': ('immobilienfoto-dachgeschoss-fensterreihe', [480, 960, 1400]),
}
REF = {
    1: 'wohnkueche-kochinsel', 2: 'kuechenzeile-barhocker', 3: 'wohn-essbereich-offene-kueche',
    4: 'kueche-dachfenster', 5: 'essbereich-holzbalkendecke', 6: 'dachgeschoss-wohnraum-kuechenzeile',
    7: 'essplatz-verglaste-zimmertuer', 8: 'badezimmer-doppelwaschtisch', 9: 'dachgeschoss-kuechenzeile',
    10: 'dachgeschoss-dachstuhl', 11: 'dachgeschoss-sprossenfenster', 12: 'schlafzimmer-schreibtisch',
    13: 'badezimmer-badewanne-dachfenster', 14: 'zimmer-dachschraege-essplatz', 15: 'terrasse-sitzbank',
    16: 'kueche-gruene-fronten', 17: 'schlafzimmer-einbauschrank', 18: 'wohnbereich-terrassenzugang',
    19: 'badezimmer-dusche', 20: 'wohnraum-kuechenblock',
}
for n, slug in REF.items():
    BILDER[f'/images/referenzen/ref-{n:02d}.jpg'] = (f'immobilienfoto-{slug}', [480, 960, 1440])

os.makedirs(ZIEL, exist_ok=True)
manifest = {}
for src, (slug, breiten) in BILDER.items():
    im = Image.open(QUELLE + src).convert('RGB')
    w, h = im.size
    breiten = [b for b in breiten if b <= w] or [w]
    for b in breiten:
        v = im.resize((b, round(h * b / w)), Image.LANCZOS)
        v.save(f'{ZIEL}/{slug}-{b}.avif', 'AVIF', quality=52, speed=6)
        v.save(f'{ZIEL}/{slug}-{b}.webp', 'WEBP', quality=74, method=6)
    fb = breiten[len(breiten) // 2]
    v = im.resize((fb, round(h * fb / w)), Image.LANCZOS)
    v.save(f'{ZIEL}/{slug}-{fb}.jpg', 'JPEG', quality=80, optimize=True, progressive=True)
    manifest[src] = {
        'basis': f'/images/opt/{slug}', 'breiten': breiten, 'fallback': fb,
        'width': w, 'height': h,
    }

# Open-Graph-Bild 1200x630 aus dem Hero-Foto, ohne Text
og = Image.open(QUELLE + '/images/hero/hero.jpg').convert('RGB')
w, h = og.size
zh = round(w * 630 / 1200)
top = max(0, (h - zh) // 2)
og.crop((0, top, w, top + zh)).resize((1200, 630), Image.LANCZOS).save(
    'public/og-immobilienfotografie-mittelbaden.jpg', 'JPEG', quality=82, optimize=True, progressive=True)

with open(MANIFEST, 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, indent=1)
print(len(manifest), 'Bilder,', len(os.listdir(ZIEL)), 'Dateien')
