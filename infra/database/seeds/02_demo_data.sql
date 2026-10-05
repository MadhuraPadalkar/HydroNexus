-- ============================================================================
-- HydroNexus seeds — 02_demo_data.sql
-- Realistic Kolhapur demo dataset for project demonstrations.
-- Idempotent: safe to re-run (ON CONFLICT DO NOTHING).
-- Depends on: 01_reference_data.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Water connections: 3 live + 3 applications under review/inspection
-- ----------------------------------------------------------------------------
INSERT INTO water_connections
  (application_number, consumer_number, applicant_name, user_id, ward_id, address, connection_type,
   meter_number, status, current_balance, approved_by)
VALUES
  (NULL, 'KMC-CON-90214', 'Sunita Anand Patil',
   (SELECT id FROM users WHERE public_id = 'CIT-78192'),
   (SELECT id FROM wards WHERE code = 'W12'),
   'Plot 12, Lake View Colony, Rankala', 'Domestic', 'MTR-7721', 'Active', 420.00, NULL),
  (NULL, 'KMC-CON-88412', 'Rajendra Deshmukh',
   (SELECT id FROM users WHERE public_id = 'CIT-78193'),
   (SELECT id FROM wards WHERE code = 'W04'),
   'B-4, 7th Lane, Rajarampuri', 'Commercial', 'MTR-8104', 'Active', 1850.00, NULL),
  (NULL, 'KMC-CON-77631', 'Vandana Shinde',
   (SELECT id FROM users WHERE public_id = 'CIT-78194'),
   (SELECT id FROM wards WHERE code = 'W02'),
   'House 45, Near Post Office, Shahupuri', 'Domestic', 'MTR-6430', 'Active', 0.00, NULL)
ON CONFLICT (consumer_number) DO NOTHING;

-- Applications carry NULL consumer_number (NULLs never conflict), so they
-- are upserted on their stable application_number instead.
INSERT INTO water_connections
  (application_number, applicant_name, ward_id, address, connection_type, status, approved_by)
VALUES
  ('APP-2026-104', 'Sachin Gaikwad',
   (SELECT id FROM wards WHERE code = 'W07'),
   'Survey 41/2, Near Sugar Mill, Kasba Bawada', 'Domestic', 'Under Review', NULL),
  ('APP-2026-103', 'Hotel Panchganga Deluxe',
   (SELECT id FROM wards WHERE code = 'W02'),
   'Station Road, Shahupuri', 'Commercial', 'Site Inspection',
   (SELECT id FROM users WHERE public_id = 'USR-OFFICER-001')),
  ('APP-2026-102', 'Pooja Kulkarni',
   (SELECT id FROM wards WHERE code = 'W05'),
   'Flat 101, Anand Vihar, Tarabai Park', 'Domestic', 'Approved',
   (SELECT id FROM users WHERE public_id = 'USR-OFFICER-001'))
ON CONFLICT (application_number) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Complaints (mirror the officer-portal mock tickets)
-- ----------------------------------------------------------------------------
INSERT INTO complaints
  (code, type, citizen_name, phone, user_id, ward_id, address, location,
   description, priority, status, assigned_to, reported_at)
