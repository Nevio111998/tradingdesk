/* Tradingdesk v5.6.11 add-on: read-only trade fundamentals snapshot panel. */
'use strict';
(() => {
  const ADDON_VERSION='5.6.11';
  const CORE_VERSION='5.6.10';
  const BANKS={USD:'Federal Reserve',EUR:'Europäische Zentralbank',GBP:'Bank of England',JPY:'Bank of Japan',AUD:'Reserve Bank of Australia',NZD:'Reserve Bank of New Zealand',CAD:'Bank of Canada',CHF:'Schweizerische Nationalbank'};
  let dbPromise=null, timer=null, retryTimer=null;

  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const has=v=>v!==null&&v!==undefined&&String(v).trim()!=='';
  const n=v=>has(v)&&Number.isFinite(Number(v))?Number(v):null;
  const pct=v=>n(v)===null?'–':`${Number(v).toFixed(1).replace(/\.0$/,'')}%`;
  const pp=v=>n(v)===null?'–':`${Number(v)>0?'+':''}${Number(v).toFixed(1).replace(/\.0$/,'')} pp`;
  const dateFmt=v=>{if(!has(v))return '–';const d=new Date(String(v).length===10?String(v)+'T12:00:00':v);return Number.isNaN(d.getTime())?String(v):new Intl.DateTimeFormat('de-CH',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d)};

  function pill(text,tone='neutral'){return `<span class="pill ${tone}">${esc(text)}</span>`}
  function label(v,mode,base,quote){
    if(v===null)return ['Nicht berechnet','neutral'];
    if(Math.abs(v)<0.05)return ['Neutral','neutral'];
    if(mode==='tightening')return v>0?[`Mehr Straffung ${base}`,'good']:[`Mehr Straffung ${quote}`,'bad'];
    if(mode==='level')return v>0?[`Höheres Niveau ${base}`,'good']:[`Höheres Niveau ${quote}`,'bad'];
    return v>0?[`Für ${base}`,'good']:[`Für ${quote}`,'bad'];
  }
  function diff(a,b,mult=1){const x=n(a),y=n(b);return x===null||y===null?null:(x-y)*mult}
  function methodGroup(x){x=String(x||'').toLowerCase();if(!x)return '';if(x.includes('meeting'))return 'meeting';if(x.includes('ois'))return 'ois';if(x.includes('future'))return 'futures';if(x.includes('broker'))return 'broker';if(x.includes('analyst'))return 'analyst';if(x.includes('edgefinder'))return 'edgefinder';return x.trim()}
  function sameHorizon(a,b){return String(a?.pricingChangeHorizon??'12M').trim().toLowerCase()===String(b?.pricingChangeHorizon??'12M').trim().toLowerCase()}

  function openDb(){
    if(dbPromise)return dbPromise;
    dbPromise=new Promise((resolve,reject)=>{
      if(!('indexedDB' in window)){reject(new Error('IndexedDB nicht verfügbar'));return}
      const req=indexedDB.open('fx-trade-desk',1);
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error||new Error('Datenbank konnte nicht geöffnet werden'));
      req.onblocked=()=>reject(new Error('Datenbank ist blockiert'));
    });
    return dbPromise;
  }
  async function getTrade(id){
    const db=await openDb();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction('records','readonly');
      const req=tx.objectStore('records').get(id);
      req.onsuccess=()=>resolve(req.result||null);
      req.onerror=()=>reject(req.error);
    });
  }
  function tradeId(){const m=location.hash.match(/^#\/trade\/([a-zA-Z0-9-]+)/);return m?.[1]||''}

  function probCell(name,current,change){return `<div class="trade-prob-cell"><span>${esc(name)}</span><strong>${esc(pct(current))}</strong><small>Δ Vorwoche ${esc(pp(change))}</small></div>`}
  function bankCard(code,d){
    const tone=has(d?.tone)?d.tone:'Nicht erfasst';
    const toneTone=/hawk/i.test(tone)?'good':/dov/i.test(tone)?'bad':'neutral';
    return `<section class="trade-cb-card">
      <div class="trade-cb-head"><div><span class="trade-cb-code">${esc(code)}</span><strong>${esc(BANKS[code]||code)}</strong></div>${pill(tone,toneTone)}</div>
      <div class="trade-cb-facts">
        <div><span>Aktueller Leitzins</span><strong>${n(d?.bankRate)===null?'–':esc(String(d.bankRate))+' %'}</strong></div>
        <div><span>Letzte Entscheidung</span><strong>${esc(dateFmt(d?.bankDate))}</strong></div>
        <div><span>Nächste Sitzung</span><strong>${esc(dateFmt(d?.nextMeetingDate))}</strong></div>
        <div><span>Erwartete Änderung</span><strong>${n(d?.pricingNext)===null?'–':`${Number(d.pricingNext)>0?'+':''}${Number(d.pricingNext).toFixed(1).replace(/\.0$/,'')} bp`}</strong></div>
      </div>
      <div class="trade-prob-grid">${probCell('Hike',d?.probHike,d?.probHikeChange)}${probCell('Hold',d?.probHold,d?.probHoldChange)}${probCell('Cut',d?.probCut,d?.probCutChange)}</div>
    </section>`;
  }

  function metrics(trade,snap,base,quote,a,b){
    const currentSpread=diff(a?.yield2,b?.yield2,100);
    const spread1=diff(a?.yield2Prev,b?.yield2Prev,100);
    const spread2=diff(a?.yield2Prev2,b?.yield2Prev2,100);
    const spreadDelta1=currentSpread!==null&&spread1!==null?currentSpread-spread1:null;
    const spreadDelta2=currentSpread!==null&&spread2!==null?currentSpread-spread2:null;
    const diff3=diff(a?.pricing3m,b?.pricing3m,1);
    const diff12=diff(a?.pricing12m,b?.pricing12m,1);
    const realDiff=diff(a?.real,b?.real,100);
    const policySpread=diff(a?.bankRate,b?.bankRate,100);
    const exp3=policySpread!==null&&diff3!==null?policySpread+diff3:null;
    const exp12=policySpread!==null&&diff12!==null?policySpread+diff12:null;
    const pair=(snap?.pairs||[]).find(p=>String(p?.pair||'').toUpperCase().replace('/','')===base+quote)||null;
    let repricing=null, repricingNote='', repricingIndicative=false;
    if(sameHorizon(a,b) && n(a?.pricingChange)!==null && n(b?.pricingChange)!==null){
      repricing=Number(a.pricingChange)-Number(b.pricingChange);
      const am=methodGroup(a?.pricingChangeMethod||a?.pricingMethod),bm=methodGroup(b?.pricingChangeMethod||b?.pricingMethod);
      repricingIndicative=!!(am&&bm&&am!==bm);
      repricingNote=`${base} Wochenänderung − ${quote} Wochenänderung (${String(a?.pricingChangeHorizon||'12M')})`;
    } else if(n(pair?.repriceOverrideValue)!==null && has(pair?.repriceOverrideReason)){
      repricing=Number(pair.repriceOverrideValue);repricingIndicative=true;repricingNote='Manueller Override aus der Paaranalyse: '+pair.repriceOverrideReason;
    } else repricingNote='Horizont oder Daten für den automatischen Vergleich fehlen bzw. sind nicht vergleichbar.';
    return {currentSpread,spreadDelta1,spreadDelta2,diff3,diff12,realDiff,policySpread,exp3,exp12,repricing,repricingNote,repricingIndicative};
  }

  function matrixCard(group,title,value,mode,base,quote,suffix='bp',extra=''){
    const [lab,tone]=label(value,mode,base,quote);
    const val=value===null?'Nicht berechnet':`${value>0?'+':''}${value.toFixed(1)} ${suffix}${extra}`;
    return `<div class="matrix-item"><small>${esc(group)}</small><strong>${esc(title)}</strong><span>${esc(val)}</span>${pill(lab,tone)}</div>`;
  }
  function detailRow(title,value,note,mode,base,quote,extra=''){
    const [lab,tone]=label(value,mode,base,quote);
    return `<div class="mini-row"><span>${esc(title)}<small>${esc(note)}</small></span><strong>${value===null?'Nicht berechnet':esc(`${value>0?'+':''}${value.toFixed(1)} bp${extra}`)} ${pill(lab,tone)}</strong></div>`;
  }
  function qualityWarnings(a,b,m){
    const out=[];
    if(!sameHorizon(a,b))out.push(`Relatives Repricing: unterschiedliche Horizonte (${a?.pricingChangeHorizon||'offen'} vs. ${b?.pricingChangeHorizon||'offen'}).`);
    for(const [labelName,av,bv] of [['3M Pricing',a?.pricing3m,b?.pricing3m],['12M Pricing',a?.pricing12m,b?.pricing12m],['2Y aktuell',a?.yield2,b?.yield2],['2Y vor 1 Woche',a?.yield2Prev,b?.yield2Prev],['2Y vor 2 Wochen',a?.yield2Prev2,b?.yield2Prev2],['Real Yield',a?.real,b?.real]]){
      const missing=[];if(n(av)===null)missing.push('Base');if(n(bv)===null)missing.push('Quote');if(missing.length)out.push(`${labelName}: Daten für ${missing.join(' und ')} fehlen.`);
    }
    const am=methodGroup(a?.pricingChangeMethod||a?.pricingMethod),bm=methodGroup(b?.pricingChangeMethod||b?.pricingMethod);
    if(am&&bm&&am!==bm)out.push(`Relatives Repricing: unterschiedliche Methoden (${am} vs. ${bm}); Vergleich indikativ.`);
    if(m?.repricingIndicative)out.push('Relatives Repricing wird indikativ dargestellt.');
    return [...new Set(out)];
  }

  function addonHtml(t){
    const snap=t?.macroSnapshot;
    const pair=String(t?.pair||'').toUpperCase().replace('/',''),base=pair.slice(0,3),quote=pair.slice(3,6);
    if(!snap?.currencies || pair.length!==6 || !snap.currencies[base] || !snap.currencies[quote])return `<div id="trade-fundamentals-v5611" class="trade-fundamental-addon"><div class="divider"></div><h3>Rates & Zentralbanken</h3><div class="alert warn"><strong>Kein passender Makro-Snapshot verfügbar.</strong><p>Verknüpfe eine Morgenanalyse mit diesem Trade. Danach erscheinen hier Rates-Matrix, Zentralbank-Ton und Sitzungswahrscheinlichkeiten für Base und Quote.</p></div></div>`;
    const a=snap.currencies[base]||{},b=snap.currencies[quote]||{},m=metrics(t,snap,base,quote,a,b),warnings=qualityWarnings(a,b,m),repricingExtra=m.repricingIndicative?' · indikativ':'';
    return `<div id="trade-fundamentals-v5611" class="trade-fundamental-addon">
      <div class="divider"></div>
      <div class="trade-addon-heading"><div><h3>Rates-Bestätigungsmatrix</h3><p>Read-only aus dem eingefrorenen Makro-Snapshot · ${esc(base)} vs. ${esc(quote)} · Datenstand ${esc(dateFmt(snap.date))}</p></div>${pill('Snapshot','blue')}</div>
      <div class="matrix-grid trade-rates-matrix">
        ${matrixCard('Zinsmomentum','Relatives Repricing',m.repricing,'support',base,quote,'bp',repricingExtra)}
        ${matrixCard('Zinsmomentum','2Y Δ 1W',m.spreadDelta1,'support',base,quote)}
        ${matrixCard('Zinsmomentum','2Y Δ 2W',m.spreadDelta2,'support',base,quote)}
        ${matrixCard('Zinsniveau','3M Pricing',m.diff3,'tightening',base,quote)}
        ${matrixCard('Zinsniveau','12M Pricing',m.diff12,'tightening',base,quote)}
        ${matrixCard('Zinsniveau','Real Yield absolut',m.realDiff,'level',base,quote)}
      </div>
      <details class="trade-addon-details"><summary>Datenqualität${warnings.length?' · '+warnings.length+' Hinweise':' · keine offensichtlichen Lücken'}</summary><div class="trade-addon-detail-body">${warnings.length?`<ul>${warnings.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p>Für die dargestellten Kernwerte sind in diesem Snapshot keine offensichtlichen Datenlücken erkannt.</p>'}<p>${esc(m.repricingNote)}</p></div></details>
      <details class="trade-addon-details"><summary>Weitere Rates-Details</summary><div class="trade-addon-detail-body"><div class="mini-table">
        ${detailRow('3M-Pricing-Differential',m.diff3,'Base Pricing − Quote Pricing über 3M','tightening',base,quote)}
        ${detailRow('12M-Pricing-Differential',m.diff12,'Base Pricing − Quote Pricing über 12M','tightening',base,quote)}
        ${detailRow('Relatives Repricing ggü. Vorwoche',m.repricing,m.repricingNote,'support',base,quote,m.repricingIndicative?' · indikativ':'')}
        ${detailRow('Erwartetes Leitzins-Differential 3M',m.exp3,'Aktueller Leitzins-Spread + 3M Pricing-Differential','level',base,quote)}
        ${detailRow('Erwartetes Leitzins-Differential 12M',m.exp12,'Aktueller Leitzins-Spread + 12M Pricing-Differential','level',base,quote)}
        ${detailRow('2Y-Differential jetzt',m.currentSpread,'Base 2Y − Quote 2Y','level',base,quote)}
        ${detailRow('2Y-Repricing vs. 1W',m.spreadDelta1,'Spread-Veränderung seit vor 1 Woche','support',base,quote)}
        ${detailRow('2Y-Repricing vs. 2W',m.spreadDelta2,'Spread-Veränderung seit vor 2 Wochen','support',base,quote)}
        ${detailRow('Real-Yield-Differential',m.realDiff,'EdgeFinder Real Yield Base − Quote','level',base,quote)}
      </div></div></details>
      <div class="trade-addon-heading trade-cb-title"><div><h3>Zentralbanken & Sitzungswahrscheinlichkeiten</h3><p>Aktueller Ton, Sitzung und Hike/Hold/Cut-Pricing beider Währungen aus demselben Snapshot.</p></div></div>
      <div class="trade-cb-grid">${bankCard(base,a)}${bankCard(quote,b)}</div>
    </div>`;
  }

  function signature(t){
    const snap=t?.macroSnapshot,pair=String(t?.pair||'').toUpperCase().replace('/',''),base=pair.slice(0,3),quote=pair.slice(3,6),a=snap?.currencies?.[base]||{},b=snap?.currencies?.[quote]||{},p=(snap?.pairs||[]).find(x=>String(x?.pair||'').toUpperCase().replace('/','')===pair)||{};
    return JSON.stringify([pair,snap?.date,a.bankRate,a.bankDate,a.nextMeetingDate,a.tone,a.pricingNext,a.probHike,a.probHold,a.probCut,a.probHikeChange,a.probHoldChange,a.probCutChange,a.pricing3m,a.pricing12m,a.pricingChange,a.pricingChangeHorizon,a.pricingChangeMethod,a.pricingMethod,a.yield2,a.yield2Prev,a.yield2Prev2,a.real,b.bankRate,b.bankDate,b.nextMeetingDate,b.tone,b.pricingNext,b.probHike,b.probHold,b.probCut,b.probHikeChange,b.probHoldChange,b.probCutChange,b.pricing3m,b.pricing12m,b.pricingChange,b.pricingChangeHorizon,b.pricingChangeMethod,b.pricingMethod,b.yield2,b.yield2Prev,b.yield2Prev2,b.real,p.repriceOverrideValue,p.repriceOverrideReason]);
  }

  async function renderAddon(){
    clearTimeout(retryTimer);const id=tradeId();if(!id)return;
    const target=[...document.querySelectorAll('.card-pad')].find(el=>el.querySelector(':scope > .card-header h2')?.textContent.trim()==='Fundamentale Einschätzung');if(!target)return;
    try{
      const t=await getTrade(id);if(!t){retryTimer=setTimeout(renderAddon,700);return}
      const sig=signature(t),existing=document.getElementById('trade-fundamentals-v5611');if(existing?.dataset.signature===sig)return;
      const holder=document.createElement('div');holder.innerHTML=addonHtml(t).trim();const node=holder.firstElementChild;node.dataset.signature=sig;if(existing)existing.replaceWith(node);else target.appendChild(node);
    }catch(err){console.warn('v5.6.11 fundamentals add-on:',err)}
  }
  function fixVersionLabels(){
    const badge=document.querySelector('.version-badge');if(badge)badge.textContent='v'+ADDON_VERSION;
    const loaded=document.getElementById('loaded-version');if(loaded)loaded.textContent='Code geladen · v'+ADDON_VERSION;
    document.title=document.title.replace(/v5\.6\.10/g,'v'+ADDON_VERSION);
    for(const h of document.querySelectorAll('.card-header h2'))if(h.textContent.includes('Version '+CORE_VERSION+' · Hinweise'))h.textContent=h.textContent.replace('Version '+CORE_VERSION,'Version '+ADDON_VERSION);
    window.FX_COMPANION_VERSION=ADDON_VERSION;
  }
  function schedule(delay=140){clearTimeout(timer);timer=setTimeout(()=>{fixVersionLabels();renderAddon()},delay)}
  const observer=new MutationObserver(()=>schedule());
  const start=()=>{const view=document.getElementById('view');if(view)observer.observe(view,{childList:true,subtree:true});fixVersionLabels();schedule(250)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.addEventListener('hashchange',()=>schedule(250));
  document.addEventListener('input',()=>schedule(850),true);
  document.addEventListener('change',()=>schedule(850),true);
})();