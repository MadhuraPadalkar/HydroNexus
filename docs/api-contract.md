# HydroNexus Water Management API Contract

This document provides a human-readable specification of the REST API implemented by the backend and consumed by `@water/api-client`. The formal machine-readable specification is located at [openapi.yaml](file:///contracts/openapi.yaml).

---

## 1. Global Conventions

### 1.1 Base URLs
- **Local Development**: `http://localhost:8000/api/v1`
- **Staging / QA**: `https://staging-api.water.municipality.gov.in/api/v1`
- **Production**: `https://api.water.municipality.gov.in/api/v1`

### 1.2 Authentication
All protected endpoints require a standard HTTP `Authorization` header with a Bearer JWT:
```http
Authorization: Bearer <jwt-token>
```
Tokens are generated via `/auth/officer/login` or `/auth/citizen/otp/verify`.

### 1.3 Standard Response Format
All successful responses conform to the `ApiResponse<T>` envelope:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 120,
    "totalPages": 6
  }
}
```

### 1.4 Standard Error Format
When an error occurs, the API returns the appropriate HTTP status code (400, 401, 403, 404, 422, 500) and an `ApiError` envelope:
```json
{
  "success": false,
  "error": {
    "message": "Resource not found or access denied",
    "code": "RESOURCE_NOT_FOUND",
    "status": 404,
    "details": {
      "field": "id",
      "reason": "Complaint CMP-2024-9999 does not exist"
    }
  }
}
```

---

## 2. Authentication Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/officer/login` | None | Officer email/password login |
| `POST` | `/auth/citizen/otp/request` | None | Send SMS OTP to citizen mobile number |
| `POST` | `/auth/citizen/otp/verify` | None | Verify SMS OTP and obtain citizen JWT |

### `POST /auth/officer/login`
- **Request Body**:
  ```json
  {
    "email": "suresh.patil@kmcwater.gov.in",
    "password": "Password123!"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "user": {
        "id": "USR-OFFICER-001",
        "name": "Suresh Patil",
        "role": "Admin",
        "email": "suresh.patil@kmcwater.gov.in",
        "phone": "+91 98220 12345",
        "department": "Water Supply Operations",
        "zone": "Central Zone"
      }
    }
  }
  ```

---

## 3. Complaints & Grievances

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/complaints` | Bearer (any officer) | List complaints (supports `?filter=Leakage` or status) |
| `POST` | `/complaints` | Bearer (citizen-side; Person 2) | Submit a new grievance — not registered by the officer backend |
| `GET` | `/complaints/{id}` | Bearer (any officer) | Complaint detail |
| `PATCH` | `/complaints/{id}` | Bearer (Admin, Supervisor, Engineer) | Update complaint status, priority, or assigned officer |
| `PATCH` | `/complaints/{id}/status` | Bearer (Admin, Supervisor, Engineer) | Status-only alias used by `@water/api-client` |
| `POST` | `/complaints/{id}/assign` | Bearer (Admin, Supervisor) | Assign to engineer (+ work order) |

### `POST /complaints`
- **Request Body**:
  ```json
  {
    "type": "Leakage",
    "ward": "Ward 12 - Rankala",
    "address": "Opp. Rankala Gate 3",
    "description": "High pressure pipe burst flooding roadway",
    "priority": "Critical"
  }
  ```

---

## 4. Water Supply & Operations

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/supply/schedule` | Bearer (any officer) | Ward-wise morning/evening supply schedules |
| `PUT` | `/supply/schedule` | Bearer (Admin, Supervisor, Engineer) | Upsert ward schedule row |
| `GET` | `/supply/outages` | Bearer (any officer) | Active and upcoming emergency/planned outages |
| `POST` | `/supply/outages` | Bearer (Admin, Supervisor, Engineer) | Create outage notice (`autoNotify` broadcasts) |
| `PATCH` | `/supply/outages/{id}` | Bearer (Admin, Supervisor, Engineer) | Update outage |
| `GET` | `/supply/maintenance` | Bearer (any officer) | Infrastructure maintenance schedule |
| `POST` | `/supply/maintenance` | Bearer (Admin, Supervisor, Engineer) | Create maintenance activity |
| `PATCH` | `/supply/maintenance/{id}` | Bearer (Admin, Supervisor, Engineer) | Update maintenance activity |

---

