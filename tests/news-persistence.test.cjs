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
  vm.runInContext(read('news.js'), context);
  const expose = `window.test={newsBridge,renderSelectedPair,pairRatesMatrixHtml,pairScreenRates,spreadHtml,state,D,pairNeedsReview,pairBasis,rememberPairBasis,captureExistingPairReviews,handlePairCheck,relevantPairEvents,selectedPairEvent,pairEventPicker,pairScreenData,tradeEventChanges,tradeCatalystSummary,tradeEventSyncNotice,tradeEventSyncModal,syncTradeEvents,rekeyCopiedEvents,dailyMacroCopy,dailyMacroModal,createDailyMacro,dailyMacroNotice,previousPairReview,pairScreen,pairScreenRows,macroPairStats,performImport,renderChecklists,renderExecution,renderTradeOverview,renderCheckGroup,pairDetailStates,rememberPairDetail,pairDetailHtml,dispatch,defaultRecord,pairTradeRecord,readiness,readinessHtml,renderFactor,approvalModal,saveApproval,handleBound,saveNow,relativeRepricingResult,expectedPolicyDifferentialResult,renderHome,renderMacro,renderTrade,renderSources,renderSettings,tradeFactorValue};`;
  vm.runInContext(app.replace(/init\(\);\n\}\)\(\);\n$/, expose + '\n})();\n'), context);
  const api = context.window.test;
  api.state.db = db;
  return { ...api, element, listeners, storage, detailNodes,syncNodes };
}







(async()=>{
 const rt=runtime(),m=rt.defaultRecord('macro');m.date='2026-10-13';
 Object.assign(rt.state,{records:[m],id:m.id,record:m,route:'macro',tab:'pairs'});
 const p=m.pairs.find(p=>p.pair==='EURUSD');p.direction='Long Bias';p.notes='Existing note';
 const item={id:'news-1',title:'ECB announcement',url:'https://www.ecb.europa.eu/news',source:'EZB',publishedAt:'2026-10-13T10:00:00Z',currencies:['EUR'],topics:['Zentralbanken']};
 assert(await rt.newsBridge.save(m.id,p.id,item,'Why this matters'));
 const saved=rt.storage.records.get(m.id);assert.equal(saved.pairs.find(x=>x.id===p.id).news[0].note,'Why this matters');
 assert.equal(p.notes,'Existing note');assert.equal(p.direction,'Long Bias');
 assert.equal(await rt.newsBridge.save(m.id,p.id,item,'Duplicate'),false);
 assert.equal(p.news.length,1);assert(rt.renderSelectedPair(m,p.id).includes('ECB announcement'));
 const trade=rt.pairTradeRecord(m,p);assert.equal(trade.macroSnapshot.pairs.find(x=>x.id===p.id).news[0].note,'Why this matters');
 assert(rt.renderTradeOverview(trade).includes('ECB announcement'));
 p.news[0].note='Later change';assert.equal(trade.macroSnapshot.pairs.find(x=>x.id===p.id).news[0].note,'Why this matters');
 assert.equal(rt.dailyMacroCopy(m,'2026-10-14').pairs.find(x=>x.id===p.id).news[0].publishedAt,new Date(item.publishedAt).toISOString());
 // Reloading the serialized record retains the original field layout and news.
 rt.state.records=[JSON.parse(JSON.stringify(saved))];assert.equal(rt.newsBridge.targets()[0].id,m.id);
 await assert.rejects(()=>rt.newsBridge.save('missing',p.id,item,''));
 console.log('PASS: news core persistence, duplicates, pair rendering, immutable trade snapshot, daily copy and invalid targets.');
})().catch(e=>{console.error(e);process.exitCode=1});
