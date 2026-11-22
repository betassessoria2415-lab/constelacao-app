# Constelação do Amanhã · web app

App de orientação diária e mapa numerológico cabalístico, com foco em prosperidade. Produto de desenvolvimento pessoal: lei da atração, numerologia, Kabala e astrologia aparecem como inspiração e metáfora, sem promessa de resultado.

No ar: https://constelacao-app.vercel.app

## Como é feito
- Estático, sem servidor, sem dependências e sem build. HTML, CSS e JavaScript puros.
- Dados da pessoa ficam só no aparelho (`localStorage`). Nada é enviado para servidores.
- Funciona offline (service worker) e pode ser instalado na tela inicial.

## Estrutura
| Arquivo | Papel |
|---|---|
| `index.html` | Casca do app e barra de abas |
| `estilo.css` | Tema (roxo, dourado, cartões de vidro, transições) |
| `app.js` | Núcleo: estado, navegação, telas Hoje, Mapa, Jornada, Céu e Perfil. Expõe `window.CDA` |
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
| `dados/estrelas.js` | Conteúdo da jornada das 30 estrelas |

## Rodar localmente
```
python -m http.server 8765
```
Depois abra http://127.0.0.1:8765.

## Modelo de acesso
Três camadas, todas por código digitado no app: acesso base, portais de pagamento único e um clube mensal. O app guarda apenas o hash dos códigos. Como tudo roda no aparelho do cliente, é uma proteção adequada a produto de ticket baixo, não um controle de assinatura; isso exigiria servidor.

## Fontes das regras
Numerologia cabalística na linha de Carlos Rosa (momentos decisivos com 37 menos o Destino, acentos que somam valor). Lua e Sol por séries truncadas de Meeus, conferidas contra efemérides da NASA.

## Aviso
Material de desenvolvimento pessoal. Não é aconselhamento financeiro, psicológico ou médico.
