// Run: node tests/daily-analysis.test.cjs. Actual app code with simulated DOM/IndexedDB.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const clone = value => JSON.parse(JSON.stringify(value));

const preferences=new Map();
function runtime() {
  const elements = new Map();
  const detailNodes = [];
  const listeners = new Map();
  const element = selector => {
    if (!elements.has(selector)) elements.set(selector, {
      innerHTML: '', textContent: '', classList: { toggle() {}, remove() {} },
      querySelector() {return null;}, addEventListener() {}, focus(options) { this.focusOptions = options; },
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
    const tx = { objectStore(storeName = name) { return { put(value) {
      storage[storeName].set(value.id || value.key, clone(value));
    } }; } };
    queueMicrotask(() => tx.oncomplete?.());
    return tx;
  } };
  const context = vm.createContext({
    localStorage:{getItem:k=>preferences.get(k)||null,setItem:(k,v)=>preferences.set(k,v)}, document, window: { addEventListener() {}, scrollTo() {} }, console,
    setTimeout: () => 0, clearTimeout() {}, URL, Intl
  });
  vm.runInContext(read('data.base.v'+JSON.parse(read('build-info.json')).version+'.js'), context);
  const app = read('app.base.v'+JSON.parse(read('build-info.json')).version+'.js');
  assert(app.endsWith('init();\n})();\n'));
  const expose = `window.test={state,D,dailyMacroCopy,dailyMacroModal,createDailyMacro,dailyMacroNotice,previousPairReview,pairScreen,pairScreenRows,macroPairStats,performImport,renderChecklists,renderExecution,renderTradeOverview,renderCheckGroup,pairDetailStates,rememberPairDetail,pairDetailHtml,dispatch,defaultRecord,pairTradeRecord,readiness,readinessHtml,renderFactor,approvalModal,saveApproval,handleBound,saveNow,relativeRepricingResult,expectedPolicyDifferentialResult,renderHome,renderMacro,renderTrade,renderSources,renderSettings,tradeFactorValue};`;
  vm.runInContext(app.replace(/init\(\);\n\}\)\(\);\n$/, expose + '\n})();\n'), context);
  const api = context.window.test;
  api.state.db = db;
  return { ...api, element, listeners, storage, detailNodes };
}







