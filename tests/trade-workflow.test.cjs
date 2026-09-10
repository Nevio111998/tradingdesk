// Run: node tests/trade-flow-fixes.test.cjs. Actual app code with simulated DOM/IndexedDB.
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
    const tx = { objectStore() { return { put(value) {
      storage[name].set(value.id || value.key, clone(value));
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
  const expose = `window.test={state,D,renderChecklists,renderExecution,renderTradeOverview,renderCheckGroup,pairDetailStates,rememberPairDetail,pairDetailHtml,dispatch,defaultRecord,pairTradeRecord,readiness,readinessHtml,renderFactor,approvalModal,saveApproval,handleBound,saveNow,relativeRepricingResult,expectedPolicyDifferentialResult,renderHome,renderMacro,renderTrade,renderSources,renderSettings,tradeFactorValue};`;
  vm.runInContext(app.replace(/init\(\);\n\}\)\(\);\n$/, expose + '\n})();\n'), context);
  const api = context.window.test;
  api.state.db = db;
  return { ...api, element, listeners, storage, detailNodes };
}







(async()=>{
const rt=runtime();
const bindings=h=>[...h.matchAll(/data-bind="([^"]+)"/g)].map(x=>x[1]);
const allViews=(api,t)=>['overview','checklist','execution','events','screenshots','journal'].map(tab=>{api.state.tab=tab;return api.renderTrade(t)}).join('');
for(const pair of ['EURUSD','GBPUSD','USDCHF']){
 const m=rt.defaultRecord('macro'),p=m.pairs.find(p=>p.pair===pair);Object.assign(p,{direction:'Long Bias',edge:'Base stärker',thesis:'Frozen thesis',counterThesis:'Frozen counter',nextEvent:'CPI tomorrow',note_driver:'Frozen driver note'});
 const t=rt.pairTradeRecord(m,p);t.fields.exitPlan='Keep exit plan';t.fields.edgeIncluded='Keep EdgeFinder notes';t.fields.edgeGap='Keep gaps';t.fields.setup='Keep setup';t.fields.thesis='Current changed thesis';
 for(const api of [rt])Object.assign(api.state,{records:[m,t],record:t,id:t.id,route:'trade',tab:'overview'});
 const before=JSON.stringify(t),after=allViews(rt,t);
 assert.equal(JSON.stringify(t),before);assert.deepEqual([...new Set(bindings(after))].sort(),JSON.parse(read('tests/trade-fields.json')),'All stored fields remain accessible across views');
 const checks=h=>[...h.matchAll(/data-check="([^"]+)"/g)].map(x=>x[1]);assert.equal(checks(after).length,17);
 const overview=rt.renderTradeOverview(t),check=rt.renderChecklists(t),execution=rt.renderExecution(t);
 assert(overview.includes('Frozen thesis'));assert(overview.includes('Frozen counter'));assert(overview.includes('Current changed thesis'));assert(overview.includes('Frozen driver note'));
 assert(!bindings(overview).includes('fields.edgeBase'));assert(bindings(check).includes('fields.edgeBase'));
 for(const key of ['fields.entry','fields.stop','fields.setup','fields.technicalInvalidation','fields.exitPlan']){assert(!bindings(check).includes(key));assert(bindings(execution).includes(key));}
 for(const key of ['fields.thesis','fields.catalyst','fields.fundamentalInvalidation','fields.confidence']){assert(!bindings(check).includes(key));assert(bindings(overview).includes(key));}
 const key=JSON.stringify(['trade:'+t.id,'view','fields-policy']);rt.rememberPairDetail({dataset:{pairDetail:key},open:true,isConnected:true});assert(rt.renderChecklists(t).includes('data-pair-detail="'+key.replaceAll('"','&quot;')+'" open'));assert.equal(JSON.stringify(t),before);
 rt.handleBound({dataset:{bind:'fields.exitPlan'},value:'Updated exit plan'});await rt.saveNow();assert.equal(rt.storage.records.get(t.id).fields.exitPlan,'Updated exit plan');assert.equal(t.macroSnapshot.pairs.find(x=>x.id===p.id).thesis,'Frozen thesis');
 rt.state.tab='checklist';await rt.dispatch('trade-overview',{});assert.equal(rt.state.tab,'overview');
}
const standalone=rt.defaultRecord('trade');Object.assign(rt.state,{records:[standalone],id:standalone.id,record:standalone,route:'trade'});assert(rt.renderTradeOverview(standalone).includes('Noch keine Morgenanalyse übernommen'));assert(rt.renderChecklists(standalone).includes('fields.edgeIncluded'));
console.log('PASS: all fields retained across trade views; 17 checks, 3 pairs, frozen snapshot, details isolation, persistence, navigation and active field coverage.');
})().catch(e=>{console.error(e);process.exitCode=1});
