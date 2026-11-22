/* Numerologia cabalística · tabelas e significados */
window.NUM = (function () {
  // Tabela cabalística (1 a 8) usada na numerologia cabalística brasileira
  const TABELA = {
    A: 1, I: 1, J: 1, Q: 1, Y: 1,
    B: 2, K: 2, R: 2,
    C: 3, G: 3, L: 3, S: 3,
    D: 4, M: 4, T: 4,
    E: 5, H: 5, N: 5, X: 5,
    U: 6, V: 6, W: 6,
    O: 7, Z: 7,
    F: 8, P: 8
  };
  const VOGAIS = new Set(["A", "E", "I", "O", "U"]);

  function normalizar(nome) {
    return (nome || "")
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toUpperCase().replace(/[^A-Z ]/g, "").replace(/\s+/g, " ").trim();
  }

  function reduzir(n, mestres = true) {
    n = Math.abs(Math.floor(n));
    while (n > 9) {
      if (mestres && (n === 11 || n === 22)) return n;
      n = String(n).split("").reduce((a, d) => a + Number(d), 0);
    }
    return n;
  }

  function somaDigitos(n) { return String(n).split("").reduce((a, d) => a + Number(d), 0); }

  // Acentos na linha cabalística (Carlos Rosa): agudo +2, til +3, circunflexo +7, grave ×2, trema ×2; Ç = 6
  function letras(nome) {
    const out = [];
    (nome || "").normalize("NFD").toUpperCase().split("").forEach(ch => {
      const ult = out[out.length - 1];
      if (/[A-Z]/.test(ch)) out.push({ l: ch, v: TABELA[ch] || 0, vogal: VOGAIS.has(ch) });
      else if (ult && !ult.marcado) {
        if (ch === "́") { ult.v += 2; ult.marcado = true; ult.l += "́"; }
        else if (ch === "̃") { ult.v += 3; ult.marcado = true; ult.l += "̃"; }
        else if (ch === "̂") { ult.v += 7; ult.marcado = true; ult.l += "̂"; }
        else if (ch === "̀" || ch === "̈") { ult.v *= 2; ult.marcado = true; ult.l += ch; }
        else if (ch === "̧" && ult.l === "C") { ult.v = 6; ult.marcado = true; ult.l = "Ç"; }
      }
    });
    return out.map(x => ({ l: x.l.normalize("NFC"), v: x.v, d: reduzir(x.v, false), vogal: x.vogal }));
  }

  function expressao(nome) { return reduzir(letras(nome).reduce((a, x) => a + x.v, 0)); }
  function motivacao(nome) { return reduzir(letras(nome).filter(x => x.vogal).reduce((a, x) => a + x.v, 0)); }
  function impressao(nome) { return reduzir(letras(nome).filter(x => !x.vogal).reduce((a, x) => a + x.v, 0)); }

  // Destino: dia + mês + ano reduzidos separadamente e somados (método clássico)
  function destino(d, m, a) { return reduzir(reduzir(d) + reduzir(m) + reduzir(a)); }
  function diaNatal(d) { return reduzir(d); }
  function anoUniversal(a) { return reduzir(a, false); }
  function anoPessoal(d, m, anoRef) { return reduzir(reduzir(d) + reduzir(m) + reduzir(anoRef, false), false); }
  function mesPessoal(d, m, anoRef, mesRef) { return reduzir(anoPessoal(d, m, anoRef) + mesRef, false); }
  function diaPessoal(d, m, data) {
    return reduzir(mesPessoal(d, m, data.getFullYear(), data.getMonth() + 1) + data.getDate(), false);
  }
  function diaUniversal(data) {
    return reduzir(somaDigitos(data.getDate()) + somaDigitos(data.getMonth() + 1) + somaDigitos(data.getFullYear()), false);
  }
  // Primeiro nome: a "vibração do chamado"
  function primeiroNome(nome) { return reduzir(letras(normalizar(nome).split(" ")[0] || "").reduce((a, x) => a + x.v, 0)); }

  // Dívidas cármicas: somas 13, 14, 16, 19 antes de reduzir
  function somaBruta(nome) { return letras(nome).reduce((a, x) => a + x.v, 0); }

  const SIGNIFICADOS = {
    1: { nome: "A Iniciadora", sefira: "Kether", sefiraPt: "Coroa", hebraica: "א Aleph", planeta: "Sol", cor: "Dourado", corHex: "#E8B84A", pedra: "Citrino", elemento: "Fogo",
      essencia: "Começo, independência, coragem de dar o primeiro passo. Você veio para abrir caminhos, não para esperar que alguém abra por você.",
      prosperidade: "Sua riqueza nasce da iniciativa. Dinheiro chega quando você lidera algo seu, mesmo pequeno: uma ideia, um serviço, uma decisão que ninguém tomou.",
      luz: ["liderança", "originalidade", "determinação", "pioneirismo"], sombra: ["impaciência", "orgulho", "fazer tudo sozinha"],
      frequencia: "Eu começo. O caminho se abre à minha frente a cada passo que dou." },
    2: { nome: "A Parceira", sefira: "Chokmah", sefiraPt: "Sabedoria", hebraica: "ב Beth", planeta: "Lua", cor: "Prata e branco", corHex: "#C9D3E6", pedra: "Pedra da lua", elemento: "Água",
      essencia: "Cooperação, sensibilidade, intuição. Você sente o que ainda não foi dito e constrói pontes entre pessoas.",
      prosperidade: "Sua riqueza vem de parcerias e relações bem cuidadas. Sociedades, indicações e trabalho em dupla rendem mais do que caminhar sozinha.",
      luz: ["diplomacia", "intuição", "paciência", "cuidado"], sombra: ["indecisão", "dependência", "medo de desagradar"],
      frequencia: "Eu confio na minha intuição e atraio as pessoas certas para o meu caminho." },
    3: { nome: "A Criadora", sefira: "Binah", sefiraPt: "Entendimento", hebraica: "ג Gimel", planeta: "Júpiter", cor: "Amarelo", corHex: "#F2D16B", pedra: "Topázio", elemento: "Ar",
      essencia: "Expressão, comunicação, alegria. Sua palavra e sua criatividade são a sua moeda mais forte.",
      prosperidade: "Dinheiro flui quando você se expressa: vender, ensinar, criar conteúdo, encantar com o que diz e faz. Quanto mais você se mostra, mais recebe.",
      luz: ["criatividade", "otimismo", "comunicação", "carisma"], sombra: ["dispersão", "exagero", "começar muito e terminar pouco"],
      frequencia: "Minha voz cria. Eu me expresso e a abundância responde." },
    4: { nome: "A Construtora", sefira: "Chesed", sefiraPt: "Misericórdia", hebraica: "ד Daleth", planeta: "Urano / Saturno", cor: "Verde", corHex: "#6FAE8A", pedra: "Jade", elemento: "Terra",
      essencia: "Ordem, trabalho, estrutura. Você transforma sonho em plano e plano em tijolo.",
      prosperidade: "Sua riqueza é construída, não ganha: planilha, constância, reserva, patrimônio. O que você organiza cresce. Pressa é sua única inimiga.",
      luz: ["disciplina", "confiabilidade", "método", "resistência"], sombra: ["rigidez", "excesso de controle", "medo de arriscar"],
      frequencia: "Cada passo que dou é um tijolo. Eu construo a vida que desejo com firmeza." },
    5: { nome: "A Transformadora", sefira: "Geburah", sefiraPt: "Força", hebraica: "ה He", planeta: "Mercúrio", cor: "Azul-turquesa", corHex: "#4FB3C9", pedra: "Água-marinha", elemento: "Ar",
      essencia: "Liberdade, movimento, mudança. Você veio para experimentar e abrir portas que outros têm medo de empurrar.",
      prosperidade: "Dinheiro vem pela versatilidade: várias fontes, viagens, vendas, redes, novidades. Rotina rígida esgota você; variedade enriquece.",
      luz: ["adaptabilidade", "coragem", "curiosidade", "magnetismo"], sombra: ["inconstância", "impulso no gasto", "fuga de compromissos"],
      frequencia: "Eu me movo com liberdade e cada mudança me aproxima da prosperidade." },
    6: { nome: "A Cuidadora", sefira: "Tiphareth", sefiraPt: "Beleza", hebraica: "ו Vav", planeta: "Vênus", cor: "Rosa", corHex: "#E59AB3", pedra: "Quartzo rosa", elemento: "Terra",
      essencia: "Amor, lar, responsabilidade, beleza. Você prospera quando cuida e quando é cuidada.",
      prosperidade: "Sua riqueza passa pela família, pela casa, pela estética e pelo serviço. Negócios de cuidado, beleza, alimentação e acolhimento combinam com a sua vibração.",
      luz: ["generosidade", "harmonia", "lealdade", "senso estético"], sombra: ["sacrifício excessivo", "controle disfarçado de cuidado", "culpa"],
      frequencia: "Eu mereço receber tanto quanto dou. Minha casa é um templo de abundância." },
    7: { nome: "A Buscadora", sefira: "Netzach", sefiraPt: "Vitória", hebraica: "ז Zayin", planeta: "Netuno", cor: "Violeta", corHex: "#9B7BD1", pedra: "Ametista", elemento: "Água",
      essencia: "Profundidade, estudo, espiritualidade. Você precisa entender antes de agir, e isso é sua força.",
      prosperidade: "Sua riqueza vem do conhecimento: especialização, consultoria, ensino, pesquisa. Quanto mais fundo você vai num assunto, mais valiosa se torna.",
      luz: ["sabedoria", "análise", "intuição refinada", "fé"], sombra: ["isolamento", "desconfiança", "perfeccionismo paralisante"],
      frequencia: "Eu confio no que sei e no que sinto. A sabedoria me conduz à prosperidade." },
    8: { nome: "A Realizadora", sefira: "Hod", sefiraPt: "Esplendor", hebraica: "ח Cheth", planeta: "Saturno", cor: "Azul-marinho e preto", corHex: "#2F4A8A", pedra: "Ônix", elemento: "Terra",
      essencia: "Poder, ambição, gestão. O 8 é o número do dinheiro e da colheita justa: você recebe na medida em que assume.",
      prosperidade: "Sua vibração é a do empreendimento e da autoridade. Negócios, liderança, investimentos e negociação são seu terreno natural. Equilibre material e espiritual.",
      luz: ["ambição", "eficiência", "senso de justiça", "visão estratégica"], sombra: ["dureza", "materialismo", "medo de perder controle"],
      frequencia: "Eu sou digna de prosperar em grande escala. O dinheiro é energia e eu a conduzo com sabedoria." },
    9: { nome: "A Doadora", sefira: "Yesod", sefiraPt: "Fundamento", hebraica: "ט Teth", planeta: "Marte", cor: "Vermelho e dourado", corHex: "#D9674F", pedra: "Granada", elemento: "Fogo",
      essencia: "Compaixão, encerramento, visão ampla. Você fecha ciclos para que outros possam começar.",
      prosperidade: "Sua riqueza vem do propósito: quando o seu trabalho serve a muitos, o retorno vem multiplicado. Doar e receber são o mesmo movimento para você.",
      luz: ["generosidade", "idealismo", "tolerância", "carisma universal"], sombra: ["dificuldade de soltar", "drama", "esquecer de si"],
      frequencia: "Eu solto o que terminou e recebo, com gratidão, o que o novo ciclo traz." },
    11: { nome: "A Inspiradora", sefira: "Daath", sefiraPt: "Conhecimento oculto", hebraica: "כ Kaph", planeta: "Urano", cor: "Branco prateado", corHex: "#E6E6F5", pedra: "Selenita", elemento: "Ar",
      essencia: "Número mestre. Intuição elevada, inspiração, visão. Você capta ideias antes do tempo delas e ilumina quem está perto.",
      prosperidade: "Sua riqueza nasce da inspiração e do magnetismo: quando você fala do que acredita, as pessoas seguem. Cuide da ansiedade para a visão virar ação.",
      luz: ["intuição", "inspiração", "sensibilidade", "idealismo"], sombra: ["ansiedade", "nervosismo", "medo da própria luz"],
      frequencia: "Eu sou um canal de luz. Minha intuição me mostra o caminho da abundância." },
    22: { nome: "A Mestra Construtora", sefira: "Malkuth", sefiraPt: "Reino", hebraica: "ת Tav", planeta: "Terra", cor: "Castanho e dourado", corHex: "#B08A4A", pedra: "Olho de tigre", elemento: "Terra",
      essencia: "Número mestre. A visão do 11 com a estrutura do 4: você veio para construir algo grande e duradouro.",
      prosperidade: "Sua riqueza é de legado: projetos, empresas, obras que servem a muitos e permanecem. Pense grande, comece pequeno, não desista no meio.",
      luz: ["visão prática", "poder de realização", "responsabilidade", "liderança"], sombra: ["pressão interna", "medo de não dar conta", "autoexigência"],
      frequencia: "Eu construo com visão e paciência. Meu legado de prosperidade já está em obra." }
  };

  // Dívidas cármicas (soma bruta do nome ou dia natal 13, 14, 16, 19)
  const CARMICAS = {
    13: "Lição do trabalho: tendência a atalhos e dispersão; a prosperidade pede método e constância.",
    14: "Lição da liberdade: excessos e impulsividade; aprenda a moderar sem se prender.",
    16: "Lição do ego: quedas que humilham o orgulho para reconstruir em bases verdadeiras; cuidado com relacionamentos e vaidade.",
    19: "Lição da independência: aprender a pedir e aceitar ajuda; ninguém prospera sozinha."
  };

  // Ciclo pessoal (ano / mês / dia): 1 a 9
  const CICLO = {
    1: { tema: "Semente", resumo: "Começos, iniciativa, plantar intenções.", ano: "Ano de novos começos. Tudo o que você planta agora cresce pelos próximos nove anos. Hora de decidir o que quer, não o que teme.", dia: "Dia de começar. Dê o primeiro passo em algo que está adiando. Decida, mande a mensagem, abra a planilha.", fazer: ["iniciar um projeto", "tomar uma decisão adiada", "escrever uma intenção clara"], evitar: ["esperar aprovação dos outros", "pedir opinião demais"], cor: "#E8B84A", palavra: "Começo" },
    2: { tema: "Espera fértil", resumo: "Paciência, parcerias, intuição.", ano: "Ano de cultivar. As sementes de ontem estão germinando por baixo da terra. Parcerias, acordos e paciência rendem mais do que força.", dia: "Dia de ouvir, cooperar e ajustar. Boas conversas, acordos e sociedades. Nada precisa ser resolvido à força.", fazer: ["conversar com alguém de confiança", "cuidar de uma parceria", "escutar a intuição"], evitar: ["forçar resultados", "decisões por impulso"], cor: "#C9D3E6", palavra: "Parceria" },
    3: { tema: "Expressão", resumo: "Criatividade, comunicação, alegria.", ano: "Ano de se mostrar. Comunicação, redes, criatividade e prazer. Sua palavra abre portas; use-a com alegria e sem medo.", dia: "Dia de se expressar. Fale, publique, crie, venda. Sua energia social está alta: aproveite para divulgar e encantar.", fazer: ["publicar algo seu", "oferecer o que sabe fazer", "sorrir mais nas negociações"], evitar: ["dispersão", "gastos por euforia"], cor: "#F2D16B", palavra: "Criação" },
    4: { tema: "Construção", resumo: "Trabalho, organização, base sólida.", ano: "Ano de construir. Planilha, rotina, reserva, estrutura. Parece lento, mas é aqui que a riqueza duradoura ganha fundação.", dia: "Dia de organizar e trabalhar. Confira contas, arrume a casa financeira, cumpra o combinado. Pequenos ajustes rendem muito.", fazer: ["revisar o orçamento", "organizar documentos", "cumprir um compromisso"], evitar: ["arriscar sem planejar", "pular etapas"], cor: "#6FAE8A", palavra: "Estrutura" },
    5: { tema: "Movimento", resumo: "Mudança, liberdade, oportunidade.", ano: "Ano de mudança. Oportunidades inesperadas, viagens, novas fontes de renda. Mantenha-se flexível e atenta aos sinais.", dia: "Dia de movimento. Algo inesperado pode aparecer: uma proposta, um convite, uma ideia nova. Diga sim ao que amplia.", fazer: ["pesquisar uma oportunidade", "sair da rotina", "experimentar algo novo"], evitar: ["compras por impulso", "promessas que não vai cumprir"], cor: "#4FB3C9", palavra: "Oportunidade" },
    6: { tema: "Harmonia", resumo: "Família, lar, responsabilidade, amor.", ano: "Ano do lar e das relações. Casa, família, cuidado, beleza. Prosperidade aqui vem de responsabilidades bem assumidas e laços bem nutridos.", dia: "Dia de cuidar. Da casa, de quem você ama e de você. Resolva pendências familiares e financeiras com carinho e responsabilidade.", fazer: ["cuidar da casa", "resolver uma pendência de família", "um gesto de autocuidado"], evitar: ["sacrifício sem limite", "culpa ao gastar com você"], cor: "#E59AB3", palavra: "Cuidado" },
    7: { tema: "Interiorização", resumo: "Reflexão, estudo, fé.", ano: "Ano de aprofundar. Estudo, espiritualidade, análise. Menos exposição, mais sabedoria. Prepare o terreno para a colheita do próximo ano.", dia: "Dia de recolhimento. Estude, reflita, planeje em silêncio. Respostas chegam na quietude, não na agitação.", fazer: ["estudar algo útil", "meditar ou escrever no diário", "revisar planos"], evitar: ["decisões financeiras grandes", "excesso de gente"], cor: "#9B7BD1", palavra: "Sabedoria" },
    8: { tema: "Colheita", resumo: "Poder, dinheiro, reconhecimento.", ano: "Ano da colheita material. Dinheiro, carreira, reconhecimento e poder pessoal. Negocie, cobre o que vale, assuma a liderança.", dia: "Dia de prosperidade. Cobre, negocie, venda, invista. Sua autoridade está forte: peça o que merece.", fazer: ["negociar ou cobrar", "fechar um acordo", "revisar investimentos"], evitar: ["arrogância", "gastar antes de receber"], cor: "#2F4A8A", palavra: "Colheita" },
    9: { tema: "Encerramento", resumo: "Conclusão, limpeza, gratidão.", ano: "Ano de fechar ciclos. Solte o que não serve: dívidas antigas, hábitos, relações que pesam. Limpe o espaço para o novo começo do ano 1.", dia: "Dia de concluir e soltar. Termine pendências, doe o que não usa, agradeça. Não comece nada grande hoje.", fazer: ["concluir uma tarefa antiga", "doar ou desapegar", "agradecer por escrito"], evitar: ["iniciar projetos", "guardar ressentimento"], cor: "#D9674F", palavra: "Gratidão" }
  };

  // Números dos anjos
  const ANJOS = {
    111: "Portal de manifestação: seus pensamentos estão se materializando rápido. Pense no que quer.",
    222: "Confie no processo: equilíbrio, parcerias e paciência. Tudo está se alinhando.",
    333: "Mestres ascensos por perto: criatividade e expressão. Você está apoiada.",
    444: "Proteção e estrutura: anjos ao redor. Continue construindo.",
    555: "Mudança a caminho: solte o controle e acompanhe o movimento.",
    666: "Reequilibre: menos preocupação material, mais confiança e cuidado.",
    777: "Sorte e alinhamento espiritual: você está no caminho certo.",
    888: "Abundância financeira chegando: colheita do que foi plantado.",
    999: "Fim de ciclo: conclua, agradeça e prepare-se para recomeçar."
  };

  const HORARIOS_ESPELHO = {
    "01:01": ANJOS[111], "11:11": ANJOS[111], "02:02": ANJOS[222], "22:22": ANJOS[222], "03:03": ANJOS[333],
    "04:04": ANJOS[444], "05:05": ANJOS[555], "06:06": ANJOS[666], "07:07": ANJOS[777], "08:08": ANJOS[888], "09:09": ANJOS[999]
  };

  return { TABELA, normalizar, reduzir, letras, expressao, motivacao, impressao, destino, diaNatal, anoUniversal, anoPessoal, mesPessoal, diaPessoal, diaUniversal, primeiroNome, somaBruta, SIGNIFICADOS, CARMICAS, CICLO, ANJOS, HORARIOS_ESPELHO };
})();
