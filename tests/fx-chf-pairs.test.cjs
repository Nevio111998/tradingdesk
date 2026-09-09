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
    D,pairList,pairData,macroPairStats,pairCheckTotals,PAIR_MACRO_GROUPS,pairCheckKey,defaultRecord,applyMacro,renderMacro,renderPairShortlist,handlePairCheck,pairSpreadHtml,pairRatesMatrixHtml,pairDataSnapshotHtml,relativeRepricingResult,expectedPolicyDifferentialResult${version !== '5.4.7' ? ',currencySummaryHtml' : ''}${['5.5.3','5.5.4','5.5.5','5.6.1'].includes(version) ? ',currencyDocumentationStatus,CURRENCY_DOCUMENTATION_FIELDS,currencyDetailOpen' : ''}${['5.5.4','5.5.5','5.6.1'].includes(version) ? ',currencyOverviewHtml,currencyUpcomingEvents,currencyWatchHtml' : ''}};`;
  vm.runInContext(app.replace(/init\(\);\n\}\)\(\);\n$/, expose + '\n})();\n'), context);
  const api = context.window.test;
  api.state.db = db;
  return { ...api, element, listeners, storage, detailNodes };
}


const rt=runtime('5.6.1'),old=runtime('5.5.5');
const added=['USDCHF','EURCHF','GBPCHF','AUDCHF','NZDCHF','CADCHF','CHFJPY'];
const m=old.defaultRecord('macro');
m.pairs.forEach((p,i)=>Object.assign(p,{id:'saved-'+p.pair,status:i===0?'Bereit für Trade-Idee':i===1?'Watchlist':'Kandidat',direction:'Short Bias',notes:'Saved '+i,checks:{legacy:'done'},note_policy:'Keep',manualOverride:{keep:true}}));
const originals=m.pairs.slice(),snapshot=clone(m.pairs);
const first=rt.PAIR_MACRO_GROUPS()[0],key=rt.pairCheckKey(first.id,first.items[0].id);
m.pairs[0].checks[key]='done';snapshot[0].checks[key]='done';
rt.pairList(m);rt.pairList(m);
assert.equal(m.pairs.length,28);
assert.deepEqual(clone(m.pairs.slice(0,21)),snapshot);
originals.forEach((p,i)=>assert.equal(m.pairs[i],p));
assert.deepEqual(Array.from(m.pairs.slice(21),p=>p.pair),added);
assert.equal(new Set(m.pairs.map(p=>[p.pair.slice(0,3),p.pair.slice(3)].sort().join('/'))).size,28);
assert.equal(new Set(m.pairs.map(p=>p.id)).size,28);
assert.equal(rt.defaultRecord('macro').pairs.length,28);
let stats=rt.macroPairStats(m);
const perPair=rt.PAIR_MACRO_GROUPS().reduce((n,g)=>n+g.items.length,0);
assert.equal(stats.total,28*perPair);assert.equal(stats.done,1);assert.equal(stats.ready,1);assert.equal(stats.watch,1);
first.items.push({id:'dynamic-test',label:'Test'});
assert.equal(rt.macroPairStats(m).total,28*(perPair+1));first.items.pop();
Object.assign(rt.state,{records:[m],record:m,id:m.id,route:'macro',tab:'pairs',currency:'USD'});
for(const [c,y] of [['USD','4'],['EUR','3'],['GBP','5'],['CHF','1'],['JPY','0.5']])m.currencies[c]={bankRate:y,yield2:y,yield2Prev:y,yield2Prev2:y,real:y,realTenor:'same',pricingChange:'5',pricingChangeHorizon:'12M'};
for(const pair of ['EURUSD','GBPUSD',...added]){
 const p=m.pairs.find(p=>p.pair===pair);rt.state.pairId=p.id;
 const html=rt.renderPairShortlist(m);
 assert(html.includes('FX Paar-Makro-Checkliste'));assert(html.includes('28 FX-Paare'));
 assert.equal((html.match(/class="currency-tab /g)||[]).length,28);
 assert(!html.includes('G7'));assert(html.includes('pairs.'+p.id+'.status'));
 rt.handleBound({dataset:{bind:'pairs.'+p.id+'.notes'},value:'Edit '+pair,type:'textarea'});
 rt.handlePairCheck({dataset:{pairCheck:p.id+'.'+key},checked:true});
 assert.equal(rt.pairData(m,p.id).notes,'Edit '+pair);assert.equal(p.checks[key],'done');
 assert.equal(rt.pairSpreadHtml(m,p),old.pairSpreadHtml(m,p));
 assert.equal(String(rt.pairRatesMatrixHtml),String(old.pairRatesMatrixHtml));
 const t=rt.defaultRecord('trade');t.pair=pair;rt.applyMacro(t,m);
 assert.equal(t.macroSnapshot.pairs.length,28);
 assert.equal(t.fields.yieldBase,m.currencies[pair.slice(0,3)]?.yield2||undefined);
 assert.equal(t.fields.yieldQuote,m.currencies[pair.slice(3)]?.yield2||undefined);
 assert.deepEqual(clone(t.macroSnapshot.currencies.CHF),clone(m.currencies.CHF));
}
assert(rt.pairSpreadHtml(m,m.pairs.find(p=>p.pair==='USDCHF')).includes('+300.0 bp'));
assert(rt.pairSpreadHtml(m,m.pairs.find(p=>p.pair==='CHFJPY')).includes('+50.0 bp'));
const restored=clone(m);rt.pairList(restored);assert.deepEqual(clone(restored),clone(m));
const partial={pairs:[{id:'custom-chf-id',pair:'USDCHF',notes:'Existing CHF',checks:{custom:'done'}}]};
rt.pairList(partial);assert.equal(partial.pairs.length,28);assert.equal(partial.pairs[0].id,'custom-chf-id');assert.equal(partial.pairs[0].notes,'Existing CHF');
console.log('PASS: 28 unique pairs, additive/idempotent legacy preservation, dynamic counts, pair edits/checks, CHF calculations and trade snapshot transfer; simulated DOM/storage.');
