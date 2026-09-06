/* forms.js — alle Formulare gegen den Schnittstellen-Vertrag v1 (docs/CONTRACT.md).
   DOM-Vertrag: form[data-form=kontakt|investoren|karriere|lagereport|selbstcheck|reserve][data-endpoint][data-mailto]
   · input[name=ts] (Unix-ms beim Rendern) · Honeypot input[name=website] (leer) · Felder [data-field] mit
   [data-error-for=feld] · consent-Checkbox · [data-submit] · [data-form-status] · [data-form-success] · [data-form-mailto]
   Fehlerhülle: error.field → Meldung am Feld (aria-invalid, Fokus); sonst Statuszeile. Backend down → mailto:-Fallback
   mit Betreff aus config.js und Body aus den Feldern. Enums werden clientseitig gegen config.js geprüft. */
import { post, ready, state, ERROR_TEXT } from './api.js';
import { ENUMS, MAILTO_SUBJECTS, CONTACT_EMAIL, PRODUCT_NAMES, EDITION_NAMES } from './config.js';
import { track } from './analytics.js';

const INT_FIELDS = new Set(['antworten']);
const OPTIONAL = { karriere: ['link', 'rolle'], lagereport: ['firma'], reserve: [], kontakt: [], investoren: [], selbstcheck: [] };
const ENUM_FIELDS = { anliegen: 'anliegen', rolle: 'rolle', edition: 'edition', branche: 'branche', betriebsort: 'betriebsort', produkt: 'produkt' };
const STUFE_TEXT = { gut: 'Gut aufgestellt', luecken: 'Lücken vorhanden', dringend: 'Dringender Handlungsbedarf' }; // Vorschläge, Freigabe offen

const q = (form, sel) => form.querySelector(sel);
const label = (form, name) => (form.querySelector(`label[for="${form.querySelector(`[name="${name}"]`)?.id}"]`)?.textContent || form.querySelector(`[data-field="${name}"] legend`)?.textContent || name).replace(/\*$/, '').trim();

function setError(form, field, message) {
  const el = form.querySelector(`[data-error-for="${field}"]`);
  const inputs = form.querySelectorAll(`[name="${field}"]`);
  if (el) { el.textContent = message; el.hidden = !message; }
  inputs.forEach((i) => { if (message) i.setAttribute('aria-invalid', 'true'); else i.removeAttribute('aria-invalid'); });
  if (message && inputs[0]) inputs[0].focus({ preventScroll: false });
}
function clearErrors(form) {
  form.querySelectorAll('[data-error-for]').forEach((el) => { el.textContent = ''; el.hidden = true; });
  form.querySelectorAll('[aria-invalid]').forEach((i) => i.removeAttribute('aria-invalid'));
}
function setStatus(form, text, isError = false) {
  const el = q(form, '[data-form-status]');
  if (!el) return;
  el.textContent = text || '';
  el.classList.toggle('is-error', !!isError);
}

/** Baut die Vertrags-Payload aus dem Formular. */
function payload(form) {
  const kind = form.dataset.form;
  const fd = new FormData(form);
  const out = {};
  for (const [k, v] of fd.entries()) {
    if (k.startsWith('q') && /^q\d$/.test(k)) continue;
    if (k === 'consent') continue;
    out[k] = typeof v === 'string' ? v.trim() : v;
  }
  out.consent = !!q(form, '[name="consent"]')?.checked;
  out.website = out.website || '';
  out.ts = Number(out.ts) || Date.now();
  if (kind === 'selbstcheck') {
    out.antworten = Array.from({ length: 10 }, (_, i) => Number(fd.get(`q${i}`)));
  }
  for (const opt of OPTIONAL[kind] || []) if (out[opt] === '') delete out[opt];
  return out;
}

