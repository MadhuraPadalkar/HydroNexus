import { Router } from "express";
import { authenticate, requireRole, type AuthedRequest } from "../../middleware/auth";
import { validateBody } from "../../middleware/errors";
import { updateProfileSchema } from "../schemas";
import type { UpdateProfileInput } from "../schemas";
import { citizenRepository } from "../../repositories/citizenRepository";
import { serviceRequestRepository } from "../../repositories/serviceRequestRepository";

export const citizensRouter = Router();

/** GET /citizens?search= — openapi exact (officer directory search). */
citizensRouter.get(
  "/citizens",
  authenticate,
  requireRole("Admin", "Engineer", "Supervisor", "Operator"),
  (req, res) => {
    const q = req.query as Record<string, string | undefined>;
    res.json({ success: true, data: citizenRepository.search(q["search"]) });
  },
);

/** GET /citizens/applications — openapi exact. */
citizensRouter.get("/citizens/applications", authenticate, (_req, res) => {
  res.json({ success: true, data: serviceRequestRepository.applications() });
});

/**
 * GET /citizens/requests — openapi exact: special service requests queue
 * (same store Person 3's officer queue reads).
 */
citizensRouter.get("/citizens/requests", authenticate, (req, res) => {
  const q = req.query as Record<string, string | undefined>;
  res.json({
    success: true,
    data: serviceRequestRepository.list({ ward: q["ward"], serviceType: q["serviceType"] }),
  });
});

/** GET /citizens/me — citizen's own profile. */
citizensRouter.get("/citizens/me", authenticate, (req, res) => {
  const auth = (req as AuthedRequest).auth;
  const citizen = auth ? citizenRepository.findById(auth.sub) : undefined;
  if (!citizen) {
    res.status(404).json({
      success: false,
      error: { message: "Citizen not found", code: "RESOURCE_NOT_FOUND", status: 404 },
    });
    return;
  }
  res.json({ success: true, data: citizen });
});

/** PATCH /citizens/me — update citizen profile. */
citizensRouter.patch(
  "/citizens/me",
  authenticate,
  requireRole("Citizen"),
  validateBody(updateProfileSchema),
  (req, res) => {
    const auth = (req as AuthedRequest).auth;
    const updated = auth
      ? citizenRepository.update(auth.sub, req.body as UpdateProfileInput)
      : undefined;
    if (!updated) {
      res.status(404).json({
        success: false,
        error: { message: "Citizen not found", code: "RESOURCE_NOT_FOUND", status: 404 },
      });
      return;
    }
    res.json({ success: true, data: updated });
  },
);

/** GET /citizens/me/connection — linked water connection details. */
citizensRouter.get("/citizens/me/connection", authenticate, (req, res) => {
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
      consumerNumber: citizen.consumerNumber,
      holderName: citizen.name,
      ward: citizen.ward,
      address: citizen.address,
      connectionType: citizen.connectionType,
      meterNumber: citizen.meterNumber,
      status: citizen.status,
      currentBalance: citizen.currentBalance,
    },
  });
});
