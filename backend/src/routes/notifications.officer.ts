// Notifications.
// GET /alerts: any valid token (officer OR citizen). GET /notices: public.
// POST /alerts: Admin or Supervisor — writes what the citizen-side reads.
import { Router, type Request, type Response } from "express"
import { z } from "zod"
import type { AuthedRequest } from "../domain"
import { requireRoles, requireToken } from "../middleware/auth"
import {
  notificationRepository,
  type CreateAlertInput,
} from "../repositories/notificationRepository"
import { audit } from "../utils/audit"
import { queryParams } from "../utils/params"
import { fail, ok, zodToDetails } from "../utils/respond"

const router = Router()

router.get("/alerts", requireToken, (req: Request, res: Response) => {
  const q = queryParams(req)
  ok(res, notificationRepository.listAlerts({ severity: q.severity }))
})

const sendSchema: z.ZodType<CreateAlertInput> = z
  .object({
    title: z.string().min(1, "title is required"),
    body: z.string().min(1, "body is required"),
    severity: z
      .enum(["critical", "warning", "info", "success"] as const)
      .optional(),
    type: z
      .enum(["Supply", "Shortage", "Flood", "General"] as const)
      .optional(),
    targetWards: z.array(z.string().min(1)).optional(),
    icon: z.string().optional(),
  })
  .refine((v) => v.severity || v.type, { message: "Provide severity or type" })

router.post(
  "/alerts",
  requireRoles("Admin", "Supervisor"),
  (req: Request, res: Response) => {
    const parsed = sendSchema.safeParse(req.body)
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
    const alert = notificationRepository.createAlert({
      ...parsed.data,
      targetWards: parsed.data.targetWards || [],
      sentBy: (req as AuthedRequest).user.sub,
    })
    audit(req, {
      action: "ALERT_SENT",
      module: "Notifications",
      target: String(alert.id),
    })
    ok(res, alert, 201)
  },
)

router.get("/notices", (req: Request, res: Response) => {
  void req
  ok(res, notificationRepository.listNotices())
})

export default router
