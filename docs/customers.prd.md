# Customers — PRD 2

---

## Conventions

> Applies to all PRDs. Never omit.

- Every aggregate, entity, value-object, service, controller, and mapper follows the pattern file from `backend/docs/files-patterns/`.
- `ddd-tool-kit` is the sole source of DDD primitives.
- Error responses follow `{ status_code, status_name, error_message }` via `getCorrectNestjsErrorByOutput(output)`.
- All controllers have `@ApiTags`, `@ApiOperation`, `@ApiResponse`.
- Frontend: every page follows `page.md`, every component follows `component.md`, etc.
- **No `TODO.md` items**: no price-range filter, no sorting.

---

## Overview

Customers module: the second user role. Customers register, authenticate, and manage their account. Structurally identical to the Sellers module, with three differences:
- No `organization_name` field
- Uses `JWT_CUSTOMER_SECRET` and `type: "customer"` in the token payload
- `CustomerJwtStrategy` validates `type === "customer"`

This PRD also creates:
- The protected layouts for Seller and Customer (`SellerLayout`, `CustomerLayout`)
- The `cart.store` on the frontend (used in PRD 5)

---

## Prerequisites

PRD 1 completed:
- NestJS scaffolded, `AppModule` running, `MongooseModule` connected
- `PasswordValueObject` at `src/shared/value-objects/password/`
- `LoggingMiddleware` applied globally
- `getCorrectNestjsErrorByOutput` created at `src/utils/`
- `SellerJwtGuard` available
- Frontend scaffolded, `api.ts` and `useAuthStore` created
- `AuthLayout`, `Button`, `Input`, `FormError` available

---

## Backend

### Domain

**Location:** `src/modules/customers/domain/`

#### `customer.props.ts`
```ts
interface ICustomerProps extends IBaseDomainAggregate {
  name: NameValueObject;         // local — do not import from sellers module
  email: EmailValueObject;       // local
  password: PasswordValueObject; // import from src/shared
  refreshTokens: RefreshTokenEntity[];
}
```

> The `NameValueObject` and `EmailValueObject` are created locally in the customers module with the same validation rules as in sellers. Modules are decoupled — never import VOs from another module.

#### `customer.errors.ts`
```ts
CUSTOMER_INVALID_PROPS        → { message: "Invalid customer props.", statusCode: 400 }
CUSTOMER_EMAIL_ALREADY_EXISTS → { message: "Customer email already exists!", statusCode: 409 }
CUSTOMER_EMAIL_OR_PASSWORD_INCORRECT → { message: "Customer email or password is incorrect!", statusCode: 401 }
CUSTOMER_INVALID_ACCESS_TOKEN  → { message: "Invalid access token!", statusCode: 403 }
CUSTOMER_INVALID_REFRESH_TOKEN → { message: "Invalid refresh token!", statusCode: 403 }
CUSTOMER_NOT_FOUND             → { message: "Customer not found.", statusCode: 404 }
```

#### `customer.aggregate-root.ts`
Follows `aggregate-root.md`. No `organizationName` field.
- Methods: `changeName`, `changeEmail`, `changePassword`, `addRefreshToken`, `removeRefreshToken`, `validatePassword`
- `isValidProps()`: verifies `["name", "email", "password"]` + defaultValueObjects

#### Value Objects

**`value-objects/name/`** — same rules as sellers: 2–100 chars, trim, error 400.

**`value-objects/email/`** — same rules as sellers: regex, toLowerCase+trim, error 400.

Create `.spec.ts` for both.

#### Entity: `RefreshTokenEntity`

Identical to the sellers module. Create at `customer/domain/entities/refresh-token/`. Same logic for `hash`, `renew()`, `secondsUntilExpiration`.

Create `.spec.ts`.

---

### Schema

**`src/modules/customers/repositories/customers/schema/customer.schema.ts`:**
```ts
interface IRefreshTokenSchema {
  id: string;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

interface ICustomerSchema {
  id: string;
  name: string;
  email: string;
  password: string;
  refresh_tokens: IRefreshTokenSchema[]; // array (corrects omission in original docs)
  created_at: Date;
  updated_at: Date;
}
```
`CustomerSchema` with unique indexes on `id` and `email`. `RefreshTokenSchema` as a subdocument.

---

### Mapper

**`customer.mapper.ts`** implements `IBidirectionalMapper<ICustomerSchema, CustomerAggregate>`.

**`refresh-token.mapper.ts`** implements `IBidirectionalMapper<IRefreshTokenSchema, RefreshTokenEntity>`.

---

### Repository

**`customer-repository.interface.ts`:**
```ts
interface CustomerRepository {
  findById(id: IdValueObject): Promise<CustomerAggregate | null>;
  findByEmail(email: EmailValueObject): Promise<CustomerAggregate | null>;
  save(customer: CustomerAggregate): Promise<void>;
}
```

