importScripts('read.js');
const banks = [
  ['USD','fed','Federal Reserve'], ['EUR','ecb','European Central Bank'],
  ['GBP','boe','Bank of England'], ['JPY','boj','Bank of Japan'],
  ['CAD','boc','Bank of Canada'], ['AUD','rba','Reserve Bank of Australia'],
  ['NZD','rbnz','Reserve Bank of New Zealand'], ['CHF','snb','Swiss National Bank']
];
const pause = ms => new Promise(resolve=>setTimeout(resolve,ms));
async function readCurrency([code,path,bank]) {
  let tab;
  try {
    tab = await chrome.tabs.create({url:'https://rateprobability.com/'+path,active:true});
    for (let attempt=0;attempt<20;attempt++) {
      await pause(750);
      const page = await chrome.tabs.get(tab.id);
      if (!page.url || page.url==='about:blank') continue;
      if (new URL(page.url).pathname.replace(/\/$/,'')!=='/'+path){
        if(page.status==='complete')return {code,error:'Weitergeleitet. Freischaltung der Bankseite prüfen.'};
        continue;
      }
      const [frame] = await chrome.scripting.executeScript({target:{tabId:tab.id},injectImmediately:true,func:readBankPage,args:[bank]}).catch(()=>[]);
      if (frame?.result) {
        let row=frame.result;
        // The comparison chart can finish drawing after the meeting table.
        let curve=[];
        for(let retry=0;retry<10;retry++){
          if(retry)await pause(450);
          const frames=await chrome.scripting.executeScript({target:{tabId:tab.id},world:'MAIN',
            func:readWeeklyCurve,args:[row.stamp]}).catch(()=>[]);
          curve=frames[0]?.result||[];
          if(curve.length && row.year!==null)break;
          const refreshed=await chrome.scripting.executeScript({target:{tabId:tab.id},injectImmediately:true,func:readBankPage,args:[bank]}).catch(()=>[]);
          if(refreshed[0]?.result){
            const next=refreshed[0].result;
            if(next.stamp!==row.stamp)curve=[];
            row=next;
          }
        }
        return {code,...row,curve};
      }
    }
    return {code,error:'Sitzungstabelle oder Datenstand nach 15 Sekunden nicht lesbar.'};
  } catch {
    return {code,error:'Bankseite konnte nicht gelesen werden.'};
  } finally {
    if (tab) await chrome.tabs.remove(tab.id).catch(()=>{});
  }
}
let reading;
async function readAll() {
  // The bank page draws its chart in requestAnimationFrame. Only one
  // foreground tab at a time can reliably finish that work in Edge.
  const rows=[];
  for(const bank of banks) rows.push(await readCurrency(bank));
  return {rows};
}
chrome.runtime.onMessage.addListener((message,sender,respond)=>{
  if(message.action!=='read' || !sender.url?.startsWith('https://nevio111998.github.io/tradingdesk/')) return;
  reading ??= readAll().finally(()=>{reading=null;});
  reading.then(respond,()=>respond({error:'Abruf fehlgeschlagen.'}));
  return true;
});
