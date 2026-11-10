# TradingDesk · FX EdgeFinder Companion

TradingDesk is a local-first workspace for discretionary foreign-exchange research. It connects a morning macro assessment to a trade idea, captures the evidence available when the trade opens, and compares that evidence with the eventual result. The interface is in German.

[Open the app on GitHub Pages](https://nevio111998.github.io/tradingdesk/)

## A trade from research to review

1. **Prepare the morning analysis.** Record policy-rate expectations, bond yields, central-bank meeting probabilities and upcoming events across eight currencies. Screen their 28 pairs and flag assessments that need another look after a currency input changes.
2. **Document the decision.** Attach a pair assessment to a trade idea, review its EdgeFinder score and rate spread, and record entry, stop and risk. The trade keeps a copy of the macro assessment. Opening it captures the entry factors and confidence available at that moment.
3. **Review the outcome.** The journal groups closed trades and rejected ideas. Analytics compares realised results in units of initial risk (R) by pair, direction, currency exposure and entry factors. Each group shows how many trades have a recorded result. A break-even trade counts as zero R, while a missing result is excluded from the calculation.

The news view lets the user attach a sourced headline and a personal interpretation to a pair. The research panels support imported EdgeFinder snapshots and a manual ChatGPT handoff for structured macro reports, independent reviews and saved examples. The user supplies pricing inputs and executes trades separately.

## Architecture

GitHub Pages serves the HTML, CSS and browser JavaScript directly. Personal records live in the browser. The scheduled news refresh runs independently of the app.

| Component | Responsibility |
| --- | --- |
| `index.html`, `build-info.json` | Script loading order, active release files and SHA-256 fingerprints. |
| `data.base.v5.6.23.js`, `app.base.v5.6.23.js` | Data definitions, forms, trade lifecycle, calculations and IndexedDB persistence. |
| `app.v5.6.23.js`, `analytics.v5.6.23.js` | Pair and rates views, entry snapshots, journal metrics and drawdown on realised R. |
| `edgefinder-integration.js`, `chatgpt-macro.js`, `research-backup.js` | Imported research, manual report exchange and backup of six namespaced localStorage entries. |
| `scripts/refresh_news.py`, `.github/workflows/news.yml`, `news.js` | A Python standard-library job normalises RSS and Atom feeds into `feeds/news.json`. The browser filters headlines and saves selected items with the analysis. |

## Engineering decisions

**Historical evidence.** Today's rate expectations can change after a trade opens. The trade view distinguishes the current morning analysis from the copy taken when the idea was created from that analysis. Entry analytics use the frozen factors. Older entries without a captured factor remain available as missing data.

**Portable backups across two storage systems.** Trades, analyses and image attachments use IndexedDB (`fx-trade-desk`, version 1). JSON export includes these records and the research held in localStorage. Import validates the research payload and rolls back research writes if persistence fails. Legacy backups that omit research preserve the browser's existing research in both import modes.

**Feed outages.** The refresh job deduplicates headlines and retains earlier items when a source fails. The browser tries the published feed, falls back to the site copy and can display cached headlines with their timestamp.

## Run locally

From the repository root, serve the static files with Python 3.

```sh
python3 -m http.server 8000
```

Open [localhost:8000](http://localhost:8000). For the Vite development server, use Node.js 22.12+ and run `npm ci` followed by `npm run dev`. GitHub Pages serves the same static entry point.

Browser storage belongs to the current origin and profile. To move your workspace between localhost, GitHub Pages or another browser, export a full JSON backup under **Backup & Einstellungen** and import it at the destination.

## Verification

```sh
npm test
npm run test:news-feeds
```

The Node.js suites exercise startup with existing records, release dependencies, daily-analysis copies, trade transitions, historical snapshots, analytics, news persistence and backup recovery. The Python tests exercise feed parsing and failure handling with fixtures. Both commands run without installing the Vite development dependency.
