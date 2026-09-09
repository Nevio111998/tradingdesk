# FX EdgeFinder Companion v5.6.5 – Paar-Checklisten kürzen

Die FX Paar-Makro-Checkliste besitzt nun eigene, kompakte Definitionen mit
7 Blöcken und 17 Häkchen pro Paar. Die ursprünglichen gemeinsamen Definitionen
für Trade-Ideen bleiben unverändert. Bestehende IDs, Paarobjekte, Häkchen,
Fazitfelder, gespeicherte Daten und Berechnungsfunktionen werden nicht migriert
oder gelöscht. IndexedDB bleibt Schema 1.

- Der globale Paar-Checks-Zähler entfällt in Paarübersicht, Morgenüberblick und
  Morgenanalyse-Listen. Stattdessen erscheinen Kandidaten bzw. die bestehenden
  Statuszahlen. Der Fortschritt des ausgewählten Paars bleibt erhalten.
- Event Risk: calendarToday (Wirtschaftskalender vollständig geprüft), speeches.
- Zentralbanken: policyLatest, policyTone, policyMarket.
- 2Y: ratesLevel, ratesChange (1 Tag / 5 Tage / 14 Tage), ratesCause, ratesQuality.
- Market Driver: driverNews, driverRank.
- Risk Sentiment: riskEquity, riskVix.
- Intermarket: crossRelevant, crossActual, crossConflict (unverändert).
- Positioning: cotLatest (Aktuelles COT geprüft).
- Die Paarblöcke Real Yield und Neue Daten seit EdgeFinder-Check werden nicht
  mehr angezeigt. Alle darin gespeicherten Daten bleiben im Analyseobjekt.
- Hilfen zeigen ausschliesslich die verbliebenen Checklistenpunkte. Die
  Quellenlisten der jeweiligen ursprünglichen Blöcke bleiben vollständig.
- Vorhandene Paar-Fazitfelder, Währungsdaten, Rates-Matrix, manuelle Overrides,
  Screener, Entscheidungsleiste, Trade-Übernahme und Trade-Checkliste bleiben.
  Neu übernommene Paar-Häkchen stammen nur aus der verkürzten Auswahl; der
  vollständige ursprüngliche Analysestand bleibt im Trade-Snapshot erhalten.

## 2Y-Zeiträume

Die Checklistenfrage verwendet nun 1/5/14 Tage. Die bisherigen gespeicherten
Renditefelder (vor 1 und 2 Wochen) und ihre Formeln wurden nicht umgedeutet.
Die 5-/14-Tage-Werte werden nicht aus Wochenwerten erfunden. Eine spätere
Erweiterung um eigene datierte Tageshistorien ist ein separater Schritt.

## Installation und Datenerhalt

Vor dem Update in der bisherigen App auf „Alles gespeichert“ warten und ein
vollständiges JSON-Backup erstellen. Alle Dateien des vollständigen ZIPs in
das bestehende GitHub-Repository hochladen oder das Änderungs-ZIP mit den
vorhandenen Dateien zusammenführen. Nicht den Repository-Inhalt löschen.
Nach dem Deployment müssen v5.6.5 und „Code geladen · v5.6.5“ erscheinen.
Keine Browser-/Website-Daten löschen. GitHub speichert nicht die persönlichen
Analysen; sie liegen weiterhin in der bisherigen lokalen Browserdatenbank.

## Prüfung

`node tests/fx-pair-cleanup.test.cjs` prüft die Auswahl, sämtliche 28 Paare,
alte Häkchen/Notizen/IDs, erhaltene Felder und Quellen, den Wegfall der
Globalzähler, die unveränderten Trade-Definitionen, die Trade-Übernahme und
unveränderte Rates-Berechnungen. Die bestehenden Tests bleiben im Repository.

---

# FX EdgeFinder Companion v5.6.4 – Entscheidung und Trade-Übernahme, Schritt 4

Kompakte Entscheidungsleiste mit Bias, Confidence, Status, EdgeFinder,
Rates, Market Driver, Technik und offenen Punkten. Bei ausreichend breitem
und hohem Desktop bleibt sie beim Scrollen erreichbar. Quellen und Recherche
sind einklappbar; mobile Geräte zeigen eine Spalte.

