#!/usr/bin/env node
/* Recompiles onepager.bundle.js from the source .jsx files in this directory.
   Run: node build.js   (requires @babel/core + @babel/preset-react, e.g. `npm i -D` them first) */
const babel = require('@babel/core');
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const sourceFiles = ['ui.jsx', 'NavHero.jsx', 'Value.jsx', 'Branding.jsx', 'Flow.jsx', 'FaqContact.jsx'];

const appAndMount = `
function App() {
  const onNav = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: 'smooth' });
  };
  return (
    <React.Fragment>
      <Nav onNav={onNav} />
      <main>
        <Hero onNav={onNav} />
        <StatBar />
        <Benefits />
        <Segments />
        <Branding onNav={onNav} />
        <Usp />
        <Process />
        <Portfolio />
        <Offer onNav={onNav} />
        <About />
        <Faq />
        <ContactForm />
      </main>
      <SiteFooter onNav={onNav} />
    </React.Fragment>
  );
}

function mountOnePager() {
  if (!window.MaklerContentDesignSystem_a211b6) { setTimeout(mountOnePager, 30); return; }
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  if (window.lucide) window.lucide.createIcons();
}
mountOnePager();
`;

const combined = sourceFiles.map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n') + '\n' + appAndMount;

const { code } = babel.transform(combined, {
  presets: [['@babel/preset-react', { runtime: 'classic', pragma: 'React.createElement', pragmaFrag: 'React.Fragment' }]],
  babelrc: false,
  configFile: false,
});

const banner = `/* Precompiled from ${sourceFiles.join(', ')} (+ App/mount glue) via build.js.
   Do not edit directly — edit the .jsx sources and rerun \`node build.js\`. */\n\n`;

fs.writeFileSync(path.join(dir, 'onepager.bundle.js'), banner + code + '\n');
console.log('Wrote onepager.bundle.js');
