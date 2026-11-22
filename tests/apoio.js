// Carrega os módulos do app (feitos para o navegador) em um contexto isolado, sem dependências.
const vm = require("node:vm"), fs = require("node:fs"), path = require("node:path");
const RAIZ = path.join(__dirname, "..");

function carregar(arquivos) {
  const window = {}, ctx = vm.createContext({ window, console, Date, JSON, Math });
  arquivos.forEach(f => vm.runInContext(fs.readFileSync(path.join(RAIZ, f), "utf8"), ctx, { filename: f }));
  return window;
}
// objetos criados dentro do contexto isolado têm outro protótipo: normaliza para comparar com deepEqual
const plano = v => JSON.parse(JSON.stringify(v));

// estado como o app gravava na versão das 30 noites (antes de existir a trajetória)
const ANTIGO_30_NOITES = () => ({
  perfil: { nome: "Maria Aparecida da Silva", nascimento: "1978-05-14" }, tour: false, acesso: true, acessoPor: "codigo",
  estrelas: { 1: { feita: true, data: "2026-08-01", diario: "Primeira noite: agradeci pelo que já tenho." }, 2: { feita: true, data: "2026-08-02", diario: "" }, 3: { feita: false, data: "", diario: "Rascunho da terceira noite." } },
  encerramento: { carta: "Carta para a Maria do futuro." }, passos: { 1: "Abrir a poupança." },
  dias: { "2026-08-01": { carta: true, desejo: "vender dois bolos", noite: true } }, presencas: { "2026-08-01": true },
  sinais: [{ data: "2026-08-01", tipo: "sinal", texto: "ganhei um desconto" }], criadoEm: "2026-08-01T12:00:00.000Z"
});
// estado como o app gravava na versão auditada (commit 27814a7): práticas sem ciclo, ciclo anterior só com desejo e datas
const ANTIGO_27814A7 = () => ({
  perfil: { nome: "Maria Aparecida da Silva", nascimento: "1978-05-14" }, tour: true, acesso: true, acessoPor: "conta", foco: "proposito",
  direitos: { guia: "2099-01-01T00:00:00Z" }, direitosEm: 1, contaEmail: "cliente@exemplo.com", portais: { nome: true },
  trajeto: { etapa: 2, inicio: "2026-10-20", inicioEtapa: "2026-10-24", ciclo: 2, campos: { desejo: "abrir minha confeitaria", prazo: "até março", troca: "duas horas por dia", crenca1: "dinheiro é difícil" } },
  praticas: { "2026-09-02": ["declaracao"], "2026-09-03": ["silencio", "autossugestao"], "2026-10-20": ["declaracao"], "2026-10-21": ["silencio"], "2026-10-24": ["tela"] },
  resgates: ["2026-10-22"], ciclosFeitos: [{ desejo: "pagar a dívida do cartão", inicio: "2026-09-01", fim: "2026-10-19" }],
  dias: { "2026-10-24": { carta: true, nivel: 9, noite: true } }, presencas: { "2026-10-24": true }, sinais: [], criadoEm: "2026-09-01T12:00:00.000Z"
});

module.exports = { carregar, plano, RAIZ, ANTIGO_30_NOITES, ANTIGO_27814A7 };
