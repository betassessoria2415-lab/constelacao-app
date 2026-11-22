/* Leitura combinada: Destino × Expressão × Motivação, e foco escolhido no início */
window.COMBOS = (function () {
  const base = n => (n === 11 ? 2 : n === 22 ? 4 : n);
  const grupo = n => { const b = base(n); return [1, 5, 7].includes(b) ? "A" : [2, 4, 8].includes(b) ? "B" : "C"; };
  const NOME_GRUPO = { A: "iniciativa e liberdade", B: "estrutura e parceria", C: "expressão e afeto" };

  // chave: grupo do Destino (o caminho) + grupo da Expressão (as ferramentas)
  const MATRIZ = {
    AA: { ajuda: "Seu caminho pede independência e seus talentos são de quem age por conta própria. Você nasceu com a ferramenta certa para a estrada certa.", atrito: "O excesso é o risco: tanta autonomia pode virar isolamento e dificuldade de pedir ajuda.", dinheiro: "Ganhe com projetos seus e renda variável, mas contrate ou combine com alguém a parte de controle. Sozinha, você prospera rápido e organiza devagar." },
    AB: { ajuda: "Seu caminho pede coragem para abrir trilhas, e seus talentos são de organizar e sustentar. Você é a rara pessoa que começa e também termina.", atrito: "Por dentro há um cabo de guerra: uma parte quer arriscar, a outra quer garantia. Quando trava, é esse conflito falando.", dinheiro: "Use a prudência como freio, não como parede: defina um valor máximo de risco e, dentro dele, ouse sem culpa." },
    AC: { ajuda: "Seu caminho pede iniciativa e seus talentos são de comunicar e encantar. Você convence pessoas a irem junto para onde ninguém foi.", atrito: "O entusiasmo começa muita coisa. O desafio é escolher uma e levar até o fim.", dinheiro: "Venda, ensine, divulgue: sua renda cresce quando você aparece. Reserve um dia fixo por semana para o que é chato e necessário." },
    BA: { ajuda: "Seu caminho pede construção e parceria, e seus talentos são de quem age rápido e sozinho. Você traz velocidade para um caminho que costuma ser lento.", atrito: "A vida pede paciência justamente a quem tem pressa. Atalhos saem caros para você.", dinheiro: "Canalize o impulso para dentro de um plano: metas de 90 dias, com liberdade total em como cumpri-las." },
    BB: { ajuda: "Caminho de construir, talentos de construtora. Poucas combinações são tão coerentes: o que você planta com método, fica.", atrito: "A segurança pode virar gaiola. Você tende a adiar o prazer e o risco para um depois que não chega.", dinheiro: "Patrimônio é o seu jogo: reserva, bens, renda estável. Separe um percentual para viver agora, com a mesma disciplina com que poupa." },
    BC: { ajuda: "Seu caminho pede estrutura e seus talentos são de expressão e cuidado. Você dá rosto, voz e calor ao que constrói.", atrito: "O coração promete mais do que a agenda aguenta. Você se compromete com gente demais.", dinheiro: "Transforme carisma em sistema: preço definido, contrato simples, dia de cobrança. Sua simpatia não pode virar desconto eterno." },
    CA: { ajuda: "Seu caminho pede expressão e afeto, e seus talentos são de independência. Você inspira justamente por não seguir a manada.", atrito: "Você precisa de gente e de espaço na mesma medida, e quem convive com você nem sempre entende.", dinheiro: "Monetize sua visão própria: o que você faz de diferente é o produto. Evite sociedades que tirem sua liberdade de criar." },
    CB: { ajuda: "Seu caminho pede expressão e seus talentos são de organização. Você é a criativa que entrega no prazo, o que é raro e valioso.", atrito: "A autocrítica pode calar a sua voz: você revisa tanto que não mostra.", dinheiro: "Você pode cobrar mais do que cobra. Sua confiabilidade é diferencial; coloque isso no preço." },
    CC: { ajuda: "Caminho de expressão, talentos de expressão. Comunicar, cuidar e criar são tão naturais que você nem vê como dom.", atrito: "Falta chão: emoção e generosidade em excesso desorganizam o bolso e a agenda.", dinheiro: "Sua renda está nas pessoas e nas ideias. Tenha uma planilha simples e alguém de confiança para dizer não por você." }
  };
  const MOTIVACAO = {
    A: "Por dentro, o que move você é liberdade: fazer do seu jeito e sentir que escolheu.",
    B: "Por dentro, o que move você é segurança: saber que a base está firme e que as pessoas estão bem.",
    C: "Por dentro, o que move você é conexão: ser vista, amada e útil para alguém."
  };
  // pares marcantes (chave em ordem crescente, valores base)
  const PARES = {
    "1-8": "1 com 8 é a dupla do empreendimento: iniciativa mais gestão. Cuidado só com o tom de comando.",
    "1-2": "1 com 2 une liderança e diplomacia: você decide e ainda traz as pessoas junto.",
    "1-7": "1 com 7 forma a especialista independente: autoridade pelo que sabe.",
    "1-9": "1 com 9 liga o começo e o fim do ciclo: você inicia causas maiores do que você.",
    "2-6": "2 com 6 é a combinação mais acolhedora do mapa. O risco é esquecer de si.",
    "2-8": "2 com 8 negocia como poucas: sensibilidade para ouvir e força para fechar.",
    "2-4": "2 com 4 constrói devagar e para sempre. Paciência é o seu ativo.",
    "3-5": "3 com 5 é pura comunicação em movimento: vendas, redes, viagens.",
    "3-6": "3 com 6 encanta e cuida: talento para atender, ensinar e embelezar.",
    "3-9": "3 com 9 inspira multidões: palavra com propósito.",
    "3-8": "3 com 8 vende qualquer coisa: carisma com ambição. Cuide da palavra dada.",
    "4-8": "4 com 8 é a combinação do patrimônio: trabalho mais visão de negócio.",
    "4-6": "4 com 6 sustenta uma família inteira. Aprenda a dividir o peso.",
    "4-7": "4 com 7 faz a técnica impecável: método e profundidade.",
    "5-7": "5 com 7 busca experiências e sentido: aprende viajando, ensina contando.",
    "5-8": "5 com 8 arrisca e ganha: ótima para vendas e novos mercados, com reserva de segurança.",
    "6-9": "6 com 9 vive para servir. Sua prosperidade pede que você também receba.",
    "6-8": "6 com 8 cuida e provê: negócios de família, beleza, casa e alimentação.",
    "7-9": "7 com 9 é a combinação mais espiritual: sabedoria colocada a serviço.",
    "7-8": "7 com 8 une estratégia e execução: pensa antes, colhe depois."
  };
  const FOCO = {
    dinheiro: { nome: "Dinheiro", icone: "◈", frase: "Você pediu foco em dinheiro: as orientações de prosperidade aparecem primeiro." },
    amor: { nome: "Amor", icone: "♡", frase: "Você pediu foco em amor e relações: elas aparecem primeiro na sua orientação." },
    proposito: { nome: "Propósito", icone: "✶", frase: "Você pediu foco em propósito: seu caminho e seus talentos ficam em destaque." },
    paz: { nome: "Paz", icone: "☾", frase: "Você pediu foco em paz: energia, pausa e cuidado aparecem primeiro." }
  };

  function ler(destino, expressao, motivacao) {
    const gd = grupo(destino), ge = grupo(expressao), gm = grupo(motivacao), m = MATRIZ[gd + ge];
    const a = base(destino), b = base(expressao), par = PARES[[Math.min(a, b), Math.max(a, b)].join("-")];
    const espelho = a === b ? `Destino e Expressão no mesmo número (${a}): você já nasceu sabendo fazer o que veio fazer. O cuidado é não exagerar na dose.` : "";
    const tensao = gm !== gd ? `Seu caminho fala de ${NOME_GRUPO[gd]}, mas seu desejo íntimo fala de ${NOME_GRUPO[gm]}. Quando sente um vazio mesmo com tudo andando, é essa parte pedindo atenção.` : `Seu desejo íntimo e seu caminho apontam para o mesmo lado: ${NOME_GRUPO[gd]}. Isso dá uma motivação rara e constante.`;
    const mestre = [destino, expressao, motivacao].some(n => n === 11 || n === 22) ? "Há um número mestre no seu mapa: a régua é mais alta e a cobrança interna também. Descanso faz parte do plano." : "";
    return { titulo: gd === ge ? `${NOME_GRUPO[gd].split(" e ")[0]} em dose dupla` : `${NOME_GRUPO[gd].split(" e ")[0]} com ${NOME_GRUPO[ge].split(" e ")[0]}`, ajuda: m.ajuda, atrito: m.atrito, dinheiro: m.dinheiro, motivacao: MOTIVACAO[gm], tensao, par: par || "", espelho, mestre,
      resumo: [m.ajuda.split(". ")[0] + ".", MOTIVACAO[gm], m.dinheiro.split(". ")[0] + "."] };
  }
  return { ler, FOCO, grupo };
})();