Die Schlussbewertung bündelt These, Gegenargumente, Invalidierung, nächstes
Ereignis, Fazit/Quellen und Status. Gegenargumente (`counterThesis`) und
Ereignisnotiz (`nextEvent`) sind additive optionale Paarfelder. Bestehende
IDs, Felder, Auswahlwerte, Daten und alle bisherigen Assets bleiben erhalten.
Keine Datenmigration; IndexedDB-Schema bleibt 1.

Status bleibt manuell: Kandidat, Watchlist, Bereit für Trade-Idee, Verworfen.
Checklistenfortschritt setzt keinen Status. Offene Punkte sind Hinweise aus
den dokumentierten Angaben und keine automatische Trade-Empfehlung.

Trade-Übernahme verlangt eine bewusste Long-/Short-Auswahl. Gemischter oder
ungeprüfter EdgeFinder wird nicht als Bestätigung gewertet; Gegenrichtung
bei EdgeFinder/Rates wird als Widerspruch übernommen. Die neue Idee bleibt
unbewertet. Paar-Checks und Blocknotizen werden in die Trade-Checkliste
übertragen; vollständige Analysedaten bleiben im eingefrorenen Snapshot.
Bestehende Trades werden nicht verändert.

## Prüfung Schritt 4

`node tests/fx-decision.test.cjs`: EURUSD, GBPUSD und USDCHF; Erhalt aller
bisherigen Feldbindungen, unveränderte Quelldaten, Status und Rates-Formeln;
Long/Short/Neutral, Gegenrichtungen, Snapshot-Isolation, Paar-Checks und Notizen.
Browser mit künstlichen Daten: Paarwechsel zwischen diesen drei Paaren,
Speicherung und Neuladen, USDCHF-Trade-Übernahme inklusive Widerspruch.
Desktop und mobile 390-px-Ansicht kontrolliert, kein horizontaler Seitenüberlauf.
Kein physisches Mobilgerät getestet. Vor Schliessen/Neuladen wie bisher auf
„Alles gespeichert“ warten. Übergreifende Abschlussprüfung folgt in Schritt 5.

## Installation

ZIP entpacken und vollständigen Inhalt wie bisher hochladen. Kein Browser-
Speicher löschen. Analysen liegen im bisherigen Browser, nicht in der ZIP;
vor dem Update mit der bestehenden Backup-Funktion sichern.

---

# FX EdgeFinder Companion v5.6.3 – Checklisten und Rates-Details, Schritt 3

Alle neun tatsächlich vorhandenen Paar-Checklistenblöcke sind einklappbar.
Die Nummerierung des bisherigen Codes (01, 03–10) bleibt erhalten; kein Block
wurde entfernt. Geschlossen werden Titel, Fortschritt, Bearbeitungsstatus und
ein vorhandenes Paar-Fazit angezeigt. Checkboxen und Notizfelder bleiben
vollständig vorhanden. Ausführliche Hilfen stehen unter „Info anzeigen“,
Quellen werden pro Block unter „Quellen & Recherche“ zusammengefasst.

Öffnungszustände werden pro Analyse, Paar und Bereich als lokale
Browser-Ansichtseinstellung gespeichert und nach Neuladen wiederhergestellt.
Diese Einstellung ist separat von den Analysedaten und nicht im Analyse-Backup
enthalten. Keine Datenmigration und keine Änderung am IndexedDB-Schema 1.

Die Rates-Ansicht zeigt wesentliche Kennzahlen und die Bestätigungsmatrix.
Vollständige Rechendetails und beide manuellen Override-Felder bleiben unter
„Weitere Rates-Details“ verfügbar. Die übernommenen Währungsdaten sind ebenfalls
einklappbar. Datenqualität zeigt zunächst die Anzahl eindeutiger Hinweise;
Ereignis-/Stichtagskonflikte werden bereits im Titel kenntlich gemacht.
Die bisherigen Warnungen und Erläuterungen bleiben im geöffneten Bereich
verfügbar. Rechenformeln und Qualitätslogik sind unverändert.

