/* Orientação diária combinatória (dia pessoal × lua × dia da semana × destino) e cartas do dia */
window.DIARIO = (function () {
  // base por dia pessoal (1 a 9)
  const BASE = {
    dinheiro: {
      1: "Bom dia para dar início a algo que traga renda ou organize a que já existe.",
      2: "O dinheiro de hoje passa por outra pessoa: um acordo, uma indicação, uma conversa franca.",
      3: "Mostrar o que você faz vale mais do que guardar para si. Divulgue, ofereça, conte.",
      4: "Dia de conta feita no papel. Conferir, anotar e ajustar rende mais do que qualquer aposta.",
      5: "Fique atenta a uma oportunidade fora do roteiro, mas espere a empolgação baixar antes de gastar.",
      6: "As decisões de dinheiro de hoje envolvem a casa e quem depende de você. Decida com carinho e com limite.",
      7: "Hoje é dia de estudar e planejar, não de fechar negócio grande. Informação é o seu investimento.",
      8: "Dia forte para cobrar, negociar e pedir o que é justo. Sua palavra pesa mais hoje.",
      9: "Feche pendências: uma conta esquecida, uma assinatura que não usa, uma dívida a renegociar."
    },
    amor: {
      1: "Tome a iniciativa: diga o que quer sem esperar que adivinhem.",
      2: "Escutar vale mais do que ter razão. Um gesto pequeno de parceria muda o clima.",
      3: "Leveza aproxima. Uma conversa boa, uma risada, um elogio dito em voz alta.",
      4: "Amor hoje é presença prática: cumprir o combinado, resolver junto, estar.",
      5: "Quebre a rotina com alguém querido. Um convite inesperado faz bem aos dois lados.",
      6: "Dia do afeto em casa. Cuide, mas também se deixe cuidar.",
      7: "Um pouco de silêncio faz bem. Estar só por uma hora não é se afastar de ninguém.",
      8: "Fale de limites e de respeito com firmeza tranquila. Quem ama também negocia.",
      9: "Perdoar hoje é mais leve do que carregar. Solte uma mágoa antiga."
    },
    energia: {
      1: "Energia de arranque: comece pelo que dá mais medo, logo cedo.",
      2: "Energia suave. Vá no seu ritmo e não se compare.",
      3: "Energia criativa e falante. Movimente o corpo e coloque ideias para fora.",
      4: "Energia constante: uma tarefa de cada vez, até o fim.",
      5: "Energia inquieta. Mude de ambiente, caminhe, respire fundo antes de responder.",
      6: "Energia de ninho. Arrumar um canto da casa organiza a cabeça.",
      7: "Energia recolhida. Menos tela, mais caderno.",
      8: "Energia de comando. Use para decidir, não para se cobrar demais.",
      9: "Energia de fim de ciclo. Termine, agradeça e descanse cedo."
    }
  };

  // variações 2 e 3 da base: o mesmo dia pessoal volta a cada 9 dias com outro texto
  const BASE_B = {
    dinheiro: {
      1: "Hoje vale propor: um orçamento, uma ideia, um preço novo. Quem dá o primeiro passo define o jogo.",
      2: "Peça uma opinião de confiança antes de decidir sobre dinheiro. Duas cabeças enxergam o que uma não vê.",
      3: "Conte o que você faz para três pessoas hoje. Renda nova costuma nascer de conversa, não de anúncio.",
      4: "Escolha uma conta, um boleto ou um extrato e resolva por inteiro. Um item fechado vale mais que cinco abertos.",
      5: "Teste algo pequeno e novo: um produto, um horário, um canal de venda. Hoje o diferente rende.",
      6: "Veja se alguma despesa da casa pode ser renegociada. Cuidar do lar também é cuidar da margem.",
      7: "Leia, assista ou pergunte sobre um assunto de dinheiro que você evita. Entender tira o medo.",
      8: "Reveja o preço do seu trabalho. Hoje você enxerga seu valor com mais clareza do que de costume.",
      9: "Doe, devolva ou venda algo parado. Dinheiro e espaço circulam juntos."
    },
    amor: {
      1: "Proponha você o encontro, a conversa, o passeio. Esperar o outro adivinhar cansa os dois.",
      2: "Pergunte como o outro está e escute até o fim. Hoje, presença vale mais do que conselho.",
      3: "Mande uma mensagem leve para alguém de quem sente falta. Reconectar pode ser simples.",
      4: "Combine uma divisão de tarefas ou de contas que esteja pesando. Clareza também é carinho.",
      5: "Faça com alguém algo que vocês nunca fizeram. Novidade reacende.",
      6: "Um gesto pequeno em casa: uma comida, um bilhete, um abraço demorado.",
      7: "Diga a quem convive com você que precisa de um tempo quieta. Avisar evita mal-entendido.",
      8: "Não leve a pressão do trabalho para dentro de casa. Deixe o comando na porta.",
      9: "Agradeça a alguém por algo antigo que nunca agradeceu direito."
    },
    energia: {
      1: "Acorde e faça uma coisa só para você antes de atender os outros.",
      2: "Dia para andar mais devagar. Cada pausa hoje rende foco depois.",
      3: "Música, conversa e riso recarregam você hoje. Use sem culpa.",
      4: "Monte uma lista curta, de três itens, e só três. Feito é melhor que perfeito.",
      5: "Seu corpo pede movimento: caminhe, dance, suba escada. A cabeça destrava junto.",
      6: "Coloque algo bonito à vista: flores, uma toalha limpa, a cama arrumada.",
      7: "Fique um tempo longe do celular. O silêncio de hoje traz uma resposta.",
      8: "Use o pique para a tarefa mais difícil do dia e pare na hora certa.",
      9: "Desacelere e solte o que não coube hoje. Amanhã começa outro ciclo."
    }
  };
  const BASE_C = {
    dinheiro: {
      1: "Defina uma meta financeira para os próximos nove dias, pequena e clara. Escreva o valor.",
      2: "Paciência hoje é estratégia: não feche nada com pressa. O acordo certo amadurece.",
      3: "Sua simpatia abre portas de venda e de indicação. Peça, com leveza, uma recomendação.",
      4: "Guarde hoje um valor, mesmo simbólico. O hábito vale mais do que a quantia.",
      5: "Reveja assinaturas e gastos automáticos: algo ali não faz mais sentido para você.",
      6: "Converse sobre dinheiro com quem divide a vida com você. Combinado claro evita mágoa.",
      7: "Faça a conta completa de um sonho: quanto custa, em quanto tempo, quanto por mês.",
      8: "Dia de cobrar o que devem a você, com educação e firmeza.",
      9: "Feche a semana financeira: o que entrou, o que saiu, o que aprendeu."
    },
    amor: {
      1: "Seja honesta sobre o que quer de uma relação. Clareza afasta o que não serve e aproxima o que serve.",
      2: "Um pedido de desculpas ou um primeiro passo de paz cai muito bem hoje.",
      3: "Elogie em voz alta. O que é dito com alegria volta em dobro.",
      4: "Mostre amor resolvendo algo prático para alguém.",
      5: "Dê liberdade a quem você ama, e peça a sua também.",
      6: "Reúna quem importa em volta de uma mesa, nem que seja para um café.",
      7: "Observe mais do que fala: hoje você percebe o que as pessoas não dizem.",
      8: "Generosidade sem controle: ajude sem dizer como o outro deve fazer.",
      9: "Deixe uma expectativa ir embora. Relação leve dura mais."
    },
    energia: {
      1: "Coragem em alta. Aproveite para dizer aquele sim ou aquele não.",
      2: "Sensibilidade em alta. Escolha bem os ambientes e as conversas.",
      3: "Ideias em alta. Anote tudo; depois você filtra.",
      4: "Resistência em alta. Bom dia para tarefas longas e repetitivas.",
      5: "Curiosidade em alta. Aprenda uma coisa nova, por menor que seja.",
      6: "Afeto em alta. Ligue para alguém que faz bem a você.",
      7: "Intuição em alta. Preste atenção ao primeiro pensamento do dia.",
      8: "Determinação em alta. Termine o que começou.",
      9: "Compaixão em alta. Seja gentil com você pelos tropeços do ciclo."
    }
  };

  // tempero por fase da lua (0 nova … 7 minguante côncava)
  const LUA = {
    dinheiro: [
      "Com a Lua Nova, escreva um valor e uma data: pedido claro é o primeiro passo.",
      "A lua começa a crescer: um passo pequeno hoje vale mais do que um plano perfeito.",
      "No Quarto Crescente aparece um obstáculo de teste. Não desista na primeira conta que aperta.",
      "A lua quase cheia pede ajuste fino: reveja preços, prazos e combinados.",
      "Com a Lua Cheia, olhe o que já entrou e agradeça antes de querer mais.",
      "A lua começa a minguar: compartilhe o que aprendeu ou retribua uma ajuda.",
      "No Quarto Minguante, corte um gasto que não faz mais sentido.",
      "Fim de ciclo lunar: descanse das contas hoje e só observe."
    ],
    amor: [
      "A Lua Nova favorece recomeços: uma conversa pode zerar um mal-entendido.",
      "A lua crescente pede constância: carinho pequeno e repetido.",
      "No Quarto Crescente, um atrito mostra o que precisa ser dito. Diga com calma.",
      "A lua quase cheia amplia tudo: escolha ampliar o que é bom.",
      "Lua Cheia deixa as emoções à flor da pele. Respire antes de responder.",
      "A lua minguante favorece gratidão: agradeça a alguém pelo que fez por você.",
      "No Quarto Minguante, solte uma cobrança antiga.",
      "Lua escura pede colo e silêncio, não grandes conversas."
    ],
    energia: [
      "Lua Nova: energia baixa por fora, fértil por dentro. Plante intenções.",
      "A energia começa a subir. Aproveite as manhãs.",
      "Quarto Crescente: força de decisão em alta.",
      "Lua quase cheia: muita energia, pouco sono. Desacelere à noite.",
      "Lua Cheia: pico de energia e de emoção. Canalize para celebrar.",
      "A energia começa a baixar. Termine o que está aberto.",
      "Quarto Minguante: bom dia para limpar, doar e arrumar.",
      "Reserva de energia no mínimo. Descanso hoje é produtividade."
    ]
  };
  // orientação para quem escolheu Propósito como foco: três variações por dia pessoal, mais a Lua
  const PROPOSITO = [{
    1: "Dia de começar pelo que tem sentido para você, mesmo pequeno. Dê o primeiro passo de algo que é seu.",
    2: "Seu propósito hoje aparece no jeito de escutar. Pergunte a alguém do que ela precisa e ouça até o fim.",
    3: "Mostre algo que você faz bem. Propósito guardado na gaveta não encontra quem precisa dele.",
    4: "Propósito também é rotina. Escolha uma tarefa chata que sustenta o que você quer e termine.",
    5: "Experimente um caminho novo para a mesma direção. Mudar o jeito não é desistir do rumo.",
    6: "Hoje o sentido está em cuidar. Faça por alguém o que você gostaria que fizessem por você.",
    7: "Dia de pergunta, não de resposta. Reserve dez minutos em silêncio para o que anda pedindo atenção.",
    8: "Assuma uma decisão que você vem adiando. Direção se confirma quando alguém se compromete.",
    9: "Encerre algo que já cumpriu o papel. Abrir espaço também faz parte do caminho."
  }, {
    1: "Escreva em uma linha o que você quer construir neste ano. Uma linha basta para hoje.",
    2: "Procure quem caminha na mesma direção. Uma conversa hoje vale mais do que um plano sozinha.",
    3: "Conte para alguém o que você sonha fazer. Dizer em voz alta deixa o sonho mais nítido.",
    4: "Organize o lugar onde você trabalha no que importa. Ordem por fora ajuda a ver por dentro.",
    5: "Diga sim a um convite diferente. Às vezes a direção aparece fora do roteiro.",
    6: "Pergunte a quem você ama o que ela vê de melhor em você. Anote a resposta.",
    7: "Leia uma página de algo que alimenta você. Estudo também é prática de propósito.",
    8: "Coloque valor no que você faz bem. Cobrar com justiça é respeitar o seu dom.",
    9: "Olhe para trás e reconheça um caminho que você já percorreu. Ele mostra do que você é capaz."
  }, {
    1: "Faça hoje uma coisa só porque ela tem a sua cara. Sem pedir licença.",
    2: "Ajude sem aparecer. Propósito não precisa de plateia para valer.",
    3: "Crie algo com as mãos ou com as palavras. O que você expressa mostra quem você é.",
    4: "Cumpra o combinado de hoje com você mesma. Confiança em si se constrói em dia comum.",
    5: "Repare no que despertou a sua curiosidade nesta semana. Ali tem uma pista.",
    6: "Arrume um espaço da casa para a sua prática. Um canto seu lembra o que importa.",
    7: "Desligue uma tela e escute o que você pensa de verdade sobre a sua vida.",
    8: "Dê um passo concreto na direção do que você quer: um orçamento, um contato, um prazo.",
    9: "Agradeça a alguém que ajudou você a chegar até aqui. Gratidão também aponta direção."
  }];
  const LUA_PROPOSITO = [
    "Lua Nova: escreva uma intenção de direção para este ciclo.",
    "A Lua cresce: dê o primeiro passo visível.",
    "Quarto Crescente: escolha entre duas opções e siga.",
    "Lua quase cheia: ajuste o que está quase pronto.",
    "Lua Cheia: reconheça o que já floresceu no seu caminho.",
    "A Lua começa a minguar: compartilhe o que você aprendeu.",
    "Quarto Minguante: solte um compromisso que não tem mais a ver com você.",
    "Lua escura: descanse. Clareza de direção nasce do silêncio."
  ];
  // regente planetário do dia da semana (tradição caldeia)
  const SEMANA = [
    { planeta: "Sol", simbolo: "☉", frase: "Domingo é do Sol: dia de brilho, descanso digno e planos para a semana." },
    { planeta: "Lua", simbolo: "☽", frase: "Segunda é da Lua: acolha suas emoções e cuide da casa antes de cuidar do mundo." },
    { planeta: "Marte", simbolo: "♂", frase: "Terça é de Marte: coragem para resolver o que você vem empurrando." },
    { planeta: "Mercúrio", simbolo: "☿", frase: "Quarta é de Mercúrio: conversas, mensagens, vendas e contas fluem melhor." },
    { planeta: "Júpiter", simbolo: "♃", frase: "Quinta é de Júpiter, o planeta da abundância: o melhor dia da semana para pedidos de prosperidade." },
    { planeta: "Vênus", simbolo: "♀", frase: "Sexta é de Vênus: amor, beleza e prazer. Você merece algo bonito hoje." },
    { planeta: "Saturno", simbolo: "♄", frase: "Sábado é de Saturno: organize, conclua e dê estrutura ao que quer ver crescer." }
  ];
  // toque pessoal por número de destino
  const TOQUE = {
    1: "Para o seu destino 1: confie no seu impulso de começar, mas avise quem caminha com você.",
    2: "Para o seu destino 2: sua intuição sobre pessoas está certa. Ouça-a antes de dizer sim.",
    3: "Para o seu destino 3: sua palavra é sua moeda hoje. Use-a para abrir portas, não para se dispersar.",
    4: "Para o seu destino 4: seu método é seu superpoder. Só não deixe a rigidez travar o novo.",
    5: "Para o seu destino 5: mudança é seu elemento, e terminar o que começou é o desafio de hoje.",
    6: "Para o seu destino 6: cuidar de todos é bonito, mas hoje a primeira da lista é você.",
    7: "Para o seu destino 7: confie no que você estudou e sentiu. Você já sabe mais do que acha.",
    8: "Para o seu destino 8: seu poder de realizar está aceso. Lidere com justiça.",
    9: "Para o seu destino 9: sua generosidade volta multiplicada quando você também aprende a receber.",
    11: "Para o seu destino 11: sua sensibilidade capta o que ninguém disse. Anote os insights do dia.",
    22: "Para o seu destino 22: pense grande e dê hoje um passo pequeno e concreto nessa direção."
  };
  const ESPELHOS = ["07:07", "08:08", "09:09", "10:10", "11:11", "12:12", "13:13", "14:14", "15:15", "16:16", "17:17", "18:18", "19:19", "20:20", "21:21", "22:22"];

  // 22 cartas: letras hebraicas e arcanos maiores (correspondência Golden Dawn)
  const CARTAS = [
    { letra: "א", nome: "Aleph", arcano: "O Louco", msg: "Um começo pede leveza. Você não precisa ver o caminho inteiro para dar o primeiro passo.", gesto: "Faça hoje algo pela primeira vez, por menor que seja." },
    { letra: "ב", nome: "Beth", arcano: "O Mago", msg: "Você já tem as ferramentas na mesa. O que falta é usá-las com intenção.", gesto: "Liste três recursos que você tem e não está usando." },
    { letra: "ג", nome: "Gimel", arcano: "A Sacerdotisa", msg: "A resposta que você procura fora já sussurra por dentro. Faça silêncio para ouvir.", gesto: "Cinco minutos sem tela antes de decidir algo." },
    { letra: "ד", nome: "Daleth", arcano: "A Imperatriz", msg: "A porta da fartura se abre pelo cuidado. O que você nutre, cresce.", gesto: "Cuide de algo vivo: uma planta, o corpo, uma relação." },
    { letra: "ה", nome: "Heh", arcano: "O Imperador", msg: "Estrutura não é prisão; é o que sustenta o sonho de pé.", gesto: "Defina um limite claro: de horário, de gasto ou de disponibilidade." },
    { letra: "ו", nome: "Vav", arcano: "O Hierofante", msg: "Alguém já passou pelo que você está vivendo. Procure quem possa ensinar.", gesto: "Peça um conselho a quem você admira." },
    { letra: "ז", nome: "Zayin", arcano: "Os Enamorados", msg: "Toda escolha feita com o coração inteiro abre caminho. Meio sim é não.", gesto: "Decida uma coisa que está em cima do muro." },
    { letra: "ח", nome: "Cheth", arcano: "O Carro", msg: "Você avança quando segura as rédeas da emoção sem sufocá-la.", gesto: "Dê um passo concreto em direção a uma meta, hoje." },
    { letra: "ט", nome: "Teth", arcano: "A Força", msg: "Sua força não é dureza. É a calma de quem não precisa gritar.", gesto: "Responda com gentileza a algo que irritaria você." },
    { letra: "י", nome: "Yod", arcano: "O Eremita", msg: "Há uma luz que só acende quando você fica consigo. Recolher-se também é caminhar.", gesto: "Reserve um momento sozinha, com o caderno." },
    { letra: "כ", nome: "Kaph", arcano: "A Roda da Fortuna", msg: "A roda gira. O que hoje parece parado já está se movendo por baixo.", gesto: "Agradeça por uma virada que já aconteceu na sua vida." },
    { letra: "ל", nome: "Lamed", arcano: "A Justiça", msg: "O que é seu por direito chega quando você também faz a sua parte com retidão.", gesto: "Acerte uma conta, um combinado ou um pedido de desculpas." },
    { letra: "מ", nome: "Mem", arcano: "O Enforcado", msg: "Olhar de outro ângulo muda tudo. A pausa não é perda de tempo.", gesto: "Antes de reagir, pergunte: de que outro jeito posso ver isto?" },
    { letra: "נ", nome: "Nun", arcano: "A Transformação", msg: "Algo termina para abrir espaço. Fim de ciclo é adubo, não castigo.", gesto: "Desapegue de um objeto, hábito ou gasto que já cumpriu o papel." },
    { letra: "ס", nome: "Samekh", arcano: "A Temperança", msg: "Nem tudo, nem nada: o caminho do meio sustenta por mais tempo.", gesto: "Equilibre hoje algo em excesso: trabalho, tela, açúcar ou preocupação." },
    { letra: "ע", nome: "Ayin", arcano: "A Sombra", msg: "Olhar para o que prende você é o começo de se soltar. Sem culpa, com verdade.", gesto: "Nomeie um hábito que rouba sua energia ou seu dinheiro." },
    { letra: "פ", nome: "Peh", arcano: "A Torre", msg: "O que cai não era alicerce. Depois do susto, você constrói mais firme.", gesto: "Diga uma verdade que você vem adiando, com respeito." },
    { letra: "צ", nome: "Tzaddi", arcano: "A Estrela", msg: "Esperança não é ingenuidade: é a coragem de continuar regando.", gesto: "Escreva um desejo e leia em voz alta, olhando para o céu." },
    { letra: "ק", nome: "Qoph", arcano: "A Lua", msg: "Nem tudo está claro agora, e tudo bem. Caminhe devagar e confie nos seus sentidos.", gesto: "Anote um sonho ou uma intuição ao acordar." },
    { letra: "ר", nome: "Resh", arcano: "O Sol", msg: "Hoje há luz sobre você. Permita-se ser vista e celebrar o que conquistou.", gesto: "Conte uma conquista sua a alguém, sem diminuir." },
    { letra: "ש", nome: "Shin", arcano: "O Despertar", msg: "Um chamado antigo volta a tocar. Você já está pronta para atender.", gesto: "Retome algo que você abandonou e ainda faz seu coração bater." },
    { letra: "ת", nome: "Tav", arcano: "O Mundo", msg: "Um ciclo se completa. Reconheça o caminho inteiro antes de começar o próximo.", gesto: "Termine uma tarefa pendente e risque da lista com gosto." }
  ];

  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  function orientacao({ diaPessoal, destino, faseIdx, data }) {
    const sem = SEMANA[data.getDay()];
    const poder = ((diaPessoal + destino + data.getDate()) % 9) + 1;
    const hora = ESPELHOS[(diaPessoal * 3 + destino + data.getDay()) % ESPELHOS.length];
    const doAno = Math.floor((data - new Date(data.getFullYear(), 0, 0)) / 86400000), B = [BASE, BASE_B, BASE_C][Math.floor(doAno / 9) % 3];
    return {
      dinheiro: B.dinheiro[diaPessoal] + " " + LUA.dinheiro[faseIdx],
      amor: B.amor[diaPessoal] + " " + LUA.amor[faseIdx],
      energia: B.energia[diaPessoal] + " " + LUA.energia[faseIdx],
      proposito: PROPOSITO[Math.floor(doAno / 9) % 3][diaPessoal] + " " + LUA_PROPOSITO[faseIdx],
      semana: sem, toque: TOQUE[destino] || TOQUE[1], numeroPoder: poder, horaPoder: hora
    };
  }

  // carta determinística por pessoa e por dia, sem repetir a de ontem
  function cartaDoDia(nome, data) {
    const k = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const idx = d => hash(nome.toLowerCase() + "|" + k(d)) % CARTAS.length;
    const ontem = new Date(data); ontem.setDate(ontem.getDate() - 1);
    let i = idx(data); if (i === idx(ontem)) i = (i + 1) % CARTAS.length;
    return Object.assign({ n: i + 1 }, CARTAS[i]);
  }

  // área da orientação que corresponde ao foco escolhido no perfil
  const AREAS = [["dinheiro", "◈", "Dinheiro"], ["amor", "♡", "Amor e relações"], ["energia", "ϟ", "Energia"], ["proposito", "✧", "Propósito"]];
  const areaDoFoco = foco => ({ dinheiro: "dinheiro", amor: "amor", paz: "energia", proposito: "proposito" }[foco] || "dinheiro");
  return { orientacao, cartaDoDia, CARTAS, SEMANA, AREAS, areaDoFoco };
})();
