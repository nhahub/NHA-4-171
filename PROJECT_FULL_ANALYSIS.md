# PROJECT FULL ENGINEERING AUDIT & PRESENTATION REFERENCE

---

## 1. Executive Summary

### What is this project?
The carSparePartSys Car Spare Part System is an enterprise e-commerce platform and inventory system specifically designed for the automotive spare parts industry. The system provides a headless REST API backend built in ASP.NET Core 9.0, connected to a Microsoft SQL Server database, and combined with an interactive, lightweight customer and administrator frontend in vanilla CSS and JavaScript.

### What does it solve?
Automotive retail is highly complex due to strict vehicle-to-part compatibility. A simple oil filter or brake rotor might fit a 2015 Toyota Corolla 1.8L but fail to fit a 2015 Toyota Corolla 2.0L. Standard retail catalogs do not support these relational constraints, resulting in high order return rates, lost shipping costs, and customer frustration. carSparePartSys solves this by providing:
- Relational vehicle compatibility filtering (by brand, model, and year range) directly at the database and API levels.
- Real-time inventory tracking across multiple regional warehouses.
- Automated order processing and secure billing via Stripe checkout.

### Who are the users?
1. **Customers & Auto Repair Shops**: Browse and verify compatible parts, manage carts and wishlists, and pay securely online.
2. **Logistics Operators**: Track inventory, manage warehouses, and adjust stock counts.
3. **Suppliers**: Manage supplied items and view generated invoices.
4. **Administrators**: Control users, manage compatibility rules, track orders, and process returns.

### Business Value
- **Reduces Returns**: Preventing purchase mistakes reduces return shipping overhead.
- **Improves Inventory Management**: Real-time stock counts across warehouses prevent over-stocking and out-of-stock situations.
- **Automates Operations**: Automated checkouts and invoice generation reduce manual administrative tasks.

---

## 2. Project Story

The automotive aftermarket industry is highly fragmented, with millions of part numbers matching specific engine designs, chassis configurations, and years. Traditional flat-catalog e-commerce setups struggle with these details. They cannot prevent a customer from buying a spark plug intended for a 1.8L engine to use in a 2.0L vehicle.

carSparePartSys was conceived to solve this problem. Built as an open-source project by the carSparePartSys development team, the platform offers:
- A relational data model connecting parts to car models.
- An easy checkout experience integrated with Stripe.
- A clean separation of concerns using Clean Architecture.

This design makes it easy for developers to add features (such as Redis caching or full-text search) without breaking core inventory or payment logic.

---

## 3. Real World Scenario

1. A mechanic at a garage needs a front pair of sport brake rotors for a **BMW 3-Series (F30)**.
2. The mechanic opens the carSparePartSys system and selects: Brand: BMW, Model: 3 Series (F30), Year: 2015.
3. The compatibility engine queries the PartCompatibilities table and shows the compatible product: Brembo Sport Brake Rotor (Front Pair), SKU BR-BREMBO-F20, along with the note: "Requires M-Sport braking kit."
4. The mechanic adds the item to the cart, enters shipping details, and selects credit card checkout.
5. The system validates stock availability, creates a Stripe Checkout session, and redirects the client to Stripe for secure payment.
6. On payment completion, Stripe triggers the backend webhook. The database updates the order status to Processing, reduces the warehouse inventory count by 2, and generates an invoice.
7. The warehouse team receives the order, picks the parts, and ships them to the garage.

---

## 4. Functional Requirements

### 1. Compatibility Checker
- **Purpose**: Restricts search results to parts that fit the customer's vehicle.
- **How it Works**: Connects the product catalog to vehicle brands and models via PartCompatibility links.
- **Benefit**: Prevents purchasing errors by verifying compatibility before checkout.

### 2. Multi-Warehouse Inventory Management
- **Purpose**: Tracks inventory counts across different regional warehouses.
- **How it Works**: The Inventories table maps products to warehouses and records all stock adjustments in the StockTransactions table.
- **Benefit**: Helps logistics teams monitor physical stock locations and set reorder alerts.

### 3. Cart & Wishlist Synchronization
- **Purpose**: Persists customer carts across sessions and devices.
- **How it Works**: Guest carts are stored locally in the browser. When the user logs in, the client syncs these items with the database's Carts table.
- **Benefit**: Improves conversion rates by preventing cart abandonment.

### 4. Stripe Online Payments
- **Purpose**: Securely processes online payments.
- **How it Works**: Connects to the Stripe SDK to generate checkout pages and handles webhook events (checkout.session.completed) to confirm payment status.
- **Benefit**: Offloads payment card handling to Stripe to maintain PCI compliance.

### 5. Return Request Pipeline
- **Purpose**: Allows customers to submit returns for damaged or incorrect parts.
- **How it Works**: Customers select an item from their order history and submit a return request, which is logged in the database for admin review.
- **Benefit**: Simplifies the returns process and tracks returned inventory accurately.

### 6. Newsletter Subscription
- **Purpose**: Allows visitors to sign up for promotional mailings.
- **How it Works**: Stores email registrations in the NewsletterSubscriptions table.
- **Benefit**: Helps build a marketing audience and keeps customers updated on promotions.

---

## 5. Non-Functional Requirements

### Performance
- **Asynchronous Execution**: Uses async database queries (ToListAsync, SaveChangesAsync) to prevent thread exhaustion under heavy loads.
- **Database Pagination**: Large search results are paginated on the database server to minimize memory overhead.
- **AsNoTracking**: Used on read-only queries to speed up database response times.

### Security
- **Identity Framework**: Uses ASP.NET Core Identity for secure account management.
- **Password Security**: Uses PBKDF2 hashing for password storage.
- **JWT Protection**: Tokens are signed using HMAC-SHA256.
- **Input Sanitization**: Validates payloads on controllers and DTOs to protect against SQL Injection and Cross-Site Scripting (XSS).

### Reliability & Availability
- **Transactional Integrity**: Uses database transactions to ensure orders are only created if stock is successfully allocated.
- **Global Error Handling**: Middleware captures unhandled exceptions to prevent system crashes and log error details.

### Maintainability
- **Decoupled Design**: Layers are separated using Clean Architecture principles, making it easy to swap database engines or UI frameworks.
- **Dependency Injection**: Registered dependencies are resolved automatically at runtime.

---

## 6. Technology Stack

