# WalangBrownout — Laravel Backend Setup Guide

This package contains a **working Laravel project skeleton** (config, routes,
models, controllers, migrations, seeder already wired together) plus **updated
frontend files** to connect your existing React app to it. React Router DOM
stays exactly as it was — only `api.js`, `AuthContext.jsx`, `Login.jsx`, and
`MainLayout.jsx` change on the frontend side.

I couldn't run `composer install` or `php artisan migrate` myself in this
sandbox (no internet / no PHP here), so the steps below assume you'll run
these commands yourself on your own machine, which should only take a few
minutes.

---

## Part 1 — Install PHP dependencies

Copy the whole `walangbrownout-backend/` folder from this zip to wherever you
keep your projects, then:

```bash
cd walangbrownout-backend
composer install
```

This reads `composer.json` (already set up with `laravel/framework` and
`laravel/sanctum`) and downloads everything into a `vendor/` folder.

## Part 2 — Set up your `.env`

Copy the example file and generate an app key:

```bash
cp .env.example .env
php artisan key:generate
```

Then open `.env` and confirm/edit the database section:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=walangbrownout
DB_USERNAME=root
DB_PASSWORD=
```

Create the `walangbrownout` database itself (e.g. via phpMyAdmin, or running
`CREATE DATABASE walangbrownout;` in MySQL/XAMPP/Laragon).

`SANCTUM_STATEFUL_DOMAINS` and `FRONTEND_URL` are already set in
`.env.example` to match Vite's default `localhost:5173` — no changes needed
unless your frontend runs on a different port.

## Part 3 — API routing (already wired up)

`bootstrap/app.php`, `routes/web.php`, `routes/api.php`, and `routes/console.php`
are already included and configured — API routing and Sanctum's stateful
middleware are enabled out of the box. You don't need to edit anything here.

## Part 4 — Migrate and seed

```bash
php artisan migrate
php artisan db:seed
```

This creates every table and fills them with the same data your frontend was
already using as mock data (products, users, purchase orders, suppliers,
audit logs, etc.), so the demo will look identical — except it's now coming
from a real database.

**Seeded demo accounts (password is `password` for all):**
| Role | Email |
|---|---|
| Warehouse Staff | staff@walangbrownout.test |
| System Admin | admin@walangbrownout.test |
| Purchasing Manager | manager@walangbrownout.test |
| Inventory Clerk | clerk@walangbrownout.test |

## Part 5 — Run the backend

```bash
php artisan serve
```

This starts the API at `http://localhost:8000`. Visit `http://localhost:8000`
in a browser — you should see a small JSON message confirming the API is
running.

---

## Part 6 — Update the frontend

Copy the files from this zip's `frontend-updates/` folder into your
**WalangBrownout** React project, overwriting the matching paths:

```
src/services/api.js                  → src/services/api.js
src/context/AuthContext.jsx          → src/context/AuthContext.jsx
src/pages/auth/Login.jsx             → src/pages/auth/Login.jsx
src/components/layout/MainLayout.jsx → src/components/layout/MainLayout.jsx
```

Add a `.env` file at the root of your React project (same folder as
`package.json`):

```
VITE_API_URL=http://localhost:8000/api
```

Then run your frontend as usual:

```bash
npm run dev
```

Log in with any of the 4 seeded demo accounts above — the app now reads and
writes real data through Laravel instead of the old mock `data/*.js` files.

---

## What changed vs. the mock version

- **api.js** — every function now does a real `fetch()` call to Laravel with a
  Sanctum bearer token, instead of resolving local mock arrays after a fake delay.
- **AuthContext.jsx** — stores the token in `localStorage`, and on page reload
  calls `GET /api/me` to restore the session instead of losing login state on
  every refresh (the old mock version had no real persistence at all).
- **Login.jsx** — now logs in with email + password against real user
  records, instead of just typing any username.
- **MainLayout.jsx** — shows a brief "Checking session..." state while
  verifying a saved token, instead of always flashing back to `/login` first.
- **Pages you haven't touched yet** (Products, Users, PurchaseOrders, etc.)
  still call the *same* `api.js` function names as before (`api.getProducts()`,
  `api.getUsers()`, etc.), so **no other page files need to change** — the
  contract each block's pages already rely on stayed the same on purpose.

## Still worth doing per block (optional follow-ups)

A few pages currently update only local React state for actions instead of
calling the backend (since that's how the original mock version worked). If
your team wants full persistence, each block owner can wire these up using
the new functions already added to `api.js`:

- **Block 3 (Inventory)** — `Products.jsx`'s restock button → call
  `api.restockProduct(id)`; `StockAdjustments.jsx`'s modal → call
  `api.adjustBatch(id, newCount, reason)`.
- **Block 4 (Warehouse)** — `Receiving.jsx` / the Transfer modal → call
  `api.addStockMovement({...})`.
- **Block 5 (Purchasing)** — `PurchaseOrders.jsx`'s "New PO" → call
  `api.addPurchaseOrder(form)`; `PurchaseRequests.jsx`'s "Convert to PO" →
  call `api.convertPurchaseRequest(code)`.

These aren't required for the backend to work — the GET endpoints for every
page already return real data from the database — but wiring these specific
actions in means changes actually save instead of resetting on refresh.

## Troubleshooting

- **"could not find driver" on migrate** — your PHP install is missing the
  `pdo_mysql` extension. Enable it in `php.ini` (uncomment
  `extension=pdo_mysql`) and restart your server.
- **CORS error in the browser console** — double check `config/cors.php`
  lists your frontend's actual URL/port in `allowed_origins`, and that
  `VITE_API_URL` in your frontend `.env` matches where `php artisan serve`
  is actually running.
- **401 Unauthorized on every request after login** — make sure `api.js` is
  sending the token as `Authorization: Bearer <token>` (it does by default in
  this package) and that you copied the token correctly into `localStorage`
  under the key `wb_token`.
