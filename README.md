# FX EdgeFinder Companion v5.4.5 – Schritt 4

Dieses Update baut auf v5.4.4 auf und gibt die erwarteten 3M- und
12M-Leitzins-Differentiale bei vorhandenen numerischen Daten frei.

## Berechnungslogik

Erwartetes Differential (bp) =
  100 × (aktueller Leitzins Base − aktueller Leitzins Quote)
  + kumuliertes Pricing Base (bp) − kumuliertes Pricing Quote (bp).

Die bestehenden Eingabefelder behalten ihre festen Einheiten:
aktueller Leitzins in Prozent, kumulierte 3M-/12M-Veränderungen in bp.
Es werden keine Werte automatisch anhand ihrer Grösse als Prozent oder bp
interpretiert. Fehlende oder ungültige Zahlen sowie ausdrücklich als
unklar/abweichend markierte, nicht umgerechnete Einheiten verhindern die
betroffene Berechnung. Ein fehlender 3M-Wert sperrt den vollständigen
12M-Vergleich nicht und umgekehrt. Null und negative Werte sind gültig.

Drei neue optionale Einheiten-Auswahlen im Datenqualitätsbereich dokumentieren
den Standard oder eine unklare/abweichende Quellen-Einheit. Nichtkanonische
Quellenwerte müssen vor der Eingabe in die Einheit des Feldes umgerechnet
werden. Die Auswahl verändert niemals bestehende Zahlen.

Quelle, Datenstand, Instrument, Methode und Referenzzinsdefinitionen bleiben
dokumentierbar und sind keine generellen Rechensperren. Unterschiedliche
Referenzraten, unvollständige Definitionen, gemischte Methoden und
Forward-/Futures-Proxys werden als Indikativ bzw. Qualitätswarnung angezeigt.
Die Detailzeile zeigt zusätzlich den aktuellen Spread und den kumulierten
Pricing-Unterschied. Ein indikatives Ergebnis ist kein exakt vergleichbares
zukünftiges offizielles Policy-Rate-Niveau.

Die übrigen Berechnungen, insbesondere relatives Repricing, 2Y und Real Yield,
sowie die G7-Paar-Checklisten werden nicht neu konzipiert.

## Daten und Installation

Alle bisherigen Währungsdaten, Wahrscheinlichkeiten, Metadaten, Paar-Analysen
und unbekannten älteren Felder bleiben erhalten. Die bestehende IndexedDB
fx-trade-desk mit Schema 1 bleibt unverändert. Es gibt keine Lösch-, Reset-
oder destruktive Migration.

Den vollständigen ZIP-Inhalt in das bestehende GitHub-Repository hochladen,
die index.html ersetzen und das erfolgreiche Pages-Deployment abwarten.
Alte versionierte Dateien dürfen bleiben. Anschliessend neu laden. Oben
links muss v5.4.5 und „Code geladen · v5.4.5“ stehen.
Keine Website-Daten löschen; nach Möglichkeit vorher ein JSON-Backup erstellen.

## Testumfang

Der echte JavaScript-Code wurde in einem isolierten Runtime-Harness geprüft:
EURUSD, AUDCAD, GBPJPY und alle 21 G7-Paare, 3M/12M-Rechnung, Vorzeichen,
Null- und Negativwerte, Dezimalzahlen, fehlende/ungültige Zahlen, explizit
inkompatible Einheiten, fehlende Metadaten, gemischte Referenzraten,
Forward-Proxys, unabhängige Horizonte, erhaltenes relatives Repricing,
Formularfelder und bestehende Datensätze. Der unveränderte saveNow-Pfad
wurde mit einer simulierten IndexedDB-Transaktion getestet.
Syntax, Programm-/Datenversion und ZIP-Integrität wurden geprüft.
Ein vollständiger Browser-End-to-End-Test wurde nicht durchgeführt.
