const { test } = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path");
const { carregar, RAIZ } = require("./apoio.js");
const W = carregar(["dados/diario.js", "dados/combos.js"]), D = W.DIARIO;

test("cada foco do perfil leva à sua área da orientação", () => {
  assert.deepEqual(Object.keys(W.COMBOS.FOCO).sort(), ["amor", "dinheiro", "paz", "proposito"]);
  assert.equal(D.areaDoFoco("dinheiro"), "dinheiro"); assert.equal(D.areaDoFoco("amor"), "amor");
  assert.equal(D.areaDoFoco("paz"), "energia"); assert.equal(D.areaDoFoco("proposito"), "proposito");
  assert.equal(D.areaDoFoco(""), "dinheiro"); assert.equal(D.areaDoFoco(undefined), "dinheiro");
});

test("Propósito tem orientação própria em todo dia pessoal, fase da Lua e variação", () => {
  const vistos = new Set();
  for (let dp = 1; dp <= 9; dp++) for (let fase = 0; fase < 8; fase++) for (const dia of [3, 12, 21]) {
    const o = D.orientacao({ diaPessoal: dp, destino: 7, faseIdx: fase, data: new Date(2026, 0, dia, 12) });
    ["dinheiro", "amor", "energia", "proposito"].forEach(k => { assert.equal(typeof o[k], "string"); assert.ok(o[k].length > 20 && !/undefined/.test(o[k]), `${k} dp${dp} fase${fase}`); });
    assert.notEqual(o.proposito, o.dinheiro); vistos.add(o.proposito);
  }
  assert.equal(vistos.size, 9 * 8 * 3, "as três variações são diferentes entre si");
  D.AREAS.forEach(a => assert.ok(["dinheiro", "amor", "energia", "proposito"].includes(a[0])));
});

test("Hoje e a prévia de amanhã usam a área do foco, não um texto fixo de dinheiro", () => {
  const app = fs.readFileSync(path.join(RAIZ, "app.js"), "utf8");
  assert.doesNotMatch(app, /oa\.dinheiro/, "a prévia de amanhã não pode ser sempre de dinheiro");
  assert.doesNotMatch(app, /\|\| "dinheiro";\s*\n?\s*return ar\.sort/, "o mapeamento antigo de foco foi removido");
  assert.ok((app.match(/oa\[DIARIO\.areaDoFoco\(S\.foco\)\]/g) || []).length >= 2);
  assert.match(app, /O\[pri\]/);
});
