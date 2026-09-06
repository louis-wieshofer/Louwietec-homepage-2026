# Baff-Test — Simulation 2026-09-06

**Simulation, kein Ersatz für echte Fremde.** Drei unabhängige Leseperspektiven ohne Projektkontext haben ausschließlich die Screenshots unter `docs/qa/screens/2026-09-06/` gesehen (ganze Seite als Bild, keine Bewegung, kein Klicken) und die fünf Fragen aus `docs/qa/baff-test.md` beantwortet. Antworten unverändert übernommen; darunter die Einordnung.

## Einordnung der Befunde

| Befund (von wem) | Einordnung | Entscheidung |
|---|---|---|
| „Schwarzer Leerraum nach dem Hero“ (P1, P3) | **Artefakt des Screenshots:** Der Hero klebt mit Bewegung 150 vh lang am Header und zeigt die Punkte-zu-Kette-Animation; im Ganzseiten-Bild erscheint diese Scroll-Strecke als leere Fläche. Beim echten Scrollen und in der stillen Version gibt es die Lücke nicht (verifiziert: `hero-sticky-check`, Screens `start-desktop-reduced.png`). | kein Fix; für echte Tests Live-Seite statt Screenshot verwenden |
| Siegel „VERIFIZIERT“ neben „Beweiskette startet mit den ersten Kunden“ wirkt selbst vergeben, widersprüchlich (P1, P2, P3 — alle drei) | Design-Plan-Element (Abschluss der Beweiskette). Der stärkste gemeinsame Befund. | **Louis:** Siegel mit Aussteller/Bezug versehen (z. B. „VERIFIZIERT · Kette dieser Seite geschlossen“), erst mit erstem Beleg zeigen, oder umbenennen |
| „We make companies unstoppable“ bricht den nüchternen Ton (P1, P2, P3) | Wortgleich aus dem Texte-Dokument (Tagline). | **Louis:** streichen, eindeutschen oder bewusst behalten |
| Konditionen: Group „ab 6.000 €/Monat“ (72.000 €/Jahr) teurer als Enterprise „ab 60.000 €/Jahr“ (P1) | Zahlen wortgleich aus dem Texte-Dokument; für einen Leser widersprüchlich. | **Louis:** Staffel prüfen (Monat vs. Jahr, Bedeutung von „ab“) |
| Datum 02.12.2027 ohne Quelle, „welche Pflicht?“ (P1, P2, P3) | Beleg-Zeichen `ai-act-2027` existiert, Status „Beleg folgt“. | **Louis:** Artefakt (Verordnungstext, Artikel) im Beleg-Register hinterlegen, dann Status `ok` |
| Selbstcheck „Frage n (Text folgt)“ und Statuszeile „Der Dienst ist gerade nicht erreichbar“ (P2, P3) | Inhalte fehlen (Fragen), Backend nicht fertig (Fallback-Text ist Absicht, aber liest sich wie ein Defekt). | **Louis:** zehn Fragen liefern; Vorschlag: Fallback-Zeile neutraler („Senden derzeit per E-Mail“) — Textfreigabe offen |
| ⌖ auf LEDGER nicht erklärt, am Handy schwer zu treffen (P1, P2) | Erklärsatz steht laut Texte-Dokument nur auf der Startseite; Trefffläche im Fließtext war 23 px. | **gefixt:** Trefffläche ≥ 24 px (`.beleg::after`); Erklärung je Seite → Louis (Text) |
| FORGE: Station „einsortiert“ läuft aus dem Rahmen (P3) | Echter Layoutfehler: 4-spaltiges Grid mit langen Mono-Wörtern in schmaler Karte. | **gefixt:** `auto-fit`-Spalten, verifiziert bei 1440/1024/768/390 |
| LEDGER-Hero ohne Button, erster Klickpunkt spät (P1) · Karriere „Werkpartner“ ohne Konditionen (P3) · „Investoren & Partner“ in der Hauptnavigation (P1) · vier CTAs am Ende von FORGE (P3) | Struktur und Wortlaut aus dem Texte-Dokument. | **Louis:** Inhaltsentscheidungen |
| Hash-Textur/Kacheln unlesbar (P1, P2) | Dekorativ, `aria-hidden`, absichtlich kontrastarm. | kein Fix; ggf. Design-Entscheidung |
| „Ändert das an einem Tag“ ohne IT-Aufwand (P1) · keine Referenzen/Zertifikate (P1, P2) | Inhalt. | **Louis** |

