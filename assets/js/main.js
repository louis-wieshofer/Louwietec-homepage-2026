/* main.js — einziger Einstieg (type="module"). Lädt Module nur, wenn die
   Seite die passenden DOM-Verträge enthält. Kein Bundler, kein Build. */

const REGISTRY = [
  // immer
  { when: () => true, load: () => import('./nav.js') },
  // Inhalt, auch ohne Bewegung
  { when: () => document.querySelector('[data-countdown]'), load: () => import('./countdown.js') },
  { when: () => document.querySelector('.beleg[data-beleg]'), load: () => import('./beleg.js') },
  { when: () => document.querySelector('[data-demo]'), load: () => import('./demos.js'), critical: true },
  // nur bei erlaubter Bewegung (html.js-motion, gesetzt von boot.js)
  { when: () => motion() && document.querySelector('[data-chain]'), load: () => import('./chain.js'), critical: true },
  { when: () => motion() && document.querySelector('[data-hash-ticker]'), load: () => import('./ticker.js') },
  { when: () => motion(), load: () => import('./motion.js'), critical: true },
  { when: () => motion() && document.querySelector('[data-hero]'), load: () => import('./hero.js') },
  // ab Phase 5:
  // { when: () => document.querySelector('[data-form]'),         load: () => import('./forms.js') },
  // { when: () => document.querySelector('[data-product-cta]'),  load: () => import('./products.js') },
  // { when: () => document.querySelector('[data-jobs]'),         load: () => import('./jobs.js') },
  // { when: () => true,                                          load: () => import('./analytics.js') },
];

const motion = () => document.documentElement.classList.contains('js-motion');
/* Scheitert ein für die Inszenierung kritisches Modul, fällt die Seite auf die stille Version zurück:
   Klasse js-motion weg, damit kein Vorher-Zustand aus motion.css etwas verbirgt. */
const silentFallback = () => {
  document.documentElement.classList.remove('js-motion');
};

for (const entry of REGISTRY) {
  if (!entry.when()) continue;
  entry.load()
    .then((mod) => { if (typeof mod.init === 'function') return mod.init(); })
    .catch((err) => {
      console.warn('[LOUWIETEC] Modul nicht geladen:', err);
      if (entry.critical) silentFallback();
    });
}
