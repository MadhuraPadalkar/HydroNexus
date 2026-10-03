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
