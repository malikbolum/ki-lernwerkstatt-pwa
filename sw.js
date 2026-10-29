'use strict';
// Bump VERSION whenever a shell resource changes. Scope keeps sibling PWAs isolated.
const VERSION='1.0.0';
const PREFIX='ki-lernwerkstatt:'+encodeURIComponent(self.registration.scope)+':';
const CACHE=PREFIX+VERSION;
const SHELL=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
const HOME=new URL('./index.html',self.registration.scope).href;
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL.map(path=>new Request(new URL(path,self.registration.scope),{cache:'reload'})))));
  // Existing sessions keep their version until the user explicitly accepts an update.
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{const names=await caches.keys();await Promise.all(names.filter(name=>name.startsWith(PREFIX)&&name!==CACHE).map(name=>caches.delete(name)));await self.clients.claim();})());
});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    // All navigation inside this small app uses its cached shell, even with a query string.
    if(request.mode==='navigate'){const home=await cache.match(HOME);if(home)return home;}
    const cached=await cache.match(request,{ignoreSearch:true});if(cached)return cached;
    try{return await fetch(request);}catch(_){return new Response('Diese Ressource ist offline nicht verfügbar.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}
  })());
});
