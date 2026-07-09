# System Diagrams

This document contains Mermaid diagrams visualizing the architecture, user journeys, relational databases, security pipelines, and deployment layouts for the Thanya Car Spare Part System.

---

## 1. System Architecture

Shows the separation of layers and dependency directions based on Clean Architecture:

```mermaid
graph TD
    subgraph Presentation ["Presentation Layer"]
        API["ThanyaProject (Web API / UI)"]
    end

    subgraph Logic ["Business Logic Layer"]
        BL["ThanyaProject.BL (Services)"]
    end

    subgraph DataAccess ["Data Access Layer"]
        DAL["ThanyaProject.DAL (EF Core & Repositories)"]
    end

    subgraph Domain ["Domain Layer"]
        Models["ThanyaProject.Models (Entities & DTOs)"]
    end

    API --> BL
    API --> Models
    BL --> DAL
    BL --> Models
    DAL --> Models
```

---

## 2. User Flow

The process of a customer browsing, filtering, and checking out parts:

```mermaid
flowchart TD
    Start["Browse Catalog (index.html)"] --> QueryCompat{"Use Compatibility Selector?"}
    QueryCompat -- "Yes" --> FilterBrand["Select Brand & Model"]
    FilterBrand --> ShowCompat["View Compatible Parts Only"]
    ShowCompat --> AddCart["Add Parts to Cart"]
    QueryCompat -- "No" --> ViewAll["View General Catalog"]
    ViewAll --> AddCart
    AddCart --> AuthCheck{"Is User Logged In?"}
    AuthCheck -- "No" --> LoginPage["Go to login.html / register.html"]
    LoginPage --> SyncCart["Sync Browser Cart to Database"]
    SyncCart --> Checkout["Go to checkout.html"]
    AuthCheck -- "Yes" --> Checkout
    Checkout --> PayGateway["Initiate Stripe Checkout"]
    PayGateway --> SuccessPage["View Invoice & Order Success"]
```

---

## 3. Database ER Diagram

A visual representation of the core relationships between entities:

```mermaid
erDiagram
    User ||--o| Cart : "owns"
    User ||--o{ Order : "places"
    User ||--o{ Address : "registers"
    Category ||--o{ Category : "has subcategories"
    Category ||--o{ Product : "contains"
    Supplier ||--o{ Product : "supplies"
    Product ||--o{ PartCompatibility : "compatibility"
    CarModel ||--o{ PartCompatibility : "compatibility"
    CarBrand ||--o{ CarModel : "owns"
    Cart ||--o{ CartItem : "contains"
    Product ||--o{ CartItem : "references"
    Order ||--o{ OrderDetail : "has details"
    Product ||--o{ OrderDetail : "purchased in"
    Order ||--o| Invoice : "generates"
    Order ||--o| Shipping : "dispatched via"
    Product ||--o{ Inventory : "stored in"
    Warehouse ||--o{ Inventory : "stores"
```

---

## 4. Authentication Flow

How clients obtain and present JWT Bearer tokens to access secure resources:

```mermaid
sequenceDiagram
    participant Client as Web Browser
    participant AuthAPI as AccountController
    participant Middleware as JWT Middleware
    participant SecureAPI as Secure Controller (e.g. Orders)

    Client->>AuthAPI: POST /api/account/login (Credentials)
    AuthAPI->>AuthAPI: Verify passwords & Retrieve User Roles
    AuthAPI-->>Client: Returns JWT Token (Expires in 60m)
    
    Note over Client: Token stored in local storage
    
    Client->>SecureAPI: GET /api/orders (Headers: Authorization Bearer JWT)
    SecureAPI->>Middleware: Intercepts & Validates Token Signature
    alt Token is valid
        Middleware->>SecureAPI: Process Order Search
        SecureAPI-->>Client: Return Order List (JSON)
    else Token is invalid or expired
        Middleware-->>Client: Return 401 Unauthorized
    end
```

---

## 5. Application Flow

The flow of database synchronization when checkout occurs:

```mermaid
flowchart TD
    ReqCheckout["Checkout Initiated"] --> StockCheck["Query Inventories Table"]
    StockCheck --> Avail{"Stock Available?"}
    Avail -- "No" --> CancelSession["Cancel and Notify User"]
    Avail -- "Yes" --> CreateSession["Create Stripe Session"]
    CreateSession --> RedirectStripe["Redirect Client to Stripe Page"]
    RedirectStripe --> StripeWebhook{"Stripe Webhook Event Received"}
    StripeWebhook -- "payment_intent.succeeded" --> CompleteOrder["Update Order to Processing"]
    CompleteOrder --> GenInvoice["Create Invoice Record"]
    CompleteOrder --> DeductStock["Reduce quantity in Inventories table"]
    StripeWebhook -- "payment_intent.failed" --> LogFail["Log Failure and Update Status to Cancelled"]
```

---

## 6. Deployment Diagram

Physical deployment architecture for production containerization:

```mermaid
graph TD
    Client["Client Web Browser"] -->|HTTPS port 443| RevProxy["Reverse Proxy (Nginx / IIS)"]
    RevProxy -->|HTTP port 8085| WebAPI["Docker Container: ASP.NET Core API"]
    WebAPI -->|TCP port 1433| DB["Managed SQL Database (SQL Server / Azure SQL)"]
    WebAPI -->|HTTPS api.stripe.com| Stripe["Stripe Payments Gateway"]
    WebAPI -->|HTTPS api.cloudinary.com| Cloudinary["Cloudinary Storage"]
```
