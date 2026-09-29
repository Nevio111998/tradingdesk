# FX EdgeFinder Companion v5.6.19

Lokales Zusatztool zu EdgeFinder für acht Währungen, 28 FX-Paare,
Morgenanalysen, Trade-Planung und Journal. Daten werden im Browser über
IndexedDB gespeichert. GitHub Pages speichert keine persönlichen Analysen.

## v5.6.19 – Schlankere Formulare

Entfernt: Gesamtfazit und weitere Notizen im Morgenüberblick; Trade-These, Pip-Wert/Lots-Schätzung, Kosten- und Managementfelder, technisches Setup und Exposure/Prop-Regeln in Trade-Ideen. Zugehörige Readiness-, Risk-Gate- und Checklistenpflichten entfallen ebenso wie die technische Faktorbewertung. Die vier fundamentalen Faktoren und Edge Analytics bleiben erhalten. Gespeicherte historische Werte und Snapshots werden nicht gelöscht oder migriert.

## v5.6.18 – Edge Analytics

Die bestehende Auswertung wird erweitert, ohne bestehende Einträge umzuschreiben:

- Confidence: High / Medium / Low und „Keine Daten“, ausschliesslich aus dem
  Entry-Snapshot. Confidence aus alten v5.6.17-Snapshots bleibt auswertbar.
- Long Currency / Short Currency aus Paar und Richtung. AUDNZD Short bedeutet
  Long NZD / Short AUD. Pro Tabelle wird jeder Trade einmal gezählt; die beiden
  Tabellen dürfen nicht addiert werden.
- Einzelbewertungen für EdgeFinder, Rates, Market Driver und Risk sowie vier
  Kombinationen: EdgeFinder + Rates, Rates + Market Driver, Rates + Risk,
  EdgeFinder + Rates + Market Driver. Keine automatischen Empfehlungen.
- Tabellen zeigen Trades insgesamt, Sample mit R, fehlende Ergebnisse, Win Rate,
  Ø R, Gesamt-R, Profit Factor und historische Expectancy. Die Übersicht zeigt
  zusätzlich Ø Gewinner und Ø Verlierer. Expectancy ist der empirische Ø R,
  keine zusätzliche unabhängige Kennzahl. Break-even zählt im Nenner mit.
- Kumulative R-Kurve bleibt erhalten; zusätzliche negative Drawdown-Kurve
  (R-Summe minus bisheriger Höchststand). Beide starten bei 0 in der aktuellen
  Filterauswahl, berücksichtigen ausschliesslich datierte Abschlüsse und bilden
  weder offene Buchverluste noch einen Konto-Drawdown ab.
- Filter: Paar, Richtung, Abschlusszeitraum, Confidence, Long/Short Currency und
  alle vier Faktorbewertungen. „Keine Daten“ ist gezielt auswählbar. Verworfene
  Ideen bleiben vom Abschlusszeitraum unabhängig; alle anderen Filter gelten.
- Unter 5 Ergebnissen wird eine Gruppe als sehr klein markiert, unter 20 als
  klein. Dies ist eine Orientierung und kein Signifikanztest. Grössere Gruppen
  beweisen ebenfalls keinen kausalen Vorteil eines Filters.

### Zusätzliche Entry-Werte

Beim ersten Wechsel auf **Offen** bleiben `analyticsEntry.version: 1`, der
Zeitpunkt und alle bisherigen Felder erhalten. Neue Snapshots ergänzen optional
`detailsVersion: 1` und `fundamentals`. Bereits existierende Snapshots werden
niemals nachträglich ergänzt, auch wenn der Trade heute mehr Felder enthält.

| Trade-Feld | Zusätzlich eingefrorener Wert |
| --- | --- |
| `edgeBase`, `edgeQuote` | EdgeFinder Base-/Quote-Bias |
| `edgeScoreBase`, `edgeScoreQuote` | Einzelwerte und Differenz Base minus Quote, nur wenn beide vorhanden |
| `yieldBase`, `yieldQuote` | Base-/Quote-2Y in %, Spread in bp = (Base − Quote) × 100 |
| `yieldPrev`, `yieldPrev2` | Bereits vorhandener Spread vor 1W / 2W in bp |
| `driverMain`, `riskRegime` | Vorhandener Driver-Text und Risk-Regime |
| `factors`, `fields.confidence` | Weiterhin vorhandene Faktorbewertungen und Confidence |

Es werden nur beim Öffnen vorhandene Trade-Felder gelesen, keine späteren
Morgenanalysen oder Live-Werte. Leere/unbekannte Werte bleiben null beziehungsweise
„Keine Daten“; echte Nullen bleiben erhalten. Vorhandene Felder können in der
Trade-Checkliste gepflegt werden, Bewertungen und Confidence in der Trade-Übersicht.
Details sind unter „Ergebnisse nachvollziehen → Historische Entry-Werte ansehen“
pro Trade aufklappbar. Weitere Faktortabellen betrachten Base-/Quote-Bias und das
Vorzeichen von Score-/2Y-Differenzen sowie 1W-Spread-Veränderung in Handelsrichtung.

