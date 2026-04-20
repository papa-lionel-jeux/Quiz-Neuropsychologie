const CACHE_NAME = 'neuroquiz-v2';
const ASSETS = [
    '/Quiz-Neuropsychologie/',
    '/Quiz-Neuropsychologie/index.html',
    '/Quiz-Neuropsychologie/manifest.json'
];

// Installation : mise en cache des assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activation : suppression des anciens caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// Fetch : Cache First, Network Fallback
self.addEventListener('fetch', event => {
    // Ignorer les requêtes non-GET
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                if (cached) return cached;
                // Pas en cache : réseau + mise en cache dynamique
                return fetch(event.request)
                    .then(response => {
                        if (!response || response.status !== 200) return response;
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                        return response;
                    })
                    .catch(() => {
                        // Fallback ultime : retourner index.html
                        return caches.match('/Quiz-Neuropsychologie/index.html');
                    });
            })
    );
});
