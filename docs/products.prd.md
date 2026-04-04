# Products — PRD 4

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

Products module: sellers create, edit, delete, and list products; customers browse available products. Integrates with:
- `CategoryModule`: auto-creates categories when creating a product, auto-deletes orphan categories when deleting a product
- `SellersModule`: fetches seller data to enrich responses
- `FileProviderModule`: uploads images to S3

This PRD also implements the product management pages (seller) and product listing/cart pages (customer) on the frontend.

---

## Prerequisites

PRDs 1–3 completed:
- `SellersModule` exports `MongooseSellerRepository`
- `CategoryModule` exports `MongooseCategoryRepository`
- `FileProviderModule` exports `FILE_PROVIDER`
- `SellerJwtGuard` available
- `CustomerJwtGuard` available
- Frontend: `api.ts`, `useAuthStore`, `cart.store`, `SellerLayout`, `CustomerLayout`, `AuthLayout`, `Button`, `Input`, `FormError` available

---

## Backend

### Domain

**Location:** `src/modules/products/domain/`

#### `product.props.ts`
```ts
interface IProductProps extends IBaseDomainAggregate {
  name: ProductNameValueObject;
  description: ProductDescriptionValueObject;
  price: PriceValueObject;
  imageUrl: ImageUrlValueObject;     // accepts null
  sellerId: IdValueObject;
  categoryId: IdValueObject;
  inventoryAmount: InventoryAmountValueObject;
}
export { IProductProps };
```

#### `product.errors.ts`
```ts
export const PRODUCT_NOT_FOUND = { message: 'Product not found.', statusCode: HttpStatus.NOT_FOUND };
export const INVALID_PRODUCT   = { message: 'Invalid product props.', statusCode: HttpStatus.BAD_REQUEST };
export const PRODUCT_FORBIDDEN = { message: 'Invalid access token!', statusCode: HttpStatus.FORBIDDEN };
```

#### `product.aggregate-root.ts`
Follows `aggregate-root.md`.
- Methods: `changeName(name)`, `changeDescription(desc)`, `changePrice(price)`, `changeCategoryId(id)`, `changeInventoryAmount(amount)`, `setImageUrl(url: ImageUrlValueObject)`
- `isValidProps()`: verifies `["name", "description", "price", "imageUrl", "sellerId", "categoryId", "inventoryAmount"]` + defaultValueObjects

#### Value Objects

**`value-objects/product-name/`**:
- `value.trim().length >= 1 && <= 200`
- `sanitizeProps()`: trim
- Error: `"Product name must be between 1 and 200 characters." (400)`
- `.spec.ts`: valid, empty, too long, trim

**`value-objects/product-description/`**:
- `value.trim().length >= 1 && <= 1000`
- `sanitizeProps()`: trim
- Error: `"Product description must be between 1 and 1000 characters." (400)`

**`value-objects/price/`**:
- `typeof value === 'number' && value > 0`
- No `sanitizeProps()` (number)
- Error: `"Price must be greater than 0." (400)`

**`value-objects/image-url/`**:
- `isValidProps()`: `this.props.value === null || typeof this.props.value === 'string'` (always valid — backend controls the value)
- Props: `IBaseDomainValueObject<string | null>`
- Error: never thrown (validation always passes)

**`value-objects/inventory-amount/`**:
- `Number.isInteger(value) && value >= 0`
- Error: `"Inventory amount must be a non-negative integer." (400)`

Create `.spec.ts` for each value object.

---

### Schema

**`src/modules/products/repositories/products/schema/product.schema.ts`:**
```ts
interface IProductSchema {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  seller_id: string;
  category_id: string;
  inventory_ammount: number; // preserves original spelling from requirements
  created_at: Date;
  updated_at: Date;
}

const ProductSchema = new Schema<IProductSchema>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image_url: { type: String, default: null },
  seller_id: { type: String, required: true },
  category_id: { type: String, required: true },
  inventory_ammount: { type: Number, required: true },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true },
});

ProductSchema.index({ id: 1 }, { unique: true });
ProductSchema.index({ seller_id: 1 });
ProductSchema.index({ category_id: 1 });
ProductSchema.index({ name: 'text', description: 'text' }); // for $text search
```

---

### Mapper

**`product.mapper.ts`** implements `IBidirectionalMapper<IProductSchema, ProductAggregate>`:
- `toRightSide`: reconstructs all VOs; `imageUrl: ImageUrlValueObject.init({ value: schema.image_url }).result`
- `toLeftSide`: unpacks `.value` from each VO; `image_url: aggregate.imageUrl.value` (may be null)

---

### Repository

