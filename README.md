# Kumbu Admin

Dashboard **Super Admin** para a plataforma Kumbu. Construído com Next.js 16, TypeScript, Tailwind. Todos os dados vêm do **backend Spring Boot** (`Kumbu_bakend`).

## Funcionalidades

- **Autenticação** — login JWT contra `/api/v1/auth/login`; só contas com role admin entram.
- **Visão geral** — KPIs, gráficos, filas operacionais (denúncias, suporte, KYC, candidaturas, reservas).
- **Utilizadores** — listar, pesquisar, editar, banir, exportar GDPR.
- **Marketplace** — anúncios, transações, conversas, avaliações, denúncias.
- **Vagas e imóveis** — moderação de emprego, candidaturas, reservas de aluguer.
- **Plataforma** — categorias, marketing, suporte, monetização, notificações, admins, auditoria.

## Stack

- [Next.js 16](https://nextjs.org) (App Router + Server Actions)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- Backend Kumbu REST (`NEXT_PUBLIC_KUMBU_API_URL`)
- [recharts](https://recharts.org), [lucide-react](https://lucide.dev), [zod](https://zod.dev)

## Arranque

### Pré-requisitos

- Node.js ≥ 20
- Backend Kumbu a correr (PostgreSQL + API na porta 8080)

### Variáveis de ambiente

Copia `.env.local.example` para `.env.local`:

```env
NEXT_PUBLIC_KUMBU_API_URL=http://localhost:8080/api/v1
```

### Backend + admin

```bash
# Terminal 1 — backend
cd Kumbu_bakend
docker compose up -d

# Terminal 2 — admin
cd kumbu-admin
npm install
npm run dev
```

Acede a [http://localhost:3000](http://localhost:3000).

**Super admin inicial** (criado automaticamente pelo backend na 1.ª execução):

- Email: `admin@kumbu.app` (ou `KUMBU_ADMIN_EMAIL`)
- Password: `Admin123!` (ou `KUMBU_ADMIN_PASSWORD`)

### Build de produção

```bash
npm run build
npm start
```

## Estrutura

```
src/
├── app/
│   ├── (admin)/          # rotas protegidas
│   ├── login/
│   └── forbidden/
├── components/
├── lib/
│   ├── kumbu-api/        # clientes REST
│   ├── auth.ts
│   └── admin-data.ts
└── proxy.ts              # middleware JWT
```

## Notas

- O painel actualiza dados ao voltar ao separador (sem realtime WebSocket).
- Swagger do backend: http://localhost:8080/swagger-ui.html
