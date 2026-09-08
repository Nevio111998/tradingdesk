# FX EdgeFinder Companion v5.4.4 – Schritt 3

Dieses Update baut auf v5.4.3 auf. Es ändert ausschliesslich die automatische
Berechnung und Kennzeichnung des relativen Repricings in der Paar-Analyse.

## Berechnung

Relatives Repricing (bp) = Erwartungsänderung Base (bp) − Erwartungsänderung Quote (bp).

- Numerische Werte und ein bekannter, vergleichbarer Horizont sind erforderlich.
- 12M ist der Standard für alte Datensätze ohne gespeicherten Horizont.
- 3M gegen 12M wird nicht automatisch berechnet.
- Gleichwertige Schreibweisen wie 12M/1Y oder 3M/3 Monate werden erkannt.
- Fehlende optionale Metadaten verhindern die Berechnung nicht.
- Gemischte Methoden wie Meeting-Pricing, OIS-Forward und Futures-Proxy
  führen zu einem Wert mit dem Hinweis „Indikativer Vergleich“.
- Der gleiche Wert und die gleiche Kennzeichnung erscheinen in der
  Rates-Bestätigungsmatrix. Es wird kein Gesamtscore erzeugt.
- Ein begründeter manueller Override bleibt möglich, wenn die automatische
  Berechnung nicht möglich ist. Ein alter Override überschreibt keinen
  gültigen automatischen Wert.

## Daten und Kompatibilität

Alle Eingabefelder, Währungsdaten, Wahrscheinlichkeiten, Metadaten und
Paar-Analysen bleiben erhalten. Datenbankname und Schema bleiben unverändert:
fx-trade-desk, Version 1. Es gibt keine Lösch- oder Reset-Migration.
Die übrigen Rates- und Leitzins-Berechnungen wurden nicht verändert.

## Installation

Den gesamten ZIP-Inhalt in das bestehende GitHub-Repository hochladen und
die index.html ersetzen. Alte versionierte Dateien dürfen bleiben.
Nach erfolgreichem GitHub-Pages-Deployment neu laden. Oben links muss
v5.4.4 und „Code geladen · v5.4.4“ stehen. Keine Website-Daten löschen.
Wenn möglich, vorher ein JSON-Backup exportieren.

## Tests

Der echte JavaScript-Code wurde in einem isolierten Runtime-Harness getestet:
EURUSD, AUDCAD, GBPJPY, alle 21 G7-Paare, Vorzeichen, Nullwerte,
Dezimalwerte, fehlende Zahlen, gemischte Methoden, Horizonte, Override und
beide Matrixansichten. Versionsprüfung, Syntax, Quelldatei- und ZIP-Integrität
wurden ebenfalls geprüft. Ein vollständiger Browser-End-to-End-Test wurde
nicht durchgeführt.
