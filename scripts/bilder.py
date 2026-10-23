"""
Erzeugt responsive Bildvarianten (AVIF, WebP, JPEG-Fallback) aus den
vorhandenen Originalen und schreibt ein Manifest für die <Bild>-Komponente.

Einmalig bzw. bei neuen Bildern ausführen:  python3 scripts/bilder.py
Benötigt nur Pillow (mit AVIF-Unterstützung), keine npm-Abhängigkeit.

Die Originale unter public/images/ bleiben unverändert erhalten.

Die Beispiel-Inserate laufen über scripts/referenzen.py, das die Funktion
`varianten` von hier mitbenutzt.
"""
import json
import os
from PIL import Image, ImageOps

QUELLE = 'public'
ZIEL = 'public/images/opt'
MANIFEST = 'src/content/bilder.json'

# Original -> beschreibender Dateiname, Zielbreiten
# Hero: Innenaufnahme für querformatige Bildschirme, im Hochformat (Handy)
# das Wohnhaus, weil der Innenraum dort nur Decke und Vorhang zeigt. Das
# Original unter public/ ist bereits ohne EXIF, XMP und IPTC abgelegt (nur
# Farbprofil), weil public/ mit ausgeliefert wird.
HERO = '/images/hero/hero-wohnbereich.jpg'
BILDER = {
    HERO: ('immobilienfoto-wohnbereich-balkontuer', [640, 960, 1280, 1920]),
    '/images/hero/hero.jpg': ('immobilienfoto-wohnhaus-holzfassade', [640, 960, 1280, 1920]),
}
# Nur noch die drei Aufnahmen der Bildstrecke im Leistungsversprechen. Die
# frühere gemischte Galerie ist durch die Beispiel-Inserate ersetzt.
REF = {
    16: 'kueche-gruene-fronten', 17: 'schlafzimmer-einbauschrank', 23: 'essplatz-eckbank',
}
for n, slug in REF.items():
    BILDER[f'/images/referenzen/ref-{n:02d}.jpg'] = (f'immobilienfoto-{slug}', [480, 960, 1440])


def oeffnen(pfad):
    """Original laden, nach EXIF drehen, als RGB. Von den Metadaten bleibt nur
    das Farbprofil; EXIF, XMP und IPTC (Kamera, Software, Stichwörter)
    werden nicht ausgeliefert."""
    im = Image.open(pfad)
    icc = im.info.get('icc_profile')
    im = ImageOps.exif_transpose(im).convert('RGB')
    im.info = {'icc_profile': icc} if icc else {}
    return im


def varianten(im, ziel, slug, breiten, jpeg=None):
    """Schreibt <slug>-<breite>.avif/.webp je Zielbreite und ein JPEG in der
    mittleren (oder angegebenen) Breite. Gibt die Angaben für das Manifest
    zurück."""
    w, h = im.size
    breiten = [b for b in breiten if b <= w] or [w]
    icc = im.info.get('icc_profile')
    profil = {'icc_profile': icc} if icc else {}
    for b in breiten:
        v = im.resize((b, round(h * b / w)), Image.LANCZOS)
        v.save(f'{ziel}/{slug}-{b}.avif', 'AVIF', quality=52, speed=6, exif=b'', xmp=b'', **profil)
        v.save(f'{ziel}/{slug}-{b}.webp', 'WEBP', quality=74, method=6, exif=b'', xmp=b'', **profil)
    fb = jpeg if jpeg in breiten else breiten[len(breiten) // 2]
    v = im.resize((fb, round(h * fb / w)), Image.LANCZOS)
    v.save(f'{ziel}/{slug}-{fb}.jpg', 'JPEG', quality=80, optimize=True, progressive=True, **profil)
    return {'breiten': breiten, 'fallback': fb, 'width': w, 'height': h}


def main():
    os.makedirs(ZIEL, exist_ok=True)
    manifest = {}
    for src, (slug, breiten) in BILDER.items():
        m = varianten(oeffnen(QUELLE + src), ZIEL, slug, breiten)
        manifest[src] = {'basis': f'/images/opt/{slug}', **m}

    # Open-Graph-Bild 1200x630 aus dem Hero-Foto, ohne Text
    og = Image.open(QUELLE + HERO).convert('RGB')
    w, h = og.size
    zh = round(w * 630 / 1200)
    top = max(0, (h - zh) // 2)
    og.crop((0, top, w, top + zh)).resize((1200, 630), Image.LANCZOS).save(
        'public/og-immobilienfotografie-mittelbaden.jpg', 'JPEG', quality=82, optimize=True, progressive=True)

    with open(MANIFEST, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=1)
    print(len(manifest), 'Bilder,', len(os.listdir(ZIEL)), 'Dateien')


if __name__ == '__main__':
    main()
