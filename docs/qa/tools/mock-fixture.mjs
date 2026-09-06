/**
 * mock-fixture.mjs — Playwright-Testdouble für das Backend laut Schnittstellen-Vertrag v1 (docs/CONTRACT.md).
 * Kein Server, kein Port, keine Persistenz: page.route() beantwortet Anfragen an web.service.louwietec.com
 * mit gültigen Beispielantworten. Das ist kein Backend-Code — die Website spricht weiterhin nur den Vertrag.
 *
 *   const mock = await installMock(page, { statuses: { ledger: 'deposit' }, contingent: 5 });
 *   mock.records  → alle empfangenen POSTs [{ path, body }]
 *   mock.setStatus('lens', 'live') · mock.down = true (Dienst nicht erreichbar) · mock.forceError = { code, field }
 */
export const API = 'https://web.service.louwietec.com';
const ENUMS = {
  produkt: ['ledger', 'lens', 'forge'], edition: ['starter', 'pro', 'group'], betriebsort: ['cloud', 'onprem'],
  anliegen: ['ledger', 'lens', 'forge', 'enterprise', 'investor', 'presse', 'sonstiges'],
  rolle: ['pruefer', 'implementierer', 'kapital', 'sonstiges'],
  branche: ['banking', 'versicherung', 'leasing', 'inkasso', 'gesundheit', 'energie', 'industrie', 'handel', 'dienstleistung', 'oeffentlich', 'sonstige'],
};
const REQUIRED = {
  '/forms/kontakt': ['firma', 'name', 'email', 'anliegen', 'nachricht', 'consent', 'website', 'ts'],
  '/forms/investoren': ['name', 'organisation', 'email', 'rolle', 'nachricht', 'consent', 'website', 'ts'],
  '/forms/karriere': ['name', 'email', 'motivation', 'consent', 'website', 'ts'],
  '/forms/lagereport': ['email', 'consent', 'website', 'ts'],
  '/forms/selbstcheck': ['email', 'firma', 'antworten', 'consent', 'website', 'ts'],
  '/reserve': ['firma', 'name', 'email', 'produkt', 'edition', 'branche', 'betriebsort', 'consent', 'website', 'ts'],
  '/reserve/deposit': ['reservation_id', 'email'],
  '/reserve/refund': ['reservation_id', 'email'],
  '/checkout': ['produkt', 'edition', 'betriebsort', 'email', 'firma'],
};
const ENUM_OF = { produkt: 'produkt', edition: 'edition', betriebsort: 'betriebsort', anliegen: 'anliegen', rolle: 'rolle', branche: 'branche' };

