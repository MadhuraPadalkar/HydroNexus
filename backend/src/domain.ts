// Local domain models with NO equivalent in @water/types.
// WorkOrder and Ward live in @water/types and are imported from there.
// Everything else Complaint/Outage/Alert/... also comes from @water/types.
import type { Request } from "express";
import type { Ward, WorkOrder } from "@water/types";

export type { Ward, WorkOrder };

export type OfficerRole = "Admin" | "Engineer" | "Supervisor" | "Operator";

export interface JwtPayload {
  sub: string;
  role: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export interface AuthedRequest extends Request {
  user: JwtPayload;
}

export type WorkOrderStatus = WorkOrder["status"];

export interface WardStats {
  nrw: number;
  complaints: number;
  resolution: number;
  supply: number;
  pressure: number;
  coverage: number;
}

export interface OfficerCredential {
  hash: string;
  officerId: string;
}

export interface DashboardSummary {
  totalWards: number;
  activeComplaints: number;
  criticalComplaints: number;
  cityNrwPct: number;
  activeAlerts: number;
  citizensServed: number;
  generatedAt: string;
}
