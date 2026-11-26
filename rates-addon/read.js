// Runs in an isolated extension world on an individual bank page.
function readBankPage(bank) {
  const title = document.querySelector('h1')?.textContent.trim();
  if (!title || !title.toLowerCase().includes(bank.toLowerCase()) || !document.querySelector('#tbody')) return null;
  const read = id => document.getElementById(id)?.innerText.trim() || '';
  function number(text) {
    const value = text.replace(/[−–]/g, '-').replace(/(?:\s*bps?|%)$/i, '').trim();
    return /^[+-]?\d+(?:\.\d+)?$/.test(value) ? Number(value) : null;
  }
  const stamp = read('asOf');
  const date = stamp.match(/\b(\d{2})\/(\d{2})\/(\d{4})\b/);
  if (!date) return null;
  const day = date[3]+'-'+date[1]+'-'+date[2];
  const rows = [];
  for (const tr of document.querySelectorAll('#tbody tr')) {
    const cell = key => tr.querySelector('[data-col="'+key+'"]')?.innerText.trim() || '';
    const label = cell('meeting');
    const time = Date.parse(label+' UTC');
    const delta = number(cell('delta'));
    if (!Number.isFinite(time) || delta === null) return null;
    rows.push({date:new Date(time).toISOString().slice(0,10), delta, probability:number(cell('prob').replace(/[()]/g,''))});
  }
  const first = rows[0];
  if (!first || first.date < day || rows.some((r,i)=>i && r.date<=rows[i-1].date)) return null;
  const target = new Date(day+'T00:00:00Z');
  const last = new Date(Date.UTC(target.getUTCFullYear(),target.getUTCMonth()+4,0));
  target.setUTCDate(1);
  target.setUTCMonth(target.getUTCMonth()+3);
  target.setUTCDate(Math.min(Number(date[2]),last.getUTCDate()));
  const cutoff = target.toISOString().slice(0,10);
  const prior = rows.filter(r=>r.date<=cutoff).pop();
  const rate = number(read('currentRateValue'));
  const year = number(read('sidebarOutlookBps')) ?? number(read('mobileOutlookBps'));
  const step = number(document.querySelector('#stepSelect')?.value || '');
  if (rate===null || year===null || !(step>0) || first.probability===null || first.probability>100 || first.probability<0 || rows.at(-1).date<cutoff) return null;
  // Above one step, both bracketing outcomes are moves in the same direction.
  const move = Math.abs(first.delta)>=step ? 100 : first.probability;
  const hold = Number((100-move).toFixed(2));
  return {day,stamp,meeting:first.date,rate,next:first.delta,quarter:prior?.delta ?? 0,year,step,
    hike:first.delta>0 ? move : 0,cut:first.delta<0 ? move : 0,hold};
}
