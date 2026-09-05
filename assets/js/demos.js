/* demos.js — Mini-Demonstrationen und Raum-Motive. Statische Endzustände stehen im Markup;
   hier werden sie bei erlaubter Bewegung inszeniert (Hover/Fokus/Tap oder beim Eintritt ins Bild).
   Die LEDGER-Manipulation ist nutzerinitiiert und funktioniert auch ohne Bewegung.
   DOM-Vertrag: figure[data-demo=…] — mini-ledger · mini-lens · mini-forge · ledger-chain · ledger-tamper
   · ledger-report · lens-grid · lens-trend · forge-takt · forge-dokument|angebot|report|mail · invest-thesen */

const motionAllowed = () => document.documentElement.classList.contains('js-motion');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}
const short = (h) => `${h.slice(0, 4)}…${h.slice(-4)}`;
const ZERO = '0'.repeat(64);

/** Ein sichtbarer Beispiel-Eintrag der Kette (n · voller Hash · prev). */
function entryLi(n, hash, prevShort, extra = '') {
  const li = document.createElement('li');
  li.innerHTML = `<span class="n">${String(n).padStart(2, '0')}</span><span class="h"></span><span class="p"></span>`;
  li.querySelector('.h').textContent = hash;
  li.querySelector('.p').textContent = `prev ${prevShort}${extra}`;
  return li;
}

/* ---- Miniaturen auf der Startseite: Wiederholung bei Hover/Fokus/Tap ---- */
function replayOn(fig, fn) {
  const host = fig.closest('.card') || fig;
  let busy = false;
  const run = async () => { if (busy || !motionAllowed()) return; busy = true; try { await fn(); } finally { busy = false; } };
  host.addEventListener('mouseenter', run);
  host.addEventListener('focusin', run);
  host.addEventListener('touchstart', run, { passive: true });
}

function miniLedger(fig) {
  const links = Array.from(fig.querAll ? [] : fig.querySelectorAll('.minichain__link'));
  replayOn(fig, async () => {
    links.forEach((l) => l.classList.remove('is-closed'));
    await wait(120);
    for (const l of links) { l.classList.add('is-closed', 'is-snap'); setTimeout(() => l.classList.remove('is-snap'), 160); await wait(170); }
  });
}
function miniLens(fig) {
  replayOn(fig, async () => { fig.classList.remove('is-replay'); void fig.offsetWidth; fig.classList.add('is-replay'); await wait(1400); });
}
function miniForge(fig) {
  const ticks = Array.from(fig.querySelectorAll('.takt li'));
  replayOn(fig, async () => {
    ticks.forEach((t) => t.classList.remove('is-done'));
    await wait(100);
    for (const t of ticks) { t.classList.add('is-done'); await wait(60); }
  });
}

/* ---- LEDGER: wachsende Kette ---- */
function ledgerChain(fig) {
  const list = fig.querySelector('[data-chain-entries]');
  if (!list || !motionAllowed() || !crypto?.subtle) return;
  let n = list.children.length;
  let prevFull = list.lastElementChild?.querySelector('.h')?.textContent || ZERO;
  let timer = null;
  const tick = async () => {
    n += 1;
    const full = await sha256Hex(JSON.stringify({ beispiel: true, i: n, prev: prevFull }));
    const li = entryLi(n, full, short(prevFull));
    li.classList.add('is-new');
    list.appendChild(li);
    requestAnimationFrame(() => li.classList.remove('is-new'));
    prevFull = full;
    while (list.children.length > 6) {
      const first = list.firstElementChild; first.classList.add('is-out'); await wait(260); first.remove();
    }
  };
  const io = new IntersectionObserver((es) => es.forEach((en) => {
    if (en.isIntersecting && !timer) timer = setInterval(tick, 1800);
    if (!en.isIntersecting && timer) { clearInterval(timer); timer = null; }
  }), { threshold: 0.3 });
  io.observe(fig);
}

/* ---- LEDGER: Manipulation versuchen (nutzerinitiiert, echt gerechnet) ---- */
function ledgerTamper(fig) {
  const list = fig.querySelector('[data-tamper-entries]');
  const status = fig.querySelector('[data-tamper-status]');
  const doBtn = fig.querySelector('[data-tamper-do]');
  const resetBtn = fig.querySelector('[data-tamper-reset]');
  if (!list || !status || !doBtn || !resetBtn || !crypto?.subtle) return;
  const render = async (tampered) => {
    list.textContent = '';
    let prev = ZERO;
    const truth = [];
    for (let i = 1; i <= 4; i++) { const h = await sha256Hex(JSON.stringify({ beispiel: true, i, prev })); truth.push({ i, h, prev }); prev = h; }
    let broken = false;
    for (const e of truth) {
      let hash = e.h, extra = '';
      if (tampered && e.i === 3) { hash = await sha256Hex(JSON.stringify({ beispiel: true, i: 3, prev: e.prev, manipuliert: true })); broken = true; }
      if (tampered && e.i === 4) extra = ` ≠ ${short(await sha256Hex(JSON.stringify({ beispiel: true, i: 3, prev: truth[2].prev, manipuliert: true })))}`;
      const li = entryLi(e.i, hash, short(e.prev), extra);
      if (broken) li.classList.add('is-broken');
      list.appendChild(li);
    }
    status.textContent = tampered ? 'Manipulation erkannt · Kette ab Eintrag 03 ungültig' : 'Kette intakt · 4 Einträge verifiziert';
    status.classList.toggle('is-alarm', tampered);
    doBtn.disabled = tampered; resetBtn.disabled = !tampered;
  };
  doBtn.addEventListener('click', () => render(true));
  resetBtn.addEventListener('click', () => render(false));
  // Mit JS beginnt die Demonstration intakt; die statische Version zeigt das Ergebnis der Manipulation.
  render(false);
}

/* ---- Beim Eintritt ins Bild: Klasse is-in (CSS in motion.css übernimmt) ---- */
function inView(fig, threshold = 0.35) {
  if (!motionAllowed()) { fig.classList.add('is-in'); return; }
  const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { fig.classList.add('is-in'); io.disconnect(); } }), { threshold });
  io.observe(fig);
}

function forgeTakt(fig) {
  const ticks = Array.from(fig.querySelectorAll('.takt li'));
  if (!motionAllowed()) return;
  ticks.forEach((t) => t.classList.remove('is-done'));
  const io = new IntersectionObserver(async (es) => {
    if (!es.some((e) => e.isIntersecting)) return;
    io.disconnect();
    for (const t of ticks) { t.classList.add('is-done'); await wait(90); }
  }, { threshold: 0.4 });
  io.observe(fig);
}

const HANDLERS = {
  'mini-ledger': miniLedger, 'mini-lens': miniLens, 'mini-forge': miniForge,
  'ledger-chain': ledgerChain, 'ledger-tamper': ledgerTamper, 'ledger-report': (f) => inView(f, 0.3),
  'lens-grid': (f) => inView(f, 0.3), 'lens-trend': (f) => inView(f, 0.4),
  'forge-takt': forgeTakt, 'forge-dokument': inView, 'forge-angebot': inView, 'forge-report': inView, 'forge-mail': inView,
  'invest-thesen': (f) => inView(f, 0.2),
};

export function init() {
  document.querySelectorAll('[data-demo]').forEach((fig) => {
    const fn = HANDLERS[fig.dataset.demo];
    if (fn) { try { fn(fig); } catch (e) { console.warn('[LOUWIETEC] Demo', fig.dataset.demo, e); fig.classList.add('is-in'); } }
  });
}