Bestehende R-Ergebnisse, v5.6.17-Snapshots, IndexedDB, Bilder und Backups bleiben
kompatibel, ohne Migration. Neue Tests decken alte/neue Snapshots, unveränderliche
Werte, fehlende Daten, Exposure, alle Filter, Kombinationen, Kennzahlen,
Drawdown-/Zeitsortierung und Backup-Import ab. Eine visuelle Browserprüfung bleibt
in dieser Umgebung offen (Browser-Download bereits in v5.6.17 fehlgeschlagen).

## v5.6.17 – Journal-Auswertung

Der neue Menüpunkt **Auswertung** nutzt bestehende lokale Trade-Datensätze:

- Anzahl geschlossener Trades, Summe und Durchschnitt realisierter R,
  Trefferquote (Gewinne / alle Ergebnisse inklusive Break-even), Profitfaktor
  auf R-Basis und maximaler Rückgang der kumulierten realisierten R.
- Verlauf nach Abschlussdatum, Filter nach Paar, Richtung und Abschlusszeitraum.
  Fehlende oder ungültige Ergebnisse sind kein Null-Trade. Ohne Verlust-R ist
  der Profitfaktor nicht berechenbar. Der R-Rückgang ist kein Konto-Drawdown.
- Gruppenvergleich EdgeFinder/Rates sowie Paar/Richtung; Stichprobengrösse und
  fehlende Ergebnisse bleiben sichtbar. Gruppenvergleiche sind beschreibend,
  keine kausale Erfolgsprüfung eines Filters.
- Beim ersten Statuswechsel von einer Idee zu **Offen** werden Paar, Richtung,
  fundamentale Bewertungen und Confidence in `analyticsEntry` festgehalten.
  Spätere Faktoränderungen überschreiben diesen Stand nicht. Paar-/Richtungs-
  Änderungen machen ihn für die Gruppenzuordnung unpassend. Beim Duplizieren
  wird er entfernt. Historische oder direkt geschlossen erfasste Trades erhalten
  keinen nachträglich erfundenen Bewertungsstand; ihre Ergebnisse zählen weiter.
- Verworfene Trade-Ideen erscheinen separat, ohne hypothetisches Ergebnis.
  Im Journal kann ein Ablehnungsgrund ergänzt werden. Diese Übersicht folgt
  Paar/Richtung, aber nicht dem Abschlusszeitraum. Verworfene Paarbewertungen
  aus Tagesanalysen werden nicht als eigene Trades gezählt.
- Bestehende Datensätze, Bilder und Backups bleiben kompatibel. Keine Migration,
  neue Datenbank, Marktdatenabfrage oder Cloud-Speicherung.

`analytics.v5.6.19.js` enthält die read-only Auswertung und das Festhalten der
Bewertungen; die Navigation und Statuswechsel bleiben im aktiven Core.
Die automatisierten Tests prüfen Zahlen, Datumsfilter, fehlende Werte,
Bestandsdaten, Statuswechsel, Duplikate, Speicherung und HTML-Escaping.
Eine echte Desktop-/Mobil-Sichtprüfung war in dieser Umgebung nicht möglich:
Der Browser-Download lieferte kein gültiges Installationsarchiv.

## Trade-Ideen und Journal

- Trade-Ideen und die Startübersicht zeigen nur aktive Ideen und offene Positionen.
- Der neue Menüpunkt Journal zeigt Geschlossen und Verworfen. Bestehende Einträge
  werden unmittelbar anhand ihres Status einsortiert, ohne Kopie oder Migration.
- Suche und Filter arbeiten nur innerhalb der jeweiligen Liste. Ein aktiver Status
  bringt denselben Eintrag zurück zu Trade-Ideen; alle Felder, Screenshots,
  Checklisten, Snapshots und Journalnotizen bleiben am Originaldatensatz erhalten.
- Der Detailkopf führt zurück zur passenden Liste. Die Statistik zu geschlossenen
  Trades bleibt erhalten.
- Geprüft mit automatisierten Anwendungstests: Bestandsdaten, Schliessen/Verwerfen,
  Wiederöffnen, Suche/Filter, Speicherung und leere Listen. Der Starttest prüft
  zusätzlich Versionskennungen und Initialisierung mit vorhandenen Datensätzen.
  Keine erneute visuelle Browserprüfung.

## Aktueller Stand

- Kompakter Bereich Währungen & Rates mit Quellen und Datenqualität.
- Paar-Screener mit Statusfiltern und einklappbarer Gesamtübersicht.
- Paar-Checklisten, Rates-Berechnungen und Hinweise bei geänderter
  Währungsgrundlage; explizite Bestätigung des Prüfstands.
- Neue Tagesanalyse mit ungeprüften Bewertungen und erhaltener Originalanalyse.
- Gemeinsame Catalysts und gezielte Terminübernahme in bestehende Trades.
- Trade-Übersicht mit Rates-Matrix, Zentralbank-Ton und Sitzungswahrscheinlichkeiten
  unter „Aktuelle Morgenanalyse“. Der getrennte Bereich „Stand bei
  Trade-Übernahme“ zeigt die gespeicherte Kopie mit Übernahmezeitpunkt.
  Es gibt keinen externen Marktdatenfeed. Fehlt die Originalanalyse,
  verwendet die Ergänzung den eingefrorenen Makro-Snapshot.
