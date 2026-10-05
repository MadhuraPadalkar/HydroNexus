import type {
  Alert,
  ApiResponse,
  AuditLog,
  Bill,
  CitizenRecord,
  Complaint,
  LeakageIncident,
  MaintenanceTask,
  Notice,
  NRWZoneMetric,
  OfficerUser,
  Outage,
  ServiceRequest,
  SupplyScheduleItem,
  UsageDataPoint,
  UserSession,
  WaterConnectionApplication,
  WorkOrder,
} from "@water/types"

// ----------------------------------------------------------------------------
// Response adapters: tolerate BOTH the TypeScript UI shapes (used by mocks)
// and the OpenAPI contract shapes (returned by the real backend), mapping
// everything to the UI shapes the officer portal renders.
// Prefer fixing mismatches here — never in page components.
// ----------------------------------------------------------------------------

type AnyRecord = Record<string, unknown>

function isObject(v: unknown): v is AnyRecord {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function str(v: unknown, fallback = ""): string {
  if (typeof v === "string") return v
  if (typeof v === "number" || typeof v === "boolean") return String(v)
  return fallback
}

function num(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string") {
    const m = v.replace(/,/g, "").match(/-?\d+(\.\d+)?/)
    if (m) return Number(m[0])
  }
  return fallback
}

/** Pick a value from an allowed enum set, falling back safely. */
function oneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return typeof value === "string" &&
    (allowed as readonly string[]).includes(value)
    ? value as T
    : fallback
}

/** Unwrap the standard { success, data } envelope; tolerate raw payloads. */
export function unwrapData<T>(json: unknown): T {
  if (isObject(json) && "data" in json) return (json as { data: T }).data
  return json as T
}

export function wrapOk<T>(data: T): ApiResponse<T> {
  return { success: true, data }
}

/** Normalize a real-backend envelope into ApiResponse<T> with mapped items. */
export function normalizeList<T, R>(
  json: unknown,
  map: (item: AnyRecord) => R,
): ApiResponse<R[]> {
  const data = unwrapData<unknown>(json)
  const arr = Array.isArray(data) ? data : []
  return wrapOk(arr.map((i) => (isObject(i) ? map(i) : i as unknown as R)))
}

export function normalizeOne<T, R>(
  json: unknown,
  map: (item: AnyRecord) => R,
): ApiResponse<R> {
  const data = unwrapData<unknown>(json)
  if (isObject(data)) return wrapOk(map(data))
  return wrapOk(data as unknown as R)
}

/** Decode a JWT payload without verifying (verification is backend's job). */
export function decodeJwtPayload(token: string): AnyRecord | null {
  try {
    const part = token.split(".")[1]
    if (!part) return null
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"))
    const payload = JSON.parse(json)
    return isObject(payload) ? payload : null
  } catch {
    return null
  }
}

/** Build a UserSession from a real JWT when no cached session exists. */
export function sessionFromToken(token: string): UserSession | null {
  const p = decodeJwtPayload(token)
  if (!p || typeof p.sub !== "string") return null
  const role = str(p.role, "Operator")
  return {
    token,
    user: {
      id: str(p.sub, "USR-UNKNOWN"),
      name: str(p.name, str(p.email, "Officer")),
      role: oneOf(
        role,
        ["Admin", "Engineer", "Supervisor", "Operator", "Citizen"] as const,
        "Operator",
      ),
      email: typeof p.email === "string" ? p.email : undefined,
      phone: typeof p.phone === "string" ? p.phone : undefined,
      department: typeof p.department === "string" ? p.department : undefined,
      zone: typeof p.zone === "string" ? p.zone : undefined,
      ward: typeof p.ward === "string" ? p.ward : undefined,
    },
  }
}

// ----------------------------------------------------------------------------
// Entity normalizers (contract shape OR ui shape -> ui shape)
// ----------------------------------------------------------------------------

export function normalizeComplaint(r: AnyRecord): Complaint {
  const ward = isObject(r.ward)
    ? str(r.ward.name ?? r.ward.short_name)
    : str(r.ward)
  const assigned = isObject(r.assigned)
    ? str(r.assigned.name)
    : str(r.assigned ?? r.assigned_to ?? r.assignedTo)
  return {
    id: str(r.id ?? r.code),
    type: str(r.type, "Other"),
    citizen: str(r.citizen ?? r.citizen_name ?? r.citizenName),
    ward,
    address: str(r.address),
    location: str(r.location ?? r.address),
    phone: str(r.phone),
    reported: str(r.reported ?? r.reported_at ?? r.reportedAt),
    date: str(r.date ?? r.reported ?? r.reported_at),
    assigned: assigned || undefined,
    priority: oneOf(
      r.priority,
      ["Low", "Medium", "High", "Critical"] as const,
      "Medium",
    ),
    status: str(r.status, "Open") as Complaint["status"],
    description: str(r.description),
    updated: str(r.updated ?? r.updated_at ?? r.updatedAt),
    icon: str(r.icon, "report_problem"),
  }
}

