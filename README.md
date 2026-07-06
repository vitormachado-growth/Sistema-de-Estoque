# 🕹️ GameStock — Sistema de Estoque

Sistema web de controle de estoque para loja de jogos, feito com **React + Vite + TypeScript + Tailwind** e **Supabase** (banco Postgres + autenticação na nuvem).

## Funcionalidades

- 🔐 **Login** de usuários (funcionários da loja) via Supabase Auth
- 📊 **Dashboard** com KPIs: produtos ativos, unidades, custo e valor de venda do estoque, alertas de estoque baixo e últimas movimentações
- 🎮 **Produtos**: cadastro completo (plataforma, categoria, condição, SKU, código de barras, preços, estoque mínimo, fornecedor), busca e filtros
- 🔄 **Movimentações**: registra entradas, saídas, vendas e ajustes — o saldo do produto é atualizado automaticamente
- 🏢 **Fornecedores**: cadastro de quem abastece a loja
- 📈 **Relatórios**: faturamento, lucro, margem e produtos mais vendidos por período

## Como o estoque funciona

O saldo de cada produto (`products.quantity`) **não é editado à mão**. Ele é a soma de todas as movimentações, mantida por um _trigger_ no banco:

- **Entrada** e **Ajuste (+)** somam ao estoque
- **Saída**, **Venda** e **Ajuste (−)** subtraem
- **Estornar** uma movimentação reverte o saldo automaticamente

Isso garante que o saldo esteja sempre coerente com o histórico.

---

## Configuração (passo a passo)

### 1. Crie um projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto (plano gratuito serve).
2. No painel, vá em **SQL Editor** → **New query**, cole todo o conteúdo de
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) e clique em **Run**.
   Isso cria as tabelas, o trigger de saldo e as políticas de segurança (RLS).

### 2. Configure as variáveis de ambiente

No painel do Supabase, vá em **Settings → API** e copie **Project URL** e a chave **anon public**.

```bash
cp .env.example .env.local
```

Edite `.env.local`:

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 3. Instale e rode

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (geralmente `http://localhost:5173`).

### 4. Crie sua conta

Na tela de login, clique em **Criar agora** e cadastre um e-mail/senha.

> Por padrão o Supabase pode exigir confirmação de e-mail. Para uso interno da loja,
> você pode desativar isso em **Authentication → Providers → Email → Confirm email (off)**.

---

## Scripts

| Comando           | O que faz                                  |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | Sobe o servidor de desenvolvimento         |
| `npm run build`   | Verifica tipos e gera o build de produção  |
| `npm run preview` | Serve o build de produção localmente       |

## Estrutura

```
supabase/migrations/   SQL do banco (rode no Supabase)
src/
  lib/                 client do Supabase e utilitários
  types/               tipos do domínio + tipagem do banco
  contexts/            AuthContext (sessão do usuário)
  components/          UI reutilizável, Layout, PageHeader
  pages/               Login, Dashboard, Produtos, Movimentações,
                       Fornecedores, Relatórios
```

## Próximos passos (ideias)

- Importação em massa de produtos (CSV) para agilizar o cadastro inicial
- Papéis de usuário (admin x operador) via RLS
- Upload de imagens dos produtos para o Supabase Storage
- Registro de vendas com múltiplos itens (carrinho) numa única operação
- Integração com a Shopee para sincronizar pedidos/estoque
