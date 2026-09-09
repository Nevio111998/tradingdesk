// Run with node tests/currency-final.test.cjs. Simulated DOM/storage, not browser QA.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const clone = value => JSON.parse(JSON.stringify(value));

function runtime(version) {
  const elements = new Map();
  const detailNodes = [];
  const listeners = new Map();
  const element = selector => {
    if (!elements.has(selector)) elements.set(selector, {
      innerHTML: '', textContent: '', classList: { toggle() {}, remove() {} },
      addEventListener() {}, focus(options) { this.focusOptions = options; },
      getBoundingClientRect() { return { height: 73 }; }
    });
    return elements.get(selector);
  };
  const document = {
    querySelector: element, querySelectorAll: selector => selector==='details[data-currency-detail]'?detailNodes:[],
    addEventListener(type, callback) { listeners.set(type, callback); },
    documentElement: { style: { setProperty() {} } }
  };
  const storage = { records: new Map(), meta: new Map(), assets: new Map() };
  const db = { transaction(name) {
    const tx = { objectStore() { return { put(value) {
      storage[name].set(value.id || value.key, clone(value));
    } }; } };
    queueMicrotask(() => tx.oncomplete?.());
    return tx;
  } };
  const context = vm.createContext({
    document, window: { addEventListener() {} }, console,
    setTimeout: () => 0, clearTimeout() {}, URL, Intl
  });
  vm.runInContext(read(`data.v${version}.js`), context);
  const app = read(`app.v${version}.js`);
  assert(app.endsWith('init();\n})();\n'));
  const expose = `window.test={state,renderCurrencies,handleBound,installEvents,saveNow,spreadHtml,
    ${version==='5.6.2'?'pairScreen,pairScreenRows,pairScreenData,pairScreenRates,pairScreenTable,pairScreenSummary,':''}D,pairList,pairData,macroPairStats,pairCheckTotals,PAIR_MACRO_GROUPS,pairCheckKey,defaultRecord,applyMacro,renderMacro,renderPairShortlist,handlePairCheck,pairSpreadHtml,pairRatesMatrixHtml,pairDataSnapshotHtml,relativeRepricingResult,expectedPolicyDifferentialResult${version !== '5.4.7' ? ',currencySummaryHtml' : ''}${['5.5.3','5.5.4','5.5.5','5.6.1','5.6.2'].includes(version) ? ',currencyDocumentationStatus,CURRENCY_DOCUMENTATION_FIELDS,currencyDetailOpen' : ''}${['5.5.4','5.5.5','5.6.1','5.6.2'].includes(version) ? ',currencyOverviewHtml,currencyUpcomingEvents,currencyWatchHtml' : ''}};`;
  vm.runInContext(app.replace(/init\(\);\n\}\)\(\);\n$/, expose + '\n})();\n'), context);
  const api = context.window.test;
  api.state.db = db;
  return { ...api, element, listeners, storage, detailNodes };
}



const rt=runtime('5.6.2');const m=rt.defaultRecord('macro');m.date='2026-09-09';
Object.assign(rt.state,{records:[m],record:m,id:m.id,route:'macro',tab:'pairs',pairId:m.pairs[0].id});
for(const [c,v] of [['USD','10'],['EUR','30'],['GBP','-5'],['CHF','0']])m.currencies[c]={pricingChange:v,pricingChangeHorizon:'12M'};
const eur=m.pairs.find(p=>p.pair==='EURUSD'),gbp=m.pairs.find(p=>p.pair==='GBPUSD'),chf=m.pairs.find(p=>p.pair==='USDCHF');
eur.status='Bereit für Trade-Idee';eur.direction='Long Bias';gbp.direction='Short Bias';chf.status='Watchlist';chf.notes='Preserved';
m.events=[{id:'past',currency:'USD',impact:'High',at:'2026-09-08',title:'Past'},{id:'low',currency:'USD',impact:'Low',at:'2026-09-09',title:'Low'},{id:'chf',currency:'CHF',impact:'High',at:'2026-09-10T12:00',title:'CHF event'},{id:'usd',currency:'USD',impact:'High',at:'2026-09-11T12:00',title:'USD event'},{id:'jpy',currency:'JPY',impact:'High',at:'2026-09-09',title:'Unrelated'}];
const saved=JSON.stringify(m);
assert.equal(rt.pairScreenRows(m).length,28);
rt.pairScreen.query='CHF';assert.equal(rt.pairScreenRows(m).length,7);
rt.pairScreen.query='EUR/USD';assert.equal(rt.pairScreenRows(m)[0].p.pair,'EURUSD');
rt.pairScreen.query='';
for(const [filter,count] of [['Bereit',1],['Long',1],['Short',1],['Neutral',26],['Kandidaten',26]]){rt.pairScreen.filter=filter;assert.equal(rt.pairScreenRows(m).length,count,filter)}
rt.pairScreen.filter='Alle';rt.pairScreen.sort='Repricing';
const rows=rt.pairScreenRows(m);assert.equal(rows[0].p.pair,'EURGBP');assert.equal(rows.at(-1).rates.value,null);
rt.pairScreen.sort='Status';assert.equal(rt.pairScreenRows(m)[0].p,eur);
assert.equal(rt.pairScreenData(m,chf).event.e.id,'chf');assert.equal(rt.pairScreenData(m,eur).event.e.id,'usd');
assert.equal(rt.pairScreenData(m,eur).rates.value,20);assert.equal(rt.pairScreenData(m,gbp).rates.value,-15);
assert.equal(JSON.stringify(m),saved,'Screener calculations cannot change stored data');
rt.pairScreen.query='XYZ';assert(rt.pairScreenTable(m).includes('Keine Paare'));assert.equal(rt.state.pairId,eur.id);
rt.pairScreen.query='';rt.pairScreen.filter='Alle';
const html=rt.renderPairShortlist(m);assert(!html.includes('class="pair-overview"'));assert(html.includes('Direkt zur Paaranalyse'));
rt.handleBound({dataset:{bind:'pairs.'+chf.id+'.status'},value:'Bereit für Trade-Idee',type:'select-one'});
rt.state.pairId=chf.id;assert(rt.pairScreenSummary(m,chf).includes('Bereit für Trade-Idee'));assert.equal(chf.notes,'Preserved');
const baseline=runtime('5.6.1');
for(const p of [eur,gbp,chf]){baseline.state.record=m;rt.state.record=m;const fields=h=>(h.match(/<input\b[^>]*>|<select\b[\s\S]*?<\/select>|<textarea\b[\s\S]*?<\/textarea>/g)||[]).filter(x=>x.includes('data-bind')||x.includes('data-pair-check')).sort();baseline.state.pairId=p.id;rt.state.pairId=p.id;assert.deepEqual(fields(rt.renderPairShortlist(m)),fields(baseline.renderPairShortlist(m)))}
console.log('PASS: screener filters/search/sort, missing values, event relevance/date, unchanged records, synchronized summary and preserved EURUSD/GBPUSD/USDCHF detail controls.');
