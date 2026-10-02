# HydroNexus Database Architecture & Scaffolding

This directory serves as the centralized repository for database schema definitions, versioned migration scripts, and baseline fixture seed data.

---

## 1. Directory Structure

```
infra/database/
├── schema/              # Declarative DDL definitions (tables, constraints, indexes)
│   ├── 01_auth.sql
│   ├── 02_citizens.sql
│   ├── 03_complaints.sql
│   ├── 04_supply.sql
│   ├── 05_nrw.sql
│   ├── 06_billing.sql
│   ├── 07_alerts.sql
│   └── 08_admin.sql
├── migrations/          # Incremental, forward/backward timestamped migrations
│   └── 20260901_000001_initial_schema.sql
├── seeds/               # Initial reference data and development fixtures
│   ├── 01_roles.sql
│   ├── 02_wards.sql
│   ├── 03_officers.sql
│   └── 04_mock_telemetry.sql
└── README.md
```

---

## 2. Core Entities & Relationships

The relational schema must accommodate all entities modeled in `@water/types`:

1. **`officer_users`**: Administrative credentials, roles (`Admin`, `Engineer`, `Supervisor`, `Operator`), departments, assigned operational zones.
2. **`citizens`**: Consumer records, connection identifiers, contact phone numbers, wards, domestic/commercial water connection properties.
3. **`complaints`**: Grievance tickets, classification (`Leakage`, `No Supply`, `Low Pressure`, `Quality`, `Billing`, `Other`), assigned field engineer, priority, status workflow (`Pending` -> `In Progress` -> `Resolved` -> `Escalated`).
4. **`supply_schedules`**: Zone-based morning/evening distribution schedule timings, flow rates, and pressure parameters.
5. **`outages`**: Emergency pipeline bursts and scheduled maintenance disruptions with affected ward lists.
6. **`nrw_zones`**: District Metered Areas (DMA), inflow MLD vs. billed consumption MLD, calculated NRW percentage.
7. **`sensor_telemetry`**: Acoustic leakage sensors, pressure transducers, river water level gauges (`gauge_stations`), and precipitation gauges (`rainfall_records`).
8. **`bills` & `transactions`**: Monthly utility consumption invoices, tariff slab calculation, payment tracking, and receipt generation.
9. **`alerts` & `notices`**: High-priority citizen advisories, multi-ward broadcast notifications, and public circulars.
10. **`audit_logs`**: Tamper-evident trail recording actor ID, IP address, timestamp, action type, and modification payload.

---

## 3. Migration Guidelines

- All migration scripts must be idempotent or use standard migration tools (e.g. Flyway, Liquibase, Prisma, Drizzle, or Goose).
- Never execute destructive DDL (`DROP COLUMN`, `DROP TABLE`) in production without a multi-phase transition plan.
- Foreign keys must index reference columns to prevent full-table locks during cascading operations.
