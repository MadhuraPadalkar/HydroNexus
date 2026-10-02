# HydroNexus Architecture & Monorepo Blueprint

## Overview

HydroNexus is an integrated municipal water management platform built for Kolhapur Municipal Corporation (KMC). It comprises two distinct frontend applications, shared packages, an API contract specification, backend integration slots, and deployment scaffolding.

```
HydroNexus (Monorepo)
├── apps/
│   ├── officer-portal    (Port 5173 - React 19 + Vite + Tailwind v4)
│   └── citizen-portal    (Port 5174 - React 19 + Vite + Tailwind v4)
├── packages/
│   ├── config            (Tailwind v4 tokens & tsconfig.base.json)
│   ├── types             (Domain entities, DTOs, API wrappers)
│   ├── api-client        (Typed HTTP client, mock/real toggle)
│   └── ui                (Shared components duplicated across apps)
├── contracts/
│   └── openapi.yaml      (OpenAPI 3.1 contract)
├── backend/              (Backend placeholder slot & environment config)
├── infra/
│   ├── docker/           (Multi-stage Dockerfile & Nginx SPA config)
│   ├── database/         (Database schema/migrations/seeds instructions)
│   └── deploy/           (Deployment guides per target platform)
└── docs/                 (Architecture, API Contract, Deployment, Assumptions, Git)
```

---

## Screen Inventory & Feature Module Mapping

### 1. Officer Portal (`apps/officer-portal`)

Target port: `5173`. Internal administrative dashboard for municipal water officers, engineers, and KMC system administrators.

| # | Screen Name | Original File | Assigned Feature Module | Route | Description |
|---|---|---|---|---|---|
| 1 | Dashboard | `Dashboard.tsx` | `features/dashboard` | `/` | Daily supply overview, active complaints KPI, NRW %, ward supply statuses |
| 2 | Supply Schedule | `SupplySchedule.tsx` | `features/supply` | `/supply/schedule` | Ward-wise water release timing, valve schedules, flow rates |
| 3 | Outage Management | `OutageManagement.tsx` | `features/supply` | `/supply/outages` | Planned and emergency outage tracking, affected ward rosters |
| 4 | Maintenance Schedule | `MaintenanceSchedule.tsx` | `features/supply` | `/supply/maintenance` | Preventive and corrective maintenance work orders |
| 5 | Complaint Management | `ComplaintManagement.tsx` | `features/complaints` | `/complaints` | Citizen ticket triage, escalation, officer assignment, resolution |
| 6 | GIS Water Network | `GISNetwork.tsx` | `features/gis` | `/gis` | Interactive pipeline topology, pressure zones, valve markers |
| 7 | NRW Monitoring | `NRWMonitoring.tsx` | `features/nrw` | `/nrw/monitoring` | Non-revenue water audits, system input volume vs billed volume |
| 8 | Zone Water Accounting | `ZoneWaterAccounting.tsx` | `features/nrw` | `/nrw/zone-accounting` | Bulk meter reconciliation per district metered area (DMA) |
| 9 | Leakage Analysis | `LeakageAnalysis.tsx` | `features/nrw` | `/nrw/leakage` | Acoustic and pressure drop sensor leak detection reports |
| 10 | Multi-Ward Comparison | `MultiWardComparison.tsx` | `features/nrw` | `/nrw/ward-comparison` | Comparative metrics across 17 KMC municipal wards |
| 11 | Citizen Management | `CitizenManagement.tsx` | `features/citizens` | `/citizens/directory` | Citizen directory, property IDs, consumer ledger lookup |
| 12 | Ward & Zone Management | `WardZoneManagement.tsx` | `features/citizens` | `/citizens/wards` | Ward boundaries, DMA assignments, population densities |
| 13 | Water Connections | `WaterConnections.tsx` | `features/citizens` | `/citizens/connections` | New tap applications, sanction approvals, meter installations |
| 14 | Service Requests | `ServiceRequests.tsx` | `features/citizens` | `/citizens/service-requests` | Emergency tanker dispatch requests and pipeline cleaning |
| 15 | Notification Composer | `NotificationComposer.tsx` | `features/notifications` | `/notifications/composer` | SMS/App broadcast builder targeting specific wards or zones |
| 16 | Notification History | `NotificationHistory.tsx` | `features/notifications` | `/notifications/history` | Log of sent public announcements and emergency alerts |
| 17 | Analytics Overview | `AnalyticsOverview.tsx` | `features/analytics` | `/analytics` | Multi-month trends for consumption, revenue, and water balance |
| 18 | Officer Profile | `Profile.tsx` | `features/profile` | `/profile` | Logged-in officer credentials, assigned jurisdiction, activity |
| 19 | Flood Monitoring | `FloodMonitoring.tsx` | `features/emergency` | `/emergency/flood` | Panchganga river water level sensors, rain gauges, high-risk wards |
| 20 | Officer User Management | `OfficerUserManagement.tsx` | `features/admin` | `/admin/users` | Officer account creation, role assignments, department mappings |
| 21 | Role Permissions | `RolePermissions.tsx` | `features/admin` | `/admin/roles` | RBAC matrix configuration for Admin, Engineer, Supervisor, Operator |
| 22 | System Settings | `SystemSettings.tsx` | `features/admin` | `/admin/settings` | Thresholds for NRW alarms, flood stage warnings, SLA timings |
| 23 | Audit Logs | `AuditLogs.tsx` | `features/admin` | `/admin/audit-logs` | Tamper-evident chronological audit trail of all officer operations |
| 24 | Login | *New* | `features/auth` | `/login` | Officer authentication (email/password/MFA) |
| 25 | Not Found | *New* | `features/shared` | `*` | 404 fallback page matching KMC design theme |

