import { useState } from "react"
import { Card, PageHeader, OutlineButton } from "@/components/Shared"

const logs = [
  {
    id: "LOG-10441",
    user: "Suresh Patil",
    role: "Admin",
    action: "OUTAGE_CREATED",
    module: "Outage Mgmt",
    target: "OUT-2024-089 (Kasba Bawada)",
    ip: "10.0.1.42",
    time: "11 Sep 2024, 09:14:22",
    severity: "Info",
  },
  {
    id: "LOG-10440",
    user: "Rajesh Kadam",
    role: "Engineer",
    action: "MAINTENANCE_UPDATED",
    module: "Maintenance",
    target: "MNT-091 Status → In Progress",
    ip: "10.0.1.55",
    time: "11 Sep 2024, 08:58:11",
    severity: "Info",
  },
  {
    id: "LOG-10439",
    user: "Priya Shinde",
    role: "Supervisor",
    action: "NOTIFICATION_SENT",
    module: "Notifications",
    target: "NOT-2024-0201 (Rajarampuri)",
    ip: "10.0.1.33",
    time: "11 Sep 2024, 08:30:04",
    severity: "Info",
  },
  {
    id: "LOG-10438",
    user: "Suresh Patil",
    role: "Admin",
    action: "USER_ROLE_CHANGED",
    module: "Admin",
    target: "USR-009 Sachin Gaikwad: Operator → Inactive",
    ip: "10.0.1.42",
    time: "10 Sep 2024, 17:45:38",
    severity: "Warning",
  },
  {
    id: "LOG-10437",
    user: "Anil Jadhav",
    role: "Engineer",
    action: "COMPLAINT_RESOLVED",
    module: "Complaints",
    target: "CMP-2024-0891 (Kasba Bawada — Leakage)",
    ip: "10.0.1.71",
    time: "10 Sep 2024, 17:22:15",
    severity: "Info",
  },
  {
    id: "LOG-10436",
    user: "Suresh Patil",
    role: "Admin",
    action: "SCHEDULE_EDITED",
    module: "Supply",
    target: "Mangalwar Peth — Tue slot changed",
    ip: "10.0.1.42",
    time: "10 Sep 2024, 15:10:47",
    severity: "Info",
  },
  {
    id: "LOG-10435",
    user: "Deepak Kulkarni",
    role: "Supervisor",
    action: "CONNECTION_APPROVED",
    module: "Connections",
    target: "KMC-2024-0891 (Sunita Patil)",
    ip: "10.0.1.28",
    time: "10 Sep 2024, 14:55:02",
    severity: "Info",
  },
  {
    id: "LOG-10434",
    user: "Unknown",
    role: "—",
    action: "LOGIN_FAILED",
    module: "Auth",
    target: "suresh.patil@kmcwater.gov.in (3 attempts)",
    ip: "183.87.12.44",
    time: "10 Sep 2024, 14:02:18",
    severity: "Critical",
  },
  {
    id: "LOG-10433",
    user: "Suresh Patil",
    role: "Admin",
    action: "SETTINGS_CHANGED",
    module: "Settings",
    target: "NRW Alert Threshold: 25% → 20%",
    ip: "10.0.1.42",
    time: "10 Sep 2024, 11:30:55",
    severity: "Warning",
  },
  {
    id: "LOG-10432",
    user: "Ravi Kamble",
    role: "Operator",
    action: "TANKER_DISPATCHED",
    module: "Service Requests",
    target: "SR-2024-0441 → Prakash Mane / MH-09-T-4521",
    ip: "10.0.1.88",
    time: "10 Sep 2024, 10:18:33",
    severity: "Info",
  },
  {
    id: "LOG-10431",
    user: "Priya Shinde",
    role: "Supervisor",
    action: "NRW_TARGET_SET",
    module: "NRW",
    target: "East Zone target set to 22%",
    ip: "10.0.1.33",
    time: "09 Sep 2024, 16:42:09",
    severity: "Info",
  },
  {
    id: "LOG-10430",
    user: "Suresh Patil",
    role: "Admin",
    action: "USER_CREATED",
    module: "Admin",
    target: "USR-009 Sachin Gaikwad (Operator)",
    ip: "10.0.1.42",
    time: "09 Sep 2024, 10:05:48",
    severity: "Info",
  },
]

const SEVERITY_COLORS: Record<string, {
  bg: string
  text: string
  icon: string
}> = {
  Info: { bg: "#f0f9ff", text: "#0369a1", icon: "info" },
  Warning: { bg: "#fef9c3", text: "#854d0e", icon: "warning" },
  Critical: { bg: "#fee2e2", text: "#991b1b", icon: "error" },
}

