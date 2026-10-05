// NRW & water loss. Zone metrics are computed on read in the repository.
// Zone volume writes: Admin/Supervisor/Engineer.
import { Router, type Request, type Response } from "express"
import { z } from "zod"
import type { NRWZoneMetric } from "@water/types"
import { requireOfficer, requireRoles } from "../middleware/auth"
import { nrwRepository } from "../repositories/nrwRepository"
import { compareWards, leakageAnalysis } from "../services/nrwService"
import { audit } from "../utils/audit"
import { pathParam, queryParams } from "../utils/params"
import { fail, notFound, ok, zodToDetails } from "../utils/respond"

const router = Router()

router.get("/metrics", requireOfficer, (req: Request, res: Response) => {
  void req
  ok(res, nrwRepository.listMetrics())
})

router.get("/summary", requireOfficer, (req: Request, res: Response) => {
  void req
  ok(res, nrwRepository.citySummary())
})

router.get("/leakages", requireOfficer, (req: Request, res: Response) => {
  const q = queryParams(req)
  ok(res, nrwRepository.listLeakages({ status: q.status, ward: q.ward }))
})

router.get(
  "/leakage-analysis",
  requireOfficer,
  (req: Request, res: Response) => {
    void req
    ok(res, leakageAnalysis())
  },
)

const compareSchema = z.object({
  wards: z
    .array(z.string().min(1))
    .min(2, "Select at least 2 wards")
    .max(4, "Select at most 4 wards"),
})

router.post("/compare", requireOfficer, (req: Request, res: Response) => {
  const parsed = compareSchema.safeParse(req.body)
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
  if (new Set(parsed.data.wards).size !== parsed.data.wards.length) {
    fail(res, 422, "Duplicate wards in comparison", "VALIDATION_ERROR", {
      wards: ["Each ward may only appear once (2–4 unique wards)"],
    })
    return
  }
  const { unknown, comparison } = compareWards(parsed.data.wards)
  if (unknown.length || !comparison) {
    fail(
      res,
      404,
      `Unknown ward(s): ${unknown.join(", ")}`,
      "RESOURCE_NOT_FOUND",
      { unknown },
    )
    return
  }
  ok(res, comparison)
})

const zoneVolumesSchema = z
  .object({
    inputVolumeKL: z.number().nonnegative("inputVolumeKL must be >= 0"),
    billedVolumeKL: z.number().nonnegative("billedVolumeKL must be >= 0"),
  })
  .refine((v) => v.billedVolumeKL <= v.inputVolumeKL, {
    message: "billedVolumeKL must not exceed inputVolumeKL",
    path: ["billedVolumeKL"],
  })

router.put(
  "/zones/:zone",
  requireRoles("Admin", "Supervisor", "Engineer"),
  (req: Request, res: Response) => {
    const zone = pathParam(req, "zone")
    const parsed = zoneVolumesSchema.safeParse(req.body)
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
    const updated: NRWZoneMetric | undefined = nrwRepository.updateZoneVolumes(
      zone,
      parsed.data,
    )
    if (!updated) {
      notFound(res, `NRW zone ${zone} does not exist`)
      return
    }
    audit(req, {
      action: "NRW_ZONE_UPDATED",
      module: "NRW",
      target: updated.zone,
    })
    ok(res, updated)
  },
)

export default router