**`product-repository.interface.ts`:**
```ts
interface ProductRepository {
  findById(id: IdValueObject): Promise<ProductAggregate | null>;
  save(product: ProductAggregate): Promise<void>;
  delete(id: IdValueObject): Promise<void>;
  findForSellers(params: {
    page: number;
    size: number;
    searchByText?: string;
  }): Promise<{ products: IProductSellerView[]; total: number }>;
  findForCustomers(params: {
    page: number;
    size: number;
    searchByText?: string;
  }): Promise<{ products: IProductCustomerView[]; total: number }>;
  countByCategoryId(categoryId: IdValueObject): Promise<number>;
}

// Views are DTOs returned directly by the repository (result of $lookup)
interface IProductSellerView {
  id: string; name: string; description: string; image_url: string | null;
  price: number; seller_name: string; seller_id: string;
  category_name: string; category_id: string; inventory_ammount: number;
}

interface IProductCustomerView {
  id: string; name: string; image_url: string | null; description: string;
  price: number; category: string; seller_name: string;
}
```

**`mongoose.product-repository.ts`** — MongoDB implementation:

`findForSellers` and `findForCustomers` use an aggregation pipeline with `$lookup`:
```ts
// Pipeline structure
const pipeline = [
  // 1. Text filter (optional)
  ...(searchByText ? [{ $match: { $text: { $search: searchByText } } }] : []),
  // 2. $lookup on sellers
  { $lookup: { from: 'sellers', localField: 'seller_id', foreignField: 'id', as: 'seller_data' } },
  { $unwind: { path: '$seller_data', preserveNullAndEmptyArrays: true } },
  // 3. $lookup on categories
  { $lookup: { from: 'categories', localField: 'category_id', foreignField: 'id', as: 'category_data' } },
  { $unwind: { path: '$category_data', preserveNullAndEmptyArrays: true } },
  // 4. $project with enriched fields
  { $project: { /* project seller and category fields */ } },
  // 5. Pagination
  { $skip: skip },
  { $limit: size },
];
```

Pagination:
```ts
const totalCount = await this.ProductModel.countDocuments(matchFilter);
const totalPages = Math.ceil(totalCount / size) || 1;
const effectivePage = Math.min(page, totalPages); // never exceeds the last page
const skip = (effectivePage - 1) * size;
```

`countByCategoryId`: `this.ProductModel.countDocuments({ category_id: categoryId.value })`

Create `.test.ts`: `findForSellers` (with and without searchByText, pagination), `findForCustomers`, `countByCategoryId`, `save`, `delete`.

---

### Services

#### 1. `CreateBatchProductsService`
- Input: `{ products: [{ name, description, category, price, inventory_ammount }], sellerId: string }`
- For each product:
  1. `CategoryNameValueObject.init({ value: category })` — normalizes to lowercase
  2. `categoryRepository.findByName(categoryName)` → if not found: create `CategoryAggregate` with `IdValueObject.getDefault()` and `save(category)`
  3. Init all product VOs; init `ProductAggregate` with `sellerId`, `categoryId` from the category
  4. `productRepository.save(product)`
- Output: `{ products: [{ id, name, description, category, price, inventory_ammount }] }`
- Injects: `ProductRepository`, `CategoryRepository`
- `.spec.ts`: creates with new category (creates category), creates with existing category (reuses), fails with invalid name

#### 2. `UploadProductImageService`
- Input: `{ productId: string, file: { filename: string, buffer: Buffer, mimetype: string } }`
- `productRepository.findById` → `PRODUCT_NOT_FOUND` if null
- `fileProvider.upload({ filename: \`${productId}-${Date.now()}.${ext}\`, buffer, mimetype })`
- `ImageUrlValueObject.init({ value: url })` → `product.setImageUrl(imageUrl)` → `productRepository.save(product)`
- Output: `IProductSellerView` (call `findForSellers` with id filter, or build DTO manually)
- Injects: `ProductRepository`, `IFileProvider` via `@Inject(FILE_PROVIDER)`
- `.spec.ts`: upload successful, product not found

#### 3. `EditProductService`
- Input: `{ productId: string, name?, description?, category?, price?, inventory_ammount? }`
- `productRepository.findById` → `PRODUCT_NOT_FOUND` if null
- For each provided field: init VO and call the corresponding mutation method
- If `category` provided and different from current:
  1. Save `oldCategoryId = product.categoryId`
  2. `CategoryNameValueObject.init({ value: category })`
  3. `categoryRepository.findByName` → if found: `product.changeCategoryId(newId)`; if not found: create new category and set it
  4. `productRepository.countByCategoryId(oldCategoryId)` — if 0 after saving the product: `categoryRepository.delete(oldCategoryId)`
