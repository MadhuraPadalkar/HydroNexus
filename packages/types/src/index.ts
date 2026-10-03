// API wrappers & Commons
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: Record<string, string[]>
}

// User & Auth
export interface UserSession {
  token: string
  user: {
    id: string
    name: string
    role: "Admin" | "Engineer" | "Supervisor" | "Operator" | "Citizen"
    email?: string
    phone?: string
    department?: string
    zone?: string
    ward?: string
    consumerId?: string
  }
}

// Complaints
export interface Complaint {
  id: string
  type: string
  citizen?: string
  ward: string
  address?: string
  location?: string
  phone?: string
  reported?: string
  date?: string
  assigned?: string
  priority?: "Low" | "Medium" | "High" | "Critical"
  status: "Open" | "In Progress" | "Resolved"
  description: string
  updated?: string
  icon?: string
  timeline?: Array<{
    status: string
    time: string
    note: string
  }>
  messages?: Array<{
    sender: string
    time: string
    text: string
    isOfficer?: boolean
  }>
}

// Supply & Outages
export interface SupplyScheduleItem {
  ward: string
  zone: string
  scheduled: string
  actual: string
  pressure: number
  status: "On Time" | "Delayed" | "Disrupted"
}

export interface Outage {
  id: string
  ward: string
  zone: string
  reason: string
  type: "Emergency" | "Scheduled"
  startTime: string
  estimatedRestoration: string
  status: "Active" | "Scheduled" | "Resolved"
  affectedPopulation: number
  tankersDispatched: number
}

export interface MaintenanceTask {
  id: string
  title: string
  type: "Preventive" | "Corrective" | "Inspection"
  ward: string
  scheduledDate: string
  status: "Scheduled" | "In Progress" | "Completed" | "Pending"
  priority: "Low" | "Medium" | "High" | "Critical"
  assignedTeam: string
  notes?: string
}

// NRW & Water Accounting
export interface NRWZoneMetric {
  zone: string
  inputVolumeKL: number
  billedVolumeKL: number
  nrwVolumeKL: number
  nrwPercentage: number
  targetPercentage: number
  trend: string
}

export interface LeakageIncident {
  id: string
  location: string
  ward: string
  detectedAt: string
  estimatedLossLPS: number
  severity: "Minor" | "Moderate" | "Severe" | "Critical"
  status: "Reported" | "Assigned" | "Repaired" | "Investigating"
  dma: string
}

// Citizens & Connections
export interface CitizenRecord {
  id: string
  consumerNumber: string
  name: string
  phone: string
  email: string
  ward: string
  address: string
  connectionType: "Domestic" | "Commercial" | "Industrial"
  meterNumber: string
  status: "Active" | "Suspended" | "Pending Verification"
  currentBalance: number
}

export interface WaterConnectionApplication {
  id: string
  applicantName: string
  ward: string
  address: string
  type: "Domestic" | "Commercial"
  appliedDate: string
  status: "Under Review" | "Approved" | "Site Inspection" | "Meter Installed" | "Rejected"
  approvedBy?: string
}

export interface ServiceRequest {
  id: string
  citizenName: string
  phone: string
  ward: string
  address: string
  serviceType: "Tanker Request" | "Pressure Check" | "Meter Calibration" | "Water Quality Testing"
  requestedDate: string
  status: "Pending" | "Assigned" | "En Route" | "Completed"
  vehicleNumber?: string
  driverName?: string
  notes?: string
}

// Billing
export interface Bill {
  id: string
  consumerNumber: string
  period: string
  dueDate: string
  amount: number
  consumptionKL: number
  status: "Paid" | "Unpaid" | "Overdue"
  billDate: string
}

export interface UsageDataPoint {
  month: string
  usage: number
  cost?: number
}

// Alerts & Communications
export interface Alert {
  id: number | string
  severity: "critical" | "warning" | "info" | "success"
  icon: string
  title: string
  body: string
  time: string
  targetWards?: string[]
  sentBy?: string
}

export interface Notice {
  id: string
  title: string
  category: "General" | "Tariff" | "Maintenance" | "Emergency"
  date: string
  content: string
  priority: "High" | "Normal" | "Low"
}

// Flood & Gauge Stations
export interface GaugeStation {
  id: string
  name: string
  level: number
  change: string
  status: "Normal" | "Watch" | "Moderate" | "Major"
  maxSafe: number
  danger: number
}

export interface RainfallData {
  day: string
  rainfall: number
  forecast: number
}

// Administration
export interface OfficerUser {
  id: string
  name: string
  email: string
  phone: string
  role: "Admin" | "Engineer" | "Supervisor" | "Operator"
  department: string
  zone: string
  status: "Active" | "Inactive"
  lastActive: string
}

export interface RolePermissions {
  role: string
  manageUsers: boolean
  manageRoles: boolean
  viewAudit: boolean
  systemSettings: boolean
  editSchedules: boolean
  approveRequests: boolean
}

export interface SystemSettingsConfig {
  autoFloodAlert: boolean
  floodMinor: string
  floodModerate: string
  floodMajor: string
  nrwWarningThreshold: string
  slaCriticalHours: string
  slaGeneralHours: string
}

export interface AuditLog {
  id: string
  user: string
  role: string
  action: string
  module: string
  target: string
  ip: string
  time: string
  severity: "Info" | "Warning" | "Critical"
}

// Officer operations (added for the officer-facing backend; no existing
// interface was modified).
export interface WorkOrder {
  id: string
  complaintId?: string
  title: string
  ward: string
  assignedTo: string
  priority: "Low" | "Medium" | "High" | "Critical"
  status: "Open" | "In Progress" | "On Hold" | "Completed" | "Cancelled"
  createdAt: string
  updatedAt: string
  notes: string
}

export interface Ward {
  id: string
  name: string
  zone: string
  population: number
  households: number
  coveragePct: number
  supplyHours: string
  status: "Normal" | "Watch" | "Disrupted"
}
