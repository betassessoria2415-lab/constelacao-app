# O Segredo das Estrelas · web app

App de orientação diária e mapa numerológico cabalístico, com foco em prosperidade. Produto de desenvolvimento pessoal: lei da atração, numerologia, Kabala e astrologia aparecem como inspiração e metáfora, sem promessa de resultado.

No ar: https://constelacao-app.vercel.app

## Como é feito
- Estático, sem dependências e sem build. HTML, CSS e JavaScript puros.
- Diário e mapa ficam só no aparelho (`localStorage`). O acesso comprado fica ligado ao e-mail e é guardado à parte: backup e restauração só mexem no diário.
- Servidor opcional (Supabase): login por e-mail e direitos de acesso liberados por aviso de pagamento. O app fala com ele por `fetch`, sem biblioteca.
- Funciona offline (service worker) e pode ser instalado na tela inicial.

## Estrutura
| Arquivo | Papel |
|---|---|
| `index.html` | Casca do app e barra de abas |
| `estilo.css` | Tema (céu azul-noite, dourado âmbar, marfim), palco do Bosque Encantado e regras de movimento reduzido |
| `nucleo.js` | Regras puras, sem tela: formato dos dados e migração, backup, ciclos, progresso das estrelas, direitos de acesso, retorno e carta semanal. Expõe `window.NUCLEO` e é o que os testes cobrem |
| `app.js` | Estado, navegação e as telas Hoje, Mapa, Ciclos e Perfil. Expõe `window.CDA` |
| `estela.js` | Estela: a estrela-guia (desenho em canvas, falas, primeiro encontro e apresentação opcional) |
| `conta.js` | Login por e-mail e sincronização dos direitos comprados (Supabase Auth + REST, com RLS) |
| `premium.js` | Catálogo de módulos pagos ("Portais"), desbloqueio por código (hash SHA-256) e folha de compra |
| `telas-premium.js` | Clube (plano, acesso de cada pessoa, leituras avulsas) e telas dos módulos: Mapa Profundo, Lua e Ascendente, Nome de Poder, Previsão do ano |
| `sw.js` | Cache offline: rede primeiro, e a última versão válida quando a rede responde erro (404, 5xx) ou cai. Imagens vêm do cache primeiro |
| `dados/numerologia.js` | Tabela cabalística, acentos, fórmulas e significados |
| `dados/mapa-profundo.js` | Momentos decisivos, desafios, ciclos de vida, lições cármicas, triângulo da vida |
| `dados/combos.js` | Leitura combinada de Destino, Expressão e Motivação |
| `dados/astros.js`, `dados/astro-lua.js` | Signos, calendário, posição real da Lua e do Sol, ascendente |
| `dados/diario.js` | Orientação diária combinatória e as 22 cartas do dia |
| `dados/ciclos.js` | Semana, previsão do mês, ciclos lunares, compatibilidade |
| `dados/previsao-ano.js` | Previsão do ano pessoal |
| `dados/kabala.js` | Árvore da Vida, 72 Nomes, escala emocional |
| `dados/guia.js` | Caminho: as 7 estrelas (princípios herméticos), o primeiro ritual, técnicas com autor e obra, dicionário, fontes |
| `telas-guia.js` | Aba Caminho: as sete estrelas (regras, telas e conclusão), primeiro ritual, práticas, registros, resgate de energia, carta semanal |
| `telas-bosque.js` | Bosque Encantado (capítulo Trilha do Caminho): pontos tocáveis, painéis da Flor do Dia, da Raiz da Intenção e da Pedra da Energia, "Minhas descobertas", celebração da estrela acesa |
| `bosque-cena.js` | A cena e a câmera do bosque: pintura com profundidade em WebGL, partículas, gestos (arrastar x tocar) e a versão simples para aparelhos sem WebGL |
| `dados/bosque.js` | Conteúdo do bosque: sete práticas da flor por foco, passos da pedra e as regras do dia (mesma prática o dia inteiro, troca pelo calendário) |
| `img/` | Pintura do bosque em AVIF e WebP. Arquivos e como trocar em `img/LEIA-ME.md` |
| `tests/` | Testes automáticos (Node puro) do núcleo, do foco, do bosque e do service worker |
| `servidor/` | Pontos de integração Kiwify, Supabase e app, e o plano de autorização do conteúdo no servidor (fontes não publicadas) |

## Rodar localmente
```
python -m http.server 8765
```
Depois abra http://127.0.0.1:8765.

## Testes
```
npm test
```
Roda `node --test tests/*.test.js` (Node 18 ou mais novo, sem instalar nada). Cobre migração das versões antigas, backup inválido, ciclos, progresso das estrelas, direitos de acesso, foco da orientação e o cache offline.

## As cinco abas
Hoje (Estela e a ação do dia), Caminho (as sete estrelas), Mapa (Essência, Meu nome, Relações), Ciclos (Lua, Calendário, Mês e ano) e Clube (plano e acessos). O Perfil abre pelo ícone no topo. Os identificadores internos das abas continuam `hoje, guia, mapa, ceu, portais` e `eu`.

## Dados no aparelho
- `cda_app_v1`: diário e progresso (formato 2; versões antigas são migradas ao abrir, sem perder anotações).
- `cda_app_v1_anterior`: cópia do diário de antes de uma restauração, mantida até a pessoa confirmar.
- `cda_app_v1_ilegivel`: cópia do que não pôde ser lido, para suporte.
- `cda_sessao_v1`: sessão do login por e-mail.

## Modelo de acesso
Três camadas: acesso base, portais de pagamento único e um clube mensal. Há dois jeitos de liberar, que convivem:

1. **Conta (servidor).** A plataforma de venda avisa uma função no Supabase, que grava o direito ligado ao e-mail. A pessoa entra com o e-mail e o app lê os próprios direitos. Regras no banco (RLS): cada pessoa só lê o que é dela e ninguém escreve pelo cliente.
2. **Código.** Digitado no app e conferido por hash SHA-256. Proteção adequada a ticket baixo, mantida para a transição.

Detalhes, o que falta validar com compra real e o plano para autorizar o conteúdo no servidor: `servidor/README.md`.

## Fontes das regras
Numerologia cabalística na linha de Carlos Rosa (momentos decisivos com 37 menos o Destino, acentos que somam valor). Lua e Sol por séries truncadas de Meeus, conferidas contra efemérides da NASA.

## Aviso
Material de desenvolvimento pessoal. Não é aconselhamento financeiro, psicológico ou médico.
