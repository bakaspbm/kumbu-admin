# Contrato App ↔ Backend Kumbu

O **admin**, o **site** e a **app Flutter** consomem a mesma API REST Spring Boot (`/api/v1`).

## Base URL

```
http://localhost:8080/api/v1   # dev
```

## Autenticação

```
POST /auth/register
POST /auth/login        → { accessToken, refreshToken, admin: boolean }
POST /auth/refresh
POST /auth/logout
```

Header: `Authorization: Bearer <accessToken>`

## Utilizadores

```
GET  /users/me
PATCH /users/me
GET  /users/me/favorites
...
```

Admin: `GET /admin/users`, `POST /admin/users/{id}/ban`, etc.

## Catálogo

```
GET /catalog/categories
GET /catalog/products
GET /catalog/products/{id}
```

Anúncios criados pelos utilizadores na app/site; admin modera via `/admin/products`.

## Pedidos

```
POST /orders/checkout
GET  /orders/mine
GET  /orders/sales
```

Admin: `/admin/orders`

## Chat

```
GET  /chat/conversations
POST /chat/conversations
GET  /chat/conversations/{id}/messages
WebSocket: /ws/chat
```

Admin: `/admin/conversations`

## Emprego e imóveis

```
/api/v1/jobs/*      — vagas, CVs, candidaturas
/api/v1/rentals/*   — reservas de propriedades
```

Admin: `/admin/jobs/*`, `/admin/rentals/*`

## Admin (role ADMIN)

| Área | Prefixo |
|------|---------|
| Utilizadores | `/admin/users` |
| Produtos | `/admin/products` |
| Pedidos | `/admin/orders` |
| Denúncias | `/admin/reports` |
| Conversas | `/admin/conversations` |
| Suporte | `/admin/support` |
| Identidade KYC | `/admin/identity` |
| Sistema | `/admin/system` (admins, audit, dashboard) |

## Flutter

`assets/api.local.json`:

```json
{ "baseUrl": "http://10.0.2.2:8080" }
```

Em dispositivo físico: IP da máquina na LAN.

## Checklist integração

- [ ] JWT login/registo
- [ ] CRUD anúncios
- [ ] Checkout e histórico de pedidos
- [ ] Chat + WebSocket
- [ ] Notificações
- [ ] Admin moderação

*Última actualização: stack Spring Boot + PostgreSQL (Flyway).*
