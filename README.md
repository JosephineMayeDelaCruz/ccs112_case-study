# WalangBrownout — Inventory Management System

A full-stack inventory management system built with **Laravel 11** (backend API) and **React + Vite** (frontend).

---

## Roles

| Role | Login email | Password |
|---|---|---|
| System Admin | admin@walangbrownout.test | password |
| Warehouse Staff | staff@walangbrownout.test | password |
| Purchasing Manager | manager@walangbrownout.test | password |
| Inventory Clerk | clerk@walangbrownout.test | password |

---

## Quick Start

### Backend (Laravel)

```bash
cd backend
cp .env.example .env        # or edit .env directly
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve           # runs on http://localhost:8000
```

### Frontend (React + Vite)

```bash
cd frontend
npm install
# create .env.local:
#   VITE_API_URL=http://localhost:8000/api
npm run dev                 # runs on http://localhost:5173
```

---

## Features

- **Role-based access control** — enforced on both backend (per-endpoint middleware) and frontend (route guards).
- **Real stock movements** — receiving, selling, transferring, and adjusting all update `batches.qty` and `products.qty` in the database.
- **FIFO picking** — the server selects the oldest batch with stock; non-FIFO overrides require a logged reason.
- **Picking Orders** — orders and line items are stored in the database; fulfillment deducts stock and cannot be repeated.
- **Full purchasing flow** — Purchase Requests → Convert to PO → Approve → Received (with status guard at each step).
- **Persisted settings** — admin settings (low stock alerts, expiry alerts, etc.) are stored in the `settings` table.
- **Real dashboard data** — all stat cards and charts pull from live database queries.
- **Audit log** — stock movements, PO approvals, user changes, and FIFO overrides all generate audit entries with Asia/Manila timestamps.
- **Add/Edit products** with SKU field; batch expiry dates for FIFO.
- **Inactive users are blocked** from logging in.
- **Admin sets a temporary password** when creating users; the user is flagged to change it on first login.

---

## Project Structure

```
WalangBrownout-share/
├── backend/           Laravel 11 API
│   ├── app/
│   │   ├── Http/Controllers/Api/   All API controllers
│   │   └── Models/                 Eloquent models
│   ├── database/
│   │   ├── migrations/             Schema migrations
│   │   └── seeders/                Demo data seeder (idempotent)
│   └── routes/api.php              All API routes
└── frontend/          React + Vite SPA
    └── src/
        ├── pages/                  One folder per role
        ├── components/             Shared UI components
        ├── services/api.js         API client (all fetch calls)
        └── context/                AuthContext, ToastContext
```

---

## Environment Variables

### Backend (`backend/.env`)

| Key | Description |
|---|---|
| `APP_TIMEZONE` | Set to `Asia/Manila` |
| `DB_CONNECTION` | `sqlite` (default) or `mysql` |
| `FRONTEND_URL` | Deployed frontend URL (added to CORS) |
| `SANCTUM_STATEFUL_DOMAINS` | Comma-separated domains for Sanctum |

### Frontend (`frontend/.env` or `.env.local`)

| Key | Description |
|---|---|
| `VITE_API_URL` | Full URL of the Laravel API, e.g. `http://localhost:8000/api` |

---

## Deploying

1. Set `FRONTEND_URL` in `backend/.env` to your Vercel/Netlify URL.
2. Set `VITE_API_URL` in the frontend environment to your production API URL.
3. Run `php artisan migrate --seed` on the production server.
4. The CORS config in `config/cors.php` automatically picks up `FRONTEND_URL`.