Manuelle Overrides aktualisieren Kennzahlen, Matrix, Qualitätsanzeige und
Screener direkt, ohne die Eingabefelder zu ersetzen. Checklistenfortschritt
ändert keinen Paarstatus; EdgeFinder und automatische Rates-Werte werden
nicht als zusätzliche unabhängige Signale gewichtet.

## Prüfung

`node tests/fx-accordions.test.cjs`: alle bestehenden Blöcke, Eingabefelder,
Hilfetexte und Quellen von EURUSD/GBPUSD/USDCHF erhalten; isolierte und
persistente Öffnungszustände, ignorierte verspätete Ereignisse entfernter
Elemente, unveränderte Analysedaten, Status und Berechnungsfunktionen,
Fortschritt, manueller Override und Anzahl der Qualitätshinweise geprüft.
Dieser Test verwendet Anwendungscode mit simuliertem DOM/Speicher.

Chromium-Browser mit künstlichen Daten: USDCHF-Override +15 bp inklusive
direkter Anzeigeaktualisierung; Event-Risk-Checkbox und Paar-Fazit; getrennte
Öffnungszustände beim Paarwechsel; nach abgeschlossener Speicherung und
Neuladen bleiben Haken, Notiz und geöffneter Block erhalten. Desktop sowie
responsive iframe-Ansichten 390/320 px visuell geprüft, kein Seitenüberlauf.
Kein physisches Telefon/Safari getestet. Wie bisher vor Neuladen oder Schliessen
auf „Alles gespeichert“ warten (bestehendes verzögertes Autosave).

## Installation

ZIP entpacken und Inhalt ins bestehende Repository hochladen oder den Pull
Request übernehmen. Nach dem Deployment müssen v5.6.3 und „Code geladen ·
v5.6.3“ erscheinen. Alle alten Assets bleiben enthalten. Keine Website-Daten
löschen. Testdaten sind nicht im Paket enthalten.

Rechte Entscheidungsleiste und Schlussbewertung folgen in Schritt 4.

---

## Vorherige Versionsdokumentation (historisch)

# FX EdgeFinder Companion v5.6.2 – Paar-Screener, Schritt 2

Die FX Paar-Makro-Checkliste startet mit einem kompakten Screener aller 28 Paare.
Er zeigt Paar, manuellen Bias/Confidence, relatives Repricing, EdgeFinder-Bild,
Status und das nächste gespeicherte relevante High-Impact-Ereignis ab dem
Analyse-Datum. Vergangene, nicht relevante und niedrig eingestufte Ereignisse
werden ausgeschlossen; es handelt sich nicht um einen Live-Kalender.

Suche nach Paar oder Währung, Filter Alle/Kandidaten/Long/Short/Neutral/Bereit,
Sortierung nach Paar, absolutem Repricing in bp oder Status (Bereit zuerst).
Repricing verwendet die bestehende Berechnung inklusive manueller Overrides
und Qualitätsregeln. Horizont und manuelle/indikative Werte sind gekennzeichnet;
nicht berechnete Werte stehen zuletzt. Unterschiedliche Horizonte und Datenstände
müssen weiterhin in den Rates-Details beurteilt werden. Kein neuer Gesamtscore
und keine automatische Trade-Empfehlung oder Statusänderung.

Die grosse Kartenübersicht und die 28 Navigationsbuttons sind durch Tabelle und
kompakte Paarauswahl ersetzt. Paar anklicken, Detailzusammenfassung lesen und
wie bisher bearbeiten. „Zum Paar-Screener“ führt zurück. Filter/Suche verändern
keine Analysewerte und setzen die Auswahl nicht zurück, selbst wenn sie aus dem
Filter fällt. Such-/Filterzustände gelten nur für die aktuelle Browsersitzung.

Alle vorhandenen Detailfelder, Checklisten, Quellen, Notizen, manuellen Overrides
und Trade-Funktionen bleiben erhalten. Keine Datenmigration, IndexedDB Schema 1.
Auf schmalen Bildschirmen umbrechende Tabellenzeilen ohne seitlichen Überlauf.

## Prüfung

