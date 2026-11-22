/* Mapa Profundo: momentos decisivos, desafios, ciclos de vida, lições cármicas,
   tendências ocultas, triângulo da vida e sequências. Usa NUM (numerologia.js). */
window.PROFUNDO = (function () {
  const r1 = n => NUM.reduzir(n, false);          // sempre 1 a 9
  const rm = n => NUM.reduzir(n, true);           // preserva 11 e 22

  function idade(nasc, ref = new Date()) {
    const [a, m, d] = nasc.split("-").map(Number);
    let i = ref.getFullYear() - a; if (ref.getMonth() + 1 < m || (ref.getMonth() + 1 === m && ref.getDate() < d)) i--;
    return i;
  }

  // 4 momentos decisivos (pináculos)
  function momentos(d, m, a, destino) {
    const p1 = rm(rm(d) + rm(m)), p2 = rm(rm(d) + rm(a)), p3 = rm(p1 + p2), p4 = rm(rm(m) + rm(a));
    const f1 = 37 - r1(destino);   // linha cabalística (Carlos Rosa): 37 menos o Destino
    return [
      { n: p1, de: 0, ate: f1, conta: `dia ${rm(d)} + mês ${rm(m)}` },
      { n: p2, de: f1 + 1, ate: f1 + 9, conta: `dia ${rm(d)} + ano ${rm(a)}` },
      { n: p3, de: f1 + 10, ate: f1 + 18, conta: `1º ${p1} + 2º ${p2}` },
      { n: p4, de: f1 + 19, ate: 120, conta: `mês ${rm(m)} + ano ${rm(a)}` }
    ];
  }
  // 3 desafios (o principal vale a vida inteira)
  function desafios(d, m, a, destino) {
    const d1 = Math.abs(r1(d) - r1(m)), d2 = Math.abs(r1(d) - r1(a)), dp = Math.abs(d1 - d2), f1 = 37 - r1(destino);
    return [
      { n: d1, nome: "1º desafio", periodo: `até os ${f1} anos`, conta: `|dia ${r1(d)} − mês ${r1(m)}|` },
      { n: d2, nome: "2º desafio", periodo: `dos ${f1 + 1} aos ${f1 + 27} anos`, conta: `|dia ${r1(d)} − ano ${r1(a)}|` },
      { n: dp, nome: "Desafio principal", periodo: "a vida inteira", conta: `|${d1} − ${d2}|`, principal: true }
    ];
  }
  // 3 ciclos de vida
  function ciclos(d, m, a, destino) {
    const f1 = 37 - r1(destino);
    return [
      { n: rm(m), nome: "Ciclo formativo", de: 0, ate: f1 - 1, conta: `mês de nascimento ${m}` },
      { n: rm(d), nome: "Ciclo produtivo", de: f1, ate: f1 + 26, conta: `dia de nascimento ${d}` },
      { n: rm(a), nome: "Ciclo de colheita", de: f1 + 27, ate: 120, conta: `ano de nascimento ${a}` }
    ];
  }
  // frequência dos números no nome, lições (ausentes) e tendências (4 ou mais)
  function frequencias(nome) {
    const f = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    NUM.letras(nome).forEach(x => { if (f[x.d] !== undefined) f[x.d]++; });
    const licoes = Object.keys(f).map(Number).filter(n => f[n] === 0);
    const tendencias = Object.keys(f).map(Number).filter(n => f[n] >= 4);
    return { f, licoes, tendencias, subconsciente: 9 - licoes.length };
  }
  // triângulo invertido da vida
  function triangulo(nome) {
    let linha = NUM.letras(nome).map(x => x.d);
    const linhas = [linha];
    while (linha.length > 1) { const prox = []; for (let i = 0; i < linha.length - 1; i++) prox.push(r1(linha[i] + linha[i + 1])); linhas.push(prox); linha = prox; }
    const seqs = {};
    linhas.forEach(l => { for (let i = 0; i < l.length - 2; i++) if (l[i] === l[i + 1] && l[i] === l[i + 2]) seqs[l[i]] = true; });
    return { linhas, regente: linha[0] || 0, sequencias: Object.keys(seqs).map(Number) };
  }

  const MOMENTO = {
    1: "Fase de se afirmar e andar com as próprias pernas. A vida pede iniciativa e decisões suas. Prosperidade vem de liderar algo, mesmo pequeno.",
    2: "Fase de parcerias, paciência e sensibilidade. Nada se resolve sozinha ou à força. Prosperidade vem de acordos bem cuidados e de saber esperar.",
    3: "Fase de expressão e vida social. Sua palavra, sua imagem e sua criatividade abrem portas. Prosperidade vem de se mostrar e de vender o que sabe.",
    4: "Fase de trabalho e construção. É quando se levanta a base: casa, profissão, reserva. Prosperidade vem de método e constância, sem atalhos.",
    5: "Fase de mudanças e liberdade. Trabalho, cidade e pessoas podem mudar. Prosperidade vem de versatilidade e de aproveitar oportunidades sem se dispersar.",
    6: "Fase de família, casa e responsabilidade. Compromissos afetivos ganham peso. Prosperidade vem de cuidar bem e de negócios ligados a lar, beleza e serviço.",
    7: "Fase de estudo, interiorização e fé. Menos barulho, mais profundidade. Prosperidade vem de se especializar e confiar no que você sabe.",
    8: "Fase de poder material e reconhecimento. É o momento de colher, liderar e negociar. Prosperidade vem em escala, com ética e boa gestão.",
    9: "Fase de encerramentos e visão ampla. Ciclos se fecham para abrir espaço. Prosperidade vem de servir a muitos e de soltar o que já terminou.",
    11: "Fase mestra de inspiração. Intuição forte e sensibilidade alta; você influencia pessoas. Prosperidade vem de seguir uma visão e cuidar do nervosismo.",
    22: "Fase mestra de grandes obras. Capacidade rara de realizar projetos que servem a muitos. Prosperidade de legado, com muito trabalho e paciência."
  };
  const DESAFIO = {
    0: "O desafio da escolha: você pode enfrentar um pouco de todos ou nenhum em especial. Nada trava você de fora; a questão é decidir e sustentar a decisão.",
    1: "Aprender a confiar em si sem depender de aprovação. O risco é oscilar entre se anular e querer mandar. Gesto: tome uma decisão por semana sem pedir opinião.",
    2: "Aprender a lidar com a sensibilidade sem se ferir à toa. O risco é guardar mágoa e ceder demais. Gesto: diga o que sente no mesmo dia, com calma.",
    3: "Aprender a se expressar sem medo de crítica e sem se dispersar. O risco é esconder talentos ou falar demais. Gesto: mostre um trabalho seu por semana.",
    4: "Aprender disciplina sem rigidez. O risco é adiar o trabalho duro ou virar escrava dele. Gesto: uma rotina mínima de organização, no mesmo dia e horário.",
    5: "Aprender a usar a liberdade com responsabilidade. O risco é o impulso: mudanças e gastos por inquietação. Gesto: espere 48 horas antes de decisões grandes.",
    6: "Aprender a cuidar sem controlar e sem se sacrificar. O risco é querer consertar todo mundo. Gesto: pergunte antes de ajudar e coloque você na lista.",
    7: "Aprender a confiar: nos outros, na vida e na própria intuição. O risco é o isolamento e a desconfiança. Gesto: divida um pensamento íntimo com alguém.",
    8: "Aprender a relação certa com dinheiro e poder: nem medo, nem obsessão. O risco é medir tudo pelo material. Gesto: negocie com firmeza e doe com regularidade."
  };
  const CICLO_VIDA = {
    1: "pede independência e iniciativa.", 2: "pede cooperação, paciência e escuta.", 3: "pede expressão, amizades e alegria.", 4: "pede trabalho, ordem e bases firmes.",
    5: "traz mudanças, viagens e liberdade.", 6: "traz família, casa e responsabilidades afetivas.", 7: "pede estudo, silêncio e fé.", 8: "traz ambição, dinheiro e autoridade.",
    9: "pede desapego, generosidade e encerramentos.", 11: "traz inspiração, sensibilidade e influência sobre pessoas.", 22: "traz grandes responsabilidades e poder de construir."
  };
  const LICAO = {
    1: "Falta do 1: aprender a tomar iniciativa e confiar na própria vontade.",
    2: "Falta do 2: aprender paciência, tato e trabalho em parceria.",
    3: "Falta do 3: aprender a se expressar e a se valorizar sem autocrítica excessiva.",
    4: "Falta do 4: aprender método, rotina e a terminar o que começa.",
    5: "Falta do 5: aprender a lidar com mudanças e a confiar no novo.",
    6: "Falta do 6: aprender a assumir compromissos afetivos e familiares.",
    7: "Falta do 7: aprender a olhar para dentro, estudar e ter fé.",
    8: "Falta do 8: aprender a administrar dinheiro e a ocupar lugares de poder sem culpa.",
    9: "Falta do 9: aprender compreensão, generosidade e amor ao próximo. É a lição mais comum: na tabela cabalística o 9 só aparece em letras acentuadas."
  };
  const TENDENCIA = {
    1: "Muito 1: vontade forte, que pode virar teimosia e individualismo.",
    2: "Muito 2: sensibilidade alta, que pode virar dependência e timidez.",
    3: "Muito 3: talento para comunicar, que pode virar dispersão e exagero.",
    4: "Muito 4: capacidade de trabalho, que pode virar rigidez e excesso de cobrança.",
    5: "Muito 5: versatilidade, que pode virar inquietação e impulso.",
    6: "Muito 6: senso de responsabilidade, que pode virar controle e sacrifício.",
    7: "Muito 7: mente analítica, que pode virar isolamento e desconfiança.",
    8: "Muito 8: ambição e força, que podem virar dureza e apego ao material.",
    9: "Muito 9: generosidade e idealismo, que podem virar sacrifício e dificuldade de soltar."
  };
  const SEQUENCIA = {
    1: "111 · limitação da iniciativa: fases de falta de coragem para começar. Antídoto: começos pequenos e frequentes.",
    2: "222 · limitação da autoconfiança: timidez e indecisão diante dos outros. Antídoto: decisões curtas, ditas em voz alta.",
    3: "333 · limitação da comunicação: dificuldade de se fazer entender. Antídoto: escrever antes de falar e pedir retorno.",
    4: "444 · limitação da realização: trabalho que demora a render. Antídoto: metas menores e conferência semanal.",
    5: "555 · instabilidade: mudanças que desorganizam a vida e o bolso. Antídoto: reserva e uma rotina fixa mínima.",
    6: "666 · peso afetivo: decepções e excesso de responsabilidade com os outros. Antídoto: limites claros e autocuidado.",
    7: "777 · isolamento: tendência a se fechar e desconfiar. Antídoto: um vínculo de confiança cultivado toda semana.",
    8: "888 · aperto material: fases de dinheiro curto apesar do esforço. Antídoto: planejamento, registro de gastos e negociação.",
    9: "999 · perdas e recomeços: ciclos que terminam de repente. Antídoto: desapego e uma reserva para imprevistos."
  };

  // números harmônicos pelo dia de nascimento reduzido (Carlos Rosa)
  const HARMONICOS = {
    1: [[2, 4, 9], [5, 6, 8], [3, 7]], 2: [[1, 2, 3, 4, 5, 6, 7, 8, 9], [], []], 3: [[2, 3, 6, 8, 9], [4, 7], [1, 5]], 4: [[1, 2, 6, 7], [3, 5, 9], [8]],
    5: [[2, 5, 6, 7, 9], [1, 4], [3, 8]], 6: [[2, 3, 4, 5, 6, 9], [1], [7, 8]], 7: [[2, 4, 5, 7], [3, 9], [1, 6, 8]], 8: [[2, 3, 9], [1, 6], [4, 5, 7]], 9: [[1, 2, 3, 5, 6, 8, 9], [4, 7], []]
  };
  function harmonia(diaA, diaB) { const a = r1(diaA), b = r1(diaB), h = HARMONICOS[a]; return h[0].includes(b) ? "harmonia" : h[2].includes(b) ? "atrito" : "neutro"; }
  // cores favoráveis pelo número de Expressão
  const CORES = { 1: "amarelo, laranja, dourado, verde, creme e branco", 2: "verde, creme, branco e cinza", 3: "violeta, vinho, púrpura e vermelho", 4: "azul, cinza, púrpura e ouro", 5: "cores claras, cinza e prateado",
    6: "rosa, azul e verde", 7: "verde, amarelo, branco, cinza e azul-claro", 8: "púrpura, cinza, azul, preto e castanho", 9: "vermelho, rosa, coral e vinho", 11: "branco, violeta e cores claras", 22: "violeta, branco e cores claras" };
  const missao = (destino, expressao) => rm(destino + expressao);

  return { HARMONICOS, harmonia, CORES, missao, idade, momentos, desafios, ciclos, frequencias, triangulo, MOMENTO, DESAFIO, CICLO_VIDA, LICAO, TENDENCIA, SEQUENCIA };
})();
