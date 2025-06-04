const cacheName = "v1";
const assets = [
  "/",
  "/calendar-App/index.html",
  "/calendar-App/style.css",
  "/calendar-App/java.js",
  "/calendar-App/icons/icon-192.png",
  "/calendar-App/icons/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(assets))
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});