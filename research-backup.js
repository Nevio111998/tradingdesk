/* Local research backup bridge. Only these six application keys are exported. */
(()=>{'use strict';
const PREFIX='td.chatgpt.macro.';
const specs=[['reports',PREFIX+'reports.v1','array',x=>x.pair+'|'+x.as_of],['reviews',PREFIX+'reviews.v1','array',x=>x.pair+'|'+x.report_as_of+'|'+x.reviewed_at],['inputs',PREFIX+'inputs.v1','object'],['training',PREFIX+'training.v1','array',x=>x.id],['pending',PREFIX+'pending.v1','object'],['edgefinder','td.edgefinder.snapshots.v1','array',x=>x.symbol+'|'+x.captured_at]];
const obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const string=x=>typeof x==='string'&&x.length>0;
const texts=x=>Array.isArray(x)&&x.every(v=>typeof v==='string');
const report=x=>obj(x)&&string(x.pair)&&string(x.as_of)&&typeof x.summary==='string'&&Array.isArray(x.drivers)&&x.drivers.every(obj)&&texts(x.risks)&&texts(x.invalidation);
const review=x=>obj(x)&&string(x.pair)&&string(x.report_as_of)&&string(x.reviewed_at)&&Array.isArray(x.findings)&&x.findings.every(obj)&&texts(x.missing_events)&&texts(x.corrections);
function validate(bundle){
 if(!obj(bundle)||bundle.version!==1||!obj(bundle.data))throw new Error('Ungültiger ChatGPT-/EdgeFinder-Backup-Bereich.');
 for(const [name,,type] of specs){const v=bundle.data[name];if(type==='array'?!Array.isArray(v):!obj(v))throw new Error('Ungültiger Research-Bereich: '+name);if(Object.keys(v).length>10000)throw new Error('Zu viele Research-Einträge: '+name);
 const valid=name==='reports'?v.every(report):name==='reviews'?v.every(review):name==='training'?v.every(x=>obj(x)&&string(x.id)&&string(x.pair)&&string(x.as_of)&&obj(x.input)&&typeof x.research_facts==='string'&&typeof x.answer==='string'&&typeof x.note==='string'&&report(x.report)&&(x.review==null||review(x.review))):name==='edgefinder'?v.every(x=>obj(x)&&string(x.symbol)&&string(x.captured_at)):Object.values(v).every(obj);
 if(!valid)throw new Error('Beschädigte Research-Einträge: '+name);
 }
 return bundle;
}
function capture(){const data={};for(const [name,key,type] of specs){const raw=localStorage.getItem(key);try{data[name]=raw===null?(type==='array'?[]:{}):JSON.parse(raw)}catch{throw new Error('Lokale Research-Daten sind nicht lesbar: '+name)}}return validate({version:1,data});}
function prepare(bundle,mode){
 if(bundle===undefined)return null; // Legacy backups never erase research data.
 validate(bundle);const incoming=JSON.parse(JSON.stringify(bundle));
 if(mode==='replace')return incoming;
 const current=capture();
 for(const [name,,type,id] of specs){const old=current.data[name],add=incoming.data[name];if(type==='object')current.data[name]={...add,...old};else{const ids=new Set(old.map(id));current.data[name]=old.concat(add.filter(x=>{const k=id(x);if(ids.has(k))return false;ids.add(k);return true}));}}
 return validate(current);
}
function apply(bundle){
 if(bundle===null)return ()=>{};
 validate(bundle);const changed=[];
 function rollback(){for(const x of changed)localStorage.removeItem(x.key);for(const x of changed)if(x.old!==null)localStorage.setItem(x.key,x.old);}
 try{for(const [name,key] of specs){const value=JSON.stringify(bundle.data[name]),old=localStorage.getItem(key);if(old===value)continue;localStorage.setItem(key,value);changed.push({key,old});}}
 catch(e){try{rollback()}catch{throw new Error('Research-Import fehlgeschlagen; Wiederherstellung des lokalen Speichers fehlgeschlagen. Bitte vorheriges Backup behalten.')}throw new Error('Research-Daten konnten nicht gespeichert werden (z. B. Speicher voll). Bestehende Daten bleiben erhalten. '+e.message)}
 return rollback;
}
function summary(bundle){if(bundle===undefined)return 'Älteres Backup ohne Research-Daten: vorhandene ChatGPT- und EdgeFinder-Daten bleiben erhalten.';validate(bundle);const d=bundle.data;return d.reports.length+' ChatGPT-Analysen · '+d.reviews.length+' Zweitprüfungen · '+d.training.length+' Trainingsbeispiele · '+d.edgefinder.length+' EdgeFinder-Snapshots';}
window.FXResearchBackup={capture,validate,prepare,apply,summary};
})();
