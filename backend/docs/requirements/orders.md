- ### **Orders Module:**
  - #### **Schema:**
    ```json
    {
      "id": "string",   // generated
      "status": "enum", // "pending" | "processing" | "shipped" | "delivered" | "cancelled"
      "customer_id": "string",
      "products": [
        {
          "product_id": "string",
          "ammount": "number"
        },
        { ... },
        { ... }
      ]
    }
    ```

  - #### **Routes:**
    - ##### **`/orders | POST`**
      This route should involve the creation of several batch orders at the same customer.

      - ###### **Input**
        ```json
        {
          "body": {
            "orders": [
              {
                "customer_id": "string",
                "products": [
                  {
                    "product_id": "string",
                    "ammount": "number"
                  },
                  { ... },
                  { ... }
                ]
              },
              { ... },
              { ... }
            ]
          },
          "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer ${customer_access_token}"
          }
        }
        ```

      - ###### **Outputs**
        - ###### **_201_**
          ```json
          {
            "body": {
              "orders": [
                {
                  "id": "string",      // generated
                  "status": "pending", // initial status (lowercase)
                  "products": [
                    {
                      "product_id": "string",
                      "ammount": "number"
                    },
                    { ... },
                    { ... }
                  ]
                },
                { ... },
                { ... }
              ]
            }
          }
          ```

        - ###### **_400_**
          ```json
          {
            "body": {
              "status_code": "400",
              "status_name": "BAD_REQUEST",
              "error_message": "All products in an order must belong to the same seller."
            }
          }
          ```

        - ###### **_403_**
          ```json
          {
            "body": {
              "status_code": "403",
              "status_name": "FORBIDDEN",
              "error_message": "Invalid access token!"
            }
          }
          ```

    - ##### **`/orders/${order_id}/status | PATCH`**
      This route allows an authenticated seller to update the status of an order that contains at least one product belonging to them.

      **Valid status values:** `"pending"` | `"processing"` | `"shipped"` | `"delivered"` | `"cancelled"`

      **Valid transitions:**
      - `pending → processing | cancelled`
      - `processing → shipped | cancelled`
      - `shipped → delivered | cancelled`
      - `delivered → cancelled`

      - ###### **Input**
        ```json
        {
          "body": {
            "status": "string" // one of: "pending", "processing", "shipped", "delivered", "cancelled"
          },
          "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer ${seller_access_token}"
          }
        }
        ```

      - ###### **Outputs**
        - ###### **_200_**
          ```json
          {
            "body": {
              {
                "id": "string", // generated
                "status": "enum", // updated
                "total_price": "number", // sum of product prices multiplied by ammount
                "products": [
                  {
                    "id": "string",
                    "name": "string",
                    "description": "string",
                    "price": "number",
                    "image_url": "string",
                    "seller_name": "string",
                    "category": "string"
                  },
                  { ... },
                  { ... }
                ]
              }
            }
          }
          ```

        - ###### **_400_ (invalid transition)**
          ```json
          {
            "body": {
              "status_code": "400",
              "status_name": "BAD_REQUEST",
              "error_message": "Invalid status transition."
            }
          }
          ```

        - ###### **_403_ (invalid token)**
          ```json
          {
            "body": {
              "status_code": "403",
              "status_name": "FORBIDDEN",
              "error_message": "Invalid access token!"
            }
          }
          ```

        - ###### **_403_ (ownership)**
          ```json
          {
            "body": {
              "status_code": "403",
              "status_name": "FORBIDDEN",
              "error_message": "You do not have permission to update this order."
            }
          }
          ```

        - ###### **_400_ (invalid status value)**
          ```json
          {
            "body": {
              "status_code": "400",
              "status_name": "BAD_REQUEST",
              "error_message": "Invalid order status!"
            }
          }
          ```

    - ##### **`/orders/for-customers | GET`**
      This route should be able to get the customer's orders info.

      - ###### **Input**
        ```json
        {
          "body": {
            "size": "number", // the size of each page (If the page size is larger than the number of existing orders, it should display the total number of orders as the first and only page.)
            "page": "number", // the page number to be searched (If the page number is greater than the number of pages, you should look for the last page.)
          },
          "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer ${customer_access_token}"
          }
        }
        ```

      - ###### **Outputs**
        - ###### **_200_**
          ```json
          {
            "body": {
              "orders": [
                {
                  "id": "string", // generated
                  "status": "enum", // one of: "pending", "processing", "shipped", "delivered", "cancelled"
                  "total_price": "number", // sum of product prices multiplied by ammount
                  "products": [
                    {
                      "id": "string", // generated
                      "name": "string",
                      "description": "string",
                      "price": "number",
                      "image_url": "string",
                      "seller_name": "string",
                      "category": "string"
                    },
                    { ... },
                    { ... }
                  ]
                },
                { ... },
                { ... }
              ],
              "total_orders": "number",     // total number of orders in database
              "skipped_orders": "number",   // total skipped orders ((page - 1) * size)
              "remaining_orders": "number", // (total_orders - skipped_orders)
              "hasNextPage": "boolean"        // (remaining_orders > 0)
            }
          }

        - ###### **_403_**
          ```json
          {
            "body": {
              "status_code": "403",
              "status_name": "FORBIDDEN",
              "error_message": "Invalid access token!"
            }
          }
          ```

    - ##### **`/orders/for-sellers | GET`**
      This route returns paginated orders that contain at least one product belonging to the authenticated seller.

      - ###### **Input**
        ```json
        {
          "query": {
            "size": "number", // items per page (default: 10; clamped to last page if out of range)
            "page": "number"  // page number (default: 1; clamped to last page if out of range)
          },
          "headers": {
            "Authorization": "Bearer ${seller_access_token}"
          }
        }
        ```

      - ###### **Outputs**
        - ###### **_200_**
          ```json
          {
            "body": {
              "orders": [
                {
                  "id": "string",
                  "status": "enum", // one of: "pending", "processing", "shipped", "delivered", "cancelled"
                  "total_price": "number",
                  "created_at": "string",   // ISO 8601 date
                  "customer_id": "string",
                  "products": [
                    {
                      "id": "string",
                      "name": "string",
                      "description": "string",
                      "price": "number",
                      "image_url": "string | null",
                      "category": "string",
                      "ammount": "number"
                    },
                    { ... }
                  ]
                },
                { ... }
              ],
              "total_orders": "number",
              "skipped_orders": "number",
              "remaining_orders": "number",
              "hasNextPage": "boolean"
            }
          }
          ```

        - ###### **_403_**
          ```json
          {
            "body": {
              "status_code": "403",
              "status_name": "FORBIDDEN",
              "error_message": "Invalid access token!"
            }
          }
          ```
