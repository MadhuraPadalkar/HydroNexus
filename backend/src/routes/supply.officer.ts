// Water supply management. Shapes are @water/types; writes are
// Admin/Supervisor/Engineer only.
import { Router, type Request, type Response } from "express";
import { z } from "zod";
import type { MaintenanceTask, Outage, SupplyScheduleItem } from "@water/types";
import type { AuthedRequest } from "../domain";
import { requireOfficer, requireRoles } from "../middleware/auth";
import {
  supplyRepository,
  type MaintenanceCreateInput,
  type MaintenanceUpdateInput,
  type OutageCreateInput,
  type OutageUpdateInput,
} from "../repositories/supplyRepository";
import { createOutage } from "../services/supplyService";
import { audit } from "../utils/audit";
import { parseWaterDate } from "../utils/dates";
import { pathParam, queryParams } from "../utils/params";
import { fail, notFound, ok, zodToDetails } from "../utils/respond";

const router = Router();

const WRITE_ROLES = ["Admin", "Supervisor", "Engineer"] as const;

function actor(req: Request): string {
  return (req as AuthedRequest).user.sub;
}

function invalidDate(
  field: string,
  value: string,
): { field: string; reason: string } {
  return { field, reason: `${field} is not a parseable date: ${value}` }
}

// ---- Schedule ----
router.get("/schedule", requireOfficer, (req: Request, res: Response) => {
  const q = queryParams(req);
  ok(res, supplyRepository.listSchedules({ ward: q.ward, zone: q.zone }));
});

const scheduleRowSchema: z.ZodType<SupplyScheduleItem> = z.object({
  ward: z.string().min(1),
  zone: z.string().min(1),
  scheduled: z.string().min(1),
  actual: z.string().min(1),
  pressure: z.number(),
  status: z.enum(["On Time", "Delayed", "Disrupted"]),
});

router.put("/schedule", requireRoles(...WRITE_ROLES), (req: Request, res: Response) => {
  const parsed = scheduleRowSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(res, 422, "Validation failed", "VALIDATION_ERROR", zodToDetails(parsed.error));
    return;
  }
  const row = supplyRepository.upsertSchedule(parsed.data);
  audit(req, { action: "SCHEDULE_UPDATED", module: "Supply", target: row.ward });
  ok(res, row);
});

// ---- Outages ----
router.get("/outages", requireOfficer, (req: Request, res: Response) => {
  const q = queryParams(req);
  ok(res, supplyRepository.listOutages({ status: q.status, ward: q.ward }));
});

interface OutageRequestBody {
  ward: string;
  zone: string;
  reason: string;
  type: Outage["type"];
  startTime: string;
  estimatedRestoration: string;
  status?: Outage["status"];
  affectedPopulation?: number;
  tankersDispatched?: number;
  autoNotify?: boolean;
}
const outageSchema: z.ZodType<OutageRequestBody> = z.object({
  ward: z.string().min(1),
  zone: z.string().min(1),
  reason: z.string().min(1),
  type: z.enum(["Emergency", "Scheduled"]),
  startTime: z.string().min(1),
  estimatedRestoration: z.string().min(1),
  status: z.enum(["Active", "Scheduled", "Resolved"] as const).optional(),
  affectedPopulation: z.number().int().nonnegative().optional(),
  tankersDispatched: z.number().int().nonnegative().optional(),
  autoNotify: z.boolean().optional(),
})

function outageDateError(
  start: string,
  end: string,
): { field: string; reason: string } | null {
  const s = parseWaterDate(start)
  if (s === null) return invalidDate("startTime", start)
  const e = parseWaterDate(end)
  if (e === null) return invalidDate("estimatedRestoration", end)
  if (e < s)
    return {
      field: "estimatedRestoration",
      reason: "estimatedRestoration is before startTime",
    }
  return null
}

router.post("/outages", requireRoles(...WRITE_ROLES), (req: Request, res: Response) => {
  const parsed = outageSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(res, 422, "Validation failed", "VALIDATION_ERROR", zodToDetails(parsed.error));
    return;
  }
  const dateErr = outageDateError(parsed.data.startTime, parsed.data.estimatedRestoration);
  if (dateErr) {
    fail(res, 422, "Invalid outage dates", "VALIDATION_ERROR", { [dateErr.field]: [dateErr.reason] });
    return;
  }
  const { autoNotify, ...rest } = parsed.data;
  const input: OutageCreateInput = {
    status: "Scheduled",
    affectedPopulation: 0,
    tankersDispatched: 0,
    ...rest,
  };
  const { outage, notification } = createOutage(input, actor(req), autoNotify ?? false);
  audit(req, { action: "OUTAGE_CREATED", module: "Outage Mgmt", target: outage.id });
  ok(res, { outage, notification }, 201);
});

