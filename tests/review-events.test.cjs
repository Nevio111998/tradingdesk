// Run: node tests/daily-analysis.test.cjs. Actual app code with simulated DOM/IndexedDB.
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
  const detailNodes = [];const syncNodes=[];
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
    querySelector: element, querySelectorAll: selector => selector==='details[data-currency-detail]'?detailNodes:selector==='[data-event-sync]'?syncNodes:[],
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
  vm.runInContext(read(`data.v${version}.js`), context);
  const app = read(`app.v${version}.js`);
  assert(app.endsWith('init();\n})();\n'));
  const expose = `window.test={state,D,pairNeedsReview,pairBasis,rememberPairBasis,captureExistingPairReviews,handlePairCheck,relevantPairEvents,selectedPairEvent,pairEventPicker,pairScreenData,tradeEventChanges,tradeCatalystSummary,tradeEventSyncNotice,tradeEventSyncModal,syncTradeEvents,rekeyCopiedEvents,dailyMacroCopy,dailyMacroModal,createDailyMacro,dailyMacroNotice,previousPairReview,pairScreen,pairScreenRows,macroPairStats,performImport,renderChecklists,renderExecution,renderTradeOverview,renderCheckGroup,pairDetailStates,rememberPairDetail,pairDetailHtml,dispatch,defaultRecord,pairTradeRecord,readiness,readinessHtml,renderFactor,approvalModal,saveApproval,handleBound,saveNow,relativeRepricingResult,expectedPolicyDifferentialResult,renderHome,renderMacro,renderTrade,renderSources,renderSettings${version==='5.6.7'?',tradeFactorValue':''}};`;
  vm.runInContext(app.replace(/init\(\);\n\}\)\(\);\n$/, expose + '\n})();\n'), context);
  const api = context.window.test;
  api.state.db = db;
  return { ...api, element, listeners, storage, detailNodes,syncNodes };
}







