# Beleg-Register (⌖)

Jede Zahl, die eine Behauptung ist, trägt auf der Website ein Beleg-Zeichen. Ein Klick zeigt das Kärtchen mit
Titel, Status, Fundstelle und, wo vorhanden, dem Weg zum Original. Solange kein Nachweis existiert, steht ehrlich
„Beleg folgt“. Quelle der Wahrheit für die Website ist `assets/js/belege.js`; diese Tabelle spiegelt sie.

**Status:** `Quelle geprüft` (Fundstelle am Originaltext nachgelesen, Marke wird grün) · `in Arbeit` ·
`Beleg folgt` (eigene Zusage ohne Messreihe oder Artefakt).

| ID | Zahl / Behauptung | Wo | Status | Fundstelle |
|---|---|---|---|---|
| `ai-act-2027` | Nachweispflicht ab 02.12.2027 | Start (Vertrauenslücke), LEDGER (Countdown), Investoren (These) | Quelle geprüft | Verordnung (EU) 2024/1689, Artikel 113 Buchstabe c in der Fassung der Verordnung (EU) 2026/1744 |
| `betreiberpflichten` | Protokolle aufbewahren, menschliche Aufsicht nachweisen, Betrieb überwachen | LEDGER (Raum-Intro) | Quelle geprüft | Verordnung (EU) 2024/1689, Artikel 26 Absätze 2, 5 und 6 |
| `bussgeld` | „Bußgeldkatalog“ als Preis der Alternative | FAQ (Preis-Einwand) | Quelle geprüft | Verordnung (EU) 2024/1689, Artikel 99 Absätze 3, 4 und 5 |
| `countdown-2027` | Tage bis zum 02.12.2027 | LEDGER (Countdown) | Quelle geprüft | Rechnung im Browser (`countdown.js`), Datum aus Artikel 113 Buchstabe c |
| `antwort-24h` | Antwort in 24 Stunden | Start (Vertrauens-Zeile), FORGE (Betrieb), Kontakt (H1) | Beleg folgt | eigene Zusage; Messreihe startet mit der ersten Anfrage über diese Website |
| `14-tage` | Lieferzeit 14 Tage | FORGE (H1) | Beleg folgt | eigene Zusage; Beleg wird das Abnahmeprotokoll der ersten Automaten |
| `10-fragen` | Zehn Fragen | Kostenlos (Selbstcheck) | Beleg folgt | Fragenkatalog wird mit der Freigabe veröffentlicht |
| `3-minuten` | Drei Minuten | Kostenlos (Selbstcheck) | Beleg folgt | eigene Schätzung; Beleg wird der Median der Bearbeitungszeit |

## Rechtsquellen im Einzelnen

Geprüft am 2026-09-07 gegen den Verordnungstext. Verlinkt wird jeweils die stabile EUR-Lex-Adresse.

### Frist 02.12.2027
**Verordnung (EU) 2024/1689** (KI-Verordnung, „AI Act“), Artikel 113 Buchstabe c, **in der Fassung der
Verordnung (EU) 2026/1744** („Digital Omnibus“ zur KI) vom 8. Juli 2026, Amtsblatt L, 2026/1744 vom 24.07.2026,
in Kraft seit 27.07.2026.
Kapitel III Abschnitte 1 bis 3 (Einstufung, Anforderungen an Hochrisiko-Systeme und Pflichten ihrer Betreiber)
gelten ab **02.12.2027** für Systeme nach Artikel 6 Absatz 2 in Verbindung mit **Anhang III**; für Systeme nach
Artikel 6 Absatz 1 in Verbindung mit **Anhang I** ab **02.08.2028**. Ursprünglich war der 02.08.2026 vorgesehen;
die Änderungsverordnung hat die Frist um sechzehn Monate verschoben.
<https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX%3A32026R1744>

### Betreiberpflichten
**Verordnung (EU) 2024/1689, Artikel 26** (Pflichten der Betreiber von Hochrisiko-KI-Systemen):
Absatz 2 verlangt menschliche Aufsicht durch natürliche Personen mit der erforderlichen Kompetenz, Schulung und
Befugnis. Absatz 5 verlangt die Überwachung des Betriebs anhand der Betriebsanleitung samt Meldung
schwerwiegender Vorfälle. Absatz 6 verlangt die Aufbewahrung der automatisch erzeugten Protokolle, mindestens
sechs Monate, soweit nicht anderes Unions- oder nationales Recht gilt.
<https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX%3A32024R1689>

### Bußgeldrahmen
**Verordnung (EU) 2024/1689, Artikel 99:** bis 35 Mio. Euro oder 7 % des weltweiten Jahresumsatzes bei
verbotenen Praktiken (Absatz 3); bis 15 Mio. Euro oder 3 % bei Verstößen gegen Pflichten von Anbietern,
Betreibern, Einführern und Händlern (Absatz 4); bis 7,5 Mio. Euro oder 1 % bei falschen oder irreführenden
Auskünften (Absatz 5). Maßgeblich ist jeweils der höhere Betrag; für kleine und mittlere Unternehmen der
niedrigere.
<https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX%3A32024R1689>

## Was diese Belege nicht behaupten

Die Frist 02.12.2027 gilt für **Hochrisiko-Systeme nach Anhang III**, nicht für jede KI-Nutzung. Für Systeme nach
Anhang I gilt der 02.08.2028. Unabhängig davon gelten bereits heute: das Verbot bestimmter Praktiken und die
Pflicht zur KI-Kompetenz (seit 02.02.2025) sowie die Regeln für KI-Modelle mit allgemeinem Verwendungszweck
(seit 02.08.2025). Die Einstufung des eigenen Systems ist eine Rechtsfrage und bleibt Sache des Unternehmens und
seiner Beratung; die Website ersetzt keine Rechtsberatung (siehe Abgrenzungsabsatz auf der LEDGER-Seite).

Nicht mit Beleg-Zeichen versehen: Preise und Konditionen (Angebote, keine Behauptungen), Zahlen in Beispiel-
Demonstrationen (als „Vorschau · Beispieldaten“ beschriftet), Datumsangaben in Fußzeilen.
Verifiziert-Grün erscheint an einer Marke nur im Status „Quelle geprüft“ und nur auf Tinte (Bühne, Popover,
Demo-Bühne).
