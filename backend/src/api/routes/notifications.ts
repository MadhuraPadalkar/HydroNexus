import { Router } from "express"
import {
  authenticate,
  requireRole,
  type AuthedRequest,
} from "../../middleware/auth"
import { validateBody } from "../../middleware/errors"
import { newAlertSchema } from "../schemas"
import type { NewAlertInput } from "../schemas"
import { citizenRepository } from "../../repositories/citizenRepository"
import { notificationRepository } from "../../repositories/notificationRepository"

export const notificationsRouter = Router()

/**
 * GET /alerts — openapi exact (citizen read-side).
 * Scoped to the citizen's ward via ?ward= or the JWT ward claim.
 * Returns each alert with a `read` flag for the requesting citizen.
 */
notificationsRouter.get("/alerts", authenticate, (req, res) => {
  const auth = (req as AuthedRequest).auth
  const q = req.query as Record<string, string | undefined>
  const citizen =
    auth?.role === "Citizen" && auth
      ? citizenRepository.findById(auth.sub)
      : undefined
  const ward = q["ward"] || citizen?.ward || auth?.ward
  const alerts = notificationRepository.alertsForWard(ward)
  const readIds = auth ? notificationRepository.readIds(auth.sub) : []
  res.json({
    success: true,
    data: alerts.map((a) => ({ ...a, read: readIds.includes(String(a.id)) })),
  })
})

/**
 * POST /alerts — openapi exact broadcast endpoint.
 * OWNERSHIP: Person 3 (officer modules). Implemented here only as a thin
 * officer-guarded writer into the SAME store citizens read, so the officer
 * queue and citizen read-side never diverge.
 */
notificationsRouter.post(
  "/alerts",
  authenticate,
  requireRole("Admin", "Engineer", "Supervisor"),
  validateBody(newAlertSchema),
  (req, res) => {
    const body: NewAlertInput = req.body
    res
      .status(201)
      .json({ success: true, data: notificationRepository.createAlert(body) })
  },
)

/** POST /alerts/:id/read — mark a notification as read for the citizen. */
notificationsRouter.post("/alerts/:id/read", authenticate, (req, res) => {
  const auth = (req as AuthedRequest).auth
  if (!auth) {
    res.status(401).json({
      success: false,
      error: {
        message: "Authentication required",
        code: "AUTH_UNAUTHORIZED",
        status: 401,
      },
    })
    return
  }
  notificationRepository.markRead(auth.sub, req.params["id"] as string)
  res.json({ success: true, data: { read: true, alertId: req.params["id"] } })
})

/** GET /alerts/unread-count — unread badge count for the citizen's ward. */
notificationsRouter.get("/alerts/unread-count", authenticate, (req, res) => {
  const auth = (req as AuthedRequest).auth
  const citizen =
    auth?.role === "Citizen" && auth
      ? citizenRepository.findById(auth.sub)
      : undefined
  const alerts = notificationRepository.alertsForWard(
    citizen?.ward || auth?.ward,
  )
  const readIds = auth ? notificationRepository.readIds(auth.sub) : []
  const unread = alerts.filter((a) => !readIds.includes(String(a.id))).length
  res.json({ success: true, data: { unread } })
})

/** GET /notices — openapi exact: public circulars (no auth required). */
notificationsRouter.get("/notices", (_req, res) => {
  res.json({ success: true, data: notificationRepository.notices() })
})
