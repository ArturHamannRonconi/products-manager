- ### **Products — Seller View:**

  - #### **`/seller/products` — Page:**
    - **Description:** Lists all products with full details. Seller can create, edit, and delete products.
    - **Backend route consumed:** `GET /products/for-sellers`
    - **Query parameters sent:**
      ```json
      {
        "size": "number",        // items per page (default: 10)
        "page": "number",        // current page (default: 1)
        "searchByText": "string", // optional — filters by name, description or category
        "sort_by": "string",     // sort field (default: "createdAt")
        "order": "string",       // sort direction (default: "desc")
        "min_price": "number",   // optional — only sent when debounced value is a valid non-negative number and range is valid
        "max_price": "number"    // optional — only sent when debounced value is a valid non-negative number and range is valid
      }
      ```
    - **Displayed fields per product:**
      - Image (thumbnail — shows placeholder if `image_url` is null)
      - Name
      - Category name
      - Price
      - inventory_ammount
      - Seller name
      - Actions: "Edit" button, "Delete" button
    - **Pagination:** displays total products, current page, and navigation controls. Uses `total_products`, `hasNextPage`, and `skipped_products` from the backend response.
    - **Text search:** input field that triggers a new request with the updated `searchByText` value. Debounce of 400ms before sending.
    - **Price range filter (`<PriceRangeFilter>`):** two number inputs ("Min price", "Max price") rendered next to the sort dropdown. Both values are debounced 400ms. `min_price` / `max_price` are only sent when the debounced value is a valid non-negative number. If `minPrice > maxPrice`, an inline validation error is shown and no request is sent. Changing either price input resets the page to 1.
    - **Sort dropdown (`<SortDropdown>`):** rendered next to the search input. Options:
      | Label | sort_by | order |
      |-------|---------|-------|
      | Most recent (default) | createdAt | desc |
      | Name (A-Z) | name | asc |
      | Name (Z-A) | name | desc |
      | Lowest price | price | asc |
      | Highest price | price | desc |
      Changing the sort resets the page to 1.
    - **"Create Product" button:** navigates to `/seller/products/new`.
    - **Delete flow:**
      1. User clicks "Delete" on a product row.
      2. A confirmation modal appears: "Are you sure you want to delete this product?"
      3. On confirm: calls `DELETE /product/:id`
      4. On success (200): removes the product from the list (refetch or local update).
      5. On error (403): shows toast error "Invalid session. Please log in again."

  - #### **`/seller/products/new` — Page:**
    - **Description:** Form to create a new product.
    - **Backend routes consumed:**
      1. `POST /products` — creates the product
      2. `POST /product/:id/image` — uploads the image (optional, called after step 1 succeeds)
    - **Form fields:**
      - `name` (text input, required)
      - `description` (textarea, required)
      - `category` (text input, required) — backend creates a new category if it doesn't exist
      - `price` (number input, required, min: 0.01)
      - `inventory_ammount` (number input, required, min: 0)
      - `image` (file input, optional) — accepts image files (jpg, png, webp)
    - **Submit flow:**
      1. Call `POST /products` with `{ products: [{ name, description, category, price, inventory_ammount }] }`
      2. On success (201): if an image was selected, call `POST /product/:id/image` with `multipart/form-data`
      3. After both calls succeed (or after step 1 if no image): navigate to `/seller/products`
    - **On error (403):** show toast error "Invalid session. Please log in again."
    - **Validation:** all required fields must be filled before submission. Show inline field errors.

  - #### **`/seller/products/[id]/edit` — Page:**
    - **Description:** Form to edit an existing product. Fields are pre-filled with current product data.
    - **Backend routes consumed:**
      1. `PUT /product/:id` — updates the product
      2. `POST /product/:id/image` — replaces the image (optional)
    - **Form fields (same as create, pre-filled):**
      - `name`
      - `description`
      - `category` — if changed to an existing category, only `category_id` is updated; if changed to a new name, a new category is created
      - `price`
      - `inventory_ammount`
      - `image` (file input, optional) — current image shown as preview if `image_url` exists
    - **Submit flow:**
      1. Call `PUT /product/:id` with changed fields
      2. On success (200): if a new image was selected, call `POST /product/:id/image`
      3. Navigate to `/seller/products`
    - **On error (403):** show toast error "Invalid session. Please log in again."

---

- ### **Products — Customer View:**

  - #### **`/customer/products` — Page:**
    - **Description:** Lists products available for purchase. Customer can browse and add products to the cart.
    - **Backend route consumed:** `GET /products/for-customers`
    - **Query parameters sent:**
      ```json
      {
        "size": "number",        // items per page (default: 12)
        "page": "number",        // current page (default: 1)
        "searchByText": "string", // optional — filters by name, description or category
        "sort_by": "string",     // sort field (default: "createdAt")
        "order": "string",       // sort direction (default: "desc")
        "min_price": "number",   // optional — only sent when debounced value is a valid non-negative number and range is valid
        "max_price": "number"    // optional — only sent when debounced value is a valid non-negative number and range is valid
      }
      ```
    - **Displayed fields per product:**
      - Image (thumbnail)
      - Name
      - Description
      - Price
      - Category
      - Seller name
      - "Add to order" button
    - **Pagination:** same behavior as seller view.
    - **Text search:** same behavior as seller view (debounce 400ms).
    - **Price range filter (`<PriceRangeFilter>`):** same behavior as seller view.
    - **Sort dropdown (`<SortDropdown>`):** rendered next to the search input. Same options and reset-to-page-1 behavior as the seller view.
    - **"Add to order" flow:**
      1. User clicks "Add to order" on a product card.
      2. A modal appears with a quantity selector (min: 1).
      3. On confirm: adds `{ product_id, ammount }` to Zustand `cart.store`.
      4. If the product is already in the cart, increments the quantity.
      5. A floating cart badge (in the header) shows the total number of items in the cart.
    - **"View order" button** (in header): navigates to `/customer/orders/new` when cart has at least 1 item.
    - **Single-seller enforcement (locked cards):**
      - Each product card accepts `isLocked: boolean` and `lockReason?: string` props.
      - When `isLocked = true`: the card is grayed out (`opacity-40 grayscale`), a lock icon overlay is shown, the "Add to order" button is hidden, and `lockReason` is shown as a native tooltip (`title` attribute) on hover.
      - On the page, `isLocked` is computed as `cartSellerId !== null && product.seller_id !== cartSellerId`.
      - If the user somehow triggers `addItem` for a different-seller product, an error banner is shown: *"Finish or clear your current order (seller [cartSellerName]) before adding products from another seller."*
