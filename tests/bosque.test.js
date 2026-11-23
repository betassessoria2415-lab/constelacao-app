const { test } = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path");
const { carregar, plano, RAIZ } = require("./apoio.js");
const W = carregar(["nucleo.js", "dados/bosque.js"]), D = W.BOSQUE_DADOS, N = W.NUCLEO;
const novo = () => N.migrar({ perfil: { nome: "Maria", nascimento: "1978-05-14" }, foco: "dinheiro" });

test("a Flor do Dia é a mesma o dia inteiro e muda pelo calendário", () => {
  for (const foco of D.FOCOS) {
    const hoje = D.florDoDia(foco, "2026-11-22");
    assert.deepEqual(plano(D.florDoDia(foco, "2026-11-22")), plano(hoje), "recarregar não troca a prática");
    assert.notEqual(D.florDoDia(foco, "2026-11-23").id, hoje.id, "no dia seguinte a prática é outra");
    const semana = new Set(); for (let d = 1; d <= 7; d++) semana.add(D.florDoDia(foco, "2026-12-0" + d).id);
    assert.equal(semana.size, 7, "sete dias seguidos, sete práticas diferentes");
  }
  assert.equal(D.florDoDia("dinheiro", "2026-12-31").id !== D.florDoDia("dinheiro", "2027-01-01").id, true, "a virada do ano também troca");
  assert.equal(D.florDoDia("", "2026-11-22").id, D.florDoDia("dinheiro", "2026-11-22").id, "sem foco escolhido, vale prosperidade");
  assert.equal(D.florDoDia("coisa-estranha", "2026-11-22").id.split("-")[0], "dinheiro");
});

test("cada prática liga intenção, visualização e um gesto possível, para os quatro focos", () => {
  assert.deepEqual(plano(D.FOCOS).sort(), ["amor", "dinheiro", "paz", "proposito"]);
  for (const foco of D.FOCOS) {
    assert.equal(D.FLOR[foco].length, 7);
    D.FLOR[foco].forEach(p => {
      assert.ok(p.tema.length >= 3 && p.texto.length > 80 && p.gesto.length > 30, foco + " / " + p.tema);
      assert.match(p.texto, /veja|visualiz|imagin|sinta|lembre|olhe|repare|reviva|passe os olhos/i, "tem um convite a visualizar: " + p.tema);
      assert.match(p.gesto, /hoje|antes de dormir/i, "o gesto é para hoje: " + p.tema);
    });
  }
});

test("os textos do bosque não prometem resultado, cura nem ciência", () => {
  const tudo = [fs.readFileSync(path.join(RAIZ, "dados/bosque.js"), "utf8"), fs.readFileSync(path.join(RAIZ, "telas-bosque.js"), "utf8")].join("\n").replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
  [/qu[âa]ntic/i, /comprovad/i, /cientificamente/i, /garantid[oa]/i, /vai (ficar ric|enriquecer|atrair dinheiro)/i, /em \d+ dias você/i, /\bcura (a|o|sua|seu)\b/i, /milagre/i].forEach(r => assert.doesNotMatch(tudo, r));
  assert.match(tudo, /Não garante resultado/); assert.match(tudo, /nem promete cura/);
  const total = D.PEDRA.reduce((a, p) => a + p.s, 0);
  assert.ok(total >= 30 && total <= 60, "a prática da pedra dura entre 30 e 60 segundos de instrução: " + total);
  assert.equal(D.PEDRA.filter(p => p.escolha).length, 1);
});

