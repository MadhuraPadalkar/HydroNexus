import { Router } from "express";
import { otpRequestSchema, otpVerifySchema, refreshSchema } from "../schemas";
import { validateBody } from "../../middleware/errors";
import { authenticate, type AuthedRequest } from "../../middleware/auth";
import { citizenRepository } from "../../repositories/citizenRepository";
import { authService, normalizePhone } from "../../services/authService";

export const authCitizenRouter = Router();

authCitizenRouter.post(
  "/auth/citizen/otp/request",
  validateBody(otpRequestSchema),
  (req, res) => {
    const { phone } = req.body as { phone: string };
    res.json({ success: true, data: authService.requestOtp(phone) });
  },
);

authCitizenRouter.post(
  "/auth/citizen/otp/verify",
  validateBody(otpVerifySchema),
  (req, res) => {
    const { phone, otp, name, ward } = req.body as {
      phone: string;
      otp: string;
      name?: string;
      ward?: string;
    };
    try {
      const session = authService.verifyOtp(phone, otp, name, ward);
      res.json({ success: true, data: session });
    } catch (err: unknown) {
      const e = err as Error & { status?: number; code?: string };
      res.status(e.status || 401).json({
        success: false,
        error: { message: e.message, code: e.code || "AUTH_UNAUTHORIZED", status: e.status || 401 },
      });
    }
  },
);

authCitizenRouter.post(
  "/auth/citizen/refresh",
  validateBody(refreshSchema),
  (req, res) => {
    const { refreshToken } = req.body as { refreshToken: string };
    try {
      res.json({ success: true, data: authService.refresh(refreshToken) });
    } catch (err: unknown) {
      const e = err as Error & { status?: number; code?: string };
      res.status(e.status || 401).json({
        success: false,
        error: { message: e.message, code: e.code || "AUTH_UNAUTHORIZED", status: e.status || 401 },
      });
    }
  },
);

/** Current session profile (used by citizen portal bootstrap). */
authCitizenRouter.get("/auth/me", authenticate, (req, res) => {
  const auth = (req as AuthedRequest).auth;
  const citizen = auth ? citizenRepository.findById(auth.sub) : undefined;
  if (!citizen) {
    res.status(404).json({
      success: false,
      error: { message: "Citizen not found", code: "RESOURCE_NOT_FOUND", status: 404 },
    });
    return;
  }
  res.json({
    success: true,
    data: {
      id: citizen.id,
      name: citizen.name,
      role: "Citizen",
      phone: normalizePhone(citizen.phone),
      ward: citizen.ward,
      consumerId: citizen.consumerNumber,
    },
  });
});
