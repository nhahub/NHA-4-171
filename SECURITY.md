# Security Configuration Guide

This document describes how to securely configure and deploy the carSparePartSys Car Spare Part System API.

---

## 1. Configuration Strategy

| Layer | Purpose | Committed to Git? |
| :--- | :--- | :---: |
| `appsettings.json` | Placeholder values only — no real secrets | **Yes** |
| `appsettings.Development.json` | Local development overrides with test credentials | **No** (excluded via `.gitignore`) |
| `.NET User Secrets` | Per-developer machine-local storage | **No** |
| **Environment Variables** | Production and staging deployments | **No** |

---

## 2. Required Environment Variables

Every variable below must be set in production. The application will use `appsettings.json` placeholder values if these are missing, which will cause runtime failures for the affected feature.

### Database
| Variable | Description |
| :--- | :--- |
| `ConnectionStrings__DefaultConnection` | Full SQL Server connection string |

### JWT Authentication
| Variable | Description |
| :--- | :--- |
| `JWT__Key` | HMAC-SHA256 signing key (minimum 256-bit / 32 characters) |
| `JWT__Issuer` | Token issuer claim (e.g. `carSparePartSysAPI`) |
| `JWT__Audience` | Token audience claim (e.g. `carSparePartSysUser`) |
| `JWT__DurationInMinutes` | Access token lifetime in minutes |

### Stripe Payments
| Variable | Description |
| :--- | :--- |
| `Stripe__Secretkey` | Stripe secret API key (`sk_live_...` or `sk_test_...`) |
| `Stripe__Publishablekey` | Stripe publishable API key (`pk_live_...` or `pk_test_...`) |
| `Stripe__WebhookSecret` | Stripe webhook endpoint signing secret (`whsec_...`) |

### Cloudinary (Image Storage)
| Variable | Description |
| :--- | :--- |
| `CloudinarySettings__CloudName` | Cloudinary cloud name |
| `CloudinarySettings__ApiKey` | Cloudinary API key |
| `CloudinarySettings__ApiSecret` | Cloudinary API secret |

### Admin Seeding
| Variable | Description |
| :--- | :--- |
| `Admin__Email` | Initial administrator email (default: `admin@carsparepartsys.com`) |
| `Admin__Password` | Initial administrator password. **If missing, admin seeding is skipped safely.** |

---

## 3. Local Development Setup

### Option A: appsettings.Development.json (recommended for quick start)

An example configuration file is included in the repository. To get started:

```bash
cd carSparePartSysProject
cp appsettings.Development.example.json appsettings.Development.json
```

Then open `appsettings.Development.json` and replace the placeholder values with your real credentials.

> **Important:** `appsettings.Development.json` is excluded from Git via `.gitignore`. Your secrets will never be committed.

### Option B: .NET User Secrets (recommended for teams)

```bash
cd carSparePartSysProject
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost\SQLEXPRESS;Database=carSparePartSysDB;Trusted_Connection=True;TrustServerCertificate=True"
dotnet user-secrets set "JWT:Key" "your-dev-only-signing-key-at-least-32-chars"
dotnet user-secrets set "Stripe:Secretkey" "sk_test_your_key"
dotnet user-secrets set "Stripe:Publishablekey" "pk_test_your_key"
dotnet user-secrets set "Stripe:WebhookSecret" "whsec_your_webhook_secret"
dotnet user-secrets set "CloudinarySettings:ApiSecret" "your_cloudinary_secret"
dotnet user-secrets set "Admin:Password" "YourLocalAdminPassword!123"
```

---

## 4. Production Deployment Recommendations

1. **Use a managed secrets provider** (Azure Key Vault, AWS Secrets Manager, or HashiCorp Vault) to inject environment variables at runtime.
2. **Enforce TLS** on database connections: set `Encrypt=True` and `TrustServerCertificate=False` in the production connection string.
3. **Use live Stripe keys** (`sk_live_...`, `pk_live_...`) only via environment variables — never commit them.
4. **Generate a cryptographically random JWT key** of at least 256 bits. Example:
   ```bash
   openssl rand -base64 64
   ```
5. **Rotate secrets regularly** — update JWT keys, Stripe webhook secrets, and database passwords on a documented schedule.
6. **Restrict CORS origins** to only your production frontend domain. Remove `localhost` origins from the `AllowFrontend` CORS policy in production builds.
7. **Enable HTTPS only** in production via Kestrel configuration or a reverse proxy (nginx, Azure App Service, etc.).

---

## 5. Admin Seeding Behavior

| Condition | Behavior |
| :--- | :--- |
| `Admin:Password` is set and valid | Administrator account is created with the specified password |
| `Admin:Password` is missing or empty | A warning is logged; admin seeding is **skipped** safely |
| `Admin:Password` fails Identity strength validation | A warning is logged with the Identity error details |
| Admin account already exists | Seeding is skipped (idempotent) |
