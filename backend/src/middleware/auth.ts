import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import type { UserSession } from "../../../packages/types/src/index"
import { env } from "../config/env"

/** Roles come straight from @water/types — never re-listed here. */
export type Role = UserSession["user"]["role"]

export interface JwtClaims {
  sub: string
  role: Role
  phone?: string
  consumerId?: string
  ward?: string
  type?: "access" | "refresh"
}

export interface AuthedRequest extends Request {
  auth?: JwtClaims
}

export function signAccessToken(claims: Omit<JwtClaims, "type">): string {
  return jwt.sign({ ...claims, type: "access" }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions)
}

export function signRefreshToken(
  claims: Pick<JwtClaims, "sub" | "role">,
): string {
  return jwt.sign({ ...claims, type: "refresh" }, env.jwtSecret, {
    expiresIn: env.refreshExpiresIn,
  } as jwt.SignOptions)
}

export function authenticate(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: {
        message: "Authentication token missing",
        code: "AUTH_UNAUTHORIZED",
        status: 401,
      },
    })
    return
  }
  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret) as JwtClaims
    if (payload.type === "refresh") {
      res.status(401).json({
        success: false,
        error: {
          message: "Refresh token cannot access resources",
          code: "AUTH_UNAUTHORIZED",
          status: 401,
        },
      })
      return
    }
    req.auth = payload
    next()
  } catch {
    res.status(401).json({
      success: false,
      error: {
        message: "Invalid or expired token",
        code: "AUTH_UNAUTHORIZED",
        status: 401,
      },
    })
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({
        success: false,
        error: {
          message: "Authentication required",
          code: "AUTH_UNAUTHORIZED",
          status: 401,
        },
      })
      return
    }
    if (!roles.includes(req.auth.role)) {
      res.status(403).json({
        success: false,
        error: {
          message: "Insufficient permissions",
          code: "AUTH_FORBIDDEN",
          status: 403,
        },
      })
      return
    }
    next()
  }
}
