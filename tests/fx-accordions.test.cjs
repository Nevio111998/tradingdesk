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
  const expose = `window.test={state,renderCurrencies,handleBound,installEvents,saveNow,spreadHtml,
    ${version==='5.6.3'?'pairDetailStates,rememberPairDetail,loadPairDetails,pairDetailHtml,pairMacroChecklistHtml,':''}${['5.6.2','5.6.3'].includes(version)?'pairScreen,pairScreenRows,pairScreenData,pairScreenRates,pairScreenTable,pairScreenSummary,':''}D,pairList,pairData,macroPairStats,pairCheckTotals,PAIR_MACRO_GROUPS,pairCheckKey,defaultRecord,applyMacro,renderMacro,renderPairShortlist,handlePairCheck,pairSpreadHtml,pairRatesMatrixHtml,pairDataSnapshotHtml,relativeRepricingResult,expectedPolicyDifferentialResult${version !== '5.4.7' ? ',currencySummaryHtml' : ''}${['5.5.3','5.5.4','5.5.5','5.6.1','5.6.2','5.6.3'].includes(version) ? ',currencyDocumentationStatus,CURRENCY_DOCUMENTATION_FIELDS,currencyDetailOpen' : ''}${['5.5.4','5.5.5','5.6.1','5.6.2','5.6.3'].includes(version) ? ',currencyOverviewHtml,currencyUpcomingEvents,currencyWatchHtml' : ''}};`;
  vm.runInContext(app.replace(/init\(\);\n\}\)\(\);\n$/, expose + '\n})();\n'), context);
  const api = context.window.test;
  api.state.db = db;
  return { ...api, element, listeners, storage, detailNodes };
}




const rt=runtime('5.6.3'),old=runtime('5.6.2');const m=rt.defaultRecord('macro');m.date='2026-09-09';
Object.assign(rt.state,{records:[m],record:m,id:m.id,route:'macro',tab:'pairs'});old.state.record=m;
const groups=rt.PAIR_MACRO_GROUPS();assert.equal(groups.length,old.PAIR_MACRO_GROUPS().length);
for(const name of ['EURUSD','GBPUSD','USDCHF']){
 const p=m.pairs.find(p=>p.pair===name);rt.state.pairId=p.id;old.state.pairId=p.id;
 p.note_policy='Legacy note';p.repriceOverrideValue='15';p.repriceOverrideReason='QA documented independent comparable source';
 const html=rt.renderPairShortlist(m),prior=old.renderPairShortlist(m);
 const controls=h=>(h.match(/<input\b[^>]*>|<select\b[\s\S]*?<\/select>|<textarea\b[\s\S]*?<\/textarea>/g)||[]).filter(x=>x.includes('data-bind')||x.includes('data-pair-check')).map(x=>x.replace(/ aria-label="[^"]*"/g,'')).sort();
 assert.deepEqual(controls(html),controls(prior),'All stored detail controls remain');
 const links=h=>[...new Set(h.match(/href="[^"]+"/g)||[])].sort();assert.deepEqual(links(html),links(prior));
 for(const g of groups)for(const item of g.items)assert(html.includes(item.help.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;')));
 assert.equal((html.match(/class="pair-detail-excerpt"/g)||[]).length,groups.length);
 assert(!/<details[^>]* open/.test(html));
 const snap=JSON.stringify(m),key=JSON.stringify([m.id,p.id,'check-'+groups[0].id]);
 rt.rememberPairDetail({dataset:{pairDetail:key},open:true,isConnected:true});assert.equal(JSON.stringify(m),snap,'View toggle cannot mutate analyses');
 assert(rt.pairMacroChecklistHtml(p.id,p).includes(' open'));
 const reloaded=runtime('5.6.3');reloaded.loadPairDetails();assert.equal(reloaded.pairDetailStates.get(key),true);
 assert(!reloaded.pairDetailStates.has(JSON.stringify(['other-analysis',p.id,'check-'+groups[0].id])));
 rt.rememberPairDetail({dataset:{pairDetail:key},open:false,isConnected:false});assert.equal(rt.pairDetailStates.get(key),true,'Detached stale event ignored');
 rt.rememberPairDetail({dataset:{pairDetail:key},open:false,isConnected:true});assert.equal(rt.pairDetailStates.get(key),false);
 const group=groups[0],check=rt.pairCheckKey(group.id,group.items[0].id);
 rt.rememberPairDetail({dataset:{pairDetail:key},open:true,isConnected:true});rt.handlePairCheck({dataset:{pairCheck:p.id+'.'+check},checked:true});assert(rt.pairMacroChecklistHtml(p.id,p).includes('1/'+group.items.length));assert.equal(p.status,'Kandidat');
 rt.rememberPairDetail({dataset:{pairDetail:key},open:false,isConnected:true});
 assert.equal(String(rt.relativeRepricingResult),String(old.relativeRepricingResult));assert.equal(String(rt.expectedPolicyDifferentialResult),String(old.expectedPolicyDifferentialResult));
 assert.equal(rt.relativeRepricingResult({}, {},p).value,15);
 const rates=rt.pairRatesMatrixHtml(m,p);assert(rates.includes('Weitere Rates-Details'));assert(rates.includes('Rates-Bestätigungsmatrix'));assert(rates.includes('Datenqualität unvollständig'));
 const warningMatch=rates.match(/Datenqualität unvollständig – (\d+) Hinweise/);const quality= rates.split('Qualitätswarnungen:')[1].split('</ul>')[0];assert.equal((quality.match(/<li>/g)||[]).length,Number(warningMatch[1]));
}
console.log('PASS: all existing accordions, all controls/help/source links preserved; persistent isolated open state, stale-event guard, unchanged records/status/calculations, progress and manual override, warning count.');