(async()=>{
const rt=runtime();
const original=rt.defaultRecord('macro');
original.date='2026-09-09';original.title='Gestern';original.reviewed=true;
original.fields={asOf:'2026-09-09T08:00',marketSummary:'Old context',overnight:'Old overnight',customLegacy:'keep'};
original.images=['asset-original'];original.events=[{id:'event-original',at:'2026-09-11T14:30',title:'CPI',impact:'High'}];
original.checklist={legacy:'done'};original.checkNotes={legacy:'Keep old note'};
for(const c of Object.keys(rt.D.CURRENCIES))original.currencies[c]={policyRate:'3.5',yield2y:'4',yield2y1w:'3.8',yield2y2w:'3.7',asOf:'2026-09-08T09:00',pricing12m:'-25',pricing12mSource:'Official source',unknownMetadata:{keep:true}};
for(const p of original.pairs){Object.assign(p,{direction:'Long Bias',status:'Bereit für Trade-Idee',confidence:'High',edge:'Base stärker',rates:'Bestätigt Long',driver:'Ja',technical:'Setup vorhanden',thesis:'Keep thesis',counterThesis:'Keep counter',invalidation:'Keep invalidation',notes:'Keep notes',nextEvent:'CPI Friday',note_driver:'Keep driver note',repriceOverrideValue:'12',repriceOverrideReason:'Old source',unknownField:'keep'});for(const g of rt.D.pairMacroGroups)for(const i of g.items)p.checks[g.id+'__'+i.id]='done';p.checks.legacy='done';}
const frozen=JSON.stringify(original),copy=rt.dailyMacroCopy(original,'2026-09-10');
assert.equal(JSON.stringify(original),frozen,'Original untouched');
assert.notEqual(copy.id,original.id);assert.equal(copy.date,'2026-09-10');assert.equal(copy.reviewed,false);
assert.deepEqual(clone(copy.fields),original.fields);const expectedCurrencies=clone(original.currencies);for(const d of Object.values(expectedCurrencies))Object.assign(d,{probHikeChange:'',probHoldChange:'',probCutChange:''});assert.deepEqual(clone(copy.currencies),expectedCurrencies);
assert.equal(copy.images.length,0);assert.equal(original.images[0],'asset-original');
assert.notEqual(copy.events[0].id,original.events[0].id);assert.equal(copy.events[0].at,original.events[0].at);
assert.equal(copy.checklist.legacy,'todo');assert.equal(copy.checkNotes.legacy,'Keep old note');
assert.equal(copy.pairs.length,28);assert.equal(new Set(copy.pairs.map(p=>p.pair)).size,28);
for(const p of copy.pairs){
 assert.equal(p.status,'Ungeprüft');assert.equal(p.direction,'');assert.equal(p.confidence,'');
 for(const key of ['edge','rates','driver','repriceOverrideValue','repriceOverrideReason'])assert.equal(p[key],'');
 assert(Object.values(p.checks).every(x=>x==='todo'));
 assert.equal(p.previousReview.direction,'Long Bias');assert.equal(p.previousReview.repriceOverrideValue,'12');assert.equal(p.previousReview.date,original.date);
 assert.equal(p.thesis,'Keep thesis');assert.equal(p.unknownField,'keep');assert.equal(p.note_driver,'Keep driver note');
}
assert.equal(rt.macroPairStats(copy).done,0);assert.equal(rt.macroPairStats(copy).ready,0);
assert.equal(rt.macroPairStats(original).done,476);
rt.pairScreen.filter='Ungeprüft';assert.equal(rt.pairScreenRows(copy).length,28);
rt.pairScreen.filter='Bereit';assert.equal(rt.pairScreenRows(copy).length,0);
rt.pairScreen.filter='Neutral';assert.equal(rt.pairScreenRows(copy).length,0);
rt.pairScreen.filter='Alle';
for(const invalid of ['', '2026-02-30','2026-13-10','today','2026-9-1'])assert.throws(()=>rt.dailyMacroCopy(original,invalid),/gültiges/);
assert.equal(rt.dailyMacroCopy(original,'2028-02-29').date,'2028-02-29');
assert.throws(()=>rt.dailyMacroCopy({kind:'trade'},'2026-09-10'),/Morgenanalyse/);
for(const pair of ['EURUSD','GBPUSD','USDCHF']){
 const p=copy.pairs.find(p=>p.pair===pair);
 assert.throws(()=>rt.pairTradeRecord(copy,p),/Long- oder Short/,'Cannot reuse old directional rating');
 const html=rt.previousPairReview(copy,p);assert(html.includes('Old source'));assert(html.includes('Long Bias'));
 assert(!/data-bind=/.test(html),'Previous rating is read only');
 // No override can remain active after carry-forward.
 assert.equal(rt.relativeRepricingResult({}, {}, p).source,'none');
 assert.equal(rt.relativeRepricingResult({}, {}, original.pairs.find(x=>x.pair===pair)).source,'manual');
}
Object.assign(rt.state,{records:[original],record:original,id:original.id,route:'macro',tab:'overview'});
rt.dailyMacroModal();assert(rt.element('#modal').innerHTML.includes('Originalanalyse'));
rt.element('#daily-analysis-date').value='2026-02-30';rt.createDailyMacro();assert.equal(rt.state.records.length,1);assert(rt.element('#daily-analysis-error').textContent.includes('gültiges'));
rt.element('#daily-analysis-date').value='2026-09-10';rt.createDailyMacro();assert.equal(rt.state.records.length,2);
const created=rt.state.records[0];assert.equal(rt.state.id,created.id);
for(const tab of ['overview','currencies','pairs','events','screenshots']){rt.state.tab=tab;assert(rt.renderMacro(created).includes('Aus Gestern übernommen'));}
for(const c of ['USD','EUR','CHF']){rt.state.currency=c;rt.state.tab='currencies';rt.renderMacro(created);assert.equal(created.currencies[c].asOf,'2026-09-08T09:00');}
await rt.saveNow();const restored=rt.storage.records.get(created.id);assert.equal(restored.carriedFrom.id,original.id);assert.equal(restored.pairs[0].previousReview.status,'Bereit für Trade-Idee');
assert.equal(JSON.stringify(original),frozen,'Rendering and saving new copy never changes original');
await rt.dispatch('daily-analysis-source');assert.equal(rt.state.id,original.id);
const next=rt.dailyMacroCopy(created,'2026-09-11');assert.equal(next.carriedFrom.id,created.id);assert.equal(next.pairs[0].previousReview.status,'Ungeprüft');assert(!next.pairs[0].previousReview.previousReview,'No recursive snapshot growth');
// Importing a backup alongside originals must remap provenance to the imported source.
const originalId=original.id,createdId=created.id;
await rt.performImport({records:[clone(original),clone(created)],assets:[]},'merge');
assert.equal(rt.state.records.length,4);
const importedSource=rt.state.records[2],importedCopy=rt.state.records[3];
assert.notEqual(importedSource.id,originalId);assert.notEqual(importedCopy.id,createdId);
assert.equal(importedCopy.carriedFrom.id,importedSource.id);
assert.equal(importedCopy.pairs[0].previousReview.status,'Bereit für Trade-Idee');
assert.equal(rt.state.records[1].id,originalId);
// One atomic carry-forward for all currencies, including numeric zero and missing values.
const source=rt.defaultRecord('macro');source.date='2026-09-10';
for(const c of Object.keys(rt.D.CURRENCIES))source.currencies[c]={probHike:0,probHold:'75',probCut:'25',probHikeChange:'old',probHoldChange:'old',probCutChange:'old',yield2Prev:'3.2',pricingChange:'12'};
delete source.currencies.CHF.probCut;
const unchanged=JSON.stringify(source),day=rt.dailyMacroCopy(source,'2026-09-11');
assert.equal(JSON.stringify(source),unchanged);
for(const [c,d] of Object.entries(day.currencies)){assert.equal(d.probHikeChange,0);assert.equal(d.probHoldChange,'75');assert.equal(d.probCutChange,c==='CHF'?'':'25');assert.equal(d.yield2Prev,'3.2');assert.equal(d.pricingChange,'12');}
day.currencies.USD.probHoldChange='68';day.currencies.USD.probHold='80';
Object.assign(rt.state,{records:[source,day],id:day.id,record:day,route:'macro',tab:'currencies'});
for(const c of Object.keys(rt.D.CURRENCIES)){rt.state.currency=c;rt.renderMacro(day);}
assert.equal(day.currencies.USD.probHoldChange,'68','Rendering never reseeds manual comparisons');
rt.handleBound({dataset:{bind:'currencies.USD.probHoldChange'},value:'68',type:'number'});await rt.saveNow();assert.equal(rt.storage.records.get(day.id).currencies.USD.probHoldChange,'68');
const following=rt.dailyMacroCopy(day,'2026-09-12');assert.equal(following.currencies.USD.probHoldChange,'80','Next day uses current value, never the older comparison');
console.log('Daily analysis: 28 pairs, original preservation, dates, metadata, counters, filters, three pairs/currencies, navigation and persistence passed.');
})().catch(e=>{console.error(e);process.exitCode=1});
