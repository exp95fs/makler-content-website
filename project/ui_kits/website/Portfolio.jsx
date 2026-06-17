/* Portfolio / Referenzen — filterable media grid. */
function Portfolio() {
  const { Tag, MediaFrame } = window.MaklerContentDesignSystem_a211b6;
  const { SectionHead } = window;
  const [filter, setFilter] = React.useState('Alle');

  const filters = ['Alle', 'Innen', 'Außen', 'Luft'];
  const work = [
    { cat: 'Außen', eyebrow: 'Villa · Stuttgart', caption: 'Klare Linien im Abendlicht', ratio: '4 / 3' },
    { cat: 'Innen', eyebrow: 'Altbau · Freiburg', caption: 'Morgenlicht in der Küche', ratio: '4 / 3' },
    { cat: 'Luft', eyebrow: 'Neubau · Karlsruhe', caption: 'Lage aus der Vogelperspektive', ratio: '4 / 3' },
    { cat: 'Innen', eyebrow: 'Loft · Mannheim', caption: 'Material und Textur', ratio: '4 / 3' },
    { cat: 'Außen', eyebrow: 'Landhaus · Baden', caption: 'Garten und Übergang', ratio: '4 / 3' },
    { cat: 'Luft', eyebrow: 'Areal · Offenburg', caption: 'Grundstück im Kontext', ratio: '4 / 3' },
  ];
  const shown = filter === 'Alle' ? work : work.filter(w => w.cat === filter);

  return (
    <section id="portfolio" style={{ background: 'var(--surface-card)', padding: 'clamp(56px, 8vw, 96px) 0', borderTop: '1px solid var(--border-hair)', borderBottom: '1px solid var(--border-hair)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-pad)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap' }}>
          <SectionHead eyebrow="Referenzen" title="Objekte, die wir zum Sprechen gebracht haben." />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {filters.map(f => (
              <Tag key={f} selected={filter === f} onClick={() => setFilter(f)}>{f}</Tag>
            ))}
          </div>
        </div>

        <div style={{
          display: 'grid', gap: '20px', marginTop: 'clamp(28px, 4vw, 40px)',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        }}>
          {shown.map((w) => (
            <MediaFrame key={w.eyebrow} ratio={w.ratio} radius="lg" eyebrow={w.eyebrow} caption={w.caption} placeholderLabel={w.cat} />
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Portfolio });
