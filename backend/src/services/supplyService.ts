// Outage creation with optional citizen auto-notify (writes the alert
// records Person 2's citizen-side reads). Repositories only.
import type { Alert, Outage } from "@water/types"
import { notificationRepository } from "../repositories/notificationRepository"
import {
  supplyRepository,
  type OutageCreateInput,
} from "../repositories/supplyRepository"

export interface CreateOutageResult {
  outage: Outage
  notification: Alert | null
}

export function createOutage(
  input: OutageCreateInput,
  actor: string,
  autoNotify: boolean,
): CreateOutageResult {
  const outage = supplyRepository.createOutage(input)
  let notification: Alert | null = null
  if (autoNotify) {
    notification = notificationRepository.createAlert({
      title: `Water outage — ${outage.ward}`,
      body: `${outage.reason}. Restoration expected ${outage.estimatedRestoration}.`,
      severity: outage.type === "Emergency" ? "critical" : "warning",
      icon: "warning",
      targetWards: [outage.ward],
      sentBy: actor,
    })
  }
  return { outage, notification }
}
