# API Overview

The Thanya Car Spare Part System exposes a RESTful Web API under the base path `/api`. The API maps search configurations, account credentials, order operations, and payment triggers.

---

## 1. Authentication

Secure endpoints require an `Authorization` header containing a valid JWT (JSON Web Token) bearer token.

### Header Format
```http
Authorization: Bearer <your_jwt_token_here>
```

---

## 2. Core Endpoints

### A. Authentication & Accounts (`api/auth` or `api/account`)

#### 1. Register User
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Request Body (JSON)**:
  ```json
  {
    "email": "user@domain.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "address": "Cairo, Egypt"
  }
  ```
- **Response (JSON)**:
  ```json
  {
    "token": "eyJhbG...",
    "refreshToken": "abcdef...",
    "email": "user@domain.com",
    "roles": ["User"]
  }
  ```

#### 2. User Login
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Request Body (JSON)**:
  ```json
  {
    "email": "user@domain.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response (JSON)**: Matches Register Response structure.

#### 3. Log Out
- **Method**: `POST`
- **Path**: `/api/auth/logout`
- **Headers**: JWT token required.
- **Response**: `240 NoContent` status code on success.

---

### B. Products Catalog (`api/products`)

#### 1. Query Products
- **Method**: `GET`
- **Path**: `/api/products`
- **Query Parameters**:
  - `categoryId` (int, optional)
  - `brandId` (int, optional) - Filters by compatible car brand
  - `modelId` (int, optional) - Filters by compatible car model
  - `minPrice` (decimal, optional)
  - `maxPrice` (decimal, optional)
  - `search` (string, optional) - Filters by product name or SKU
  - `page` (int, default `1`)
  - `pageSize` (int, default `12`)
- **Response (JSON)**:
  ```json
  {
    "items": [
      {
        "productId": 1,
        "productName": "Bosch Double Platinum Spark Plug",
        "sku": "SP-BOSCH-PL10",
        "unitPrice": 12.99,
        "imageUrl": "https://..."
      }
    ],
    "totalCount": 1,
    "page": 1,
    "pageSize": 12
  }
  ```

---

### C. Vehicle Compatibility (`api/compatibility`)

#### 1. List Compatibility Logs
- **Method**: `GET`
- **Path**: `/api/compatibility`
- **Response (JSON)**:
  ```json
  [
    {
      "compatibilityId": 1,
      "productId": 1,
      "modelId": 2,
      "notes": "Fits 1.8L engines only."
    }
  ]
  ```

#### 2. Create Compatibility Mapping
- **Method**: `POST`
- **Path**: `/api/compatibility`
- **Headers**: JWT Admin privileges required.
- **Request Body (JSON)**:
  ```json
  {
    "productId": 1,
    "modelId": 3,
    "notes": "Requires M-Sport braking kit."
  }
  ```
- **Response**: `201 Created` with created configuration mapping object.

---

### D. Payments & Stripe Checkout (`api/stripe`)

#### 1. Generate Checkout Session
- **Method**: `POST`
- **Path**: `/api/stripe/checkout-session/{orderId}`
- **Query Parameters**:
  - `successUrl` (string, required) - Redirect url on successful checkout
  - `cancelUrl` (string, required) - Redirect url on cancelled checkout
- **Response (JSON)**:
  ```json
  {
    "url": "https://checkout.stripe.com/c/pay/cs_test_..."
  }
  ```

#### 2. Stripe Webhook Handler
- **Method**: `POST`
- **Path**: `/api/stripe/webhook`
- **Headers**: Requires `Stripe-Signature` header.
- **Request Body**: Raw JSON string from Stripe platform.
- **Response**: `200 OK` on successful handling.

---

## 3. Status Codes Reference

The API uses standard HTTP response statuses:

| Status Code | Description | Occurrence |
| :--- | :--- | :--- |
| `200 OK` | Request Succeeded | Returned for successful `GET` queries and modifications. |
| `201 Created` | Resource Created | Returned for successful compatibility setup or item creation. |
| `204 NoContent` | Action Complete | Returned on successful logout or file deletion. |
| `400 BadRequest` | Invalid Request Parameters | Returned if validation rules fail (e.g. invalid schemas). |
| `401 Unauthorized` | Missing/Expired Token | Returned when calling secure resources without a valid JWT. |
| `403 Forbidden` | Insufficient Permissions | Returned if a standard Customer tries to call Admin-only routes. |
| `404 NotFound` | Resource Missing | Returned if an order ID or product ID does not exist in tables. |
