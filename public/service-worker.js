const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/index.js",
  "manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];
const PRE_CACHE = "precache-v1";
const RUNTIME = "runtime";
// Install
self.addEventListener("install", function (evt) {
  evt.waitUntil(
    caches.open(PRE_CACHE).then((cache) => {
      console.log("Your files were pre-cached successfully!");
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});
// The activate handler takes care of cleaning up old caches.
self.addEventListener("activate", function (evt) {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== PRE_CACHE && key !== RUNTIME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", function (evt) {
  if (evt.request.url.includes("/api/")) {
    evt.respondWith(
      caches
        .open(RUNTIME)
        .then((cache) => {
          return fetch(evt.request)
            .then((response) => {
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }

              return response;
            })
            .catch((err) => {
              return cache.match(evt.request);
            });
        })
        .catch((err) => console.log(err))
    );

    return;
  }
  evt.respondWith(
    caches.match(evt.request).then(function (response) {
      return response || fetch(evt.request);
    })
  );
});