/** Clientseitige Prüfung: Pflichtfelder, Enums, Zahlen — Meldungen deutsch. */
function validate(form, data) {
  const kind = form.dataset.form;
  for (const input of form.querySelectorAll('[required]')) {
    const name = input.name;
    if (input.type === 'radio') { if (!form.querySelector(`[name="${name}"]:checked`)) return { field: name, message: 'Bitte wählen Sie eine Option.' }; continue; }
    if (input.type === 'checkbox') { if (!input.checked) return { field: name, message: 'Bitte bestätigen Sie den Datenschutzhinweis.' }; continue; }
    if (!String(data[name] ?? '').trim()) return { field: name, message: 'Bitte füllen Sie dieses Feld aus.' };
    if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data[name])) return { field: name, message: 'Bitte geben Sie eine gültige E-Mail-Adresse an.' };
    if (input.type === 'url' && data[name] && !/^https?:\/\//i.test(data[name])) return { field: name, message: 'Bitte geben Sie eine Adresse mit https:// an.' };
  }
  for (const [field, en] of Object.entries(ENUM_FIELDS)) {
    if (field === 'rolle' && kind === 'karriere') continue; // Vertrag: bei /forms/karriere ist rolle Freitext (Rollen aus jobs.json)
    if (data[field] !== undefined && data[field] !== '' && !ENUMS[en].includes(data[field])) return { field, message: 'Ungültige Auswahl.' };
  }
  if (kind === 'selbstcheck' && (!Array.isArray(data.antworten) || data.antworten.length !== 10 || data.antworten.some((n) => !Number.isInteger(n) || n < 0 || n > 2))) {
    const missing = data.antworten.findIndex((n) => Number.isNaN(n));
    return { field: `q${missing < 0 ? 0 : missing}`, message: 'Bitte beantworten Sie alle zehn Fragen.', question: missing };
  }
  return null;
}

/** mailto:-Fallback: Betreff laut Vertrag/config, Body aus den Feldern. */
function mailtoHref(form, data) {
  const kind = form.dataset.form;
  let subject = MAILTO_SUBJECTS[form.dataset.mailto || kind] || MAILTO_SUBJECTS.kontakt;
  if (kind === 'reserve') subject = subject.replace('{PRODUKT}', PRODUCT_NAMES[data.produkt] || (data.produkt || '').toUpperCase()).replace('{Edition}', EDITION_NAMES[data.edition] || data.edition || '').trim();
  const lines = [];
  for (const [k, v] of Object.entries(data)) {
    if (['ts', 'website', 'consent', 'produkt'].includes(k) || v === '' || v === undefined) continue;
    lines.push(`${label(form, k)}: ${Array.isArray(v) ? v.join(', ') : v}`);
  }
  if (kind === 'reserve') lines.unshift(`Produkt: ${PRODUCT_NAMES[data.produkt] || data.produkt}`);
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
}

function applyBackendState(form, up) {
  const submit = q(form, '[data-submit]');
  const mailto = q(form, '[data-form-mailto]');
  if (!up) {
    if (submit) submit.hidden = true;
    if (mailto) { mailto.hidden = false; mailto.href = mailtoHref(form, payload(form)); }
    setStatus(form, 'Der Dienst ist gerade nicht erreichbar, die direkte E-Mail tut es genauso.');
  } else {
    if (submit) submit.hidden = false;
    if (mailto) mailto.hidden = true;
    setStatus(form, '');
  }
}

/* ---- Erfolgsdarstellung je Formular ---- */
function showSuccess(form, data, result) {
  const kind = form.dataset.form;
  form.classList.add('is-sent');
  const box = q(form, '[data-form-success]');
  if (box) box.hidden = false;
  setStatus(form, '');
  if (kind === 'selbstcheck') {
    const score = q(form, '[data-selfcheck-score]'), stufe = q(form, '[data-selfcheck-stufe]'), emp = q(form, '[data-selfcheck-empfehlungen]');
    if (score) score.textContent = String(result.score ?? '–');
    if (stufe) stufe.textContent = STUFE_TEXT[result.stufe] || result.stufe || '';
    if (emp) emp.replaceChildren(...(result.empfehlungen || []).map((t) => { const li = document.createElement('li'); li.textContent = t; return li; }));
  }
  if (kind === 'reserve') {
    const res = q(form, '[data-reserve-result]'), meta = q(form, '[data-reserve-meta]'), next = q(form, '[data-reserve-next]');
    const produkt = PRODUCT_NAMES[data.produkt] || data.produkt;
    if (res) res.textContent = result.status === 'warteliste'
      ? `Das Erstanwender-Kontingent für ${produkt} in Ihrer Branche ist vergeben, Sie stehen auf der Warteliste. Wir melden uns.`
      : `Reserviert. Ihr Erstanwender-Platz für ${produkt} ist vorgemerkt, Sie erhalten eine Bestätigung per E-Mail.`;
    if (meta) meta.textContent = `Reservierung ${result.reservation_id || ''} · freie Plätze in Ihrer Branche: ${result.plaetze_frei ?? '–'}`;
    form.dataset.reservationId = result.reservation_id || '';
    form.dataset.reservationEmail = data.email;
    const status = state.config?.products?.[data.produkt]?.status;
    if (next && status === 'deposit' && result.status === 'reserviert' && state.backend === 'up') {
      next.hidden = false;
      const eur = state.config?.deposit_eur ?? 89;
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn--primary'; b.setAttribute('data-requires-backend', '');
      b.dataset.track = 'cta_click'; b.dataset.trackTarget = 'deposit'; b.dataset.trackProdukt = data.produkt; b.dataset.trackEdition = data.edition;
      b.textContent = `Platz fixieren: ${eur} € Anzahlung, anrechenbar, rückforderbar`;
      b.addEventListener('click', async () => {
        b.disabled = true; setStatus(form, 'Anzahlung wird vorbereitet …');
        const r = await post('/reserve/deposit', { reservation_id: result.reservation_id, email: data.email });
        if (r.ok && r.data?.checkout_url) { location.assign(r.data.checkout_url); return; }
        b.disabled = false; setStatus(form, ERROR_TEXT[r.error?.code] || ERROR_TEXT.INTERNAL, true);
      });
      next.replaceChildren(b);
    }
  }
}

