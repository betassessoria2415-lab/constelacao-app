# Acesso pago: pontos de integração e plano de autorização no servidor

Este documento descreve como a compra vira acesso, o que mudou nesta entrega, o que foi validado só com dados simulados e o que falta para a autorização do conteúdo pago acontecer no servidor.

**Nada desta pasta está publicado.** `conteudo/index.ts` e `conteudo.sql` são fontes para revisão. Endereço e senha do webhook, códigos e demais segredos não ficam neste repositório.

## 1. Caminho da compra até o acesso

```
Kiwify (compra aprovada, renovação, reembolso)
   └─ webhook ─▶ função no Supabase ─▶ tabela produtos (produto ▶ lista de portais)
                                     └▶ tabela direitos (e-mail, portal, valido_ate, ativo)
App ─ login por e-mail (Supabase Auth, link ou código de 6 dígitos)
    └─ GET /rest/v1/direitos?select=portal,valido_ate,ativo   (RLS: cada pessoa só lê as próprias linhas)
```

| Ponto | Onde está | O que faz |
|---|---|---|
| Links de checkout | `app.js` → `CONFIG.checkouts`, `premium.js` → `CATALOGO[].checkout` | Abre a Kiwify em outra aba |
| Marca "pagamento em confirmação" | `premium.js` (clique em comprar) → `CDA.marcarPagamento(portal)` | Grava `S.pagamento = { portal, em }` neste aparelho |
| Consulta dos direitos | `conta.js` → `sincronizar()` | Lê `direitos` com o token da pessoa |
| Regra de entrada e de cada módulo | `nucleo.js` → `acessoPorDireitos`, `temDireito`, `planoDe` | Única fonte da regra, coberta por testes |
| Quando consulta | `app.js` → `sincronizarAcesso()` | Ao abrir, ao voltar para o app (`visibilitychange`, `pageshow`), ao voltar a internet (`online`) e pelo botão "Atualizar"; no máximo uma vez a cada 20 s quando automático |
| Códigos antigos | `premium.js` → `validar()` (hash SHA-256) | Transição, ver seção 5 |

Portais: `base` (entrada), `clube`, `guia`, `profundo`, `lua`, `amor` (planos) e `ano`, `nome` (compra única). O plano Completo concede `amor, base, clube, guia, lua, profundo`.

## 2. O que foi corrigido no app

- **Entrada sem a linha `base`.** Antes, quem comprava o Completo e recebia só `guia` (ou qualquer plano sem `base`) ficava na tela de entrada. Agora qualquer direito de plano em dia dá entrada, e os módulos do Completo (`guia`, `profundo`, `lua`, `amor`) implicam `base` e `clube`. Compra avulsa sozinha (`ano`, `nome`) não dá entrada.
- **Atualização ao voltar do checkout.** O app consulta os direitos quando volta a ficar visível, ao ser retomado do segundo plano e quando a internet volta. Não depende mais de fechar e abrir.
- **Pagamento em confirmação.** O servidor só registra compra aprovada, então o estado "aguardando" é local: aparece em Hoje e no Clube depois de abrir o checkout, some quando o direito chega ou depois de 3 dias, e tem "Atualizar agora" e "Não comprei". Para quem não entrou com o e-mail, o cartão pede o login.
- **Falha de consulta ≠ código inválido.** No login por código de 6 dígitos, respostas 400, 401, 403 e 422 dizem "código não confere"; falta de rede, 429 e 5xx dizem "não consegui conferir agora" e não apagam nada. Na consulta de direitos, uma falha mantém o acesso como estava.
- **Diário separado dos direitos.** O backup não leva chaves de acesso; restaurar um backup mantém o acesso do aparelho e nunca concede acesso novo. "Apagar meus dados" mantém o acesso.

## 3. Validado só com dados simulados

Nenhuma compra real foi feita e nada foi alterado na Kiwify ou no Supabase nesta entrega. O que os testes (`npm test`) e a conferência no navegador cobrem usa respostas montadas à mão:

