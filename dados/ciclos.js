/* Semana, previsão do mês, ciclos da Lua e compatibilidade */
window.CICLOS = (function () {
  // pontuação simbólica de cada dia (dia pessoal + regente da semana + lua)
  const P_DINHEIRO = { 8: 5, 1: 4, 4: 3, 3: 3, 5: 2, 6: 2, 2: 2, 9: 1, 7: 1 };
  const P_AMOR = { 6: 5, 2: 5, 3: 4, 9: 3, 5: 3, 1: 2, 4: 2, 8: 2, 7: 1 };
  const P_PAUSA = { 7: 5, 9: 4, 2: 3, 6: 2, 4: 1, 3: 1, 5: 0, 1: 0, 8: 0 };
  function pontuar(dp, diaSemana, faseIdx) {
    return {
      dinheiro: P_DINHEIRO[dp] + (diaSemana === 4 ? 1 : diaSemana === 3 ? 0.5 : 0) + (faseIdx >= 1 && faseIdx <= 3 ? 0.5 : 0),
      amor: P_AMOR[dp] + (diaSemana === 5 ? 1 : diaSemana === 1 ? 0.5 : 0) + (faseIdx === 4 ? 0.5 : 0),
      pausa: P_PAUSA[dp] + (diaSemana === 0 ? 1 : diaSemana === 6 ? 0.5 : 0) + (faseIdx >= 6 ? 0.5 : 0)
    };
  }

  // previsão por mês pessoal (1 a 9)
  const MES = {
    1: { palavra: "Semear", texto: "Mês de começos. O que você iniciar agora ganha fôlego nos próximos meses. Escolha uma única coisa nova e dê o primeiro passo ainda na primeira semana.", dinheiro: "Abra algo: uma caixinha, uma fonte de renda, um plano. Começar pequeno vale mais do que planejar grande.", ritual: "Escreva uma intenção para o mês e leia em voz alta toda segunda-feira." },
    2: { palavra: "Cultivar", texto: "Mês de paciência e de parcerias. As coisas andam no ritmo delas; forçar atrasa. Cuide das relações que sustentam você.", dinheiro: "Bom mês para acordos, renegociações e para pedir ajuda a quem entende. Evite decisões solitárias e apressadas.", ritual: "Toda semana, agradeça a uma pessoa que caminha com você." },
    3: { palavra: "Expressar", texto: "Mês leve, social e criativo. Sua palavra abre portas: apareça, converse, divulgue o que faz.", dinheiro: "Vendas, indicações e novas ideias de renda aparecem quando você se mostra. Cuidado com gastos por empolgação.", ritual: "Publique ou conte a alguém, uma vez por semana, algo que você sabe fazer." },
    4: { palavra: "Construir", texto: "Mês de trabalho e organização. Pode parecer lento, mas é quando a base fica firme. Rotina é sua aliada.", dinheiro: "Hora da planilha: anote entradas e saídas, corte vazamentos e monte ou reforce a reserva.", ritual: "Escolha um dia fixo da semana para conferir as contas, sempre no mesmo horário." },
    5: { palavra: "Mover", texto: "Mês de mudanças e novidades. Algo sai do roteiro, e é por aí que a oportunidade entra. Mantenha-se flexível.", dinheiro: "Podem surgir rendas e gastos inesperados. Diga sim ao que amplia e espere 48 horas antes de compras grandes.", ritual: "Faça uma coisa diferente por semana: um caminho, um curso, uma conversa nova." },
    6: { palavra: "Cuidar", texto: "Mês da casa, da família e dos vínculos. Responsabilidades pedem presença, e o afeto devolve em dobro.", dinheiro: "Gastos e decisões ligados ao lar e a quem depende de você. Cuide de todos sem se deixar por último.", ritual: "Um gesto de cuidado com a casa e um gesto de autocuidado por semana." },
    7: { palavra: "Aprofundar", texto: "Mês de recolhimento, estudo e fé. Menos barulho, mais clareza. As respostas vêm no silêncio.", dinheiro: "Não é mês de grandes apostas: é mês de estudar, planejar e se preparar para o próximo, que é de colheita.", ritual: "Dez minutos de leitura ou estudo sobre dinheiro, três vezes por semana." },
    8: { palavra: "Colher", texto: "Mês de poder pessoal e resultado. O que você plantou e organizou começa a aparecer. Assuma o seu valor.", dinheiro: "O melhor mês do ciclo para cobrar, negociar, pedir aumento, fechar acordos e ajustar preços.", ritual: "Toda semana, faça um pedido claro de valor: um preço, um prazo, um reconhecimento." },
    9: { palavra: "Concluir", texto: "Mês de fechar ciclos. Termine o que está pela metade, perdoe, doe, limpe. O espaço que abrir agora será ocupado pelo novo.", dinheiro: "Quite, renegocie, cancele o que não usa. Evite iniciar grandes compromissos financeiros.", ritual: "Desapegue de uma coisa por semana: um objeto, uma assinatura, uma mágoa." }
  };

  // temas dos ciclos lunares (rodízio de 12 lunações)
  const TEMAS = [
    { nome: "Merecimento", frase: "Eu posso receber sem precisar provar nada.", pergunta: "Onde eu ainda sinto que preciso merecer para receber?" },
    { nome: "Coragem", frase: "Eu dou o passo mesmo com o coração acelerado.", pergunta: "Que passo eu daria neste ciclo se o medo não decidisse por mim?" },
    { nome: "Ordem", frase: "O que eu organizo, cresce.", pergunta: "Que parte da minha vida financeira pede arrumação neste ciclo?" },
    { nome: "Valor próprio", frase: "Meu trabalho e meu tempo têm valor.", pergunta: "Onde eu estou cobrando, pedindo ou aceitando menos do que valho?" },
    { nome: "Desapego", frase: "Eu solto o que pesa para caber o que chega.", pergunta: "O que eu carrego por hábito e já poderia deixar ir?" },
    { nome: "Parcerias", frase: "Eu prospero junto.", pergunta: "Quem pode caminhar comigo neste ciclo, e o que eu ofereço em troca?" },
    { nome: "Voz", frase: "Eu digo o que quero com clareza e gentileza.", pergunta: "Que pedido ou conversa sobre dinheiro eu venho adiando?" },
    { nome: "Raízes", frase: "Eu honro minha história e escolho meu caminho.", pergunta: "Que crença herdada sobre dinheiro eu quero reescrever neste ciclo?" },
    { nome: "Fé", frase: "Eu confio no que ainda não vejo.", pergunta: "Em que área eu preciso confiar mais e controlar menos?" },
    { nome: "Disciplina", frase: "Pequenos combinados cumpridos constroem grandes mudanças.", pergunta: "Que único hábito, repetido por 29 dias, mudaria meu ciclo?" },
    { nome: "Generosidade", frase: "O que eu compartilho se multiplica.", pergunta: "O que eu tenho de sobra (tempo, saber, afeto) e posso oferecer?" },
    { nome: "Visão", frase: "Eu enxergo longe e caminho perto.", pergunta: "Como eu quero estar daqui a um ano, e o que este ciclo pode adiantar disso?" }
  ];
  // quatro marcos de cada lunação (dia do ciclo em que abrem)
  const MARCOS = [
    { k: "nova", nome: "Lua Nova · Pedir", icone: "🌑", abre: 0, guia: "Escreva sua intenção para este ciclo. Uma só, clara, com data e, se couber, com valor." },
    { k: "crescente", nome: "Lua Crescente · Agir", icone: "🌓", abre: 6, guia: "Qual passo você já deu e qual obstáculo apareceu? Escreva seu plano: se acontecer isso, então eu faço aquilo." },
    { k: "cheia", nome: "Lua Cheia · Colher", icone: "🌕", abre: 13.5, guia: "O que já floresceu desde a lua nova? Liste e agradeça, mesmo o que veio pequeno." },
    { k: "minguante", nome: "Lua Minguante · Soltar", icone: "🌗", abre: 21, guia: "O que este ciclo ensinou e o que você deixa para trás antes da próxima lua nova?" }
  ];

  // compatibilidade por grupos numerológicos
  const grupo = n => { const r = n === 11 ? 2 : n === 22 ? 4 : n; return [1, 5, 7].includes(r) ? "A" : [2, 4, 8].includes(r) ? "B" : "C"; };
  const PARES = {
    AA: { base: 90, titulo: "Mentes livres", texto: "Vocês se entendem na independência e na curiosidade. Cada um precisa de espaço, e isso não é distância: é combustível.", dinheiro: "Decidam juntos o essencial e deixem uma parte do dinheiro livre para cada um. Controle excessivo desgasta os dois." },
    BB: { base: 90, titulo: "Construtores", texto: "Dupla prática e leal. Vocês falam a língua do concreto: planos, metas, patrimônio. Juntos, levantam o que quiserem.", dinheiro: "Excelente parceria financeira. O risco é a rigidez: reservem um valor para prazer, sem culpa." },
    CC: { base: 90, titulo: "Corações criativos", texto: "Ligação afetiva, calorosa e expressiva. Vocês se inspiram e se cuidam. Emoção não falta; falta, às vezes, chão.", dinheiro: "Criatividade para ganhar sobra. Coloquem os combinados no papel para o entusiasmo não virar descontrole." },
    AB: { base: 64, titulo: "Liberdade e estrutura", texto: "Um quer voar, o outro quer firmar. Parece atrito, mas é complemento: um traz o novo, o outro traz a base.", dinheiro: "Dividam papéis: quem planeja e quem prospecta. Combinem um teto de risco para a ousadia não assustar a segurança." },
    AC: { base: 78, titulo: "Ideia e emoção", texto: "Um pensa, o outro sente, e os dois se movem. Relação estimulante, de muita troca e novidade.", dinheiro: "Boa dupla para criar e vender. Definam quem cuida do controle, porque nenhum dos dois gosta de planilha." },
    BC: { base: 74, titulo: "Chão e calor", texto: "Um dá estrutura, o outro dá afeto e cor. Quando se respeitam, formam um lar ou um negócio com alma e com base.", dinheiro: "Quem é prático cuida do orçamento; quem é criativo cuida das ideias e das relações. Valorizem os dois papéis igualmente." }
  };
  const AO_LADO = {
    1: "Dê autonomia e evite ordens diretas. Peça opinião e deixe a pessoa liderar uma parte.",
    2: "Seja gentil e constante. Decisões de dinheiro pedem conversa calma, nunca pressão.",
    3: "Elogie e escute. Combine limites de gasto com leveza, sem tom de bronca.",
    4: "Seja previsível e cumpra o combinado. Mudanças precisam de aviso e de números.",
    5: "Dê espaço e variedade. Compromissos longos funcionam melhor em etapas curtas.",
    6: "Reconheça o cuidado que essa pessoa dá. Ela decide melhor quando sente que a família está segura.",
    7: "Respeite o silêncio e o tempo de pensar. Traga dados, não pressa.",
    8: "Fale de metas e resultados com franqueza. Disputa de poder se resolve com papéis claros.",
    9: "Apele ao propósito. Essa pessoa dá muito; ajude-a a também guardar para si.",
    11: "Acolha a sensibilidade e ajude a transformar inspiração em passos práticos.",
    22: "Apoie os grandes planos e lembre do descanso. A cobrança interna dessa pessoa já é alta."
  };
  function compat(a, b) { // a, b: { destino, expressao }
    const g1 = grupo(a.destino), g2 = grupo(b.destino), par = PARES[[g1, g2].sort().join("")];
    let pts = par.base;
    const espelho = a.destino === b.destino;
    if (espelho) pts = 86;
    if (grupo(a.expressao) === grupo(b.expressao)) pts += 5;
    if (a.expressao === b.destino || b.expressao === a.destino) pts += 3;
    return { pts: Math.min(97, pts), espelho, par, aoLado: AO_LADO[b.destino] || AO_LADO[1] };
  }

  return { pontuar, MES, TEMAS, MARCOS, compat };
})();
