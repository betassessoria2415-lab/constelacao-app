/* Estela: a voz do app. Orbe de luz, apresentação do primeiro acesso, fala do dia e dicas de cada aba.
   É uma personagem: organiza o caminho, não adivinha nem promete resultado.
   Carrega antes de app.js; usa window.CDA na hora de renderizar. */
window.ESTELA = (function () {
  "use strict";
  const C = () => window.CDA;
  const NOME = "Estela";

  /* ---------- o orbe ---------- */
  const orbe = (cls = "") => `<span class="orbe ${cls}" aria-hidden="true"><canvas></canvas></span>`;
  // desenho em canvas, na resolução da tela: fitas de luz dentro de uma esfera de vidro
  const TAU = Math.PI * 2;
  const FITAS = [{ cor: "155,92,255", ang: 0.2, giro: 0.11, amp: 0.46, k: 1.1, w: 1.3, fase: 0 }, { cor: "255,122,217", ang: 2.2, giro: -0.08, amp: 0.4, k: 1.5, w: 1.7, fase: 1.9 },
    { cor: "246,223,166", ang: 4.1, giro: 0.06, amp: 0.3, k: 1.9, w: 2.1, fase: 3.3 }, { cor: "110,170,255", ang: 1.1, giro: -0.14, amp: 0.34, k: 1.3, w: 1.1, fase: 5.1 }];
  function desenhar(x, S, t, fala) {
    const r = S / 2, vel = fala ? 1.9 : 1, forca = fala ? 1.18 + 0.1 * Math.sin(t * 7) : 1;
    x.clearRect(0, 0, S, S); x.save(); x.beginPath(); x.arc(r, r, r, 0, TAU); x.clip();
    let g = x.createRadialGradient(r, r * 1.15, r * 0.05, r, r, r); g.addColorStop(0, "#43208c"); g.addColorStop(0.55, "#1b0b40"); g.addColorStop(1, "#070312"); x.fillStyle = g; x.fillRect(0, 0, S, S);
    x.globalCompositeOperation = "lighter";
    FITAS.forEach((f, i) => {
      const amp = r * f.amp * forca * (0.78 + 0.22 * Math.sin(t * 0.9 * vel + i * 1.7)), N = 56, cima = [];
      x.save(); x.translate(r, r); x.rotate(f.ang + t * f.giro * vel + Math.sin(t * 0.4 + i) * 0.35);
      const gr = x.createLinearGradient(-r, 0, r, 0); gr.addColorStop(0, `rgba(${f.cor},0)`); gr.addColorStop(0.5, `rgba(${f.cor},.78)`); gr.addColorStop(1, `rgba(${f.cor},0)`);
      x.fillStyle = gr; x.beginPath();
      for (let j = 0; j <= N; j++) { const px = -r + 2 * r * j / N, env = Math.pow(Math.cos(Math.PI * px / (2 * r)), 2), py = amp * env * Math.sin(f.k * Math.PI * px / r + t * f.w * vel + f.fase); cima.push([px, py]); j ? x.lineTo(px, py) : x.moveTo(px, py); }
      for (let j = N; j >= 0; j--) { const px = -r + 2 * r * j / N, env = Math.pow(Math.cos(Math.PI * px / (2 * r)), 2); x.lineTo(px, -amp * 0.55 * env * Math.sin(f.k * Math.PI * px / r + t * f.w * 0.8 * vel + f.fase + 1.3)); }
      x.closePath(); x.fill();
      const fio = x.createLinearGradient(-r, 0, r, 0); fio.addColorStop(0, "rgba(255,255,255,0)"); fio.addColorStop(0.5, "rgba(255,255,255,.7)"); fio.addColorStop(1, "rgba(255,255,255,0)");
      x.strokeStyle = fio; x.lineWidth = Math.max(1, S * 0.007); x.beginPath(); cima.forEach((p, j) => (j ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.stroke();
      x.restore();
    });
    const rn = r * (0.3 + 0.05 * Math.sin(t * 2.2 * vel)) * forca; g = x.createRadialGradient(r, r, 0, r, r, rn); g.addColorStop(0, "rgba(255,246,224,.95)"); g.addColorStop(0.35, "rgba(246,223,166,.4)"); g.addColorStop(1, "rgba(246,223,166,0)"); x.fillStyle = g; x.fillRect(0, 0, S, S);
    for (let k = 0; k < 12; k++) { const a = k * 2.399 + t * (0.18 + 0.025 * k) * vel, d = r * (0.28 + 0.58 * ((k * 37 % 10) / 10)), al = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.6 + k * 1.3));
      x.fillStyle = `rgba(255,255,255,${al})`; x.beginPath(); x.arc(r + Math.cos(a) * d, r + Math.sin(a) * d * 0.9, Math.max(0.6, S * (0.005 + 0.004 * (k % 3))), 0, TAU); x.fill(); }
    x.globalCompositeOperation = "source-over";
    g = x.createRadialGradient(r, r, r * 0.5, r, r, r); g.addColorStop(0, "rgba(8,2,24,0)"); g.addColorStop(0.82, "rgba(8,2,24,.3)"); g.addColorStop(1, "rgba(8,2,24,.82)"); x.fillStyle = g; x.fillRect(0, 0, S, S);
    x.save(); x.translate(r * 0.64, r * 0.44); x.rotate(-0.62); x.scale(1, 0.5); g = x.createRadialGradient(0, 0, 0, 0, 0, r * 0.46); g.addColorStop(0, "rgba(255,255,255,.85)"); g.addColorStop(0.5, "rgba(255,255,255,.22)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.beginPath(); x.arc(0, 0, r * 0.46, 0, TAU); x.fill(); x.restore();
    x.strokeStyle = "rgba(255,255,255,.22)"; x.lineWidth = Math.max(1, S * 0.014); x.lineCap = "round"; x.beginPath(); x.arc(r, r, r * 0.86, Math.PI * 0.2, Math.PI * 0.62); x.stroke();
    const lw = Math.max(1, S * 0.012), aro = x.createLinearGradient(0, 0, S, S); aro.addColorStop(0, "rgba(255,255,255,.85)"); aro.addColorStop(0.45, "rgba(176,124,255,.35)"); aro.addColorStop(1, "rgba(246,223,166,.7)");
    x.strokeStyle = aro; x.lineWidth = lw; x.beginPath(); x.arc(r, r, r - lw / 2, 0, TAU); x.stroke();
    x.restore();
  }
  let quadro = 0;
  function animar() {
    cancelAnimationFrame(quadro);
    const parado = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const itens = Array.from(document.querySelectorAll(".orbe canvas")).map(cv => {
      const lado = cv.parentElement.clientWidth || 44, esc = Math.max(2, Math.min(3, window.devicePixelRatio || 1)), S = Math.round(lado * esc);
      if (cv.width !== S) cv.width = cv.height = S;
      return { cv, x: cv.getContext("2d"), S, fala: cv.parentElement.classList.contains("falando") };
    });
    if (!itens.length) return;
    (function passo(agora) {
      const vivos = itens.filter(i => i.cv.isConnected); if (!vivos.length) return;
      vivos.forEach(i => desenhar(i.x, i.S, agora / 1000, i.fala));
      if (!parado) quadro = requestAnimationFrame(passo);
    })(performance.now());
  }
  // balão de fala: orbe pequeno + texto; `extra` é HTML já seguro (botões)
  function fala(textos, extra = "", cls = "") {
    const e = C().esc, ps = [].concat(textos).map((t, i) => `<p style="animation-delay:${i * 0.18}s">${e(t)}</p>`).join("");
    return `<div class="fala ${cls}">${orbe("p falando")}<div class="balao"><div class="quem">${NOME}</div>${ps}${extra}</div></div>`;
  }

  /* ---------- apresentação do primeiro acesso ---------- */
  let passo = 0;
  const ABAS = [["☼", "Hoje", "sua carta, a prática do dia e o fechamento da noite"], ["✦", "Mapa", "quem você é pelos números do nome e da data"], ["➶", "Guia", "a trajetória em sete etapas, do desejo à manifestação"], ["☾", "Céu", "a Lua, o calendário e o ritmo do mês"], ["◈", "Portais", "as leituras que aprofundam o seu mapa"]];
  function passos(M) {
    const c = C(), e = c.esc, nome = c.primeiroNome(), sig = NUM.SIGNIFICADOS[M.destino], sef = KABALA.sefiraDe(M.destino);
    const desejo = ((c.S.trajeto || {}).campos || {}).desejo || "";
    return [
      { titulo: `Prazer, ${nome}. Eu sou a ${NOME}.`,
        textos: ["Sou a voz que vai te guiar por aqui.", "Não sou vidente e não prometo milagre. Meu trabalho é outro: te mostrar, todo dia, o que fazer. Chega de ouvir só “é só mentalizar”."],
        botao: "Continuar" },
      { titulo: "Acabei de ler o seu mapa.",
        textos: ["Seu nome e sua data de nascimento formam um desenho que é só seu. O centro dele é o número de destino."],
        html: `<div class="card neon tour-card"><div class="num-hero"><div class="anel"><div class="num-grande" style="font-size:56px;min-width:0">${M.destino}</div></div><div><h2>${e(sig.nome)}</h2><p class="sub" style="margin:4px 0 0">Sefirá <b>${e(sef.nome)}</b> · ${e(sef.pt)}</p></div></div><p class="aviso" style="margin:12px 0 0">A leitura completa fica na aba Mapa. Você vai usá-la na trajetória.</p></div>`,
        botao: "Continuar" },
      { titulo: "Seu dia aqui tem três momentos.",
        textos: ["São poucos minutos, sempre na mesma ordem. Eu aviso qual é o próximo."],
        html: `<div class="card tour-card"><ul class="lista">
          <li><span class="ic">1</span><span><b>Receber.</b> Sua carta e a orientação do dia. Dois minutos.</span></li>
          <li><span class="ic">2</span><span><b>Praticar.</b> Uma técnica com passo a passo, de um autor de verdade. Cinco a dez minutos.</span></li>
          <li><span class="ic">3</span><span><b>Fechar o dia.</b> Sua frequência da noite e os sinais que você percebeu. Dois minutos.</span></li></ul></div>`,
        botao: "Continuar" },
      { titulo: "E os dias andam numa direção.",
        textos: ["São sete etapas, uma para cada princípio hermético. Cada uma tem práticas e um marco. A seguinte só abre quando você cumpre a atual."],
        html: `<div class="card tour-card"><div class="tour-etapas">${GUIA.ETAPAS.map(x => `<div><b>${x.n}</b><span>${e(x.fase)}</span><small>${e(x.principio)}</small></div>`).join("")}</div></div>`,
        botao: "Continuar" },
      { titulo: "Onde fica cada coisa.",
        textos: ["São cinco abas, aqui embaixo. Na primeira vez que você abrir cada uma, eu explico."],
        html: `<div class="card tour-card"><ul class="lista">${ABAS.map(a => `<li><span class="ic">${a[0]}</span><span><b>${a[1]}:</b> ${a[2]}.</span></li>`).join("")}</ul></div>`,
        botao: "Continuar" },
      { titulo: "Antes de começar: o que você quer manifestar primeiro?",
        textos: ["Pode ser simples. Na etapa 1 eu te ajudo a deixar isso preciso."],
        html: `<div class="card neon tour-card"><div class="campo" style="margin:0"><label>O que eu desejo</label><textarea id="tour-desejo" style="min-height:84px" maxlength="240" placeholder="Ex.: uma renda extra de R$ 1.500 por mês com meus doces">${e(desejo)}</textarea></div></div>`,
        botao: "Começar meu primeiro dia ✦", fim: true }
    ];
  }
  function tour(M) {
    const c = C(), P = passos(M); passo = Math.max(0, Math.min(passo, P.length - 1)); const p = P[passo];
    return `<section class="pagina tour">
      <div class="tour-topo"><div class="tour-pontos">${P.map((_, i) => `<i class="${i === passo ? "on" : i < passo ? "ok" : ""}"></i>`).join("")}</div>${p.fim ? "" : `<button class="tour-pular" id="tour-pular">Pular</button>`}</div>
      ${orbe("g falando")}
      <h1 class="center">${c.esc(p.titulo)}</h1>
      <div class="tour-texto">${p.textos.map((t, i) => `<p style="animation-delay:${0.15 + i * 0.25}s">${c.esc(t)}</p>`).join("")}</div>
      ${p.html || ""}
      <div class="tour-acoes"><button class="btn primario" id="tour-ok">${c.esc(p.botao)}</button>
        ${passo > 0 ? `<button class="btn fantasma pequeno" id="tour-volta" style="width:100%;margin-top:10px">‹ Voltar</button>` : ""}</div>
    </section>`;
  }
  function ligarTour() {
    const c = C(), $ = c.$, S = c.S;
    const guardarDesejo = () => { const el = $("#tour-desejo"); if (!el) return; const v = el.value.trim(); if (!v) return;
      S.trajeto = S.trajeto || { etapa: 1, inicio: c.hojeKey(), inicioEtapa: c.hojeKey(), campos: {}, ciclo: 1 }; S.trajeto.campos.desejo = v; };
    const fim = () => { guardarDesejo(); S.tour = true; passo = 0; c.salvar(); c.ir("hoje"); };
    const ok = $("#tour-ok"); if (ok) ok.onclick = () => { if ($("#tour-desejo")) return fim(); passo++; c.render(); window.scrollTo({ top: 0 }); };
    const vo = $("#tour-volta"); if (vo) vo.onclick = () => { guardarDesejo(); c.salvar(); passo--; c.render(); window.scrollTo({ top: 0 }); };
    const pu = $("#tour-pular"); if (pu) pu.onclick = fim;
    animar();
  }
  function rever() { const c = C(); passo = 0; c.S.tour = false; c.salvar(); c.render(); window.scrollTo({ top: 0 }); }

  /* ---------- a fala do dia, na tela Hoje ---------- */
  function falaHoje(estado) {
    const c = C(), e = c.esc, G = window.GUIA_APP.estadoHoje(), seq = c.sequencia(), noite = new Date().getHours() >= 18;
    const bt = (rotulo, attrs) => `<button class="btn neon pequeno" ${attrs}>${e(rotulo)} ›</button>`;
    if (!estado.carta) return fala("Comece pelo começo: respire e vire a sua carta de hoje. Leva um minuto.", estado.momento === "receber" ? "" : bt("Ir para a carta", 'data-momento="receber"'));
    if (G.concluida) { if (!estado.noite) return fala("Suas sete etapas estão cumpridas. Hoje é dia de viver como quem já recebeu e registrar os sinais.", bt("Fechar o dia", 'data-momento="fechar"')); }
    else if (!G.liberada) { if (!estado.noite) return fala(`Você chegou à etapa ${G.et.n}, ${G.et.fase}. Ela abre com o plano Completo. Enquanto isso, a carta, o check-in e a frequência da noite continuam com você.`, bt("Ver a etapa " + G.et.n, 'data-ir="guia"')); }
    else if (!G.feita) return fala(`Carta recebida. Agora a parte que muda o jogo: ${G.tecnica.nome}, ${G.tecnica.min} minutos, com passo a passo.`, bt("Fazer a prática de hoje", `data-ir="guia" data-sub='"t-${G.id}"'`));
    if (!estado.nivel) return fala("Prática feita. Agora me conta: como está a sua energia?", estado.momento === "praticar" ? "" : bt("Fazer o check-in", 'data-momento="praticar"'));
    if (!estado.noite) return noite ? fala("Falta só fechar o dia. Sua frequência da noite está pronta.", estado.momento === "fechar" ? "" : bt("Fechar o dia", 'data-momento="fechar"'))
      : fala("A parte de hoje está feita. Volte à noite para fechar o dia com a sua frequência.");
    return fala(`Dia completo. ${seq > 1 ? seq + " noites seguidas com você. " : ""}Amanhã tem carta nova e o próximo passo da trajetória.`);
  }

  /* ---------- dica da primeira visita a cada aba ---------- */
  const DICAS = {
    mapa: "Aqui está quem você é pelos números. Leia sem pressa. Você volta a este mapa nas etapas 1 e 2 da trajetória, para alinhar o desejo com o seu jeito de prosperar.",
    guia: "Este é o coração do app. Uma etapa por vez: leia o princípio, cumpra o marco e faça uma prática em três dias diferentes. Aí a próxima abre.",
    ceu: "O céu dá o ritmo. Eu uso a Lua para te dizer quando plantar, quando agir e quando soltar.",
    portais: "Aqui ficam as leituras que aprofundam o seu mapa. O que tem cadeado abre com o plano Completo ou com um código de compra."
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

  return { NOME, orbe, fala, tour, ligarTour, falaHoje, dica, ligar, rever };
})();
