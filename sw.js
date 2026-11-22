/* Constelação do Amanhã · cache offline (rede primeiro, cache como reserva) */
const CACHE = "cda-v1";
const ARQUIVOS = ["./", "index.html", "estilo.css", "app.js", "premium.js", "telas-premium.js", "manifest.webmanifest",
  "dados/estrelas.js", "dados/numerologia.js", "dados/astros.js", "dados/kabala.js", "dados/diario.js", "dados/ciclos.js",
  "dados/mapa-profundo.js", "dados/combos.js", "dados/astro-lua.js", "dados/previsao-ano.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r; }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
