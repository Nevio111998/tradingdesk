// Run with node tests/currency-sidebar.test.cjs. Simulated DOM/storage, not browser QA.
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
    relativeRepricingResult,expectedPolicyDifferentialResult${version !== '5.4.7' ? ',currencySummaryHtml' : ''}${['5.5.3','5.5.4'].includes(version) ? ',currencyDocumentationStatus,CURRENCY_DOCUMENTATION_FIELDS,currencyDetailOpen' : ''}${version === '5.5.4' ? ',currencyOverviewHtml,currencyUpcomingEvents,currencyWatchHtml' : ''}};`;
  vm.runInContext(app.replace(/init\(\);\n\}\)\(\);\n$/, expose + '\n})();\n'), context);
  const api = context.window.test;
  api.state.db = db;
  return { ...api, element, listeners, storage, detailNodes };
}

const macro = {
  id: 'test-macro', kind: 'macro', date: '2026-09-08', title: 'Test',
  fields: { compareBase: 'USD', compareQuote: 'JPY' }, checklist: {}, checkNotes: {},
  events: [], images: ['test-image'], unknownLegacyField: { keep: true }, currencies: {}
};
for (const [currency, bias, rate] of [['USD', 'Bullish', '4.25'], ['EUR', 'Bearish', '2.125'], ['JPY', 'Neutral', '0']]) {
  macro.currencies[currency] = {
    bias, confidence: 'High', bankRate: rate, nextMeetingDate: '2026-09-16',
    asOf: '2026-09-08T09:30', real: '1', realTenor: '',
    yield2: '3', yield2Prev: '2.9', yield2Prev2: '2.8',
    pricing3m: '-25', pricing12m: '-50', pricingChange: '7.4',
    pricingChangeHorizon: '12M', probHike: '10', probHold: '70', probCut: '20',
    probHikeChange: '-2', probHoldChange: '3', probCutChange: '-1',
    pricingChangeHistoricalAsOf: '2026-09-01T09:30',
    bankRateDefinition: 'Preserved reference definition', notes: 'Preserved note',
    source: 'https://example.com', opaqueLegacyField: { keep: 'exactly' }
  };
}
const old = runtime('5.5.3'), current = runtime('5.5.4');
function select(rt, record, currency) {
  Object.assign(rt.state, { records: [record], record, id: record.id, route: 'macro', tab: 'currencies', currency });
  return rt.renderCurrencies(record);
}
const before = clone(macro), after = clone(macro);
for (const currency of ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'NZD', 'CAD', 'CHF']) {
  const legacyHtml = select(old, before, currency), updatedHtml = select(current, after, currency);
  const links=html=>Array.from(new Set(html.match(/href="[^"]+"/g)||[])).sort();assert.deepEqual(links(updatedHtml),links(legacyHtml),'All existing source links remain available');
  // Compare every real input, option and saved value, independent of its new position.
  const controls = html => (html.match(/<input\b[^>]*>|<select\b[\s\S]*?<\/select>|<textarea\b[\s\S]*?<\/textarea>/g)||[]).sort();
  assert.deepEqual(controls(updatedHtml), controls(legacyHtml));
  for (const letter of ['A','B','C','D']) assert(updatedHtml.includes('id="currency-section-'+letter+'"'));
  for (const key of ['Hike','Hold','Cut']) {
    const column = updatedHtml.split('<div class="currency-probability-column">').find(x=>x.split('</div></div>')[0].includes('prob'+key+'"'));
    assert(column && column.indexOf('prob'+key+'"') < column.indexOf('prob'+key+'Change"'));
  }
  const nav = updatedHtml.slice(0, updatedHtml.indexOf('</nav>'));
  assert.equal((nav.match(/data-currency=/g) || []).length, 8);
  assert.equal((nav.match(/aria-pressed="true"/g) || []).length, 1);
}
// Custom and 3M horizon fields/options must survive regrouping too.
for (const horizon of ['3M','6M','']) {
  const a = clone(macro), b = clone(macro);
  a.currencies.USD.pricingChangeHorizon = horizon;
  b.currencies.USD.pricingChangeHorizon = horizon;
  const controls = html => (html.match(/<input\b[^>]*>|<select\b[\s\S]*?<\/select>|<textarea\b[\s\S]*?<\/textarea>/g)||[]).sort();
  assert.deepEqual(controls(select(current,b,'USD')),controls(select(old,a,'USD')));
}
assert.deepEqual(clone(after), clone(before), 'Summary must not add changes to currency hydration');
const snapshot = JSON.stringify(after);
const absent = current.currencySummaryHtml(after, 'CHF');
assert(absent.includes('Nicht erfasst'));
assert(!absent.includes('0.00 %'));
assert.equal(JSON.stringify(after), snapshot, 'Summary is read-only');
assert(current.currencySummaryHtml(after, 'JPY').includes('0.00 %'));
assert(current.currencySummaryHtml(after, 'USD').includes('pill good'));
assert(current.currencySummaryHtml(after, 'EUR').includes('2.125 %'));
assert(current.currencySummaryHtml(after, 'EUR').includes('pill bad'));
const escaped = clone(after); escaped.currencies.USD.confidence = '<img onerror=bad>';
assert(current.currencySummaryHtml(escaped, 'USD').includes('&lt;img onerror=bad&gt;'));

async function main() {
  current.installEvents();
  const eventMacro=clone(macro);eventMacro.currencies.USD.nextMeetingDate='';
  eventMacro.events=[
    {id:'old',currency:'USD',at:'2026-09-07T09:00',title:'Past'},
    {id:'eur',currency:'EUR',at:'2026-09-09T09:00',title:'EUR only'},
    {id:'usd',currency:'USD',at:'2026-09-10T09:00',title:'USD data',impact:'High'},
    {id:'global',currency:'Global',at:'2026-09-08T14:00',title:'Global event'},
    {id:'pair',currency:'USDJPY',at:'2026-09-11T09:00',title:'Pair event'},
    {id:'invalid',currency:'USD',at:'bad date',title:'Invalid'},
    {id:'fourth',currency:'USD',at:'2026-09-12T09:00',title:'Fourth event'}
  ];
  const eventSnapshot=JSON.stringify(eventMacro);
  assert.deepEqual(Array.from(current.currencyUpcomingEvents(eventMacro,'USD'),e=>e.id),['global','usd','pair','fourth']);
  const watch=current.currencyWatchHtml(eventMacro,'USD');
  assert(!watch.includes('Fourth event'));assert(watch.includes('Weitere Termine'));assert(watch.includes('kein Live-Kalender'));
  assert.equal(JSON.stringify(eventMacro),eventSnapshot,'Sidebar cannot change or sort stored events');
  eventMacro.currencies.USD.nextMeetingDate='2026-09-09';
  assert(current.currencyUpcomingEvents(eventMacro,'USD').some(e=>e.title==='Federal Reserve · Sitzung'));
  assert.equal(current.currencyUpcomingEvents({...eventMacro,date:''},'USD').length,0);
  const overview=current.currencyOverviewHtml(macro,'USD');
  assert.equal((overview.match(/data-currency=/g)||[]).length,8);
  assert.equal((overview.match(/aria-pressed="true"/g)||[]).length,1);
  for(const currency of ['USD','EUR','JPY'])assert(overview.includes(currency));

  select(current, after, 'USD');
  const initial = current.renderCurrencies(after);
  assert.equal((initial.match(/<details\b/g)||[]).length,3);
  assert(!/<details[^>]*\sopen(?:>|\s)/.test(initial),'Both panels start collapsed');
  assert.equal((initial.match(/<fieldset class="currency-meta-group">/g)||[]).length,5);
  assert(initial.indexOf('Paarvergleich')<initial.indexOf('currency-section-A'));
  assert.equal(current.currencyDocumentationStatus({}),'Datenqualität: Nicht dokumentiert');
  assert.equal(current.currencyDocumentationStatus({bankRateSource:'Source'}),'Datenqualität: Teilweise dokumentiert');
  const complete=Object.fromEntries(Array.from(current.CURRENCY_DOCUMENTATION_FIELDS,key=>[key,'documented']));
  assert.equal(current.currencyDocumentationStatus(complete),'Datenqualität: Vollständig dokumentiert');
  const quality={dataset:{currencyDetail:after.id+':USD:quality'},open:true,isConnected:true};
  const pair={dataset:{currencyDetail:after.id+':pair'},open:true,isConnected:true};
  const priorRecords=JSON.stringify(after),priorDirty=current.state.dirty;
  current.listeners.get('toggle')({target:quality});
  current.listeners.get('toggle')({target:pair});
  assert.equal(JSON.stringify(after),priorRecords,'Toggle cannot mutate a record');
  assert.equal(current.state.dirty,priorDirty,'Toggle cannot trigger a save');
  assert.equal(current.currencyDetailOpen(after.id+':USD:quality'),' open');
  assert.equal(current.currencyDetailOpen(after.id+':EUR:quality'),'');
  current.detailNodes.push(quality,pair);
  current.handleBound({dataset:{bind:'currencies.USD.pricingChangeHorizonChoice'},value:'3M',type:'select-one'});
  assert.equal(current.currencyDetailOpen(after.id+':USD:quality'),' open','Re-render preserves open details');
  select(current,after,'EUR');select(current,after,'USD');
  assert(current.renderCurrencies(after).includes('data-currency-detail="'+after.id+':USD:quality" open'));
  quality.open=false;current.listeners.get('toggle')({target:quality});
  assert.equal(current.currencyDetailOpen(after.id+':USD:quality'),'');
  current.handleBound({dataset:{bind:'currencies.USD.bankRateSource'},value:'Documented source',type:'text'});
  assert.equal(current.element('#currency-documentation-status').textContent,current.currencyDocumentationStatus(after.currencies.USD));
  current.detailNodes.length=0;

  for (const currency of ['USD', 'EUR', 'JPY']) {
    select(current, after, currency);
    for (const [key, value, type] of [
      ['bankRate', '-0.25', 'number'], ['bias', 'Strong Bearish', 'select-one'],
      ['confidence', 'Low', 'select-one'], ['nextMeetingDate', '2026-10-15', 'date'],
      ['asOf', '2026-09-09T11:45', 'datetime-local']
    ]) {
      const input = { dataset: { bind: `currencies.${currency}.${key}` }, value, type };
      current.handleBound(input);
      const summary = current.element('#currency-summary').innerHTML;
      assert.equal(summary, current.currencySummaryHtml(after, currency));
      assert.equal(after.currencies[currency][key], value);
      if(['bias','confidence'].includes(key))assert.equal(current.element('#currency-quick-list').innerHTML,current.currencyOverviewHtml(after,currency));
      if(key==='nextMeetingDate')assert.equal(current.element('#currency-watch').innerHTML,current.currencyWatchHtml(after,currency));
      assert.equal(input.value, value, 'Editing does not replace the input');
    }
    const button = { dataset: { currency: 'CHF' }, classList: { contains: () => true } };
    await current.listeners.get('click')({ target: { closest: q => q === '[data-currency]' ? button : null } });
    button.dataset.currency = currency;
    await current.listeners.get('click')({ target: { closest: q => q === '[data-currency]' ? button : null } });
    assert.equal(after.currencies[currency].bankRate, '-0.25');
    assert.equal(current.element(`.currency-nav [data-currency="${currency}"]`).focusOptions.preventScroll, true);
  }
  const asset = { id: 'test-image', caption: 'Keep screenshot', data: 'unchanged' };
  current.storage.assets.set(asset.id, asset);
  await current.saveNow();
  assert.deepEqual(current.storage.records.get(after.id), clone(after));
  assert.deepEqual(current.storage.assets.get(asset.id), asset);
  assert.equal(after.currencies.USD.realTenor, '');
  assert.deepEqual(after.unknownLegacyField, { keep: true });
  assert.equal(current.spreadHtml(after), old.spreadHtml(after));
  for (const fn of ['relativeRepricingResult', 'expectedPolicyDifferentialResult', 'spreadHtml', 'saveNow']) {
    assert.equal(String(current[fn]), String(old[fn]), `${fn} remains unchanged`);
  }
  const a = { pricingChange: '7.4', pricingChangeHorizon: '12M' };
  const b = { pricingChange: '-8.7', pricingChangeHorizon: '12M' };
  assert(Math.abs(current.relativeRepricingResult(a,b).value - 16.1) < 1e-10);
  console.log('PASS: all eight currencies retain identical controls/options/values; sidebar live updates, event filtering/order/limit, source-link preservation, collapsed defaults and detail state verified; USD/EUR/JPY edits, tab clicks, summary refresh, serialized records/assets and rate calculations verified in simulated DOM/storage.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
