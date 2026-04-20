const CACHE_NAME = 'widget-hub-v1';
const ASSETS = [
  './',
  './index.html',
  './main.js',
  './style.css',
  './lib/reactive.js',
  './lib/weather.js',
  './lib/supabase.js',
  './lib/x-client.js',
  './components/media-panel.js',
  './components/status-panel.js',
  './components/x-slideshow.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request);
    })
  );
});
