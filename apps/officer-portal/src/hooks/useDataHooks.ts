import { useState, useEffect, useCallback } from "react"
import {
  complaintsApi,
  supplyApi,
  nrwApi,
  citizensApi,
  alertsApi,
  billingApi,
  floodApi,
  adminApi,
  workOrdersApi,
  type Complaint,
  type SupplyScheduleItem,
  type Outage,
  type MaintenanceTask,
  type NRWZoneMetric,
  type LeakageIncident,
  type CitizenRecord,
  type WaterConnectionApplication,
  type ServiceRequest,
  type Alert,
  type Bill,
  type UsageDataPoint,
  type GaugeStation,
  type Notice,
  type RainfallData,
  type OfficerUser,
  type RolePermissions,
  type SystemSettingsConfig,
  type AuditLog,
  type WorkOrder,
} from "@/services/api"

export function useComplaintsData(filter?: string) {
  const [data, setData] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchComplaints = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await complaintsApi.getComplaints(filter)
      setData(res.data)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch complaints",
      )
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchComplaints()
  }, [fetchComplaints])

  return { data, loading, error, refetch: fetchComplaints }
}

export function useSupplyData() {
  const [schedules, setSchedules] = useState<SupplyScheduleItem[]>([])
  const [outages, setOutages] = useState<Outage[]>([])
  const [maintenance, setMaintenance] = useState<MaintenanceTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [sRes, oRes, mRes] = await Promise.all([
        supplyApi.getSchedule(),
        supplyApi.getOutages(),
        supplyApi.getMaintenance(),
      ])
      setSchedules(sRes.data)
      setOutages(oRes.data)
      setMaintenance(mRes.data)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch supply data",
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { schedules, outages, maintenance, loading, error, refetch: fetchData }
}

export function useNRWData() {
  const [metrics, setMetrics] = useState<NRWZoneMetric[]>([])
  const [leakages, setLeakages] = useState<LeakageIncident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [mRes, lRes] = await Promise.all([
        nrwApi.getMetrics(),
        nrwApi.getLeakages(),
      ])
      setMetrics(mRes.data)
      setLeakages(lRes.data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch NRW data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { metrics, leakages, loading, error, refetch: fetchData }
}

export function useCitizensData() {
  const [citizens, setCitizens] = useState<CitizenRecord[]>([])
  const [applications, setApplications] =
    useState<WaterConnectionApplication[]>([])
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [cRes, aRes, sRes] = await Promise.all([
        citizensApi.getCitizens(),
        citizensApi.getApplications(),
        citizensApi.getServiceRequests(),
      ])
      setCitizens(cRes.data)
      setApplications(aRes.data)
      setServiceRequests(sRes.data)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch citizen records",
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    citizens,
    applications,
    serviceRequests,
    loading,
    error,
    refetch: fetchData,
  }
}

export function useAlertsData() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await alertsApi.getAlerts()
      setAlerts(res.data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch alerts")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { alerts, loading, error, refetch: fetchData }
}

export function useNoticesData() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await alertsApi.getNotices()
      setNotices(res.data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch notices")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { notices, loading, error, refetch: fetchData }
}

export function useBillingData() {
  const [bills, setBills] = useState<Bill[]>([])
  const [usage, setUsage] = useState<UsageDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [bRes, uRes] = await Promise.all([
        billingApi.getBills(),
        billingApi.getUsage(),
      ])
      setBills(bRes.data)
      setUsage(uRes.data)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch billing data",
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { bills, usage, loading, error, refetch: fetchData }
}

export function useWorkOrdersData(complaintId?: string) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await workOrdersApi.getWorkOrders(complaintId)
      setWorkOrders(res.data)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch work orders",
      )
    } finally {
      setLoading(false)
    }
  }, [complaintId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { workOrders, loading, error, refetch: fetchData }
}

export function useFloodData() {
  const [gauges, setGauges] = useState<GaugeStation[]>([])
  const [rainfall, setRainfall] = useState<RainfallData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [gRes, rRes] = await Promise.all([
        floodApi.getGaugeStations(),
        floodApi.getRainfall(),
      ])
      setGauges(gRes.data)
      setRainfall(rRes.data)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch flood data",
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { gauges, rainfall, loading, error, refetch: fetchData }
}

export function useAdminData() {
  const [officers, setOfficers] = useState<OfficerUser[]>([])
  const [permissions, setPermissions] = useState<RolePermissions[]>([])
  const [settings, setSettings] = useState<SystemSettingsConfig | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [oRes, pRes, sRes, aRes] = await Promise.all([
        adminApi.getOfficers(),
        adminApi.getPermissions(),
        adminApi.getSettings(),
        adminApi.getAuditLogs(),
      ])
      setOfficers(oRes.data)
      setPermissions(pRes.data)
      setSettings(sRes.data)
      setAuditLogs(aRes.data)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch admin settings",
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    officers,
    permissions,
    settings,
    auditLogs,
    loading,
    error,
    refetch: fetchData,
  }
}