test("visitar a flor de novo no mesmo dia não cria outra visita", () => {
  const S = novo(); assert.deepEqual(plano(S.bosque), {}, "estado novo já nasce com o bosque");
  const a = D.guardarFlor(S, "2026-11-22", "dinheiro", "  coragem  "); assert.equal(a.nova, true); assert.equal(a.flor.palavra, "coragem");
  const b = D.guardarFlor(S, "2026-11-22", "dinheiro", "calma"); assert.equal(b.nova, false);
  assert.equal(S.bosque.flores.length, 1); assert.equal(S.bosque.flor.palavra, "calma");
  assert.equal(D.florHoje(S, "2026-11-22").palavra, "calma"); assert.equal(D.florHoje(S, "2026-11-23"), null, "amanhã a flor volta a ter prática nova");
  D.guardarFlor(S, "2026-11-23", "dinheiro", ""); assert.equal(S.bosque.flores.length, 2);
  assert.equal(D.guardarPedra(S, "2026-11-23", "calma").nova, true); assert.equal(D.guardarPedra(S, "2026-11-23", "coragem").nova, false);
  assert.equal(S.bosque.pedras, 1); assert.equal(D.pedraHoje(S, "2026-11-23").qualidade, "coragem");
});

test("a Estela só lembra o que foi registrado em um dia anterior", () => {
  const S = novo(); assert.equal(D.lembranca(S, "2026-11-22"), null);
  D.guardarFlor(S, "2026-11-22", "dinheiro", "coragem");
  assert.equal(D.lembranca(S, "2026-11-22"), null, "o que é de hoje não é lembrança");
  assert.deepEqual(plano(D.lembranca(S, "2026-11-23")), { tipo: "flor", data: "2026-11-22", palavra: "coragem", tema: S.bosque.flor.tema });
  const T = novo(); D.guardarFlor(T, "2026-11-22", "dinheiro", ""); assert.equal(D.lembranca(T, "2026-11-23"), null, "flor sem palavra não vira frase inventada");
  D.guardarPedra(T, "2026-11-22", "calma"); assert.deepEqual(plano(D.lembranca(T, "2026-11-24")), { tipo: "pedra", data: "2026-11-22", qualidade: "calma" });
});

test("o bosque acompanha migração e backup, sem perder nada", () => {
  const antigo = N.migrar({ perfil: { nome: "Maria", nascimento: "1978-05-14" }, v: 1 }); assert.deepEqual(plano(antigo.bosque), {});
  assert.deepEqual(plano(N.migrar({ perfil: { nome: "Maria", nascimento: "1978-05-14" }, bosque: "lixo" }).bosque), {}, "formato estranho vira bosque vazio, sem quebrar");
  const S = novo(); D.guardarFlor(S, "2026-11-22", "dinheiro", "coragem"); D.guardarPedra(S, "2026-11-22", "calma"); S.bosque.raiz = { data: "2026-11-22" };
  const volta = N.migrar(JSON.parse(JSON.stringify(S)));
  assert.deepEqual(plano(volta.bosque), plano(S.bosque));
});

test("o palco não depende de enfeite para funcionar", () => {
  const css = fs.readFileSync(path.join(RAIZ, "estilo.css"), "utf8"), tela = fs.readFileSync(path.join(RAIZ, "telas-bosque.js"), "utf8"), cena = fs.readFileSync(path.join(RAIZ, "bosque-cena.js"), "utf8");
  assert.match(css, /\.bq-gl, \.bq-fx \{[^}]*pointer-events: none/, "as telas de desenho não recebem toque");
  assert.match(css, /\.bq-img \{[^}]*pointer-events: none/);
  assert.match(css, /\.bq-p \{[^}]*width: 48px; height: 48px/, "pontos tocáveis com pelo menos 44 px");
  assert.match(css, /\.bq-bt \{[^}]*min-height: 44px/); assert.match(css, /\.bq-x \{[^}]*width: 44px; height: 44px/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(tela + cena, /\binert\b|localStorage/, "sem inert e sem gravação paralela: tudo passa pelo CDA.salvar()");
  assert.doesNotMatch(tela + cena, /catch \([a-z]*\) \{\s*\}/, "nenhum catch vazio");
  assert.match(tela, /sem-cena/, "há um caminho sem a cena gráfica");
});
