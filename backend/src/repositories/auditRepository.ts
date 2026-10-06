// Audit-trail repository — future table: audit_logs.
// Prepends entries so listing order is newest-first. Shape is exactly
// @water/types AuditLog.
import type { AuditLog } from "@water/types";
import { auditLogs } from "../data/store";

export interface AuditRecordInput {
  actor: string;
  role: string;
  action: string;
  module: string;
  target: string;
  ip: string;
  severity?: AuditLog["severity"];
}

export interface AuditFilters {
  user?: string;
  module?: string;
  severity?: string;
  q?: string;
}

let seq = 10441;
function nextId(): string {
  seq += 1;
  return `LOG-${seq}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** "11 Sep 2026, 09:14:22" — matches the seeded audit-log time format. */
export function formatAuditTime(d: Date = new Date()): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export interface AuditRepository {
  record(input: AuditRecordInput): AuditLog;
  list(filters?: AuditFilters): AuditLog[];
}

export const auditRepository: AuditRepository = {
  record(input) {
    const entry: AuditLog = {
      id: nextId(),
      user: input.actor,
      role: input.role,
      action: input.action,
      module: input.module,
      target: input.target,
      ip: input.ip,
      time: formatAuditTime(),
      severity: input.severity || "Info",
    };
    auditLogs.unshift(entry);
    return entry;
  },

  list(filters = {}) {
    let items = [...auditLogs];
    if (filters.user) {
      const q = filters.user.toLowerCase();
      items = items.filter((l) => l.user.toLowerCase().includes(q));
    }
    if (filters.module) items = items.filter((l) => l.module === filters.module);
    if (filters.severity) items = items.filter((l) => l.severity === filters.severity);
    if (filters.q) {
      const q = filters.q.toLowerCase();
      items = items.filter((l) =>
        `${l.action} ${l.target} ${l.user} ${l.module}`.toLowerCase().includes(q),
      );
    }
    return items;
  },
};
