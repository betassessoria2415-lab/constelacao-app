-- Tabela do conteúdo pago, lida só pela função "conteudo". FONTE PARA REVISÃO: NÃO FOI APLICADA.
-- Ver servidor/README.md, seção 6.

create table if not exists public.conteudos (
  portal        text primary key check (portal in ('guia', 'profundo', 'lua', 'amor', 'clube', 'ano', 'nome')),
  versao        integer not null default 1,
  corpo         jsonb not null,
  atualizado_em timestamptz not null default now()
);

-- RLS ligada e nenhuma política: ninguém lê nem escreve pelo app (chave pública ou token de cliente).
-- Só a chave de serviço, usada dentro da função, passa.
alter table public.conteudos enable row level security;
revoke all on public.conteudos from anon, authenticated;

comment on table public.conteudos is 'Textos e roteiros dos módulos pagos. Entregues pela função conteudo depois de conferir os direitos.';
