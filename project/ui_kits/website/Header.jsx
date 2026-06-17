/* Header — sticky translucent nav with logo, links, CTA, mobile toggle. */
function Header({ onNav }) {
  const { Logo, Button } = window.MaklerContentDesignSystem_a211b6;
  const { Icon } = window;
  const [open, setOpen] = React.useState(false);
  const links = [
    ['Leistungen', 'services'], ['Referenzen', 'portfolio'],
    ['Ablauf', 'process'], ['Über uns', 'about'],
  ];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(243,238,229,0.82)', backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--border-hair)',
    }}>
      <div style={{
        maxWidth: 'var(--container-max)', margin: '0 auto',
        padding: '14px var(--container-pad)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px',
      }}>
        <a href="#top" onClick={(e) => { e.preventDefault(); onNav('top'); }} style={{ textDecoration: 'none' }}>
          <Logo size="sm" />
        </a>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="mc-nav-desktop">
          {links.map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); onNav(id); }} style={{
              fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-medium)',
              fontSize: '14px', color: 'var(--text-body)', textDecoration: 'none',
              padding: '8px 13px', borderRadius: 'var(--radius-sm)',
              transition: 'background var(--dur-fast)',
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-card)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >{label}</a>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="mc-nav-desktop">
            <Button variant="primary" size="sm" iconRight={<Icon name="arrow-right" size={16} />} onClick={() => onNav('contact')}>
              Termin anfragen
            </Button>
          </span>
          <button className="mc-nav-mobile" onClick={() => setOpen(o => !o)} aria-label="Menü" style={{
            display: 'none', background: 'var(--surface-card)', border: '1px solid var(--border-hair)',
            borderRadius: 'var(--radius-sm)', padding: '9px', cursor: 'pointer', color: 'var(--text-strong)',
          }}>
            <Icon name={open ? 'x' : 'menu'} size={20} />
          </button>
        </div>
      </div>

      {open && (
        <div className="mc-nav-mobile" style={{
          display: 'none', flexDirection: 'column', padding: '8px var(--container-pad) 18px',
          borderTop: '1px solid var(--border-hair)', gap: '2px',
        }}>
          {links.map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); onNav(id); setOpen(false); }} style={{
              fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-medium)', fontSize: '15px',
              color: 'var(--text-body)', textDecoration: 'none', padding: '12px 4px',
              borderBottom: '1px solid var(--border-hair)',
            }}>{label}</a>
          ))}
          <div style={{ marginTop: '12px' }}>
            <Button variant="primary" size="md" style={{ width: '100%' }} onClick={() => { onNav('contact'); setOpen(false); }}>
              Termin anfragen
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

Object.assign(window, { Header });
