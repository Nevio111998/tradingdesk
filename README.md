# FX EdgeFinder Companion v5.4.7 – Schritt 6

Dieses Update baut auf v5.4.6 auf und vervollständigt die Regel:
Nur fehlende/ungültige Zahlen, unklare Einheiten oder wirklich nicht
vergleichbare Horizonte und Berechnungsgrundlagen verhindern eine
automatische relative Berechnung.

## Änderungen

- Relatives Repricing: Base-Wochenänderung minus Quote-Wochenänderung (bp).
  Fehlende optionale Metadaten und unterschiedliche Methoden führen zu einem
  indikativen Ergebnis, nicht zu einer generellen Rechensperre.
- Neuer optionaler Einheitenstatus für die Erwartungsänderung. Die bestehende
  Eingabe ist weiterhin in bp; bisherige Datensätze ohne Einheitenstatus
  behalten diesen Vertrag. Explizit unklare/abweichende Einheiten blockieren,
  bis der Quellenwert umgerechnet oder die Einheit korrekt geklärt ist.
- Horizonte: 12M/1Y und andere gleichwertige eindeutige Schreibweisen werden
  erkannt. 3M gegen 12M, unbekannte Platzhalter und undatierte „nächste
  Sitzung“ werden nicht automatisch gleichgesetzt. Konkrete datierte Meetings
  und eindeutig bezeichnete benutzerdefinierte Zeiträume bleiben möglich.
- Manuelle Overrides bleiben erhalten und werden nur verwendet, wenn die
  automatische Berechnung nicht möglich ist. Ein numerischer Wert in bp und
  eine Begründung sind erforderlich. Die Anzeige „Manuell begründet“ macht
  die Herkunft sichtbar; der ursprüngliche Blockierungsgrund bleibt erhalten.
  Gültige automatische Werte haben Vorrang vor alten manuellen Eingaben.
- Erwartete 3M-/12M-Leitzins-Differentiale verwenden weiterhin die unveränderte
  Formel: 100 × (Leitzins Base − Leitzins Quote) + Pricing Base − Pricing Quote.
  Beide Horizonte werden unabhängig geprüft. Unterschiedliche Referenzraten
  und Forward-Proxys bleiben indikativ.
- Real Yield: fehlende oder unklare Methodentexte führen zu einem indikativen
  Vergleich. Eindeutig unterschiedliche Berechnungsgrundlagen (beispielsweise
  Leitzins − CPI YoY gegen TIPS-Realrendite) sowie explizit inkompatible
  Inflationsdefinitionen/Zeiträume werden nicht automatisch vermischt.
  Die Schnellansicht in Währungen & Rates nutzt dieselbe Prüfung.

## Grenzen

Die App überprüft keine externen Kurven, Kontrakte oder Marktdaten live.
Ein indikatives Ergebnis ist keine Bestätigung, dass die wirtschaftlichen
Definitionen tatsächlich identisch sind. Die Feld-Einheiten bleiben fest:
Leitzinsen/2Y/Real Yield in Prozent, kumulierte Pricings und Repricing in bp.
Abweichende Quellenwerte müssen vor der Eingabe umgerechnet werden.
Der manuelle Override ist eine dokumentierte Nutzerentscheidung, keine
automatische Verifikation. Die Ereignis- und Stichtagswarnungen aus Schritt 5
bleiben bestehen.

## Daten und Update

Alle vorhandenen Eingabefelder, Wahrscheinlichkeiten, Metadaten,
Paar-Analysen, manuellen Werte, Checklisten und unbekannten älteren Felder
bleiben erhalten. Die IndexedDB fx-trade-desk mit Schema 1 ist unverändert;
es gibt keine Lösch- oder Reset-Migration. Explizit geleerte
Real-Yield-Definitionen werden nicht stillschweigend überschrieben.

Vor dem Update nach Möglichkeit ein JSON-Backup exportieren. Den gesamten
ZIP-Inhalt in das bestehende GitHub-Repository hochladen und index.html
ersetzen. Alte versionierte Dateien dürfen bleiben. Nach erfolgreichem
Pages-Deployment neu laden. Oben links müssen v5.4.7 und
„Code geladen · v5.4.7“ erscheinen. Keine Website-Daten löschen.

## Tests

Der echte JavaScript-Code wurde in einem isolierten Runtime-Harness geprüft:
EURUSD, AUDCAD, GBPJPY und alle 21 G7-Paare, Vorzeichen, Null-/Negativwerte,
Dezimalzahlen, fehlende Zahlen, Einheiten, 3M/12M und benutzerdefinierte
Horizonte, indikative Methoden, manuelle Overrides, echte Real-Yield-
Inkompatibilitäten, 2Y-Werte, Referenzraten und Ereigniswarnungen.
Die Speicherprüfung umfasst alle vorhandenen Datensatzfelder und neue
Einheitenangaben. Ein zusätzlicher deterministischer Smoke-Test führt
das echte init() aus und öffnet die Währungs- und Paar-Ansichten mit einer
simulierten DOM/IndexedDB-Umgebung.

Ein visueller Chromium-End-to-End-Test war wegen einer Navigationssperre
der Testumgebung nicht möglich und wird nicht als bestanden ausgewiesen.
