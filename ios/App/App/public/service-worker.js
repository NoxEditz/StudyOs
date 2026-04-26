const CACHE_NAME='studyos-v1';
const CORE_ASSETS=[
  './',
  './index.html',
  './css/styles.css',
  './js/data.js',
  './js/utils.js',
  './js/gamification.js',
  './js/intro.js',
  './js/dashboard.js',
  './js/schedule.js',
  './js/study.js',
  './js/timer.js',
  './js/habits_calendar.js',
  './js/kanban.js',
  './js/games.js',
  './js/tools_misc.js',
  './js/core.js',
  './manifest.webmanifest'
];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE_ASSETS)).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  event.respondWith(
    caches.match(event.request).then(cached=>{
      if(cached) return cached;
      return fetch(event.request).then(response=>{
        const clone=response.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(event.request,clone)).catch(()=>{});
        return response;
      }).catch(()=>caches.match('./index.html'));
    })
  );
});
