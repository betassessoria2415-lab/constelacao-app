// Função "conteudo" (Supabase Edge Function, Deno). FONTE PARA REVISÃO: NÃO ESTÁ PUBLICADA.
// Entrega o conteúdo pago de um portal só para quem tem o direito em dia.
// Plano completo e ordem de publicação: servidor/README.md, seção 6.
//
// Pedido:   GET /functions/v1/conteudo?portal=guia     Authorization: Bearer <token da pessoa>
// Resposta: 200 { portal, versao, valido_ate, corpo }  |  400 portal inválido  |  401 sem login
//           403 sem direito  |  404 conteúdo não carregado  |  502 falha ao consultar
//
// Variáveis de ambiente (já existem em toda função do Supabase; nenhum segredo fica neste arquivo):
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

const URL_BASE = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICO = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const PORTAIS = ["guia", "profundo", "lua", "amor", "clube", "ano", "nome"];
const ORIGENS = ["https://constelacao-app.vercel.app"];        // acrescentar o domínio próprio quando existir

// A MESMA regra de nucleo.js (temDireito). O servidor não confia no app: ao mudar lá, mudar aqui.
type Direitos = Record<string, string>;
const emDia = (v: string | undefined, agora: number) => !!v && (v === "vitalicio" || new Date(v).getTime() > agora);
function temDireito(d: Direitos, id: string, agora: number): boolean {
  if (emDia(d[id], agora)) return true;
  if (id === "base" || id === "clube") return ["guia", "profundo", "lua", "amor"].some((k) => emDia(d[k], agora));
  return false;
}

function cabecalhos(origem: string | null): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "private, no-store", "Vary": "Origin" };
  if (origem && (ORIGENS.includes(origem) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origem))) {
    h["Access-Control-Allow-Origin"] = origem;
    h["Access-Control-Allow-Headers"] = "authorization, apikey, content-type";
    h["Access-Control-Allow-Methods"] = "GET, OPTIONS";
  }
  return h;
}

Deno.serve(async (req) => {
  const h = cabecalhos(req.headers.get("origin"));
  const sair = (status: number, corpo: unknown) => new Response(JSON.stringify(corpo), { status, headers: h });
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
  if (req.method !== "GET") return sair(405, { erro: "método não aceito" });

  const portal = new URL(req.url).searchParams.get("portal") || "";
  if (!PORTAIS.includes(portal)) return sair(400, { erro: "portal inválido" });
  const autorizacao = req.headers.get("authorization") || "";
  if (!/^Bearer .+/.test(autorizacao)) return sair(401, { erro: "entre com o e-mail da compra" });

  try {
    // 1) direitos da própria pessoa, lidos com o token dela (a RLS da tabela decide o que ela enxerga)
    const r = await fetch(`${URL_BASE}/rest/v1/direitos?select=portal,valido_ate,ativo`, { headers: { apikey: ANON, Authorization: autorizacao } });
    if (r.status === 401 || r.status === 403) return sair(401, { erro: "sessão expirada, entre de novo" });
    if (!r.ok) throw new Error("direitos " + r.status);
    const d: Direitos = {};
    for (const l of await r.json()) if (l.ativo) d[l.portal] = l.valido_ate || "vitalicio";
    const agora = Date.now();
    if (!temDireito(d, portal, agora)) return sair(403, { erro: "sem acesso a este conteúdo" });

    // 2) conteúdo, lido com a chave de serviço (a tabela não tem leitura para o público)
    const c = await fetch(`${URL_BASE}/rest/v1/conteudos?portal=eq.${portal}&select=versao,corpo`, { headers: { apikey: SERVICO, Authorization: "Bearer " + SERVICO } });
    if (!c.ok) throw new Error("conteudos " + c.status);
    const linhas = await c.json();
    if (!linhas.length) return sair(404, { erro: "conteúdo ainda não carregado" });
    // validade que o app usa para o cache do aparelho: a do direito que abriu a porta
    const valido = d[portal] || ["guia", "profundo", "lua", "amor"].map((k) => d[k]).find((v) => emDia(v, agora)) || "";
    return sair(200, { portal, versao: linhas[0].versao, valido_ate: valido, corpo: linhas[0].corpo });
  } catch (e) {
    console.error(new Date().toISOString(), "[conteudo]", portal, (e as Error).message);
    return sair(502, { erro: "não consegui consultar agora, tente de novo" });
  }
});
