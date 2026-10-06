// Officer login. Person 2 owns the citizen OTP routes (not mounted here).
import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config";
import { officerRepository } from "../repositories/officerRepository";
import { audit } from "../utils/audit";
import { fail, ok, zodToDetails } from "../utils/respond";

const router = Router();

const loginSchema = z.object({
  email: z.string().email("email must be a valid email"),
  password: z.string().min(1, "password is required"),
});

router.post("/officer/login", (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    const details = zodToDetails(parsed.error);
    // Missing/empty password is an auth failure, not a validation error.
    if (!req.body || typeof (req.body as { password?: unknown }).password !== "string" || !(req.body as { password?: string }).password) {
      audit(req, { action: "LOGIN_FAILURE", module: "Auth", target: String((req.body as { email?: unknown })?.email || "unknown"), severity: "Warning" });
      fail(res, 401, "Invalid email or password", "AUTH_INVALID_CREDENTIALS");
      return;
    }
    fail(res, 422, "Validation failed", "VALIDATION_ERROR", details);
    return;
  }
  const { email, password } = parsed.data;
  const cred = officerRepository.getCredential(email);
  const officer = officerRepository.findByEmail(email);
  if (!cred || !officer || !bcrypt.compareSync(password, cred.hash)) {
    audit(req, { action: "LOGIN_FAILURE", module: "Auth", target: email, severity: "Warning" });
    fail(res, 401, "Invalid email or password", "AUTH_INVALID_CREDENTIALS");
    return;
  }
  if (officer.status !== "Active") {
    audit(req, { action: "LOGIN_FAILURE", module: "Auth", target: email, severity: "Warning" });
    fail(res, 403, "Officer account is inactive", "AUTH_FORBIDDEN");
    return;
  }
  const token = jwt.sign(
    { sub: officer.id, role: officer.role, email: officer.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn } as jwt.SignOptions,
  );
  audit(req, { action: "LOGIN_SUCCESS", module: "Auth", target: officer.id });
  ok(res, {
    token,
    user: {
      id: officer.id,
      name: officer.name,
      role: officer.role,
      email: officer.email,
      phone: officer.phone,
      department: officer.department,
      zone: officer.zone,
    },
  });
});

export default router;
