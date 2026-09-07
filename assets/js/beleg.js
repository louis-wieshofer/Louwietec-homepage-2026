/* beleg.js — Beleg-Zeichen ⌖: Hover/Fokus/Klick öffnet ein Kärtchen (Titel, Status, Artefakt).
   DOM-Vertrag: button.beleg[data-beleg=ID][aria-expanded][aria-haspopup=dialog]
   Ein einziges Popover (.beleg-pop, immer Tinte) wird an <body> gehängt und positioniert. */
import { BELEGE, STATUS_TEXT } from './belege.js';

let pop = null, current = null, hoverTimer = null;

function ensurePop() {
  if (pop) return pop;
  pop = document.createElement('div');
  pop.className = 'beleg-pop';
  pop.setAttribute('role', 'dialog');
  pop.setAttribute('aria-label', 'Beleg');
  pop.hidden = true;
  pop.innerHTML = '<p class="beleg-pop__title" data-beleg-title></p><p class="beleg-pop__status" data-beleg-status></p><p class="beleg-pop__artefakt" data-beleg-artefakt></p>';
  document.body.appendChild(pop);
  return pop;
}

function fill(id) {
  const b = BELEGE[id] || { titel: id, status: 'folgt', artefakt: '', hinweis: '' };
  pop.querySelector('[data-beleg-title]').textContent = b.titel;
  pop.querySelector('[data-beleg-status]').textContent = STATUS_TEXT[b.status] || STATUS_TEXT.folgt;
  // Fundstelle immer als Text; bei geprüfter Quelle zusätzlich der Weg zum Original.
  const art = pop.querySelector('[data-beleg-artefakt]');
  art.replaceChildren();
  if (b.hinweis) art.appendChild(document.createTextNode(b.hinweis));
  if (b.status === 'ok' && b.artefakt) {
    if (b.hinweis) art.appendChild(document.createElement('br'));
    const a = document.createElement('a');
    a.href = b.artefakt;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = 'Quelle öffnen (EUR-Lex)';
    art.appendChild(a);
  }
}

function place(btn) {
  const r = btn.getBoundingClientRect();
  const pw = pop.offsetWidth, ph = pop.offsetHeight;
  let left = r.left + window.scrollX + r.width / 2 - pw / 2;
  left = Math.max(8 + window.scrollX, Math.min(left, window.scrollX + document.documentElement.clientWidth - pw - 8));
  let top = r.bottom + window.scrollY + 8;
  if (r.bottom + ph + 16 > window.innerHeight) top = r.top + window.scrollY - ph - 8;
  pop.style.left = `${Math.round(left)}px`;
  pop.style.top = `${Math.round(top)}px`;
}

function open(btn) {
  ensurePop();
  if (current && current !== btn) current.setAttribute('aria-expanded', 'false');
  current = btn;
  fill(btn.dataset.beleg);
  pop.hidden = false;
  place(btn);
  btn.setAttribute('aria-expanded', 'true');
}

function close() {
  if (!pop || pop.hidden) return;
  pop.hidden = true;
  if (current) current.setAttribute('aria-expanded', 'false');
  current = null;
}

export function init() {
  const buttons = Array.from(document.querySelectorAll('.beleg[data-beleg]'));
  if (!buttons.length) return;
  buttons.forEach((btn) => {
    const b = BELEGE[btn.dataset.beleg];
    if (b && b.status === 'ok') btn.classList.add('is-ok');
    btn.addEventListener('click', (e) => { e.preventDefault(); (current === btn && pop && !pop.hidden) ? close() : open(btn); });
    btn.addEventListener('mouseenter', () => { clearTimeout(hoverTimer); hoverTimer = setTimeout(() => open(btn), 120); });
    btn.addEventListener('mouseleave', () => { clearTimeout(hoverTimer); hoverTimer = setTimeout(() => { if (!pop?.matches(':hover')) close(); }, 220); });
    btn.addEventListener('focus', () => open(btn));
    btn.addEventListener('blur', () => setTimeout(() => { if (!pop?.contains(document.activeElement)) close(); }, 0));
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && current) { const b = current; close(); b.focus(); } });
  document.addEventListener('pointerdown', (e) => { if (pop && !pop.hidden && !pop.contains(e.target) && !e.target.closest('.beleg')) close(); });
  window.addEventListener('resize', () => { if (current && pop && !pop.hidden) place(current); }, { passive: true });
  window.addEventListener('scroll', () => { if (current && pop && !pop.hidden) place(current); }, { passive: true });
}
