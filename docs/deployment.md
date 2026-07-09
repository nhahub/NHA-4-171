# Deployment Guide

This document describes the deployment workflows for the carSparePartSys Car Spare Part System, highlighting container configuration and production best practices.

---

## 1. Containerization with Docker

The application includes a multi-stage `Dockerfile` and a `docker-compose.yml` template at the root directory to run both the Web API and SQL Server in containers.

### Local Container Orchestration
To build and start the entire system (SQL Server + Web API) locally, run the following command from the repository root:
```bash
docker compose up --build -d
```

#### What This Command Does:
1. **Pulls SQL Server 2022 image**: Configures a database container, maps port `1433`, and assigns strong passwords.
2. **Builds the ASP.NET Core image**: Uses the multi-stage `Dockerfile` to compile and package the API.
3. **Runs migrations**: When the API starts up, it checks database availability, executes EF Core migrations, and seeds lookup tables.
4. **Exposes ports**: Binds the Web API to port `8080` (or the configured `PORT` variable).

---

## 2. Production Deployment Process

When deploying to a production cloud environment (e.g. Azure, AWS, or GCP), use the following deployment steps:

```
┌─────────────────┐       Build & Push       ┌──────────────────┐
│  Developer Git  │─────────────────────────>│ Container Registry│
│   Push Event    │                          │ (ACR, ECR, Docker)│
└─────────────────┘                          └──────────────────┘
                                                       │
                                                 Pulls Image
                                                       ▼
┌──────────────────┐     Injects Secrets     ┌──────────────────┐
│ Cloud Key Vault  │────────────────────────>│ Container Service│
│ (Azure KV, AWS)  │                         │ (ECS, App Service)│
└──────────────────┘                         └──────────────────┘
                                                       │
                                                 Connects to DB
                                                       ▼
                                             ┌──────────────────┐
                                             │ Managed DB Server│
                                             └──────────────────┘
```

1. **Build Container Image**: Build the production image using the multi-stage Dockerfile and push it to a container registry (e.g., Azure Container Registry, Amazon ECR, or Docker Hub).
2. **Set Up Managed Database**: Create a managed database instance (such as Azure SQL Database or AWS RDS for SQL Server) to ensure high availability, automated backups, and encryption.
3. **Provision Container Service**: Deploy the container to a managed hosting service like Azure App Service, AWS ECS, or Google Cloud Run.
4. **Configure Secrets**: Map application environment variables using your cloud provider's secure configuration settings or key vault service (like Azure Key Vault or AWS Secrets Manager).

---

## 3. Production Best Practices

- **Enforce HTTPS**: Ensure all external traffic is encrypted. Configure Kestrel to run behind a reverse proxy (like Nginx, IIS, or AWS ALBs) that handles SSL/TLS termination.
- **Secrets Management**: Never commit API keys, connection strings, or JWT signing keys to configuration files. Inject them securely at runtime using environment variables or a key vault.
- **Log Management**: Configure logs to write to standard output (`stdout`) or a centralized logging platform (like Seq, ELK, or CloudWatch) rather than relying on local container storage.
- **Refresh Token Safety**: Ensure clients store JWT and refresh tokens securely (e.g., using `HttpOnly` secure cookies) to protect against cross-site scripting (XSS) attacks.