export function normalizeSupplyItem(r: AnyRecord): SupplyScheduleItem {
  const pressure =
    typeof r.pressure === "number" ? r.pressure : num(r.pressure, 0)
  const scheduled =
    str(r.scheduled) ||
    [str(r.morning), str(r.evening)].filter(Boolean).join(" / ") ||
    "—"
  return {
    ward: str(r.ward ?? r.zone),
    zone: str(r.zone ?? r.ward),
    scheduled,
    actual: str(r.actual, "—"),
    pressure,
    status: oneOf(
      r.status,
      ["On Time", "Delayed", "Disrupted"] as const,
      "On Time",
    ),
  }
}

const OUTAGE_STATUS: Record<string, Outage["status"]> = {
  Active: "Active",
  Ongoing: "Active",
  Scheduled: "Scheduled",
  Resolved: "Resolved",
  Completed: "Resolved",
}

export function normalizeOutage(r: AnyRecord): Outage {
  const areas = Array.isArray(r.affectedAreas)
    ? (r.affectedAreas as unknown[]).map((a) => str(a)).filter(Boolean)
    : []
  return {
    id: str(r.id ?? r.code),
    ward: str(r.ward ?? areas[0]),
    zone: str(r.zone),
    reason: str(r.reason ?? r.title),
    type:
      r.type === "Emergency" || r.type === "Scheduled" ? r.type : "Scheduled",
    startTime: str(r.startTime ?? r.start_time),
    estimatedRestoration: str(
      r.estimatedRestoration ?? r.estimatedEndTime ?? r.estimated_restoration,
    ),
    status: OUTAGE_STATUS[str(r.status)] ?? "Scheduled",
    affectedPopulation: num(
      r.affectedPopulation ?? r.affected_population ?? areas.length * 1000,
    ),
    tankersDispatched: num(r.tankersDispatched ?? r.tankers_dispatched),
  }
}

export function normalizeMaintenance(r: AnyRecord): MaintenanceTask {
  const rawType = str(r.type ?? r.taskType ?? r.task_type)
  const type: MaintenanceTask["type"] =
    rawType === "Preventive" ||
    rawType === "Corrective" ||
    rawType === "Inspection"
      ? rawType
      : "Preventive"
  return {
    id: str(r.id ?? r.code),
    title:
      str(r.title ?? `${str(r.facility)} — ${rawType}`.trim()) ||
      "Maintenance task",
    type,
    ward: str(isObject(r.ward) ? r.ward.name : r.ward),
    scheduledDate: str(r.scheduledDate ?? r.scheduled_date),
    status: oneOf(
      r.status,
      ["Scheduled", "In Progress", "Completed", "Pending"] as const,
      "Scheduled",
    ),
    priority: oneOf(
      r.priority,
      ["Low", "Medium", "High", "Critical"] as const,
      "Medium",
    ),
    assignedTeam: str(r.assignedTeam ?? r.assigned_team),
    notes: str(r.notes) || undefined,
  }
}

export function normalizeNRW(r: AnyRecord): NRWZoneMetric {
  const inputMLD = num(r.inflowMLD ?? r.inflow_mld)
  const billedMLD = num(r.billedMLD ?? r.billed_mld)
  const inputKL = num(r.inputVolumeKL ?? r.input_volume_kl, inputMLD * 1000)
  const billedKL = num(r.billedVolumeKL ?? r.billed_volume_kl, billedMLD * 1000)
  const pct = num(
    r.nrwPercentage ?? r.nrw_percentage,
    inputKL > 0 ? ((inputKL - billedKL) * 100) / inputKL : 0,
  )
  const status = str(r.status)
  return {
    zone: str(r.zone ?? r.zoneName ?? r.zone_name),
    inputVolumeKL: inputKL,
    billedVolumeKL: billedKL,
    nrwVolumeKL: num(r.nrwVolumeKL ?? r.nrw_volume_kl, inputKL - billedKL),
    nrwPercentage: Math.round(pct * 100) / 100,
    targetPercentage: num(r.targetPercentage ?? r.target_percentage, 15),
    trend: str(
      r.trend,
      status === "Good" ? "-0.5%" : status === "Critical" ? "+1.5%" : "0.0%",
    ),
  }
}

const LEAK_STATUS: Record<string, LeakageIncident["status"]> = {
  Reported: "Reported",
  Detected: "Reported",
  Assigned: "Assigned",
  Investigating: "Investigating",
  Repaired: "Repaired",
}

