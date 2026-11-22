/* O Segredo das Estrelas · app */
(function () {
  "use strict";

  const CONFIG = {
    chave: "cda_app_v1",
    codigoAcesso: "ESTRELA2027", // código entregue após a compra; deixe "" para liberar sem código. Troque a cada mês para recorrência.
    nomeMarca: "O Segredo das Estrelas",
    rodapeCompartilhar: "osegredodasestrelas",
    anoVirada: null,             // null = calcula: próximo 1º de janeiro
    diasDegustacao: 7,           // dias de Clube liberado para quem acabou de entrar
    segredoClube: "0f8b129d30d699e4f46a5751271b175facec",  // gera o código mensal do Clube (veja dono/gerador-de-codigos.html)
    checkouts: { guia: "https://pay.kiwify.com.br/o8GJp7z", profundo: "https://pay.kiwify.com.br/o8GJp7z", lua: "https://pay.kiwify.com.br/o8GJp7z", amor: "https://pay.kiwify.com.br/o8GJp7z", clube: "https://pay.kiwify.com.br/o8GJp7z" },               // links de compra por portal: { profundo: "https://...", ano: "...", lua: "...", amor: "...", nome: "...", clube: "..." }
    hashes: {},                  // hashes SHA-256 dos códigos por portal: { profundo: ["..."], ... }
    codigoMestreHash: "2faf1d7247a922a61ebdf0e5825eaf302abd1fc9f47af2504e5cdb17fffa62f7"         // opcional: hash de um código que abre qualquer portal (para suporte)
  };

  /* ---------- utilidades ---------- */
  const $ = (s, el = document) => el.querySelector(s);
  const app = $("#app"), tabs = $("#tabs"), toastEl = $("#toast");
  const MESES = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  const DIAS = ["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const hojeKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const diaDoAno = d => Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
  const fmtData = d => `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
  const fmtCurta = iso => { const [a, m, d] = iso.split("-"); return `${d}/${m}/${a}`; };
  let toastT;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("on"), 2600); }

  /* ---------- estado ---------- */
  const padrao = () => ({ perfil: null, tour: false, dicas: {}, estrelas: {}, dias: {}, presencas: {}, sinais: [], melhorSeq: 0, luas: {}, pessoas: [], mesVisto: "", portais: {}, direitos: {}, direitosEm: 0, contaEmail: "", acessoPor: "", foco: "", genero: "f", nascHora: "", nascCidade: "", encerramento: {}, passos: {}, acesso: false, criadoEm: new Date().toISOString() });
  let S = padrao();
  function carregar() {
    try { const raw = localStorage.getItem(CONFIG.chave); if (raw) S = Object.assign(padrao(), JSON.parse(raw)); }
    catch (e) { console.warn("[storage] leitura falhou:", e); toast("Não consegui ler seus dados salvos neste navegador."); }
  }
  function salvar() {
    try { localStorage.setItem(CONFIG.chave, JSON.stringify(S)); }
    catch (e) { console.warn("[storage] gravação falhou:", e); toast("Não consegui salvar. Verifique o espaço do navegador."); }
  }

  /* ---------- cálculo do mapa ---------- */
  function mapa(perfil, data = new Date()) {
    const [a, m, d] = perfil.nascimento.split("-").map(Number);
    const nome = perfil.nome;
    const destino = NUM.destino(d, m, a);
    const expressao = NUM.expressao(nome);
    const motivacao = NUM.motivacao(nome);
    const impressao = NUM.impressao(nome);
    const dia = NUM.diaNatal(d);
    const anoRef = data.getFullYear();
    const anoPessoal = NUM.anoPessoal(d, m, anoRef);
    const anoPessoalProx = NUM.anoPessoal(d, m, anoRef + 1);
    const mesPessoal = NUM.mesPessoal(d, m, anoRef, data.getMonth() + 1);
    const diaPessoal = NUM.diaPessoal(d, m, data);
    const diaUniversal = NUM.diaUniversal(data);
    const somaData = String(d).split("").concat(String(m).split(""), String(a).split("")).reduce((x, y) => x + Number(y), 0);
    const carmicas = [];
    const brutaNome = NUM.somaBruta(nome);
    if (NUM.CARMICAS[brutaNome]) carmicas.push({ n: brutaNome, onde: "no seu nome", t: NUM.CARMICAS[brutaNome] });
    if (NUM.CARMICAS[d]) carmicas.push({ n: d, onde: "no seu dia de nascimento", t: NUM.CARMICAS[d] });
    const signo = ASTROS.signo(d, m);
    const lua = ASTROS.faseLua(data);
    const nome72 = KABALA.NOMES72[(diaDoAno(data) + destino) % 72];
    const freqNoite = { freq: GUIA_APP.afirmacaoDoDia(data, expressao) };
    const faseIdx = Math.max(0, ASTROS.FASES.findIndex(f => f.nome === lua.nome));
    const orient = DIARIO.orientacao({ diaPessoal, destino, faseIdx, data });
    const carta = DIARIO.cartaDoDia(nome, data);
    return { orient, carta, d, m, a, destino, expressao, motivacao, impressao, dia, anoRef, anoPessoal, anoPessoalProx, mesPessoal, diaPessoal, diaUniversal, carmicas, signo, lua, nome72, freqNoite, letras: NUM.letras(nome) };
  }

  /* ---------- navegação ---------- */
  let rota = { aba: "hoje", sub: null };
  function ir(aba, sub = null, voltar = false) {
    const atual = $(".pagina");
    const troca = () => { if (aba !== rota.aba) delete secSel[aba]; rota = { aba, sub }; render(); window.scrollTo({ top: 0, behavior: "instant" }); };
    if (atual && !voltar) { atual.classList.add("saindo"); setTimeout(troca, 180); } else troca();
  }
  tabs.addEventListener("click", e => { const b = e.target.closest(".tab"); if (b) ir(b.dataset.aba); });
  function marcarTab() { tabs.querySelectorAll(".tab").forEach(b => b.classList.toggle("ativo", b.dataset.aba === rota.aba)); }

  /* ---------- sequência, presença e memória ---------- */
  const diaMenos = n => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
  function sequencia() {
    let n = 0, perdao = 1, i = S.presencas[hojeKey()] ? 0 : 1;
    for (; i < 400; i++) {
      if (S.presencas[hojeKey(diaMenos(i))]) n++;
      else if (perdao > 0 && n > 0 && S.presencas[hojeKey(diaMenos(i + 1))]) perdao--;   // uma falha perdoada por sequência
      else break;
    }
    return n;
  }
  const MARCOS = { 3: "3 noites seguidas. O hábito começou a nascer.", 7: "7 noites seguidas. Uma semana inteira de presença.", 14: "14 noites. Você já é constante.", 21: "21 noites. Isso já faz parte de você.", 30: "30 noites seguidas. Um mês inteiro de presença." };
  function presenca() {
    const k = hojeKey(); if (S.presencas[k]) return;
    S.presencas[k] = true; const seq = sequencia(); S.melhorSeq = Math.max(S.melhorSeq || 0, seq); salvar();
    if (MARCOS[seq]) { celebrar(); toast("✦ " + MARCOS[seq]); }
  }
  // intenção antiga (7 a 30 dias) ainda sem resposta
  function lembranca() {
    for (const n of [7, 8, 9, 10, 11, 12, 13, 14, 21, 30, 6, 5, 4, 3]) {
      const k = hojeKey(diaMenos(n)), d = S.dias[k];
      if (d && d.desejo && d.desejo.trim() && !d.resultado) return { k, dias: n, desejo: d.desejo.trim() };
    }
    return null;
  }
  function provas() {
    const itens = (S.sinais || []).map(s => ({ data: s.data, tipo: s.tipo, texto: s.texto }));
    return itens.sort((a, b) => (a.data < b.data ? 1 : -1));
  }

  /* ---------- semana, mês e luas ---------- */
  const DIAS_C = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  function diasPessoais(M, inicio, n) {
    return Array.from({ length: n }, (_, i) => {
      const dt = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i, 12);
      const dp = NUM.diaPessoal(M.d, M.m, dt), fi = ASTROS.faseIdx(dt);
      return { dt, dp, fi, pts: CICLOS.pontuar(dp, dt.getDay(), fi) };
    });
  }
  const melhor = (arr, k) => arr.reduce((a, b) => (b.pts[k] > a.pts[k] ? b : a));
  const diaExt = x => `${DIAS[x.dt.getDay()].replace("-feira", "")}, ${x.dt.getDate()}`;
  const ymKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  function luasDoMes(dias) {
    const meia = ASTROS.SINODICO / 2, r = [];
    dias.forEach(x => { const id = ASTROS.idadeLua(x.dt); if (id < 1) r.push({ dt: x.dt, tipo: "Lua Nova", icone: "🌑" }); else if (Math.abs(id - meia) < 0.5) r.push({ dt: x.dt, tipo: "Lua Cheia", icone: "🌕" }); });
    return r;
  }

  function render(semAnim) {
    if (CONFIG.codigoAcesso && !S.acesso) { tabs.classList.add("oculto"); app.innerHTML = telaAcesso(); ligarAcesso(); return; }
    if (!S.perfil) { tabs.classList.add("oculto"); app.innerHTML = telaOnboarding(); ligarOnboarding(); return; }
    const M = mapa(S.perfil);
    if (!S.tour) { tabs.classList.add("oculto"); app.innerHTML = ESTELA.tour(M); if (S.genero === "m") masculinizar(app); ESTELA.ligarTour(); return; }
    tabs.classList.remove("oculto"); marcarTab();
    let html = "";
    const EXT = window.CDA_EXT || { telas: {}, eventos: [] }, chaveExt = rota.aba + "/" + (typeof rota.sub === "string" ? rota.sub : "");
    if (EXT.telas[chaveExt]) html = EXT.telas[chaveExt](M);
    else if (rota.aba === "hoje") html = rota.sub === "provas" ? telaProvas() : rota.sub === "mes" ? telaMes(M) : telaHoje(M);
    else if (rota.aba === "mapa") html = rota.sub === "compat" ? telaCompat(M) : telaMapa(M);
    else if (rota.aba === "ceu" && rota.sub === "ciclo") html = telaCiclo(M);
    else if (rota.aba === "ceu") html = telaCeu(M);
    else if (rota.aba === "eu") html = telaEu(M);
    app.innerHTML = html;
    if (!rota.sub) { const dc = ESTELA.dica(rota.aba), tp = $(".pagina > .topo"); if (dc && tp) tp.insertAdjacentHTML("afterend", dc); }
    if (semAnim) { const p = $(".pagina"); if (p) p.style.animation = "none"; }
    if (secMudou) { const p = $(".pagina"); if (p) p.classList.add("troca"); secMudou = false; }
    if (!semAnim) efeitos();
    if (S.genero === "m") masculinizar(app);
    ligarEventos(M);
  }

  const trava = (id, html, txt) => (window.PREMIUM && !PREMIUM.liberado(id) ? PREMIUM.cadeado(id, html, txt) : html);
  const clube = () => !!window.PREMIUM && PREMIUM.liberado("clube");
  // tratamento no masculino: troca só em textos do app, nunca no que a pessoa escreveu
  const MASC = [["Bem-vinda", "Bem-vindo"], ["Nascida", "Nascido"], ["A Iniciadora", "O Iniciador"], ["A Parceira", "O Parceiro"], ["A Criadora", "O Criador"], ["A Mestra Construtora", "O Mestre Construtor"], ["A Construtora", "O Construtor"],
    ["A Transformadora", "O Transformador"], ["A Cuidadora", "O Cuidador"], ["A Buscadora", "O Buscador"], ["A Realizadora", "O Realizador"], ["A Doadora", "O Doador"], ["A Inspiradora", "O Inspirador"],
    ["sozinha", "sozinho"], ["atenta", "atento"], ["apoiada", "apoiado"], ["digna", "digno"], ["cansada", "cansado"], ["grata", "grato"], ["pronta", "pronto"], ["cuidada", "cuidado"], ["voltada", "voltado"], ["decidida", "decidido"],
    ["você mesma", "você mesmo"], ["a si mesma", "a si mesmo"], ["a mulher que", "a pessoa que"], ["Querida eu", "Querido eu"], ["muitas mulheres", "muitas pessoas"], ["Muitas mulheres", "Muitas pessoas"], ["toda mulher", "toda pessoa"], ["mulheres", "pessoas"]];
  function masculinizar(raiz) {
    const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, { acceptNode: n => (n.parentElement && /^(TEXTAREA|INPUT|OPTION|SCRIPT)$/.test(n.parentElement.tagName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
    let n; while ((n = w.nextNode())) { let t = n.nodeValue, o = t; MASC.forEach(([a, b]) => { if (t.includes(a)) t = t.split(a).join(b); }); if (t !== o) n.nodeValue = t; }
  }

  /* ---------- componentes ---------- */
  const topo = (titulo, extra = "") => `<header class="topo"><div><div class="marca">☾ ${esc(CONFIG.nomeMarca)}</div>${titulo ? `<div class="data">${titulo}</div>` : ""}</div><div class="topo-dir">${extra}<button class="perfil-btn" data-ir="eu" aria-label="Meu perfil">${esc(((S.perfil && S.perfil.nome) || "?").trim()[0].toUpperCase())}</button></div></header>`;
  const voltar = (aba, sub = null) => `<button class="voltar" data-ir="${aba}" ${sub ? `data-sub='${JSON.stringify(sub)}'` : ""}>‹ Voltar</button>`;
  const chips = (arr, cls = "") => arr.map(x => `<span class="chip ${cls}">${esc(x)}</span>`).join(" ");
  // capítulos de uma aba: [[id, rótulo], ...]; devolve o capítulo aberto e a barra de botões
  const secSel = {}; let secMudou = false;
  function secoes(aba, lista) {
    const at = secSel[aba] === "tudo" ? "tudo" : lista.some(x => x[0] === secSel[aba]) ? secSel[aba] : lista[0][0];
    return { at, html: `<div class="secoes" role="tablist">${lista.map(x => `<button class="secao ${x[0] === at ? "on" : ""}" data-sec="${aba}:${x[0]}" role="tab" aria-selected="${x[0] === at}">${esc(x[1])}</button>`).join("")}</div>` };
  }
  const barra = pct => `<div class="barra"><div style="width:${pct}%"></div></div>`;

  function saudacao() { const h = new Date().getHours(); return h < 6 ? "Boa madrugada" : h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite"; }
  const primeiroNome = () => (S.perfil.nome || "").trim().split(/\s+/)[0].replace(/^./, c => c.toUpperCase());

  /* ---------- conta: login por e-mail e direitos comprados ---------- */
  let contaEtapa = null;   // { email } depois que o e-mail de acesso foi pedido
  const NOME_PORTAL = { base: "Acesso ao app", profundo: "Mapa Profundo", ano: "Previsão 2027", lua: "Lua e Ascendente", amor: "Amor e Vínculos", nome: "Nome de Poder", clube: "Clube das Estrelas", guia: "Trajetória completa" };
  function contaHTML() {
    if (!window.CONTA) return "";
    if (CONTA.logada()) {
      const d = S.direitos || {}, itens = Object.keys(d).filter(k => CONTA.valido(d[k]));
      return `<div class="mini" style="margin-bottom:8px">Minha conta</div>
        <p style="margin:0 0 8px">Conectada como <b>${esc(CONTA.email())}</b></p>
        ${itens.length ? itens.map(k => `<span class="chip verde" style="margin:0 6px 6px 0">${esc(NOME_PORTAL[k] || k)}${d[k] === "vitalicio" ? "" : " até " + fmtCurta(d[k].slice(0, 10)).slice(0, 5)}</span>`).join("") : `<p class="sub" style="margin:0 0 8px">Nenhuma compra encontrada para este e-mail ainda. Se você acabou de pagar, toque em Atualizar em alguns minutos.</p>`}
        <div class="linha-btn" style="margin-top:10px"><button class="btn fantasma pequeno" id="ct-sync">Atualizar acessos</button><button class="btn fantasma pequeno" id="ct-sair">Sair</button></div>`;
    }
    if (contaEtapa) return `<div class="mini" style="margin-bottom:8px">Confirme seu e-mail</div>
        <p class="sub" style="margin-bottom:10px">Enviamos um e-mail para <b>${esc(contaEtapa.email)}</b>. Toque no link dele ou digite aqui o código de 6 dígitos.</p>
        <div style="display:flex;gap:8px"><input id="ct-cod" inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="000000"><button class="btn primario pequeno" id="ct-verificar" style="flex:0 0 auto">Entrar</button></div>
        <button class="btn fantasma pequeno" id="ct-voltar" style="width:100%;margin-top:10px">Usar outro e-mail</button>`;
    return `<div class="mini" style="margin-bottom:8px">Entrar com o e-mail da compra</div>
        <p class="sub" style="margin-bottom:10px">Seus acessos ficam ligados ao e-mail e valem em qualquer aparelho. Sem senha: você recebe um link.</p>
        <div style="display:flex;gap:8px"><input id="ct-email" type="email" autocomplete="email" placeholder="voce@email.com"><button class="btn primario pequeno" id="ct-enviar" style="flex:0 0 auto">Receber link</button></div>`;
  }
  function ligarConta() {
    if (!window.CONTA) return;
    const falha = (onde, e) => { console.warn("[conta] " + onde + ":", e); toast(/rate|limit|429/i.test(e.message || "") ? "Muitos pedidos em pouco tempo. Tente de novo em alguns minutos." : "Não deu certo agora. Confira a internet e tente de novo."); };
    const env = $("#ct-enviar"); if (env) { const enviar = async () => { const em = ($("#ct-email").value || "").trim(); if (!/^\S+@\S+\.\S+$/.test(em)) return toast("Digite um e-mail válido."); env.disabled = true; env.textContent = "Enviando…";
      try { await CONTA.pedirAcesso(em); contaEtapa = { email: em }; render(true); toast("E-mail enviado ✦ confira sua caixa de entrada"); } catch (e) { env.disabled = false; env.textContent = "Receber link"; falha("pedido de acesso", e); } };
      env.onclick = enviar; $("#ct-email").onkeydown = e => { if (e.key === "Enter") enviar(); }; }
    const ver = $("#ct-verificar"); if (ver) { const verificar = async () => { const cod = ($("#ct-cod").value || "").trim(); if (cod.length < 6) return toast("Digite o código do e-mail."); ver.disabled = true;
      try { await CONTA.verificarCodigo(contaEtapa.email, cod); contaEtapa = null; await CONTA.sincronizar(); toast(S.acesso ? "Você entrou ✦" : "Entrou, mas não achei compra neste e-mail."); render(true); } catch (e) { ver.disabled = false; console.warn("[conta] código:", e); toast("Código inválido ou vencido. Peça um novo e-mail."); } };
      ver.onclick = verificar; $("#ct-cod").onkeydown = e => { if (e.key === "Enter") verificar(); }; }
    const vol = $("#ct-voltar"); if (vol) vol.onclick = () => { contaEtapa = null; render(true); };
    const syn = $("#ct-sync"); if (syn) syn.onclick = async () => { syn.disabled = true; try { await CONTA.sincronizar(); toast("Acessos atualizados ✦"); render(true); } catch (e) { syn.disabled = false; falha("sincronização", e); } };
    const sai = $("#ct-sair"); if (sai) sai.onclick = () => { if (confirm("Sair da conta neste aparelho? Seu diário continua salvo aqui.")) { CONTA.sair(); render(true); } };
  }

  /* ---------- telas ---------- */
  function telaAcesso() {
    return `<section class="pagina onb"><div class="logo">✦</div><h1 class="center">Bem-vinda</h1><p class="sub center">Digite o código de acesso que você recebeu após a compra.</p>
      <div class="card"><div class="campo"><label>Código de acesso</label><input id="codigo" autocomplete="off" placeholder="SEU-CÓDIGO"></div><button class="btn primario" id="entrar">Entrar</button></div>
      ${window.CONTA ? `<div class="card neon"><span class="brilho v"></span>${contaHTML()}</div>` : ""}</section>`;
  }
  function ligarAcesso() {
    ligarConta();
    $("#entrar").onclick = () => {
      const v = ($("#codigo").value || "").trim().toUpperCase();
      if (v === CONFIG.codigoAcesso.toUpperCase()) { S.acesso = true; S.acessoPor = "codigo"; salvar(); render(); } else toast("Código não reconhecido. Confira o e-mail de compra.");
    };
  }

  function telaOnboarding() {
    return `<section class="pagina onb">
      <div class="logo">✦</div>
      <h1 class="center">Seu céu tem um desenho só seu.</h1>
      <p class="sub center" style="margin:10px 0 22px">Pelo seu nome e sua data de nascimento, o app revela seu número de destino, sua Sefirá na Árvore da Vida e guia você, um dia de cada vez, do desejo à manifestação.</p>
      <div class="card neon"><span class="brilho v"></span>
        <div class="campo"><label>Nome completo (como na certidão)</label><input id="nome" autocomplete="name" placeholder="Maria Aparecida da Silva"></div>
        <div class="campo"><label>Data de nascimento</label><input id="nasc" type="date" min="1920-01-01" max="2020-12-31"></div>
        <div class="campo"><label>O que você mais busca agora?</label><div class="opcoes" id="foco">${Object.entries(COMBOS.FOCO).map(([k, f], i) => `<button type="button" class="opcao ${i === 0 ? "on" : ""}" data-foco="${k}">${f.icone} ${f.nome}</button>`).join("")}</div></div>
        <div class="campo"><label>Como prefere ser chamada ou chamado?</label><select id="genero"><option value="f">No feminino</option><option value="m">No masculino</option></select></div>
        <button class="btn primario" id="gerar">Revelar meu mapa ✦</button>
        <p class="aviso" style="margin:12px 0 0">Seus dados ficam só no seu aparelho. Nada é enviado para servidores.</p>
      </div>
      <p class="aviso center">Material de desenvolvimento pessoal. Lei da atração, numerologia e Kabala aparecem como inspiração e metáfora, não como ciência nem promessa de resultado.</p>
    </section>`;
  }
  function ligarOnboarding() {
    app.querySelectorAll("[data-foco]").forEach(b => b.onclick = () => { app.querySelectorAll("[data-foco]").forEach(x => x.classList.toggle("on", x === b)); });
    $("#gerar").onclick = () => {
      const nome = $("#nome").value.trim(), nasc = $("#nasc").value;
      if (nome.split(/\s+/).length < 2) return toast("Digite nome e sobrenome.");
      if (!nasc) return toast("Escolha sua data de nascimento.");
      S.perfil = { nome, nascimento: nasc };
      const fEl = app.querySelector("[data-foco].on"); S.foco = fEl ? fEl.dataset.foco : "dinheiro"; S.genero = $("#genero").value; S.criadoEm = S.criadoEm || new Date().toISOString(); salvar();
      telaCalculando(() => { rota = { aba: "hoje", sub: null }; render(); });
    };
  }
  function telaCalculando(fim) {
    const passos = ["Lendo as letras do seu nome…", "Somando as vibrações…", "Localizando sua Sefirá na Árvore da Vida…", "Consultando a fase da Lua…", "Abrindo a sua trajetória…"];
    app.innerHTML = `<section class="pagina calc"><div class="orb"></div><h2>Desenhando seu céu</h2><p class="passo" id="passo"></p></section>`;
    let i = 0; const el = $("#passo");
    const t = setInterval(() => { el.textContent = passos[i]; el.style.animation = "none"; void el.offsetWidth; el.style.animation = ""; i++; if (i > passos.length) { clearInterval(t); fim(); } }, 650);
  }

  let momentoSel = "receber", momentoDia = "";   // parte do dia aberta na tela Hoje: receber | praticar | fechar
  function telaHoje(M) {
    const d = new Date(), k = hojeKey(d), dia = S.dias[k] || {};
    const c = NUM.CICLO[M.diaPessoal];
    const nivel = dia.nivel || 0, GH = GUIA_APP.estadoHoje();
    if (momentoDia !== k) { momentoDia = k; momentoSel = !dia.carta ? "receber" : (!GH.feita && GH.liberada && !GH.concluida) || !nivel ? "praticar" : "fechar"; }
    const mo = momentoSel;
    const faixa = nivel ? (nivel <= 7 ? "alto" : nivel <= 14 ? "medio" : "baixo") : null;
    const O = M.orient, K = M.carta, seq = sequencia(), lemb = lembranca(), nProvas = provas().length;
    const semana = [6, 5, 4, 3, 2, 1, 0].map(i => { const dt = diaMenos(i); return `<div class="dia-ponto ${S.presencas[hojeKey(dt)] ? "on" : ""} ${i === 0 ? "hoje" : ""}"><i></i>${"DSTQQSS"[dt.getDay()]}</div>`; }).join("");
    return `<section class="pagina">
      ${topo(fmtData(d), `<span class="chip ouro seq" id="seq">✦ ${seq} ${seq === 1 ? "noite" : "noites"}</span>`)}
      <h1>${saudacao()}, ${esc(primeiroNome())}.</h1>
      ${ESTELA.falaHoje({ carta: !!dia.carta, nivel, noite: !!dia.noite, momento: mo })}
      <div class="semana">${semana}</div>
      <div class="momentos" role="tablist">${[["receber", "Receber", "carta e orientação", !!dia.carta], ["praticar", "Praticar", "técnica e energia", GH.feita && nivel > 0], ["fechar", "Fechar o dia", "frequência e sinais", !!dia.noite]].map((x, i) => `<button class="momento ${mo === x[0] ? "on" : ""} ${x[3] ? "ok" : ""}" data-momento="${x[0]}" role="tab" aria-selected="${mo === x[0]}"><i>${x[3] ? "✓" : i + 1}</i><b>${x[1]}</b><small>${x[2]}</small></button>`).join("")}</div>

      <div class="sec-corpo">${mo === "receber" ? `
      <div class="carta ${dia.carta ? "virada" : ""}" id="carta" role="button" tabindex="0" aria-label="Carta do dia">
        <div class="carta-in">
          <div class="face frente"><div class="selo">✦</div><h3>Sua carta de hoje</h3><p class="sub" style="margin:6px 0 0">Respire fundo, pense no seu dia e toque para revelar.</p><span class="chip violeta" style="margin-top:14px">uma carta por dia</span></div>
          <div class="face verso"><span class="brilho v"></span>
            <div class="card-cab"><span class="mini">Carta do dia · ${K.n} de 22</span><span class="chip ouro">${esc(K.arcano)}</span></div>
            <div style="display:flex;gap:16px;align-items:center"><div class="hebraica" style="font-size:64px;line-height:1">${K.letra}</div><div><h2>${esc(K.nome)}</h2><p style="margin:6px 0 0">${esc(K.msg)}</p></div></div>
            <div class="sep"></div>
            <div class="mini" style="margin-bottom:6px">Gesto de hoje</div><p style="margin:0">${esc(K.gesto)}</p>
          </div>
        </div>
      </div>

      ${dia.carta ? (dia.carta2 ? (() => { const K2 = DIARIO.cartaDoDia(S.perfil.nome + "#2", d); return `<div class="card"><div class="card-cab"><span class="mini">Segunda carta · conselho</span><span class="chip ouro">${esc(K2.arcano)}</span></div><div style="display:flex;gap:14px;align-items:center"><div class="hebraica" style="font-size:44px;line-height:1">${K2.letra}</div><div><h3>${esc(K2.nome)}</h3><p style="margin:4px 0 0">${esc(K2.msg)}</p></div></div></div>`; })()
        : `<button class="btn fantasma pequeno" ${clube() ? 'id="carta2"' : 'data-portal="clube"'} style="width:100%;margin:-4px 0 14px">✦ Tirar uma segunda carta ${clube() ? "" : "· Clube"}</button>`) : ""}
      <div class="card neon"><span class="brilho v"></span>
        <div class="card-cab"><span class="mini">Seu dia pessoal</span><span class="chip ouro">Dia universal ${M.diaUniversal}</span></div>
        <div class="num-hero"><div class="num-grande">${M.diaPessoal}</div><div><h2>${esc(c.palavra)}</h2><p class="sub" style="margin:4px 0 0">${esc(c.resumo)}</p></div></div>
        <div class="sep"></div>
        <p>${esc(c.dia)}</p>
        ${(() => { const ar = [["dinheiro", "◈", "Dinheiro"], ["amor", "♡", "Amor e relações"], ["energia", "ϟ", "Energia"]], pri = { amor: "amor", paz: "energia" }[S.foco] || "dinheiro";
          return ar.sort((x, y) => (y[0] === pri) - (x[0] === pri)).map(x => `<div class="area"><div class="ic">${x[1]}</div><div><div class="mini">${x[2]}${x[0] === pri ? " · seu foco" : ""}</div><p>${esc(O[x[0]])}</p></div></div>`).join(""); })()}
        <div class="sep"></div>
        <p class="sub" style="margin-bottom:6px">${O.semana.simbolo} ${esc(O.semana.frase)}</p>
        <p class="citacao" style="margin:10px 0">${esc(O.toque)}</p>
        <div class="grade2" style="margin-top:12px">
          <div class="mini-card"><div class="mini">Número de poder</div><b class="num-medio" style="font-size:34px">${O.numeroPoder}</b></div>
          <div class="mini-card"><div class="mini">Horário de poder</div><b class="num-medio" style="font-size:34px">${O.horaPoder}</b></div>
        </div>
        <div class="mini" style="margin:14px 0 6px">Favorece</div>${chips(c.fazer, "verde")}
        <div class="mini" style="margin:12px 0 6px">Evite</div>${chips(c.evitar)}
        <div class="sep"></div>
        <div style="display:flex;align-items:center;gap:10px"><i style="width:18px;height:18px;border-radius:50%;background:${c.cor};box-shadow:0 0 12px ${c.cor}"></i><span class="sub">Cor do dia para vestir ou ter por perto</span></div>
      </div>
      ${(() => {
        const sem = diasPessoais(M, d, 7), fut = sem.slice(1), am = sem[1];
        const bd = melhor(fut, "dinheiro"), ba = melhor(fut, "amor"), bp = melhor(fut, "pausa");
        const oa = DIARIO.orientacao({ diaPessoal: am.dp, destino: M.destino, faseIdx: am.fi, data: am.dt });
        const mesNovo = S.mesVisto !== ymKey(d);
        return `<div class="card">
          <div class="card-cab"><span class="mini">Sua semana</span><span class="chip">próximos 7 dias</span></div>
          <div class="sem-grade">${sem.map((x, i) => `<div class="sem-dia ${i === 0 ? "hoje" : ""} ${x === bd ? "ouro" : ""}"><small>${DIAS_C[x.dt.getDay()]}</small><b>${x.dp}</b><span>${x === bd ? "◈" : x === ba ? "♡" : x === bp ? "☾" : "·"}</span></div>`).join("")}</div>
          <ul class="lista" style="margin-top:8px">
            <li><span class="ic">◈</span><span><b>Melhor dia para dinheiro:</b> ${diaExt(bd)} · dia ${bd.dp}, ${esc(NUM.CICLO[bd.dp].palavra)}</span></li>
            <li><span class="ic">♡</span><span><b>Melhor dia para amor:</b> ${diaExt(ba)} · dia ${ba.dp}, ${esc(NUM.CICLO[ba.dp].palavra)}</span></li>
            <li><span class="ic">☾</span><span><b>Dia de pausa:</b> ${diaExt(bp)} · dia ${bp.dp}, ${esc(NUM.CICLO[bp.dp].palavra)}</span></li>
          </ul>
          <div class="amanha"><div class="mini">Amanhã · dia pessoal ${am.dp} · ${esc(NUM.CICLO[am.dp].palavra)}</div>${clube() ? `<p>${esc(oa.dinheiro)}</p><span class="chip verde">Clube · amanhã liberado</span>` : `<p class="borrado">${esc(oa.dinheiro)}</p><span class="chip violeta tranca" data-portal="clube" role="button" tabindex="0">☾ abre à meia-noite · ver agora com o Clube</span>`}</div>
          <button class="btn ${mesNovo ? "primario" : "fantasma"} pequeno" data-ir="hoje" data-sub='"mes"' style="width:100%;margin-top:12px">${mesNovo ? "✦ Sua previsão de " + MESES[d.getMonth()] + " chegou" : "Previsão de " + MESES[d.getMonth()] + " ›"}</button>
        </div>`;
      })()}
      ${d.getMonth() >= 9 ? `<div class="card clique ouro-b" data-ir="ceu" data-sub='"ano"'><div class="card-cab"><span class="mini">Reta final do ano</span><span class="chip ouro">ano pessoal ${M.anoPessoalProx}</span></div><h3>Sua Previsão ${d.getFullYear() + 1} está pronta</h3><p class="sub" style="margin:6px 0 0">${esc(NUM.CICLO[M.anoPessoalProx].tema)}: veja o que o próximo ano pede de você ›</p></div>` : ""}
      <div class="card clique" data-ir="ceu">
        <div class="card-cab"><span class="mini">Lua agora</span><span class="chip">${M.lua.iluminacao}% iluminada</span></div>
        <div style="display:flex;gap:14px;align-items:center"><div class="lua-ic">${M.lua.icone}</div><div><h3>${esc(M.lua.nome)}</h3><p class="sub" style="margin:2px 0 0">${esc(M.lua.intencao)}</p></div></div>
      </div>
      <div class="card">
        <div class="card-cab"><span class="mini">Nome sagrado do dia</span><span class="chip violeta">${M.nome72.n} de 72</span></div>
        <div style="display:flex;gap:16px;align-items:center"><div class="hebraica" style="font-size:40px" dir="rtl">${M.nome72.letras}</div><div><h3>${esc(M.nome72.intencao)}</h3><p class="sub" style="margin:2px 0 0">Olhe para as letras por 30 segundos, da direita para a esquerda, respirando devagar. Não precisa pronunciar: a tradição diz que a forma já comunica.</p></div></div>
      </div>
      <button class="btn fantasma" data-momento="praticar" style="margin-bottom:14px">Seguir para a prática de hoje ›</button>
      ` : mo === "praticar" ? `
      ${GUIA_APP.cardHoje()}
      <div class="card">
        <div class="card-cab"><span class="mini">Check-in de energia</span>${nivel ? `<span class="chip violeta">nível ${nivel} de 22</span>` : ""}</div>
        <p class="sub" style="margin-bottom:10px">Como você está se sentindo agora? Na lei da atração, o sentimento mostra a frequência que você emite.</p>
        <select id="nivel"><option value="0">Escolher…</option>${KABALA.ESCALA.map(e => `<option value="${e.nivel}" ${e.nivel === nivel ? "selected" : ""}>${e.nivel}. ${esc(e.nome)}</option>`).join("")}</select>
        ${faixa ? `<p style="margin-top:12px">${esc(KABALA.SUBIDA[faixa])}</p>${faixa !== "alto" ? `<button class="btn neon pequeno" data-ir="guia" data-sub='"resgate"' style="width:100%">Fazer um resgate de frequência agora ›</button>` : ""}` : ""}
      </div>
      <div class="card">
        <div class="mini" style="margin-bottom:8px">Intenção de hoje · método WOOP</div>
        <p class="sub" style="margin-bottom:10px">Desejo, obstáculo e plano. Pesquisas de Gabriele Oettingen mostram que imaginar o obstáculo junto do desejo é o que faz a intenção virar ação.</p>
        <div class="campo"><label>O que eu desejo hoje</label><input data-dia="desejo" value="${esc(dia.desejo || "")}" placeholder="Ex.: separar R$ 20 para o meu objetivo"></div>
        <div class="campo"><label>O que pode atrapalhar</label><input data-dia="obstaculo" value="${esc(dia.obstaculo || "")}" placeholder="Ex.: a vontade de pedir delivery"></div>
        <div class="campo"><label>Se acontecer isso, então eu…</label><input data-dia="plano" value="${esc(dia.plano || "")}" placeholder="Ex.: bebo água, espero 10 minutos e cozinho"></div>
        <span class="salvo" id="salvo-dia">salvo ✓</span>
        <p class="aviso" style="margin:6px 0 0">Daqui a 7 dias o app pergunta se aconteceu.</p>
      </div>
      <button class="btn fantasma" data-momento="fechar" style="margin-bottom:14px">Seguir para fechar o dia ›</button>
      ` : `
      <div class="card ouro-b"><span class="brilho o"></span>
        <div class="mini" style="margin-bottom:8px">Frequência da noite</div>
        <p class="freq">“${esc(M.freqNoite.freq)}”</p>
        <p class="aviso">Repita mentalmente ao deitar. Que o último pensamento do dia seja sobre o que você deseja, não sobre o que teme.</p>
        ${dia.noite ? `<button class="btn feito" disabled style="margin-top:6px">✓ Dia fechado</button>` : `<button class="btn primario" id="fechar-dia" style="margin-top:6px">Repeti minha frequência · fechar o dia ✦</button>`}
      </div>
      ${lemb ? `<div class="card ouro-b" id="lembranca"><span class="brilho o"></span>
        <div class="card-cab"><span class="mini">Há ${lemb.dias} dias você desejou</span></div>
        <p class="freq" style="font-size:19px">“${esc(lemb.desejo)}”</p>
        <p class="sub" style="margin-bottom:10px">Aconteceu?</p>
        <div class="linha-btn"><button class="btn primario pequeno" data-res="sim" data-k="${lemb.k}">Sim ✦</button><button class="btn fantasma pequeno" data-res="parte" data-k="${lemb.k}">Em parte</button><button class="btn fantasma pequeno" data-res="nao" data-k="${lemb.k}">Ainda não</button></div>
      </div>` : ""}
      <div class="card">
        <div class="card-cab"><span class="mini">Sinais e conquistas</span><span class="chip verde">${nProvas} ${nProvas === 1 ? "prova" : "provas"}</span></div>
        <p class="sub" style="margin-bottom:10px">Percebeu um sinal hoje? Um desconto, uma ajuda, uma ideia, um número repetido. Registrar treina o olhar para a abundância.</p>
        <div style="display:flex;gap:8px"><input id="sinal" placeholder="Ex.: recebi um Pix que não esperava" maxlength="160"><button class="btn primario pequeno" id="sinal-ok" style="flex:0 0 auto">Guardar</button></div>
        <button class="btn fantasma pequeno" data-ir="hoje" data-sub='"provas"' style="margin-top:10px;width:100%">Ver meu caderno de provas ›</button>
      </div>
      <button class="btn neon" id="compartilhar">Compartilhar minha energia de hoje ✦</button>
      `}</div>
      <p class="aviso center" style="margin-top:14px">Orientação simbólica para reflexão. Não substitui aconselhamento financeiro, psicológico ou médico.</p>
    </section>`;
  }

  function telaProvas() {
    const itens = provas(), seq = sequencia();
    const rot = { sinal: ["✦", "Sinal"], conquista: ["★", "Desejo realizado"], pratica: ["➶", "Prática"] };
    return `<section class="pagina">
      <header class="topo">${voltar("hoje")}<span class="chip verde">${itens.length} ${itens.length === 1 ? "prova" : "provas"}</span></header>
      <div class="mini">Seu caderno de provas</div>
      <h1 style="margin:8px 0">O que já está acontecendo</h1>
      <p class="sub">Nos dias de dúvida, volte aqui. Tudo isto foi você quem viveu e registrou.</p>
      <div class="grade2" style="margin:14px 0">
        <div class="card" style="margin:0"><div class="mini">Sequência atual</div><div class="num-medio">${seq}</div><div class="sub" style="font-size:13px">${seq === 1 ? "noite" : "noites"} seguidas</div></div>
        <div class="card" style="margin:0"><div class="mini">Melhor sequência</div><div class="num-medio">${Math.max(S.melhorSeq || 0, seq)}</div><div class="sub" style="font-size:13px">seu recorde</div></div>
      </div>
      <div class="card">${itens.length ? itens.map(i => `<div class="evento"><div class="d" style="font-size:20px">${rot[i.tipo][0]}<small>${fmtCurta(i.data).slice(0, 5)}</small></div><div><div class="mini">${rot[i.tipo][1]}</div><div>${esc(i.texto)}</div></div></div>`).join("") : `<p class="sub" style="margin:0">Ainda vazio. Registre o primeiro sinal na tela Hoje. Cada desejo que você confirmar também aparece aqui.</p>`}</div>
    </section>`;
  }

  function telaMes(M) {
    const h = new Date(), ano = h.getFullYear(), mes = h.getMonth(), ym = ymKey(h);
    if (S.mesVisto !== ym) { S.mesVisto = ym; salvar(); }
    const nDias = new Date(ano, mes + 1, 0).getDate(), dias = diasPessoais(M, new Date(ano, mes, 1), nDias);
    const mp = NUM.mesPessoal(M.d, M.m, ano, mes + 1), info = CICLOS.MES[mp];
    const top = k => dias.slice().sort((a, b) => b.pts[k] - a.pts[k]).slice(0, 3).sort((a, b) => a.dt - b.dt);
    const ouro = top("dinheiro"), amor = top("amor"), luas = luasDoMes(dias);
    const prox = new Date(ano, mes + 1, 1), faltam = Math.ceil((prox - h) / 86400000);
    const mpProx = NUM.mesPessoal(M.d, M.m, prox.getFullYear(), prox.getMonth() + 1);
    const vazios = new Date(ano, mes, 1).getDay();
    return `<section class="pagina">
      <header class="topo">${voltar("hoje")}<span class="chip ouro">mês pessoal ${mp}</span></header>
      <div class="mini">Previsão de ${MESES[mes]} de ${ano}</div>
      <h1 style="margin:8px 0">Seu mês é de ${esc(info.palavra.toLowerCase())}.</h1>
      <div class="card neon"><span class="brilho v"></span>
        <div class="num-hero"><div class="num-grande">${mp}</div><div><h2>${esc(info.palavra)}</h2><p class="sub" style="margin:4px 0 0">${esc(NUM.CICLO[mp].resumo)}</p></div></div>
        <div class="sep"></div><p>${esc(info.texto)}</p>
        <div class="area"><div class="ic">◈</div><div><div class="mini">Dinheiro no mês</div><p>${esc(info.dinheiro)}</p></div></div>
        <div class="area"><div class="ic">✦</div><div><div class="mini">Ritual do mês</div><p>${esc(info.ritual)}</p></div></div>
      </div>
      ${trava("clube", `      <div class="card ouro-b">
        <div class="card-cab"><span class="mini">Seus dias de ouro</span><span class="chip ouro">dinheiro</span></div>
        ${ouro.map(x => `<div class="evento"><div class="d">${x.dt.getDate()}<small>${DIAS_C[x.dt.getDay()]}</small></div><div><b>Dia pessoal ${x.dp} · ${esc(NUM.CICLO[x.dp].palavra)}</b><div class="sub" style="font-size:13.5px">${esc(NUM.CICLO[x.dp].fazer.join(" · "))}</div></div></div>`).join("")}
      </div>
      <div class="card">
        <div class="card-cab"><span class="mini">Dias de afeto e portais da Lua</span></div>
        ${amor.map(x => `<div class="evento"><div class="d">${x.dt.getDate()}<small>${DIAS_C[x.dt.getDay()]}</small></div><div><b>♡ Dia pessoal ${x.dp} · ${esc(NUM.CICLO[x.dp].palavra)}</b><div class="sub" style="font-size:13.5px">Bom para conversas, encontros e reconciliações.</div></div></div>`).join("")}
        ${luas.map(l => `<div class="evento"><div class="d">${l.dt.getDate()}<small>${DIAS_C[l.dt.getDay()]}</small></div><div><b>${l.icone} ${l.tipo}</b><div class="sub" style="font-size:13.5px">${l.tipo === "Lua Nova" ? "Plante a intenção do novo ciclo." : "Colha, agradeça e celebre."}</div></div></div>`).join("")}
      </div>
      <div class="card">
        <div class="card-cab"><span class="mini">Calendário do seu mês</span><span class="chip">número = dia pessoal</span></div>
        <div class="cal">${"DSTQQSS".split("").map(l => `<small>${l}</small>`).join("")}${"<i></i>".repeat(vazios)}${dias.map(x => `<div class="${ouro.includes(x) ? "ouro" : ""} ${x.dt.getDate() === h.getDate() ? "hoje" : ""}"><small>${x.dt.getDate()}</small><b>${x.dp}</b></div>`).join("")}</div>
      </div>`, "Seus dias de ouro, dias de afeto e o calendário completo do mês.")}
      <div class="card trancado"><span class="brilho v"></span>
        <div class="card-cab"><span class="mini">Previsão de ${MESES[prox.getMonth()]}</span><span class="chip violeta">abre em ${faltam} ${faltam === 1 ? "dia" : "dias"}</span></div>
        <div class="num-hero"><div class="num-medio" style="font-size:56px">${mpProx}</div><div><h3 class="borrado">${esc(CICLOS.MES[mpProx].palavra)} · ${esc(CICLOS.MES[mpProx].texto.slice(0, 60))}</h3></div></div>
        <p class="aviso" style="margin-top:10px">A previsão completa, com seus dias de ouro, é liberada no dia 1.</p>
      </div>
    </section>`;
  }

  function telaCiclo(M) {
    const h = new Date(), L = ASTROS.lunacao(h), tema = CICLOS.TEMAS[((L.n % 12) + 12) % 12], reg = S.luas[L.n] || {};
    const dataMarco = m => new Date(L.inicio.getTime() + m.abre * 86400000);
    const fmt = dt => `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}`;
    const atual = CICLOS.MARCOS.filter(m => m.abre <= L.idade).pop();
    const antigos = Object.keys(S.luas).map(Number).filter(n => n !== L.n && S.luas[n] && S.luas[n].nova).sort((a, b) => b - a);
    return `<section class="pagina">
      <header class="topo">${voltar("ceu")}<span class="chip ouro">ciclo ${fmt(L.inicio)} a ${fmt(L.fim)}</span></header>
      <div class="mini">Ciclo da Lua · o ritmo da sua prática</div>
      <h1 style="margin:8px 0">Tema deste ciclo: ${esc(tema.nome)}</h1>
      <div class="card neon"><span class="brilho v"></span>
        <p class="freq">“${esc(tema.frase)}”</p>
        <p style="margin-top:10px">${esc(tema.pergunta)}</p>
        ${barra(L.idade / ASTROS.SINODICO * 100)}
        <p class="aviso" style="margin-top:8px">Dia ${Math.floor(L.idade) + 1} de 29. A cada lua nova começa um ciclo com um tema novo e quatro encontros com o seu caderno.</p>
      </div>
      ${CICLOS.MARCOS.map(m => { const aberto = m.abre <= L.idade, dt = dataMarco(m); return `<div class="card ${m === atual ? "ouro-b" : ""} ${aberto ? "" : "trancado"}">
        <div class="card-cab"><span class="mini">${m.icone} ${esc(m.nome)}</span><span class="chip ${m === atual ? "ouro" : ""}">${aberto ? (m === atual ? "agora" : "desde " + fmt(dt)) : "abre em " + fmt(dt)}</span></div>
        ${aberto && m.k !== "nova" && !clube() ? `<p class="sub borrado" style="margin-bottom:10px">${esc(m.guia)}</p><button class="btn primario pequeno" data-portal="clube" style="width:100%">Abrir este encontro com o Clube</button>` : aberto ? `<p class="sub">${esc(m.guia)}</p><textarea data-lua="${m.k}" data-n="${L.n}" style="min-height:90px" placeholder="Escreva aqui…">${esc(reg[m.k] || "")}</textarea>` : `<p class="sub borrado" style="margin:0">${esc(m.guia)}</p>`}
      </div>`; }).join("")}
      <div class="card trancado"><div class="card-cab"><span class="mini">Próximo ciclo</span><span class="chip violeta">começa em ${fmt(L.fim)}</span></div><p class="sub" style="margin:0">O tema é revelado na lua nova.</p></div>
      ${antigos.length ? `<div class="card"><div class="mini" style="margin-bottom:8px">Ciclos anteriores</div>${antigos.map(n => `<div class="evento"><div class="d" style="font-size:20px">🌑</div><div><div class="mini">${esc(CICLOS.TEMAS[((n % 12) + 12) % 12].nome)}</div><div>${esc(S.luas[n].nova)}</div></div></div>`).join("")}</div>` : ""}
    </section>`;
  }

  function telaCompat(M) {
    const eu = { destino: M.destino, expressao: M.expressao };
    const cards = (S.pessoas || []).map((p, i) => {
      const exp = NUM.expressao(p.nome); let dest = exp, sg = null;
      if (p.nascimento) { const [a, m, d] = p.nascimento.split("-").map(Number); dest = NUM.destino(d, m, a); sg = ASTROS.signo(d, m); }
      const c = CICLOS.compat(eu, { destino: dest, expressao: exp }), s = NUM.SIGNIFICADOS[dest];
      return `<div class="card ${i === 0 ? "neon" : ""}">${i === 0 ? '<span class="brilho v"></span>' : ""}
        <div class="card-cab"><span class="mini">${esc(p.relacao)}</span><button class="voltar" data-rm="${i}" style="padding:4px 10px;font-size:12px">remover</button></div>
        <div class="num-hero"><div class="anel" style="width:92px;height:92px"><div class="num-medio" style="font-size:30px">${c.pts}%</div></div><div><h2>${esc(p.nome.split(" ")[0])}</h2><p class="sub" style="margin:4px 0 0">${p.nascimento ? "Destino" : "Vibração do nome"} ${dest} · ${esc(s.nome)}${sg ? " · " + sg.simbolo + " " + esc(sg.nome) : ""}</p></div></div>
        <div class="sep"></div>
        <h3>${esc(c.par.titulo)}${c.espelho ? " · espelho" : ""}</h3>
        <p style="margin-top:6px">${esc(c.par.texto)}${c.espelho ? " Vocês têm o mesmo número: reconhecem-se de imediato, nas qualidades e nos defeitos." : ""}</p>
        <div class="area"><div class="ic">◈</div><div><div class="mini">Juntos no dinheiro</div><p>${esc(c.par.dinheiro)}</p></div></div>
        <div class="area"><div class="ic">♡</div><div><div class="mini">Como chegar nessa pessoa</div><p>${esc(c.aoLado)}</p></div></div>
        ${p.nascimento ? `<p class="aviso" style="margin-top:10px">Pelos dias de nascimento (${M.d} e ${Number(p.nascimento.split("-")[2])}): ${{ harmonia: "números em harmonia natural", neutro: "números neutros entre si", atrito: "números que pedem paciência um com o outro" }[PROFUNDO.harmonia(M.d, Number(p.nascimento.split("-")[2]))]}.</p>` : ""}
      </div>`;
    }).join("");
    return `<section class="pagina">
      <header class="topo">${voltar("mapa")}</header>
      <div class="mini">Compatibilidade</div>
      <h1 style="margin:8px 0">Quem caminha com você</h1>
      <p class="sub">Compare seu mapa com o de alguém: parceiro, filho, sócia, ou até o nome do seu negócio. ${window.PREMIUM && !PREMIUM.liberado("amor") ? "A primeira pessoa é por conta da casa." : ""}</p>
      <div class="card">
        <div class="campo"><label>Nome completo da pessoa ou do negócio</label><input id="c-nome" placeholder="João Carlos Pereira"></div>
        <div class="grade2"><div class="campo"><label>Nascimento (opcional)</label><input id="c-nasc" type="date"></div>
        <div class="campo"><label>Relação</label><select id="c-rel"><option>Amor</option><option>Filho ou filha</option><option>Família</option><option>Amizade</option><option>Sociedade ou trabalho</option><option>Meu negócio</option></select></div></div>
        <button class="btn primario" id="c-add">Calcular sintonia ✦</button>
      </div>
      ${cards}
      <p class="aviso center">Sintonia simbólica para reflexão e conversa. Nenhum número decide uma relação.</p>
    </section>`;
  }

  function telaMapa(M) {
    const sig = NUM.SIGNIFICADOS[M.destino], sef = KABALA.sefiraDe(M.destino), sefE = KABALA.sefiraDe(M.expressao);
    const sc = secoes("mapa", [["essencia", "Essência"], ["nome", "Meu nome"], ["momento", "Meu momento"]]), tudo = sc.at === "tudo";
    const bloco = (rot, n, desc) => { const s = NUM.SIGNIFICADOS[n]; return `<div class="card" style="margin:0"><div class="mini">${rot}</div><div style="display:flex;align-items:baseline;gap:10px;margin:6px 0 4px"><span class="num-medio">${n}</span><b>${esc(s.nome)}</b></div><p class="sub" style="margin:0;font-size:13.5px">${esc(desc)}</p></div>`; };
    return `<section class="pagina">
      ${topo("Seu mapa cabalístico")}
      ${sc.html}
      ${sc.at === "essencia" || tudo ? `<div class="sec-corpo">
      <h1>${esc(S.perfil.nome.split(" ")[0])}, seu número de destino é</h1>
      <div class="card neon" style="margin-top:14px"><span class="brilho v"></span><span class="brilho o"></span>
        <div class="num-hero"><div class="anel"><div class="num-grande" style="font-size:64px;min-width:0">${M.destino}</div></div><div><h2>${esc(sig.nome)}</h2><p class="sub" style="margin:4px 0 8px">Sefirá <b>${esc(sef.nome)}</b> · ${esc(sef.pt)}</p><div class="hebraica">${esc(sig.hebraica)}</div></div></div>
        <div class="sep"></div>
        <p>${esc(sig.essencia)}</p>
        <div class="mini" style="margin:12px 0 6px">Sua prosperidade</div><p>${esc(sig.prosperidade)}</p>
        <div class="grade2" style="margin-top:12px">
          <div><div class="mini">Planeta</div><b>${esc(sig.planeta)}</b></div>
          <div><div class="mini">Elemento</div><b>${esc(sig.elemento)}</b></div>
          <div><div class="mini">Cor de poder</div><b style="display:flex;align-items:center;gap:6px"><i style="width:14px;height:14px;border-radius:50%;background:${sig.corHex};display:inline-block;box-shadow:0 0 10px ${sig.corHex}"></i>${esc(sig.cor)}</b></div>
          <div><div class="mini">Pedra</div><b>${esc(sig.pedra)}</b></div>
        </div>
        <div class="sep"></div>
        <div class="mini" style="margin-bottom:6px">Luz</div>${chips(sig.luz, "ouro")}
        <div class="mini" style="margin:10px 0 6px">Sombra a observar</div>${chips(sig.sombra)}
      </div>
      <div class="card ouro-b"><div class="mini" style="margin-bottom:8px">Sua frequência pessoal</div><p class="freq">“${esc(sig.frequencia)}”</p></div>
      ${(() => { const L = COMBOS.ler(M.destino, M.expressao, M.motivacao); return `<div class="card clique neon" data-ir="mapa" data-sub='"profundo"'><span class="brilho r"></span>
        <div class="card-cab"><span class="mini">Como seus números conversam</span><span class="chip violeta">${M.destino} · ${M.expressao} · ${M.motivacao}</span></div>
        <ul class="lista">${L.resumo.map(t => `<li><span class="ic">✦</span><span>${esc(t)}</span></li>`).join("")}</ul>
        <button class="btn primario pequeno" style="width:100%;margin-top:10px" data-ir="mapa" data-sub='"profundo"'>Abrir meu Mapa Profundo ›</button></div>`; })()}
      </div>` : ""}
      ${sc.at === "nome" || tudo ? `<div class="sec-corpo">
      <h1>O que o seu nome carrega</h1>
      <p class="sub">Cada letra tem um valor. Somadas, mostram quatro lados seus.</p>
      <div class="grade2" style="margin-bottom:14px">
        ${bloco("Expressão · quem você é", M.expressao, "A soma de todas as letras: seus talentos naturais.")}
        ${bloco("Motivação · o que sua alma quer", M.motivacao, "A soma das vogais: o desejo íntimo que move suas escolhas.")}
        ${bloco("Impressão · como te veem", M.impressao, "A soma das consoantes: a primeira imagem que você passa.")}
        ${bloco("Dia natal · seu dom", M.dia, "O dia em que nasceu: um talento específico para o seu caminho.")}
      </div>
      <div class="card">
        <div class="card-cab"><span class="mini">Gematria do seu nome</span><span class="chip">tabela cabalística 1 a 8</span></div>
        <div class="letras">${S.perfil.nome.trim().split(/\s+/).map(w => NUM.letras(w).map(x => `<span class="${x.vogal ? "vogal" : ""}">${esc(x.l)}<small>${x.v}</small></span>`).join("")).join('<span class="esp"></span>')}</div>
        <p class="aviso" style="margin-top:10px">Vogais em violeta formam a Motivação; consoantes, a Impressão. Tudo junto, a Expressão. Acentos somam valor: agudo +2, til +3, circunflexo +7.</p>
        <button class="btn fantasma pequeno" style="width:100%" data-ir="mapa" data-sub='"nome"'>Nome de Poder: assinatura, negócio e bebê ›</button>
      </div>
      <div class="card">
        <div class="card-cab"><span class="mini">Sua posição na Árvore da Vida</span></div>
        ${arvoreSVG([sef.n === 11 ? 11 : sef.n, sefE.n === 11 ? 11 : sefE.n])}
        <div class="grade2" style="margin-top:12px">
          <div><div class="mini">Destino</div><b>${esc(sef.nome)}</b><div class="sub" style="font-size:13px">${esc(sef.pt)} · ${esc(sef.planeta)} · virtude: ${esc(sef.virtude)}</div></div>
          <div><div class="mini">Expressão</div><b>${esc(sefE.nome)}</b><div class="sub" style="font-size:13px">${esc(sefE.pt)} · ${esc(sefE.planeta)} · virtude: ${esc(sefE.virtude)}</div></div>
        </div>
      </div>
      ${M.carmicas.length ? `<div class="card"><div class="mini" style="margin-bottom:8px">Lições cármicas</div>${M.carmicas.map(c => `<p><b>${c.n}</b> ${esc(c.onde)}: ${esc(c.t)}</p>`).join("")}</div>` : ""}
      </div>` : ""}
      ${sc.at === "momento" || tudo ? `<div class="sec-corpo">
      <h1>O seu momento</h1>
      <p class="sub">O signo, o ano que você está vivendo e quem caminha ao seu lado.</p>
      <div class="card">
        <div class="card-cab"><span class="mini">Seu signo solar</span><span class="chip">${M.signo.simbolo} ${esc(M.signo.elemento)}</span></div>
        <h3>${esc(M.signo.nome)} <span class="sub" style="font-weight:400">· regido por ${esc(M.signo.regente)}</span></h3>
        <p style="margin:8px 0">${esc(M.signo.prosp)}</p>${chips(M.signo.palavras, "violeta")}
        <button class="btn fantasma pequeno" style="width:100%;margin-top:12px" data-ir="mapa" data-sub='"lua"'>Seu Sol é só um terço: ver Lua e Ascendente ›</button>
      </div>
      <div class="card">
        <div class="card-cab"><span class="mini">Seus ciclos</span></div>
        <div class="grade3">
          <div><div class="mini">Ano pessoal ${M.anoRef}</div><div class="num-medio">${M.anoPessoal}</div><div class="sub" style="font-size:12.5px">${esc(NUM.CICLO[M.anoPessoal].tema)}</div></div>
          <div><div class="mini">Mês pessoal</div><div class="num-medio">${M.mesPessoal}</div><div class="sub" style="font-size:12.5px">${esc(NUM.CICLO[M.mesPessoal].tema)}</div></div>
          <div><div class="mini">Ano pessoal ${M.anoRef + 1}</div><div class="num-medio">${M.anoPessoalProx}</div><div class="sub" style="font-size:12.5px">${esc(NUM.CICLO[M.anoPessoalProx].tema)}</div></div>
        </div>
        <div class="sep"></div>
        <p>${esc(NUM.CICLO[M.anoPessoal].ano)}</p>
      </div>
      <div class="card clique neon" data-ir="mapa" data-sub='"compat"'><span class="brilho r"></span>
        <div class="card-cab"><span class="mini">Compatibilidade</span><span class="chip violeta">${(S.pessoas || []).length} ${(S.pessoas || []).length === 1 ? "pessoa" : "pessoas"}</span></div>
        <h3>Quem caminha com você</h3>
        <p class="sub" style="margin:6px 0 0">Compare seu mapa com o do parceiro, dos filhos, de uma sócia ou do nome do seu negócio ›</p>
      </div>
      </div>` : ""}
    </section>`;
  }

  function arvoreSVG(acesas) {
    const S10 = KABALA.SEFIROT, by = n => n === 11 ? KABALA.sefiraDe(11) : S10[n - 1];
    const linhas = KABALA.CAMINHOS.map(([a, b]) => { const p = S10[a - 1], q = S10[b - 1]; return `<line class="c" x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}"/>`; }).join("");
    const nos = S10.concat(acesas.includes(11) ? [by(11)] : []).map(s => { const on = acesas.includes(s.n); return `<g><circle class="s ${on ? "on" : ""}" cx="${s.x}" cy="${s.y}" r="15" ${s.oculta ? 'stroke-dasharray="3 2"' : ""}/><text class="${on ? "on" : ""}" x="${s.x}" y="${s.y + 3}">${s.n === 11 ? "Daath" : s.nome}</text></g>`; }).join("");
    return `<svg class="arvore" viewBox="0 0 200 300" role="img" aria-label="Árvore da Vida">${linhas}${nos}</svg>`;
  }

  function telaCeu(M) {
    const hoje = new Date(), k = hojeKey(hoje);
    const proximos = ASTROS.CALENDARIO.filter(e => e.data >= k).slice(0, 6);
    const anoV = CONFIG.anoVirada || (hoje.getMonth() === 0 && hoje.getDate() === 1 ? hoje.getFullYear() : hoje.getFullYear() + 1);
    const alvo = new Date(anoV, 0, 1), diff = Math.max(0, alvo - hoje);
    const dd = Math.floor(diff / 86400000), hh = Math.floor(diff / 3600000) % 24, mm = Math.floor(diff / 60000) % 60;
    const apProx = NUM.anoPessoal(M.d, M.m, anoV), cp = NUM.CICLO[apProx];
    const corIdx = ({ 1: 3, 2: 4, 3: 1, 4: 2, 5: 7, 6: 4, 7: 6, 8: 1, 9: 0 })[apProx];
    const corV = ASTROS.VIRADA.cores[corIdx];
    const univ = NUM.anoUniversal(anoV);
    const sc = secoes("ceu", [["agora", "Agora"], ["calendario", "Calendário"], ["virada", "Virada " + anoV]]);
    return `<section class="pagina">
      ${topo("Lua, calendário e virada")}
      ${sc.html}
      ${sc.at === "agora" ? `<div class="sec-corpo">
      <h1>O céu de hoje</h1>
      <p class="sub">A Lua marca o ritmo: quando plantar, quando agir, quando soltar.</p>
      <div class="card neon"><span class="brilho v"></span>
        <div class="card-cab"><span class="mini">Lua agora</span><span class="chip">${M.lua.iluminacao}% · dia ${M.lua.idade} do ciclo</span></div>
        <div style="display:flex;gap:16px;align-items:center"><div class="lua-ic" style="font-size:72px">${M.lua.icone}</div><div><h2>${esc(M.lua.nome)}</h2><p style="margin:6px 0">${esc(M.lua.intencao)}</p><span class="chip ouro">Hoje: ${esc(M.lua.acao)}</span></div></div>
      </div>
      ${(() => { const L = ASTROS.lunacao(hoje), t = CICLOS.TEMAS[((L.n % 12) + 12) % 12], feito = S.luas[L.n] && Object.values(S.luas[L.n]).filter(Boolean).length || 0;
        return `<div class="card clique" data-ir="ceu" data-sub='"ciclo"'>
          <div class="card-cab"><span class="mini">Ciclo da Lua · dia ${Math.floor(L.idade) + 1} de 29</span><span class="chip ouro">${feito} de 4 encontros</span></div>
          <h3>Tema: ${esc(t.nome)}</h3><p class="sub" style="margin:6px 0 10px">${esc(t.pergunta)}</p>${barra(L.idade / ASTROS.SINODICO * 100)}
          <p class="aviso" style="margin-top:8px">A cada lua nova, um tema novo e quatro encontros com o seu caderno. Toque para abrir ›</p></div>`; })()}
      </div>` : sc.at === "calendario" ? `<div class="sec-corpo">
      <h1>O que vem pela frente</h1>
      <p class="sub">As datas fortes das próximas semanas e os números que cruzam o seu dia.</p>
      <div class="card">
        <div class="card-cab"><span class="mini">Próximos portais</span></div>
        ${proximos.length ? proximos.map(e => { const d = new Date(e.data + "T12:00:00"); return `<div class="evento"><div class="d">${d.getDate()}<small>${MESES[d.getMonth()].slice(0, 3)}</small></div><div><b>${esc(e.titulo)}</b><div class="sub" style="font-size:13.5px">${esc(e.nota)}</div></div></div>`; }).join("") : `<p class="sub">O calendário desta edição terminou. Siga pela fase da Lua acima.</p>`}
      </div>
      <div class="card">
        <div class="card-cab"><span class="mini">Sinais e horários-espelho</span></div>
        <p class="sub" style="margin-bottom:10px">Quando um número repetido cruza o seu dia, a tradição lê como um recado. Anote e observe o que estava pensando na hora.</p>
        <ul class="lista">${Object.entries(NUM.ANJOS).map(([n, t]) => `<li><span class="ic" style="font-family:var(--serif);font-size:18px;min-width:38px">${n}</span><span>${esc(t)}</span></li>`).join("")}</ul>
      </div>
      </div>` : `<div class="sec-corpo">
      <h1>A virada para ${anoV}</h1>
      <p class="sub">O salto de ano: seu número, sua cor e os rituais da tradição.</p>
      <div class="card ouro-b"><span class="brilho o"></span>
        <div class="card-cab"><span class="mini">Contagem para ${anoV}</span><span class="chip ouro">ano universal ${univ}</span></div>
        <div class="contagem"><div><b>${dd}</b><small>dias</small></div><div><b>${hh}</b><small>horas</small></div><div><b>${mm}</b><small>min</small></div></div>
        <div class="sep"></div>
        <div class="mini" style="margin-bottom:6px">Seu ano pessoal em ${anoV}</div>
        <div class="num-hero"><div class="num-medio" style="font-size:56px">${apProx}</div><div><h3>${esc(cp.tema)}</h3><p class="sub" style="margin:4px 0 0">${esc(cp.ano)}</p></div></div>
        <button class="btn primario pequeno" style="width:100%;margin-top:12px" data-ir="ceu" data-sub='"ano"'>Abrir minha Previsão ${anoV} ›</button>
      </div>
      <div class="card">
        <div class="card-cab"><span class="mini">Sua cor da virada</span></div>
        <div style="display:flex;gap:14px;align-items:center;margin-bottom:12px"><i style="width:48px;height:48px;border-radius:16px;background:${corV.hex};box-shadow:0 0 24px ${corV.hex};flex:0 0 auto"></i><div><h3>${esc(corV.cor)}</h3><p class="sub" style="margin:2px 0 0">Para ${esc(corV.para)}: a vibração do seu ano pessoal ${apProx}. Branco por baixo, para a paz, sempre combina.</p></div></div>
        <div class="cores">${ASTROS.VIRADA.cores.map((c, i) => `<div class="cor ${i === corIdx ? "on" : ""}"><i style="background:${c.hex}"></i>${esc(c.cor.split(" / ")[0])}<br><span style="opacity:.7">${esc(c.para)}</span></div>`).join("")}</div>
      </div>
      <div class="card">
        <div class="card-cab"><span class="mini">Rituais de virada</span><span class="chip">tradição brasileira</span></div>
        <ul class="lista">${ASTROS.VIRADA.rituais.map(r => `<li><span class="ic">✦</span><span><b>${esc(r.t)}.</b> ${esc(r.d)}</span></li>`).join("")}</ul>
      </div>
      </div>`}
    </section>`;
  }

  function telaEu(M) {
    return `<section class="pagina">
      ${topo("Seu perfil")}
      <h1>${esc(S.perfil.nome)}</h1>
      <p class="sub">Nascida em ${fmtCurta(S.perfil.nascimento)} · ${M.signo.simbolo} ${esc(M.signo.nome)} · destino ${M.destino}</p>
      <div class="card">
        <div class="campo"><label>Nome completo</label><input id="p-nome" value="${esc(S.perfil.nome)}"></div>
        <div class="campo"><label>Data de nascimento</label><input id="p-nasc" type="date" value="${S.perfil.nascimento}"></div>
        <div class="grade2"><div class="campo"><label>Meu foco</label><select id="p-foco">${Object.entries(COMBOS.FOCO).map(([k, f]) => `<option value="${k}" ${S.foco === k ? "selected" : ""}>${f.nome}</option>`).join("")}</select></div>
        <div class="campo"><label>Tratamento</label><select id="p-genero"><option value="f" ${S.genero !== "m" ? "selected" : ""}>Feminino</option><option value="m" ${S.genero === "m" ? "selected" : ""}>Masculino</option></select></div></div>
        <button class="btn primario" id="p-salvar">Salvar alterações</button>
      </div>
      ${window.CONTA ? `<div class="card neon"><span class="brilho v"></span>${contaHTML()}</div>` : ""}
      <div class="card">
        <div class="mini" style="margin-bottom:10px">Lembrete da noite</div>
        <p class="sub" style="margin-bottom:10px">Adicione ao calendário do celular um lembrete diário às 21h para abrir sua carta e fazer a prática do dia.</p>
        <button class="btn neon pequeno" id="lembrete" style="width:100%">Lembrar toda noite às 21h</button>
        <button class="btn fantasma pequeno" id="rever-tour" style="width:100%;margin-top:10px">Rever a apresentação da Estela</button>
        <div class="sep"></div>
        <div class="mini" style="margin-bottom:10px">Seus dados</div>
        <div class="linha-btn"><button class="btn fantasma" id="exportar">Baixar backup</button><button class="btn fantasma" id="importar-btn">Restaurar</button></div>
        <input type="file" id="importar" accept="application/json" class="oculto">
        <div class="linha-btn" style="margin-top:10px"><button class="btn fantasma" id="imprimir">Imprimir mapa</button><button class="btn fantasma" id="apagar" style="color:#FFB3B3">Apagar tudo</button></div>
        <p class="aviso" style="margin-top:10px">Tudo fica salvo apenas neste aparelho e navegador. Faça um backup antes de trocar de celular.</p>
      </div>
      <div class="card">
        <div class="mini" style="margin-bottom:8px">Aviso importante</div>
        <p class="aviso">O Segredo das Estrelas é um material de desenvolvimento pessoal. Não é aconselhamento financeiro, jurídico, psicológico ou médico e não garante nenhum resultado. Os conceitos da lei da atração, da numerologia, da Kabala e da astrologia aparecem como inspiração e metáfora, não como explicação científica. As decisões sobre seu dinheiro são sempre suas.</p>
        <p class="aviso">Se as dívidas estiverem tirando seu sono, procure os canais oficiais de negociação ou o Procon. Se a ansiedade estiver pesada demais, procure um profissional de saúde mental. Em momentos de crise, o CVV atende gratuitamente, 24 horas, pelo telefone 188.</p>
        <p class="aviso">© 2026 ${esc(CONFIG.nomeMarca)}. Uso pessoal e intransferível.</p>
      </div>
    </section>`;
  }

  /* ---------- eventos ---------- */
  function ligarEventos(M) {
    ((window.CDA_EXT || {}).eventos || []).forEach(fn => { try { fn(M); } catch (e) { console.warn("[ext] evento falhou:", e); toast("Algo não carregou nesta tela. Tente reabrir o app."); } });
    app.querySelectorAll("[data-ir]").forEach(el => el.addEventListener("click", ev => {
      if (ev.target.closest("input, textarea, select, button:not([data-ir])")) return;
      const sub = el.dataset.sub ? JSON.parse(el.dataset.sub) : null; ir(el.dataset.ir, sub, el.classList.contains("voltar"));
    }));

    // hoje
    const nivel = $("#nivel"); if (nivel) nivel.onchange = () => { const k = hojeKey(); S.dias[k] = Object.assign(S.dias[k] || {}, { nivel: Number(nivel.value) }); salvar(); presenca(); render(true); };
    const carta = $("#carta"); if (carta) { const revelar = () => { if (carta.classList.contains("virada")) return; const k = hojeKey(); S.dias[k] = Object.assign(S.dias[k] || {}, { carta: true }); salvar(); carta.classList.add("virada"); presenca(); setTimeout(() => render(true), 900); }; carta.onclick = revelar; carta.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); revelar(); } }; }
    const c2 = $("#carta2"); if (c2) c2.onclick = () => { const k = hojeKey(); S.dias[k] = Object.assign(S.dias[k] || {}, { carta2: true }); salvar(); render(true); };
    app.querySelectorAll("[data-res]").forEach(b => b.onclick = () => {
      const k = b.dataset.k, r = b.dataset.res, d = S.dias[k]; if (!d) return;
      d.resultado = r;
      if (r === "sim" || r === "parte") { S.sinais.push({ data: hojeKey(), tipo: "conquista", texto: (r === "parte" ? "Em parte: " : "") + d.desejo }); celebrar(); toast(r === "sim" ? "Guardado no seu caderno de provas ★" : "Meio caminho também é caminho. Guardado ★"); }
      else { const h = hojeKey(); S.dias[h] = S.dias[h] || {}; if (!S.dias[h].desejo) S.dias[h].desejo = d.desejo; toast("Tudo bem. Renovei essa intenção para hoje."); }
      salvar(); setTimeout(() => render(true), 700);
    });
    const sok = $("#sinal-ok"); if (sok) { const guardar = () => { const inp = $("#sinal"), t = inp.value.trim(); if (!t) return toast("Escreva o sinal antes de guardar."); S.sinais.push({ data: hojeKey(), tipo: "sinal", texto: t }); salvar(); presenca(); toast("Sinal guardado ✦"); render(true); }; sok.onclick = guardar; $("#sinal").onkeydown = e => { if (e.key === "Enter") guardar(); }; }
    app.querySelectorAll("[data-dia]").forEach(inp => inp.addEventListener("input", debounce(() => { const k = hojeKey(); S.dias[k] = Object.assign(S.dias[k] || {}, { [inp.dataset.dia]: inp.value }); salvar(); piscar("#salvo-dia"); }, 400)));
    const comp = $("#compartilhar"); if (comp) comp.onclick = () => compartilhar(M);
    app.querySelectorAll("[data-sec]").forEach(b => b.onclick = () => { const [a, v] = b.dataset.sec.split(":"); if (secSel[a] === v) return; secSel[a] = v; secMudou = true; render(true); const alvo = $(".secoes"); if (alvo && window.scrollY > alvo.offsetTop) window.scrollTo({ top: Math.max(0, alvo.offsetTop - 12) }); });
    app.querySelectorAll("[data-momento]").forEach(b => b.onclick = () => { momentoSel = b.dataset.momento; secMudou = true; if (rota.aba !== "hoje" || rota.sub) return ir("hoje"); render(true); const alvo = $(".momentos"); if (alvo) window.scrollTo({ top: Math.max(0, alvo.offsetTop - 12) }); });
    const fd = $("#fechar-dia"); if (fd) fd.onclick = () => { const k = hojeKey(); S.dias[k] = Object.assign(S.dias[k] || {}, { noite: true }); salvar(); presenca(); celebrar(); toast("Dia fechado ✦ até amanhã"); setTimeout(() => render(true), 700); };
    ESTELA.ligar();


    // ciclo da lua e compatibilidade
    app.querySelectorAll("[data-lua]").forEach(t => t.addEventListener("input", debounce(() => { const n = t.dataset.n; S.luas[n] = Object.assign(S.luas[n] || {}, { [t.dataset.lua]: t.value }); salvar(); presenca(); }, 500)));
    const cadd = $("#c-add"); if (cadd) cadd.onclick = () => {
      const nome = $("#c-nome").value.trim(), nasc = $("#c-nasc").value, rel = $("#c-rel").value;
      if (!NUM.normalizar(nome)) return toast("Digite o nome para calcular.");
      if (window.PREMIUM && !PREMIUM.liberado("amor") && (S.pessoas || []).length >= 1) return PREMIUM.abrir("amor");
      S.pessoas = [{ nome, nascimento: nasc || "", relacao: rel }].concat(S.pessoas || []).slice(0, 12); salvar(); render(true); toast("Sintonia calculada ✦");
    };
    app.querySelectorAll("[data-rm]").forEach(b => b.onclick = () => { S.pessoas.splice(Number(b.dataset.rm), 1); salvar(); render(true); });

    ligarConta();

    // perfil
    const ps = $("#p-salvar"); if (ps) ps.onclick = () => {
      const nome = $("#p-nome").value.trim(), nasc = $("#p-nasc").value;
      if (nome.split(/\s+/).length < 2 || !nasc) return toast("Nome completo e data são obrigatórios.");
      S.perfil = { nome, nascimento: nasc }; S.foco = $("#p-foco").value; S.genero = $("#p-genero").value; salvar(); toast("Mapa atualizado ✦"); render();
    };
    const ex = $("#exportar"); if (ex) ex.onclick = () => { const b = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `segredo-das-estrelas-backup-${hojeKey()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };
    const ib = $("#importar-btn"), inp = $("#importar"); if (ib) { ib.onclick = () => inp.click(); inp.onchange = () => { const f = inp.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { const d = JSON.parse(r.result); if (!d.perfil) throw new Error("sem perfil"); S = Object.assign(padrao(), d); salvar(); toast("Backup restaurado ✦"); render(); } catch (e) { console.warn("[importar]", e); toast("Arquivo inválido."); } }; r.readAsText(f); }; }
    const lem = $("#lembrete"); if (lem) lem.onclick = () => {
      const d = new Date(), p2 = n => String(n).padStart(2, "0"), dia = `${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}`, url = location.href.split("#")[0].split("?")[0];
      const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//O Segredo das Estrelas//PT", "BEGIN:VEVENT", `UID:segredo-das-estrelas-${Date.now()}@app`, `DTSTAMP:${dia}T000000Z`, `DTSTART:${dia}T210000`, `DTEND:${dia}T211000`, "RRULE:FREQ=DAILY",
        "SUMMARY:✦ Sua carta e sua prática de hoje", `DESCRIPTION:Cinco minutos para você. Abra: ${url}`, `URL:${url}`, "BEGIN:VALARM", "TRIGGER:PT0M", "ACTION:DISPLAY", "DESCRIPTION:Sua carta de hoje está esperando", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); a.download = "segredo-das-estrelas-lembrete.ics"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      toast("Abra o arquivo baixado para adicionar ao calendário ✦");
    };
    const imp = $("#imprimir"); if (imp) imp.onclick = () => { ir("mapa"); setTimeout(() => { secSel.mapa = "tudo"; render(true); addEventListener("afterprint", () => { delete secSel.mapa; render(true); }, { once: true }); window.print(); }, 500); };
    const ap = $("#apagar"); if (ap) ap.onclick = () => { if (confirm("Apagar todos os dados deste aparelho? Isso não pode ser desfeito.")) { localStorage.removeItem(CONFIG.chave); S = padrao(); rota = { aba: "hoje", sub: null }; render(); } };
  }
  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
  function piscar(sel) { const el = $(sel); if (!el) return; el.classList.add("on"); setTimeout(() => el.classList.remove("on"), 1200); }

  /* ---------- efeitos de entrada: cartões surgem ao rolar, números contam ---------- */
  let olheiro = null;
  function efeitos() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pag = $(".pagina"); if (!pag) return;
    if ("IntersectionObserver" in window) {
      if (olheiro) olheiro.disconnect();
      olheiro = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("visto"); olheiro.unobserve(en.target); } }), { rootMargin: "0px 0px -6% 0px" });
      const alto = innerHeight;
      pag.querySelectorAll(":scope > .card, :scope > .sec-corpo > .card, :scope > .grade2, :scope > .sec-corpo > .grade2").forEach(el => { if (el.getBoundingClientRect().top > alto * 0.85) { el.classList.add("surge"); olheiro.observe(el); } });
    }
    pag.querySelectorAll(".num-grande").forEach(el => {
      const alvo = Number(el.textContent.trim()); if (!Number.isInteger(alvo) || alvo < 2 || el.children.length) return;
      const t0 = performance.now(), dur = 700;
      (function passo(t) { const p = Math.min(1, (t - t0) / dur); el.textContent = String(Math.max(1, Math.round(alvo * (1 - Math.pow(1 - p, 3))))); if (p < 1 && el.isConnected) requestAnimationFrame(passo); else el.textContent = String(alvo); })(t0);
    });
  }

  /* ---------- celebração ---------- */
  function celebrar() {
    const c = document.createElement("canvas"); c.className = "confete"; document.body.appendChild(c);
    c.width = innerWidth; c.height = innerHeight; const ctx = c.getContext("2d");
    const ps = Array.from({ length: 70 }, () => ({ x: innerWidth / 2, y: innerHeight * 0.55, vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 4, r: Math.random() * 4 + 2, cor: ["#F6DFA6", "#E8C078", "#C79BFF", "#FF7AD9", "#fff"][Math.floor(Math.random() * 5)], a: 1 }));
    let t0 = performance.now();
    (function passo(t) {
      const dt = Math.min(32, t - t0) / 16; t0 = t; ctx.clearRect(0, 0, c.width, c.height);
      ps.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += .35 * dt; p.a -= .012 * dt; ctx.globalAlpha = Math.max(0, p.a); ctx.fillStyle = p.cor; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); });
      if (ps.some(p => p.a > 0)) requestAnimationFrame(passo); else c.remove();
    })(t0);
  }

  /* ---------- compartilhar (imagem 1080x1920) ---------- */
  async function compartilhar(M) {
    const c = document.createElement("canvas"); c.width = 1080; c.height = 1920; const x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, "#3a1f6e"); g.addColorStop(.5, "#160c2e"); g.addColorStop(1, "#0b0618"); x.fillStyle = g; x.fillRect(0, 0, 1080, 1920);
    for (let i = 0; i < 160; i++) { x.globalAlpha = Math.random() * .8 + .2; x.fillStyle = "#fff"; x.beginPath(); x.arc(Math.random() * 1080, Math.random() * 1920, Math.random() * 2.2 + .4, 0, 7); x.fill(); }
    x.globalAlpha = 1; const rg = x.createRadialGradient(540, 760, 20, 540, 760, 420); rg.addColorStop(0, "rgba(155,92,255,.55)"); rg.addColorStop(1, "rgba(155,92,255,0)"); x.fillStyle = rg; x.fillRect(0, 300, 1080, 1000);
    x.textAlign = "center"; x.fillStyle = "#E8C078"; x.font = "600 34px Georgia, serif"; x.fillText("☾  " + CONFIG.nomeMarca.toUpperCase(), 540, 160);
    x.fillStyle = "#C9BEDD"; x.font = "28px sans-serif"; x.fillText(fmtData(new Date()).toUpperCase(), 540, 215);
    x.fillStyle = "#F4EEFF"; x.font = "500 54px Georgia, serif"; x.fillText("Minha energia de hoje", 540, 330);
    x.shadowColor = "rgba(232,192,120,.9)"; x.shadowBlur = 60; x.fillStyle = "#F6DFA6"; x.font = "600 420px Georgia, serif"; x.fillText(String(M.diaPessoal), 540, 900); x.shadowBlur = 0;
    const cic = NUM.CICLO[M.diaPessoal]; x.fillStyle = "#F6DFA6"; x.font = "600 72px Georgia, serif"; x.fillText(cic.palavra, 540, 1010);
    x.fillStyle = "#C9BEDD"; x.font = "30px sans-serif"; x.fillText("dia pessoal  ·  " + M.lua.icone + " " + M.lua.nome, 540, 1070);
    x.fillStyle = "#FFF7E6"; x.font = "italic 500 44px Georgia, serif"; quebrar(x, "“" + M.freqNoite.freq + "”", 540, 1250, 880, 60);
    x.fillStyle = "#E8C078"; x.font = "28px sans-serif"; x.fillText(`destino ${M.destino}  ·  ${M.signo.simbolo} ${M.signo.nome}  ·  ${primeiroNome()}`, 540, 1640);
    x.fillStyle = "#8E82A6"; x.font = "26px sans-serif"; x.fillText(CONFIG.rodapeCompartilhar, 540, 1800);
    const blob = await new Promise(r => c.toBlob(r, "image/png"));
    const file = new File([blob], "minha-energia-de-hoje.png", { type: "image/png" });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: "Minha energia de hoje", text: `Dia pessoal ${M.diaPessoal}: ${cic.palavra}. ✦` }); return; }
    } catch (e) { if (e && e.name === "AbortError") return; console.warn("[share]", e); }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = file.name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); toast("Imagem salva. Publique nos stories ✦");
  }
  function quebrar(x, texto, cx, y, larg, alt) {
    const palavras = texto.split(" "); let linha = "", linhas = [];
    palavras.forEach(p => { const t = linha + p + " "; if (x.measureText(t).width > larg && linha) { linhas.push(linha); linha = p + " "; } else linha = t; });
    linhas.push(linha); linhas.forEach((l, i) => x.fillText(l.trim(), cx, y + i * alt));
  }

  /* ---------- céu estrelado ---------- */
  function ceu() {
    const c = $("#ceu"), x = c.getContext("2d"); let W, H, estrelas = [], parado = false, cadente = null;
    const reduzido = matchMedia("(prefers-reduced-motion: reduce)").matches;
    function dim() { W = c.width = innerWidth * devicePixelRatio; H = c.height = innerHeight * devicePixelRatio; estrelas = Array.from({ length: Math.min(140, Math.floor(W * H / 14000)) }, () => ({ x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.3 + .3) * devicePixelRatio, f: Math.random() * 6.28, v: Math.random() * .02 + .005, cor: Math.random() < .15 ? "232,192,120" : Math.random() < .3 ? "199,155,255" : "255,255,255" })); }
    function desenhar() {
      x.clearRect(0, 0, W, H);
      if (!cadente && !reduzido && Math.random() < 0.006) cadente = { x: Math.random() * W * .8, y: Math.random() * H * .35, vx: (9 + Math.random() * 6) * devicePixelRatio, vy: (4 + Math.random() * 3) * devicePixelRatio, a: 1 };
      if (cadente) { const m = cadente, g = x.createLinearGradient(m.x, m.y, m.x - m.vx * 9, m.y - m.vy * 9); g.addColorStop(0, `rgba(255,247,230,${m.a})`); g.addColorStop(1, "rgba(199,155,255,0)");
        x.globalAlpha = 1; x.strokeStyle = g; x.lineWidth = 1.6 * devicePixelRatio; x.lineCap = "round"; x.beginPath(); x.moveTo(m.x, m.y); x.lineTo(m.x - m.vx * 9, m.y - m.vy * 9); x.stroke();
        m.x += m.vx; m.y += m.vy; m.a -= 0.035; if (m.a <= 0 || m.x > W || m.y > H) cadente = null; }
      estrelas.forEach(s => { s.f += s.v; const a = .35 + .65 * (Math.sin(s.f) + 1) / 2; x.globalAlpha = a; x.fillStyle = `rgb(${s.cor})`; x.beginPath(); x.arc(s.x, s.y, s.r, 0, 7); x.fill(); });
      if (!reduzido && !parado) setTimeout(() => requestAnimationFrame(desenhar), 50);
    }
    addEventListener("resize", () => { dim(); if (reduzido) desenhar(); });
    document.addEventListener("visibilitychange", () => { parado = document.hidden; if (!parado) desenhar(); });
    dim(); desenhar();
  }

  /* ---------- núcleo exposto para os módulos (premium.js, telas-premium.js) ---------- */
  window.CDA = {
    CONFIG, get S() { return S; }, get rota() { return rota; }, salvar, esc, toast, ir, render, mapa, barra, chips, voltar, topo, celebrar, debounce, presenca, sequencia, secoes,
    hojeKey, fmtCurta, fmtData, MESES, DIAS, DIAS_C, diasPessoais, melhor, luasDoMes, diaExt, ymKey, primeiroNome, diaDoAno, arvoreSVG, $
  };

  /* ---------- início ---------- */
  carregar(); ceu();
  if (window.CONTA) {
    CONTA.ler();
    const volta = CONTA.lerRetornoDoLink();          // voltou do link do e-mail
    if (volta && volta.erro) setTimeout(() => toast("O link venceu ou já foi usado. Peça um novo e-mail."), 400);
    if (CONTA.logada()) CONTA.sincronizar().then(ok => { if (ok) { if (volta && volta.ok) toast(S.acesso ? "Você entrou ✦" : "Entrou, mas não achei compra neste e-mail."); render(true); } })
      .catch(e => console.warn("[conta] sincronização inicial falhou (segue com o que está salvo):", e.message));
  }
  render();
  setInterval(() => { if (rota.aba === "ceu" && !rota.sub && secSel.ceu === "virada") render(true); }, 60000);
})();
