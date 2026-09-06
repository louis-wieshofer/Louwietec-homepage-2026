/* products.js — Buttons je Produkt ausschließlich aus GET /config (Vertrag §2):
   reserve → „Erstanwender-Platz reservieren, kostenlos“
   deposit → zusätzlich „Platz fixieren: {deposit_eur} € Anzahlung, anrechenbar, rückforderbar“
   live    → „Jetzt buchen“ (Checkout)
   Enterprise hat nie einen Kaufen-Button (statisch: „Gespräch anfragen“). Backend down → nur Reservierung im mailto-Modus.
   DOM-Vertrag: [data-product-cta=produkt][data-reserve-target="#id"] · section[data-reserve-form] mit form[data-form=reserve] */
import { ready, state } from './api.js';
import { PRODUCT_NAMES } from './config.js';

const TEXT = Object.freeze({
  reserve: 'Erstanwender-Platz reservieren, kostenlos',
  deposit: (eur) => `Platz fixieren: ${eur} € Anzahlung, anrechenbar, rückforderbar`,
  live: 'Jetzt buchen',
});

function button(text, extra = {}) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = extra.className || 'btn btn--primary'; b.textContent = text;
  b.dataset.track = 'cta_click';
  for (const [k, v] of Object.entries(extra.data || {})) b.dataset[k] = v;
  if (extra.requiresBackend) b.setAttribute('data-requires-backend', '');
  return b;
}

function reveal(section, produkt, mode) {
  if (!section) return;
  section.hidden = false;
  section.dataset.mode = mode;
  const form = section.querySelector('form[data-form="reserve"]');
  if (form) {
    const hidden = form.querySelector('input[name="produkt"]');
    if (hidden) hidden.value = produkt;
    form.dataset.mode = mode;
    form.dispatchEvent(new CustomEvent('lw:mode', { detail: { mode, produkt } }));
  }
  document.dispatchEvent(new CustomEvent('lw:scrollto', { detail: { target: section } }));
  if (!window.__lwLenis) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // erstes echtes Feld fokussieren (nie den Honeypot „website“), nach dem Scrollen
  const firstField = form?.querySelector('input:not([type=hidden]):not([name="website"]), select');
  if (firstField) setTimeout(() => firstField.focus({ preventScroll: true }), 900);
}

export async function init() {
  const hosts = Array.from(document.querySelectorAll('[data-product-cta]'));
  if (!hosts.length) return;
  const { up, config } = await ready();
  for (const host of hosts) {
    const produkt = host.dataset.productCta;
    const section = document.querySelector(host.dataset.reserveTarget || '[data-reserve-form]');
    const status = up && config?.products?.[produkt]?.status;
    const depositEur = config?.deposit_eur ?? 89;
    host.replaceChildren();
    host.removeAttribute('data-pending');

    // Reservierung gibt es immer — bei Ausfall des Dienstes im mailto-Modus des Formulars
    const reserveBtn = button(TEXT.reserve, { data: { trackTarget: 'reserve', trackProdukt: produkt }, className: status === 'live' ? 'btn btn--secondary' : 'btn btn--primary' });
    reserveBtn.addEventListener('click', () => reveal(section, produkt, 'reserve'));
    host.appendChild(reserveBtn);

    if (status === 'deposit') {
      const dep = button(TEXT.deposit(depositEur), { className: 'btn btn--secondary', requiresBackend: true, data: { trackTarget: 'deposit', trackProdukt: produkt } });
      dep.addEventListener('click', () => reveal(section, produkt, 'deposit'));
      host.appendChild(dep);
    }
    if (status === 'live') {
      const buy = button(TEXT.live, { className: 'btn btn--primary', requiresBackend: true, data: { trackTarget: 'checkout', trackProdukt: produkt } });
      buy.addEventListener('click', () => reveal(section, produkt, 'checkout'));
      host.insertBefore(buy, reserveBtn);
    }
    host.setAttribute('data-status', status || (up ? 'unbekannt' : 'down'));
    if (section) {
      const title = section.querySelector('[data-reserve-title]');
      if (title) title.textContent = `${PRODUCT_NAMES[produkt] || produkt}: Erstanwender-Platz reservieren`;
    }
  }
  state.products = config?.products || null;
}