VALUES
  ('CMP-2024-0891', 'Leakage', 'Ramesh Shinde', '9876543210',
   (SELECT id FROM users WHERE public_id = 'CIT-78195'),
   (SELECT id FROM wards WHERE code = 'W07'),
   'Plot 14, Sector 4, Kasba Bawada', 'Kasba Bawada Chowk',
   'Major pipeline burst near Kasba Bawada chowk. Road flooded. Water flowing into shops.',
   'Critical', 'In Progress',
   (SELECT id FROM users WHERE public_id = 'USR-002'),
   NOW() - INTERVAL '5 hours'),
  ('CMP-2024-0890', 'Low Pressure', 'Sunita Patil', '9822334455', NULL,
   (SELECT id FROM wards WHERE code = 'W04'),
   'B-12, Green Park Apts, 5th Lane', '5th Lane, Rajarampuri',
   'Pressure barely 0.3 bar since yesterday morning. Overhead tanks not filling.',
   'High', 'In Progress',
   (SELECT id FROM users WHERE public_id = 'USR-003'),
   NOW() - INTERVAL '6 hours'),
  ('CMP-2024-0889', 'Quality', 'Mahesh Jadhav', '9423112233', NULL,
   (SELECT id FROM wards WHERE code = 'W02'),
   'Near Old Post Office, Shahupuri', 'Shahupuri 3rd Lane',
   'Brown muddy water from tap for past 2 days. Multiple households affected in lane 3.',
   'Critical', 'Open', NULL,
   NOW() - INTERVAL '1 day'),
  ('CMP-2024-0888', 'Billing', 'Prakash Mane', '9890123456',
   (SELECT id FROM users WHERE public_id = 'CIT-78196'),
   (SELECT id FROM wards WHERE code = 'W05'),
   'Flat 402, Sai Residency, Tarabai Park', 'Tarabai Park',
   'Bill amount 3x average without change in consumption. Meter inspection requested.',
   'Medium', 'In Progress',
   (SELECT id FROM users WHERE public_id = 'USR-004'),
   NOW() - INTERVAL '1 day'),
  ('CMP-2024-0887', 'No Supply', 'Kavita Desai', '9765432109', NULL,
   (SELECT id FROM wards WHERE code = 'W03'),
   'House 88, Near Maruti Temple', 'Mangalwar Peth',
   'No supply for 3 consecutive scheduled slots. Valve stuck closed in branch line.',
   'High', 'Resolved',
   (SELECT id FROM users WHERE public_id = 'USR-003'),
   NOW() - INTERVAL '2 days')
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Work orders (field tasks incl. complaint-linked ones)
-- ----------------------------------------------------------------------------
INSERT INTO work_orders
  (code, complaint_id, title, type, ward_id, scheduled_date, status,
   priority, assigned_team, assigned_to, notes, created_by)
VALUES
  ('WO-2026-0101',
   (SELECT id FROM complaints WHERE code = 'CMP-2024-0891'),
   'Isolate feeder valve 4B and repair burst main', 'Corrective',
   (SELECT id FROM wards WHERE code = 'W07'),
   CURRENT_DATE, 'In Progress', 'Critical', 'Unit A - Mechanical',
   (SELECT id FROM users WHERE public_id = 'USR-002'),
   'Field team dispatched with excavation equipment.',
   (SELECT id FROM users WHERE public_id = 'USR-002')),
  ('WO-2026-0102', NULL, 'Booster pump inspection - Rajarampuri', 'Inspection',
   (SELECT id FROM wards WHERE code = 'W04'),
   CURRENT_DATE, 'Assigned', 'High', 'Unit B - Pipeline',
   (SELECT id FROM users WHERE public_id = 'USR-003'), NULL,
   (SELECT id FROM users WHERE public_id = 'USR-OFFICER-001')),
  ('WO-2026-0103',
   (SELECT id FROM complaints WHERE code = 'CMP-2024-0889'),
   'Flush and chlorinate Shahupuri lane 3 branch', 'Corrective',
   (SELECT id FROM wards WHERE code = 'W02'),
   CURRENT_DATE + 1, 'Pending', 'Critical', 'Quality Team',
   NULL, 'Take bacteriological samples before/after flush.',
   (SELECT id FROM users WHERE public_id = 'USR-004')),
  ('WO-2026-0104', NULL, 'Quarterly valve chamber greasing - Shivaji Peth', 'Preventive',
   (SELECT id FROM wards WHERE code = 'W01'),
   CURRENT_DATE + 2, 'Pending', 'Medium', 'Unit B - Pipeline',
   NULL, NULL,
   (SELECT id FROM users WHERE public_id = 'USR-OFFICER-001'))
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Supply schedules (today, one row per ward)
-- ----------------------------------------------------------------------------
INSERT INTO supply_schedules
  (ward_id, supply_date, scheduled_slot, actual_slot, pressure_bar, status, frequency, flow_rate)
