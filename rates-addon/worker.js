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
    tab = await chrome.tabs.create({url:'https://rateprobability.com/'+path,active:false});
    for (let attempt=0;attempt<20;attempt++) {
      await pause(750);
      const page = await chrome.tabs.get(tab.id);
      if (page.status!=='complete') continue;
      if (!page.url || new URL(page.url).pathname.replace(/\/$/,'')!=='/'+path) break;
      const [frame] = await chrome.scripting.executeScript({target:{tabId:tab.id},func:readBankPage,args:[bank]});
      if (frame?.result) {
        const row=frame.result;
        // The comparison chart can finish drawing after the meeting table.
        let curve=[];
        for(let retry=0;retry<4;retry++){
          if(retry)await pause(450);
          const frames=await chrome.scripting.executeScript({target:{tabId:tab.id},world:'MAIN',
            func:readWeeklyCurve,args:[row.stamp]}).catch(()=>[]);
          curve=frames[0]?.result||[];
          if(curve.length)break;
        }
        return {code,...row,curve};
      }
    }
    return {code,error:'Kein vollständiger Datenstand. Zugang und Bankseite prüfen.'};
  } catch {
    return {code,error:'Bankseite konnte nicht gelesen werden.'};
  } finally {
    if (tab) await chrome.tabs.remove(tab.id).catch(()=>{});
  }
}
let reading;
async function readAll() {
  const rows=[];
  for(let i=0;i<banks.length;i+=2) rows.push(...await Promise.all(banks.slice(i,i+2).map(readCurrency)));
  return {rows};
}
chrome.runtime.onMessage.addListener((message,sender,respond)=>{
  if(message.action!=='read' || !sender.url?.startsWith('https://nevio111998.github.io/tradingdesk/')) return;
  reading ??= readAll().finally(()=>{reading=null;});
  reading.then(respond,()=>respond({error:'Abruf fehlgeschlagen.'}));
  return true;
});
