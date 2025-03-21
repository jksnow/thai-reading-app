// Special service worker for Firebase Auth
// This helps with redirect handling on mobile browsers

// Cache name for auth-related resources
const CACHE_NAME = "firebase-auth-cache-v1";

// URLs that should be cached for offline access
const urlsToCache = ["/", "/index.html", "/manifest.json"];

// Install event - cache basic files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service worker cache opened");
      return cache.addAll(urlsToCache);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME;
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );
  // Take control immediately
  self.clients.claim();
});

// Intercept fetch requests
self.addEventListener("fetch", (event) => {
  // Special handling for Firebase Auth URLs
  if (
    event.request.url.includes("/__/auth/") ||
    event.request.url.includes("google") ||
    event.request.url.includes("identitytoolkit")
  ) {
    // Don't cache auth requests, let them go to network
    return;
  }

  // For other requests, try network first, then cache
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// Listen for messages from the main app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SIGN_IN_SUCCESS") {
    // Notify all clients about successful sign-in
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: "AUTH_STATE_CHANGED",
          user: event.data.user,
        });
      });
    });
  }
});