`node tests/fx-screener.test.cjs`: 28 Paare, CHF- und Paar-Suche, alle Filter,
Sortierungen, fehlende Werte, Event-Relevanz/Datum, unveränderte gespeicherte
Daten und Detailfelder von EURUSD/GBPUSD/USDCHF, synchronisierte Zusammenfassung.
Test mit Anwendungscode und simuliertem DOM/Speicher.

Chromium-Browser mit künstlichen Daten: CHF-Suche (7 Paare), Short-Filter,
USDCHF-Auswahl, Statuswechsel auf Bereit, Synchronisation mit Screener,
Paarwechsel über GBPUSD sowie Neuladen mit erhaltenem Status. Desktop visuell
geprüft; responsive iframe-Ansichten mit 390/320 px ohne horizontalen Überlauf.
Kein physisches Mobilgerät/Safari getestet. Die gesamte Abschlussprüfung,
Accordions und weitere Detailverdichtung folgen in den nächsten Schritten.

## Installation

ZIP entpacken und Inhalt ins bestehende Repository hochladen oder den Pull
Request übernehmen. Nach dem Deployment müssen v5.6.2 und „Code geladen ·
v5.6.2“ erscheinen. Keine Website-Daten löschen. Alle alten Assets enthalten;
keine Testdaten im Paket.

---

## Vorherige Versionsdokumentation (historisch)

# FX EdgeFinder Companion v5.6.1 – FX Paar-Makro-Checkliste, Schritt 1

Der Bereich heisst jetzt überall in der aktiven Anwendung „FX Paar-Makro-Checkliste“.
Die bisherigen 21 Paare werden um USDCHF, EURCHF, GBPCHF, AUDCHF, NZDCHF,
CADCHF und CHFJPY ergänzt: 28 einzigartige Kombinationen aus acht Währungen.

Bestehende Paarobjekte, IDs, Reihenfolge, Checkboxen, Notizen, Status und
manuelle Overrides werden nicht neu aufgebaut. Fehlende Paare werden nur
angehängt; wiederholtes Öffnen erzeugt keine Duplikate. Auch ein bereits
vorhandenes CHF-Paar behält seine ID und Daten. Der historische interne
ID-Präfix bleibt aus Kompatibilitätsgründen erhalten.

CHF-Paare verwenden dieselben Währungsdaten, Rechenfunktionen, Checklisten,
Statusfelder und Trade-Übernahme wie die bisherigen Paare. Fortschrittszähler
werden aus den tatsächlich vorhandenen Paaren und Checklisten berechnet:
aktuell 28 × 40 = 1’120 Checks. Ein Checklistenfortschritt setzt keinen Status
auf „Bereit“. Es gibt keine Datenbankschemaänderung und keine Migration.

## Prüfung

`node tests/fx-chf-pairs.test.cjs`: 28 eindeutige Kombinationen ohne Umkehrduplikate;
exakter Erhalt bestehender 21 Paarobjekte und IDs; vorhandenes CHF-Paar;
idempotente Ergänzung; dynamische Checklistenanzahl; Bearbeitung und Checks;
EURUSD, GBPUSD und alle sieben CHF-Paare; identische Rates-Funktionen und
Trade-Snapshot mit CHF-Daten. Der Test verwendet simuliertes DOM/Speicher.

Echter Chromium-Browser: vorhandenen Test-Snapshot geöffnet, 28 Paar-Buttons,
neuen Namen und 0/1120 angezeigt; CHF-Renditen erfasst; USDCHF-Differential
+300 bp geprüft; Wechsel über GBPUSD, Neuladen mit erhaltenem USDCHF-Short-Bias
und Watchlist-Status; USDCHF-Short-Trade-Idee erfolgreich übernommen.
Persönliche Nutzerdaten waren nicht Teil der Testumgebung.

Screener, kompakter Navigator, Accordions und Entscheidungsbereich folgen in
den nächsten Schritten. Die umfassende Desktop-/Mobilprüfung folgt in Schritt 5.

## Installation

ZIP entpacken und den Inhalt wie gewohnt ins bestehende Repository hochladen,
oder den zugehörigen Pull Request übernehmen. Nach dem Deployment müssen
v5.6.1 und „Code geladen · v5.6.1“ erscheinen. Website-Daten nicht löschen.
Alle bisherigen versionierten Assets sind im Paket enthalten; keine Testdaten.