VALUES
  ((SELECT id FROM wards WHERE code = 'W01'), CURRENT_DATE, '06:00–09:00', '06:00–09:10', 2.8, 'On Time',  'Daily', '320 L/min'),
  ((SELECT id FROM wards WHERE code = 'W04'), CURRENT_DATE, '07:00–10:00', '07:12–10:05', 2.4, 'Delayed',  'Daily', '300 L/min'),
  ((SELECT id FROM wards WHERE code = 'W07'), CURRENT_DATE, '17:00–20:00', '—',             NULL, 'Disrupted','Daily', '280 L/min'),
  ((SELECT id FROM wards WHERE code = 'W02'), CURRENT_DATE, '06:00–09:00', '06:00–09:00', 2.9, 'On Time',  'Daily', '330 L/min'),
  ((SELECT id FROM wards WHERE code = 'W06'), CURRENT_DATE, '05:30–08:30', '05:30–08:35', 2.7, 'On Time',  'Daily', '310 L/min'),
  ((SELECT id FROM wards WHERE code = 'W03'), CURRENT_DATE, '06:00–09:00', '06:18–09:00', 1.9, 'Delayed',  'Daily', '260 L/min'),
  ((SELECT id FROM wards WHERE code = 'W05'), CURRENT_DATE, '06:00–10:00', '06:00–10:00', 2.8, 'On Time',  'Daily', '315 L/min'),
  ((SELECT id FROM wards WHERE code = 'W12'), CURRENT_DATE, '07:00–09:00', '07:00–09:00', 2.9, 'On Time',  'Daily', '325 L/min')
ON CONFLICT (ward_id, supply_date) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Outage notices
-- ----------------------------------------------------------------------------
INSERT INTO outage_notices
  (code, ward_id, zone_id, reason, outage_type, start_time,
   estimated_restoration, restored_at, status, affected_population,
   tankers_dispatched, alternative_arrangements, created_by)
VALUES
  ('OUT-2024-089',
   (SELECT id FROM wards WHERE code = 'W07'),
   (SELECT id FROM zones WHERE code = 'EAST'),
   'Emergency feeder line valve breakdown', 'Emergency',
   NOW() - INTERVAL '5 hours', NOW() + INTERVAL '3 hours', NULL,
   'Active', 14800, 4, '4 tankers deployed at Chowk, Mill corner, School road',
   (SELECT id FROM users WHERE public_id = 'USR-OFFICER-001')),
  ('OUT-2024-088',
   (SELECT id FROM wards WHERE code = 'W03'),
   (SELECT id FROM zones WHERE code = 'CENTRAL'),
   'Planned reservoir scrubbing & chlorination', 'Scheduled',
   NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 7 hours', NULL,
   'Scheduled', 13400, 2, '2 standby tankers at Maruti temple standpost',
   (SELECT id FROM users WHERE public_id = 'USR-OFFICER-001')),
  ('OUT-2024-087',
   (SELECT id FROM wards WHERE code = 'W06'),
   (SELECT id FROM zones WHERE code = 'SOUTH'),
   'Distribution ring main joint replacement', 'Emergency',
   NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '6 hours',
   NOW() - INTERVAL '2 days' + INTERVAL '6 hours',
   'Resolved', 17200, 3, '3 tankers served Laxmipuri during shutdown',
   (SELECT id FROM users WHERE public_id = 'USR-002'))
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Maintenance schedules
-- ----------------------------------------------------------------------------
INSERT INTO maintenance_schedules
  (code, title, task_type, facility, ward_id, scheduled_date, status,
   priority, assigned_team, notes, created_by)
