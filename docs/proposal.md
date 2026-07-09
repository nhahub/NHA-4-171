# Proposal

This document outlines the architectural plan, scope, and objectives of the Thanya Car Spare Part System. It establishes a baseline for the development lifecycle, system capabilities, and integration deliverables.

## Background

Traditional e-commerce platforms struggle with the complex relational data models required for automotive retail. The Thanya project was proposed to build a high-performance Web API and frontend client specifically designed for spare parts management, featuring vehicle compatibility checking, multi-warehouse stock control, and integrated billing.

## Objectives

- **Implement Clean Architecture**: Set up a decoupled codebase separating data access, business logic, entities, and HTTP layers.
- **Provide Vehicle-to-Part Compatibility**: Offer dynamic filtering by brand, model, and year to eliminate part mismatching.
- **Support Multi-Warehouse Logistics**: Provide warehouse-specific inventory tracking with minimum stock thresholds and stock adjustments.
- **Secure Transactional Workflows**: Implement JWT authentication, ASP.NET Core Identity roles, and Stripe integration.
- **Deliver a Responsive Frontend**: Build a lightweight customer and administrator interface using vanilla CSS and JavaScript.

## Scope

### In Scope
- Database schema mapping categories, products, compatibility, inventory, orders, and payments.
- Business services handling CRUD operations, checkout validation, return requests, and audit logs.
- RESTful HTTP Controllers secured with JWT authentication and customized authorization policies.
- Direct Stripe checkout session generation and asynchronous webhook handlers.
- Static client application providing customer search and checkout pages along with administrative dashboard portals.
- Automated migrations and seeding for database initialization.

### Out of Scope
- Direct integrations with hardware shipping scanners or local point-of-sale (POS) systems.
- Automated supplier inventory sync via EDI networks.

## Deliverables

- **Backend API**: ASP.NET Core Web API project containing composition roots and controllers.
- **Business Layer**: Implementation libraries defining domain operations.
- **DAL Layer**: EF Core DB configurations, migrations, and repository patterns.
- **Frontend Client**: SPA HTML/JS/CSS assets served via static files.
- **Docker Integration**: Multistage Dockerfile and Docker Compose templates for single-command orchestration.

## Estimated Project Timeline

| Phase | Milestone | Duration |
| :--- | :--- | :--- |
| Phase 1 | Database Modeling & Seeding Configurations | Weeks 1-2 |
| Phase 2 | Business Service Implementations (Repositories, Services) | Weeks 3-5 |
| Phase 3 | REST API Controller Setup & JWT Security Pipeline | Weeks 6-7 |
| Phase 4 | Stripe Payment Gateway Integration & Webhooks | Weeks 8-9 |
| Phase 5 | Frontend Development (Catalog Search & Admin Panel) | Weeks 10-12 |
| Phase 6 | System Integration Testing & QA Deployment | Weeks 13-14 |

## Expected Outcome

A unified e-commerce system that reduces manual inventory adjustments, automates billing and return tasks, and allows auto repair shops to confidently purchase parts.
