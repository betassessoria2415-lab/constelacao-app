const { test } = require("node:test"), assert = require("node:assert/strict");
const { carregar, plano, ANTIGO_30_NOITES, ANTIGO_27814A7 } = require("./apoio.js");
const W = carregar(["nucleo.js", "dados/guia.js"]), N = W.NUCLEO, GUIA = W.GUIA, ET = n => GUIA.ETAPAS[n - 1];

// cliente nova, no primeiro dia de uso
function nova(hoje = "2026-11-10") {
  const S = N.padrao(hoje + "T10:00:00.000Z"); S.perfil = { nome: "Maria Aparecida da Silva", nascimento: "1978-05-14" };
  S.trajeto = N.novoTrajeto(hoje, 1, 1000); return S;
}
const praticar = (S, dia, id, extra) => N.registrarPratica(S, id, dia, 2000, extra);

/* ---------- formato e migração ---------- */
test("as sete estrelas têm os nomes novos e um marco cada", () => {
  assert.deepEqual(plano(GUIA.ETAPAS.map(e => e.nome)), ["Acender a intenção", "Encontrar sua direção", "Elevar a energia", "Atravessar a dúvida", "Sustentar o ritmo", "Dar forma ao desejo", "Colher e seguir"]);
  GUIA.ETAPAS.forEach(e => { assert.ok(e.marco && e.marco.tipo, "estrela " + e.n + " sem marco"); assert.ok(e.principio && e.axioma, "princípio hermético mantido"); e.tecnicas.forEach(id => assert.ok(GUIA.TECNICAS[id], "técnica " + id)); });
});

test("cliente da versão das 30 noites encontra o que escreveu", () => {
  const S = N.migrar(ANTIGO_30_NOITES()), j = N.jornadaAntiga(S);
  assert.equal(S.v, N.VERSAO);
  assert.equal(j.tem, true);
  assert.equal(j.noites.length, 3);
  assert.equal(j.noites[0].texto, "Primeira noite: agradeci pelo que já tenho.");
  assert.equal(j.noites[2].texto, "Rascunho da terceira noite.");
  assert.ok(j.outros.includes("Carta para a Maria do futuro.") && j.outros.includes("Abrir a poupança."));
  assert.equal(S.dias["2026-08-01"].desejo, "vender dois bolos");
  assert.equal(S.sinais[0].texto, "ganhei um desconto");
  assert.equal(S.acesso, true, "o acesso adquirido é preservado");
  assert.equal(S.tour, true, "perfil antigo não é obrigado a rever a apresentação");
  assert.equal(S.apresentacao, "oferecer", "a apresentação vira um cartão opcional");
});

test("cliente da versão anterior (27814a7) mantém campos, direitos e ganha o ciclo em cada prática", () => {
  const S = N.migrar(ANTIGO_27814A7());
  assert.equal(S.trajeto.campos.desejo, "abrir minha confeitaria");
  assert.equal(S.trajeto.campos.crenca1, "dinheiro é difícil");
  assert.deepEqual(plano(S.direitos), { guia: "2099-01-01T00:00:00Z" });
  assert.equal(S.portais.nome, true);
  assert.equal(S.apresentacao, "", "quem já tinha visto a apresentação não recebe o cartão");
  assert.equal(S.ciclosFeitos[0].ciclo, 1);
  assert.deepEqual(plano(S.praticas["2026-09-03"]), [{ id: "silencio", c: 1 }, { id: "autossugestao", c: 1 }], "práticas do ciclo antigo ficam no ciclo 1");
  assert.deepEqual(plano(S.praticas["2026-10-24"]), [{ id: "tela", c: 2 }], "práticas do ciclo atual ficam no ciclo 2");
  assert.deepEqual(plano(S.resgates), [{ d: "2026-10-22", em: 0 }]);
  assert.deepEqual(plano(N.migrar(plano(S))), plano(S), "migrar de novo não muda nada");
});

test("a migração não aceita o que não é um estado", () => {
  assert.throws(() => N.migrar(null)); assert.throws(() => N.migrar([1, 2])); assert.throws(() => N.migrar("texto"));
});

