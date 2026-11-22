/* Kabala: Sefirot (Golden Dawn), 72 Nomes (Kabbalah Centre) e escala emocional (Abraham-Hicks) */
window.KABALA = (function () {
  // Árvore da Vida: posição no SVG (viewBox 0 0 200 300), nome, planeta, cor, virtude
  const SEFIROT = [
    { n: 1, nome: "Kether", heb: "כתר", pt: "Coroa", planeta: "Primum Mobile", cor: "#F8F6FF", virtude: "Realização", x: 100, y: 22 },
    { n: 2, nome: "Chokmah", heb: "חכמה", pt: "Sabedoria", planeta: "Zodíaco", cor: "#BDBDC9", virtude: "Devoção", x: 160, y: 62 },
    { n: 3, nome: "Binah", heb: "בינה", pt: "Entendimento", planeta: "Saturno", cor: "#4A4458", virtude: "Silêncio", x: 40, y: 62 },
    { n: 4, nome: "Chesed", heb: "חסד", pt: "Misericórdia", planeta: "Júpiter", cor: "#4F7BE0", virtude: "Humildade e generosidade", x: 160, y: 122 },
    { n: 5, nome: "Geburah", heb: "גבורה", pt: "Força", planeta: "Marte", cor: "#D94848", virtude: "Coragem e energia", x: 40, y: 122 },
    { n: 6, nome: "Tiphareth", heb: "תפארת", pt: "Beleza", planeta: "Sol", cor: "#F2C94C", virtude: "Devoção à Grande Obra", x: 100, y: 152 },
    { n: 7, nome: "Netzach", heb: "נצח", pt: "Vitória", planeta: "Vênus", cor: "#3DBE8B", virtude: "Altruísmo", x: 160, y: 192 },
    { n: 8, nome: "Hod", heb: "הוד", pt: "Esplendor", planeta: "Mercúrio", cor: "#F28C38", virtude: "Honestidade", x: 40, y: 192 },
    { n: 9, nome: "Yesod", heb: "יסוד", pt: "Fundamento", planeta: "Lua", cor: "#9B5CFF", virtude: "Independência", x: 100, y: 222 },
    { n: 10, nome: "Malkuth", heb: "מלכות", pt: "Reino", planeta: "Terra", cor: "#B08A4A", virtude: "Discernimento", x: 100, y: 278 }
  ];
  // Caminhos (pares de sefirot) da Árvore
  const CAMINHOS = [[1,2],[1,3],[1,6],[2,3],[2,4],[2,6],[3,5],[3,6],[4,5],[4,6],[4,7],[5,6],[5,8],[6,7],[6,8],[6,9],[7,8],[7,9],[7,10],[8,9],[8,10],[9,10]];

  // número numerológico → sefirá (11 → Daath, representada como ponto oculto; 22 → Malkuth)
  function sefiraDe(n) {
    if (n === 11) return { n: 11, nome: "Daath", heb: "דעת", pt: "Conhecimento oculto", planeta: "Urano", cor: "#E6E6F5", virtude: "Intuição", x: 100, y: 92, oculta: true };
    if (n === 22) return SEFIROT[9];
    return SEFIROT[(n - 1) % 10];
  }

  // 72 Nomes de Deus (ordem do Kabbalah Centre) com intenção em português
  const NOMES72 = [
    ["והו", "Reparar o passado"], ["ילי", "Recuperar as centelhas"], ["סיט", "Fazer milagres"], ["עלם", "Eliminar pensamentos negativos"],
    ["מהש", "Cura"], ["ללה", "Estado de sonho"], ["אכא", "DNA da alma"], ["כהת", "Dissipar estresse e negatividade"],
    ["הזי", "Influências angélicas"], ["אלד", "Proteção contra o mau-olhado"], ["לאו", "Banir resquícios do mal"], ["ההע", "Amor incondicional"],
    ["יזל", "Paraíso na Terra"], ["מבה", "Adeus às armas"], ["הרי", "Visão de longo alcance"], ["הקם", "Superar a tristeza"],
    ["לאו", "Grande fuga do ego"], ["כלי", "Fertilidade e manifestação"], ["לוו", "Conexão com o Criador"], ["פהל", "Vitória sobre vícios"],
    ["נלך", "Erradicar pragas"], ["ייי", "Parar a atração fatal"], ["מלה", "Compartilhar a chama"], ["חהו", "Curar o ciúme"],
    ["נתה", "Falar o que pensa"], ["האא", "Ordem a partir do caos"], ["ירת", "Sócio silencioso: partilhar para multiplicar"], ["שאה", "Alma gêmea"],
    ["ריי", "Remover o ódio"], ["אום", "Construir pontes"], ["לכב", "Terminar o que começa"], ["ושר", "Memórias"],
    ["יחו", "Revelar o lado sombrio"], ["להח", "Humildade"], ["כוק", "Energia vital"], ["מנד", "Dissolver o medo"],
    ["אני", "A visão geral"], ["חעם", "Fluxo de energia"], ["רהע", "Diamante bruto"], ["ייז", "Falar as palavras certas"],
    ["ההה", "Autoestima"], ["מיכ", "Revelar o oculto"], ["וול", "Desafiar a gravidade"], ["ילה", "Adoçar o julgamento"],
    ["סאל", "Poder da prosperidade"], ["ערי", "Certeza absoluta"], ["עשל", "Transformação global"], ["מיה", "Unidade"],
    ["והו", "Felicidade"], ["דני", "Sair da escassez"], ["החש", "Sem culpa"], ["עמם", "Paixão"],
    ["ננא", "Sem agenda oculta"], ["נית", "A morte da morte"], ["מבה", "Pensamento em ação"], ["פוי", "Dissipar a raiva"],
    ["נמם", "Ouvir sua alma"], ["ייל", "Deixar ir"], ["הרח", "Cordão umbilical: a origem"], ["מצר", "Liberdade"],
    ["ומב", "Purificação"], ["יהה", "Ensinar, não pregar"], ["ענו", "Gratidão"], ["מחי", "Colocar-se em boa luz"],
    ["דמב", "Temor e reverência"], ["מנק", "Responsabilidade"], ["איע", "Grandes expectativas"], ["חבו", "Contato com quem partiu"],
    ["ראה", "Perdido e achado"], ["יבמ", "Reconhecer o desenho sob a desordem"], ["היי", "Profecia"], ["מום", "Limpeza espiritual"]
  ].map((x, i) => ({ n: i + 1, letras: x[0], intencao: x[1] }));

  // Escala de orientação emocional (Abraham-Hicks), 1 = topo
  const ESCALA = [
    "Alegria, gratidão, liberdade, amor", "Paixão", "Entusiasmo, felicidade", "Expectativa positiva, crença", "Otimismo", "Esperança", "Contentamento",
    "Tédio", "Pessimismo", "Frustração, irritação, impaciência", "Sobrecarga", "Decepção", "Dúvida", "Preocupação", "Culpar os outros", "Desânimo",
    "Raiva", "Vingança", "Ódio, fúria", "Ciúme", "Insegurança, culpa, indignidade", "Medo, luto, depressão, impotência"
  ].map((t, i) => ({ nivel: i + 1, nome: t }));

  // sugestão de subida: do nível atual para 1 ou 2 degraus acima
  const SUBIDA = {
    alto: "Você está na faixa alta da escala. Aproveite: é daqui que os pedidos saem mais nítidos. Visualize, agradeça e dê um passo inspirado hoje.",
    medio: "Você está no meio da escala. O movimento é curto: troque a preocupação por uma pergunta prática (“o que eu posso fazer em 10 minutos?”) e faça.",
    baixo: "Você está na faixa baixa, e tudo bem: sentir é informação. A regra de Abraham-Hicks é subir um degrau por vez, não pular para a alegria. Hoje, o objetivo é só sentir um pouco de alívio: respirar, escrever o que pesa, pedir ajuda, descansar."
  };

  return { SEFIROT, CAMINHOS, sefiraDe, NOMES72, ESCALA, SUBIDA };
})();
