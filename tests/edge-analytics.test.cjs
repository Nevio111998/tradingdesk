const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),version=JSON.parse(fs.readFileSync(path.join(root,'build-info.json'))).version;
const context=vm.createContext({window:{},Intl});vm.runInContext(fs.readFileSync(path.join(root,`analytics.v${version}.js`),'utf8'),context);
const A=context.window.FXAnalytics,clone=x=>JSON.parse(JSON.stringify(x));
const near=(a,b)=>assert(Math.abs(a-b)<1e-10,`${a} != ${b}`);
function open(id,confidence='High',direction='Long',symbol='AUDNZD'){
 const t={id,kind:'trade',status:'Idee',pair:symbol,direction,closedAt:'',realizedR:'',fields:{confidence,edgeBase:'Bullish',edgeQuote:'Bearish',edgeScoreBase:'4',edgeScoreQuote:'-2',yieldBase:'4.1',yieldQuote:'3.4',yieldPrev:'50',yieldPrev2:'40',driverMain:'RBA / RBNZ',riskRegime:'Risk-On'},factors:{edgefinder:'Bestätigt',rates:'Bestätigt',narrative:'Neutral',risk:'Widerspricht'}};
 A.capture(t,'Idee','Offen','2026-09-10T08:00:00Z');t.status='Offen';return t;
}
function close(t,r,date='2026-09-20T15:00'){A.capture(t,'Offen','Geschlossen','2026-09-20T14:00:00Z');t.status='Geschlossen';t.realizedR=r;t.closedAt=date;return t}
const t=open('new');const details=t.analyticsEntry.fundamentals;
assert.equal(t.analyticsEntry.version,1);assert.equal(t.analyticsEntry.detailsVersion,1);
assert.equal(details.edgeBaseBias,'Bullish');assert.equal(details.edgeQuoteBias,'Bearish');assert.equal(details.edgeScoreDifference,6);
assert.equal(details.base2y,4.1);assert.equal(details.quote2y,3.4);near(details.spread2yBp,70);assert.equal(details.previousSpread2yBp,50);assert.equal(details.marketDriver,'RBA / RBNZ');assert.equal(details.riskRegime,'Risk-On');
const before=JSON.stringify(t.analyticsEntry);t.fields.confidence='Low';t.fields.yieldBase='10';t.fields.edgeScoreBase='-100';t.factors.rates='Widerspricht';t.macroSnapshot={currencies:{AUD:{yield2:99}}};close(t,2);A.capture(t,'Watchlist','Offen','2026-09-22T10:00:00Z');assert.equal(JSON.stringify(t.analyticsEntry),before);
assert.equal(A.confidence(t),'High');assert.equal(A.rating(t,'rates'),'Bestätigt');near(A.detail(t,'spread2yBp'),70);
// Exact old v5.6.17 shape, including mutable fields which must never backfill it.
const old={...clone(t),id:'v5617',analyticsEntry:{version:1,capturedAt:'2026-09-01T12:00:00Z',pair:'AUDNZD',direction:'Long',confidence:'Medium',factors:{edgefinder:'Bestätigt',rates:'Widerspricht',narrative:'Bestätigt',risk:'Neutral'}}};
const oldBefore=JSON.stringify(old);assert.equal(A.confidence(old),'Medium');assert.equal(A.rating(old,'narrative'),'Bestätigt');assert.equal(A.detail(old,'base2y'),null);A.render([old]);assert.equal(JSON.stringify(old),oldBefore);
const noSnapshot={...clone(old),id:'pre-snapshot'};delete noSnapshot.analyticsEntry;assert.equal(A.confidence(noSnapshot),'Keine Daten');assert.equal(A.rating(noSnapshot,'rates'),'Keine Daten');assert.equal(A.detail(noSnapshot,'base2y'),null);
const incomplete=open('empty');delete incomplete.analyticsEntry.confidence;delete incomplete.analyticsEntry.factors.risk;assert.equal(A.confidence(incomplete),'Keine Daten');assert.equal(A.rating(incomplete,'risk'),'Keine Daten');
const missing={kind:'trade',status:'Idee',pair:'USDCHF',direction:'Long',fields:{edgeScoreBase:'0',edgeScoreQuote:'',yieldBase:'0',yieldQuote:'0',yieldPrev:'0'},factors:{}};A.capture(missing,'Idee','Offen','2026-09-10T08:00:00Z');assert.equal(missing.analyticsEntry.fundamentals.edgeScoreDifference,null);assert.equal(missing.analyticsEntry.fundamentals.base2y,0);assert.equal(missing.analyticsEntry.fundamentals.spread2yBp,0);assert.equal(missing.analyticsEntry.fundamentals.previousSpread2yBp,0);
assert.equal(A.fundamentals({fields:{yieldBase:'',yieldQuote:'2',edgeScoreBase:'x',edgeScoreQuote:2}}).spread2yBp,null);
assert.equal(A.fundamentals({fields:{yieldBase:'-0.25',yieldQuote:'0'}}).spread2yBp,-25);
for(const currency of ['USD','EUR','GBP','JPY','AUD','NZD','CAD','CHF']){
 const other=currency==='USD'?'CHF':'USD';const long=A.exposure({pair:currency+other,direction:'Long'}),short=A.exposure({pair:currency+other,direction:'Short'});
 assert.equal(long.longCurrency,currency);assert.equal(long.shortCurrency,other);assert.equal(short.longCurrency,other);assert.equal(short.shortCurrency,currency);
}
for(const invalid of [{pair:'AUDNZD',direction:''},{pair:'USDUSD',direction:'Long'},{pair:'XAUUSD',direction:'Long'},{pair:'EUR',direction:'Short'}])assert.equal(A.exposure(invalid).longCurrency,'Keine Daten');
const low=close(open('low','Low','Short'),-1,'2026-09-21T12:00');low.analyticsEntry.factors={edgefinder:'Neutral',rates:'Widerspricht',narrative:'Bestätigt',risk:'Bestätigt'};
const medium=close(open('medium','Medium','Long','EURUSD'),0,'2026-09-22T12:00');medium.analyticsEntry.factors.risk='Nicht verfügbar';
const rows=[t,old,noSnapshot,low,medium];
for(const [filter,ids] of [
 [{confidence:'High'},['new']], [{confidence:'Medium'},['v5617','medium']], [{confidence:'Low'},['low']], [{confidence:'Keine Daten'},['pre-snapshot']],
 [{longCurrency:'AUD'},['new','v5617','pre-snapshot']], [{shortCurrency:'AUD'},['low']], [{shortCurrency:'NZD'},['new','v5617','pre-snapshot']],
 [{edgefinder:'Neutral'},['low']], [{rates:'Widerspricht'},['v5617','low']], [{narrative:'Bestätigt'},['v5617','low']], [{risk:'Bestätigt'},['low']], [{risk:'Keine Daten'},['pre-snapshot','medium']],
 [{pair:'AUDNZD',direction:'Short',confidence:'Low',longCurrency:'NZD',shortCurrency:'AUD',edgefinder:'Neutral',rates:'Widerspricht',narrative:'Bestätigt',risk:'Bestätigt',from:'2026-09-21',to:'2026-09-21'},['low']],
 [{confidence:'High',rates:'Widerspricht'},[]]
])assert.deepEqual(Array.from(A.select(rows,filter).closed,x=>x.id),ids,JSON.stringify(filter));
const changed=clone(t);changed.pair='EURUSD';assert.equal(A.rating(changed,'rates'),'Keine Daten');assert.equal(A.confidence(changed),'Keine Daten');assert.equal(A.detail(changed,'spread2yBp'),null);
const numbers=[2,4,-1,-3,0,'',' '].map((realizedR,i)=>({id:i,realizedR,closedAt:`2026-09-${10+i}T12:00`}));const stats=A.stats(numbers);assert.equal(stats.n,5);assert.equal(stats.missing,2);assert.equal(stats.avgWin,3);assert.equal(stats.avgLoss,-2);assert.equal(stats.expectancy,.4);assert.equal(stats.avg,.4);assert.equal(stats.winRate,40);assert.equal(stats.pf,1.5);
near(stats.expectancy,stats.wins/stats.n*stats.avgWin+stats.losses/stats.n*stats.avgLoss);
assert.equal(A.stats([]).expectancy,null);assert.equal(A.stats([{realizedR:0}]).expectancy,0);assert.equal(A.stats([{realizedR:0}]).avgWin,null);assert.equal(A.stats([{realizedR:0}]).avgLoss,null);assert.equal(A.stats([{realizedR:3}]).expectancy,3);assert.equal(A.stats([{realizedR:-2}]).expectancy,-2);
const curve=A.series([2,-1,-2,4].map((realizedR,i)=>({id:i,realizedR,closedAt:`2026-09-${10+i}T12:00`})));assert.deepEqual(Array.from(curve.points,p=>p.total),[2,1,-1,3]);assert.deepEqual(Array.from(curve.points,p=>p.drawdown),[0,-1,-3,0]);assert.equal(curve.drawdown,3);
const mixedTime=A.series([{id:'later',realizedR:2,closedAt:'2026-09-10T12:30:00Z'},{id:'earlier',realizedR:-1,closedAt:'2026-09-10T14:00'}]);assert.deepEqual(Array.from(mixedTime.points,p=>p.id),['earlier','later']);
for(const keys of [['edgefinder','rates'],['rates','narrative'],['rates','risk'],['edgefinder','rates','narrative']]){
 const groups=A.grouped(rows,t=>A.combination(t,keys));assert.equal(groups.reduce((n,[,list])=>n+list.length,0),rows.length);assert(groups.some(([label])=>label.includes('Keine Daten')));
}
const malicious=clone(t);malicious.analyticsEntry.fundamentals.marketDriver='<img src=x onerror=alert(1)>';const html=A.render([...rows,malicious],A.emptyFilters());assert(!html.includes('<img src=x'));assert(html.includes('&lt;img'));
for(const key of A.FILTER_KEYS)assert(html.includes(`id="analytics-${key}"`));
for(const label of ['Confidence beim Öffnen','Long Currency','Short Currency','Market Driver beim Öffnen','Risk beim Öffnen','Rates + Market Driver','Rates + Risk','EdgeFinder + Rates + Market Driver','Drawdown der R-Summe','Sehr kleine Gruppe','Expectancy','Historische Entry-Werte ansehen'])assert(html.includes(label),label);
assert.equal((html.match(/<svg /g)||[]).length,2);assert(!html.includes('NaN'));assert(!html.includes('Infinity'));assert.equal(JSON.stringify(old),oldBefore);
const reset=A.emptyFilters();assert(Object.values(reset).every(v=>v===''));assert.equal(A.select(rows,reset).closed.length,rows.length);
console.log('PASS: extended and v5.6.17 snapshots, no historical backfill, eight-currency exposure, all filters, combinations, expectancy/win/loss metrics, drawdown, timezone ordering and compact rendering.');