export function normalizeLeakage(r: AnyRecord): LeakageIncident {
  return {
    id: str(r.id ?? r.code),
    location: str(r.location),
    ward: str(isObject(r.ward) ? r.ward.name : r.ward),
    detectedAt: str(r.detectedAt ?? r.detected_at),
    estimatedLossLPS: num(
      r.estimatedLossLPS ?? r.estimated_loss_lps,
      num(r.estimatedLossLPH ?? r.estimated_loss_lph) / 3600,
    ),
    severity: oneOf(
      r.severity,
      ["Minor", "Moderate", "Severe", "Critical"] as const,
      "Moderate",
    ),
    status: LEAK_STATUS[str(r.status)] ?? "Reported",
    dma: str(r.dma ?? r.dma_zone ?? r.dmaZone),
  }
}

export function normalizeCitizen(r: AnyRecord): CitizenRecord {
  const rawType = str(r.connectionType ?? r.connection_type, "Domestic")
  const connectionType: CitizenRecord["connectionType"] = rawType.startsWith(
    "Domestic",
  )
    ? "Domestic"
    : rawType.startsWith("Commercial")
      ? "Commercial"
      : rawType.startsWith("Industrial")
        ? "Industrial"
        : "Domestic"
  const rawStatus = str(r.status, "Active")
  return {
    id: str(r.id ?? r.consumerNumber ?? r.consumer_number),
    consumerNumber: str(r.consumerNumber ?? r.consumer_number ?? r.consumerId),
    name: str(r.name ?? r.applicantName),
    phone: str(r.phone),
    email: str(r.email),
    ward: str(isObject(r.ward) ? r.ward.name : r.ward),
    address: str(r.address),
    connectionType,
    meterNumber: str(r.meterNumber ?? r.meter_number),
    status: (rawStatus === "Active" || rawStatus === "Suspended"
      ? rawStatus
      : "Active") as CitizenRecord["status"],
    currentBalance: num(
      r.currentBalance ?? r.balanceAmount ?? r.balance_amount,
    ),
  }
}

const APP_STATUS: Record<string, WaterConnectionApplication["status"]> = {
  "Under Review": "Under Review",
  Pending: "Under Review",
  Approved: "Approved",
  "Site Inspection": "Site Inspection",
  "Meter Installed": "Meter Installed",
  Rejected: "Rejected",
}

export function normalizeApplication(r: AnyRecord): WaterConnectionApplication {
  return {
    id: str(r.id ?? r.applicationId ?? r.application_number),
    applicantName: str(r.applicantName ?? r.applicant_name),
    ward: str(isObject(r.ward) ? r.ward.name : r.ward),
    address: str(r.address),
    type: str(r.type ?? r.propertyType, "Domestic").startsWith("Commercial")
      ? "Commercial"
      : "Domestic",
    appliedDate: str(r.appliedDate ?? r.applied_at ?? r.appliedDate),
    status: APP_STATUS[str(r.status)] ?? "Under Review",
    approvedBy: str(r.approvedBy ?? r.approved_by) || undefined,
  }
}

export function normalizeServiceRequest(r: AnyRecord): ServiceRequest {
  return {
    id: str(r.id ?? r.code),
    citizenName: str(r.citizenName ?? r.citizen_name),
    phone: str(r.phone),
    ward: str(isObject(r.ward) ? r.ward.name : r.ward),
    address: str(r.address),
    serviceType: oneOf(
      r.serviceType,
      [
        "Tanker Request",
        "Pressure Check",
        "Meter Calibration",
        "Water Quality Testing",
      ] as const,
      "Tanker Request",
    ),
    requestedDate: str(r.requestedDate ?? r.requested_at ?? r.requestedAt),
    status: oneOf(
      r.status,
      ["Pending", "Assigned", "En Route", "Completed"] as const,
      "Pending",
    ),
    vehicleNumber: str(r.vehicleNumber ?? r.vehicle_number) || undefined,
    driverName: str(r.driverName ?? r.driver_name) || undefined,
    notes: str(r.notes) || undefined,
  }
}

export function normalizeBill(r: AnyRecord): Bill {
  return {
    id: str(r.id ?? r.bill_number),
    consumerNumber: str(r.consumerNumber ?? r.consumer_number),
    period: str(r.period),
    dueDate: str(r.dueDate ?? r.due_date),
    amount: num(r.amount),
    consumptionKL: num(r.consumptionKL ?? r.consumption_kl),
    status: oneOf(r.status, ["Paid", "Unpaid", "Overdue"] as const, "Unpaid"),
    billDate: str(r.billDate ?? r.bill_date),
  }
}