**`mongoose.customer-repository.ts`**: follows `repository.md`. `save()` uses `insertOne` or `replaceOne`.

Create `.test.ts`: `save`, `findByEmail`, `findById`.

---

### Services

Follows the same structure as sellers services, with 8 services (no organization service).

#### 1. `CreateBatchCustomersService`
- Input: `{ customers: [{ name, email, password }] }`
- For each customer: `findByEmail` → `CUSTOMER_EMAIL_ALREADY_EXISTS` if found; init VOs; init aggregate; `save()`
- Output: `{ customers: [{ id, name, email }] }`
- `.spec.ts`: creates successfully, duplicate email

#### 2. `CustomerLoginService`
- Input: `{ email, password }`
- Same logic as seller login, but uses `JWT_CUSTOMER_SECRET` and payload `{ sub, type: "customer" }`
- Output: `{ id, access_token, access_token_expiration_date, refresh_token_expiration_date, refresh_token: string }`
- `.spec.ts`: successful login, email not found, wrong password

#### 3. `CustomerRefreshTokenService`
- Identical logic to seller refresh: cookie contains raw token id; compares against stored hash via `bcryptjs.compareSync`
- Output: same shape as login
- `.spec.ts`: valid refresh, expired, not found

#### 4. `CustomerLogoutService`
- Clears all refresh tokens from the customer
- Output: void

#### 5. `GetCustomerInfoService`
- Input: `{ customerId }`
- Output: `{ id, name, email }`

#### 6. `ChangeCustomerNameService`
- Input: `{ customerId, name }`; output: void (204)

#### 7. `ChangeCustomerEmailService`
- Input: `{ customerId, email }`; checks uniqueness; output: void (204)

#### 8. `ChangeCustomerPasswordService`
- Input: `{ customerId, oldPassword, newPassword }`; validates old password; output: void (204)

Create `.spec.ts` for each service.

---

### Controllers

**`CustomerJwtStrategy`** (`customer-jwt.strategy.ts`):
- `PassportStrategy(Strategy, 'customer-jwt')`
- `secretOrKey`: `configService.get('JWT_CUSTOMER_SECRET')`
- `validate(payload)`: throws `UnauthorizedException` if `payload.type !== 'customer'`; returns `{ customerId: payload.sub }`

**`CustomerJwtGuard`**: extends `AuthGuard('customer-jwt')`

| File | Route | Guard | Body/Params | Status |
|---|---|---|---|---|
| `create-batch-customers.controller.ts` | `POST /customers` | none | `{ customers[] }` | 201/409 |
| `customer-login.controller.ts` | `POST /customer/login` | none | `{ email, password }` | 200/401 |
| `customer-refresh-token.controller.ts` | `POST /customer/refresh-token` | none | cookie `refresh_token` | 200/403 |
| `customer-logout.controller.ts` | `POST /customer/logout` | CustomerJwtGuard | — | 200/403 |
| `get-customer-info.controller.ts` | `GET /customer` | CustomerJwtGuard | — | 200/403 |
| `change-customer-name.controller.ts` | `PATCH /customer/name` | CustomerJwtGuard | `{ name }` | 204/403 |
| `change-customer-email.controller.ts` | `PATCH /customer/email` | CustomerJwtGuard | `{ email }` | 204/403 |
| `change-customer-password.controller.ts` | `PATCH /customer/password` | CustomerJwtGuard | `{ oldPassword, newPassword }` | 204/403 |

- Login/refresh-token set the `refresh_token` cookie (httpOnly, maxAge 30 days)
- Logout clears the `refresh_token` cookie

Create `.test.ts` for each controller.

---

### Module Wiring

**`customer.module.ts`:**
```ts
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Customer', schema: CustomerSchema }]),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_CUSTOMER_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
  ],
  providers: [
    CustomerJwtStrategy,
    CustomerJwtGuard,
    RefreshTokenMapper,
    CustomerMapper,
    MongooseCustomerRepository,
    CreateBatchCustomersService,
    CustomerLoginService,
    CustomerRefreshTokenService,
    CustomerLogoutService,
    GetCustomerInfoService,
    ChangeCustomerNameService,
    ChangeCustomerEmailService,
    ChangeCustomerPasswordService,
    // controllers
  ],
  exports: [MongooseCustomerRepository, CustomerJwtGuard, CustomerJwtStrategy],
})
export class CustomersModule {}
```

Register `CustomersModule` in `AppModule`.

---

### Tests

`.spec.ts`: `CustomerAggregate`, both value objects, `RefreshTokenEntity`, all 8 services.

`.test.ts`: `MongooseCustomerRepository`, all 8 controllers.

---

## Frontend

### Pages

#### `src/app/(customer)/register/page.tsx`
```
Form fields: name, email, password (all required)
On submit → customersService.create([{ name, email, password }])
  201 → router.push("/customer/login")
  409 → <FormError> "This email is already in use."
Wrapped in <AuthLayout title="Create Customer Account">
Link to /customer/login
```

