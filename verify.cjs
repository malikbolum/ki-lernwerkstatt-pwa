'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const app=require('./app.js');
const clone=value=>JSON.parse(JSON.stringify(value));
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-7,`${actual} ≠ ${expected}`);
const defaults=app.defaults();
assert.equal(app.builtin.length,10);
assert.equal(new Set(app.builtin.map(card=>card.id)).size,10);
assert.deepEqual(app.validate(defaults),defaults);
const result=app.calculate(defaults.calculator);
close(result.baseline,8000); close(result.hours,200);
close(result.front.tokens,30); close(result.front.total,2850); close(result.front.net,5150);
close(result.front.payback,1500/5150); close(result.front.roi,4020);
close(result.mini.tokens,1.4); close(result.mini.total,4461.4); close(result.mini.net,3538.6);
let values={...defaults.calculator,tasks:0};
assert.equal(app.calculate(values).front.payback,null);
assert.equal(app.calculate(values).front.net,-20);
values={...defaults.calculator,frontSetup:0};
assert.equal(app.calculate(values).front.payback,0);
assert.equal(app.calculate(values).front.roi,null);
values={...defaults.calculator,frontGain:0};
close(app.calculate(values).front.net,-50);
assert.equal(app.calculate(values).front.payback,null);
values={...defaults.calculator,miniInput:0,miniOutput:0};
assert.equal(app.calculate(values).mini.tokens,0);
for(const change of [
  state=>state.schemaVersion=2,
  state=>state.notes='x'.repeat(50001),
  state=>state.calculator.frontInput=-1,
  state=>state.calculator.frontFixed=.5,
  state=>state.calculator.tasks=51,
  state=>state.calculator.miniOutput=Infinity,
  state=>state.progress.llm={status:'other',reviews:1},
  state=>state.progress.foreign={status:'known',reviews:1},
  state=>state.customCards=[{id:'custom-a',question:' ',answer:'A',example:''}],
  state=>state.customCards=Array.from({length:201},(_,i)=>({id:'custom-'+i,question:'Q',answer:'A',example:''})),
  state=>state.customCards=[{id:'custom-a',question:'Q',answer:'A',example:''},{id:'custom-a',question:'Q',answer:'A',example:''}]
]){const state=clone(defaults);change(state);assert.throws(()=>app.validate(state));}
const user=clone(defaults);
user.customCards=[{id:'custom-test',question:'<img src=x onerror=alert(1)>',answer:'Eine Textantwort',example:'<script>test</script>'}];
user.progress['custom-test']={status:'known',reviews:2};user.notes='Test\nNotiz';
assert.deepEqual(app.validate(JSON.parse(JSON.stringify(user))),{...user,customCards:user.customCards.map(card=>({...card,category:'Eigene Karten'}))});
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'manifest.webmanifest'),'utf8'));
for(const value of [manifest.id,manifest.start_url,manifest.scope,...manifest.icons.map(icon=>icon.src),...manifest.shortcuts.map(shortcut=>shortcut.url)])assert.ok(value.startsWith('./'));
for(const icon of manifest.icons){const bytes=fs.readFileSync(path.join(__dirname,icon.src));assert.equal(bytes.readUInt32BE(16),Number(icon.sizes.split('x')[0]));assert.equal(bytes.readUInt32BE(20),Number(icon.sizes.split('x')[1]));}
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);assert.equal(ids.length,new Set(ids).size);
for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){const url=match[1];assert.ok(url.startsWith('./')||url.startsWith('#'),url);if(url.startsWith('./')&&!url.includes('#'))assert.ok(fs.existsSync(path.join(__dirname,url)),url);}
for(const match of fs.readFileSync(path.join(__dirname,'app.js'),'utf8').matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.includes(match[1]),'Missing HTML id: '+match[1]);

// Exercise actual service-worker handlers with a small deterministic CacheStorage stand-in.
(async()=>{
  const events={},buckets=new Map(),scope='https://example.test/workshop/ki-lernwerkstatt-pwa/';
  const cacheAPI={async keys(){return [...buckets.keys()];},async delete(name){return buckets.delete(name);},async open(name){if(!buckets.has(name))buckets.set(name,new Map());const bucket=buckets.get(name);return {
    async addAll(requests){for(const request of requests){const filename=new URL(request.url).pathname.slice(new URL(scope).pathname.length)||'index.html';assert.ok(fs.existsSync(path.join(__dirname,filename)),filename);bucket.set(request.url,new Response(fs.readFileSync(path.join(__dirname,filename))));}},
    async match(request,options={}){const input=typeof request==='string'?request:request.url;const canonical=url=>{const parsed=new URL(url);if(options.ignoreSearch)parsed.search='';return parsed.href;};for(const [key,response]of bucket)if(canonical(input)===canonical(key))return response.clone();}
  };}};
  const prefix='ki-lernwerkstatt:'+encodeURIComponent(scope)+':';
  buckets.set(prefix+'0.9.0',new Map());buckets.set('other-workshop-pwa-v1',new Map());
  let claimed=false,skipped=false;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'sw.js'),'utf8'),{self:{registration:{scope},location:{origin:'https://example.test'},clients:{claim:async()=>{claimed=true;}},skipWaiting:()=>{skipped=true;},addEventListener:(type,handler)=>events[type]=handler},caches:cacheAPI,URL,Request,Response,fetch:async()=>{throw Error('Offline');}});
  let work;events.install({waitUntil:promise=>work=promise});await work;
  assert.equal(skipped,false,'No forced update');
  events.activate({waitUntil:promise=>work=promise});await work;
  assert.equal(claimed,true);assert.equal(buckets.has(prefix+'0.9.0'),false);assert.equal(buckets.has('other-workshop-pwa-v1'),true);
  let response;
  events.fetch({request:{method:'GET',url:scope+'?offline=1',mode:'navigate'},respondWith:promise=>response=promise});
  assert.ok((await(await response).text()).includes('KI-Lernwerkstatt'));
  events.fetch({request:{method:'GET',url:scope+'app.js?v=1',mode:'cors'},respondWith:promise=>response=promise});
  assert.ok((await(await response).text()).includes('const Workshop'));
  events.fetch({request:{method:'GET',url:scope+'missing.png',mode:'cors'},respondWith:promise=>response=promise});
  assert.equal((await response).status,503);
  let intercepted=false;events.fetch({request:{method:'GET',url:'https://example.test/other/',mode:'navigate'},respondWith:()=>intercepted=true});assert.equal(intercepted,false);
  events.message({data:{type:'SKIP_WAITING'}});assert.equal(skipped,true);
  console.log('PASS: formulas, zero/negative savings, local costs, backup limits/round-trip, manifest/icons, HTML references, scoped offline navigation/assets, cache isolation and explicit updates.');
})().catch(error=>{console.error(error);process.exitCode=1;});
