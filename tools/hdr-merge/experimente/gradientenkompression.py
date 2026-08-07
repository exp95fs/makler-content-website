"""EXPERIMENT - noch nicht im Programm. Kompression im Gradientenraum.

Stand: Das Verfahren rechnet korrekt und ist nachweislich nahtfrei,
das Ergebnis ist aber noch nicht brauchbar (siehe unten).

Warum dieser Weg ueberhaupt: Jedes Verfahren, das ein Fenster auf
Raumhelligkeit bringt, muss die Fensterflaeche anders behandeln als die
Wand - das ist eine Maske, egal wie man sie nennt, und Masken
hinterlassen Saeume. Drei Anlaeufe haben das bestaetigt.

Hier passiert etwas anderes: Bearbeitet werden nicht Helligkeiten,
sondern Helligkeits-UEBERGAENGE. Grosse Spruenge (Wand -> Fenster)
werden gedaempft, kleine (Textur) bleiben. Aus dem veraenderten
Gradientenfeld wird das Bild durch Loesen einer Poisson-Gleichung
zurueckgerechnet. Es gibt keine Flaechen, also auch keine Nahtstellen -
das ist keine Kalibrierungsfrage, sondern folgt aus der Konstruktion.

Gemessen an einer Kuechenszene:
  Staerke 1.0   Umfang 8.86 Blenden   (Original 8.85 - der Loeser stimmt)
  Staerke 0.8   Umfang 4.64
  Staerke 0.65  Umfang 3.33
  Staerke 0.5   Umfang 2.62

Was noch fehlt: Das gestauchte Bild wirkt milchig - ueber dem ganzen
Bild liegt ein Schleier, die Farben sind blass. Die Gradientendaempfung
trifft auch die Schattierung des Innenraums selbst, nicht nur den
Sprung zur Fensterflaeche. Der naechste Schritt waere, die Daempfung
von der GROESSE des Sprungs abhaengiger zu machen, damit sie erst weit
oberhalb dessen greift, was ein Innenraum an sich hat.

Ohne Poisson-Loeser aus scipy: cv2.dct/idct leisten dasselbe.

Nicht Helligkeiten bearbeiten, sondern Helligkeits-UEBERGAENGE: grosse
Spruenge daempfen, kleine unangetastet lassen, daraus das Bild
zurueckrechnen. Es gibt keine Flaechen und keine Maske - also auch
keine Nahtstellen.
"""
import numpy as np, cv2

W = np.array([0.2126, 0.7152, 0.0722], np.float32)


def _poisson(div: np.ndarray) -> np.ndarray:
    """Loest Laplace(I) = div mit Neumann-Rand ueber die Kosinustransformation."""
    h, w = div.shape
    f = cv2.dct(div.astype(np.float32))
    y = np.arange(h, dtype=np.float32).reshape(-1, 1)
    x = np.arange(w, dtype=np.float32).reshape(1, -1)
    nenner = (2.0 * np.cos(np.pi * x / w) - 2.0) + (2.0 * np.cos(np.pi * y / h) - 2.0)
    nenner[0, 0] = 1.0
    f = f / nenner
    f[0, 0] = 0.0
    return cv2.idct(f)


def komprimiere(strahlung: np.ndarray, staerke: float = 0.85,
                schwelle: float = 0.1) -> np.ndarray:
    """staerke < 1 daempft grosse Spruenge; 1.0 = unveraendert."""
    lum = np.maximum(strahlung @ W, 1e-9)
    h_log = np.log2(lum).astype(np.float32)

    gx = np.zeros_like(h_log); gy = np.zeros_like(h_log)
    gx[:, :-1] = h_log[:, 1:] - h_log[:, :-1]
    gy[:-1, :] = h_log[1:, :] - h_log[:-1, :]

    betrag = np.sqrt(gx * gx + gy * gy)
    alpha = max(schwelle * float(betrag.mean()), 1e-4)
    # Kleine Gradienten bleiben (Faktor ~1), grosse werden gedaempft.
    phi = (alpha / np.maximum(betrag, 1e-6)) * \
          np.power(np.maximum(betrag, 1e-6) / alpha, staerke)
    phi = np.clip(phi, 0.0, 1.0).astype(np.float32)

    gx *= phi; gy *= phi
    div = np.zeros_like(h_log)
    div[:, 1:] += gx[:, 1:] - gx[:, :-1]
    div[:, 0] += gx[:, 0]
    div[1:, :] += gy[1:, :] - gy[:-1, :]
    div[0, :] += gy[0, :]

    neu = _poisson(div)
    return neu.astype(np.float32)
