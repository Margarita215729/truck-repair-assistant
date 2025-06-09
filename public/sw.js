const CACHE_NAME = 'truck-repair-assistant-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

const STATIC_ASSETS = [
  '/truck-repair-assistant/',
  '/truck-repair-assistant/manifest.json',
  '/truck-repair-assistant/_next/static/css/',
  '/truck-repair-assistant/icons/icon-192x192.png',
  '/truck-repair-assistant/icons/icon-512x512.png',
];

const OFFLINE_FALLBACK = '/truck-repair-assistant/offline.html';

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS.filter(url => url.endsWith('.html') || url.endsWith('.json') || url.endsWith('.png')));
    }).catch((error) => {
      console.error('[SW] Failed to cache static assets:', error);
    })
  );
  
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  return self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Handle API requests
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached response if available
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline fallback for API requests
            return new Response(
              JSON.stringify({ 
                error: 'Offline', 
                message: 'You are currently offline. Some features may not work.' 
              }),
              { 
                status: 503, 
                headers: { 'Content-Type': 'application/json' } 
              }
            );
          });
        })
    );
    return;
  }
  
  // Handle static assets and pages
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request)
          .then((response) => {
            if (response.ok) {
              const responseClone = response.clone();
              
              // Cache static assets
              if (request.destination === 'image' || 
                  request.destination === 'script' || 
                  request.destination === 'style' ||
                  url.pathname.includes('/_next/static/')) {
                caches.open(STATIC_CACHE).then((cache) => {
                  cache.put(request, responseClone);
                });
              } else {
                // Cache dynamic content
                caches.open(DYNAMIC_CACHE).then((cache) => {
                  cache.put(request, responseClone);
                });
              }
            }
            
            return response;
          })
          .catch(() => {
            // Return offline fallback for navigation requests
            if (request.destination === 'document') {
              return caches.match(OFFLINE_FALLBACK).then((fallback) => {
                return fallback || new Response(
                  `<!DOCTYPE html>
                  <html lang="en">
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Offline - Truck Repair Assistant</title>
                    <style>
                      body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        display: flex; 
                        justify-content: center; 
                        align-items: center; 
                        height: 100vh; 
                        margin: 0; 
                        background: #f3f4f6;
                      }
                      .offline-container {
                        text-align: center;
                        padding: 2rem;
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                      }
                    </style>
                  </head>
                  <body>
                    <div class="offline-container">
                      <h1>🚛 You're Offline</h1>
                      <p>Truck Repair Assistant is not available right now.</p>
                      <p>Please check your internet connection and try again.</p>
                      <button onclick="window.location.reload()">Try Again</button>
                    </div>
                  </body>
                  </html>`,
                  { headers: { 'Content-Type': 'text/html' } }
                );
              });
            }
            
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'diagnosis-sync') {
    event.waitUntil(syncDiagnosis());
  }
});

async function syncDiagnosis() {
  console.log('[SW] Syncing offline diagnosis data');
  
  try {
    // Get offline data from IndexedDB or cache
    const cache = await caches.open(DYNAMIC_CACHE);
    const offlineRequests = await cache.keys();
    
    for (const request of offlineRequests) {
      if (request.url.includes('/api/ai/diagnose')) {
        try {
          await fetch(request);
          await cache.delete(request);
        } catch (error) {
          console.error('[SW] Failed to sync request:', error);
        }
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'Truck Repair Assistant';
  const options = {
    body: data.body || 'New notification',
    icon: '/truck-repair-assistant/icons/icon-192x192.png',
    badge: '/truck-repair-assistant/icons/icon-96x96.png',
    data: data.url || '/truck-repair-assistant/',
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});