/* ---------- backup ---------- */
test("backup inválido é recusado inteiro e o diário atual fica intacto", () => {
  const atual = nova(); atual.dias["2026-11-10"] = { desejo: "meu diário de verdade" };
  const antes = JSON.stringify(atual);
  const ruins = ["isto não é json", "[]", "{}", JSON.stringify({ perfil: { nome: "Só" } }), JSON.stringify({ perfil: { nome: "Maria Silva", nascimento: "14/05/1978" } }),
    JSON.stringify({ perfil: { nome: "Maria Silva", nascimento: "1978-05-14" }, dias: [] }), JSON.stringify({ perfil: { nome: "Maria Silva", nascimento: "1978-05-14" }, dias: { "ontem": {} } }),
    JSON.stringify({ perfil: { nome: "Maria Silva", nascimento: "1978-05-14" }, sinais: [{ data: "2026-01-01" }] }), JSON.stringify({ perfil: { nome: "Maria Silva", nascimento: "1978-05-14" }, trajeto: "quebrado" }),
    JSON.stringify({ app: "o-segredo-das-estrelas", formato: 99, diario: { perfil: { nome: "Maria Silva", nascimento: "1978-05-14" } } })];
  ruins.forEach(r => { const v = N.validarBackup(r); assert.equal(v.ok, false, r.slice(0, 40)); assert.equal(v.estado, null); assert.ok(v.erros.length > 0); });
  assert.equal(JSON.stringify(atual), antes, "validar não toca no estado atual");
});

test("backup novo vai e volta: o diário vem do arquivo, o acesso continua o do aparelho", () => {
  const origem = N.migrar(ANTIGO_27814A7()), arquivo = JSON.stringify(N.exportar(origem, "2026-11-22T00:00:00.000Z"));
  N.CHAVES_ACESSO.forEach(k => assert.equal(JSON.parse(arquivo).diario[k], undefined, "o backup não leva " + k));
  const v = N.validarBackup(arquivo); assert.equal(v.ok, true, v.erros.join("; "));
  const aparelho = nova(); aparelho.acesso = true; aparelho.acessoPor = "conta"; aparelho.direitos = { base: "vitalicio" }; aparelho.contaEmail = "outra@exemplo.com";
  const R = N.restaurar(aparelho, v.estado);
  assert.equal(R.trajeto.campos.desejo, "abrir minha confeitaria");
  assert.equal(R.ciclosFeitos.length, 1);
  assert.deepEqual(plano(R.direitos), { base: "vitalicio" });
  assert.equal(R.contaEmail, "outra@exemplo.com");
  assert.equal(R.acesso, true);
});

test("backups de versões antigas (arquivo com o estado solto) continuam restauráveis", () => {
  [ANTIGO_30_NOITES(), ANTIGO_27814A7()].forEach(antigo => {
    const v = N.validarBackup(JSON.stringify(antigo)); assert.equal(v.ok, true, v.erros.join("; "));
    const R = N.restaurar(nova(), v.estado);
    assert.equal(R.perfil.nome, "Maria Aparecida da Silva");
    assert.equal(R.acesso, false, "direitos gravados em backup antigo não liberam acesso neste aparelho");
    assert.deepEqual(plano(R.direitos), {});
  });
  assert.equal(N.jornadaAntiga(N.restaurar(nova(), N.validarBackup(JSON.stringify(ANTIGO_30_NOITES())).estado)).noites.length, 3);
});

/* ---------- progresso ---------- */
test("abrir o app, virar a carta, praticar e fechar a noite são eventos separados", () => {
  const S = nova(), d = "2026-11-10";
  S.dias[d] = { aberto: true };
  assert.deepEqual(plano(N.eventos(S, d)), { abriu: true, carta: false, pratica: false, noite: false, checkin: false });
  S.dias[d].carta = true; assert.equal(N.eventos(S, d).pratica, false, "virar a carta não conta como prática");
  S.dias[d].noite = true; assert.equal(N.diasComPratica(S, ET(1)), 0, "fechar a noite não conta como prática");
  praticar(S, d, "declaracao");
  assert.deepEqual(plano(N.eventos(S, d)), { abriu: true, carta: true, pratica: true, noite: true, checkin: false });
});