- direitos `{guia}` sem `base` dão entrada; o Completo libera os seis portais; plano vencido não entra;
- o cartão de pagamento em confirmação aparece, some com a chegada do direito e expira;
- erro de código × falha de consulta.

## 4. Falta validar com a Kiwify e o Supabase reais

1. Compra de teste do Completo com um e-mail novo: conferir que a tabela `direitos` recebe as seis linhas e que o app, aberto na outra aba, libera sozinho ao voltar.
2. Pix e boleto: tempo entre pagar e o webhook chegar; confirmar que a Kiwify manda o aviso de aprovação (e não só o de "aguardando pagamento").
3. Renovação mensal: `valido_ate` avança; atraso de cobrança não derruba o acesso antes da hora.
4. Reembolso e cancelamento: `ativo` vira falso e o app fecha os módulos na próxima consulta, sem apagar o diário.
5. E-mail da compra diferente do e-mail de login (maiúsculas, espaços, apelido do Gmail).
6. Limite de envio do e-mail de acesso do Supabase (429) em horário de pico.
7. O webhook continua ignorando os outros produtos da conta Kiwify.

## 5. Transição dos códigos antigos

Hoje convivem dois jeitos de liberar: conta (servidor) e código (hash no app). O código não é proteção real: os hashes e o segredo do código mensal do Clube estão no JavaScript público, e o conteúdo pago também. Plano em três passos, cada um com saída segura:

1. **Agora (feito).** Código continua valendo. Quem entra com código vê em Perfil o convite para ligar o acesso ao e-mail; acesso adquirido nunca é retirado pelo app.
2. **Migração.** Uma função `resgatar-codigo` (a escrever) recebe o código de quem está logada, confere o hash no servidor e grava o direito correspondente em `direitos`. O app passa a chamar essa função em vez de liberar localmente. Códigos mensais do Clube deixam de ser gerados; quem tem assinatura ativa na Kiwify já tem o direito pela conta.
3. **Desligamento.** Depois de um prazo anunciado no app (sugestão: 60 dias) e de conferir quantos aparelhos ainda usam `acessoPor: "codigo"`, sair do código local: remover hashes e `segredoClube` do app. Antes disso, enviar e-mail para a base com o passo a passo de login.

## 6. Autorização do conteúdo no servidor (plano)

Problema: o app é estático, então todo o texto pago (`dados/mapa-profundo.js`, `dados/previsao-ano.js`, estrelas 4 a 7 de `dados/guia.js`, `dados/astro-lua.js` nas leituras) chega a qualquer navegador. O cadeado é só de interface.

Desenho proposto, sem mudar a arquitetura de JavaScript estático:

1. Os textos pagos saem dos arquivos públicos e vão para a tabela `conteudos` (`conteudo.sql`), uma linha por portal, em JSON. As fórmulas continuam no app; só os textos e roteiros saem.
2. A função `conteudo` (`conteudo/index.ts`) recebe o token da pessoa, lê os direitos **dela** (com o próprio token, pela mesma RLS de hoje), aplica a mesma regra de `nucleo.js` e só então devolve o JSON do portal pedido. Sem direito: 403.
3. No app, `premium.js` ganha `PREMIUM.conteudo(portal)`: busca na função, guarda no cache do aparelho (para o offline) com a validade do direito, e as telas pagas passam a ler dali. Sem rede e sem cache: mensagem "abra uma vez com internet".
4. Ordem sugerida: `guia` (estrelas 4 a 7) primeiro, por ser o coração do Completo; depois `profundo`, `ano`, `lua`, `amor`, `nome`.

Para publicar (decisão do dono, não feita aqui): aplicar `conteudo.sql`, carregar os JSON, publicar a função com verificação de JWT ligada e só então remover os textos dos arquivos públicos, na mesma versão do app que passa a buscá-los.

A regra de plano está duplicada de propósito em `conteudo/index.ts` (o servidor não pode confiar no app). Ao mudar `temDireito` em `nucleo.js`, mudar lá também.
