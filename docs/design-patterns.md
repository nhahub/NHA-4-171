# Design Patterns

This document details the architectural and software design patterns implemented within the carSparePartSys Car Spare Part System codebase. Only patterns actually implemented are documented here.

---

## 1. Generic & Specific Repository Pattern

### How it Works
The database access layer separates data retrieval code from domain services. The generic repository interface `IRepository<T>` handles standard CRUD actions (e.g. `Add`, `Delete`, `GetById`), while specific repositories (like `SqlProductRepository`) extend this structure to perform custom queries (such as retrieving compatibility checks or warehouse stock allocations).

### Example
- Generic Interface: `IRepository<T>`
- Specific Implementation: `SqlProductRepository` inherits from `Repository<Product>` and implements `IProductRepository`.

### Advantage
It abstracts the underlying Entity Framework database context from the business logic, making it easier to write unit tests using mock repositories.

---

## 2. Service Layer Pattern

### How it Works
The business logic of the application resides entirely inside dedicated service classes (e.g. `ProductService`, `CartService`, `OrderService`). Controllers receive HTTP requests and delegate execution directly to the service layer. The service layer handles validation rules, database transactions via repositories, and communications with external APIs (like Stripe).

### Example
- Interface: `IProductService`
- Implementation: `ProductService` class in the `carSparePartSysProject.BL` project.

### Advantage
Keeps controllers lightweight and ensures that business logic can be reused by other delivery channels (such as CLI tasks or queue processors) if needed.

---

## 3. Dependency Injection (DI)

### How it Works
Dependencies (such as repositories, services, configuration settings, and database contexts) are registered in the composition roots and injected via class constructors. The system uses ASP.NET Core's built-in dependency injection container.

### Example
```csharp
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }
}
```

### Advantage
Eliminates tight coupling between components, making the codebase easier to test, extend, and maintain.

---

## 4. Options Pattern

### How it Works
Configuration sections declared in JSON files (`appsettings.json`) or environment variables are bound to strongly-typed C# classes during application startup. These options are then injected into services using the `IOptions<TOptions>` or custom configurations.

### Example
- In `appsettings.json`:
  ```json
  "Stripe": {
    "Secretkey": "sk_test_...",
    "Publishablekey": "pk_test_..."
  }
  ```
- Map config details directly using helper modules like `StripeExtensions.cs` to access keys inside the services safely.

### Advantage
Eliminates hardcoded strings for application settings and provides autocomplete/compile-time safety.

---

## 5. Composition Root (Modular Startup)

### How it Works
Rather than registering every repository, service, policy, and configuration inside the main startup execution file (`Program.cs`), registrations are grouped into static extension classes inside the `Extensions/` directory (e.g., `DatabaseExtensions`, `DependencyInjectionExtensions`, `IdentityExtensions`).

### Example
`Program.cs` simply calls:
```csharp
builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddRepositories();
builder.Services.AddApplicationServices();
```

### Advantage
Improves readability of the configuration code and prevents `Program.cs` from becoming bloated.
