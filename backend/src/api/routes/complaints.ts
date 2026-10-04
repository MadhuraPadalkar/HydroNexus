import { Router } from "express"
import {
  authenticate,
  requireRole,
  type AuthedRequest,
} from "../../middleware/auth"
import { validateBody } from "../../middleware/errors"
import { newComplaintSchema, updateComplaintSchema } from "../schemas"
import type { NewComplaintInput, UpdateComplaintInput } from "../schemas"
import { citizenRepository } from "../../repositories/citizenRepository"
import { complaintRepository } from "../../repositories/complaintRepository"

export const complaintsRouter = Router()

function pageParams(req: { query: Record<string, unknown> }): {
  page: number
  pageSize: number
} {
  const page = Math.max(1, Number(req.query["page"] || 1) || 1)
  const pageSize = Math.min(
    100,
    Math.max(1, Number(req.query["pageSize"] || 20) || 20),
  )
  return { page, pageSize }
}

/**
 * GET /complaints — openapi.yaml exact path (+ additive pagination/status params).
 * Citizens see only their own complaints; officer roles see all.
 */
complaintsRouter.get("/complaints", authenticate, (req, res) => {
  const auth = (req as AuthedRequest).auth
  const q = req.query as Record<string, string | undefined>
  const filter = q["filter"]
  const status =
    q["status"] ||
    (filter &&
    [
      "Open",
      "Assigned",
      "In Progress",
      "Resolved",
      "Pending",
      "Escalated",
    ].includes(filter)
      ? filter
      : undefined)
  const type =
    q["type"] || (filter && status === undefined ? filter : undefined)
  const isOfficer = auth?.role !== "Citizen"
  const citizenName = isOfficer
    ? q["citizen"] as string | undefined
    : citizenRepository.findById(auth.sub)?.name
  const items = complaintRepository.list({ status, type, citizenName })
  const { page, pageSize } = pageParams({
    query: req.query as Record<string, unknown>,
  })
  const total = items.length
  const paged = items.slice((page - 1) * pageSize, page * pageSize)
  res.json({
    success: true,
    data: paged,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  })
})

/** POST /complaints — files a new citizen grievance (openapi NewComplaintRequest + photo/GPS). */
complaintsRouter.post(
  "/complaints",
  authenticate,
  requireRole("Citizen", "Admin", "Engineer", "Supervisor", "Operator"),
  validateBody(newComplaintSchema),
  (req, res) => {
    const auth = (req as AuthedRequest).auth
    const citizen =
      auth?.role === "Citizen"
        ? citizenRepository.findById(auth.sub)
        : undefined
    const body: NewComplaintInput = req.body
    const created = complaintRepository.create({
      ...body,
      citizen: citizen?.name || "Citizen",
      phone: citizen?.phone,
    })
    res.status(201).json({ success: true, data: created })
  },
)

/** GET /complaints/:id — detail with timeline (needed by citizen detail screen + api-client). */
complaintsRouter.get("/complaints/:id", authenticate, (req, res) => {
  const auth = (req as AuthedRequest).auth
  const complaint = complaintRepository.findById(req.params["id"] as string)
  if (!complaint) {
    res.status(404).json({
      success: false,
      error: {
        message: "Complaint not found",
        code: "RESOURCE_NOT_FOUND",
        status: 404,
        details: { id: [`Complaint ${req.params["id"]} does not exist`] },
      },
    })
    return
  }
  if (auth?.role === "Citizen") {
    const citizen = citizenRepository.findById(auth.sub)
    if (citizen && complaint.citizen && complaint.citizen !== citizen.name) {
      res.status(403).json({
        success: false,
        error: {
          message: "Access denied",
          code: "AUTH_FORBIDDEN",
          status: 403,
        },
      })
      return
    }
  }
  res.json({ success: true, data: complaint })
})

/**
 * PATCH /complaints/:id — openapi.yaml exact path.
 * Status transitions validated against the lifecycle
 * Open -> Assigned -> In Progress -> Resolved.
 * Called by officer routes; citizens read the result via GET.
 */
complaintsRouter.patch(
  "/complaints/:id",
  authenticate,
  requireRole("Admin", "Engineer", "Supervisor", "Operator"),
  validateBody(updateComplaintSchema),
  (req, res) => {
    const id = req.params["id"] as string
    const existing = complaintRepository.findById(id)
    if (!existing) {
      res.status(404).json({
        success: false,
        error: {
          message: "Complaint not found",
          code: "RESOURCE_NOT_FOUND",
          status: 404,
          details: { id: [`Complaint ${id} does not exist`] },
        },
      })
      return
    }
    const patch: UpdateComplaintInput = req.body
    if (
      patch.status &&
      !complaintRepository.canTransition(existing.status, patch.status)
    ) {
      res.status(422).json({
        success: false,
        error: {
          message: `Invalid status transition from ${existing.status} to ${patch.status}`,
          code: "INVALID_STATUS_TRANSITION",
          status: 422,
        },
      })
      return
    }
    res.json({ success: true, data: complaintRepository.update(id, patch) })
  },
)
