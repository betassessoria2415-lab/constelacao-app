/* Guia de Manifestação: a trajetória de 7 etapas, as técnicas, o resgate, o dicionário e as fontes.
   Carrega antes de app.js; usa window.CDA na hora de renderizar. */
window.GUIA_APP = (function () {
  "use strict";
  const EXT = window.CDA_EXT = window.CDA_EXT || { telas: {}, eventos: [] };
  const C = () => window.CDA;
  const hoje = () => C().hojeKey();
  const ETAPAS_LIVRES = 3;                       // etapas 4 a 7 pedem o plano Completo (portal "guia")

  /* ---------- estado e regras ---------- */
  function T() {
    const S = C().S;
    if (!S.trajeto) { S.trajeto = { etapa: 1, inicio: hoje(), inicioEtapa: hoje(), campos: {}, ciclo: 1 }; }
    S.praticas = S.praticas || {}; S.resgates = S.resgates || []; S.ciclosFeitos = S.ciclosFeitos || [];
    return S.trajeto;
  }
  const etapaAtual = () => GUIA.ETAPAS[Math.min(T().etapa, 7) - 1];
  const concluida = () => T().etapa > 7;
  const liberada = n => n <= ETAPAS_LIVRES || (window.PREMIUM && PREMIUM.liberado("guia"));
  const desde = () => T().inicioEtapa;

  function diasComPratica(et) {
    const S = C().S;
    return Object.keys(S.praticas).filter(d => d >= desde() && (S.praticas[d] || []).some(id => et.tecnicas.includes(id))).length;
  }
  function feitaHoje(id) { return ((C().S.praticas || {})[hoje()] || []).includes(id); }
  function praticaDeHoje(et) {
    const feita = et.tecnicas.find(id => feitaHoje(id));
    return feita || et.tecnicas[diasComPratica(et) % et.tecnicas.length];
  }
  function camposOk(et) { const c = T().campos; return (et.marco.campos || []).every(f => (c[f.k] || "").trim().length >= 3); }
  function marco(et) {
    const S = C().S, m = et.marco, dias = Object.keys(S.dias || {}).filter(d => d >= desde());
    let feito = 0, meta = m.meta || 1;
    if (m.tipo === "campos") { meta = m.campos.length; feito = m.campos.filter(f => (T().campos[f.k] || "").trim().length >= 3).length; }
    else if (m.tipo === "checkins") feito = dias.filter(d => S.dias[d].nivel > 0).length;
    else if (m.tipo === "resgates") feito = S.resgates.filter(d => d >= desde()).length;
    else if (m.tipo === "sequencia") feito = C().sequencia();
    else if (m.tipo === "intencoes") feito = dias.filter(d => (S.dias[d].desejo || "").trim() && (S.dias[d].plano || "").trim()).length;
    else if (m.tipo === "campos+prova") { meta = 2; feito = (camposOk(et) ? 1 : 0) + ((S.sinais || []).some(x => x.data >= desde()) ? 1 : 0); }
    return { feito: Math.min(feito, meta), meta, ok: feito >= meta };
  }
  const pronta = et => diasComPratica(et) >= GUIA.praticasPorEtapa && marco(et).ok;

  /* ---------- pedaços de tela ---------- */
  function trilha() {
    const at = T().etapa;
    return `<div class="trilha">${GUIA.ETAPAS.map(e => { const est = e.n < at ? "feita" : e.n === at ? "atual" : "futura";
      return `<div class="no ${est}"><div class="bola">${e.n < at ? "✓" : e.icone}</div><div><b>${e.n}. ${C().esc(e.fase)}</b><small>${C().esc(e.principio)}${e.n > ETAPAS_LIVRES && !liberada(e.n) ? " · plano Completo" : ""}</small></div></div>`; }).join("")}</div>`;
  }
  function tecnicaLinha(id, destaque) {
    const t = GUIA.TECNICAS[id], e = C().esc;
    return `<div class="estrela-item ${feitaHoje(id) ? "feita" : ""} ${destaque ? "hoje" : ""}" data-ir="guia" data-sub='"t-${id}"'><div class="n">${feitaHoje(id) ? "✓" : t.min + "’"}</div><div><div class="t">${e(t.nome)}</div><div class="tipo">${e(t.autor)} · ${e(t.obra)}</div></div></div>`;
  }
  function marcoHTML(et) {
    const e = C().esc, m = marco(et), c = T().campos;
    const campos = (et.marco.campos || []).map(f => `<div class="campo"><label>${e(f.r)}</label><textarea data-campo="${f.k}" style="min-height:70px" placeholder="${e(f.p)}">${e(c[f.k] || "")}</textarea></div>`).join("");
    return `<div class="marco ${m.ok ? "ok" : ""}"><div class="card-cab"><span class="mini">Marco da etapa</span><span class="chip ${m.ok ? "verde" : "ouro"}">${m.ok ? "cumprido ✓" : m.feito + " de " + m.meta}</span></div>
      <p style="margin:0 0 10px"><b>${e(et.marco.texto)}</b></p>${campos}
      ${et.ponte ? `<button class="btn fantasma pequeno" data-ir="${et.ponte.aba}" ${et.ponte.sub ? `data-sub='"${et.ponte.sub}"'` : ""} style="width:100%">${e(et.ponte.rotulo)} ›</button>` : ""}</div>`;
  }

  /* ---------- telas ---------- */
  EXT.telas["guia/"] = function () {
    const c = C(), e = c.esc, t = T();
    if (concluida()) return telaCompleta();
    const et = etapaAtual(), dias = diasComPratica(et), alvo = GUIA.praticasPorEtapa, idHoje = praticaDeHoje(et), ok = pronta(et);
    const desejo = (t.campos.desejo || "").trim();
    const sc = c.secoes("guia", [["etapa", "Etapa " + et.n], ["caminho", "O caminho"], ["apoio", "Apoio"]]);
    const apoio = (sub, ic, tit, txt) => `<div class="card clique" data-ir="guia" data-sub='"${sub}"'><div class="card-cab"><span class="portal-ic">${ic}</span><span class="chip">abrir ›</span></div><h3>${tit}</h3><p class="sub" style="margin:6px 0 0">${txt}</p></div>`;
    const corpo = !liberada(et.n) ? PREMIUM.cadeado("guia", `<p>${e(et.ensino)}</p><p>${e(et.aplicar)}</p>`, `As etapas ${et.n} a 7: ${GUIA.ETAPAS.slice(et.n - 1).map(x => x.fase.toLowerCase()).join(", ")}.`) : `
        <p>${e(et.ensino)}</p>
        <div class="area"><div class="ic">➶</div><div><div class="mini">O que você faz nesta etapa</div><p>${e(et.aplicar)}</p></div></div>
        <div class="sep"></div>
        ${marcoHTML(et)}
        <div class="sep"></div>
        <div class="card-cab"><span class="mini">Práticas desta etapa</span><span class="chip ${dias >= alvo ? "verde" : ""}">${Math.min(dias, alvo)} de ${alvo} dias</span></div>
        ${c.barra(Math.min(dias, alvo) / alvo * 100)}
        <p class="aviso" style="margin:8px 0 10px">Faça uma prática por dia, em ${alvo} dias diferentes. A de hoje está marcada.</p>
        ${et.tecnicas.map(id => tecnicaLinha(id, id === idHoje)).join("")}
        ${ok ? `<button class="btn primario" id="g-concluir" style="margin-top:8px">${et.n < 7 ? "Concluir a etapa " + et.n + " e abrir a próxima ✦" : "Fechar o ciclo de manifestação ✦"}</button>` : `<p class="aviso center" style="margin-top:10px">A próxima etapa abre quando o marco e os ${alvo} dias de prática estiverem cumpridos.</p>`}`;
    return `<section class="pagina">
      ${c.topo("Guia de Manifestação")}
      ${sc.html}
      ${sc.at === "etapa" ? `<div class="sec-corpo">
      <h1>${e(et.fase)}</h1>
      <p class="sub">Etapa ${et.n} de 7 da sua trajetória, do desejo à manifestação.</p>
      ${desejo ? `<div class="card ouro-b"><span class="brilho o"></span><div class="mini" style="margin-bottom:6px">O que você está manifestando${t.ciclo > 1 ? " · ciclo " + t.ciclo : ""}</div><p class="freq" style="font-size:19px">“${e(desejo)}${(t.campos.prazo || "").trim() ? ", " + e(t.campos.prazo.trim()) : ""}”</p></div>` : ""}
      <div class="card neon"><span class="brilho v"></span>
        <div class="card-cab"><span class="mini">Etapa ${et.n} de 7 · princípio: ${e(et.principio)}</span><span class="chip violeta">${e(et.fase)}</span></div>
        <p class="freq">“${e(et.axioma)}”</p>
        <p class="aviso" style="margin:4px 0 12px">O Caibalion, 1908</p>
        ${corpo}
      </div>
      </div>` : sc.at === "caminho" ? `<div class="sec-corpo">
      <h1>Do desejo à manifestação</h1>
      <p class="sub">Sete etapas, uma para cada princípio hermético. Cada uma prepara a seguinte.</p>
      <div class="card">${trilha()}</div>
      <div class="card"><div class="mini" style="margin-bottom:8px">Como uma etapa se cumpre</div>
        <ul class="lista"><li><span class="ic">1</span><span>Leia o princípio e o que ele pede de você.</span></li><li><span class="ic">2</span><span>Cumpra o marco da etapa.</span></li><li><span class="ic">3</span><span>Faça uma prática em ${alvo} dias diferentes.</span></li></ul>
        ${c.S.ciclosFeitos.length ? `<div class="sep"></div><div class="mini" style="margin-bottom:6px">Ciclos anteriores</div>${c.S.ciclosFeitos.map(x => `<div class="evento"><div class="d" style="font-size:18px">✓</div><div><div>${e(x.desejo)}</div><div class="aviso">${c.fmtCurta(x.inicio)} a ${c.fmtCurta(x.fim)}</div></div></div>`).join("")}` : ""}
      </div>
      </div>` : `<div class="sec-corpo">
      <h1>Para os dias difíceis e as dúvidas</h1>
      <p class="sub">Três apoios que valem em qualquer etapa.</p>
      ${apoio("resgate", "ϟ", "Resgate de frequência", "A energia caiu? Exercícios curtos para subir um degrau agora.")}
      ${apoio("dicionario", "✎", "Dicionário da manifestação", "Vibração, frequência, cocriação: o que cada termo quer dizer e o que fazer com ele hoje.")}
      ${apoio("fontes", "❦", "As fontes", "De que autor, escola ou documento vem cada prática deste guia.")}
      </div>`}
      <p class="aviso center" style="margin-top:14px">Práticas de desenvolvimento pessoal. Mostram o que fazer a cada dia; não garantem resultado.</p>
    </section>`;
  };

  function telaCompleta() {
    const c = C(), e = c.esc, t = T(), S = c.S;
    return `<section class="pagina">
      ${c.topo("Guia de Manifestação")}
      <h1>Ciclo completo</h1>
      <div class="card ouro-b"><span class="brilho o"></span>
        <p class="freq">“${e((t.campos.desejo || "").trim() || "Seu desejo")}”</p>
        <p style="margin-top:10px">Você definiu, alinhou, elevou, transmutou, sustentou, agiu e entregou. As sete etapas estão cumpridas. O que resta é continuar vivendo como quem já recebeu e registrar as provas quando chegarem.</p>
        <button class="btn fantasma pequeno" data-ir="hoje" data-sub='"provas"' style="width:100%;margin-top:6px">Abrir meu caderno de provas ›</button>
      </div>
      <div class="card">${trilha()}</div>
      <div class="card neon"><span class="brilho v"></span><div class="mini" style="margin-bottom:8px">E agora</div>
        <p>Cada desejo percorre a trajetória inteira. Quando quiser, comece um novo ciclo com um novo desejo. O que você escreveu neste fica guardado.</p>
        <button class="btn primario" id="g-novo">Começar um novo ciclo ✦</button>
        ${S.ciclosFeitos.length ? `<div class="sep"></div><div class="mini" style="margin-bottom:6px">Ciclos anteriores</div>${S.ciclosFeitos.map(x => `<div class="evento"><div class="d" style="font-size:18px">✓</div><div><div>${e(x.desejo)}</div><div class="aviso">${c.fmtCurta(x.inicio)} a ${c.fmtCurta(x.fim)}</div></div></div>`).join("")}` : ""}
      </div>
    </section>`;
  }

  function telaTecnica(id) {
    const c = C(), e = c.esc, t = GUIA.TECNICAS[id], et = GUIA.ETAPAS.find(x => x.tecnicas.includes(id));
    const podeMarcar = et && et.n <= T().etapa && liberada(et.n);
    return `<section class="pagina">
      <header class="topo">${c.voltar("guia")}<span class="chip ouro">${t.min} minutos</span></header>
      <div class="mini">${et ? "Etapa " + et.n + " · " + e(et.principio) : "Prática"}</div>
      <h1 style="margin:8px 0 6px">${e(t.nome)}</h1>
      <p class="sub">${e(t.autor)} · ${e(t.obra)}</p>
      <div class="card neon"><span class="brilho v"></span>
        <div class="mini" style="margin-bottom:8px">Passo a passo</div>
        <ol class="passos">${t.passos.map(p => `<li>${e(p)}</li>`).join("")}</ol>
      </div>
      <div class="card"><div class="mini" style="margin-bottom:8px">De onde vem</div><p style="margin:0">${e(t.nota)}</p></div>
      ${podeMarcar ? (feitaHoje(id) ? `<button class="btn feito" disabled>✓ Prática de hoje concluída</button>` : `<button class="btn primario" id="g-pratica" data-id="${id}">Concluí esta prática hoje ✦</button>`) : ""}
    </section>`;
  }
  Object.keys(GUIA.TECNICAS).forEach(id => { EXT.telas["guia/t-" + id] = () => telaTecnica(id); });

  EXT.telas["guia/resgate"] = function () {
    const c = C(), e = c.esc, n = (c.S.resgates || []).length, fezHoje = (c.S.resgates || []).includes(hoje());
    return `<section class="pagina">
      <header class="topo">${c.voltar("guia")}<span class="chip">${n} ${n === 1 ? "resgate feito" : "resgates feitos"}</span></header>
      <div class="mini">Resgate de frequência</div>
      <h1 style="margin:8px 0">A energia caiu. E agora?</h1>
      <p class="sub">Não é para fingir alegria. É para subir um degrau. Escolha um exercício, faça agora e volte aqui.</p>
      ${GUIA.RESGATES.map(r => `<div class="card clique" data-ir="guia" data-sub='"t-${r.tecnica}"'><div class="card-cab"><span class="mini">${e(r.tempo)}</span><span class="chip violeta">${e(GUIA.TECNICAS[r.tecnica].autor)}</span></div><h3>${e(r.nome)}</h3><p class="sub" style="margin:6px 0 0">${e(r.texto)} Toque para abrir ›</p></div>`).join("")}
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
      <p class="sub">Você já ouviu essas palavras. Aqui está o que elas querem dizer e como aplicar hoje.</p>
      <div class="card">${GUIA.DICIONARIO.map(d => `<div class="termo"><h3>${e(d.termo)}</h3><p>${e(d.significa)}</p><p class="hoje"><b>Hoje:</b> ${e(d.hoje)}</p></div>`).join("")}</div>
    </section>`;
  };

  EXT.telas["guia/fontes"] = function () {
    const c = C(), e = c.esc;
    return `<section class="pagina">
      <header class="topo">${c.voltar("guia")}</header>
      <div class="mini">De onde vem cada prática</div>
      <h1 style="margin:8px 0">As fontes</h1>
      <p class="sub">Nenhuma técnica deste guia foi inventada aqui. Cada uma vem de um autor, uma escola ou um documento.</p>
      <div class="card">${GUIA.FONTES.map(f => `<div class="termo"><h3>${e(f.titulo)}</h3><p>${e(f.detalhe)}</p></div>`).join("")}</div>
      <p class="aviso center">Energia, vibração e física quântica aparecem aqui como linguagem e inspiração, não como explicação científica.</p>
    </section>`;
  };

  /* ---------- cartão da tela Hoje ---------- */
  function cardHoje() {
    const c = C(), e = c.esc; T();
    if (concluida()) return `<div class="card clique ouro-b" data-ir="guia"><div class="card-cab"><span class="mini">Sua trajetória</span><span class="chip verde">ciclo completo ✓</span></div><h3>As sete etapas estão cumpridas</h3><p class="sub" style="margin:6px 0 0">Registre as provas ou comece um novo ciclo ›</p></div>`;
    const et = etapaAtual(), id = praticaDeHoje(et), t = GUIA.TECNICAS[id], dias = Math.min(diasComPratica(et), GUIA.praticasPorEtapa);
    return `<div class="card clique neon" data-ir="guia"><span class="brilho r"></span>
      <div class="card-cab"><span class="mini">Sua trajetória · etapa ${et.n} de 7</span><span class="chip violeta">${e(et.fase)}</span></div>
      <h3>Princípio: ${e(et.principio)}</h3>
      <p class="sub" style="margin:6px 0 10px;font-style:italic">“${e(et.axioma)}”</p>
      <div class="pratica-hoje"><div><div class="mini">Prática de hoje · ${t.min} min</div><b>${e(t.nome)}</b><div class="aviso">${e(t.autor)}</div></div><span class="chip ${feitaHoje(id) ? "verde" : "ouro"}">${feitaHoje(id) ? "feita ✓" : "fazer"}</span></div>
      ${c.barra((et.n - 1 + dias / GUIA.praticasPorEtapa) / 7 * 100)}
    </div>`;
  }
  const afirmacaoDoDia = (data, desloc) => GUIA.AFIRMACOES[(C().diaDoAno(data) + (desloc || 0)) % GUIA.AFIRMACOES.length];

  /* ---------- eventos ---------- */
  EXT.eventos.push(function () {
    const c = C(), S = c.S, $ = c.$;
    document.querySelectorAll("#app [data-campo]").forEach(el => el.addEventListener("input", c.debounce(() => { T().campos[el.dataset.campo] = el.value; c.salvar(); }, 400)));
    document.querySelectorAll("#app [data-campo]").forEach(el => el.addEventListener("blur", () => { T().campos[el.dataset.campo] = el.value; c.salvar(); setTimeout(() => { if (!document.activeElement || !document.activeElement.matches("[data-campo]")) c.render(true); }, 250); }));
    const gp = $("#g-pratica"); if (gp) gp.onclick = () => { const d = hoje(); T(); S.praticas[d] = (S.praticas[d] || []).concat(gp.dataset.id); c.salvar(); c.presenca(); c.toast("Prática registrada ✦"); c.ir("guia"); };
    const gr = $("#g-resgate"); if (gr) gr.onclick = () => { T(); S.resgates.push(hoje()); c.salvar(); c.presenca(); c.celebrar(); c.toast("Um degrau acima ✦"); setTimeout(() => c.render(true), 600); };
    const gc = $("#g-concluir"); if (gc) gc.onclick = () => {
      const t = T(), et = etapaAtual(); if (!pronta(et)) return;
      t.etapa = et.n + 1; t.inicioEtapa = hoje(); c.salvar(); c.celebrar();
      c.toast(et.n < 7 ? `Etapa ${et.n} concluída. Abriu: ${GUIA.ETAPAS[et.n].fase} ✦` : "Ciclo de manifestação completo ✦");
      setTimeout(() => { c.render(true); window.scrollTo({ top: 0 }); }, 700);
    };
    const gn = $("#g-novo"); if (gn) gn.onclick = () => {
      if (!confirm("Começar um novo ciclo com um novo desejo? O ciclo atual fica guardado na lista de anteriores.")) return;
      const t = T(); S.ciclosFeitos.push({ desejo: (t.campos.desejo || "").trim() || "Ciclo " + t.ciclo, inicio: t.inicio, fim: hoje() });
      S.trajeto = { etapa: 1, inicio: hoje(), inicioEtapa: hoje(), campos: {}, ciclo: (t.ciclo || 1) + 1 }; c.salvar(); c.render(true); window.scrollTo({ top: 0 });
    };
  });

  // o que a trajetória pede hoje (usado pela Estela e pela tela Hoje)
  function estadoHoje() {
    T(); if (concluida()) return { concluida: true, liberada: true, feita: true };
    const et = etapaAtual(), id = praticaDeHoje(et);
    return { concluida: false, et, id, tecnica: GUIA.TECNICAS[id], feita: feitaHoje(id), liberada: !!liberada(et.n) };
  }
  return { cardHoje, afirmacaoDoDia, etapaAtual, concluida, estadoHoje };
})();
