/* analytics.js — cookielose Messkette (Umami, eigene Instanz). Ereignisse der Website laut Vertrag §3:
   visit (Seitenaufruf, automatisch durch Umami) · magnet_start · cta_click (mit target, produkt, edition, branche).
   Ohne Website-ID (ANALYTICS_WEBSITE_ID leer) wird kein Skript geladen; track() bleibt ein stiller No-op. */
import { ANALYTICS, ANALYTICS_WEBSITE_ID, ANALYTICS_DOMAINS } from './config.js';

const queue = [];
let loaded = false;

function flush() {
  if (!window.umami || typeof window.umami.track !== 'function') return;
  while (queue.length) { const [name, props] = queue.shift(); try { window.umami.track(name, props); } catch (e) { /* stumm */ } }
}

export function track(name, props = {}) {
  const clean = Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined && v !== null && v !== ''));
  queue.push([name, clean]);
  flush(); // ohne Website-ID gibt es kein Skript; ist window.umami dennoch vorhanden (Test), wird es genutzt
}

function loadScript() {
  if (loaded || !ANALYTICS_WEBSITE_ID) return;
  loaded = true;
  const s = document.createElement('script');
  s.defer = true;
  s.src = `${ANALYTICS}/script.js`;
  s.dataset.websiteId = ANALYTICS_WEBSITE_ID;
  s.dataset.domains = ANALYTICS_DOMAINS;
  s.dataset.autoTrack = 'true';   // = Ereignis „visit“ (Seitenaufruf)
  s.addEventListener('load', flush);
  document.head.appendChild(s);
}

export function init() {
  loadScript();
  // cta_click: jeder Klick auf [data-track="cta_click"] mit target (Pflicht), produkt, edition, branche
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-track="cta_click"]');
    if (!el) return;
    track('cta_click', { target: el.dataset.trackTarget || el.textContent.trim().slice(0, 40), produkt: el.dataset.trackProdukt, edition: el.dataset.trackEdition, branche: el.dataset.trackBranche });
  }, { passive: true });
  // magnet_start: Verifier-Link geklickt (Selbstcheck/Lagereport melden forms.js beim ersten Kontakt)
  document.addEventListener('click', (e) => {
    const el = e.target.closest('a[data-magnet="verifier"]');
    if (el) track('magnet_start', { magnet: 'verifier' });
  }, { passive: true });
}
