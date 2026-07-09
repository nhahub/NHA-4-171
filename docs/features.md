# Features

This document provides a breakdown of the core features implemented in the Thanya Car Spare Part System.

---

## 1. Vehicle Compatibility Engine

### Purpose
Allows users to verify whether a spare part will correctly fit their specific vehicle before placing an order.

### How it Works
The database defines `CarBrand`, `CarModel` (with fields for starting and ending years and engine types), and `PartCompatibility` tables. Products are mapped to one or more car models. When customers perform searches, the frontend submits vehicle selection criteria to `GET /api/compatibility/search`, which performs a relational database join to display only compatible items.

### Why it Matters
Eliminates ordering mistakes, reducing return shipping overhead and building customer trust.

---

## 2. Multi-Warehouse Inventory Control

### Purpose
Tracks product stock across different regional warehouses and logs changes to inventory levels.

### How it Works
The `Inventories` table maps products to locations (`Warehouses`) and sets a `ReorderLevel` for alerts. Stock adjustments (e.g. from purchases or manual checks) are processed via the `InventoryController`. The system logs each adjustment in the `StockTransactions` table as an audit trail.

### Why it Matters
Allows logistics teams to monitor physical stock locations in real-time, preventing stock shortages and optimizing replenishment schedules.

---

## 3. Cart & Wishlist Synchronization

### Purpose
Lets customers save items for immediate purchase or future consideration.

### How it Works
Unauthenticated clients save cart data to their browser's local storage. Upon logging in, the frontend triggers synchronization endpoints (`POST /api/cart/sync`) to transfer cart items to the server's SQL database, linking them to the user's account ID.

### Why it Matters
Provides a smooth shopping experience across different devices, helping to drive higher checkout rates.

---

## 4. Coupon & Discount Management

### Purpose
Enables promotional campaigns by supporting active discount codes during checkout.

### How it Works
Administrators configure discount codes in the `Coupons` table, specifying discount percentages or fixed amounts, expiration dates, minimum order limits, and maximum discount thresholds. During checkout, the client validates coupons via `GET /api/coupons/validate/{code}` before applying discounts to order totals.

### Why it Matters
Encourages repeat purchases and allows marketing teams to run targeted promotional campaigns.

---

## 5. Stripe Payment Gateway & Webhooks

### Purpose
Enables secure credit card processing without exposing the system to sensitive payment card data.

### How it Works
When a customer clicks checkout, the backend initiates a Stripe Session via the Stripe SDK. Once payment is confirmed, Stripe calls the system's webhook endpoint (`POST /api/stripe/webhook`). The system verifies the webhook's signature, updates the order status to `Processing`, and generates an invoice.

### Why it Matters
Ensures payment security and complies with PCI standards by offloading card processing to Stripe.

---

## 6. Returns Pipeline

### Purpose
Allows customers to request returns for damaged or incorrect parts.

### How it Works
Customers select an item from their order history and submit a return request. The request is logged in the `ReturnRequests` table. System administrators can then review, approve, or reject these requests through the admin dashboard, which triggers automatic inventory adjustments if items are returned to stock.

### Why it Matters
Simplifies the returns process for customers and helps logistics teams track returned inventory accurately.

---

## 7. Newsletter Subscriptions

### Purpose
Allows visitors to sign up for promotional mailings.

### How it Works
Visitors enter their email addresses on the homepage, which writes a record to the `NewsletterSubscriptions` table. Admins can view and manage these subscriptions via the administration dashboard.

### Why it Matters
Helps build a marketing audience and keeps customers updated on new product arrivals or promotions.
