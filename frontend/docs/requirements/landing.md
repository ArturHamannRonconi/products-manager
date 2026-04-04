- ### **Landing Page:**
  Public page that introduces the application and directs users to the appropriate login.

  - #### **Route:** `/`

  - #### **Content:**
    - App title and brief description of the platform.
    - Two call-to-action buttons:
      - "Enter as Seller" → navigates to `/seller/login`
      - "Enter as Customer" → navigates to `/customer/login`

  - #### **Auth Behavior:**
    - If a user with a valid seller access token visits this page, redirect to `/seller/products`.
    - If a user with a valid customer access token visits this page, redirect to `/customer/products`.

  - #### **No backend route consumed.**
