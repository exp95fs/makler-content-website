import { Nav } from './sections/Nav.jsx';
import { Hero, StatBar } from './sections/Hero.jsx';
import { Benefits, Segments } from './sections/Value.jsx';
import { Leistungspakete } from './sections/Pricing.jsx';
import { Branding, Usp } from './sections/Branding.jsx';
import { Process, Portfolio, About } from './sections/Flow.jsx';
import { Fork } from './sections/Fork.jsx';
import { Booking } from './sections/Booking.jsx';
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
        <Leistungspakete onNav={onNav} />
        <Segments />
        <Branding onNav={onNav} />
        <Usp />
        <Process />
        <Portfolio />
        <About />
        <Fork onNav={onNav} />
        <Booking />
        <Faq />
        <ContactForm />
      </main>
      <SiteFooter />
    </>
  );
}
