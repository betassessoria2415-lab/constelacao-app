const { test } = require("node:test"), assert = require("node:assert/strict");
const vm = require("node:vm"), fs = require("node:fs"), path = require("node:path");
const ORIGEM = "https://app.exemplo";

// monta um ambiente de service worker de mentira: caches, fetch e os eventos install/activate/fetch
function ambiente({ rede, cachesIniciais = {} }) {
  const lojas = new Map(Object.entries(cachesIniciais).map(([k, v]) => [k, new Map(Object.entries(v))]));
  const chave = r => new URL(typeof r === "string" ? r : r.url, ORIGEM + "/").pathname;
  const loja = nome => ({
    addAll: async lista => { const novos = []; for (const u of lista) { const r = await rede(new URL(u, ORIGEM + "/").href); if (!r.ok) throw new TypeError("falhou " + u); novos.push([chave(u), r]); } novos.forEach(([k, r]) => lojas.get(nome).set(k, r)); },
    put: async (req, resp) => { lojas.get(nome).set(chave(req), resp); }
  });
  const caches = {
    open: async nome => { if (!lojas.has(nome)) lojas.set(nome, new Map()); return loja(nome); },
    keys: async () => Array.from(lojas.keys()),
    delete: async nome => lojas.delete(nome),
    match: async req => { for (const m of lojas.values()) if (m.has(chave(req))) return m.get(chave(req)); return undefined; }
  };
  const ouvintes = {}, pulou = { v: false }, assumiu = { v: false };
  const self = { addEventListener: (tipo, fn) => { ouvintes[tipo] = fn; }, skipWaiting: async () => { pulou.v = true; }, clients: { claim: async () => { assumiu.v = true; } }, location: { origin: ORIGEM } };
  const ctx = vm.createContext({ self, caches, fetch: req => rede(typeof req === "string" ? req : req.url), URL, console: { warn() {} }, Promise });
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8"), ctx, { filename: "sw.js" });
  const disparar = async tipo => { let p; ouvintes[tipo]({ waitUntil: x => { p = x; } }); await p; };
  const pedir = async (url, method = "GET") => { let p; ouvintes.fetch({ request: { url: new URL(url, ORIGEM + "/").href, method }, respondWith: x => { p = x; } }); return p; };
  return { lojas, disparar, pedir, pulou, assumiu, ctx };
}
const resp = (status, corpo) => ({ ok: status >= 200 && status < 300, status, corpo, clone() { return this; } });
const NOME = fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8").match(/PREFIXO \+ "(v\d+)"/)[1], ATUAL = "cda-" + NOME;

