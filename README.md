# Kumbu Admin

Dashboard **Super Admin** para a plataforma Kumbu (app Flutter `rock_app`). Construído com Next.js 16, TypeScript, Tailwind e Supabase. Compartilha a base de dados e o esquema visual da app móvel.

## ✨ Funcionalidades

- **Autenticação privilegiada** — só utilizadores presentes na tabela `admin_users` conseguem entrar.
- **Visão geral** — KPIs (utilizadores, pedidos, produtos, notificações), gráfico de 30 dias, donut por estado do pedido e atalhos rápidos.
- **Utilizadores** — listar, pesquisar, paginar, editar perfil, enviar reset de palavra-passe, promover/revogar admin, eliminar conta no Auth.
- **Pedidos** — listar com filtros por estado e ID, alterar estado em linha (`processing`, `shipping`, `delivered`, `cancelled`), eliminar.
- **Catálogo** — CRUD completo de produtos (incluindo destaque e stock) e de categorias / subcategorias.
- **Marketing** — gerir blocos `hero` e `offers` com preview do gradiente.
- **Suporte, Pagamentos e Filtros** — gestão dinâmica das tabelas `app_support_settings`, `app_payment_methods` e `app_category_sort_filters`.
- **Notificações** — disparar mensagens para todos os utilizadores ou para um UID específico (gera linhas em `user_notifications` em lote).
- **Administradores** — convidar (cria utilizador em Auth + entrada em `admin_users`), mudar função, remover.
- **Auditoria** — todas as acções privilegiadas são registadas em `admin_audit_log`.
- **Segurança** — middleware de sessão Supabase SSR, RLS em todas as tabelas, headers `X-Frame-Options`, `Permissions-Policy`, etc.

## 🛠 Stack

- [Next.js 16](https://nextjs.org) (App Router + Server Actions)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com) + tokens com o tema **Kumbu** (vermelho `#C62828`, gradiente vermelho → roxo → azul)
- [Supabase](https://supabase.com) (`@supabase/ssr` + `@supabase/supabase-js`)
- [recharts](https://recharts.org), [lucide-react](https://lucide.dev), [zod](https://zod.dev)

## 🚀 Como pôr a correr

### 1) Pré-requisitos

- Node.js ≥ 20
- Acesso ao projecto Supabase do Kumbu (`hzrhnzurpkmgidegxzmw`)

### 2) Variáveis de ambiente

Copia `.env.local.example` para `.env.local` e preenche:

```
NEXT_PUBLIC_SUPABASE_URL=https://hzrhnzurpkmgidegxzmw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...   # Project Settings → API → service_role
SUPER_ADMIN_EMAIL=admin@kumbu.app
```

> ⚠️ Nunca coloques `SUPABASE_SERVICE_ROLE_KEY` em variáveis com prefixo `NEXT_PUBLIC_`. É usada apenas no servidor.

### 3) Aplicar o schema de admin

No **SQL Editor** do Supabase corre, por esta ordem:

1. `../rock_app/supabase/users_schema.sql`
2. `../rock_app/supabase/catalog_schema.sql`
3. `../rock_app/supabase/app_content_schema.sql`
4. `../rock_app/supabase/orders_notifications_triggers.sql`
5. **`supabase/admin_schema.sql`** (este projecto)

Antes de correr o passo 5, edita a linha `v_email constant text := 'admin@kumbu.app';` para apontar para o e-mail do super admin inicial (que precisa de já existir em **Authentication → Users**, ou que vais criar imediatamente a seguir via dashboard).

### 4) Instalar e arrancar

```bash
npm install
npm run dev
```

Acede a [http://localhost:3000](http://localhost:3000). Se ainda não há admins, o login mostra "sem permissões" — adiciona um manualmente em `admin_users` no Supabase ou usa o passo 3 acima.

### 5) Build de produção

```bash
npm run build
npm start
```

### 6) Deploy

Recomendado **Vercel** (suporta nativamente Server Actions e middleware do Next):

1. Faz push para um repositório git.
2. No Vercel, importa o projecto.
3. Adiciona as 4 variáveis de ambiente.
4. Define o **Root Directory** como esta pasta (por causa do espaço, prefere renomear para `kumbu-admin`).

## 🔐 Modelo de permissões

- Cada tabela tem RLS activo e uma policy `*_admin_all` que delega no helper `public.is_admin()`.
- A função `is_admin()` é `security definer` e verifica se o `auth.uid()` consta em `admin_users`.
- Três níveis de função:
  - `super_admin` — pode gerir admins, criar / eliminar admins, mudar funções.
  - `admin` — gestão operacional total (utilizadores, pedidos, catálogo, notificações).
  - `support` — pensado para acesso de leitura/suporte.
- Todas as mutações chamam `logAudit()` que grava em `admin_audit_log`.

## 🗺 Estrutura

```
src/
├── app/
│   ├── (admin)/             # rotas protegidas (sidebar + topbar)
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── marketing/
│   │   ├── support/
│   │   ├── payment-methods/
│   │   ├── filters/
│   │   ├── notifications/
│   │   ├── admins/
│   │   ├── audit/
│   │   └── settings/
│   ├── login/               # autenticação
│   └── forbidden/           # sem permissões
├── components/
│   ├── shell/               # sidebar, topbar, navegação mobile
│   ├── dashboard/           # gráficos
│   └── ui/                  # cartões, badges, avatar, etc.
├── lib/
│   ├── supabase/            # browser, server, middleware
│   ├── auth.ts              # requireAdmin / logAudit
│   ├── env.ts
│   ├── types.ts
│   └── utils.ts
└── middleware.ts
```

## 📝 Notas

- O tema visual segue os tokens da `rock_app` (ver `lib/core/theme/rock_colors.dart`).
- O nome interno da app no pubspec é `rock_app`, mas o produto é "Kumbu".
- O painel funciona offline-friendly: as queries são SSR; só o que precisa de interactividade é client.
