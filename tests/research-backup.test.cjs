const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),version=JSON.parse(read('build-info.json')).version;
const clone=x=>JSON.parse(JSON.stringify(x));
function runtime(){
 const preferences=new Map(),storage={records:new Map(),assets:new Map(),meta:new Map()},elements=new Map();let failKey='',failDB=false,downloaded;
 const el=s=>{if(!elements.has(s))elements.set(s,{innerHTML:'',textContent:'',classList:{toggle(){},remove(){}},querySelector(){return null},getBoundingClientRect(){return {height:0}}});return elements.get(s)};
 const document={readyState:'loading',querySelector:el,querySelectorAll:()=>[],addEventListener(){},documentElement:{style:{setProperty(){}}}};
 const ctx=vm.createContext({window:{addEventListener(){},scrollTo(){}},document,localStorage:{getItem:k=>preferences.get(k)??null,setItem:(k,v)=>{if(k===failKey){failKey='';throw new Error('QuotaExceededError')}preferences.set(k,String(v))},removeItem:k=>preferences.delete(k)},setTimeout:()=>0,clearTimeout(){},console,Intl,URL,Blob});
 for(const f of ['data.base.v'+version+'.js','research-backup.js'])vm.runInContext(read(f),ctx);
 vm.runInContext(read('app.base.v'+version+'.js').replace(/init\(\);\n\}\)\(\);\n$/,'window.T={state,defaultRecord,exportBackup,validateBackup,performImport};download=(b,n)=>window.savedDownload(b,n);\n})();\n'),ctx);
 vm.runInContext(read('chatgpt-macro.js').replace(/\}\)\(\);\s*$/,'window.M={reports,reviews,inputs,pending,trainingExamples,snapshots,reportMarkup};})();'),ctx);
 ctx.window.savedDownload=(b,n)=>downloaded={blob:b,name:n};
 ctx.window.T.state.db={transaction(){const staged=Object.fromEntries(Object.entries(storage).map(([k,v])=>[k,new Map(v)]));let aborted=false;const tx={error:new Error('IDB failed'),abort(){aborted=true},objectStore:n=>({put:v=>staged[n].set(v.id||v.key,clone(v)),clear:()=>staged[n].clear()})};queueMicrotask(()=>{if(failDB||aborted)tx.onabort?.();else{Object.assign(storage,staged);tx.oncomplete?.()}});return tx}};
 return {T:ctx.window.T,M:ctx.window.M,B:ctx.window.FXResearchBackup,preferences,storage,el,download:()=>downloaded,failStorage:k=>failKey=k,failDatabase:()=>failDB=true};
}
(async()=>{
 const a=runtime(),bundle=a.B.capture(),stamp='2026-10-18T12:00:00Z';
 const report={schema_version:'td-macro-report-v1',pair:'EURUSD',as_of:stamp,decision:'LONG',confidence:'medium',summary:'Saved analysis',drivers:[],risks:['Risk'],invalidation:['Invalidation'],research_facts:'Original research'};
 const review={schema_version:'td-macro-review-v1',pair:'EURUSD',report_as_of:stamp,reviewed_at:stamp,verdict:'PASS',evidence_quality:'medium',recommended_decision:'LONG',recommended_confidence:'medium',summary:'Independent check',findings:[],missing_events:[],corrections:[]};
 const id=report.pair+'|'+stamp,input={pair:'EURUSD',rates:{differences:{yield_2y_differential_bp:0}},macro_snapshot:{id:'original'}};
 Object.assign(bundle.data,{reports:[report],reviews:[review],inputs:{[id]:input},pending:{EURUSD:{data:input,expected_as_of:stamp,created_at:stamp}},training:[{id,pair:'EURUSD',as_of:stamp,input,report,review,research_facts:'Facts',answer:'End analysis',note:'Personal note',saved_at:stamp}],edgefinder:[{symbol:'EURUSD',captured_at:stamp,total_score:5,indicators:{}}]});
 a.B.apply(bundle);a.preferences.set('unrelated.secret','DO NOT EXPORT');const trade=a.T.defaultRecord('trade');trade.fields.reviewSlNotes='Keep SL plan';a.T.state.records=[trade];
 await a.T.exportBackup();const backup=JSON.parse(await a.download().blob.text());assert.deepEqual(backup.research,clone(bundle));assert(!JSON.stringify(backup).includes('DO NOT EXPORT'));
 const b=runtime();b.T.validateBackup(backup);await b.T.performImport(backup,'replace');assert.deepEqual(clone(b.B.capture()),clone(bundle));assert.equal(b.T.state.records[0].fields.reviewSlNotes,'Keep SL plan');
 assert.equal(b.M.reports()[0].summary,'Saved analysis');assert.equal(b.M.reviews()[0].summary,'Independent check');assert.equal(b.M.trainingExamples()[0].note,'Personal note');assert.equal(b.M.inputs()[id].rates.differences.yield_2y_differential_bp,0);assert.equal(b.M.pending().EURUSD.expected_as_of,stamp);assert.equal(b.M.snapshots()[0].total_score,5);assert(b.M.reportMarkup(b.M.reports()[0]).includes('Independent check'));
 await b.T.exportBackup();assert.deepEqual(JSON.parse(await b.download().blob.text()).research,backup.research);
 // Merge is idempotent for research and preserves existing versions on conflicts.
 const incoming=clone(bundle);incoming.data.reports[0].summary='Incoming conflicting version';incoming.data.reports.push({...report,pair:'GBPUSD'});await b.T.performImport({...backup,records:[],research:incoming},'merge');await b.T.performImport({...backup,records:[],research:incoming},'merge');assert.equal(b.M.reports().length,2);assert.equal(b.M.reports()[0].summary,'Saved analysis');assert.equal(b.M.reviews().length,1);
 // Old backups in both modes preserve research; explicit empty new backup replaces it.
 const prior=JSON.stringify(b.B.capture()),legacy={format:backup.format,version:1,records:[],assets:[]};for(const mode of ['merge','replace']){b.T.validateBackup(legacy);await b.T.performImport(legacy,mode);assert.equal(JSON.stringify(b.B.capture()),prior)}
 const blank=runtime().B.capture();await b.T.performImport({...legacy,research:blank},'replace');assert.equal(b.M.reports().length,0);assert.equal(b.M.trainingExamples().length,0);
 // Failure in localStorage or IndexedDB never leaves a partial research restore.
 const c=runtime();c.B.apply(bundle);const original=JSON.stringify(c.B.capture());c.failStorage('td.chatgpt.macro.reviews.v1');await c.T.performImport({...legacy,research:blank},'replace');assert.equal(JSON.stringify(c.B.capture()),original);assert(c.el('#toast').textContent.includes('fehlgeschlagen'));
 c.failDatabase();await c.T.performImport({...legacy,research:blank},'replace');assert.equal(JSON.stringify(c.B.capture()),original);assert(c.el('#toast').textContent.includes('fehlgeschlagen'));
 const broken=clone(bundle);broken.data.reports[0].risks=null;assert.throws(()=>c.T.validateBackup({...legacy,research:broken}));assert.equal(JSON.stringify(c.B.capture()),original);
 c.preferences.set('td.chatgpt.macro.reports.v1','broken JSON');await c.T.exportBackup();assert.equal(c.download(),undefined);assert(c.el('#toast').textContent.includes('fehlgeschlagen'));
 console.log('PASS: unified export/import, ChatGPT rendering, all six research stores, training/reviews/inputs, legacy backups, merge conflicts/dedup, replace, unrelated-key isolation and rollback on storage/IDB failure.');
})().catch(e=>{console.error(e);process.exitCode=1});
