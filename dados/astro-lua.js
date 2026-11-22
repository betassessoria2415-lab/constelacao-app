/* Posição real da Lua e do Sol (séries truncadas de Meeus), signo lunar, ascendente,
   e substituição do cálculo médio das fases em ASTROS por um cálculo pela elongação. */
window.ASTRO2 = (function () {
  const rad = Math.PI / 180, norm = x => ((x % 360) + 360) % 360;
  const jd = data => data.getTime() / 86400000 + 2440587.5;
  const SIGNOS = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];
  const SIMB = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

  function lonSol(data) {
    const T = (jd(data) - 2451545) / 36525, M = (357.5291092 + 35999.0502909 * T) * rad;
    return norm(280.46646 + 36000.76983 * T + 1.914602 * Math.sin(M) + 0.019993 * Math.sin(2 * M) + 0.000289 * Math.sin(3 * M));
  }
  function lonLua(data) {
    const T = (jd(data) - 2451545) / 36525;
    const L = 218.3164477 + 481267.88123421 * T, D = (297.8501921 + 445267.1114034 * T) * rad, M = (357.5291092 + 35999.0502909 * T) * rad,
      Ml = (134.9633964 + 477198.8675055 * T) * rad, F = (93.272095 + 483202.0175233 * T) * rad;
    return norm(L + 6.288774 * Math.sin(Ml) + 1.274027 * Math.sin(2 * D - Ml) + 0.658314 * Math.sin(2 * D) + 0.213618 * Math.sin(2 * Ml)
      - 0.185116 * Math.sin(M) - 0.114332 * Math.sin(2 * F) + 0.058793 * Math.sin(2 * D - 2 * Ml) + 0.057066 * Math.sin(2 * D - M - Ml)
      + 0.053322 * Math.sin(2 * D + Ml) + 0.045758 * Math.sin(2 * D - M) - 0.040923 * Math.sin(M - Ml) - 0.03472 * Math.sin(D) - 0.030383 * Math.sin(M + Ml)
      + 0.015327 * Math.sin(2 * D - 2 * F) - 0.012528 * Math.sin(Ml + 2 * F) + 0.01098 * Math.sin(Ml - 2 * F));
  }
  const elongacao = data => norm(lonLua(data) - lonSol(data));
  const signoDe = lon => { const i = Math.floor(norm(lon) / 30); return { i, nome: SIGNOS[i], simbolo: SIMB[i], grau: Math.floor(norm(lon) % 30) }; };

  // nascimento em hora local → instante UTC. fuso em horas (ex.: -3)
  function instante(nasc, hora, fuso) {
    const [a, m, d] = nasc.split("-").map(Number), [h, mi] = (hora || "12:00").split(":").map(Number);
    return new Date(Date.UTC(a, m - 1, d, h - fuso, mi || 0));
  }
  function signoLunar(nasc, hora, fuso = -3) {
    const s = signoDe(lonLua(instante(nasc, hora, fuso)));
    if (!hora) { // sem hora: confere se a Lua trocou de signo no dia
      const ini = signoDe(lonLua(instante(nasc, "00:00", fuso))), fim = signoDe(lonLua(instante(nasc, "23:59", fuso)));
      if (ini.i !== fim.i) return Object.assign(s, { duvida: [ini.nome, fim.nome] });
    }
    return s;
  }
  function ascendente(nasc, hora, cidade) {
    const t = instante(nasc, hora, cidade.fuso), J = jd(t), T = (J - 2451545) / 36525;
    const lst = norm(280.46061837 + 360.98564736629 * (J - 2451545) + cidade.lon) * rad, eps = (23.4392911 - 0.0130042 * T) * rad, fi = cidade.lat * rad;
    const asc = Math.atan2(Math.cos(lst), -(Math.sin(lst) * Math.cos(eps) + Math.tan(fi) * Math.sin(eps))) / rad;
    return signoDe(asc);
  }

  const CIDADES = [
    ["São Paulo, SP", -23.55, -46.63, -3], ["Rio de Janeiro, RJ", -22.91, -43.17, -3], ["Belo Horizonte, MG", -19.92, -43.94, -3], ["Brasília, DF", -15.78, -47.93, -3],
    ["Salvador, BA", -12.97, -38.5, -3], ["Fortaleza, CE", -3.73, -38.52, -3], ["Recife, PE", -8.05, -34.88, -3], ["Curitiba, PR", -25.43, -49.27, -3],
    ["Porto Alegre, RS", -30.03, -51.23, -3], ["Manaus, AM", -3.12, -60.02, -4], ["Belém, PA", -1.46, -48.5, -3], ["Goiânia, GO", -16.69, -49.26, -3],
    ["Campinas, SP", -22.91, -47.06, -3], ["São Luís, MA", -2.53, -44.3, -3], ["Maceió, AL", -9.67, -35.74, -3], ["Natal, RN", -5.79, -35.21, -3],
    ["Teresina, PI", -5.09, -42.8, -3], ["João Pessoa, PB", -7.12, -34.86, -3], ["Aracaju, SE", -10.91, -37.07, -3], ["Cuiabá, MT", -15.6, -56.1, -4],
    ["Campo Grande, MS", -20.44, -54.65, -4], ["Florianópolis, SC", -27.6, -48.55, -3], ["Vitória, ES", -20.32, -40.34, -3], ["Porto Velho, RO", -8.76, -63.9, -4],
    ["Rio Branco, AC", -9.97, -67.81, -5], ["Macapá, AP", 0.03, -51.07, -3], ["Boa Vista, RR", 2.82, -60.67, -4], ["Palmas, TO", -10.18, -48.33, -3],
    ["Ribeirão Preto, SP", -21.18, -47.81, -3], ["Santos, SP", -23.96, -46.33, -3], ["São José dos Campos, SP", -23.18, -45.89, -3], ["Sorocaba, SP", -23.5, -47.46, -3],
    ["Uberlândia, MG", -18.92, -48.28, -3], ["Juiz de Fora, MG", -21.76, -43.35, -3], ["Londrina, PR", -23.31, -51.16, -3], ["Joinville, SC", -26.3, -48.85, -3],
    ["Feira de Santana, BA", -12.27, -38.97, -3], ["Caxias do Sul, RS", -29.17, -51.18, -3], ["Niterói, RJ", -22.88, -43.1, -3], ["Campina Grande, PB", -7.23, -35.88, -3]
  ].map(c => ({ nome: c[0], lat: c[1], lon: c[2], fuso: c[3] }));

  const LUA_TXT = [
    "Lua em Áries: sente rápido e reage rápido. Segurança, para você, é poder agir. No dinheiro, cuide do impulso de resolver tudo na hora.",
    "Lua em Touro: precisa de estabilidade, conforto e rotina. Segurança é ter reserva e comida boa na mesa. É a Lua que melhor guarda dinheiro.",
    "Lua em Gêmeos: processa emoção falando e pensando. Segurança é ter com quem conversar. No dinheiro, várias pequenas fontes combinam com você.",
    "Lua em Câncer: sente fundo e protege os seus. Segurança é casa e família em paz. Gasta com quem ama; aprenda a guardar para você também.",
    "Lua em Leão: precisa ser vista e valorizada. Segurança é sentir orgulho de si. Generosa por natureza; atenção aos gastos para impressionar.",
    "Lua em Virgem: acalma quando organiza. Segurança é saber que está tudo em ordem. Ótima para planilha; cuidado com a autocrítica.",
    "Lua em Libra: precisa de harmonia e de parceria. Segurança é estar bem com as pessoas. Decide melhor a dois; evite adiar escolhas.",
    "Lua em Escorpião: sente tudo com intensidade e guarda. Segurança é ter controle e verdade. Forte para recomeços e para investir com estratégia.",
    "Lua em Sagitário: precisa de espaço e de sentido. Segurança é ter para onde crescer. Otimista com dinheiro; faça a conta antes do sim.",
    "Lua em Capricórnio: sente e segura firme. Segurança é resultado concreto. Disciplinada e previdente; permita-se descansar sem culpa.",
    "Lua em Aquário: precisa de liberdade e de amigos. Segurança é poder ser diferente. Boa com ideias novas de renda; atenção ao desapego excessivo.",
    "Lua em Peixes: absorve o ambiente e sonha alto. Segurança é fé e acolhimento. Intuição forte para oportunidades; coloque limites e números no papel."
  ];
  const ASC_TXT = [
    "Ascendente em Áries: chega decidida e direta. As pessoas veem coragem. Abre portas tomando a frente.",
    "Ascendente em Touro: passa calma e confiança. As pessoas veem solidez. Abre portas pela constância.",
    "Ascendente em Gêmeos: chega conversando. As pessoas veem agilidade. Abre portas pela palavra.",
    "Ascendente em Câncer: acolhe antes de falar. As pessoas veem cuidado. Abre portas criando vínculo.",
    "Ascendente em Leão: entra e é notada. As pessoas veem brilho. Abre portas pela presença.",
    "Ascendente em Virgem: observa e ajusta. As pessoas veem competência. Abre portas pelo serviço bem feito.",
    "Ascendente em Libra: encanta e equilibra. As pessoas veem elegância. Abre portas pela diplomacia.",
    "Ascendente em Escorpião: olha fundo e fala pouco. As pessoas veem força. Abre portas pela estratégia.",
    "Ascendente em Sagitário: chega rindo e ampliando. As pessoas veem otimismo. Abre portas pelo entusiasmo.",
    "Ascendente em Capricórnio: sério e confiável. As pessoas veem autoridade. Abre portas pela responsabilidade.",
    "Ascendente em Aquário: original e independente. As pessoas veem novidade. Abre portas pelas ideias.",
    "Ascendente em Peixes: suave e intuitiva. As pessoas veem sensibilidade. Abre portas pela empatia."
  ];

  // substitui o cálculo médio de ASTROS pelo cálculo real da elongação
  if (window.ASTROS) {
    const SIN = ASTROS.SINODICO, REF = Date.UTC(2000, 0, 6, 18, 14, 0);
    ASTROS.idadeLua = data => elongacao(data) / 360 * SIN;
    ASTROS.faseIdx = data => Math.floor(elongacao(data) / 45 + 0.5) % 8;
    ASTROS.faseLua = data => {
      const e = elongacao(data), idade = e / 360 * SIN;
      return Object.assign({ idade: Math.round(idade * 10) / 10, iluminacao: Math.round((1 - Math.cos(e * rad)) / 2 * 100), signo: signoDe(lonLua(data)) }, ASTROS.FASES[ASTROS.faseIdx(data)]);
    };
    ASTROS.lunacao = data => {
      const idade = ASTROS.idadeLua(data), inicio = new Date(data.getTime() - idade * 86400000);
      return { n: Math.round((inicio.getTime() - REF) / (SIN * 86400000)), idade, inicio, fim: new Date(inicio.getTime() + SIN * 86400000) };
    };
  }

  return { lonSol, lonLua, elongacao, signoDe, signoLunar, ascendente, CIDADES, LUA_TXT, ASC_TXT, SIGNOS, SIMB };
})();
