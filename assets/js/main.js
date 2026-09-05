/* main.js — einziger Einstieg (type="module"). Lädt Module nur, wenn die
   Seite die passenden DOM-Verträge enthält. Kein Bundler, kein Build. */

const REGISTRY = [
  // immer
  { when: () => true, load: () => import('./nav.js') },
  // ab Phase 3/4/5 (Module werden mit ihren DOM-Verträgen ergänzt):
  // { when: () => document.querySelector('[data-chain]'),        load: () => import('./chain.js') },
  // { when: () => document.querySelector('[data-hero]'),         load: () => import('./hero.js') },
  // { when: () => document.querySelector('[data-countdown]'),    load: () => import('./countdown.js') },
  // { when: () => document.querySelector('.beleg'),              load: () => import('./beleg.js') },
  // { when: () => document.querySelector('[data-hash-ticker]'),  load: () => import('./ticker.js') },
  // { when: () => document.querySelector('[data-demo]'),         load: () => import('./demos.js') },
  // { when: () => document.querySelector('[data-form]'),         load: () => import('./forms.js') },
  // { when: () => document.querySelector('[data-product-cta]'),  load: () => import('./products.js') },
  // { when: () => document.querySelector('[data-jobs]'),         load: () => import('./jobs.js') },
  // { when: () => true,                                          load: () => import('./analytics.js') },
  // { when: () => document.documentElement.classList.contains('js-motion'), load: () => import('./motion.js') },
];

for (const entry of REGISTRY) {
  if (!entry.when()) continue;
  entry.load()
    .then((mod) => { if (typeof mod.init === 'function') mod.init(); })
    .catch((err) => { console.warn('[LOUWIETEC] Modul nicht geladen:', err); });
}
