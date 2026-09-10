# FX EdgeFinder Companion v5.6.12

Lokales Zusatztool zu EdgeFinder für acht Währungen, 28 FX-Paare,
Morgenanalysen, Trade-Planung und Journal. Daten werden im Browser über
IndexedDB gespeichert. GitHub Pages speichert keine persönlichen Analysen.

## Aktueller Stand

- Kompakter Bereich Währungen & Rates mit Quellen und Datenqualität.
- Paar-Screener mit Statusfiltern und einklappbarer Gesamtübersicht.
- Paar-Checklisten, Rates-Berechnungen und Hinweise bei geänderter
  Währungsgrundlage; explizite Bestätigung des Prüfstands.
- Neue Tagesanalyse mit ungeprüften Bewertungen und erhaltener Originalanalyse.
- Gemeinsame Catalysts und gezielte Terminübernahme in bestehende Trades.
- Trade-Übersicht mit Rates-Matrix, Zentralbank-Ton und Sitzungswahrscheinlichkeiten
  aus der verknüpften Morgenanalyse. „Live“ bedeutet hier laufend gelesene
  lokale Analysedaten, keinen externen Marktdatenfeed. Fehlt die Originalanalyse,
  verwendet die Ergänzung den eingefrorenen Makro-Snapshot.
- Hike/Hold/Cut-Vergleichsfelder werden als gestrige absolute Prozentwerte
  angezeigt und bei fortgeführten Analysen aus der Ausgangsanalyse vorbelegt.

## Nur die aktive Version

Der aktuelle Dateibaum enthält ausschliesslich die aktiven Versionsdateien.
Frühere Versionen bleiben über die Git-Historie verfügbar.

| Datei | Aufgabe |
| --- | --- |
| `index.html` | Einstieg und Reihenfolge der geladenen Skripte |
| `data.base.v5.6.12.js` | Daten- und Checklistendefinitionen |
| `app.base.v5.6.12.js` | Kernanwendung, Formulare, Berechnungen und Speicherung |
| `app.v5.6.12.js` | Trade-Fundamentaldaten, Beschriftungen, einklappbarer Screener |
| `daily-probabilities.v5.6.12.js` | Vorbelegung der Vergleichswahrscheinlichkeiten je Währung |
| `style.v5.6.12.css` | Aktuelle Ergänzungen; importiert den Basisstil |
| `style.base.v5.6.12.css` | Basislayout |

Die Basisdateien sind aktive Abhängigkeiten und dürfen nicht gelöscht werden.
Der Kerncode stammt weiterhin aus v5.6.10; diese Herkunft ist keine zusätzlich
benötigte alte Version. Die Dateibereinigung verändert keine der sieben oben
aufgeführten Laufzeitdateien und keine gespeicherten Datensätze.

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

## Bekannte Punkte zur gesonderten Prüfung

- Die früheren Wochenänderungsfelder werden nun als absolute Vortageswerte
  beschriftet. Bestehende Werte sind dadurch nicht automatisch umgerechnet.
- „Gestern“ wird aus der Ausgangsanalyse übernommen; diese kann älter als einen
  Kalendertag sein. Vorbelegungen verwenden Browser-Marker und zwei aktive
  Ergänzungen. Die Bereinigung führt keine Datenmigration oder Änderung
  dieser bestehenden Logik durch.

## Daten und Veröffentlichung

Vollständige JSON-Backups inklusive Screenshots erfolgen in der App unter
„Backup & Einstellungen“. Die Datenbank bleibt `fx-trade-desk`, Version 1.
Website-Dateien und persönliche Browserdaten sind voneinander unabhängig.
Für GitHub Pages wird `index.html` mit ihren aktiven Abhängigkeiten benötigt;
`npm run dev` dient nur der Entwicklung. Keine Brokeranbindung und keine
automatischen Orders.