export async function installMock(page, opts = {}) {
  const state = {
    statuses: { ledger: 'reserve', lens: 'reserve', forge: 'reserve', ...(opts.statuses || {}) },
    deposit_eur: opts.deposit_eur ?? 89,
    contingent: {},
    records: [],
    reservations: new Map(),
    down: !!opts.down,
    forceError: null,
    rate: { count: 0, windowStart: Date.now() },
    ratePerMinute: opts.ratePerMinute ?? 20,
    minAgeMs: opts.minAgeMs ?? 3000,
  };
  for (const p of ENUMS.produkt) { state.contingent[p] = {}; for (const b of ENUMS.branche) state.contingent[p][b] = opts.contingent ?? 5; }
  let seq = 0;
  const cors = (route) => ({ 'Access-Control-Allow-Origin': route.request().headers()['origin'] || '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' });
  const json = (route, status, body) => route.fulfill({ status, headers: { 'Content-Type': 'application/json', ...cors(route) }, body: JSON.stringify(body) });
  const err = (route, status, code, message, field) => json(route, status, { ok: false, error: { code, message, ...(field ? { field } : {}) } });

  await page.route(`${API}/**`, async (route) => {
    const req = route.request();
    if (state.down) return route.abort('connectionrefused');
    const url = new URL(req.url());
    const path = url.pathname;
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors(route) });
    if (req.method() === 'GET' && path === '/healthz') return json(route, 200, { ok: true, data: { status: 'up', version: '1.0.0-mock', contract: '1.0' } });
    if (req.method() === 'GET' && path === '/config') {
      const products = Object.fromEntries(Object.entries(state.statuses).map(([k, v]) => [k, { status: v }]));
      return json(route, 200, { ok: true, data: { products, contingent: state.contingent, deposit_eur: state.deposit_eur } });
    }
    if (req.method() !== 'POST') return err(route, 404, 'NOT_FOUND', 'Unbekannter Pfad');
    // Rate-Limit: max N Anfragen / Minute
    const now = Date.now();
    if (now - state.rate.windowStart > 60_000) { state.rate.windowStart = now; state.rate.count = 0; }
    state.rate.count += 1;
    if (state.rate.count > state.ratePerMinute) return err(route, 429, 'RATE_LIMITED', 'Zu viele Anfragen');
    let body = {};
    try { body = JSON.parse(req.postData() || '{}'); } catch (e) { return err(route, 400, 'VALIDATION_ERROR', 'Kein JSON'); }
    state.records.push({ path, body, headers: req.headers() });
    if (state.forceError) { const f = state.forceError; state.forceError = null; return err(route, f.status || 400, f.code, f.message || f.code, f.field); }
    const required = REQUIRED[path];
    if (!required) return err(route, 404, 'NOT_FOUND', 'Unbekannter Pfad');
    // Spam-Schutz für Formulare/Reservierung
    if (required.includes('website')) {
      if (body.website) return err(route, 400, 'SPAM_REJECTED', 'Honeypot');
      if (typeof body.ts !== 'number' || now - body.ts < state.minAgeMs) return err(route, 400, 'SPAM_REJECTED', 'Zu schnell');
      if (body.consent !== true) return err(route, 400, 'VALIDATION_ERROR', 'Einwilligung fehlt', 'consent');
    }
    for (const f of required) {
      if (f === 'website') continue;
      const v = body[f];
      if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) return err(route, 400, 'VALIDATION_ERROR', `Pflichtfeld fehlt: ${f}`, f);
    }
    if (body.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return err(route, 400, 'VALIDATION_ERROR', 'Ungültige E-Mail-Adresse', 'email');
    for (const [f, en] of Object.entries(ENUM_OF)) {
      if (f === 'rolle' && path === '/forms/karriere') continue; // Vertrag: rolle bei Karriere ist optionaler Freitext
      if (body[f] !== undefined && !ENUMS[en].includes(body[f])) return err(route, 400, 'VALIDATION_ERROR', `Ungültiger Wert für ${f}`, f);
    }
    seq += 1;
    switch (path) {
      case '/forms/kontakt': case '/forms/investoren': case '/forms/karriere':
        return json(route, 200, { ok: true, data: { received: true, id: `mock-${seq}` } });
      case '/forms/lagereport':
        return json(route, 200, { ok: true, data: { subscribed: true } });
      case '/forms/selbstcheck': {
        const a = body.antworten;
        if (!Array.isArray(a) || a.length !== 10 || a.some((n) => !Number.isInteger(n) || n < 0 || n > 2)) return err(route, 400, 'VALIDATION_ERROR', 'antworten: genau 10 Ganzzahlen 0–2', 'antworten');
        const score = a.reduce((s, n) => s + n, 0);
        const stufe = score >= 15 ? 'gut' : score >= 8 ? 'luecken' : 'dringend';
        return json(route, 200, { ok: true, data: { score, stufe, empfehlungen: ['Protokollaufbewahrung festlegen', 'Menschliche Aufsicht dokumentieren', 'Betriebsüberwachung einrichten'] } });
      }
      case '/reserve': {
        const left = state.contingent[body.produkt][body.branche];
        const id = `res-mock-${seq}`;
        if (left > 0) { state.contingent[body.produkt][body.branche] = left - 1; state.reservations.set(id, body); return json(route, 200, { ok: true, data: { reservation_id: id, status: 'reserviert', plaetze_frei: left - 1 } }); }
        state.reservations.set(id, body);
        return json(route, 200, { ok: true, data: { reservation_id: id, status: 'warteliste', plaetze_frei: 0 } });
      }
      case '/reserve/deposit': {
        const r = state.reservations.get(body.reservation_id);
        if (!r) return err(route, 404, 'NOT_FOUND', 'Reservierung unbekannt', 'reservation_id');
        if (state.statuses[r.produkt] === 'reserve') return err(route, 409, 'PRODUCT_NOT_LIVE', 'Anzahlung noch nicht freigeschaltet');
        return json(route, 200, { ok: true, data: { checkout_url: 'https://checkout.stripe.com/mock/deposit' } });
      }
      case '/reserve/refund':
        return json(route, 200, { ok: true, data: { confirmation_sent: true } });
      case '/checkout':
        if (state.statuses[body.produkt] !== 'live') return err(route, 409, 'PRODUCT_NOT_LIVE', 'Produkt noch nicht buchbar');
        return json(route, 200, { ok: true, data: { checkout_url: 'https://checkout.stripe.com/mock/checkout' } });
      default:
        return err(route, 404, 'NOT_FOUND', 'Unbekannter Pfad');
    }
  });

  return {
    get records() { return state.records; },
    get state() { return state; },
    setStatus(produkt, status) { state.statuses[produkt] = status; },
    set down(v) { state.down = !!v; }, get down() { return state.down; },
    set forceError(v) { state.forceError = v; },
    resetRate() { state.rate = { count: 0, windowStart: Date.now() }; },
  };
}

/** Umami-Stub: zeichnet track()-Aufrufe in window.__umamiEvents auf (Ereignis-Test ohne echte Instanz). */
export async function installUmamiStub(page) {
  await page.addInitScript(() => {
    window.__umamiEvents = [];
    window.umami = { track: (name, props) => { window.__umamiEvents.push({ name, props: props || {} }); } };
  });
}
