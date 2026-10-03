// Dashboard KPIs and analytics (officer reads).
import { Router, type Request, type Response } from "express";
import { requireOfficer } from "../middleware/auth";
import { analyticsRepository } from "../repositories/analyticsRepository";
import { dashboardSummary, wardComparison, waterStatus } from "../services/dashboardService";
import { queryParams } from "../utils/params";
import { fail, ok } from "../utils/respond";

const router = Router();

router.get("/dashboard/summary", requireOfficer, (req: Request, res: Response) => {
  void req;
  ok(res, dashboardSummary());
});

router.get("/dashboard/water-status", requireOfficer, (req: Request, res: Response) => {
  void req;
  ok(res, waterStatus());
});

router.get("/analytics/supply", requireOfficer, (req: Request, res: Response) => {
  void req;
  ok(res, analyticsRepository.getBundle().supply);
});

router.get("/analytics/complaints", requireOfficer, (req: Request, res: Response) => {
  const q = queryParams(req);
  ok(res, { range: q.range || "6m", byCategory: analyticsRepository.getBundle().complaintsByCategory });
});

router.get("/analytics/nrw", requireOfficer, (req: Request, res: Response) => {
  void req;
  ok(res, analyticsRepository.getBundle().nrwTrend);
});

router.get("/analytics/consumption", requireOfficer, (req: Request, res: Response) => {
  void req;
  ok(res, {
    usage: analyticsRepository.listUsage(),
    bySector: analyticsRepository.getBundle().consumption,
  });
});

router.get("/analytics/ward-comparison", requireOfficer, (req: Request, res: Response) => {
  const q = queryParams(req);
  const names = String(q.wards || "").split(",").map((s) => s.trim()).filter(Boolean);
  const { unknown, rows } = wardComparison(names);
  if (unknown.length || !rows) {
    fail(res, 404, `Unknown ward(s): ${unknown.join(", ")}`, "RESOURCE_NOT_FOUND");
    return;
  }
  ok(res, rows);
});

export default router;
