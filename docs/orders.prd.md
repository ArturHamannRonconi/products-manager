# Orders — PRD 5

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

Orders module: customers create orders from the cart; customers list their orders; sellers update an order's status. Integrates with `ProductsModule` for stock validation and response enrichment.

This PRD also contains a **breaking change** in the frontend `useAuthStore` (adds `userId`) that affects the login pages from PRD 1 (seller) and PRD 2 (customer) — those pages must be updated in this PRD.

---

## Prerequisites

PRDs 1–4 completed:
- `ProductsModule` exports `MongooseProductRepository`
- `SellerJwtGuard` and `CustomerJwtGuard` available
- Frontend: `useAuthStore` created (with `userId`), `cart.store` created, `SellerLayout`, `CustomerLayout` created
- Seller and customer login pages created

---

## Backend

### Domain

**Location:** `src/modules/orders/domain/`

#### `order.props.ts`
```ts
interface IOrderProps extends IBaseDomainAggregate {
  status: OrderStatusValueObject;
  customerId: IdValueObject;
  products: OrderItemEntity[];
}
export { IOrderProps };
```

#### `order.errors.ts`
```ts
export const INVALID_ORDER        = { message: 'Invalid order props.', statusCode: HttpStatus.BAD_REQUEST };
export const INVALID_ORDER_STATUS = { message: 'Invalid order status.', statusCode: HttpStatus.BAD_REQUEST };
export const ORDER_NOT_FOUND      = { message: 'Order not found.', statusCode: HttpStatus.NOT_FOUND };
export const INSUFFICIENT_STOCK   = { message: 'Insufficient stock for product: ', statusCode: HttpStatus.BAD_REQUEST };
// INSUFFICIENT_STOCK.message is concatenated with the product name in the service
export const ORDER_FORBIDDEN      = { message: 'Invalid access token!', statusCode: HttpStatus.FORBIDDEN };
```

#### `order.aggregate-root.ts`
Follows `aggregate-root.md`.
- Methods: `changeStatus(status: OrderStatusValueObject)`
- `isValidProps()`: verifies `["status", "customerId"]` + defaultValueObjects; verifies that `products` is not empty

#### Value Object: `OrderStatusValueObject`

**`value-objects/order-status/`**:
- Props: `IBaseDomainValueObject<string>`
- `isValidProps()`: `["Pending", "Canceled", "Approved"].includes(this.props.value)`
- `sanitizeProps()`: noop
- Error: `INVALID_ORDER_STATUS` (400)
- `.spec.ts`: "Pending" valid, "Approved" valid, "Canceled" valid, "invalid" invalid

#### Entity: `OrderItemEntity`

**`entities/order-item/`**:
- Props: `IOrderItemProps extends IBaseDomainEntity`: `{ productId: IdValueObject, ammount: AmountValueObject }`
- No mutation methods
- `isValidProps()`: verifies `["productId", "ammount"]` + defaultValueObjects

**`value-objects/amount/`** (inside `order-item` or at `domain/value-objects/`):
- `AmountValueObject`: `Number.isInteger(value) && value >= 1`
- Error: `"Amount must be at least 1." (400)`
- `.spec.ts`: 1 valid, 0 invalid, 1.5 invalid

Create `.spec.ts` for `OrderItemEntity`.

---

### Schema

**`src/modules/orders/repositories/orders/schema/order.schema.ts`:**
```ts
interface IOrderItemSchema {
  id: string;
  product_id: string;
  ammount: number;       // preserves original spelling from requirements
  created_at: Date;
  updated_at: Date;
}

interface IOrderSchema {
  id: string;
  status: string;         // "Pending" | "Canceled" | "Approved"
  customer_id: string;
  products: IOrderItemSchema[];
  created_at: Date;
  updated_at: Date;
}

const OrderItemSchema = new Schema<IOrderItemSchema>({
  id: { type: String, required: true },
  product_id: { type: String, required: true },
  ammount: { type: Number, required: true },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true },
});

const OrderSchema = new Schema<IOrderSchema>({
  id: { type: String, required: true },
  status: { type: String, required: true },
  customer_id: { type: String, required: true },
  products: { type: [OrderItemSchema], required: true },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true },
});

OrderSchema.index({ id: 1 }, { unique: true });
OrderSchema.index({ customer_id: 1 });
```

---

### Mapper

**`order-item.mapper.ts`** implements `IBidirectionalMapper<IOrderItemSchema, OrderItemEntity>`.