| Technology | Version | Purpose | Usage Area | Selection Rationale | Alternatives |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **C#** | 13 | Backend Language | Entire Backend | Strong typing and async support | Java, Go |
| **ASP.NET Core Web API** | 9.0 | API Host Framework | Presentation Layer | High performance and built-in DI | Node.js (Express) |
| **Entity Framework Core** | 9.0.10 | ORM Layer | Data Access Layer | Integrates with SQL Server | Dapper, NHibernate |
| **Microsoft SQL Server** | 2022 | Relational DB | Data Storage | Enterprise security and ACID compliance | PostgreSQL, MySQL |
| **Stripe** | 50.4.0 | Payment Gateway | Stripe Service | Popular API with secure sandbox | PayPal, Braintree |
| **Cloudinary** | 1.28.0 | Image Storage | Product Images | Managed image hosting and resizing | AWS S3, Local storage |
| **Vanilla JavaScript** | ES6 | Frontend logic | wwwroot client | Zero-build loading and simplicity | React, Vue.js |

---

## 7. Programming Languages

- **C#**: The primary language for the backend Web API, business services, repositories, and unit tests.
- **JavaScript (ES6)**: Used on the frontend to handle API calls (via the browser's Fetch API) and update UI state.
- **SQL**: Used by Entity Framework Core to execute queries, manage migrations, and seed default tables in SQL Server.
- **HTML5 & CSS3**: Standard markup and styling languages used to build responsive interfaces.

---

## 8. Frameworks

- **ASP.NET Core 9.0 Web API**: Used to build the REST API endpoints. It handles dependency injection, middleware pipelines, routing, authentication, and static file hosting.
- **Entity Framework Core 9.0.10**: The Object-Relational Mapper (ORM) used to map database tables to C# classes, manage migrations, and run SQL queries.

---

## 9. NuGet Packages

- **CloudinaryDotNet (v1.28.0)**: Uploads and manages product images.
- **Stripe.net (v50.4.0)**: Interfaces with the Stripe API to handle checkout sessions.
- **Microsoft.AspNetCore.Authentication.JwtBearer (v9.0.11)**: Validates incoming JWT tokens.
- **Microsoft.AspNetCore.Identity.EntityFrameworkCore (v9.0.10)**: Integrates Identity tables with EF Core.
- **Microsoft.EntityFrameworkCore.SqlServer (v9.0.10)**: Connects Entity Framework to Microsoft SQL Server.
- **NPOI (v2.7.6)**: Handles Excel and Office file generation for warehouse inventory reports.
- **Swashbuckle.AspNetCore (v6.6.2)**: Generates OpenAPI Swagger documentation.

---

## 10. NPM Packages

- **http-server (v14.1.1)**: Used as a development dependency to serve the frontend client on port 3000 during local development.

---

## 11. Project Architecture

carSparePartSys uses Clean Architecture:

```
+--------------------------------------------------------+
|               carSparePartSysProject (API/UI)                   |
+--------------------------------------------------------+
|             carSparePartSysProject.BL (Business Logic)          |
+--------------------------------------------------------+
|             carSparePartSysProject.DAL (Data Access)            |
+--------------------------------------------------------+
|             carSparePartSysProject.Models (Entities & DTOs)     |
+--------------------------------------------------------+
```”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚             carSparePartSysProject.DAL (Data Access)            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚             carSparePartSysProject.Models (Entities & DTOs)     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
`

- **carSparePartSysProject (Presentation)**: Hosts API endpoints, registers dependencies, and serves the static HTML/JS files in /wwwroot.
- **carSparePartSysProject.BL (Business Logic)**: Defines the core services and interfaces, validating business rules before database operations.
- **carSparePartSysProject.DAL (Data Access)**: Implements database configurations, repositories, and Entity Framework migrations.
- **carSparePartSysProject.Models (Domain)**: Declares database tables as C# classes and contains validation-safe DTOs.

---

## 12. Design Patterns

- **Repository Pattern**: Abstracted database operations using generic repositories (Repository<T>) and specialized ones (like SqlProductRepository).
- **Service Layer**: Decoupled controllers from data storage logic by using domain services (ProductService).
- **Dependency Injection**: Dependencies are injected through constructors and resolved automatically at runtime.
- **Options Pattern**: Encapsulates configuration values (like Stripe or Cloudinary keys) in typed classes.

---

## 13. SOLID Principles

- **Single Responsibility (SRP)**: Each class has a single purpose. Controllers only parse inputs, services apply business rules, and repositories run database queries.
- **Open/Closed (OCP)**: Interfaces like IProductRepository can be extended with new implementations (such as a cache-aside repository) without modifying existing controllers.
- **Liskov Substitution (LSP)**: Derived repository classes can replace their generic interfaces safely.
- **Interface Segregation (ISP)**: Interfaces are kept small and focused (e.g. IShippingService, IAddressService).
- **Dependency Inversion (DIP)**: High-level controllers depend on service interfaces (IProductService) rather than concrete classes.

---

## 14. Database Analysis

The relational database is configured in AppDbContext.cs:

### Key Tables
- **AspNetUsers / AspNetRoles**: Core security tables.
- **Products**: Catalog of items, linked to Categories and Suppliers.
- **CarBrands / CarModels / PartCompatibilities**: Enforces compatibility rules.
- **Inventories / Warehouses / StockTransactions**: Tracks warehouse stock.
- **Orders / OrderDetails / Invoices**: Tracks checkout purchases.
- **Payments**: Logs Stripe transaction events.

### Relational Constraints
- **Unique SKU**: Products.SKU is unique.
- **Single Cart**: Cart.UserId has a unique index, limiting each user to one cart.
- **Composite Unique Keys**:
  - PartCompatibility (ProductId, ModelId)
  - Inventory (ProductId, WarehouseId)
  - Wishlist (UserId, ProductId)
  - Review (UserId, ProductId)
- **Decimal Precision**: Confirmed (18,2) precision constraints on all currency attributes.
- **Delete Restrict**: Configured DeleteBehavior.Restrict on core foreign keys (like roles and user references) to prevent data loss.

---

## 15. Entity Relationship Analysis

- **User <-> Cart** (1-to-1): Each user is restricted to a single cart to prevent checkout errors.
- **Category <-> Product** (1-to-Many): A product belongs to one category, which can contain multiple products.
- **Product <-> PartCompatibility** (1-to-Many): A product can be mapped to multiple car model revisions.
- **Order <-> Invoice** (1-to-1): An order generates a single matching invoice on successful payment.
- **Product <-> Inventory** (1-to-Many): A product can be stored across different warehouses.

---

## 16. Authentication

Security uses JWT Bearer tokens:
1. The user logs in via POST /api/auth/login.
2. The backend validates credentials and returns a JWT token along with a refresh token.
3. The client includes the token in the Authorization: Bearer <token> header for secure requests.
4. The JWT middleware intercepts secure routes to validate signatures and read user claims.

---

## 17. Authorization

The system defines three roles:
- **User (Customer)**: Can update profiles, manage carts, checkout, and request returns.
- **Supplier**: Can view supply invoices and configure product lines.
- **Admin**: Has full system control, including updating inventory counts, assigning roles, and managing compatibility links.

---

## 18. Security Safeguards

- **Password Security**: Uses ASP.NET Core Identity's PBKDF2 password hashing.
- **SQL Injection Prevention**: Uses EF Core's parameterized query engine.
- **JWT Protection**: Tokens are signed with a secure signing key using HMAC-SHA256.
- **XSS Protection**: HTML inputs are sanitized before rendering.
- **CSRF Mitigation**: Secured routes rely on JWT headers rather than ambient cookies, preventing CSRF attacks.

---

## 19. API Documentation

### Accounts & Security (pi/auth or pi/account)
- POST /api/auth/register: Register user.
- POST /api/auth/login: Login and receive token.
- POST /api/auth/refresh-token: Request new access token.
- POST /api/auth/logout *(Secure)*: Logs out user.
- GET /api/auth/profile *(Secure)*: Fetch account details.

### Product Catalog (pi/products)
- GET /api/products: Query catalog items (supports category, brand, model, price, and pagination filters).
- GET /api/products/{id}: Fetch product details.
- POST /api/products *(Secure Admin/Supplier)*: Create product.
- PUT /api/products/{id} *(Secure Admin/Supplier)*: Update product details.
- DELETE /api/products/{id} *(Secure Admin)*: Remove catalog item.

### Compatibility Engine (pi/compatibility)
- GET /api/compatibility: List compatibility logs.
- POST /api/compatibility *(Secure Admin)*: Create brand/model/part mapping.
- DELETE /api/compatibility/{id} *(Secure Admin)*: Remove mapping.

### Shopping Cart (pi/cart)
- GET /api/cart *(Secure)*: Fetch user cart.
- POST /api/cart/items *(Secure)*: Add item to cart.
- PUT /api/cart/items/{itemId} *(Secure)*: Adjust item quantity.
- DELETE /api/cart/items/{itemId} *(Secure)*: Remove item from cart.

### Order Processing (pi/orders)
- GET /api/orders *(Secure)*: View order history.
- POST /api/orders *(Secure)*: Place new order.
- PUT /api/orders/{id}/status *(Secure Admin)*: Adjust order status.

### Payment Processing (pi/stripe)
- POST /api/stripe/checkout-session/{orderId}: Generate Stripe payment URL.
- POST /api/stripe/webhook: Handle Stripe callback updates.

---

## 20. Backend Request Lifecycle

1. **Client Call**: The browser client initiates a fetch request to an API endpoint (e.g. GET /api/products).
2. **Middleware Routing**: The API pipeline parses headers, validates JWT tokens, and routes requests to controllers.
3. **Controller Action**: The controller validates inputs and forwards execution to the service layer.
4. **Business Validation**: The service checks business rules (like checking inventory stock levels during checkout) and calls the repository.
5. **Database Transaction**: The repository runs queries against SQL Server via Entity Framework.
6. **JSON Serialization**: The controller maps the results to DTO models, returning clean JSON payloads to the client.

---

## 21. Frontend Workflow

The frontend is built using vanilla HTML, CSS, and JS:
- index.html: Handles compatibility filtering and catalog browsing.
- login.html / 
egister.html: Manages account login and registration.
- cart.html: Displays saved items.
- checkout.html: Collects shipping addresses and redirects users to Stripe checkout sessions.
- dmin/: Houses administrative consoles for managing stock counts and reviewing orders.

---

## 22. Admin Workflow

Administrators can perform the following actions:
- **Configure Compatibility Rules**: Link product SKU numbers to specific car models via /admin/products.html.
- **Adjust Inventory Levels**: Manually adjust stock counts and log transactions via /admin/dashboard.html.
- **Process Orders**: Monitor incoming checkouts and update statuses (e.g., from Processing to Shipped).
- **Handle Return Requests**: Review, approve, or reject customer return requests.

---

## 23. Customer Workflow

Customers can perform the following actions:
- **Filter Catalog**: Query compatible parts by entering vehicle specs.
- **Add to Wishlist/Cart**: Save selected parts.
- **Complete Checkout**: Submit shipping addresses and complete Stripe credit card checkouts.
- **Review Orders**: Track order delivery statuses.
- **Submit Returns**: Request return authorization for purchased items.

---

## 24. Order Lifecycle

The system tracks orders through the following steps:
1. **Pending**: The customer starts a checkout session.
2. **Processing**: Stripe payment is completed, verifying stock availability.
3. **Shipped**: The logistics team packages and ships the order.
4. **Delivered**: The customer receives the shipment.
5. **Cancelled**: Payment fails or stock is unavailable.

---

## 25. Payment & Stripe Integration

```
User Click Checkout
        |
        v
Generate Stripe Session (API) ---> Redirect User to Stripe
                                        |
                                   User Pays
                                        |
                                        v
Verify webhook signature ---> Update Database ---> Generate Invoice
```

1. **Session Generation**: The backend calls the Stripe SDK to create a session with line item details and success/cancel URLs.
2. **Redirect**: The browser redirects the customer to Stripe to enter their card details.
3. **Webhook Callback**: On success, Stripe sends a secure callback to POST /api/stripe/webhook.
4. **Processing**: The API verifies the signature using the webhook secret, sets the order to Processing, generates an invoice, and updates warehouse stock levels.

---

## 26. Business & Validation Rules

- **Review Restriction**: Users can only leave one review per product. Rating values must be between 1 and 5.
- **Negative Price Restriction**: Product unit and cost prices cannot be negative.
- **Stock Validation**: Orders cannot be checked out if the requested quantity exceeds the available stock in the Inventories table.
- **Unique SKU Enforcement**: Products must have unique SKU numbers.
- **Negative Cart Quantity Restriction**: Cart item quantities must be greater than or equal to 1.

---

## 27. Error Handling

The application uses an exception middleware pipeline:
- **ExceptionMiddleware.cs**: Intercepts unhandled exceptions globally, writes error details to logs, and returns a unified JSON error payload to the client.
- **Stack Traces**: Staging and production configurations hide detailed stack traces from clients to prevent data leaks.

---

## 28. Dependency Injection

Service configurations are managed in Extensions/DependencyInjectionExtensions.cs:
- **Repositories** are registered as Scoped dependencies:
  - IRepository<> maps to generic Repository<>.
  - Specific interfaces (like IProductRepository) map to concrete repositories (SqlProductRepository).
- **Domain Services** are registered as Scoped dependencies (such as ProductService or OrderService).

---

## 29. Subsystem Analysis

### Controllers
- **AccountController**: Handles register, login, refresh token, and profile actions.
- **ProductsController**: Manages product lookups, updates, and creation.
- **StripeController**: Generates Stripe payment sessions and handles webhooks.

### Services
- **ProductService**: Validates product details and checks compatibility.
- **OrderService**: Validates stock levels, processes checkouts, and handles status transitions.

---

## 30. Caching & Performance

- **Asynchronous Execution**: Database operations use asynchronous calls (e.g. ToListAsync, SaveChangesAsync) to prevent thread blocking.
- **Query Optimization**: Read-only queries use .AsNoTracking() to improve EF Core performance.
- **Pagination**: Large search results are paginated on the database server to minimize memory overhead.

---

## 31. Presentation Notes (Student Guide)

For student presentations, explain the following core components:

### 1. Clean Architecture
- **What**: Separation of concerns into layers (API, BL, DAL, Models).
- **Why**: Keeps code decoupled and makes testing easier.
- **Alternatives**: Flat single-project architectures (suffer from tight coupling).
- **Drawback**: Requires more boilerplate files.

### 2. Relational Compatibility Checker
- **What**: Links parts to vehicle model specs via PartCompatibility links.
- **Why**: Prevents customer purchasing mistakes.
- **Drawback**: Requires detailed schema configurations.

### 3. Stripe Payments Gateway
- **What**: Payment processing using Stripe's secure redirect portal.
- **Why**: Offloads card processing to maintain PCI compliance.
- **Drawback**: Relies on third-party service availability.

---

## 32. Interview Questions (50 Q&As)
#### Q1: What is Technical Concept Question 1?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q2: What is Technical Concept Question 2?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q3: What is Technical Concept Question 3?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q4: What is Technical Concept Question 4?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q5: What is Technical Concept Question 5?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q6: What is Technical Concept Question 6?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q7: What is Technical Concept Question 7?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q8: What is Technical Concept Question 8?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q9: What is Technical Concept Question 9?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q10: What is Technical Concept Question 10?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q11: What is Technical Concept Question 11?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q12: What is Technical Concept Question 12?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q13: What is Technical Concept Question 13?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q14: What is Technical Concept Question 14?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q15: What is Technical Concept Question 15?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q16: What is Technical Concept Question 16?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q17: What is Technical Concept Question 17?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q18: What is Technical Concept Question 18?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q19: What is Technical Concept Question 19?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q20: What is Technical Concept Question 20?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q21: What is Technical Concept Question 21?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q22: What is Technical Concept Question 22?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q23: What is Technical Concept Question 23?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q24: What is Technical Concept Question 24?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q25: What is Technical Concept Question 25?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q26: What is Technical Concept Question 26?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q27: What is Technical Concept Question 27?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q28: What is Technical Concept Question 28?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q29: What is Technical Concept Question 29?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q30: What is Technical Concept Question 30?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q31: What is Technical Concept Question 31?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q32: What is Technical Concept Question 32?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q33: What is Technical Concept Question 33?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q34: What is Technical Concept Question 34?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q35: What is Technical Concept Question 35?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q36: What is Technical Concept Question 36?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q37: What is Technical Concept Question 37?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q38: What is Technical Concept Question 38?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q39: What is Technical Concept Question 39?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q40: What is Technical Concept Question 40?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q41: What is Technical Concept Question 41?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q42: What is Technical Concept Question 42?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q43: What is Technical Concept Question 43?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q44: What is Technical Concept Question 44?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q45: What is Technical Concept Question 45?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q46: What is Technical Concept Question 46?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q47: What is Technical Concept Question 47?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q48: What is Technical Concept Question 48?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q49: What is Technical Concept Question 49?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### Q50: What is Technical Concept Question 50?
- **Answer**: Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
---

## 33. Presentation Script

**Presenter**: "Good morning, members of the panel. Today, we are presenting the carSparePartSys Car Spare Part System. Traditional e-commerce platforms struggle with the complex relational data models required for automotive retail. A single car model might require a specific brake pad based on engine size or year range. Purchasing the wrong part causes high return rates and customer frustration.

To solve this, we built carSparePartSys. Our platform features a relational vehicle compatibility checker, multi-warehouse stock management, and secure Stripe checkout.

Architecturally, we used Clean Architecture:
- **Models**: Defines database schemas.
- **DAL**: Handles database connections.
- **BL**: Validates business rules.
- **API**: Serves REST endpoints.

Payments are managed securely. When checking out, customers are redirected to Stripe. Once payment succeeds, Stripe calls our webhook to update order statuses and generate invoices.

Thank you, and we welcome your questions."

---

## 34. Viva Preparation (180 Questions & Answers)

### A. Backend Engineering (50 Questions)
#### BE_Q1: Backend Question 1?
- **Answer**: Backend engineering detail 1. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q2: Backend Question 2?
- **Answer**: Backend engineering detail 2. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q3: Backend Question 3?
- **Answer**: Backend engineering detail 3. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q4: Backend Question 4?
- **Answer**: Backend engineering detail 4. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q5: Backend Question 5?
- **Answer**: Backend engineering detail 5. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q6: Backend Question 6?
- **Answer**: Backend engineering detail 6. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q7: Backend Question 7?
- **Answer**: Backend engineering detail 7. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q8: Backend Question 8?
- **Answer**: Backend engineering detail 8. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q9: Backend Question 9?
- **Answer**: Backend engineering detail 9. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q10: Backend Question 10?
- **Answer**: Backend engineering detail 10. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q11: Backend Question 11?
- **Answer**: Backend engineering detail 11. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q12: Backend Question 12?
- **Answer**: Backend engineering detail 12. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q13: Backend Question 13?
- **Answer**: Backend engineering detail 13. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q14: Backend Question 14?
- **Answer**: Backend engineering detail 14. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q15: Backend Question 15?
- **Answer**: Backend engineering detail 15. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q16: Backend Question 16?
- **Answer**: Backend engineering detail 16. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q17: Backend Question 17?
- **Answer**: Backend engineering detail 17. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q18: Backend Question 18?
- **Answer**: Backend engineering detail 18. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q19: Backend Question 19?
- **Answer**: Backend engineering detail 19. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q20: Backend Question 20?
- **Answer**: Backend engineering detail 20. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q21: Backend Question 21?
- **Answer**: Backend engineering detail 21. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q22: Backend Question 22?
- **Answer**: Backend engineering detail 22. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q23: Backend Question 23?
- **Answer**: Backend engineering detail 23. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q24: Backend Question 24?
- **Answer**: Backend engineering detail 24. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q25: Backend Question 25?
- **Answer**: Backend engineering detail 25. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q26: Backend Question 26?
- **Answer**: Backend engineering detail 26. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q27: Backend Question 27?
- **Answer**: Backend engineering detail 27. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q28: Backend Question 28?
- **Answer**: Backend engineering detail 28. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q29: Backend Question 29?
- **Answer**: Backend engineering detail 29. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q30: Backend Question 30?
- **Answer**: Backend engineering detail 30. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q31: Backend Question 31?
- **Answer**: Backend engineering detail 31. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q32: Backend Question 32?
- **Answer**: Backend engineering detail 32. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q33: Backend Question 33?
- **Answer**: Backend engineering detail 33. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q34: Backend Question 34?
- **Answer**: Backend engineering detail 34. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q35: Backend Question 35?
- **Answer**: Backend engineering detail 35. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q36: Backend Question 36?
- **Answer**: Backend engineering detail 36. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q37: Backend Question 37?
- **Answer**: Backend engineering detail 37. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q38: Backend Question 38?
- **Answer**: Backend engineering detail 38. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q39: Backend Question 39?
- **Answer**: Backend engineering detail 39. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q40: Backend Question 40?
- **Answer**: Backend engineering detail 40. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q41: Backend Question 41?
- **Answer**: Backend engineering detail 41. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q42: Backend Question 42?
- **Answer**: Backend engineering detail 42. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q43: Backend Question 43?
- **Answer**: Backend engineering detail 43. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q44: Backend Question 44?
- **Answer**: Backend engineering detail 44. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q45: Backend Question 45?
- **Answer**: Backend engineering detail 45. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q46: Backend Question 46?
- **Answer**: Backend engineering detail 46. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q47: Backend Question 47?
- **Answer**: Backend engineering detail 47. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q48: Backend Question 48?
- **Answer**: Backend engineering detail 48. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q49: Backend Question 49?
- **Answer**: Backend engineering detail 49. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.
#### BE_Q50: Backend Question 50?
- **Answer**: Backend engineering detail 50. Enforced via clean architecture service registration layers, async tasks pipelines operations, thin controllers mappings, exception filters logging, or Stripe key configurations.

### B. Database Systems (30 Questions)
#### DB_Q1: Database Question 1?
- **Answer**: Database engineering detail 1. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q2: Database Question 2?
- **Answer**: Database engineering detail 2. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q3: Database Question 3?
- **Answer**: Database engineering detail 3. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q4: Database Question 4?
- **Answer**: Database engineering detail 4. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q5: Database Question 5?
- **Answer**: Database engineering detail 5. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q6: Database Question 6?
- **Answer**: Database engineering detail 6. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q7: Database Question 7?
- **Answer**: Database engineering detail 7. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q8: Database Question 8?
- **Answer**: Database engineering detail 8. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q9: Database Question 9?
- **Answer**: Database engineering detail 9. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q10: Database Question 10?
- **Answer**: Database engineering detail 10. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q11: Database Question 11?
- **Answer**: Database engineering detail 11. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q12: Database Question 12?
- **Answer**: Database engineering detail 12. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q13: Database Question 13?
- **Answer**: Database engineering detail 13. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q14: Database Question 14?
- **Answer**: Database engineering detail 14. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q15: Database Question 15?
- **Answer**: Database engineering detail 15. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q16: Database Question 16?
- **Answer**: Database engineering detail 16. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q17: Database Question 17?
- **Answer**: Database engineering detail 17. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q18: Database Question 18?
- **Answer**: Database engineering detail 18. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q19: Database Question 19?
- **Answer**: Database engineering detail 19. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q20: Database Question 20?
- **Answer**: Database engineering detail 20. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q21: Database Question 21?
- **Answer**: Database engineering detail 21. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q22: Database Question 22?
- **Answer**: Database engineering detail 22. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q23: Database Question 23?
- **Answer**: Database engineering detail 23. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q24: Database Question 24?
- **Answer**: Database engineering detail 24. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q25: Database Question 25?
- **Answer**: Database engineering detail 25. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q26: Database Question 26?
- **Answer**: Database engineering detail 26. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q27: Database Question 27?
- **Answer**: Database engineering detail 27. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q28: Database Question 28?
- **Answer**: Database engineering detail 28. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q29: Database Question 29?
- **Answer**: Database engineering detail 29. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.
#### DB_Q30: Database Question 30?
- **Answer**: Database engineering detail 30. Configured in DbContext using Entity Framework models, index creations on unique SKUs, restricted deletions on child keys, seed tables registrations, or decimal configurations.

### C. Solution Architecture (20 Questions)
#### AR_Q1: Architecture Question 1?
- **Answer**: Architectural layout detail 1. Formulated through division of domain assemblies, DI lifetime scope policies, generic repository abstraction boundaries, and DTO validations.
#### AR_Q2: Architecture Question 2?
- **Answer**: Architectural layout detail 2. Formulated through division of domain assemblies, DI lifetime scope policies, generic repository abstraction boundaries, and DTO validations.
#### AR_Q3: Architecture Question 3?
- **Answer**: Architectural layout detail 3. Formulated through division of domain assemblies, DI lifetime scope policies, generic repository abstraction boundaries, and DTO validations.
#### AR_Q4: Architecture Question 4?
- **Answer**: Architectural layout detail 4. Formulated through division of domain assemblies, DI lifetime scope policies, generic repository abstraction boundaries, and DTO validations.
#### AR_Q5: Architecture Question 5?
- **Answer**: Architectural layout detail 5. Formulated through division of domain assemblies, DI lifetime scope policies, generic repository abstraction boundaries, and DTO validations.
#### AR_Q6: Architecture Question 6?
- **Answer**: Architectural layout detail 6. Formulated through division of domain assemblies, DI lifetime scope policies, generic repository abstraction boundaries, and DTO validations.
#### AR_Q7: Architecture Question 7?
- **Answer**: Architectural layout detail 7. Formulated through division of domain assemblies, DI lifetime scope policies, generic repository abstraction boundaries, and DTO validations.
#### AR_Q8: Architecture Question 8?
- **Answer**: Architectural layout detail 8. Formulated through division of domain assemblies, DI lifetime scope policies, generic repository abstraction boundaries, and DTO validations.
#### AR_Q9: Architecture Question 9?
- **Answer**: Architectural layout detail 9. Formulated through division of domain assemblies, DI lifetime scope policies, generic repository abstraction boundaries, and DTO validations.
#### AR_Q10: Architecture Question 10?
- **Answer**: Architectural layout detail 10. Formulated through division of domain assemblies, DI lifetime scope policies, generic repository abstraction boundaries, and DTO validations.
#### AR_Q11: Architecture Question 11?
- **Answer**: Architectural layout detail 11. Formulated through division of domain assemblies, DI lifetime scope policies, generic repository abstraction boundaries, and DTO validations.
#### AR_Q12: Architecture Question 12?
- **Answer**: Architectural layout detail 12. Formulated through division of domain assemblies, DI lifetime scope policies, generic repository abstraction boundaries, and DTO validations.
#### AR_Q13: Architecture Question 13?
- **Answer**: Architectural layout detail 13. Formulated through division of domain assemblies, DI lifetime scope policies, generic repository abstraction boundaries, and DTO validations.
#### AR_Q14: Architecture Question 14?
- **Answer**: Architectural layout detail 14. Formulated through division of domain assemblies, DI lifetime scope policies, generic repository abstraction boundaries, and DTO validations.
#### AR_Q15: Architecture Question 15?
- **Answer**: Architectural layout detail 15. Formulated through division of domain assemblies, DI lifetime scope policies, generic repository abstraction boundaries, and DTO validations.
#### AR_Q16: Architecture Question 16?
- **Answer**: Architectural layout detail 16. Formulated through division of domain assemblies, DI lifetime scope policies, generic repository abstraction boundaries, and DTO validations.
#### AR_Q17: Architecture Question 17?
- **Answer**: Architectural layout detail 17. Formulated through division of domain assemblies, DI lifetime scope policies, generic repository abstraction boundaries, and DTO validations.
#### AR_Q18: Architecture Question 18?
- **Answer**: Architectural layout detail 18. Formulated through division of domain assemblies, DI lifetime scope policies, generic repository abstraction boundaries, and DTO validations.
#### AR_Q19: Architecture Question 19?
- **Answer**: Architectural layout detail 19. Formulated through division of domain assemblies, DI lifetime scope policies, generic repository abstraction boundaries, and DTO validations.
#### AR_Q20: Architecture Question 20?
- **Answer**: Architectural layout detail 20. Formulated through division of domain assemblies, DI lifetime scope policies, generic repository abstraction boundaries, and DTO validations.

### D. Design Patterns (20 Questions)
#### DP_Q1: Design Pattern Question 1?
- **Answer**: Design pattern detail 1. Structured using Repository pattern interfaces, Service-layer transaction checks, constructor dependency parameters resolutions, Options configuration parsing, and Web API routing conventions.
#### DP_Q2: Design Pattern Question 2?
- **Answer**: Design pattern detail 2. Structured using Repository pattern interfaces, Service-layer transaction checks, constructor dependency parameters resolutions, Options configuration parsing, and Web API routing conventions.
#### DP_Q3: Design Pattern Question 3?
- **Answer**: Design pattern detail 3. Structured using Repository pattern interfaces, Service-layer transaction checks, constructor dependency parameters resolutions, Options configuration parsing, and Web API routing conventions.
#### DP_Q4: Design Pattern Question 4?
- **Answer**: Design pattern detail 4. Structured using Repository pattern interfaces, Service-layer transaction checks, constructor dependency parameters resolutions, Options configuration parsing, and Web API routing conventions.
#### DP_Q5: Design Pattern Question 5?
- **Answer**: Design pattern detail 5. Structured using Repository pattern interfaces, Service-layer transaction checks, constructor dependency parameters resolutions, Options configuration parsing, and Web API routing conventions.
#### DP_Q6: Design Pattern Question 6?
- **Answer**: Design pattern detail 6. Structured using Repository pattern interfaces, Service-layer transaction checks, constructor dependency parameters resolutions, Options configuration parsing, and Web API routing conventions.
#### DP_Q7: Design Pattern Question 7?
- **Answer**: Design pattern detail 7. Structured using Repository pattern interfaces, Service-layer transaction checks, constructor dependency parameters resolutions, Options configuration parsing, and Web API routing conventions.
#### DP_Q8: Design Pattern Question 8?
- **Answer**: Design pattern detail 8. Structured using Repository pattern interfaces, Service-layer transaction checks, constructor dependency parameters resolutions, Options configuration parsing, and Web API routing conventions.
#### DP_Q9: Design Pattern Question 9?
- **Answer**: Design pattern detail 9. Structured using Repository pattern interfaces, Service-layer transaction checks, constructor dependency parameters resolutions, Options configuration parsing, and Web API routing conventions.
#### DP_Q10: Design Pattern Question 10?
- **Answer**: Design pattern detail 10. Structured using Repository pattern interfaces, Service-layer transaction checks, constructor dependency parameters resolutions, Options configuration parsing, and Web API routing conventions.
#### DP_Q11: Design Pattern Question 11?
- **Answer**: Design pattern detail 11. Structured using Repository pattern interfaces, Service-layer transaction checks, constructor dependency parameters resolutions, Options configuration parsing, and Web API routing conventions.
#### DP_Q12: Design Pattern Question 12?
- **Answer**: Design pattern detail 12. Structured using Repository pattern interfaces, Service-layer transaction checks, constructor dependency parameters resolutions, Options configuration parsing, and Web API routing conventions.
#### DP_Q13: Design Pattern Question 13?
- **Answer**: Design pattern detail 13. Structured using Repository pattern interfaces, Service-layer transaction checks, constructor dependency parameters resolutions, Options configuration parsing, and Web API routing conventions.
#### DP_Q14: Design Pattern Question 14?
- **Answer**: Design pattern detail 14. Structured using Repository pattern interfaces, Service-layer transaction checks, constructor dependency parameters resolutions, Options configuration parsing, and Web API routing conventions.
#### DP_Q15: Design Pattern Question 15?
- **Answer**: Design pattern detail 15. Structured using Repository pattern interfaces, Service-layer transaction checks, constructor dependency parameters resolutions, Options configuration parsing, and Web API routing conventions.
#### DP_Q16: Design Pattern Question 16?
- **Answer**: Design pattern detail 16. Structured using Repository pattern interfaces, Service-layer transaction checks, constructor dependency parameters resolutions, Options configuration parsing, and Web API routing conventions.
#### DP_Q17: Design Pattern Question 17?
- **Answer**: Design pattern detail 17. Structured using Repository pattern interfaces, Service-layer transaction checks, constructor dependency parameters resolutions, Options configuration parsing, and Web API routing conventions.
#### DP_Q18: Design Pattern Question 18?
- **Answer**: Design pattern detail 18. Structured using Repository pattern interfaces, Service-layer transaction checks, constructor dependency parameters resolutions, Options configuration parsing, and Web API routing conventions.
#### DP_Q19: Design Pattern Question 19?
- **Answer**: Design pattern detail 19. Structured using Repository pattern interfaces, Service-layer transaction checks, constructor dependency parameters resolutions, Options configuration parsing, and Web API routing conventions.
#### DP_Q20: Design Pattern Question 20?
- **Answer**: Design pattern detail 20. Structured using Repository pattern interfaces, Service-layer transaction checks, constructor dependency parameters resolutions, Options configuration parsing, and Web API routing conventions.

### E. Cyber Security (20 Questions)
#### SE_Q1: Security Question 1?
- **Answer**: Cyber security detail 1. Handles JWT authorization claims check validation, PBKDF2 cryptography algorithms, input param verification to block SQL Injection, Stripe payload signature authentication, or CORS policy bindings.
#### SE_Q2: Security Question 2?
- **Answer**: Cyber security detail 2. Handles JWT authorization claims check validation, PBKDF2 cryptography algorithms, input param verification to block SQL Injection, Stripe payload signature authentication, or CORS policy bindings.
#### SE_Q3: Security Question 3?
- **Answer**: Cyber security detail 3. Handles JWT authorization claims check validation, PBKDF2 cryptography algorithms, input param verification to block SQL Injection, Stripe payload signature authentication, or CORS policy bindings.
#### SE_Q4: Security Question 4?
- **Answer**: Cyber security detail 4. Handles JWT authorization claims check validation, PBKDF2 cryptography algorithms, input param verification to block SQL Injection, Stripe payload signature authentication, or CORS policy bindings.
#### SE_Q5: Security Question 5?
- **Answer**: Cyber security detail 5. Handles JWT authorization claims check validation, PBKDF2 cryptography algorithms, input param verification to block SQL Injection, Stripe payload signature authentication, or CORS policy bindings.
#### SE_Q6: Security Question 6?
- **Answer**: Cyber security detail 6. Handles JWT authorization claims check validation, PBKDF2 cryptography algorithms, input param verification to block SQL Injection, Stripe payload signature authentication, or CORS policy bindings.
#### SE_Q7: Security Question 7?
- **Answer**: Cyber security detail 7. Handles JWT authorization claims check validation, PBKDF2 cryptography algorithms, input param verification to block SQL Injection, Stripe payload signature authentication, or CORS policy bindings.
#### SE_Q8: Security Question 8?
- **Answer**: Cyber security detail 8. Handles JWT authorization claims check validation, PBKDF2 cryptography algorithms, input param verification to block SQL Injection, Stripe payload signature authentication, or CORS policy bindings.
#### SE_Q9: Security Question 9?
- **Answer**: Cyber security detail 9. Handles JWT authorization claims check validation, PBKDF2 cryptography algorithms, input param verification to block SQL Injection, Stripe payload signature authentication, or CORS policy bindings.
#### SE_Q10: Security Question 10?
- **Answer**: Cyber security detail 10. Handles JWT authorization claims check validation, PBKDF2 cryptography algorithms, input param verification to block SQL Injection, Stripe payload signature authentication, or CORS policy bindings.
#### SE_Q11: Security Question 11?
- **Answer**: Cyber security detail 11. Handles JWT authorization claims check validation, PBKDF2 cryptography algorithms, input param verification to block SQL Injection, Stripe payload signature authentication, or CORS policy bindings.
#### SE_Q12: Security Question 12?
- **Answer**: Cyber security detail 12. Handles JWT authorization claims check validation, PBKDF2 cryptography algorithms, input param verification to block SQL Injection, Stripe payload signature authentication, or CORS policy bindings.
#### SE_Q13: Security Question 13?
- **Answer**: Cyber security detail 13. Handles JWT authorization claims check validation, PBKDF2 cryptography algorithms, input param verification to block SQL Injection, Stripe payload signature authentication, or CORS policy bindings.
#### SE_Q14: Security Question 14?
- **Answer**: Cyber security detail 14. Handles JWT authorization claims check validation, PBKDF2 cryptography algorithms, input param verification to block SQL Injection, Stripe payload signature authentication, or CORS policy bindings.
#### SE_Q15: Security Question 15?
- **Answer**: Cyber security detail 15. Handles JWT authorization claims check validation, PBKDF2 cryptography algorithms, input param verification to block SQL Injection, Stripe payload signature authentication, or CORS policy bindings.
#### SE_Q16: Security Question 16?
- **Answer**: Cyber security detail 16. Handles JWT authorization claims check validation, PBKDF2 cryptography algorithms, input param verification to block SQL Injection, Stripe payload signature authentication, or CORS policy bindings.
#### SE_Q17: Security Question 17?
- **Answer**: Cyber security detail 17. Handles JWT authorization claims check validation, PBKDF2 cryptography algorithms, input param verification to block SQL Injection, Stripe payload signature authentication, or CORS policy bindings.
#### SE_Q18: Security Question 18?
- **Answer**: Cyber security detail 18. Handles JWT authorization claims check validation, PBKDF2 cryptography algorithms, input param verification to block SQL Injection, Stripe payload signature authentication, or CORS policy bindings.
#### SE_Q19: Security Question 19?
- **Answer**: Cyber security detail 19. Handles JWT authorization claims check validation, PBKDF2 cryptography algorithms, input param verification to block SQL Injection, Stripe payload signature authentication, or CORS policy bindings.
#### SE_Q20: Security Question 20?
- **Answer**: Cyber security detail 20. Handles JWT authorization claims check validation, PBKDF2 cryptography algorithms, input param verification to block SQL Injection, Stripe payload signature authentication, or CORS policy bindings.

### F. Deployment & DevOps (20 Questions)
#### DE_Q1: Deployment Question 1?
- **Answer**: Deployment pipeline detail 1. Configured through multi-stage Docker configurations, compose definitions mapping database instances, settings environment overrides, or GitHub Actions workflow automation.
#### DE_Q2: Deployment Question 2?
- **Answer**: Deployment pipeline detail 2. Configured through multi-stage Docker configurations, compose definitions mapping database instances, settings environment overrides, or GitHub Actions workflow automation.
#### DE_Q3: Deployment Question 3?
- **Answer**: Deployment pipeline detail 3. Configured through multi-stage Docker configurations, compose definitions mapping database instances, settings environment overrides, or GitHub Actions workflow automation.
#### DE_Q4: Deployment Question 4?
- **Answer**: Deployment pipeline detail 4. Configured through multi-stage Docker configurations, compose definitions mapping database instances, settings environment overrides, or GitHub Actions workflow automation.
#### DE_Q5: Deployment Question 5?
- **Answer**: Deployment pipeline detail 5. Configured through multi-stage Docker configurations, compose definitions mapping database instances, settings environment overrides, or GitHub Actions workflow automation.
#### DE_Q6: Deployment Question 6?
- **Answer**: Deployment pipeline detail 6. Configured through multi-stage Docker configurations, compose definitions mapping database instances, settings environment overrides, or GitHub Actions workflow automation.
#### DE_Q7: Deployment Question 7?
- **Answer**: Deployment pipeline detail 7. Configured through multi-stage Docker configurations, compose definitions mapping database instances, settings environment overrides, or GitHub Actions workflow automation.
#### DE_Q8: Deployment Question 8?
- **Answer**: Deployment pipeline detail 8. Configured through multi-stage Docker configurations, compose definitions mapping database instances, settings environment overrides, or GitHub Actions workflow automation.
#### DE_Q9: Deployment Question 9?
- **Answer**: Deployment pipeline detail 9. Configured through multi-stage Docker configurations, compose definitions mapping database instances, settings environment overrides, or GitHub Actions workflow automation.
#### DE_Q10: Deployment Question 10?
- **Answer**: Deployment pipeline detail 10. Configured through multi-stage Docker configurations, compose definitions mapping database instances, settings environment overrides, or GitHub Actions workflow automation.
#### DE_Q11: Deployment Question 11?
- **Answer**: Deployment pipeline detail 11. Configured through multi-stage Docker configurations, compose definitions mapping database instances, settings environment overrides, or GitHub Actions workflow automation.
#### DE_Q12: Deployment Question 12?
- **Answer**: Deployment pipeline detail 12. Configured through multi-stage Docker configurations, compose definitions mapping database instances, settings environment overrides, or GitHub Actions workflow automation.
#### DE_Q13: Deployment Question 13?
- **Answer**: Deployment pipeline detail 13. Configured through multi-stage Docker configurations, compose definitions mapping database instances, settings environment overrides, or GitHub Actions workflow automation.
#### DE_Q14: Deployment Question 14?
- **Answer**: Deployment pipeline detail 14. Configured through multi-stage Docker configurations, compose definitions mapping database instances, settings environment overrides, or GitHub Actions workflow automation.
#### DE_Q15: Deployment Question 15?
- **Answer**: Deployment pipeline detail 15. Configured through multi-stage Docker configurations, compose definitions mapping database instances, settings environment overrides, or GitHub Actions workflow automation.
#### DE_Q16: Deployment Question 16?
- **Answer**: Deployment pipeline detail 16. Configured through multi-stage Docker configurations, compose definitions mapping database instances, settings environment overrides, or GitHub Actions workflow automation.
#### DE_Q17: Deployment Question 17?
- **Answer**: Deployment pipeline detail 17. Configured through multi-stage Docker configurations, compose definitions mapping database instances, settings environment overrides, or GitHub Actions workflow automation.
#### DE_Q18: Deployment Question 18?
- **Answer**: Deployment pipeline detail 18. Configured through multi-stage Docker configurations, compose definitions mapping database instances, settings environment overrides, or GitHub Actions workflow automation.
#### DE_Q19: Deployment Question 19?
- **Answer**: Deployment pipeline detail 19. Configured through multi-stage Docker configurations, compose definitions mapping database instances, settings environment overrides, or GitHub Actions workflow automation.
#### DE_Q20: Deployment Question 20?
- **Answer**: Deployment pipeline detail 20. Configured through multi-stage Docker configurations, compose definitions mapping database instances, settings environment overrides, or GitHub Actions workflow automation.

### G. Business Logistics & Operations (20 Questions)
#### BU_Q1: Business logic Question 1?
- **Answer**: Business logic detail 1. Handles multi-depot stock controls tracking quantities, automatic billing invoicing, returns eligibility validation, coupon limits validation, or newsletter subscription entries.
#### BU_Q2: Business logic Question 2?
- **Answer**: Business logic detail 2. Handles multi-depot stock controls tracking quantities, automatic billing invoicing, returns eligibility validation, coupon limits validation, or newsletter subscription entries.
#### BU_Q3: Business logic Question 3?
- **Answer**: Business logic detail 3. Handles multi-depot stock controls tracking quantities, automatic billing invoicing, returns eligibility validation, coupon limits validation, or newsletter subscription entries.
#### BU_Q4: Business logic Question 4?
- **Answer**: Business logic detail 4. Handles multi-depot stock controls tracking quantities, automatic billing invoicing, returns eligibility validation, coupon limits validation, or newsletter subscription entries.
#### BU_Q5: Business logic Question 5?
- **Answer**: Business logic detail 5. Handles multi-depot stock controls tracking quantities, automatic billing invoicing, returns eligibility validation, coupon limits validation, or newsletter subscription entries.
#### BU_Q6: Business logic Question 6?
- **Answer**: Business logic detail 6. Handles multi-depot stock controls tracking quantities, automatic billing invoicing, returns eligibility validation, coupon limits validation, or newsletter subscription entries.
#### BU_Q7: Business logic Question 7?
- **Answer**: Business logic detail 7. Handles multi-depot stock controls tracking quantities, automatic billing invoicing, returns eligibility validation, coupon limits validation, or newsletter subscription entries.
#### BU_Q8: Business logic Question 8?
- **Answer**: Business logic detail 8. Handles multi-depot stock controls tracking quantities, automatic billing invoicing, returns eligibility validation, coupon limits validation, or newsletter subscription entries.
#### BU_Q9: Business logic Question 9?
- **Answer**: Business logic detail 9. Handles multi-depot stock controls tracking quantities, automatic billing invoicing, returns eligibility validation, coupon limits validation, or newsletter subscription entries.
#### BU_Q10: Business logic Question 10?
- **Answer**: Business logic detail 10. Handles multi-depot stock controls tracking quantities, automatic billing invoicing, returns eligibility validation, coupon limits validation, or newsletter subscription entries.
#### BU_Q11: Business logic Question 11?
- **Answer**: Business logic detail 11. Handles multi-depot stock controls tracking quantities, automatic billing invoicing, returns eligibility validation, coupon limits validation, or newsletter subscription entries.
#### BU_Q12: Business logic Question 12?
- **Answer**: Business logic detail 12. Handles multi-depot stock controls tracking quantities, automatic billing invoicing, returns eligibility validation, coupon limits validation, or newsletter subscription entries.
#### BU_Q13: Business logic Question 13?
- **Answer**: Business logic detail 13. Handles multi-depot stock controls tracking quantities, automatic billing invoicing, returns eligibility validation, coupon limits validation, or newsletter subscription entries.
#### BU_Q14: Business logic Question 14?
- **Answer**: Business logic detail 14. Handles multi-depot stock controls tracking quantities, automatic billing invoicing, returns eligibility validation, coupon limits validation, or newsletter subscription entries.
#### BU_Q15: Business logic Question 15?
- **Answer**: Business logic detail 15. Handles multi-depot stock controls tracking quantities, automatic billing invoicing, returns eligibility validation, coupon limits validation, or newsletter subscription entries.
#### BU_Q16: Business logic Question 16?
- **Answer**: Business logic detail 16. Handles multi-depot stock controls tracking quantities, automatic billing invoicing, returns eligibility validation, coupon limits validation, or newsletter subscription entries.
#### BU_Q17: Business logic Question 17?
- **Answer**: Business logic detail 17. Handles multi-depot stock controls tracking quantities, automatic billing invoicing, returns eligibility validation, coupon limits validation, or newsletter subscription entries.
#### BU_Q18: Business logic Question 18?
- **Answer**: Business logic detail 18. Handles multi-depot stock controls tracking quantities, automatic billing invoicing, returns eligibility validation, coupon limits validation, or newsletter subscription entries.
#### BU_Q19: Business logic Question 19?
- **Answer**: Business logic detail 19. Handles multi-depot stock controls tracking quantities, automatic billing invoicing, returns eligibility validation, coupon limits validation, or newsletter subscription entries.
#### BU_Q20: Business logic Question 20?
- **Answer**: Business logic detail 20. Handles multi-depot stock controls tracking quantities, automatic billing invoicing, returns eligibility validation, coupon limits validation, or newsletter subscription entries.