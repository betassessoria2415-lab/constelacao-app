# A pintura do Bosque Encantado

A imagem do bosque (árvores, samambaias, trilha dourada e a estrela ao fundo) é uma ilustração gerada por IA, fornecida pelo dono do produto dentro do arquivo de referência `Caminho-nas-Estrelas-Exploravel.html`. Ela não tem autor a creditar no app.

**A confirmar pelo dono do produto:** em qual ferramenta a imagem foi gerada e se o plano usado permite uso comercial. Os termos mudam de ferramenta para ferramenta; este repositório não tem como conferir isso.

## Arquivos

| Arquivo | O que é |
|---|---|
| `bosque-941.{avif,webp}` | A pintura no tamanho original (941 × 1672 px), só recomprimida |
| `bosque-640.{avif,webp}` | A mesma, reduzida para 640 px de largura (celulares) |
| `bosque-fundo.webp` | Versão pequena (480 px), desfocada e escurecida, usada como fundo em telas largas |

Nada foi desenhado por cima dos arquivos. No app, a profundidade (o primeiro plano anda mais que o fundo), a névoa, o pulso dourado da trilha, os vaga-lumes e as estrelas tocáveis são desenhados em tempo real por `bosque-cena.js` e `telas-bosque.js`.

## Como trocar a pintura

1. Gere as cinco versões com os mesmos nomes (AVIF e WebP em 941 e 640 px de largura, mais o fundo desfocado).
2. Em `bosque-cena.js`, ajuste `IW`/`IH` (tamanho), `VP` (ponto de fuga), `TRILHA` (pontos da trilha e das sete estrelas), `LUGARES`, `FLORES` e `RAIZ`. Todos estão em porcentagem da imagem.
3. Confira no navegador se as estrelas e as descobertas caem em cima dos objetos, parado e arrastando.

As fotografias da Via Láctea (ESO) usadas até a versão anterior foram removidas, junto com os créditos que as acompanhavam.