test("a primeira prática acende um ponto; a estrela inteira só com três dias e o marco", () => {
  const S = nova();
  assert.equal(N.marco(S, ET(1), "2026-11-10").ok, false);
  S.trajeto.ritual = { intencao: "x", qualidade: "coragem", gesto: "fotografar o bolo", data: "2026-11-10" }; praticar(S, "2026-11-10", "ritual1");
  assert.equal(N.diasComPratica(S, ET(1)), 1);
  assert.equal(N.marco(S, ET(1), "2026-11-10").ok, true);
  assert.equal(N.pronta(S, ET(1), "2026-11-10", 3), false, "um dia não acende a estrela");
  praticar(S, "2026-11-10", "silencio"); assert.equal(N.diasComPratica(S, ET(1)), 1, "duas práticas no mesmo dia contam um dia");
  praticar(S, "2026-11-11", "declaracao"); praticar(S, "2026-11-12", "silencio");
  assert.equal(N.pronta(S, ET(1), "2026-11-12", 3), true);
});

test("práticas de antes do começo da estrela e de outra estrela não contam para ela", () => {
  const S = nova(); praticar(S, "2026-11-10", "declaracao"); praticar(S, "2026-11-11", "declaracao"); praticar(S, "2026-11-12", "declaracao");
  S.trajeto.etapa = 2; S.trajeto.inicioEtapa = "2026-11-13";
  assert.equal(N.diasComPratica(S, ET(2)), 0);
  praticar(S, "2026-11-13", "declaracao"); assert.equal(N.diasComPratica(S, ET(2)), 0, "técnica da estrela 1 não conta na estrela 2");
  praticar(S, "2026-11-13", ET(2).tecnicas[0]); assert.equal(N.diasComPratica(S, ET(2)), 1);
});

test("estrela 3: o marco pede três dias percebendo a própria energia", () => {
  const S = nova(); S.trajeto.etapa = 3; S.trajeto.inicioEtapa = "2026-11-10"; const t = ET(3).tecnicas[0];
  S.dias["2026-11-09"] = { nivel: 5 };
  assert.equal(N.marco(S, ET(3), "2026-11-10").feito, 0, "check-in de antes da estrela não conta");
  praticar(S, "2026-11-10", t, { sente: "mais leve" }); S.dias["2026-11-10"] = { nivel: 7 };
  assert.equal(N.marco(S, ET(3), "2026-11-10").feito, 1, "nota e check-in no mesmo dia contam um dia");
  S.dias["2026-11-11"] = { nivel: 6 }; praticar(S, "2026-11-12", t, { sente: "calma" });
  assert.deepEqual(plano(N.marco(S, ET(3), "2026-11-12")), { feito: 3, meta: 3, ok: true });
});

test("estrela 5: a sequência conta só dentro da estrela, e um dia de intervalo não zera", () => {
  const S = nova("2026-11-01"); const t = ET(5).tecnicas[0];
  ["2026-11-01", "2026-11-02", "2026-11-03", "2026-11-04"].forEach(d => praticar(S, d, "declaracao"));
  S.trajeto.etapa = 5; S.trajeto.inicioEtapa = "2026-11-05";
  assert.equal(N.sequenciaNaEtapa(S, "2026-11-05"), 0, "dias de antes da estrela 5 ficam de fora");
  ["2026-11-05", "2026-11-06", "2026-11-08", "2026-11-09"].forEach(d => praticar(S, d, t));     // faltou o dia 7
  assert.equal(N.sequenciaNaEtapa(S, "2026-11-09"), 4, "um dia de intervalo não zera a contagem");
  assert.equal(N.marco(S, ET(5), "2026-11-09").ok, false);
  praticar(S, "2026-11-10", t);
  assert.deepEqual(plano(N.marco(S, ET(5), "2026-11-10")), { feito: 5, meta: 5, ok: true });
  assert.match(ET(5).marco.texto, /intervalo não zera/, "o texto mostrado diz a regra do intervalo");
  const S2 = nova("2026-11-01"); S2.trajeto.etapa = 5; ["2026-11-01", "2026-11-02", "2026-11-05", "2026-11-06"].forEach(d => praticar(S2, d, t));    // dois dias sem prática
  assert.equal(N.sequenciaNaEtapa(S2, "2026-11-06"), 2, "dois dias seguidos sem prática recomeçam a contagem");
});

test("marcos antigos continuam valendo para quem já tinha cumprido", () => {
  const S = N.migrar(ANTIGO_27814A7());
  assert.equal(N.marco(S, ET(1), "2026-10-24").ok, true, "desejo, prazo e troca da versão anterior valem como o primeiro ritual");
  S.trajeto.campos.crenca2 = "não sei cobrar"; S.trajeto.campos.crenca3 = "não tenho tempo";
  assert.equal(N.marco(S, ET(2), "2026-10-24").ok, true);
  S.trajeto.campos.entrega = "agradeço e sigo"; assert.equal(N.marco(S, ET(7), "2026-10-24").ok, true);
});

