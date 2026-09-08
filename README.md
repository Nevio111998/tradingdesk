# FX Trade Desk

Eine statische GitHub-Pages-Web-App für deinen täglichen FX-Swing-Trading-Prozess.

## Was die App kann

- Morgenanalysen als wiederverwendbare Makro-Snapshots erfassen
- Trade-Ideen mit kompletter Fundamental-, Rates-, Risk- und Technik-Checkliste dokumentieren
- Zentralbanken, Zinserwartungen, 2Y-Yields, Real Yields, Market Driver, Risk Sentiment, Positioning und Catalysts strukturieren
- Screenshots und Chart-Belege lokal speichern
- Entry, Stop, Ziel, CRV, Risiko, Positionsgrössen-Schätzung und Gesamt-Exposure dokumentieren
- Trading-Journal mit Review-Einträgen führen
- Vollständiger JSON-Export und Import inklusive Screenshots
- Responsive Layout für Desktop und Handy

## Wichtig

Die App ist bewusst keine Cloud-App und kein Trading-Bot.

- Keine Live-Marktdaten
- Keine Broker-Anbindung
- Keine Orderausführung
- Keine API-Schlüssel nötig
- Keine Synchronisierung zwischen Geräten
- Daten werden lokal im Browser über IndexedDB gespeichert

Wenn du den Browser wechselst, Website-Daten löschst oder im privaten Fenster arbeitest, können lokale Daten verloren gehen. Erstelle regelmässig ein vollständiges Backup unter **Backup & Einstellungen**.

## GitHub Pages Setup

1. Auf GitHub ein neues Repository erstellen, z. B. `fx-trade-desk`.
2. Den Inhalt dieses Ordners in das Root-Verzeichnis des Repositorys hochladen.
3. In GitHub öffnen: **Settings → Pages**.
4. Bei **Build and deployment** auswählen: **Deploy from a branch**.
5. Branch: `main`, Ordner: `/root` auswählen und speichern.
6. Nach kurzer Zeit zeigt GitHub die veröffentlichte URL an.

Nicht das ZIP als einzelne Datei hochladen. Die Dateien `index.html`, `style.css`, `data.js`, `app.js`, `favicon.svg` und `.nojekyll` müssen direkt im Repository liegen.

## Dateien

- `index.html` – App-Shell
- `style.css` – Design und Responsive Layout
- `data.js` – Checklisten, Währungen und Quellenbibliothek
- `app.js` – lokale Datenbank, UI-Logik, Import/Export, Risiko-Berechnung
- `favicon.svg` – App-Icon
- `.nojekyll` – verhindert unnötige Jekyll-Verarbeitung auf GitHub Pages

## Quellenhinweis

Die App enthält Direktlinks zu Research-Quellen wie Zentralbanken, CFTC, Treasury, CME, Wirtschaftskalendern und relevanten Datenportalen. Die App lädt diese Daten nicht automatisch. Du trägst Werte, Datenstand und Quelle selbst ein.

## Version

Version 1.0