(async()=>{
const rt=runtime('5.6.10');
const m=rt.defaultRecord('macro');m.date='2026-09-10';
const select=r=>Object.assign(rt.state,{records:[m,...(r===m?[]:[r])],id:r.id,record:r,route:r.kind==='macro'?'macro':'trade',tab:'overview'});
select(m);
assert.equal(m.pairs.length,28);assert(m.pairs.every(p=>p.status==='Ungeprüft'&&!p.direction&&!p.confidence));
const eur=m.pairs.find(p=>p.pair==='EURUSD'),gbp=m.pairs.find(p=>p.pair==='GBPUSD'),chf=m.pairs.find(p=>p.pair==='USDCHF'),aud=m.pairs.find(p=>p.pair==='AUDNZD');
for(const p of [eur,gbp,chf,aud]){p.status='Watchlist';p.direction='Long Bias';p.checks={test:'done'};}
m.currencies.USD={bankRate:'4',asOf:'2026-09-09T10:00'};
rt.handleBound({dataset:{bind:'currencies.USD.bankRate'},value:'4.5',type:'number'});
for(const p of [eur,gbp,chf])assert(rt.pairNeedsReview(m,p));
assert(!rt.pairNeedsReview(m,aud));assert.equal(eur.status,'Watchlist');assert.equal(eur.checks.test,'done');
const oldBasis=eur.reviewBasis;rt.handlePairCheck({dataset:{pairCheck:eur.id+'.another'},checked:true});assert.equal(eur.reviewBasis,oldBasis);assert(rt.pairNeedsReview(m,eur),'Ticking one check cannot silently acknowledge all changes');
await rt.dispatch('pair-basis-confirm',{dataset:{pairId:eur.id}});assert(!rt.pairNeedsReview(m,eur));assert(rt.pairNeedsReview(m,gbp));
rt.handleBound({dataset:{bind:'currencies.USD.bankRate'},value:'4.5',type:'number'});assert(!rt.pairNeedsReview(m,eur),'Same value is not a change');
rt.state.tab='currencies';rt.renderMacro(m);assert(!rt.pairNeedsReview(m,eur),'Rendered currency defaults do not create false alarms');
rt.handleBound({dataset:{bind:'currencies.USD.asOf'},value:'2026-09-10T10:00',type:'datetime-local'});assert(rt.pairNeedsReview(m,eur),'Metadata update also triggers review');
rt.pairScreen.filter='Watchlist';assert.equal(rt.pairScreenRows(m).length,4);
chf.status='Verworfen';rt.pairScreen.filter='Verworfen';assert.equal(rt.pairScreenRows(m)[0].p.pair,'USDCHF');
rt.pairScreen.filter='Ungeprüft';assert.equal(rt.pairScreenRows(m).length,24);rt.pairScreen.filter='Alle';
m.events=[{id:'usd-cpi',title:'CPI',at:'2026-09-11T14:30',currency:'USD',impact:'High',forecast:'2.5',actual:'',plan:'Watch reaction'},{id:'aud-jobs',title:'Jobs AU',at:'2026-09-11T03:30',currency:'AUD',impact:'High'},{id:'global',title:'Global risk',at:'2026-09-12T09:00',currency:'Global',impact:'Medium'}];
eur.catalystEventId='usd-cpi';eur.nextEvent='My independent interpretation';
assert.equal(rt.selectedPairEvent(m,eur).title,'CPI');assert(!rt.relevantPairEvents(m,eur).some(e=>e.id==='aud-jobs'));
assert(rt.pairEventPicker(m,eur).includes('CPI'));
m.events[0].title='CPI revised';assert.equal(rt.selectedPairEvent(m,eur).title,'CPI revised');assert.equal(rt.pairScreenData(m,eur).event.e.title,'CPI revised');
const t=rt.pairTradeRecord(m,eur);assert.equal(t.events.length,2);assert.equal(t.fields.nextEvent,'My independent interpretation');assert(rt.tradeCatalystSummary(t).includes('CPI revised'));
const snapshot=JSON.stringify(t.macroSnapshot),tradeEvent=t.events.find(e=>e.sourceEvent==='usd-cpi');
select(t);m.events[0].at='2026-09-11T15:00';assert.equal(tradeEvent.at,'2026-09-11T14:30','Original update must not mutate trade snapshot');assert.equal(rt.tradeEventChanges(t).length,1);
t.events.push({id:'manual',title:'Manual event',at:'2026-09-12T12:00'});
rt.syncNodes.push({checked:true,dataset:{eventSync:'usd-cpi'}});rt.syncTradeEvents();assert.equal(t.events.find(e=>e.sourceEvent==='usd-cpi').at,'2026-09-11T15:00');assert.equal(t.events.length,3);assert.equal(rt.tradeEventChanges(t).length,0);assert.equal(JSON.stringify(t.macroSnapshot),snapshot);assert.equal(t.fields.nextEvent,'My independent interpretation');
rt.syncTradeEvents();assert.equal(t.events.length,3,'Repeated sync never duplicates');
t.events.find(e=>e.sourceEvent==='usd-cpi').plan='Local override';assert.equal(rt.tradeEventChanges(t).length,1);rt.syncNodes[0].checked=false;rt.syncTradeEvents();assert.equal(t.events.find(e=>e.sourceEvent==='usd-cpi').plan,'Local override');
m.events=m.events.filter(e=>e.id!=='usd-cpi');assert(rt.tradeEventSyncNotice(t).includes('nicht mehr vorhanden'));assert(rt.pairEventPicker(m,eur).includes('nicht mehr verfügbar'));
// Selected IDs survive daily copies and record duplication; day copies discard review acknowledgements.
m.events.push({id:'usd-cpi',title:'Restored CPI',at:'2026-09-11T15:00',currency:'USD',impact:'High'});
const next=rt.dailyMacroCopy(m,'2026-09-11');assert.notEqual(next.pairs.find(p=>p.pair==='EURUSD').catalystEventId,'usd-cpi');assert.equal(rt.selectedPairEvent(next,next.pairs.find(p=>p.pair==='EURUSD')).title,'Restored CPI');assert(!next.pairs.find(p=>p.pair==='EURUSD').reviewBasis);
const duplicate=clone(t);rt.rekeyCopiedEvents(duplicate);assert(duplicate.events.some(e=>e.id===duplicate.catalystEventId));
await rt.saveNow();assert.equal(rt.storage.records.get(m.id).pairs.find(p=>p.pair==='EURUSD').reviewBasis,eur.reviewBasis);
await rt.performImport({records:[clone(m),clone(t)],assets:[]},'merge');const importedM=rt.state.records[2],importedT=rt.state.records[3];assert.equal(importedT.macroId,importedM.id);assert(importedT.events.filter(e=>e.sourceMacro).every(e=>e.sourceMacro===importedM.id));
console.log('PASS: pair freshness, explicit acknowledgement, no false alarms, all filters/defaults, shared catalysts, controlled sync, free notes, frozen snapshots, daily copy links and import persistence.');
})().catch(e=>{console.error(e);process.exitCode=1});
