# System Architecture

carSparePartSys Car Spare Part System is designed around Clean Architecture and DDD (Domain-Driven Design) principles. It separates domain logic from data access and delivery channels, ensuring the system remains maintainable and testable over time.

## Architectural Layers

The solution is divided into four main layers:

```
┌────────────────────────────────────────────────────────┐
│               carSparePartSysProject (API/UI)                   │
├────────────────────────────────────────────────────────┤
│             carSparePartSysProject.BL (Business Logic)          │
├────────────────────────────────────────────────────────┤
│             carSparePartSysProject.DAL (Data Access)            │
├────────────────────────────────────────────────────────┤
│             carSparePartSysProject.Models (Entities & DTOs)     │
└────────────────────────────────────────────────────────┘
```

### 1. Presentation & API Layer (`carSparePartSysProject`)
- **Type**: ASP.NET Core 9.0 Web API and Static Web Client.
- **Responsibilities**: Maps incoming HTTP requests to endpoints, handles CORS rules, manages Swagger OpenAPI configurations, and processes static web pages (`wwwroot`).
- **Dependency Rule**: References `carSparePartSysProject.BL` and `carSparePartSysProject.Models`. It has no direct references to EF Core db contexts.

### 2. Business Logic Layer (`carSparePartSysProject.BL`)
- **Type**: C# Class Library.
- **Responsibilities**: Contains the application logic, interface definitions, business validations (e.g. stock checking during order placement), and integrations with external gateways.
- **Dependency Rule**: References `carSparePartSysProject.Models`. Decoupled from the presentation layer.

### 3. Data Access Layer (`carSparePartSysProject.DAL`)
- **Type**: C# Class Library.
- **Responsibilities**: Manages Entity Framework Core integrations, includes database schema migrations, and implements the Repository Pattern to run SQL Server operations.
- **Dependency Rule**: References `carSparePartSysProject.Models` and implements repositories using `AppDbContext`.

### 4. Domain Models Layer (`carSparePartSysProject.Models`)
- **Type**: C# Class Library.
- **Responsibilities**: Declares the domain entities, database tables, validation attributes, enum classes, and strongly-typed DTOs (Data Transfer Objects).
- **Dependency Rule**: Independent of all other layers.

---

## Technical Stack & Subsystems

### Frontend Client
The frontend is a lightweight client application built using semantic HTML5 and vanilla CSS3. It communicates with the backend API asynchronously using the browser's native `Fetch` API, configured in `wwwroot/js/api.js`.

### Authentication & Authorization
Security uses JWT (JSON Web Tokens) and ASP.NET Core Identity.
- Tokens contain user ID, username, and role declarations.
- Endpoint validation uses JWT Bearer authentication, configured via composition extension methods.
- Role policies split access into standard `User` privileges, parts `Supplier` dashboards, and administrative controls (`Admin`).

### Database Engine
Microsoft SQL Server stores catalog data, inventory lists, audit logs, and account profiles. EF Core compiles LINQ queries into raw SQL, utilizing unique constraints and index mappings declared in `AppDbContext.OnModelCreating`.

---

## Architectural Data Flow

1. **Client Request**: The browser client initiates a fetch request to an API endpoint (e.g. `GET /api/products`).
2. **Controller Dispatch**: The controller validates token parameters and dispatches control to the target business service (e.g. `ProductService`).
3. **Repository Execution**: The business service processes validation requirements, then calls repository endpoints (e.g. `SqlProductRepository`).
4. **Database Query**: The repository queries the SQL Server using Entity Framework, returning domain models.
5. **DTO Mapping & Response**: The service maps the domain models to output DTOs, returning clean JSON payloads back to the client.

---

## Design Decisions & Patterns

- **Separation of Concerns**: Keeping controllers thin by placing business validation logic inside separate services ensures endpoints are easy to maintain and test.
- **Repository Pattern**: Repository classes abstract direct EF Core database queries. This keeps database interactions isolated from business rules.
- **Composition Root Extension Methods**: Registrations for databases, authentication pipelines, repositories, and Stripe configurations are split into dedicated class files inside the `Extensions` folder. This keeps the main application startup sequence (`Program.cs`) clean and readable.
