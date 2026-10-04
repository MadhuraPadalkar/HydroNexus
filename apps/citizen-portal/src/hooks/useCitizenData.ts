import { useState, useEffect, useCallback } from "react"
import {
  complaintsApi,
  supplyApi,
  billingApi,
  alertsApi,
  citizensApi,
  type Complaint,
  type SupplyScheduleItem,
  type Outage,
  type Bill,
  type UsageDataPoint,
  type Alert,
  type Notice,
  type WaterConnectionApplication,
  type ServiceRequest,
} from "@/services/api"
import { useLanguage } from "@/i18n/LanguageContext"

export function useCitizenComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t } = useLanguage()

  const fetchComplaints = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await complaintsApi.getComplaints()
      setComplaints(res.data)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : t.errors.complaints,
      )
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchComplaints()
  }, [fetchComplaints])

  const submitComplaint = async (data: Partial<Complaint>) => {
    return await complaintsApi.createComplaint(data)
  }

  return {
    complaints,
    loading,
    error,
    refetch: fetchComplaints,
    submitComplaint,
  }
}

export function useCitizenSupply() {
  const [schedules, setSchedules] = useState<SupplyScheduleItem[]>([])
  const [outages, setOutages] = useState<Outage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t } = useLanguage()

  const fetchSupply = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [sRes, oRes] = await Promise.all([
        supplyApi.getSchedule(),
        supplyApi.getOutages(),
      ])
      setSchedules(sRes.data)
      setOutages(oRes.data)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : t.errors.supply,
      )
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchSupply()
  }, [fetchSupply])

  return { schedules, outages, loading, error, refetch: fetchSupply }
}

export function useCitizenBills() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t } = useLanguage()

  const fetchBills = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await billingApi.getBills()
      setBills(res.data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.errors.bills)
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchBills()
  }, [fetchBills])

  const payBill = async (billId: string) => {
    return await billingApi.payBill(billId)
  }

  return { bills, loading, error, refetch: fetchBills, payBill }
}

export function useCitizenAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t } = useLanguage()

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await alertsApi.getAlerts()
      setAlerts(res.data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.errors.alerts)
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  return { alerts, loading, error, refetch: fetchAlerts }
}

export function useCitizenNotices() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t } = useLanguage()

  const fetchNotices = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await alertsApi.getNotices()
      setNotices(res.data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.errors.notices)
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchNotices()
  }, [fetchNotices])

  return { notices, loading, error, refetch: fetchNotices }
}

export function useCitizenUsage() {
  const [usage, setUsage] = useState<UsageDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t } = useLanguage()

  const fetchUsage = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await billingApi.getUsage()
      setUsage(res.data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.errors.usage)
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  return { usage, loading, error, refetch: fetchUsage }
}

export function useComplaintDetail(id: string | undefined) {
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t } = useLanguage()

  const fetchDetail = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await complaintsApi.getComplaintById(id)
      setComplaint(res.data)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : t.errors.complaint,
      )
    } finally {
      setLoading(false)
    }
  }, [id, t])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  return { complaint, loading, error, refetch: fetchDetail }
}

export function useCitizenServices() {
  const [applications, setApplications] =
    useState<WaterConnectionApplication[]>([])
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t } = useLanguage()

  const fetchServices = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [aRes, rRes] = await Promise.all([
        citizensApi.getApplications(),
        citizensApi.getServiceRequests(),
      ])
      setApplications(aRes.data)
      setRequests(rRes.data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.errors.services)
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  return { applications, requests, loading, error, refetch: fetchServices }
}
