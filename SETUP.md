# Kumbu — arranque completo (admin + site + backend)

Comunicação **in-app** via API REST + WebSocket do backend (`/ws/chat`).

## 1. Backend (obrigatório)

```bash
cd Kumbu_bakend
docker compose up -d
```

Migrations Flyway aplicam-se automaticamente. Super admin bootstrap: `admin@kumbu.app` / `Admin123!`.

## 2. Variáveis de ambiente

| Projeto | Ficheiro | Variável principal |
|---------|----------|-------------------|
| Admin | `kumbu-admin/.env.local` | `NEXT_PUBLIC_KUMBU_API_URL=http://localhost:8080/api/v1` |
| Site | `Kumbu_site_user/.env.local` | `NEXT_PUBLIC_KUMBU_API_URL=http://localhost:8080/api/v1` |
| App Flutter | `assets/api.local.json` | `{ "baseUrl": "http://10.0.2.2:8080" }` |

## 3. Admin

```bash
cd kumbu-admin
npm install
npm run dev
```

Login em http://localhost:3000 com credenciais do bootstrap do backend.

## 4. Site

```bash
cd Kumbu_site_user
npm install
npm run dev
```

## 5. Checklist rápido

- [ ] Backend a correr (`docker compose ps`)
- [ ] Flyway migrations OK (logs do container)
- [ ] Admin login funciona
- [ ] Site regista/login utilizador
- [ ] Conversa teste comprador ↔ vendedor
- [ ] Admin vê conversa em **Conversas**

Documentação de contrato: `APP_CONTRACT.md`.