**`order.mapper.ts`** implements `IBidirectionalMapper<IOrderSchema, OrderAggregate>`:
- Injects `OrderItemMapper`
- `toRightSide`: reconstructs `products: schema.products.map(item => orderItemMapper.toRightSide(item))`
- `toLeftSide`: unpacks all fields

---

### Repository

**`order-repository.interface.ts`:**
```ts
interface OrderRepository {
  save(order: OrderAggregate): Promise<void>;
  findById(id: IdValueObject): Promise<OrderAggregate | null>;
  findByCustomerId(
    customerId: IdValueObject,
    params: { page: number; size: number }
  ): Promise<{ orders: OrderAggregate[]; total: number }>;
}
```

**`mongoose.order-repository.ts`**: follows `repository.md`.
- `findByCustomerId`: `this.OrderModel.find({ customer_id: customerId.value })` with `skip` and `limit`; pagination uses the same logic as products (clip page to totalPages)

Create `.test.ts`: `save`, `findById`, `findByCustomerId` (with pagination).

---

### Services

#### 1. `CreateBatchOrdersService`
- Input: `{ orders: [{ products: [{ product_id, ammount }] }], customerId: string }` — `customerId` comes from JWT, **not from the body** (body may carry `customer_id` but it is ignored; always uses the token value for security)
- For each order, for each item:
  1. `productRepository.findById(IdValueObject.init({ value: product_id }))`
  2. If null → return `PRODUCT_NOT_FOUND`
  3. If `product.inventoryAmount.value < ammount` → return `{ ...INSUFFICIENT_STOCK, message: INSUFFICIENT_STOCK.message + product.name.value }`
- If all validations pass:
  1. For each order: init `OrderItemEntity[]`, `OrderAggregate` with `status: "Pending"`, save
  2. For each item: `product.changeInventoryAmount(InventoryAmountValueObject.init({ value: product.inventoryAmount.value - ammount }))` → `productRepository.save(product)`
- ⚠️ **V1 limitation**: no MongoDB transaction — partial failure is possible; document as known limitation
- Output: `{ orders: [{ id, status, products: [{ product_id, ammount }] }] }`
- Injects: `OrderRepository`, `ProductRepository`
- `.spec.ts`: creates successfully + deducts stock, insufficient stock, product not found

#### 2. `UpdateOrderStatusService`
- Input: `{ orderId: string, status: string }`
- `orderRepository.findById` → `ORDER_NOT_FOUND` if null
- `OrderStatusValueObject.init({ value: status })` → if invalid return `INVALID_ORDER_STATUS`
- `order.changeStatus(statusVO)` → `orderRepository.save(order)`
- To build the enriched response: for each `orderItem` in `order.products`, fetch `productRepository.findById(item.productId)` to get name, price, image, etc.
- Compute `total_price = sum(product.price.value * item.ammount.value)`
- Output:
  ```json
  {
    "id": "string",
    "status": "string",
    "total_price": "number",
    "products": [
      { "id": "string", "name": "string", "description": "string", "price": "number", "image_url": "string|null", "seller_name": "string", "category": "string" }
    ]
  }
  ```
- For `seller_name` and `category`: requires `SellerRepository` and `CategoryRepository`. **V1 simplification**: either omit `seller_name` and `category` from the update status response, or inject the additional repositories. Recommended: inject `SellerRepository` and `CategoryRepository` for consistency with `GET /orders/for-customers`.
- Injects: `OrderRepository`, `ProductRepository`, `SellerRepository` (via `SellersModule`), `CategoryRepository` (via `CategoryModule`)
- `.spec.ts`: updates to "Approved", "Canceled", invalid status, order not found

#### 3. `GetOrdersForCustomersService`
- Input: `{ customerId: string, page: number, size: number }`
- `orderRepository.findByCustomerId(customerId, { page, size })`
- For each order, for each item: `productRepository.findById` to enrich; compute `total_price`
- Output:
  ```json
  {
    "orders": [
      {
        "id": "string",
        "status": "string",
        "total_price": "number",
        "products": [{ "id", "name", "description", "price", "image_url", "seller_name", "category" }]
      }
    ],
    "total_orders": "number",
    "skipped_orders": "number",
    "remaining_orders": "number",
    "hasNextPage": "boolean"
  }
  ```
- Injects: `OrderRepository`, `ProductRepository`, `SellerRepository`, `CategoryRepository`
- `.spec.ts`: list with enriched orders, empty list, pagination

---

### Controllers

