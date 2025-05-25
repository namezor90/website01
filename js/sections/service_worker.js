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

// ================================
// PWA MANIFEST - manifest.json
// ================================

const MANIFEST = {
    "name": "Web Dev Pro - Teljes Útmutató",
    "short_name": "Web Dev Pro",
    "description": "Komplett webfejlesztési útmutató HTML, CSS és JavaScript témakörökben",
    "start_url": "/web_dev_guide.html",
    "display": "standalone",
    "background_color": "#0d1117",
    "theme_color": "#4fc3f7",
    "orientation": "portrait-primary",
    "scope": "/",
    "lang": "hu",
    "categories": ["education", "developer", "productivity"],
    "icons": [
        {
            "src": "icons/icon-72x72.png",
            "sizes": "72x72",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "icons/icon-96x96.png",
            "sizes": "96x96",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "icons/icon-128x128.png",
            "sizes": "128x128",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "icons/icon-144x144.png",
            "sizes": "144x144",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "icons/icon-152x152.png",
            "sizes": "152x152",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "icons/icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "icons/icon-384x384.png",
            "sizes": "384x384",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "icons/icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any maskable"
        }
    ],
    "shortcuts": [
        {
            "name": "HTML Útmutató",
            "short_name": "HTML",
            "description": "HTML alapok és elemek",
            "url": "/web_dev_guide.html#html",
            "icons": [
                {
                    "src": "icons/shortcut-html.png",
                    "sizes": "96x96"
                }
            ]
        },
        {
            "name": "CSS Útmutató",
            "short_name": "CSS",
            "description": "CSS stílusok és layout",
            "url": "/web_dev_guide.html#css",
            "icons": [
                {
                    "src": "icons/shortcut-css.png",
                    "sizes": "96x96"
                }
            ]
        },
        {
            "name": "JavaScript Útmutató",
            "short_name": "JavaScript",
            "description": "JavaScript alapok és DOM",
            "url": "/web_dev_guide.html#javascript",
            "icons": [
                {
                    "src": "icons/shortcut-js.png",
                    "sizes": "96x96"
                }
            ]
        },
        {
            "name": "Code Playground",
            "short_name": "Playground",
            "description": "Interaktív kód szerkesztő",
            "url": "/web_dev_guide.html#playground",
            "icons": [
                {
                    "src": "icons/shortcut-playground.png",
                    "sizes": "96x96"
                }
            ]
        }
    ]
};

// ================================
// SERVICE WORKER REGISTER
// js/pwa/service-worker-register.js
// ================================

class ServiceWorkerManager {
    constructor() {
        this.registration = null;
        this.isUpdateAvailable = false;
    }

    async init() {
        if ('serviceWorker' in navigator) {
            try {
                this.registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered:', this.registration.scope);
                
                this.setupUpdateListener();
                this.setupMessageListener();
                this.checkForUpdates();
                
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        } else {
            console.warn('⚠️ Service Worker not supported');
        }
    }

    setupUpdateListener() {
        if (!this.registration) return;
        
        this.registration.addEventListener('updatefound', () => {
            const newWorker = this.registration.installing;
            
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    this.isUpdateAvailable = true;
                    this.showUpdateNotification();
                }
            });
        });
    }

    setupMessageListener() {
        navigator.serviceWorker.addEventListener('message', (event) => {
            const { type, message } = event.data;
            
            switch (type) {
                case 'SYNC_DATA':
                    console.log('📡 Sync message received:', message);
                    window.App?.showNotification('info', 'Szinkronizálás', message);
                    break;
            }
        });
    }

    showUpdateNotification() {
        window.App?.showNotification('info', 'Frissítés elérhető', 'Új verzió érvényes az alkalmazásból', {
            persistent: true,
            actions: [{
                id: 'update_app',
                label: 'Frissítés',
                handler: () => this.updateApp()
            }, {
                id: 'dismiss_update',
                label: 'Később',
                handler: () => {}
            }]
        });
    }

    async updateApp() {
        if (this.registration && this.registration.waiting) {
            this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            
            // Wait for the new service worker to take control
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        }
    }

    async checkForUpdates() {
        if (this.registration) {
            try {
                await this.registration.update();
                console.log('🔄 Checked for Service Worker updates');
            } catch (error) {
                console.error('❌ Failed to check for updates:', error);
            }
        }
    }

    // Background sync registration
    async registerBackgroundSync(tag) {
        if ('sync' in window.ServiceWorkerRegistration.prototype) {
            try {
                await this.registration.sync.register(tag);
                console.log('📡 Background sync registered:', tag);
            } catch (error) {
                console.error('❌ Background sync registration failed:', error);
            }
        }
    }

    // Push notification subscription
    async subscribeToPushNotifications() {
        if (!this.registration) return null;
        
        try {
            const subscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(
                    'YOUR_VAPID_PUBLIC_KEY_HERE' // Replace with actual VAPID key
                )
            });
            
            console.log('🔔 Push notification subscription:', subscription);
            return subscription;
        } catch (error) {
            console.error('❌ Push notification subscription failed:', error);
            return null;
        }
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // Check if app is running in standalone mode
    isStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone ||
               document.referrer.includes('android-app://');
    }

    // Get installation prompt
    async getInstallPrompt() {
        return new Promise((resolve) => {
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                resolve(e);
            });
        });
    }
}

// Initialize Service Worker Manager
const swManager = new ServiceWorkerManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => swManager.init());
} else {
    swManager.init();
}

// Make globally available
window.ServiceWorkerManager = swManager;

// ================================
// INSTALL PROMPT HANDLER
// ================================

class InstallPromptManager {
    constructor() {
        this.deferredPrompt = null;
        this.installBanner = null;
    }

    init() {
        this.installBanner = document.getElementById('installBanner');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallBanner();
        });

        // Install button click
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.addEventListener('click', () => this.promptInstall());
        }

        // Dismiss button click
        const dismissBtn = document.getElementById('dismissInstall');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => this.dismissInstallBanner());
        }

        // App installed
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA installed successfully');
            this.hideInstallBanner();
            window.App?.showNotification('success', 'Alkalmazás telepítve', 'Web Dev Pro sikeresen telepítve!');
        });
    }

    showInstallBanner() {
        if (this.installBanner && !this.isInstallBannerDismissed()) {
            this.installBanner.classList.remove('hidden');
        }
    }

    hideInstallBanner() {
        if (this.installBanner) {
            this.installBanner.classList.add('hidden');
        }
    }

    dismissInstallBanner() {
        this.hideInstallBanner();
        localStorage.setItem('installBannerDismissed', 'true');
    }

    isInstallBannerDismissed() {
        return localStorage.getItem('installBannerDismissed') === 'true';
    }

    async promptInstall() {