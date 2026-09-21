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
  vm.runInContext(read('data.base.v'+JSON.parse(read('build-info.json')).version+'.js'), context);
  const app = read('app.base.v'+JSON.parse(read('build-info.json')).version+'.js');
  assert(app.endsWith('init();\n})();\n'));
  const expose = `window.test={state,D,isJournalTrade,tradeListRecords,renderList,filteredListRecords,applyListFilter,render,pairNeedsReview,pairBasis,rememberPairBasis,captureExistingPairReviews,handlePairCheck,relevantPairEvents,selectedPairEvent,pairEventPicker,pairScreenData,tradeEventChanges,tradeCatalystSummary,tradeEventSyncNotice,tradeEventSyncModal,syncTradeEvents,rekeyCopiedEvents,dailyMacroCopy,dailyMacroModal,createDailyMacro,dailyMacroNotice,previousPairReview,pairScreen,pairScreenRows,macroPairStats,performImport,renderChecklists,renderExecution,renderTradeOverview,renderCheckGroup,pairDetailStates,rememberPairDetail,pairDetailHtml,dispatch,defaultRecord,pairTradeRecord,readiness,readinessHtml,renderFactor,approvalModal,saveApproval,handleBound,saveNow,relativeRepricingResult,expectedPolicyDifferentialResult,renderHome,renderMacro,renderTrade,renderSources,renderSettings,tradeFactorValue};`;
  vm.runInContext(app.replace(/init\(\);\n\}\)\(\);\n$/, expose + '\n})();\n'), context);
  const api = context.window.test;
  api.state.db = db;
  return { ...api, element, listeners, storage, detailNodes,syncNodes };
}







(async()=>{
const rt=runtime();const statuses=['Idee','Watchlist','Bereit','Offen','Geschlossen','Verworfen'];
const records=statuses.map((status,i)=>({...rt.defaultRecord('trade'),id:'trade-'+i,title:'Unique '+status,pair:i%2?'USDCHF':'EURUSD',status,fields:{thesis:'Saved thesis',entry:'1.25'},images:['image-'+i],journal:[{text:'Preserve journal'}],macroSnapshot:{title:'Frozen analysis'}}));
Object.assign(rt.state,{records,route:'trades',id:null,query:'',filter:'all'});
const before=JSON.stringify(records);
assert.equal(rt.tradeListRecords().length,4);assert.equal(rt.tradeListRecords(true).length,2);
const active=rt.renderList('trade'),journal=rt.renderList('journal'),home=rt.renderHome();
for(const r of records){assert.equal(active.includes('data-open="'+r.id+'"'),!rt.isJournalTrade(r));assert.equal(journal.includes('data-open="'+r.id+'"'),rt.isJournalTrade(r));assert.equal(home.includes('data-open="'+r.id+'"'),!rt.isJournalTrade(r));}
assert(!active.includes('<option value="Geschlossen"'));assert(journal.includes('<option value="Geschlossen"'));assert(!journal.includes('<option value="Offen"'));
assert.equal(JSON.stringify(records),before,'Lists never modify existing records');
rt.state.route='journal';rt.state.filter='Verworfen';rt.applyListFilter();assert(rt.element('#list-results').innerHTML.includes('Unique Verworfen'));assert(!rt.element('#list-results').innerHTML.includes('Unique Geschlossen'));
rt.state.filter='all';rt.state.query='EURUSD';assert.equal(rt.filteredListRecords('journal').length,1);rt.applyListFilter();assert(!rt.element('#list-results').innerHTML.includes('Unique Verworfen'));
rt.state.query='';const t=records[0];Object.assign(rt.state,{route:'trade',id:t.id,record:t});
const retained=JSON.stringify({id:t.id,fields:t.fields,images:t.images,journal:t.journal,macroSnapshot:t.macroSnapshot});
for(const status of ['Geschlossen','Verworfen','Watchlist','Offen']){
 rt.handleBound({dataset:{bind:'status'},value:status});
 assert.equal(rt.tradeListRecords(true).some(x=>x.id===t.id),['Geschlossen','Verworfen'].includes(status));
 assert.equal(JSON.stringify({id:t.id,fields:t.fields,images:t.images,journal:t.journal,macroSnapshot:t.macroSnapshot}),retained);
 assert(rt.renderTrade(t).includes(['Geschlossen','Verworfen'].includes(status)?'Zum Journal':'Zu den Trade-Ideen'));
 await rt.saveNow();assert.equal(rt.storage.records.get(t.id).status,status);
}
rt.state.records=Array.from(rt.storage.records.values());assert.equal(rt.tradeListRecords(true).length,2,'Classification survives save/load');
await rt.dispatch('go-journal');assert.equal(rt.state.route,'journal');assert(rt.element('#view').innerHTML.includes('Unique Geschlossen'));
await rt.dispatch('go-trades');assert.equal(rt.state.route,'trades');assert(!rt.element('#view').innerHTML.includes('Unique Geschlossen'));
rt.state.records=[];assert(rt.renderList('journal').includes('Noch keine Journal-Einträge'));assert(rt.renderList('trade').includes('Noch keine Einträge'));
console.log('PASS: existing closed/rejected records, active home/list, journal search/status filters, reopen, field/asset preservation, save/load, navigation and empty states.');
})().catch(e=>{console.error(e);process.exitCode=1});
