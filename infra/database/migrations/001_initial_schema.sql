-- ============================================================================
-- HydroNexus — Migration 001: Initial schema (PostgreSQL 16+)
-- ============================================================================
-- Deterministic, repeatable on a clean development database.
-- Run order: 001_initial_schema.sql -> seeds/01_reference_data.sql
--            -> seeds/02_demo_data.sql
-- Never edit this file after it has been shared with the team.
-- All later changes go in new versioned migration files (002_... etc).
--
-- Conventions:
--   * UUID primary keys (gen_random_uuid) + human-readable business codes
--   * created_at / updated_at on mutable tables (trigger-maintained)
--   * FK indexes on every reference column
--   * CHECK constraints for status enums (no GIS tables by design)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- Shared updated_at trigger
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. ROLES & PERMISSIONS (RBAC matrix for Admin/Engineer/Supervisor/Operator)
-- ============================================================================
CREATE TABLE roles_permissions (
  role              TEXT PRIMARY KEY
                    CHECK (role IN ('Admin', 'Engineer', 'Supervisor', 'Operator', 'Citizen')),
  manage_users      BOOLEAN NOT NULL DEFAULT FALSE,
  manage_roles      BOOLEAN NOT NULL DEFAULT FALSE,
  view_audit        BOOLEAN NOT NULL DEFAULT FALSE,
  system_settings   BOOLEAN NOT NULL DEFAULT FALSE,
  edit_schedules    BOOLEAN NOT NULL DEFAULT FALSE,
  approve_requests  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. ZONES & WARDS (Kolhapur Municipal Corporation)
-- ============================================================================
CREATE TABLE zones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,          -- e.g. 'CENTRAL'
  name        TEXT NOT NULL UNIQUE,          -- e.g. 'Central Zone'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE wards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,          -- e.g. 'W12'
  name        TEXT NOT NULL UNIQUE,          -- e.g. 'Ward 12 - Rankala'
  short_name  TEXT NOT NULL,                 -- e.g. 'Rankala'
  zone_id     UUID NOT NULL REFERENCES zones(id) ON DELETE RESTRICT,
  population  INTEGER CHECK (population IS NULL OR population >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_wards_zone_id ON wards(zone_id);

-- ============================================================================
-- 3. USERS (officers + citizens in one table, distinguished by role)
-- ============================================================================
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id     TEXT NOT NULL UNIQUE,        -- e.g. 'USR-OFFICER-001' / 'CIT-78192'
  name          TEXT NOT NULL,
  email         TEXT UNIQUE,
  phone         TEXT UNIQUE,
  password_hash TEXT,                        -- NULL for OTP-only citizen logins
  role          TEXT NOT NULL REFERENCES roles_permissions(role) ON DELETE RESTRICT,
  department    TEXT,                        -- officers only
  zone_id       UUID REFERENCES zones(id) ON DELETE SET NULL,
  ward_id       UUID REFERENCES wards(id) ON DELETE SET NULL,
  consumer_id   TEXT,                        -- citizens: link to water_connections
  status        TEXT NOT NULL DEFAULT 'Active'
                CHECK (status IN ('Active', 'Inactive', 'Suspended')),
  last_active_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_contact_check CHECK (email IS NOT NULL OR phone IS NOT NULL)
);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_ward_id ON users(ward_id);
CREATE INDEX idx_users_zone_id ON users(zone_id);
CREATE INDEX idx_users_status ON users(status);

-- ============================================================================
-- 4. COMPLAINTS (citizen grievances, officer-triaged)
-- ============================================================================
CREATE TABLE complaints (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          TEXT NOT NULL UNIQUE,        -- e.g. 'CMP-2024-0891'
  type          TEXT NOT NULL,               -- Leakage | No Supply | Low Pressure | Quality | Billing | Other
  citizen_name  TEXT,
  phone         TEXT,
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  ward_id       UUID REFERENCES wards(id) ON DELETE SET NULL,
  address       TEXT,
  location      TEXT,
  description   TEXT NOT NULL DEFAULT '',
  priority      TEXT NOT NULL DEFAULT 'Medium'
                CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  status        TEXT NOT NULL DEFAULT 'Open'
                CHECK (status IN ('Open', 'Pending', 'In Progress', 'Resolved', 'Escalated')),
  assigned_to   UUID REFERENCES users(id) ON DELETE SET NULL,
  reported_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_priority ON complaints(priority);
CREATE INDEX idx_complaints_ward_id ON complaints(ward_id);
CREATE INDEX idx_complaints_assigned_to ON complaints(assigned_to);
CREATE INDEX idx_complaints_reported_at ON complaints(reported_at DESC);

-- ============================================================================
-- 5. WORK ORDERS (field tasks, optionally linked to a complaint)
-- ============================================================================
CREATE TABLE work_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL UNIQUE,      -- e.g. 'WO-2026-0001'
  complaint_id    UUID REFERENCES complaints(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  type            TEXT NOT NULL DEFAULT 'Corrective'
                  CHECK (type IN ('Preventive', 'Corrective', 'Inspection')),
  ward_id         UUID REFERENCES wards(id) ON DELETE SET NULL,
  scheduled_date  DATE,
  status          TEXT NOT NULL DEFAULT 'Pending'
                  CHECK (status IN ('Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled')),
  priority        TEXT NOT NULL DEFAULT 'Medium'
                  CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  assigned_team   TEXT,
  assigned_to     UUID REFERENCES users(id) ON DELETE SET NULL,
  notes           TEXT,
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_complaint_id ON work_orders(complaint_id);
CREATE INDEX idx_work_orders_ward_id ON work_orders(ward_id);
CREATE INDEX idx_work_orders_assigned_to ON work_orders(assigned_to);

-- ============================================================================
-- 6. WATER CONNECTIONS (live connections AND new-tap applications)
--     Applications are rows whose status is Under Review / Site Inspection;
--     approved/connected rows carry consumer_number + meter_number.
-- ============================================================================
CREATE TABLE water_connections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number TEXT UNIQUE,            -- e.g. 'APP-2026-104' (new-tap applications)
  consumer_number TEXT UNIQUE,               -- e.g. 'KMC-CON-90214' (NULL until sanctioned)
  applicant_name  TEXT NOT NULL,
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  ward_id         UUID REFERENCES wards(id) ON DELETE SET NULL,
  address         TEXT NOT NULL DEFAULT '',
  connection_type TEXT NOT NULL DEFAULT 'Domestic'
                  CHECK (connection_type IN ('Domestic', 'Commercial', 'Industrial')),
  meter_number    TEXT UNIQUE,
  status          TEXT NOT NULL DEFAULT 'Under Review'
                  CHECK (status IN ('Under Review', 'Site Inspection', 'Approved',
                                    'Meter Installed', 'Active', 'Suspended',
                                    'Pending Verification', 'Rejected')),
  current_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
  applied_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_water_connections_status ON water_connections(status);
CREATE INDEX idx_water_connections_ward_id ON water_connections(ward_id);
CREATE INDEX idx_water_connections_user_id ON water_connections(user_id);

-- ============================================================================
-- 7. BILLING RECORDS (monthly utility invoices + payment tracking)
-- ============================================================================
CREATE TABLE billing_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_number     TEXT NOT NULL UNIQUE,      -- e.g. 'BILL-SEP-26'
  connection_id   UUID REFERENCES water_connections(id) ON DELETE SET NULL,
  consumer_number TEXT NOT NULL,
  period          TEXT NOT NULL,             -- e.g. 'August 2026'
  bill_date       DATE NOT NULL,
  due_date        DATE NOT NULL,
  amount          NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  consumption_kl  NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (consumption_kl >= 0),
  status          TEXT NOT NULL DEFAULT 'Unpaid'
                  CHECK (status IN ('Paid', 'Unpaid', 'Overdue', 'Waived')),
  paid_at         TIMESTAMPTZ,
  transaction_id  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_billing_consumer ON billing_records(consumer_number);
CREATE INDEX idx_billing_connection ON billing_records(connection_id);
CREATE INDEX idx_billing_status ON billing_records(status);
CREATE INDEX idx_billing_due_date ON billing_records(due_date);

-- ============================================================================
-- 8. CONSUMPTION READINGS (meter time-series for usage charts/analytics)
-- ============================================================================
CREATE TABLE consumption_readings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES water_connections(id) ON DELETE CASCADE,
  month         TEXT NOT NULL,               -- e.g. 'Aug'
  period        TEXT NOT NULL,               -- e.g. 'August 2026'
  usage_kl      NUMERIC(10, 2) NOT NULL CHECK (usage_kl >= 0),
  cost          NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (connection_id, period)
);
CREATE INDEX idx_consumption_connection ON consumption_readings(connection_id);

-- ============================================================================
-- 9. TANKER REQUESTS (emergency water tanker bookings)
-- ============================================================================
CREATE TABLE tanker_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL UNIQUE,      -- e.g. 'SR-2024-0441'
  citizen_name    TEXT NOT NULL,
  phone           TEXT NOT NULL,
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  ward_id         UUID REFERENCES wards(id) ON DELETE SET NULL,
  address         TEXT NOT NULL DEFAULT '',
  capacity_kl     NUMERIC(6, 2),
  status          TEXT NOT NULL DEFAULT 'Pending'
                  CHECK (status IN ('Pending', 'Assigned', 'En Route', 'Completed', 'Cancelled')),
  vehicle_number  TEXT,
  driver_name     TEXT,
  notes           TEXT,
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tanker_status ON tanker_requests(status);
CREATE INDEX idx_tanker_ward_id ON tanker_requests(ward_id);
CREATE INDEX idx_tanker_requested_at ON tanker_requests(requested_at DESC);

-- ============================================================================
-- 10. SERVICE REQUESTS (pressure check, meter calibration, quality testing…)
-- ============================================================================
CREATE TABLE service_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL UNIQUE,      -- e.g. 'SRQ-882'
  citizen_name    TEXT NOT NULL,
  phone           TEXT NOT NULL,
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  ward_id         UUID REFERENCES wards(id) ON DELETE SET NULL,
  address         TEXT NOT NULL DEFAULT '',
  service_type    TEXT NOT NULL,             -- Tanker Request | Pressure Check | Meter Calibration | Water Quality Testing
  status          TEXT NOT NULL DEFAULT 'Pending'
                  CHECK (status IN ('Pending', 'Assigned', 'En Route', 'Completed', 'Cancelled')),
  vehicle_number  TEXT,
  driver_name     TEXT,
  notes           TEXT,
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_service_status ON service_requests(status);
CREATE INDEX idx_service_type ON service_requests(service_type);
CREATE INDEX idx_service_ward_id ON service_requests(ward_id);

-- ============================================================================
-- 11. SUPPLY SCHEDULES (ward-wise daily distribution slots)
-- ============================================================================
CREATE TABLE supply_schedules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_id         UUID NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
  supply_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  scheduled_slot  TEXT NOT NULL,             -- e.g. '06:00–09:00'
  actual_slot     TEXT NOT NULL DEFAULT '—',
  pressure_bar    NUMERIC(5, 2),             -- measured pressure
  status          TEXT NOT NULL DEFAULT 'On Time'
                  CHECK (status IN ('On Time', 'Delayed', 'Disrupted')),
  frequency       TEXT NOT NULL DEFAULT 'Daily',
  flow_rate       TEXT,                      -- e.g. '320 L/min'
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (ward_id, supply_date)
);
CREATE INDEX idx_supply_date ON supply_schedules(supply_date DESC);
CREATE INDEX idx_supply_status ON supply_schedules(status);

-- ============================================================================
-- 12. OUTAGE NOTICES (planned + emergency supply disruptions)
-- ============================================================================
CREATE TABLE outage_notices (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                    TEXT NOT NULL UNIQUE,  -- e.g. 'OUT-2024-089'
  ward_id                 UUID REFERENCES wards(id) ON DELETE SET NULL,
  zone_id                 UUID REFERENCES zones(id) ON DELETE SET NULL,
  reason                  TEXT NOT NULL,
  outage_type             TEXT NOT NULL DEFAULT 'Scheduled'
                          CHECK (outage_type IN ('Emergency', 'Scheduled')),
  start_time              TIMESTAMPTZ NOT NULL,
  estimated_restoration   TIMESTAMPTZ,
  restored_at             TIMESTAMPTZ,
  status                  TEXT NOT NULL DEFAULT 'Scheduled'
                          CHECK (status IN ('Active', 'Scheduled', 'Resolved')),
  affected_population     INTEGER CHECK (affected_population IS NULL OR affected_population >= 0),
  tankers_dispatched      INTEGER NOT NULL DEFAULT 0 CHECK (tankers_dispatched >= 0),
  alternative_arrangements TEXT,
  created_by              UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_outage_status ON outage_notices(status);
CREATE INDEX idx_outage_ward_id ON outage_notices(ward_id);
CREATE INDEX idx_outage_start ON outage_notices(start_time DESC);

-- ============================================================================
-- 13. MAINTENANCE SCHEDULES (preventive / corrective / inspection tasks)
-- ============================================================================
CREATE TABLE maintenance_schedules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL UNIQUE,      -- e.g. 'MNT-091'
  title           TEXT NOT NULL,
  task_type       TEXT NOT NULL DEFAULT 'Preventive'
                  CHECK (task_type IN ('Preventive', 'Corrective', 'Inspection')),
  facility        TEXT,
  ward_id         UUID REFERENCES wards(id) ON DELETE SET NULL,
  scheduled_date  DATE NOT NULL,
  completed_at    TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'Scheduled'
                  CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Pending', 'Cancelled')),
  priority        TEXT NOT NULL DEFAULT 'Medium'
                  CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  assigned_team   TEXT,
  notes           TEXT,
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_maintenance_status ON maintenance_schedules(status);
CREATE INDEX idx_maintenance_date ON maintenance_schedules(scheduled_date);
CREATE INDEX idx_maintenance_ward_id ON maintenance_schedules(ward_id);

-- ============================================================================
-- 14. NRW ZONE ACCOUNTING (DMA inflow vs billed consumption per period)
-- ============================================================================
CREATE TABLE nrw_zone_accounting (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id           UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  period_month      TEXT NOT NULL,           -- e.g. 'September 2026'
  input_volume_kl   NUMERIC(12, 2) NOT NULL CHECK (input_volume_kl >= 0),
  billed_volume_kl  NUMERIC(12, 2) NOT NULL CHECK (billed_volume_kl >= 0),
  nrw_volume_kl     NUMERIC(12, 2) GENERATED ALWAYS AS
                      (input_volume_kl - billed_volume_kl) STORED,
  nrw_percentage    NUMERIC(5, 2) GENERATED ALWAYS AS
                      (CASE WHEN input_volume_kl > 0
                            THEN ROUND((input_volume_kl - billed_volume_kl) * 100.0 / input_volume_kl, 2)
                            ELSE 0 END) STORED,
  target_percentage NUMERIC(5, 2) NOT NULL DEFAULT 15.0,
  trend             TEXT NOT NULL DEFAULT '0.0%',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (zone_id, period_month)
);
CREATE INDEX idx_nrw_zone ON nrw_zone_accounting(zone_id);
CREATE INDEX idx_nrw_period ON nrw_zone_accounting(period_month);

-- Leakage telemetry backing the /nrw/leakages endpoint.
CREATE TABLE leakage_incidents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                TEXT NOT NULL UNIQUE,  -- e.g. 'LK-2026-042'
  sensor_id           TEXT,
  location            TEXT NOT NULL,
  ward_id             UUID REFERENCES wards(id) ON DELETE SET NULL,
  dma_zone            TEXT,                  -- e.g. 'DMA-04'
  detected_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  estimated_loss_lps  NUMERIC(8, 2),
  severity            TEXT NOT NULL DEFAULT 'Moderate'
                      CHECK (severity IN ('Minor', 'Moderate', 'Severe', 'Critical')),
  status              TEXT NOT NULL DEFAULT 'Reported'
                      CHECK (status IN ('Reported', 'Assigned', 'Investigating', 'Repaired')),
  repaired_at         TIMESTAMPTZ,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_leakage_status ON leakage_incidents(status);
CREATE INDEX idx_leakage_ward_id ON leakage_incidents(ward_id);

-- ============================================================================
-- 15. NOTIFICATIONS (alerts + public notices; kind maps to /alerts vs /notices)
-- ============================================================================
CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          TEXT UNIQUE,                     -- e.g. 'ALR-01' (stable seed/API key)
  title         TEXT NOT NULL,
  body          TEXT NOT NULL DEFAULT '',
  severity      TEXT NOT NULL DEFAULT 'info'
                CHECK (severity IN ('critical', 'warning', 'info', 'success')),
  kind          TEXT NOT NULL DEFAULT 'alert'
                CHECK (kind IN ('alert', 'notice')),
  category      TEXT NOT NULL DEFAULT 'General',
  priority      TEXT NOT NULL DEFAULT 'Normal'
                CHECK (priority IN ('High', 'Normal', 'Low')),
  target_wards  TEXT[] NOT NULL DEFAULT '{}',
  sent_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  sent_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_kind ON notifications(kind);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at DESC);

-- ============================================================================
-- 16. AUDIT LOGS (tamper-evident trail; append-only by convention)
-- ============================================================================
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,          -- e.g. 'LOG-10441'
  actor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_name  TEXT NOT NULL,
  actor_role  TEXT NOT NULL DEFAULT 'Operator',
  action      TEXT NOT NULL,                 -- e.g. 'COMPLAINT_RESOLVED'
  module      TEXT NOT NULL,                 -- e.g. 'Complaints'
  target      TEXT NOT NULL DEFAULT '',
  ip_address  INET,
  severity    TEXT NOT NULL DEFAULT 'Info'
              CHECK (severity IN ('Info', 'Warning', 'Critical')),
  details     JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_module ON audit_logs(module);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ----------------------------------------------------------------------------
-- updated_at triggers for mutable tables (explicit per-table statements)
-- ----------------------------------------------------------------------------
CREATE TRIGGER trg_roles_permissions_updated_at BEFORE UPDATE ON roles_permissions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_zones_updated_at BEFORE UPDATE ON zones
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_wards_updated_at BEFORE UPDATE ON wards
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_complaints_updated_at BEFORE UPDATE ON complaints
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_work_orders_updated_at BEFORE UPDATE ON work_orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_water_connections_updated_at BEFORE UPDATE ON water_connections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_billing_records_updated_at BEFORE UPDATE ON billing_records
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tanker_requests_updated_at BEFORE UPDATE ON tanker_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_service_requests_updated_at BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_supply_schedules_updated_at BEFORE UPDATE ON supply_schedules
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_outage_notices_updated_at BEFORE UPDATE ON outage_notices
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_maintenance_schedules_updated_at BEFORE UPDATE ON maintenance_schedules
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_nrw_zone_accounting_updated_at BEFORE UPDATE ON nrw_zone_accounting
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_leakage_incidents_updated_at BEFORE UPDATE ON leakage_incidents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
