/* FX Trade Desk — research guide and checklist definitions. No live market data. */
'use strict';
const FXD = (() => {
const S = {
 edge:{name:'EdgeFinder',url:'https://edgefinder.com/',description:'Dein separates Fundamental-Ranking. Importiere hier keine Zugangsdaten.',category:'Workflow'},
 calendar:{name:'Forex Factory Kalender',url:'https://www.forexfactory.com/calendar',description:'Konsens, Vorwert, Veröffentlichungszeit und Actual. Zeitzone prüfen.',category:'Kalender'},
 tecalendar:{name:'Trading Economics Kalender',url:'https://tradingeconomics.com/calendar',description:'Globaler Wirtschaftskalender mit historischen Veröffentlichungen.',category:'Kalender'},
 fed:{name:'Federal Reserve – Monetary Policy',url:'https://www.federalreserve.gov/monetarypolicy.htm',description:'FOMC-Entscheide, Statements, Protokolle und Projektionen.',category:'Zentralbanken'},
 ecb:{name:'ECB – Monetary Policy',url:'https://www.ecb.europa.eu/mopo/html/index.en.html',description:'Leitzinsen, Entscheidungen und geldpolitische Kommunikation.',category:'Zentralbanken'},
 boe:{name:'Bank of England – Monetary Policy',url:'https://www.bankofengland.co.uk/monetary-policy',description:'MPC-Entscheide, Monetary Policy Reports und Protokolle.',category:'Zentralbanken'},
 boj:{name:'Bank of Japan – Monetary Policy',url:'https://www.boj.or.jp/en/mopo/index.htm',description:'Policy Statements, Outlook Reports, Minutes und Reden.',category:'Zentralbanken'},
 rba:{name:'RBA – Monetary Policy Decisions',url:'https://www.rba.gov.au/monetary-policy/int-rate-decisions/',description:'Cash-Rate-Entscheide und Begründungen.',category:'Zentralbanken'},
 rbnz:{name:'RBNZ – Monetary Policy',url:'https://www.rbnz.govt.nz/monetary-policy',description:'OCR, Monetary Policy Statements und Projektionen.',category:'Zentralbanken'},
 boc:{name:'Bank of Canada – Policy Rate',url:'https://www.bankofcanada.ca/core-functions/monetary-policy/key-interest-rate/',description:'Policy Rate, Termine und geldpolitische Mitteilungen.',category:'Zentralbanken'},
 snb:{name:'SNB – Monetary Policy Decisions',url:'https://www.snb.ch/en/the-snb/mandates-goals/monetary-policy/decisions',description:'Zinsentscheide, bedingte Inflationsprognose und Medienkonferenzen.',category:'Zentralbanken'},
 fedwatch:{name:'CME FedWatch',url:'https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html',description:'Aus Fed-Funds-Futures abgeleitete Wahrscheinlichkeiten für FOMC-Zinsentscheide.',category:'Zinserwartungen'},
 boesurvey:{name:'BoE Market Participants Survey',url:'https://www.bankofengland.co.uk/markets/market-intelligence',description:'Umfrageerwartungen professioneller Marktteilnehmer; kein kontinuierliches OIS-Pricing.',category:'Zinserwartungen'},
 bocsurvey:{name:'BoC Market Participants Survey',url:'https://www.bankofcanada.ca/publications/market-participants-survey/',description:'Quartalsweise Erwartungen professioneller Marktteilnehmer.',category:'Zinserwartungen'},
 asx:{name:'ASX – Interest Rate Derivatives',url:'https://www.asx.com.au/markets/trade-our-derivatives-market/derivatives-market-prices/interest-rate-derivatives',description:'Australische Zinsfutures und Kontraktdaten. Markterwartungen nur mit korrekter Kontraktmethodik ableiten.',category:'Zinserwartungen'},
 treasury:{name:'US Treasury – Interest Rate Statistics',url:'https://home.treasury.gov/policy-issues/financing-the-government/interest-rate-statistics',description:'Offizielle nominale Treasury-Renditen und TIPS-Realrenditen.',category:'Anleihen & Real Yields'},
 fred2y:{name:'FRED – US 2Y (DGS2)',url:'https://fred.stlouisfed.org/series/DGS2',description:'Historische tägliche US-2Y-Rendite. Veröffentlichungsverzögerung beachten.',category:'Anleihen & Real Yields'},
 fredreal:{name:'FRED – US 10Y TIPS (DFII10)',url:'https://fred.stlouisfed.org/series/DFII10',description:'Marktbasierte inflationsgeschützte 10-Jahres-Rendite.',category:'Anleihen & Real Yields'},
 ecbdata:{name:'ECB Data Portal',url:'https://data.ecb.europa.eu/',description:'Euro-Geldmarkt, €STR, Renditekurven und statistische Zeitreihen.',category:'Anleihen & Real Yields'},
 debt:{name:'Deutsche Finanzagentur',url:'https://www.deutsche-finanzagentur.de/',description:'Bundesanleihen und Kapitalmarktinformationen für deutsche Benchmark-Renditen.',category:'Anleihen & Real Yields'},
 boedata:{name:'BoE – Yield Curves',url:'https://www.bankofengland.co.uk/boeapps/database/Bank-Rate.asp',description:'Offizielle Bank-Rate-Historie; für Marktkurven die BoE-Datenbank bzw. einen verlässlichen Marktfeed verwenden.',category:'Anleihen & Real Yields'},
 bojdata:{name:'Japan Ministry of Finance',url:'https://www.mof.go.jp/english/policy/jgbs/reference/interest_rate/index.htm',description:'Japanische Staatsanleiherenditen und historische Zinsdaten.',category:'Anleihen & Real Yields'},
 rbadata:{name:'RBA – Interest Rates',url:'https://www.rba.gov.au/statistics/tables/',description:'Offizielle australische Zins- und Finanzmarktstatistiken.',category:'Anleihen & Real Yields'},
 rbnzdata:{name:'RBNZ – Statistics',url:'https://www.rbnz.govt.nz/statistics',description:'Neuseeländische Zins-, Finanzmarkt- und Wirtschaftsdaten.',category:'Anleihen & Real Yields'},
 bocdata:{name:'BoC – Government Bond Yields',url:'https://www.bankofcanada.ca/rates/interest-rates/canadian-bonds/',description:'Kanadische Staatsanleiherenditen nach Laufzeit.',category:'Anleihen & Real Yields'},
 snbdata:{name:'SNB Data Portal',url:'https://data.snb.ch/en',description:'Schweizer Renditen, SARON, Devisenkurse und Wirtschaftsstatistik.',category:'Anleihen & Real Yields'},
 cftc:{name:'CFTC – Commitments of Traders',url:'https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm',description:'Wöchentliche Futures-Positionierung, insbesondere Traders in Financial Futures.',category:'Positioning'},
 cftcschedule:{name:'CFTC – Release Schedule',url:'https://www.cftc.gov/MarketReports/CommitmentsofTraders/ReleaseSchedule/index.htm',description:'Typischerweise Freitag veröffentlicht, Positionen vom vorherigen Dienstag.',category:'Positioning'},
 vix:{name:'Cboe – VIX',url:'https://www.cboe.com/tradable_products/vix/',description:'Informationen zum impliziten Volatilitätsindex des S&P 500.',category:'Risk & Intermarket'},
 eia:{name:'EIA – Oil & Energy',url:'https://www.eia.gov/petroleum/',description:'US-Energiestatistik, Ölbestände und Marktinformationen.',category:'Risk & Intermarket'},
 imf:{name:'IMF – World Economic Outlook',url:'https://www.imf.org/en/Publications/WEO',description:'Makroökonomische Prognosen und globaler Konjunkturkontext.',category:'Makro & News'},
 reuters:{name:'Reuters – Markets',url:'https://www.reuters.com/markets/',description:'Aktuelle Finanzmarktnachrichten und Marktreaktionen. Verfügbarkeit kann variieren.',category:'Makro & News'},
 tradingview:{name:'TradingView',url:'https://www.tradingview.com/',description:'Charting, Vergleich von Renditen und Marktstruktur. Datenanbieter und Verzögerung prüfen.',category:'Workflow'},
};
const CURRENCIES = {
 USD:{name:'US-Dollar',bank:'Federal Reserve',source:'fed',rate:'fedwatch',yield:'fred2y',other:['treasury','fredreal'],focus:'Fed-Pricing, US-2Y, Realrenditen, Wachstum relativ zu anderen Ländern, globale USD-Nachfrage und Liquidität.'},
 EUR:{name:'Euro',bank:'Europäische Zentralbank',source:'ecb',rate:'ecbdata',yield:'ecbdata',other:['debt'],focus:'€STR/OIS, EZB-Kommunikation, deutsche 2Y-Benchmark, Energie und relative Eurozonen-Konjunktur.'},
 GBP:{name:'Britisches Pfund',bank:'Bank of England',source:'boe',rate:'boesurvey',yield:'boedata',other:[],focus:'SONIA/OIS, BoE-Pricing, UK-Gilts, Löhne, Dienstleistungen, Inflation und Fiskalrisiken.'},
 JPY:{name:'Japanischer Yen',bank:'Bank of Japan',source:'boj',rate:'boj',yield:'bojdata',other:[],focus:'BoJ-Normalisierung, japanische und globale Renditen, Carry-Unwinding, Risk-Off und mögliche Interventionen.'},
 AUD:{name:'Australischer Dollar',bank:'Reserve Bank of Australia',source:'rba',rate:'asx',yield:'rbadata',other:[],focus:'RBA-Pricing, australische 2Y-Renditen, China, Industriemetalle und globales Risikosentiment.'},
 NZD:{name:'Neuseeländischer Dollar',bank:'Reserve Bank of New Zealand',source:'rbnz',rate:'rbnzdata',yield:'rbnzdata',other:[],focus:'OCR/OIS, RBNZ-Pfad, China/Asien, Exportpreise und Risk Sentiment.'},
 CAD:{name:'Kanadischer Dollar',bank:'Bank of Canada',source:'boc',rate:'bocsurvey',yield:'bocdata',other:['eia'],focus:'BoC-Pricing, US-Konjunktur, Handelsrisiken, Öl und kanadisch-amerikanische Zinsdifferenz.'},
 CHF:{name:'Schweizer Franken',bank:'Schweizerische Nationalbank',source:'snb',rate:'snbdata',yield:'snbdata',other:[],focus:'SNB, SARON/OIS, Schweizer Renditen, Inflation, EUR-Umfeld und Safe-Haven-/Interventionsrisiken.'}
};
// All checklist states are explicit. 'Not applicable' is never counted as a completed analysis.
const I=(id,label,help,links=[])=>({id,label,help,links});
const F=(id,label,type='text',placeholder='',options=null,hint='')=>({id,label,type,placeholder,options,hint});
const fields={
 event:[F('nextEvent','Nächster relevanter Catalyst'),F('nextEventAt','Datum / Uhrzeit','datetime-local'),F('eventPlan','Was tue ich vor und nach dem Event?','textarea','Risiko reduzieren, abwarten, kein Entry vor der Veröffentlichung …')],
 edge:[F('edgeBase','EdgeFinder Base-Bias','select','',['Strong Bullish','Bullish','Neutral','Bearish','Strong Bearish']),F('edgeQuote','EdgeFinder Quote-Bias','select','',['Strong Bullish','Bullish','Neutral','Bearish','Strong Bearish']),F('edgeNotes','Relative Stärke und wichtigste Daten','textarea','Welche Währung ist stärker? Was ist bereits im EdgeFinder enthalten?')],
 policy:[F('policyBase','Base-Zentralbank / aktueller Leitzins','text','z. B. Fed, … %'),F('policyQuote','Quote-Zentralbank / aktueller Leitzins','text','z. B. BoJ, … %'),F('policyPricing','Marktpricing: nächste Sitzung / 3–12 Monate','textarea','Erwartete bp, Vergleich zu letzter Woche und wichtigste Überraschung'),F('policyChange','Änderung gegenüber der bisherigen Markterwartung','textarea')],
 rates:[F('yieldBase','Base 2Y (%)','number','0.000'),F('yieldQuote','Quote 2Y (%)','number','0.000'),F('yieldPrev','2Y-Spread vor 5 Handelstagen (bp)','number','Optional'),F('yieldSource','Quelle / Datenzeitpunkt','text','Anbieter und Stand'),F('yieldNotes','Warum bewegt sich der Spread?','textarea','Monetary Policy, Wachstum, Inflation, Fiskalprämie …')],
 real:[F('realBase','Base-Realrendite (%)','number','Optional'),F('realQuote','Quote-Realrendite (%)','number','Optional'),F('realTenor','Laufzeit / Definition','text','z. B. 10Y TIPS vs. vergleichbare inflationsindexierte Anleihe'),F('realSource','Quelle / Datenzeitpunkt'),F('realNotes','Interpretation und Einschränkungen','textarea','Gleiche Laufzeit? Liquidität? Alternative reale Kurzfristrate?')],
 driver:[F('driverMain','Haupttreiber des Marktes'),F('driverSecond','Sekundärer Treiber'),F('driverEvidence','Konkrete Evidenz / Marktreaktion','textarea','Welche Nachricht, welche Reaktion in Rates, FX oder anderen Märkten?'),F('driverChange','Was würde den dominanten Driver ändern?','textarea')],
 sentiment:[F('riskRegime','Marktregime','select','',['Strong Risk-On','Risk-On','Neutral','Risk-Off','Strong Risk-Off']),F('riskEvidence','Aktien / VIX / Credit / Liquidität','textarea','Welche Märkte bestätigen das Regime?')],
 intermarket:[F('crossMarkets','Relevante Märkte und Veränderungen','textarea','AUD: China, Copper. CAD: Öl. JPY: Yields und Carry …'),F('crossConclusion','Bestätigung oder Widerspruch','textarea')],
 positioning:[F('positionDate','Datenstand / Report-Datum','date'),F('positionNotes','Netto-Positionierung / Veränderung / Extrem','textarea','Aktuelle Position, Veränderung, historisches Perzentil und Squeeze-Risiko')],
 surprise:[F('surpriseBase','Base: jüngste Überraschungen','textarea'),F('surpriseQuote','Quote: jüngste Überraschungen','textarea'),F('surpriseRelative','Relative Veränderung des Wachstum-/Inflationsausblicks','textarea')],
 ranking:[F('rankStrong','Stärkste Währungen'),F('rankWeak','Schwächste Währungen'),F('rankReason','Warum genau dieses Paar?','textarea')],
 thesis:[F('thesis','Meine fundamentale Trade-These (max. 3 Sätze)','textarea','Warum sollte dieser Trade über die nächsten Tage funktionieren?'),F('catalyst','Was soll die Bewegung auslösen oder fortsetzen?','textarea'),F('horizon','Geplanter Zeithorizont','select','',['2–5 Handelstage','1–3 Wochen','Länger / flexibel']),F('confidence','Meine Einschätzung','select','',['High','Medium','Low'])],
 invalidation:[F('fundamentalInvalidation','Fundamentale Invalidierung','textarea','Welche Daten / Repricing / Ereignisse machen die These falsch?'),F('technicalInvalidation','Technische Invalidierung','textarea','Welche Marktstruktur darf nicht brechen?'),F('exitPlan','Konkreter Handlungsplan','textarea','Was tue ich bei Invalidierung, Überraschung oder Gap?')],
 technical:[F('d1Bias','D1 Bias','select','',['Bullish','Bearish','Range','Unklar']),F('h4Structure','H4 Struktur','textarea','Trend, Swing-Highs/Lows, wichtige Zonen'),F('setup','Setup / Entry-Modell','textarea','Retracement, FVG/50 %, Liquidität, M15-Momentum …'),F('technicalNotes','Was bestätigt den Entry?','textarea')],
 execution:[F('entry','Geplanter Entry','number','Preis'),F('stop','Stop Loss','number','Preis'),F('target','Take Profit','number','Preis'),F('riskPercent','Risiko pro Trade (%)','number','0.5'),F('account','Kontogrösse','number','Optional'),F('pipValue','Pip-/Punktwert je Einheit in Kontowährung','number','Optional'),F('costs','Spread / Swap / Gebühren / Slippage','textarea','Broker, erwartete Haltekosten und Ausführungsrisiken'),F('orderType','Order-Typ','select','',['Limit','Stop','Market','Noch offen']),F('executionPlan','Order- und Management-Plan','textarea','Entry-Trigger, SL-Logik, Teilgewinne, Stop-Anpassung, Umgang mit News')],
 exposure:[F('openExposure','Bestehende Positionen / Netto-Exposure','textarea','z. B. EURUSD short + GBPUSD short = kumuliertes USD-Long-Risiko'),F('totalRisk','Gesamtrisiko und Limits','textarea','Offenes Risiko, korrelierte Positionen, Tages-/Gesamt-DD und Prop-Regeln'),F('gapRisk','Wochenende, Event- und Gap-Risiko','textarea')]
};
const groups=[
{id:'event',number:'01',title:'Event Risk',subtitle:'Kalender zuerst: Was kann die These zerstören?',fields:fields.event,items:[
I('calendarToday','Wirtschaftskalender für heute geprüft','Prüfe nur relevante Daten, aber für beide Währungen. Konsens und Vorwert sind wichtiger als die reine Schlagzeile.',['calendar','tecalendar']),
I('calendarFuture','Nächste 2–3 Handelstage geprüft','Ein Swing-Trade muss auch die bevorstehenden Veröffentlichungen überstehen.',['calendar']),
I('eventsBoth','High-Impact-Daten beider Währungen identifiziert','Inflation, Arbeitsmarkt, Wachstum, PMI/ISM und unerwartete politische Termine berücksichtigen.',['calendar']),
I('speeches','Zentralbankreden und Entscheidungen geprüft','Auch Reden und Protokolle können Zinserwartungen verschieben.',['fed','ecb','boe','boj','rba','rbnz','boc','snb']),
I('eventRiskPlan','Event-Risiko und Management-Plan festgelegt','No-Trade-Fenster, Positionsgrösse oder Stop-/Exit-Plan festlegen. Ein Stop schützt nicht garantiert vor Gaps.')],macro:true},
{id:'edge',number:'02',title:'EdgeFinder – Fundamentals',subtitle:'Dein bestehender Prozess bleibt die Grundlage.',fields:fields.edge,items:[
I('edgeComplete','EdgeFinder-Ablauf vollständig durchgeführt','Nutze deine bestehende Fundamental-Checkliste. Diese App ersetzt sie nicht.',['edge']),
I('edgeRelative','Base und Quote relativ verglichen','FX ist relativ: Eine schwache Währung kann gegen eine noch schwächere steigen.'),
I('edgeOverlap','Überschneidungen mit Zinsen und Makro markiert','Zentralbank, 2Y und EdgeFinder-Zinsscore nicht als drei unabhängige Bestätigungen zählen.')],macro:false},
{id:'policy',number:'03',title:'Zentralbanken & Zinserwartungen',subtitle:'Nicht hawkish an sich – sondern hawkisher als eingepreist.',fields:fields.policy,items:[
I('policyLatest','Letzte Entscheidungen und Kommunikation beider Banken geprüft','Leitzins, Datum, Statement, Projektionen, Protokoll und jüngste Reden ansehen.',['fed','ecb','boe','boj','rba','rbnz','boc','snb']),
I('policyTone','Aktueller Ton und Veränderung eingeordnet','Hawkish/dovish relativ zur letzten Sitzung und zum Markt-Konsens beurteilen.'),
I('policyMarket','Marktbasierte Erwartungen für die nächsten Sitzungen geprüft','OIS oder Futures bevorzugen. FedWatch ist für die Fed; Umfragen sind keine identischen Futures-Wahrscheinlichkeiten.',['fedwatch','ecbdata','boesurvey','bocsurvey','asx']),
I('policyReprice','Änderung der eingepreisten bp über Tage/Wochen geprüft','Der marginale Wechsel der Erwartungen bewegt FX oft stärker als der unveränderte Leitzins.'),
I('policyDivergence','Relatives Repricing beider Zentralbanken verglichen','Welche Währung gewinnt relativ an erwarteter Zinsattraktivität?'),
I('policySource','Datenstand und Quelle dokumentiert','Bei fehlendem Live-OIS: keine exakten Wahrscheinlichkeiten aus Schätzungen erfinden.')],macro:true},
{id:'rates',number:'04',title:'2-Year Yield Differential',subtitle:'Gleiche Laufzeit, gleicher Zeitpunkt, relative Veränderung.',fields:fields.rates,items:[
I('ratesLevel','2Y-Renditen beider Länder geprüft','Für EUR z. B. deutsche 2Y als Benchmark. Bei CHF die entsprechende Schweizer Laufzeit verwenden.',['fred2y','ecbdata','debt','bojdata','rbadata','rbnzdata','bocdata','snbdata']),
I('ratesChange','Veränderung 1 Tag / 5 Tage / 1 Monat geprüft','Nicht nur das Niveau betrachten. Notiere, ob die Differenz sich ausweitet oder verengt.'),
I('ratesSpread','Base minus Quote berechnet','Spread in bp = (Base 2Y % − Quote 2Y %) × 100. Steigend ist zunächst relativ zugunsten der Base.'),
I('ratesCause','Ursache der Renditebewegung verstanden','Zentralbankpricing, Wachstum, Inflation, Risiko- oder Fiskalprämien unterscheiden.'),
I('ratesConfirm','Spread-Veränderung auf den geplanten Trade bezogen','Nominaler Yield-Vorteil ist keine Garantie für Währungsaufwertung.'),
I('ratesQuality','Gleiche Laufzeit und Datenzeitpunkt verglichen','Bei illiquiden Märkten, Feiertagen oder unterschiedlichen Datumsständen Einschränkungen notieren.')],macro:true},
{id:'real',number:'05',title:'Real Yields',subtitle:'Reale Renditen korrekt vergleichen, nicht beliebige Proxys mischen.',fields:fields.real,items:[
I('realDefinition','Real-Yield-Definition und Laufzeit festgelegt','10Y-TIPS sind langfristige Realrenditen. Nominal-2Y minus aktuelle CPI ist dagegen nur eine grobe ex-post-Näherung und nicht gleichwertig.',['treasury','fredreal']),
I('realComparable','Vergleichbare Daten für beide Länder verfügbar','Gleiche Laufzeit und möglichst gleiche Methodik. Wenn nicht verfügbar: offen als Datenlücke kennzeichnen.'),
I('realChange','Richtung der realen Renditedifferenz geprüft','Relatives Niveau und Veränderung betrachten. Inflationsprämien und Liquidität können verzerren.'),
I('realOverlap','Double Counting mit Nominal Yields berücksichtigt','Real Yields, Inflationserwartungen und Nominal Yields sind miteinander verbunden; keine künstlich unabhängigen Stimmen daraus machen.')],macro:true},
{id:'driver',number:'06',title:'Dominanter Market Driver',subtitle:'Was handelt der Markt wirklich – und warum?',fields:fields.driver,items:[
I('driverNews','Relevante Overnight-News und Entwicklungen geprüft','Aktuelle, datierte Quellen lesen: Zinsen, Inflation, Fiskalpolitik, Handelskonflikte, Krieg, China, Carry oder Liquidität.',['reuters','fed','ecb','boj']),
I('driverRank','Haupttreiber und maximal zwei Nebentreiber benannt','Nicht zehn gleichgewichtete Narrative sammeln. Eine aktuelle Priorität formulieren.'),
I('driverEvidenceCheck','Marktreaktion bestätigt meine Interpretation','Beispielsweise Rates-Repricing, FX, Öl oder Aktien. Nachricht und tatsächliche Reaktion können auseinanderfallen.'),
I('driverInvalidation','Möglichen Regimewechsel beschrieben','Welches Ereignis könnte den bisherigen Driver verdrängen?')],macro:true},
{id:'sentiment',number:'07',title:'Risk Sentiment & Cross-Asset',subtitle:'Risk-On/Off anhand mehrerer Märkte beurteilen.',fields:fields.sentiment,items:[
I('riskEquity','S&P 500 und Nasdaq geprüft','Aktienentwicklung als Kontext, nicht als alleinigen FX-Signalgeber nutzen.',['tradingview']),
I('riskVix','VIX und Volatilitätsentwicklung geprüft','VIX ist implizite S&P-500-Volatilität, kein universeller Risk-Off-Schalter.',['vix']),
I('riskBonds','Globale Renditen und ggf. Credit-/Liquiditätsstress geprüft','Flight-to-quality, Carry-Unwinding und Fiskalstress können sehr unterschiedlich wirken.',['treasury']),
I('riskRegimeCheck','Regime und Konsequenz für das Paar festgehalten','USD, JPY und CHF sind nicht in jedem Schock automatisch gleich stark.')],macro:true},
{id:'intermarket',number:'08',title:'Intermarket Confirmation',subtitle:'Nur Zusammenhänge prüfen, die für das Paar relevant sind.',fields:fields.intermarket,items:[
I('crossRelevant','Relevante Rohstoffe / China / Yields ausgewählt','AUD: China/Copper. NZD: Asien/Exportpreise. CAD: Öl/USA. JPY: Carry/Yields. CHF: Europa/Risk.',['eia','tradingview']),
I('crossActual','Tatsächliche Reaktion statt fixer Korrelation geprüft','Korrelationen sind regimeabhängig. Öl hoch kann z. B. über Inflations- und Risikokanäle unterschiedliche FX-Wirkungen haben.'),
I('crossConflict','Widersprüche dokumentiert','Ein widersprechender Cross-Market-Faktor ist ein Risiko und kein Grund, eine passende Story zu erfinden.')],macro:true},
{id:'positioning',number:'09',title:'Positioning & Crowding',subtitle:'Wichtiger für Asymmetrie und Squeeze-Risiko als als Entry-Signal.',fields:fields.positioning,items:[
I('cotLatest','Aktuelles COT/TFF-Datum und Positionierung geprüft','COT ist meist ein Wochenbericht mit Dienstag-Daten und Freitagsveröffentlichung, kein Live-Positioning.',['cftc','cftcschedule']),
I('cotChange','Veränderung und historisches Extrem beurteilt','Netto-Long/Short allein reicht nicht: Vorwochenvergleich und historische Einordnung helfen.'),
I('cotCrowding','Crowded-Trade- und Squeeze-Risiko eingeschätzt','Extremes Positioning kann Trends fortsetzen oder bei Überraschungen eine Gegenbewegung verstärken.'),
I('cotAvailable','Fehlende oder veraltete Daten explizit markiert','Optionaler Faktor: wenn keine geeigneten Daten verfügbar sind, N/A mit Begründung verwenden.')],macro:true},
{id:'surprise',number:'10',title:'Relative Economic Surprise',subtitle:'Nicht gut gegen schlecht, sondern besser/schlechter als erwartet.',fields:fields.surprise,items:[
I('surpriseData','Jüngste relevante Daten beider Länder mit Konsens verglichen','Actual − Forecast einordnen; bei Arbeitslosenquote oder Inflationsdaten ist die Interpretation kontextabhängig.',['calendar','tecalendar']),
I('surpriseRelativeCheck','Relative Veränderung des Ausblicks beurteilt','Welche Wirtschaft überrascht stärker und wie verändert das den erwarteten Zentralbankpfad?'),
I('surpriseReaction','Datenreaktion mit dem aktuellen Marktregime abgeglichen','Schwache Daten können je nach dominierendem Driver unterschiedliche Reaktionen auslösen.'),
I('surpriseOverlap','EdgeFinder-Überschneidungen nicht erneut gewichtet','Nur ergänzende Überraschungen und Veränderungen dokumentieren, nicht dessen Rohdaten nochmals zählen.')],macro:true},
{id:'ranking',number:'11',title:'Currency Ranking & Pair Selection',subtitle:'Stärke gegen Schwäche statt wahllos 28 Charts.',fields:fields.ranking,items:[
I('rankingDone','Aktuelle relative Währungsstärke eingeordnet','EdgeFinder, Macro und Rates zusammenführen; kein automatisches Ranking aus unvollständigen Daten.'),
I('rankingPair','Konkretes Paar mit relativer These gewählt','Base und Quote klar benennen. Ein Long-Paar bedeutet Base kaufen und Quote verkaufen.'),
I('rankingNoForce','Kein Setup aus einer neutralen Marktmeinung erzwungen','Wenn die relative Divergenz unklar ist, bleibt die Idee auf der Watchlist.')],macro:false},
{id:'thesis',number:'12',title:'Fundamentale Trade-These',subtitle:'Drei klare Sätze statt einer Sammlung von Argumenten.',fields:fields.thesis,items:[
I('thesisClear','These in maximal drei Sätzen formuliert','Warum steigt/fällt die Base relativ zur Quote? Was ist der wichtigste Mechanismus?'),
I('thesisCatalyst','Catalyst oder fortsetzender Treiber benannt','Eine gute These braucht nicht immer ein neues Event, aber einen plausiblen Mechanismus für den geplanten Horizont.'),
I('thesisConflicts','Wichtigste Gegenargumente ausdrücklich berücksichtigt','Auch eine starke Idee darf widersprüchliche Faktoren enthalten; benenne sie statt sie zu verstecken.')],macro:false},
{id:'invalidation',number:'13',title:'Invalidierung & Gegenrisiken',subtitle:'Was müsste passieren, damit ich falsch liege?',fields:fields.invalidation,items:[
I('invalidationFund','Fundamentale Invalidierung konkret festgelegt','Beispielsweise entgegengesetztes OIS-Repricing, unerwartete Daten oder eine neue Zentralbankreaktionsfunktion.'),
I('invalidationTechnical','Technische Invalidierung definiert','Der Stop gehört an einen logisch invalidierenden Punkt – nicht an eine gewünschte Lotgrösse.'),
I('invalidationAction','Plan bei News, Gap und Thesewechsel festgelegt','Wann neu beurteilen, reduzieren oder schliessen? Ein Stop ist bei Gaps keine garantierte Ausführung.')],macro:false},
{id:'technical',number:'14',title:'Technische Analyse',subtitle:'Erst Macro und Pair Selection, danach Entry und Timing.',fields:fields.technical,items:[
I('techD1','D1 Bias und übergeordnete Struktur klar','Trend, Range oder kein klares Setup. Nicht gegen die eigene Makrothese umdeuten.'),
I('techH4','H4 Struktur, Retracement und Zone geprüft','Relevante Swing-Highs/Lows, Liquidität, Support/Resistance oder FVG/50 % nach deiner Strategie.'),
I('techM15','M15-Entry und Momentum-Bestätigung vorhanden','Nur abhaken, wenn der konkrete Entry-Trigger tatsächlich erfüllt ist.'),
I('techInvalidation','Technischer Stop und Ziel sind strukturell sinnvoll','Volatilität, Spread und erwartete Schwankungsbreite berücksichtigen.'),
I('techNoFomo','Kein Einstieg allein wegen eines schönen Charts oder FOMO','Wenn Macro nicht passt, nicht nachträglich Begründungen konstruieren.')],macro:false},
{id:'execution',number:'15',title:'Entry, Risiko & Execution',subtitle:'Preis, Stop, Kosten und Positionsgrösse vor der Order.',fields:fields.execution,items:[
I('execPlan','Entry, Stop, Ziel und Order-Typ festgelegt','Werte erst nach einem konkreten Setup eintragen. Geplanter und tatsächlich ausgeführter Preis unterscheiden sich.'),
I('execRR','CRV nach deiner Strategie ausreichend','R-Multiple und reale Kosten beachten. 1:2 ist ein möglicher Mindestfilter, kein allgemeingültiger Vorteil.'),
I('execSize','Positionsgrösse und Risiko korrekt berechnet','Pip-Wert in Kontowährung, Kontraktgrösse, Währungsumrechnung und Stop-Distanz brokerabhängig prüfen.'),
I('execCosts','Spread, Swap, Gebühren und Slippage berücksichtigt','Bei Swing Trades können Finanzierungskosten und Rollovers die Rendite beeinflussen.'),
I('execValidation','Broker-/Prop-Limits und Pre-Trade-Validierung geprüft','Tages-/Gesamt-DD, Margin, Hebel, Mindestabstand, Handelszeit und korrekte Orderparameter.'),
I('execManage','Trade-Management und Exit-Plan schriftlich definiert','Wann Stop verschieben? Teilgewinn? Wann wird die Idee neu beurteilt?')],macro:false},
{id:'exposure',number:'16',title:'Korrelation & Gesamt-Exposure',subtitle:'Mehrere FX-Paare können dieselbe Wette sein.',fields:fields.exposure,items:[
I('exposureOpen','Alle offenen Positionen und gemeinsame Währungen geprüft','EURUSD short + GBPUSD short können kumulierte USD-Long-Exposure erzeugen.'),
I('exposureTotal','Gesamtrisiko und korrelierte Verluste geprüft','Risiko nicht einfach pro Ticket isoliert betrachten. Auch Gold/Indizes können denselben Makrodriver enthalten.'),
I('exposureLimits','Margin, Drawdown- und Prop-Regeln geprüft','Kontospezifische Limits und gleichzeitig mögliche Verlustszenarien vor einer neuen Order berücksichtigen.'),
I('exposureWeekend','Weekend-, News- und Gap-Risiko akzeptiert','Besonders relevant bei gehebelten Positionen und illiquiden Handelszeiten.')],macro:false},
{id:'final',number:'17',title:'Final Trade Validation',subtitle:'Keine Häkchen erzwingen. Konflikte bleiben sichtbar.',fields:[],items:[
I('finalEvidence','Alle wesentlichen Daten haben einen nachvollziehbaren Stand / Quelle','Fehlende Informationen und veraltete Daten sind klar markiert.'),
I('finalDrivers','Dominanter Driver und relative Trade-These sind konsistent','Keine vierfach gezählte Zinsstory als vier unabhängige Begründungen.'),
I('finalContradictions','Wesentliche Widersprüche, Gegenrisiken und Invalidierung verstanden','Eine echte Gegenposition lässt sich formulieren.'),
I('finalEvent','Event- und Exposure-Risiko sind akzeptabel','Auch bei gutem Setup kann Nicht-Handeln die richtige Entscheidung sein.'),
I('finalSetup','Technischer Trigger, Stop, Ziel und Positionsgrösse sind bereit','Keine Order nur aufgrund einer Fundamentalmeinung.'),
I('finalIndependent','Ich würde diesen Trade ohne bestehende Position/FOMO ebenfalls eingehen','Bewerte die neue Entscheidung unabhängig von versunkenen Kosten und bisherigen Gewinnen/Verlusten.'),
I('finalDecision','Bewusste Entscheidung dokumentiert: Trade oder kein Trade','Das Rating ist eine eigene Beurteilung und kein mechanisch erzeugtes Kauf-/Verkaufssignal.')],macro:false}
];
const FACTORS=[
{id:'growth',title:'Growth / Inflation / Macro',description:'Relative Wirtschaftsdynamik und neue Überraschungen. EdgeFinder-Überschneidungen berücksichtigen.'},
{id:'rates',title:'Monetary Policy / Rates',description:'Zentralbankpricing, 2Y und Real Yields als zusammenhängende Zins-Säule beurteilen.'},
{id:'narrative',title:'Market Narrative',description:'Dominanter Driver, tatsächliche Marktreaktion und möglicher Regimewechsel.'},
{id:'risk',title:'Risk / Positioning / Cross-Asset',description:'Risk-Regime, relevante Intermarket-Signale und Crowding.'},
{id:'technical',title:'Technical Structure',description:'D1/H4/M15, Invalidierung und konkreter Entry-Trigger.'}
];
const outcomes=['Unbewertet','Bestätigt','Neutral','Widerspricht','Nicht verfügbar'];
const bias=['Unbewertet','Strong Bullish','Bullish','Slightly Bullish','Neutral','Slightly Bearish','Bearish','Strong Bearish'];
const status=['Idee','Watchlist','Bereit','Offen','Geschlossen','Verworfen'];
const allItems=groups.flatMap(g=>g.items);
return {S,CURRENCIES,fields,groups,FACTORS,outcomes,bias,status,allItems};
})();