---

## Vorherige Versionsdokumentation (historisch)

# FX EdgeFinder Companion v5.5.5 – Schritt 5: Abschlussprüfung

Die Überarbeitung von Währungen & Rates wurde mit dem bestehenden Code aus
v5.5.4 abschliessend geprüft. Zwei Korrekturen: Der Paarvergleich aktualisiert
sich jetzt unmittelbar bei Währungseingaben; die Spaltenüberschriften der
kompakten Währungsübersicht haben ausreichend Abstand.

Alle acht Währungen, Eingabefelder, Optionen, Metadaten und bisherigen Assets
bleiben erhalten. Rechenformeln und Speicherfunktionen sind unverändert.
IndexedDB bleibt bei Schema 1; keine Migration und kein Zurücksetzen von Daten.

## Prüfung

- `node tests/currency-final.test.cjs`: Feld-/Options-/Quellenvergleich aller
  acht Währungen gegen v5.5.4, Detailzustände, Datenerhalt mit simuliertem Speicher,
  unveränderte Rechenfunktionen und Regressionstest für die Rechneraktualisierung.
- Echter Chromium-Browser: USD, EUR und JPY mit künstlichen Daten eingegeben,
  Währungen gewechselt und neu geladen. Leitzinsen, Renditen, Interpretation,
  USD-Wahrscheinlichkeiten, Bias/Confidence und Referenzdefinition blieben erhalten.
- USD/JPY: 300 bp 2Y-Differential und 100 bp Realzins-Differential. Nach Änderung
  der JPY-Rendite auf 1.1 % sofort 290 bp; umgekehrt -290 bp und -100 bp Realzins.
- Desktop hell/dunkel sowie responsive Chromium-Ansichten mit 390 und 320 px
  visuell geprüft. Kein horizontaler Seitenüberlauf; Währungs-Tabs bleiben
  erreichbar, Desktopübersicht bleibt unter den Tabs stehen.
- Alte Dateien/Assets, JavaScript-Syntax und Release-Prüfsummen kontrolliert.

Mobile Prüfung erfolgte in einer Chromium-iframe-Testansicht, nicht auf einem
physischen Telefon oder in Safari. Bestehende persönliche Browserdaten waren
nicht Teil der Testumgebung. Screenshot-Assets wurden im simulierten Speichertest
auf Erhalt geprüft; kein vollständiger Backup-Import/Export-Browsertest.

## Installation

ZIP entpacken und den Inhalt wie gewohnt ins bestehende Repository hochladen,
oder den zugehörigen Pull Request übernehmen. Nach dem Pages-Deployment müssen
v5.5.5 und „Code geladen · v5.5.5“ erscheinen. Website-Daten nicht löschen.

## Entwicklungsvorschau

Optional `npm ci` und `npm run dev` für eine lokale Vite-Vorschau.
GitHub Pages verwendet weiterhin direkt die statischen Dateien; kein Build nötig.
`tests/responsive-preview.html` bietet feste Testbreiten für die Sichtprüfung.
Testdaten sind nicht im Paket enthalten.

---

## Vorherige Versionsdokumentation (historisch)

# FX EdgeFinder Companion v5.5.4 – Währungen & Rates, Schritt 4

Die rechte Spalte enthält eine kompakte Übersicht aller acht Währungen mit
Bias und Confidence. Änderungen der Eingaben aktualisieren die Übersicht
sofort. Die aktive Währung ist gekennzeichnet; jede Zeile wechselt zur Währung.
Bei ausreichend breiten und hohen Desktopfenstern bleibt die Übersicht beim
Scrollen unter den Währungs-Tabs erreichbar. Bei schmalen/kurzen Fenstern ist
sie nicht fixiert, damit Inhalte erreichbar bleiben. Kleine Bildschirme erhalten
eine einspaltige Ansicht. Die Seitenkarten werden nicht künstlich gestreckt.

