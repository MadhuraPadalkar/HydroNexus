import type { Alert, Notice } from "../../../packages/types/src/index"
import { db } from "./store"

export type AlertSeverity = Alert["severity"]
export type AlertType = "Supply" | "Shortage" | "Flood" | "General"

export interface CreateAlertInput {
  title: string
  body: string
  severity?: AlertSeverity
  type?: AlertType
  targetWards?: string[]
  icon?: string
  sentBy?: string
}

const TYPE_TO_SEVERITY: Record<AlertType, AlertSeverity> = {
  Supply: "info",
  Shortage: "warning",
  Flood: "critical",
  General: "info",
}

/**
 * Shared alert/notice repository.
 * Read side (alertsForWard, readIds, notices) used by citizen routes.
 * Write side (createAlert) used by officer POST /alerts.
 */
export const notificationRepository = {
  /** Officer-side: list all alerts, optional ?severity= filter. */
  listAlerts(filters: { severity?: string } = {}): Alert[] {
    let items = [...db.alerts]
    if (filters.severity) {
      items = items.filter((a) => a.severity === filters.severity)
    }
    return items
  },

  /** Citizen-side: alerts targeted at a specific ward (fuzzy ward match). */
  alertsForWard(ward?: string): Alert[] {
    if (!ward) return [...db.alerts]
    const w = ward.toLowerCase()
    const wardNum = (ward.match(/\d+/) || [])[0]
    return db.alerts.filter((a) => {
      const targets = a.targetWards || []
      if (targets.some((t) => t.toLowerCase() === "all wards")) return true
      return targets.some((t) => {
        const tl = t.toLowerCase()
        if (tl === w) return true
        if (wardNum && tl.includes(`ward ${wardNum}`)) return true
        return w.includes(tl) || tl.includes(w)
      })
    })
  },

  /** Officer-side: create/broadcast an alert. Accepts severity directly, or a type to map to one. */
  createAlert(input: CreateAlertInput): Alert {
    const alert: Alert = {
      id: String(Date.now()),
      severity: input.severity || (input.type ? TYPE_TO_SEVERITY[input.type] : "info"),
      icon: input.icon || "notifications",
      title: input.title,
      body: input.body,
      time: "Just now",
      targetWards: input.targetWards || [],
      sentBy: input.sentBy,
    }
    db.alerts.unshift(alert)
    return alert
  },

  markRead(citizenId: string, alertId: string | number): void {
    const key = String(alertId)
    const existing = db.alertReads[citizenId] || []
    if (!existing.map(String).includes(key)) {
      db.alertReads[citizenId] = [...existing, alertId]
    }
  },

  readIds(citizenId: string): string[] {
    return (db.alertReads[citizenId] || []).map(String)
  },

  notices(): Notice[] {
    return [...db.notices]
  },

  /** Officer-side alias used by routes/notifications.officer.ts */
  listNotices(): Notice[] {
    return [...db.notices]
  },

  wardAverage(ward: string) {
    return db.wardAverages.find((w) => w.ward === ward)
  },
}

export type NotificationRepository = typeof notificationRepository
