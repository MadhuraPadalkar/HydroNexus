// Officer complaint routes (reads + status/assign writes).
// The citizen-side POST /complaints belongs to Person 2 and is NOT
// registered here. Response shapes are @water/types Complaint.
import { Router, type Request, type Response } from "express"
import { z } from "zod"
import type { AuthedRequest } from "../domain"
import { requireOfficer, requireRoles } from "../middleware/auth"
import {
  complaintRepository,
  type UpdateComplaintInput,
} from "../repositories/complaintRepository"
import { assignComplaint } from "../services/complaintService"
import { audit } from "../utils/audit"
import { pathParam, queryParams } from "../utils/params"
import { fail, notFound, ok, zodToDetails } from "../utils/respond"

const router = Router()

const STATUS_VALUES = [
  "Open",
  "Pending",
  "In Progress",
  "Resolved",
  "Escalated",
] as const
const PRIORITY_VALUES = ["Low", "Medium", "High", "Critical"] as const

function actor(req: Request): string {
  return (req as AuthedRequest).user.sub
}

router.get("/", requireOfficer, (req: Request, res: Response) => {
  const q = queryParams(req)
  ok(
    res,
    complaintRepository.findAll({
      filter: q.filter,
      status: q.status,
      ward: q.ward,
      category: q.category || q.type,
    }),
  )
})

router.get("/:id", requireOfficer, (req: Request, res: Response) => {
  const id = pathParam(req, "id")
  const item = complaintRepository.findById(id)
  if (!item) {
    notFound(res, `Complaint ${id} does not exist`)
    return
  }
  ok(res, item)
})

const updateSchema: z.ZodType<UpdateComplaintInput> = z
  .object({
    status: z.enum(STATUS_VALUES).optional(),
    priority: z.enum(PRIORITY_VALUES).optional(),
    assigned: z.string().min(1).optional(),
    note: z.string().optional(),
  })
  .refine((v) => v.status || v.priority || v.assigned, {
    message: "Nothing to update: provide status, priority, or assigned",
  })

function applyStatusUpdate(
  req: Request,
  res: Response,
  id: string,
  body: unknown,
): void {
  if (!complaintRepository.findById(id)) {
    notFound(res, `Complaint ${id} does not exist`)
    return
  }
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    fail(
      res,
      422,
      "Validation failed",
      "VALIDATION_ERROR",
      zodToDetails(parsed.error),
    )
    return
  }
  const updated = complaintRepository.update(id, parsed.data, actor(req))
  audit(req, {
    action: "COMPLAINT_STATUS_UPDATED",
    module: "Complaints",
    target: id,
  })
  ok(res, updated)
}

router.patch(
  "/:id",
  requireRoles("Admin", "Supervisor", "Engineer"),
  (req: Request, res: Response) => {
    applyStatusUpdate(req, res, pathParam(req, "id"), req.body)
  },
)

// Alias used by @water/api-client updateStatus — same service, audited too.
const statusAliasSchema = z.object({
  status: z.enum(STATUS_VALUES),
})

router.patch(
  "/:id/status",
  requireRoles("Admin", "Supervisor", "Engineer"),
  (req: Request, res: Response) => {
    const id = pathParam(req, "id")
    const parsed = statusAliasSchema.safeParse(req.body)
    if (!parsed.success) {
      fail(
        res,
        422,
        "Validation failed",
        "VALIDATION_ERROR",
        zodToDetails(parsed.error),
      )
      return
    }
    applyStatusUpdate(req, res, id, { status: parsed.data.status })
  },
)

const assignSchema = z.object({
  engineer: z.string().min(1, "engineer is required"),
  workOrderId: z.string().optional(),
  notes: z.string().optional(),
})

router.post(
  "/:id/assign",
  requireRoles("Admin", "Supervisor"),
  (req: Request, res: Response) => {
    const id = pathParam(req, "id")
    const parsed = assignSchema.safeParse(req.body)
    if (!parsed.success) {
      fail(
        res,
        422,
        "Validation failed",
        "VALIDATION_ERROR",
        zodToDetails(parsed.error),
      )
      return
    }
    const result = assignComplaint(id, parsed.data.engineer, actor(req), {
      workOrderId: parsed.data.workOrderId,
      notes: parsed.data.notes,
    })
    if (!result) {
      notFound(res, `Complaint ${id} does not exist`)
      return
    }
    audit(req, {
      action: "COMPLAINT_ASSIGNED",
      module: "Complaints",
      target: id,
    })
    ok(res, result)
  },
)

export default router