const MODULES = [
  "All",
  "Auth",
  "Admin",
  "Outage Mgmt",
  "Maintenance",
  "Supply",
  "Complaints",
  "Connections",
  "Notifications",
  "NRW",
  "Service Requests",
  "Settings",
]

export default function AuditLogs() {
  const [userFilter, setUserFilter] = useState("All")
  const [moduleFilter, setModuleFilter] = useState("All")
  const [severityFilter, setSeverityFilter] = useState("All")
  const [search, setSearch] = useState("")

  const filtered = logs.filter((l) => {
    const matchUser = userFilter === "All" || l.user === userFilter
    const matchModule = moduleFilter === "All" || l.module === moduleFilter
    const matchSeverity =
      severityFilter === "All" || l.severity === severityFilter
    const matchSearch =
      !search ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.target.toLowerCase().includes(search.toLowerCase()) ||
      l.user.toLowerCase().includes(search.toLowerCase())
    return matchUser && matchModule && matchSeverity && matchSearch
  })

  const users = [
    "All",
    ...Array.from(
      new Set(logs.map((l) => l.user).filter((u) => u !== "Unknown")),
    ),
  ]

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle="Chronological record of all system actions — KMC Smart Water Portal"
        actions={<OutlineButton icon="download">Export Logs</OutlineButton>}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Actions",
            value: logs.length,
            icon: "receipt_long",
            color: "#0061a5",
            bg: "#e8f0fe",
          },
          {
            label: "Today",
            value: logs.filter((l) => l.time.includes("11 Sep")).length,
            icon: "today",
            color: "#166534",
            bg: "#dcfce7",
          },
          {
            label: "Warnings",
            value: logs.filter((l) => l.severity === "Warning").length,
            icon: "warning",
            color: "#92400e",
            bg: "#fef3c7",
          },
          {
            label: "Critical Events",
            value: logs.filter((l) => l.severity === "Critical").length,
            icon: "error",
            color: "#991b1b",
            bg: "#fee2e2",
          },
        ].map((s) => (
          <Card key={s.label} className="p-4 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: s.bg }}
            >
              <span
                className="material-symbols-outlined text-xl"
                style={{ color: s.color }}
              >
                {s.icon}
              </span>
            </div>
            <div>
              <div className="text-xs text-gray-500">{s.label}</div>
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-3 mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white">
          <span className="material-symbols-outlined text-gray-400 text-base">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actions..."
            className="text-sm outline-none bg-transparent w-44"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">User:</span>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-xs bg-white"
          >
            {users.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Module:</span>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-xs bg-white"
          >
            {MODULES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Severity:</span>
          {["All", "Info", "Warning", "Critical"].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
              style={
                severityFilter === s
                  ? s === "All"
                    ? { backgroundColor: "#002045", color: "#fff" }
                    : s === "Info"
                      ? { backgroundColor: "#0369a1", color: "#fff" }
                      : s === "Warning"
                        ? { backgroundColor: "#854d0e", color: "#fff" }
                        : { backgroundColor: "#991b1b", color: "#fff" }
                  : { backgroundColor: "#f3f4f6", color: "#374151" }
              }
            >
              {s}
            </button>
          ))}
        </div>
        {filtered.length !== logs.length && (
          <button
            onClick={() => {
              setUserFilter("All")
              setModuleFilter("All")
              setSeverityFilter("All")
              setSearch("")
            }}
            className="ml-auto text-xs text-blue-600 flex items-center gap-1 hover:text-blue-800"
          >
            <span className="material-symbols-outlined text-sm">close</span>
            Clear filters
          </button>
        )}
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {[
                  "Timestamp",
                  "User",
                  "Action",
                  "Module",
                  "Details",
                  "IP Address",
                  "Severity",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, i) => {
                const sc = SEVERITY_COLORS[l.severity]
                return (
                  <tr
                    key={l.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      i % 2 === 1 ? "bg-gray-50/30" : ""
                    } ${l.severity === "Critical" ? "bg-red-50/30" : ""}`}
                  >
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap font-mono">
                      {l.time}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{l.user}</div>
                      <div className="text-xs text-gray-400">{l.role}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">
                      {l.action}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {l.module}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-gray-600 text-xs max-w-56 truncate"
                      title={l.target}
                    >
                      {l.target}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                      {l.ip}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: sc.bg, color: sc.text }}
                      >
                        <span className="material-symbols-outlined text-xs">
                          {sc.icon}
                        </span>
                        {l.severity}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between">
          <span>
            Showing {filtered.length} of {logs.length} entries
          </span>
          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs">
              ← Previous
            </button>
            <span className="text-xs font-medium">Page 1</span>
            <button className="px-2.5 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs">
              Next →
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
