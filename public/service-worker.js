self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(
        [
        '/img/background.jpg',
        '/img/SFL-logo.png',
        './index.html'
        ]
        );
    })
    );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(caches.match(event.request));
});