const outagePatchSchema: z.ZodType<OutageUpdateInput> = z
  .object({
    status: z.enum(["Active", "Scheduled", "Resolved"] as const).optional(),
    estimatedRestoration: z.string().optional(),
    tankersDispatched: z.number().int().nonnegative().optional(),
    reason: z.string().optional(),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), { message: "Nothing to update" });

router.patch("/outages/:id", requireRoles(...WRITE_ROLES), (req: Request, res: Response) => {
  const id = pathParam(req, "id");
  const parsed = outagePatchSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(res, 422, "Validation failed", "VALIDATION_ERROR", zodToDetails(parsed.error));
    return;
  }
  const existing = supplyRepository.findOutage(id);
  if (!existing) {
    notFound(res, `Outage ${id} does not exist`);
    return;
  }
  const start = existing.startTime;
  const end = parsed.data.estimatedRestoration ?? existing.estimatedRestoration;
  const dateErr = outageDateError(start, end);
  if (dateErr) {
    fail(res, 422, "Invalid outage dates", "VALIDATION_ERROR", { [dateErr.field]: [dateErr.reason] });
    return;
  }
  const outage = supplyRepository.updateOutage(id, parsed.data) as Outage;
  audit(req, { action: "OUTAGE_UPDATED", module: "Outage Mgmt", target: id });
  ok(res, outage);
});

// ---- Maintenance ----
router.get("/maintenance", requireOfficer, (req: Request, res: Response) => {
  const q = queryParams(req);
  ok(res, supplyRepository.listMaintenance({ status: q.status, ward: q.ward }));
});

interface MaintenanceRequestBody {
  title: string;
  type: MaintenanceTask["type"];
  ward: string;
  scheduledDate: string;
  status?: MaintenanceTask["status"];
  priority?: MaintenanceTask["priority"];
  assignedTeam: string;
  notes?: string;
}
const maintenanceSchema: z.ZodType<MaintenanceRequestBody> = z.object({
  title: z.string().min(1),
  type: z.enum(["Preventive", "Corrective", "Inspection"]),
  ward: z.string().min(1),
  scheduledDate: z.string().min(1),
  status: z.enum(["Scheduled", "In Progress", "Completed", "Pending"] as const).optional(),
  priority: z.enum(["Low", "Medium", "High", "Critical"] as const).optional(),
  assignedTeam: z.string().min(1),
  notes: z.string().optional(),
});

router.post("/maintenance", requireRoles(...WRITE_ROLES), (req: Request, res: Response) => {
  const parsed = maintenanceSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(res, 422, "Validation failed", "VALIDATION_ERROR", zodToDetails(parsed.error));
    return;
  }
  if (parseWaterDate(parsed.data.scheduledDate) === null) {
    fail(res, 422, "Invalid maintenance date", "VALIDATION_ERROR", {
      scheduledDate: [invalidDate("scheduledDate", parsed.data.scheduledDate).reason],
    });
    return;
  }
  const input: MaintenanceCreateInput = { status: "Scheduled", priority: "Medium", ...parsed.data };
  const task = supplyRepository.createMaintenanceTask(input);
  audit(req, { action: "MAINTENANCE_CREATED", module: "Maintenance", target: task.id });
  ok(res, task, 201);
});

const maintenancePatchSchema: z.ZodType<MaintenanceUpdateInput> = z.object({
  title: z.string().min(1).optional(),
  type: z.enum(["Preventive", "Corrective", "Inspection"]).optional(),
  ward: z.string().min(1).optional(),
  scheduledDate: z.string().min(1).optional(),
  status: z.enum(["Scheduled", "In Progress", "Completed", "Pending"] as const).optional(),
  priority: z.enum(["Low", "Medium", "High", "Critical"] as const).optional(),
  assignedTeam: z.string().min(1).optional(),
  notes: z.string().optional(),
});

router.patch("/maintenance/:id", requireRoles(...WRITE_ROLES), (req: Request, res: Response) => {
  const id = pathParam(req, "id");
  const parsed = maintenancePatchSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(res, 422, "Validation failed", "VALIDATION_ERROR", zodToDetails(parsed.error));
    return;
  }
  if (parsed.data.scheduledDate !== undefined && parseWaterDate(parsed.data.scheduledDate) === null) {
    fail(res, 422, "Invalid maintenance date", "VALIDATION_ERROR", {
      scheduledDate: [invalidDate("scheduledDate", parsed.data.scheduledDate).reason],
    });
    return;
  }
  const task = supplyRepository.updateMaintenanceTask(id, parsed.data);
  if (!task) {
    notFound(res, `Maintenance task ${id} does not exist`);
    return;
  }
  audit(req, { action: "MAINTENANCE_UPDATED", module: "Maintenance", target: id });
  ok(res, task);
});

export default router;
