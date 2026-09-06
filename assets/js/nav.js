/* nav.js — Header: mobiles Menü, aria-current, Flächenwechsel des Headers.
   DOM-Vertrag: [data-header] · [data-nav-toggle][aria-controls] · [data-menu]
   · [data-nav="…"] Links · Sektionen .sec--stage / .sec--paper / .site-footer */

function headerHeight() {
  const cs = getComputedStyle(document.documentElement);
  const rem = parseFloat(cs.fontSize) || 16;   // echte Root-Schriftgröße (Nutzer-Einstellung), nicht fest 16 px
  const v = cs.getPropertyValue('--header-h').trim();
  return v.endsWith('rem') ? parseFloat(v) * rem : parseFloat(v) || 4 * rem;
}

function initToggle() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-menu]');
  if (!toggle || !menu) return;
  const open = (state) => {
    menu.hidden = !state;
    toggle.setAttribute('aria-expanded', String(state));
    document.body.classList.toggle('menu-open', state);
    if (state) {
      const first = menu.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    }
  };
  toggle.addEventListener('click', () => open(menu.hidden));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) { open(false); toggle.focus(); }
  });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) open(false); });
  if (typeof window.matchMedia === 'function') {
    const mq = window.matchMedia('(min-width: 64rem)');
    const onChange = () => { if (mq.matches && !menu.hidden) open(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
  }
}

function initCurrent() {
  const here = location.pathname.replace(/index\.html$/, '');
  document.querySelectorAll('a[data-nav]').forEach((a) => {
    const target = new URL(a.getAttribute('href'), location.origin).pathname.replace(/index\.html$/, '');
    if (target === here) a.setAttribute('aria-current', 'page');
  });
}

/* Der Header nimmt die Fläche der Sektion an, die unter seiner Unterkante liegt. */
function initSurface() {
  const header = document.querySelector('[data-header]');
  if (!header || !('IntersectionObserver' in window)) return;
  const sections = Array.from(document.querySelectorAll('.sec, .site-footer'));
  if (!sections.length) return;
  let io = null;
  const build = () => {
    if (io) io.disconnect();
    const h = headerHeight();
    const vh = window.innerHeight;
    io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        const el = en.target;
        const stage = el.classList.contains('sec--stage') || el.classList.contains('site-footer');
        header.setAttribute('data-surface', stage ? 'stage' : 'paper');
      }
    }, { rootMargin: `-${h}px 0px -${Math.max(0, vh - h - 1)}px 0px`, threshold: 0 });
    sections.forEach((s) => io.observe(s));
  };
  build();
  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(build, 150); }, { passive: true });
}

export function init() {
  // entkoppelt: ein scheiternder Teilschritt reißt die anderen nicht mit
  for (const step of [initToggle, initCurrent, initSurface]) {
    try { step(); } catch (err) { console.warn('[LOUWIETEC] nav:', step.name, err); }
  }
}
