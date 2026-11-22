/* Conta: login por e-mail (link ou código) e sincronização dos direitos comprados.
   Fala direto com o Supabase por fetch; a chave abaixo é pública (publishable) e as regras
   de acesso ficam no banco (RLS): cada pessoa só lê os próprios direitos. */
window.CONTA = (function () {
  "use strict";
  const BASE = "https://yuvkzqhjwnomuxsnoodr.supabase.co";
  const CHAVE = "sb_publishable__8OJ_FhRV_SIjrv19XlaZg_eQ2OfA6y";
  const ARMAZEM = "cda_sessao_v1";
  const VALIDADE_OFFLINE = 10 * 86400000;      // sem sincronizar por 10 dias, os direitos da conta deixam de valer
  let sessao = null;

  function ler() {
    try { sessao = JSON.parse(localStorage.getItem(ARMAZEM) || "null"); }
    catch (e) { console.warn("[conta] sessão ilegível:", e); sessao = null; }
    return sessao;
  }
  function gravar(s) {
    sessao = s;
    try { if (s) localStorage.setItem(ARMAZEM, JSON.stringify(s)); else localStorage.removeItem(ARMAZEM); }
    catch (e) { console.warn("[conta] não consegui gravar a sessão:", e); }
  }
  async function req(caminho, opts = {}) {
    const r = await fetch(BASE + caminho, Object.assign({}, opts, { headers: Object.assign({ apikey: CHAVE, "Content-Type": "application/json" }, opts.headers || {}) }));
    const t = await r.text(); let j = null;
    try { j = t ? JSON.parse(t) : null; } catch (e) { j = null; }
    if (!r.ok) { const err = new Error((j && (j.msg || j.message || j.error_description || j.error)) || "erro " + r.status); err.status = r.status; throw err; }
    return j;
  }
  function emailDoToken(tok) {
    try { const p = tok.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"); return JSON.parse(atob(p + "===".slice((p.length + 3) % 4))).email || ""; }
    catch (e) { console.warn("[conta] token sem e-mail legível:", e); return ""; }
  }
  function guardar(j) {
    gravar({ access_token: j.access_token, refresh_token: j.refresh_token, expira: Date.now() + (Number(j.expires_in) || 3600) * 1000, email: (j.user && j.user.email) || emailDoToken(j.access_token) });
  }

  // 1) pede o e-mail de acesso (link + código)
  function pedirAcesso(email) {
    const volta = location.origin + location.pathname;
    return req("/auth/v1/otp?redirect_to=" + encodeURIComponent(volta), { method: "POST", body: JSON.stringify({ email: email.trim().toLowerCase(), create_user: true }) });
  }
  // 2a) confirma pelo código de 6 dígitos
  async function verificarCodigo(email, codigo) {
    guardar(await req("/auth/v1/verify", { method: "POST", body: JSON.stringify({ type: "email", email: email.trim().toLowerCase(), token: codigo.trim() }) }));
  }
  // 2b) confirma pelo link: o Supabase devolve os tokens no # do endereço
  function lerRetornoDoLink() {
    if (!location.hash || location.hash.length < 10) return null;
    const p = new URLSearchParams(location.hash.slice(1));
    const limpar = () => { try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { console.warn("[conta] não limpei o endereço:", e); } };
    if (p.get("error_description")) { limpar(); return { erro: p.get("error_description").replace(/\+/g, " ") }; }
    if (!p.get("access_token") || !p.get("refresh_token")) return null;
    guardar({ access_token: p.get("access_token"), refresh_token: p.get("refresh_token"), expires_in: p.get("expires_in") });
    limpar();
    return { ok: true };
  }
  async function token() {
    if (!sessao) return null;
    if (Date.now() < sessao.expira - 60000) return sessao.access_token;
    try { guardar(await req("/auth/v1/token?grant_type=refresh_token", { method: "POST", body: JSON.stringify({ refresh_token: sessao.refresh_token }) })); return sessao.access_token; }
    catch (e) { if (e.status === 400 || e.status === 401 || e.status === 403) { console.warn("[conta] sessão expirou:", e.message); gravar(null); return null; } throw e; }
  }
  const valido = v => v === "vitalicio" || new Date(v).getTime() > Date.now();

  // busca os direitos no servidor e guarda no estado do app
  async function sincronizar() {
    const C = window.CDA, tok = await token();
    if (!tok) { if (C.S.contaEmail) { C.S.direitos = {}; C.S.contaEmail = ""; if (C.S.acessoPor === "conta") C.S.acesso = false; C.salvar(); } return false; }
    const linhas = await req("/rest/v1/direitos?select=portal,valido_ate,ativo", { headers: { Authorization: "Bearer " + tok } });
    const d = {}; (linhas || []).forEach(l => { if (l.ativo) d[l.portal] = l.valido_ate || "vitalicio"; });
    const S = C.S; S.direitos = d; S.direitosEm = Date.now(); S.contaEmail = sessao.email || "";
    if (d.base && valido(d.base)) { if (!S.acesso) S.acessoPor = "conta"; S.acesso = true; }
    else if (S.acessoPor === "conta") S.acesso = false;          // compra base reembolsada ou vencida
    C.salvar();
    return true;
  }
  function direito(id) {
    const C = window.CDA; if (!C || !C.S) return false;
    const S = C.S, v = (S.direitos || {})[id];
    if (!v || Date.now() - (S.direitosEm || 0) > VALIDADE_OFFLINE) return false;
    return valido(v);
  }
  function sair() {
    const C = window.CDA; gravar(null);
    C.S.direitos = {}; C.S.direitosEm = 0; C.S.contaEmail = ""; if (C.S.acessoPor === "conta") C.S.acesso = false; C.salvar();
  }
  const logada = () => !!sessao;
  const email = () => (sessao && sessao.email) || "";

  return { ler, pedirAcesso, verificarCodigo, lerRetornoDoLink, sincronizar, direito, sair, logada, email, valido };
})();