VALUES
  ('MNT-091', 'Main pump station overhaul - Kasba Bawada', 'Preventive',
   'Kasba Bawada Pump Station',
   (SELECT id FROM wards WHERE code = 'W07'),
   CURRENT_DATE, 'In Progress', 'High', 'Unit A - Mechanical',
   'Bearing replacement on pump P2.',
   (SELECT id FROM users WHERE public_id = 'USR-002')),
  ('MNT-092', 'Valve chamber cleaning & greasing', 'Preventive', NULL,
   (SELECT id FROM wards WHERE code = 'W01'),
   CURRENT_DATE + 1, 'Scheduled', 'Medium', 'Unit B - Pipeline', NULL,
   (SELECT id FROM users WHERE public_id = 'USR-OFFICER-001')),
  ('MNT-093', 'Telemetry sensor calibration', 'Inspection', 'Rankala ESR',
   (SELECT id FROM wards WHERE code = 'W12'),
   CURRENT_DATE + 2, 'Scheduled', 'Low', 'SCADA Automation', NULL,
   (SELECT id FROM users WHERE public_id = 'USR-OFFICER-001')),
  ('MNT-094', 'Booster pump impellor replacement', 'Corrective',
   'Rajarampuri Booster Station',
   (SELECT id FROM wards WHERE code = 'W04'),
   CURRENT_DATE - 1, 'Completed', 'Critical', 'Emergency Response',
   'Completed ahead of schedule; pressure normalized.',
   (SELECT id FROM users WHERE public_id = 'USR-003'))
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Billing records
-- ----------------------------------------------------------------------------
INSERT INTO billing_records
  (bill_number, connection_id, consumer_number, period, bill_date, due_date,
   amount, consumption_kl, status, paid_at, transaction_id)
VALUES
  ('BILL-SEP-26',
   (SELECT id FROM water_connections WHERE consumer_number = 'KMC-CON-90214'),
   'KMC-CON-90214', 'August 2026', '2026-09-01', '2026-09-25', 420.00, 14.5, 'Unpaid', NULL, NULL),
  ('BILL-AUG-26',
   (SELECT id FROM water_connections WHERE consumer_number = 'KMC-CON-90214'),
   'KMC-CON-90214', 'July 2026', '2026-08-01', '2026-08-25', 390.00, 13.8, 'Paid',
   '2026-08-20 10:15:00+05:30', 'TXN-984210'),
  ('BILL-JUL-26',
   (SELECT id FROM water_connections WHERE consumer_number = 'KMC-CON-90214'),
   'KMC-CON-90214', 'June 2026', '2026-07-01', '2026-07-25', 440.00, 15.2, 'Paid',
   '2026-07-22 11:02:00+05:30', 'TXN-981144'),
  ('BILL-SEP-88412',
   (SELECT id FROM water_connections WHERE consumer_number = 'KMC-CON-88412'),
   'KMC-CON-88412', 'August 2026', '2026-09-01', '2026-09-25', 1850.00, 42.0, 'Overdue', NULL, NULL)
ON CONFLICT (bill_number) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Consumption readings (Sunita Patil connection — powers usage charts)
-- ----------------------------------------------------------------------------
INSERT INTO consumption_readings (connection_id, month, period, usage_kl, cost)
VALUES
  ((SELECT id FROM water_connections WHERE consumer_number = 'KMC-CON-90214'), 'Apr', 'April 2026',   12.4, 360.00),
  ((SELECT id FROM water_connections WHERE consumer_number = 'KMC-CON-90214'), 'May', 'May 2026',      15.8, 460.00),
  ((SELECT id FROM water_connections WHERE consumer_number = 'KMC-CON-90214'), 'Jun', 'June 2026',     15.2, 440.00),
  ((SELECT id FROM water_connections WHERE consumer_number = 'KMC-CON-90214'), 'Jul', 'July 2026',     13.8, 390.00),
  ((SELECT id FROM water_connections WHERE consumer_number = 'KMC-CON-90214'), 'Aug', 'August 2026',   14.5, 420.00),
  ((SELECT id FROM water_connections WHERE consumer_number = 'KMC-CON-90214'), 'Sep', 'September 2026', 3.2,  95.00)
ON CONFLICT (connection_id, period) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Tanker request (emergency queue)
-- ----------------------------------------------------------------------------
INSERT INTO tanker_requests
  (code, citizen_name, phone, user_id, ward_id, address, capacity_kl,
   status, vehicle_number, driver_name, requested_at)
VALUES
  ('SR-2024-0441', 'Prakash Mane', '9890123456',
   (SELECT id FROM users WHERE public_id = 'CIT-78196'),
   (SELECT id FROM wards WHERE code = 'W07'),
   'Plot 14, Kasba Bawada', 5.00, 'En Route', 'MH-09-T-4521', 'Ravi Kamble',
   NOW() - INTERVAL '4 hours')
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Service requests
-- ----------------------------------------------------------------------------
INSERT INTO service_requests
  (code, citizen_name, phone, ward_id, address, service_type, status,
   vehicle_number, driver_name, notes, requested_at)
