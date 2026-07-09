# Technology Stack

carSparePartSys Car Spare Part System leverages a modern, stable technical stack to ensure performance, type safety, and straightforward hosting.

---

## Languages

### 1. C# (Backend)
- **Role**: Primary language for API, business logic, data models, and unit testing.
- **Why Selected**: Offers robust type safety, modern language features (pattern matching, records), and excellent concurrency support via async/await.
- **Advantages**: Compile-time safety, excellent IDE support, and high execution speed on modern hardware.
- **Alternatives Considered**: Node.js/TypeScript was considered, but C# was chosen for its mature e-commerce and ORM ecosystem.

### 2. JavaScript ES6 (Frontend)
- **Role**: Client-side interactivity, API communication, dynamic state updates, and checkout rendering.
- **Why Selected**: Supported natively in all modern web browsers. Vanilla JS was chosen over complex frameworks to keep the project lightweight and fast.
- **Advantages**: Fast client loads, zero bundler configuration, and direct DOM manipulation.
- **Alternatives Considered**: React or Vue.js, but these were bypassed to avoid build step overhead and keep the project accessible.

### 3. SQL (Database)
- **Role**: Relational data queries, table schemas, unique indexes, and foreign keys.
- **Why Selected**: Direct access language for SQL Server, allowing optimized query execution plans.

---

## Frameworks & Libraries

### 1. ASP.NET Core 9.0 (API Web Framework)
- **Role**: Handles HTTP requests, dependency injection, middleware pipelines, routing, authentication, and static file hosting.
- **Why Selected**: Standard high-performance framework for building REST APIs on modern .NET environments.
- **Advantages**: Top-tier execution speed, built-in dependency injection container, and native JWT validation.

### 2. Entity Framework Core 9.0 (ORM)
- **Role**: Maps relational tables directly to C# classes, manages schema migrations, and handles entity relations.
- **Why Selected**: Standard ORM for .NET applications, offering clean integration with SQL Server.
- **Advantages**: Reduces database query code boilerplate and keeps database schema updates safe through EF Core migrations.

### 3. xUnit, Moq, & FluentAssertions (Testing)
- **Role**: Code testing, service mock generation, and assertions.
- **Why Selected**: Industry-standard test tools for building unit tests.
- **Advantages**: Simplifies mocking dependencies during unit testing.

---

## Database

### Microsoft SQL Server
- **Role**: Relational storage engine holding products, compatibility mappings, inventory records, and user profiles.
- **Why Selected**: Enterprise-grade ACID compliance, supporting complex joins, indices, and transactions.
- **Advantages**: Integrates natively with Entity Framework Core and supports complex query execution plans.
- **Alternatives Considered**: PostgreSQL was considered, but SQL Server was selected for its native integration with Windows development hosts and local SQL engines.

---

## APIs & Services

### 1. Stripe API
- **Role**: Generates checkout sessions, processes credit card details, and sends webhook alerts to confirm payments.
- **Why Selected**: Global payment gateway with comprehensive developer documentation and sandboxing support.
- **Advantages**: Removes PCI compliance concerns from local servers while offering reliable payment workflows.

### 2. Cloudinary API
- **Role**: Stores, resizes, and serves product images dynamically.
- **Why Selected**: Managed cloud storage specifically optimized for fast media asset hosting.
- **Advantages**: Reduces local server storage overhead and speeds up image delivery to clients.
- **Alternatives Considered**: Direct local disk storage, but local storage doesn't scale well in clustered or containerized deployments.
