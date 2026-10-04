-- ============================================================================
-- HydroNexus seeds — 01_reference_data.sql
-- Roles, zones, wards, baseline officer + citizen users (Kolhapur context).
-- Idempotent: safe to re-run (ON CONFLICT DO NOTHING).
-- Dev passwords are 'Password123!' hashed with pgcrypto — DEV ONLY, never
-- use these hashes outside local/demo environments.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Roles / RBAC matrix (mirrors mockRolePermissions in the frontend)
-- ----------------------------------------------------------------------------
INSERT INTO roles_permissions
  (role, manage_users, manage_roles, view_audit, system_settings, edit_schedules, approve_requests)
VALUES
  ('Admin',      TRUE,  TRUE,  TRUE,  TRUE,  TRUE,  TRUE),
  ('Engineer',   FALSE, FALSE, TRUE,  FALSE, TRUE,  TRUE),
  ('Supervisor', FALSE, FALSE, FALSE, FALSE, TRUE,  FALSE),
  ('Operator',   FALSE, FALSE, FALSE, FALSE, FALSE, FALSE),
  ('Citizen',    FALSE, FALSE, FALSE, FALSE, FALSE, FALSE)
ON CONFLICT (role) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Zones
-- ----------------------------------------------------------------------------
INSERT INTO zones (code, name) VALUES
  ('CENTRAL', 'Central Zone'),
  ('NORTH',   'North Zone'),
  ('SOUTH',   'South Zone'),
  ('EAST',    'East Zone'),
  ('WEST',    'West Zone')
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Wards (8 demo wards across the 5 KMC zones)
-- ----------------------------------------------------------------------------
INSERT INTO wards (code, name, short_name, zone_id, population) VALUES
  ('W01', 'Ward 01 - Shivaji Peth',  'Shivaji Peth',  (SELECT id FROM zones WHERE code = 'CENTRAL'), 42500),
  ('W02', 'Ward 02 - Shahupuri',     'Shahupuri',     (SELECT id FROM zones WHERE code = 'CENTRAL'), 38800),
  ('W03', 'Ward 03 - Mangalwar Peth','Mangalwar Peth',(SELECT id FROM zones WHERE code = 'CENTRAL'), 31200),
  ('W04', 'Ward 04 - Rajarampuri',   'Rajarampuri',   (SELECT id FROM zones WHERE code = 'NORTH'),   45600),
  ('W05', 'Ward 05 - Tarabai Park',  'Tarabai Park',  (SELECT id FROM zones WHERE code = 'NORTH'),   29400),
  ('W06', 'Ward 06 - Laxmipuri',     'Laxmipuri',     (SELECT id FROM zones WHERE code = 'SOUTH'),   37100),
  ('W07', 'Ward 07 - Kasba Bawada',  'Kasba Bawada',  (SELECT id FROM zones WHERE code = 'EAST'),    41900),
  ('W12', 'Ward 12 - Rankala',       'Rankala',       (SELECT id FROM zones WHERE code = 'WEST'),    33600)
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Officer users (match frontend mock sessions so mock->real swap is seamless)
-- Dev password for all officers: Password123!
-- ----------------------------------------------------------------------------
INSERT INTO users
  (public_id, name, email, phone, password_hash, role, department, zone_id, ward_id, status)
VALUES
  ('USR-OFFICER-001', 'Suresh Patil', 'suresh.patil@kmcwater.gov.in', '+91 98220 12345',
   crypt('Password123!', gen_salt('bf', 10)), 'Admin', 'Water Supply Operations',
   (SELECT id FROM zones WHERE code = 'CENTRAL'), (SELECT id FROM wards WHERE code = 'W01'), 'Active'),
  ('USR-002', 'Anil Jadhav', 'anil.jadhav@kmcwater.gov.in', '+91 98220 23456',
   crypt('Password123!', gen_salt('bf', 10)), 'Engineer', 'Pipeline Maintenance',
   (SELECT id FROM zones WHERE code = 'EAST'), (SELECT id FROM wards WHERE code = 'W07'), 'Active'),
  ('USR-003', 'Deepak Kulkarni', 'deepak.k@kmcwater.gov.in', '+91 98220 34567',
   crypt('Password123!', gen_salt('bf', 10)), 'Supervisor', 'Distribution & Valves',
   (SELECT id FROM zones WHERE code = 'SOUTH'), (SELECT id FROM wards WHERE code = 'W06'), 'Active'),
  ('USR-004', 'Priya Shinde', 'priya.s@kmcwater.gov.in', '+91 98220 45678',
   crypt('Password123!', gen_salt('bf', 10)), 'Supervisor', 'Consumer Grievance',
   (SELECT id FROM zones WHERE code = 'CENTRAL'), (SELECT id FROM wards WHERE code = 'W02'), 'Active'),
  ('USR-009', 'Sachin Gaikwad', 'sachin.g@kmcwater.gov.in', '+91 98220 56789',
   crypt('Password123!', gen_salt('bf', 10)), 'Operator', 'Field Operations',
   (SELECT id FROM zones WHERE code = 'EAST'), (SELECT id FROM wards WHERE code = 'W07'), 'Active')
ON CONFLICT (public_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Citizen users (OTP login; no password hash by design)
-- ----------------------------------------------------------------------------
INSERT INTO users (public_id, name, email, phone, role, ward_id, consumer_id, status)
VALUES
  ('CIT-78192', 'Sunita Anand Patil', 'sunita.patil@gmail.com', '9876543210', 'Citizen',
   (SELECT id FROM wards WHERE code = 'W12'), 'KMC-CON-90214', 'Active'),
  ('CIT-78193', 'Rajendra Deshmukh', 'rajendra.d@yahoo.com', '9822114477', 'Citizen',
   (SELECT id FROM wards WHERE code = 'W04'), 'KMC-CON-88412', 'Active'),
  ('CIT-78194', 'Vandana Shinde', 'vandana.shinde@rediffmail.com', '9422001122', 'Citizen',
   (SELECT id FROM wards WHERE code = 'W02'), 'KMC-CON-77631', 'Active'),
  ('CIT-78195', 'Ramesh Shinde', NULL, '9876543211', 'Citizen',
   (SELECT id FROM wards WHERE code = 'W07'), 'KMC-CON-90215', 'Active'),
  ('CIT-78196', 'Prakash Mane', NULL, '9890123456', 'Citizen',
   (SELECT id FROM wards WHERE code = 'W07'), 'KMC-CON-90216', 'Active')
ON CONFLICT (public_id) DO NOTHING;
