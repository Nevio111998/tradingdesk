# FX EdgeFinder Companion v5.3.0

Update für den EdgeFinder-kompatiblen FX-Makro-Workflow.

## Neu in v5.3.0

- Währungen & Rates erweitert:
  - Zentralbank-Ton mit „Leicht Hawkish“ und „Leicht Dovish“
  - eigenes Datumsfeld für die nächste Zentralbank-Sitzung
  - aktuelle Hike/Hold/Cut-Wahrscheinlichkeiten in %
  - Veränderung der Hike/Hold/Cut-Wahrscheinlichkeiten ggü. Vorwoche in Prozentpunkten
  - klarer Hinweis: Erwartungsänderung = Änderung des 12M-Pricings ggü. Vorwoche in bp
  - Datenqualität für Meeting/3M/12M: Quelle, Datenstand, Instrument und Methode

- G7 Paar-Makro-Checkliste erweitert:
  - 3M-Pricing-Differential
  - 12M-Pricing-Differential
  - relatives Repricing ggü. Vorwoche
  - erwartetes Leitzins-Differential für 3M und 12M
  - Real-Yield-Differential aus EdgeFinder Real Yield Base minus Quote
  - automatische Rates-Bestätigungsmatrix
  - Qualitätswarnungen bei unterschiedlichen Stichtagen, Methoden oder Horizonten

## Update

1. In der alten App zuerst Backup exportieren.
2. Alle Dateien aus diesem ZIP ins Root-Verzeichnis deines GitHub-Repositories hochladen.
3. `index.html` ersetzen und die neuen `v5.3.0`-Dateien mit hochladen.
4. GitHub Pages Deployment abwarten.
5. Webseite mit Strg+F5 neu laden.

Oben links muss `v5.3.0` und `Code geladen · v5.3.0` stehen.


## Version 5.4.0

- Referenzzinsen je Währung ergänzt: Fed-Obergrenze, Mittelpunkt, effektive Rate oder andere Policy-Referenz sauber dokumentieren.
- Datenqualität je Pricing-Horizont erweitert: Quelle, Datenstand, Instrument, Methode und Referenzzeitraum.
- 12M-Erwartungsänderung erhält eigenen aktuellen und historischen Datenstand sowie Kontrakt-/Kurvenangabe.
- Relative Rates & Repricing präzisiert: Pricing-Differentials zeigen mehr Straffung Base/Quote, nicht automatisch Trade-Bestätigung.
- Erwartete Leitzins-Differentiale werden nur bei passenden Referenzraten berechnet; gemischte Methoden werden als indikativ markiert.
- Relatives Repricing wird bei nicht vergleichbaren Daten blockiert und begründet; manueller Override ist möglich und wird gekennzeichnet.
- Rates-Bestätigungsmatrix ergänzt: Zinsniveau und Zinsmomentum getrennt, ohne künstlichen Gesamtscore.

Bestehende lokale Eingaben bleiben erhalten, weil nur neue optionale Felder ergänzt wurden.
