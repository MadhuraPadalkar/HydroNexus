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
| `GET` | `/complaints` | Bearer | List complaints (supports `?filter=Leakage` or status) |
| `POST` | `/complaints` | Bearer | Submit a new grievance |
| `PATCH` | `/complaints/{id}` | Bearer | Update complaint status, priority, or assigned officer |

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
| `GET` | `/supply/schedule` | Bearer | Ward-wise morning/evening supply schedules |
| `GET` | `/supply/outages` | Bearer | Active and upcoming emergency/planned outages |
| `GET` | `/supply/maintenance` | Bearer | Infrastructure maintenance schedule |

---

## 5. Non-Revenue Water (NRW) & Leakage Telemetry

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/nrw/metrics` | Bearer | DMA zone inflow vs billed consumption and NRW % |
| `GET` | `/nrw/leakages` | Bearer | Acoustic and pressure telemetry incident list |

---

## 6. Citizen Management & Services

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/citizens` | Bearer | Search consumer directory (`?search=9876543210`) |
| `GET` | `/citizens/applications`| Bearer | New water connection applications & approval status |
| `GET` | `/citizens/requests` | Bearer | Special tanker and meter calibration service requests |

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
| `GET` | `/alerts` | Bearer | Active emergency alerts and citizen advisories |
| `POST`| `/alerts` | Bearer | Officer alert broadcast to targeted wards |
| `GET` | `/notices` | None/Bearer | Public circulars and maintenance notices |

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
| `GET` | `/admin/officers` | Bearer | Directory of municipal officers and roles |
| `GET` | `/admin/permissions`| Bearer | RBAC capability matrix per role |
| `GET` | `/admin/settings` | Bearer | Global system parameters and sensor thresholds |
| `GET` | `/admin/audit-logs` | Bearer | Security audit trail of operational actions |
