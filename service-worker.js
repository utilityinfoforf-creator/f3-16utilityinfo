const CACHE_NAME = 'utility-dashboard-v1';
const URLS_TO_CACHE = [
  '/f3-16utilityinfo/',
  '/f3-16utilityinfo/index.html',
  '/f3-16utilityinfo/pages/main/index.html',
  '/f3-16utilityinfo/assets/styles.css',
  '/f3-16utilityinfo/assets/script.js',
  '/f3-16utilityinfo/manifest.json'
];

// Install event - cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell');
        return cache.addAll(URLS_TO_CACHE).catch(err => {
          console.log('Some files could not be cached:', err);
        });
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network first, fall back to cache
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip API calls to external domains
  if (event.request.url.includes('script.google.com') || 
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('cdn.jsdelivr.net')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => new Response('Network error', { status: 503 }))
    );
    return;
  }

  // For app files: Network first for critical updates, cache as fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200) {
          return response;
        }
        
        // Clone and cache successful responses
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        
        return response;
      })
      .catch(() => {
        // Fallback to cache when network fails
        return caches.match(event.request)
          .then(response => {
            return response || new Response('Offline - Page not cached', { status: 503 });
          });
      })
  );
});

// Background sync (optional - for future enhancement)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-payments') {
    event.waitUntil(syncPayments());
  }
});

async function syncPayments() {
  try {
    // Sync pending payments when back online
    console.log('Syncing payments...');
  } catch (error) {
    console.log('Sync failed:', error);
  }
}
