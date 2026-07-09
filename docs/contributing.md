# Contributing Guidelines

Thank you for contributing to the carSparePartSys Car Spare Part System project. To maintain code quality and architectural integrity, please review the following guidelines before submitting code.

---

## 1. Architectural Integrity

The codebase enforces a Clean Architecture structure. Please follow these principles when writing code:

- **Thin Controllers**: Controllers must not contain business validation logic or direct Entity Framework database context queries. Keep them thin, using them to capture inputs, call service layers, and map outputs.
- **Service Isolation**: Place business processes inside the `carSparePartSysProject.BL` library. Write interfaces for services to keep implementations decoupled from HTTP layers.
- **Strongly-Typed Payloads**: Never expose database entities directly to controllers. Use DTO (Data Transfer Object) models for API request bodies and response outputs.

---

## 2. Git & Branching Policies

### Branch Names
Use descriptive branch names prefixed with the type of work being done:
- `feature/` for new capabilities (e.g. `feature/order-receipts`).
- `bugfix/` for code corrections (e.g. `bugfix/cart-duplicate-items`).
- `docs/` for documentation updates.

### Commit Messages
Write clear, imperative commit messages:
```text
feat: add invoice generation to Stripe webhook handler
fix: prevent empty items in wishlist additions
docs: update installation prerequisites
```

---

## 3. Pull Request (PR) Workflow

1. **Verify Builds and Run Tests**: Before opening a PR, ensure the application builds successfully and run all xUnit tests locally:
   ```bash
   dotnet build
   dotnet test
   ```
2. **Commit Actions**: Push your branch to the remote repository.
3. **Submit PR**: Open a Pull Request on GitHub targeting the `main` branch. Provide a description of the changes, verification steps, and testing results.
4. **Code Review**: At least one maintainer must review and approve the PR before it is merged.
