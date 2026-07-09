# Folder Structure

This document details the folder structure of the carSparePartSys Car Spare Part System. It explains the purpose of each project and sub-folder, reflecting Clean Architecture design principles.

---

## 1. Solution Structure

The project is split into four layers plus a test suite:

```
CarSparePartSys.sln
├── carSparePartSysProject/               # Presentation & API Layer
├── carSparePartSysProject.BL/            # Business Logic Layer
├── carSparePartSysProject.DAL/           # Data Access Layer
├── carSparePartSysProject.Models/        # Domain Models & DTOs Layer
└── CarSparePartSys.Tests/       # Unit Testing Suite
```

---

## 2. Layer Breakdown

### A. Presentation & Delivery (`carSparePartSysProject`)
This folder represents the entry point of the application. It handles routing, security middlewares, static file serving, and dependency configuration:

- **`Controllers/`**: Contains thin API controller classes (such as `ProductsController` or `StripeController`). These controllers validate incoming requests, execute actions, and return HTTP status codes.
- **`Extensions/`**: Groups static composition helper classes (like `DatabaseExtensions.cs` or `JwtExtensions.cs`). They isolate service registrations from the main execution chain in `Program.cs`.
- **`Middleware/`**: Contains filters such as `ExceptionMiddleware.cs` to capture unhandled exceptions globally and return unified error payloads to clients.
- **`Stripe/`**: Isolates configurations and helper interfaces related to Stripe card transactions and checkout workflows.
- **`wwwroot/`**: Houses static front-end assets:
  - `css/`: Vanilla styling stylesheets.
  - `js/`: Application script files. Core API connection utilities reside in `api.js`, and page-specific logic is isolated under `js/pages/`.
  - `admin/`: Dashboards and management console portals reserved for administrative staff.

---

### B. Business Logic Layer (`carSparePartSysProject.BL`)
This library isolates the core business processes and validation rules:

- **`Service/`**: Implements business operations (such as processing cart checkouts, validating inventory levels, and managing coupon applications).
- **`IServices/` / `IService/`**: Defines interfaces for services. The controllers reference these interfaces instead of concrete classes, keeping the layers decoupled.

---

### C. Data Access Layer (`carSparePartSysProject.DAL`)
This library integrates the application with the database engine:

- **`Data/`**: Declares `AppDbContext.cs` for entity-relationship configurations and `DbSeed.cs` for database initialization lookups, default roles, and admin accounts.
- **`Migrations/`**: Auto-generated EF Core schema history tracking the state of database tables.
- **`Repositories/`**: Implements the Repository Pattern:
  - `Interfaces/` defines the CRUD contracts.
  - `Sql/` implements these contracts with Entity Framework queries targeting Microsoft SQL Server.

---

### D. Domain Models Layer (`carSparePartSysProject.Models`)
This layer defines the data structures and transfer payloads:

- **`Model/`**: Plain old C# object (POCO) model classes representing the database tables.
- **`Dto/`**: Data Transfer Objects used to sanitize, restrict, and validate inputs and outputs across API controllers, preventing direct exposure of internal database entities.

---

### E. Tests Suite (`CarSparePartSys.Tests`)
Contains xUnit unit test projects. It mocks dependencies (like repositories) to test service-layer validation rules and business workflows without hitting a live database.
