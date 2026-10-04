import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middleware/errors";
import { authCitizenRouter } from "./api/routes/authCitizen";
import { billingRouter } from "./api/routes/billing";
import { citizensRouter } from "./api/routes/citizens";
import { complaintsRouter } from "./api/routes/complaints";
import { conservationRouter } from "./api/routes/conservation";
import { notificationsRouter } from "./api/routes/notifications";
import { serviceRequestsRouter } from "./api/routes/serviceRequests";

export function createApp(): express.Express {
  const app = express();
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok", service: "hydronexus-backend" } });
  });

  const v1 = express.Router();
  v1.use(authCitizenRouter);
  v1.use(complaintsRouter);
  v1.use(citizensRouter);
  v1.use(billingRouter);
  v1.use(notificationsRouter);
  v1.use(serviceRequestsRouter);
  v1.use(conservationRouter);
  app.use("/api/v1", v1);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
