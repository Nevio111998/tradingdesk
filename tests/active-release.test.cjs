// Active release integrity: all entrypoint dependencies exist; no archived bundles required.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const build=JSON.parse(read('build-info.json')),version=build.version;
const seen=new Set();
function visit(file){
 if(seen.has(file))return;seen.add(file);
 assert(fs.existsSync(path.join(root,file)),`Missing dependency: ${file}`);
 const text=read(file);
 if(file.endsWith('.js'))new vm.Script(text,{filename:file});
 const refs=file.endsWith('.html')?[...text.matchAll(/(?:src|href)="([^"?#]+)/g)].map(m=>m[1]):file.endsWith('.css')?[...text.matchAll(/url\(['"]?([^'"\s)]+)['"]?\)/g)].map(m=>m[1]):[];
 for(const ref of refs)if(!/^(https?:|data:|#)/.test(ref))visit(path.normalize(path.join(path.dirname(file),ref)));
}
visit('index.html');
for(const f of build.files)assert(seen.has(f),`Manifest runtime dependency is not reachable: ${f}`);
// Every versioned runtime asset in the publish directory must belong to the loaded release.
for (const file of fs.readdirSync(root)) {
  if (!/\.v\d+\.\d+\.\d+\.(?:js|css)$/.test(file)) continue;
  assert(file.endsWith(`.v${version}${path.extname(file)}`), `Obsolete release: ${file}`);
  assert(seen.has(file), `Unreferenced release asset: ${file}`);
}
assert.equal(JSON.parse(read('package.json')).version,version);
assert.equal(JSON.parse(read('package-lock.json')).version,version);
assert(read('index.html').includes('v'+version));
const addon=read('app.v'+version+'.js');
for(const marker of ['Rates-Bestätigungsmatrix','Zentralbanken & Sitzungswahrscheinlichkeiten','makePairScreenCollapsible','macroSnapshot','probHike'])assert(addon.includes(marker));
assert(![...seen].some(f=>f.startsWith('daily-probabilities.')));
assert(!addon.includes('seedYesterdayProbabilities'));
const context=vm.createContext({window:{},Intl,console});
vm.runInContext(addon.slice(0,addon.indexOf('  const observer='))+'window.test={addonHtml};})();',context);
const source={date:'2026-09-10',attachedAt:'2026-09-10T08:00:00Z',currencies:{USD:{},CHF:{}}};
const current=context.window.test.addonHtml({pair:'USDCHF'},source,true),frozen=context.window.test.addonHtml({pair:'USDCHF'},source,false);
assert(current.includes('Aktuelle Morgenanalyse'));assert(current.includes('kein automatischer Marktdatenfeed'));
assert(frozen.includes('Stand bei Trade-Übernahme'));assert(frozen.includes('Originalanalyse ist nicht verfügbar'));
assert(!current.includes('>Live<'));
console.log('PASS: active release entrypoint, CSS dependencies, JS syntax, manifest and package versions.');
