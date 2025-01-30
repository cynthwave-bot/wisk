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
    // Add other important assets
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', event => {
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

// Clear old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
