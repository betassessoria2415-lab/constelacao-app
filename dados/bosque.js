/* Bosque Encantado: conteúdo das descobertas e as regras puras (sem tela) que escolhem a prática do dia.
   Práticas espirituais e simbólicas. Nenhuma promete resultado; todas ligam intenção, visualização e um gesto possível. */
window.BOSQUE_DADOS = (function () {
  "use strict";

  /* Flor do Dia: sete práticas por foco. A do dia sai do calendário local, igual o dia inteiro. */
  const FLOR = {
    dinheiro: [
      { tema: "Receber", texto: "Hoje, cultive a disposição de receber. Feche os olhos e veja uma situação concreta em que o seu trabalho é reconhecido: quem está lá, o que a pessoa diz, como você agradece.", gesto: "Escolha hoje um gesto que abra espaço a essa intenção: apresentar uma proposta, organizar uma oferta ou retomar um contato." },
      { tema: "Valor", texto: "O que você oferece tem valor antes de ter preço. Imagine alguém usando o que você faz e ficando melhor por causa disso. Fique nessa cena até sentir que ela é possível.", gesto: "Diga hoje, em voz alta ou por escrito, quanto vale uma coisa que você faz." },
      { tema: "Fluxo", texto: "Na tradição da lei da atração, o que circula volta. Veja o dinheiro como uma corrente dourada que passa pelas suas mãos e segue adiante, sem aperto e sem medo.", gesto: "Faça uma coisa circular hoje: pague algo com gratidão, devolva um favor ou indique o trabalho de alguém." },
      { tema: "Ordem", texto: "A prosperidade gosta de casa arrumada. Visualize o seu dinheiro em um lugar claro, onde você sabe o que entra e o que sai, e sinta o alívio de enxergar.", gesto: "Anote hoje três números: quanto entrou, quanto saiu e quanto você quer guardar neste mês." },
      { tema: "Merecimento", texto: "Repare se alguma voz interna diz que não é para você. Agora imagine a mesma cena de abundância acontecendo com alguém que você ama. Deixe esse mesmo carinho chegar em você.", gesto: "Aceite hoje, sem se desculpar, um elogio, uma ajuda ou um pagamento." },
      { tema: "Semente", texto: "Toda colheita começou pequena. Veja a sua intenção como uma semente já plantada neste bosque: ela não precisa de pressa, precisa de cuidado repetido.", gesto: "Separe hoje um valor simbólico, por menor que seja, e dê a ele um destino com nome." },
      { tema: "Gratidão", texto: "A gratidão é a frequência de quem já tem. Lembre três coisas que o dinheiro que passou por você tornou possíveis, e veja cada uma delas com detalhe.", gesto: "Agradeça hoje a uma pessoa que já pagou, comprou ou confiou no seu trabalho." }
    ],
    amor: [
      { tema: "Presença", texto: "O amor acontece onde a atenção está. Visualize uma conversa de hoje em que você escuta de verdade, sem preparar a resposta, e veja o rosto da outra pessoa relaxar.", gesto: "Em um encontro de hoje, guarde o celular e ofereça cinco minutos de atenção inteira." },
      { tema: "Ternura", texto: "Imagine uma luz morna no centro do peito. A cada respiração ela cresce um pouco e alcança quem você quer bem, começando por você.", gesto: "Diga hoje uma coisa gentil que você costuma só pensar." },
      { tema: "Abertura", texto: "O que você deseja viver com alguém precisa de espaço para chegar. Veja uma cena simples de afeto que você gostaria de viver e repare no que, em você, abre a porta para ela.", gesto: "Faça hoje um convite pequeno: um café, uma mensagem ou uma caminhada." },
      { tema: "Verdade", texto: "Relação nenhuma floresce no que fica escondido. Visualize você dizendo, com calma, uma coisa que importa, e sendo recebida com respeito.", gesto: "Diga hoje, com cuidado, uma necessidade sua a alguém de confiança." },
      { tema: "Cuidado de si", texto: "Na lei da atração, a gente recebe o tratamento que acredita merecer. Imagine você se tratando hoje como trata quem ama: com paciência, com alimento, com descanso.", gesto: "Reserve hoje vinte minutos só seus e trate esse tempo como compromisso." },
      { tema: "Perdão", texto: "Guardar mágoa ocupa o lugar do que quer chegar. Veja um peso pequeno saindo das suas mãos e virando folha no chão do bosque. Não precisa esquecer: só soltar um pouco.", gesto: "Escreva hoje uma frase de perdão, para alguém ou para você. Não é preciso enviar." },
      { tema: "Gratidão", texto: "Lembre um gesto de afeto que você recebeu e que ainda aquece. Reviva a cena: o lugar, a voz, o que você sentiu.", gesto: "Agradeça hoje a alguém por uma coisa específica que essa pessoa fez por você." }
    ],
    paz: [
      { tema: "Raiz", texto: "Sinta os pés no chão como raízes deste bosque. A cada expiração, imagine o excesso do dia descendo pela terra, que sabe o que fazer com ele.", gesto: "Faça hoje uma pausa de três respirações antes de responder a algo que incomoda." },
      { tema: "Silêncio", texto: "A paz já existe por baixo do barulho. Visualize um lago parado dentro do peito: os pensamentos passam por cima como folhas e não mexem no fundo.", gesto: "Fique hoje cinco minutos sem tela e sem som, só percebendo o lugar onde você está." },
      { tema: "Limite", texto: "Proteger a sua energia também é prática espiritual. Imagine um círculo de luz dourada ao seu redor: entra o que nutre, fica do lado de fora o que drena.", gesto: "Diga hoje um não gentil a uma coisa que você faria só por obrigação." },
      { tema: "Entrega", texto: "Nem tudo depende da sua força. Veja a preocupação maior de hoje pousada em uma pedra do bosque, aos cuidados de algo maior, enquanto você descansa.", gesto: "Escolha uma coisa que não está no seu controle e decida, por hoje, não voltar a ela." },
      { tema: "Ritmo", texto: "A natureza não se apressa e tudo se cumpre. Imagine o seu dia no compasso de uma caminhada lenta, cada tarefa com começo, meio e fim.", gesto: "Faça hoje uma tarefa de cada vez e termine a primeira antes de abrir a segunda." },
      { tema: "Leveza", texto: "Lembre um momento em que você riu sem motivo importante. Deixe o corpo recordar como é estar leve, e imagine essa sensação cabendo no dia de hoje.", gesto: "Procure hoje, de propósito, uma coisa pequena que faça você sorrir." },
      { tema: "Gratidão", texto: "A paz cresce no que já está bem. Passe os olhos pela sua vida e pare em três coisas que estão funcionando agora, por mais simples que sejam.", gesto: "Antes de dormir, diga em voz alta essas três coisas." }
    ],
    proposito: [
      { tema: "Chamado", texto: "O propósito costuma falar baixo. Lembre uma atividade em que você perde a noção do tempo e veja você fazendo isso com frequência, como parte da sua vida.", gesto: "Dedique hoje quinze minutos a essa atividade, sem precisar justificar." },
      { tema: "Coragem", texto: "Todo caminho pede um primeiro passo visto por alguém. Imagine só o primeiro minuto de uma coisa que você vem adiando: o lugar, a sua voz, o gesto inicial.", gesto: "Faça hoje esse primeiro minuto. Só ele." },
      { tema: "Dom", texto: "O que é fácil para você pode ser precioso para alguém. Visualize uma pessoa sendo ajudada por um talento seu e repare na expressão dela.", gesto: "Ofereça hoje esse talento a alguém, sem cobrar e sem diminuir o que é." },
      { tema: "Direção", texto: "Não é preciso ver a estrada inteira. Veja a sua intenção como a estrela no fim desta trilha: você só precisa saber de que lado ela está.", gesto: "Escolha hoje uma coisa para não fazer, porque ela afasta você dessa direção." },
      { tema: "Aprendizado", texto: "Quem tem propósito continua aluno. Imagine você daqui a um ano, sabendo algo que hoje ainda não sabe, e sinta o gosto dessa conquista.", gesto: "Aprenda hoje uma coisa pequena sobre o que você quer construir: uma página, um vídeo ou uma pergunta a quem sabe." },
      { tema: "Serviço", texto: "Propósito é o encontro do que você ama com o que o mundo precisa. Veja uma necessidade ao seu redor que toca você de verdade e uma forma simples de responder a ela.", gesto: "Faça hoje um gesto de serviço ligado ao que você quer ser." },
      { tema: "Gratidão", texto: "Olhe para trás no caminho: você já andou. Reviva uma decisão que trouxe você até aqui e agradeça a quem você foi naquele dia.", gesto: "Escreva hoje uma linha sobre o que você já sabe a respeito do seu caminho." }
    ]
  };
  const FOCOS = Object.keys(FLOR);
  const focoValido = f => (FOCOS.includes(f) ? f : "dinheiro");
  // número do dia no calendário local (a chave "aaaa-mm-dd" já vem do relógio do aparelho)
  const diaNumero = chave => { const p = String(chave).split("-").map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 86400000); };
  function florDoDia(foco, chave) {
    const lista = FLOR[focoValido(foco)], i = ((diaNumero(chave) % lista.length) + lista.length) % lista.length;
    return Object.assign({ id: focoValido(foco) + "-" + i }, lista[i]);
  }

  /* Pedra da Energia: prática guiada de cerca de 45 segundos, em passos. */
  const PEDRA = [
    { s: 12, titulo: "Chegue no corpo", texto: "Apoie os pés, solte os ombros e respire do jeito mais confortável para você. Perceba o peso do corpo sustentado." },
    { s: 16, titulo: "A luz dourada", texto: "Imagine uma luz dourada pousando no alto da cabeça e descendo devagar. Ela é um símbolo da energia que você quer cultivar hoje." },
    { s: 0, titulo: "Uma qualidade para o dia", texto: "Que qualidade essa luz traz para você levar ao seu dia?", escolha: true },
    { s: 12, titulo: "Leve com você", texto: "Respire mais uma vez com essa qualidade. Pense em um momento de hoje em que ela vai fazer diferença e em um gesto simples para lembrar dela." }
  ];
  const PEDRA_SEGUNDOS = PEDRA.reduce((a, p) => a + p.s, 0) + 8;

  /* estado das descobertas dentro do diário (S.bosque) */
  function estado(S) { if (!S.bosque || typeof S.bosque !== "object" || Array.isArray(S.bosque)) S.bosque = {}; return S.bosque; }
  const florHoje = (S, hoje) => { const f = estado(S).flor; return f && f.data === hoje ? f : null; };
  const pedraHoje = (S, hoje) => { const p = estado(S).pedra; return p && p.data === hoje ? p : null; };
  // guarda a flor do dia; tocar de novo no mesmo dia só troca a palavra, não cria outra visita
  function guardarFlor(S, hoje, foco, palavra) {
    const b = estado(S), pr = florDoDia(foco, hoje), ja = florHoje(S, hoje);
    b.flor = { data: hoje, id: pr.id, tema: pr.tema, palavra: String(palavra || "").trim().slice(0, 44) };
    b.flores = Array.isArray(b.flores) ? b.flores.filter(x => x && x.data !== hoje) : [];
    b.flores.push(b.flor); if (b.flores.length > 90) b.flores = b.flores.slice(-90);
    return { nova: !ja, flor: b.flor };
  }
  function guardarPedra(S, hoje, qualidade) {
    const b = estado(S), ja = pedraHoje(S, hoje);
    b.pedra = { data: hoje, qualidade: String(qualidade || "").slice(0, 30) }; b.pedras = (Number(b.pedras) || 0) + (ja ? 0 : 1);
    return { nova: !ja, pedra: b.pedra };
  }
  // o que a Estela pode lembrar da visita anterior: só o que foi registrado de fato
  function lembranca(S, hoje) {
    const b = estado(S), f = b.flor, p = b.pedra, ant = x => x && x.data < hoje;
    if (ant(f) && f.palavra) return { tipo: "flor", data: f.data, palavra: f.palavra, tema: f.tema };
    if (ant(p) && p.qualidade) return { tipo: "pedra", data: p.data, qualidade: p.qualidade };
    return null;
  }

  return { FLOR, FOCOS, PEDRA, PEDRA_SEGUNDOS, florDoDia, diaNumero, estado, florHoje, pedraHoje, guardarFlor, guardarPedra, lembranca };
})();
