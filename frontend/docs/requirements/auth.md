- ### **Auth — Seller:**

  - #### **Routes:**
    - `/seller/register`
    - `/seller/login`

  - #### **`/seller/register` — Page:**
    - **Form fields:** name, email, password, organization_name
    - **On submit:** calls `POST /sellers` (batch with a single seller)
      - **Input:**
        ```json
        {
          "sellers": [{ "name": "string", "email": "string", "password": "string", "organization_name": "string" }]
        }
        ```
    - **On success (201):** redirect to `/seller/login`
    - **On error (409):** display inline field error "This email is already in use."

  - #### **`/seller/login` — Page:**
    - **Form fields:** email, password
    - **On submit:** calls `POST /seller/login`
      - **Input:**
        ```json
        { "email": "string", "password": "string" }
        ```
    - **On success (200):**
      - Store `access_token` and `access_token_expiration_date` in Zustand `auth.store` with `userType: "seller"`
      - `refresh_token` is set automatically as httpOnly cookie by the backend
      - Redirect to `/seller/products`
    - **On error (401):** display inline error "Email or password is incorrect."

  - #### **Seller Logout:**
    - Button present in the seller layout header.
    - Calls `POST /seller/logout` (with seller access token in Authorization header)
    - On response (200 or 403): clear Zustand `auth.store`, redirect to `/seller/login`

  - #### **Seller Refresh Token (automatic):**
    - Handled by the Axios response interceptor in `services/api.ts`.
    - On any 401 response: call `POST /seller/refresh-token`
    - On success: update `access_token` in Zustand `auth.store`, retry original request
    - On failure (403): clear `auth.store`, redirect to `/seller/login`

  - #### **Seller Route Guard:**
    - All `/seller/*` pages (except `/seller/login` and `/seller/register`) require `auth.store.userType === "seller"` and a non-null `accessToken`.
    - If the guard fails, redirect to `/seller/login`.

---

- ### **Auth — Customer:**

  - #### **Routes:**
    - `/customer/register`
    - `/customer/login`

  - #### **`/customer/register` — Page:**
    - **Form fields:** name, email, password
    - **On submit:** calls `POST /customers` (batch with a single customer)
      - **Input:**
        ```json
        {
          "customers": [{ "name": "string", "email": "string", "password": "string" }]
        }
        ```
    - **On success (201):** redirect to `/customer/login`
    - **On error (409):** display inline field error "This email is already in use."

  - #### **`/customer/login` — Page:**
    - **Form fields:** email, password
    - **On submit:** calls `POST /customer/login`
      - **Input:**
        ```json
        { "email": "string", "password": "string" }
        ```
    - **On success (200):**
      - Store `access_token` and `access_token_expiration_date` in Zustand `auth.store` with `userType: "customer"`
      - `refresh_token` is set automatically as httpOnly cookie by the backend
      - Redirect to `/customer/products`
    - **On error (401):** display inline error "Email or password is incorrect."

  - #### **Customer Logout:**
    - Button present in the customer layout header.
    - Calls `POST /customer/logout` (with customer access token in Authorization header)
    - On response (200 or 403): clear Zustand `auth.store`, redirect to `/customer/login`

  - #### **Customer Refresh Token (automatic):**
    - Handled by the Axios response interceptor in `services/api.ts`.
    - On any 401 response: call `POST /customer/refresh-token`
    - On success: update `access_token` in Zustand `auth.store`, retry original request
    - On failure (403): clear `auth.store`, redirect to `/customer/login`

  - #### **Customer Route Guard:**
    - All `/customer/*` pages (except `/customer/login` and `/customer/register`) require `auth.store.userType === "customer"` and a non-null `accessToken`.
    - If the guard fails, redirect to `/customer/login`.
