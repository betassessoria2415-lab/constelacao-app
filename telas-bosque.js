/* Bosque Encantado: o que a pessoa toca. Monta o palco dentro do Caminho, liga os pontos tocáveis
   (sete estrelas, Flor do Dia, Raiz da Intenção, Pedra da Energia), abre os painéis e conduz a celebração.
   A cena e a câmera ficam em bosque-cena.js; os textos e as regras do dia, em dados/bosque.js;
   o progresso das estrelas continua em telas-guia.js e nucleo.js. Tudo é gravado pelo CDA.salvar().
   Carrega antes de app.js; usa window.CDA na hora de renderizar. */
window.BOSQUE = (function () {
  "use strict";
  const EXT = window.CDA_EXT = window.CDA_EXT || { telas: {}, eventos: [] };
  const C = () => window.CDA, G = () => window.GUIA_APP, D = window.BOSQUE_DADOS, CN = window.BOSQUE_CENA;
  const hoje = () => C().hojeKey();
  const reduzido = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const curta = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);
  const fmtDia = k => k.slice(8) + "/" + k.slice(5, 7);
  const aviso = (oque, err) => console.warn(new Date().toISOString(), "[bosque] " + oque, err && err.message ? err.message : err || "");
  const NOMES = { flor: "Flor do Dia", raiz: "Raiz da Intenção", pedra: "Pedra da Energia" };
  const P4 = (R, r) => `M0 ${-R}Q${r} ${-r} ${R} 0Q${r} ${r} 0 ${R}Q${-r} ${r} ${-R} 0Q${-r} ${-r} 0 ${-R}Z`;

  let cena = null, palco = null, pontos = [], relogios = [], folha = null, ultimaCam = null, pendente = null, ocupado = false, longe = false, devolvendo = false;
  // devolve o foco sem que isso mova a câmera
  const focar = el => { if (!el) return; devolvendo = true; el.focus({ preventScroll: true }); devolvendo = false; };
  // a câmera volta ao enquadramento da estrela da pessoa
  const paraCasa = ms => { longe = false; const bt = palco && palco.querySelector("#bq-voltar"); if (bt) bt.hidden = true; if (cena) { if (ms) cena.irPara(repouso(), ms); else cena.definir(repouso()); } };
  const depois = (fn, ms) => { const id = setTimeout(fn, ms); relogios.push(id); return id; };

  /* ---------- o que cada descoberta mostra hoje ---------- */
  function situacao(id) {
    const S = C().S, h = hoje(), int = G().intencao();
    if (id === "flor") { const f = D.florHoje(S, h); return f ? { feita: true, curto: "✓ hoje", texto: "Visitada hoje" + (f.palavra ? `, palavra “${f.palavra}”` : "") + ". Uma prática nova nasce amanhã." } : { feita: false, curto: "prática de hoje", texto: "Há uma prática nova para hoje." }; }
    if (id === "pedra") { const p = D.pedraHoje(S, h); return p ? { feita: true, curto: "✓ hoje", texto: `Feita hoje, com ${p.qualidade || "uma qualidade"}. Você pode refazer.` } : { feita: false, curto: "1 minuto", texto: "Uma prática guiada de menos de um minuto." }; }
    return int ? { feita: true, curto: "guardada", texto: `Sua intenção está guardada: “${curta(int, 70)}”.` } : { feita: false, curto: "escrever", texto: "Sua intenção ainda não foi escrita." };
  }

  /* ---------- o palco ---------- */
  function html() {
    const c = C(), e = c.esc, g = G(), t = g.trajeto(), at = Math.min(t.etapa, 7), acesas = Math.min(t.etapa - 1, 7);
    const estrelas = GUIA.ETAPAS.map(x => { const r = g.rotulo(x.n), p = CN.ESTRELAS[x.n - 1], pts = r.est === "andamento" ? g.diasNa(x) : 0, k = x.n === 7 ? 1.05 : (0.62 + 0.38 * (7 - x.n) / 6);
      const aqui = x.n === at && !g.concluida();
      return `<li><button class="bq-p bq-e est-${r.est}" style="--k:${k.toFixed(2)}" data-estrela="${x.n}" data-x="${p[0]}" data-y="${p[1]}" ${aqui ? 'aria-current="step"' : ""} aria-label="Estrela ${x.n} de 7: ${e(x.nome)}. ${e(r.st.replace(/ · /g, ". "))}.">
        ${g.simbolo(r.est, pts)}<span class="bq-n" aria-hidden="true">${x.n}</span>${aqui ? `<span class="bq-rot" aria-hidden="true"><b>${e(x.nome)}</b><small>você está aqui</small></span>` : ""}</button></li>`; }).join("");
    const descobertas = ["flor", "raiz", "pedra"].map(id => { const s = situacao(id), p = CN.LUGARES[id];
      return `<li><button class="bq-p bq-d ${s.feita ? "feita" : "nova"}" data-desc="${id}" data-x="${p[0]}" data-y="${p[1]}" aria-label="${NOMES[id]}. ${e(s.texto)}">
        <svg class="bq-brilho" viewBox="-12 -12 24 24" aria-hidden="true"><path d="${P4(10, 2.4)}"/><circle r="1.6"/></svg><span class="bq-rot ${id === "raiz" ? "acima" : ""}" aria-hidden="true"><b>${NOMES[id]}</b></span></button></li>`; }).join("");
    const fonte = ext => `img/bosque-640.${ext} 640w, img/bosque-941.${ext} 941w`;
    return `<div class="bq" id="bosque"><div class="bq-palco" id="bq-palco">
      <div class="bq-topo">
        <button class="bq-bt" id="bq-mapa">Meu mapa pessoal</button>
        <button class="bq-bt" id="bq-lista">Minhas descobertas</button>
      </div>
      <div class="bq-cena" id="bq-cena">
        <picture><source type="image/avif" srcset="${fonte("avif")}" sizes="(min-width: 520px) 520px, 100vw"><source type="image/webp" srcset="${fonte("webp")}" sizes="(min-width: 520px) 520px, 100vw">
          <img class="bq-img" src="img/bosque-941.webp" alt="" width="941" height="1672" decoding="async" draggable="false"></picture>
        <canvas class="bq-gl" aria-hidden="true"></canvas><canvas class="bq-fx" aria-hidden="true"></canvas>
        <div class="bq-pontos"><ol aria-label="As sete estrelas do caminho">${estrelas}</ol><ul aria-label="Descobertas do bosque">${descobertas}</ul></div>
      </div>
      <p class="bq-msg" id="bq-msg" role="status" aria-live="polite"></p>
      <button class="bq-bt bq-voltar" id="bq-voltar" hidden>✦ Voltar à minha estrela</button>
      <div class="bq-pe" id="bq-pe">${g.rumoHTML()}</div>
    </div></div>`;
  }

  // altura do palco: do ponto onde ele começa até a barra de abas, sem rolagem da página
  function ajustarAltura() {
    if (!palco) return;
    const topo = palco.getBoundingClientRect().top + window.scrollY, h = Math.round(Math.max(380, Math.min(900, window.innerHeight - topo - 98)));
    if (palco.style.height !== h + "px") palco.style.height = h + "px";
    const pe = palco.querySelector(".bq-pe"); if (pe) palco.style.setProperty("--pe", pe.offsetHeight + "px");
    if (cena) { cena.medir(); if (!longe && !ocupado && !folha && !pendente) cena.definir(repouso()); }   // quem não saiu do lugar continua bem enquadrado
  }
  function repouso() {
    const g = G(), n = Math.min(g.trajeto().etapa, 7), p = CN.ESTRELAS[n - 1], z = CN.ZMIN + 0.02;
    if (!cena) return { x: p[0], y: p[1], z };
    // mostra a trilha inteira quando cabe; quando não cabe, garante a estrela da pessoa (e o rótulo dela) no quadro
    const j = cena.janela(z); return cena.limitar({ x: 0.5, y: Math.max(p[1] - j.hy + 0.11, Math.min(p[1] + j.hy - 0.04, 0.675)), z });
  }
  function posicionar() {
    if (!cena) return;   // a cena desenha uma vez enquanto ainda está nascendo
    for (const p of pontos) { const q = cena.projetar(p.x, p.y); p.el.style.transform = `translate3d(${(q[0] - 24).toFixed(1)}px, ${(q[1] - 24).toFixed(1)}px, 0)`; }
  }
  // só o gesto da pessoa (arrastar, pinçar) faz aparecer o botão de voltar
  function moveu() {
    const bt = palco && palco.querySelector("#bq-voltar"); if (!bt || !cena) return;
    const a = cena.camera(), r = repouso(); longe = Math.hypot(a.x - r.x, a.y - r.y) > 0.04 || Math.abs(a.z - r.z) > 0.1; if (bt.hidden === longe) bt.hidden = !longe;
  }
  function dizer(txt, ms) {
    const el = palco && palco.querySelector("#bq-msg"); if (!el) return;
    el.textContent = txt; el.classList.add("on"); depois(() => el.classList.remove("on"), ms || 4200);
  }

  function desmontar() {
    relogios.forEach(clearTimeout); relogios = []; ocupado = false; longe = false;
    if (cena) { ultimaCam = cena.camera(); cena.destruir(); cena = null; }
    window.removeEventListener("resize", ajustarAltura);
    palco = null; pontos = [];
  }
  function montar(el) {
    palco = el; const c = C(), g = G(), red = reduzido(), festa = g.pegarFesta(), acesas = Math.min(g.trajeto().etapa - 1, 7);
    ajustarAltura(); window.addEventListener("resize", ajustarAltura);
    pontos = Array.from(palco.querySelectorAll(".bq-p")).map(b => ({ el: b, x: Number(b.dataset.x), y: Number(b.dataset.y) }));
    try {
      cena = CN.criar(palco, { reduzido: red, poucas: (navigator.hardwareConcurrency || 4) <= 4, luz: festa && festa.tipo === "estrela" ? acesas - 1 : acesas,
        inset: () => { const pe = palco && palco.querySelector(".bq-pe"); return pe ? pe.offsetHeight + 14 : 0; },
        topo: () => { const t = palco && palco.querySelector(".bq-topo"); return t ? t.offsetHeight + 14 : 0; }, aoQuadro: posicionar, aoMover: moveu });
    } catch (err) { aviso("a cena não abriu; as práticas ficam em lista:", err); cena = null; palco.classList.add("sem-cena"); }
    if (cena) {
      // volta para onde a pessoa estava (por exemplo, depois de guardar uma descoberta) e só então recua até a estrela dela
      if (pendente && ultimaCam) { cena.definir(ultimaCam); paraCasa(900); } else paraCasa(0);
      if (folha) cena.pausar(true);
      depois(ajustarAltura, 450);   // depois da animação de entrada da página
    }

    // toques: as estrelas levam à prática; as descobertas abrem o painel
    palco.querySelectorAll("[data-estrela]").forEach(b => b.addEventListener("click", () => { if (!ocupado) g.abrirEstrela(Number(b.dataset.estrela)); }));
    palco.querySelectorAll("[data-desc]").forEach(b => b.addEventListener("click", () => abrirDescoberta(b.dataset.desc, b)));
    // pelo teclado: o que recebe o foco entra no quadro
    pontos.forEach(p => p.el.addEventListener("focus", () => { if (cena && !ocupado && !devolvendo && p.el.matches(":focus-visible") && !cena.naTela(p.x, p.y, 40)) cena.irPara(cena.enquadrar(p.x, p.y, cena.camera().z, 0), 420); }));
    const bm = palco.querySelector("#bq-mapa"); bm.onclick = () => c.ir("mapa");
    const bl = palco.querySelector("#bq-lista"); bl.onclick = () => abrirFolha("lista", bl);
    const bv = palco.querySelector("#bq-voltar"); bv.onclick = () => { paraCasa(650); focar(palco.querySelector('[aria-current="step"]')); };

    if (festa && festa.tipo === "estrela") celebrar(festa.n);
    else if (festa && festa.tipo === "ponto") { const b = palco.querySelector(`[data-estrela="${festa.n}"]`), p = CN.ESTRELAS[festa.n - 1]; if (b) b.classList.add("ponto-novo"); if (cena) cena.efeito("ponto", { x: p[0], y: p[1] }); }
    if (pendente) { const p = pendente; pendente = null; responder(p); }
  }

  /* ---------- a resposta visual de cada descoberta, depois de gravada ---------- */
  function responder(p) {
    const b = palco && palco.querySelector(`[data-desc="${p.id}"]`);
    if (b) { b.classList.add("recem"); depois(() => b.classList.remove("recem"), 3200); focar(b); }
    if (cena) depois(() => cena && cena.efeito(p.id), 120);
    if (p.msg) dizer(p.msg);
  }

  /* ---------- celebração: uma vez por estrela acesa, depois que o progresso já está gravado ---------- */
  function celebrar(n) {
    const g = G(), red = reduzido(), b = palco.querySelector(`[data-estrela="${n}"]`), prox = n < 7 ? palco.querySelector(`[data-estrela="${n + 1}"]`) : null, num = palco.querySelector("#bq-prog-n"), chip = palco.querySelector("#bq-prog"), p = CN.ESTRELAS[n - 1];
    if (chip) chip.setAttribute("aria-label", `${n} de 7 estrelas acesas`);
    const frase = (n === 1 ? "Sua intenção ganhou seu primeiro passo." : n === 7 ? "Sete estrelas acesas. Seu ciclo está completo." : `Estrela ${n} acesa. Sua intenção deu mais um passo.`) + (n < 7 ? ` Próxima: ${GUIA.ETAPAS[n].nome}.` : "");
    const acender = () => { if (b) { b.classList.remove("apagada"); b.classList.add(red ? "recem" : "acendeu"); } if (cena) cena.efeito("estrela", { x: p[0], y: p[1] }); if (num) num.textContent = n; if (chip) chip.classList.add("subiu"); };
    const revelar = () => { dizer(frase, 5200); if (prox) prox.classList.add("revelada"); paraCasa(900); ocupado = false; if (cena) cena.travar(false); };
    if (red || !cena) { if (cena) cena.luz(n); acender(); revelar(); return; }
    ocupado = true; cena.travar(true);
    if (b) b.classList.add("apagada"); if (num) num.textContent = n - 1;
    cena.definir(cena.enquadrar(p[0], p[1], 1.5, 0.05));
    depois(() => cena && cena.animarLuz(n - 1, n, 1000), 250);     // a corrente dourada percorre o trecho
    depois(acender, 1250);                                          // a estrela acende, com um sopro de partículas
    depois(revelar, 2050);                                          // o próximo destino aparece
  }

  // aproximação até a estrela tocada, antes de abrir a prática (a abertura não depende da animação)
  function aproximar(n, fim) {
    if (!cena || !palco) return fim();
    const p = CN.ESTRELAS[n - 1], red = reduzido(); ocupado = true; cena.travar(true);
    cena.irPara(cena.enquadrar(p[0], p[1], 1.95, 0), 620); palco.classList.add("partindo");
    depois(() => { ocupado = false; fim(); }, red ? 120 : 640);
  }
  function abrirDescoberta(id, origem) {
    if (ocupado || folha) return;
    if (!cena || reduzido()) return abrirFolha(id, origem);
    const p = CN.LUGARES[id]; ocupado = true; cena.travar(true);
    cena.irPara(cena.enquadrar(p[0], p[1], 1.7, 0.16), 520);
    depois(() => { ocupado = false; if (cena) cena.travar(false); abrirFolha(id, origem); }, 440);
  }

  /* ---------- painel (folha inferior) ---------- */
  function abrirFolha(tipo, origem) {
    if (folha) fecharFolha(true);
    const fundo = document.createElement("div"); fundo.className = "bq-ff";
    fundo.innerHTML = `<div class="bq-folha" role="dialog" aria-modal="true" aria-labelledby="bq-ft" tabindex="-1"><button class="bq-x" type="button" aria-label="Fechar">✕</button><div class="bq-fc"></div></div>`;
    document.body.appendChild(fundo);
    folha = { fundo, tipo, origem: origem || document.activeElement, desc: origem && origem.dataset ? origem.dataset.desc : "", relogios: [], passo: -1, qualidade: "" };
    fundo.addEventListener("click", ev => { if (ev.target === fundo) fecharFolha(); });
    fundo.querySelector(".bq-x").onclick = () => fecharFolha();
    fundo.addEventListener("keydown", ev => {
      if (ev.key === "Escape") { ev.stopPropagation(); return fecharFolha(); }
      if (ev.key !== "Tab") return;
      const f = Array.from(fundo.querySelectorAll("button, input, textarea, select, [href]")).filter(x => !x.disabled && x.offsetParent !== null); if (!f.length) return;
      const pri = f[0], ult = f[f.length - 1];
      if (ev.shiftKey && (document.activeElement === pri || document.activeElement === fundo.firstElementChild)) { ev.preventDefault(); ult.focus(); }
      else if (!ev.shiftKey && document.activeElement === ult) { ev.preventDefault(); pri.focus(); }
    });
    desenharFolha();
    if (cena) cena.pausar(true);
    const abrir = () => fundo.classList.add("on"); requestAnimationFrame(abrir); setTimeout(abrir, 60);   // abre mesmo se a animação não rodar
    fundo.firstElementChild.focus({ preventScroll: true });
  }
  function fecharFolha(semVolta) {
    if (!folha) return; const f = folha; folha = null;
    f.relogios.forEach(clearTimeout); f.fundo.classList.remove("on"); setTimeout(() => f.fundo.remove(), reduzido() ? 0 : 280);
    if (cena) { cena.pausar(false); cena.travar(false); if (!semVolta) paraCasa(700); }
    if (semVolta) return;
    const alvo = f.origem && f.origem.isConnected ? f.origem : (f.desc && palco ? palco.querySelector(`[data-desc="${f.desc}"]`) : null) || (palco && palco.querySelector("#bq-lista"));
    focar(alvo);
  }
  function erroFolha(txt) { if (!folha) return; let el = folha.fundo.querySelector(".bq-erro"); if (!el) { el = document.createElement("p"); el.className = "bq-erro"; el.setAttribute("role", "alert"); folha.fundo.querySelector(".bq-fc").appendChild(el); } el.textContent = txt; }
  // grava; só fecha e responde na cena se a gravação deu certo
  function concluir(id, msg) {
    if (!C().salvar()) return erroFolha("Não consegui guardar neste aparelho agora. Seu texto continua aqui: tente de novo."), false;
    pendente = { id, msg }; fecharFolha(true); C().render(true); return true;
  }
  const intencaoHTML = () => { const e = C().esc, int = G().intencao(); return int ? `<p class="bq-int"><span class="mini">Sua intenção</span>“${e(curta(int, 120))}”</p>` : ""; };

  function desenharFolha() {
    const c = C(), e = c.esc, S = c.S, h = hoje(), g = G(), fc = folha.fundo.querySelector(".bq-fc"), $ = s => fc.querySelector(s);
    folha.relogios.forEach(clearTimeout); folha.relogios = [];

    if (folha.tipo === "flor") {
      const pr = D.florDoDia(S.foco, h), ja = D.florHoje(S, h);
      fc.innerHTML = `<div class="mini">Flor do Dia · ${fmtDia(h)}</div><h2 id="bq-ft">${e(pr.tema)}</h2>
        ${intencaoHTML() || `<p class="sub">Sua intenção ainda não foi escrita. Ela mora na Raiz da Intenção, aqui no bosque.</p>`}
        <p>${e(pr.texto)}</p>
        <div class="bq-gesto"><div class="mini">Um gesto para hoje</div><p>${e(pr.gesto)}</p></div>
        <div class="campo"><label for="bq-palavra">Uma palavra para levar com você (opcional)</label><input id="bq-palavra" maxlength="44" autocomplete="off" value="${e(ja ? ja.palavra : "")}" placeholder="Ex.: coragem"></div>
        ${ja ? `<p class="bq-ok">✓ Flor visitada hoje. Uma prática nova nasce amanhã.</p><button class="btn fantasma" id="bq-salvar">Guardar a palavra</button>` : `<button class="btn primario" id="bq-salvar">Concluir a prática da flor ✦</button>`}
        <p class="aviso center" style="margin:12px 0 0">Prática simbólica de desenvolvimento pessoal. Não garante resultado.</p>`;
      const bt = $("#bq-salvar"); bt.onclick = () => { if (bt.disabled) return; bt.disabled = true;
        const r = D.guardarFlor(S, h, S.foco, $("#bq-palavra").value); if (r.nova) c.presenca();
        if (!concluir("flor", r.flor.palavra ? `A flor guardou a sua palavra: ${r.flor.palavra}.` : "A flor guardou a sua prática de hoje.")) bt.disabled = false; };
    }

    else if (folha.tipo === "raiz") {
      const int = g.intencao(), t = g.trajeto();
      fc.innerHTML = `<div class="mini">Raiz da Intenção${t.ciclo > 1 ? " · ciclo " + t.ciclo : ""}</div><h2 id="bq-ft">A intenção deste ciclo</h2>
        <p>É ela que as estrelas e as práticas do bosque cultivam. Escreva do seu jeito: uma frase que diga o que você quer viver.</p>
        <div class="campo"><label for="bq-intencao">Minha intenção</label><textarea id="bq-intencao" maxlength="240" style="min-height:92px" placeholder="Ex.: receber minha primeira encomenda de bolo">${e(int)}</textarea></div>
        <button class="btn primario" id="bq-salvar">${int ? "Atualizar minha intenção ✦" : "Guardar minha intenção ✦"}</button>
        <p class="aviso center" style="margin:12px 0 0">${int ? "Ela aparece nas práticas da flor, da pedra e de cada estrela." : "Depois de guardada, ela já aparece preenchida no primeiro ritual e nas práticas."}</p>`;
      const bt = $("#bq-salvar"), ta = $("#bq-intencao"); bt.onclick = () => { if (bt.disabled) return;
        const v = ta.value.replace(/\s+/g, " ").trim(); if (v.length < 3) { ta.focus(); return erroFolha("Escreva a sua intenção, do seu jeito."); }
        bt.disabled = true; t.campos.desejo = v; if (t.rascunho) t.rascunho.intencao = v; D.estado(S).raiz = { data: h };
        if (!concluir("raiz", "A raiz guardou a sua intenção.")) bt.disabled = false; };
    }

    else if (folha.tipo === "pedra") {
      const ja = D.pedraHoje(S, h), i = folha.passo, P = D.PEDRA, red = reduzido();
      const ir = n => { folha.passo = n; desenharFolha(); const t = $("#bq-ft"); if (t) t.focus({ preventScroll: true }); };
      if (i < 0) {
        fc.innerHTML = `<div class="mini">Pedra da Energia · menos de um minuto</div><h2 id="bq-ft" tabindex="-1">Um minuto de energia</h2>
          <p>Uma prática guiada em quatro passos: perceber o corpo, imaginar uma luz dourada, escolher uma qualidade para o dia e levar essa qualidade para um gesto.</p>
          <p class="sub">A luz é uma imagem, um símbolo da energia que você quer cultivar. Não substitui cuidado médico nem promete cura.</p>
          ${ja ? `<p class="bq-ok">✓ Feita hoje${ja.qualidade ? ", com " + e(ja.qualidade) : ""}. Você pode refazer quando quiser.</p>` : ""}
          <button class="btn primario" id="bq-comecar">${ja ? "Refazer a prática" : "Começar ✦"}</button>`;
        $("#bq-comecar").onclick = () => ir(0); return;
      }
      const p = P[i], ult = i === P.length - 1, int = g.intencao();
      fc.innerHTML = `<div class="mini">Pedra da Energia · passo ${i + 1} de ${P.length}</div><h2 id="bq-ft" tabindex="-1">${e(p.titulo)}</h2>
        <p class="bq-passo" aria-live="polite">${e(p.texto)}</p>
        ${p.escolha ? `<div class="opcoes tres" role="radiogroup" aria-labelledby="bq-ft">${GUIA.QUALIDADES.map(q => `<button type="button" class="opcao ${folha.qualidade === q ? "on" : ""}" role="radio" aria-checked="${folha.qualidade === q}" data-q="${e(q)}">${e(q)}</button>`).join("")}</div>` : ""}
        ${ult ? `<p class="bq-int"><span class="mini">Para hoje</span>Leve <b>${e(folha.qualidade || "essa qualidade")}</b>${int ? ` para a sua intenção: “${e(curta(int, 90))}”` : " com você"}.</p>` : ""}
        ${p.s ? `<div class="bq-tempo" aria-hidden="true"><i style="animation-duration:${p.s}s"></i></div><p class="aviso center" style="margin:6px 0 12px">${ult ? "Sem pressa: " : ""}cerca de ${p.s} segundos${ult ? "" : ". O próximo passo abre sozinho."}</p>` : ""}
        ${ult ? `<button class="btn primario" id="bq-salvar">Concluir a prática ✦</button>` : p.escolha ? "" : `<button class="btn fantasma" id="bq-seguir">Continuar</button>`}`;
      fc.querySelectorAll("[data-q]").forEach(b => b.onclick = () => { folha.qualidade = b.dataset.q; ir(i + 1); });
      const sg = $("#bq-seguir"); if (sg) sg.onclick = () => ir(i + 1);
      if (p.s && !ult && !red) folha.relogios.push(setTimeout(() => { if (folha && folha.tipo === "pedra" && folha.passo === i) ir(i + 1); }, p.s * 1000));
      const bt = $("#bq-salvar"); if (bt) bt.onclick = () => { if (bt.disabled) return; bt.disabled = true;
        const r = D.guardarPedra(S, h, folha.qualidade); if (r.nova) c.presenca();
        if (!concluir("pedra", folha.qualidade ? `A pedra guardou ${folha.qualidade} para o seu dia.` : "A pedra guardou a sua prática.")) bt.disabled = false; };
    }

    else {   // "Minhas descobertas": tudo o que o bosque tem, em lista
      const flores = (D.estado(S).flores || []).slice(-7).reverse(), linha = (attr, tit, txt, feita) => `<li><button class="bq-item ${feita ? "feita" : ""}" ${attr}><b>${tit}</b><span>${e(txt)}</span></button></li>`;
      fc.innerHTML = `<div class="mini">Bosque Encantado</div><h2 id="bq-ft">Minhas descobertas</h2>
        <p class="sub">Tudo o que o bosque guarda, em lista. Toque para abrir.</p>
        <ul class="bq-lista">${["flor", "raiz", "pedra"].map(id => { const s = situacao(id); return linha(`data-abrir="${id}"`, NOMES[id], s.texto, s.feita); }).join("")}</ul>
        <div class="mini" style="margin:16px 0 8px">As sete estrelas</div>
        <ol class="bq-lista">${GUIA.ETAPAS.map(x => { const r = g.rotulo(x.n); return linha(`data-abrir-estrela="${x.n}"`, `${x.n} · ${e(x.nome)}`, r.st.replace(/ · /g, ". "), r.est === "concluida"); }).join("")}</ol>
        ${flores.length ? `<div class="mini" style="margin:16px 0 8px">O que a flor já guardou</div>${flores.map(f => `<div class="evento"><div class="d" style="font-size:16px">${fmtDia(f.data)}</div><div><b>${e(f.tema)}</b>${f.palavra ? `<div class="sub" style="font-size:14px">Palavra: ${e(f.palavra)}</div>` : ""}</div></div>`).join("")}` : ""}
        <button class="btn fantasma" id="bq-ir-mapa" style="margin-top:16px">Meu mapa pessoal ›</button>`;
      fc.querySelectorAll("[data-abrir]").forEach(b => b.onclick = () => { const id = b.dataset.abrir, o = palco && palco.querySelector(`[data-desc="${id}"]`); fecharFolha(true); abrirFolha(id, o); });
      fc.querySelectorAll("[data-abrir-estrela]").forEach(b => b.onclick = () => { fecharFolha(true); g.abrirEstrela(Number(b.dataset.abrirEstrela)); });
      $("#bq-ir-mapa").onclick = () => { fecharFolha(true); c.ir("mapa"); };
    }
  }

  EXT.eventos.push(function () {
    desmontar();
    const el = document.getElementById("bq-palco");
    if (el) montar(el); else if (folha) fecharFolha(true);   // saiu do Caminho: nada fica rodando
  });

  return { html, aproximar, abrirFolha, fecharFolha, situacao };
})();