- `productRepository.save(product)`
- Output: `IProductSellerView` (build via `sellerRepository.findById` and `categoryRepository.findById` or via $lookup)
- Injects: `ProductRepository`, `CategoryRepository`, `SellerRepository`
- `.spec.ts`: edit name, edit category to new (creates category), edit category to existing, orphan category deletion, product not found

#### 4. `DeleteProductService`
- Input: `{ productId: string }`
- `productRepository.findById` → `PRODUCT_NOT_FOUND` if null
- Save `categoryId = product.categoryId`
- `productRepository.delete(product.id)`
- `count = productRepository.countByCategoryId(categoryId)` → if `count === 0`: `categoryRepository.delete(categoryId)`
- Output: void
- Injects: `ProductRepository`, `CategoryRepository`
- `.spec.ts`: deletes product, deletes product and orphan category, product not found

#### 5. `GetProductsForSellersService`
- Input: `{ page: number, size: number, searchByText?: string }`
- `productRepository.findForSellers({ page, size, searchByText })`
- Compute metadata: `skipped = (effectivePage - 1) * size`, `remaining = total - skipped`, `hasNextPage = remaining > 0` (note: `remaining` may be negative if `skipped > total`)
- Output:
  ```json
  {
    "products": [...IProductSellerView],
    "total_products": "number",
    "skipped_products": "number",
    "remaining_products": "number",
    "hasNextPage": "boolean"
  }
  ```
- `.spec.ts`: list with results, empty list, page > totalPages (returns last page)

#### 6. `GetProductsForCustomersService`
- Identical to the previous but calls `findForCustomers`
- Output: same pagination structure with `IProductCustomerView[]`

---

### Controllers

| File | Route | Guard | Input | Status |
|---|---|---|---|---|
| `create-batch-products.controller.ts` | `POST /products` | SellerJwtGuard | body: `{ products[] }` | 201/403 |
| `upload-product-image.controller.ts` | `POST /product/:id/image` | SellerJwtGuard | `@UploadedFile() file` | 200/403/404 |
| `edit-product.controller.ts` | `PUT /product/:id` | SellerJwtGuard | body: optional fields | 200/403/404 |
| `delete-product.controller.ts` | `DELETE /product/:id` | SellerJwtGuard | params: id | 200/403/404 |
| `get-products-for-sellers.controller.ts` | `GET /products/for-sellers` | SellerJwtGuard | query: size, page, searchByText? | 200/403 |
| `get-products-for-customers.controller.ts` | `GET /products/for-customers` | CustomerJwtGuard | query: size, page, searchByText? | 200/403 |

**Upload controller** — uses `@UseInterceptors(FileInterceptor('file'))` and `@UploadedFile() file: Express.Multer.File`. The `buffer` and `mimetype` come from `file.buffer` and `file.mimetype`.

**GET controllers** — parameters via `@Query()` with `ParseIntPipe` for `size` and `page`.

Create `.test.ts` for each controller.

---

### Module Wiring

**`product.module.ts`:**
```ts
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
    CategoryModule,       // exports MongooseCategoryRepository
    SellersModule,        // exports MongooseSellerRepository
    FileProviderModule,   // exports FILE_PROVIDER
    MulterModule.register({ limits: { fileSize: 5 * 1024 * 1024 } }), // 5MB
  ],
  providers: [
    ProductMapper,
    MongooseProductRepository,
    CreateBatchProductsService,
    UploadProductImageService,
    EditProductService,
    DeleteProductService,
    GetProductsForSellersService,
    GetProductsForCustomersService,
    // controllers
  ],
  exports: [MongooseProductRepository], // required for OrdersModule in PRD 5
})
export class ProductsModule {}
```

Register `ProductsModule` in `AppModule`.

---

### Tests

`.spec.ts`: `ProductAggregate`, `ProductNameValueObject`, `ProductDescriptionValueObject`, `PriceValueObject`, `ImageUrlValueObject`, `InventoryAmountValueObject`, all 6 services.

`.test.ts`: `MongooseProductRepository` (all methods including `findForSellers` with $lookup), all 6 controllers.

---

## Frontend

### Pages

