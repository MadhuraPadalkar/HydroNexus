// JWT auth + officer/admin role guard.
import type { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import type { AuthedRequest, JwtPayload, OfficerRole } from "../domain";
import { forbidden, unauthorized } from "../utils/respond";

export const OFFICER_ROLES: OfficerRole[] = ["Admin", "Engineer", "Supervisor", "Operator"];

function hasOfficerRole(role: string): role is OfficerRole {
  return (OFFICER_ROLES as string[]).includes(role);
}

function attachUser(req: Request, payload: JwtPayload): void {
  (req as AuthedRequest).user = payload;
}

/** Any valid token (officer OR citizen role). Used for citizen-visible reads. */
export function requireToken(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    unauthorized(res, "Authentication token missing");
    return;
  }
  try {
    attachUser(req, jwt.verify(token, config.jwtSecret) as JwtPayload);
    next();
  } catch {
    unauthorized(res, "Authentication token invalid or expired");
  }
}

export function requireOfficer(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    unauthorized(res, "Authentication token missing");
    return;
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
    if (!hasOfficerRole(payload.role)) {
      forbidden(res, "Officer role required");
      return;
    }
    (req as AuthedRequest).user = payload;
    next();
  } catch {
    unauthorized(res, "Authentication token invalid or expired");
  }
}

export function requireRoles(...roles: OfficerRole[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    requireOfficer(req, res, () => {
      const user = (req as AuthedRequest).user;
      if (!roles.includes(user.role as OfficerRole)) {
        forbidden(res, `Requires one of roles: ${roles.join(", ")}`);
        return;
      }
      next();
    });
  };
}
