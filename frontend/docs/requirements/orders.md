- ### **Orders — Customer View:**

  - #### **`/customer/orders` — Page:**
    - **Description:** Lists all orders placed by the logged-in customer.
    - **Backend route consumed:** `GET /orders/for-customers`
    - **Query parameters sent:**
      ```json
      {
        "size": "number", // items per page (default: 10)
        "page": "number"  // current page (default: 1)
      }
      ```
    - **Displayed fields per order:**
      - Order ID
      - Status badge: "pending" | "processing" | "shipped" | "delivered" | "cancelled" (colored)
      - Total price (`total_price` — sum of product prices × quantities)
      - Expandable product list per order:
        - Product image (thumbnail)
        - Name
        - Description
        - Price
        - Seller name
        - Category
    - **Pagination:** uses `total_orders`, `hasNextPage`, and `skipped_orders` from the backend response.
    - **"Create Order" button:** navigates to `/customer/orders/new`.

  - #### **`/customer/orders/new` — Page:**
    - **Description:** Cart review page. Displays the products the customer selected on `/customer/products` and allows submitting them as an order.
    - **State source:** Zustand `cart.store`
    - **Backend route consumed:** `POST /orders`
    - **Displayed content:**
      - List of cart items:
        - Product name
        - Price per unit
        - Quantity selector (min: 1; decrease to 0 removes the item from cart)
        - Subtotal per item (price × quantity)
        - "Remove" button — removes the item from cart
      - Total order price (calculated client-side: sum of all subtotals)
      - "Place Order" button (disabled if cart is empty)
      - "Clear cart" button — clears the entire cart in Zustand
    - **Submit flow:**
      1. Call `POST /orders` with:
         ```json
         {
           "orders": [
             {
               "customer_id": "<from auth.store>",
               "products": [
                 { "product_id": "string", "ammount": "number" },
                 { ... }
               ]
             }
           ]
         }
         ```
      2. On success (201): clear `cart.store`, navigate to `/customer/orders`
      3. On error (403): show toast error "Invalid session. Please log in again."
    - **Empty state:** if cart is empty, display a message "Your cart is empty." with a button "Explore products" → `/customer/products`.
    - **Single-seller constraint:** the cart may only contain products from one seller at a time. `cart.store` tracks `cartSellerId` and `cartSellerName`. `addItem` rejects items from a different seller and returns `{ success: false, reason: "different_seller" }`. The calling page shows: *"Finish or clear your current order (seller [cartSellerName]) before adding products from another seller."*

- ### **Orders — Seller View:**

  - #### **`/seller/orders` — Page:**
    - **Description:** Lists all orders that contain at least one product belonging to the logged-in seller.
    - **Backend route consumed:** `GET /orders/for-sellers`
    - **Query parameters sent:**
      ```json
      {
        "size": "number", // items per page (default: 10)
        "page": "number"  // current page (default: 1)
      }
      ```
    - **Displayed fields per order:**
      - Order ID (truncated)
      - Status badge: colored pill — "pending" (yellow), "processing" (blue), "shipped" (purple), "delivered" (green), "cancelled" (red)
      - Total price (formatted as currency)
      - Created at date (e.g. "Apr 3, 2026")
      - Customer ID (truncated)
      - Expandable product list ("Show items" / "Hide items"):
        - Product image thumbnail (placeholder if null)
        - Product name
        - Price per unit
        - Quantity (`ammount`)
        - Line total (price × ammount)
        - Category badge
      - **Status update dropdown:** a `<select>` element pre-selected to the current status.
        - Options (label → value): Pending → `pending`, Processing → `processing`, Shipped → `shipped`, Delivered → `delivered`, Cancelled → `cancelled`
        - Changing the dropdown calls `PATCH /orders/:id/status` immediately.
        - While the request is in-flight, the dropdown is disabled and a small spinner is shown next to it (`isUpdating` prop).
        - On success: the status badge updates in place (optimistic update on local state — no refetch).
        - On `403` response: shows toast "You don't have permission to update this order."
        - On `400` response: shows toast "Invalid status transition."
    - **Pagination:** uses `hasNextPage` from the backend response.
    - **Empty state:** displays "No orders yet." when the seller has no orders.
    - **Navigation:** link to `/seller/orders` in the seller layout header nav.
    - **Auth:** requires `accessToken` + `userType === "seller"`; redirects to `/seller/login` if not authenticated.
