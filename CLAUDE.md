# Products Manager

Full-stack product and order management application with two user roles: **Sellers** and **Customers**.

---

## How the project works

### User roles
- **Seller:** registers, logs in, and manages their products (create, edit, delete, upload images). Can see inventory amounts and full product details.
- **Customer:** registers, logs in, browses products, adds them to a cart, and places orders. Does not see inventory amounts.

### Application flow
1. The user lands on a public **Landing Page** that explains the platform and offers two entry points: "Enter as Seller" or "Enter as Customer".
2. Each role has its own **register** and **login** pages.
3. After login, the backend issues a short-lived **JWT access token** (15 min) returned in the response body, and a long-lived **refresh token** (30 days) set as an httpOnly cookie.
4. The frontend stores the access token in memory (Zustand + sessionStorage). The refresh token is handled automatically by the browser cookie and refreshed via Axios interceptors when the access token expires.
5. **Seller area:**
   - Lists all products with pagination and text search.
   - Creates products in batch (category is auto-created if it doesn't exist).
   - Uploads product images to an S3 bucket; the resulting URL is saved in the database.
   - Edits and deletes products (deleting the last product of a category also removes that category).
6. **Customer area:**
   - Browses products with pagination and text search (sees a reduced set of fields — no inventory amount).
   - Adds products to a local cart (Zustand) with quantity selection.
   - Reviews the cart and places an order via the checkout page.
   - Lists all past orders with their status and product details.

### Authentication flow
- Both roles share the same JWT mechanism but use separate endpoints (`/seller/*` vs `/customer/*`).
- The Axios response interceptor automatically calls the refresh-token endpoint on 401 responses and retries the original request. On refresh failure (403) it clears the auth store and redirects to the appropriate login page.

---

## Repository structure

```
/
├── backend/                  → NestJS REST API
│   ├── CLAUDE.md             → Backend requirements, tech stack, and directory structure
│   ├── Dockerfile
│   └── docs/
│       ├── requirements/
│       │   ├── sellers.md    → Seller module: schema + all routes
│       │   ├── customers.md  → Customer module: schema + all routes
│       │   ├── products.md   → Products module: schema + all routes
│       │   ├── orders.md     → Orders module: schema + all routes
│       │   └── categories.md → Categories module: schema (no direct routes)
│       └── files-patterns/
│           ├── aggregate-root.md
│           ├── entity.md
│           ├── value-object.md
│           ├── schema.md
│           ├── repository.md
│           ├── service.md
│           ├── controller.md
│           ├── bidirectional-mapper.md
│           └── unidirectional-mapper.md
│
├── frontend/                 → Next.js web application
│   ├── CLAUDE.md             → Frontend requirements, tech stack, and directory structure
│   ├── Dockerfile
│   └── docs/
│       ├── requirements/
│       │   ├── landing.md    → Landing page
│       │   ├── auth.md       → Login, register, logout, refresh token (seller & customer)
│       │   ├── products.md   → Product list, create, edit, delete (seller & customer views)
│       │   └── orders.md     → Order list and cart/checkout (customer)
│       └── files-patterns/
│           ├── page.md
│           ├── component.md
│           ├── hook.md
│           ├── service.md
│           └── store.md
│
├── docker-compose.yml        → Brings up backend, frontend, and MongoDB
├── .env                      → Environment variables for all services
├── CLAUDE.md                 → This file
└── TODO.md                   → Planned features not yet implemented.
                                **Ignore during development unless explicitly asked.**
```

---

## Infrastructure

- Each application has its own `Dockerfile` (`backend/Dockerfile`, `frontend/Dockerfile`).
- `docker-compose.yml` at the root brings up three services:
  - `db` — MongoDB instance
  - `backend` — depends on `db` being healthy
  - `frontend` — depends on `backend` being healthy
- All environment variables are defined in a `.env` file at the root and referenced via `env_file` in `docker-compose.yml`.
