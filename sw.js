/* O Segredo das Estrelas · cache offline.
   Rede primeiro; se a rede falhar OU responder com erro (404, 503…), vale a última versão boa guardada.
   Só respostas boas entram no cache, e a limpeza só apaga caches deste app (prefixo "cda-"). */
const PREFIXO = "cda-";
const CACHE = PREFIXO + "v8";
const ARQUIVOS = ["./", "index.html", "estilo.css", "nucleo.js", "app.js", "conta.js", "premium.js", "telas-premium.js", "telas-guia.js", "estela.js", "manifest.webmanifest",
  "dados/guia.js", "dados/numerologia.js", "dados/astros.js", "dados/kabala.js", "dados/diario.js", "dados/ciclos.js",
  "dados/mapa-profundo.js", "dados/combos.js", "dados/astro-lua.js", "dados/previsao-ano.js"];

// se algum arquivo falhar, a instalação falha inteira e a versão anterior continua valendo
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith(PREFIXO) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

const guardado = req => caches.match(req, { ignoreSearch: true });
const guardar = (req, resp) => caches.open(CACHE).then(c => c.put(req, resp)).catch(err => console.warn("[sw] não guardei", req.url, err));

async function responder(req) {
  const url = new URL(req.url);
  // fotografia: não muda de conteúdo sem mudar de nome, então o cache responde primeiro
  if (url.pathname.includes("/img/")) {
    const tem = await guardado(req); if (tem) return tem;
    const r = await fetch(req); if (r.ok) guardar(req, r.clone()); return r;
  }
  let r;
  try { r = await fetch(req); }
  catch (err) { const tem = await guardado(req); if (tem) return tem; throw err; }
  if (r.ok) { guardar(req, r.clone()); return r; }
  return (await guardado(req)) || r;       // 404, 503 e parecidos: fica com a última versão boa
}

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(responder(e.request));
});