export function normalizeUsage(r: AnyRecord): UsageDataPoint {
  return {
    month: str(r.month),
    usage: num(r.usage ?? r.usage_kl),
    cost: r.cost === undefined ? undefined : num(r.cost),
  }
}

export function normalizeAlert(r: AnyRecord): Alert {
  const wards = Array.isArray(r.targetWards)
    ? (r.targetWards as unknown[]).map((w) => str(w))
    : Array.isArray(r.target_wards)
      ? (r.target_wards as unknown[]).map((w) => str(w))
      : undefined
  return {
    id: r.id as number | string ?? str(r.code),
    severity: oneOf(
      r.severity,
      ["critical", "warning", "info", "success"] as const,
      "info",
    ),
    icon: str(r.icon, "notifications"),
    title: str(r.title),
    body: str(r.body ?? r.content),
    time: str(r.time ?? r.sent_at ?? r.sentAt),
    targetWards: wards,
    sentBy: str(r.sentBy ?? r.sent_by) || undefined,
  }
}

export function normalizeNotice(r: AnyRecord): Notice {
  return {
    id: str(r.id ?? r.code),
    title: str(r.title),
    category: oneOf(
      r.category,
      ["General", "Tariff", "Maintenance", "Emergency"] as const,
      "General",
    ),
    date: str(r.date ?? r.sent_at ?? r.sentAt),
    content: str(r.content ?? r.body),
    priority: oneOf(r.priority, ["High", "Normal", "Low"] as const, "Normal"),
  }
}

export function normalizeOfficer(r: AnyRecord): OfficerUser {
  return {
    id: str(r.id ?? r.public_id),
    name: str(r.name),
    email: str(r.email),
    phone: str(r.phone),
    role: oneOf(
      r.role,
      ["Admin", "Engineer", "Supervisor", "Operator"] as const,
      "Operator",
    ),
    department: str(r.department),
    zone: str(isObject(r.zone) ? r.zone.name : (r.zone ?? "")),
    status: r.status === "Inactive" ? "Inactive" : "Active",
    lastActive: str(r.lastActive ?? r.last_active_at ?? r.lastActiveAt, ""),
  }
}

export function normalizeAudit(r: AnyRecord): AuditLog {
  return {
    id: str(r.id ?? r.code),
    user: str(r.user ?? r.actor ?? r.actor_name),
    role: str(r.role ?? r.actor_role),
    action: str(r.action),
    module: str(r.module),
    target: str(r.target),
    ip: str(r.ip ?? r.ipAddress ?? r.ip_address),
    time: str(r.time ?? r.timestamp ?? r.created_at),
    severity: oneOf(
      r.severity,
      ["Info", "Warning", "Critical"] as const,
      "Info",
    ),
  }
}

export function normalizeWorkOrder(r: AnyRecord): WorkOrder {
  const rawType = str(r.type, "Corrective")
  return {
    id: str(r.id ?? r.code),
    complaintId: str(r.complaintId ?? r.complaint_id) || undefined,
    title: str(r.title),
    type:
      rawType === "Preventive" || rawType === "Inspection"
        ? rawType
        : "Corrective",
    ward: str(isObject(r.ward) ? r.ward.name : r.ward),
    scheduledDate: str(r.scheduledDate ?? r.scheduled_date),
    status: oneOf(
      r.status,
      ["Pending", "Assigned", "In Progress", "Completed", "Cancelled"] as const,
      "Pending",
    ),
    priority: oneOf(
      r.priority,
      ["Low", "Medium", "High", "Critical"] as const,
      "Medium",
    ),
    export function normalizeWorkOrder(r: AnyRecord): WorkOrder {
  const rawType = str(r.type, "Corrective")
  return {
    id: str(r.id ?? r.code),
    complaintId: str(r.complaintId ?? r.complaint_id) || undefined,
    title: str(r.title),
    type:
      rawType === "Preventive" || rawType === "Inspection"
        ? rawType
        : "Corrective",
    ward: str(isObject(r.ward) ? r.ward.name : r.ward),
    scheduledDate: str(r.scheduledDate ?? r.scheduled_date),
    status: oneOf(
      r.status,
      ["Pending", "Assigned", "In Progress", "Completed", "Cancelled"] as const,
      "Pending",
    ),
    priority: oneOf(
      r.priority,
      ["Low", "Medium", "High", "Critical"] as const,
      "Medium",
    ),
    assignedTeam: str(r.assignedTeam ?? r.assigned_team),
    assignedTo: str(r.assignedTo ?? r.assigned_to) || undefined,  // Already correct
    notes: str(r.notes) || undefined,  // Already correct
  }
}
  }
}
