/* config.js — zentrale Konstanten der Website.
   Feldnamen, Enums, Fehlercodes und Ereignisnamen gehören dem Schnittstellen-
   Vertrag v1 (docs/CONTRACT.md). Kontingente, Status und Preise kommen nie aus
   dem Frontend, sondern aus GET /config. */

export const API_BASE = 'https://web.service.louwietec.com';
export const ANALYTICS = 'https://analytics.service.louwietec.com';
export const ANALYTICS_WEBSITE_ID = ''; // offen: Website-ID der Umami-Instanz (Session 2)
export const ANALYTICS_DOMAINS = 'louwietec.com,www.louwietec.com';

export const CONTRACT_VERSION = '1.0';
export const HEALTH_TIMEOUT_MS = 2000;

export const CONTACT_EMAIL = 'office@louwietec.com';
export const DEADLINE = '2027-12-02T00:00:00+01:00'; // Nachweispflicht Hochrisiko-KI (EU AI Act)

export const FRAMES_BASE = '/assets/frames/';
export const FRAMES_VERSION = 'v0-dummy';

/* Aufzählungen — wörtlich aus Vertrag §1, beidseitig verbindlich (jede Liste selbst eingefroren) */
const list = (...v) => Object.freeze(v);
export const ENUMS = Object.freeze({
  produkt: list('ledger', 'lens', 'forge'),
  edition: list('starter', 'pro', 'group'),
  betriebsort: list('cloud', 'onprem'),
  anliegen: list('ledger', 'lens', 'forge', 'enterprise', 'investor', 'presse', 'sonstiges'),
  rolle: list('pruefer', 'implementierer', 'kapital', 'sonstiges'),
  branche: list('banking', 'versicherung', 'leasing', 'inkasso', 'gesundheit', 'energie', 'industrie', 'handel', 'dienstleistung', 'oeffentlich', 'sonstige'),
  status: list('reserve', 'deposit', 'live'),
});

/* Fehlercodes — vollständige Liste aus Vertrag §1 (+ NETWORK nur clientseitig) */
export const ERROR_CODES = Object.freeze(['VALIDATION_ERROR', 'SPAM_REJECTED', 'RATE_LIMITED', 'PRODUCT_NOT_LIVE', 'NOT_FOUND', 'INTERNAL', 'NETWORK']);

/* mailto:-Betreffzeilen für den Fallback. „Kontakt“ und „Reservierung …“ sind
   wörtlich aus dem Vertrag; die übrigen sind Vorschläge (Freigabe offen). */
export const MAILTO_SUBJECTS = Object.freeze({
  kontakt: '[LOUWIETEC] Kontakt',
  reserve: '[LOUWIETEC] Reservierung {PRODUKT} {Edition}',
  investoren: '[LOUWIETEC] Investoren & Partner',
  karriere: '[LOUWIETEC] Bewerbung',
  lagereport: '[LOUWIETEC] Lagereport',
  selbstcheck: '[LOUWIETEC] Selbstcheck',
});

export const PRODUCT_NAMES = Object.freeze({ ledger: 'LEDGER', lens: 'LENS', forge: 'FORGE' });
export const EDITION_NAMES = Object.freeze({ starter: 'Starter', pro: 'Pro', group: 'Group' });