## Antworten

### Person 1 · CFO eines mittelständischen Versicherers (DE), Laptop · Screenshots: Start, LEDGER (Desktop)

**1. Worum geht es?**
Eine Wiener Softwarefirma verkauft KI, die „jeden Schritt beweisen“ kann – wahlweise in ihrer EU-Cloud oder bei uns im Haus. Ob ich Software, Beratung oder drei verschiedene Dinge kaufe, weiß ich nach 20 Sekunden nicht. „We make companies unstoppable“ hilft mir dabei nicht.

**2. Für wen?**
Nach dem ersten Scrollen: für niemanden – erst kommen eineinhalb Bildschirme Schwarz. Zwei Scrolls später: für Firmen, die KI nutzen und Revision, Wirtschaftsprüfer, Aufsicht fürchten. Klar wird es erst im letzten Drittel der LEDGER-Seite: Vorstand mit Haftung, Compliance, Risk, Interne Revision. Das bin ich – steht aber zu weit unten.

**3. Der Satz, der bleibt**
„Die Logs Ihrer KI gehören heute Ihrem KI-Anbieter – nicht Ihnen.“ Den leite ich noch heute an unsere IT weiter – mit Fragezeichen.

**4. Was ich klicke**
Startseite: „LEDGER“ in der Navigation – dort stehen Revision und Aufsicht, mein Terrain. LEDGER-Seite: das ⌖ hinter „02.12.2027“, weil meine Compliance mir einen anderen Termin genannt hat. Dann „Über uns“: „Beweiskette startet mit den ersten Kunden“ heißt null Kunden. Bevor ich einen fünfstelligen Jahresbetrag und eine Ausgliederung an einen Neuling verantworte, will ich wissen, wer dahintersteht und ob es die Firma 2028 noch gibt. „Erstanwender-Platz reservieren“ nicht – ein Versicherer ist kein Versuchskaninchen. Den Selbstcheck leite ich an die Compliance weiter.

**5. Gestört, verwirrt, gelangweilt**
– Schwarzer Leerraum nach dem Startseiten-Hero: „Ist die Seite kaputt?“
– LEDGER-Hero ohne Button; der erste Klickpunkt kommt nach fünf Bildschirmen.
– Konditionen: Enterprise „ab 60.000 €/Jahr“ ist billiger als Group „ab 6.000 €/Monat“ (72.000 €). Tippfehler, oder ich verstehe die Staffel nicht.
– „Wir verkaufen Beweise“ – aber die Beweiskette ist leer.
– SHA-256, Air-Gap, Mandanten, API, Verifier, Artefakt; graue Hash-Zeilen, die ich weder lesen kann noch will.
– „Ändert das an einem Tag“ – kein Wort, was unsere IT dafür tun muss.
– „Investoren & Partner“ in der Hauptnavigation klingt nach Startup auf Geldsuche. Keine Namen, keine Zertifikate (ISO 27001), keine Referenz, kein Wort zur BaFin.
– Farben und Kontrast in Ordnung; der Fließtext unter der Riesenüberschrift ist zu klein.

**Siegel, ⌖, Countdown**
Siegel: Startseite ehrlich nein – am Leerraum wäre ich weg oder per Navigation weiter. LEDGER ja, bis zu den Konditionen, weil ich Preise gesucht habe. Und wenn ich „VERIFIZIERT“ sehe: von wem? Auf einer Seite, die „Glauben Sie uns nichts“ sagt, ist ein Eigenstempel ein Eigentor.
⌖: Einmal, beim Datum. Ohne den Erklärsatz auf der Startseite hätte ich es für ein Fußnotenzeichen gehalten; auf LEDGER wird es nicht erklärt.
Countdown: Nicht zu übersehen. Für mich: Frist für Hochrisiko-KI – unsere Tarifierungsmodelle könnten betroffen sein, also relevant. Aber es ist Angstmarketing auf den Tag genau, der Termin widerspricht dem, was ich kenne, und die Seite vermischt „jede KI-Nutzung“ mit „Hochrisiko-KI“ – das meiste bei uns ist keins.

