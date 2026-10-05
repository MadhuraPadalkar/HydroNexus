import type {
  ApiError,
  ApiResponse,
  UserSession,
  Complaint,
  SupplyScheduleItem,
  Outage,
  MaintenanceTask,
  NRWZoneMetric,
  LeakageIncident,
  CitizenRecord,
  WaterConnectionApplication,
  ServiceRequest,
  Bill,
  UsageDataPoint,
  Alert,
  Notice,
  GaugeStation,
  RainfallData,
  OfficerUser,
  RolePermissions,
  SystemSettingsConfig,
  AuditLog,
  WorkOrder,
} from "@water/types"
import { http } from "./http"
import {
  normalizeAlert,
  normalizeApplication,
  normalizeAudit,
  normalizeBill,
  normalizeCitizen,
  normalizeComplaint,
  normalizeLeakage,
  normalizeList,
  normalizeMaintenance,
  normalizeNotice,
  normalizeNRW,
  normalizeOfficer,
  normalizeOne,
  normalizeOutage,
  normalizeServiceRequest,
  normalizeSupplyItem,
  normalizeUsage,
  normalizeWorkOrder,
  sessionFromToken,
  wrapOk,
} from "./adapters"
import {
  mockOfficerSession,
  mockCitizenSession,
  mockComplaints,
  mockSupplySchedule,
  mockOutages,
  mockMaintenanceTasks,
  mockNRWMetrics,
  mockLeakageIncidents,
  mockCitizens,
  mockConnectionApplications,
  mockServiceRequests,
  mockBills,
  mockUsageData,
  mockAlerts,
  mockNotices,
  mockGaugeStations,
  mockRainfall,
  mockOfficers,
  mockRolePermissions,
  mockSystemSettings,
  mockAuditLogs,
} from "./mocks/data"

function isMock(): boolean {
  // @ts-ignore
  if (typeof import.meta !== "undefined" && import.meta.env) {
    // @ts-ignore
    return import.meta.env.VITE_USE_MOCKS !== "false"
  }
  return true
}

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Try the canonical contract endpoint first, fall back to the legacy path
 * used by earlier client versions. Lets one client work against backends
 * built at different times (Person 2 / Person 3).
 */
async function withLegacyFallback<T>(
  primary: () => Promise<ApiResponse<T>>,
  legacy: () => Promise<ApiResponse<T>>,
): Promise<ApiResponse<T>> {
  try {
    return await primary()
  } catch (err) {
    const status = (err as ApiError)?.status
    if (status === 404 || status === 0) return legacy()
    throw err
  }
}

export const authApi = {
  async loginOfficer(
    email: string,
    _password?: string,
  ): Promise<ApiResponse<UserSession>> {
    if (isMock()) {
      await delay()
      const session = {
        ...mockOfficerSession,
        user: {
          ...mockOfficerSession.user,
          email: email || mockOfficerSession.user.email,
        },
      }
      http.setToken(session.token)
      return { success: true, data: session }
    }
    const res = await http.post<UserSession>("/auth/officer/login", {
      email,
      password: _password,
    })
    if (res.data?.token) http.setToken(res.data.token)
    return res
  },

  async loginCitizen(phone: string): Promise<ApiResponse<{
    otpSent: boolean
  }>> {
    if (isMock()) {
      await delay()
      return { success: true, data: { otpSent: true } }
    }
    return http.post<{ otpSent: boolean }>("/auth/citizen/otp/request", {
      phone,
    })
  },

  async verifyOtp(
    _phone: string,
    _otp: string,
  ): Promise<ApiResponse<UserSession>> {
    if (isMock()) {
      await delay()
      http.setToken(mockCitizenSession.token)
      return { success: true, data: mockCitizenSession }
    }
    const res = await http.post<UserSession>("/auth/citizen/otp/verify", {
      phone: _phone,
      otp: _otp,
    })
    if (res.data?.token) http.setToken(res.data.token)
    return res
  },

  async logout(): Promise<void> {
    http.clearToken()
  },

  getSession(): UserSession | null {
    const token = http.getToken()
    if (!token) return null
    if (isMock()) {
      return token.includes("officer") ? mockOfficerSession : mockCitizenSession
    }
    return sessionFromToken(token)
  },
}

