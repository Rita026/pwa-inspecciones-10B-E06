const CACHE_NAME = "inspecciones-cache-v1";
const APP_SHELL = ["/", "/manifest.webmanifest", "/offline.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName.startsWith("inspecciones-cache-") &&
                cacheName !== CACHE_NAME
            )
            .map((cacheName) => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const isNavigation =
    request.method === "GET" &&
    (request.mode === "navigate" || request.destination === "document");

  if (!isNavigation) {
    return;
  }

  event.respondWith(
    fetch(request).catch(() =>
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedHome = await cache.match("/");
        return cachedHome || cache.match("/offline.html");
      })
    )
  );
});