#### `src/app/(seller)/products/page.tsx` — Seller Products List
```
"use client" — wrapped in <SellerLayout>

Local state: page (default 1), size (default 10), searchText (string), debouncedSearch (via useDebounce(searchText, 400))

useProductList({ page, size, searchByText: debouncedSearch })
  → calls productsService.getForSellers({ page, size, searchByText: debouncedSearch })

Render:
  - Search input → updates searchText; reset page to 1 on change
  - "Create Product" button → router.push("/seller/products/new")
  - <ProductTable products={products} onEdit={...} onDelete={...} />
  - <Pagination currentPage={page} hasNextPage={hasNextPage} onPageChange={setPage} />
  - Loading state: skeleton or spinner
  - Error state: inline message

Delete flow:
  - onDelete(id) → opens <ConfirmDeleteModal>
  - Confirmed → productsService.remove(id) → refetch list
  - Error 403 → toast "Invalid session. Please log in again."

Edit flow:
  - onEdit(product) → useProductsStore.setCurrentProduct(product) → router.push(`/seller/products/${product.id}/edit`)
```

#### `src/app/(seller)/products/new/page.tsx` — Create Product
```
"use client" — wrapped in <SellerLayout>

<ProductForm mode="create" onSubmit={handleSubmit} isLoading={isLoading} />

handleSubmit(formData):
  1. productsService.create([{ name, description, category, price, inventory_ammount }])
  2. On 201: if formData.imageFile → productsService.uploadImage(products[0].id, imageFile)
  3. router.push("/seller/products")
  4. Error 403 → toast "Invalid session. Please log in again."
```

#### `src/app/(seller)/products/[id]/edit/page.tsx` — Edit Product
```
"use client" — wrapped in <SellerLayout>

useParams → id
useProductsStore → currentProduct (loaded by the listing page before navigating)
  If currentProduct is null → router.replace("/seller/products") (fallback)

<ProductForm mode="edit" initialValues={currentProduct} onSubmit={handleSubmit} isLoading={isLoading} />

handleSubmit(formData):
  1. productsService.update(id, { name, description, category, price, inventory_ammount })
  2. On 200: if formData.imageFile → productsService.uploadImage(id, imageFile)
  3. router.push("/seller/products")
  4. Error 403 → toast
```

#### `src/app/(customer)/products/page.tsx` — Customer Products List
```
"use client" — wrapped in <CustomerLayout>

Local state: page, size, searchText, debouncedSearch

useCustomerProductList({ page, size, searchByText: debouncedSearch })
  → calls productsService.getForCustomers(...)

Render:
  - Search input
  - Grid of <CustomerProductCard product={p} onAddToCart={...} /> for each product
  - <Pagination ... />

onAddToCart(product):
  - Opens <AddToCartModal product={product} onConfirm={handleAddToCart} />
  - handleAddToCart(ammount): useCartStore.addItem({ product_id: product.id, name: product.name, price: product.price, ammount })
```

### Components

**`src/components/ui/Modal.tsx`:**
- Props: `isOpen: boolean`, `onClose: () => void`, `title?: string`, `children: React.ReactNode`
- Overlay with backdrop; closes on outside click or X button
- Accessibility: trap focus, `role="dialog"`

**`src/components/ui/Pagination.tsx`:**
- Props: `currentPage: number`, `hasNextPage: boolean`, `onPageChange: (page: number) => void`
- "Previous" and "Next" buttons; displays current page number
- "Previous" disabled on page 1; "Next" disabled if `!hasNextPage`

**`src/components/ui/Toast.tsx`:**
- Simple component that displays a temporary error message (3 seconds)
- Props: `message: string`, `onClose: () => void`
- Fixed at the bottom-right corner

**`src/components/products/ProductTable.tsx`:**
- Props: `products: IProductSellerOutput[]`, `onEdit: (p) => void`, `onDelete: (id: string) => void`
- Table with columns: image (40x40 thumbnail, placeholder if null), name, category, price (formatted), inventory_ammount, seller_name, actions
- "Edit" (secondary) and "Delete" (danger) buttons per row

