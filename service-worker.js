const CACHE_NAME = 'wisk-cache-v1';
// Add all your static assets here
const urlsToCache = [
    '/',
    '/global.css',
    '/global.js',
    '/script.js',
    '/style.css',
    '/a7/cdn/lit-core-2.7.4.min.js',
    '/a7/cdn/marked.esm-9.1.2.min.js',
    '/a7/cdn/mermaid-11.4.0.min.js',
    '/a7/cdn/pica.min.js',
    '/a7/wisk-logo.svg',
    '/a7/favicon.png',
];

// Function to check if we're on localhost
const isLocalhost = () => {
    return (
        self.location.hostname === 'localhost' ||
        self.location.hostname === '127.0.0.1' ||
        self.location.hostname.startsWith('192.168.') ||
        self.location.hostname.startsWith('10.') ||
        self.location.hostname.includes('::1')
    );
};

// Function to clear all caches
const clearAllCaches = async () => {
    try {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
        console.log('All caches cleared successfully');
    } catch (error) {
        console.error('Error clearing caches:', error);
    }
};

// Immediately clear all caches when service worker loads
clearAllCaches();

self.addEventListener('install', event => {
    if (isLocalhost()) {
        // Skip caching on localhost
        return;
    }

    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', event => {
    // Skip caching on localhost
    if (isLocalhost()) {
        return event.respondWith(fetch(event.request));
    }

    event.respondWith(
        caches.match(event.request).then(response => {
            // Cache hit - return response
            if (response) {
                return response;
            }
            // Clone the request because it can only be used once
            const fetchRequest = event.request.clone();
            return fetch(fetchRequest).then(response => {
                // Check if valid response
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                // Clone the response because it can only be used once
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
                return response;
            });
        })
    );
});

// Modified activate event to forcefully clear all caches
self.addEventListener('activate', event => {
    event.waitUntil(
        clearAllCaches().then(() => {
            // Only start caching again if not on localhost
            if (!isLocalhost()) {
                return caches.open(CACHE_NAME).then(cache => {
                    return cache.addAll(urlsToCache);
                });
            }
        })
    );
});