## 5. Non-Revenue Water (NRW) & Leakage Telemetry

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/nrw/metrics` | Bearer (any officer) | DMA zone inflow vs billed consumption and NRW % (derived on read) |
| `GET` | `/nrw/summary` | Bearer (any officer) | Computed city-wide NRW |
| `PUT` | `/nrw/zones/{zone}` | Bearer (Admin, Supervisor, Engineer) | Update zone volumes; derived fields recomputed |
| `GET` | `/nrw/leakages` | Bearer (any officer) | Acoustic and pressure telemetry incident list |
| `GET` | `/nrw/leakage-analysis` | Bearer (any officer) | Frequency trend + high-risk zones |
| `POST` | `/nrw/compare` | Bearer (any officer) | 2–4 unique ward comparison |

---

## 6. Citizen Management & Services

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/citizens` | Bearer (any officer) | Search consumer directory (`?search=9876543210`) |
| `GET` | `/citizens/{id}` | Bearer (any officer) | Citizen detail |
| `GET` | `/citizens/applications`| Bearer (any officer) | New water connection applications & approval status |
| `PATCH` | `/citizens/applications/{id}` | Bearer (Admin, Supervisor) | Approve/reject (`approve`/`reject`/`inspection`) |
| `GET` | `/citizens/requests` | Bearer (any officer) | Special tanker and meter calibration service requests |
| `PATCH` | `/citizens/requests/{id}` | Bearer (Admin, Supervisor, Operator) | Dispatch/deliver queue |
| `GET` | `/wards`, `/wards/{id}` | Bearer (any officer) | Ward list/detail |
| `PATCH` | `/wards/{id}` | Bearer (Admin) | Ward metadata |

---

## 7. Billing & Tariffs

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/billing/bills` | Bearer | Utility bills and payment history for consumer |
| `GET` | `/billing/usage` | Bearer | Monthly consumption data points (KL / Litres) |
| `POST`| `/billing/pay` | Bearer | Submit utility bill payment (`{ "billId": "BIL-001" }`) |

---

## 8. Emergency Alerts & Notices

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/alerts` | Bearer (any officer OR citizen) | Active emergency alerts and citizen advisories |
| `POST`| `/alerts` | Bearer (Admin, Supervisor) | Officer alert broadcast to targeted wards |
| `GET` | `/notices` | None (public) | Public circulars and maintenance notices |

---

## 9. Flood Monitoring & Gauges

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/flood/gauges` | Bearer | River telemetry levels, danger thresholds, status |
| `GET` | `/flood/rainfall` | Bearer | Rainfall telemetry (mm) and meteorological forecasts |

---

## 10. Administration & Security

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/admin/officers` | Bearer (Admin, Supervisor) | Directory of municipal officers and roles |
| `POST` | `/admin/officers` | Bearer (Admin) | Create officer (seed password `Password123!`) |
| `PATCH` | `/admin/officers/{id}` | Bearer (Admin) | Update role/department/zone/status; self-deactivation rejected (403) |
| `GET` | `/admin/permissions`| Bearer (Admin, Supervisor) | RBAC capability matrix per role |
| `PUT` | `/admin/permissions/{role}` | Bearer (Admin) | Replace role matrix (404 for unknown role) |
| `GET` | `/admin/settings` | Bearer (any officer) | Global system parameters and sensor thresholds |
| `PUT` | `/admin/settings` | Bearer (Admin) | Partial update; returns full settings |
| `GET` | `/admin/audit-logs` | Bearer (Admin, Supervisor) | Audit trail, newest first; `?user=&module=&severity=&q=` filters |

### `POST /admin/officers`
- **Request Body**:
  ```json
  {
    "name": "Tanker Ops Operator",
    "email": "tanker.ops@kmcwater.gov.in",
    "phone": "+91 9000000001",
    "role": "Operator",
    "department": "Tanker Operations",
    "zone": "West Zone"
  }
  ```
- **Response**: `201` with the created `OfficerUser`. Duplicate email -> `409`. Deactivated officers cannot log in (`403` on login).

---