export interface ComplaintUpdate {
  status?: Complaint["status"]
  priority?: Complaint["priority"]
  assigned?: string
}

export const complaintsApi = {
  async getComplaints(filter?: string): Promise<ApiResponse<Complaint[]>> {
    if (isMock()) {
      await delay()
      const filtered =
        !filter || filter === "All"
          ? mockComplaints
          : mockComplaints.filter(
              (c) => c.status === filter || c.priority === filter,
            )
      return { success: true, data: filtered }
    }
    const res = await http.get<Complaint[]>("/complaints", {
      params: { filter },
    })
    return normalizeList(res, normalizeComplaint)
  },

  async getComplaintById(id: string): Promise<ApiResponse<Complaint | null>> {
    if (isMock()) {
      await delay()
      const item = mockComplaints.find((c) => c.id === id) || null
      return { success: true, data: item }
    }
    const res = await http.get<Complaint | null>(`/complaints/${id}`)
    if (!res || (res as unknown as { data: unknown }).data == null) {
      return { success: true, data: null }
    }
    return normalizeOne(res, normalizeComplaint)
  },

  async createComplaint(
    payload: Partial<Complaint>,
  ): Promise<ApiResponse<Complaint>> {
    if (isMock()) {
      await delay()
      const newComplaint: Complaint = {
        id: `KMC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        type: payload.type || "Other",
        citizen: payload.citizen || "Sunita Patil",
        ward: payload.ward || "Ward 12 - Rankala",
        location: payload.location || payload.address || "Rankala",
        phone: payload.phone || "9876543210",
        date: "Today",
        reported: "Just now",
        status: "Open",
        priority: payload.priority || "Medium",
        description: payload.description || "",
        icon: "report_problem",
      }
      mockComplaints.unshift(newComplaint)
      return { success: true, data: newComplaint }
    }
    const res = await http.post<Complaint>("/complaints", payload)
    return normalizeOne(res, normalizeComplaint)
  },

  async updateStatus(
    id: string,
    status: Complaint["status"],
  ): Promise<ApiResponse<Complaint>> {
    return complaintsApi.updateComplaint(id, { status })
  },

  /** Canonical update: PATCH /complaints/{id} (contract) with legacy fallback. */
  async updateComplaint(
    id: string,
    patch: ComplaintUpdate,
  ): Promise<ApiResponse<Complaint>> {
    if (isMock()) {
      await delay()
      const item = mockComplaints.find((c) => c.id === id)
      if (item) {
        if (patch.status) item.status = patch.status
        if (patch.priority) item.priority = patch.priority
        if (patch.assigned !== undefined) item.assigned = patch.assigned
      }
      return { success: true, data: item! }
    }
    return withLegacyFallback(
      async () => {
        const res = await http.patch<Complaint>(`/complaints/${id}`, patch)
        return normalizeOne(res, normalizeComplaint)
      },
      async () => {
        const res = await http.patch<Complaint>(`/complaints/${id}/status`, {
          status: patch.status,
        })
        return normalizeOne(res, normalizeComplaint)
      },
    )
  },
}

export const supplyApi = {
  async getSchedule(): Promise<ApiResponse<SupplyScheduleItem[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockSupplySchedule }
    }
    const res = await http.get<SupplyScheduleItem[]>("/supply/schedule")
    return normalizeList(res, normalizeSupplyItem)
  },

  async getOutages(): Promise<ApiResponse<Outage[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockOutages }
    }
    const res = await http.get<Outage[]>("/supply/outages")
    return normalizeList(res, normalizeOutage)
  },

  async getMaintenance(): Promise<ApiResponse<MaintenanceTask[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockMaintenanceTasks }
    }
    const res = await http.get<MaintenanceTask[]>("/supply/maintenance")
    return normalizeList(res, normalizeMaintenance)
  },
}

export const nrwApi = {
  async getMetrics(): Promise<ApiResponse<NRWZoneMetric[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockNRWMetrics }
    }
    const res = await http.get<NRWZoneMetric[]>("/nrw/metrics")
    return normalizeList(res, normalizeNRW)
  },

  async getLeakages(): Promise<ApiResponse<LeakageIncident[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockLeakageIncidents }
    }
    const res = await http.get<LeakageIncident[]>("/nrw/leakages")
    return normalizeList(res, normalizeLeakage)
  },
}

export const citizensApi = {
  async getCitizens(search?: string): Promise<ApiResponse<CitizenRecord[]>> {
    if (isMock()) {
      await delay()
      const q = (search || "").toLowerCase()
      const filtered =
        !q || search === undefined
          ? mockCitizens
          : mockCitizens.filter(
              (c) =>
                c.name.toLowerCase().includes(q) ||
                c.phone.includes(q) ||
                c.consumerNumber.toLowerCase().includes(q) ||
                c.ward.toLowerCase().includes(q),
            )
      return { success: true, data: filtered }
    }
    const res = await http.get<CitizenRecord[]>("/citizens", {
      params: { search },
    })
    return normalizeList(res, normalizeCitizen)
  },

  async getApplications(): Promise<ApiResponse<WaterConnectionApplication[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockConnectionApplications }
    }
    const res = await http.get<WaterConnectionApplication[]>(
      "/citizens/applications",
    )
    return normalizeList(res, normalizeApplication)
  },

  async getServiceRequests(): Promise<ApiResponse<ServiceRequest[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockServiceRequests }
    }
    return withLegacyFallback(
      async () => {
        const res = await http.get<ServiceRequest[]>("/citizens/requests")
        return normalizeList(res, normalizeServiceRequest)
      },
      async () => {
        const res = await http.get<ServiceRequest[]>(
          "/citizens/service-requests",
        )
        return normalizeList(res, normalizeServiceRequest)
      },
    )
  },

  async requestTanker(payload: {
    ward: string
    address: string
    citizenName: string
    phone: string
    capacityKL?: number
  }): Promise<ApiResponse<ServiceRequest>> {
    if (isMock()) {
      await delay()
      const req: ServiceRequest = {
        id: `SR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        citizenName: payload.citizenName,
        phone: payload.phone,
        ward: payload.ward,
        address: payload.address,
        serviceType: "Tanker Request",
        requestedDate: "Today",
        status: "Pending",
      }
      mockServiceRequests.unshift(req)
      return { success: true, data: req }
    }
    return withLegacyFallback(
      async () => {
        const res = await http.post<ServiceRequest>("/citizens/requests", {
          serviceType: "Tanker Request",
          ...payload,
        })
        return normalizeOne(res, normalizeServiceRequest)
      },
      async () => {
        const res = await http.post<ServiceRequest>(
          "/citizens/service-requests/tanker",
          payload,
        )
        return normalizeOne(res, normalizeServiceRequest)
      },
    )
  },

  async updateServiceRequest(
    id: string,
    patch: Partial<
      Pick<ServiceRequest, "status" | "vehicleNumber" | "driverName" | "notes">
    >,
  ): Promise<ApiResponse<ServiceRequest>> {
    if (isMock()) {
      await delay()
      const item = mockServiceRequests.find((r) => r.id === id)
      if (item) Object.assign(item, patch)
      return { success: true, data: item! }
    }
    return withLegacyFallback(
      async () => {
        const res = await http.patch<ServiceRequest>(
          `/citizens/requests/${id}`,
          patch,
        )
        return normalizeOne(res, normalizeServiceRequest)
      },
      async () => {
        const res = await http.patch<ServiceRequest>(
          `/citizens/service-requests/${id}`,
          patch,
        )
        return normalizeOne(res, normalizeServiceRequest)
      },
    )
  },
}

