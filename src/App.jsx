import { Nav } from './sections/Nav.jsx';
import { Hero, StatBar } from './sections/Hero.jsx';
import { Benefits, Segments } from './sections/Value.jsx';
import { Leistungspakete, RetainerCalculator } from './sections/Pricing.jsx';
import { Branding, Usp } from './sections/Branding.jsx';
import { Process, Portfolio, Offer, About } from './sections/Flow.jsx';
import { Faq, ContactForm, SiteFooter } from './sections/FaqContact.jsx';

function onNav(id) {
  const el = document.getElementById(id);
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: 'smooth' });
}

export default function App() {
  return (
    <>
      <Nav onNav={onNav} />
      <main>
        <Hero onNav={onNav} />
        <StatBar />
        <Benefits />
        <Segments />
        <Leistungspakete onNav={onNav} />
        <RetainerCalculator />
        <Branding onNav={onNav} />
        <Usp />
        <Process />
        <Portfolio />
        <Offer onNav={onNav} />
        <About />
        <Faq />
        <ContactForm />
      </main>
      <SiteFooter />
    </>
  );
}
