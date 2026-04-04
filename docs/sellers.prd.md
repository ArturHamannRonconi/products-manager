# Sellers — PRD 1

---

## Conventions

> Applies to all PRDs. Never omit.

- Every aggregate, entity, value-object, service, controller, and mapper follows the pattern file from `backend/docs/files-patterns/`.
- `ddd-tool-kit` is the sole source of DDD primitives: `Aggregate`, `Entity`, `ValueObject`, `Output`, `IError`, `IdValueObject`, `DateValueObject`, `IBaseDomainAggregate`, `IBaseDomainEntity`, `IBaseDomainValueObject`, `IBidirectionalMapper`, `IUnidirectionalMapper`, `throwFailOutput`, `throwFailInternalServer`, `verifyAllPropsExists`, `verifyAreValueObjects`, `HttpStatus`.
- Error responses follow `{ status_code, status_name, error_message }` produced by `getCorrectNestjsErrorByOutput(output)` (utility to be created at `src/utils/`).
- All controllers have `@ApiTags`, `@ApiOperation`, `@ApiResponse` from `@nestjs/swagger`.
- The logging middleware is applied globally; no PRD needs to re-register it.
- Frontend: every page follows `frontend/docs/files-patterns/page.md`, every component follows `component.md`, every hook follows `hook.md`, every service follows `service.md`, every store follows `store.md`.
- **No `TODO.md` items**: no price-range filter, no sorting.

---

## Overview

This PRD covers two responsibilities:

1. **Full project scaffold** — NestJS backend, Next.js frontend, Docker, environment variables, and shared infrastructure (logging middleware, password value object).
2. **Sellers module** — registration, authentication (JWT access token + refresh token via httpOnly cookie), and seller account management.

Sellers are the first user role in the system: they create and manage products. No dependency on other business modules.

---

## Prerequisites

None. This is the first PRD; all infrastructure is created here.

---

## Project Setup

### Repository root

**`docker-compose.yml`:**
```yaml
version: "3.9"
services:
  db:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    env_file: .env
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    env_file: .env
    depends_on:
      backend:
        condition: service_healthy

volumes:
  mongo_data:
```

**`.env` (template — real values must not be committed):**
```env
# Backend
MONGODB_URI=mongodb://db:27017/products-manager
JWT_SELLER_SECRET=change_me_seller_secret
JWT_CUSTOMER_SECRET=change_me_customer_secret
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

### Backend scaffold

**Initialization:**
```bash
nest new backend --package-manager npm
# Choose: strict TypeScript yes
```

**Production dependencies:**
```bash
npm install ddd-tool-kit bcryptjs mongoose @nestjs/mongoose @nestjs/jwt @nestjs/passport passport passport-jwt cookie-parser @aws-sdk/client-s3 class-validator class-transformer @nestjs/swagger swagger-ui-express @nestjs/platform-express multer @nestjs/config
```

**Development dependencies:**
```bash
npm install -D @types/bcryptjs @types/passport-jwt @types/cookie-parser @types/multer
```

**`backend/Dockerfile`:**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/main"]
```

**`src/config/env.config.ts`:**
```ts
import { plainToInstance } from 'class-transformer';
import { IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString() MONGODB_URI: string;
  @IsString() JWT_SELLER_SECRET: string;
  @IsString() JWT_CUSTOMER_SECRET: string;
  @IsString() AWS_REGION: string;
  @IsString() AWS_ACCESS_KEY_ID: string;
  @IsString() AWS_SECRET_ACCESS_KEY: string;
  @IsString() S3_BUCKET_NAME: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) throw new Error(errors.toString());
  return validated;
}
```

**`src/middlewares/logging.middleware.ts`:**
```ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
  }
}
```

**`src/utils/get-nestjs-error.util.ts`:** `getCorrectNestjsErrorByOutput(output)` — reads `output.result` (an `IError` with `statusCode` and `message`) and throws the corresponding NestJS `HttpException`.

