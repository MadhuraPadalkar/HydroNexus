import { Router, type Response } from "express";
import { authenticate, type AuthedRequest } from "../../middleware/auth";
import { validateBody } from "../../middleware/errors";
import { payBillSchema } from "../schemas";
import { billingRepository } from "../../repositories/billingRepository";
import { citizenRepository } from "../../repositories/citizenRepository";

export const billingRouter = Router();

function consumerOf(req: AuthedRequest): string | undefined {
  if (req.auth?.consumerId) return req.auth.consumerId;
  if (req.auth) return citizenRepository.findById(req.auth.sub)?.consumerNumber;
  return undefined;
}

/** GET /billing/bills — openapi exact: billing history for the consumer. */
billingRouter.get("/billing/bills", authenticate, (req, res) => {
  const consumer = consumerOf(req as AuthedRequest);
  if (!consumer) {
    res.status(404).json({
      success: false,
      error: { message: "No linked water connection", code: "RESOURCE_NOT_FOUND", status: 404 },
    });
    return;
  }
  res.json({ success: true, data: billingRepository.historyByConsumer(consumer) });
});

/** GET /billing/bills/current — current (latest unpaid) bill. */
billingRouter.get("/billing/bills/current", authenticate, (req, res) => {
  const consumer = consumerOf(req as AuthedRequest);
  const bill = consumer ? billingRepository.currentBill(consumer) : undefined;
  if (!bill) {
    res.status(404).json({
      success: false,
      error: { message: "No current bill", code: "RESOURCE_NOT_FOUND", status: 404 },
    });
    return;
  }
  res.json({ success: true, data: bill });
});

/** GET /billing/usage — openapi exact: consumption trend data points. */
billingRouter.get("/billing/usage", authenticate, (req, res) => {
  const consumer = consumerOf(req as AuthedRequest);
  if (!consumer) {
    res.status(404).json({
      success: false,
      error: { message: "No linked water connection", code: "RESOURCE_NOT_FOUND", status: 404 },
    });
    return;
  }
  res.json({ success: true, data: billingRepository.usageByConsumer(consumer) });
});

function pay(id: string, res: Response): void {
  const bill = billingRepository.findBill(id);
  if (!bill) {
    res.status(404).json({
      success: false,
      error: {
        message: "Bill not found",
        code: "RESOURCE_NOT_FOUND",
        status: 404,
        details: { billId: [`Bill ${id} does not exist`] },
      },
    });
    return;
  }
  billingRepository.markPaid(id);
  res.json({
    success: true,
    data: { paid: true, transactionId: `TXN-${Date.now().toString().slice(-6)}` },
  });
}

/** POST /billing/pay — openapi exact: { billId } */
billingRouter.post("/billing/pay", authenticate, validateBody(payBillSchema), (req, res) => {
  pay((req.body as { billId: string }).billId, res);
});

/** POST /billing/bills/:id/pay — api-client path alias for the same operation. */
billingRouter.post("/billing/bills/:id/pay", authenticate, (req, res) => {
  pay(req.params["id"] as string, res);
});
