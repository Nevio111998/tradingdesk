# FX EdgeFinder Companion v5.6.14

Lokales Zusatztool zu EdgeFinder für acht Währungen, 28 FX-Paare,
Morgenanalysen, Trade-Planung und Journal. Daten werden im Browser über
IndexedDB gespeichert. GitHub Pages speichert keine persönlichen Analysen.

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
| `data.base.v5.6.14.js` | Daten- und Checklistendefinitionen |
| `app.base.v5.6.14.js` | Kernanwendung, Formulare, Berechnungen und Speicherung |
| `app.v5.6.14.js` | Trade-Fundamentaldaten, Beschriftungen, einklappbarer Screener |
| `style.v5.6.14.css` | Aktuelle Ergänzungen; importiert den Basisstil |
| `style.base.v5.6.14.css` | Basislayout |

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

## Prüfung der Änderungen in v5.6.14

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