/* ---------- ciclos ---------- */
test("um novo ciclo guarda o anterior inteiro e usa só as próprias práticas", () => {
  const S = nova(); S.trajeto.campos.desejo = "receber minha primeira encomenda de bolo"; S.trajeto.campos.qualidade = "coragem";
  S.trajeto.ritual = { intencao: "x", qualidade: "coragem", gesto: "fotografar o bolo", data: "2026-11-10" };
  S.trajeto.retornos.push({ data: "2026-11-11", sobre: "2026-11-10", resposta: "fiz" });
  praticar(S, "2026-11-10", "ritual1"); praticar(S, "2026-11-11", "declaracao", { sente: "animada" }); praticar(S, "2026-11-12", "silencio");
  S.cartas.push({ id: "2026-11-12", c: 1, paragrafos: ["carta do ciclo 1"] }); S.trajeto.etapa = 8;
  N.arquivarCiclo(S, "2026-11-12", 5000, true);
  const a = S.ciclosFeitos[0];
  assert.equal(a.ciclo, 1); assert.equal(a.concluido, true); assert.equal(a.inicio, "2026-11-10"); assert.equal(a.fim, "2026-11-12");
  assert.equal(a.campos.qualidade, "coragem"); assert.equal(a.ritual.gesto, "fotografar o bolo"); assert.equal(a.retornos[0].resposta, "fiz");
  assert.equal(a.praticas.length, 3); assert.equal(a.praticas[1].sente, "animada"); assert.equal(a.cartas.length, 1);
  assert.equal(S.trajeto.ciclo, 2); assert.equal(S.trajeto.etapa, 1); assert.equal(S.trajeto.campos.desejo, "receber minha primeira encomenda de bolo");
  assert.equal(S.trajeto.ritual, undefined, "o ritual é refeito no ciclo novo");
  assert.equal(N.diasComPratica(S, ET(1)), 0, "a prática do mesmo dia, do ciclo anterior, não conta no novo");
  assert.equal(N.feitaHoje(S, "silencio", "2026-11-12"), false);
  praticar(S, "2026-11-12", "silencio");
  assert.equal(N.diasComPratica(S, ET(1)), 1);
  assert.equal(S.praticas["2026-11-12"].length, 2, "as duas práticas do dia ficam guardadas, cada uma no seu ciclo");
  N.arquivarCiclo(S, "2026-11-13", 6000, false);
  assert.equal(S.ciclosFeitos.length, 2); assert.equal(S.ciclosFeitos[1].praticas.length, 1); assert.equal(S.trajeto.campos.desejo, undefined);
});

/* ---------- acesso pago ---------- */
test("qualquer direito de plano em dia dá entrada, mesmo sem a linha base", () => {
  const agora = Date.parse("2026-11-22T12:00:00Z"), em = "2026-12-20T00:00:00Z", vencido = "2026-11-01T00:00:00Z";
  assert.equal(N.acessoPorDireitos({ guia: em }, agora).entra, true, "Completo sem base entra");
  assert.equal(N.acessoPorDireitos({ clube: em }, agora).entra, true);
  assert.equal(N.acessoPorDireitos({ base: "vitalicio" }, agora).entra, true);
  assert.equal(N.acessoPorDireitos({ guia: vencido, base: vencido }, agora).entra, false, "plano vencido não entra");
  assert.equal(N.acessoPorDireitos({ ano: em, nome: "vitalicio" }, agora).entra, false, "compra avulsa sozinha não é plano");
  assert.equal(N.acessoPorDireitos({}, agora).entra, false);
});

test("o plano Completo libera o que promete: base, Clube e os quatro módulos", () => {
  const agora = Date.parse("2026-11-22T12:00:00Z"), em = "2026-12-20T00:00:00Z";
  const completo = { amor: em, base: em, clube: em, guia: em, lua: em, profundo: em };       // o que a tabela produtos do servidor concede
  ["base", "clube", "guia", "profundo", "lua", "amor"].forEach(k => assert.equal(N.temDireito(completo, k, agora), true, k));
  assert.equal(N.temDireito(completo, "ano", agora), false, "avulso não vem no plano");
  assert.equal(N.temDireito({ guia: em }, "base", agora), true); assert.equal(N.temDireito({ guia: em }, "clube", agora), true);
  assert.equal(N.temDireito({ clube: em }, "guia", agora), false, "Plus não abre as estrelas 4 a 7");
  assert.equal(N.temDireito({ base: em }, "clube", agora), false, "Essencial não abre o Clube");
  assert.equal(N.planoDe(["base", "clube", "guia"]), "Completo"); assert.equal(N.planoDe(["base", "clube"]), "Plus"); assert.equal(N.planoDe(["base"]), "Essencial");
});

