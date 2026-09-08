# FX EdgeFinder Companion

Eine statische GitHub-Pages-Web-App als Ergänzung zu deinem EdgeFinder-Workflow für FX-Swing-Trading.

## Was diese Version kann

- EdgeFinder als **Baseline** dokumentieren: Score, Bias, Real Yield Proxy, COT/Retail und wichtige Komponenten
- klar trennen zwischen:
  - was EdgeFinder bereits abdeckt
  - was du zusätzlich prüfen musst
  - was nur als Risiko-/Kontextfaktor zählt
- Morgenanalysen als wiederverwendbare Makro-Snapshots erfassen
- Zusatzchecks erfassen: Zentralbank-Kommunikation, OIS/Futures-Zinserwartungen, 2Y-Yield-Differentials, Market Driver, Event-Risiko, Risk Sentiment und Intermarket
- Trade-Ideen mit vollständiger Validierung dokumentieren
- Screenshots speichern: EdgeFinder Scorecard, Real Yield History, COT/Retail, Yield-Charts, D1/H4/M15-Setup
- Entry, Stop, Ziel, CRV, Risiko, Positionsgrössen-Schätzung und Gesamt-Exposure dokumentieren
- Trading-Journal mit Entry-, Management-, Exit- und Review-Einträgen führen
- vollständiger JSON-Export und Import inklusive Screenshots
- responsive Layout für Desktop und Handy

## Wichtig

Die App ist bewusst keine Cloud-App, kein Trading-Bot und kein zweiter EdgeFinder.

- keine Live-Marktdaten
- keine Broker-Anbindung
- keine Orderausführung
- keine API-Schlüssel nötig
- keine Synchronisierung zwischen Geräten
- Daten werden lokal im Browser über IndexedDB gespeichert

Wenn du den Browser wechselst, Website-Daten löschst oder im privaten Fenster arbeitest, können lokale Daten verloren gehen. Erstelle regelmässig ein vollständiges Backup unter **Backup & Einstellungen**.

## Update von Version 1

Die App nutzt weiterhin dieselbe lokale Browser-Datenbank (`fx-trade-desk`). Wenn du die bisherigen Dateien im GitHub-Repo durch diese Version ersetzt, bleiben bestehende lokale Einträge im selben Browser erhalten. Mach trotzdem vorher ein Backup.

## GitHub Pages Setup

1. Auf GitHub ein Repository verwenden oder neu erstellen, z. B. `fx-edgefinder-companion`.
2. Den Inhalt dieses Ordners in das Root-Verzeichnis des Repositorys hochladen.
3. In GitHub öffnen: **Settings → Pages**.
4. Bei **Build and deployment** auswählen: **Deploy from a branch**.
5. Branch: `main`, Ordner: `/ (root)` auswählen und speichern.
6. Nach kurzer Zeit zeigt GitHub die veröffentlichte URL an.

Nicht das ZIP als einzelne Datei hochladen. Die Dateien `index.html`, `style.css`, `data.js`, `app.js`, `favicon.svg` und `.nojekyll` müssen direkt im Repository liegen.

## Version

Version 2.0 — EdgeFinder Companion
