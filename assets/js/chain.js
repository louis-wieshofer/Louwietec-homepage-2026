/* chain.js — die Beweiskette als Fortschrittsanzeige (nur Startseite, nur bei erlaubter Bewegung).
   DOM-Vertrag: [data-chain-rail] > ol > li[data-chain-link=ID] > a · [data-chain-progress]
   · section[data-chain-section=ID] · [data-chain-gap] (Glied bleibt offen: die Lücke)
   · [data-chain-closes-gap] (schließt zuerst die Lücke, dann sich selbst) · [data-chain-final] mit [data-seal]
   Zustände am <li>: is-closed · is-snap (kurzes Glühen) · is-gap · is-lit (Durchleuchten) · Siegel: is-stamped
   Ohne JS/Bewegung rendert site.css alle Glieder geschlossen und das Siegel gestempelt. */

const SNAP_MS = () => (window.matchMedia('(max-width: 63.9375rem)').matches ? 60 : 120);

export function init() {
  const rail = document.querySelector('[data-chain-rail]');
  if (!rail) return;
  const links = new Map();
  rail.querySelectorAll('[data-chain-link]').forEach((li) => links.set(li.dataset.chainLink, li));
  const sections = Array.from(document.querySelectorAll('[data-chain-section]'));
  const progress = rail.querySelector('[data-chain-progress]');
  const seal = document.querySelector('[data-seal]');
  if (!sections.length || !links.size) return;

  // Ausgangslage für die Inszenierung: alle Glieder offen, Siegel noch nicht gefallen
  links.forEach((li) => li.classList.remove('is-closed', 'is-lit', 'is-snap'));
  if (seal) seal.classList.remove('is-stamped');
  const gapId = document.querySelector('[data-chain-gap]')?.dataset.chainSection;
  if (gapId && links.has(gapId)) links.get(gapId).classList.add('is-gap');

  const closed = new Set();
  let finalDone = false;

  const snapClose = (id, delay = 0) => new Promise((resolve) => {
    const li = links.get(id);
    if (!li || closed.has(id)) return resolve();
    closed.add(id);
    setTimeout(() => {
      li.classList.remove('is-gap');
      li.classList.add('is-snap', 'is-closed');
      setTimeout(() => { li.classList.remove('is-snap'); resolve(); }, SNAP_MS() + 40);
    }, delay);
  });

  const lightUp = () => {
    const items = Array.from(links.values());
    items.forEach((li, i) => setTimeout(() => li.classList.add('is-lit'), i * 40));
    return items.length * 40 + 220;
  };

  const onEnter = async (section) => {
    const id = section.dataset.chainSection;
    if (section.hasAttribute('data-chain-gap')) return;            // die Lücke bleibt offen
    if (section.hasAttribute('data-chain-closes-gap') && gapId) {  // erst die Lücke, dann das eigene Glied
      await snapClose(gapId);
      await snapClose(id, 180);
    } else {
      await snapClose(id);
    }
    if (section.hasAttribute('data-chain-final') && !finalDone) {
      finalDone = true;
      const wait = lightUp();
      setTimeout(() => { if (seal) seal.classList.add('is-stamped'); }, wait);
    }
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) onEnter(en.target); });
  }, { threshold: 0.35, rootMargin: '0px 0px -10% 0px' });
  sections.forEach((s) => io.observe(s));

  // Fortschrittslinie folgt der Scrollposition
  const update = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const f = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 1;
    progress.style.setProperty('--progress', `${Math.round(f * 1000) / 10}%`);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  document.addEventListener('lw:scroll', update);

  // Anker-Klicks der Kette: sanft zum Abschnitt
  rail.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    document.dispatchEvent(new CustomEvent('lw:scrollto', { detail: { target } }));
    if (!window.__lwLenis) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', a.getAttribute('href'));
  });
}
