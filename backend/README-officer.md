# Officer Backend (Node.js + Express)

Officer-facing API for HydroNexus. Run from `backend/`:

```bash
cp .env.example .env   # then set JWT_SECRET
npm install
npm run dev            # tsx watch on :8000
npm run verify         # 61-check endpoint suite (boots ephemeral port)
npm run typecheck      # tsc --noEmit, must be zero errors
npm run build          # tsc emit to dist/; run with npm start
```

Seed logins (dev only): any officer email in `src/data/store.js` with password
`Password123!`, e.g. `suresh.patil@kmcwater.gov.in`.

## Layout (TypeScript + repository layer)

- `tsconfig.json` — extends `packages/config/tsconfig.base.json`
- `src/index.ts` — app + `/api/v1` mount table
- `src/routes/*.officer.ts` — officer modules (`*.officer.ts` prefix reserves
  non-prefixed filenames for Person 2's citizen routes — do not rename).
  Handlers do validation (Zod schemas annotated with `@water/types` types)
  then call repositories/services. They never touch the store.
- `src/repositories/*.ts` — one interface + in-memory implementation per
  aggregate (complaint, workOrder, supply, nrw, citizen, ward,
  notification, officer, analytics). **Prisma swap: reimplement these
  methods with the Prisma client; route/service signatures don't change.**
- `src/services/*.ts` — cross-entity orchestration only (complaint assign
  → work order, outage auto-notify → alert, dashboard/NRW/ward-comparison
  roll-ups). Calls repositories only.
- `src/data/store.ts` — temporary in-memory collections. Imported ONLY by
  repositories; deleted on Prisma swap.
- `src/domain.ts` — local models with no `@water/types` equivalent
  (`WorkOrder`, `Ward`, `WardStats`, JWT payload). Everything else is
  imported directly from `@water/types` (`file:../packages/types` dep,
  `import type` only — zero runtime coupling).
- `officer-portal.http` — request collection covering all 54 requests
- `tests/verify.ts` — automated verification of the same coverage
  (`tsx tests/verify.ts`)

## Auth, roles, audit

- Per-route guards: `requireOfficer` (any officer role), `requireRoles(...)`
  (subset), `requireToken` (any valid token incl. `Citizen`, for `GET /alerts`).
  `GET /notices` is public. Unknown `/api/*` paths return 404 without a token.
- Role matrix: Admin full access; Supervisor everything except officer /
  permission / settings / ward administration; Engineer writes supply,
  complaints, work orders, NRW; Operator read-only except service-request
  dispatch/deliver.
- Every mutation plus login success/failure writes an `AuditLog` via
  `auditRepository.record` (newest first; `GET /admin/audit-logs` supports
  `?user=&module=&severity=&q=`).
- `POST /auth/officer/login` requires `password` (missing/wrong -> 401).
- No `/billing/*` routes (Person 2 owns billing); no citizen `POST
  /complaints` or OTP routes (Person 2 owns them).

## For Person 4 (schema) — tables needed, none exist yet

`infra/database/` currently holds only a README, so **no SQL was created**.
`store.js` names the expected table per collection. Needed:

| Collection | Table | Notes |
|---|---|---|
| officers + credentials | `officer_users` | bcrypt hash (cost ≥12 to meet backend README), `status` |
| complaints | `complaints` | status workflow incl. both `Open` and `Pending` vocabularies |
| workOrders | `work_orders` | **new table**: id, complaint_id FK, title, ward, assigned_to, priority, status, notes, timestamps |
| supplySchedule | `supply_schedules` | ward PK, zone, scheduled/actual, pressure, status |
| outages | `outages` | + `auto_notify` boolean |
| maintenanceTasks | `maintenance_tasks` | |
| nrwMetrics | `nrw_zones` | store input/billed; compute NRW% as `(input-billed)/input*100` |
| leakageIncidents | `sensor_telemetry` | |
| wardStats | `ward_stats` (or view) | per-ward nrw/complaints/resolution/supply/pressure/coverage |
| citizens | `citizens` | |
| connectionApplications | `connection_applications` | status: Under Review / Site Inspection / Approved / Rejected |
| serviceRequests | `service_requests` | status: Pending → Assigned → En Route → Completed |
| wards | `wards` | id, name, zone, population, households, coverage, hours, status |
| alerts / notices | `alerts`, `notices` | alerts shared with citizen-side reads |
| rolePermissions / systemSettings / auditLogs / bills / gauges / rainfall | per `infra/database/README.md` §2 | read-only mirrors here; billing writes are Person 2's |

Shared-write contract with Person 2: `complaints` status, `service_requests`,
`alerts` are written by both sides — same tables/collections, no duplicates.

## Contract divergence (openapi.yaml vs packages/types)

Response bodies follow **packages/types** (what officer-portal renders).
openapi.yaml disagrees on these shapes — reconcile before codegen:

- `Complaint.status`: yaml `Pending…`, types `Open…` → endpoint accepts both
- `SupplyScheduleItem`, `Outage`, `MaintenanceTask`: different fields → types shape served
- `NRWZoneMetric`: yaml `zoneId/zoneName/inflowMLD/billedMLD`, types `zone/inputVolumeKL/billedVolumeKL/nrwVolumeKL/…` → types shape served
- `CitizenRecord`, `WaterConnectionApplication`, `ServiceRequest`: field-name
  differences (`consumerNumber` vs `consumerId`, `applicationId` vs `id`, …) → types shape served
- `AuditLog`: different fields → types shape served
- `GET /complaints/:id`, `PATCH /complaints/:id` Body.note, and all
  `/dashboard/*`, `/work-orders/*`, `/wards/*`, `/nrw/summary`,
  `/nrw/leakage-analysis`, `/nrw/compare`, `/analytics/*` are OFFICER-EXT
  (not in yaml §3–§10); `PATCH /complaints/:id` covers yaml's update semantics.

## For Person 4 (portal wiring)

Base URL `http://localhost:8000/api/v1`, `Authorization: Bearer <jwt>`.
All success bodies are `{ success: true, data }`; errors are
`{ success: false, error: { message, code, status, details? } }`.
Set `VITE_USE_MOCKS=false` in officer-portal and map `services.ts` calls to
these paths (only path changes — payload shapes already match).
GIS module intentionally not built.