interface PayBillResponse {
  paid: boolean
  transactionId: string
}

export const billingApi = {
  async getBills(): Promise<ApiResponse<Bill[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockBills }
    }
    const res = await http.get<Bill[]>("/billing/bills")
    return normalizeList(res, normalizeBill)
  },

  async getUsage(): Promise<ApiResponse<UsageDataPoint[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockUsageData }
    }
    const res = await http.get<UsageDataPoint[]>("/billing/usage")
    return normalizeList(res, normalizeUsage)
  },

  async payBill(id: string): Promise<ApiResponse<Bill>> {
    if (isMock()) {
      await delay()
      const b = mockBills.find((bill) => bill.id === id)
      if (b) b.status = "Paid"
      return { success: true, data: b! }
    }
    return withLegacyFallback(
      async () => {
        // Contract shape: POST /billing/pay { billId } -> { paid, transactionId }
        const res = await http.post<PayBillResponse>("/billing/pay", {
          billId: id,
        })
        const data = (res as unknown as { data: unknown }).data
        if (
          typeof data === "object" &&
          data !== null &&
          ("paid" in data || "transactionId" in data)
        ) {
          const existing = mockBills.find((bill) => bill.id === id)
          return wrapOk({
            ...(existing ?? {
              id,
              consumerNumber: "",
              period: "",
              dueDate: "",
              amount: 0,
              consumptionKL: 0,
              billDate: "",
            }),
            status: "Paid" as const,
          })
        }
        return normalizeOne(res, normalizeBill)
      },
      async () => {
        const res = await http.post<Bill>(`/billing/bills/${id}/pay`)
        return normalizeOne(res, normalizeBill)
      },
    )
  },
}

