- ### **Products Module:**
  - #### **Schema:**
    ```json
    {
      "id": "string", // generated
      "name": "string",
      "description": "string",
      "price": "number",
      "image_url": "string",
      "seller_id": "string",
      "category_id": "string",
      "inventory_ammount": "number"
    }
    ```

  - #### **Routes:**
    - ##### **`/products | POST`**
      This route should involve the creation of several batch products.

      - ###### **Input**
        ```json
        {
          "body": {
            "products": [
              {
                "name": "string",
                "description": "string",
                "category": "string", // If this category does not exist in the categories table, a new category must be created.
                "price": "number",
                "inventory_ammount": "number"
              },
              { ... },
              { ... }
            ]
          },
          "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer ${seller_access_token}"
          }
        }
        ```

      - ###### **Outputs**
        - ###### **_201_**
          ```json
          {
            "body": {
              "products": [
                {
                  "id": "string", // This route should return the ID.
                  "name": "string",
                  "description": "string",
                  "category": "string",
                  "price": "number",
                  "inventory_ammount": "number"
                },
                { ... },
                { ... }
              ]
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

    - ##### **`/product/${product_id}/image | POST`**
      This route should allow you to upload an image to the product.

      - ###### **Input**
        ```json
        {
          "body": "(binary data)",
          "params": {
            "product_id": "string"
          },
          "headers": {
            "Content-Type": "multipart/form-data",
            "Authorization": "Bearer ${seller_access_token}"
          }
        }
        ```

      - ###### **Outputs**
        - ###### **_200_**
          ```json
          {
            "body": {
              "id": "string", // This route should return the ID.
              "name": "string",
              "description": "string",
              "category": "string",
              "price": "number",
              "image_url": "string",
              "inventory_ammount": "number"
            },
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

    - ##### **`/product/${product_id} | PUT`**
      This route should be able to edit a product.

      - ###### **Input**
        ```json
        {
          "body": {
            // If any attribute remains the same as before, nothing should be done with that attribute.
            "name": "string",
            "description": "string",
            "price": "number",
            "category": "string", // If the category is different from the current category and does not exist in the category table, a new category must be created. However, if the category is different from the current category and does exist, only the category_id in the product should be changed.
            "inventory_ammount": "number"
          },
          "params": {
            "product_id": "string"
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
              "id": "string", // This route should return the ID.
              "description": "string",
              "name": "string",
              "image_url": "string",
              "price": "number",
              "seller_name": "string",
              "seller_id": "string",
              "category_name": "string",
              "category_id": "string",
              "inventory_ammount": "number",
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

    - ##### **`/product/${product_id} | DELETE`**
      This route should be able to delete a product.

      - ###### **Input**
        ```json
        {
          "body": {
            // You should search among the products, and if that's the only product that has that category, then you should remove the category from the category table. 
          },
          "params": {
            "product_id": "string"
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
            "body": {}
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

    - ##### **`/products/for-sellers | GET`**
      This route should be able to get the customer's sellers info.

      - ###### **Input**
        ```json
        {
          "body": {
            "size": "number", // the size of each page (If the page size is larger than the number of existing products, it should display the total number of products as the first and only page.)
            "page": "number", // the page number to be searched (If the page number is greater than the number of pages, you should look for the last page.)
            "searchByText": "string", // A text filter that should search by product name, description or category.
            "sort_by": "string", // Field to sort by. Allowed: "name" | "price" | "createdAt". Default: "createdAt".
            "order": "string", // Sort direction. Allowed: "asc" | "desc". Default: "desc".
            "min_price": "number", // Optional. Include only products with price >= min_price. Must be >= 0.
            "max_price": "number"  // Optional. Include only products with price <= max_price. Must be >= 0.
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
              "products": [
                {
                  "id": "string", // generated
                  "name": "string",
                  "description": "string",
                  "image_url": "string",
                  "price": "number",
                  "seller_name": "string",
                  "seller_id": "string",
                  "category_name": "string",
                  "category_id": "string",
                  "inventory_ammount": "number"
                },
                { ... },
                { ... }
              ],
              "total_products": "number",     // total number of products in database
              "skipped_products": "number",   // total skipped products ((page - 1) * size)
              "remaining_products": "number", // (total_products - skipped_products)
              "hasNextPage": "boolean"        // (remaining_products > 0)
            }
          }

        - ###### **_400_**
          Returned when `sort_by` or `order` contain invalid values, or price params are invalid.
          ```json
          {
            "body": {
              "statusCode": 400,
              "message": "Invalid sort_by value. Allowed: name, price, createdAt"
            }
          }
          ```
          Also returned for:
          - `min_price` or `max_price` is not a valid number → `"min_price must be a valid number."`
          - `min_price < 0` → `"min_price cannot be negative."`
          - `max_price < 0` → `"max_price cannot be negative."`
          - `min_price > max_price` → `"min_price cannot be greater than max_price."`

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

    - ##### **`/products/for-customers | GET`**
      This route should be able to get the customer's products info.

      - ###### **Input**
        ```json
        {
          "body": {
            "size": "number", // the size of each page (If the page size is larger than the number of existing products, it should display the total number of products as the first and only page.)
            "page": "number", // the page number to be searched (If the page number is greater than the number of pages, you should look for the last page.)
            "searchByText": "string", // A text filter that should search by product name, description or category.
            "sort_by": "string", // Field to sort by. Allowed: "name" | "price" | "createdAt". Default: "createdAt".
            "order": "string", // Sort direction. Allowed: "asc" | "desc". Default: "desc".
            "min_price": "number", // Optional. Include only products with price >= min_price. Must be >= 0.
            "max_price": "number"  // Optional. Include only products with price <= max_price. Must be >= 0.
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
              "products": [
                {
                  "id": "string", // generated
                  "name": "string",
                  "image_url": "string",
                  "description": "string",
                  "price": "number",
                  "category": "string",
                  "seller_name": "string",
                  "seller_id": "string",
                },
                { ... },
                { ... }
              ],
              "total_products": "number",     // total number of products in database
              "skipped_products": "number",   // total skipped products ((page - 1) * size)
              "remaining_products": "number", // (total_products - skipped_products)
              "hasNextPage": "boolean"        // (remaining_products > 0)
            }
          }

        - ###### **_400_**
          Returned when `sort_by` or `order` contain invalid values, or price params are invalid.
          ```json
          {
            "body": {
              "statusCode": 400,
              "message": "Invalid sort_by value. Allowed: name, price, createdAt"
            }
          }
          ```
          Also returned for:
          - `min_price` or `max_price` is not a valid number → `"min_price must be a valid number."`
          - `min_price < 0` → `"min_price cannot be negative."`
          - `max_price < 0` → `"max_price cannot be negative."`
          - `min_price > max_price` → `"min_price cannot be greater than max_price."`

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