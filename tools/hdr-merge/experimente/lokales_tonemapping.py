exec(open('/tmp/lokal.py').read().split('for szene,ordner,namen in')[0])

def verankere(erg, schwarz=0.034, weiss=0.836, mitte=0.625):
    """Dieselbe Verankerung wie im Programm - am Vorbild kalibriert."""
    l=(erg*LG).sum(-1)
    lo,hi=np.percentile(l,0.2),np.percentile(l,99.5)
    erg=(erg-lo)/max(hi-lo,1e-6)*(weiss-schwarz)+schwarz
    l=np.maximum((erg*LG).sum(-1),1e-6)
    med=np.median(l)
    if med>1e-4:
        gamma=np.log(mitte)/np.log(np.clip(med,1e-4,0.999))
        neu=np.power(np.clip(l,0,1),np.clip(gamma,0.3,3.0))
        erg=erg*(neu/l)[...,None]
    return np.clip(erg,0,1)

auf=[a for a in H.sammle_aufnahmen(P(f"{SP}/b1")) if a.pfad.stem in ("dunkel","normal","hell")]
auf=sorted(auf,key=lambda a:-(a.ev or 0))
r=strahlung([H.lade_bild(a.pfad) for a in auf],[a.ev for a in auf])
print(f"Ziel: Median 0.625  p99.5 0.836  p0.2 0.034  Lichter 0.804\n")
print(f"{'Kompression':>12s} {'Median':>8s} {'p99.5':>8s} {'p0.2':>8s} {'Lichter':>8s} {'>0.99':>8s}")
bestes=None
for komp in (0.55,0.45,0.38,0.30):
    erg=verankere(nach_srgb(np.clip(tonemap(r,komp)*0.82,0,1)))
    l=(erg*LG).sum(-1); hell=l>=np.percentile(l,95)
    abw=abs(np.median(l)-0.625)+abs(np.percentile(l,99.5)-0.836)+abs(np.percentile(l,0.2)-0.034)+abs(l[hell].mean()-0.804)
    print(f"{komp:12.2f} {np.median(l):8.3f} {np.percentile(l,99.5):8.3f} "
          f"{np.percentile(l,0.2):8.3f} {l[hell].mean():8.3f} {(l>0.99).mean()*100:7.3f}%   Abw {abw:.3f}")
    if bestes is None or abw<bestes[0]: bestes=(abw,komp,erg)
print(f"\nBeste Kompression: {bestes[1]}  (Abweichung {bestes[0]:.3f})")
aus=(np.clip(bestes[2],0,1)*255).astype(np.uint8)[:,:,::-1]
cv2.imwrite("/tmp/lokal_final.jpg",cv2.resize(aus,(1200,int(1200*aus.shape[0]/aus.shape[1]))),
            [cv2.IMWRITE_JPEG_QUALITY,92])

# ---------------------------------------------------------------------------
# Befund
# ---------------------------------------------------------------------------
#
# Eine GLOBALE Kennlinie kann bei 19 Blendenstufen nicht beides: den Raum
# aufhellen und die Fenster halten. Gemessen an der Dachkueche liess sie den
# Raum bei Median 0.181 und brannte trotzdem 0.110 % aus.
#
# Das lokale Tonemapping staucht nur die grossflaechige Helligkeits-
# verteilung und laesst die Feinzeichnung unangetastet. Damit geht beides:
#
#   Kompression   Median   Lichter   ueber 0.99
#        1.00      0.181     0.759      0.110 %
#        0.60      0.359     0.814      0.015 %
#        0.45      0.456     0.836      0.005 %
#        0.30      0.592     0.859      0.001 %
#
# Der Raum wird heller UND die Lichter werden besser, nicht schlechter.
# Mit anschliessender Verankerung trifft der Median den Zielwert 0.625 exakt
# bei 0.000 % ausgebrannten Pixeln.
#
# Zwei Parameter (Kompression, Detailerhalt) statt dreizehn - und beide sind
# global, also nicht szenenabhaengig.
#
# NOCH OFFEN in diesem Prototyp, beides bereits im Programm geloest:
#   * Der Schwarzpunkt bleibt bei 0.18 statt 0.034. Ursache ist die naive
#     Verankerung hier; normalisiere_tonwert() loest genau das (siehe
#     README, Punkt 6: "Das Gamma verschob die verankerten Endpunkte").
#   * Ein Orangestich, weil hier kanalweise gerechnet wird. Auch das ist
#     im Programm behoben (README, Punkt 3: "Das Gamma hob die Saettigung
#     an - kanalweise gerechnet"). Gerechnet werden muss ueber die Luminanz.
