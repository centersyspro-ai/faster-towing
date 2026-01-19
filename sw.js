// Service Worker para Grúas Alexis - GitHub Pages
const CACHE_NAME = 'gruas-alexis-pwa-v3';
const GITHUB_PREFIX = '/faster-towing';

// Archivos a cachear (con prefijo de GitHub Pages)
const urlsToCache = [
  `${GITHUB_PREFIX}/`,
  `${GITHUB_PREFIX}/index.html`,
  `${GITHUB_PREFIX}/manifest.json`,
  `${GITHUB_PREFIX}/assets/css/style.css`,
  `${GITHUB_PREFIX}/assets/js/main.js`,
  `${GITHUB_PREFIX}/assets/images/icon-192.png`,
  `${GITHUB_PREFIX}/assets/images/icon-512.png`,
  `${GITHUB_PREFIX}/assets/images/favicon.png`,
  `${GITHUB_PREFIX}/assets/images/auxilio_vial.jpeg`,
  `${GITHUB_PREFIX}/assets/images/operador.jpg`
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Cacheando archivos...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] Instalación completada');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Error en instalación:', error);
      })
  );
});

// Activación y limpieza de caches antiguos
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Ahora está listo para controlar fetch events.');
      return self.clients.claim();
    })
  );
});

// Estrategia: Cache First, luego Network
self.addEventListener('fetch', event => {
  // Solo manejar requests de nuestro dominio
  if (!event.request.url.includes('centersyspro-ai.github.io/faster-towing')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('[Service Worker] Sirviendo desde cache:', event.request.url);
          return cachedResponse;
        }
        
        console.log('[Service Worker] Buscando en red:', event.request.url);
        
        return fetch(event.request)
          .then(response => {
            // Verificar si la respuesta es válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clonar la respuesta para guardar en cache
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
                console.log('[Service Worker] Guardado en cache:', event.request.url);
              });
            
            return response;
          })
          .catch(error => {
            console.error('[Service Worker] Error en fetch:', error);
            
            // Para páginas HTML, servir la página offline
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match(`${GITHUB_PREFIX}/index.html`);
            }
            
            // Para otros recursos, puedes devolver un fallback
            return new Response('Contenido no disponible offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Manejar mensajes desde la página principal
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});