VALUES
  ('SRQ-883', 'Prakash Mane', '9890123456',
   (SELECT id FROM wards WHERE code = 'W07'),
   'Plot 14, Kasba Bawada', 'Tanker Request', 'En Route',
   'MH-09-T-4521', 'Ravi Kamble', NULL, NOW() - INTERVAL '4 hours'),
  ('SRQ-882', 'Anand Kadam', '9765432100',
   (SELECT id FROM wards WHERE code = 'W04'),
   'Lane 3, Bungalow 5, Rajarampuri', 'Pressure Check', 'Assigned',
   NULL, NULL, NULL, NOW() - INTERVAL '1 day'),
  ('SRQ-881', 'Shalini Joshi', '9422331122',
   (SELECT id FROM wards WHERE code = 'W01'),
   'Near Vithal Temple, Shivaji Peth', 'Water Quality Testing', 'Completed',
   NULL, NULL, 'Potability verified. Residual chlorine 0.4 ppm.',
   NOW() - INTERVAL '3 days')
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- NRW zone accounting (September 2026; nrw_volume/% are generated columns)
-- ----------------------------------------------------------------------------
INSERT INTO nrw_zone_accounting
  (zone_id, period_month, input_volume_kl, billed_volume_kl, target_percentage, trend)
VALUES
  ((SELECT id FROM zones WHERE code = 'EAST'),    'September 2026', 1250.00,  880.00, 15.0, '+1.2%'),
  ((SELECT id FROM zones WHERE code = 'CENTRAL'), 'September 2026', 1640.00, 1290.00, 15.0, '-0.8%'),
  ((SELECT id FROM zones WHERE code = 'NORTH'),   'September 2026',  980.00,  820.00, 15.0, '-1.4%'),
  ((SELECT id FROM zones WHERE code = 'SOUTH'),   'September 2026',  820.00,  660.00, 15.0, '+0.4%'),
  ((SELECT id FROM zones WHERE code = 'WEST'),    'September 2026',  710.00,  590.00, 15.0, '-0.2%')
ON CONFLICT (zone_id, period_month) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Leakage incidents
-- ----------------------------------------------------------------------------
INSERT INTO leakage_incidents
  (code, sensor_id, location, ward_id, dma_zone, detected_at,
   estimated_loss_lps, severity, status, notes)
VALUES
  ('LK-2026-042', 'ACS-BW-04', 'Kasba Bawada Main Chowk',
   (SELECT id FROM wards WHERE code = 'W07'), 'DMA-04',
   NOW() - INTERVAL '5 hours', 18.50, 'Critical', 'Assigned',
   'Linked to complaint CMP-2024-0891.'),
  ('LK-2026-041', 'ACS-SH-02', 'Shahupuri 2nd Cross',
   (SELECT id FROM wards WHERE code = 'W02'), 'DMA-02',
   NOW() - INTERVAL '1 day', 6.20, 'Moderate', 'Investigating', NULL),
  ('LK-2026-040', 'ACS-RK-07', 'Rankala Lake Road',
   (SELECT id FROM wards WHERE code = 'W12'), 'DMA-07',
   NOW() - INTERVAL '4 days', 12.00, 'Severe', 'Repaired',
   'Clamp repair completed; pressure normalized.')
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Notifications: 4 alerts (/alerts) + 2 notices (/notices)
-- ----------------------------------------------------------------------------
INSERT INTO notifications
  (code, title, body, severity, kind, category, priority, target_wards, sent_by, sent_at)
