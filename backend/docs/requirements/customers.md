- ### **Customers Module:** 
  Manages users who consume products and place orders.

  - #### **Schema:**
    ```json
    {
      "id": "string", // This route should return the ID.
      "name": "string",
      "email": "string",
      "password": "string",
      "refresh_token": "string"
    }
    ```

  - #### **Routes:**
    - ##### **`/customers | POST`**
      This route should involve the creation of several batch customers.

      - ###### **Input**
        ```json
        {
          "body": {
            "customers": [
              {
                "name": "string",
                "email": "string",
                "password": "string",
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
              "customers": [
                {
                  "id": "string", // This route should return the ID.
                  "name": "string",
                  "email": "string",
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
              "error_message": "Customer email already exists!"
            }
          }
          ```

    - ##### **`/customer/login | POST`**
      This route should perform the customer login.

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
              "error_message": "Customer email or password is incorrect!"
            }
          }
          ```

    - ##### **`/customer/refresh-token | POST`**
      This route should perform the customer refresh-token.

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

    - ##### **`/customer/logout | POST`**
      This route should perform the customer logout.

      - ###### **Input**
        ```json
        {
          "body": {},
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

    - ##### **`/customer | GET`**
      This route should be able to get the customer's info.

      - ###### **Input**
        ```json
        {
          "body": {},
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
              "id": "string", // This route should return the ID.
              "name": "string",
              "email": "string"
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

    - ##### **`/customer/name | PATCH`**
      This route should be able to change the customer's name.

      - ###### **Input**
        ```json
        {
          "body": {
            "name": "string"
          },
          "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer ${customer_access_token}"
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

    - ##### **`/customer/email | PATCH`**
      This route should be able to change the customer's email.

      - ###### **Input**
        ```json
        {
          "body": {
            "email": "string"
          },
          "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer ${customer_access_token}"
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

    - ##### **`/customer/password | PATCH`**
      This route should be able to change the customer's password.

      - ###### **Input**
        ```json
        {
          "body": {
            "oldPassword": "string",
            "newPassword": "string"
          },
          "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer ${customer_access_token}"
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