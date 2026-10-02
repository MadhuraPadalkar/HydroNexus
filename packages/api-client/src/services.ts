import type {
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
} from "@water/types"
import { http } from "./http"
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
    return token.includes("officer") ? mockOfficerSession : mockCitizenSession
  },
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
    return http.get<Complaint[]>("/complaints", { params: { filter } })
  },

  async getComplaintById(id: string): Promise<ApiResponse<Complaint | null>> {
    if (isMock()) {
      await delay()
      const item = mockComplaints.find((c) => c.id === id) || null
      return { success: true, data: item }
    }
    return http.get<Complaint | null>(`/complaints/${id}`)
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
    return http.post<Complaint>("/complaints", payload)
  },

  async updateStatus(
    id: string,
    status: Complaint["status"],
  ): Promise<ApiResponse<Complaint>> {
    if (isMock()) {
      await delay()
      const item = mockComplaints.find((c) => c.id === id)
      if (item) item.status = status
      return { success: true, data: item! }
    }
    return http.patch<Complaint>(`/complaints/${id}/status`, { status })
  },
}

export const supplyApi = {
  async getSchedule(): Promise<ApiResponse<SupplyScheduleItem[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockSupplySchedule }
    }
    return http.get<SupplyScheduleItem[]>("/supply/schedule")
  },

  async getOutages(): Promise<ApiResponse<Outage[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockOutages }
    }
    return http.get<Outage[]>("/supply/outages")
  },

  async getMaintenance(): Promise<ApiResponse<MaintenanceTask[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockMaintenanceTasks }
    }
    return http.get<MaintenanceTask[]>("/supply/maintenance")
  },
}

export const nrwApi = {
  async getMetrics(): Promise<ApiResponse<NRWZoneMetric[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockNRWMetrics }
    }
    return http.get<NRWZoneMetric[]>("/nrw/metrics")
  },

  async getLeakages(): Promise<ApiResponse<LeakageIncident[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockLeakageIncidents }
    }
    return http.get<LeakageIncident[]>("/nrw/leakages")
  },
}

export const citizensApi = {
  async getCitizens(): Promise<ApiResponse<CitizenRecord[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockCitizens }
    }
    return http.get<CitizenRecord[]>("/citizens")
  },

  async getApplications(): Promise<ApiResponse<WaterConnectionApplication[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockConnectionApplications }
    }
    return http.get<WaterConnectionApplication[]>("/citizens/applications")
  },

  async getServiceRequests(): Promise<ApiResponse<ServiceRequest[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockServiceRequests }
    }
    return http.get<ServiceRequest[]>("/citizens/service-requests")
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
    return http.post<ServiceRequest>(
      "/citizens/service-requests/tanker",
      payload,
    )
  },
}

export const billingApi = {
  async getBills(): Promise<ApiResponse<Bill[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockBills }
    }
    return http.get<Bill[]>("/billing/bills")
  },

  async getUsage(): Promise<ApiResponse<UsageDataPoint[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockUsageData }
    }
    return http.get<UsageDataPoint[]>("/billing/usage")
  },

  async payBill(id: string): Promise<ApiResponse<Bill>> {
    if (isMock()) {
      await delay()
      const b = mockBills.find((bill) => bill.id === id)
      if (b) b.status = "Paid"
      return { success: true, data: b! }
    }
    return http.post<Bill>(`/billing/bills/${id}/pay`)
  },
}

export const alertsApi = {
  async getAlerts(): Promise<ApiResponse<Alert[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockAlerts }
    }
    return http.get<Alert[]>("/alerts")
  },

  async getNotices(): Promise<ApiResponse<Notice[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockNotices }
    }
    return http.get<Notice[]>("/alerts/notices")
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
    return http.post<Alert>("/alerts", payload)
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

export const adminApi = {
  async getOfficers(): Promise<ApiResponse<OfficerUser[]>> {
    if (isMock()) {
      await delay()
      return { success: true, data: mockOfficers }
    }
    return http.get<OfficerUser[]>("/admin/officers")
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
    return http.get<AuditLog[]>("/admin/audit-logs")
  },
}
