import cors from "cors"
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express"
import { config } from "./config"
import { fail, notFound } from "./utils/respond"
import adminOfficer from "./routes/admin.officer"
import authOfficer from "./routes/auth.officer"
import citizensOfficer from "./routes/citizens.officer"
import complaintsOfficer from "./routes/complaints.officer"
import dashboardOfficer from "./routes/dashboard.officer"
import notificationsOfficer from "./routes/notifications.officer"
import nrwOfficer from "./routes/nrw.officer"
import supplyOfficer from "./routes/supply.officer"
import workordersOfficer from "./routes/workorders.officer"

const app = express()
app.use(express.json({ limit: "1mb" }))
app.use(cors({ origin: config.corsOrigins, credentials: true }))

app.get("/health", (req: Request, res: Response) => {
  void req
  res.json({ success: true, data: { status: "ok", scope: "officer" } })
})

const v1 = express.Router()
// Auth (officer half). Citizen OTP routes are Person 2's — not mounted here.
v1.use("/auth", authOfficer)
v1.use("/complaints", complaintsOfficer)
v1.use("/work-orders", workordersOfficer)
v1.use("/supply", supplyOfficer)
v1.use("/nrw", nrwOfficer)
// Citizens router carries /citizens/* + /wards/* (officer half).
v1.use("/", citizensOfficer)
// Notifications router carries /alerts + /notices.
v1.use("/", notificationsOfficer)
// Dashboard + analytics.
v1.use("/", dashboardOfficer)
// Admin + read-only flood telemetry mirrors.
v1.use("/", adminOfficer)

app.use("/api/v1", v1)

// Consistent 404 envelope for unknown API routes (no token required).
app.use("/api", (req: Request, res: Response) => {
  notFound(res, `Route ${req.method} ${req.path} does not exist`)
})

interface BodyParserError extends Error {
  type?: string
  status?: number
  statusCode?: number
}

// Fallback error handler (never leaks stack to clients).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(
  (err: BodyParserError, req: Request, res: Response, next: NextFunction) => {
    void next
    if (res.headersSent) return
    if (err.type === "entity.parse.failed") {
      fail(res, 400, "Malformed JSON body", "BAD_REQUEST", {
        body: ["Request body is not valid JSON"],
      })
      return
    }
    console.error(err)
    fail(
      res,
      err.status || err.statusCode || 500,
      "Internal server error",
      "INTERNAL_ERROR",
    )
  },
)

if (require.main === module) {
  if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
    console.error(
      "[fatal] JWT_SECRET must be set in production. Refusing to start.",
    )
    process.exit(1)
  }
  app.listen(config.port, () => {
    console.log(`HydroNexus officer backend listening on :${config.port}`)
  })
}

export default app