**Drei Änderungen**
1. Startseite: Leerraum unter den Hero-Buttons streichen; „Zwischen Können und Vertrauen klafft eine Lücke“ muss direkt folgen – sonst glaubt der Leser an einen Fehler.
2. LEDGER-Hero: Button „Konditionen“ und den Satz „Für die Person, die haftet …“ direkt unter die Überschrift – ein CFO liest oben und bei den Preisen, den Rest liest die Compliance.
3. Konditionen: Zeilen Group/Enterprise korrigieren oder erklären (Monat vs. Jahr, was heißt „ab“) – wer mir bei der Preistabelle Zweifel gibt, verliert mich bei allem anderen.

### Person 2 · Leiterin Innenrevision/Compliance, Regionalbank (AT), Smartphone · Screenshots: Start, Kostenlos (Mobil)

**1. Worum geht es?** Eine Wiener Softwarefirma baut KI-Systeme, die man prüfen kann – „jeden Schritt beweisen". Verstanden habe ich: KI mit Nachweis. Was ich konkret kaufen würde, weiß ich nach 20 Sekunden nicht.

**2. Für wen?** Für Unternehmen, die KI einsetzen und dafür haften – Geschäftsführung, Compliance, Revision. Also im Prinzip für mich. Branche unklar; Bankenspezifisches sehe ich nicht.

**3. Der Satz:** „Glauben Sie uns nicht. Prüfen Sie." Und das Bild „Der Flugschreiber für Ihre KI" bleibt.

**4. Klicken:** „Zu LEDGER". Ein manipulationssicheres Protokoll jeder KI-Nutzung ist genau das, was ich FMA und Wirtschaftsprüfer vorlegen müsste. „Gespräch anfragen" klicke ich nicht – zu früh, ich kenne Sie nicht.

**5. Gestört:**
- Die Seite ist am Handy endlos (rund 16 Bildschirme). Nach dem dritten Produkt scrolle ich nur noch.
- „We make companies unstoppable" – englischer Werbespruch mitten in nüchternem Deutsch. Passt nicht.
- Die Hash-Kacheln („4a14…6e68", „VORSCHAU · BEISPIELDATEN") sagen mir nichts. Kleine Monospace-Schrift, am Handy kaum lesbar.
- Keine Kunden, keine Referenzen, keine Namen. „Beweiskette startet mit dem ersten Kunden" heißt: Es gibt noch keinen.
- „Dezember 2027" – welche Pflicht ist gemeint? Für uns als Bank ist Kreditscoring Hochrisiko, und Artikel 4 gilt längst. Mir fehlt die Quelle.
- „Geld-zurück, monatlich kündbar" – wofür? Ich sehe keinen Preis.
- Kostenlos-Seite: zehnmal „Frage 1 (Text folgt)", dazu „Der Dienst ist gerade nicht erreichbar". Verifier: „in Arbeit". Das ist eine Baustelle, keine Seite.

**Siegel erreicht?** Ja, ich bin unten angekommen. Der grüne Stempel „VERIFIZIERT" irritiert mich aber: Verifiziert was, von wem? Ein selbst vergebenes Siegel neben einer leeren Beweiskette ist genau die Behauptung, vor der Sie selbst warnen.

**⌖ antippen?** Ja, einmal, aus Berufsneugier – bei „Antwort in 24 Stunden ⌖". Steht dahinter ein echtes Artefakt, steigt mein Vertrauen. Steht „in Arbeit", ist es weg. Das Zeichen ist am Handy winzig; ich treffe es vermutlich nicht beim ersten Versuch.

**Zahl/Countdown?** Einen Countdown habe ich nicht gesehen. Aufgefallen ist mir nur „Dezember 2027" im Fließtext. Für mich heißt das: kein akuter Druck – aber ich würde die Datumsangabe intern prüfen lassen, bevor ich sie weitergebe.

**Selbstcheck ausfüllen?** Nein. Die Fragen fehlen, der Versand funktioniert nicht, und Firma plus E-Mail gebe ich in der U-Bahn keinem unbekannten Start-up. Mit echten Fragen und Ergebnis direkt auf der Seite, ohne E-Mail-Pflicht: ja, drei Minuten habe ich.

**Drei Änderungen:**
1. „We make companies unstoppable." streichen oder eindeutschen – der Spruch untergräbt den seriösen Ton, der die eigentliche Stärke der Seite ist.
2. Stempel „VERIFIZIERT" entfernen, solange „Beweiskette startet mit dem ersten Kunden" daneben steht – ein Prüfer sieht darin einen Widerspruch, keinen Beleg.
3. Den Selbstcheck mit „Frage 1 (Text folgt)" offline nehmen oder die zehn Fragen wenigstens als Text zeigen – ein leeres Formular mit Fehlermeldung wirkt unfertiger als gar keins.

