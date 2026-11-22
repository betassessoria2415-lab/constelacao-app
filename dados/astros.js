/* Astrologia básica, fases da lua e calendário de virada */
window.ASTROS = (function () {
  const SIGNOS = [
    { nome: "Capricórnio", de: [12, 22], ate: [1, 19], elemento: "Terra", regente: "Saturno", simbolo: "♑", palavras: ["disciplina", "ambição", "paciência"], pedra: "Granada", cor: "#5E6B7A", prosp: "Prospera com metas de longo prazo, constância e reputação. Riqueza construída degrau a degrau." },
    { nome: "Aquário", de: [1, 20], ate: [2, 18], elemento: "Ar", regente: "Urano", simbolo: "♒", palavras: ["inovação", "liberdade", "coletivo"], pedra: "Ametista", cor: "#4FB3C9", prosp: "Prospera com ideias à frente do tempo, tecnologia e redes. Dinheiro vem do que é diferente." },
    { nome: "Peixes", de: [2, 19], ate: [3, 20], elemento: "Água", regente: "Netuno", simbolo: "♓", palavras: ["intuição", "compaixão", "arte"], pedra: "Água-marinha", cor: "#7FA7D9", prosp: "Prospera quando confia na intuição e dá forma à sensibilidade: arte, cuidado, espiritualidade." },
    { nome: "Áries", de: [3, 21], ate: [4, 19], elemento: "Fogo", regente: "Marte", simbolo: "♈", palavras: ["coragem", "iniciativa", "energia"], pedra: "Diamante", cor: "#D9674F", prosp: "Prospera na ação rápida e na liderança. Começa antes dos outros; precisa aprender a terminar." },
    { nome: "Touro", de: [4, 20], ate: [5, 20], elemento: "Terra", regente: "Vênus", simbolo: "♉", palavras: ["estabilidade", "prazer", "persistência"], pedra: "Esmeralda", cor: "#6FAE8A", prosp: "Signo do patrimônio: prospera acumulando com paciência, valorizando o conforto e a beleza." },
    { nome: "Gêmeos", de: [5, 21], ate: [6, 20], elemento: "Ar", regente: "Mercúrio", simbolo: "♊", palavras: ["comunicação", "versatilidade", "curiosidade"], pedra: "Ágata", cor: "#F2D16B", prosp: "Prospera falando, vendendo, conectando. Várias fontes de renda são naturais." },
    { nome: "Câncer", de: [6, 21], ate: [7, 22], elemento: "Água", regente: "Lua", simbolo: "♋", palavras: ["cuidado", "memória", "lar"], pedra: "Pérola", cor: "#C9D3E6", prosp: "Prospera em tudo que envolve casa, família, alimentação e acolhimento. Segurança é o motor." },
    { nome: "Leão", de: [7, 23], ate: [8, 22], elemento: "Fogo", regente: "Sol", simbolo: "♌", palavras: ["brilho", "generosidade", "liderança"], pedra: "Rubi", cor: "#E8B84A", prosp: "Prospera quando está no centro: palco, marca pessoal, liderança. Visibilidade atrai dinheiro." },
    { nome: "Virgem", de: [8, 23], ate: [9, 22], elemento: "Terra", regente: "Mercúrio", simbolo: "♍", palavras: ["método", "serviço", "precisão"], pedra: "Safira", cor: "#8DAA91", prosp: "Prospera organizando, cuidando dos detalhes e servindo bem. A planilha é sua aliada." },
    { nome: "Libra", de: [9, 23], ate: [10, 22], elemento: "Ar", regente: "Vênus", simbolo: "♎", palavras: ["harmonia", "parceria", "estética"], pedra: "Opala", cor: "#E59AB3", prosp: "Prospera em parcerias, beleza, mediação e negociação justa." },
    { nome: "Escorpião", de: [10, 23], ate: [11, 21], elemento: "Água", regente: "Plutão", simbolo: "♏", palavras: ["intensidade", "transformação", "poder"], pedra: "Topázio", cor: "#7B3F7A", prosp: "Prospera transformando crises em renascimentos. Recursos de outros (sociedades, heranças, investimentos) são tema." },
    { nome: "Sagitário", de: [11, 22], ate: [12, 21], elemento: "Fogo", regente: "Júpiter", simbolo: "♐", palavras: ["expansão", "fé", "aventura"], pedra: "Turquesa", cor: "#B08A4A", prosp: "Regido por Júpiter, o planeta da abundância: prospera expandindo, ensinando, viajando, acreditando." }
  ];

  function signo(d, m) {
    for (const s of SIGNOS) {
      const [dm, dd] = s.de, [am, ad] = s.ate;
      if (dm === 12 && am === 1) { if ((m === 12 && d >= dd) || (m === 1 && d <= ad)) return s; }
      else if ((m === dm && d >= dd) || (m === am && d <= ad)) return s;
    }
    return SIGNOS[0];
  }

  // Fase da lua: lua nova de referência 2000-01-06 18:14 UTC; ciclo sinódico médio
  const SINODICO = 29.530588853;
  const REF = Date.UTC(2000, 0, 6, 18, 14, 0);
  function idadeLua(data) {
    const dias = (data.getTime() - REF) / 86400000;
    return ((dias % SINODICO) + SINODICO) % SINODICO;
  }
  const FASES = [
    { nome: "Lua Nova", icone: "🌑", intencao: "Plantar. Escreva intenções e pedidos claros. O que você semeia agora cresce até a cheia.", acao: "Escreva 3 intenções para o próximo ciclo." },
    { nome: "Crescente Côncava", icone: "🌒", intencao: "Começar. Primeiros passos pequenos e consistentes. Fé no que ainda não aparece.", acao: "Dê o menor passo possível em uma intenção." },
    { nome: "Quarto Crescente", icone: "🌓", intencao: "Decidir. Obstáculos aparecem para testar o compromisso. Ajuste e siga.", acao: "Resolva um obstáculo concreto hoje." },
    { nome: "Crescente Convexa", icone: "🌔", intencao: "Refinar. Afine, melhore, persista. A colheita está perto.", acao: "Melhore algo que já está em andamento." },
    { nome: "Lua Cheia", icone: "🌕", intencao: "Colher e agradecer. Resultados ficam visíveis, emoções também. Celebre e solte o que não floresceu.", acao: "Liste o que colheu e agradeça por escrito." },
    { nome: "Minguante Convexa", icone: "🌖", intencao: "Compartilhar. Divida o que aprendeu, retribua, ensine.", acao: "Compartilhe uma conquista ou um aprendizado." },
    { nome: "Quarto Minguante", icone: "🌗", intencao: "Soltar. Limpe, perdoe, cancele o que pesa: assinaturas, dívidas, hábitos.", acao: "Elimine um gasto ou hábito que não serve." },
    { nome: "Minguante Côncava", icone: "🌘", intencao: "Descansar. Recolha-se, revise, prepare o terreno para a próxima lua nova.", acao: "Descanse e revise o ciclo sem se cobrar." }
  ];
  function faseLua(data) {
    const idade = idadeLua(data);
    const i = Math.floor((idade / SINODICO) * 8 + 0.5) % 8;
    const iluminacao = Math.round((1 - Math.cos((idade / SINODICO) * 2 * Math.PI)) / 2 * 100);
    return Object.assign({ idade: Math.round(idade * 10) / 10, iluminacao }, FASES[i]);
  }

  // Datas da reta final (horário de Brasília aproximado)
  const CALENDARIO = [
    { data: "2025-12-04", tipo: "lua-cheia", titulo: "Lua Cheia em Gêmeos", nota: "Colha e agradeça. Converse sobre dinheiro com clareza." },
    { data: "2025-12-19", tipo: "lua-nova", titulo: "Lua Nova em Sagitário", nota: "Plante as intenções de 2026 sob o signo da expansão." },
    { data: "2025-12-21", tipo: "solsticio", titulo: "Solstício de Verão", nota: "Dia mais longo do ano no Brasil. Luz máxima: hora de brilhar e definir o que quer." },
    { data: "2025-12-31", tipo: "virada", titulo: "Virada do Ano", nota: "Encerre o ciclo 9 (2025) e abra o ciclo 1 (2026): o ano universal do recomeço." },
    { data: "2026-01-03", tipo: "lua-cheia", titulo: "Lua Cheia em Câncer", nota: "Primeira cheia do ano: emoção e lar. Celebre quem está com você." },
    { data: "2026-01-18", tipo: "lua-nova", titulo: "Lua Nova em Capricórnio", nota: "Metas com data e valor. O melhor dia para o planejamento financeiro do ano." },
    { data: "2026-12-08", tipo: "lua-nova", titulo: "Lua Nova em Sagitário", nota: "Plante 2027 com fé e visão ampla. Escreva seus pedidos." },
    { data: "2026-12-21", tipo: "solsticio", titulo: "Solstício de Verão", nota: "Luz máxima. Defina a palavra do seu ano." },
    { data: "2026-12-23", tipo: "lua-cheia", titulo: "Superlua Cheia em Câncer", nota: "Colheita de 2026 em plena luz. Agradeça pelo que floresceu e solte o que pesou." },
    { data: "2026-12-31", tipo: "virada", titulo: "Virada do Ano", nota: "Do ano universal 1 (2026) para o 2 (2027): de plantar para cultivar parcerias e paciência." },
    { data: "2027-01-07", tipo: "lua-nova", titulo: "Lua Nova em Capricórnio", nota: "Metas financeiras do ano com estrutura e prazo." },
    { data: "2027-01-22", tipo: "lua-cheia", titulo: "Superlua Cheia em Leão", nota: "Primeira grande colheita de 2027: brilhe e celebre." }
  ];

  // Rituais de virada por intenção (tradição brasileira)
  const VIRADA = {
    cores: [
      { cor: "Branco", hex: "#F4F1EA", para: "paz e proteção" },
      { cor: "Amarelo / Dourado", hex: "#E8B84A", para: "dinheiro e prosperidade" },
      { cor: "Verde", hex: "#6FAE8A", para: "saúde e esperança" },
      { cor: "Vermelho", hex: "#D9674F", para: "paixão e coragem" },
      { cor: "Rosa", hex: "#E59AB3", para: "amor e harmonia" },
      { cor: "Azul", hex: "#4FB3C9", para: "tranquilidade e intuição" },
      { cor: "Roxo", hex: "#9B7BD1", para: "espiritualidade e transformação" },
      { cor: "Laranja", hex: "#F0914D", para: "sucesso profissional e alegria" }
    ],
    rituais: [
      { t: "Lentilha à meia-noite", d: "Uma colher de lentilha (ou grãos) na virada: abundância que se multiplica." },
      { t: "Sete ondas", d: "Pule sete ondas e faça um pedido em cada uma, de frente para o mar, sem dar as costas." },
      { t: "Romã e uvas", d: "Guarde sete sementes de romã na carteira o ano inteiro. Doze uvas, um pedido por mês." },
      { t: "Dinheiro no bolso", d: "Vire o ano com uma nota na carteira ou no sapato: nunca com as mãos vazias." },
      { t: "Carta de encerramento", d: "Escreva o que solta de 2026 e queime com segurança. Depois, escreva o que convida para 2027." },
      { t: "Casa limpa, janelas abertas", d: "Limpe, doe o que não usa e abra as janelas: o novo precisa de espaço." }
    ]
  };

  // lunação: número sequencial, início (lua nova) e fim
  function lunacao(data) {
    const idade = idadeLua(data);
    const inicio = new Date(data.getTime() - idade * 86400000);
    const n = Math.round((inicio.getTime() - REF) / (SINODICO * 86400000));
    return { n, idade, inicio, fim: new Date(inicio.getTime() + SINODICO * 86400000) };
  }
  function faseIdx(data) { return Math.floor((idadeLua(data) / SINODICO) * 8 + 0.5) % 8; }

  return { SIGNOS, signo, faseLua, idadeLua, lunacao, faseIdx, SINODICO, FASES, CALENDARIO, VIRADA };
})();
