// Run with node tests/currency-final.test.cjs. Simulated DOM/storage, not browser QA.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const clone = value => JSON.parse(JSON.stringify(value));

const preferences=new Map();
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
    localStorage:{getItem:k=>preferences.get(k)||null,setItem:(k,v)=>preferences.set(k,v)}, document, window: { addEventListener() {} }, console,
    setTimeout: () => 0, clearTimeout() {}, URL, Intl
  });
  vm.runInContext(read(`data.v${version}.js`), context);
  const app = read(`app.v${version}.js`);
  assert(app.endsWith('init();\n})();\n'));
  const expose = `window.test={${version==='5.6.4'?'pairTradeRecord,pairOpenPoints,pairDirectionalFactor,':''}state,renderCurrencies,handleBound,installEvents,saveNow,spreadHtml,
    ${version==='5.6.3'?'pairDetailStates,rememberPairDetail,loadPairDetails,pairDetailHtml,pairMacroChecklistHtml,':''}${['5.6.2','5.6.3'].includes(version)?'pairScreen,pairScreenRows,pairScreenData,pairScreenRates,pairScreenTable,pairScreenSummary,':''}D,pairList,pairData,macroPairStats,pairCheckTotals,PAIR_MACRO_GROUPS,pairCheckKey,defaultRecord,applyMacro,renderMacro,renderPairShortlist,handlePairCheck,pairSpreadHtml,pairRatesMatrixHtml,pairDataSnapshotHtml,relativeRepricingResult,expectedPolicyDifferentialResult${version !== '5.4.7' ? ',currencySummaryHtml' : ''}${['5.5.3','5.5.4','5.5.5','5.6.1','5.6.2','5.6.3'].includes(version) ? ',currencyDocumentationStatus,CURRENCY_DOCUMENTATION_FIELDS,currencyDetailOpen' : ''}${['5.5.4','5.5.5','5.6.1','5.6.2','5.6.3'].includes(version) ? ',currencyOverviewHtml,currencyUpcomingEvents,currencyWatchHtml' : ''}};`;
  vm.runInContext(app.replace(/init\(\);\n\}\)\(\);\n$/, expose + '\n})();\n'), context);
  const api = context.window.test;
  api.state.db = db;
  return { ...api, element, listeners, storage, detailNodes };
}





const rt=runtime('5.6.4'),old=runtime('5.6.3');const m=rt.defaultRecord('macro');
Object.assign(rt.state,{records:[m],record:m,id:m.id,route:'macro',tab:'pairs'});old.state.record=m;
for(const name of ['EURUSD','GBPUSD','USDCHF']){
 const p=m.pairs.find(x=>x.pair===name);rt.state.pairId=p.id;old.state.pairId=p.id;
 p.thesis='Legacy thesis';p.invalidation='Legacy invalidation';p.notes='Legacy sources';p.counterThesis='Counter thesis';p.nextEvent='CPI tomorrow';
 old.renderPairShortlist(m);const snapshot=JSON.stringify(m);const h=rt.renderPairShortlist(m),prior=old.renderPairShortlist(m);
 const bindings=s=>[...s.matchAll(/data-bind="([^"]+)"/g)].map(x=>x[1]);for(const key of bindings(prior))assert(bindings(h).includes(key),key);
 assert.equal(JSON.stringify(m),snapshot);assert.equal(new Set(bindings(h)).size,bindings(h).length);
 assert.throws(()=>rt.pairTradeRecord(m,p),/Long- oder Short/);
 const g=rt.PAIR_MACRO_GROUPS()[0],item=g.items[0];p.checks[rt.pairCheckKey(g.id,item.id)]='done';p['note_'+g.id]='Pair event note';
 for(const direction of ['Long Bias','Short Bias']){
 p.direction=direction;p.edge='Gemischt';p.rates=direction==='Long Bias'?'Bestätigt Short':'Bestätigt Long';
 const before=JSON.stringify(m),t=rt.pairTradeRecord(m,p);
 assert.equal(JSON.stringify(m),before);assert.equal(t.status,'Idee');assert.equal(t.grade,'Unbewertet');assert.equal(t.factors.edge,'Unbewertet');assert.equal(t.factors.rates,'Widerspricht');
 assert.equal(t.fields.thesis,p.thesis);assert.equal(t.fields.fundamentalInvalidation,p.invalidation);assert.equal(t.fields.catalyst,p.nextEvent);assert(t.notes.includes(p.counterThesis));assert(t.notes.includes(p.notes));assert.equal(t.checklist[item.id],'done');assert(t.checkNotes[item.id].includes('Pair event note'));
 assert.equal(t.macroSnapshot.pairs.find(x=>x.id===p.id).counterThesis,p.counterThesis);t.macroSnapshot.pairs[0].notes='changed';assert.equal(JSON.stringify(m),before);
 }
 for(const status of ['Kandidat','Watchlist','Bereit für Trade-Idee','Verworfen']){p.status=status;rt.pairTradeRecord(m,p);assert.equal(p.status,status);}
}
for(const direction of ['Long Bias','Short Bias'])for(const value of ['Base stärker','Quote stärker'])assert.equal(rt.pairDirectionalFactor(direction,value,'Base stärker','Quote stärker'),(direction==='Long Bias')===(value==='Base stärker')?'Bestätigt':'Widerspricht');
assert.equal(String(rt.relativeRepricingResult),String(old.relativeRepricingResult));assert.equal(String(rt.expectedPolicyDifferentialResult),String(old.expectedPolicyDifferentialResult));
console.log('PASS: EURUSD/GBPUSD/USDCHF controls, source data, status, directional transfer, snapshot, checks and rates');
