/* Estela: a guia do app. Uma estrela viva (núcleo branco-dourado, halo violeta suave, poucos filamentos),
   o encontro do primeiro acesso, a fala do dia e as dicas de cada aba.
   É uma personagem: conduz o caminho por texto, não adivinha nem promete resultado.
   Carrega antes de app.js; usa window.CDA na hora de renderizar. */
window.ESTELA = (function () {
  "use strict";
  const C = () => window.CDA;
  const NOME = "Estela";

  /* ---------- a estrela ----------
     Um relógio só para tudo: respiração de 9 s (escala varia no máximo 2%), filamentos girando em 27 s
     (mais lentos que o halo) e uma única subida suave de brilho quando chega uma fala nova.
     Com movimento reduzido fica parada. Fora da tela ou com o app em segundo plano, não desenha. */
  const orbe = (cls = "") => `<span class="orbe ${cls}" aria-hidden="true"><canvas></canvas></span>`;
  const TAU = Math.PI * 2, RESPIRO = 9, GIRO = 27, SUBIDA = 1.8;
  const FILAMENTOS = [{ a: 0.5, curva: 0.55, alcance: 0.8 }, { a: 2.7, curva: -0.5, alcance: 0.72 }, { a: 4.6, curva: 0.42, alcance: 0.76 }];
  function ponta4(x, R, r) { x.beginPath(); x.moveTo(0, -R); x.quadraticCurveTo(r, -r, R, 0); x.quadraticCurveTo(r, r, 0, R); x.quadraticCurveTo(-r, r, -R, 0); x.quadraticCurveTo(-r, -r, 0, -R); x.closePath(); }
  function desenhar(x, S, t, pulso) {
    const r = S / 2, b = 0.5 + 0.5 * Math.sin(TAU * t / RESPIRO), esc = 0.99 + 0.02 * b, luz = 1 + 0.3 * pulso;
    x.clearRect(0, 0, S, S); x.save(); x.translate(r, r);
    // halo violeta
    let g = x.createRadialGradient(0, 0, r * 0.1, 0, 0, r);
    g.addColorStop(0, `rgba(170,140,255,${Math.min(0.6, (0.34 + 0.07 * b) * luz)})`); g.addColorStop(0.5, `rgba(132,100,235,${Math.min(0.3, (0.14 + 0.03 * b) * luz)})`); g.addColorStop(1, "rgba(120,90,220,0)");
    x.fillStyle = g; x.beginPath(); x.arc(0, 0, r, 0, TAU); x.fill();
    x.scale(esc, esc); x.globalCompositeOperation = "lighter";
    // filamentos internos
    x.lineCap = "round"; x.lineWidth = Math.max(1, S * 0.012);
    FILAMENTOS.forEach((f, i) => {
      const a = f.a + TAU * t / GIRO * (i % 2 ? -1 : 1), R = r * f.alcance, ex = Math.cos(a) * R, ey = Math.sin(a) * R;
      const cx = Math.cos(a + f.curva) * R * 0.6, cy = Math.sin(a + f.curva) * R * 0.6, gr = x.createLinearGradient(0, 0, ex, ey);
      gr.addColorStop(0, `rgba(255,244,215,${0.55 * luz})`); gr.addColorStop(1, "rgba(200,170,255,0)");
      x.strokeStyle = gr; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(cx, cy, ex, ey); x.stroke();
    });
    // corpo de quatro pontas
    g = x.createRadialGradient(0, 0, 0, 0, 0, r * 0.7); g.addColorStop(0, `rgba(255,244,215,${Math.min(1, 0.95 * luz)})`); g.addColorStop(0.45, "rgba(255,224,160,.5)"); g.addColorStop(1, "rgba(255,224,160,0)");
    x.fillStyle = g; ponta4(x, r * 0.78, r * 0.02); x.fill();
    // núcleo
    x.globalCompositeOperation = "source-over";
    g = x.createRadialGradient(0, 0, 0, 0, 0, r * 0.26); g.addColorStop(0, "#FFFFFF"); g.addColorStop(0.45, "#FFF4D7"); g.addColorStop(1, "rgba(255,244,215,0)");
    x.fillStyle = g; x.beginPath(); x.arc(0, 0, r * 0.26, 0, TAU); x.fill();
    x.restore();
  }
  let quadro = 0, itens = [], olheiro = null, ligado = false;
  const reduzido = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  function passo(agora) {
    quadro = 0; itens = itens.filter(i => i.cv.isConnected); if (!itens.length || document.hidden) return;
    const t = agora / 1000;
    itens.forEach(i => { if (!i.visivel) return; if (agora - i.ultimo < 40) return; i.ultimo = agora;
      const k = i.fala ? Math.max(0, 1 - (agora - i.nasceu) / (SUBIDA * 1000)) : 0; desenhar(i.x, i.S, t, Math.sin(k * Math.PI) ); });
    if (itens.some(i => i.visivel)) quadro = requestAnimationFrame(passo);
  }
  const retomar = () => { if (!quadro && !reduzido() && !document.hidden && itens.some(i => i.visivel)) quadro = requestAnimationFrame(passo); };
  function animar() {
    cancelAnimationFrame(quadro); quadro = 0; if (olheiro) olheiro.disconnect();
    const agora = performance.now();
    itens = Array.from(document.querySelectorAll(".orbe canvas")).map(cv => {
      const lado = cv.parentElement.clientWidth || 44, dens = Math.max(2, Math.min(3, window.devicePixelRatio || 1)), S = Math.round(lado * dens);
      if (cv.width !== S) cv.width = cv.height = S;
      return { cv, x: cv.getContext("2d"), S, fala: cv.parentElement.classList.contains("falando"), nasceu: agora, ultimo: 0, visivel: true };
    });
    if (!itens.length) return;
    if (reduzido()) { itens.forEach(i => desenhar(i.x, i.S, RESPIRO / 4, 0)); return; }     // parada, no ponto médio da respiração
    if ("IntersectionObserver" in window) {
      olheiro = new IntersectionObserver(es => { es.forEach(en => { const i = itens.find(q => q.cv === en.target); if (i) i.visivel = en.isIntersecting; }); retomar(); });
      itens.forEach(i => olheiro.observe(i.cv));
    }
    if (!ligado) { ligado = true; document.addEventListener("visibilitychange", () => { if (document.hidden) { cancelAnimationFrame(quadro); quadro = 0; } else retomar(); }); }
    itens.forEach(i => desenhar(i.x, i.S, agora / 1000, 0));
    retomar();
  }
  // balão de fala: estrela compacta + texto; `extra` é HTML já seguro (botões)
  function fala(textos, extra = "", cls = "") {
    const e = C().esc, ps = [].concat(textos).filter(Boolean).map(t => `<p>${e(t)}</p>`).join("");
    return `<div class="fala ${cls}">${orbe("p falando")}<div class="balao"><div class="quem">${NOME}</div>${ps}${extra}</div></div>`;
  }

  /* ---------- primeiro acesso: uma tela, e direto para a primeira prática ---------- */
  function encontro(M) {
    const c = C(), e = c.esc, foco = (COMBOS.FOCO[c.S.foco] || {}).nome;
    return `<section class="pagina encontro">
      ${orbe("g falando")}
      <h1 class="center">Prazer, ${e(c.primeiroNome())}. Eu sou a ${NOME}.</h1>
      <div class="tour-texto">
        <p>Vou caminhar com você por sete estrelas${foco ? `, começando pelo que você busca agora: ${e(foco.toLowerCase())}` : ""}.</p>
        <p>A primeira começa já, com um ritual de três minutos.</p>
      </div>
      <div class="tour-acoes"><button class="btn primario" id="enc-ok">Começar minha primeira prática ✦</button>
        <button class="btn fantasma pequeno" id="enc-depois" style="width:100%;margin-top:10px">Conhecer o app primeiro</button></div>
      <p class="aviso center" style="margin-top:14px">Seu mapa já está pronto e fica na aba Mapa. Destino ${M.destino}.</p>
    </section>`;
  }
  function ligarEncontro() {
    const c = C(), $ = c.$;
    $("#enc-ok").onclick = () => c.ir("guia", "ritual");
    $("#enc-depois").onclick = () => { c.S.tour = true; c.S.apresentacao = "oferecer"; c.salvar(); c.ir("hoje"); };
    animar();
  }

  /* ---------- apresentação completa: opcional, aberta pelo Perfil ou pelo cartão de Hoje ---------- */
  let passoTour = 0, vendo = false;
  const ABAS = [["☼", "Hoje", "o que fazer agora: a prática, a carta e o fechamento do dia"], ["✦", "Mapa", "quem você é pelos números do nome e da data"], ["✧", "Caminho", "as sete estrelas, seus registros e os apoios"], ["☾", "Ciclos", "a Lua, o calendário, o mês e o ano"], ["◈", "Clube", "o plano, seus benefícios e as leituras avulsas"]];
  function passos(M) {
    const c = C(), e = c.esc, nome = c.primeiroNome(), sig = NUM.SIGNIFICADOS[M.destino], sef = KABALA.sefiraDe(M.destino);
    return [
      { titulo: `Prazer, ${nome}. Eu sou a ${NOME}.`,
        textos: ["Sou a guia deste caminho.", "Não sou vidente e não prometo milagre. Meu trabalho é mostrar, a cada dia, o próximo passo."] },
      { titulo: "Li o seu mapa.",
        textos: ["Seu nome e sua data de nascimento formam um desenho que é só seu. O centro dele é o número de destino."],
        html: `<div class="card neon tour-card"><div class="num-hero"><div class="anel"><div class="num-grande" style="font-size:56px;min-width:0">${M.destino}</div></div><div><h2>${e(sig.nome)}</h2><p class="sub" style="margin:4px 0 0">Sefirá <b>${e(sef.nome)}</b> · ${e(sef.pt)}</p></div></div><p class="aviso" style="margin:12px 0 0">A leitura completa fica na aba Mapa.</p></div>` },
      { titulo: "O caminho tem sete estrelas.",
        textos: ["Cada estrela tem práticas curtas e um marco. Quando você cumpre os dois, ela acende e a próxima abre."],
        html: `<div class="card tour-card"><div class="tour-etapas">${GUIA.ETAPAS.map(x => `<div><b>${x.n}</b><span>${e(x.nome)}</span><small>${e(x.principio)}</small></div>`).join("")}</div></div>` },
      { titulo: "Seu dia aqui tem três momentos.",
        textos: ["São poucos minutos. Eu aviso qual é o próximo."],
        html: `<div class="card tour-card"><ul class="lista">
          <li><span class="ic">1</span><span><b>Receber.</b> Sua carta e a orientação do dia.</span></li>
          <li><span class="ic">2</span><span><b>Praticar.</b> A prática da sua estrela, com passo a passo.</span></li>
          <li><span class="ic">3</span><span><b>Fechar.</b> A frase da noite e os sinais que você percebeu.</span></li></ul></div>` },
      { titulo: "Onde fica cada coisa.",
        textos: ["São cinco abas, aqui embaixo. Seu perfil e o backup ficam no botão com a sua inicial, no alto."],
        html: `<div class="card tour-card"><ul class="lista">${ABAS.map(a => `<li><span class="ic">${a[0]}</span><span><b>${a[1]}:</b> ${a[2]}.</span></li>`).join("")}</ul></div>`, fim: true }
    ];
  }
  function tour(M) {
    const c = C(), P = passos(M); passoTour = Math.max(0, Math.min(passoTour, P.length - 1)); const p = P[passoTour];
    return `<section class="pagina tour">
      <div class="tour-topo"><div class="tour-pontos" aria-label="Passo ${passoTour + 1} de ${P.length}">${P.map((_, i) => `<i class="${i === passoTour ? "on" : i < passoTour ? "ok" : ""}"></i>`).join("")}</div><button class="tour-pular" id="tour-pular">Fechar</button></div>
      ${orbe("g falando")}
      <h1 class="center">${c.esc(p.titulo)}</h1>
      <div class="tour-texto">${p.textos.map(t => `<p>${c.esc(t)}</p>`).join("")}</div>
      ${p.html || ""}
      <div class="tour-acoes"><button class="btn primario" id="tour-ok">${p.fim ? "Voltar ao app ✦" : "Continuar"}</button>
        ${passoTour > 0 ? `<button class="btn fantasma pequeno" id="tour-volta" style="width:100%;margin-top:10px">‹ Voltar</button>` : ""}</div>
    </section>`;
  }
  function ligarTour() {
    const c = C(), $ = c.$, n = passos(c.mapa(c.S.perfil)).length;
    const fim = () => { vendo = false; passoTour = 0; c.ir("hoje"); };
    $("#tour-ok").onclick = () => { if (passoTour >= n - 1) return fim(); passoTour++; c.render(); window.scrollTo({ top: 0 }); };
    const vo = $("#tour-volta"); if (vo) vo.onclick = () => { passoTour--; c.render(); window.scrollTo({ top: 0 }); };
    $("#tour-pular").onclick = fim;
    animar();
  }
  function rever() { const c = C(); passoTour = 0; vendo = true; c.render(); window.scrollTo({ top: 0 }); }
  const revendo = () => vendo;

  /* ---------- a fala do dia, na tela Hoje: uma ou duas frases e uma ação ---------- */
  function falaHoje(estado) {
    const c = C(), e = c.esc, GA = window.GUIA_APP, G = GA.estadoHoje(), seq = c.sequencia(), noite = new Date().getHours() >= 18;
    const bt = (rotulo, attrs) => `<button class="btn primario pequeno" ${attrs}>${e(rotulo)} ›</button>`;
    const ret = GA.retornoHTML("hoje"); if (ret) return fala([], ret);
    const eco = GA.ecoRetorno(), des = GA.intencao(), curta = des.length > 70 ? des.slice(0, 69).trimEnd() + "…" : des;
    if (G.concluida) { if (!estado.noite) return fala("As sete estrelas estão acesas. Hoje você escolhe: aprofundar esta intenção ou começar outra.", bt("Ver meu caminho", 'data-ir="guia"')); }
    else if (!G.liberada) { if (!estado.carta) return fala(`Você acendeu três estrelas. A carta de hoje está esperando, e a estrela ${G.et.n} continua no plano Completo.`, estado.momento === "receber" ? "" : bt("Ir para a carta", 'data-momento="receber"')); }
    else if (!G.feita) {
      const abrir = `data-ir="guia" data-sub='"${G.sub}"'`;
      if (G.id === "ritual1") return fala([eco, "Sua primeira estrela começa com um ritual de três minutos. Eu conduzo você."], bt("Começar o ritual", abrir));
      return fala([eco, des ? `Sua intenção: “${curta}”. Hoje a prática é ${G.tecnica.nome}, ${G.tecnica.min} minutos.` : `Hoje a prática é ${G.tecnica.nome}, ${G.tecnica.min} minutos, com passo a passo.`], bt("Fazer a prática de hoje", abrir));
    }
    else if (G.pronta) return fala(`Tudo cumprido em “${G.et.nome}”. Falta só acender a estrela.`, bt("Acender a estrela " + G.et.n, `data-ir="guia" data-sub='"e-${G.et.n}"'`));
    if (!estado.carta) return fala([eco, `Prática feita: ${G.concluida ? "" : G.dias + " de 3 na estrela " + G.et.n + ". "}Agora vire a sua carta de hoje.`], estado.momento === "receber" ? "" : bt("Ir para a carta", 'data-momento="receber"'));
    if (!estado.nivel) return fala("Me conta como você está agora. Leva dez segundos.", estado.momento === "praticar" ? "" : bt("Fazer o check-in", 'data-momento="praticar"'));
    if (!estado.noite) return noite ? fala("Falta só fechar o dia, com a sua frase da noite.", estado.momento === "fechar" ? "" : bt("Fechar o dia", 'data-momento="fechar"'))
      : fala("A parte de hoje está feita. Volte à noite para fechar o dia.");
    return fala(`Dia completo. ${seq > 1 ? seq + " dias de presença. " : ""}Amanhã eu pergunto como foi.`);
  }

  /* ---------- dica da primeira visita a cada aba ---------- */
  const DICAS = {
    mapa: "Aqui está quem você é pelos números. Leia sem pressa: você volta a este mapa na segunda estrela.",
    ceu: "A Lua dá o ritmo: quando começar, quando agir, quando soltar. Seu mês e seu ano também ficam aqui.",
    portais: "Aqui está o plano, o que ele abre e as leituras avulsas. O que você já tem aparece primeiro."
  };
  function dica(aba) {
    const S = C().S; if (!DICAS[aba] || (S.dicas || {})[aba]) return "";
    return fala(DICAS[aba], `<button class="btn fantasma pequeno" data-dica="${aba}">Entendi</button>`, "dica");
  }
  function ligar() {
    const c = C();
    document.querySelectorAll("#app [data-dica]").forEach(b => b.onclick = () => { c.S.dicas = c.S.dicas || {}; c.S.dicas[b.dataset.dica] = true; c.salvar(); const f = b.closest(".fala"); if (f) { f.classList.add("some"); setTimeout(() => f.remove(), 260); } });
    const rv = c.$("#rever-tour"); if (rv) rv.onclick = rever;
    animar();
  }

  return { NOME, orbe, fala, encontro, ligarEncontro, tour, ligarTour, falaHoje, dica, ligar, rever, revendo, animar };
})();
