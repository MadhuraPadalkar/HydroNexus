## Description
<!-- Provide a brief summary of the change, motivation, and context -->

## Type of Change
- [ ] 🚀 New feature (non-breaking change adding functionality)
- [ ] 🐛 Bug fix (non-breaking change fixing an issue)
- [ ] 💅 UI/UX refinement (preserving design tokens & Figma fidelity)
- [ ] 📄 Documentation update
- [ ] 🔧 Refactoring or tooling enhancement
- [ ] ⚠️ Breaking change (affects existing API contract or schemas)

## Affected Areas
- [ ] `apps/officer-portal` (Officer Portal)
- [ ] `apps/citizen-portal` (Citizen Portal)
- [ ] `packages/ui` (Shared UI components)
- [ ] `packages/types` (Shared domain definitions)
- [ ] `packages/api-client` (API client & mock fixtures)
- [ ] `contracts/` & `docs/api-contract.md` (OpenAPI contract)
- [ ] `backend/` (Backend service placeholder)
- [ ] `infra/` (Docker, database migrations, CI/CD)

## Pre-Merge Quality Checklist
- [ ] **Formatting**: `pnpm run format` was executed and code is properly formatted.
- [ ] **Linting**: `pnpm run lint` passed with zero errors or warnings.
- [ ] **Type Checking**: `pnpm run typecheck` passed with zero TypeScript errors across all workspaces.
- [ ] **Production Build**: `pnpm run build` compiled all apps successfully without asset chunk regressions.
- [ ] **API Contract Sync**: If API endpoints or schemas were added/modified, both `contracts/openapi.yaml` and `docs/api-contract.md` have been updated to reflect the change.
- [ ] **Figma Fidelity**: Layouts, typography, responsive breakpoints (down to 360px), and color tokens match design specs.
- [ ] **Dual Mode Support**: Works seamlessly both with `VITE_USE_MOCKS=true` and `VITE_USE_MOCKS=false`.
