// One-line audit helper for routes: derives actor/role/ip from the request.

// Calls auditRepository — routes must never touch src/data/store.ts.

import type { Request } from "express"

import type { AuditLog } from "@water/types"

import type { AuthedRequest } from "../domain"

import { auditRepository } from "../repositories/auditRepository"

export function audit(
  req: Request,

  entry: {
    action: string

    module: string

    target: string

    severity?: AuditLog["severity"]

    actorOverride?: string

    roleOverride?: string
  },
): AuditLog {
  const user = (req as Partial<AuthedRequest>).user

  return auditRepository.record({
    actor: entry.actorOverride || user?.sub || "anonymous",

    role: entry.roleOverride || user?.role || "Unknown",

    action: entry.action,

    module: entry.module,

    target: entry.target,

    ip: req.ip || "unknown",

    severity: entry.severity,
  })
}
