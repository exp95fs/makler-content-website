import { Logo } from '../components/ds/Logo.jsx';
import { Button } from '../components/ds/Button.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { Container } from '../components/ui/Layout.jsx';

export function Nav({ onNav }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(243,238,229,0.82)', backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)', borderBottom: '1px solid var(--border-hair)',
    }}>
      <Container style={{
        padding: '13px var(--container-pad)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
        maxWidth: 'var(--container-max)', margin: '0 auto',
      }}>
        <a href="#top" onClick={(e) => { e.preventDefault(); onNav('top'); }} style={{ textDecoration: 'none', display: 'inline-flex' }}>
          <Logo size="sm" />
        </a>
        <Button variant="primary" size="sm" iconRight={<Icon name="arrow-right" size={16} />} onClick={() => onNav('anfrage')}>
          Gratis-Pilot anfragen
        </Button>
      </Container>
    </header>
  );
}
