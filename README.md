<<<<<<< HEAD
# Thanya Car Spare Part System — API

A Clean Architecture ASP.NET Core Web API for managing car spare parts, orders, payments, and user accounts.

## Tech Stack

- **Runtime:** .NET 9 / ASP.NET Core
- **Database:** SQL Server + Entity Framework Core
- **Authentication:** ASP.NET Identity + JWT Bearer Tokens
- **Payments:** Stripe (Checkout Sessions, Payment Intents, Webhooks)
- **Image Storage:** Cloudinary
- **Architecture:** Clean Architecture (Models → DAL → BL → API)

---

## Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0) (or later with roll-forward)
- SQL Server (LocalDB, Express, or full instance)
- A Stripe test account (for payment features)
- A Cloudinary account (for image uploads)

### 1. Clone the repository

```bash
git clone <repository-url>
cd ThanyaProject-014
```

### 2. Configure local secrets

Copy the example configuration file and fill in your own values:

```bash
cd ThanyaProject
cp appsettings.Development.example.json appsettings.Development.json
```

Open `appsettings.Development.json` and replace the placeholder values with your actual credentials:

| Key | Where to get it |
| :--- | :--- |
| `ConnectionStrings:DefaultConnection` | Your local SQL Server instance |
| `JWT:Key` | Any string ≥ 32 characters (generate with `openssl rand -base64 64`) |
| `Stripe:Secretkey` | [Stripe Dashboard → API Keys](https://dashboard.stripe.com/test/apikeys) |
| `Stripe:Publishablekey` | Same Stripe Dashboard page |
| `Stripe:WebhookSecret` | Stripe CLI or Dashboard webhook settings |
| `CloudinarySettings:*` | [Cloudinary Console](https://cloudinary.com/console) |
| `Admin:Password` | Choose a strong password for the initial admin account |

> **Note:** `appsettings.Development.json` is Git-ignored and will never be committed.

### 3. Apply database migrations

```bash
dotnet ef database update --project ../ThanyaProject.DAL --startup-project .
```

### 4. Run the application

```bash
dotnet run
```

The API will start at `http://localhost:5053` (or the port configured in `launchSettings.json`).

Swagger UI is available at `/swagger`.

### 5. Default admin account

If `Admin:Password` is configured, an administrator account is seeded automatically on first startup:

- **Email:** Value of `Admin:Email` (default: `admin@thanya.com`)
- **Username:** `admin`
- **Role:** `Admin`

If the password is not configured, admin seeding is skipped safely with a logged warning.

---

## Project Structure

```
CarSparePartSys.sln
├── ThanyaProject/              # API layer (Controllers, Startup, Configuration)
├── ThanyaProject.BL/           # Business Logic layer (Services)
├── ThanyaProject.DAL/          # Data Access layer (Repositories, DbContext, Migrations)
└── ThanyaProject.Models/       # Domain Models, DTOs, Entities
```

---

## Security

See [SECURITY.md](SECURITY.md) for:

- Required environment variables for production
- Local development setup options
- Production deployment recommendations
=======
# NHA-4-171
Auto generated repo 171
>>>>>>> 8217caedd2eac2557bdd10b098a3447f48d03859
