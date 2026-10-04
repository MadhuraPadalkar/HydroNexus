import { z } from "zod";
import type {
  Alert,
  Complaint,
  ServiceRequest,
} from "../../../packages/types/src/index";

/**
 * Zod schemas DERIVED from @water/types (packages/types/src/index.ts).
 *
 * Import approach: relative path, because backend/ is a standalone npm
 * package and pnpm is not available in this environment, so the
 * "workspace:*" protocol cannot resolve here. These are real imports of
 * the real file (not copies): any change in packages/types propagates
 * here, and any drift fails `tsc --noEmit`.
 *
 * Future path to workspace dep (needs pnpm): add `backend` to the root
 * pnpm-workspace.yaml, add `"@water/types": "workspace:*"` to
 * backend/package.json, then switch these imports to `@water/types`.
 *
 * Field names/paths mirror contracts/openapi.yaml exactly.
 */

/** Literal lists checked against the real interfaces (drift fails tsc). */
const complaintStatuses: Complaint["status"][] = [
  "Open",
  "In Progress",
  "Resolved",
];

type ComplaintPriority = NonNullable<Complaint["priority"]>;
const complaintPriorities: ComplaintPriority[] = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

const serviceTypes: ServiceRequest["serviceType"][] = [
  "Tanker Request",
  "Pressure Check",
  "Meter Calibration",
  "Water Quality Testing",
];

const alertSeverities: Alert["severity"][] = [
  "critical",
  "warning",
  "info",
  "success",
];

/** No equivalent in packages/types yet (additive citizen field). */
const urgencies = ["Low", "Normal", "High", "Emergency"] as const;

/** Build a Zod enum from a literal list already checked against @water/types. */
function asEnum<T extends string>(values: T[]): z.ZodEnum<[T, ...T[]]> {
  return z.enum(values as [T, ...T[]]);
}

const phoneRegex = /^(?:\+?91[\s-]?)?[6-9]\d{9}$/;

export const phoneSchema = z
  .string()
  .regex(phoneRegex, "Phone must be a valid 10-digit Indian mobile number");

export const otpRequestSchema = z.object({
  phone: phoneSchema,
});

export const otpVerifySchema = z.object({
  phone: phoneSchema,
  otp: z.string().min(4).max(8),
  name: z.string().min(1).max(120).optional(),
  ward: z.string().min(1).max(120).optional(),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const complaintStatusSchema = asEnum([
  ...complaintStatuses,
  // Accepted extra vocabulary: "Assigned" is the citizen lifecycle step
  // (Open -> Assigned -> In Progress -> Resolved); "Pending"/"Escalated"
  // come from contracts/openapi.yaml ("Pending" is treated as "Open").
  "Assigned",
  "Pending",
  "Escalated",
] as const);

export const newComplaintSchema = z.object({
  type: z.string().min(1).max(80),
  ward: z.string().min(1).max(120),
  description: z.string().min(10).max(2000),
  address: z.string().max(500).optional(),
  location: z.string().max(500).optional(),
  priority: asEnum(complaintPriorities).optional(),
  photoUrl: z.string().max(20000).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const updateComplaintSchema = z.object({
  status: complaintStatusSchema.optional(),
  priority: asEnum(complaintPriorities).optional(),
  assigned: z.string().min(1).max(120).optional(),
  note: z.string().max(1000).optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  email: z.string().email().max(160).optional(),
  ward: z.string().min(1).max(120).optional(),
  address: z.string().max(500).optional(),
});

export const payBillSchema = z.object({
  billId: z.string().min(1),
});

export const newAlertSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  severity: asEnum(alertSeverities),
  targetWards: z.array(z.string()).optional(),
});

export const tankerRequestSchema = z.object({
  ward: z.string().min(1).max(120),
  address: z.string().min(5).max(500),
  urgency: asEnum([...urgencies]).optional(),
  timeSlot: z.string().min(1).max(80).optional(),
  capacityKL: z.number().positive().max(50).optional(),
  citizenName: z.string().min(1).max(120).optional(),
  phone: phoneSchema.optional(),
  notes: z.string().max(1000).optional(),
});

export const serviceRequestSchema = z.object({
  ward: z.string().min(1).max(120),
  address: z.string().min(5).max(500),
  serviceType: asEnum(serviceTypes),
  urgency: asEnum([...urgencies]).optional(),
  timeSlot: z.string().min(1).max(80).optional(),
  notes: z.string().max(1000).optional(),
  citizenName: z.string().min(1).max(120).optional(),
  phone: phoneSchema.optional(),
});

/** Inferred input types — routes use these instead of re-typing shapes. */
export type NewComplaintInput = z.infer<typeof newComplaintSchema>;
export type UpdateComplaintInput = z.infer<typeof updateComplaintSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type NewAlertInput = z.infer<typeof newAlertSchema>;
export type TankerRequestInput = z.infer<typeof tankerRequestSchema>;
export type ServiceRequestInput = z.infer<typeof serviceRequestSchema>;