---

### 2. Citizen Portal (`apps/citizen-portal`)

Target port: `5174`. Mobile-first, responsive citizen engagement portal for Kolhapur residents.

| # | Screen Name | Original Inline Function | Assigned Feature Module | Route | Description |
|---|---|---|---|---|---|
| 1 | Splash | `SplashScreen` | `features/auth` | `/welcome` | Brand splash and introduction screen |
| 2 | Citizen Login | `LoginScreen` | `features/auth` | `/login` | Phone number or Consumer ID login prompt |
| 3 | OTP Verification | `OTPScreen` | `features/auth` | `/verify-otp` | 4-digit SMS OTP verification and resend timer |
| 4 | Home Dashboard | `HomeScreen` | `features/home` | `/` | Water quota gauge, daily supply status, quick actions, alerts |
| 5 | Report Issue | `ReportScreen` | `features/complaints` | `/report` | Geo-tagged issue reporting (leaks, dirty water, pressure, burst) |
| 6 | My Complaints | `ComplaintsScreen` | `features/complaints` | `/complaints` | Status list of filed grievances (Open, In Progress, Resolved) |
| 7 | Complaint Detail | `ComplaintDetailScreen` | `features/complaints` | `/complaints/:id` | Resolution timeline, officer notes, messaging thread |
| 8 | Bills & Usage | `BillingScreen` | `features/billing` | `/billing` | Current cycle bill, payment gateway integration, usage bar chart |
| 9 | Public Alerts | `AlertsScreen` | `features/alerts` | `/alerts` | Critical notices, maintenance warnings, water quality alerts |
| 10 | Municipal Noticeboard | `NoticeBoardScreen` | `features/alerts` | `/noticeboard` | General municipal notices, water tariff updates, ward circulars |
| 11 | Water Outage Map | `MapScreen` | `features/map` | `/map` | Ward map showing live status pins (Normal, Delayed, Disrupted) |
| 12 | Citizen Profile | `ProfileScreen` | `features/profile` | `/profile` | Consumer info, connection details, meter number, language switch |
| 13 | Supply Status | `SupplyStatusScreen` | `features/supply` | `/supply-status` | Ward-specific water release schedule and reservoir levels |
| 14 | Water Services | `WaterServicesScreen` | `features/services` | `/services` | Service directory (new tap, meter check, tanker, quality test) |
| 15 | Tanker Request | `TankerRequestScreen` | `features/services` | `/services/tanker-request` | Emergency water tanker booking with auto-filled delivery data |
| 16 | Water Conservation | `ConservationScreen` | `features/conservation` | `/conservation` | Rainwater harvesting guides, daily conservation tips |
| 17 | FAQs & Support | `FaqScreen` | `features/help` | `/faq` | Categorized water utility FAQs and grievance redressal helpline |
| 18 | Not Found | *New* | `features/shared` | `*` | 404 fallback page matching citizen portal UI |

---

## Architectural Principles

1. **Standalone & Monorepo Compatible**: Uses `pnpm` workspaces for local package linking via `workspace:*`. Strict TypeScript configuration shared via `@water/config`.
2. **Decoupled API Client**: All screens communicate through `@water/api-client`. Toggle between complete mock datasets and live API via `VITE_USE_MOCKS=true/false` with zero changes to presentation components.
3. **Figma Fidelity**: UI components maintain exact Figma colors, tokens, Material Symbols, typography, and layout.
4. **Independent Deployment**: Each app has its own Vite build, Dockerfile configuration, Vercel SPA routing, and Netlify rewrites.
