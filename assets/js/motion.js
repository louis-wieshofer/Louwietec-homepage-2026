/* motion.js — Bewegung, nur unter html.js-motion. Lädt GSAP, ScrollTrigger und Lenis (vendored),
   verbindet sanftes Scrollen mit ScrollTrigger, inszeniert Papier-Einschub, Reveals und die
   Hero-Headline. Scheitert etwas, fällt die Seite auf die stille Version zurück (Klasse js-motion weg).
   Vorher-Zustände stehen in motion.css (media-gegatet, unter html.js-motion). */

const VENDOR = [
  '/assets/vendor/gsap/3.15.0/gsap.min.js',
  '/assets/vendor/gsap/3.15.0/ScrollTrigger.min.js',
  '/assets/vendor/lenis/1.3.26/lenis.min.js',
];
const REVEAL_SEL = '.sec > .container > :not([data-hero-headline]):not(.hero__text):not(script), .sec .prose > *, .grid > *, .room-block > *, .faq > *, .insights > li, .hero__text > *';

let lenis = null, gsapRef = null, stRef = null, torn = false;

function headerH() {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--header-h').trim();
  return v.endsWith('rem') ? parseFloat(v) * 16 : parseFloat(v) || 64;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.async = false;
    s.onload = resolve; s.onerror = () => reject(new Error(`Vendor nicht geladen: ${src}`));
    document.head.appendChild(s);
  });
}

/** Stille Version wiederherstellen: alles sichtbar, nichts bewegt sich mehr. */
export function teardown() {
  if (torn) return; torn = true;
  document.documentElement.classList.remove('js-motion');
  document.querySelectorAll(REVEAL_SEL).forEach((el) => el.classList.add('is-in'));
  try { stRef && stRef.killAll(); } catch (e) { /* egal */ }
  try { lenis && lenis.destroy(); } catch (e) { /* egal */ }
  window.__lwLenis = null;
}

function setupReveals() {
  const targets = Array.from(document.querySelectorAll(REVEAL_SEL));
  // Stagger je Elterncontainer, gedeckelt
  const byParent = new Map();
  targets.forEach((el) => { const p = el.parentElement; if (!byParent.has(p)) byParent.set(p, []); byParent.get(p).push(el); });
  byParent.forEach((els) => els.forEach((el, i) => { el.style.setProperty('--reveal-delay', `${Math.min(i, 6) * 60}ms`); }));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  targets.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in'); else io.observe(el);
  });
}

function setupSlides(gsap, ScrollTrigger) {
  document.querySelectorAll('.sec--slide').forEach((sec) => {
    gsap.fromTo(sec, { y: '6vh' }, { y: 0, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top 55%', scrub: true } });
  });
}

function setupHeadline() {
  const words = document.querySelectorAll('[data-hero-headline] [data-word]');
  words.forEach((w, i) => { w.style.setProperty('--word-delay', `${180 + i * 110}ms`); });
  requestAnimationFrame(() => document.querySelector('[data-hero-headline]')?.classList.add('is-in'));
}

export async function init() {
  const html = document.documentElement;
  if (!html.classList.contains('js-motion')) return;
  setupHeadline();
  setupReveals();
  try {
    for (const src of VENDOR) await loadScript(src);
    const { gsap, ScrollTrigger, Lenis } = window;
    if (!gsap || !ScrollTrigger || !Lenis) throw new Error('Vendor unvollständig');
    gsapRef = gsap; stRef = ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
    lenis = new Lenis({ autoRaf: false, smoothWheel: true, syncTouch: false, lerp: 0.1 });
    window.__lwLenis = lenis;
    lenis.on('scroll', () => { ScrollTrigger.update(); document.dispatchEvent(new CustomEvent('lw:scroll')); });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.addEventListener('lw:scrollto', (e) => lenis.scrollTo(e.detail.target, { offset: -headerH() }));
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || a.closest('[data-chain-rail]')) return;
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -headerH() });
      history.replaceState(null, '', a.getAttribute('href'));
    });
    setupSlides(gsap, ScrollTrigger);
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  } catch (err) {
    console.warn('[LOUWIETEC] Bewegung deaktiviert:', err.message);
    teardown();
    return;
  }
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', () => { if (mq.matches) teardown(); });
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') window.__lw = { gsap: gsapRef, lenis };
}
