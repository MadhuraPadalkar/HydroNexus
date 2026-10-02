# HydroNexus — Municipal Water Management System

[![CI Pipeline](https://github.com/hydronexus/hydronexus/actions/workflows/ci.yml/badge.svg)](.github/workflows/ci.yml)
[![Node.js Version](https://img.shields.io/badge/node-22%2B-blue)](https://nodejs.org/)
[![pnpm Version](https://img.shields.io/badge/pnpm-10.34.3-orange)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7%20strict-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06b6d4)](https://tailwindcss.com/)

Production-ready, full-stack monorepo for the **HydroNexus Municipal Water Management System**, incorporating internal operations for municipal water department officers and citizen-facing water utility services.

---

## 1. System Overview

HydroNexus provides a modern, unified platform for municipal water distribution:
- **Officer Operations Portal** (`apps/officer-portal`, port `5173`): Real-time network telemetry, DMA Non-Revenue Water (NRW) accounting, complaint assignment, river gauge flood alerts, valve maintenance, citizen connections, and GIS network monitoring.
- **Citizen Services Portal** (`apps/citizen-portal`, port `5174`): Mobile-first responsive app for grievance tracking, emergency outage notifications, water supply schedules, digital utility bill payment, and emergency water tanker requests.
- **Shared Packages** (`packages/`):
  - `@water/types`: Canonical entity interfaces, API envelopes, and error schemas.
  - `@water/ui`: Shared UI atoms (Card, StatusBadge, LoadingSpinner, EmptyState, ErrorMessage).
  - `@water/api-client`: Fully typed HTTP service layer with transparent zero-config mock data execution and live REST API support.
  - `@water/config`: Shared strict TypeScript configurations and Tailwind v4 theme tokens.
- **Contracts & Backend Slot**:
  - `contracts/openapi.yaml`: OpenAPI 3.0.3 specification covering all frontend endpoints.
  - `backend/`: Stack-agnostic placeholder slot with comprehensive guidelines for backend engineers.
  - `infra/database/`: Schema definitions, versioned migrations, and development seed fixtures.
  - `infra/docker/`: Multi-stage Dockerfile and optimized production Nginx web server config.

---

## 2. Monorepo Architecture

```
water-management/
├── apps/
│   ├── officer-portal/          # React 19 + Vite (Port 5173)
│   │   ├── src/
│   │   │   ├── app/             # App bootstrap, routes.tsx, OfficerLayout
│   │   │   ├── features/        # Feature modules (admin, analytics, complaints, gis, nrw, supply)
│   │   │   ├── components/      # Portal shared components & ErrorBoundary
│   │   │   ├── hooks/           # useAuth, useDataHooks
│   │   │   └── services/        # @/services/api re-export
│   │   ├── vercel.json          # SPA rewrite rule
│   │   └── netlify.toml         # SPA redirect rule
│   └── citizen-portal/          # React 19 + Vite (Port 5174, Mobile-first)
│       ├── src/
│       │   ├── app/             # App bootstrap, routes.tsx, CitizenLayout
│       │   ├── features/        # Feature modules (alerts, billing, complaints, home, map, supply)
│       │   ├── components/      # CommonUI components & ErrorBoundary
│       │   ├── hooks/           # useAuth, useCitizenData
│       │   └── services/        # @/services/api re-export
│       ├── vercel.json          # SPA rewrite rule
│       └── netlify.toml         # SPA redirect rule
├── packages/
│   ├── types/                   # @water/types (Domain entities & ApiResponse envelopes)
│   ├── ui/                      # @water/ui (Card, StatusBadge, EmptyState, LoadingSpinner)
│   ├── api-client/              # @water/api-client (Dual-mode HTTP client + Mock fixtures)
│   └── config/                  # @water/config (tsconfig.base.json & theme tokens)
├── contracts/
│   └── openapi.yaml             # Complete OpenAPI 3.0.3 contract
├── backend/                     # Decoupled backend slot (README.md + .env.example)
├── infra/
│   ├── docker/                  # Multi-stage Dockerfile + nginx.conf with caching
│   ├── database/                # Schema, migrations, seed data guidelines
│   └── deploy/                  # Deployment recipes per cloud provider
├── docs/
│   ├── architecture.md          # Screen inventory & module mapping
│   ├── api-contract.md          # Human-readable API endpoints spec
│   ├── deployment.md            # Hosting options, domains, Go-Live checklist
│   ├── git-workflow.md          # Branching model & Conventional Commits
│   └── assumptions.md           # Architecture decisions & constraints
├── .github/
│   ├── workflows/ci.yml         # GitHub Actions (Lint, Typecheck, Build)
│   ├── workflows/deploy.yml     # Workflow dispatch deployment template
│   ├── CODEOWNERS               # Area-based code ownership
│   └── pull_request_template.md # PR quality checklist
├── docker-compose.yml           # Local multi-service orchestration
├── package.json                 # Monorepo root scripts
└── pnpm-workspace.yaml          # pnpm workspace definition
```

---

## 3. Prerequisites

- **Node.js**: `v22.0.0` or higher (`v24.x` supported)
- **Package Manager**: `pnpm` `v10.0.0+`
- **Docker & Docker Compose**: (Optional, for containerized execution)

---

## 4. Quick Start

### 4.1 Install Dependencies
```bash
pnpm install
```

### 4.2 Start Development Servers
You can run both portals individually or concurrently:

```bash
# Start Officer Portal on http://localhost:5173
pnpm run dev:officer

# Start Citizen Portal on http://localhost:5174
pnpm run dev:citizen
```

### 4.3 Production Build & Quality Checks
```bash
# Static type checking across all packages and apps (strict TypeScript)
pnpm run typecheck

# Code formatting and linting (ESLint + oxfmt)
pnpm run lint

# Auto-format all code
pnpm run format

# Compile production bundles for all apps
pnpm run build
```

---

## 5. Dual-Mode Mock Execution & Backend Switching

The frontends are engineered to operate in **two distinct modes**:

1. **Standalone Mock Mode (Default)**: Runs fully in-browser without any running backend or database. Mock API calls simulate realistic 120ms network latency and authenticate mock credentials.
2. **Live Backend Mode**: Communicates with the REST API using bearer tokens, JSON error normalization, and standard HTTP envelopes.

### Switching Modes via Environment Variables
In each app's `.env` (or root `.env`):

```ini
# To switch from Mocks to Live Backend:
VITE_USE_MOCKS=false
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

When `VITE_USE_MOCKS=false`, `@water/api-client` automatically dispatches standard `fetch` requests to `${VITE_API_BASE_URL}` with `Authorization: Bearer <token>` headers. When `VITE_USE_MOCKS=true`, calls are intercepted and served from `@water/api-client/src/mocks/data.ts`. No application screen code needs to be altered.

---

## 6. Running with Docker Compose

To test the containerized production build locally:

```bash
# Build and run Officer Portal (5173) and Citizen Portal (5174) with Nginx
docker compose up --build
```

- Officer Portal: [http://localhost:5173](http://localhost:5173)
- Citizen Portal: [http://localhost:5174](http://localhost:5174)

---

## 7. How to Add a Feature Module

To add a new screen or feature to either portal:

1. **Domain Types**: If new entities exist, add their interface in [`packages/types/src/index.ts`](file:///packages/types/src/index.ts).
2. **API Client & Mocks**: Add the endpoint methods in [`packages/api-client/src/services.ts`](file:///packages/api-client/src/services.ts) and mock data in `packages/api-client/src/mocks/data.ts`.
3. **Feature Folder**: Create `apps/<portal>/src/features/<module>/pages/<Name>Page.tsx`.
   - Use default export for the page component.
   - Use typed data hooks or `@/services/api`.
   - Use `@water/ui` for `<LoadingSpinner />`, `<EmptyState />`, and `<ErrorMessage />`.
4. **Routing**: Register the route in `apps/<portal>/src/app/routes.tsx` using `lazy()` code splitting.
5. **Contract Sync**: If new endpoints are introduced, document them in [`contracts/openapi.yaml`](file:///contracts/openapi.yaml) and [`docs/api-contract.md`](file:///docs/api-contract.md).

---

## 8. Deployment & CI/CD Summary

- **Continuous Integration** ([.github/workflows/ci.yml](.github/workflows/ci.yml)): Automatically validates formatting (`oxfmt`), linting (`eslint`), strict type checking (`tsc --noEmit`), and builds production bundles on every commit and PR.
- **Production Edge Hosting**: Pre-configured for zero-downtime deployment on Vercel or Netlify with deep-link SPA routing.
- **Go-Live Checklist**: Detailed in [docs/deployment.md](docs/deployment.md).