**`src/shared/value-objects/password/password.value-object.ts`:**
- Extends `ValueObject<IBaseDomainValueObject<string>>`
- `isValidProps()`: `this.props.value.length >= 8`
- `sanitizeProps()`: if `this.props.value.startsWith('$2')` skip (already a hash); otherwise `this.props.value = bcryptjs.hashSync(this.props.value, bcryptjs.genSaltSync())`
- Public method `comparePassword(plain: string): boolean` — `return bcryptjs.compareSync(plain, this.props.value)`
- Error: `INVALID_PASSWORD = { message: "Password must be at least 8 characters.", statusCode: HttpStatus.BAD_REQUEST }`

**`src/shared/value-objects/password/password.value-object.spec.ts`:** tests for: valid password (≥8 chars), too-short password, already-hashed password (does not re-hash), `comparePassword` returns true for a match, false for a mismatch.

**`src/main.ts`:** bootstrap NestJS with `cookie-parser`, global `ValidationPipe`, Swagger at `/api`, port 3001.

**`src/app.module.ts`:** imports `ConfigModule.forRoot({ validate: validateEnv, isGlobal: true })`, `MongooseModule.forRootAsync` (uses `ConfigService` for `MONGODB_URI`), `SellersModule`. Applies `LoggingMiddleware` globally via `configure(consumer)`.

---

### Frontend scaffold

**Initialization:**
```bash
npx create-next-app@latest frontend --typescript --tailwind --app --eslint --src-dir --no-import-alias
```

**Dependencies:**
```bash
npm install axios zustand
npm install -D @playwright/test
```

**`frontend/Dockerfile`:**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npx", "next", "start"]
```

**`src/store/auth.store.ts`:**
```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type UserType = 'seller' | 'customer';

