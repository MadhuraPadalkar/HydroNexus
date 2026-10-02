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
  type Alert,
  type WaterConnectionApplication,
  type ServiceRequest,
} from "@/services/api"

export function useCitizenComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchComplaints = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await complaintsApi.getComplaints()
      setComplaints(res.data)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch complaints",
      )
    } finally {
      setLoading(false)
    }
  }, [])

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
        err instanceof Error ? err.message : "Failed to fetch supply status",
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSupply()
  }, [fetchSupply])

  return { schedules, outages, loading, error, refetch: fetchSupply }
}

export function useCitizenBills() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBills = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await billingApi.getBills()
      setBills(res.data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch bills")
    } finally {
      setLoading(false)
    }
  }, [])

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

  const fetchAlerts = useCallback(async () => {
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
    fetchAlerts()
  }, [fetchAlerts])

  return { alerts, loading, error, refetch: fetchAlerts }
}

export function useCitizenServices() {
  const [applications, setApplications] =
    useState<WaterConnectionApplication[]>([])
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      setError(err instanceof Error ? err.message : "Failed to fetch services")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  return { applications, requests, loading, error, refetch: fetchServices }
}