- Hike/Hold/Cut-Vergleichsfelder bleiben absolute Prozentwerte. Bei „Neue
  Tagesanalyse“ werden sie einmalig für alle acht Währungen aus den aktuellen
  Werten der Ausgangsanalyse gesetzt. Fehlende Werte bleiben leer; 0 % bleibt
  erhalten. Bestehende Analysen und spätere manuelle Eingaben werden nicht
  nachträglich verändert.

## Nur die aktive Version

Der aktuelle Dateibaum enthält ausschliesslich die aktiven Versionsdateien.
Frühere Versionen bleiben über die Git-Historie verfügbar.

| Datei | Aufgabe |
| --- | --- |
| `index.html` | Einstieg und Reihenfolge der geladenen Skripte |
| `data.base.v5.6.19.js` | Daten- und Checklistendefinitionen |
| `app.base.v5.6.19.js` | Kernanwendung, Formulare, Berechnungen und Speicherung |
| `app.v5.6.19.js` | Trade-Fundamentaldaten, Beschriftungen, einklappbarer Screener |
| `style.v5.6.19.css` | Aktuelle Ergänzungen; importiert den Basisstil |
| `style.base.v5.6.19.css` | Basislayout |

Die Basisdateien sind aktive Abhängigkeiten und dürfen nicht gelöscht werden.
Die Versionsdateien bilden gemeinsam den aktiven Stand. Der separate tägliche
Probability-Helfer und die zweite Vorbelegung im Darstellungsmodul entfallen.
Der Tageswechsel übernimmt die Werte direkt vor Anzeige und Speicherung des
neuen Datensatzes. Bestehende Datensätze benötigen keine Migration.

Bei künftigen Updates zuerst alle aktiven HTML-/JS-/CSS-Abhängigkeiten prüfen,
dann nicht mehr verwendete Versionsdateien entfernen. Paketversion, README,
Build-Metadaten und Tests gemeinsam aktuell halten.

## Prüfung

```sh
npm test
```

Die Tests prüfen aktive Abhängigkeiten und Syntax sowie den Kerncode mit
simuliertem DOM/IndexedDB: Trade-Entscheidungen, alle 17 Trade-Checks und
Eingabefelder, Tageskopien, Paar-Prüfstand, Statusfilter, Catalysts, Speicherung
und Import. Das Feldverzeichnis `tests/trade-fields.json` schützt die vorhandenen
Eingaben, ohne eine alte Anwendungsversion im Repository vorzuhalten.

Die Ergänzungen werden auf Einbindung und Syntax geprüft, nicht vollständig im
Browser ausgeführt. Eine echte Desktop-/Mobilprüfung bleibt offen.
`tests/responsive-preview.html` ist die beibehaltene manuelle Prüfansicht.

## Prüfung der Änderungen in v5.6.16

Die Tests prüfen zusätzlich die Beschriftung beider Analysequellen samt
Fallback und einmalige Übernahme aller acht Währungen ohne Tabwechsel,
0-Prozent-Werte, fehlende Werte, unveränderte Wochenvergleiche, spätere
manuelle Bearbeitung und Speicherung sowie die nächste Tageskopie.
Die alten Formular-Helfer sind nicht mehr eingebunden. Keine erneute
Browserprüfung für diese Änderung.

## Daten und Veröffentlichung

Vollständige JSON-Backups inklusive Screenshots erfolgen in der App unter
„Backup & Einstellungen“. Die Datenbank bleibt `fx-trade-desk`, Version 1.
Website-Dateien und persönliche Browserdaten sind voneinander unabhängig.
Für GitHub Pages wird `index.html` mit ihren aktiven Abhängigkeiten benötigt;
`npm run dev` dient nur der Entwicklung. Keine Brokeranbindung und keine
automatischen Orders.

## v5.6.16 – Vereinfachte Rates-Eingabe

Der Block „Referenzzinsen & Datenqualität“ entfällt in Währungen & Rates. Bei der Erwartungsänderung gegenüber Vorwoche entfallen historischer Vergleichs-Datenstand, Kontrakt/Kurve und zusätzliche Einheiten-Auswahl. Die Eingabe bleibt in bp; der Berechnungshorizont bleibt auswählbar. Bestehende Metadaten bleiben in Datensätzen und Backups erhalten. Keine Migration oder Änderung der Berechnungslogik.

## Rates-Anzeigen v5.6.16

Paar-Screener, Paaranalyse, Paarvergleich und Trade-Rates zeigen keine Indikativ-Kennzeichnung oder Metadatenwarnungen mehr. Fehlende/ungültige Werte und inkompatible Horizonte bzw. Berechnungsgrundlagen bleiben sichtbar. Manuelle Overrides sind weiterhin als manuell gekennzeichnet. Gespeicherte Daten und Berechnungen unverändert.
