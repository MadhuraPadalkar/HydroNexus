# HydroNexus Database — PostgreSQL 16

Central relational store for the HydroNexus Municipal Water Management System.
Single schema serves **both** the citizen backend (Person 2) and the officer
backend (Person 3). GIS/map scope is intentionally excluded — there are no
GIS tables by design.

---

## 1. Directory Structure

```
infra/database/
├── migrations/
│   ├── 001_initial_schema.sql   # All tables, constraints, indexes, triggers
│   └── 099_apply_seeds.sh       # Docker-entrypoint helper: applies ../seeds/*.sql
├── seeds/
│   ├── 01_reference_data.sql    # Roles, zones, wards, baseline users (idempotent)
│   └── 02_demo_data.sql         # Demo dataset for all modules (idempotent)
└── README.md
```

**Migration rules (Person 2 / Person 3, please follow):**

- Never edit `001_initial_schema.sql` after it is merged — create `002_*.sql`, `003_*.sql`, …
- New migrations must be deterministic on a clean DB and re-runnable where possible.
- No destructive DDL (`DROP TABLE` / `DROP COLUMN`) without a transition plan.
- Every FK column is indexed (already done in 001; keep it that way).

---

## 2. Tables & Key Relationships

| # | Table | Purpose | Key links |
|---|---|---|---|
| 1 | `roles_permissions` | RBAC matrix (Admin/Engineer/Supervisor/Operator/Citizen) | `users.role` → `roles_permissions.role` |
| 2 | `zones` | 5 KMC zones (Central/North/South/East/West) | — |
| 3 | `wards` | 8 demo wards | `wards.zone_id` → `zones.id` |
| 4 | `users` | Officers **and** citizens (OTP citizens have NULL `password_hash`) | `ward_id`, `zone_id`, `role` |
| 5 | `complaints` | Citizen grievances (`code` e.g. CMP-2024-0891) | `ward_id`, `user_id` (reporter), `assigned_to` → `users` |
| 6 | `work_orders` | Field tasks; optionally `complaint_id` → `complaints` | `ward_id`, `assigned_to` |
| 7 | `water_connections` | Live connections (`consumer_number`) **and** new-tap applications (`application_number`, status Under Review/Site Inspection/Approved) | `user_id`, `ward_id`, `approved_by` |
| 8 | `billing_records` | Monthly invoices + payment tracking | `connection_id`, `consumer_number` |
| 9 | `consumption_readings` | Meter time-series per connection/period (usage charts) | `connection_id` |
| 10 | `tanker_requests` | Emergency tanker queue | `ward_id`, `user_id` |
| 11 | `service_requests` | Pressure/meter/quality visits (+ tanker rows mirrored from the portal) | `ward_id`, `user_id` |
| 12 | `supply_schedules` | Daily per-ward slot; `UNIQUE(ward_id, supply_date)` | `ward_id` |
| 13 | `outage_notices` | Planned/emergency disruptions | `ward_id`, `zone_id`, `created_by` |
| 14 | `maintenance_schedules` | Preventive/corrective/inspection tasks | `ward_id`, `created_by` |
| 15 | `nrw_zone_accounting` | Per-zone per-month inflow vs billed; `nrw_volume_kl` / `nrw_percentage` are **generated columns** | `zone_id` |
| 16 | `leakage_incidents` | Telemetry-backed leak list for `/nrw/leakages` | `ward_id` |
| 17 | `notifications` | `kind='alert'` → `GET /alerts`; `kind='notice'` → `GET /notices`; `target_wards` is a ward-`code` array (`{'ALL'}` = broadcast) | `sent_by` → `users` |
| 18 | `audit_logs` | Append-only action trail | `actor_id` → `users` |

Common conventions: UUID PKs + human `code`/`number` business keys, `created_at`/`updated_at`
(trigger-maintained), `CHECK` status enums, `ON DELETE SET NULL` for operational
history (deleting a user never deletes complaints/bills).

### Endpoint ↔ table map (for Person 2 / Person 3)

| API | Tables |
|---|---|
| `POST /auth/officer/login`, OTP verify | `users`, `roles_permissions` |
| `GET/POST /complaints`, `PATCH /complaints/{id}` | `complaints` (+ `work_orders` for linked tasks) |
| Work-order endpoints (see `contracts/openapi.yaml`) | `work_orders` |
| `GET /supply/schedule` | `supply_schedules` ⨝ `wards` ⨝ `zones` |
| `GET /supply/outages` (+ write endpoints) | `outage_notices` |
| `GET /supply/maintenance` (+ write endpoints) | `maintenance_schedules` |
| `GET /nrw/metrics` | `nrw_zone_accounting` ⨝ `zones` |
| `GET /nrw/leakages` | `leakage_incidents` |
| `GET /citizens`, `/citizens/applications`, `/citizens/requests` | `water_connections`, `service_requests`, `tanker_requests`, `users` |
| `GET /billing/bills`, `/billing/usage`, `POST /billing/pay` | `billing_records`, `consumption_readings` |
| `GET/POST /alerts`, `GET /notices` | `notifications` (`kind` filter) |
| `GET /admin/*` | `users`, `roles_permissions`, `audit_logs` |

---

## 3. Local Setup (Person 2 / Person 3)

### Option A — Docker (recommended, zero local Postgres needed)

```bash
cp .env.example .env        # root env; DATABASE_URL default matches compose
docker compose up --build database
```

PostgreSQL 16 starts on `localhost:5432`, runs `migrations/001_initial_schema.sql`,
then `099_apply_seeds.sh` applies `seeds/*.sql` from the `/seeds` mount.
Backend services connect with:

```
DATABASE_URL=postgres://hydronexus_user:hydronexus_password@localhost:5432/hydronexus_db
```

### Option B — Local PostgreSQL 16 + psql

```bash
createdb hydronexus_db
psql $DATABASE_URL -f infra/database/migrations/001_initial_schema.sql
psql $DATABASE_URL -f infra/database/seeds/01_reference_data.sql
psql $DATABASE_URL -f infra/database/seeds/02_demo_data.sql
```

### Verify

```sql
SELECT count(*) FROM users;            -- expect 10 (5 officers + 5 citizens)
SELECT count(*) FROM complaints;       -- expect 5
SELECT code, status FROM complaints ORDER BY reported_at DESC;
SELECT z.name, n.period_month, n.input_volume_kl, n.billed_volume_kl,
       n.nrw_volume_kl, n.nrw_percentage
FROM nrw_zone_accounting n JOIN zones z ON z.id = n.zone_id;
```

### Reset / reseed dev data

```bash
# Nuclear option (dev only): drop the Docker volume and start over.
docker compose down -v database
docker compose up --build database
```

Seeds are idempotent (`ON CONFLICT DO NOTHING`), so re-running a seed file never
duplicates rows — but note `supply_schedules` uses `CURRENT_DATE`, so a fresh
day needs a fresh row per ward (the officer portal falls back to mock data when
the table has no row for today).

---

## 4. Credentials

| User | Login | Dev password / method |
|---|---|---|
| Officers (`suresh.patil@kmcwater.gov.in`, …) | `POST /auth/officer/login` | `Password123!` (bcrypt via pgcrypto, **dev only**) |
| Citizens (`9876543210`, …) | OTP endpoints | Mock OTP in development |

Never commit real credentials. Production passwords must be created via the
backend signup/admin flow (argon2/bcrypt, work factor ≥ 12).