test("a instalação guarda todos os arquivos, incluindo o núcleo", async () => {
  const A = ambiente({ rede: async u => resp(200, "novo " + u) });
  await A.disparar("install");
  const m = A.lojas.get(ATUAL);
  ["/", "/index.html", "/nucleo.js", "/app.js", "/telas-guia.js", "/estela.js", "/estilo.css", "/dados/guia.js"].forEach(k => assert.ok(m.has(k), "faltou " + k));
  assert.equal(A.pulou.v, true);
  fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8").match(/<script src="([^"]+)"/g).map(s => "/" + s.slice(13, -1)).forEach(k => assert.ok(m.has(k), "script do index fora do cache: " + k));
});

test("se um arquivo falhar na instalação, a versão anterior continua valendo", async () => {
  const A = ambiente({ rede: async u => (u.endsWith("/app.js") ? resp(503, "") : resp(200, "novo")), cachesIniciais: { "cda-v7": { "/app.js": resp(200, "app antigo") } } });
  await assert.rejects(A.disparar("install"));
  assert.equal(A.pulou.v, false, "a versão nova não assume");
  assert.equal(A.lojas.get(ATUAL).size, 0, "nada pela metade no cache novo");
  assert.equal((await A.pedir("/app.js")).corpo, "app antigo");
});

test("a limpeza apaga só caches antigos deste app", async () => {
  const A = ambiente({ rede: async () => resp(200, "x"), cachesIniciais: { "cda-v6": {}, "cda-v7": {}, [ATUAL]: {}, "outro-app-v1": { "/a": resp(200, "a") }, "workbox-precache": {} } });
  await A.disparar("activate");
  assert.deepEqual(Array.from(A.lojas.keys()).sort(), [ATUAL, "outro-app-v1", "workbox-precache"].sort());
  assert.equal(A.assumiu.v, true);
});

test("resposta boa da rede é entregue e passa a ser a última versão válida", async () => {
  const A = ambiente({ rede: async () => resp(200, "versão nova"), cachesIniciais: { [ATUAL]: { "/app.js": resp(200, "versão antiga") } } });
  assert.equal((await A.pedir("/app.js")).corpo, "versão nova");
  await new Promise(r => setTimeout(r, 0));
  assert.equal(A.lojas.get(ATUAL).get("/app.js").corpo, "versão nova");
});

for (const status of [404, 500, 503]) {
  test(`rede respondendo ${status} mantém a última versão válida e não suja o cache`, async () => {
    const A = ambiente({ rede: async () => resp(status, "página de erro"), cachesIniciais: { [ATUAL]: { "/app.js": resp(200, "última versão boa"), "/": resp(200, "índice bom") } } });
    assert.equal((await A.pedir("/app.js")).corpo, "última versão boa");
    assert.equal((await A.pedir("/app.js?v=3")).corpo, "última versão boa", "ignora a query ao procurar");
    assert.equal((await A.pedir("/")).corpo, "índice bom");
    await new Promise(r => setTimeout(r, 0));
    assert.equal(A.lojas.get(ATUAL).get("/app.js").corpo, "última versão boa");
  });
}

test("sem rede, o app abre com o que está guardado", async () => {
  const A = ambiente({ rede: async () => { throw new TypeError("Failed to fetch"); }, cachesIniciais: { [ATUAL]: { "/index.html": resp(200, "índice guardado") } } });
  assert.equal((await A.pedir("/index.html")).corpo, "índice guardado");
  await assert.rejects(A.pedir("/nunca-visto.js"), /Failed to fetch/);
});

test("erro da rede sem cópia guardada é repassado como veio", async () => {
  const A = ambiente({ rede: async () => resp(404, "não existe") });
  assert.equal((await A.pedir("/nao-existe.js")).status, 404);
  assert.equal(A.lojas.get(ATUAL) ? A.lojas.get(ATUAL).size : 0, 0);
});

test("atualização a partir da versão anterior: instala, limpa a antiga e segue servindo offline", async () => {
  let online = true;
  const A = ambiente({ rede: async u => { if (!online) throw new TypeError("offline"); return resp(200, "v-nova " + new URL(u).pathname); }, cachesIniciais: { "cda-v7": { "/app.js": resp(200, "v-antiga") } } });
  await A.disparar("install"); await A.disparar("activate");
  assert.equal(A.lojas.has("cda-v7"), false);
  online = false;
  assert.equal((await A.pedir("/app.js")).corpo, "v-nova /app.js");
  assert.equal((await A.pedir("/nucleo.js")).corpo, "v-nova /nucleo.js");
});

test("a fotografia vem do cache primeiro e não bloqueia a abertura", async () => {
  let chamadas = 0;
  const A = ambiente({ rede: async () => { chamadas++; return resp(200, "foto da rede"); } });
  assert.equal((await A.pedir("/img/via-celular-780.webp")).corpo, "foto da rede");
  await new Promise(r => setTimeout(r, 0));
  assert.equal((await A.pedir("/img/via-celular-780.webp")).corpo, "foto da rede");
  assert.equal(chamadas, 1, "a segunda vez não vai à rede");
  const src = fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8");
  assert.doesNotMatch(src.match(/const ARQUIVOS = \[[\s\S]*?\];/)[0], /img\//, "a foto não entra na instalação: não atrasa a primeira abertura");
});

test("pedidos de outro site e que não são GET passam direto", async () => {
  const A = ambiente({ rede: async () => resp(200, "x") });
  assert.equal(await A.pedir("https://yuvkzqhjwnomuxsnoodr.supabase.co/rest/v1/direitos"), undefined);
  assert.equal(await A.pedir("/qualquer", "POST"), undefined);
});
