// Exercise the real startup path, including its version gate and saved record reads.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const version=JSON.parse(read('build-info.json')).version;
async function start(mismatch){
 const elements=new Map();const element=s=>{if(!elements.has(s))elements.set(s,{innerHTML:'',textContent:'',classList:{toggle(){},remove(){}},addEventListener(){},getBoundingClientRect(){return {height:70}}});return elements.get(s)};
 const records=[{id:'saved-analysis',kind:'macro',title:'Preserved analysis',date:'2026-09-10',fields:{},currencies:{USD:{probHike:'12'}},pairs:[],events:[],images:[]}];
 const before=JSON.stringify(records);let opens=0;
 const resultRequest=value=>{const req={result:value};queueMicrotask(()=>req.onsuccess?.());return req};
 const db={transaction(store,mode){assert.equal(mode,'readonly','Startup must not rewrite saved records');return {objectStore(){return {getAll(){return resultRequest(store==='records'?records:[])}}}}}};
 const indexedDB={open(name,n){opens++;assert.equal(name,'fx-trade-desk');assert.equal(n,1);return resultRequest(db)}};
 const context=vm.createContext({window:{indexedDB,addEventListener(){},scrollTo(){}},indexedDB,document:{querySelector:element,querySelectorAll:()=>[],addEventListener(){},documentElement:{dataset:{},style:{setProperty(){}}}},localStorage:{getItem:()=>null},location:{hash:''},console:{error(){}},setTimeout:()=>0,clearTimeout(){},URL,Intl});
 vm.runInContext(read('data.base.v'+version+'.js'),context);
 assert.equal(context.window.FX_COMPANION_DATA_VERSION,version,'The shipped data marker must match the release');
 if(mismatch)context.window.FX_COMPANION_DATA_VERSION='incompatible';
 const core=read('app.base.v'+version+'.js');assert(core.endsWith('init();\n})();\n'));
 vm.runInContext(core.replace(/init\(\);\n\}\)\(\);\n$/,'window.started=init();\n})();\n'),context);
 await context.window.started;
 if(mismatch){assert.equal(opens,0);assert(element('#view').innerHTML.includes('Versionskonflikt'))}
 else{assert.equal(opens,1);assert(!element('#view').innerHTML.includes('App konnte nicht gestartet'));assert(element('#view').innerHTML.includes('Preserved analysis'));assert.equal(element('#loaded-version').textContent,'Code geladen · v'+version)}
 assert.equal(JSON.stringify(records),before);
}
(async()=>{await start(false);await start(true);console.log('PASS: real startup, matching version markers, saved analysis retained, mismatch rejected before database access.');})().catch(e=>{console.error(e);process.exitCode=1});
