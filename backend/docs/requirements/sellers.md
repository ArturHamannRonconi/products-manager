- ### **Sellers Module:** 
  Manages users who provide products, including inventory and product catalog.

  - #### **Schema:**
    ```json
    {
      "id": "string", // This route should return the ID.
      "name": "string",
      "email": "string",
      "password": "string",
      "refresh_tokens": "string[]",
      "organization_name": "string"
    }
    ```

  - #### **Routes:**
    - ##### **`/sellers | POST`**
      This route should involve the creation of several batch sellers.

      - ###### **Input**
        ```json
        {
          "body": {
            "sellers": [
              {
                "name": "string",
                "email": "string",
                "password": "string",
                "organization_name": "number",
              },
              { ... },
              { ... }
            ]
          },
          "headers": {
            "Content-Type": "application/json",
          }
        }
        ```

      - ###### **Outputs**
        - ###### **_201_**
          ```json
          {
            "body": {
              "sellers": [
                {
                  "id": "string", // This route should return the ID.
                  "name": "string",
                  "email": "string",
                  "organization_name": "number",
                },
                { ... },
                { ... }
              ]
            }
          }
          ```

        - ###### **_409_**
          ```json
          {
            "body": {
              "status_code": "409",
              "status_name": "CONFLICT",
              "error_message": "Seller email already exists!"
            }
          }
          ```

    - ##### **`/seller/login | POST`**
      This route should perform the seller login.

      - ###### **Input**
        ```json
        {
          "body": {
            "email": "string",
            "password": "string"
          },
          "headers": {
            "Content-Type": "application/json",
          }
        }
        ```

      - ###### **Outputs**
        - ###### **_200_**
          ```json
          {
            "body": {
              "access_token": "string",
              "access_token_expiration_date": "Date", // It should be a 15-minute token.
              "refresh_token_expiration_date": "Date" // It should be a 30-days token.
            },
            "cookies": {
              "refresh_token": "string"
            }
          }
          ```

        - ###### **_401_**
          ```json
          { 
            "body": {
              "status_code": "401",
              "status_name": "UNAUTHORIZED",
              "error_message": "Seller email or password is incorrect!"
            }
          }
          ```

    - ##### **`/seller/refresh-token | POST`**
      This route should perform the seller refresh-token.

      - ###### **Input**
        ```json
        {
          "body": {
            "refresh-token": "string"
          },
          "headers": {
            "Content-Type": "application/json",
          }
        }
        ```

      - ###### **Outputs**
        - ###### **_200_**
          ```json
          {
            "body": {
              "access_token": "string",
              "access_token_expiration_date": "Date", // It should be a 15-minute token.
              "refresh_token_expiration_date": "Date" // It should be a 30-days token.
            },
            "cookies": {
              "refresh_token": "string"
            }
          }
          ```

        - ###### **_403_**
          ```json
          {
            "body": {
              "status_code": "403",
              "status_name": "FORBIDDEN",
              "error_message": "Invalid refresh token!"
            }
          }
          ```

    - ##### **`/seller/logout | POST`**
      This route should perform the seller logout.

      - ###### **Input**
        ```json
        {
          "body": {},
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
            "body": {},
            "cookies": {
              // you should remove refresh_token from cookies 
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

    - ##### **`/seller | GET`**
      This route should be able to get the seller's info.

      - ###### **Input**
        ```json
        {
          "body": {},
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
              "name": "string",
              "email": "string",
              "organization_name": "string"
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

    - ##### **`/seller/name | PATCH`**
      This route should be able to change the seller's name.

      - ###### **Input**
        ```json
        {
          "body": {
            "name": "string"
          },
          "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer ${seller_access_token}"
          }
        }
        ```

      - ###### **Outputs**
        - ###### **_204_**
          ```json
          {
            "body": {}
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

    - ##### **`/seller/org | PATCH`**
      This route should be able to change the seller's organization name.

      - ###### **Input**
        ```json
        {
          "body": {
            "name": "string"
          },
          "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer ${seller_access_token}"
          }
        }
        ```

      - ###### **Outputs**
        - ###### **_204_**
          ```json
          {
            "body": {}
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

    - ##### **`/seller/email | PATCH`**
      This route should be able to change the seller's email.

      - ###### **Input**
        ```json
        {
          "body": {
            "email": "string"
          },
          "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer ${seller_access_token}"
          }
        }
        ```

      - ###### **Outputs**
        - ###### **_204_**
          ```json
          {
            "body": {}
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

    - ##### **`/seller/password | PATCH`**
      This route should be able to change the seller's password.

      - ###### **Input**
        ```json
        {
          "body": {
            "oldPassword": "string",
            "newPassword": "string"
          },
          "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer ${seller_access_token}"
          }
        }
        ```

      - ###### **Outputs**
        - ###### **_204_**
          ```json
          {
            "body": {}
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
