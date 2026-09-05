/* ticker.js — leise laufender Hash-Ticker mit echten SHA-256-Werten (nur unter html.js-motion).
   DOM-Vertrag: [data-hash-ticker] mit <span>-Einträgen im Format „a91f…3c7e prev 7d2c…e10a“.
   Statisch stehen echte, vorab berechnete Hashes im Markup; hier werden weitere über
   crypto.subtle aus Seitenpfad, Zeitstempel und Vorgänger-Hash erzeugt. Nichts wird behauptet. */

const MAX = 6, EVERY_MS = 2400;

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}
const short = (h) => `${h.slice(0, 4)}…${h.slice(-4)}`;

export function init() {
  if (!('crypto' in window) || !crypto.subtle) return;
  document.querySelectorAll('[data-hash-ticker]').forEach((el) => {
    let prev = (el.lastElementChild?.textContent || '').split(' ')[0] || '0000…0000';
    let seq = el.children.length;
    let timer = null;
    const tick = async () => {
      seq += 1;
      const full = await sha256Hex(`${location.pathname}|${seq}|${Date.now()}|${prev}`);
      const span = document.createElement('span');
      span.className = 'is-new';
      span.textContent = `${short(full)} prev ${prev}`;
      prev = short(full);
      el.appendChild(span);
      requestAnimationFrame(() => span.classList.remove('is-new'));
      while (el.children.length > MAX) el.removeChild(el.firstElementChild);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting && !timer) timer = setInterval(tick, EVERY_MS);
        if (!en.isIntersecting && timer) { clearInterval(timer); timer = null; }
      });
    }, { threshold: 0.2 });
    io.observe(el);
    document.addEventListener('visibilitychange', () => { if (document.hidden && timer) { clearInterval(timer); timer = null; } });
  });
}
