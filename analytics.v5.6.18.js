/* Read-only journal analytics; no market feed and no inferred historical ratings. */
'use strict';
(function(root){
 const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const number=x=>typeof x==='number'?Number.isFinite(x)?x:null:typeof x==='string'&&x.trim()!==''&&Number.isFinite(Number(x))?Number(x):null;
 const pair=x=>String(x||'').toUpperCase().replace(/[^A-Z]/g,'');
 const factor=(t,k)=>t.factors?.[k]??(k==='edgefinder'?t.factors?.edge:undefined)??'Unbewertet';
 const validDate=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(x)&&Number.isFinite(Date.parse(x))&&new Date(x.slice(0,10)+'T12:00:00Z').toISOString().slice(0,10)===x.slice(0,10);
 function day(x){if(!validDate(x))return '';if(/(?:Z|[+-]\d\d:\d\d)$/.test(x)){const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(x));return ['year','month','day'].map(k=>p.find(v=>v.type===k).value).join('-')}return x.slice(0,10)}
 const NO_DATA='Keine Daten';
 const CURRENCIES=['USD','EUR','GBP','JPY','AUD','NZD','CAD','CHF'];
 const FACTORS={edgefinder:'EdgeFinder',rates:'Rates',narrative:'Market Driver',risk:'Risk'};
 const RATINGS=['Bestätigt','Neutral','Widerspricht'];
 const BIASES=['Strong Bullish','Bullish','Neutral','Bearish','Strong Bearish'];
 const FILTER_KEYS=['pair','direction','from','to','confidence','longCurrency','shortCurrency',...Object.keys(FACTORS)];
 const emptyFilters=()=>Object.fromEntries(FILTER_KEYS.map(k=>[k,'']));
 const text=x=>typeof x==='string'&&x.trim()?x.trim():null;
 // Only fields already held by the trade are frozen. No reads from a live analysis.
 function fundamentals(t){
  const f=t.fields||{},base2y=number(f.yieldBase),quote2y=number(f.yieldQuote);
  const edgeBaseScore=number(f.edgeScoreBase),edgeQuoteScore=number(f.edgeScoreQuote);
  return {
   edgeBaseBias:BIASES.includes(f.edgeBase)?f.edgeBase:null,edgeQuoteBias:BIASES.includes(f.edgeQuote)?f.edgeQuote:null,edgeBaseScore,edgeQuoteScore,
   edgeScoreDifference:edgeBaseScore!==null&&edgeQuoteScore!==null?edgeBaseScore-edgeQuoteScore:null,
   base2y,quote2y,spread2yBp:base2y!==null&&quote2y!==null?(base2y-quote2y)*100:null,
   previousSpread2yBp:number(f.yieldPrev),previousSpread2y2wBp:number(f.yieldPrev2),
   marketDriver:text(f.driverMain),riskRegime:text(f.riskRegime)
  };
 }
 function exposure(t){
  const symbol=pair(t.pair),base=symbol.slice(0,3),quote=symbol.slice(3);
  if(symbol.length!==6||!CURRENCIES.includes(base)||!CURRENCIES.includes(quote)||base===quote||!['Long','Short'].includes(t.direction))return {longCurrency:NO_DATA,shortCurrency:NO_DATA};
  return t.direction==='Long'?{longCurrency:base,shortCurrency:quote}:{longCurrency:quote,shortCurrency:base};
 }
 function confidence(t){const v=entry(t)?.confidence;return ['High','Medium','Low'].includes(v)?v:NO_DATA}
 function rating(t,k){const v=entry(t)?.factors?.[k];return RATINGS.includes(v)?v:NO_DATA}
 function detail(t,k){return entry(t)?.fundamentals?.[k]??null}
 function combination(t,keys){return keys.map(k=>FACTORS[k]+': '+rating(t,k)).join(' · ')}
 function signGroup(value){return value===null?NO_DATA:value>0?'Positiv':value<0?'Negativ':'Null'}
 function directional(t,value){return value===null||!['Long','Short'].includes(t.direction)?null:value*(t.direction==='Long'?1:-1)}
 function fieldBias(t,key){const v=detail(t,key);return BIASES.includes(v)?v:NO_DATA}
 // Use one Zurich wall-clock ordering for both offset timestamps and local inputs.
 function orderKey(t){
  const x=t.closedAt;if(!validDate(x))return '';
  if(/(?:Z|[+-]\d\d:\d\d)$/.test(x)){
   const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(x));
   const value=k=>parts.find(p=>p.type===k).value;
   return ['year','month','day'].map(value).join('-')+'T'+['hour','minute','second'].map(value).join(':');
  }
  return x.length===10?x+'T00:00:00':x.length===16?x+':00':x;
 }
 function capture(t,previous,next,at){
  if(t.kind!=='trade'||previous===next)return;
  // Existing open/closed records cannot acquire a retrospective entry snapshot.
  if(next==='Offen'&&!['Offen','Geschlossen'].includes(previous)&&!t.analyticsEntry&&!t.closedAt&&number(t.realizedR)===null){
   t.analyticsEntry={version:1,capturedAt:at,pair:pair(t.pair),direction:t.direction,confidence:t.fields?.confidence||'Unbewertet',factors:Object.fromEntries(['edgefinder','rates','narrative','risk'].map(k=>[k,factor(t,k)])),detailsVersion:1,fundamentals:fundamentals(t)};
  }
  if(next==='Verworfen'&&!t.analyticsRejectedAt)t.analyticsRejectedAt=at;
 }
 function entry(t){const s=t.analyticsEntry;return s?.version===1&&validDate(s.capturedAt)&&pair(s.pair)===pair(t.pair)&&s.direction===t.direction?s:null}
 function group(t){const s=entry(t);if(!s)return 'Keine Daten (ohne passenden Bewertungsstand)';const e=s.factors?.edgefinder,r=s.factors?.rates;if(e==='Bestätigt'&&r==='Bestätigt')return 'EdgeFinder + Rates bestätigen';if(e==='Bestätigt'&&r==='Widerspricht')return 'EdgeFinder bestätigt, Rates widersprechen';if(e==='Widerspricht')return 'EdgeFinder widerspricht';if(e==='Unbewertet'||r==='Unbewertet'||!e||!r||e==='Nicht verfügbar'||r==='Nicht verfügbar')return 'Keine Daten (Bewertung unvollständig)';return 'Neutral / andere Kombination'}
 function stats(rows){const values=rows.map(t=>number(t.realizedR)).filter(x=>x!==null);const wins=values.filter(x=>x>0),losses=values.filter(x=>x<0);const sum=values.reduce((a,b)=>a+b,0),gain=wins.reduce((a,b)=>a+b,0),loss=-losses.reduce((a,b)=>a+b,0);return {n:values.length,missing:rows.length-values.length,wins:wins.length,losses:losses.length,flat:values.filter(x=>x===0).length,sum,avg:values.length?sum/values.length:null,winRate:values.length?wins.length/values.length*100:null,pf:loss?gain/loss:null,gain,loss,avgWin:wins.length?gain/wins.length:null,avgLoss:losses.length?-loss/losses.length:null,expectancy:values.length?sum/values.length:null}}
 function series(rows){const sorted=rows.filter(t=>number(t.realizedR)!==null&&validDate(t.closedAt)).slice().sort((a,b)=>orderKey(a).localeCompare(orderKey(b))||String(a.id).localeCompare(String(b.id)));let total=0,peak=0,drawdown=0;const points=sorted.map(t=>{total+=number(t.realizedR);peak=Math.max(peak,total);drawdown=Math.max(drawdown,peak-total);return {id:t.id,date:day(t.closedAt),r:number(t.realizedR),total,drawdown:total-peak}});return {points,drawdown:points.length?drawdown:null}}
 function select(records,f={}){
  const invalidRange=!!(f.from&&f.to&&f.from>f.to);
  const matches=t=>(!f.pair||pair(t.pair)===f.pair)&&(!f.direction||t.direction===f.direction)&&(!f.confidence||confidence(t)===f.confidence)&&(!f.longCurrency||exposure(t).longCurrency===f.longCurrency)&&(!f.shortCurrency||exposure(t).shortCurrency===f.shortCurrency)&&Object.keys(FACTORS).every(k=>!f[k]||rating(t,k)===f[k]);
  const trades=records.filter(t=>t.kind==='trade'&&matches(t));
  const allClosed=trades.filter(t=>t.status==='Geschlossen');
  const closed=invalidRange?[]:allClosed.filter(t=>{const d=day(t.closedAt);return (!f.from||d&&d>=f.from)&&(!f.to||d&&d<=f.to)});
  const rejected=trades.filter(t=>t.status==='Verworfen');
  return {closed,rejected,open:trades.filter(t=>t.status==='Offen').length,undated:allClosed.filter(t=>!day(t.closedAt)).length,invalidRange};
 }
 const fmt=(x,n=2)=>x===null?NO_DATA:new Intl.NumberFormat('de-CH',{maximumFractionDigits:n,minimumFractionDigits:n}).format(x);
 const r=x=>x===null?NO_DATA:`${x>0?'+':''}${fmt(x)} R`;
 const card=(title,value,sub)=>`<div class="card stat-card"><div class="stat-label">${escape(title)}</div><div class="stat-value">${escape(value)}</div><div class="stat-foot">${escape(sub)}</div></div>`;
 const option=(v,l,current)=>`<option value="${escape(v)}"${v===current?' selected':''}>${escape(l)}</option>`;
 function chart(s,mode='total'){if(!s.points.length)return '<p class="text-small">Für den Verlauf fehlen abgeschlossene Trades mit Ergebnis und Schlussdatum.</p>';const values=[0,...s.points.map(p=>p[mode])],min=Math.min(0,...values),max=Math.max(0,...values),span=max-min||1;const y=v=>170-(v-min)/span*140;const points=values.map((v,i)=>`${50+i/(values.length-1)*680},${y(v)}`).join(' ');return `<svg class="analytics-chart" viewBox="0 0 780 205" role="img" aria-label="${mode==='drawdown'?'Drawdown der R-Summe':'Kumuliertes realisiertes R'}, ${s.points.length} Trades; Endstand ${escape(r(values.at(-1)))}"><line x1="50" y1="${y(0)}" x2="730" y2="${y(0)}" class="analytics-zero"/><text x="4" y="${y(max)+4}">${fmt(max,1)} R</text>${min!==max?`<text x="4" y="${y(min)+4}">${fmt(min,1)} R</text>`:''}<polyline points="${points}" fill="none" class="analytics-line ${mode==='drawdown'?'analytics-dd':''}"/><text x="50" y="199">Start</text><text x="730" y="199" text-anchor="end">${s.points.length} Abschlüsse</text></svg>`}
 function table(rows,caption,head){return `<div class="analytics-table-wrap"><table class="analytics-table"><caption>${escape(caption)}</caption><thead><tr>${head.map(h=>`<th scope="col">${escape(h)}</th>`).join('')}</tr></thead><tbody>${rows.join('')||`<tr><td colspan="${head.length}">Noch keine passenden Einträge.</td></tr>`}</tbody></table></div>`}
 function grouped(rows,key,order=[]){
  const groups=new Map(order.map(k=>[k,[]]));
  for(const t of rows){const k=key(t);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(t)}
  return [...groups].sort(([a],[b])=>order.length?(order.includes(a)?order.indexOf(a):order.length)-(order.includes(b)?order.indexOf(b):order.length)||a.localeCompare(b):a.localeCompare(b));
 }
 function breakdown(rows,key,caption,order=[]){return table(grouped(rows,key,order).map(([label,list])=>{
  const s=stats(list),sample=s.n===0?'Keine Ergebnisse':s.n<5?'Sehr kleine Gruppe':s.n<20?'Kleine Gruppe':'';
  return `<tr><th scope="row">${escape(label)}</th><td>${list.length}</td><td>${s.n}<small class="analytics-sample">${sample}${s.missing?' · '+s.missing+' ohne R':''}</small></td><td>${s.n?fmt(s.winRate,1)+' %':NO_DATA}</td><td>${r(s.avg)}</td><td>${s.n?r(s.sum):NO_DATA}</td><td>${fmt(s.pf)}</td><td>${r(s.expectancy)}</td></tr>`;
 }),caption,['Gruppe','Trades','Mit R / Sample','Win Rate','Ø R','Gesamt-R','Profit Factor','Expectancy'])}
 function filterSelect(key,label,values,f){return `<div class="field"><label for="analytics-${key}">${escape(label)}</label><select id="analytics-${key}" data-analytics-filter="${key}">${option('','Alle',f[key]||'')}${values.map(v=>option(v,v,f[key])).join('')}</select></div>`}
 function fold(title,body){return `<details class="analytics-fold"><summary>${escape(title)}</summary>${body}</details>`}
 function historicalTable(rows){
  const show=(v,unit='')=>v===null||v===undefined||v===''?NO_DATA:escape(typeof v==='number'?fmt(v):v)+unit;
  return table(rows.map(t=>{
   const values=[['EdgeFinder Rating',rating(t,'edgefinder')],['Base Bias',detail(t,'edgeBaseBias')],['Quote Bias',detail(t,'edgeQuoteBias')],['Base Score',detail(t,'edgeBaseScore')],['Quote Score',detail(t,'edgeQuoteScore')],['Score Base − Quote',detail(t,'edgeScoreDifference')],['Base 2Y',detail(t,'base2y'),' %'],['Quote 2Y',detail(t,'quote2y'),' %'],['2Y Spread',detail(t,'spread2yBp'),' bp'],['Spread vor 1W',detail(t,'previousSpread2yBp'),' bp'],['Spread vor 2W',detail(t,'previousSpread2y2wBp'),' bp'],['Market Driver Rating',rating(t,'narrative')],['Market Driver',detail(t,'marketDriver')],['Risk Rating',rating(t,'risk')],['Risk-Regime',detail(t,'riskRegime')]];
   return `<tr><td><button class="button button-ghost button-small" data-open="${escape(t.id)}">${escape(t.pair||t.title||'Trade')}</button></td><td>${escape(entry(t)?.capturedAt||NO_DATA)}</td><td>${escape(confidence(t))}</td><td>${escape(rating(t,'rates'))}</td><td><details><summary>Werte ansehen</summary><dl class="analytics-entry-values">${values.map(([label,value,unit])=>`<dt>${escape(label)}</dt><dd>${show(value,unit)}</dd>`).join('')}</dl></details></td></tr>`;
  }),'Eingefrorene Werte aus Trade-Feldern; keine Ergänzung aus späteren Änderungen',['Trade','Erfasst am','Confidence','Rates','Historische Werte']);
 }
 function render(records,f={}){
  const a=select(records,f),s=stats(a.closed),curve=series(a.closed),frozen=a.closed.filter(t=>entry(t)),unknown=a.closed.length-frozen.length;
  const pairs=[...new Set(records.filter(t=>t.kind==='trade').map(t=>pair(t.pair)).filter(Boolean))].sort();
  const filters=`<div class="card card-pad analytics-filters"><div class="field"><label for="analytics-pair">Währungspaar</label><select id="analytics-pair" data-analytics-filter="pair">${option('','Alle Paare',f.pair||'')}${pairs.map(p=>option(p,p,f.pair)).join('')}</select></div><div class="field"><label for="analytics-direction">Richtung</label><select id="analytics-direction" data-analytics-filter="direction">${option('','Long + Short',f.direction||'')}${['Long','Short'].map(p=>option(p,p,f.direction)).join('')}</select></div><div class="field"><label for="analytics-from">Abschluss von</label><input type="date" id="analytics-from" data-analytics-filter="from" value="${escape(f.from||'')}"></div><div class="field"><label for="analytics-to">Abschluss bis</label><input type="date" id="analytics-to" data-analytics-filter="to" value="${escape(f.to||'')}"></div>${filterSelect('confidence','Confidence',['High','Medium','Low',NO_DATA],f)}${filterSelect('longCurrency','Long Currency',[...CURRENCIES,NO_DATA],f)}${filterSelect('shortCurrency','Short Currency',[...CURRENCIES,NO_DATA],f)}${Object.entries(FACTORS).map(([k,label])=>filterSelect(k,label+' Rating',[...RATINGS,NO_DATA],f)).join('')}<button class="button button-outline" data-analytics-reset>Zurücksetzen</button></div>`;
  const tradeRows=a.closed.slice().sort((a,b)=>String(b.closedAt||'').localeCompare(String(a.closedAt||''))).map(t=>`<tr><td><button class="button button-ghost button-small" data-open="${escape(t.id)}">${escape(t.pair||t.title||'Trade')}</button></td><td>${escape(t.direction)}</td><td>${escape(day(t.closedAt)||NO_DATA)}</td><td>${r(number(t.realizedR))}</td><td>${escape(group(t))}</td></tr>`);
  const rejectRows=a.rejected.map(t=>`<tr><td><button class="button button-ghost button-small" data-open="${escape(t.id)}">${escape(t.pair||t.title||'Idee')}</button></td><td>${escape(t.direction)}</td><td>${escape(t.fields?.rejectionReason||'Noch kein Ablehnungsgrund erfasst')}</td><td>${escape(t.notes||'–')}</td></tr>`);
  return `<div class="analytics"><div class="page-head"><div><div class="eyebrow">JOURNAL REVIEW</div><h1>Auswertung</h1><span class="pill neutral">Edge Analytics</span><p>Was haben deine Trades geliefert – und wie unterscheiden sich deine fundamentalen Bewertungen?</p></div></div>${filters}${a.invalidRange?'<div class="alert warn" role="alert">Das Startdatum liegt nach dem Enddatum. Bitte korrigieren.</div>':''}<div class="stats-grid">${card('Geschlossene Trades',s.n+' mit R',s.missing+' ohne Ergebnis · '+a.closed.length+' insgesamt')}${card('Gesamtergebnis',s.n?r(s.sum):NO_DATA,'Summe realisierter R')}${card('Ø R / Expectancy pro Trade',r(s.expectancy),'Historischer Mittelwert inklusive Break-even')}${card('Ø Gewinner',r(s.avgWin),s.wins+' Gewinn-Trades')}${card('Ø Verlierer',r(s.avgLoss),s.losses+' Verlust-Trades')}${card('Trefferquote',s.n?fmt(s.winRate,1)+' %':NO_DATA,`${s.wins} Gewinne · ${s.losses} Verluste · ${s.flat} Break-even`)}${card('Profitfaktor (R)',fmt(s.pf),s.loss?'Gewinn-R ÷ Verlust-R':'Ohne Verlust-R nicht berechenbar')}${card('Max. Rückgang der R-Summe',r(curve.drawdown),curve.points.length+' datierte Ergebnisse · kein Konto-DD')}</div><section class="card card-pad"><h2>Ergebnisverlauf</h2><p class="text-small">Kumulierte R nach Abschlussdatum. Offene und verworfene Ideen zählen nicht als Ergebnis. ${a.undated} geschlossene Trades ohne gültiges Schlussdatum: ohne Datumsfilter in Kennzahlen enthalten, im Verlauf und bei Datumsfilter ausgeschlossen.</p><div class="analytics-charts"><div><h3>Kumuliertes R</h3>${chart(curve)}</div><div><h3>Drawdown in R</h3>${chart(curve,'drawdown')}</div></div><p class="text-small">Drawdown = R-Summe minus bisheriger Höchststand, ausgehend von 0 innerhalb der gefilterten Auswahl. Das ist kein Konto-Drawdown; die Kurven zeigen keine offenen Buchgewinne/-verluste.</p></section><section class="card card-pad"><h2>Confidence: High, Medium oder Low?</h2><p class="text-small">Nur Confidence aus dem gespeicherten Entry-Stand. Alte Snapshots werden genutzt, soweit vorhanden; fehlende Werte bleiben „Keine Daten“.</p>${breakdown(a.closed,confidence,'Confidence beim Öffnen',['High','Medium','Low',NO_DATA])}</section>
<section class="card card-pad"><h2>Welche Währungen funktionieren?</h2><p class="text-small">Exposure aus Paar und Richtung: AUDNZD Long = Long AUD / Short NZD. Jeder Trade erscheint einmal in jeder der beiden Tabellen. Die Ergebnisse dürfen nicht über beide Tabellen addiert werden; sie isolieren keinen kausalen Währungseffekt.</p>${breakdown(a.closed,t=>exposure(t).longCurrency,'Long Currency')}${breakdown(a.closed,t=>exposure(t).shortCurrency,'Short Currency')}</section>
<section class="card card-pad"><h2>EdgeFinder und Rates im Vergleich</h2><p>Bewertungen werden beim ersten Markieren als „Offen“ festgehalten. Spätere Änderungen der Einschätzung verändern diesen Stand nicht.</p><p class="text-small">${frozen.length} mit passendem Bewertungsstand · ${unknown} ohne. Alte Trades erscheinen separat. Bei geändertem Paar oder geänderter Richtung wird der alte Stand nicht zugeordnet. Kleine Gruppen erlauben keine belastbare Schlussfolgerung; auch grössere Gruppen belegen keinen kausalen Filtervorteil.</p>${breakdown(a.closed,group,'Vergleich anhand festgehaltener Bewertungen')}<p class="text-small">Trefferquote = Trades mit R &gt; 0 ÷ alle Trades mit R, inklusive Break-even. Fehlende Ergebnisse zählen nicht als 0. Ohne Verlust-R ist der Profit Factor nicht berechenbar. Expectancy = Gewinnanteil × Ø Gewinner + Verlustanteil × Ø Verlierer (negativ); sie entspricht dem Ø R. Unter 5 Ergebnissen: sehr kleine Gruppe, unter 20: kleine Gruppe. Diese Hinweise sind keine Signifikanztests; 20 Trades garantieren keine Belastbarkeit.</p></section><section class="card card-pad"><h2>Fundamentale Faktoren</h2><p class="text-small">Bewertungen beziehen sich auf die Handelsrichtung und stammen ausschliesslich aus dem Entry-Snapshot. „Keine Daten“ fasst fehlende, unbewertete und nicht verfügbare Angaben zusammen.</p>${Object.entries(FACTORS).map(([k,label])=>fold(label,breakdown(a.closed,t=>rating(t,k),label+' beim Öffnen',[...RATINGS,NO_DATA]))).join('')}
${fold('Weitere historische Werte',breakdown(a.closed,t=>fieldBias(t,'edgeBaseBias'),'EdgeFinder Base Bias')+breakdown(a.closed,t=>fieldBias(t,'edgeQuoteBias'),'EdgeFinder Quote Bias')+breakdown(a.closed,t=>signGroup(directional(t,number(detail(t,'edgeScoreDifference')))),'Score-Differenz Long-Währung minus Short-Währung')+breakdown(a.closed,t=>signGroup(directional(t,number(detail(t,'spread2yBp')))),'2Y-Spread Long-Währung minus Short-Währung')+breakdown(a.closed,t=>{const n=number(detail(t,'spread2yBp')),p=number(detail(t,'previousSpread2yBp'));return signGroup(directional(t,n!==null&&p!==null?n-p:null))},'Veränderung dieses 2Y-Spreads seit vor 1W'))}</section>
<section class="card card-pad"><h2>Faktor-Kombinationen</h2><p class="text-small">Alle beobachteten Kombinationen, inklusive neutraler, widersprechender und fehlender Bewertungen. Dieselben Trades werden aus mehreren Blickwinkeln gezeigt; Tabellen nicht zusammenzählen. Kleine Gruppen sind keine belastbaren Gewinner-Filter.</p>${[['edgefinder','rates'],['rates','narrative'],['rates','risk'],['edgefinder','rates','narrative']].map(keys=>fold(keys.map(k=>FACTORS[k]).join(' + '),breakdown(a.closed,t=>combination(t,keys),'Kombination beim Öffnen'))).join('')}</section>
<section class="card card-pad"><h2>Paare und Richtung</h2>${breakdown(a.closed,t=>(t.pair||'Paar fehlt')+' · '+(t.direction||'Richtung fehlt'),'Abgeschlossene Trades nach Paar und Richtung')}</section><section class="card card-pad"><h2>Ergebnisse nachvollziehen</h2>${fold('Historische Entry-Werte ansehen',historicalTable(a.closed))}${table(tradeRows,'Trades im gewählten Abschlusszeitraum',['Trade','Richtung','Abschluss','Ergebnis','Bewertungsgruppe'])}</section><section class="card card-pad"><h2>Verworfene Ideen · ${a.rejected.length}</h2><p class="text-small">Alle Zeiträume, mit den gewählten Paar-, Richtungs-, Währungs- und Snapshot-Filtern. Ideen ohne Entry-Snapshot erscheinen bei „Alle“ oder „Keine Daten“, nicht unter konkreten Confidence-/Faktorbewertungen. Nur verworfene Trade-Ideen, keine wiederholten Tagesbewertungen aus Morgenanalysen. Keine hypothetischen Gewinne oder Verluste. Ablehnungsgründe kannst du im Journal ergänzen. ${a.open} offene Trades für diese Auswahl bleiben ebenfalls ausserhalb der Ergebnisstatistik.</p>${table(rejectRows,'Verworfene Trade-Ideen',['Idee','Richtung','Ablehnungsgrund','Notizen'])}</section></div>`;
 }
 root.FXAnalytics={number,day,capture,entry,group,stats,series,select,render,fundamentals,exposure,confidence,rating,detail,combination,grouped,emptyFilters,FILTER_KEYS};
})(typeof window==='undefined'?globalThis:window);
