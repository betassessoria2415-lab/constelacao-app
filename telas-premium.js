/* Telas dos portais: loja, Mapa Profundo, Lua e Ascendente, Nome de Poder, Previsão do ano.
   Carrega antes de app.js e se registra em CDA_EXT; usa window.CDA na hora de renderizar. */
(function () {
  "use strict";
  const EXT = window.CDA_EXT, P = window.PREMIUM;
  const C = () => window.CDA;
  const lock = (id, html, txt) => (P.liberado(id) ? html : P.cadeado(id, html, txt));
  const ROTAS = { guia: ["guia", ""], profundo: ["mapa", "profundo"], ano: ["ceu", "ano"], lua: ["mapa", "lua"], amor: ["mapa", "compat"], nome: ["mapa", "nome"], clube: ["hoje", "mes"] };
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const nasc = () => C().S.perfil.nascimento.split("-").map(Number);

  /* ---------- loja ---------- */
  EXT.telas["portais/"] = function () {
    const c = C(), e = c.esc, S = c.S, deg = P.degustando();
    const restam = deg ? Math.max(1, Math.ceil((c.CONFIG.diasDegustacao || 7) - (Date.now() - new Date(S.criadoEm).getTime()) / 86400000)) : 0;
    return `<section class="pagina">
      ${c.topo("Seus portais")}
      <h1>Portais</h1>
      <p class="sub">Cada portal abre uma camada mais funda do seu mapa. Toque para ver a prévia com os seus dados.</p>
      ${deg ? `<div class="card ouro-b"><div class="mini" style="margin-bottom:6px">Degustação do Clube</div><p style="margin:0">Você tem acesso completo ao Clube por mais <b>${restam} ${restam === 1 ? "dia" : "dias"}</b>. Depois, a previsão do mês e os ciclos da Lua pedem o código do mês.</p></div>` : ""}
      ${P.CATALOGO.map(p => { const ok = P.liberado(p.id) && !(p.id === "clube" && deg), r = ROTAS[p.id];
        return `<div class="card clique portal-card ${ok ? "" : "neon"}" data-ir="${r[0]}" data-sub='"${r[1]}"'>${ok ? "" : '<span class="brilho v"></span>'}
          <div class="card-cab"><span class="portal-ic">${p.icone}</span><span class="chip ${ok ? "verde" : "ouro"}">${ok ? "liberado ✓" : p.plano ? "plano " + e(p.plano) : e(p.preco)}</span></div>
          <h3>${e(p.nome)}</h3><p class="sub" style="margin:6px 0 10px">${e(p.chamada)}</p>
          <ul class="lista compacta">${p.beneficios.slice(0, 3).map(b => `<li><span class="ic">✦</span><span>${e(b)}</span></li>`).join("")}</ul>
          ${ok ? "" : `<button class="btn primario pequeno" data-portal="${p.id}" style="width:100%;margin-top:12px">${p.plano ? "Assinar o plano " + e(p.plano) : "Liberar " + e(p.nome)}</button>`}
        </div>`; }).join("")}
      <p class="aviso center">Os códigos chegam no e-mail da compra e liberam este aparelho. Conteúdo simbólico, para reflexão.</p>
    </section>`;
  };

  /* ---------- Mapa Profundo ---------- */
  function reguaSVG(momentos, idade) {
    const max = 90, x = a => 10 + Math.min(a, max) / max * 280, cores = ["#9B5CFF", "#E8C078", "#FF7AD9", "#7BE0B0"];
    const seg = momentos.map((m, i) => { const x1 = x(m.de), x2 = x(Math.min(m.ate + 1, max)); return `<rect x="${x1}" y="26" width="${Math.max(2, x2 - x1 - 2)}" height="14" rx="7" fill="${cores[i]}" opacity="${idade >= m.de && idade <= m.ate ? 1 : .45}"/><text x="${(x1 + x2) / 2}" y="20" class="rg-n">${m.n}</text><text x="${x1}" y="54" class="rg-i">${m.de}</text>`; }).join("");
    return `<svg class="regua" viewBox="0 0 300 70" role="img" aria-label="Linha da vida">${seg}<line x1="${x(idade)}" y1="22" x2="${x(idade)}" y2="46" stroke="#fff" stroke-width="2"/><circle cx="${x(idade)}" cy="33" r="5" fill="#fff"/><text x="${x(idade)}" y="66" class="rg-v">você, ${idade}</text></svg>`;
  }
  function trianguloHTML(t) {
    const larga = t.linhas[0].length;
    return `<div class="tri" style="--n:${larga}">${t.linhas.map(l => { const marca = l.map((v, i) => (l[i - 1] === v && l[i + 1] === v) || (l[i + 1] === v && l[i + 2] === v) || (l[i - 1] === v && l[i - 2] === v));
      return `<div>${l.map((v, i) => `<span class="${marca[i] ? "seq" : ""}">${v}</span>`).join("")}</div>`; }).join("")}</div>`;
  }
  EXT.telas["mapa/profundo"] = function (M) {
    const c = C(), e = c.esc, S = c.S, [a, m, d] = nasc(), idade = PROFUNDO.idade(S.perfil.nascimento);
    const mom = PROFUNDO.momentos(d, m, a, M.destino), des = PROFUNDO.desafios(d, m, a, M.destino), cic = PROFUNDO.ciclos(d, m, a, M.destino);
    const fr = PROFUNDO.frequencias(S.perfil.nome), tri = PROFUNDO.triangulo(S.perfil.nome), L = COMBOS.ler(M.destino, M.expressao, M.motivacao);
    const agora = x => idade >= x.de && idade <= x.ate, maxF = Math.max(...Object.values(fr.f), 1), ok = P.liberado("profundo");
    return `<section class="pagina">
      <header class="topo">${c.voltar("mapa")}<span class="chip ${ok ? "verde" : "ouro"}">${ok ? "liberado ✓" : "prévia"}</span></header>
      <div class="mini">Mapa Profundo</div>
      <h1 style="margin:8px 0">A sua linha da vida inteira</h1>
      <p class="sub">Os números abaixo já são os seus. Cada um mostra a conta de onde veio.</p>

      <div class="card neon"><span class="brilho v"></span>
        <div class="card-cab"><span class="mini">Leitura combinada</span><span class="chip violeta">destino ${M.destino} · expressão ${M.expressao} · motivação ${M.motivacao}</span></div>
        <h3>${e(cap(L.titulo))}</h3>
        <p style="margin-top:8px">${e(L.ajuda)}</p>
        ${lock("profundo", `<div class="area"><div class="ic">ϟ</div><div><div class="mini">Onde seus números brigam</div><p>${e(L.atrito)}</p></div></div>
          <div class="area"><div class="ic">♡</div><div><div class="mini">O que move você por dentro</div><p>${e(L.motivacao)} ${e(L.tensao)}</p></div></div>
          <div class="area"><div class="ic">◈</div><div><div class="mini">O conselho de dinheiro da sua combinação</div><p>${e(L.dinheiro)}</p></div></div>
          ${[L.par, L.espelho, L.mestre].filter(Boolean).map(t => `<p class="citacao" style="margin-top:12px">${e(t)}</p>`).join("")}`, "Onde seus números se ajudam, onde brigam e o conselho de dinheiro.")}
      </div>

      <div class="grade2" style="margin-bottom:14px">
        <div class="card" style="margin:0"><div class="mini">Número de missão</div><div class="num-medio">${PROFUNDO.missao(M.destino, M.expressao)}</div><div class="sub" style="font-size:13px">destino ${M.destino} + expressão ${M.expressao}: ${e(NUM.SIGNIFICADOS[PROFUNDO.missao(M.destino, M.expressao)].nome)}</div></div>
        <div class="card" style="margin:0"><div class="mini">Suas cores favoráveis</div><div class="sub" style="font-size:14px;margin-top:6px;color:var(--texto)">${e(cap(PROFUNDO.CORES[M.expressao]))}</div></div>
      </div>

      <div class="card">
        <div class="card-cab"><span class="mini">Seus 4 momentos decisivos</span><span class="chip">por idade</span></div>
        ${reguaSVG(mom, idade)}
        ${mom.map((x, i) => `<div class="evento"><div class="d">${x.n}<small>${i + 1}º</small></div><div style="flex:1"><b>${x.de} a ${x.ate >= 120 ? "em diante" : x.ate + " anos"}</b> ${agora(x) ? '<span class="chip ouro">você está aqui</span>' : ""}<div class="aviso">${e(x.conta)}</div>
          ${agora(x) && !ok ? `<p style="margin:6px 0 0">${e(PROFUNDO.MOMENTO[x.n].split(". ")[0])}.</p>` : ""}${ok ? `<p style="margin:6px 0 0">${e(PROFUNDO.MOMENTO[x.n])}</p>` : ""}</div></div>`).join("")}
        ${ok ? "" : P.cadeado("profundo", `<p>${e(PROFUNDO.MOMENTO[mom[1].n])}</p><p>${e(PROFUNDO.MOMENTO[mom[2].n])}</p>`, "A leitura completa de cada fase, incluindo as próximas.")}
      </div>

      <div class="card">
        <div class="card-cab"><span class="mini">Seus 3 ciclos de vida</span></div>
        ${cic.map(x => `<div class="evento"><div class="d">${x.n}</div><div style="flex:1"><b>${e(x.nome)}</b> · ${x.de} a ${x.ate >= 120 ? "em diante" : x.ate + " anos"} ${agora(x) ? '<span class="chip ouro">agora</span>' : ""}<div class="aviso">${e(x.conta)}</div>${ok || agora(x) ? `<p style="margin:6px 0 0">Este ciclo ${e(PROFUNDO.CICLO_VIDA[x.n])}</p>` : ""}</div></div>`).join("")}
      </div>

      <div class="card">
        <div class="card-cab"><span class="mini">Seus desafios</span></div>
        ${des.map(x => `<div class="evento"><div class="d">${x.n}</div><div style="flex:1"><b>${e(x.nome)}</b> · ${e(x.periodo)}<div class="aviso">${e(x.conta)}</div></div></div>`).join("")}
        ${lock("profundo", des.map(x => `<p><b>${e(x.nome)} (${x.n}).</b> ${e(PROFUNDO.DESAFIO[x.n])}</p>`).join(""), "O que cada desafio pede e o gesto prático para atravessar.")}
      </div>

      <div class="card">
        <div class="card-cab"><span class="mini">O que seu nome tem de sobra e de falta</span></div>
        <div class="freqs">${Object.keys(fr.f).map(n => `<div class="${fr.f[n] === 0 ? "zero" : fr.f[n] >= 4 ? "muito" : ""}"><i style="height:${Math.max(4, fr.f[n] / maxF * 64)}px"></i><b>${n}</b><small>${fr.f[n]}×</small></div>`).join("")}</div>
        <p class="aviso" style="margin-top:8px">Quantas vezes cada número aparece nas letras do seu nome. Zero indica lição a aprender; quatro ou mais, uma tendência forte.</p>
        ${lock("profundo", `${fr.licoes.length ? fr.licoes.map(n => `<p>${e(PROFUNDO.LICAO[n])}</p>`).join("") : "<p>Seu nome tem todos os números de 1 a 9: nenhuma lição cármica pendente.</p>"}
          ${fr.tendencias.map(n => `<p>${e(PROFUNDO.TENDENCIA[n])}</p>`).join("")}
          <p class="citacao">Resposta subconsciente ${fr.subconsciente}: quanto mais alto (de 2 a 9), mais recursos internos você tem para reagir bem a imprevistos.</p>`, `${fr.licoes.length} ${fr.licoes.length === 1 ? "lição" : "lições"} e ${fr.tendencias.length} ${fr.tendencias.length === 1 ? "tendência" : "tendências"} no seu nome.`)}
      </div>

      <div class="card">
        <div class="card-cab"><span class="mini">Seu triângulo da vida</span><span class="chip ouro">regente ${tri.regente}</span></div>
        ${trianguloHTML(tri)}
        <p class="aviso" style="margin-top:8px">Cada linha soma os vizinhos da linha de cima. Três números iguais seguidos formam uma sequência, marcada em dourado.</p>
        ${lock("profundo", tri.sequencias.length ? tri.sequencias.map(n => `<p>${e(PROFUNDO.SEQUENCIA[n])}</p>`).join("") : "<p>Seu triângulo não tem sequências repetidas: caminho mais livre de bloqueios recorrentes.</p>", `${tri.sequencias.length} ${tri.sequencias.length === 1 ? "sequência encontrada" : "sequências encontradas"} e o antídoto de cada uma.`)}
      </div>
      ${ok ? `<button class="btn primario" id="pf-imprimir">Salvar meu Mapa Profundo em PDF</button>` : `<button class="btn primario" data-portal="profundo">Liberar o Mapa Profundo completo ✦</button>`}
      <p class="aviso center" style="margin-top:12px">Numerologia como espelho, não como sentença. Você escolhe o que fazer com cada número.</p>
    </section>`;
  };

  /* ---------- Lua e Ascendente ---------- */
  EXT.telas["mapa/lua"] = function (M) {
    const c = C(), e = c.esc, S = c.S, ok = P.liberado("lua");
    const cid = ASTRO2.CIDADES.find(x => x.nome === S.nascCidade) || null, fuso = cid ? cid.fuso : -3;
    const lua = ASTRO2.signoLunar(S.perfil.nascimento, S.nascHora, fuso), asc = S.nascHora && cid ? ASTRO2.ascendente(S.perfil.nascimento, S.nascHora, cid) : null;
    const hoje = ASTROS.faseLua(new Date()).signo, retorno = hoje.i === lua.i;
    return `<section class="pagina">
      <header class="topo">${c.voltar("mapa")}<span class="chip ${ok ? "verde" : "ouro"}">${ok ? "liberado ✓" : "prévia"}</span></header>
      <div class="mini">Lua e Ascendente</div>
      <h1 style="margin:8px 0">Seu Sol é só um terço da história</h1>
      <p class="sub">O Sol diz quem você é. A Lua, como você sente. O Ascendente, como você chega.</p>
      <div class="card">
        <div class="grade2"><div class="campo"><label>Hora do nascimento</label><input id="lu-hora" type="time" value="${e(S.nascHora || "")}"></div>
        <div class="campo"><label>Cidade</label><select id="lu-cid"><option value="">Escolher…</option>${ASTRO2.CIDADES.map(x => `<option ${x.nome === S.nascCidade ? "selected" : ""}>${e(x.nome)}</option>`).join("")}</select></div></div>
        <button class="btn fantasma pequeno" id="lu-salvar" style="width:100%">Atualizar cálculo</button>
        <p class="aviso" style="margin:10px 0 0">Sem a hora, a Lua é calculada ao meio-dia. Escolha a cidade mais próxima de onde nasceu. Se nasceu em horário de verão, subtraia uma hora.</p>
      </div>
      <div class="trio">
        <div class="card"><div class="mini">Sol</div><div class="tr-s">${M.signo.simbolo}</div><b>${e(M.signo.nome)}</b></div>
        <div class="card ${ok ? "neon" : ""}"><div class="mini">Lua</div><div class="tr-s">${ok ? lua.simbolo : "☾"}</div><b class="${ok ? "" : "borrado"}">${e(lua.nome)}</b></div>
        <div class="card"><div class="mini">Ascendente</div><div class="tr-s">${ok && asc ? asc.simbolo : "↑"}</div><b class="${ok && asc ? "" : asc ? "borrado" : ""}">${asc ? e(asc.nome) : "informe a hora"}</b></div>
      </div>
      <div class="card"><div class="mini" style="margin-bottom:8px">Seu Sol em ${e(M.signo.nome)}</div><p style="margin:0">${e(M.signo.prosp)}</p></div>
      ${lock("lua", `<div class="card" style="margin:0 0 14px"><div class="mini" style="margin-bottom:8px">Sua Lua, ${lua.grau}° de ${e(lua.nome)}</div><p>${e(ASTRO2.LUA_TXT[lua.i])}</p>${lua.duvida ? `<p class="aviso">A Lua trocou de signo no dia em que você nasceu: pode ser ${e(lua.duvida[0])} ou ${e(lua.duvida[1])}. Informe a hora para confirmar.</p>` : ""}</div>
        <div class="card" style="margin:0 0 14px"><div class="mini" style="margin-bottom:8px">Seu Ascendente</div><p style="margin:0">${asc ? e(ASTRO2.ASC_TXT[asc.i]) : "Informe hora e cidade acima para calcular."}</p></div>
        <div class="card" style="margin:0"><div class="mini" style="margin-bottom:8px">O trio no dinheiro</div><p style="margin:0">Você ganha do jeito do seu Sol (${e(M.signo.palavras[0])}), se sente segura do jeito da sua Lua (${e(lua.nome)}) e abre portas do jeito do seu Ascendente${asc ? " (" + e(asc.nome) + ")" : ""}. Quando os três estão atendidos, a prosperidade deixa de pesar.</p></div>`, "Seu signo lunar, seu ascendente e o trio lido para dinheiro e emoção.")}
      <div class="card ${retorno ? "ouro-b" : ""}"><div class="card-cab"><span class="mini">Lua de hoje</span><span class="chip">${hoje.simbolo} ${e(hoje.nome)}</span></div>
        <p style="margin:0">${ok ? (retorno ? "A Lua hoje passa pelo seu signo lunar: seu dia de recarga do mês. Emoções mais nítidas, bom para decidir o que você sente de verdade." : `A Lua hoje está em ${e(hoje.nome)}. Ela volta ao seu signo lunar uma vez por mês; o app avisa aqui.`) : `A Lua hoje está em ${e(hoje.nome)}. Com o portal aberto, o app avisa quando ela passa pelo seu signo lunar.`}</p></div>
    </section>`;
  };

  /* ---------- Nome de Poder ---------- */
  const NEGOCIO = {
    1: ["forte", "Vibração de liderança e pioneirismo. Boa para marcas autorais e negócios que inovam."], 2: ["suave", "Vibração de parceria e acolhimento. Boa para atendimento e sociedades; lenta para vendas agressivas."],
    3: ["forte", "Vibração de comunicação e simpatia. Excelente para vendas, conteúdo, beleza e tudo que precisa aparecer."], 4: ["estável", "Vibração de trabalho e confiança. Boa para serviços técnicos e construção; cresce devagar e firme."],
    5: ["forte", "Vibração de movimento e novidade. Ótima para comércio, viagens, vendas online e públicos jovens."], 6: ["forte", "Vibração de cuidado e harmonia. Excelente para casa, família, alimentação, saúde e estética."],
    7: ["seletiva", "Vibração de estudo e profundidade. Boa para ensino, terapia e consultoria; fraca para comércio popular."], 8: ["forte", "A vibração do dinheiro e do poder. Excelente para negócios, finanças e marcas que querem escala."],
    9: ["ampla", "Vibração humanitária e de alcance. Boa para causas, educação e saúde; pede propósito claro."], 11: ["inspiradora", "Número mestre: marca que inspira e atrai seguidores. Exige coerência."], 22: ["construtora", "Número mestre: vibração de grandes obras e empresas duradouras."]
  };
  function variantes(nome) {
    const p = NUM.normalizar(nome).split(" ").filter(Boolean), out = [];
    if (p.length >= 2) out.push(p[0] + " " + p[p.length - 1]);
    if (p.length >= 3) { out.push(p[0] + " " + p.slice(1, -1).map(x => x[0]).join(" ") + " " + p[p.length - 1]); p.forEach((_, i) => { if (i > 0) out.push(p.filter((__, j) => j !== i).join(" ")); }); }
    if (p.length >= 1) out.push(p[0]);
    return [...new Set(out)].filter(x => x && x !== p.join(" ")).slice(0, 6);
  }
  EXT.telas["mapa/nome"] = function () {
    const c = C(), e = c.esc, S = c.S, ok = P.liberado("nome"), lista = S.nomes || [];
    const linha = (n, extra = "") => { const x = NUM.expressao(n), s = NUM.SIGNIFICADOS[x], ng = NEGOCIO[x]; return `<div class="evento"><div class="d">${x}</div><div style="flex:1"><b>${e(n)}</b> ${extra}<div class="sub" style="font-size:13.5px">${e(s.nome)} · vibração ${e(ng[0])}</div><div style="font-size:14px;margin-top:4px">${e(ng[1])}</div></div></div>`; };
    const meu = S.perfil.nome, vars = variantes(meu);
    return `<section class="pagina">
      <header class="topo">${c.voltar("mapa")}<span class="chip ${ok ? "verde" : "ouro"}">${ok ? "liberado ✓" : "prévia"}</span></header>
      <div class="mini">Nome de Poder</div>
      <h1 style="margin:8px 0">O nome que você assina também vibra</h1>
      <p class="sub">Compare sua assinatura, o nome do seu negócio ou opções de nome de bebê.</p>
      <div class="card"><div class="mini" style="margin-bottom:6px">Seu nome de nascimento</div>${linha(meu)}</div>
      ${lock("nome", `<div class="card" style="margin:0 0 14px"><div class="mini" style="margin-bottom:6px">Como você pode assinar</div>${vars.map(v => linha(v.toLowerCase().replace(/(^|\s)\S/g, t => t.toUpperCase()))).join("")}
        <p class="aviso" style="margin-top:8px">O nome de certidão não muda seu mapa. A assinatura é a vibração que você escolhe usar no dia a dia e nos negócios. Para vender e aparecer, 3, 5, 6 e 8 costumam ser os mais favoráveis.</p></div>`, "Veja o número de cada jeito de assinar e qual favorece mais os negócios.")}
      <div class="card">
        <div class="mini" style="margin-bottom:8px">Comparar nomes</div>
        <div style="display:flex;gap:8px"><input id="nm-novo" placeholder="Nome do negócio, da marca ou do bebê" maxlength="60"><button class="btn primario pequeno" id="nm-add" style="flex:0 0 auto">Comparar</button></div>
        <p class="aviso" style="margin:8px 0 0">${ok ? "Adicione quantos quiser." : "Com o portal aberto você compara quantos nomes quiser, lado a lado."}</p>
        ${lista.length ? `<div class="sep"></div>${lista.map((n, i) => linha(n, `<button class="voltar" data-nm-rm="${i}" style="padding:2px 8px;font-size:11px">remover</button>`)).join("")}` : ""}
      </div>
    </section>`;
  };

  /* ---------- Previsão do ano ---------- */
  EXT.telas["ceu/ano"] = function (M) {
    const c = C(), e = c.esc, S = c.S, h = new Date(), ano = h.getMonth() >= 9 ? h.getFullYear() + 1 : h.getFullYear(), ok = P.liberado("ano");
    const [a, m, d] = nasc(), ap = NUM.anoPessoal(d, m, ano), A = PREVISAO.ANO[ap], idadeAno = ano - a;
    const mom = PROFUNDO.momentos(d, m, a, M.destino).find(x => idadeAno >= x.de && idadeAno <= x.ate), cic = PROFUNDO.ciclos(d, m, a, M.destino).find(x => idadeAno >= x.de && idadeAno <= x.ate);
    const carta = DIARIO.CARTAS[PREVISAO.cartaDoAno(d, m, ano) - 1];
    const meses = Array.from({ length: 12 }, (_, i) => { const n = new Date(ano, i + 1, 0).getDate(), dias = c.diasPessoais(M, new Date(ano, i, 1), n), mp = NUM.mesPessoal(d, m, ano, i + 1);
      return { i, mp, info: CICLOS.MES[mp], ouro: dias.slice().sort((x, y) => y.pts.dinheiro - x.pts.dinheiro).slice(0, 3).sort((x, y) => x.dt - y.dt).map(x => x.dt.getDate()) }; });
    const mesHTML = x => `<div class="evento"><div class="d">${x.mp}<small>${c.MESES[x.i].slice(0, 3)}</small></div><div style="flex:1"><b>${e(cap(c.MESES[x.i]))} · ${e(x.info.palavra)}</b><div style="font-size:14px;margin-top:2px">${e(x.info.dinheiro)}</div><div class="aviso">Dias de ouro: ${x.ouro.join(", ")}</div></div></div>`;
    return `<section class="pagina">
      <header class="topo">${c.voltar("ceu")}<span class="chip ${ok ? "verde" : "ouro"}">${ok ? "liberado ✓" : "prévia"}</span></header>
      <div class="mini">Previsão ${ano} · ano universal ${NUM.anoUniversal(ano)}</div>
      <h1 style="margin:8px 0">${e(A.titulo)}</h1>
      <div class="card neon"><span class="brilho v"></span>
        <div class="num-hero"><div class="num-grande">${ap}</div><div><h2>Seu ano pessoal ${ap}</h2><p class="sub" style="margin:4px 0 0">${e(NUM.CICLO[ap].resumo)}</p></div></div>
        <div class="sep"></div><p>${e(A.abertura)}</p>
        ${lock("ano", `<div class="area"><div class="ic">◈</div><div><div class="mini">Dinheiro em ${ano}</div><p>${e(A.dinheiro)}</p></div></div>
          <div class="area"><div class="ic">♡</div><div><div class="mini">Amor e relações</div><p>${e(A.amor)}</p></div></div>
          <div class="area"><div class="ic">ϟ</div><div><div class="mini">Ponto de atenção</div><p>${e(A.atencao)}</p></div></div>`, "Dinheiro, amor e o ponto de atenção do seu ano.")}
      </div>
      <div class="card ouro-b"><div class="card-cab"><span class="mini">Sua carta do ano</span><span class="chip ouro">${e(carta.arcano)}</span></div>
        <div style="display:flex;gap:16px;align-items:center"><div class="hebraica" style="font-size:56px;line-height:1">${carta.letra}</div><div><h3>${e(carta.nome)}</h3><p style="margin:4px 0 0" class="${ok ? "" : "borrado"}">${e(carta.msg)}</p></div></div></div>
      <div class="card"><div class="card-cab"><span class="mini">O pano de fundo de ${ano}</span></div>
        <div class="evento"><div class="d">${mom.n}</div><div><b>Momento decisivo em vigor</b><div class="${ok ? "" : "borrado"}" style="font-size:14px">${e(PROFUNDO.MOMENTO[mom.n])}</div></div></div>
        <div class="evento"><div class="d">${cic.n}</div><div><b>${e(cic.nome)}</b><div class="${ok ? "" : "borrado"}" style="font-size:14px">Este ciclo ${e(PROFUNDO.CICLO_VIDA[cic.n])}</div></div></div></div>
      <div class="card"><div class="card-cab"><span class="mini">Os quatro trimestres</span></div>
        ${lock("ano", `<ul class="lista">${A.trimestres.map(t => `<li><span class="ic">✦</span><span>${e(t)}</span></li>`).join("")}</ul>`, "O roteiro do ano, trimestre a trimestre.")}</div>
      <div class="card"><div class="card-cab"><span class="mini">Seus 12 meses</span><span class="chip">dias de ouro marcados</span></div>
        ${mesHTML(meses[0])}
        ${lock("ano", meses.slice(1).map(mesHTML).join(""), "Os outros 11 meses com palavra, foco de dinheiro e dias de ouro.")}</div>
      ${ok ? `<button class="btn primario" id="pf-imprimir">Salvar minha Previsão ${ano} em PDF</button>` : `<button class="btn primario" data-portal="ano">Liberar a Previsão ${ano} ✦</button>`}
      <p class="aviso center" style="margin-top:12px">Previsão simbólica: mostra o clima de cada fase, não o que vai acontecer. As escolhas são suas.</p>
    </section>`;
  };

  /* ---------- eventos das telas ---------- */
  EXT.eventos.push(function () {
    const c = C(), S = c.S, $ = c.$;
    const imp = $("#pf-imprimir"); if (imp) imp.onclick = () => window.print();
    const ls = $("#lu-salvar"); if (ls) ls.onclick = () => { S.nascHora = $("#lu-hora").value || ""; S.nascCidade = $("#lu-cid").value || ""; c.salvar(); c.render(true); c.toast("Cálculo atualizado ✦"); };
    const na = $("#nm-add"); if (na) { const add = () => { const v = $("#nm-novo").value.trim(); if (!NUM.normalizar(v)) return c.toast("Digite um nome para comparar."); S.nomes = S.nomes || [];
      if (!P.liberado("nome") && S.nomes.length >= 1) return P.abrir("nome"); S.nomes = [v].concat(S.nomes).slice(0, 20); c.salvar(); c.render(true); }; na.onclick = add; $("#nm-novo").onkeydown = ev => { if (ev.key === "Enter") add(); }; }
    document.querySelectorAll("#app [data-nm-rm]").forEach(b => b.onclick = () => { S.nomes.splice(Number(b.dataset.nmRm), 1); c.salvar(); c.render(true); });
  });
})();
