<<<<<<< HEAD
// Notification repository — future tables: alerts, notices.
// Writes here are what Person 2's citizen-side reads (shared collections).
import type { Alert, Notice } from "@water/types";
import { alerts, notices } from "../data/store";

export type AlertSeverity = Alert["severity"];
export type AlertType = "Supply" | "Shortage" | "Flood" | "General";

export interface CreateAlertInput {
  title: string;
  body: string;
  severity?: AlertSeverity;
  type?: AlertType;
  targetWards?: string[];
  icon?: string;
  sentBy?: string;
}

const TYPE_TO_SEVERITY: Record<AlertType, AlertSeverity> = {
  Supply: "info",
  Shortage: "warning",
  Flood: "critical",
  General: "info",
};

let seq = 5;
function nextId(): number {
  seq += 1;
  return seq;
}

export interface NotificationRepository {
  listAlerts(filters?: { severity?: string }): Alert[];
  createAlert(input: CreateAlertInput): Alert;
  listNotices(): Notice[];
}

export const notificationRepository: NotificationRepository = {
  listAlerts(filters = {}) {
    let items = [...alerts];
    if (filters.severity) items = items.filter((a) => a.severity === filters.severity);
    return items;
  },

  createAlert(input) {
    const alert: Alert = {
      id: nextId(),
      severity: input.severity || (input.type ? TYPE_TO_SEVERITY[input.type] : "info"),
      icon: input.icon || "notifications",
      title: input.title,
      body: input.body,
      time: "Just now",
      targetWards: input.targetWards || [],
      sentBy: input.sentBy,
    };
    alerts.unshift(alert);
    return alert;
  },

  listNotices() {
    return [...notices];
  },
};
=======
import type { Alert, Notice } from "../../../packages/types/src/index"
import { db } from "./store"

/**
 * Read-side repository for citizens. Composing/sending broadcasts is
 * Person 3's officer-side responsibility (POST /alerts); both sides
 * share this same alert/notice store.
 */
export const notificationRepository = {
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
  createAlert(input: {
    title: string
    body: string
    severity: Alert["severity"]
    targetWards?: string[]
  }): Alert {
    const alert: Alert = {
      id: String(Date.now()),
      severity: input.severity,
      icon: "notifications",
      title: input.title,
      body: input.body,
      time: "Just now",
      targetWards: input.targetWards,
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
  wardAverage(ward: string) {
    return db.wardAverages.find((w) => w.ward === ward)
  },
}
>>>>>>> main
