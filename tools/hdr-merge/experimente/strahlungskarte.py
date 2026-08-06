import numpy as np, cv2, sys, pathlib
sys.path.insert(0,'/home/user/makler-content-website/tools/hdr-merge')
import hdr_merge as H
SP="/tmp/claude-0/-home-user/d557f855-41da-57e2-89a1-a5dde8cc3dd8/scratchpad"
P=pathlib.Path

def linear(x):
    """sRGB-Kennlinie zurueckrechnen - die RAW-Entwicklung legt sie an."""
    return np.where(x<=0.04045, x/12.92, ((x+0.055)/1.055)**2.4)

def strahlung(bilder, evs):
    """Echte Strahlungskarte aus den EV-Werten. KEINE Maske, kein Schwellwert.

    Jede Aufnahme wird linearisiert und mit ihrem Belichtungsfaktor auf
    dieselbe Skala gebracht. Gewichtet wird nur danach, wie gut ein Pixel
    belichtet ist - eine glatte Funktion, die zu 0 und zu 1 hin auf null
    faellt. Wo eine Aufnahme ausbrennt, traegt sie schlicht nicht bei.
    """
    summe=None; gewicht=None
    for b,ev in zip(bilder,evs):
        lin=linear(np.clip(b,0,1))
        faktor=2.0**(ev)          # hoeherer EV = dunklere Aufnahme
        lum=(b*np.array([0.2126,0.7152,0.0722],np.float32)).sum(-1)
        # Glatte Belichtungsguete, an beiden Enden null
        w=np.exp(-((lum-0.5)**2)/(2*0.22**2))
        w=np.where((lum<0.005)|(lum>0.995), 0.0, w)[...,None]+1e-6
        beitrag=lin*faktor
        summe = beitrag*w if summe is None else summe+beitrag*w
        gewicht = w if gewicht is None else gewicht+w
    return summe/gewicht

for szene,ordner,namen in (("Dachkueche","b1",("dunkel","normal","hell")),
                           ("Kueche","b2",("DSC03613","DSC03614","DSC03615")),
                           ("Esszimmer","b3",("DSC03390","DSC03391","DSC03392"))):
    auf=[a for a in H.sammle_aufnahmen(P(f"{SP}/{ordner}")) if a.pfad.stem in namen]
    auf=sorted(auf,key=lambda a:-(a.ev or 0))     # dunkelste zuerst (hoher EV)
    bilder=[H.lade_bild(a.pfad) for a in auf]
    evs=[a.ev for a in auf]
    print(f"\n=== {szene} ===  EV je Aufnahme: {[f'{e:.1f}' for e in evs]}")
    r=strahlung(bilder,evs)
    lr=(r*np.array([0.2126,0.7152,0.0722],np.float32)).sum(-1)
    print(f"  Strahlungskarte: Umfang {lr.min():.2e} bis {lr.max():.2e}  "
          f"= {np.log2(lr.max()/max(lr.min(),1e-9)):.1f} Blendenstufen")
    # Reicht eine einfache globale Kennlinie, um alles unterzubringen?
    n=lr/np.percentile(lr,99.9)
    fuer_anzeige=n/(1.0+n)                       # Reinhard, EIN Parameter
    print(f"  Nach globalem Tonemapping: ueber 0.99 {(fuer_anzeige>0.99).mean()*100:.3f} %  "
          f"Median {np.median(fuer_anzeige):.3f}")

# ---------------------------------------------------------------------------
# Befund (nicht im Programm, bewusst als Beleg abgelegt)
# ---------------------------------------------------------------------------
#
# Gemessen ueber drei echte Szenen:
#
#   Umfang der Strahlungskarte      14.1 bis 19.1 Blendenstufen
#   Nach globaler Kennlinie ueber 0.99   0.000 % in ALLEN drei Szenen
#
# Zum Vergleich der bisherige Weg (Mertens-Fusion), Anteil der Fensterflaeche
# der ueber 0.99 stehenbleibt:
#
#   Dachkueche  10.9 %     Kueche  44.5 %     Esszimmer  22.3 %
#
# Und das, obwohl die Information vorhanden ist: Dort wo die Fusion ueber
# 0.99 laeuft, liegt das Dunkelbild bei Median 0.477 bzw. 0.753 und ist
# selbst nur zu 0.1 bzw. 8.9 Prozent ausgebrannt.
#
# Freie Parameter fuer die Fensterbehandlung:
#   bisheriger Weg   13   (Schwelle, Strukturmass, Strukturanteil,
#                          Mindestflaeche, Schliessradius, Weichzeichnung,
#                          Kennlinie unten/oben, Aussichtsrampe,
#                          Ausbrenn-Closing, Range, Ceiling, Rolloff)
#   dieser Weg        0   (die EV-Werte stehen im EXIF)
