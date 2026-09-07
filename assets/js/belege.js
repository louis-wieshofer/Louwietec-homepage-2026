/* belege.js — Register der Beleg-Zeichen ⌖. Jede Zahl, die eine Behauptung ist, trägt eine ID.
   Status: "folgt" (kein Artefakt) · "arbeit" · "ok" (Quelle geprüft, Marke wird grün, nur auf Tinte).
   Gespiegelt in docs/belege.md. Nichts hier ist erfunden: Rechtsquellen sind am Verordnungstext geprüft,
   eigene Zusagen bleiben „Beleg folgt“, bis eine Messreihe existiert. Stand der Rechtsprüfung: 2026-09-07. */

export const BELEGE = Object.freeze({
  'antwort-24h': {
    titel: 'Antwort in 24 Stunden',
    status: 'folgt',
    artefakt: '',
    hinweis: 'Eigene Zusage, noch ohne Messreihe. Gemessen wird ab der ersten Anfrage über diese Website: Zeit zwischen Eingang und erster inhaltlicher Antwort, Median und schlechtester Wert, monatlich veröffentlicht.',
  },
  'ai-act-2027': {
    titel: 'Nachweispflicht ab 02.12.2027 (EU AI Act)',
    status: 'ok',
    artefakt: 'https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX%3A32026R1744',
    hinweis: 'Verordnung (EU) 2024/1689 (KI-Verordnung), Artikel 113 Buchstabe c in der Fassung der Verordnung (EU) 2026/1744 („Digital Omnibus“ zur KI) vom 8. Juli 2026, Amtsblatt L, 2026/1744 vom 24.07.2026, in Kraft seit 27.07.2026. Kapitel III Abschnitte 1 bis 3 (Einstufung, Anforderungen an Hochrisiko-Systeme und Pflichten ihrer Betreiber) gelten ab 02.12.2027 für Systeme nach Artikel 6 Absatz 2 in Verbindung mit Anhang III; für Systeme nach Anhang I ab 02.08.2028. Ursprünglich war der 02.08.2026 vorgesehen.',
  },
  'betreiberpflichten': {
    titel: 'Pflichten der Betreiber: Protokolle, Aufsicht, Überwachung',
    status: 'ok',
    artefakt: 'https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX%3A32024R1689',
    hinweis: 'Verordnung (EU) 2024/1689, Artikel 26. Absatz 2 verlangt menschliche Aufsicht durch natürliche Personen mit der erforderlichen Kompetenz, Schulung und Befugnis. Absatz 5 verlangt die Überwachung des Betriebs anhand der Betriebsanleitung samt Meldung schwerwiegender Vorfälle. Absatz 6 verlangt die Aufbewahrung der automatisch erzeugten Protokolle, mindestens sechs Monate, soweit nicht anderes Unions- oder nationales Recht gilt.',
  },
  'countdown-2027': {
    titel: 'Tage bis zum 02.12.2027',
    status: 'ok',
    artefakt: 'https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX%3A32026R1744',
    hinweis: 'Rechnung im Browser: Kalendertage zwischen heute und dem 02.12.2027, 00:00 Uhr MEZ, aufgerundet. Das Datum stammt aus Artikel 113 Buchstabe c der KI-Verordnung in der Fassung der Verordnung (EU) 2026/1744. Ohne JavaScript steht die im Markup hinterlegte Zahl.',
  },
  'bussgeld': {
    titel: 'Bußgeldrahmen der KI-Verordnung',
    status: 'ok',
    artefakt: 'https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX%3A32024R1689',
    hinweis: 'Verordnung (EU) 2024/1689, Artikel 99: bis 35 Mio. Euro oder 7 % des weltweiten Jahresumsatzes bei verbotenen Praktiken (Absatz 3); bis 15 Mio. Euro oder 3 % bei Verstößen gegen Pflichten von Anbietern, Betreibern, Einführern und Händlern (Absatz 4); bis 7,5 Mio. Euro oder 1 % bei falschen oder irreführenden Auskünften (Absatz 5). Maßgeblich ist jeweils der höhere Betrag; für kleine und mittlere Unternehmen der niedrigere.',
  },
  '14-tage': {
    titel: 'Lieferzeit 14 Tage',
    status: 'folgt',
    artefakt: '',
    hinweis: 'Eigene Zusage, noch ohne Nachweis. Beleg wird das Abnahmeprotokoll der ersten Automaten: Datum der Beauftragung, Datum der Abnahme, bestandene Testfälle.',
  },
  '10-fragen': {
    titel: 'Zehn Fragen',
    status: 'folgt',
    artefakt: '',
    hinweis: 'Der Fragenkatalog des Selbstchecks wird mit der Freigabe veröffentlicht; bis dahin stehen im Formular Platzhalter.',
  },
  '3-minuten': {
    titel: 'Drei Minuten',
    status: 'folgt',
    artefakt: '',
    hinweis: 'Eigene Schätzung, noch ohne Messung. Beleg wird der Median der Bearbeitungszeit, gemessen ab Veröffentlichung des Selbstchecks.',
  },
});

export const STATUS_TEXT = Object.freeze({ folgt: 'Beleg folgt', arbeit: 'in Arbeit', ok: 'Quelle geprüft' });
