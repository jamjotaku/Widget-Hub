const CACHE_NAME = 'widget-hub-v2.8';
const ASSETS = [
  '/',
  '/index.html',
  '/main.js',
  '/style.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // 新しいSWをすぐに待機状態からアクティブにする
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(), // 現在のクライアント（タブ）をすぐにコントロール下に置く
      // 古いキャッシュを削除
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
        );
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  // ネットワーク優先 (Network First) 戦略: 常に最新のコードを取得しようとする
  event.respondWith(
    fetch(event.request).then((response) => {
      // 成功したらキャッシュを更新して返す
      if (response.status === 200) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => {
      // ネットワーク失敗時はキャッシュから返す
      return caches.match(event.request);
    })
  );
});