„Worauf bei [Währung] achten?“ zeigt zwei kurze allgemeine Treiberhinweise und
bis zu drei chronologisch sortierte gespeicherte Termine. Die Auswahl umfasst
passende Währungs-/Paarangaben und globale Ereignisse sowie die eingetragene
nächste Zentralbanksitzung. Sie beginnt am Datum der jeweiligen Morgenanalyse;
auch bei archivierten Analysen wird dieser Bezug sichtbar ausgewiesen. Weitere
Termine bleiben über den Catalyst-Bereich zugänglich. Kein Live-Kalender.

Alle bisherigen Quellenlinks und die ausführlichen allgemeinen Treiberhinweise
bleiben unter „Quellen & Recherche“ erhalten. Dieser Bereich startet eingeklappt
und verwendet denselben sitzungsbezogenen Öffnungszustand wie Schritt 3.
Bestehende Eingabefelder, Berechnungen, Datenbank und Speicherfunktionen bleiben
erhalten. Die Umsetzung baut auf der installierten v5.5.3 auf.

## Prüfung von v5.5.4

`node tests/currency-sidebar.test.cjs`: echter Anwendungscode mit simuliertem
DOM/Speicher. Eingaben, Werte, Dropdown-Optionen und Quellenlinks aller acht
Währungen gegen v5.5.3; Live-Aktualisierung von Bias/Confidence und Sitzung;
Ereignisfilter, Sortierung, Begrenzung und unveränderte gespeicherte Termine;
Währungswechsel, Detailzustände, Datenerhalt und Rechenfunktionen geprüft.
JavaScript-Syntax, HTML-Verschachtelung, Assets und Release-Prüfsummen geprüft.

Die visuelle Desktop-/Mobilprüfung und echte Browser-/IndexedDB-End-to-End-
Prüfung bleiben offen. Die verfügbare Vorschau unterstützt das statische Projekt
nicht. Das tatsächliche Sticky-Verhalten sollte im eigenen Browser geprüft werden.

## Installation

ZIP entpacken und deren Inhalt wie gewohnt ins bestehende Repository hochladen.
Nach dem Pages-Deployment müssen v5.5.4 und „Code geladen · v5.5.4“ erscheinen.
Alternativ den zugehörigen Pull Request übernehmen. Alle alten Assets bleiben
enthalten. Keine Website-Daten löschen.

---

## Vorherige Versionsdokumentation (historisch)

# FX EdgeFinder Companion v5.5.3 – Währungen & Rates, Schritt 3

„Referenzzinsen & Datenqualität“ ist standardmässig eingeklappt. Die Statuszeile
unterscheidet nicht, teilweise und vollständig dokumentierte Angaben. Sie
beschreibt ausschliesslich die Vollständigkeit von 28 vorhandenen Metadatenfeldern,
nicht die Richtigkeit der Quellen oder wirtschaftliche Vergleichbarkeit.
Die Anzeige aktualisiert sich beim Bearbeiten der bestehenden Währungsfelder.

Im Detailbereich sind alle bisherigen Metadaten in fünf Gruppen angeordnet:
Referenzzins, nächste Sitzung, 3M-Pricing, 12M-Pricing und Wochenänderung.
Historischer Vergleichsstichtag und Instrument der Wochenänderung bleiben
zusätzlich an ihrer bisherigen Eingabestelle in Sektion B; keine doppelten Felder.

Der bestehende Rechner befindet sich in einem eigenständigen aufklappbaren
Bereich „Paarvergleich“ unmittelbar unter dem Währungskopf. Base-/Quote-Auswahl
und Berechnungen bleiben unverändert. Die G7 Paar-Makro-Checkliste bleibt der
Ort für die vollständige Bewertung.

Beide Bereiche verwenden native HTML-details/summary-Elemente. Geöffnete
Bereiche bleiben pro Analyse/Währung während der Sitzung auch nach einer
Neudarstellung erhalten. Der Paarvergleich merkt seinen Zustand pro Analyse.
Nach einem Neuladen starten beide geschlossen. Das Auf-/Zuklappen verändert
keine Datensätze und löst keine Speicherung aus. IndexedDB bleibt bei Schema 1.

## Prüfung von v5.5.3

