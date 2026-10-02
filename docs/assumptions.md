# Project Assumptions & Design Decisions

This document records all architectural assumptions, technical tradeoffs, and decisions made during the frontend monorepo construction and cleanup.

---

## 1. Monorepo Organization & Tooling

1. **Workspace Scope**:
   - `pnpm-workspace.yaml` explicitly includes `apps/*` and `packages/*`.
   - `backend/` is deliberately excluded from the pnpm workspace because it is a stack-agnostic placeholder to be implemented by other engineers in whatever language/runtime they select (e.g. Go, Node/Nest, Python/FastAPI, Java/Spring).
2. **Package Manager & Node Version**:
   - Package manager is `pnpm` (>= 9 or 10/12).
   - Target runtime is Node.js 22 LTS.
3. **TypeScript & Bundling**:
   - Unified `tsconfig.base.json` in `packages/config` enforces strict null checks, ES2022 targets, bundler resolution, and path aliases.
   - Vite 8 with `@vitejs/plugin-react` and `@tailwindcss/vite` (Tailwind CSS v4).

---

## 2. Port Allocations & Development Servers

- **Officer Portal**: Runs on port `5173`.
- **Citizen Portal**: Runs on port `5174`.
- **Backend API (Future)**: Expected to run on port `8000` (configurable via `VITE_API_BASE_URL` or default `http://localhost:8000/api/v1`).

---

## 3. Mock Data & API Client Architecture

1. **Dual Mode Execution**:
   - When `VITE_USE_MOCKS=true` (default during frontend development), `@water/api-client` intercepts requests and serves in-memory mock fixtures with a simulated realistic latency (150ms).
   - When `VITE_USE_MOCKS=false`, `@water/api-client` delegates to `fetch()` via a unified `http.ts` client that adds JSON headers, handles `Bearer` JWT tokens, and maps errors into standardized `ApiError` shapes.
2. **Session & Auth**:
   - In mock mode, a mock session is persisted in `localStorage` under `hydronexus_officer_token` and `hydronexus_citizen_token`.
   - `ProtectedRoute` inspects the auth state from `@water/api-client`. When transitioning to real JWTs, only the backend endpoint in `api-client` changes—no presentation screens need modification.

---

## 4. Design & Screen Decisions

1. **Figma Screen Preservation**:
   - All 23 officer portal screens (including the 5 previously unimported screens: `AuditLogs`, `FloodMonitoring`, `OfficerUserManagement`, `RolePermissions`, `SystemSettings`) have been preserved, routed, and categorized into feature modules.
   - All 17 citizen portal screens previously embedded in a single monolithic `App.tsx` have been refactored into dedicated feature modules with one default export component per file.
2. **Design Tokens & Icons**:
   - Google Font `Inter` and `Material Symbols Outlined` are imported via CSS.
   - Primary municipal color palette:
     - Officer Portal: Navy Blue `#002045` (sidebar), Primary Blue `#0061a5`, Light Blue `#e8f0fe`, Light Gray `#f4f6f9`.
     - Citizen Portal: Primary Blue `#0061a5`, Surface Light `#f8fafc`, Alert Red `#ba1a1a`.

---

## 5. Deployment Scaffolding Assumptions

1. **Docker & Containers**:
   - Multi-stage Docker build uses Node 22 Alpine to build static assets, then copies artifacts to `nginx:alpine`.
   - SPA fallback rules configured in `nginx.conf` (`try_files $uri $uri/ /index.html;`) with gzip compression enabled.
2. **Static Hosts**:
   - `vercel.json` and `netlify.toml` are provided with SPA rewriting rules for deep-link refreshes.