### Person 3 · Softwareentwickler, Leasing-Unternehmen, großer Monitor · Screenshots: Start, FORGE, Karriere (Desktop)

**1. Worum geht es?** Eine Wiener Firma verkauft KI-Software für Unternehmen und verspricht Nachvollziehbarkeit, EU-Cloud oder On-Prem. Was die Software konkret tut, weiß ich nach 20 Sekunden nicht. „We make companies unstoppable“ überspringe ich reflexartig.

**2. Für wen?** Mittelständler, die KI einsetzen und irgendwann Prüfern nachweisen müssen, was sie damit getan haben. Zielperson ist Geschäftsführung/Compliance, nicht ich.

**3. Der Satz:** „Glauben Sie uns nichts. Prüfen Sie uns.“

**4. Klicken:** FORGE, weil „14 Tage, Festpreis, Abnahme gegen Testfälle“ eine konkrete, prüfbare Behauptung ist. Danach das ⌖.

**5. Gestört:**
- Nach dem Hero ein riesiges schwarzes Loch, fast ein ganzer Bildschirm Nichts. Ich dachte, die Seite sei kaputt oder zu Ende.
- „Beweiskette“ zeigt Hash-Fragmente, darunter „startet mit den ersten Kunden“. Also null Kunden, null Beweise – aber ein grünes „VERIFIZIERT“-Siegel. Verifiziert von wem?
- Alle „Demos“ sind Mini-Grafiken mit Stempel „VORSCHAU · BEISPIELDATEN“. Illustrationen, keine Demos. Auf FORGE läuft die erste Karte („EINSORTIERT“) aus dem Rahmen.
- FORGE endet mit vier verschiedenen Buttons in zwei Reihen. Welcher ist der richtige?
- Layout springt: Katalog linksbündig, „Warum das funktioniert“ als schmale eingerückte Spalte, Karriere-Formular wieder woanders.
- Karriere: „Der Dienst ist gerade nicht erreichbar“ unter dem Formular. Eine Seite, die mit Beweisen wirbt, zeigt ein sichtbar kaputtes Formular.
- Positiv: Preistabelle ist konkret. „KI im Käfig“ verstehe ich sofort.

**Siegel erreicht?** Ja – aber nur, weil ich testhalber durchgescrollt habe; das schwarze Loch hätte mich real rausgeworfen. Das Siegel wirkt wie Deko.

**⌖ anklicken?** Ja. Genau deshalb ist es riskant, wenn dahinter „in Arbeit“ steht. Erklärt wird das Zeichen erst weit unten, nicht dort, wo es im Hero zuerst auftaucht.

**Zahl/Countdown:** „Dezember 2027 ⌖“ im Hero habe ich gesehen. Welches Gesetz? Steht nicht da. Bei uns im Leasing wäre das vermutlich relevant, aber ohne Namen der Verordnung ist es Drohkulisse, kein Argument. „14 ⌖ Tage“ auf FORGE ist dagegen greifbar.

**Bewerben?** Nein. „Werkpartner, projektbasiert zuerst, fest, sobald es trägt“ heißt für mich: Freelancer ohne Gehalt, ohne Beteiligung, ohne Tagessatz. „Mitgründen statt mitarbeiten“ ohne Anteile ist eine Floskel. Technisch erfahre ich nur „Python/Container“. „Zeig uns etwas, das du gebaut hast“ gefällt mir – der Rest nicht.

**Drei Änderungen:**
1. Das leere Schwarz unter dem Hero streichen oder füllen – nach 900 px sieht die Startseite aus, als wäre sie vorbei.
2. „VERIFIZIERT“-Siegel entfernen oder mit Aussteller, Datum und Link versehen – ein Siegel ohne Prüfer ist genau die Behauptung ohne Beleg, gegen die die Seite antritt.
3. Karriere: „Werkpartner … projektbasiert“ durch echte Konditionen ersetzen (Tagessatz-Range, Umfang, Beteiligung ja/nein) und den Hinweis „Dienst nicht erreichbar“ entfernen – entweder das Formular funktioniert, oder es steht nur die Mailadresse da.
