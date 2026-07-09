# Changelog

All notable changes to the carSparePartSys Car Spare Part System will be documented in this file.

---

## [1.0.0] - 2026-07-09

This is the initial production release of the carSparePartSys Car Spare Part System.

### Added Features
- **Clean Architecture Solution Layout**: Split the codebase into API, BL, DAL, and Models projects to improve maintainability and testability.
- **Relational Vehicle-Part Compatibility**: Implemented database-driven compatibility queries joining products to specific vehicle brand and model ranges.
- **Multi-Warehouse Stock Management**: Added warehouse inventory levels, minimum reorder alerts, and detailed stock transaction logs.
- **Stripe Payments Integration**: Configured Stripe SDK payment checkout session generation and secure signature verification webhooks.
- **Authentication & Security Policies**: Configured JWT bearer token auth and ASP.NET Core Identity roles (`Admin`, `Supplier`, `User`).
- **Testing Suite**: Added xUnit mock service tests inside `CarSparePartSys.Tests`.
- **Docker Integration**: Added multi-stage `Dockerfile` and `docker-compose.yml` templates for containerized local setups.
