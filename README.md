# FX EdgeFinder Companion v5.4.3 – Schritt 2

Dieses Update baut auf v5.4.2 auf und ändert ausschliesslich die eindeutige
Erfassung der Erwartungsänderung und die notwendige Horizontbehandlung.

## Änderungen
- Horizont der Wochenänderung: 12M (Standard), 3M oder Benutzerdefiniert.
- Benutzerdefinierte Horizonte werden explizit gespeichert. Bestehende freie
  Horizonte werden unverändert übernommen und im neuen Feld angezeigt.
- Das ursprüngliche Feld pricingChange bleibt der numerische bp-Wert.
- Historischer Vergleichsstichtag und Kontrakt/Kurve stehen nun direkt neben
  der bp-Erwartungsänderung; sie bleiben optional und verwenden dieselben
  bisherigen Speicherschlüssel.
- Hike/Hold/Cut-Wahrscheinlichkeiten (%) und deren Wochenänderungen (pp)
  sind weiterhin getrennte Felder. Keine Umrechnung oder Vermischung.
- Ein ausdrücklich leerer benutzerdefinierter Horizont wird nicht heimlich
  auf 12M zurückgesetzt. Der relative Vergleich bleibt dann gesperrt.
- Alle übrigen Berechnungsregeln aus v5.4.2 bleiben unverändert.

## Daten und Update
Die bisherige IndexedDB fx-trade-desk (Schema 1) und sämtliche vorhandenen
Speicherschlüssel bleiben erhalten. Es gibt keine Lösch- oder Reset-Migration.
Bestehende EUR/USD-Daten, Paar-Analysen und unbekannte ältere Felder werden
beim Laden und Speichern beibehalten.

Den vollständigen ZIP-Inhalt in das bestehende GitHub-Repository hochladen.
Die index.html ersetzen; alte versionierte Assets dürfen bleiben.
Nach dem erfolgreichen GitHub-Pages-Deployment neu laden. Oben links muss
v5.4.3 und „Code geladen · v5.4.3“ stehen. Keine Website-Daten löschen.

## Tests
- JavaScript-Syntax und übereinstimmende Programm-/Datenversion.
- Neuer Standard 12M, Umschalten auf 3M, benutzerdefinierte Horizonte,
  Wechsel zurück und ausdrücklich leerer Horizont.
- Alte freie Horizonte und bestehende Eingabewerte bleiben erhalten.
- Historischer Stichtag und Instrument erscheinen genau einmal.
- Alle sechs Wahrscheinlichkeitsfelder bleiben getrennt erhalten.
- saveNow-Persistenz mit alten Währungsfeldern, Paar-Analysen und neuen Werten.
Die Tests wurden im JavaScript-Runtime-Harness bestanden. Ein vollständiger
Chromium-End-to-End-Test war wegen einer Navigationssperre der Testumgebung
nicht möglich und wird nicht als bestanden ausgegeben.
