import { Logo } from '../components/ds/Logo.jsx';
import { Button } from '../components/ds/Button.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { Container } from '../components/ui/Layout.jsx';

const sectionLinks = [
  { id: 'leistungen', label: 'Leistungen' },
  { id: 'segmente', label: 'Verkauf/Miete' },
  { id: 'marke', label: 'Markenbildung' },
  { id: 'prozess', label: 'Prozess' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'angebot', label: 'Angebot' },
  { id: 'faq', label: 'FAQ' },
];

export function Nav({ onNav }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(243,238,229,0.82)', backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)', borderBottom: '1px solid var(--border-hair)',
    }}>
      <Container style={{
        padding: '13px var(--container-pad)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px',
        maxWidth: 'var(--container-max)', margin: '0 auto',
      }}>
        <a href="#top" onClick={(e) => { e.preventDefault(); onNav('top'); }} style={{ textDecoration: 'none', display: 'inline-flex' }}>
          <Logo size="sm" />
        </a>
        <nav style={{
          display: 'flex', gap: '24px', fontFamily: 'var(--font-body)',
          fontSize: '13.5px', fontWeight: 'var(--fw-body-medium)',
        }} className="mc-nav-links">
          {sectionLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => { e.preventDefault(); onNav(link.id); }}
              style={{ color: 'var(--text-strong)', textDecoration: 'none', padding: '4px 0' }}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <Button variant="primary" size="sm" iconRight={<Icon name="arrow-right" size={16} />} onClick={() => onNav('anfrage')}>
          Gratis-Pilot anfragen
        </Button>
      </Container>
    </header>
  );
}
