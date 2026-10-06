import { Router } from "express"
import {
  authenticate,
  requireRole,
  type AuthedRequest,
} from "../../middleware/auth"
import { validateBody } from "../../middleware/errors"
import { serviceRequestSchema, tankerRequestSchema } from "../schemas"
import type { ServiceRequestInput, TankerRequestInput } from "../schemas"
import { citizenRepository } from "../../repositories/citizenRepository"
import {
  serviceRequestRepository,
  SHARED_TO_CITIZEN_STATUS,
} from "../../repositories/serviceRequestRepository"
import type { ServiceRequest } from "../../../../packages/types/src/index"

export const serviceRequestsRouter = Router()

function withCitizenStatus(
  req: ServiceRequest,
): ServiceRequest & { citizenStatus: string } {
  return {
    ...req,
    citizenStatus: SHARED_TO_CITIZEN_STATUS[req.status] || req.status,
  }
}

function identityOf(
  auth: AuthedRequest["auth"],
): { name: string; phone: string } {
  const citizen = auth ? citizenRepository.findById(auth.sub) : undefined
  return { name: citizen?.name || "Citizen", phone: citizen?.phone || "" }
}

/**
 * POST /citizens/service-requests/tanker — emergency tanker booking
 * (api-client path; writes to the shared officer-visible queue).
 */
serviceRequestsRouter.post(
  "/citizens/service-requests/tanker",
  authenticate,
  requireRole("Citizen"),
  validateBody(tankerRequestSchema),
  (req, res) => {
    const auth = (req as AuthedRequest).auth
    const fallback = identityOf(auth)
    const body: TankerRequestInput = req.body
    const created = serviceRequestRepository.create({
      citizenName: body.citizenName || fallback.name,
      phone: body.phone || fallback.phone,
      ward: body.ward,
      address: body.address,
      serviceType: "Tanker Request",
      urgency: body.urgency,
      timeSlot: body.timeSlot,
      capacityKL: body.capacityKL,
      notes: body.notes,
    })
    res.status(201).json({ success: true, data: withCitizenStatus(created) })
  },
)

/** POST /citizens/service-requests — general service request (new tap, meter, quality). */
serviceRequestsRouter.post(
  "/citizens/service-requests",
  authenticate,
  requireRole("Citizen"),
  validateBody(serviceRequestSchema),
  (req, res) => {
    const auth = (req as AuthedRequest).auth
    const fallback = identityOf(auth)
    const body: ServiceRequestInput = req.body
    const created = serviceRequestRepository.create({
      citizenName: body.citizenName || fallback.name,
      phone: body.phone || fallback.phone,
      ward: body.ward,
      address: body.address,
      serviceType: body.serviceType,
      urgency: body.urgency,
      timeSlot: body.timeSlot,
      notes: body.notes,
    })
    res.status(201).json({ success: true, data: withCitizenStatus(created) })
  },
)

/**
 * GET /citizens/service-requests — citizen's own requests
 * (api-client path; officer queue is GET /citizens/requests on the same store).
 */
serviceRequestsRouter.get(
  "/citizens/service-requests",
  authenticate,
  (req, res) => {
    const auth = (req as AuthedRequest).auth
    const citizen = auth ? citizenRepository.findById(auth.sub) : undefined
    const q = req.query as Record<string, string | undefined>
    const items = serviceRequestRepository.list({
      phone: auth?.role === "Citizen" ? citizen?.phone : q["phone"],
      ward: q["ward"],
      serviceType: q["serviceType"],
    })
    res.json({ success: true, data: items.map(withCitizenStatus) })
  },
)

/** GET /citizens/service-requests/:id — request status (Requested/Approved/Dispatched/Delivered). */
serviceRequestsRouter.get(
  "/citizens/service-requests/:id",
  authenticate,
  (req, res) => {
    const found = serviceRequestRepository.findById(req.params["id"] as string)
    if (!found) {
      res.status(404).json({
        success: false,
        error: {
          message: "Service request not found",
          code: "RESOURCE_NOT_FOUND",
          status: 404,
          details: { id: [`Request ${req.params["id"]} does not exist`] },
        },
      })
      return
    }
    res.json({ success: true, data: withCitizenStatus(found) })
  },
)