**`src/components/products/ProductForm.tsx`:**
- Props: `mode: "create"|"edit"`, `initialValues?: Partial<IProductSellerOutput>`, `onSubmit: (data: IProductFormData) => void`, `isLoading: boolean`
- Fields: name (Input), description (textarea), category (Input), price (Input type=number), inventory_ammount (Input type=number), image (input type=file, accepts image/*)
- Preview of current image if `initialValues.image_url` exists and mode is "edit"
- Validation: all required except image; price > 0; inventory_ammount >= 0
- Submit button: "Create Product" or "Save Changes" depending on mode

**`src/components/products/CustomerProductCard.tsx`:**
- Props: `product: IProductCustomerOutput`, `onAddToCart: (product) => void`
- Card with image, name, price highlighted, truncated description, category, seller_name
- "Add to order" button

**`src/components/products/AddToCartModal.tsx`:**
- Props: `isOpen: boolean`, `product: IProductCustomerOutput`, `onConfirm: (ammount: number) => void`, `onClose: () => void`
- Quantity input (min: 1, default: 1) + "Add" button

**`src/components/products/ConfirmDeleteModal.tsx`:**
- Props: `isOpen: boolean`, `onConfirm: () => void`, `onClose: () => void`
- Text: "Are you sure you want to delete this product?"
- Buttons: "Cancel" (secondary) and "Delete" (danger)

### Hooks

**`hooks/use-product-list.hook.ts`**: fetches `GET /products/for-sellers`; receives `{ page, size, searchByText? }`; returns `{ products, totalProducts, hasNextPage, isLoading, error, refetch }`.

**`hooks/use-customer-product-list.hook.ts`**: fetches `GET /products/for-customers`; same signature.

**`hooks/use-debounce.hook.ts`**: `useDebounce<T>(value: T, delay: number): T` — `setTimeout` + `clearTimeout` in `useEffect`.

Create auxiliary hooks for create/edit/delete if needed (can be inline with `useState`).

### Services

**`src/services/products.service.ts`:**
```ts
productsService = {
  getForSellers(params: { size, page, searchByText? }): Promise<IProductListResponse<IProductSellerOutput>>
    → GET /products/for-sellers?size=&page=&searchByText=

  getForCustomers(params): Promise<IProductListResponse<IProductCustomerOutput>>
    → GET /products/for-customers?size=&page=&searchByText=

  create(products: ICreateProductInput[]): Promise<{ products: IProductCreatedOutput[] }>
    → POST /products body: { products }

  update(id: string, input: Partial<ICreateProductInput>): Promise<IProductSellerOutput>
    → PUT /product/:id

  remove(id: string): Promise<void>
    → DELETE /product/:id

  uploadImage(id: string, file: File): Promise<IProductSellerOutput>
    → POST /product/:id/image (multipart/form-data, field name: "file")
}
```

### Stores

**`src/store/products.store.ts`:**
```ts
interface ProductsStore {
  currentProduct: IProductSellerOutput | null;
  setCurrentProduct: (product: IProductSellerOutput | null) => void;
}
// No persist — transient navigation data
const useProductsStore = create<ProductsStore>((set) => ({
  currentProduct: null,
  setCurrentProduct: (product) => set({ currentProduct: product }),
}));
```

### Types

**`src/types/product.types.ts`:**
```ts
interface IProductSellerOutput {
  id: string; name: string; description: string; image_url: string | null;
  price: number; seller_name: string; seller_id: string;
  category_name: string; category_id: string; inventory_ammount: number;
}
interface IProductCustomerOutput {
  id: string; name: string; image_url: string | null; description: string;
  price: number; category: string; seller_name: string;
}
interface ICreateProductInput {
  name: string; description: string; category: string;
  price: number; inventory_ammount: number;
}
interface IProductCreatedOutput {
  id: string; name: string; description: string; category: string;
  price: number; inventory_ammount: number;
}
interface IProductListResponse<T> {
  products: T[];
  total_products: number;
  skipped_products: number;
  remaining_products: number;
  hasNextPage: boolean;
}
interface IProductFormData extends ICreateProductInput {
  imageFile?: File;
}
```

### User Flows

**Seller:**
1. Login → `/seller/products` → paginated list with search
2. "Create Product" → form → submit → if image: upload → back to list
3. "Edit" on a product → `setCurrentProduct` in store → `/seller/products/:id/edit` → pre-filled form → submit → back to list
4. "Delete" → confirmation modal → delete → list refreshes

**Customer:**
1. Login → `/customer/products` → paginated grid with search
2. "Add to order" → modal with quantity → adds to `cart.store`
3. Badge in header increments; "View order" navigates to `/customer/orders/new`

---

## Environment Variables

No new variables.

---

## Acceptance Criteria

1. `POST /products` (seller token) creates products and auto-creates categories; returns 201
2. `POST /product/:id/image` uploads to S3 and updates `image_url` in the database; returns 200
3. `PUT /product/:id` with new category creates the category; with existing category reuses it; returns 200
4. `DELETE /product/:id` when last product in category → also deletes the category; returns 200
5. `GET /products/for-sellers` returns enriched list (seller_name, category_name) with pagination metadata
6. `GET /products/for-sellers?searchByText=t` filters by name and description
7. `GET /products/for-customers` returns reduced fields (without `inventory_ammount`); customer token required
8. Frontend: seller list loads, pagination works, debounced search works
9. Frontend: create form validates fields, submits and redirects; image is optional
10. Frontend: edit form pre-filled, submits and redirects
11. Frontend: delete with confirmation modal removes from list
12. Frontend: customer grid renders cards, "Add to order" updates cart badge