`node tests/currency-details.test.cjs` führt den echten Code in einer simulierten
DOM-/Speicherumgebung aus. Geprüft werden sämtliche Eingabeelemente, Werte und
Dropdown-Optionen aller acht Währungen gegen v5.5.2, die fünf Metadatengruppen,
geschlossene Startzustände, unabhängige Öffnungszustände, Statusaktualisierung,
Neudarstellung bei Horizontwechsel, USD/EUR/JPY-Wechsel, Speicherung und
unveränderte Rechenfunktionen. HTML-Verschachtelung, JavaScript-Syntax, Assets
und Release-Prüfsummen sind geprüft.

Visuelle Desktop-/Mobilprüfung und echte Browser-/IndexedDB-End-to-End-Prüfung
bleiben offen, da die verfügbare Vorschau das statische Projekt nicht unterstützt.

## Installation und Sichtprüfung

ZIP entpacken und den Inhalt wie bisher in das bestehende Repository hochladen.
Nach dem Pages-Deployment müssen v5.5.3 und „Code geladen · v5.5.3“ erscheinen.
Alternativ den zugehörigen Pull Request übernehmen. Alte Assets sind enthalten.

Unter „Währungen & Rates“ beide Bereiche öffnen und schliessen, Metadaten
bearbeiten, zwischen USD/EUR/JPY wechseln und den Vergleichsrechner verwenden.
Gespeicherte Eingaben bleiben auch nach dem Neuladen erhalten; die Detailbereiche
starten dann wieder geschlossen. Website-Daten nicht löschen.

---

## Vorherige Versionsdokumentation (historisch)

# FX EdgeFinder Companion v5.5.2 – Währungen & Rates, Schritt 2

Die bestehenden Haupteingaben sind jetzt in vier Sektionen gegliedert:

- **A – Zentralbank & Entscheidung:** Leitzins, letzte Entscheidung, nächste
  Sitzung, Ton und erwartete Veränderung der nächsten Sitzung.
- **B – Marktpricing & Wahrscheinlichkeiten:** 3M-/12M-Pricing, Repricing mit
  unverändert wählbarem Horizont sowie Hike, Hold und Cut nebeneinander.
  Unter jeder Wahrscheinlichkeit steht ihre Wochenänderung in pp.
- **C – Renditen & Realzins:** 2Y jetzt/vor 1W/vor 2W, Real Yield und Definition.
- **D – Bias & Interpretation:** Bias, Confidence, Analyse-Datenstand,
  Interpretation und allgemeine Quellen.

Die Sektionen erhalten einheitliche Überschriften, Abstände und Feldgrössen.
Auf schmalen Geräten stehen Formulare und Wahrscheinlichkeitsblöcke einspaltig.
Der Kopf aus Schritt 1 bleibt erhalten. Metadaten, Seitenleiste und Rechner
bleiben verfügbar; das Einklappen folgt in Schritt 3. Keine Datenmigration.

## Prüfung von v5.5.2

`node tests/currency-sections.test.cjs` vergleicht alle Eingabeelemente samt
Werten und Dropdown-Optionen für alle acht Währungen mit v5.5.1. Auch 3M,
benutzerdefinierte und leere Horizonte werden geprüft. Der echte Code läuft
in einer simulierten DOM-/Speicherumgebung; USD/EUR/JPY-Bearbeitung,
Währungswechsel, Live-Kopf, Datenerhalt und unveränderte Rechenfunktionen
werden geprüft. Syntax, lokale Assets und Release-Prüfsummen sind geprüft.

Die visuelle Desktop-/Mobilprüfung und echte IndexedDB-End-to-End-Prüfung
bleiben offen: Die verfügbare Vorschau unterstützt das statische Projekt nicht.

## Installation

ZIP entpacken und dessen Inhalt wie bisher ins bestehende Repository hochladen.
Nach dem Pages-Deployment müssen v5.5.2 und „Code geladen · v5.5.2“ erscheinen.
Die ZIP enthält auch die bisherigen Versionsdateien. Keine Website-Daten löschen.
Alternativ kann die GitHub-Änderung übernommen werden.

---

## Vorherige Versionsdokumentation (historisch)

# FX EdgeFinder Companion v5.5.1 – Währungen & Rates, Schritt 1

