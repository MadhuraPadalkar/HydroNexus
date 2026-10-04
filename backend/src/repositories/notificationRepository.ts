import type { Alert, Notice } from "../../../packages/types/src/index";
import { db } from "./store";

/**
 * Read-side repository for citizens. Composing/sending broadcasts is
 * Person 3's officer-side responsibility (POST /alerts); both sides
 * share this same alert/notice store.
 */
export const notificationRepository = {
  alertsForWard(ward?: string): Alert[] {
    if (!ward) return [...db.alerts];
    const w = ward.toLowerCase();
    const wardNum = (ward.match(/\d+/) || [])[0];
    return db.alerts.filter((a) => {
      const targets = a.targetWards || [];
      if (targets.some((t) => t.toLowerCase() === "all wards")) return true;
      return targets.some((t) => {
        const tl = t.toLowerCase();
        if (tl === w) return true;
        if (wardNum && tl.includes(`ward ${wardNum}`)) return true;
        return w.includes(tl) || tl.includes(w);
      });
    });
  },
  createAlert(input: { title: string; body: string; severity: Alert["severity"]; targetWards?: string[] }): Alert {
    const alert: Alert = {
      id: String(Date.now()),
      severity: input.severity,
      icon: "notifications",
      title: input.title,
      body: input.body,
      time: "Just now",
      targetWards: input.targetWards,
    };
    db.alerts.unshift(alert);
    return alert;
  },
  markRead(citizenId: string, alertId: string | number): void {
    const key = String(alertId);
    const existing = db.alertReads[citizenId] || [];
    if (!existing.map(String).includes(key)) {
      db.alertReads[citizenId] = [...existing, alertId];
    }
  },
  readIds(citizenId: string): string[] {
    return (db.alertReads[citizenId] || []).map(String);
  },
  notices(): Notice[] {
    return [...db.notices];
  },
  wardAverage(ward: string) {
    return db.wardAverages.find((w) => w.ward === ward);
  },
};
