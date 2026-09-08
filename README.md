# FX EdgeFinder Companion v5.4.6 – Schritt 5

Dieses Update baut auf v5.4.5 auf und verbessert die Datenqualitätswarnungen
der bestehenden G7-Paar-Analyse. Die vorhandenen Berechnungen und Eingaben
bleiben erhalten.

## Verständliche Warnungen

- Fehlende numerische Werte werden mit Währung und Feld benannt.
- Ein fehlender Erwartungsänderungs-Horizont wird ausdrücklich benannt.
- 3M gegen 12M oder andere verschiedene Horizonte werden nicht automatisch
  verglichen. Gleichwertige Schreibweisen bleiben erlaubt.
- Unterschiedliche Methoden und Referenzzinsdefinitionen werden mit den
  tatsächlich erfassten Bezeichnungen angezeigt. Sie führen zu einem
  indikativen Vergleich, nicht zu einer generellen Rechensperre.
- Aktuelle und historische Bewertungsstichtage werden separat verglichen.
  Ein Zeitversatz von 1–2 Handelstagen verhindert die Rechnung nicht.
- Handelstage werden als Montag bis Freitag gezählt. Marktfeiertage sind
  nicht automatisch bekannt; die Anzeige weist ausdrücklich darauf hin.

## Wichtige Ereignisse

Die Qualitätsprüfung nutzt die bereits dokumentierten Catalysts und die
jeweils letzte erfasste Zentralbankentscheidung. Liegt ein High-Impact-Event
oder ein dokumentierter Zinsentscheid zwischen den Stichtagen, erscheint
eine deutlich hervorgehobene Ereigniswarnung. Der Wert bleibt indikativ und
wird nicht willkürlich blockiert.

Es gibt keine Live-Kalenderanbindung und keine Behauptung, dass alle
historischen Ereignisse erfasst wurden. Termine ohne explizite Zeitzone
werden als lokale Browserzeit interpretiert. Ein datumsgenauer Eintrag
wird vorsichtig als ganztägiger Zeitraum behandelt.

## Daten und Update

Keine bisherigen Felder werden gelöscht oder zurückgesetzt. Die IndexedDB
fx-trade-desk, Schema 1, bleibt unverändert. Währungsdaten,
Wahrscheinlichkeiten, Metadaten, Paar-Analysen, Checklisten und unbekannte
ältere Werte bleiben erhalten.

Den vollständigen ZIP-Inhalt in das bestehende GitHub-Repository hochladen,
die index.html ersetzen und das erfolgreiche Pages-Deployment abwarten.
Alte versionierte Dateien dürfen bleiben. Danach neu laden; oben links
müssen v5.4.6 und „Code geladen · v5.4.6“ erscheinen.
Keine Website-Daten löschen. Wenn möglich vorher ein JSON-Backup erstellen.

## Tests

Der tatsächliche JavaScript-Code wurde in einem isolierten Runtime-Harness
geprüft: konkrete fehlende Werte, Horizonte, gemischte Methoden, 0/1/2/3
Handelstage, Wochenende, dokumentierte Ereignisse, irrelevante bzw.
ausserhalb liegende Events, Referenzzinsdefinitionen, HTML-Escaping,
EURUSD-Rechnungen, 3M/12M, 2Y und Real Yield sowie alle 21 G7-Paare.
Der bestehende saveNow-Pfad wurde mit einer simulierten IndexedDB-Transaktion
und vollständigem Vergleich eines alten Datensatzes getestet.

Ein vollständiger Chromium-End-to-End-Test konnte wegen einer
Navigationssperre der Testumgebung nicht ausgeführt werden und wird nicht
als bestanden ausgegeben.
