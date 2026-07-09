# Installation & Setup Guide

This document provides step-by-step instructions to configure and run the Thanya Car Spare Part System on a local development machine.

---

## 1. Prerequisites

Before starting, ensure the following software is installed on your host system:

- **[.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)** (or later)
- **[Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)** (Express or LocalDB)
- **[Git Command Line Client](https://git-scm.com/)**
- *Optional*: **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (if running via container orchestration)

---

## 2. Step-by-Step Installation

### Step A: Clone the Repository
```bash
git clone https://github.com/nhahub/NHA-4-171.git
cd NHA-4-171
```

### Step B: Configure Local Settings
Navigate to the Web API project folder:
```bash
cd ThanyaProject
```

Copy the example configuration to create your development settings file:
```bash
cp appsettings.Development.example.json appsettings.Development.json
```

Open `appsettings.Development.json` in your code editor and fill in your developer credentials:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=ThanyaCarSparePartDb;Trusted_Connection=True;MultipleActiveResultSets=true"
  },
  "JWT": {
    "Key": "CHOOSE_A_SECURE_JWT_SECRET_SIGNING_KEY_OF_AT_LEAST_32_BYTES",
    "Issuer": "ThanyaAPI",
    "Audience": "ThanyaUser"
  },
  "CloudinarySettings": {
    "CloudName": "YOUR_CLOUDINARY_NAME",
    "ApiKey": "YOUR_CLOUDINARY_API_KEY",
    "ApiSecret": "YOUR_CLOUDINARY_API_SECRET"
  },
  "Stripe": {
    "Secretkey": "sk_test_YOUR_STRIPE_SECRET_KEY",
    "Publishablekey": "pk_test_YOUR_STRIPE_PUBLISHABLE_KEY",
    "WebhookSecret": "whsec_YOUR_STRIPE_WEBHOOK_SECRET"
  }
}
```

---

## 3. Database Initialization

1. Ensure your local SQL Server instance is running.
2. From the `ThanyaProject/` folder, run the EF Core migration command:
   ```bash
   dotnet ef database update --project ../ThanyaProject.DAL --startup-project .
   ```
   *Note: If the `dotnet-ef` tool is not installed globally, install it with:*
   ```bash
   dotnet tool install --global dotnet-ef
   ```

At startup, the system automatically seeds default tables, category structures, lookup records, and a default admin account:
- **Admin Email**: `admin@CrSys.com` (reset to appsettings email configuration)
- **Admin Password**: `Admin@123`

---

## 4. Running the Application

Launch the application using the .NET CLI:
```bash
dotnet run
```

The Web API starts hosting locally. The console output indicates the active port (default `8085` or your mapped `PORT` environment variable).
- **Swagger Documentation UI**: Open `http://localhost:8085/swagger` in your web browser.
- **Frontend Catalog Client**: Open `http://localhost:8085/index.html` to browse the store interface.

---

## 5. Running the Test Suite

Unit and mock service tests are located in `CarSparePartSys.Tests`. To execute the test suite:
```bash
cd ..
dotnet test
```
The test runner will compile the projects and execute all xUnit tests.