Die neue Währungsübersicht fasst Währung/Zentralbank, Bias, Confidence,
aktuellen Leitzins, nächste Sitzung und den Datenstand der Einzelwährung
kompakt zusammen. Änderungen an diesen bestehenden Eingaben erscheinen
sofort im Kopfbereich, ohne das Formular neu aufzubauen.

Die acht Währungs-Tabs bleiben beim Scrollen unter der oberen Menüleiste
erreichbar. Die Höhe der Menüleiste wird auch bei Fensteränderungen und
Textvergrösserung berücksichtigt. Auf schmalen Mobilgeräten stehen die Tabs
in zwei Reihen; die Kennzahlen im Kopfbereich stehen untereinander.
Die aktive Währung ist sichtbar und für Hilfstechnologien gekennzeichnet.

## Umfang und Datenerhalt

- Basis ist der unveränderte Stand v5.4.7; die früher abgebrochene v5.5.0 wird
  nicht als Ausgangsversion verwendet.
- Die bisherigen Eingabefelder, Dropdowns, Metadaten, Seitenleisten und der
  Paarvergleich bleiben erhalten. Gruppierung und einklappbare Details folgen
  in den nächsten Schritten.
- Der neue Kopf liest ausschliesslich bestehende Werte. Fehlende Werte werden
  als „Nicht erfasst“ angezeigt; Null und negative Zinssätze bleiben sichtbar.
- IndexedDB `fx-trade-desk`, Schema 1, Speicherung und Import/Export bleiben
  unverändert. Keine Datenmigration und kein Zurücksetzen.
- Die originalen v5.4.7-Dateien und alle älteren Assets bleiben im Repository.

## Prüfung dieser Version

`node tests/currency-header.test.cjs` führt den tatsächlichen Anwendungscode
in einer isolierten, simulierten DOM-/Speicherumgebung aus:

- Für alle acht Währungen ist das komplette Formular einschliesslich
  Datenqualität, Rechner und Seitenleiste identisch zur v5.4.7-Ausgabe.
- USD, EUR und JPY: Bearbeiten aller fünf Kopfangaben, unmittelbare Anzeige,
  Währungswechsel per Klick-Handler, Fokus und Erhalt der Eingaben.
- Speicherung der Datensätze inklusive unbekannter älterer Felder und
  unveränderter Bildreferenzen; separate Asset-Daten bleiben unangetastet.
- Leere Werte, Null-/Negativzinsen, Nachkommastellen und HTML-Escaping.
- Unveränderte Rechenfunktionen und Differenz 7,4 − (−8,7) = 16,1 bp.

JavaScript-Syntax und eingebundene Dateien werden zusätzlich geprüft.
**Kein visueller Desktop-/Mobil-Browsertest:** Die verfügbare Vorschau
unterstützt dieses bestehende statische Projekt nicht. Layout, tatsächliches
Sticky-Verhalten und echte IndexedDB-Persistenz im Browser sind daher nicht
als end-to-end geprüft ausgewiesen.

## Update und Sichtprüfung

Das vollständige ZIP enthält die App einschliesslich alter Versionsdateien.
Beim Hochladen in das bestehende Repository die `index.html` ersetzen und
alle neuen v5.5.1-Dateien mit hochladen. Alternativ den zugehörigen Pull Request
nach Prüfung übernehmen. Erst danach veröffentlicht GitHub Pages die Änderung.
Oben links müssen v5.5.1 und „Code geladen · v5.5.1“ erscheinen.

Für die Sichtprüfung eine bestehende Morgenanalyse öffnen, zu „Währungen &
Rates“ wechseln und USD, EUR sowie JPY kontrollieren. Kopfangaben bearbeiten,
weit nach unten scrollen, Währungen wechseln und anschliessend neu laden.
Auf Desktop und Mobilgerät darauf achten, dass Tabs erreichbar bleiben und
keine Inhalte verdecken. Beim Neuladen gespeicherte Werte und Screenshots
kontrollieren. Website-Daten nicht löschen; ein vorheriger JSON-Export ist
als zusätzliche Sicherung möglich.

---

## Dokumentation der bisherigen Basis (v5.4.7)

Die folgende Beschreibung und ihre damaligen Testangaben beziehen sich auf
v5.4.7, nicht auf zusätzliche Browsertests der aktuellen Version.

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
