import { Split } from '../fx.jsx';

/**
 * Warum Quadratblick. Ersetzt die frühere Sektion, die begründet hat,
 * warum guter Content sinnvoll ist. Diese Punkte beantworten, warum
 * dieser Anbieter. Bewusst nicht über Bildqualität argumentiert:
 * die ist Voraussetzung und lädt sonst zum Preisvergleich ein.
 */
const gruende = [
  {
    title: 'Konzipiert als Vermarktungspaket',
    text: 'Wir liefern keine Bilder für ein Inserat, sondern Material für die Vermarktung eines Objekts. Was produziert wird, richtet sich danach, was in den kommenden Wochen gebraucht wird.',
  },
  {
    title: 'Sichtbar über den ganzen Zeitraum',
    text: 'Ankündigung, Start, laufende Vermarktung, besondere Merkmale, Abschluss. Für jeden dieser Anlässe ist etwas da, statt einmal zum Launch alles auf einmal zu verbrauchen.',
  },
  {
    title: 'Jede Aufnahme arbeitet doppelt',
    text: 'Ein Objektfilm verkauft die Immobilie. Gleichzeitig sieht ein Eigentümer, mit welchem Aufwand Ihr Büro vermarktet. Das ist der Grund, warum wir Objekt und Büro zusammen denken.',
  },
  {
    title: 'Ein Prozess statt einzelner Gewerke',
    text: 'Foto, Drohne, Video und die Ausleitungen daraus entstehen aus einer Produktionsbasis an einem Termin. Sie koordinieren keine drei Dienstleister und zahlen keine drei Anfahrten.',
  },
  {
    title: 'Auf den Büroalltag abgestimmt',
    text: 'Ein Ansprechpartner, eine Checkliste zur Vorbereitung, klare Abstimmung, planbare Lieferung. Der Aufwand auf Ihrer Seite bleibt bei Zugang und kurzer Absprache.',
  },
  {
    title: 'Regional und auf Immobilien spezialisiert',
    text: 'Wir arbeiten im Raum Bühl, Mittelbaden und der Ortenau und ausschließlich an Immobilien. Kurze Wege, Kenntnis der Lagen, keine Einarbeitung in Ihre Branche.',
  },
];

export function Warum() {
  return (
    <section className="v2-sec bg-linen-2" id="warum">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Warum Quadratblick</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Was uns von einer reinen Fotoproduktion unterscheidet.
          </Split>
          <p className="v2-lead" data-reveal>
            Gute Aufnahmen setzen wir voraus. Der Unterschied liegt darin, wofür sie gemacht sind
            und was danach mit ihnen passiert.
          </p>
        </div>
        <div className="v2-benefits">
          {gruende.map((g, i) => (
            <article className="v2-benefit" key={g.title} data-reveal data-delay={Math.min(i * 0.06, 0.3)}>
              <span className="num">0{i + 1}</span>
              <div><h3>{g.title}</h3></div>
              <p>{g.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
