# HydroNexus Backend Service Slot

> **Note for Backend Engineers**: This directory is reserved for the backend service implementation. It is deliberately decoupled from the frontend `pnpm` monorepo workspace to allow the backend engineering team complete flexibility in technology stack selection (e.g. Node.js/Fastify/NestJS, Go, Python/FastAPI, or Java/Spring Boot).

---

## 1. Specification & Contract

All endpoints, payload structures, query parameters, authentication schemas, and error formats must strictly conform to:
- **OpenAPI 3.0 Specification**: [`contracts/openapi.yaml`](file:///contracts/openapi.yaml)
- **API Documentation**: [`docs/api-contract.md`](file:///docs/api-contract.md)
- **Shared TypeScript Definitions**: [`packages/types/src/index.ts`](file:///packages/types/src/index.ts)

---

## 2. Mandatory Requirements

### 2.1 CORS Origins
The backend must permit Cross-Origin Resource Sharing (CORS) with credentials for both frontend applications:
- **Officer Portal**: `http://localhost:5173`
- **Citizen Portal**: `http://localhost:5174`
- Additional staging and production domains specified in `CORS_ORIGINS`.

### 2.2 Standard Response Envelopes
Every endpoint must return responses wrapped in the standard `ApiResponse<T>` or `ApiError` envelope:

**Success**:
```json
{
  "success": true,
  "data": { ... }
}
```

**Error**:
```json
{
  "success": false,
  "error": {
    "message": "Human readable error description",
    "code": "ERROR_CODE_CONSTANT",
    "status": 400,
    "details": {}
  }
}
```

### 2.3 JWT Authentication
- Passwords must be hashed using argon2 or bcrypt with a minimum work factor of 12.
- Session tokens must be signed JWTs containing `sub`, `role`, and `exp`.
- All secured routes must validate the standard `Authorization: Bearer <token>` header.

---

## 3. Environment Configuration

Copy the example configuration to initialize your environment:
```bash
cp .env.example .env
```

| Variable | Description | Example Default |
|---|---|---|
| `PORT` | Listening HTTP port | `8000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:pass@localhost:5432/hydronexus` |
| `JWT_SECRET` | Secret key for signing session tokens | `super-secret-high-entropy-jwt-key` |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins | `http://localhost:5173,http://localhost:5174` |
| `SMS_GATEWAY_API_KEY` | Provider key for citizen OTP delivery | `test-mock-key` |

---

## 4. Suggested Directory Architecture

Whichever backend stack is chosen, please adhere to a clean layered architecture:

```
backend/
├── src/
│   ├── api/             # HTTP route controllers & input validators
│   ├── domain/          # Core business entities & domain services
│   ├── services/        # Application services (auth, complaints, billing, alerts)
│   ├── repositories/    # Database queries and persistence layer
│   ├── middleware/      # Auth guard, CORS, error handling, rate limiting
│   └── config/          # Environment variables and configuration loaders
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── Dockerfile
└── README.md
```
