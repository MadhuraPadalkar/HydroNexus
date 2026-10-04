import { Router } from "express";
import { authenticate, type AuthedRequest } from "../../middleware/auth";
import { billingRepository } from "../../repositories/billingRepository";
import { citizenRepository } from "../../repositories/citizenRepository";
import { notificationRepository } from "../../repositories/notificationRepository";

export const conservationRouter = Router();

/** GET /conservation/usage-vs-ward — citizen usage vs ward average. */
conservationRouter.get("/conservation/usage-vs-ward", authenticate, (req, res) => {
  const auth = (req as AuthedRequest).auth;
  const citizen = auth ? citizenRepository.findById(auth.sub) : undefined;
  if (!citizen) {
    res.status(404).json({
      success: false,
      error: { message: "Citizen not found", code: "RESOURCE_NOT_FOUND", status: 404 },
    });
    return;
  }
  const usage = billingRepository.usageByConsumer(citizen.consumerNumber);
  const latest = usage[usage.length - 1];
  const citizenUsageKL = latest?.usage ?? 0;
  const wardStat = notificationRepository.wardAverage(citizen.ward);
  const wardAverageKL = wardStat?.averageUsageKL ?? 0;
  const diffKL = citizenUsageKL - wardAverageKL;
  res.json({
    success: true,
    data: {
      consumerNumber: citizen.consumerNumber,
      ward: citizen.ward,
      period: wardStat?.period || latest?.month || "September 2026",
      citizenUsageKL,
      wardAverageKL,
      differenceKL: Math.round(diffKL * 100) / 100,
      comparison:
        diffKL <= 0 ? "below-average" : diffKL <= wardAverageKL * 0.1 ? "near-average" : "above-average",
      sampleSize: wardStat?.sampleSize ?? 0,
      trend: usage,
    },
  });
});
