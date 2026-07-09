# Frequently Asked Questions (FAQ)

Here are answers to common questions about setting up, using, and modifying the carSparePartSys Car Spare Part System.

---

## 1. Developer FAQs

### Q: Why are my API responses raising circular reference serialization errors?
- **A**: The system uses Entity Framework Core with highly relational entities (e.g. `Product` links to `Category`, which contains `Products`). To prevent infinite loops, we set `ReferenceHandler.IgnoreCycles` in `Program.cs` under the JSON options configuration. Make sure this configuration is active:
  ```csharp
  builder.Services.AddControllers()
      .AddJsonOptions(opts => {
          opts.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
      });
  ```

### Q: How do I change the default port (`8085`) for the Web API?
- **A**: The hosting port is configured in `Program.cs` under Kestrel settings, falling back to `8085` if the `PORT` environment variable is not defined:
  ```csharp
  options.ListenAnyIP(int.Parse(Environment.GetEnvironmentVariable("PORT") ?? "8085"));
  ```
  To change it, set the `PORT` environment variable before launching or update the fallback port value directly.

### Q: How does the system handle database migrations on startup?
- **A**: The API project uses `MigrateAndSeedAsync()` inside `Program.cs`. When the container or API application launches, it calls the EF Core database context to execute pending migrations and seed lookup data automatically.

### Q: How are Stripe payments validated?
- **A**: The backend does not rely on frontend redirect screens to verify payments. Instead, Stripe webhooks (`StripeController.cs`) intercept the checkout session events. The controller validates the signature using the configured webhook secret key (`WebhookSecret`) before updating the order status to `Processing`.

---

## 2. General System FAQs

### Q: How do users query compatible parts?
- **A**: Users select their vehicle brand and model via the homepage dropdown filters. The client calls the search endpoint, which joins the product catalog with the compatibility mapping table to return only verified matching parts.

### Q: Can standard customers access administrative consoles?
- **A**: No. The administrative APIs are restricted using ASP.NET Core authorization policies (`[Authorize(Roles = "Admin")]`). If a standard user attempts to access these endpoints, the API returns a `403 Forbidden` status code.

### Q: Does the application support cash on delivery (COD)?
- **A**: Yes. The `PaymentMethods` lookup table seeds `Cash on Delivery` as an active payment method alongside Stripe credit card transactions, allowing customers to choose their preferred checkout option.
