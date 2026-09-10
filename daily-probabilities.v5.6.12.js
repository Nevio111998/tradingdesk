/* v5.6.12 – carry yesterday's absolute Hike/Hold/Cut probabilities per currency. */
'use strict';
(() => {
  let dbPromise=null,timer=null;
  const has=v=>v!==null&&v!==undefined&&String(v).trim()!=='';
  function macroId(){return location.hash.match(/^#\/macro\/([a-zA-Z0-9-]+)/)?.[1]||''}
  function openDb(){
    if(dbPromise)return dbPromise;
    dbPromise=new Promise((resolve,reject)=>{
      const req=indexedDB.open('fx-trade-desk',1);
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error);
    });
    return dbPromise;
  }
  async function getRecord(id){
    const db=await openDb();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction('records','readonly');
      const req=tx.objectStore('records').get(id);
      req.onsuccess=()=>resolve(req.result||null);
      req.onerror=()=>reject(req.error);
    });
  }
  async function seed(){
    const id=macroId();if(!id)return;
    try{
      const current=await getRecord(id);if(!current?.carriedFrom?.id)return;
      const previous=await getRecord(current.carriedFrom.id);if(!previous?.currencies)return;
      for(const code of Object.keys(previous.currencies)){
        const first=document.querySelector(`[data-bind="currencies.${code}.probHikeChange"]`);if(!first)continue;
        const marker=`fxdesk-prob-yesterday-seeded-v5612:${id}:${code}`;if(localStorage.getItem(marker)==='1')continue;
        for(const [target,source] of [['probHikeChange','probHike'],['probHoldChange','probHold'],['probCutChange','probCut']]){
          const value=previous.currencies?.[code]?.[source];if(!has(value))continue;
          const input=document.querySelector(`[data-bind="currencies.${code}.${target}"]`);if(!input)continue;
          input.value=String(value);
          input.dispatchEvent(new Event('input',{bubbles:true}));
        }
        localStorage.setItem(marker,'1');
      }
    }catch(err){console.warn('v5.6.12 yesterday probability carry-forward:',err)}
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(seed,180)}
  const start=()=>{document.getElementById('view')&&new MutationObserver(schedule).observe(document.getElementById('view'),{childList:true,subtree:true});schedule()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.addEventListener('hashchange',schedule);
})();
