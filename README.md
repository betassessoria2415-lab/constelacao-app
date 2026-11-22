# O Segredo das Estrelas · web app

App de orientação diária e mapa numerológico cabalístico, com foco em prosperidade. Produto de desenvolvimento pessoal: lei da atração, numerologia, Kabala e astrologia aparecem como inspiração e metáfora, sem promessa de resultado.

No ar: https://constelacao-app.vercel.app

## Como é feito
- Estático, sem dependências e sem build. HTML, CSS e JavaScript puros.
- Diário e mapa ficam só no aparelho (`localStorage`).
- Servidor opcional (Supabase): login por e-mail e direitos de acesso liberados por aviso de pagamento. O app fala com ele por `fetch`, sem biblioteca.
- Funciona offline (service worker) e pode ser instalado na tela inicial.

## Estrutura
| Arquivo | Papel |
|---|---|
| `index.html` | Casca do app e barra de abas |
| `estilo.css` | Tema (roxo, dourado, cartões de vidro, transições) |
| `app.js` | Núcleo: estado, navegação, telas Hoje, Mapa, Jornada, Céu e Perfil. Expõe `window.CDA` |
| `conta.js` | Login por e-mail e sincronização dos direitos comprados (Supabase Auth + REST, com RLS) |
| `premium.js` | Catálogo de módulos pagos ("Portais"), desbloqueio por código (hash SHA-256) e folha de compra |
| `telas-premium.js` | Telas dos portais: Mapa Profundo, Lua e Ascendente, Nome de Poder, Previsão do ano, loja |
| `sw.js` | Cache offline, rede primeiro |
| `dados/numerologia.js` | Tabela cabalística, acentos, fórmulas e significados |
| `dados/mapa-profundo.js` | Momentos decisivos, desafios, ciclos de vida, lições cármicas, triângulo da vida |
| `dados/combos.js` | Leitura combinada de Destino, Expressão e Motivação |
| `dados/astros.js`, `dados/astro-lua.js` | Signos, calendário, posição real da Lua e do Sol, ascendente |
| `dados/diario.js` | Orientação diária combinatória e as 22 cartas do dia |
| `dados/ciclos.js` | Semana, previsão do mês, ciclos lunares, compatibilidade |
| `dados/previsao-ano.js` | Previsão do ano pessoal |
| `dados/kabala.js` | Árvore da Vida, 72 Nomes, escala emocional |
| `dados/guia.js` | Guia de Manifestação: 7 etapas (princípios herméticos), técnicas com autor e obra, dicionário, fontes |
| `telas-guia.js` | Telas da trajetória, das técnicas, do resgate de frequência e do dicionário |

## Rodar localmente
```
python -m http.server 8765
```
Depois abra http://127.0.0.1:8765.

## Modelo de acesso
Três camadas: acesso base, portais de pagamento único e um clube mensal. Há dois jeitos de liberar, que convivem:

1. **Conta (servidor).** A plataforma de venda avisa uma função no Supabase, que grava o direito ligado ao e-mail. A pessoa entra com o e-mail e o app lê os próprios direitos. Regras no banco (RLS): cada pessoa só lê o que é dela e ninguém escreve pelo cliente.
2. **Código.** Digitado no app e conferido por hash SHA-256. Proteção adequada a ticket baixo, mantida para a transição.

## Fontes das regras
Numerologia cabalística na linha de Carlos Rosa (momentos decisivos com 37 menos o Destino, acentos que somam valor). Lua e Sol por séries truncadas de Meeus, conferidas contra efemérides da NASA.

## Aviso
Material de desenvolvimento pessoal. Não é aconselhamento financeiro, psicológico ou médico.
