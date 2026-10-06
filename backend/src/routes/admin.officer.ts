// Admin directory + read-only flood telemetry mirrors.
// Billing routes were removed: Person 2 owns billing.
import { Router, type Request, type Response } from "express";
import { z } from "zod";
import type { OfficerUser, RolePermissions, SystemSettingsConfig } from "@water/types";
import type { AuthedRequest } from "../domain";
import { requireOfficer, requireRoles } from "../middleware/auth";
import { analyticsRepository } from "../repositories/analyticsRepository";
import {
  officerRepository,
  type CreateOfficerInput,
  type UpdateOfficerInput,
} from "../repositories/officerRepository";
import { audit } from "../utils/audit";
import { pathParam, queryParams } from "../utils/params";
import { fail, notFound, ok, zodToDetails } from "../utils/respond";

const router = Router();

function actor(req: Request): string {
  return (req as AuthedRequest).user.sub;
}

const OFFICER_ROLE_VALUES = ["Admin", "Engineer", "Supervisor", "Operator"] as const;

// ---- Officers ----
router.get("/admin/officers", requireRoles("Admin", "Supervisor"), (req: Request, res: Response) => {
  void req;
  ok(res, officerRepository.listOfficers());
});

const createOfficerSchema: z.ZodType<CreateOfficerInput> = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  role: z.enum(OFFICER_ROLE_VALUES),
  department: z.string().min(1),
  zone: z.string().min(1),
});

router.post("/admin/officers", requireRoles("Admin"), (req: Request, res: Response) => {
  const parsed = createOfficerSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(res, 422, "Validation failed", "VALIDATION_ERROR", zodToDetails(parsed.error));
    return;
  }
  const officer = officerRepository.createOfficer(parsed.data as CreateOfficerInput);
  if (!officer) {
    fail(res, 409, "Officer email already exists", "OFFICER_EMAIL_CONFLICT", {
      email: ["An officer with this email already exists"],
    });
    return;
  }
  audit(req, { action: "OFFICER_CREATED", module: "Admin", target: officer.id });
  ok(res, officer, 201);
});

const updateOfficerSchema: z.ZodType<UpdateOfficerInput> = z
  .object({
    role: z.enum(OFFICER_ROLE_VALUES).optional(),
    department: z.string().min(1).optional(),
    zone: z.string().min(1).optional(),
    status: z.enum(["Active", "Inactive"] as const).optional(),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), { message: "Nothing to update" });

router.patch("/admin/officers/:id", requireRoles("Admin"), (req: Request, res: Response) => {
  const id = pathParam(req, "id");
  const parsed = updateOfficerSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(res, 422, "Validation failed", "VALIDATION_ERROR", zodToDetails(parsed.error));
    return;
  }
  if (parsed.data.status === "Inactive" && actor(req) === id) {
    fail(res, 403, "You cannot deactivate your own account", "SELF_DEACTIVATION");
    return;
  }
  const officer: OfficerUser | undefined = officerRepository.updateOfficer(
    id,
    parsed.data as UpdateOfficerInput,
  );
  if (!officer) {
    notFound(res, `Officer ${id} does not exist`);
    return;
  }
  audit(req, { action: "OFFICER_UPDATED", module: "Admin", target: id });
  ok(res, officer);
});

// ---- Permissions ----
router.get("/admin/permissions", requireRoles("Admin", "Supervisor"), (req: Request, res: Response) => {
  void req;
  ok(res, officerRepository.listPermissions());
});

const permissionsSchema: z.ZodType<RolePermissions> = z.object({
  role: z.string().min(1),
  manageUsers: z.boolean(),
  manageRoles: z.boolean(),
  viewAudit: z.boolean(),
  systemSettings: z.boolean(),
  editSchedules: z.boolean(),
  approveRequests: z.boolean(),
});

router.put("/admin/permissions/:role", requireRoles("Admin"), (req: Request, res: Response) => {
  const role = pathParam(req, "role");
  const parsed = permissionsSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(res, 422, "Validation failed", "VALIDATION_ERROR", zodToDetails(parsed.error));
    return;
  }
  const entry = officerRepository.updatePermissions(role, parsed.data);
  if (!entry) {
    notFound(res, `Role ${role} does not exist`);
    return;
  }
  audit(req, { action: "PERMISSIONS_UPDATED", module: "Admin", target: role });
  ok(res, entry);
});

// ---- Settings ----
router.get("/admin/settings", requireOfficer, (req: Request, res: Response) => {
  void req;
  ok(res, officerRepository.getSettings());
});

const settingsSchema: z.ZodType<Partial<SystemSettingsConfig>> = z.object({
  autoFloodAlert: z.boolean().optional(),
  floodMinor: z.string().optional(),
  floodModerate: z.string().optional(),
  floodMajor: z.string().optional(),
  nrwWarningThreshold: z.string().optional(),
  slaCriticalHours: z.string().optional(),
  slaGeneralHours: z.string().optional(),
});

router.put("/admin/settings", requireRoles("Admin"), (req: Request, res: Response) => {
  const parsed = settingsSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(res, 422, "Validation failed", "VALIDATION_ERROR", zodToDetails(parsed.error));
    return;
  }
  const settings = officerRepository.updateSettings(parsed.data);
  audit(req, { action: "SETTINGS_UPDATED", module: "Settings", target: "system-settings" });
  ok(res, settings);
});

// ---- Audit logs (newest first, optional filters) ----
router.get("/admin/audit-logs", requireRoles("Admin", "Supervisor"), (req: Request, res: Response) => {
  const q = queryParams(req);
  ok(res, officerRepository.listAuditLogs({
    user: q.user,
    module: q.module,
    severity: q.severity,
    q: q.q,
  }));
});

// ---- Flood telemetry mirrors (read-only, any officer role) ----
router.get("/flood/gauges", requireOfficer, (req: Request, res: Response) => {
  void req;
  ok(res, analyticsRepository.listGauges());
});
router.get("/flood/rainfall", requireOfficer, (req: Request, res: Response) => {
  void req;
  ok(res, analyticsRepository.listRainfall());
});

export default router;
