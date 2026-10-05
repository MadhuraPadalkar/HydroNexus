// Work orders. Local WorkOrder type comes from @water/types.
import { Router, type Request, type Response } from "express"
import { z } from "zod"
import { requireOfficer, requireRoles } from "../middleware/auth"
import {
  workOrderRepository,
  type CreateWorkOrderInput,
  type UpdateWorkOrderInput,
} from "../repositories/workOrderRepository"
import { complaintRepository } from "../repositories/complaintRepository"
import { audit } from "../utils/audit"
import { pathParam, queryParams } from "../utils/params"
import { fail, notFound, ok, zodToDetails } from "../utils/respond"

const router = Router()

const WO_STATUS = [
  "Open",
  "In Progress",
  "On Hold",
  "Completed",
  "Cancelled",
] as const
const WO_PRIORITY = ["Low", "Medium", "High", "Critical"] as const

router.get("/", requireOfficer, (req: Request, res: Response) => {
  const q = queryParams(req)
  ok(
    res,
    workOrderRepository.findAll({
      status: q.status,
      ward: q.ward,
      assignee: q.assignee,
    }),
  )
})

router.get("/:id", requireOfficer, (req: Request, res: Response) => {
  const id = pathParam(req, "id")
  const wo = workOrderRepository.findById(id)
  if (!wo) {
    notFound(res, `Work order ${id} does not exist`)
    return
  }
  const complaint = wo.complaintId
    ? complaintRepository.findById(wo.complaintId) || null
    : null
  ok(res, { ...wo, complaint })
})

const createSchema: z.ZodType<CreateWorkOrderInput> = z.object({
  complaintId: z.string().optional(),
  title: z.string().min(1, "title is required"),
  ward: z.string().min(1, "ward is required"),
  assignedTo: z.string().min(1, "assignedTo is required"),
  priority: z.enum(WO_PRIORITY).optional(),
  notes: z.string().optional(),
})

router.post(
  "/",
  requireRoles("Admin", "Supervisor", "Engineer"),
  (req: Request, res: Response) => {
    const parsed = createSchema.safeParse(req.body)
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
    const wo = workOrderRepository.create(parsed.data)
    audit(req, {
      action: "WORK_ORDER_CREATED",
      module: "Complaints",
      target: wo.id,
    })
    ok(res, wo, 201)
  },
)

const patchSchema: z.ZodType<UpdateWorkOrderInput> = z
  .object({
    status: z.enum(WO_STATUS).optional(),
    assignedTo: z.string().min(1).optional(),
    notes: z.string().optional(),
  })
  .refine((v) => v.status || v.assignedTo || v.notes !== undefined, {
    message: "Nothing to update",
  })

router.patch(
  "/:id",
  requireRoles("Admin", "Supervisor", "Engineer"),
  (req: Request, res: Response) => {
    const id = pathParam(req, "id")
    const parsed = patchSchema.safeParse(req.body)
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
    const wo = workOrderRepository.update(id, parsed.data)
    if (!wo) {
      notFound(res, `Work order ${id} does not exist`)
      return
    }
    audit(req, {
      action: "WORK_ORDER_UPDATED",
      module: "Complaints",
      target: id,
    })
    ok(res, wo)
  },
)

export default router