| File | Route | Guard | Input | Status |
|---|---|---|---|---|
| `create-batch-orders.controller.ts` | `POST /orders` | CustomerJwtGuard | body: `{ orders[] }` | 201/400/403 |
| `update-order-status.controller.ts` | `PATCH /orders/:id/status` | SellerJwtGuard | body: `{ status }` | 200/400/403/404 |
| `get-orders-for-customers.controller.ts` | `GET /orders/for-customers` | CustomerJwtGuard | query: size, page | 200/403 |

**`create-batch-orders.controller.ts`**: extracts `customerId` from `req.user.customerId` (injected by `CustomerJwtGuard`); passes it to the service; ignores any `customer_id` from the body.

**`update-order-status.controller.ts`**: `@HttpCode(200)`.

**`get-orders-for-customers.controller.ts`**: extracts `customerId` from `req.user.customerId`; `size` and `page` parameters via `@Query()` with `ParseIntPipe`.

Create `.test.ts` for each controller.

---

### Module Wiring

**`order.module.ts`:**
```ts
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
    ProductsModule,   // exports MongooseProductRepository
    SellersModule,    // exports MongooseSellerRepository (to enrich responses)
    CategoryModule,   // exports MongooseCategoryRepository (to enrich responses)
  ],
  providers: [
    OrderItemMapper,
    OrderMapper,
    MongooseOrderRepository,
    CreateBatchOrdersService,
    UpdateOrderStatusService,
    GetOrdersForCustomersService,
    // controllers
  ],
})
export class OrdersModule {}
```

Register `OrdersModule` in `AppModule`.

---

### Tests

`.spec.ts`: `OrderAggregate`, `OrderStatusValueObject`, `OrderItemEntity`, `AmountValueObject`, `CreateBatchOrdersService`, `UpdateOrderStatusService`, `GetOrdersForCustomersService`.

`.test.ts`: `MongooseOrderRepository`, all 3 controllers.

---

## Frontend

### Breaking Change: `useAuthStore`

The `useAuthStore` was already created in PRD 1 with the `userId` field. Verify the signature is correct:

```ts
setAuth: (token: string, userType: "seller" | "customer", userId: string) => void
```

Update the login pages from PRD 1 and PRD 2 to pass the `id` returned by the backend:
- **`/seller/login`**: `useAuthStore.setAuth(data.access_token, "seller", data.id)`
- **`/customer/login`**: `useAuthStore.setAuth(data.access_token, "customer", data.id)`

> If PRD 1 and PRD 2 were already implemented with `setAuth(token, userType, userId)` as specified in their PRDs, no additional changes are needed. Just verify.

---

### Pages

#### `src/app/(customer)/orders/page.tsx` — Customer Orders List
```
"use client" — wrapped in <CustomerLayout>

Local state: page (default 1), size (default 10)

useOrderList({ page, size })
  → calls ordersService.getForCustomers({ page, size })

Render:
  - "Create Order" button → router.push("/customer/orders/new")
  - List of <OrderCard order={o} /> for each order
  - <Pagination currentPage={page} hasNextPage={hasNextPage} onPageChange={setPage} />
  - Loading state: spinner
  - Empty state: "You don't have any orders yet." + "Explore products" button → /customer/products
```

#### `src/app/(customer)/orders/new/page.tsx` — Cart Review / Checkout
```
"use client" — wrapped in <CustomerLayout>

Reads from: useCartStore, useAuthStore

Render:
  - If cart.items.length === 0:
    → "Your cart is empty."
    → "Explore products" button → router.push("/customer/products")

  - If cart.items.length > 0:
    → <CartReview items={cart.items} onUpdateQuantity={...} onRemoveItem={...} totalPrice={cart.totalPrice()} />
    → "Clear cart" button → cart.clear()
    → "Place Order" button (isLoading during submit):
        ordersService.create([{
          customer_id: useAuthStore.getState().userId,
          products: cart.items.map(i => ({ product_id: i.product_id, ammount: i.ammount }))
        }])
        → 201: cart.clear() → router.push("/customer/orders")
        → 400: show toast with error_message (e.g. "Insufficient stock for product: X")
        → 403: toast "Invalid session. Please log in again."
```

### Components

**`src/components/orders/OrderCard.tsx`:**
- Props: `order: IOrderOutput`
- Displays: Order ID (truncated), `<OrderStatusBadge status={order.status} />`, total_price formatted
- Expandable (toggle via useState `isExpanded`): when expanded shows the product list
- Product list: thumbnail (40x40), name, price, truncated description, seller_name, category

