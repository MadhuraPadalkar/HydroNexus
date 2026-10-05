// Citizen & connections (officer half) + ward metadata.
import { Router, type Request, type Response } from "express"
import { z } from "zod"
import type { ServiceRequest, WaterConnectionApplication } from "@water/types"
import type { AuthedRequest, Ward } from "../domain"
import { requireOfficer, requireRoles } from "../middleware/auth"
import {
  citizenRepository,
  type ConnectionDecision,
} from "../repositories/citizenRepository"
import {
  wardRepository,
  type WardUpdateInput,
} from "../repositories/wardRepository"
import { audit } from "../utils/audit"
import { pathParam, queryParams } from "../utils/params"
import { fail, notFound, ok, zodToDetails } from "../utils/respond"

const router = Router()

function actor(req: Request): string {
  return (req as AuthedRequest).user.sub
}

// ---- Citizens (static sub-paths BEFORE the :id route) ----
router.get("/citizens", requireOfficer, (req: Request, res: Response) => {
  const q = queryParams(req)
  ok(
    res,
    citizenRepository.listCitizens({
      search: q.search,
      ward: q.ward,
      status: q.status,
    }),
  )
})

router.get(
  "/citizens/applications",
  requireOfficer,
  (req: Request, res: Response) => {
    const q = queryParams(req)
    ok(res, citizenRepository.listApplications({ status: q.status }))
  },
)

router.get(
  "/citizens/requests",
  requireOfficer,
  (req: Request, res: Response) => {
    const q = queryParams(req)
    ok(
      res,
      citizenRepository.listServiceRequests({
        status: q.status,
        serviceType: q.serviceType,
      }),
    )
  },
)

router.get("/citizens/:id", requireOfficer, (req: Request, res: Response) => {
  const id = pathParam(req, "id")
  const item = citizenRepository.findCitizen(id)
  if (!item) {
    notFound(res, `Citizen ${id} does not exist`)
    return
  }
  ok(res, item)
})

// ---- Connection approval workflow (Admin, Supervisor) ----
const decisionSchema = z.object({
  action: z.enum(["approve", "reject", "inspection"]),
  note: z.string().optional(),
})

router.patch(
  "/citizens/applications/:id",
  requireRoles("Admin", "Supervisor"),
  (req: Request, res: Response) => {
    const id = pathParam(req, "id")
    const parsed = decisionSchema.safeParse(req.body)
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
    const app: WaterConnectionApplication | undefined =
      citizenRepository.decideApplication(
        id,
        parsed.data.action as ConnectionDecision,
        actor(req),
      )
    if (!app) {
      notFound(res, `Application ${id} does not exist`)
      return
    }
    audit(req, {
      action: "APPLICATION_DECIDED",
      module: "Connections",
      target: id,
    })
    ok(res, app)
  },
)

// ---- Service / tanker queue (Admin, Supervisor, Operator) ----
type ServiceRequestPatch = Pick<ServiceRequest, "status"> & Partial<Pick<ServiceRequest, "vehicleNumber" | "driverName" | "notes">>
const srPatchSchema: z.ZodType<ServiceRequestPatch> = z.object({
  status: z.enum(["Pending", "Assigned", "En Route", "Completed"] as const),
  vehicleNumber: z.string().optional(),
  driverName: z.string().optional(),
  notes: z.string().optional(),
})

router.patch(
  "/citizens/requests/:id",
  requireRoles("Admin", "Supervisor", "Operator"),
  (req: Request, res: Response) => {
    const id = pathParam(req, "id")
    const parsed = srPatchSchema.safeParse(req.body)
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
    const item = citizenRepository.updateServiceRequest(id, parsed.data)
    if (!item) {
      notFound(res, `Service request ${id} does not exist`)
      return
    }
    audit(req, {
      action: "SERVICE_REQUEST_UPDATED",
      module: "Service Requests",
      target: id,
    })
    ok(res, item)
  },
)

// ---- Wards ----
router.get("/wards", requireOfficer, (req: Request, res: Response) => {
  void req
  ok(res, wardRepository.findAll())
})

router.get("/wards/:id", requireOfficer, (req: Request, res: Response) => {
  const id = pathParam(req, "id")
  const ward = wardRepository.findById(id)
  if (!ward) {
    notFound(res, `Ward ${id} does not exist`)
    return
  }
  ok(res, ward)
})

const wardPatchSchema: z.ZodType<WardUpdateInput> = z
  .object({
    population: z.number().int().nonnegative().optional(),
    households: z.number().int().nonnegative().optional(),
    coveragePct: z.number().min(0).max(100).optional(),
    supplyHours: z.string().optional(),
    status: z.enum(["Normal", "Watch", "Disrupted"] as const).optional(),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), {
    message: "Nothing to update",
  })

router.patch(
  "/wards/:id",
  requireRoles("Admin"),
  (req: Request, res: Response) => {
    const id = pathParam(req, "id")
    const parsed = wardPatchSchema.safeParse(req.body)
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
    const ward: Ward | undefined = wardRepository.update(id, parsed.data)
    if (!ward) {
      notFound(res, `Ward ${id} does not exist`)
      return
    }
    audit(req, { action: "WARD_UPDATED", module: "Admin", target: ward.name })
    ok(res, ward)
  },
)

export default router
