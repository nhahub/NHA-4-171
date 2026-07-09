# Project Workflow

This document traces the workflow paths within the carSparePartSys Car Spare Part System, mapping user interactions to backend services and database operations.

---

## 1. Customer User Journey

The primary workflow for a standard customer purchasing parts follows these sequential steps:

### A. Discovery and Compatibility Checks
1. The user navigates to the homepage (`index.html`).
2. They select a specific vehicle brand (e.g. `Toyota`) and model (e.g. `Corolla`) via the compatibility dropdown elements.
3. The client calls `GET /api/compatibility/search` which queries the `PartCompatibilities` table.
4. Only parts verified to fit the chosen model are displayed on screen.

### B. Cart Operations & Wishlist Management
1. Users add compatible items to their shopping cart or wishlist.
2. If the user is unregistered, the cart stores items in local storage.
3. Once the user logs in via `POST /api/account/login`, local cart items are synchronized with the server's `Carts` and `CartItems` database tables.

### C. Checkout & Payment
1. From the checkout screen (`checkout.html`), the user reviews the subtotal and applies any discount codes (verified via `GET /api/coupons/validate/{code}`).
2. They select a payment method. If choosing online payment, the frontend triggers `POST /api/stripe/create-checkout-session`.
3. The API validates stock availability across active warehouses. If stock is available, it initiates a Stripe Checkout session and returns the checkout URL to redirect the user to Stripe.
4. The user enters their payment details. Upon a successful transaction, Stripe redirects the user back to the application's success page.

---

## 2. Administrator & Supplier Workflow

System operators and suppliers manage catalog and inventory levels through the `/admin/dashboard.html` portal:

### A. Inventory Operations
1. When new stock arrives, the inventory operator loads the dashboard and adjusts inventory quantities via the `InventoryController` endpoint (`POST /api/inventory/adjust-stock`).
2. The system checks if the new quantity is above the minimum `ReorderLevel` and writes details to the `StockTransactions` audit table.

### B. Order Fulfilment
1. Operators track orders under `/admin/orders.html`.
2. As orders progress, the admin updates order statuses (e.g. from `Processing` to `Shipped` or `Delivered`).
3. These status adjustments are processed via the `OrdersController`, which calls `OrderService` to write updates to database records, send notifications, and log activities.

---

## 3. Backend Asynchronous Data Flow

The following flow detail outlines the secure integration with the payment gateway:

```
┌──────────┐          POST /stripe/create-session          ┌──────────┐
│ Frontend │──────────────────────────────────────────────>│ Web API  │
└──────────┘                                               └──────────┘
      │                                                          │
      │                                                  Connects to Stripe
      │                                                          │
      │               Redirect to Stripe Checkout                ▼
      │<───────────────────────────────────────────────────┌──────────┐
      │                                                    │  Stripe  │
      │                                                    │ Gateway  │
      │            Process Card Payment Successful         └──────────┘
      │──────────────────────────────────────────────────────────>
      │                                                          │
      │                Triggers webhook callback                 │
      │<─────────────────────────────────────────────────────────┘
      ▼
┌──────────┐          POST /stripe/webhook                 ┌──────────┐
│ Web API  │──────────────────────────────────────────────>│ Database │
└──────────┘              Updates Order status             └──────────┘
```

1. **Stripe Webhook Alert**: Once the customer's card is successfully charged, the Stripe platform sends an asynchronous HTTP POST webhook to `POST /api/stripe/webhook`.
2. **Signature Verification**: The `StripeController` validates the payload's signature using the webhook secret key (`WebhookSecret`).
3. **Inventory Update & Billing**: On verification of the `checkout.session.completed` event, the system:
   - Updates the corresponding database `Order` status to `Processing`.
   - Records the transactions in the `Payments` table.
   - Generates an `Invoice` reference linked to the order.
