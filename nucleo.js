/* Núcleo de regras, sem tela: formato dos dados, migração, backup, progresso da trajetória,
   direitos de acesso e carta semanal. Não toca em DOM nem em localStorage, por isso roda
   também nos testes (tests/*.test.js). Carrega antes de todos os outros módulos. */
window.NUCLEO = (function () {
  "use strict";
  const VERSAO = 2;
  // o que é direito de acesso (fica no aparelho e na conta) e não entra no backup do diário
  const CHAVES_ACESSO = ["acesso", "acessoPor", "portais", "direitos", "direitosEm", "contaEmail", "pagamento"];
  const PORTAIS_DE_PLANO = ["base", "clube", "guia", "profundo", "lua", "amor"];   // qualquer um deles vem de um plano e dá entrada no app
  const DATA = /^\d{4}-\d{2}-\d{2}$/;
  const ehObj = v => !!v && typeof v === "object" && !Array.isArray(v);
  const clone = v => (v === undefined ? v : JSON.parse(JSON.stringify(v)));
  const texto = v => (typeof v === "string" ? v.trim() : "");

  /* ---------- datas (chave AAAA-MM-DD, sem fuso) ---------- */
  const paraUTC = k => { const [a, m, d] = k.split("-").map(Number); return Date.UTC(a, m - 1, d); };
  const deUTC = ms => { const d = new Date(ms); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`; };
  const somaDias = (k, n) => deUTC(paraUTC(k) + n * 86400000);
  const diasEntre = (a, b) => Math.round((paraUTC(b) - paraUTC(a)) / 86400000);

  /* ---------- formato ---------- */
  function padrao(agoraIso) {
    return { v: VERSAO, perfil: null, tour: false, apresentacao: "", dicas: {}, estrelas: {}, dias: {}, presencas: {}, sinais: [], melhorSeq: 0, luas: {}, pessoas: [], mesVisto: "",
      portais: {}, direitos: {}, direitosEm: 0, contaEmail: "", acessoPor: "", pagamento: null, foco: "", genero: "f", nascHora: "", nascCidade: "", encerramento: {}, passos: {},
      praticas: {}, resgates: [], ciclosFeitos: [], cartas: [], acesso: false, criadoEm: agoraIso || new Date().toISOString() };
  }
  const novoTrajeto = (hoje, ciclo, agora) => ({ etapa: 1, inicio: hoje, inicioEtapa: hoje, inicioEtapaEm: agora || 0, campos: {}, ciclo: ciclo || 1, retornos: [] });

  // a que ciclo pertence uma prática antiga, que não trazia o ciclo gravado
  function cicloDaData(S, d) {
    for (const c of S.ciclosFeitos) if (c.inicio && c.fim && d >= c.inicio && d <= c.fim) return c.ciclo;
    if (S.trajeto && d >= S.trajeto.inicio) return S.trajeto.ciclo;
    return 0;
  }

  // leva qualquer versão anterior ao formato atual, sem apagar nada do que a pessoa escreveu
  function migrar(bruto) {
    if (!ehObj(bruto)) throw new Error("estado não é um objeto");
    const de = Number(bruto.v) || 1, S = Object.assign(padrao(bruto.criadoEm), clone(bruto));
    ["dias", "presencas", "luas", "portais", "direitos", "dicas", "estrelas", "encerramento", "passos", "praticas"].forEach(k => { if (!ehObj(S[k])) S[k] = {}; });
    ["sinais", "pessoas", "resgates", "ciclosFeitos", "cartas"].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
    S.ciclosFeitos = S.ciclosFeitos.filter(ehObj).map((c, i) => Object.assign({ ciclo: i + 1 }, c));
    if (ehObj(S.trajeto)) {
      const t = S.trajeto;
      t.etapa = Math.max(1, Math.min(8, Number(t.etapa) || 1));
      t.ciclo = Number(t.ciclo) || S.ciclosFeitos.length + 1;
      t.inicio = DATA.test(t.inicio || "") ? t.inicio : deUTC(Date.now());
      t.inicioEtapa = DATA.test(t.inicioEtapa || "") ? t.inicioEtapa : t.inicio;
      t.inicioEtapaEm = Number(t.inicioEtapaEm) || 0;
      if (!ehObj(t.campos)) t.campos = {};
      if (!Array.isArray(t.retornos)) t.retornos = [];
    } else delete S.trajeto;
    Object.keys(S.praticas).forEach(d => {
      S.praticas[d] = [].concat(S.praticas[d] || []).map(x => (typeof x === "string" ? { id: x, c: cicloDaData(S, d) } : ehObj(x) && typeof x.id === "string" ? x : null)).filter(Boolean);
    });
    S.resgates = S.resgates.map(x => (typeof x === "string" ? { d: x, em: 0 } : ehObj(x) && x.d ? x : null)).filter(Boolean);
    // quem já tinha perfil não é obrigada a ver a apresentação: ela vira um cartão opcional em Hoje
    if (de < 2 && S.perfil) { if (!S.tour) S.apresentacao = "oferecer"; S.tour = true; }
    S.v = VERSAO;
    return S;
  }

  // anotações da antiga jornada de 30 noites, para continuar legíveis
  function jornadaAntiga(S) {
    const noites = Object.keys(S.estrelas || {}).map(n => ({ n: Number(n), data: (S.estrelas[n] || {}).data || "", texto: texto((S.estrelas[n] || {}).diario), feita: !!(S.estrelas[n] || {}).feita }))
      .filter(x => x.texto || x.feita).sort((a, b) => a.n - b.n);
    const outros = [].concat(Object.keys(S.encerramento || {}).map(k => texto(S.encerramento[k])), Object.keys(S.passos || {}).map(k => texto(S.passos[k]))).filter(Boolean);
    return { noites, outros, tem: noites.length > 0 || outros.length > 0 };
  }

  /* ---------- backup ---------- */
  const semAcesso = S => { const d = clone(S); CHAVES_ACESSO.forEach(k => delete d[k]); return d; };
  const exportar = (S, agoraIso) => ({ app: "o-segredo-das-estrelas", formato: VERSAO, exportadoEm: agoraIso || new Date().toISOString(), diario: semAcesso(S) });

  // confere o arquivo inteiro antes de qualquer troca; devolve { ok, erros, estado }
  function validarBackup(entrada) {
    const erros = []; let obj = entrada;
    if (typeof entrada === "string") {
      if (entrada.length > 6000000) return { ok: false, erros: ["arquivo grande demais para ser um backup deste app"], estado: null };
      try { obj = JSON.parse(entrada); } catch (e) { return { ok: false, erros: ["o arquivo não é um JSON válido"], estado: null }; }
    }
    if (!ehObj(obj)) return { ok: false, erros: ["o arquivo não tem o formato de um backup"], estado: null };
    const d = ehObj(obj.diario) ? obj.diario : obj;
    if (obj.formato !== undefined && Number(obj.formato) > VERSAO) erros.push("backup feito em uma versão mais nova do app; atualize o app e tente de novo");
    if (!ehObj(d.perfil) || texto(d.perfil.nome).split(/\s+/).length < 2) erros.push("perfil sem nome completo");
    else if (!DATA.test(d.perfil.nascimento || "") || isNaN(paraUTC(d.perfil.nascimento))) erros.push("perfil sem data de nascimento válida");
    [["dias", "o"], ["presencas", "o"], ["praticas", "o"], ["luas", "o"], ["estrelas", "o"], ["sinais", "a"], ["pessoas", "a"], ["ciclosFeitos", "a"], ["resgates", "a"], ["cartas", "a"]].forEach(([k, tipo]) => {
      if (d[k] === undefined || d[k] === null) return;
      if (tipo === "o" ? !ehObj(d[k]) : !Array.isArray(d[k])) erros.push(`campo "${k}" em formato inesperado`);
    });
    if (ehObj(d.dias) && Object.keys(d.dias).some(k => !DATA.test(k) || !ehObj(d.dias[k]))) erros.push("diário com datas em formato inesperado");
    if (Array.isArray(d.sinais) && d.sinais.some(s => !ehObj(s) || typeof s.texto !== "string")) erros.push("caderno de provas em formato inesperado");
    if (d.trajeto !== undefined && d.trajeto !== null && (!ehObj(d.trajeto) || !(Number(d.trajeto.etapa) >= 1))) erros.push("trajetória em formato inesperado");
    if (erros.length) return { ok: false, erros, estado: null };
    try { return { ok: true, erros: [], estado: migrar(d) }; }
    catch (e) { return { ok: false, erros: ["não consegui ler o backup: " + e.message], estado: null }; }
  }
  // o diário vem do backup; os direitos de acesso continuam os deste aparelho
  function restaurar(atual, estadoDoBackup) {
    const novo = semAcesso(estadoDoBackup);
    CHAVES_ACESSO.forEach(k => { if (atual[k] !== undefined) novo[k] = clone(atual[k]); });
    return novo;
  }

  /* ---------- acesso ---------- */
  const valido = (v, agora) => v === "vitalicio" || new Date(v).getTime() > (agora || Date.now());
  // qualquer direito de plano em dia dá entrada no app, mesmo que o servidor não mande o "base"
  function acessoPorDireitos(direitos, agora) {
    const validos = Object.keys(direitos || {}).filter(k => valido(direitos[k], agora));
    return { entra: validos.some(k => PORTAIS_DE_PLANO.includes(k)), validos };
  }
  // um direito vale se veio do servidor em dia; os do plano Completo também valem como base e Clube
  function temDireito(direitos, id, agora) {
    const d = direitos || {}; if (d[id] && valido(d[id], agora)) return true;
    return (id === "base" || id === "clube") && ["guia", "profundo", "lua", "amor"].some(k => d[k] && valido(d[k], agora));
  }
  // erro de consulta (rede, servidor fora) é diferente de código recusado
  const erroDeCodigo = status => [400, 401, 403, 422].includes(Number(status));
  // nome do plano a partir do que está liberado (a regra de planos está no servidor)
  function planoDe(validos) {
    const tem = k => validos.includes(k);
    if (tem("guia") || tem("profundo") || tem("lua") || tem("amor")) return "Completo";
    if (tem("clube")) return "Plus";
    return tem("base") ? "Essencial" : "";
  }

  /* ---------- eventos do dia: abrir, virar a carta, praticar e fechar a noite são coisas diferentes ---------- */
  const praticasEm = (S, d) => (S.praticas || {})[d] || [];
  const cicloAtual = S => (S.trajeto ? S.trajeto.ciclo : 1);
  function eventos(S, d) {
    const dia = (S.dias || {})[d] || {}, c = cicloAtual(S);
    return { abriu: !!dia.aberto, carta: !!dia.carta, pratica: praticasEm(S, d).some(p => p.c === c), noite: !!dia.noite, checkin: Number(dia.nivel) > 0 };
  }
  const feitaHoje = (S, id, hoje) => praticasEm(S, hoje).some(p => p.id === id && p.c === cicloAtual(S));
  function registrarPratica(S, id, hoje, agora, extra) {
    S.praticas[hoje] = praticasEm(S, hoje).concat(Object.assign({ id, c: cicloAtual(S), em: agora || 0 }, extra || {}));
  }

  /* ---------- progresso da etapa ---------- */
  // dias diferentes, dentro da etapa e do ciclo atual, com alguma prática da etapa
  function diasComPratica(S, et) {
    const t = S.trajeto, c = t.ciclo;
    return Object.keys(S.praticas || {}).filter(d => d >= t.inicioEtapa && praticasEm(S, d).some(p => p.c === c && et.tecnicas.includes(p.id))).length;
  }
  // dias seguidos com prática dentro da etapa; um dia de intervalo não zera (e não conta)
  function sequenciaNaEtapa(S, hoje) {
    const t = S.trajeto, c = t.ciclo, tem = d => d >= t.inicioEtapa && praticasEm(S, d).some(p => p.c === c);
    let n = 0, perdao = 1, d = tem(hoje) ? hoje : somaDias(hoje, -1);
    while (d >= t.inicioEtapa) {
      if (tem(d)) n++;
      else if (perdao > 0 && n > 0 && tem(somaDias(d, -1))) perdao--;
      else break;
      d = somaDias(d, -1);
    }
    return n;
  }
  const depoisDoInicio = (t, d, em) => (em && t.inicioEtapaEm ? em >= t.inicioEtapaEm : d >= t.inicioEtapa);
  function camposOk(S, lista) { const c = S.trajeto.campos; return (lista || []).every(f => texto(c[f.k]).length >= 3); }
  // quanto do marco da etapa já foi cumprido: { feito, meta, ok }
  function marco(S, et, hoje) {
    const t = S.trajeto, m = et.marco, c = t.campos, dias = Object.keys(S.dias || {}).filter(d => d >= t.inicioEtapa);
    let feito = 0, meta = m.meta || 1;
    if (m.tipo === "ritual") feito = t.ritual || camposOk(S, m.legado) ? 1 : 0;
    else if (m.tipo === "campos") { meta = m.campos.length; feito = m.campos.filter(f => texto(c[f.k]).length >= 3).length; if (m.legado && camposOk(S, m.legado)) feito = meta; }
    else if (m.tipo === "sentir") {
      const comNota = Object.keys(S.praticas || {}).filter(d => d >= t.inicioEtapa && praticasEm(S, d).some(p => p.c === t.ciclo && et.tecnicas.includes(p.id) && texto(p.sente)));
      const checkins = dias.filter(d => Number(S.dias[d].nivel) > 0 && depoisDoInicio(t, d, S.dias[d].nivelEm));
      feito = new Set(comNota.concat(checkins)).size;
    }
    else if (m.tipo === "escolha") feito = texto(c[m.campo]) || (S.resgates || []).some(r => depoisDoInicio(t, r.d, r.em)) ? 1 : 0;
    else if (m.tipo === "sequencia") feito = sequenciaNaEtapa(S, hoje);
    else if (m.tipo === "gesto") {
      meta = m.campos.length; feito = m.campos.filter(f => texto(c[f.k]).length >= 3).length;
      if (dias.filter(d => texto(S.dias[d].desejo) && texto(S.dias[d].plano)).length >= 3) feito = meta;   // regra antiga: três intenções com plano
    }
    else if (m.tipo === "colher") feito = texto(c[m.campo]).length >= 3 || texto(c[m.campoLegado]).length >= 3 ? 1 : 0;
    return { feito: Math.min(feito, meta), meta, ok: feito >= meta };
  }
  const pronta = (S, et, hoje, alvo) => diasComPratica(S, et) >= alvo && marco(S, et, hoje).ok;

  // guarda o ciclo inteiro (campos, ritual, práticas, respostas, cartas) antes de começar outro
  function arquivarCiclo(S, hoje, agora, manterIntencao) {
    const t = S.trajeto, c = t.ciclo || 1, praticas = [];
    Object.keys(S.praticas || {}).sort().forEach(d => praticasEm(S, d).forEach(p => { if (p.c === c) praticas.push(Object.assign({ data: d }, p)); }));
    S.ciclosFeitos.push({ ciclo: c, desejo: texto(t.campos.desejo) || "Ciclo " + c, inicio: t.inicio, fim: hoje, etapa: t.etapa, concluido: t.etapa > 7,
      campos: clone(t.campos), ritual: clone(t.ritual || null), gesto: clone(t.gesto || null), retornos: clone(t.retornos || []), praticas, cartas: (S.cartas || []).filter(x => x.c === c) });
    S.trajeto = novoTrajeto(hoje, c + 1, agora);
    if (manterIntencao) S.trajeto.campos.desejo = texto(t.campos.desejo);
    return S.trajeto;
  }

  /* ---------- o retorno do dia seguinte ---------- */
  // o que a Estela pergunta ao abrir: como foi o gesto combinado, ou onde recomeçar depois de faltar
  function retorno(S, hoje) {
    const t = S.trajeto; if (!t) return null;
    const g = t.gesto, dias = Object.keys(S.presencas || {}).filter(d => d < hoje).sort(), ultimo = dias[dias.length - 1] || "";
    const ausencia = ultimo ? diasEntre(ultimo, hoje) - 1 : 0;
    if (g && g.data < hoje && !(t.retornos || []).some(r => r.sobre === g.data)) return { tipo: "gesto", gesto: g, dias: diasEntre(g.data, hoje), ausencia };
    if (ausencia >= 2 && !(S.dias[hoje] || {}).retomou) return { tipo: "ausencia", ausencia };
    return null;
  }

  /* ---------- carta semanal: feita só com o que a pessoa registrou ---------- */
  function cartaSemanal(S, hoje, nomes) {
    const t = S.trajeto || { campos: {}, ciclo: 1 }, ini = somaDias(hoje, -6), dias = []; for (let i = 0; i < 7; i++) dias.push(somaDias(ini, i));
    const fmt = k => k.slice(8) + "/" + k.slice(5, 7), P = [];
    const prat = []; dias.forEach(d => praticasEm(S, d).forEach(p => { if (p.c === t.ciclo) prat.push(Object.assign({ data: d }, p)); }));
    const diasPrat = new Set(prat.map(p => p.data)).size, cont = {}; prat.forEach(p => { cont[p.id] = (cont[p.id] || 0) + 1; });
    const maisFeita = Object.keys(cont).sort((a, b) => cont[b] - cont[a])[0];
    const niveis = dias.map(d => Number((S.dias[d] || {}).nivel) || 0).filter(Boolean), noites = dias.filter(d => (S.dias[d] || {}).noite).length;
    const sinais = (S.sinais || []).filter(s => s.data >= ini && s.data <= hoje), notas = prat.map(p => texto(p.sente)).filter(Boolean);
    const desejo = texto(t.campos.desejo), g = t.gesto, resp = (t.retornos || []).filter(r => r.data >= ini);
    P.push(desejo ? `Esta carta olha para os seus últimos sete dias, de ${fmt(ini)} a ${fmt(hoje)}, com a intenção que você escreveu: “${desejo}”.` : `Esta carta olha para os seus últimos sete dias, de ${fmt(ini)} a ${fmt(hoje)}.`);
    if (diasPrat) P.push(`Você praticou em ${diasPrat} ${diasPrat === 1 ? "dia" : "dias"}${maisFeita ? `. A prática que mais voltou foi “${nomes.tecnica(maisFeita)}”` : ""}.${noites ? ` Fechou a noite ${noites} ${noites === 1 ? "vez" : "vezes"}.` : ""}`);
    else P.push("Esta semana não teve prática registrada. Isso não apaga nada do que você já fez. Recomeçar é só a próxima prática, e ela pode ser a mais curta.");
    if (notas.length) P.push(`Depois de praticar, você escreveu: “${notas[notas.length - 1]}”.`);
    if (niveis.length >= 2) P.push(`No check-in, você foi de “${nomes.nivel(niveis[0])}” a “${nomes.nivel(niveis[niveis.length - 1])}”. ${niveis[niveis.length - 1] < niveis[0] ? "Você terminou a semana alguns degraus acima de onde começou." : niveis[niveis.length - 1] > niveis[0] ? "A semana terminou mais pesada do que começou. Isso é informação, não é nota: mostra onde cuidar primeiro." : "Sua energia se manteve estável."}`);
    else if (niveis.length === 1) P.push(`Você fez um check-in: “${nomes.nivel(niveis[0])}”. Com mais dois, dá para ver o movimento da semana.`);
    if (g && g.texto) { const r = resp[resp.length - 1]; P.push(`Você escolheu levar ${g.qualidade ? "“" + g.qualidade + "”" : "uma qualidade"} para o dia, com este gesto: “${g.texto}”.${r ? " Sua resposta sobre ele: " + ({ fiz: "fiz", adaptei: "adaptei", retomar: "quero retomar" }[r.resposta] || r.resposta) + "." : ""}`); }
    if (sinais.length) P.push(`Você guardou ${sinais.length} ${sinais.length === 1 ? "sinal" : "sinais"} no caderno. Um deles: “${sinais[0].texto}”.`);
    P.push(diasPrat >= 3 ? "Para a próxima semana: mantenha o horário que funcionou e escolha um único gesto por dia." : "Para a próxima semana: escolha um horário fixo, curto, e deixe a prática do dia aberta antes dele.");
    return { id: hoje, c: t.ciclo, de: ini, ate: hoje, paragrafos: P, dados: { diasPrat, noites, checkins: niveis.length, sinais: sinais.length } };
  }
  // a amostra chega dentro da degustação: no 5º dia de uso se já houver duas práticas, ou no 6º de qualquer jeito
  function cartaLiberaEm(S, hoje) {
    const dia = diasEntre(String(S.criadoEm || "").slice(0, 10) || hoje, hoje) + 1, c = cicloAtual(S);
    const comPratica = Object.keys(S.praticas || {}).filter(d => praticasEm(S, d).some(p => p.c === c)).length;
    return { dia, amostra: dia >= 6 || (dia >= 5 && comPratica >= 2) };
  }

  return { VERSAO, CHAVES_ACESSO, padrao, novoTrajeto, migrar, jornadaAntiga, exportar, validarBackup, restaurar, semAcesso, valido, acessoPorDireitos, temDireito, erroDeCodigo, planoDe,
    eventos, praticasEm, feitaHoje, registrarPratica, diasComPratica, sequenciaNaEtapa, marco, pronta, arquivarCiclo, retorno, cartaSemanal, cartaLiberaEm, somaDias, diasEntre, clone, texto };
})();
