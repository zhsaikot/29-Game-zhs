/**
 * 29 (Twenty-Nine) Card Game - Progressive Web App Service Worker
 * Enables full offline play, instant asset loading, and caching strategy
 */

const CACHE_NAME = 'twenty-nine-pwa-v2';

// Core assets required for offline gameplay
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './manifest.json',
  './favicon.svg',
  './favicon.ico',
  './apple-touch-icon.png',
  './assets/apple-touch-icon.png',
  './assets/favicon-16x16.png',
  './assets/favicon-32x32.png',
  './assets/favicon-48x48.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-maskable-192.png',
  './assets/icon-maskable-512.png',
  './assets/logo-badge.png',
  './assets/logo-emblem.png',
  './assets/logo-original.png',
  './css/variables.css',
  './css/layout.css',
  './css/cards.css',
  './js/constants.js',
  './js/gameState.js',
  './js/cardRenderer.js',
  './js/audio.js',
  './js/aiEngine.js',
  './js/main.js'
];

// Install Event: Pre-cache assets safely
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Use individual cache.add calls so a single missing file doesn't fail the whole install
      const cachePromises = PRECACHE_ASSETS.map((assetUrl) => {
        return cache.add(assetUrl).catch((err) => {
          console.warn(`[SW] Failed to pre-cache ${assetUrl}:`, err);
        });
      });
      await Promise.all(cachePromises);
      return self.skipWaiting();
    })
  );
});

// Activate Event: Clean up outdated caches & claim control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Removing old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Stale-While-Revalidate & Cache-First Strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GET requests with http/https protocols
  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http://') && !request.url.startsWith('https://')) return;

  const url = new URL(request.url);

  // Handle Google Fonts (external origin)
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (e) {
          return cached;
        }
      })
    );
    return;
  }

  // Handle local same-origin assets (HTML, JS, CSS, PNG, SVG)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Fetch fresh version in background to update cache (Stale-While-Revalidate)
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and requesting a page, return cached index.html
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return null;
        });

      // Return cached immediately if available, otherwise wait for network
      return cachedResponse || fetchPromise;
    })
  );
});

// Message Listener: Support skipWaiting on request
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