export const alertsApi = {
  async getAlerts(): Promise<ApiResponse<Alert[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockAlerts }
    }
    const res = await http.get<Alert[]>("/alerts")
    return normalizeList(res, normalizeAlert)
  },

  async getNotices(): Promise<ApiResponse<Notice[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockNotices }
    }
    return withLegacyFallback(
      async () => {
        const res = await http.get<Notice[]>("/notices")
        return normalizeList(res, normalizeNotice)
      },
      async () => {
        const res = await http.get<Notice[]>("/alerts/notices")
        return normalizeList(res, normalizeNotice)
      },
    )
  },

  async sendAlert(payload: Partial<Alert>): Promise<ApiResponse<Alert>> {
    if (isMock()) {
      await delay()
      const alert: Alert = {
        id: Date.now(),
        severity: payload.severity || "info",
        icon: payload.icon || "notifications",
        title: payload.title || "Water Update",
        body: payload.body || "",
        time: "Just now",
        targetWards: payload.targetWards,
      }
      mockAlerts.unshift(alert)
      return { success: true, data: alert }
    }
    const res = await http.post<Alert>("/alerts", payload)
    return normalizeOne(res, normalizeAlert)
  },

  async createNotice(payload: Partial<Notice>): Promise<ApiResponse<Notice>> {
    if (isMock()) {
      await delay()
      const notice: Notice = {
        id: `NOT-${Date.now()}`,
        title: payload.title || "Notice",
        category: payload.category || "General",
        date: "Just now",
        content: payload.content || "",
        priority: payload.priority || "Normal",
      }
      mockNotices.unshift(notice)
      return { success: true, data: notice }
    }
    const res = await http.post<Notice>("/notices", payload)
    return normalizeOne(res, normalizeNotice)
  },
}

export const floodApi = {
  async getGaugeStations(): Promise<ApiResponse<GaugeStation[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockGaugeStations }
    }
    return http.get<GaugeStation[]>("/flood/gauges")
  },

  async getRainfall(): Promise<ApiResponse<RainfallData[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockRainfall }
    }
    return http.get<RainfallData[]>("/flood/rainfall")
  },
}

