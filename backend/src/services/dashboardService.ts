// Dashboard + analytics assembly. Reads the same repositories the list
// endpoints serve, so KPIs can never drift from the underlying modules.
import type { DashboardSummary, WardStats } from "../domain"
import { citizenRepository } from "../repositories/citizenRepository"
import { complaintRepository } from "../repositories/complaintRepository"
import { notificationRepository } from "../repositories/notificationRepository"
import { nrwRepository } from "../repositories/nrwRepository"
import { supplyRepository } from "../repositories/supplyRepository"
import { wardRepository } from "../repositories/wardRepository"

export function dashboardSummary(): DashboardSummary {
  const active = complaintRepository
    .findAll()
    .filter((c) => c.status !== "Resolved")
  const city = nrwRepository.citySummary()
  const activeAlerts = notificationRepository
    .listAlerts()
    .filter((a) => a.severity === "critical" || a.severity === "warning").length
  return {
    totalWards: wardRepository.findAll().length,
    activeComplaints: active.length,
    criticalComplaints: active.filter((c) => c.priority === "Critical").length,
    cityNrwPct: city.nrwPercentage,
    activeAlerts,
    citizensServed: citizenRepository.listCitizens().length,
    generatedAt: "Just now",
  }
}

export function waterStatus(): {
  overall: string
  onTime: number
  delayed: number
  disrupted: number
  activeOutages: number
  wards: ReturnType<typeof supplyRepository.listSchedules>
} {
  const rows = supplyRepository.listSchedules()
  const disrupted = rows.filter((r) => r.status === "Disrupted").length
  const delayed = rows.filter((r) => r.status === "Delayed").length
  const activeOutages = supplyRepository.listOutages({
    status: "Active",
  }).length
  return {
    overall:
      disrupted > 0 || activeOutages > 0
        ? "Attention"
        : delayed > 0
          ? "Stable"
          : "Normal",
    onTime: rows.filter((r) => r.status === "On Time").length,
    delayed,
    disrupted,
    activeOutages,
    wards: rows,
  }
}

export interface WardComparisonResult extends WardStats {
  ward: string
  score: number
}

function scoreOf(s: WardStats): number {
  return Math.round(
    Math.max(
      0,
      Math.min(100, 100 - s.nrw - s.complaints / 2 - (s.resolution - 1) * 5),
    ),
  )
}

export function wardComparison(
  names: string[],
): { unknown: string[]; rows?: WardComparisonResult[] } {
  const pick = names.length
    ? names
    : Object.keys(nrwRepository.listWardStats()).slice(0, 4)
  const stats = nrwRepository.listWardStats()
  const unknown = pick.filter((w) => !stats[w])
  if (unknown.length) return { unknown }
  return {
    unknown: [],
    rows: pick.map((ward) => ({
      ward,
      ...stats[ward],
      score: scoreOf(stats[ward]),
    })),
  }
}
