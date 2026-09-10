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
for(const f of fs.readdirSync(root))if(/(?:app|data|style)(?:\.base)?\.v\d/.test(f))assert(f.includes('.v'+version+'.'),`Obsolete release: ${f}`);
assert.equal(JSON.parse(read('package.json')).version,version);
assert.equal(JSON.parse(read('package-lock.json')).version,version);
assert(read('index.html').includes('v'+version));
const addon=read('app.v'+version+'.js');
for(const marker of ['Rates-Bestätigungsmatrix','Zentralbanken & Sitzungswahrscheinlichkeiten','makePairScreenCollapsible','macroSnapshot','probHike'])assert(addon.includes(marker));
assert(seen.has('daily-probabilities.v'+version+'.js'));
console.log('PASS: active release entrypoint, CSS dependencies, JS syntax, manifest and package versions.');
