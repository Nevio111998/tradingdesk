/* Public headline reader. Personal selections are saved only through the core's IndexedDB path. */
(()=>{
'use strict';
const CURRENCIES=['USD','EUR','GBP','JPY','AUD','NZD','CAD','CHF'];
const TOPICS=['Zentralbanken','Konjunktur','Geopolitik','Rohstoffe'];
const CACHE='td.public-news.v1';
const ENDPOINT='https://raw.githubusercontent.com/Nevio111998/tradingdesk/main/feeds/news.json';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url=x=>{try{const u=new URL(x);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.href:''}catch{return ''}};
const iso=x=>typeof x==='string'&&Number.isFinite(Date.parse(x))?new Date(x).toISOString():null;
const date=x=>iso(x)?new Date(x).toLocaleString('de-CH',{dateStyle:'short',timeStyle:'short'}):'Zeitpunkt nicht angegeben';
function normalizeItem(x){
 if(!x||typeof x.title!=='string'||!x.title.trim()||!url(x.url)||typeof x.id!=='string'||!x.id)return null;
 return {id:x.id.slice(0,100),title:x.title.slice(0,500),url:url(x.url),source:String(x.source||'Quelle').slice(0,150),sourceId:String(x.sourceId||'').slice(0,100),publishedAt:iso(x.publishedAt),fetchedAt:iso(x.fetchedAt),currencies:(Array.isArray(x.currencies)?x.currencies:[]).filter(c=>CURRENCIES.includes(c)),topics:(Array.isArray(x.topics)?x.topics:[]).filter(t=>TOPICS.includes(t))};
}
function normalizeFeed(x){
 if(x?.schemaVersion!==1||!Array.isArray(x.items)||!iso(x.generatedAt))throw new Error('Ungültiger Nachrichtenfeed.');
 const seen=new Set();const items=x.items.slice(0,1000).map(normalizeItem).filter(i=>i&&!seen.has(i.url)&&seen.add(i.url));
 return {schemaVersion:1,generatedAt:iso(x.generatedAt),items,sources:(Array.isArray(x.sources)?x.sources:[]).slice(0,30).map(s=>({id:String(s.id||''),name:String(s.name||''),url:url(s.url),status:s.status==='ok'?'ok':'unavailable',lastSuccessAt:iso(s.lastSuccessAt)}))};
}
function selectItems(items,filters,clock=Date.now()){
 const q=String(filters.query||'').trim().toLowerCase(),days=Number(filters.days)||7;
 return items.filter(i=>{
  if(filters.currency&&!(filters.currency==='Global'?i.currencies.length===0:i.currencies.includes(filters.currency)))return false;
  if(filters.topic&&!i.topics.includes(filters.topic))return false;
  if(q&&!`${i.title} ${i.source}`.toLowerCase().includes(q))return false;
  // Unknown publication time is excluded from a time window, shown only under All available.
  return days===30?true:!!i.publishedAt&&clock-Date.parse(i.publishedAt)<=days*86400000&&Date.parse(i.publishedAt)<=clock+900000;
 }).sort((a,b)=>(Date.parse(b.publishedAt)||0)-(Date.parse(a.publishedAt)||0));
}
function attach(record,pairId,raw,note='',at=new Date().toISOString()){
 const item=normalizeItem(raw),p=record?.kind==='macro'&&record.pairs?.find(p=>p.id===pairId);
 if(!p||!item)throw new Error('Meldung oder Zielanalyse nicht mehr verfügbar.');
 if(p.news!==undefined&&!Array.isArray(p.news))throw new Error('Vorhandene News-Daten können nicht sicher ergänzt werden.');
 if((p.news||[]).some(x=>x.id===item.id||x.url===item.url))return false;
 p.news=[...(p.news||[]),{...item,note:String(note).trim().slice(0,3000),addedAt:at}];
 return true;
}
function pairHtml(p){
 const rows=(Array.isArray(p?.news)?p.news:[]).filter(x=>normalizeItem(x));
 if(!rows.length)return '';
 return `<section class="news-saved"><h3>Gespeicherte News & Market Driver</h3>${rows.map(x=>`<article><a href="${esc(url(x.url))}" target="_blank" rel="noopener noreferrer">${esc(x.title)} ↗</a><small>${esc(x.source)} · ${esc(date(x.publishedAt))} · übernommen ${esc(date(x.addedAt))}</small>${x.note?`<p>${esc(x.note)}</p>`:''}</article>`).join('')}</section>`;
}
let feed=null,loading=false,lastAttempt=0,error='',bridge=null;
const filters={currency:'',topic:'',days:'7',query:''};
try{const raw=localStorage.getItem(CACHE);if(raw)feed=normalizeFeed(JSON.parse(raw));}catch{}
function render(){return `<section id="news-root"><div class="page-head"><div><div class="eyebrow">RECHERCHE</div><h1>News & Market Driver</h1><p>Neue Meldungen sichten und gezielt zur Paaranalyse übernehmen.</p></div><button class="button button-primary" type="button" id="news-refresh">Feed neu laden</button></div><div class="news-research"><a class="button button-outline" href="https://finance.worldmonitor.app" target="_blank" rel="noopener noreferrer">WorldMonitor Finance ↗</a><a class="button button-outline" href="https://www.worldmonitor.app" target="_blank" rel="noopener noreferrer">Globale Lage ↗</a></div><section class="card news-controls"><div class="news-filters"><label for="news-currency">Währung<select id="news-currency">${[['','Alle Währungen'],...CURRENCIES.map(c=>[c,c]),['Global','Global / ohne Zuordnung']].map(([v,t])=>`<option value="${v}"${filters.currency===v?' selected':''}>${t}</option>`).join('')}</select></label><label for="news-topic">Thema<select id="news-topic">${[['','Alle Themen'],...TOPICS.map(t=>[t,t])].map(([v,t])=>`<option value="${v}"${filters.topic===v?' selected':''}>${t}</option>`).join('')}</select></label><label for="news-days">Zeitraum<select id="news-days">${[['1','24 Stunden'],['7','7 Tage'],['30','Alle verfügbaren Meldungen']].map(([v,t])=>`<option value="${v}"${filters.days===v?' selected':''}>${t}</option>`).join('')}</select></label><label for="news-query">Suche<input id="news-query" type="search" placeholder="z. B. inflation, oil, tariff" value="${esc(filters.query)}"></label></div><p class="text-small">Zuordnung nach Quelle und Schlagworten · keine automatische Handelsrichtung. Aktualisierung etwa alle 30 Minuten, mit möglichen Verzögerungen.</p><div id="news-status" role="status" aria-live="polite"></div><details class="news-source-details"><summary>Quellen & Abruf</summary><div id="news-sources"></div></details></section><div id="news-compose"></div><div id="news-results"></div></section>`;}
function resultsHtml(){
 if(!feed)return `<div class="card card-pad">${loading?'Nachrichten werden geladen …':'Noch keine Nachrichten verfügbar. Bitte Feed neu laden oder die Recherchelinks öffnen.'}</div>`;
 const rows=selectItems(feed.items,filters);
 return `<p class="text-small">${rows.length} Meldungen</p>${rows.length?`<div class="news-list">${rows.map(i=>`<article class="card news-item"><div class="news-item-top"><span>${esc(i.source)}</span><time>${esc(date(i.publishedAt))}</time></div><h2><a href="${esc(i.url)}" target="_blank" rel="noopener noreferrer">${esc(i.title)} ↗</a></h2><div class="news-item-bottom"><div class="news-tags">${[...i.currencies,...i.topics].map(t=>`<span class="pill neutral">${esc(t)}</span>`).join('')||'<span class="pill neutral">Global</span>'}${feed.sources.some(s=>s.id===i.sourceId&&s.status!=='ok')?'<span class="pill warn">Gespeicherter Quellenstand</span>':''}</div><button type="button" class="button button-outline button-small" data-news-attach="${esc(i.id)}">Zur Paaranalyse übernehmen</button></div></article>`).join('')}</div>`:'<div class="card card-pad">Keine Meldungen für diese Auswahl. Erweitere den Zeitraum oder ändere den Filter.</div>'}`;
}
function activeRoot(){const root=document.querySelector('#news-root');return root?.isConnected?root:null;}
function paint(){
 const root=activeRoot();if(!root)return;
 const old=feed&&Date.now()-Date.parse(feed.generatedAt)>2*3600000;
 root.querySelector('#news-results').innerHTML=resultsHtml();
 root.querySelector('#news-status').textContent=(loading?'Lädt … · ':'')+(error?error+' ':'')+(feed?(old?'Älterer Feed-Stand · ':'Letzter Abruf · ')+date(feed.generatedAt):'');
 root.querySelector('#news-refresh').disabled=loading;
 root.querySelector('#news-sources').innerHTML=feed?`<p>RSS-Schlagzeilen und Originalverweise. WorldMonitor wird als separate Recherche geöffnet.</p>${feed.sources.map(s=>`<p><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name)} ↗</a> · ${s.status==='ok'?'abgerufen':'zurzeit nicht erreichbar'} · letzter erfolgreicher Abruf: ${esc(date(s.lastSuccessAt))}</p>`).join('')}`:'Noch kein Quellenstatus verfügbar.';
}
async function fetchJSON(endpoint){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{const res=await fetch(endpoint,{signal:controller.signal,cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});if(!res.ok)throw new Error('HTTP '+res.status);return normalizeFeed(await res.json());}finally{clearTimeout(timer);}
}
async function load(){
 if(loading)return;loading=true;error='';lastAttempt=Date.now();paint();
 try{
  let next;try{next=await fetchJSON(ENDPOINT);}catch{next=await fetchJSON('feeds/news.json');error='Aktueller Abruf nicht erreichbar; verfügbarer Stand wird angezeigt.';}
  if(!feed||Date.parse(next.generatedAt)>=Date.parse(feed.generatedAt))feed=next;
  try{localStorage.setItem(CACHE,JSON.stringify(feed));}catch{}
 }catch{error=feed?'Offline oder Abruf fehlgeschlagen; gespeicherter Stand bleibt sichtbar.':'Abruf fehlgeschlagen. Bitte später erneut laden.';}
 finally{loading=false;paint();}
}
function compose(item){
 const host=document.querySelector('#news-compose');if(!host)return;
 const targets=bridge.targets();
 if(!targets.length){host.innerHTML='<div class="card card-pad" role="status">Lege zuerst eine Morgenanalyse mit Währungspaaren an.</div>';return;}
 host.innerHTML=`<section class="card card-pad news-compose"><h2>Meldung übernehmen</h2><p>${esc(item.title)}</p><div class="form-grid"><label for="news-macro">Morgenanalyse<select id="news-macro">${targets.map(m=>`<option value="${esc(m.id)}">${esc(m.date+' · '+m.title)}</option>`).join('')}</select></label><label for="news-pair">Währungspaar<select id="news-pair"></select></label></div><label for="news-note">Eigene Einordnung (optional)<textarea id="news-note" rows="3" maxlength="3000" placeholder="Warum ist diese Meldung für das Paar relevant?"></textarea></label><div class="inline-actions"><button type="button" class="button button-primary" id="news-save">Übernehmen</button><button type="button" class="button button-outline" id="news-cancel">Abbrechen</button></div><p id="news-save-status" role="status" aria-live="polite"></p></section>`;
 const macro=host.querySelector('#news-macro'),pair=host.querySelector('#news-pair');
 const updatePairs=()=>{const m=targets.find(m=>m.id===macro.value);pair.innerHTML=(m?.pairs||[]).map(p=>`<option value="${esc(p.id)}">${esc(p.pair)}</option>`).join('');const preferred=m?.pairs.find(p=>item.currencies.some(c=>p.pair.includes(c)));if(preferred)pair.value=preferred.id;};
 updatePairs();macro.addEventListener('change',updatePairs);
 host.querySelector('#news-cancel').addEventListener('click',()=>host.replaceChildren());
 host.querySelector('#news-save').addEventListener('click',async()=>{
  const button=host.querySelector('#news-save'),status=host.querySelector('#news-save-status'),mid=macro.value,pid=pair.value,note=host.querySelector('#news-note').value;
  button.disabled=true;status.textContent='Speichert …';
  try{const added=await bridge.save(mid,pid,item,note);if(!host.isConnected)return;status.textContent=added?'In der Paaranalyse gespeichert.':'Diese Meldung ist dort bereits gespeichert.';const open=document.createElement('button');open.type='button';open.className='button button-outline';open.textContent='Paaranalyse öffnen';open.addEventListener('click',()=>bridge.open(mid,pid));status.append(' ',open);}
  catch(e){if(host.isConnected){status.textContent='Speichern fehlgeschlagen: '+e.message;button.disabled=false;}}
 });
 host.scrollIntoView({block:'start',behavior:'smooth'});macro.focus({preventScroll:true});
}
function mount(api){
 bridge=api;const root=activeRoot();if(!root)return;
 root.querySelector('#news-refresh').addEventListener('click',load);
 for(const key of ['currency','topic','days','query'])root.querySelector('#news-'+key).addEventListener(key==='query'?'input':'change',e=>{filters[key]=e.target.value;paint();});
 root.querySelector('#news-results').addEventListener('click',e=>{const b=e.target.closest('[data-news-attach]');if(b){const item=feed?.items.find(i=>i.id===b.dataset.newsAttach);if(item)compose(item);}});
 paint();if(!lastAttempt||Date.now()-lastAttempt>300000)load();
}
window.FXNews={render,mount,pairHtml,attach,normalizeFeed,normalizeItem,selectItems};
})();
