# Goal:
Develop a product management web application using Next.js App Router with TypeScript, consuming the backend REST API.

## Functional Requirements:
- For landing page requirements read `@docs/requirements/landing.md`.
- For authentication requirements (seller & customer login/register) read `@docs/requirements/auth.md`.
- For products page requirements (seller & customer views) read `@docs/requirements/products.md`.
- For orders page requirements (customer view) read `@docs/requirements/orders.md`.

## Technical Requirements:
- Use Next.js (App Router) with TypeScript.
- Use Tailwind CSS for all styling.
- Use Zustand for global state management.
- Use Axios for all HTTP requests.
  - Implement Axios request interceptor: attach the access token from Zustand to every request.
  - Implement Axios response interceptor: on 401, call the appropriate refresh-token endpoint, update the access token in Zustand, and retry the original request. On refresh failure (403), clear the store and redirect to the login page.
- Access tokens are stored in Zustand (in-memory). Refresh tokens are stored in httpOnly cookies (set automatically by the backend).
- The Zustand auth store must persist `userType` ("seller" | "customer") and `accessToken` across soft navigations. Use `zustand/middleware` `persist` with `sessionStorage` for this.
- Layout must be fully responsive.
- Implement pagination for all list views (products and orders).
- Write at least 1 snapshot test using Playwright (`@playwright/test`).
- When you write a page follow `@docs/files-patterns/page.md` as a pattern.
- When you write a component follow `@docs/files-patterns/component.md` as a pattern.
- When you write a custom hook follow `@docs/files-patterns/hook.md` as a pattern.
- When you write an API service follow `@docs/files-patterns/service.md` as a pattern.
- When you write a Zustand store follow `@docs/files-patterns/store.md` as a pattern.

- Use this directory structure:
```txt
src/
  |___app/                              -> Next.js App Router pages
  |   |___page.tsx                      -> Landing page (public)
  |   |___(seller)/                     -> Seller route group
  |   |   |___login/
  |   |   |   |___page.tsx
  |   |   |___register/
  |   |   |   |___page.tsx
  |   |   |___products/
  |   |       |___page.tsx              -> Product list (seller view)
  |   |       |___new/
  |   |       |   |___page.tsx          -> Create product
  |   |       |___[id]/
  |   |           |___edit/
  |   |               |___page.tsx      -> Edit product
  |   |
  |   |___(customer)/                   -> Customer route group
  |       |___login/
  |       |   |___page.tsx
  |       |___register/
  |       |   |___page.tsx
  |       |___products/
  |       |   |___page.tsx              -> Product list (customer view)
  |       |___orders/
  |           |___page.tsx              -> Orders list
  |           |___new/
  |               |___page.tsx          -> Create order (cart review)
  |
  |___components/                       -> Reusable UI components
  |   |___ui/                           -> Base components (Button, Input, Modal, Pagination, etc.)
  |   |___products/                     -> Product-specific components
  |   |___orders/                       -> Order-specific components
  |   |___layout/                       -> Layout components (Header, Footer, Sidebar)
  |
  |___hooks/                            -> Custom React hooks
  |
  |___services/                         -> Axios API service layer
  |   |___api.ts                        -> Axios instance with interceptors
  |   |___products.service.ts
  |   |___orders.service.ts
  |   |___sellers.service.ts
  |   |___customers.service.ts
  |
  |___store/                            -> Zustand stores
  |   |___auth.store.ts                 -> Access token + user type
  |   |___cart.store.ts                 -> Customer cart (products selected for order)
  |
  |___types/                            -> TypeScript interfaces/types
  |   |___product.types.ts
  |   |___order.types.ts
  |   |___seller.types.ts
  |   |___customer.types.ts
  |
  |___utils/                            -> Utility functions
```
