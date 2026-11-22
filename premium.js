/* Portais: catálogo de módulos pagos, desbloqueio por código e componente de bloqueio.
   Carrega antes de app.js; usa window.CDA só na hora da chamada. */
window.CDA_EXT = window.CDA_EXT || { telas: {}, eventos: [] };
window.PREMIUM = (function () {
  "use strict";

  // SHA-256 síncrono (funciona também fora de https)
  function sha256(txt) {
    const K = [], H = []; let n = 0, primo = 2;
    const frac = x => ((x - Math.floor(x)) * 4294967296) | 0;
    while (n < 64) { let ehPrimo = true; for (let i = 2; i * i <= primo; i++) if (primo % i === 0) { ehPrimo = false; break; } if (ehPrimo) { if (n < 8) H[n] = frac(Math.pow(primo, 1 / 2)); K[n++] = frac(Math.pow(primo, 1 / 3)); } primo++; }
    const bytes = unescape(encodeURIComponent(txt)).split("").map(c => c.charCodeAt(0));
    const bits = bytes.length * 8; bytes.push(0x80); while (bytes.length % 64 !== 56) bytes.push(0);
    for (let i = 7; i >= 0; i--) bytes.push(i > 3 ? 0 : (bits >>> (i * 8)) & 255);
    const h = H.slice(), r = (x, k) => (x >>> k) | (x << (32 - k));
    for (let o = 0; o < bytes.length; o += 64) {
      const w = []; for (let i = 0; i < 16; i++) w[i] = (bytes[o + i * 4] << 24) | (bytes[o + i * 4 + 1] << 16) | (bytes[o + i * 4 + 2] << 8) | bytes[o + i * 4 + 3];
      for (let i = 16; i < 64; i++) { const s0 = r(w[i - 15], 7) ^ r(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = r(w[i - 2], 17) ^ r(w[i - 2], 19) ^ (w[i - 2] >>> 10); w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0; }
      let [a, b, c, d, e, f, g, hh] = h;
      for (let i = 0; i < 64; i++) {
        const t1 = (hh + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0, t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      [a, b, c, d, e, f, g, hh].forEach((v, i) => { h[i] = (h[i] + v) | 0; });
    }
    return h.map(v => (v >>> 0).toString(16).padStart(8, "0")).join("");
  }

  /* Catálogo. Para cada portal: cole o link do checkout em `checkout` e troque o `hash`
     pelo SHA-256 do seu código (use dono/gerador-de-codigos.html). O código em si nunca fica aqui. */
  const CATALOGO = [
    { id: "profundo", icone: "◈", nome: "Mapa Profundo", preco: "R$ 27", chamada: "Sua linha da vida inteira, não só o número de destino.",
      beneficios: ["Seus 4 momentos decisivos e 3 ciclos de vida, com as idades", "Seus desafios e como atravessá-los", "Lições cármicas, tendências ocultas e o triângulo da vida", "Leitura combinada dos seus números e mapa em PDF"],
      checkout: "", hash: "ab5e6bfd2e39988c8e5ffbd6648d761c990df362c9e832a597eabeaa7d01ab0f" },
    { id: "ano", icone: "✶", nome: "Previsão 2027", preco: "R$ 19", chamada: "Seu ano mês a mês, com os dias de ouro já marcados.",
      beneficios: ["Seu ano pessoal de 2027 explicado", "Os 12 meses com palavra, foco de dinheiro e dias de ouro", "Momento decisivo e ciclo em vigor no ano", "Relatório para imprimir e guardar"],
      checkout: "", hash: "c869a73d23650f1cac5b8be4198b8082ff98073706c480cb587ddeb21c3944d5" },
    { id: "lua", icone: "☾", nome: "Lua e Ascendente", preco: "R$ 17", chamada: "Seu Sol é só um terço da história.",
      beneficios: ["Seu signo lunar: como você sente e lida com segurança", "Seu ascendente: como você age e é vista", "O trio Sol, Lua e Ascendente lido para dinheiro e emoção", "Aviso quando a Lua do dia passa pelo seu signo"],
      checkout: "", hash: "517f2b8ee6c1f5f3de2bdf96cef235ff32513d953e26f6f677b4d7a8290de507" },
    { id: "amor", icone: "♡", nome: "Amor e Vínculos", preco: "R$ 17", chamada: "Compare seu mapa com quem você quiser.",
      beneficios: ["Pessoas ilimitadas na compatibilidade", "Relatório a dois: forças, atritos e combinados", "Melhores dias do mês para os dois conversarem e decidirem"],
      checkout: "", hash: "3e1ca471e0f309deee80402fe2fc8bef6b432bde9f0aa091dfe54bf3a368b413" },
    { id: "nome", icone: "✎", nome: "Nome de Poder", preco: "R$ 17", chamada: "O nome que você assina também vibra.",
      beneficios: ["Análise da sua assinatura e do nome social", "Nome do negócio ou da marca: qual vibra melhor para vender", "Nome de bebê: compare opções lado a lado", "Sugestões de ajuste para chegar ao número desejado"],
      checkout: "", hash: "a33db6b13d7fdf70a56d01edb2a07bbefe862c9f1c416a99bf0e8839da11e036" },
    { id: "clube", icone: "✦", nome: "Clube das Estrelas", preco: "R$ 9,90 por mês", chamada: "Tudo o que renova a cada mês e a cada lua.", mensal: true,
      beneficios: ["Previsão completa de cada mês, liberada no dia 1", "Ciclos da Lua com os quatro encontros", "Ver a orientação de amanhã agora", "Segunda carta do dia"],
      checkout: "", hash: "" }
  ];
  const porId = id => CATALOGO.find(p => p.id === id);
  const ym = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  // código mensal do Clube: derivado do segredo e do mês, sem precisar republicar o app
  function codigoClube(mes, segredo) { return "CLUBE-" + sha256(segredo + "|" + mes).slice(0, 6).toUpperCase(); }

  function liberado(id) {
    const C = window.CDA; if (!C || !C.S) return false;
    if (window.CONTA && CONTA.direito(id)) return true;        // comprado e confirmado pelo servidor
    const S = C.S, v = (S.portais || {})[id];
    if (id === "clube") {
      if (v === ym()) return true;
      const dias = (Date.now() - new Date(S.criadoEm || Date.now()).getTime()) / 86400000;
      return dias < (C.CONFIG.diasDegustacao || 7);            // degustação nos primeiros dias
    }
    return v === true;
  }
  function degustando() { const C = window.CDA; return !!C && C.S.portais.clube !== ym() && !(window.CONTA && CONTA.direito("clube")) && liberado("clube"); }

  function validar(id, codigo) {
    const C = window.CDA, p = porId(id), cod = (codigo || "").trim().toUpperCase(); if (!p || !cod) return false;
    let ok = false;
    if (id === "clube") {
      const seg = C.CONFIG.segredoClube || "", ant = new Date(); ant.setDate(0);
      ok = cod === codigoClube(ym(), seg) || (new Date().getDate() <= 5 && cod === codigoClube(ym(ant), seg));
      if (ok) C.S.portais.clube = ym();
    } else {
      const hashes = [p.hash].concat((C.CONFIG.hashes || {})[id] || []).filter(Boolean);
      ok = hashes.includes(sha256(cod)) || (C.CONFIG.codigoMestreHash && sha256(cod) === C.CONFIG.codigoMestreHash);
      if (ok) C.S.portais[id] = true;
    }
    if (ok) C.salvar();
    return ok;
  }

  // bloco bloqueado: prévia real borrada + chamada
  function cadeado(id, previaHtml, texto) {
    const p = porId(id), e = window.CDA.esc;
    return `<div class="portal-lock" data-portal="${id}" role="button" tabindex="0">
      <div class="previa borrado" aria-hidden="true">${previaHtml}</div>
      <div class="chamada"><span class="selo-lock">${p.icone}</span><b>${e(p.nome)}</b><span>${e(texto || p.chamada)}</span><span class="btn primario pequeno">Liberar · ${e(p.preco)}</span></div>
    </div>`;
  }

  // folha inferior estilo iOS
  function abrir(id) {
    const C = window.CDA, p = porId(id), e = C.esc; if (!p) return;
    fechar();
    const el = document.createElement("div"); el.className = "folha-fundo"; el.id = "folha";
    el.innerHTML = `<div class="folha" role="dialog" aria-label="${e(p.nome)}">
      <div class="pega"></div>
      <div class="folha-ic">${p.icone}</div>
      <h2 class="center">${e(p.nome)}</h2>
      <p class="sub center" style="margin:6px 0 14px">${e(p.chamada)}</p>
      <ul class="lista">${p.beneficios.map(b => `<li><span class="ic">✦</span><span>${e(b)}</span></li>`).join("")}</ul>
      <div class="preco center"><b>${e(p.preco)}</b>${p.mensal ? "" : "<small>pagamento único</small>"}</div>
      <button class="btn primario" id="folha-comprar">Quero liberar ✦</button>
      <div class="sep"></div>
      <label>Já tenho o código</label>
      <div style="display:flex;gap:8px"><input id="folha-cod" autocomplete="off" placeholder="${p.mensal ? "CLUBE-XXXXXX" : "SEU-CÓDIGO"}"><button class="btn neon pequeno" id="folha-ok" style="flex:0 0 auto">Liberar</button></div>
      <p class="aviso center" style="margin:12px 0 0">O código chega no e-mail da compra e libera este aparelho.</p>
      <button class="btn fantasma pequeno" id="folha-conta" style="width:100%;margin-top:10px">Comprei com meu e-mail: entrar na conta</button>
    </div>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add("on"));
    el.addEventListener("click", ev => { if (ev.target === el) fechar(); });
    el.querySelector("#folha-comprar").onclick = () => { const link = p.checkout || (C.CONFIG.checkouts || {})[id]; if (link) window.open(link, "_blank", "noopener"); else C.toast("Link de compra ainda não configurado."); };
    const tentar = () => {
      if (validar(id, el.querySelector("#folha-cod").value)) { fechar(); C.celebrar(); C.toast(`${p.nome} liberado ✦`); setTimeout(() => C.render(true), 500); }
      else C.toast("Código não reconhecido. Confira o e-mail da compra.");
    };
    el.querySelector("#folha-conta").onclick = () => { fechar(); C.ir("eu"); };
    el.querySelector("#folha-ok").onclick = tentar;
    el.querySelector("#folha-cod").onkeydown = ev => { if (ev.key === "Enter") tentar(); };
  }
  function fechar() { const f = document.getElementById("folha"); if (f) { f.classList.remove("on"); setTimeout(() => f.remove(), 250); } }

  // liga cliques em qualquer bloco [data-portal]
  window.CDA_EXT.eventos.push(() => {
    document.querySelectorAll("#app [data-portal]").forEach(b => {
      const go = () => abrir(b.dataset.portal);
      b.addEventListener("click", ev => { ev.stopPropagation(); go(); });
      b.addEventListener("keydown", ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); go(); } });
    });
  });

  return { CATALOGO, porId, liberado, degustando, validar, cadeado, abrir, fechar, sha256, codigoClube, ym };
})();
