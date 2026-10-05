// JWT auth + role guard.
// Sets BOTH req.user and req.auth (same payload) so existing route files
// from either side of the merge keep working regardless of which
// property name they reference. Clean this up to one name after Thursday.

import type { NextFunction, Request, RequestHandler, Response } from "express"
import jwt from "jsonwebtoken"
import type { UserSession } from "../../../packages/types/src/index"
import { env } from "../config/env"

export type Role = UserSession["user"]["role"]

export const OFFICER_ROLES: Role[] = ["Admin", "Engineer", "Supervisor", "Operator"]

function hasOfficerRole(role: string): role is Role {
  return (OFFICER_ROLES as string[]).includes(role)
}

export interface JwtPayload {
  sub: string
  role: Role
  phone?: string
  consumerId?: string
  ward?: string
  type?: "access" | "refresh"
}

export interface AuthedRequest extends Request {
  user?: JwtPayload
  auth?: JwtPayload
}

function unauthorized(res: Response, message: string): void {
  res.status(401).json({
    success: false,
    error: { message, code: "AUTH_UNAUTHORIZED", status: 401 },
  })
}

function forbidden(res: Response, message: string): void {
  res.status(403).json({
    success: false,
    error: { message, code: "AUTH_FORBIDDEN", status: 403 },
  })
}

function attachUser(req: Request, payload: JwtPayload): void {
  ;(req as AuthedRequest).user = payload
  ;(req as AuthedRequest).auth = payload
}

export function signAccessToken(claims: Omit<JwtPayload, "type">): string {
  return jwt.sign({ ...claims, type: "access" }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions)
}

export function signRefreshToken(claims: Pick<JwtPayload, "sub" | "role">): string {
  return jwt.sign({ ...claims, type: "refresh" }, env.jwtSecret, {
    expiresIn: env.refreshExpiresIn,
  } as jwt.SignOptions)
}

/** Any valid, non-refresh token (officer OR citizen role). */
export function requireToken(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization || ""
  const [scheme, token] = header.split(" ")
  if (scheme !== "Bearer" || !token) {
    unauthorized(res, "Authentication token missing")
    return
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload
    if (payload.type === "refresh") {
      unauthorized(res, "Refresh token cannot access resources")
      return
    }
    attachUser(req, payload)
    next()
  } catch {
    unauthorized(res, "Authentication token invalid or expired")
  }
}

/** Alias — same behavior as requireToken. */
export const authenticate = requireToken

/** Requires any officer-side role (Admin/Engineer/Supervisor/Operator). */
export function requireOfficer(req: Request, res: Response, next: NextFunction): void {
  requireToken(req, res, () => {
    const user = (req as AuthedRequest).user
    if (!user || !hasOfficerRole(user.role)) {
      forbidden(res, "Officer role required")
      return
    }
    next()
  })
}

/** Requires one of the specific roles passed in. */
export function requireRole(...roles: Role[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    requireToken(req, res, () => {
      const user = (req as AuthedRequest).user
      if (!user || !roles.includes(user.role)) {
        forbidden(res, `Requires one of roles: ${roles.join(", ")}`)
        return
      }
      next()
    })
  }
}

/** Alias — same behavior as requireRole. */
export const requireRoles = requireRole
