# FX EdgeFinder Companion v5

Statische GitHub-Pages-Web-App als Ergänzung zu EdgeFinder und als Trading-Journal für FX-Swing-Trades.

## Wichtige Änderung in v5

Die alte allgemeine **Tages-Makro-Checkliste** wurde entfernt. Die komplette Tages-Makroanalyse liegt jetzt direkt in der **G7 Paar-Makro-Checkliste**.

Dadurch musst du Zentralbanken, Zinserwartungen, Market Driver, Event-Risiko usw. nicht mehr in ein globales Feld quetschen. Du prüfst sie direkt dort, wo sie relevant sind: pro Währungspaar.

## Workflow

1. **Währungen & Rates**  
   Pro Währung einmal erfassen:
   - EdgeFinder-/Währungs-Bias
   - Zentralbank und Leitzins
   - Markpricing nächste Sitzung, 3M, 12M und Veränderung
   - 2Y-Rendite jetzt
   - 2Y-Rendite vor 1 Woche
   - 2Y-Rendite vor 2 Wochen
   - EdgeFinder-Realzins-Proxy
   - Datenstand, Quelle und Interpretation

2. **G7 Paar-Makro-Checkliste**  
   Alle 21 G7-Paare sind fix vorbereitet:
   - EURUSD, GBPUSD, AUDUSD, NZDUSD, USDCAD, USDJPY, CADJPY
   - EURGBP, EURAUD, EURNZD, EURCAD, EURJPY
   - AUDCAD, NZDCAD, GBPAUD, GBPNZD, GBPCAD, GBPJPY
   - AUDNZD, AUDJPY, NZDJPY

   Die App übernimmt automatisch die Währungsdaten und berechnet:
   - 2Y-Spread jetzt
   - Veränderung vs. vor 1 Woche
   - Veränderung vs. vor 2 Wochen

   Zusätzlich prüfst du pro Paar die vollständigen Makro-Blöcke:
   - Event Risk
   - Zentralbanken & Zinserwartungen
   - 2Y Yield Differential
   - EdgeFinder Real Yield
   - Dominanter Market Driver
   - Risk Sentiment & Cross-Asset
   - Intermarket Confirmation
   - Positioning & Crowding
   - Neue Daten seit EdgeFinder-Check

3. **Trade-Idee / Journal**  
   Nur interessante Paare werden als Trade-Idee übernommen. Dort dokumentierst du:
   - Entry, Stop, Target und Risiko
   - technische Analyse und Screenshots
   - fundamentale These und Invalidierung
   - Journal und Review

## Wichtig

Die App lädt keine Live-Marktdaten und führt keine Trades aus. Alle Daten bleiben lokal im Browser gespeichert. Vor dem Ersetzen einer älteren Version immer zuerst in der App ein Backup exportieren.

## GitHub Pages Setup

Den Inhalt dieses Ordners ins Root-Verzeichnis des Repositorys hochladen. Danach GitHub Pages aktivieren: **Settings → Pages → Deploy from a branch → main → /root**.

## Version

Version 5.0 — Tages-Makro vollständig in G7 Paar-Makro-Checkliste integriert.


## Changelog v5.1

- Fehler behoben: `Währungen & Rates` und `G7 Paar-Makro-Checkliste` konnten nicht geöffnet werden, weil die Währungs-Hilfsfunktionen im v5-Build fehlten.
- Datenmodell unverändert: vorhandene Backups und lokale Daten bleiben kompatibel.