// Mock work-order store derived from maintenance fixtures so mock mode has
// coverage for the officer Complaints & Operations work queue.
const mockWorkOrders: WorkOrder[] = mockMaintenanceTasks.map((t, i) => ({
  id: `WO-2026-${String(101 + i).padStart(4, "0")}`,
  title: t.title,
  type: t.type,
  ward: t.ward,
  scheduledDate: t.scheduledDate,
  status:
    t.status === "Scheduled"
      ? "Pending"
      : t.status === "Pending"
        ? "Pending"
        : t.status,
  priority: t.priority,
  assignedTeam: t.assignedTeam,
  complaintId: "",
  assignedTo: "",
  notes: "",
}))

export const workOrdersApi = {
  async getWorkOrders(complaintId?: string): Promise<ApiResponse<WorkOrder[]>> {
    if (isMock()) {
      await delay()
      return {
        success: true,
        data: complaintId
          ? mockWorkOrders.filter((w) => w.complaintId === complaintId)
          : mockWorkOrders,
      }
    }
    const res = await http.get<WorkOrder[]>("/work-orders", {
      params: { complaintId },
    })
    return normalizeList(res, normalizeWorkOrder)
  },

  async createWorkOrder(
    payload: Partial<WorkOrder>,
  ): Promise<ApiResponse<WorkOrder>> {
    if (isMock()) {
      await delay()
      const wo: WorkOrder = {
        id: `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        title: payload.title || "Field task",
        type: payload.type || "Corrective",
        ward: payload.ward || "",
        scheduledDate: payload.scheduledDate || "Today",
        status: "Pending",
        priority: payload.priority || "Medium",
        assignedTeam: payload.assignedTeam || "Unassigned",
        complaintId: payload.complaintId || "",
        assignedTo: payload.assignedTo || "",
        notes: payload.notes || "",
      }
      mockWorkOrders.unshift(wo)
      return { success: true, data: wo }
    }
    const res = await http.post<WorkOrder>("/work-orders", payload)
    return normalizeOne(res, normalizeWorkOrder)
  },

  async updateWorkOrder(
    id: string,
    patch: Partial<WorkOrder>,
  ): Promise<ApiResponse<WorkOrder>> {
    if (isMock()) {
      await delay()
      const item = mockWorkOrders.find((w) => w.id === id)
      if (item) Object.assign(item, patch)
      return { success: true, data: item! }
    }
    const res = await http.patch<WorkOrder>(`/work-orders/${id}`, patch)
    return normalizeOne(res, normalizeWorkOrder)
  },
}

export const adminApi = {
  async getOfficers(): Promise<ApiResponse<OfficerUser[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockOfficers }
    }
    const res = await http.get<OfficerUser[]>("/admin/officers")
    return normalizeList(res, normalizeOfficer)
  },

  async getPermissions(): Promise<ApiResponse<RolePermissions[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockRolePermissions }
    }
    return http.get<RolePermissions[]>("/admin/permissions")
  },

  async getSettings(): Promise<ApiResponse<SystemSettingsConfig>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockSystemSettings }
    }
    return http.get<SystemSettingsConfig>("/admin/settings")
  },

  async updateSettings(
    settings: Partial<SystemSettingsConfig>,
  ): Promise<ApiResponse<SystemSettingsConfig>> {
    if (isMock()) {
      await delay()
      Object.assign(mockSystemSettings, settings)
      return { success: true, data: mockSystemSettings }
    }
    return http.put<SystemSettingsConfig>("/admin/settings", settings)
  },

  async getAuditLogs(): Promise<ApiResponse<AuditLog[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockAuditLogs }
    }
    const res = await http.get<AuditLog[]>("/admin/audit-logs")
    return normalizeList(res, normalizeAudit)
  },
}