interface AuthStore {
  accessToken: string | null;
  userType: UserType | null;
  userId: string | null;
  setAuth: (token: string, userType: UserType, userId: string) => void;
  setAccessToken: (token: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      userType: null,
      userId: null,
      setAuth: (token, userType, userId) => set({ accessToken: token, userType, userId }),
      setAccessToken: (token) => set({ accessToken: token }),
      clear: () => set({ accessToken: null, userType: null, userId: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
    }
  )
);
```

**`src/services/api.ts`:** Axios instance as shown in `frontend/docs/files-patterns/service.md`:
- `baseURL: process.env.NEXT_PUBLIC_API_URL`
- `withCredentials: true`
- Request interceptor: reads `useAuthStore.getState().accessToken`, injects `Authorization: Bearer <token>`
- Response interceptor: on 401, checks `userType` to choose endpoint (`/seller/refresh-token` or `/customer/refresh-token`), calls it, updates token with `setAccessToken`, retries original request; on 403 (refresh failure): `clear()` + `window.location.href = userType === "seller" ? "/seller/login" : "/customer/login"`

---

## Backend

### Domain

**Location:** `src/modules/sellers/domain/`

#### `seller.props.ts`
```ts
import { IBaseDomainAggregate } from 'ddd-tool-kit';
import { NameValueObject } from './value-objects/name/name.value-object';
import { EmailValueObject } from './value-objects/email/email.value-object';
import { PasswordValueObject } from '../../../shared/value-objects/password/password.value-object';
import { OrganizationNameValueObject } from './value-objects/organization-name/organization-name.value-object';
import { RefreshTokenEntity } from './entities/refresh-token/refresh-token.entity';

interface ISellerProps extends IBaseDomainAggregate {
  name: NameValueObject;
  email: EmailValueObject;
  password: PasswordValueObject;
  organizationName: OrganizationNameValueObject;
  refreshTokens: RefreshTokenEntity[];
}
export { ISellerProps };
```

#### `seller.errors.ts`
```ts
import { HttpStatus } from 'ddd-tool-kit';
export const SELLER_INVALID_PROPS = { message: 'Invalid seller props.', statusCode: HttpStatus.BAD_REQUEST };
export const SELLER_EMAIL_ALREADY_EXISTS = { message: 'Seller email already exists!', statusCode: HttpStatus.CONFLICT };
export const SELLER_EMAIL_OR_PASSWORD_INCORRECT = { message: 'Seller email or password is incorrect!', statusCode: HttpStatus.UNAUTHORIZED };
export const SELLER_INVALID_ACCESS_TOKEN = { message: 'Invalid access token!', statusCode: HttpStatus.FORBIDDEN };
export const SELLER_INVALID_REFRESH_TOKEN = { message: 'Invalid refresh token!', statusCode: HttpStatus.FORBIDDEN };
export const SELLER_NOT_FOUND = { message: 'Seller not found.', statusCode: HttpStatus.NOT_FOUND };
```

#### `seller.aggregate-root.ts`
Follows `backend/docs/files-patterns/aggregate-root.md`.
- Methods: `changeName(name)`, `changeEmail(email)`, `changeOrganizationName(org)`, `changePassword(password)`, `addRefreshToken(token: RefreshTokenEntity)`, `removeRefreshToken(tokenValue: string)` (filters array by hash), `validatePassword(plain: string): boolean` (delegates to `this.props.password.comparePassword(plain)`)
- `isValidProps()`: `verifyAllPropsExists(["name","email","password","organizationName"], this)` + `verifyAreValueObjects(["name","email","password","organizationName"], this)`

#### Value Objects

**`value-objects/name/`**:
- `NameValueObject`: `value.trim().length >= 2 && <= 100`; `sanitizeProps()`: trim; error: `"Name must be between 2 and 100 characters." (400)`

**`value-objects/email/`**:
- `EmailValueObject`: `/.+@.+\..+/.test(value)`; `sanitizeProps()`: `toLowerCase().trim()`; error: `"Invalid email format." (400)`

**`value-objects/organization-name/`**:
- `OrganizationNameValueObject`: `value.trim().length >= 2 && <= 100`; `sanitizeProps()`: trim; error: `"Organization name must be between 2 and 100 characters." (400)`

Create `.spec.ts` for each value object: valid case, invalid case, sanitization.

#### Entity: `RefreshTokenEntity`

**`entities/refresh-token/refresh-token.entity.ts`:**
- Props `IRefreshTokenProps extends IBaseDomainEntity`: `{ expiresAt: DateValueObject }`
- `get hash(): string` — `bcryptjs.hashSync(this.id.value, bcryptjs.genSaltSync())`
- `get secondsUntilExpiration(): number` — difference between `expiresAt.value` and `new Date()`, minimum 0
- `renew()` — `this.props.id = IdValueObject.getDefault(); this.props.expiresAt = DateValueObject.getDefault(); this.props.expiresAt.addDays(30)`
- `isValidProps()`: `verifyAllPropsExists(["expiresAt", ...defaultValueObjects], this)` + `verifyAreValueObjects`
- Error: `INVALID_REFRESH_TOKEN = { message: "Invalid refresh token.", statusCode: HttpStatus.BAD_REQUEST }`

Create `.spec.ts`: valid token, `renew()` resets id and expiration, `secondsUntilExpiration` is never negative.

---

### Schema

**`src/modules/sellers/repositories/sellers/schema/seller.schema.ts`:**
```ts
interface IRefreshTokenSchema {
  id: string;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

interface ISellerSchema {
  id: string;
  name: string;
  email: string;
  password: string;
  organization_name: string;
  refresh_tokens: IRefreshTokenSchema[];
  created_at: Date;
  updated_at: Date;
}
```
Mongoose `RefreshTokenSchema` as a subdocument. `SellerSchema` with unique indexes on `id` and `email`.

---

### Mapper

**`seller.mapper.ts`** implements `IBidirectionalMapper<ISellerSchema, SellerAggregate>`:
- `toRightSide(schema → SellerAggregate)`: reconstructs all VOs and entities from raw schema values
- `toLeftSide(aggregate �� ISellerSchema)`: unwraps `.value` from each VO

**`refresh-token.mapper.ts`** implements `IBidirectionalMapper<IRefreshTokenSchema, RefreshTokenEntity>`.

---

### Repository

**`seller-repository.interface.ts`:**
```ts
interface SellerRepository {
  findById(id: IdValueObject): Promise<SellerAggregate | null>;
  findByEmail(email: EmailValueObject): Promise<SellerAggregate | null>;
  save(seller: SellerAggregate): Promise<void>;
}
```

**`mongoose.seller-repository.ts`**: follows `backend/docs/files-patterns/repository.md`. `save()` checks existence by `id`, uses `insertOne` or `replaceOne`. Injects `Model<ISellerSchema>` and `SellerMapper`.

Create `.test.ts`: tests `save` (insert + update), `findByEmail`, `findById` with in-memory MongoDB.

---

### Services

All implement `Service<Input, Output>` from `backend/docs/files-patterns/service.md`.

#### 1. `CreateBatchSellersService`
- Input: `{ sellers: [{ name, email, password, organization_name }] }`
- For each seller: `findByEmail` → if found return `SELLER_EMAIL_ALREADY_EXISTS`; init VOs; init `SellerAggregate`; `save()`
- Output: `{ sellers: [{ id, name, email, organization_name }] }`
- `.spec.ts`: creates successfully, fails with duplicate email

#### 2. `SellerLoginService`
- Input: `{ email, password }`
- Find by email → if not found: `SELLER_EMAIL_OR_PASSWORD_INCORRECT`; validate password with `validatePassword(plain)` → if invalid: same error
- Generate JWT access token (15min, `JWT_SELLER_SECRET`, payload `{ sub: seller.id.value, type: "seller" }`)
- Create `RefreshTokenEntity` (30 days), call `seller.addRefreshToken(entity)`, save seller
- Output: `{ id, access_token, access_token_expiration_date: Date, refresh_token_expiration_date: Date, refresh_token: string (the entity's raw id) }`
- The controller sets the cookie; the service returns the raw id as `refresh_token`
- `.spec.ts`: successful login, email not found, wrong password

#### 3. `SellerRefreshTokenService`
- Input: `{ refreshToken: string }` (raw cookie value, which is the raw id of the `RefreshTokenEntity`)
- **Storage strategy**: the hash (`bcryptjs.hashSync(id)`) is stored in `refresh_tokens[].id` in the schema. The cookie contains the **raw token id**. On validation: for each token in `refreshTokens`, `bcryptjs.compareSync(cookieRawId, storedHash)`.
- Checks `secondsUntilExpiration > 0`; if expired: `SELLER_INVALID_REFRESH_TOKEN`
- Calls `token.renew()`, saves seller, generates new access token and new refresh token
- Output: same shape as login
- `.spec.ts`: valid refresh, expired token, token not found

#### 4. `SellerLogoutService`
- Input: `{ sellerId: string }` (from JWT guard)
- Find seller by id; clear all refresh tokens (`seller.props.refreshTokens = []`); save
- Output: void
- `.spec.ts`: logout clears tokens

#### 5. `GetSellerInfoService`
- Input: `{ sellerId: string }`
- Output: `{ id, name, email, organization_name }`

#### 6. `ChangeSellerNameService`
- Input: `{ sellerId, name }`
- Init `NameValueObject`, call `seller.changeName()`, save
- Output: void (204)

#### 7. `ChangeSellerOrganizationService`
- Input: `{ sellerId, name }`
- Init `OrganizationNameValueObject`, call `seller.changeOrganizationName()`, save; output: void

#### 8. `ChangeSellerEmailService`
- Input: `{ sellerId, email }`
- Check new email is not taken by another seller (`findByEmail`); init `EmailValueObject`, call `seller.changeEmail()`, save; output: void

#### 9. `ChangeSellerPasswordService`
- Input: `{ sellerId, oldPassword, newPassword }`
- Validate `oldPassword` with `seller.validatePassword(oldPassword)` → `SELLER_EMAIL_OR_PASSWORD_INCORRECT` if invalid
- Init new `PasswordValueObject`, call `seller.changePassword()`, save; output: void

---

### Controllers

**`SellerJwtStrategy`** (`seller-jwt.strategy.ts`):
- Extends `PassportStrategy(Strategy, 'seller-jwt')`
- `jwtFromRequest`: `ExtractJwt.fromAuthHeaderAsBearerToken()`
- `secretOrKey`: `configService.get('JWT_SELLER_SECRET')`
- `validate(payload)`: throws `UnauthorizedException` if `payload.type !== 'seller'`; returns `{ sellerId: payload.sub }`

**`SellerJwtGuard`**: extends `AuthGuard('seller-jwt')`

| File | Route | Guard | Body/Params | Status |
|---|---|---|---|---|
| `create-batch-sellers.controller.ts` | `POST /sellers` | none | `{ sellers[] }` | 201/409 |
| `seller-login.controller.ts` | `POST /seller/login` | none | `{ email, password }` | 200/401 |
| `seller-refresh-token.controller.ts` | `POST /seller/refresh-token` | none | cookie `refresh_token` | 200/403 |
| `seller-logout.controller.ts` | `POST /seller/logout` | SellerJwtGuard | — | 200/403 |
| `get-seller-info.controller.ts` | `GET /seller` | SellerJwtGuard | — | 200/403 |
| `change-seller-name.controller.ts` | `PATCH /seller/name` | SellerJwtGuard | `{ name }` | 204/403 |
| `change-seller-org.controller.ts` | `PATCH /seller/org` | SellerJwtGuard | `{ name }` | 204/403 |
| `change-seller-email.controller.ts` | `PATCH /seller/email` | SellerJwtGuard | `{ email }` | 204/403 |
| `change-seller-password.controller.ts` | `PATCH /seller/password` | SellerJwtGuard | `{ oldPassword, newPassword }` | 204/403 |

- Login and refresh-token controllers: set cookie via `@Res({ passthrough: true }) res: Response` → `res.cookie('refresh_token', token, { httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 })`
- Logout controller: `res.clearCookie('refresh_token')`
- Refresh-token controller: reads cookie via `@Req() req: Request` → `req.cookies['refresh_token']`

Create `.test.ts` for each controller.

---

### Module Wiring

**`seller.module.ts`:**
```ts
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Seller', schema: SellerSchema }]),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SELLER_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
  ],
  providers: [
    SellerJwtStrategy,
    SellerJwtGuard,
    RefreshTokenMapper,
    SellerMapper,
    MongooseSellerRepository,
    CreateBatchSellersService,
    SellerLoginService,
    SellerRefreshTokenService,
    SellerLogoutService,
    GetSellerInfoService,
    ChangeSellerNameService,
    ChangeSellerOrganizationService,
    ChangeSellerEmailService,
    ChangeSellerPasswordService,
    // controllers
  ],
  exports: [MongooseSellerRepository], // required for ProductsModule in PRD 4
})
export class SellersModule {}
```

---

### Tests

Create `.spec.ts` for: `SellerAggregate`, `NameValueObject`, `EmailValueObject`, `OrganizationNameValueObject`, `PasswordValueObject`, `RefreshTokenEntity`, all 9 services.

Create `.test.ts` for: `MongooseSellerRepository`, all 9 controllers.

---

## Frontend

### Pages

#### `src/app/page.tsx` — Landing (Client Component)
```
"use client"
useEffect: if accessToken && userType === "seller" → router.replace("/seller/products")
           if accessToken && userType === "customer" → router.replace("/customer/products")
Render: app title, short description, two CTA buttons using <Button variant="primary">
  - "Enter as Seller" → router.push("/seller/login")
  - "Enter as Customer" → router.push("/customer/login")
```

#### `src/app/(seller)/register/page.tsx`
```
Form fields: name, email, password, organization_name (all required)
On submit ��� sellersService.create([{ name, email, password, organization_name }])
  201 → router.push("/seller/login")
  409 → <FormError> "This email is already in use."
  other errors → generic <FormError>
Wrapped in <AuthLayout title="Create Seller Account">
```

#### `src/app/(seller)/login/page.tsx`
```
Form fields: email, password (both required)
On submit → sellersService.login({ email, password })
  200 → useAuthStore.setAuth(access_token, "seller", data.id)
        router.push("/seller/products")
  401 → <FormError> "Email or password is incorrect."
Wrapped in <AuthLayout title="Seller Login">
Link to /seller/register
```

### Components

**`src/components/ui/Button.tsx`:**
- Props: `variant?: "primary"|"secondary"|"danger"`, `isLoading?: boolean`, `disabled?: boolean`, native `<button>` props
- Tailwind classes per variant; spinner when `isLoading`

**`src/components/ui/Input.tsx`:**
- Props: `label: string`, `error?: string`, `type?`, native `<input>` props
- Displays label above, error below in red

**`src/components/ui/FormError.tsx`:**
- Props: `message: string`
- Displays error message in red with an optional icon

**`src/components/layout/AuthLayout.tsx`:**
- Props: `title: string`, `children: React.ReactNode`
- Centers content on screen, card with shadow, title at the top
- Used on all login and register pages

### Services

**`src/services/sellers.service.ts`:**
```ts
sellerService = {
  create(sellers: ICreateSellerInput[]): Promise<{ sellers: ISellerOutput[] }>
    → POST /sellers body: { sellers }

  login(input: ISellerLoginInput): Promise<ISellerLoginOutput>
    → POST /seller/login

  logout(): Promise<void>
    → POST /seller/logout

  getInfo(): Promise<ISellerOutput>
    → GET /seller
}
```

### Types

**`src/types/seller.types.ts`:**
```ts
interface ISellerOutput { id: string; name: string; email: string; organization_name: string; }
interface ICreateSellerInput { name: string; email: string; password: string; organization_name: string; }
interface ISellerLoginInput { email: string; password: string; }
interface ISellerLoginOutput {
  id: string;
  access_token: string;
  access_token_expiration_date: Date;
  refresh_token_expiration_date: Date;
}
```

### User Flows

1. Visitor opens `/` → sees landing with two CTAs
2. Clicks "Enter as Seller" → `/seller/login`
3. No account → link to `/seller/register` → fills form → 201 → redirect to `/seller/login`
4. Fills login form → 200 → token stored in sessionStorage ��� redirect to `/seller/products` (placeholder until PRD 4)

---

## Environment Variables

```env
MONGODB_URI=mongodb://db:27017/products-manager
JWT_SELLER_SECRET=change_me_seller_secret
JWT_CUSTOMER_SECRET=change_me_customer_secret
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Acceptance Criteria

1. `docker compose up` starts all 3 containers without errors
2. Swagger available at `http://localhost:3001/api` with all routes documented
3. `POST /sellers` with valid body returns 201 with IDs
4. `POST /sellers` with duplicate email returns 409 `"Seller email already exists!"`
5. `POST /seller/login` with correct credentials returns 200 with `access_token` and sets httpOnly `refresh_token` cookie
6. `POST /seller/login` with wrong password returns 401
7. `POST /seller/refresh-token` with valid cookie returns a new token pair
8. `POST /seller/refresh-token` with expired/invalid cookie returns 403
9. `GET /seller` with valid Bearer token returns `{ id, name, email, organization_name }`
10. `GET /seller` without a token returns 403
11. All `PATCH /seller/*` routes return 204 with a valid token
12. Frontend: landing renders with two functional CTAs
13. Frontend: seller registration → redirect to login after 201
14. Frontend: seller login → token stored in sessionStorage, redirect to `/seller/products`
