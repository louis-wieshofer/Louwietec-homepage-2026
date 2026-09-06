/* api.js — die einzige Stelle, die mit dem Backend spricht (Schnittstellen-Vertrag v1, docs/CONTRACT.md).
   Beim Laden: GET /healthz mit 2 s Timeout und GET /config parallel. Antwortet der Dienst nicht,
   gilt body[data-backend="down"]: Formulare zeigen den mailto:-Fallback, Anzahlungs-/Kauf-Buttons
   bleiben verborgen. Antworthülle: { ok:true, data } | { ok:false, error:{ code, message, field? } }. */
import { API_BASE, HEALTH_TIMEOUT_MS, CONTRACT_VERSION } from './config.js';

export const state = { backend: 'pending', config: null, health: null };

async function fetchJson(path, options = {}, timeoutMs = 0) {
  const ctrl = new AbortController();
  const timer = timeoutMs ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
  try {
    const res = await fetch(`${API_BASE}${path}`, { credentials: 'omit', mode: 'cors', signal: ctrl.signal, ...options });
    let body = null;
    try { body = await res.json(); } catch (e) { body = null; }
    if (body && typeof body.ok === 'boolean') return body;
    if (!res.ok) return { ok: false, error: { code: res.status === 404 ? 'NOT_FOUND' : 'INTERNAL', message: `HTTP ${res.status}` } };
    return { ok: false, error: { code: 'INTERNAL', message: 'Antwort ohne Vertragshülle' } };
  } catch (err) {
    return { ok: false, error: { code: 'NETWORK', message: err && err.name === 'AbortError' ? 'Zeitüberschreitung' : 'Netzwerkfehler' } };
  } finally { if (timer) clearTimeout(timer); }
}

export async function healthz() {
  const r = await fetchJson('/healthz', { method: 'GET' }, HEALTH_TIMEOUT_MS);
  if (!r.ok || !r.data || r.data.status !== 'up') return { up: false };
  if (r.data.contract && String(r.data.contract) !== CONTRACT_VERSION) console.warn('[LOUWIETEC] Vertragsversion abweichend:', r.data.contract, '≠', CONTRACT_VERSION);
  return { up: true, data: r.data };
}

export async function getConfig() {
  const r = await fetchJson('/config', { method: 'GET' }, HEALTH_TIMEOUT_MS);
  return r.ok && r.data ? r.data : null;
}

export function post(path, body) {
  return fetchJson(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, 15000);
}

let readyPromise = null;
/** Einmal je Seite: Healthz + Config parallel; setzt body[data-backend] und feuert lw:backend. */
export function ready() {
  if (readyPromise) return readyPromise;
  readyPromise = (async () => {
    const [h, c] = await Promise.all([healthz(), getConfig()]);
    state.health = h; state.config = c; state.backend = h.up ? 'up' : 'down';
    document.body.dataset.backend = state.backend;
    document.dispatchEvent(new CustomEvent('lw:backend', { detail: { up: h.up, config: c } }));
    return { up: h.up, config: c };
  })();
  return readyPromise;
}

/** Deutsche Statustexte je Fehlercode (Vorschläge, Freigabe offen). */
export const ERROR_TEXT = Object.freeze({
  VALIDATION_ERROR: 'Bitte prüfen Sie Ihre Angaben.',
  SPAM_REJECTED: 'Die Anfrage wurde als Spam eingestuft. Bitte warten Sie einen Moment und versuchen Sie es erneut oder schreiben Sie uns direkt.',
  RATE_LIMITED: 'Zu viele Anfragen. Bitte versuchen Sie es in einer Minute erneut.',
  PRODUCT_NOT_LIVE: 'Dieses Produkt ist noch nicht buchbar. Reservieren Sie kostenlos, wir melden uns.',
  NOT_FOUND: 'Der Dienst ist gerade nicht erreichbar. Bitte nutzen Sie die direkte E-Mail.',
  INTERNAL: 'Der Dienst ist gerade nicht erreichbar. Bitte nutzen Sie die direkte E-Mail.',
  NETWORK: 'Der Dienst ist gerade nicht erreichbar. Bitte nutzen Sie die direkte E-Mail.',
});
