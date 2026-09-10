// Run: node tests/trade-flow-fixes.test.cjs. Actual app code with simulated DOM/IndexedDB.
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
    localStorage:{getItem:k=>preferences.get(k)||null,setItem:(k,v)=>preferences.set(k,v)}, document, window: { addEventListener() {} }, console,
    setTimeout: () => 0, clearTimeout() {}, URL, Intl
  });
  vm.runInContext(read(`data.v${version}.js`), context);
  const app = read(`app.v${version}.js`);
  assert(app.endsWith('init();\n})();\n'));
  const expose = `window.test={state,D,defaultRecord,pairTradeRecord,readiness,readinessHtml,renderFactor,approvalModal,saveApproval,handleBound,saveNow,relativeRepricingResult,expectedPolicyDifferentialResult,renderHome,renderMacro,renderTrade,renderSources,renderSettings${version!=='5.6.6'?',tradeFactorValue':''}};`;
  vm.runInContext(app.replace(/init\(\);\n\}\)\(\);\n$/, expose + '\n})();\n'), context);
  const api = context.window.test;
  api.state.db = db;
  return { ...api, element, listeners, storage, detailNodes };
}






(async()=>{
const rt=runtime(process.env.TRADINGDESK_TEST_VERSION||'5.6.7'),old=runtime('5.6.6');
const select=t=>Object.assign(rt.state,{records:[t],record:t,id:t.id,route:t.kind==='trade'?'trade':'macro',tab:'overview'});
const warnings=t=>rt.readiness(t).warnings;
const snapshot=x=>JSON.stringify(x);
assert.equal(snapshot(rt.D.pairMacroGroups),snapshot(old.D.pairMacroGroups));
assert.equal(snapshot(rt.D.tradeGroups),snapshot(old.D.tradeGroups));
assert.equal(rt.D.tradeItems.length,17);assert.equal(rt.D.pairMacroGroups.length,7);
for(const fn of ['relativeRepricingResult','expectedPolicyDifferentialResult'])assert.equal(String(rt[fn]),String(old[fn]));
for(const name of ['EURUSD','GBPUSD','USDCHF']){
 const m=rt.defaultRecord('macro');select(m);const p=m.pairs.find(p=>p.pair===name);const base=p.pair.slice(0,3),quote=p.pair.slice(3);m.currencies[base]={yield2:'4.2'};m.currencies[quote]={yield2:'2.1'};
 p.thesis='Original thesis';p.counterThesis='Original counter';p.invalidation='Original invalidation';p.nextEvent='CPI tomorrow';p.notes='Original sources';p.direction='Long Bias';
 for(const [edge,expected] of [['Base stärker','Bestätigt'],['Quote stärker','Widerspricht'],['Gemischt','Unbewertet'],['Neutral/unklar','Unbewertet']]){
  p.edge=edge;const before=snapshot(m),t=rt.pairTradeRecord(m,p);assert.equal(snapshot(m),before);assert.equal(t.factors.edgefinder,expected);assert.equal(t.factors.edge,undefined);
  assert(rt.renderFactor(t,rt.D.FACTORS[0]).includes('>'+expected+'</option>'));assert.equal(t.fields.nextEvent,p.nextEvent);assert.equal(t.fields.catalyst,p.nextEvent);assert(!warnings(t).some(x=>x.includes('Catalyst')));
  assert.equal(t.fields.thesis,p.thesis);assert(t.notes.includes(p.counterThesis));assert.equal(snapshot(t.macroSnapshot.pairs),snapshot(m.pairs));assert.equal(t.status,'Idee');assert.equal(t.grade,'Unbewertet');
 }
 p.direction='Short Bias';p.edge='Quote stärker';assert.equal(rt.pairTradeRecord(m,p).factors.edgefinder,'Bestätigt');
 p.direction='Neutral';assert.throws(()=>rt.pairTradeRecord(m,p),/Long- oder Short/);
}
const legacy=rt.defaultRecord('trade');legacy.pair='EURUSD';legacy.factors.edge='Bestätigt';const before=snapshot(legacy);
assert(!rt.readiness(legacy).issues.some(x=>x.includes('EdgeFinder Baseline')));assert.equal(snapshot(legacy),before);
legacy.factors.edgefinder='Widerspricht';assert(warnings(legacy).some(x=>x.includes('EdgeFinder Baseline')));
legacy.factors.edgefinder='Unbewertet';assert(rt.readiness(legacy).issues.some(x=>x.includes('EdgeFinder Baseline')));
for(const fields of [{},{nextEvent:'   '},{catalyst:'   '}]){const t=rt.defaultRecord('trade');Object.assign(t.fields,fields);assert(warnings(t).some(x=>x.includes('Catalyst')));}
for(const fields of [{nextEvent:'CPI'},{catalyst:'Documented driver'}]){const t=rt.defaultRecord('trade');Object.assign(t.fields,fields);assert(!warnings(t).some(x=>x.includes('Catalyst')));}
const eventTrade=rt.defaultRecord('trade');eventTrade.events=[{title:'CPI'}];assert(!warnings(eventTrade).some(x=>x.includes('Catalyst')));
for(const initial of ['Idee','Watchlist','Bereit','Verworfen','Offen','Geschlossen'])for(const decision of ['Offen','Trade geplant','Kein Trade']){
 const t=rt.defaultRecord('trade');Object.assign(t,{status:initial,decision,approvalAt:'previous'});select(t);rt.approvalModal();assert(rt.element('#modal').innerHTML.includes('value="'+decision+'" selected'));
 rt.element('#approval-decision').value=decision;rt.element('#approval-grade').value='Unbewertet';rt.element('#approval-reason').value='Documented deliberate exception for test';rt.saveApproval();
 const expected=['Offen','Geschlossen'].includes(initial)?initial:decision==='Trade geplant'?'Bereit':decision==='Kein Trade'?'Verworfen':['Bereit','Verworfen'].includes(initial)?'Watchlist':initial;
 assert.equal(t.status,expected);assert.equal(t.checklist.finalDecision,decision==='Offen'?'todo':'done');assert.equal(!!t.approvalAt,decision!=='Offen');assert.equal(t.journal.length,1);
 if(decision!=='Trade geplant')assert(!t.journal[0].text.includes('Bewusste Ausnahmen'));if(decision==='Kein Trade')assert(!rt.readinessHtml(t).includes('Zuletzt freigegeben:'));
 await rt.saveNow();assert.equal(rt.storage.records.get(t.id).status,expected);
}
const pending=rt.defaultRecord('trade');select(pending);rt.element('#approval-decision').value='Trade geplant';rt.element('#approval-reason').value='';rt.saveApproval();assert.equal(pending.status,'Idee');assert.equal(pending.journal.length,0);
rt.element('#approval-decision').value='Invalid';rt.saveApproval();assert.equal(pending.journal.length,0);
Object.assign(pending,{status:'Bereit',decision:'Trade geplant',approvalAt:'previous'});pending.checklist.finalDecision='done';rt.handleBound({dataset:{bind:'decision'},value:'Offen'});assert.equal(pending.status,'Watchlist');assert.equal(pending.approvalAt,'');assert.equal(pending.checklist.finalDecision,'todo');
for(const kind of ['macro','trade']){const doc=rt.defaultRecord(kind);select(doc);for(const tab of kind==='macro'?['overview','currencies','pairs','events','screenshots']:['overview','checklist','execution','events','screenshots','journal']){rt.state.tab=tab;assert((kind==='macro'?rt.renderMacro(doc):rt.renderTrade(doc)).length>100);}}
assert(rt.renderHome().length>100);assert(rt.renderSources().length>100);assert(rt.renderSettings().length>100);
console.log('PASS: 3 pairs, directional/legacy EdgeFinder, catalyst detection, 18 decision transitions, persistence, all page renderers; 17 checks and rates unchanged.');
})().catch(e=>{console.error(e);process.exitCode=1});