async function submit(form) {
  const kind = form.dataset.form;
  const mode = form.dataset.mode || 'reserve';
  clearErrors(form);
  const data = payload(form);
  const v = validate(form, data);
  if (v) { setError(form, v.field, v.message); if (v.question !== undefined && v.question >= 0) form.querySelector(`[data-question="${v.question}"]`)?.scrollIntoView({ block: 'center' }); return; }
  if (state.backend !== 'up') { applyBackendState(form, false); return; }
  const btn = q(form, '[data-submit]');
  if (btn) btn.disabled = true;
  form.setAttribute('aria-busy', 'true');
  setStatus(form, 'Wird gesendet …');
  let r;
  if (kind === 'reserve' && mode === 'checkout') {
    r = await post('/checkout', { produkt: data.produkt, edition: data.edition, betriebsort: data.betriebsort, email: data.email, firma: data.firma, ...(form.dataset.reservationId ? { reservation_id: form.dataset.reservationId } : {}) });
    if (r.ok && r.data?.checkout_url) { location.assign(r.data.checkout_url); return; }
  } else {
    r = await post(form.dataset.endpoint, data);
  }
  if (btn) btn.disabled = false;
  form.removeAttribute('aria-busy');
  if (r.ok) { showSuccess(form, data, r.data || {}); track('cta_click', { target: `${kind}_gesendet`, produkt: data.produkt, edition: data.edition, branche: data.branche }); return; }
  const err = r.error || { code: 'INTERNAL' };
  if (err.field && form.querySelector(`[name="${err.field}"]`)) { setError(form, err.field, err.message || ERROR_TEXT.VALIDATION_ERROR); setStatus(form, ''); return; }
  setStatus(form, ERROR_TEXT[err.code] || err.message || ERROR_TEXT.INTERNAL, true);
  if (['NETWORK', 'INTERNAL', 'NOT_FOUND', 'SPAM_REJECTED'].includes(err.code)) { const m = q(form, '[data-form-mailto]'); if (m) { m.hidden = false; m.href = mailtoHref(form, data); } }
}

function preselect(form) {
  const params = new URLSearchParams(location.search);
  for (const [field, en] of Object.entries(ENUM_FIELDS)) {
    const val = params.get(field);
    const sel = form.querySelector(`select[name="${field}"]`);
    if (val && sel && ENUMS[en].includes(val)) sel.value = val;
  }
}

function magnet(form) {
  const name = form.dataset.magnet;
  if (!name) return;
  let fired = false;
  const fire = () => { if (!fired) { fired = true; track('magnet_start', { magnet: name }); } };
  form.addEventListener('focusin', fire, { once: true });
  form.addEventListener('change', fire, { once: true });
}

export function init() {
  const forms = Array.from(document.querySelectorAll('form[data-form]'));
  if (!forms.length) return;
  const stamp = () => forms.forEach((f) => { const ts = q(f, 'input[name="ts"]'); if (ts) ts.value = String(Date.now()); });
  stamp();
  window.addEventListener('pageshow', stamp);
  forms.forEach((form) => {
    preselect(form);
    magnet(form);
    form.addEventListener('submit', (e) => { e.preventDefault(); submit(form); });
    form.addEventListener('input', () => { const m = q(form, '[data-form-mailto]'); if (m && !m.hidden) m.href = mailtoHref(form, payload(form)); });
    form.addEventListener('lw:mode', (e) => {
      const btn = q(form, '[data-submit]');
      if (btn) btn.textContent = e.detail.mode === 'checkout' ? 'Jetzt buchen' : 'Kostenlos reservieren';
    });
  });
  ready().then(({ up }) => forms.forEach((f) => applyBackendState(f, up)));
}
