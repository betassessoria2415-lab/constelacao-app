/* Previsão do ano pessoal: abertura, áreas e trimestres */
window.PREVISAO = (function () {
  const ANO = {
    1: { titulo: "O ano da semente", abertura: "Começa um ciclo novo de nove anos. O que você decidir e iniciar agora dá o tom de tudo o que vem depois. É ano de coragem, não de espera.",
      dinheiro: "Abra frentes: uma nova fonte de renda, um negócio, uma mudança de área. O retorno ainda é pequeno, mas a direção importa mais do que o valor.",
      amor: "Você está mais voltada para si, e está certo. Relações que respeitam sua autonomia crescem; as que dependem de você se anular, pesam.",
      atencao: "Impaciência e solidão. Não é para fazer tudo sozinha: é para decidir por si.",
      trimestres: ["Jan a mar: definir o que você quer e dar o primeiro passo.", "Abr a jun: testar, errar rápido, ajustar.", "Jul a set: firmar o que deu sinal de vida.", "Out a dez: assumir publicamente o novo caminho."] },
    2: { titulo: "O ano do cultivo", abertura: "A semente está debaixo da terra. Parece que nada acontece, mas é o ano em que as raízes se formam. Paciência e parcerias são a força.",
      dinheiro: "Acordos, sociedades, indicações. Evite decisões grandes sozinha e apressadas; o dinheiro deste ano vem por meio de outras pessoas.",
      amor: "Ano forte para vínculos: aproximações, reconciliações, compromissos. Sensibilidade em alta, então fale antes de guardar.",
      atencao: "Ansiedade pela demora e dependência emocional. Esperar não é parar.",
      trimestres: ["Jan a mar: desacelerar e escolher com quem caminhar.", "Abr a jun: construir confiança e combinar papéis.", "Jul a set: cuidar dos detalhes e das emoções.", "Out a dez: primeiros brotos aparecem; agradeça."] },
    3: { titulo: "O ano da expressão", abertura: "O que estava germinando aparece. Ano leve, social e criativo: sua voz, sua imagem e suas ideias pedem palco.",
      dinheiro: "Divulgar, vender, ensinar, criar. A renda cresce na medida em que você se mostra. Cuidado com gastos de empolgação.",
      amor: "Fase de alegria, encontros e leveza. Bom para sair, conhecer gente e reacender o que estava morno.",
      atencao: "Dispersão: muita coisa começada, pouca terminada. Escolha três prioridades para o ano.",
      trimestres: ["Jan a mar: soltar a voz e mostrar o que faz.", "Abr a jun: ampliar contatos e parcerias criativas.", "Jul a set: escolher o que dá fruto e cortar o resto.", "Out a dez: celebrar e organizar para o ano de trabalho."] },
    4: { titulo: "O ano da construção", abertura: "Hora de arregaçar as mangas. É o ano de dar estrutura ao que você criou: rotina, contas em ordem, bases firmes. Lento, e por isso duradouro.",
      dinheiro: "Planilha, reserva, quitação de dívidas, regularização. O que você organizar agora sustenta os próximos cinco anos.",
      amor: "Amor de presença prática: cumprir combinados, dividir tarefas, construir junto. Menos fogos, mais chão.",
      atencao: "Rigidez e cansaço. Trabalho sem descanso vira adoecimento; coloque pausas na agenda.",
      trimestres: ["Jan a mar: diagnóstico honesto das contas e da rotina.", "Abr a jun: criar sistemas e hábitos simples.", "Jul a set: persistir quando parecer que não rende.", "Out a dez: conferir a base e preparar a mudança."] },
    5: { titulo: "O ano da mudança", abertura: "O vento vira. Mudanças de trabalho, casa, cidade ou de jeito de viver aparecem. É o meio do ciclo: o que não serve mais, sai.",
      dinheiro: "Oportunidades inesperadas e novas fontes de renda. Diga sim ao que amplia, com reserva de segurança e sem dívida por impulso.",
      amor: "Mais liberdade e novidade. Relações engessadas pedem renovação; as novas chegam de onde você não esperava.",
      atencao: "Impulsividade e excessos. Mudar por tédio é diferente de mudar por crescimento.",
      trimestres: ["Jan a mar: abrir espaço e soltar o que prende.", "Abr a jun: experimentar caminhos novos.", "Jul a set: a mudança principal acontece.", "Out a dez: assentar a poeira e escolher onde ficar."] },
    6: { titulo: "O ano do lar", abertura: "Depois do movimento, o ninho. Família, casa, compromissos afetivos e responsabilidades ocupam o centro. É ano de cuidar e de ser cuidada.",
      dinheiro: "Gastos e ganhos ligados a casa e família: reforma, mudança, filhos, negócios de cuidado e beleza. Assuma só o que cabe.",
      amor: "Um dos melhores anos para compromisso: casamento, reconciliação, chegada de alguém. Também pede resolver pendências familiares.",
      atencao: "Sobrecarga e culpa. Ajudar todo mundo não pode significar abandonar você.",
      trimestres: ["Jan a mar: ajustar a casa e as relações.", "Abr a jun: assumir compromissos importantes.", "Jul a set: cuidar de quem precisa, com limite.", "Out a dez: harmonia e celebração em família."] },
    7: { titulo: "O ano do mergulho", abertura: "A vida pede silêncio. Ano de estudo, análise e espiritualidade. Por fora parece parado; por dentro, é o mais transformador do ciclo.",
      dinheiro: "Não é ano de expansão agressiva. Estude, especialize-se, planeje e arrume a casa financeira para a colheita do ano seguinte.",
      amor: "Mais necessidade de espaço. Bom para aprofundar vínculos verdadeiros; difícil para relações de superfície.",
      atencao: "Isolamento e pessimismo. Recolher-se é diferente de se fechar.",
      trimestres: ["Jan a mar: desacelerar e ouvir a si mesma.", "Abr a jun: estudar e se aperfeiçoar.", "Jul a set: rever crenças e planos.", "Out a dez: clareza chega; prepare a colheita."] },
    8: { titulo: "O ano da colheita", abertura: "Chegou a hora do resultado. Ano de poder pessoal, dinheiro, carreira e reconhecimento. O que foi plantado e organizado, agora rende.",
      dinheiro: "Negocie, cobre, peça aumento, feche contratos, invista. É o ano mais forte do ciclo para finanças. Ética e gestão acima de tudo.",
      amor: "Relações pedem equilíbrio de poder. Cuidado para o trabalho não ocupar todo o espaço.",
      atencao: "Dureza e excesso de controle. Colher bem inclui repartir.",
      trimestres: ["Jan a mar: assumir seu valor e definir metas altas.", "Abr a jun: negociar e fechar acordos.", "Jul a set: pico de resultados.", "Out a dez: consolidar ganhos e começar a soltar."] },
    9: { titulo: "O ano do encerramento", abertura: "O ciclo de nove anos se fecha. Ano de concluir, perdoar, doar e limpar. O espaço que você abrir agora será ocupado pelo novo começo.",
      dinheiro: "Quite, renegocie, venda o que não usa, encerre o que dá prejuízo. Evite começar grandes compromissos financeiros.",
      amor: "Relações que já terminaram por dentro, terminam por fora. As verdadeiras se renovam pelo perdão.",
      atencao: "Apego e nostalgia. Segurar o que acabou só atrasa o recomeço.",
      trimestres: ["Jan a mar: fazer o balanço dos últimos nove anos.", "Abr a jun: concluir pendências.", "Jul a set: desapegar e perdoar.", "Out a dez: descansar e sonhar o próximo ciclo."] }
  };
  // carta do ano (tarô): dia + mês + ano corrente, reduzido até 22
  function cartaDoAno(d, m, ano) {
    let n = d + m + String(ano).split("").reduce((a, x) => a + Number(x), 0);
    while (n > 22) n = String(n).split("").reduce((a, x) => a + Number(x), 0);
    return n; // 1 a 22
  }
  return { ANO, cartaDoAno };
})();
