const CACHE_NAME = 'bs-ai-builder-v5';
const APP_SHELL = ['./', './index.html', './styles.css', './app.js', './manifest.json'];
const CDN_HOSTS = ['cdn.jsdelivr.net'];

// Instala e faz cache dos arquivos principais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// Ativa a nova versão e apaga caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

function saveInCache(request, response) {
  if (response && (response.ok || response.type === 'opaque')) {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => {});
  }
  return response;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return; // POST (API da Groq etc.) passa direto

  const url = new URL(request.url);

  // Arquivos do próprio app: REDE PRIMEIRO (sempre pega a versão nova), cache só se estiver offline
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(request)
        .then(response => saveInCache(request, response))
        .catch(() => caches.match(request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  // Bootstrap / ícones via CDN: cache primeiro (funciona offline depois da 1ª visita)
  if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(response => saveInCache(request, response)))
    );
  }
  // Qualquer outra origem (ex.: api.groq.com) não é interceptada
});

