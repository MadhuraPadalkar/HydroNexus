# HydroNexus Deployment & Infrastructure Architecture

This document specifies the planned full-stack deployment strategy for the HydroNexus Water Management System across edge frontends, application services, managed database persistence, and CDN networking.

---

## 1. Architecture Overview

```
                                  [ Internet / Citizens / Officers ]
                                                  │
                                                  ▼
                                       Cloudflare / Edge CDN
                                     (SSL/TLS Termination, WAF)
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
        [ Officer Portal ]                                                [ Citizen Portal ]
    Vercel / Netlify / Nginx                                          Vercel / Netlify / Nginx
  https://officer.hydronexus.gov.in                                 https://water.hydronexus.gov.in
                 │                                                                 │
                 │              API Calls (CORS Credentialed)                      │
                 └────────────────────────────────┬────────────────────────────────┘
                                                  ▼
                                       [ Backend API Gateway ]
                                         Node / Go / Python
                                    Render / Railway / ECS / VPS
                                  https://api.hydronexus.gov.in
                                                  │
                                                  ▼
                                       [ PostgreSQL Database ]
                                     AWS RDS / Neon / Supabase
```

---

## 2. Target Platforms & Hosting Options

### 2.1 Frontend Portals (`officer-portal`, `citizen-portal`)
- **Primary Option (Serverless Edge)**: [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
  - Pre-configured with single-page app (SPA) rewrites via `vercel.json` and `netlify.toml`.
  - Automatic global asset caching at CDN edge.
- **Self-Hosted Option (Docker + Nginx)**:
  - Docker images built using `infra/docker/Dockerfile` and `infra/docker/nginx.conf`.
  - Serves static bundles with Brotli/Gzip compression, immutable 1-year cache headers for `/assets/`, and revalidation for `index.html`.

### 2.2 Backend Service (`backend/`)
- **Platform**: Render, Railway, AWS ECS (Fargate), or dedicated Linux VPS (Ubuntu 24.04 LTS).
- **Process Manager**: Docker runtime, Systemd, or PM2/Kubernetes.
- **Port**: Default `8000`.

### 2.3 Database Persistence (`infra/database/`)
- **Engine**: PostgreSQL 16+.
- **Managed Providers**: AWS RDS Aurora PostgreSQL, Supabase, Neon, or Railway PostgreSQL.
- **Connection Pooler**: PgBouncer enabled for horizontal scale.

---

## 3. Environment Variables Matrix

### 3.1 Officer Portal
| Variable | Staging Value | Production Value | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | `https://staging-api.hydronexus.gov.in/api/v1` | `https://api.hydronexus.gov.in/api/v1` | Backend API root URL |
| `VITE_USE_MOCKS` | `false` | `false` | Disable mock data mode |

### 3.2 Citizen Portal
| Variable | Staging Value | Production Value | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | `https://staging-api.hydronexus.gov.in/api/v1` | `https://api.hydronexus.gov.in/api/v1` | Backend API root URL |
| `VITE_USE_MOCKS` | `false` | `false` | Disable mock data mode |

### 3.3 Backend Service
| Variable | Example Production Value | Description |
|---|---|---|
| `PORT` | `8000` | HTTP listening port |
| `DATABASE_URL` | `postgres://user:pass@db-prod.internal:5432/hydronexus` | Secured PostgreSQL connection string |
| `JWT_SECRET` | `64-character-cryptographically-random-hex` | Session token signing secret |
| `CORS_ORIGINS` | `https://officer.hydronexus.gov.in,https://water.hydronexus.gov.in` | Whitelisted frontend origins |
| `SMS_GATEWAY_API_KEY` | `prod-sms-provider-key` | SMS gateway for OTP dispatch |

---

## 4. Full-Stack Go-Live Checklist

Follow this checklist once the backend engineering team completes the backend implementation:

- [ ] **1. Database Provisioning**:
  - [ ] Spin up managed PostgreSQL instance.
  - [ ] Run schema creation DDL and migrations from `infra/database/migrations/`.
  - [ ] Run baseline seeds from `infra/database/seeds/` (wards, initial admin officer accounts).

- [ ] **2. Backend Service Deployment**:
  - [ ] Configure production environment secrets (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`).
  - [ ] Deploy backend container to Render/Railway/ECS/VPS.
  - [ ] Verify health check at `https://api.hydronexus.gov.in/health` or `/api/v1/notices`.
  - [ ] Verify CORS headers allow requests from both frontend domains.

- [ ] **3. Frontend Deployment**:
  - [ ] Configure `VITE_API_BASE_URL=https://api.hydronexus.gov.in/api/v1`.
  - [ ] Configure `VITE_USE_MOCKS=false`.
  - [ ] Run `pnpm run build` and deploy `officer-portal` to `https://officer.hydronexus.gov.in`.
  - [ ] Deploy `citizen-portal` to `https://water.hydronexus.gov.in`.
  - [ ] Verify deep-link refresh works without 404s (SPA fallback active).

- [ ] **4. End-to-End Integration Smoke Test**:
  - [ ] Officer Login: test municipal credentials, receive JWT, inspect dashboard KPIs.
  - [ ] Citizen Login: submit phone number, receive OTP, verify session cookie/token.
  - [ ] Grievance lifecycle: citizen files complaint -> officer views in Complaint Management -> updates status -> citizen sees updated status in real-time.
  - [ ] Telemetry feed: verify flood gauge levels and NRW zone calculations render live database records.
