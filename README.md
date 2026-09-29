# FX EdgeFinder Companion v5.6.17

Lokales Zusatztool zu EdgeFinder für acht Währungen, 28 FX-Paare,
Morgenanalysen, Trade-Planung und Journal. Daten werden im Browser über
IndexedDB gespeichert. GitHub Pages speichert keine persönlichen Analysen.

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

`analytics.v5.6.17.js` enthält die read-only Auswertung und das Festhalten der
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
| `data.base.v5.6.17.js` | Daten- und Checklistendefinitionen |
| `app.base.v5.6.17.js` | Kernanwendung, Formulare, Berechnungen und Speicherung |
| `app.v5.6.17.js` | Trade-Fundamentaldaten, Beschriftungen, einklappbarer Screener |
| `style.v5.6.17.css` | Aktuelle Ergänzungen; importiert den Basisstil |
| `style.base.v5.6.17.css` | Basislayout |

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
