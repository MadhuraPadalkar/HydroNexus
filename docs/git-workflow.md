# HydroNexus Git Workflow & Contribution Guide

This document standardizes the version control branching strategy, pull request criteria, and commit message semantics across the HydroNexus monorepo.

---

## 1. Branching Strategy

HydroNexus adopts a Gitflow-light branching model:

```
[main] (Production releases only)
  ▲
  │ (Release PR with tag)
[dev] (Shared integration branch)
  ▲
  ├── feature/officer-billing-export
  ├── feature/citizen-tanker-tracking
  ├── feature/backend-auth-service
  ├── fix/nrw-chart-rendering
  └── chore/upgrade-dependencies
```

### 1.1 Protected Branches
- **`main`**: Represents production-ready code. Direct pushes are disabled. Requires pull request approval and passing CI.
- **`dev`**: Active integration branch for sprint deliverables. CI runs on every commit.

### 1.2 Feature & Bugfix Branches
Branch naming must follow the format `<type>/<scope>-<short-description>`:
- `feature/officer-<feature>`: New feature in the Officer Portal (e.g. `feature/officer-gis-filters`)
- `feature/citizen-<feature>`: New feature in the Citizen Portal (e.g. `feature/citizen-bill-receipts`)
- `feature/backend-<feature>`: Backend service changes (e.g. `feature/backend-rate-limiter`)
- `feature/contracts-<feature>`: API contract additions (e.g. `feature/contracts-meter-telemetry`)
- `fix/<scope>-<description>`: Bug fixes (e.g. `fix/officer-login-redirect`)
- `chore/<description>`: Tooling, dependencies, build scripts (e.g. `chore/oxfmt-update`)

---

## 2. Conventional Commits Standard

All commit messages must adhere to the [Conventional Commits v1.0.0](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### 2.1 Commit Types
- **`feat`**: A new user-facing feature or enhancement.
- **`fix`**: A bug fix.
- **`docs`**: Documentation updates only.
- **`style`**: Code formatting, semicolons, whitespace (no logic change).
- **`refactor`**: Code restructuring without altering external functionality.
- **`perf`**: Performance optimization.
- **`test`**: Adding or updating unit/integration tests.
- **`chore`**: Maintenance, build system, or monorepo workspace updates.

### 2.2 Scopes
- `officer`: Officer portal (`apps/officer-portal`)
- `citizen`: Citizen portal (`apps/citizen-portal`)
- `backend`: Backend API service (`backend/`)
- `contracts`: OpenAPI specs (`contracts/`)
- `ui`: Shared UI component library (`packages/ui`)
- `types`: Shared domain interfaces (`packages/types`)
- `api-client`: Shared HTTP client & mocks (`packages/api-client`)
- `infra`: Docker, nginx, database configs (`infra/`)

### 2.3 Examples
```bash
feat(officer): add multi-ward filter to complaint management table
fix(citizen): correct tariff slab calculation on billing page
docs(contracts): add telemetry error responses to openapi.yaml
chore(workspace): bump pnpm to v10.34.3 and optimize manualChunks
```

---

## 3. Pull Request Review Rules

1. **Automated Checks Must Pass**:
   - `pnpm run lint` (ESLint + oxfmt check) with 0 errors.
   - `pnpm run typecheck` (strict TypeScript `--noEmit`) with 0 errors.
   - `pnpm run build` (production Vite compilation) with 0 errors.
2. **API Contract Alignment**:
   - If an endpoint or payload structure is modified, [`contracts/openapi.yaml`](file:///contracts/openapi.yaml), [`docs/api-contract.md`](file:///docs/api-contract.md), and [`packages/types`](file:///packages/types) MUST be updated simultaneously in the same PR.
3. **Peer Review**:
   - At least 1 approving review from the designated folder CODEOWNER before merging.
4. **Merge Method**:
   - Use **Squash and merge** for feature branches into `dev`.
   - Use **Rebase and merge** or **Merge commit** for releases into `main`.
