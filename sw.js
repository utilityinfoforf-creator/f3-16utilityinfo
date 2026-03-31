// Minimal Service Worker for PWA compatibility
// Online-only mode: requests are passed through to the network

const CACHE_NAME = 'utility-dashboard-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass all requests through to the network (online-only mode)
  event.respondWith(
    fetch(event.request).catch(() => {
      // If offline, return a simple offline message
      return new Response('Offline - Please check your internet connection', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    })
  );
});
