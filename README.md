# FX EdgeFinder Companion v5.2.0

## Reparatur und Versionsanzeige
- Gemeinsamer Währungsdaten-Reader steht vor allen Renderfunktionen im äusseren App-Scope.
- Die Programm-, Daten- und CSS-Dateien tragen eindeutige Versionsnamen. Das verhindert eine Mischung alter und neuer Assets durch den Browsercache.
- Oben links wird v5.2.0 angezeigt. „Code geladen · v5.2.0“ bestätigt, dass die passende JavaScript-Version tatsächlich gestartet ist.
- Ein Versionskonflikt wird sichtbar gemeldet, statt als Datenbankfehler missverstanden zu werden.
- Die bestehende lokale IndexedDB `fx-trade-desk` bleibt unverändert. Es werden keine Daten gelöscht oder automatisch ersetzt.

## Update von v5.1 / v5
1. In der bisherigen App unter Backup & Einstellungen ein vollständiges JSON-Backup exportieren. Falls die Ansichten nicht öffnen, zuerst versuchen, über das linke Menü direkt zum Backup zu gelangen. Keinesfalls Website-Daten löschen.
2. Den Inhalt dieses ZIPs in das Hauptverzeichnis des bestehenden GitHub-Repositories hochladen. `index.html` ersetzen und sämtliche neuen `v5.2.0`-Dateien mit hochladen. Alte Dateien dürfen zunächst liegen bleiben.
3. Unter GitHub Actions beziehungsweise Settings → Pages warten, bis das Deployment abgeschlossen ist.
4. Die veröffentlichte Webseite mit Strg+F5 (Mac: Cmd+Shift+R) neu laden. Falls nötig einmal `?v=5.2.0` an die URL vor dem # anhängen.
5. Links muss v5.2.0 und „Code geladen · v5.2.0“ erscheinen. Erst danach die Morgenanalyse öffnen und Währungen & Rates sowie die G7 Paar-Makro-Checkliste testen.

Die App ist weiterhin eine lokale, statische Web-App ohne Live-Kurse, Broker-Anbindung oder Cloud-Synchronisierung. Ein GitHub-Update aktualisiert nur die Programmdateien, nicht die lokal gespeicherten Trades.

## Verifikation
Die Währungs- und Paaransichten, alle 21 Paare, 2Y-Vergleiche, paarbezogene Checkboxen, Trade-Übernahme und Journal wurden mit automatisierten Funktionstests sowie einem Chromium-UI-Test geprüft. Die bestehende IndexedDB-Datenbank und ihr Schema wurden nicht verändert.