test("código recusado é diferente de falha de consulta", () => {
  [400, 401, 403, 422].forEach(s => assert.equal(N.erroDeCodigo(s), true));
  [undefined, 0, 429, 500, 502, 503].forEach(s => assert.equal(N.erroDeCodigo(s), false, String(s)));
});

/* ---------- retorno e carta ---------- */
test("no dia seguinte a Estela pergunta pelo gesto combinado, uma vez só", () => {
  const S = nova(); S.trajeto.gesto = { texto: "fotografar o bolo", quando: "depois do café", qualidade: "coragem", data: "2026-11-10" }; S.presencas["2026-11-10"] = true;
  assert.equal(N.retorno(S, "2026-11-10"), null, "no mesmo dia não pergunta");
  const r = N.retorno(S, "2026-11-11"); assert.equal(r.tipo, "gesto"); assert.equal(r.dias, 1); assert.equal(r.gesto.qualidade, "coragem");
  S.trajeto.retornos.push({ data: "2026-11-11", sobre: "2026-11-10", resposta: "adaptei" });
  assert.equal(N.retorno(S, "2026-11-11"), null);
});

test("depois de uma ausência há um ponto claro de recomeço", () => {
  const S = nova(); S.presencas["2026-11-10"] = true;
  assert.equal(N.retorno(S, "2026-11-12"), null, "um dia de falta não é ausência");
  const r = N.retorno(S, "2026-11-15"); assert.equal(r.tipo, "ausencia"); assert.equal(r.ausencia, 4);
  S.dias["2026-11-15"] = { retomou: true }; assert.equal(N.retorno(S, "2026-11-15"), null);
});

test("a amostra da carta semanal chega dentro dos 7 dias de degustação e usa só registros reais", () => {
  const S = nova("2026-11-10");
  assert.equal(N.cartaLiberaEm(S, "2026-11-13").amostra, false, "dia 4 ainda não");
  assert.equal(N.cartaLiberaEm(S, "2026-11-14").amostra, false, "dia 5 sem práticas ainda não");
  assert.equal(N.cartaLiberaEm(S, "2026-11-15").amostra, true, "dia 6 libera de qualquer jeito");
  assert.ok(N.cartaLiberaEm(S, "2026-11-15").dia <= 7);
  S.trajeto.campos.desejo = "receber minha primeira encomenda de bolo"; S.trajeto.gesto = { texto: "fotografar o bolo", qualidade: "coragem", data: "2026-11-10" };
  praticar(S, "2026-11-10", "ritual1"); praticar(S, "2026-11-12", "silencio", { sente: "mais calma" });
  assert.equal(N.cartaLiberaEm(S, "2026-11-14").amostra, true, "dia 5 com duas práticas libera");
  S.sinais.push({ data: "2026-11-12", tipo: "sinal", texto: "uma vizinha perguntou dos bolos" }); S.dias["2026-11-12"] = { nivel: 9, noite: true }; S.dias["2026-11-14"] = { nivel: 6 };
  const k = N.cartaSemanal(S, "2026-11-14", { tecnica: id => GUIA.TECNICAS[id].nome, nivel: n => "nível " + n }), txt = k.paragrafos.join(" ");
  assert.equal(k.dados.diasPrat, 2); assert.equal(k.dados.sinais, 1); assert.equal(k.dados.checkins, 2); assert.equal(k.c, 1);
  ["receber minha primeira encomenda de bolo", "mais calma", "fotografar o bolo", "coragem", "uma vizinha perguntou dos bolos", "2 dias"].forEach(t => assert.ok(txt.includes(t), "a carta cita: " + t));
  const vazia = N.cartaSemanal(nova("2026-11-10"), "2026-11-16", { tecnica: x => x, nivel: x => x }).paragrafos.join(" ");
  assert.match(vazia, /não apaga nada/, "semana sem prática não vira cobrança");
  assert.doesNotMatch(vazia, /falh|culpa|fracass/i);
});
