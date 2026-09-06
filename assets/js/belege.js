/* belege.js — Register der Beleg-Zeichen ⌖. Jede Zahl, die eine Behauptung ist, trägt eine ID.
   Status: "folgt" (Standard bis das Artefakt existiert) · "arbeit" · "ok" (Artefakt verlinkt, Marke wird grün — nur auf Tinte).
   Gespiegelt in docs/belege.md. Nichts hier ist erfunden: solange kein Artefakt existiert, steht „Beleg folgt“. */

export const BELEGE = Object.freeze({
  'antwort-24h':   { titel: 'Antwort in 24 Stunden', status: 'folgt', artefakt: '', hinweis: 'Messreihe startet mit der ersten Anfrage über diese Website.' },
  'ai-act-2027':   { titel: 'Nachweispflicht ab 02.12.2027 (EU AI Act)', status: 'folgt', artefakt: '', hinweis: 'Quellenangabe (Verordnung, Artikel) wird ergänzt.' },
  'countdown-2027':{ titel: 'Tage bis zum 02.12.2027', status: 'ok', artefakt: '', hinweis: 'Rechnung: Kalendertage zwischen heute und dem 02.12.2027, im Browser berechnet.' },
  '14-tage':       { titel: 'Lieferzeit 14 Tage', status: 'folgt', artefakt: '', hinweis: 'Belegt durch Abnahmeprotokolle der ersten Automaten.' },
  '10-fragen':     { titel: 'Zehn Fragen', status: 'folgt', artefakt: '', hinweis: 'Fragenkatalog des Selbstchecks wird veröffentlicht.' },
  '3-minuten':     { titel: 'Drei Minuten', status: 'folgt', artefakt: '', hinweis: 'Median der Bearbeitungszeit, gemessen ab Veröffentlichung des Selbstchecks.' },
});

export const STATUS_TEXT = Object.freeze({ folgt: 'Beleg folgt', arbeit: 'in Arbeit', ok: 'Beleg vorhanden' });
