/* ChatGPT Macro handoff sidecar for FX TradingDesk. No writes to existing IndexedDB. */
(()=>{'use strict';
const EDGE_KEY='td.edgefinder.snapshots.v1', OUT_KEY='td.chatgpt.macro.reports.v1';
const PAIRS=['EURUSD','GBPUSD','AUDUSD','NZDUSD','USDCAD','USDJPY','CADJPY','EURGBP','EURAUD','EURNZD','EURCAD','EURJPY','AUDCAD','NZDCAD','GBPAUD','GBPNZD','GBPCAD','GBPJPY','AUDNZD','AUDJPY','NZDJPY','USDCHF','EURCHF','GBPCHF','AUDCHF','NZDCHF','CADCHF','CHFJPY'];
const $=s=>document.querySelector(s), safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json=(key)=>{try{return JSON.parse(localStorage.getItem(key)||'[]')}catch{return []}};
const results=()=>{const v=json(OUT_KEY);return Array.isArray(v)?v:[]};
const snapshots=()=>{const v=json(EDGE_KEY);return Array.isArray(v)?v:[]};
const latest=(symbol)=>snapshots().filter(x=>x?.symbol===symbol).sort((a,b)=>String(b.captured_at).localeCompare(String(a.captured_at)))[0]||null;
let selected='EURUSD',notice='';
const time=x=>{if(!x)return 'Unbekannt';const d=new Date(x);return Number.isNaN(d.valueOf())?'Unbekannt':d.toLocaleString('de-CH')};
function readMacros(){return new Promise(resolve=>{let req;try{req=indexedDB.open('fx-trade-desk',1)}catch{return resolve([])}req.onupgradeneeded=()=>{req.transaction.abort()};req.onerror=()=>resolve([]);req.onsuccess=()=>{const db=req.result;if(!db.objectStoreNames.contains('records')){db.close();return resolve([])};try{const tx=db.transaction('records','readonly'),g=tx.objectStore('records').getAll();g.onsuccess=()=>{db.close();resolve((g.result||[]).filter(r=>r?.kind==='macro').sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).slice(0,2))};g.onerror=()=>{db.close();resolve([])}}catch{db.close();resolve([])}}})}
// Export only the quantitative Rates details; never export free-text macro notes.
const RATE_FIELDS=['bankRate','pricing3m','pricing12m','pricingChange','yield2','yield2Prev','yield2Prev2','real'];
function num(v){if(v===null||v===undefined||String(v).trim()==='')return null;const n=Number(String(v).trim().replace(',','.'));return Number.isFinite(n)?n:null}
function picked(record,c){const d=record?.currencies?.[c];if(!d||typeof d!=='object')return null;const out={};for(const k of RATE_FIELDS){const n=num(d[k]);if(n!==null)out[k]=n}return Object.keys(out).length?out:null}
const subtract=(a,b,mult=1)=>a==null||b==null?null:Math.round((a-b)*mult*100)/100;
function buildRates(base,quote){
 const bankDiff=subtract(base?.bankRate,quote?.bankRate,100);
 const pricing3m=subtract(base?.pricing3m,quote?.pricing3m);
 const pricing12m=subtract(base?.pricing12m,quote?.pricing12m);
 const relativeRepricing=subtract(base?.pricingChange,quote?.pricingChange);
 const y2=subtract(base?.yield2,quote?.yield2,100);
 const prev1=subtract(base?.yield2Prev,quote?.yield2Prev,100);
 const prev2=subtract(base?.yield2Prev2,quote?.yield2Prev2,100);
 const real=subtract(base?.real,quote?.real,100);
 return {
  pricing_3m_differential_bp:pricing3m,
  pricing_12m_differential_bp:pricing12m,
  relative_repricing_vs_previous_week_bp:relativeRepricing,
  expected_policy_rate_differential_3m_bp:bankDiff===null||pricing3m===null?null:Math.round((bankDiff+pricing3m)*100)/100,
  expected_policy_rate_differential_12m_bp:bankDiff===null||pricing12m===null?null:Math.round((bankDiff+pricing12m)*100)/100,
  yield_2y_differential_bp:y2,
  yield_2y_repricing_vs_1w_bp:y2===null||prev1===null?null:Math.round((y2-prev1)*100)/100,
  yield_2y_repricing_vs_2w_bp:y2===null||prev2===null?null:Math.round((y2-prev2)*100)/100,
  real_yield_differential_bp:real
 };
}
async function promptPayload(){
 const snap=latest(selected),records=await readMacros();
 const [baseCode,quoteCode]=[selected.slice(0,3),selected.slice(3,6)];
 // Latest available entered values by currency, not blindly combined from one record.
 // Older timestamps in manually curated fields are ignored; record order is used to select the newest entry.
 const values=(c)=>{for(const rec of records){const p=picked(rec,c);if(p)return p}return null};
 const base=values(baseCode),quote=values(quoteCode);
 const data={schema_version:'td-macro-rates-handoff-v2',pair:selected,
   rates:{basis:'base_minus_quote',unit:'bp',base_currency:baseCode,quote_currency:quoteCode,
     differences:buildRates(base,quote)},
   edgefinder:snap?{symbol:snap.symbol,total_score:snap.total_score,
     indicators:Object.fromEntries(Object.entries(snap.indicators||{}).map(([k,v])=>[k,{score:v?.score??null,bias:v?.bias??null,status:v?.status??'unknown'}]))}:null};
 const preamble=`Du bist mein unabhängiger FX-Makro-Researcher. Analysiere ${selected} für Swing-Trading über 2–10 Handelstage. Keine technische Analyse. Nutze aus TradingDesk AUSSCHLIESSLICH die angehängten Rates-Differentials (und keine anderen TradingDesk-Originalfelder) sowie den EdgeFinder-Score samt Komponenten. Keine anderen TradingDesk-Felder oder Wochenkommentare wurden exportiert.\n\n`+
 `WICHTIG: Die manuell gepflegten Rates-Eingaben wurden vom Nutzer freigegeben. Ignoriere deren alte gespeicherte Feld-Zeitstempel und werte sie nicht allein wegen dieser als veraltet ab. Prüfe dennoch Zahlen, Einheiten, Berechnungen, Widersprüche und implizite Annahmen kritisch. Fehlende/null-Werte sind unbekannt, nicht null. Die erwarteten Leitzins-Differentials sind mechanisch aus intern hinterlegtem Zins-Spread plus Pricing-Differential berechnet und keine sichere Zinsprognose. Ein Zinssatz wie 'real' ist ein benutzerdefinierter Proxy, nicht zwingend eine marktbasierte Realrendite.\n\n`+
 `Recherchiere SELBSTSTÄNDIG im Web und ENTSCHEIDE selber, was für dieses Paar am wichtigsten ist. Pflichtmodule:\n`+
 `A) MARKET DRIVER: Aktuelles Risk-on/Risk-off-Regime, WARUM der Markt so reagiert, dominierende Nachrichten/Mechanismen und ihr spezifischer Einfluss auf Base und Quote; trenne beobachtete Fakten von Interpretation.\n`+
 `B) EVENT RISK: Prüfe den aktuellen Wirtschaftskalender auf bevorstehende High-Impact-Events für beide Währungen im Swing-Horizont, einschliesslich Zeitpunkt/Zeitzone, Erwartung und möglicher Überraschungswirkung. Zentralbanksitzungen, aktuelle Leitzinsen/Zinserwartungen sowie relevante Reden/Protokolle/Tonänderungen beider Zentralbanken recherchieren. Die bestehenden Rates-Felder nicht wegen ihrer Feld-Datenstempel abwerten; widersprechende NEUE Primärdaten dennoch transparent aufzeigen.\n`+
 `C) INTERMARKET CONFIRMATIONS: Entscheide eigenständig, ob und welche Rohstoffe, China-Daten, Aktien/Anleihen, Risiko- und Handelsverflechtungen oder sonstigen Cross-Asset-Signale relevant sind. Für GBPAUD prüfe beispielsweise Rohstoffe und China-Sensitivität des AUD, aber nur mit konkretem aktuellem Beleg. Bestätigung und Widerspruch jeweils erklären.\n`+
 `D) RATES + EDGEFINDER: Beurteile die importierten 3M/12M-Pricing-, Repricing-, 2Y- und Real-Differentials und den EdgeFinder-Gesamtscore mit seinen Teilkomponenten. Verhindere Doppelzählung korrelierter Signale.\n\n`+
 `Nutze nachprüfbare aktuelle Quellen und Links, bevorzugt Zentralbanken/Statistikämter/seriöse Märkte. Prüfe das Datum jeder EXTERNEN News und den Veranstaltungstermin jedes Events. Erfinde keine Daten. Beurteile, was bereits eingepreist sein könnte. Beschreibe bullishe und bearishe Gegenthese und nenne Katalysatoren für eine Neubewertung. LONG bedeutet Base kaufen/Quote verkaufen, SHORT das Gegenteil. Wenn die Evidenz nicht genügt: WAIT. Gib zuerst die knappe, aber substanzielle Analyse gegliedert nach Market Driver, Event Risk, Intermarket, Rates/EdgeFinder und Gesamturteil. Danach EINEN gültigen JSON-Codeblock mit EXAKT dieser Struktur (keine Kommentare und keine weiteren Schlüssel): {"schema_version":"td-macro-report-v1","pair":"${selected}","decision":"WAIT","confidence":"low","as_of":"${new Date().toISOString()}","summary":"Begründung mit allen vier Modulen","drivers":[{"factor":"Market Driver / Event Risk / Intermarket / Rates / EdgeFinder","impact":"bullish|bearish|neutral","reason":"Wirkung auf ${selected}","source_url":"https://...","published_at":"YYYY-MM-DD"}],"risks":["Risiko"],"invalidation":["Welche Fakten ändern die Einschätzung"]}. Entscheidung nur LONG/SHORT/WAIT; Confidence nur low/medium/high.\n\nDATEN:\n`;
 return preamble+JSON.stringify(data,null,2)
}
function reportValid(x){return !!x&&x.schema_version==='td-macro-report-v1'&&PAIRS.includes(x.pair)&&['LONG','SHORT','WAIT'].includes(x.decision)&&['low','medium','high'].includes(x.confidence)&&typeof x.summary==='string'&&x.summary.length>3&&x.summary.length<25000&&typeof x.as_of==='string'&&!Number.isNaN(Date.parse(x.as_of))&&Array.isArray(x.drivers)&&x.drivers.length<=25&&x.drivers.every(d=>d&&typeof d.factor==='string'&&typeof d.reason==='string'&&['bullish','bearish','neutral'].includes(d.impact)&&(!d.source_url||/^https:\/\//.test(d.source_url)))&&Array.isArray(x.risks)&&Array.isArray(x.invalidation)}
function parseReport(raw){let s=String(raw).trim();const m=s.match(/```(?:json)?\s*([\s\S]*?)```/i);if(m)s=m[1].trim();const obj=JSON.parse(s);if(!reportValid(obj))throw new Error('JSON-Format oder Pflichtfelder ungültig. Bitte den vollständigen ChatGPT-JSON-Codeblock einfügen.');return obj}
function storeReport(x){const all=results();const id=x.pair+'|'+x.as_of;if(!all.some(y=>y.pair+'|'+y.as_of===id)){all.push(x);localStorage.setItem(OUT_KEY,JSON.stringify(all.slice(-150)))}return all}
function render(){const view=$('#view');if(!view)return;const snap=latest(selected),reps=results().filter(x=>x.pair===selected).sort((a,b)=>String(b.as_of).localeCompare(String(a.as_of))),r=reps[0];
view.innerHTML=`<section class="chat-macro"><header><h1>ChatGPT Makroanalyse</h1><p>Nur Rates-Differentials + EdgeFinder → selbstständige ChatGPT-Recherche → Analyseimport. Keine API-Schlüssel nötig.</p></header><div class="cm-row"><label for="cm-pair">Währungspaar</label><select id="cm-pair">${PAIRS.map(p=>`<option ${p===selected?'selected':''}>${p}</option>`).join('')}</select><span>EdgeFinder: ${snap?'Score '+safe(snap.total_score)+' · '+safe(time(snap.captured_at)):'Noch keine Daten'}</span></div><div class="cm-actions"><button type="button" class="button button-primary" id="cm-copy">Analyseauftrag kopieren</button><button type="button" class="button button-outline" id="cm-open">ChatGPT öffnen</button></div><p class="cm-hint">1. Auftrag kopieren · 2. ChatGPT öffnen und einfügen · 3. Antwort mit JSON-Codeblock hier importieren. ChatGPT erhält Daten nur, wenn du sie selbst einfügst.</p><label for="cm-response"><strong>ChatGPT-Ergebnis importieren</strong></label><textarea id="cm-response" rows="7" placeholder="JSON-Codeblock aus ChatGPT hier einfügen …"></textarea><div class="cm-actions"><button class="button button-primary" id="cm-import">Analyse speichern</button><button class="button button-outline" id="cm-backup">Analysen exportieren</button></div><p id="cm-status" role="status">${safe(notice)}</p>${r?`<article class="cm-report"><div class="cm-row"><h2>${safe(r.pair)} · ${safe(r.decision)}</h2><strong>Confidence: ${safe(r.confidence)}</strong><span>${safe(time(r.as_of))}</span></div><p>${safe(r.summary)}</p><h3>Markttreiber</h3>${r.drivers.map(d=>`<div class="cm-driver"><strong>${safe(d.factor)} (${safe(d.impact)})</strong><p>${safe(d.reason)}</p>${d.source_url?`<a href="${safe(d.source_url)}" target="_blank" rel="noopener noreferrer">Quelle ↗</a>`:''}${d.published_at?' · '+safe(d.published_at):''}</div>`).join('')||'<p>Keine belegt</p>'}<h3>Risiken</h3><ul>${r.risks.map(v=>`<li>${safe(v)}</li>`).join('')}</ul><h3>Neubewertung bei</h3><ul>${r.invalidation.map(v=>`<li>${safe(v)}</li>`).join('')}</ul></article>`:'<p class="cm-hint">Für dieses Paar ist noch keine ChatGPT-Analyse gespeichert.</p>'}</section>`;
$('#cm-pair').addEventListener('change',e=>{selected=e.target.value;notice='';render()});$('#cm-copy').addEventListener('click',async()=>{try{const data=await promptPayload();await navigator.clipboard.writeText(data);notice='Auftrag kopiert. Jetzt in ChatGPT einfügen.'}catch(e){notice='Kopieren blockiert. Bitte Browser-Berechtigungen prüfen: '+e.message}render()});$('#cm-open').addEventListener('click',()=>window.open('https://chatgpt.com/','_blank','noopener,noreferrer'));$('#cm-import').addEventListener('click',()=>{try{const x=parseReport($('#cm-response').value);if(x.pair!==selected)throw new Error('Das JSON gehört zu '+x.pair+', ausgewählt ist '+selected);storeReport(x);notice='Analyse gespeichert. '+x.pair+' · '+x.decision;render()}catch(e){$('#cm-status').textContent=e.message}});$('#cm-backup').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({schema_version:'td-macro-reports-export-v1',reports:results()},null,2)],{type:'application/json'});const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='tradingdesk-chatgpt-analysen.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),5000)});
}
function start(){const nav=$('.main-nav');if(!nav)return;if($('#chatgpt-macro-nav'))return;const b=document.createElement('button');b.type='button';b.id='chatgpt-macro-nav';b.className='nav-item';b.innerHTML='<span class="nav-icon">✦</span> ChatGPT Makroanalyse';nav.append(b);b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));b.classList.add('active');const crumbs=$('#breadcrumbs');if(crumbs)crumbs.textContent='Workspace / ChatGPT Makroanalyse';notice='';render();},{capture:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
