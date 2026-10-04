# Backend Integration Guide (Person 2 + Person 3)

How to build the citizen (Person 2) and officer (Person 3) backends against the
shared PostgreSQL schema and the existing frontend contract — without breaking
each other or the portals.

---

## 1. Sources of truth (read these first)

| Artifact | Role |
|---|---|
| `contracts/openapi.yaml` | Canonical HTTP paths, request/response shapes |
| `packages/types/src/index.ts` | TypeScript interfaces the portals render |
| `packages/api-client/src/services.ts` | Exact calls the portals make (mock/real dual-mode) |
| `packages/api-client/src/adapters.ts` | Shape normalization (contract shape **or** UI shape accepted) |
| `infra/database/` | Schema, migrations, seeds, setup docs |

## 2. Database

- Engine: PostgreSQL 16. Schema: `infra/database/migrations/001_initial_schema.sql`.
- Seeds: `infra/database/seeds/01_reference_data.sql`, `02_demo_data.sql` (idempotent).
- Setup/reset: see `infra/database/README.md`. Docker: `docker compose up --build database`.
- Connection: `DATABASE_URL=postgres://hydronexus_user:hydronexus_password@localhost:5432/hydronexus_db`
  (see `backend/.env.example` for `JWT_SECRET`, `CORS_ORIGINS`).
- Never edit `001_*` after merge — add `002_*.sql`, `003_*.sql`, …
- Table ↔ endpoint map is in `infra/database/README.md` §2.

## 3. Response envelope (mandatory)

Every endpoint must return the standard envelope so both portals keep working:

```json
{ "success": true, "data": { ... } }
{ "success": true, "data": [ ... ] }
```

Errors:

```json
{ "success": false, "error": { "message": "...", "code": "X", "status": 404 } }
```

The client also tolerates raw (unenveloped) payloads via `unwrapData`, but the
envelope is the contract — always send it.

## 4. Auth

- Officer login: `POST /auth/officer/login { email, password }` → verify
  `users.password_hash` with bcrypt (`crypt()`-compatible hashes are seeded),
  return `{ token, user }`.
- JWT claims (required): `sub` (user `public_id`), `role`, `exp`. Optional but
  consumed by the portal: `name`, `email`, `phone`, `department`, `zone`, `ward`.
- Protect routes with `Authorization: Bearer <token>`.
- Citizen OTP: `POST /auth/citizen/otp/request { phone }` → `{ otpSent: true }`;
  `POST /auth/citizen/otp/verify { phone, otp }` → `{ token, user }`.
- CORS must allow `http://localhost:5173` (officer) and `http://localhost:5174`
  (citizen) with credentials — see `CORS_ORIGINS`.

## 5. Endpoint alignment (canonical vs legacy)

The api-client calls the **canonical** (contract) path first and falls back to
the **legacy** path on 404, so backends built at different times keep working.
Implement the canonical column; the legacy column is best-effort compat.

| Feature | Canonical (implement this) | Legacy fallback |
|---|---|---|
| Update complaint | `PATCH /complaints/{id}` | `PATCH /complaints/{id}/status` |
| Service requests | `GET /citizens/requests` | `GET /citizens/service-requests` |
| Create tanker/service | `POST /citizens/requests` | `POST /citizens/service-requests/tanker` |
| Update service req. | `PATCH /citizens/requests/{id}` | `PATCH /citizens/service-requests/{id}` |
| Notices | `GET /notices` | `GET /alerts/notices` |
| Pay bill | `POST /billing/pay { billId }` | `POST /billing/bills/{id}/pay` |

New additive endpoints (already in `contracts/openapi.yaml`, back the new
`workOrdersApi` / write flows): `GET|POST /work-orders`,
`PATCH /work-orders/{id}`, `PATCH /citizens/requests/{id}`,
`POST /supply/outages`, `PATCH /supply/outages/{id}`,
`POST /supply/maintenance`, `PATCH /supply/maintenance/{id}`,
`POST /notices`.

Field-name note: adapters accept **both** `snake_case` (DB-style) and
`camelCase` (UI-style), and both the contract enums (`Ongoing`, `Detected`)
and UI enums (`Active`, `Reported`). Prefer the TypeScript UI names for new
endpoints.

## 6. Query conventions

- `GET /complaints?filter=<status|priority|type>` — `All`/empty returns all.
- `GET /citizens?search=<name|phone|consumerNumber|ward>`.
- Ward references: the portals display ward **names** (`Ward 07 - Kasba Bawada`).
  Accept either ward name or ward `code` (`W07`) on write; return the display
  name on read.

## 7. End-to-end verification flows

Once Person 2 + Person 3 backends exist, verify with `VITE_USE_MOCKS=false`,
`VITE_API_BASE_URL=http://localhost:8000/api/v1`:

1. **Complaint lifecycle** — citizen `POST /complaints` → row in `complaints` →
   officer sees it in Complaint Management → officer `PATCH /complaints/{id}`
   `{ status: "Resolved" }` → citizen `GET /complaints` shows updated status.
2. **Complaint update propagation** — officer assigns (`{ assigned }`) or
   reprioritizes (`{ priority }`) → citizen-facing read reflects it.
3. **Tanker queue** — citizen `POST /citizens/requests` (Tanker Request) →
   row in `tanker_requests`/`service_requests` → officer sees it in the
   service-request queue.
4. **Notifications** — officer `POST /alerts` or `POST /notices` → row in
   `notifications` (`kind` set correctly) → citizen `GET /alerts` / `GET /notices`
   returns it.

Current status (no Person 2/3 backend in this branch yet): flows 1–4 are verified
at the **contract + adapter + seed** level only — DB tables accept the required
writes, endpoints are specified, and the officer client normalizes both shapes.
Live verification is pending backend availability.

## 8. Known limitations / non-goals

- No GIS tables or endpoints (removed from scope).
- No flood/rainfall, admin settings-write, or budget tables — those portal
  screens remain mock/inline until their owners specify contracts.
- `supply_schedules` seeds only cover **today** (`CURRENT_DATE`); the portal
  falls back to mock data when no row exists for the current date.
- Seed officer passwords (`Password123!`) are dev-only.
