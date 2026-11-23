/* Bosque Encantado: a cena e a câmera.
   Uma pintura só, com a profundidade calculada por uma função (perto/longe em torno do ponto de fuga).
   O WebGL desloca cada ponto conforme essa profundidade: ao arrastar, o que está perto anda mais que o fundo;
   ao aproximar, o primeiro plano cresce mais. A MESMA conta, em JavaScript, diz onde cada ponto tocável está
   na tela, então os botões acompanham os objetos durante o movimento.
   Sem WebGL (ou se ele falhar), a pintura vira uma imagem comum com a mesma câmera, sem o efeito de profundidade.
   Nada aqui conhece práticas ou progresso: isso fica em telas-bosque.js. */
window.BOSQUE_CENA = (function () {
  "use strict";
  const IW = 941, IH = 1672, VP = [0.51, 0.53], CENTRO = [0.5, 0.64];
  const ZMIN = 1.06, ZMAX = 2.3, PK = 0.11, DK = 0.2;
  const suave = r => r * r * (3 - 2 * r);
  // 0 = longe (a clareira da estrela), 1 = perto (troncos, samambaias e chão do primeiro plano)
  function perto(x, y) { const dx = (x - VP[0]) * 1.9, dy = (y - VP[1]) * (y > VP[1] ? 2.0 : 0.8); return suave(Math.min(1, Math.hypot(dx, dy))); }

  // a trilha dourada, do primeiro plano até a estrela (% da pintura); o terceiro número marca a estrela daquele ponto
  const TRILHA = [[66, 93], [60, 84, 1], [50, 80.5], [42, 77.5], [41, 74.5, 2], [47, 72.2], [58, 71, 3], [70, 70], [79.5, 67.5, 4], [74, 65], [62, 63.6, 5], [51, 61.5], [45.5, 59.8, 6], [49, 57.5], [51.5, 55.5], [51, 51.3, 7]]
    .map(p => ({ x: p[0] / 100, y: p[1] / 100, e: p[2] || 0, u: 0 }));
  (function medir() {   // u = posição em "estrelas": 0 no começo, 1 na primeira estrela, 7 na última
    let ini = 0;
    for (let i = 1; i < TRILHA.length; i++) if (TRILHA[i].e) {
      let total = 0; const acc = [0];
      for (let j = ini + 1; j <= i; j++) { total += Math.hypot(TRILHA[j].x - TRILHA[j - 1].x, (TRILHA[j].y - TRILHA[j - 1].y) * IH / IW); acc.push(total); }
      for (let j = ini + 1; j <= i; j++) TRILHA[j].u = TRILHA[i].e - 1 + acc[j - ini] / total;
      ini = i;
    }
  })();
  const ESTRELAS = TRILHA.filter(p => p.e).map(p => [p.x, p.y]);
  const LUGARES = { flor: [0.25, 0.662], raiz: [0.73, 0.575], pedra: [0.75, 0.742] };
  const FLORES = [[0.245, 0.643], [0.195, 0.675], [0.285, 0.685]];
  const RAIZ = [[0.69, 0.605], [0.71, 0.57], [0.76, 0.555], [0.81, 0.53], [0.84, 0.48]];
  function pontoEm(u) {
    if (u <= 0) return TRILHA[0];
    for (let i = 1; i < TRILHA.length; i++) if (TRILHA[i].u >= u) { const a = TRILHA[i - 1], b = TRILHA[i], k = (u - a.u) / ((b.u - a.u) || 1); return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }; }
    return TRILHA[TRILHA.length - 1];
  }
  const escalaEm = y => 0.42 + 0.9 * Math.max(0, Math.min(1, (y - 0.5) / 0.42));   // o que está longe é menor

  const VERT = "attribute vec2 p; varying vec2 vS; void main(){ vS = vec2(p.x*.5+.5, .5-p.y*.5); gl_Position = vec4(p,0.,1.); }";
  const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uT; uniform vec2 uC, uF, uSC, uP; uniform float uZ, uD, uTempo;
varying vec2 vS;
const vec2 VP = vec2(${VP[0]}, ${VP[1]});
float perto(vec2 b){ vec2 d = b - VP; d.x *= 1.9; d.y *= d.y > 0. ? 2.0 : 0.8; float r = min(1., length(d)); return r*r*(3.-2.*r); }
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float ru(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1.,0.)),f.x), mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x), f.y); }
void main(){
  vec2 b = uC + (vS - uSC)*uF/uZ;
  float n = perto(b);
  vec2 q = clamp(b + uP*n - uD*(b - VP)*n, 0., 1.);
  vec3 c = texture2D(uT, q).rgb;
  float t = uTempo;
  // névoa lenta entre as árvores do fundo e do plano médio
  float faixa = (1. - smoothstep(.10,.62,n)) * smoothstep(.26,.46,q.y) * (1. - smoothstep(.58,.72,q.y));
  float nv = ru(vec2(q.x*3.2 + t*.020, q.y*7. - t*.007))*.62 + ru(vec2(q.x*7. + 4. - t*.034, q.y*13.))*.38;
  c = mix(c, vec3(.64,.72,.95), faixa*nv*.24);
  // o ouro da trilha respira em ondas que sobem em direção à estrela
  float ouro = smoothstep(.10,.38, c.r - c.b) * smoothstep(.42,.85, c.r);
  float onda = .5 + .5*sin(q.y*34. + t*1.15);
  c += vec3(1.,.72,.28) * ouro * (.06 + .17*onda) * smoothstep(.50,.60,q.y);
  // a estrela-guia pulsa devagar (ciclo de 9 segundos)
  float pe = .5 + .5*sin(t*.698);
  float de = distance(q*vec2(1.,1.777), vec2(.513,.513*1.777));
  c += vec3(1.,.90,.66) * (exp(-de*de*900.)*.34 + exp(-de*24.)*.10) * (.35 + .65*pe);
  // fora da pintura (abaixo do chão) e nas bordas, a noite fecha
  c = mix(c, vec3(.035,.04,.09), smoothstep(.93,1.0,b.y));
  vec2 v = vS - .5; c *= 1. - dot(v,v)*.5;
  gl_FragColor = vec4(c,1.);
}`;

  function criar(palco, op) {
    op = op || {};
    const reduz = !!op.reduzido, cenaEl = palco.querySelector(".bq-cena"), glC = palco.querySelector(".bq-gl"), fxC = palco.querySelector(".bq-fx"), img = palco.querySelector(".bq-img");
    const fx = fxC.getContext("2d");
    let W = 1, H = 1, dpr = 1, inset = 0, topo = 0, vivo = true, pausado = false, visivel = true, plano = true, gl = null, U = {}, texOk = false;
    const cam = { x: CENTRO[0], y: CENTRO[1], z: ZMIN };
    let anim = null, animLuz = null, luz = Number(op.luz) || 0, sujo = true, raf = 0, ultimo = 0, balanco = [0, 0], travada = false;
    const t0 = performance.now(), efeitos = [], solta = [];
    const aviso = (oque, err) => console.warn(new Date().toISOString(), "[bosque] " + oque, err && err.message ? err.message : err || "");

    /* ----- geometria: da pintura para a tela ----- */
    function geo() { const k = Math.max(W / IW, H / IH); return { k, fx: W / (IW * k), fy: H / (IH * k), scx: 0.5, scy: (topo + (H - inset - topo) / 2) / H, fim: (H - inset) / H }; }   // o centro da cena é o centro da área livre, entre os botões de cima e o painel
    function limitar(c) {
      const g = geo(), z = c.z = Math.max(ZMIN, Math.min(ZMAX, c.z));
      const ax = g.scx * g.fx / z, bx = 1 - (1 - g.scx) * g.fx / z, ay = g.scy * g.fy / z, by = 1 - (g.fim - g.scy) * g.fy / z;   // embaixo, a pintura pode subir até a borda do painel
      c.x = ax > bx ? 0.5 : Math.max(ax, Math.min(bx, c.x)); c.y = ay > by ? (ay + by) / 2 : Math.max(ay, Math.min(by, c.y)); return c;
    }
    function par() { const g = geo(); return plano ? { g, px: 0, py: 0, d: 0 } : { g, px: PK * (cam.x - CENTRO[0]) + balanco[0], py: PK * (cam.y - CENTRO[1]) + balanco[1], d: DK * (1 - ZMIN / cam.z) }; }
    // ponto da pintura (0 a 1) -> pixels do palco, passando pelo mesmo deslocamento de profundidade do shader
    function projetar(x, y, nFixo) {
      const p = par(); let bx = x, by = y;
      for (let i = 0; i < 5; i++) { const n = nFixo == null ? perto(bx, by) : nFixo, nx = x - p.px * n + p.d * (bx - VP[0]) * n, ny = y - p.py * n + p.d * (by - VP[1]) * n; bx = nx; by = ny; }
      return [(p.g.scx + (bx - cam.x) * cam.z / p.g.fx) * W, (p.g.scy + (by - cam.y) * cam.z / p.g.fy) * H];
    }

    /* ----- WebGL ----- */
    function iniciarGL() {
      try {
        gl = glC.getContext("webgl", { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: "low-power", preserveDrawingBuffer: false });
        if (!gl) return false;
        const sh = (tipo, src) => { const s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader"); return s; };
        const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr);
        if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr) || "link");
        gl.useProgram(pr);
        const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        ["uC", "uF", "uSC", "uP", "uZ", "uD", "uTempo", "uT"].forEach(n => { U[n] = gl.getUniformLocation(pr, n); });
        const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
        [[gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE], [gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR]].forEach(a => gl.texParameteri(gl.TEXTURE_2D, a[0], a[1]));
        gl.uniform1i(U.uT, 0);
        return true;
      } catch (err) { aviso("WebGL indisponível, sigo com a imagem simples:", err); gl = null; return false; }
    }
    function perdeu(ev) { ev.preventDefault(); aviso("o navegador tomou o contexto gráfico; sigo com a imagem simples"); plano = true; texOk = false; palco.classList.remove("gl"); sujo = true; agendar(); }
    function carregarTextura() {
      palco.classList.add("arte");
      if (gl) try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img); texOk = true; plano = false; palco.classList.add("gl"); }
      catch (err) { aviso("não consegui levar a pintura ao WebGL:", err); plano = true; }
      sujo = true; desenhar(tempo(performance.now())); agendar();
    }

    /* ----- desenho ----- */
    const brilho = document.createElement("canvas"); brilho.width = brilho.height = 64;
    (function () { const c = brilho.getContext("2d"), g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, "rgba(255,246,214,1)"); g.addColorStop(0.18, "rgba(255,214,130,.85)"); g.addColorStop(0.5, "rgba(255,170,70,.22)"); g.addColorStop(1, "rgba(255,150,40,0)"); c.fillStyle = g; c.fillRect(0, 0, 64, 64); })();
    const luzEm = (x, y, r, a) => { if (a <= 0.01 || r <= 0.5) return; fx.globalAlpha = Math.min(1, a); fx.drawImage(brilho, x - r, y - r, r * 2, r * 2); };
    const rnd = (function () { let s = 7; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
    const vaga = Array.from({ length: op.poucas ? 12 : 22 }, () => ({ x: 0.06 + 0.88 * rnd(), y: 0.36 + 0.6 * rnd(), n: 0.2 + 0.8 * rnd(), f: rnd() * 6.28, v: 0.35 + 0.65 * rnd() }));
    function desenharGL(t) {
      const p = par(), g = p.g;
      gl.viewport(0, 0, glC.width, glC.height);
      gl.uniform2f(U.uC, cam.x, cam.y); gl.uniform2f(U.uF, g.fx, g.fy); gl.uniform2f(U.uSC, g.scx, g.scy); gl.uniform2f(U.uP, p.px, p.py);
      gl.uniform1f(U.uZ, cam.z); gl.uniform1f(U.uD, p.d); gl.uniform1f(U.uTempo, t % 900);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function posicionarImg() {
      const g = geo(), w = IW * g.k * cam.z, hh = IH * g.k * cam.z;
      img.style.width = w + "px"; img.style.height = hh + "px"; img.style.transform = `translate3d(${(g.scx * W - cam.x * w).toFixed(1)}px, ${(g.scy * H - cam.y * hh).toFixed(1)}px, 0)`;
    }
    function desenharFX(t, agora) {
      fx.setTransform(dpr, 0, 0, dpr, 0, 0); fx.clearRect(0, 0, W, H); fx.globalCompositeOperation = "lighter";
      const z = cam.z;
      // trecho já percorrido: uma corrente de luz sobre a trilha
      if (luz > 0.001) {
        const pts = []; for (const p of TRILHA) { if (p.u <= luz) pts.push(p); else break; }
        const fim = pontoEm(luz); if (!pts.length || pts[pts.length - 1].u < luz) pts.push(fim);
        const tela = pts.map(p => projetar(p.x, p.y));
        fx.lineCap = "round"; fx.lineJoin = "round";
        [[26 * z, "rgba(255,190,90,.07)"], [13 * z, "rgba(255,206,116,.11)"], [5 * z, "rgba(255,226,160,.15)"]].forEach(a => { fx.globalAlpha = 1; fx.lineWidth = a[0]; fx.strokeStyle = a[1]; fx.beginPath(); tela.forEach((q, i) => (i ? fx.lineTo(q[0], q[1]) : fx.moveTo(q[0], q[1]))); fx.stroke(); });
        if (!reduz) for (let i = 0; i < 4; i++) { const u = ((t * 0.16 + i / 4) % 1) * luz, p = pontoEm(u), q = projetar(p.x, p.y); luzEm(q[0], q[1], 9 * z * escalaEm(p.y), 0.75 * Math.sin(Math.PI * (u / luz))); }
        if (animLuz) { const q = projetar(fim.x, fim.y); luzEm(q[0], q[1], 30 * z * escalaEm(fim.y), 0.95); }
      }
      // vaga-lumes em profundidades diferentes
      for (const v of vaga) {
        const x = v.x + (reduz ? 0 : Math.sin(t * v.v * 0.4 + v.f) * 0.014), y = v.y + (reduz ? 0 : Math.cos(t * v.v * 0.33 + v.f * 1.7) * 0.011), q = projetar(x, y, v.n);
        if (q[0] < -20 || q[0] > W + 20 || q[1] < -20 || q[1] > H + 20) continue;
        luzEm(q[0], q[1], (2.5 + 6.5 * v.n) * z, (reduz ? 0.55 : 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * v.v * 1.3 + v.f))) * (0.45 + 0.4 * v.n));
      }
      // respostas visuais das descobertas e das estrelas
      for (let i = efeitos.length - 1; i >= 0; i--) {
        const e = efeitos[i], k = (agora - e.t) / e.dur; if (k >= 1) { efeitos.splice(i, 1); continue; } if (k < 0) continue;
        const sai = 1 - k, ent = Math.min(1, k * 4);
        if (e.tipo === "flor") {
          FLORES.forEach((f, j) => { const q = projetar(f[0], f[1]); luzEm(q[0], q[1], (16 + 46 * suave(Math.min(1, k * 1.6))) * z, 0.9 * sai * ent); for (let m = 0; m < 5; m++) { const a = j * 2.1 + m * 1.26, r = (10 + 46 * k) * z; luzEm(q[0] + Math.cos(a) * r * 0.8, q[1] - r * (0.6 + 0.25 * m) + Math.sin(a) * 6, 4.2 * z, sai * ent); } });
        } else if (e.tipo === "raiz") {
          for (let m = 0; m < 9; m++) { const u = Math.max(0, Math.min(1, k * 1.25 - m * 0.035)) * (RAIZ.length - 1), a = RAIZ[Math.floor(u)], b = RAIZ[Math.min(RAIZ.length - 1, Math.floor(u) + 1)], f = u - Math.floor(u), q = projetar(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f); luzEm(q[0], q[1], (15 - m) * z, (1 - m / 9) * Math.min(1, sai * 3) * ent); }
        } else if (e.tipo === "pedra") {
          const q = projetar(LUGARES.pedra[0], LUGARES.pedra[1]); fx.save(); fx.translate(q[0], q[1]); fx.scale(1.7, 0.75);
          [0, 0.35].forEach(d => { const kk = k - d; if (kk > 0) luzEm(0, 0, (18 + 60 * kk) * z, (1 - kk) * 0.9); }); fx.restore();
        } else {   // estrela que acende, ou ponto de luz de uma prática
          const q = projetar(e.d.x, e.d.y), forte = e.tipo === "estrela", s = z * escalaEm(e.d.y) * (forte ? 1 : 0.6);
          luzEm(q[0], q[1], (24 + 70 * suave(k)) * s, sai * ent);
          for (let m = 0; m < (forte ? 16 : 8); m++) { const a = m * 0.3927 * (forte ? 1 : 2) + 0.2, r = (14 + 74 * (1 - sai * sai)) * s; luzEm(q[0] + Math.cos(a) * r, q[1] + Math.sin(a) * r * 0.9 + 16 * k * k * s, (5.5 - 3 * k) * s, sai); }
        }
      }
      fx.globalAlpha = 1;
    }
    const tempo = agora => (reduz ? 2 : (agora - t0) / 1000);
    function desenhar(t) {
      sujo = false;
      try { if (gl && texOk && !plano) desenharGL(t); else posicionarImg(); desenharFX(t, performance.now()); }
      catch (err) { aviso("falha ao desenhar um quadro:", err); }
      if (op.aoQuadro) op.aoQuadro();
    }
    function passo(ts) {
      if (anim) { if (anim.t == null) anim.t = ts; const k = Math.min(1, (ts - anim.t) / anim.ms), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        cam.x = anim.de.x + (anim.a.x - anim.de.x) * e; cam.y = anim.de.y + (anim.a.y - anim.de.y) * e; cam.z = anim.de.z + (anim.a.z - anim.de.z) * e; if (k >= 1) anim = null; }
      if (animLuz) { if (animLuz.t == null) animLuz.t = ts; const k = Math.min(1, (ts - animLuz.t) / animLuz.ms); luz = animLuz.de + (animLuz.a - animLuz.de) * suave(k); if (k >= 1) animLuz = null; }
      const t = tempo(ts);
      if (!reduz) balanco = [Math.sin(t * 0.21) * 0.0035, Math.cos(t * 0.17) * 0.0025];
      desenhar(t);
    }
    const roda = () => vivo && !pausado && visivel && !document.hidden;
    function quadro(ts) {
      raf = 0; if (!vivo) return;
      if (!palco.isConnected) return destruir();
      if (!roda()) return;
      if (sujo || ts - ultimo >= 30) { ultimo = ts; passo(ts); }       // no máximo uns 30 quadros por segundo
      if (!reduz || anim || animLuz || sujo) agendar();                 // movimento reduzido: só redesenha quando algo muda
    }
    function agendar() { if (!raf && vivo) raf = requestAnimationFrame(quadro); }

    /* ----- medidas ----- */
    function medir() {
      W = Math.max(1, palco.clientWidth); H = Math.max(1, palco.clientHeight); dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      if (W * dpr > 900) dpr = 900 / W;
      [glC, fxC].forEach(c => { const w = Math.round(W * dpr), hh = Math.round(H * dpr); if (c.width !== w || c.height !== hh) { c.width = w; c.height = hh; } });
      inset = Math.max(0, Math.min(H * 0.55, op.inset ? op.inset() : 0)); topo = Math.max(0, Math.min(H * 0.2, op.topo ? op.topo() : 0));
      limitar(cam); if (anim) limitar(anim.a);
      desenhar(tempo(performance.now())); agendar();
    }

    /* ----- câmera ----- */
    function irPara(alvo, ms) {
      const a = limitar({ x: alvo.x, y: alvo.y, z: alvo.z || cam.z });
      if (reduz || !ms) { anim = null; cam.x = a.x; cam.y = a.y; cam.z = a.z; sujo = true; desenhar(tempo(performance.now())); return; }
      anim = { de: { x: cam.x, y: cam.y, z: cam.z }, a, ms, t: null }; agendar();
    }
    // enquadra um ponto da pintura: ele fica um pouco abaixo do centro, para o caminho à frente aparecer
    const enquadrar = (x, y, z, sobe) => ({ x, y: y - (sobe == null ? 0.07 : sobe) / (z || ZMIN), z: z || ZMIN });
    function naTela(x, y, margem) { const q = projetar(x, y), m = margem || 30; return q[0] > m && q[0] < W - m && q[1] > topo + m && q[1] < H - inset - m; }
    // metade da área livre, em unidades da pintura, para um dado zoom
    const janela = z => { const g = geo(); return { hx: 0.5 * g.fx / z, hy: (H - inset - topo) / 2 / H * g.fy / z }; };

    /* ----- gestos: arrastar explora, tocar abre; os dois nunca se confundem ----- */
    const dedos = new Map(); let arrasto = null, pinca = null, fimGesto = -1e9;
    function baixo(ev) {
      if (ev.pointerType === "mouse" && ev.button !== 0) return;
      dedos.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      if (dedos.size === 1) arrasto = { id: ev.pointerId, x0: ev.clientX, y0: ev.clientY, x: ev.clientX, y: ev.clientY, ativo: false };
      else if (dedos.size === 2) { const d = Array.from(dedos.values()); pinca = { d: Math.hypot(d[0].x - d[1].x, d[0].y - d[1].y) || 1, z: cam.z }; fimGesto = performance.now(); if (arrasto) arrasto.ativo = true; }
    }
    function move(ev) {
      if (!dedos.has(ev.pointerId)) return; dedos.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      if (travada) return;
      if (pinca && dedos.size === 2) { const d = Array.from(dedos.values()); anim = null; cam.z = pinca.z * Math.hypot(d[0].x - d[1].x, d[0].y - d[1].y) / pinca.d; limitar(cam); fimGesto = performance.now(); sujo = true; agendar(); if (op.aoMover) op.aoMover(); return; }
      if (!arrasto || ev.pointerId !== arrasto.id) return;
      if (!arrasto.ativo) {
        if (Math.hypot(ev.clientX - arrasto.x0, ev.clientY - arrasto.y0) < 8) return;      // menos que isso é um toque
        arrasto.ativo = true; arrasto.x = ev.clientX; arrasto.y = ev.clientY; anim = null; palco.classList.add("arrastando");
        try { cenaEl.setPointerCapture(ev.pointerId); } catch (err) { aviso("sem captura do ponteiro (o arrasto segue pelos eventos comuns):", err); }
        return;
      }
      const g = geo(), dx = ev.clientX - arrasto.x, dy = ev.clientY - arrasto.y; arrasto.x = ev.clientX; arrasto.y = ev.clientY;
      cam.x -= dx / W * g.fx / cam.z; cam.y -= dy / H * g.fy / cam.z; limitar(cam); sujo = true; agendar(); if (op.aoMover) op.aoMover();
    }
    function cima(ev) {
      dedos.delete(ev.pointerId); if (dedos.size < 2 && pinca) { pinca = null; fimGesto = performance.now(); }
      if (arrasto && ev.pointerId === arrasto.id) { if (arrasto.ativo) fimGesto = performance.now(); arrasto = null; palco.classList.remove("arrastando"); }
    }
    const arrastou = () => !!(arrasto && arrasto.ativo) || !!pinca || performance.now() - fimGesto < 400;
    const semClique = ev => { if (arrastou()) { ev.stopPropagation(); ev.preventDefault(); } };
    const ouvir = (alvo, tipo, fn, o) => { alvo.addEventListener(tipo, fn, o); solta.push(() => alvo.removeEventListener(tipo, fn, o)); };
    ouvir(cenaEl, "pointerdown", baixo); ouvir(cenaEl, "pointermove", move); ouvir(cenaEl, "pointerup", cima); ouvir(cenaEl, "pointercancel", cima);
    ouvir(cenaEl, "click", semClique, true); ouvir(cenaEl, "dragstart", ev => ev.preventDefault());
    ouvir(document, "visibilitychange", agendar);
    ouvir(glC, "webglcontextlost", perdeu);

    let ro = null, io = null;
    if (window.ResizeObserver) { ro = new ResizeObserver(medir); ro.observe(palco); } else ouvir(window, "resize", medir);
    if (window.IntersectionObserver) { io = new IntersectionObserver(es => { visivel = es[es.length - 1].isIntersecting; agendar(); }); io.observe(palco); }

    function destruir() {
      if (!vivo) return; vivo = false; if (raf) cancelAnimationFrame(raf); raf = 0;
      solta.forEach(f => f()); solta.length = 0; if (ro) ro.disconnect(); if (io) io.disconnect(); efeitos.length = 0;
      if (gl) { const x = gl.getExtension("WEBGL_lose_context"); if (x) x.loseContext(); gl = null; }
    }

    iniciarGL();
    medir();
    if (img.complete && img.naturalWidth) carregarTextura();
    else { ouvir(img, "load", carregarTextura, { once: true }); ouvir(img, "error", () => { aviso("a pintura do bosque não carregou; as práticas continuam abertas"); palco.classList.add("sem-arte"); }, { once: true }); }

    return {
      projetar, irPara, enquadrar, naTela, janela, medir, destruir, arrastou,
      camera: () => ({ x: cam.x, y: cam.y, z: cam.z }),
      definir: a => { anim = null; cam.x = a.x; cam.y = a.y; cam.z = a.z || cam.z; limitar(cam); sujo = true; desenhar(tempo(performance.now())); agendar(); },
      limitar: a => limitar({ x: a.x, y: a.y, z: a.z || ZMIN }),
      pausar: v => { pausado = !!v; if (!pausado) { sujo = true; agendar(); } },
      travar: v => { travada = !!v; },
      luz: v => { animLuz = null; luz = v; sujo = true; agendar(); },
      animarLuz: (de, a, ms) => { if (reduz || !ms) { animLuz = null; luz = a; sujo = true; desenhar(tempo(performance.now())); return; } luz = de; animLuz = { de, a, ms, t: null }; agendar(); },
      efeito: (tipo, d) => { if (reduz) return; efeitos.push({ tipo, d: d || {}, t: performance.now(), dur: { flor: 1900, raiz: 2100, pedra: 1700, estrela: 1500, ponto: 1100 }[tipo] || 1200 }); agendar(); },
      comProfundidade: () => !plano
    };
  }

  return { criar, perto, pontoEm, ESTRELAS, LUGARES, TRILHA, ZMIN, ZMAX, escalaEm };
})();