## 11. Officer Operations (extensions)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/complaints/{id}` | Bearer (any officer) | Complaint detail |
| `PATCH` | `/complaints/{id}` | Bearer (Admin, Supervisor, Engineer) | Update status/priority/assignment |
| `PATCH` | `/complaints/{id}/status` | Bearer (Admin, Supervisor, Engineer) | Status-only alias used by `@water/api-client` |
| `POST` | `/complaints/{id}/assign` | Bearer (Admin, Supervisor) | Assign to engineer (+ work order) |
| `GET`/`POST` | `/work-orders`, `GET`/`PATCH` `/work-orders/{id}` | Bearer (reads: any officer; writes: Admin, Supervisor, Engineer) | Work order tracking |
| `PUT` | `/supply/schedule` | Bearer (Admin, Supervisor, Engineer) | Upsert ward schedule row |
| `POST` | `/supply/outages` | Bearer (Admin, Supervisor, Engineer) | Create outage; `autoNotify` broadcasts a citizen alert |
| `PATCH` | `/supply/outages/{id}` | Bearer (Admin, Supervisor, Engineer) | Update outage |
| `POST`/`PATCH` | `/supply/maintenance`, `/supply/maintenance/{id}` | Bearer (Admin, Supervisor, Engineer) | Maintenance activities |
| `GET` | `/nrw/summary` | Bearer (any officer) | Computed city-wide NRW |
| `GET` | `/nrw/leakage-analysis` | Bearer (any officer) | Zone trend + high-risk zones |
| `POST` | `/nrw/compare` | Bearer (any officer) | 2–4 unique wards; duplicates -> `422` |
| `PUT` | `/nrw/zones/{zone}` | Bearer (Admin, Supervisor, Engineer) | Update input/billed volumes (`billed <= input`, both `>= 0`); derived fields recomputed |
| `GET` | `/citizens/{id}` | Bearer (any officer) | Citizen detail (id or consumer number) |
| `PATCH` | `/citizens/applications/{id}` | Bearer (Admin, Supervisor) | `{ "action": "approve" \| "reject" \| "inspection" }` |
| `PATCH` | `/citizens/requests/{id}` | Bearer (Admin, Supervisor, Operator) | Dispatch/deliver tanker queue |
| `GET` | `/wards`, `/wards/{id}` | Bearer (any officer) | Ward list/detail |
| `PATCH` | `/wards/{id}` | Bearer (Admin) | Ward metadata |
| `GET` | `/dashboard/summary`, `/dashboard/water-status` | Bearer (any officer) | KPIs + water status |
| `GET` | `/analytics/supply`, `/analytics/complaints`, `/analytics/nrw`, `/analytics/consumption`, `/analytics/ward-comparison` | Bearer (any officer) | Trend analytics |
| `GET` | `/alerts` | Bearer (any officer OR citizen) | Alert history (`?severity=`) |
| `POST` | `/alerts` | Bearer (Admin, Supervisor) | Broadcast (`severity` or `type: Supply/Shortage/Flood/General`) |
| `GET` | `/notices` | None | Public circulars |
| `GET` | `/flood/gauges`, `/flood/rainfall` | Bearer (any officer) | Read-only telemetry |

**Role summary**: Operator is read-only except service-request dispatch/deliver. Engineer writes supply/complaints/work-orders/NRW but not admin, wards, alerts, or connection decisions. Supervisor does everything except officer/permission/settings/ward administration. Admin has full access.

**Error responses**: `401` missing/invalid token (`AUTH_UNAUTHORIZED`), `403` valid token with insufficient role (`AUTH_FORBIDDEN`), `404` unknown id (`RESOURCE_NOT_FOUND`), `422` schema/date/rule violation (`VALIDATION_ERROR`). Malformed JSON bodies return `400 BAD_REQUEST`. Error bodies carry `message`/`code`/`status`/`details` at both the top level and under `error`, because the existing client reads `json.message`.

**Audit trail**: every mutation plus login success/failure appends an `AuditLog` (`LOG-<n>`, newest first) with module names Auth, Admin, Outage Mgmt, Maintenance, Supply, Complaints, Connections, Notifications, NRW, Service Requests, Settings.

---

## 12. Known drift (officer backend vs packages/types)

- Response bodies follow `packages/types` (what officer-portal renders). `contracts/openapi.yaml` predates several entities and uses different field names for supply/NRW/citizen records — the backend serves the `packages/types` shapes.
- **Complaint status superset**: besides the `packages/types` statuses (`Open`, `In Progress`, `Resolved`), `PATCH /complaints/{id}` and `PATCH /complaints/{id}/status` also accept `Pending` (stored as `Open`) and `Escalated`, matching the citizen-side vocabulary. Person 2's citizen-side reads these statuses.
- `WorkOrder` and `Ward` were added to `packages/types` (additive only; nothing existing changed) so both portals and the backend share them.
