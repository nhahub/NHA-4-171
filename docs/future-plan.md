# Future Plan

This document outlines planned technical and business improvements for the Thanya Car Spare Part System. These plans focus on performance, security, operational efficiency, and expanding developer resources.

---

## 1. Performance & Scalability

### Distributed Caching (Redis)
- **Problem**: Car brand, model, and compatibility lists change infrequently but are queried heavily during catalog browsing.
- **Solution**: Implement Redis distributed caching for lookup datasets.
- **Benefit**: Reduces database load and speeds up page load times for customers.

### Database Query Optimization
- **Problem**: As the products and transactions tables grow, database query times may slow down.
- **Solution**: Add targeted database indexes to frequently searched fields (like brand IDs and model IDs) and use compiled queries for complex joins.

---

## 2. Infrastructure & Operations

### Cloud Migration
- **Target**: Deploy the system to cloud platforms (like Microsoft Azure or AWS).
- **Setup**: Run the Web API on App Services, use a managed SQL database service, and host frontend static files on CDN-backed storage.

### Automated CI/CD Pipelines
- **Target**: Extend the current GitHub Actions workflow (`.github/workflows/dotnet.yml`).
- **Setup**: Add automated code quality scans, run database migration checks, and handle automatic deployments to staging and production environments when updates are merged to the `main` branch.

---

## 3. Application Features

### Real-Time Status Updates (SignalR)
- **Feature**: Integrate ASP.NET Core SignalR.
- **Use Case**: Inform customers instantly when their order status is changed to "Shipped" or when an administrator updates a return request.

### Interactive Analytics Dashboard
- **Feature**: Build sales and returns charts for the administrator dashboard.
- **Use Case**: Help business managers identify top-selling parts, monitor inventory levels across warehouses, and track return rates by supplier.

### Internationalization (i18n)
- **Feature**: Add multi-language support for product descriptions, invoice templates, and emails.
- **Use Case**: Help the application serve international clients and suppliers.

---

## 4. Security & Compliance

### Rate Limiting
- **Feature**: Implement ASP.NET Core Rate Limiting Middleware.
- **Use Case**: Protect public API search endpoints from automated scraping tools and API abuse.

### Advanced Audit Trails
- **Feature**: Implement detailed database audit logging to track all sensitive changes, such as user role updates or manual stock overrides, capturing the user identity and timestamp for each action.