#### `src/app/(customer)/login/page.tsx`
```
Form fields: email, password (both required)
On submit → customersService.login({ email, password })
  200 → useAuthStore.setAuth(data.access_token, "customer", data.id)
        router.push("/customer/products")
  401 → <FormError> "Email or password is incorrect."
Wrapped in <AuthLayout title="Customer Login">
Link to /customer/register
```

> **Note:** `data.id` is the customer `id` returned by the login endpoint. The backend must include `id` in the login response (add it to `CustomerLoginService` output). The same applies to seller login in PRD 1.

### Components

**`src/components/layout/SellerLayout.tsx` (Client Component):**
```
Props: { children: React.ReactNode }

Route guard:
  useEffect: if !accessToken || userType !== "seller" → router.replace("/seller/login")
  if !accessToken || userType !== "seller" → return null

Header:
  - App logo/title (link to /seller/products)
  - "Log out" button → sellersService.logout() → useAuthStore.clear() → router.push("/seller/login")

Render:
  <div>
    <SellerHeader />
    <main>{children}</main>
  </div>
```

**`src/components/layout/CustomerLayout.tsx` (Client Component):**
```
Props: { children: React.ReactNode }

Route guard:
  useEffect: if !accessToken || userType !== "customer" → router.replace("/customer/login")
  if !accessToken || userType !== "customer" → return null

Header:
  - App logo/title (link to /customer/products)
  - Cart badge: shows useCartStore().items.length; navigates to /customer/orders/new on click
  - "Log out" button → customersService.logout() → useAuthStore.clear() → router.push("/customer/login")

Render:
  <div>
    <CustomerHeader />
    <main>{children}</main>
  </div>
```

> `SellerLayout` and `CustomerLayout` are used as wrappers in all protected pages of each respective role from PRDs 4 and 5 onward.

### Stores

**`src/store/cart.store.ts`** (created here, used in PRDs 4 and 5):
```ts
interface CartItem {
  product_id: string;
  name: string;
  price: number;
  ammount: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;        // merges if product_id already exists (adds ammount)
  updateQuantity: (product_id: string, ammount: number) => void;
  removeItem: (product_id: string) => void;
  clear: () => void;
  totalPrice: () => number;                  // sum(price * ammount)
}
```

### Services

**`src/services/customers.service.ts`:**
```ts
customersService = {
  create(customers: ICreateCustomerInput[]): Promise<{ customers: ICustomerOutput[] }>
    → POST /customers body: { customers }

  login(input: ICustomerLoginInput): Promise<ICustomerLoginOutput>
    → POST /customer/login

  logout(): Promise<void>
    → POST /customer/logout

  getInfo(): Promise<ICustomerOutput>
    → GET /customer
}
```

### Types

**`src/types/customer.types.ts`:**
```ts
interface ICustomerOutput { id: string; name: string; email: string; }
interface ICreateCustomerInput { name: string; email: string; password: string; }
interface ICustomerLoginInput { email: string; password: string; }
interface ICustomerLoginOutput {
  id: string; // included in login response so frontend can store it in auth store
  access_token: string;
  access_token_expiration_date: Date;
  refresh_token_expiration_date: Date;
}
```

> The same `id` field must be added to `ISellerLoginOutput` (PRD 1) and `SellerLoginService`.

### User Flows

1. Visitor clicks "Enter as Customer" on the landing page → `/customer/login`
2. No account → link to `/customer/register` → fills `name, email, password` → 201 → `/customer/login`
3. Login → token + userId stored in `useAuthStore` → redirect to `/customer/products` (placeholder until PRD 4)
4. `CustomerLayout` guard: any protected customer route without a token → redirect to `/customer/login`
5. `SellerLayout` guard: any protected seller route without a token → redirect to `/seller/login`

---

## Environment Variables

No new variables. All declared in PRD 1.

---

## Acceptance Criteria

1. `POST /customers` with valid body returns 201 with IDs
2. `POST /customers` with duplicate email returns 409 `"Customer email already exists!"`
3. `POST /customer/login` returns 200 with `access_token` and httpOnly `refresh_token` cookie
4. `POST /customer/login` with invalid credentials returns 401
5. `POST /customer/refresh-token` with valid cookie returns a new token pair
6. `POST /customer/refresh-token` with invalid/expired cookie returns 403
7. `GET /customer` with valid token returns `{ id, name, email }`
8. All `PATCH /customer/*` routes return 204
9. Frontend: customer register and login pages work analogously to seller equivalents
10. `cart.store` initialized: badge shows 0 in `CustomerLayout`
11. `CustomerLayout` redirects unauthenticated users to `/customer/login`
12. `SellerLayout` redirects unauthenticated users to `/seller/login`
13. Log-out buttons clear the store and redirect correctly