VALUES
  ('ALR-01', 'Emergency Water Outage',
   'Due to a major pipeline burst on Shahupuri Ring Road, water supply to Wards 10–14 is suspended until further notice. Emergency tankers deployed.',
   'critical', 'alert', 'Emergency', 'High', ARRAY['W07', 'W02'],
   (SELECT id FROM users WHERE public_id = 'USR-OFFICER-001'), NOW() - INTERVAL '3 hours'),
  ('ALR-02', 'Planned Maintenance — Sept 12',
   'Water supply to Ward 12 (Rankala zone) will be interrupted from 6 AM to 2 PM for annual pipeline maintenance.',
   'warning', 'alert', 'Maintenance', 'Normal', ARRAY['W12'],
   (SELECT id FROM users WHERE public_id = 'USR-OFFICER-001'), NOW() - INTERVAL '1 day'),
  ('ALR-03', 'Water Quality Advisory',
   'As a precaution, please boil drinking water before consumption until further advisories are lifted.',
   'info', 'alert', 'General', 'Normal', ARRAY['ALL'],
   (SELECT id FROM users WHERE public_id = 'USR-004'), NOW() - INTERVAL '4 days'),
  ('ALR-04', 'Supply Restored — Laxmipuri',
   'Water supply has been restored to Laxmipuri after repairs to the Rajarampuri distribution main were completed ahead of schedule.',
   'success', 'alert', 'General', 'Normal', ARRAY['W06'],
   (SELECT id FROM users WHERE public_id = 'USR-003'), NOW() - INTERVAL '5 days'),
  ('NOT-01', 'Annual Water Tariff Revision Policy 2026-27',
   'Kolhapur Municipal Corporation has published the revised domestic and commercial water slab schedules effective October 1.',
   'info', 'notice', 'Tariff', 'Normal', ARRAY['ALL'],
   (SELECT id FROM users WHERE public_id = 'USR-OFFICER-001'), NOW() - INTERVAL '11 days'),
  ('NOT-02', 'Mandatory Rainwater Harvesting for Properties > 2000 sq ft',
   'Citizens are requested to submit rainwater harvesting compliance certificates before 31st October to avail 5% rebate.',
   'warning', 'notice', 'General', 'High', ARRAY['ALL'],
   (SELECT id FROM users WHERE public_id = 'USR-OFFICER-001'), NOW() - INTERVAL '18 days')
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Audit logs
-- ----------------------------------------------------------------------------
INSERT INTO audit_logs
  (code, actor_id, actor_name, actor_role, action, module, target,
   ip_address, severity, details, created_at)
VALUES
  ('LOG-10441',
   (SELECT id FROM users WHERE public_id = 'USR-OFFICER-001'),
   'Suresh Patil', 'Admin', 'OUTAGE_CREATED', 'Outage Mgmt',
   'OUT-2024-089 (Kasba Bawada)', '10.0.1.42', 'Info',
   '{"code": "OUT-2024-089"}', NOW() - INTERVAL '3 hours'),
  ('LOG-10440',
   (SELECT id FROM users WHERE public_id = 'USR-002'),
   'Anil Jadhav', 'Engineer', 'MAINTENANCE_UPDATED', 'Maintenance',
   'MNT-091 Status → In Progress', '10.0.1.55', 'Info',
   '{"code": "MNT-091"}', NOW() - INTERVAL '4 hours'),
  ('LOG-10439',
   (SELECT id FROM users WHERE public_id = 'USR-004'),
   'Priya Shinde', 'Supervisor', 'NOTIFICATION_SENT', 'Notifications',
   'Emergency Water Outage (W07, W02)', '10.0.1.33', 'Info',
   '{}', NOW() - INTERVAL '5 hours'),
  ('LOG-10438',
   (SELECT id FROM users WHERE public_id = 'USR-OFFICER-001'),
   'Suresh Patil', 'Admin', 'USER_ROLE_CHANGED', 'Admin',
   'USR-009 Sachin Gaikwad: Operator → Active', '10.0.1.42', 'Warning',
   '{}', NOW() - INTERVAL '1 day'),
  ('LOG-10437',
   (SELECT id FROM users WHERE public_id = 'USR-002'),
   'Anil Jadhav', 'Engineer', 'COMPLAINT_RESOLVED', 'Complaints',
   'CMP-2024-0887 (Mangalwar Peth — No Supply)', '10.0.1.71', 'Info',
   '{"code": "CMP-2024-0887"}', NOW() - INTERVAL '1 day')
ON CONFLICT (code) DO NOTHING;
