// ================================
// SERVICE WORKER - sw.js
// ================================

const CACHE_NAME = 'webdevpro-v2.0';
const STATIC_CACHE = 'webdevpro-static-v2.0';
const DYNAMIC_CACHE = 'webdevpro-dynamic-v2.0';

// Files to cache
const STATIC_FILES = [
    '/',
    '/web_dev_guide.html',
    '/styles/main.css',
    '/styles/themes.css',
    '/styles/components.css',
    '/js/core/app.js',
    '/js/core/storage.js',
    '/js/core/navigation.js',
    '/js/core/search.js',
    '/js/features/themes.js',
    '/js/features/notes.js',
    '/js/features/bookmarks.js',
    '/js/features/progress.js',
    '/js/features/notifications.js',
    '/js/components/color-generator.js',
    '/js/components/code-playground.js',
    '/js/components/quiz.js',
    '/js/sections/content-loader.js',
    '/manifest.json'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Static files cached');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Failed to cache static files', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cache) => {
                        if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache', cache);
                            return caches.delete(cache);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip external URLs
    if (url.origin !== location.origin) {
        return;
    }
    
    event.respondWith(
        // Try cache first
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached version
                    return cachedResponse;
                }
                
                // If not in cache, fetch from network
                return fetch(request)
                    .then((networkResponse) => {
                        // Check if we received a valid response
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        
                        // Clone the response
                        const responseClone = networkResponse.clone();
                        
                        // Cache the response for future use
                        caches.open(DYNAMIC_CACHE)
                            .then((cache) => {
                                cache.put(request, responseClone);
                            });
                        
                        return networkResponse;
                    })
                    .catch(() => {
                        // If network fails, try to serve a fallback
                        if (request.destination === 'document') {
                            return caches.match('/web_dev_guide.html');
                        }
                    });
            })
    );
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync', event.tag);
    
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

// Push notification handling
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push received');
    
    const options = {
        body: event.data ? event.data.text() : 'Web Dev Pro notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            url: '/'
        },
        actions: [
            {
                action: 'open',
                title: 'Megnyitás',
                icon: '/icons/icon-192x192.png'
            },
            {
                action: 'close',
                title: 'Bezárás'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Web Dev Pro', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url || '/')
        );
    }
});

// Message handling
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Sync data function
async function syncData() {
    try {
        // Sync any pending data when connection is restored
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_DATA',
                message: 'Connection restored, syncing data...'
            });
        });
    } catch (error) {
        console.error('Service Worker: Sync failed', error);
    }
}