**`src/components/orders/OrderStatusBadge.tsx`:**
- Props: `status: "Pending" | "Approved" | "Canceled"`
- Pill with Tailwind colors:
  - `"Pending"` → `bg-yellow-100 text-yellow-800` → label "Pending"
  - `"Approved"` → `bg-green-100 text-green-800` → label "Approved"
  - `"Canceled"` → `bg-red-100 text-red-800` → label "Canceled"

**`src/components/orders/CartReview.tsx`:**
- Props: `items: CartItem[]`, `onUpdateQuantity: (id, qty) => void`, `onRemoveItem: (id) => void`, `totalPrice: number`
- Lists each item: name, unit price, `<QuantitySelector>`, subtotal (price × ammount), "Remove" button
- Footer: "Total: $X.XX" formatted; total is recalculated automatically as items change

**`src/components/ui/QuantitySelector.tsx`:**
- Props: `value: number`, `min?: number` (default 1), `onChange: (value: number) => void`
- "-" and "+" buttons + display of current value
- "-" button disabled when `value === min`
- Reused in `CartReview` and `AddToCartModal` (from PRD 4)

> **Retroactive PRD 4 note**: the `AddToCartModal` created in PRD 4 should use `<QuantitySelector>` created here. If PRD 4 was implemented first, update `AddToCartModal` to use this component.

### Hooks

**`hooks/use-order-list.hook.ts`:**
```ts
useOrderList(params: { page: number; size: number }): {
  orders: IOrderOutput[];
  totalOrders: number;
  hasNextPage: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
// Calls ordersService.getForCustomers(params)
```

### Services

**`src/services/orders.service.ts`:**
```ts
ordersService = {
  create(orders: ICreateOrderInput[]): Promise<{ orders: IOrderCreatedOutput[] }>
    → POST /orders body: { orders }

  getForCustomers(params: { page: number; size: number }): Promise<IOrderListResponse>
    → GET /orders/for-customers?page=&size=
}
```

### Types

**`src/types/order.types.ts`:**
```ts
interface IOrderItemInput {
  product_id: string;
  ammount: number;
}

interface ICreateOrderInput {
  customer_id: string;
  products: IOrderItemInput[];
}

interface IOrderCreatedOutput {
  id: string;
  status: string;
  products: IOrderItemInput[];
}

interface IOrderProductOutput {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  seller_name: string;
  category: string;
}

interface IOrderOutput {
  id: string;
  status: "Pending" | "Approved" | "Canceled";
  total_price: number;
  products: IOrderProductOutput[];
}

interface IOrderListResponse {
  orders: IOrderOutput[];
  total_orders: number;
  skipped_orders: number;
  remaining_orders: number;
  hasNextPage: boolean;
}
```

### User Flows

1. Customer on `/customer/products` adds items to cart → badge in header increments
2. Clicks badge or "View order" → `/customer/orders/new`
3. Reviews cart: adjusts quantities, removes items, sees total
4. Clicks "Place Order" → `POST /orders` → 201 → cart cleared → redirect to `/customer/orders`
5. If insufficient stock → 400 → toast with the name of the problematic product
6. On `/customer/orders`: list of orders with colored status badges
7. Expands an order → sees the product list with details

**Snapshot test (Playwright):**
Create `tests/orders-page.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test('customer orders page snapshot', async ({ page }) => {
  // Mock authentication via sessionStorage before navigating
  await page.goto('/customer/login');
  // ... (fill form or inject token via evaluate)
  await page.goto('/customer/orders');
  await expect(page).toHaveScreenshot('customer-orders.png');
});
```
> This test satisfies the frontend test requirement of "1 screenshot snapshot test".

---

## Environment Variables

No new variables.

---

## Acceptance Criteria

1. `POST /orders` (customer token) creates orders with status "Pending"; returns 201
2. `POST /orders` with quantity greater than stock returns 400 with message `"Insufficient stock for product: {name}"`
3. `POST /orders` deducts product stock (`inventory_ammount` reduced)
4. `PATCH /orders/:id/status` (seller token) with status "Approved" updates and returns 200 with computed `total_price`
5. `PATCH /orders/:id/status` with invalid status returns 400 `"Invalid order status."`
6. `GET /orders/for-customers` (customer token) returns paginated orders with enriched products and `total_price`
7. Frontend: `/customer/orders/new` with empty cart shows empty state
8. Frontend: `/customer/orders/new` with items shows `CartReview` with correct totals
9. Frontend: "Place Order" creates order, clears cart, redirects to orders list
10. Frontend: `/customer/orders` lists orders with `OrderStatusBadge` in correct colors
11. Frontend: expanding `OrderCard` shows the order's products
12. Playwright snapshot test for `/customer/orders` passes (screenshot generated)
