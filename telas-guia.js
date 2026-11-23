/* Caminho nas Estrelas: as sete estrelas (a trilha em si é o Bosque Encantado, em telas-bosque.js), a tela de cada estrela,
   o primeiro ritual, o retorno do dia seguinte, os registros, a carta semanal e os apoios.
   As regras (o que conta como prática, quando uma estrela acende) ficam em nucleo.js.
   Carrega antes de app.js; usa window.CDA na hora de renderizar. */
window.GUIA_APP = (function () {
  "use strict";
  const EXT = window.CDA_EXT = window.CDA_EXT || { telas: {}, eventos: [] };
  const C = () => window.CDA, N = window.NUCLEO;
  const hoje = () => C().hojeKey();
  const ETAPAS_LIVRES = 3;                       // estrelas 4 a 7 pedem o plano Completo (portal "guia")
  const ALVO = GUIA.praticasPorEtapa;
  const AMOSTRA = "revisao";                     // prática guiada do Completo aberta para experimentar

  /* ---------- estado e regras ---------- */
  function T() { const S = C().S; if (!S.trajeto) S.trajeto = N.novoTrajeto(hoje(), (S.ciclosFeitos || []).length + 1, Date.now()); return S.trajeto; }
  const etapaAtual = () => GUIA.ETAPAS[Math.min(T().etapa, 7) - 1];
  const concluida = () => T().etapa > 7;
  const liberada = n => n <= ETAPAS_LIVRES || !!(window.PREMIUM && PREMIUM.liberado("guia"));
  const dias = et => N.diasComPratica(C().S, et);
  const marco = et => N.marco(C().S, et, hoje());
  const pronta = et => N.pronta(C().S, et, hoje(), ALVO);
  const feitaHoje = id => N.feitaHoje(C().S, id, hoje());
  const intencao = () => N.texto(T().campos.desejo);
  const curta = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);
  const fmtDia = k => k.slice(8) + "/" + k.slice(5, 7);
  function praticaDeHoje(et) {
    const S = C().S, feita = et.tecnicas.find(feitaHoje); if (feita) return feita;
    if (et.n === 1 && !T().ritual && !marco(et).ok) return "ritual1";
    const lista = et.tecnicas.filter(id => id !== "ritual1");
    if ((S.dias[hoje()] || {}).leve) return lista.slice().sort((a, b) => GUIA.TECNICAS[a].min - GUIA.TECNICAS[b].min)[0];   // dia de retomada: a mais curta
    return lista[dias(et) % lista.length];
  }
  // atual | andamento | concluida | futura | trancada (a atual, quando pede o plano Completo)
  function estado(n) {
    const at = T().etapa; if (n < at) return "concluida"; if (n > at) return "futura";
    if (!liberada(n)) return "trancada";
    const et = GUIA.ETAPAS[n - 1]; return dias(et) > 0 || marco(et).feito > 0 ? "andamento" : "atual";
  }
  function faltam(et) {
    const d = Math.min(dias(et), ALVO), m = marco(et), p = [];
    if (d < ALVO) p.push(`${ALVO - d} ${ALVO - d === 1 ? "dia de prática" : "dias de prática"}`);
    if (!m.ok) p.push("o marco da estrela");
    return p.join(" e ");
  }
  // "Falta 1 dia de prática." / "Faltam 2 dias de prática e o marco da estrela."
  function faltaTxt(et) { const f = faltam(et); if (!f) return ""; const plural = f.includes(" e ") || /^[2-9]/.test(f); return (plural ? "Faltam " : "Falta ") + f + "."; }
  // o que a trajetória pede hoje (usado pela Estela e pela tela Hoje)
  function estadoHoje() {
    T(); if (concluida()) return { concluida: true, liberada: true, feita: true, sub: "fim" };
    const et = etapaAtual(), id = praticaDeHoje(et);
    return { concluida: false, et, id, tecnica: GUIA.TECNICAS[id], feita: feitaHoje(id), liberada: liberada(et.n), sub: id === "ritual1" ? "ritual" : "t-" + id, dias: Math.min(dias(et), ALVO), pronta: pronta(et) };
  }

  /* ---------- símbolos: uma família só, que não depende da cor para ser lida ---------- */
  const P4 = (R, r) => `M0 ${-R}Q${r} ${-r} ${R} 0Q${r} ${r} 0 ${R}Q${-r} ${r} ${-R} 0Q${-r} ${-r} 0 ${-R}Z`;
  function simbolo(est, pontos) {
    // um único ponto de luz no centro, que cresce a cada dia de prática até a estrela acender inteira
    const luz = pontos > 0 ? `<circle class="s-ponto on" r="${(1.9 + 1.2 * (Math.min(pontos, 3) - 1)).toFixed(1)}"/>` : "";
    if (est === "concluida") return `<svg viewBox="-24 -24 48 48" aria-hidden="true"><path class="s-halo" d="${P4(22, 5)}"/><path class="s-cheia" d="${P4(16, 5.4)}"/><circle class="s-nucleo" r="3.4"/></svg>`;
    if (est === "futura") return `<svg viewBox="-24 -24 48 48" aria-hidden="true"><path class="s-contorno" d="${P4(11, 3.6)}"/></svg>`;
    return `<svg viewBox="-24 -24 48 48" aria-hidden="true"><path class="s-halo" d="${P4(23, 6)}"/><path class="s-corpo" d="${P4(19, 6.6)}"/>${est === "trancada" ? `<circle class="s-ponto" r="1.9"/>` : luz}</svg>`;
  }
  function rotulo(n) {
    const et = GUIA.ETAPAS[n - 1], est = estado(n), d = Math.min(dias(et), ALVO), ant = n - 1, plano = n > ETAPAS_LIVRES && !liberada(n);
    const st = est === "concluida" ? "Concluída ✓ · rever" : est === "atual" ? "Você está aqui · começar" : est === "andamento" ? `Em andamento · ${d} de ${ALVO} práticas`
      : est === "trancada" ? "Incluída no Completo" : `Abre depois da estrela ${ant}${plano ? " · Completo" : ""}`;
    return { et, est, st };
  }
  /* ---------- a trilha: o palco é o Bosque Encantado ---------- */
  let festa = null;   // { tipo: "ponto" | "estrela", n }: o que acabou de acender, para celebrar uma vez só
  const pegarFesta = () => { const f = festa; festa = null; return f; };
  // painel no pé do bosque: intenção, fala da Estela e o botão principal
  function rumoHTML() {
    const c = C(), e = c.esc, t = T(), des = intencao(), ret = retornoHTML("rumo");
    let txt, botao = "Continuar meu caminho", alvo = "continuar", classe = "primario";
    if (concluida()) { txt = "As sete estrelas estão acesas. Agora você escolhe: aprofundar esta intenção ou começar outra."; }
    else {
      const et = etapaAtual(), H = estadoHoje(), d = Math.min(dias(et), ALVO);
      if (!liberada(et.n)) { txt = `Você acendeu as três primeiras estrelas. A partir de “${et.nome}”, o caminho segue no plano Completo.`; botao = "Conhecer o plano Completo"; alvo = "plano"; }
      else if (H.pronta) txt = `Tudo cumprido em “${et.nome}”. Falta só acender a estrela.`;
      else if (H.id === "ritual1" && !H.feita) txt = "A primeira estrela começa com um ritual de três minutos. Eu conduzo você.";
      else if (H.feita) {   // nada de botão que parece aberto e depois bloqueia: diz quando o caminho continua
        txt = `Prática de hoje feita: ${d} de ${ALVO} na estrela ${et.n}. ${d < ALVO ? "A próxima prática abre amanhã." : faltaTxt(et)}${d < ALVO && !marco(et).ok ? " O marco da estrela já pode ser cuidado." : ""} Enquanto isso, o bosque está aberto.`;
        botao = `Rever a estrela ${et.n}`; alvo = "rever"; classe = "fantasma";
      }
      else txt = `${lembrancaTxt()}Estrela ${et.n}, ${d} de ${ALVO} práticas. A de hoje é “${H.tecnica.nome}”, ${H.tecnica.min} minutos.`;
    }
    return `<div class="rumo" id="rumo">
      <div class="rumo-fala">${ESTELA.orbe("p")}<div class="rumo-txt">
        <div class="rumo-cab"><span class="mini">${des ? "Sua intenção" + (t.ciclo > 1 ? " · ciclo " + t.ciclo : "") : "Sua intenção nasce na primeira prática"}</span>
          <span class="bq-prog" id="bq-prog" role="status" aria-label="${Math.min(t.etapa - 1, 7)} de 7 estrelas acesas"><svg viewBox="-12 -12 24 24" aria-hidden="true"><path d="${P4(10, 3)}"/></svg><b id="bq-prog-n">${Math.min(t.etapa - 1, 7)}</b> de 7</span></div>
        ${des ? `<p class="rumo-int">“${e(curta(des, 96))}”</p>` : ""}
        ${ret ? "" : `<p>${e(txt)}</p>`}</div></div>
      ${ret || `<button class="btn ${classe}" id="cm-continuar" data-alvo="${alvo}">${e(botao)}</button>`}
    </div>`;
  }

  // a Estela lembra só o que foi registrado de fato na visita anterior ao bosque
  function lembrancaTxt() {
    const l = window.BOSQUE_DADOS ? BOSQUE_DADOS.lembranca(C().S, hoje()) : null; if (!l) return "";
    const q = N.diasEntre(l.data, hoje()) === 1 ? "Ontem" : "Na sua última visita";
    return l.tipo === "flor" ? `${q} você levou “${curta(l.palavra, 30)}” da flor. ` : `${q} você escolheu ${l.qualidade} na pedra. `;
  }

  /* ---------- o retorno: como foi o gesto de ontem, ou onde recomeçar ---------- */
  function retornoHTML(onde) {
    const c = C(), e = c.esc, r = N.retorno(c.S, hoje()); if (!r) return "";
    if (r.tipo === "gesto") { const g = r.gesto;
      const et0 = concluida() ? null : etapaAtual(), volta = r.ausencia >= 2 ? `Faz ${r.ausencia} dias que a gente não se vê, e nada se perdeu${et0 ? `: você está em “${e(et0.nome)}”, com ${Math.min(dias(et0), ALVO)} de ${ALVO} práticas` : ""}. ` : "";
      return `<div class="retorno" data-onde="${onde}"><p>${volta}${r.dias === 1 ? "Ontem" : (volta ? "Antes de sair," : "Há " + r.dias + " dias")} você escolheu ${g.qualidade ? "<b>" + e(g.qualidade) + "</b>" : "um gesto"} e combinou: “${e(curta(g.texto, 80))}”${g.quando ? ", " + e(g.quando) : ""}. Como foi?</p>
        <div class="linha-btn"><button class="btn primario pequeno" data-retorno="fiz">Fiz</button><button class="btn fantasma pequeno" data-retorno="adaptei">Adaptei</button><button class="btn fantasma pequeno" data-retorno="retomar">Quero retomar</button></div></div>`; }
    const et = concluida() ? null : etapaAtual();
    return `<div class="retorno" data-onde="${onde}"><p>Faz ${r.ausencia} dias que a gente não se vê. ${et && et.n === 1 && !T().ritual && !dias(et) ? "Tudo o que você escreveu continua guardado. O Caminho começa pela primeira estrela, com um ritual de três minutos." : `${et ? `Você parou em “${e(et.nome)}”, com ${Math.min(dias(et), ALVO)} de ${ALVO} práticas. ` : ""}Nada se perdeu. Recomeçar é só a próxima prática, e hoje ela é a mais curta.`}</p>
      <button class="btn primario pequeno" data-retorno="recomecar" style="width:100%">Recomeçar por aqui</button></div>`;
  }
  // a frase da Estela depois da resposta, para orientar a prática seguinte
  function ecoRetorno() {
    const S = C().S, d = S.dias[hoje()] || {}, t = T(), g = t.gesto;
    if (d.retorno === "fiz") return "Você fez o que combinou. Isso vale mais do que qualquer afirmação.";
    if (d.retorno === "adaptei") return "Adaptar também é caminhar. O gesto coube no seu dia, e era isso que importava.";
    if (d.retorno === "retomar") return `Sem peso. Hoje a prática é a mais curta${g ? ", e o gesto continua valendo: “" + curta(g.texto, 60) + "”" : ""}.`;
    if (d.retomou) return "Bom te ver de volta. Um passo curto hoje já reacende o caminho.";
    return "";
  }

  /* ---------- pedaços das telas de estrela ---------- */
  function tecnicaLinha(id, destaque) {
    const t = GUIA.TECNICAS[id], e = C().esc, sub = id === "ritual1" ? "ritual" : "t-" + id;
    return `<div class="estrela-item ${feitaHoje(id) ? "feita" : ""} ${destaque ? "hoje" : ""}" data-ir="guia" data-sub='"${sub}"' role="button" tabindex="0"><div class="n">${feitaHoje(id) ? "✓" : t.min + "’"}</div><div><div class="t">${e(t.nome)}</div><div class="tipo">${e(t.autor)} · ${e(t.obra)}</div></div></div>`;
  }
  const campoHTML = (f, v) => `<div class="campo"><label for="cp-${f.k}">${C().esc(f.r)}</label><textarea id="cp-${f.k}" data-campo="${f.k}" style="min-height:70px" placeholder="${C().esc(f.p || "")}">${C().esc(v || "")}</textarea></div>`;
  function marcoHTML(et) {
    const c = C(), e = c.esc, m = marco(et), cp = T().campos, mk = et.marco; let corpo = "";
    if (mk.tipo === "ritual") corpo = (T().ritual ? "" : `<button class="btn neon pequeno" data-ir="guia" data-sub='"ritual"' style="width:100%;margin-bottom:10px">Fazer o primeiro ritual · 3 minutos ›</button>`)
      + `<details class="mais"><summary>Deixar a intenção mais precisa (opcional)</summary>${mk.opcionais.map(f => campoHTML(f, cp[f.k])).join("")}</details>`;
    else if (mk.campos) corpo = mk.campos.map(f => campoHTML(f, cp[f.k])).join("");
    else if (mk.tipo === "escolha") corpo = `<div class="campo"><label for="cp-${mk.campo}">Meu ritual de retomada</label><select id="cp-${mk.campo}" data-campo="${mk.campo}"><option value="">Escolher…</option>${GUIA.RESGATES.map(r => `<option value="${e(r.nome)}" ${cp[mk.campo] === r.nome ? "selected" : ""}>${e(r.nome)} · ${e(r.tempo)}</option>`).join("")}</select></div>`;
    else if (mk.tipo === "sentir") corpo = `<p class="aviso" style="margin:0 0 10px">Conta o dia em que você escreve como se sente ao concluir a prática, ou faz o check-in de energia em Hoje.</p>`;
    else if (mk.tipo === "sequencia") corpo = `<p class="aviso" style="margin:0 0 10px">Contam só os dias desta estrela. Se você faltar um dia, a contagem continua de onde parou; dois dias seguidos sem prática recomeçam a contagem.</p>`;
    return `<div class="marco ${m.ok ? "ok" : ""}"><div class="card-cab"><span class="mini">Marco da estrela</span><span class="chip ${m.ok ? "verde" : "ouro"}">${m.ok ? "cumprido ✓" : m.feito + " de " + m.meta}</span></div>
      <p style="margin:0 0 10px"><b>${e(mk.texto)}</b></p>${corpo}
      ${et.ponte ? `<button class="btn fantasma pequeno" data-ir="${et.ponte.aba}" ${et.ponte.sub ? `data-sub='"${et.ponte.sub}"'` : ""} style="width:100%">${e(et.ponte.rotulo)} ›</button>` : ""}</div>`;
  }
  // blocos que só aparecem quando o exercício usa o símbolo: a Árvore na estrela 2, a Lua na estrela 5
  function simbolosHTML(et, M) {
    const c = C(), e = c.esc;
    if (et.sefira) { const s = KABALA.sefiraDe(M.destino);
      return `<div class="card"><div class="card-cab"><span class="mini">A Sefirá do seu mapa</span><span class="chip violeta">destino ${M.destino}</span></div>
        <div class="num-hero"><div style="flex:0 0 120px">${c.arvoreSVG([s.n === 11 ? 11 : s.n])}</div><div><h2>${e(s.nome)}</h2><p class="sub" style="margin:4px 0 8px">${e(s.pt)}</p><p style="margin:0">Na tradição, a qualidade ligada a ela é <b>${e(s.virtude.toLowerCase())}</b>. Você pode cultivar essa ou escolher outra.</p></div></div></div>`; }
    if (et.lua) { const i = ASTROS.faseIdx(new Date()), pede = i <= 3 ? ["iniciar", "Comece ou retome uma prática. A Lua está crescendo."] : i === 4 ? ["revisar", "Olhe o que você já fez e ajuste o que for preciso."] : ["fechar", "Conclua, agradeça e solte o que não coube neste ciclo."];
      return `<div class="card"><div class="card-cab"><span class="mini">A Lua como relógio</span><span class="chip ouro">hoje: ${pede[0]}</span></div>
        <div style="display:flex;gap:14px;align-items:center"><div class="lua-ic">${M.lua.icone}</div><div><h3>${e(M.lua.nome)}</h3><p class="sub" style="margin:4px 0 0">${pede[1]}</p></div></div></div>`; }
    return "";
  }
  function registrosDaEstrela(et) {
    const c = C(), e = c.esc, S = c.S, t = T(), cp = t.campos, mk = et.marco;
    const campos = [].concat(mk.campos || [], mk.legado || [], mk.opcionais || []).filter((f, i, a) => a.findIndex(x => x.k === f.k) === i && N.texto(cp[f.k]));
    const prat = []; Object.keys(S.praticas).sort().forEach(d => N.praticasEm(S, d).forEach(p => { if (p.c === t.ciclo && et.tecnicas.includes(p.id)) prat.push(Object.assign({ data: d }, p)); }));
    const rit = et.n === 1 && t.ritual ? ritualLido(t.ritual) : "";
    if (!campos.length && !prat.length && !rit) return `<p class="sub" style="margin:0">Ainda não há registros nesta estrela.</p>`;
    return rit + campos.map(f => `<div class="termo"><div class="mini">${e(f.r.replace(" (opcional)", ""))}</div><p>${e(cp[f.k])}</p></div>`).join("")
      + prat.map(p => `<div class="evento"><div class="d" style="font-size:16px">${fmtDia(p.data)}</div><div><b>${e((GUIA.TECNICAS[p.id] || {}).nome || p.id)}</b>${N.texto(p.sente) ? `<div class="sub" style="font-size:14px">Depois: ${e(p.sente)}</div>` : ""}</div></div>`).join("");
  }
  const ritualLido = r => { const e = C().esc; return `<div class="termo"><div class="mini">Primeiro ritual · ${fmtDia(r.data)}</div><p>${r.cena ? "Cena: " + e(r.cena) + ". " : ""}Qualidade: ${e(r.qualidade)}. Gesto: ${e(r.gesto)}${r.quando ? ", " + e(r.quando) : ""}.</p></div>`; };

  /* ---------- telas ---------- */
  EXT.telas["guia/"] = function () {
    const c = C(), e = c.esc; T();
    const sc = c.secoes("guia", [["trilha", "Trilha"], ["registros", "Registros"], ["apoio", "Apoio"]]);
    const apoio = (sub, ic, tit, txt) => `<div class="card clique" data-ir="guia" data-sub='"${sub}"' role="button" tabindex="0"><div class="card-cab"><span class="portal-ic">${ic}</span><span class="chip">abrir ›</span></div><h3>${tit}</h3><p class="sub" style="margin:6px 0 0">${txt}</p></div>`;
    return `<section class="pagina caminho ${sc.at === "trilha" ? "na-trilha" : ""}">
      ${c.topo("Caminho nas Estrelas")}
      ${sc.html}
      ${sc.at === "trilha" ? `<div class="sec-corpo" ${sc.painel}>
        <h1 class="so-leitor">Sua jornada pelas sete estrelas</h1>
        ${BOSQUE.html()}
      </div>` : sc.at === "registros" ? `<div class="sec-corpo" ${sc.painel}>
        <h1>O que você já escreveu</h1>
        <p class="sub">Tudo o que você registrou neste caminho fica aqui, para reler quando quiser.</p>
        ${registrosHTML()}
      </div>` : `<div class="sec-corpo" ${sc.painel}>
        <h1>Para os dias difíceis e as dúvidas</h1>
        <p class="sub">Três apoios que valem em qualquer estrela.</p>
        ${apoio("resgate", "ϟ", "Resgate de energia", "A energia caiu? Exercícios curtos para subir um degrau agora.")}
        ${apoio("dicionario", "✎", "Dicionário da manifestação", "Vibração, frequência, cocriação: o que cada termo quer dizer e o que fazer com ele hoje.")}
        ${apoio("fontes", "❦", "As fontes", "De que autor, escola ou documento vem cada prática, e o que é adaptação deste app.")}
      </div>`}
      <p class="aviso center" style="margin-top:14px">Práticas de desenvolvimento pessoal. Mostram o que fazer a cada dia; não garantem resultado.</p>
    </section>`;
  };

  function registrosHTML() {
    const c = C(), e = c.esc, S = c.S, t = T(), rotulos = {}, antiga = N.jornadaAntiga(S);
    GUIA.ETAPAS.forEach(x => [].concat(x.marco.campos || [], x.marco.legado || [], x.marco.opcionais || []).forEach(f => { rotulos[f.k] = rotulos[f.k] || f.r.replace(" (opcional)", ""); }));
    const camposLidos = cp => Object.keys(cp || {}).filter(k => N.texto(cp[k]) && k !== "desejo").map(k => `<div class="termo"><div class="mini">${e(rotulos[k] || k)}</div><p>${e(cp[k])}</p></div>`).join("");
    const resp = { fiz: "Fiz", adaptei: "Adaptei", retomar: "Quero retomar", recomecar: "Recomecei" };
    const cartas = (S.cartas || []).slice().reverse();
    return `<div class="card ouro-b"><div class="mini" style="margin-bottom:6px">Sua intenção${t.ciclo > 1 ? " · ciclo " + t.ciclo : ""}</div>
        ${intencao() ? `<p class="freq" style="font-size:19px">“${e(intencao())}”</p>` : `<p class="sub" style="margin:0">Ela nasce na primeira prática do Caminho.</p>`}</div>
      ${GUIA.ETAPAS.filter(x => x.n <= Math.min(t.etapa, 7)).map(x => `<div class="card"><div class="card-cab"><span class="mini">Estrela ${x.n} · ${e(x.nome)}</span><button class="btn fantasma pequeno" data-ir="guia" data-sub='"e-${x.n}"'>abrir ›</button></div>${registrosDaEstrela(x)}</div>`).join("")}
      ${(t.retornos || []).length ? `<div class="card"><div class="mini" style="margin-bottom:8px">Suas respostas à Estela</div>${t.retornos.slice().reverse().map(r => `<div class="evento"><div class="d" style="font-size:16px">${fmtDia(r.data)}</div><div><b>${resp[r.resposta] || e(r.resposta)}</b>${r.gesto ? `<div class="sub" style="font-size:14px">${e(r.gesto)}</div>` : ""}</div></div>`).join("")}</div>` : ""}
      ${cartaCard()}
      ${cartas.length > 1 ? `<div class="card"><div class="mini" style="margin-bottom:8px">Cartas anteriores</div>${cartas.slice(1).map(k => `<details class="mais"><summary>${fmtDia(k.de)} a ${fmtDia(k.ate)}</summary>${k.paragrafos.map(p => `<p>${e(p)}</p>`).join("")}</details>`).join("")}</div>` : ""}
      ${S.ciclosFeitos.length ? `<div class="card"><div class="mini" style="margin-bottom:8px">Ciclos anteriores</div>${S.ciclosFeitos.slice().reverse().map(x => `<details class="mais"><summary>${e(curta(x.desejo, 60))} · ${c.fmtCurta(x.inicio).slice(0, 5)} a ${c.fmtCurta(x.fim).slice(0, 5)}</summary>
          ${x.ritual ? ritualLido(x.ritual) : ""}${camposLidos(x.campos)}
          ${(x.praticas || []).length ? `<div class="mini" style="margin:10px 0 4px">${x.praticas.length} ${x.praticas.length === 1 ? "prática" : "práticas"}</div>${x.praticas.map(p => `<div class="evento"><div class="d" style="font-size:16px">${fmtDia(p.data)}</div><div>${e((GUIA.TECNICAS[p.id] || {}).nome || p.id)}${N.texto(p.sente) ? `<div class="sub" style="font-size:14px">Depois: ${e(p.sente)}</div>` : ""}</div></div>`).join("")}` : ""}
          ${!x.campos && !x.praticas ? `<p class="aviso">Deste ciclo ficaram guardados a intenção e as datas.</p>` : ""}</details>`).join("")}</div>` : ""}
      ${antiga.tem ? `<div class="card"><div class="mini" style="margin-bottom:8px">Jornada das 30 noites (versão anterior do app)</div><details class="mais"><summary>${antiga.noites.length} ${antiga.noites.length === 1 ? "noite registrada" : "noites registradas"}</summary>
          ${antiga.noites.map(x => `<div class="evento"><div class="d">${x.n}</div><div>${x.data ? `<div class="aviso">${c.fmtCurta(x.data)}</div>` : ""}${x.texto ? e(x.texto) : `<span class="sub">noite concluída, sem anotação</span>`}</div></div>`).join("")}
          ${antiga.outros.map(x => `<div class="termo"><p>${e(x)}</p></div>`).join("")}</details></div>` : ""}`;
  }

  function telaEstrela(n, M) {
    const c = C(), e = c.esc, t = T(), et = GUIA.ETAPAS[n - 1], est = estado(n), d = Math.min(dias(et), ALVO), ok = pronta(et);
    const cab = `<header class="topo">${c.voltar("guia")}<span class="chip ${est === "concluida" ? "verde" : "ouro"}">Estrela ${n} de 7${est === "concluida" ? " · concluída ✓" : ""}</span></header>
      <div class="mini">Princípio hermético: ${e(et.principio)}</div>
      <h1 style="margin:8px 0 6px">${e(et.nome)}</h1>
      <p class="sub">${e(et.curto)}</p>`;
    const ideia = `<div class="card neon"><span class="brilho v"></span>
        <p class="freq">“${e(et.axioma)}”</p><p class="aviso" style="margin:4px 0 12px">O Caibalion, 1908</p>
        <p>${e(et.ensino)}</p>
        <div class="area"><div class="ic">➶</div><div><div class="mini">O que você faz nesta estrela</div><p>${e(et.aplicar)}</p></div></div>
        <details class="mais" style="margin-top:12px"><summary>De onde vem</summary><p class="sub" style="margin:8px 0 0">${e(et.tradicao)}</p></details>
      </div>`;
    if (est === "futura") return `<section class="pagina">${cab}${ideia}<div class="card trancado"><p class="sub" style="margin:0">Esta estrela abre quando você acender a estrela ${n - 1}, “${e(GUIA.ETAPAS[n - 2].nome)}”.${n > ETAPAS_LIVRES && !liberada(n) ? " Ela faz parte do plano Completo." : ""}</p></div></section>`;
    if (est === "trancada") return `<section class="pagina">${cab}
      <div class="card neon"><span class="brilho v"></span><p class="freq">“${e(et.axioma)}”</p><p class="aviso" style="margin:4px 0 12px">O Caibalion, 1908</p>
        ${PREMIUM.cadeado("guia", `<p>${e(et.ensino)}</p><p>${e(et.aplicar)}</p>`, `As estrelas ${et.n} a 7: ${GUIA.ETAPAS.slice(et.n - 1).map(x => x.nome.toLowerCase()).join(", ")}.`)}</div>
      <div class="card"><div class="mini" style="margin-bottom:6px">Para experimentar</div><p class="sub" style="margin-bottom:10px">Uma prática guiada do plano Completo fica aberta para você conhecer.</p>${tecnicaLinha(AMOSTRA, true)}</div></section>`;
    if (est === "concluida") return `<section class="pagina">${cab}${ideia}
      <div class="card"><div class="mini" style="margin-bottom:8px">Seus registros nesta estrela</div>${registrosDaEstrela(et)}</div>
      <div class="card"><div class="mini" style="margin-bottom:8px">Refazer uma prática</div>${et.tecnicas.filter(id => id !== "ritual1").map(id => tecnicaLinha(id, false)).join("")}</div></section>`;
    const idHoje = praticaDeHoje(et), tec = GUIA.TECNICAS[idHoje], feita = feitaHoje(idHoje), eco = ecoRetorno();
    return `<section class="pagina">${cab}
      ${eco ? ESTELA.fala(eco) : ""}
      ${ideia}
      ${simbolosHTML(et, M)}
      <div class="card ouro-b" id="pratica-hoje"><span class="brilho o"></span>
        <div class="card-cab"><span class="mini">Prática de hoje · ${tec.min} min</span><span class="chip ${feita ? "verde" : "ouro"}">${feita ? "feita ✓" : d + " de " + ALVO}</span></div>
        <h2>${e(tec.nome)}</h2><p class="sub" style="margin:4px 0 12px">${e(tec.autor)} · ${e(tec.obra)}</p>
        ${idHoje === "ritual1" ? `<button class="btn primario" data-ir="guia" data-sub='"ritual"'>Começar o primeiro ritual ✦</button>` : `
        <ol class="passos">${tec.passos.map(p => `<li>${e(p)}</li>`).join("")}</ol>
        ${feita ? `<button class="btn feito" disabled style="margin-top:14px">✓ Prática de hoje concluída</button>` : `
        <div class="campo" style="margin:14px 0 10px"><label for="g-sente">Como você se sente depois? (uma linha, opcional)</label><input id="g-sente" maxlength="140" placeholder="Ex.: mais leve, com menos pressa"></div>
        <button class="btn primario" id="g-pratica" data-id="${idHoje}">Concluí a prática de hoje ✦</button>`}`}
      </div>
      <div class="card">${marcoHTML(et)}</div>
      <div class="card"><div class="card-cab"><span class="mini">Práticas desta estrela</span><span class="chip ${d >= ALVO ? "verde" : ""}">${d} de ${ALVO} dias</span></div>
        ${c.barra(d / ALVO * 100)}
        <p class="aviso" style="margin:8px 0 10px">Uma prática por dia, em ${ALVO} dias diferentes. A de hoje está marcada.</p>
        ${et.tecnicas.filter(id => id !== "ritual1" || !t.ritual).map(id => tecnicaLinha(id, id === idHoje)).join("")}
      </div>
      ${ok ? `<button class="btn primario" id="g-concluir">${n < 7 ? "Acender a estrela " + n + " ✦" : "Acender a sétima estrela e fechar o ciclo ✦"}</button>` : `<p class="aviso center">Para acender esta estrela: ${faltaTxt(et).toLowerCase() || "falta pouco."}</p>`}
    </section>`;
  }
  GUIA.ETAPAS.forEach(x => { EXT.telas["guia/e-" + x.n] = M => telaEstrela(x.n, M); });

  /* ---------- o primeiro ritual: quatro passos em uma tela só, uns três minutos ---------- */
  EXT.telas["guia/ritual"] = function () {
    const c = C(), e = c.esc, t = T(), r = t.rascunho || {}, des = r.intencao !== undefined ? r.intencao : intencao();
    if (t.ritual) return `<section class="pagina"><header class="topo">${c.voltar("guia")}<span class="chip verde">feito ✓</span></header>
      <h1 style="margin:8px 0">Seu primeiro ritual</h1><div class="card ouro-b"><p class="freq" style="font-size:19px">“${e(intencao())}”</p>${ritualLido(t.ritual)}</div>
      <button class="btn primario" data-ir="guia">Voltar ao caminho</button></section>`;
    const nova = !c.S.tour;
    return `<section class="pagina ritual">
      <header class="topo">${nova ? `<div class="marca">☾ ${e(c.CONFIG.nomeMarca)}</div>` : c.voltar(c.rota.de === "hoje" ? "hoje" : "guia")}<span class="chip ouro">3 minutos</span></header>
      <div class="mini">Estrela 1 · Acender a intenção</div>
      <h1 style="margin:8px 0 10px">Seu primeiro ritual</h1>
      ${ESTELA.fala("São quatro passos curtos. Não precisa ficar perfeito: precisa ser seu.")}
      <div class="card neon"><span class="brilho v"></span>
        <div class="rit-passo"><span class="rit-n">1</span><div><label for="rt-int">Minha intenção</label>
          <textarea id="rt-int" data-rt="intencao" maxlength="240" style="min-height:76px" placeholder="Ex.: receber minha primeira encomenda de bolo">${e(des)}</textarea></div></div>
        <div class="rit-passo"><span class="rit-n">2</span><div><label for="rt-cena">Uma cena</label>
          <p class="sub" style="margin:0 0 8px">Feche os olhos por um minuto e imagine uma cena curta que só aconteceria depois disso realizado.</p>
          <button type="button" class="btn fantasma pequeno" id="rt-minuto" style="width:100%;margin-bottom:8px">Começar um minuto de silêncio</button>
          <input id="rt-cena" data-rt="cena" maxlength="140" value="${e(r.cena || "")}" placeholder="Ex.: a mensagem da cliente pedindo o bolo"></div></div>
        <div class="rit-passo"><span class="rit-n">3</span><div><label id="rt-ql">Uma qualidade para levar para hoje</label>
          <div class="opcoes tres" role="radiogroup" aria-labelledby="rt-ql">${GUIA.QUALIDADES.map(q => `<button type="button" class="opcao ${r.qualidade === q ? "on" : ""}" role="radio" aria-checked="${r.qualidade === q}" data-qual="${e(q)}">${e(q)}</button>`).join("")}</div></div></div>
        <div class="rit-passo"><span class="rit-n">4</span><div><label for="rt-gesto">Um gesto possível</label>
          <input id="rt-gesto" data-rt="gesto" maxlength="120" value="${e(r.gesto || "")}" placeholder="Ex.: fotografar o bolo" style="margin-bottom:8px">
          <label for="rt-quando">Quando</label><input id="rt-quando" data-rt="quando" maxlength="60" value="${e(r.quando || "")}" placeholder="Ex.: depois do café"></div></div>
        <button class="btn primario" id="rt-ok">Acender o primeiro ponto ✦</button>
        <p class="aviso" style="margin:10px 0 0">O que você escreve fica só neste aparelho. Amanhã a Estela pergunta como foi o gesto.</p>
      </div>
      ${nova ? `<button class="btn fantasma pequeno" id="rt-depois" style="width:100%">Conhecer o app primeiro</button>` : ""}
    </section>`;
  };

  function telaFim() {
    const c = C(), e = c.esc, t = T();
    return `<section class="pagina">
      <header class="topo">${c.voltar("guia")}<span class="chip verde">sete estrelas ✓</span></header>
      <h1>Ciclo completo</h1>
      <div class="card ouro-b"><span class="brilho o"></span>
        <p class="freq">“${e(intencao() || "Sua intenção")}”</p>
        <p style="margin-top:10px">Você acendeu as sete estrelas deste caminho. O valor dele está no que você escreveu, percebeu e praticou, e isso fica guardado, aconteça o que acontecer com o resultado.</p>
        ${N.texto(t.campos.colheita) ? `<div class="sep"></div><div class="mini" style="margin-bottom:6px">O que você colheu</div><p style="margin:0">${e(t.campos.colheita)}</p>` : ""}
      </div>
      <div class="card neon"><span class="brilho v"></span><div class="mini" style="margin-bottom:8px">E agora</div>
        <p>Você pode encerrar aqui e voltar quando quiser. Também pode aprofundar a mesma intenção em um novo ciclo, ou começar outra. Em qualquer caso, este ciclo fica guardado inteiro em Registros.</p>
        <button class="btn primario" id="g-aprofundar">Aprofundar esta intenção ✦</button>
        <button class="btn neon" id="g-novo" style="margin-top:10px">Começar outra intenção</button>
        <button class="btn fantasma" data-ir="guia" style="margin-top:10px">Encerrar por agora</button>
      </div>
    </section>`;
  }
  EXT.telas["guia/fim"] = () => (concluida() ? telaFim() : EXT.telas["guia/"]());

  function telaTecnica(id) {
    const c = C(), e = c.esc, t = GUIA.TECNICAS[id], et = GUIA.ETAPAS.find(x => x.tecnicas.includes(id));
    const aberta = !et || liberada(et.n) || id === AMOSTRA || GUIA.RESGATES.some(r => r.tecnica === id);
    const podeMarcar = et && et.n <= T().etapa && liberada(et.n);
    return `<section class="pagina">
      <header class="topo">${c.rota.de === "hoje" ? c.voltar("hoje") : c.voltar("guia", et && et.n <= Math.min(T().etapa, 7) ? "e-" + et.n : null)}<span class="chip ouro">${t.min} minutos</span></header>
      <div class="mini">${et ? "Estrela " + et.n + " · " + e(et.principio) : "Prática"}${id === AMOSTRA && et && !liberada(et.n) ? " · amostra do Completo" : ""}</div>
      <h1 style="margin:8px 0 6px">${e(t.nome)}</h1>
      <p class="sub">${e(t.autor)} · ${e(t.obra)}</p>
      <div class="card neon"><span class="brilho v"></span>
        <div class="mini" style="margin-bottom:8px">Passo a passo</div>
        ${aberta ? `<ol class="passos">${t.passos.map(p => `<li>${e(p)}</li>`).join("")}</ol>` : `<ol class="passos"><li>${e(t.passos[0])}</li></ol>${PREMIUM.cadeado("guia", `<ol class="passos">${t.passos.slice(1).map(p => `<li>${e(p)}</li>`).join("")}</ol>`, "O passo a passo completo desta prática.")}`}
      </div>
      <div class="card"><div class="mini" style="margin-bottom:8px">De onde vem</div><p style="margin:0">${e(t.nota)}</p></div>
      ${podeMarcar ? (feitaHoje(id) ? `<button class="btn feito" disabled>✓ Prática de hoje concluída</button>` : `
        <div class="campo"><label for="g-sente">Como você se sente depois? (uma linha, opcional)</label><input id="g-sente" maxlength="140" placeholder="Ex.: mais leve, com menos pressa"></div>
        <button class="btn primario" id="g-pratica" data-id="${id}">Concluí esta prática hoje ✦</button>`) : ""}
    </section>`;
  }
  Object.keys(GUIA.TECNICAS).filter(id => id !== "ritual1").forEach(id => { EXT.telas["guia/t-" + id] = () => telaTecnica(id); });

  EXT.telas["guia/resgate"] = function () {
    const c = C(), e = c.esc, R = c.S.resgates || [], n = R.length, fezHoje = R.some(r => r.d === hoje()), meu = N.texto(T().campos.retomada);
    return `<section class="pagina">
      <header class="topo">${c.voltar(c.rota.de === "hoje" ? "hoje" : "guia")}<span class="chip">${n} ${n === 1 ? "resgate feito" : "resgates feitos"}</span></header>
      <div class="mini">Resgate de energia</div>
      <h1 style="margin:8px 0">A energia caiu. E agora?</h1>
      <p class="sub">Não é para fingir alegria. É para subir um degrau. Um dia difícil não é falha sua: escolha um exercício, faça agora e volte aqui.</p>
      ${GUIA.RESGATES.map(r => `<div class="card clique ${meu === r.nome ? "ouro-b" : ""}" data-ir="guia" data-sub='"t-${r.tecnica}"' role="button" tabindex="0"><div class="card-cab"><span class="mini">${e(r.tempo)}${meu === r.nome ? " · seu ritual de retomada" : ""}</span><span class="chip violeta">${e(GUIA.TECNICAS[r.tecnica].autor)}</span></div><h3>${e(r.nome)}</h3><p class="sub" style="margin:6px 0 0">${e(r.texto)} Toque para abrir ›</p></div>`).join("")}
      ${fezHoje ? `<button class="btn feito" disabled>✓ Resgate de hoje registrado</button>` : `<button class="btn primario" id="g-resgate">Fiz um resgate agora ✦</button>`}
      <p class="aviso center" style="margin-top:12px">Se a tristeza ou a ansiedade estiverem pesadas demais, procure um profissional de saúde mental. O CVV atende 24 horas pelo 188.</p>
    </section>`;
  };

  EXT.telas["guia/dicionario"] = function () {
    const c = C(), e = c.esc;
    return `<section class="pagina">
      <header class="topo">${c.voltar("guia")}</header>
      <div class="mini">Dicionário da manifestação</div>
      <h1 style="margin:8px 0">Os termos, e o que fazer com cada um</h1>
      <p class="sub">Você já ouviu essas palavras. Aqui está o que elas querem dizer neste guia e como aplicar hoje.</p>
      <div class="card">${GUIA.DICIONARIO.map(d => `<div class="termo"><h3>${e(d.termo)}</h3><p>${e(d.significa)}</p><p class="hoje"><b>Hoje:</b> ${e(d.hoje)}</p></div>`).join("")}</div>
    </section>`;
  };

  EXT.telas["guia/fontes"] = function () {
    const c = C(), e = c.esc;
    return `<section class="pagina">
      <header class="topo">${c.voltar("guia")}</header>
      <div class="mini">De onde vem cada prática</div>
      <h1 style="margin:8px 0">As fontes</h1>
      <p class="sub">Cada prática vem de um autor, uma escola ou um documento. O que foi criado para este app está identificado como adaptação.</p>
      <div class="card">${GUIA.FONTES.map(f => `<div class="termo"><h3>${e(f.titulo)}</h3><p>${e(f.detalhe)}</p></div>`).join("")}</div>
      <p class="aviso center">Energia e vibração aparecem aqui como jeito de falar da própria experiência. Onde a física é citada, ela é metáfora, não explicação científica.</p>
    </section>`;
  };

  /* ---------- carta semanal ---------- */
  const completo = () => !!(window.PREMIUM && PREMIUM.liberado("guia"));
  function cartaEstado() {
    const S = C().S, h = hoje(), cartas = S.cartas || [], ult = cartas[cartas.length - 1];
    if (!ult) { const l = N.cartaLiberaEm(S, h), c = T().ciclo;
      // a carta é feita dos registros: sem nenhuma prática neste caminho, ela espera a primeira
      if (!Object.keys(S.praticas).some(d => N.praticasEm(S, d).some(p => p.c === c))) return { tipo: "espera", semRegistro: true };
      return l.amostra ? { tipo: "pronta", amostra: true } : { tipo: "espera", dia: l.dia }; }
    if (completo() && N.diasEntre(ult.id, h) >= 7) return { tipo: "pronta", amostra: false };
    return { tipo: "lida", ult, falta: completo() ? 7 - N.diasEntre(ult.id, h) : 0 };
  }
  function cartaCard() {
    const e = C().esc, k = cartaEstado();
    if (k.tipo === "espera") return `<div class="card trancado"><div class="card-cab"><span class="mini">Carta da semana</span><span class="chip violeta">${k.semRegistro ? "depois da 1ª prática" : "chega no fim da 1ª semana"}</span></div><p class="sub" style="margin:0">A Estela escreve uma carta com o que você registrou: práticas, check-ins, sinais e o gesto que escolheu. ${k.semRegistro ? "Ela começa a ser escrita na sua primeira prática." : `Dia ${k.dia} de 6.`}</p></div>`;
    if (k.tipo === "pronta") return `<div class="card ouro-b"><span class="brilho o"></span><div class="card-cab"><span class="mini">Carta da semana</span><span class="chip ouro">${k.amostra ? "sua primeira carta" : "carta nova"}</span></div>
      <h3>Sua semana, escrita com os seus registros</h3><p class="sub" style="margin:6px 0 12px">Nada aqui é genérico: a carta usa só o que você anotou.</p><button class="btn primario" id="carta-abrir">Abrir minha carta ✦</button></div>`;
    return `<div class="card clique" data-ir="guia" data-sub='"carta"' role="button" tabindex="0"><div class="card-cab"><span class="mini">Carta da semana</span><span class="chip">${k.ult.amostra && !completo() ? "amostra" : k.falta > 0 ? "próxima em " + k.falta + (k.falta === 1 ? " dia" : " dias") : "reler"}</span></div>
      <h3>${fmtDia(k.ult.de)} a ${fmtDia(k.ult.ate)}</h3><p class="sub" style="margin:6px 0 0">${e(curta(k.ult.paragrafos[1] || k.ult.paragrafos[0], 110))} ›</p></div>`;
  }
  EXT.telas["guia/carta"] = function () {
    const c = C(), e = c.esc, cartas = c.S.cartas || [], k = cartas[cartas.length - 1];
    if (!k) return EXT.telas["guia/"]();
    return `<section class="pagina">
      <header class="topo">${c.voltar(c.rota.de === "hoje" ? "hoje" : "guia")}<span class="chip ouro">${fmtDia(k.de)} a ${fmtDia(k.ate)}</span></header>
      <div class="mini">Carta da semana</div>
      <h1 style="margin:8px 0 12px">${e(c.primeiroNome())}, esta foi a sua semana</h1>
      <div class="card ouro-b carta-sem"><span class="brilho o"></span>${k.paragrafos.map(p => `<p>${e(p)}</p>`).join("")}<p class="quem">Estela</p></div>
      ${completo() ? "" : `<div class="card neon"><span class="brilho v"></span><div class="mini" style="margin-bottom:8px">Esta foi uma amostra</div>
        <p>No plano Completo você recebe uma carta nova a cada sete dias, segue pelas estrelas 4 a 7 e abre os quatro encontros de cada ciclo da Lua. R$ 49,90 por mês.</p>
        <button class="btn primario" data-portal="guia">Conhecer o plano Completo</button>
        <div class="sep"></div><div class="mini" style="margin-bottom:8px">Uma prática guiada do Completo, para experimentar</div>${tecnicaLinha(AMOSTRA, true)}</div>`}
      <p class="aviso center">A carta é montada pelo app com os seus registros deste aparelho. Ninguém mais a lê.</p>
    </section>`;
  };

  /* ---------- cartão da tela Hoje ---------- */
  function cardHoje() {
    const c = C(), e = c.esc; T();
    if (concluida()) return `<div class="card clique ouro-b" data-ir="guia" data-sub='"fim"' role="button" tabindex="0"><div class="card-cab"><span class="mini">Seu caminho</span><span class="chip verde">sete estrelas ✓</span></div><h3>Ciclo completo</h3><p class="sub" style="margin:6px 0 0">Aprofundar esta intenção ou começar outra ›</p></div>`;
    const H = estadoHoje(), et = H.et;
    if (!H.liberada) return `<div class="card clique neon" data-ir="guia" role="button" tabindex="0"><div class="card-cab"><span class="mini">Seu caminho · estrela ${et.n} de 7</span><span class="chip ouro">Completo</span></div><h3>${e(et.nome)}</h3><p class="sub" style="margin:6px 0 0">As três primeiras estrelas estão acesas. Veja como o caminho continua ›</p></div>`;
    return `<div class="card clique neon" data-ir="guia" data-sub='"${H.sub}"' role="button" tabindex="0"><span class="brilho r"></span>
      <div class="card-cab"><span class="mini">Seu caminho · estrela ${et.n} de 7</span><span class="chip violeta">${e(et.nome)}</span></div>
      <div class="pratica-hoje"><div><div class="mini">Prática de hoje · ${H.tecnica.min} min</div><b>${e(H.tecnica.nome)}</b><div class="aviso">${e(H.tecnica.autor)}</div></div><span class="chip ${H.feita ? "verde" : "ouro"}">${H.feita ? "feita ✓" : "abrir ›"}</span></div>
      ${c.barra((et.n - 1 + H.dias / ALVO) / 7 * 100)}
    </div>`;
  }
  const afirmacaoDoDia = (data, desloc) => GUIA.AFIRMACOES[(C().diaDoAno(data) + (desloc || 0)) % GUIA.AFIRMACOES.length];

  /* ---------- eventos ---------- */
  const reduzido = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  // aproximação da câmera até a estrela tocada, antes de abrir a prática
  const aproximar = (n, depois) => (window.BOSQUE ? BOSQUE.aproximar(n, depois) : depois());
  function abrirEstrela(n) {
    const c = C(), est = estado(n), H = estadoHoje();
    if (est === "trancada") return PREMIUM.abrir("guia");
    if (est === "atual" || est === "andamento") return aproximar(n, () => c.ir("guia", H.id === "ritual1" && !H.feita ? "ritual" : "e-" + n));
    c.ir("guia", "e-" + n);
  }
  const situar = () => {};   // o bosque se enquadra sozinho ao montar (telas-bosque.js)

  EXT.eventos.push(function () {
    const c = C(), S = c.S, $ = c.$, app = document.getElementById("app");
    const gravarCampo = el => { const t = T(); t.campos[el.dataset.campo] = el.value;
      if (el.dataset.campo === "gesto6" || el.dataset.campo === "quando6") { if (N.texto(t.campos.gesto6)) t.gesto = { texto: N.texto(t.campos.gesto6), quando: N.texto(t.campos.quando6), qualidade: N.texto(t.campos.qualidade) || (t.ritual || {}).qualidade || "", data: hoje() }; }
      c.salvar(); };
    app.querySelectorAll("[data-campo]").forEach(el => {
      el.addEventListener("input", c.debounce(() => gravarCampo(el), 400));
      el.addEventListener("change", () => { gravarCampo(el); if (el.tagName === "SELECT") c.render(true); });
      el.addEventListener("blur", () => { gravarCampo(el); setTimeout(() => { const a = document.activeElement; if (!a || !a.matches("[data-campo], #g-sente")) c.render(true); }, 250); });
    });
    app.querySelectorAll(".estrela-item[role=button], .card.clique[role=button]").forEach(el => el.addEventListener("keydown", ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); el.click(); } }));

    // painel do bosque (os toques nas estrelas e nas descobertas são ligados em telas-bosque.js)
    const cont = $("#cm-continuar"); if (cont) cont.onclick = () => { if (cont.dataset.alvo === "plano") return PREMIUM.abrir("guia"); if (concluida()) return c.ir("guia", "fim"); if (cont.dataset.alvo === "rever") return c.ir("guia", "e-" + Math.min(T().etapa, 7)); abrirEstrela(Math.min(T().etapa, 7)); };

    // retorno do dia seguinte
    app.querySelectorAll("[data-retorno]").forEach(b => b.onclick = () => {
      const t = T(), h = hoje(), r = b.dataset.retorno, g = t.gesto; S.dias[h] = S.dias[h] || {};
      if (r === "recomecar") { S.dias[h].retomou = true; S.dias[h].leve = true; t.retornos.push({ data: h, sobre: "", resposta: r }); c.salvar(); return concluida() ? c.ir("guia", "fim") : c.ir("guia", estadoHoje().sub); }
      t.retornos.push({ data: h, sobre: g.data, resposta: r, gesto: g.texto }); S.dias[h].retorno = r;
      if (r === "retomar") { S.dias[h].leve = true; t.gesto = Object.assign({}, g, { data: h }); }
      else S.sinais.push({ data: h, tipo: "pratica", texto: (r === "adaptei" ? "Gesto adaptado: " : "Gesto feito: ") + g.texto });
      c.salvar(); c.presenca(); c.toast(r === "fiz" ? "Guardado no seu caderno ✦" : r === "adaptei" ? "Guardado. Adaptar também conta ✦" : "Combinado: hoje é dia de retomar."); c.render(true);
    });

    // prática, resgate e conclusão da estrela
    const gp = $("#g-pratica"); if (gp) gp.onclick = () => {
      T(); const et = etapaAtual(), antes = concluida() ? 0 : dias(et), sente = N.texto(($("#g-sente") || {}).value);
      N.registrarPratica(S, gp.dataset.id, hoje(), Date.now(), sente ? { sente } : null); c.salvar(); c.presenca();
      const daEtapa = !concluida() && et.tecnicas.includes(gp.dataset.id) && liberada(et.n);
      if (daEtapa && dias(et) > antes) festa = { tipo: "ponto", n: et.n };
      c.toast(daEtapa && dias(et) > antes ? "Mais um ponto de luz na sua estrela ✦" : "Prática registrada ✦");
      c.secao("guia", "trilha"); c.ir("guia");
    };
    const gr = $("#g-resgate"); if (gr) gr.onclick = () => { T(); S.resgates.push({ d: hoje(), em: Date.now() }); c.salvar(); c.presenca(); c.toast("Um degrau acima ✦"); setTimeout(() => c.render(true), 500); };
    const gc = $("#g-concluir"); if (gc) gc.onclick = () => {
      const t = T(), et = etapaAtual(); if (gc.disabled || !pronta(et)) return; gc.disabled = true;   // toque repetido não conclui duas vezes
      t.concluidas = t.concluidas || {}; t.concluidas[et.n] = hoje();
      t.etapa = et.n + 1; t.inicioEtapa = hoje(); t.inicioEtapaEm = Date.now();
      if (!c.salvar()) c.toast("Estrela acesa, mas não consegui gravar neste aparelho. Veja o aviso na tela.");
      festa = { tipo: "estrela", n: et.n };   // o progresso já foi gravado; a celebração acontece uma vez, no bosque
      c.secao("guia", "trilha"); c.ir("guia");
    };
    const novoCiclo = manter => { if (!confirm(manter ? "Começar um novo ciclo com a mesma intenção? O ciclo atual fica guardado inteiro em Registros." : "Começar um novo ciclo com outra intenção? O ciclo atual fica guardado inteiro em Registros.")) return;
      T(); N.arquivarCiclo(S, hoje(), Date.now(), manter); c.salvar(); c.secao("guia", "trilha"); c.ir("guia"); };
    const gn = $("#g-novo"); if (gn) gn.onclick = () => novoCiclo(false);
    const ga = $("#g-aprofundar"); if (ga) ga.onclick = () => novoCiclo(true);

    // primeiro ritual
    const ok = $("#rt-ok"); if (ok) {
      const t = T(); t.rascunho = t.rascunho || {};
      app.querySelectorAll("[data-rt]").forEach(el => el.addEventListener("input", c.debounce(() => { if (!t.rascunho) return; t.rascunho[el.dataset.rt] = el.value; c.salvar(); }, 400)));
      app.querySelectorAll("[data-qual]").forEach(b => b.onclick = () => { t.rascunho.qualidade = b.dataset.qual; c.salvar(); app.querySelectorAll("[data-qual]").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-checked", x === b); }); });
      const min = $("#rt-minuto"); let relogio = null;
      if (min) min.onclick = () => { if (relogio) { clearInterval(relogio); relogio = null; min.textContent = "Começar um minuto de silêncio"; return; }
        let s = 60; min.textContent = "Olhos fechados · 60 s (toque para parar)";
        relogio = setInterval(() => { s--; if (!min.isConnected) return clearInterval(relogio); if (s <= 0) { clearInterval(relogio); relogio = null; min.textContent = "Um minuto completo ✓ · escreva o que viu"; $("#rt-cena").focus(); } else min.textContent = `Olhos fechados · ${s} s (toque para parar)`; }, 1000); };
      ok.onclick = () => {
        const v = k => N.texto(($("#rt-" + k) || {}).value), int = v("int"), gesto = v("gesto"), q = t.rascunho.qualidade;
        if (int.length < 3) { $("#rt-int").focus(); return c.toast("Escreva a sua intenção, do seu jeito."); }
        if (!q) return c.toast("Escolha uma qualidade para levar para hoje.");
        if (gesto.length < 3) { $("#rt-gesto").focus(); return c.toast("Escolha um gesto possível, por menor que seja."); }
        t.campos.desejo = int; t.ritual = { intencao: int, cena: v("cena"), qualidade: q, gesto, quando: v("quando"), data: hoje() };
        t.gesto = { texto: gesto, quando: v("quando"), qualidade: q, data: hoje() }; delete t.rascunho;
        if (!feitaHoje("ritual1")) N.registrarPratica(S, "ritual1", hoje(), Date.now());
        S.tour = true; c.salvar(); c.presenca(); festa = { tipo: "ponto", n: 1 }; c.toast("O primeiro ponto de luz está aceso ✦");
        c.secao("guia", "trilha"); c.ir("guia");
      };
      const dep = $("#rt-depois"); if (dep) dep.onclick = () => { S.tour = true; S.apresentacao = "oferecer"; c.salvar(); c.ir("hoje"); };
    }

    // carta semanal
    const ca = $("#carta-abrir"); if (ca) ca.onclick = () => {
      const k = N.cartaSemanal(S, hoje(), { tecnica: id => (GUIA.TECNICAS[id] || {}).nome || id, nivel: n => ((KABALA.ESCALA.find(x => x.nivel === n) || {}).nome || "nível " + n) });
      k.amostra = !completo(); S.cartas.push(k); c.salvar(); c.ir("guia", "carta");
    };
  });

  return { cardHoje, afirmacaoDoDia, etapaAtual, concluida, estadoHoje, retornoHTML, ecoRetorno, cartaCard, cartaEstado, intencao, liberada, situar,
    trajeto: T, rotulo, simbolo, rumoHTML, abrirEstrela, pegarFesta, diasNa: et => Math.min(dias(et), ALVO) };
})();
