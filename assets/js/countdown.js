/* countdown.js — Tage bis zur Nachweispflicht (02.12.2027). Statischer Wert steht im Markup;
   dieses Modul rechnet ihn nach und zählt bei erlaubter Bewegung von 999 herunter.
   DOM-Vertrag: [data-countdown][data-deadline=YYYY-MM-DD] · [data-countdown-big] · [data-countdown-value] (<time>) */
import { DEADLINE } from './config.js';

function daysUntil(iso) {
  const end = Date.parse(iso.length === 10 ? `${iso}T00:00:00+01:00` : iso);
  return Math.max(0, Math.ceil((end - Date.now()) / 86_400_000));
}

export function init() {
  const roots = document.querySelectorAll('[data-countdown]');
  if (!roots.length) return;
  const motion = document.documentElement.classList.contains('js-motion');
  roots.forEach((root) => {
    const iso = root.dataset.deadline || DEADLINE;
    const days = daysUntil(iso);
    const big = root.querySelector('[data-countdown-big]');
    const values = document.querySelectorAll('[data-countdown-value]');
    values.forEach((v) => { v.textContent = String(days); if (v.tagName === 'TIME') v.setAttribute('datetime', iso.slice(0, 10)); });
    if (!big) return;
    if (!motion || days >= 999) { big.textContent = String(days); root.classList.add('is-snapped'); return; }
    // Herunterzählen: 999 → Zieltag in 1,6 s, gebremst zum Ende, dann Einrasten
    const start = performance.now(), dur = 1600, from = 999;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const val = Math.round(from + (days - from) * ease(t));
      big.textContent = String(val);
      if (t < 1) requestAnimationFrame(step);
      else { big.textContent = String(days); root.classList.add('is-snapped'); }
    };
    requestAnimationFrame(step);
  });
}
