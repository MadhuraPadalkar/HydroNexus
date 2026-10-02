import { useState } from "react"
import {
  Card,
  PageHeader,
  PrimaryButton,
  OutlineButton,
  Badge,
} from "@/components/Shared"

const activities = [
  {
    id: "MNT-091",
    title: "Pipeline Replacement — Sector 4",
    ward: "Kasba Bawada",
    type: "Pipeline",
    date: "12 Sep 2024",
    endDate: "14 Sep 2024",
    priority: "High",
    status: "In Progress",
    team: "Team A",
    engineer: "Rajesh Kadam",
  },
  {
    id: "MNT-090",
    title: "Pump Station Overhaul",
    ward: "Shahupuri",
    type: "Pump",
    date: "10 Sep 2024",
    endDate: "10 Sep 2024",
    priority: "Medium",
    status: "Completed",
    team: "Team B",
    engineer: "Priya Shinde",
  },
  {
    id: "MNT-089",
    title: "Valve Inspection & Greasing",
    ward: "Tarabai Park",
    type: "Valve",
    date: "15 Sep 2024",
    endDate: "15 Sep 2024",
    priority: "Low",
    status: "Scheduled",
    team: "Team C",
    engineer: "Anil Jadhav",
  },
  {
    id: "MNT-088",
    title: "Reservoir Cleaning",
    ward: "Rajarampuri",
    type: "Reservoir",
    date: "18 Sep 2024",
    endDate: "20 Sep 2024",
    priority: "High",
    status: "Scheduled",
    team: "Team A",
    engineer: "Rajesh Kadam",
  },
  {
    id: "MNT-087",
    title: "Meter Inspection & Calibration",
    ward: "Laxmipuri",
    type: "Meter",
    date: "13 Sep 2024",
    endDate: "13 Sep 2024",
    priority: "Low",
    status: "In Progress",
    team: "Team D",
    engineer: "Deepak Kulkarni",
  },
  {
    id: "MNT-086",
    title: "Booster Pump Service",
    ward: "Subhash Nagar",
    type: "Pump",
    date: "08 Sep 2024",
    endDate: "09 Sep 2024",
    priority: "Medium",
    status: "Completed",
    team: "Team B",
    engineer: "Priya Shinde",
  },
  {
    id: "MNT-085",
    title: "DMA Boundary Valve Check",
    ward: "Mangalwar Peth",
    type: "Valve",
    date: "20 Sep 2024",
    endDate: "20 Sep 2024",
    priority: "Low",
    status: "Scheduled",
    team: "Team C",
    engineer: "Savita More",
  },
  {
    id: "MNT-084",
    title: "Main Trunk Line Repair",
    ward: "Shivaji Peth",
    type: "Pipeline",
    date: "22 Sep 2024",
    endDate: "24 Sep 2024",
    priority: "Critical",
    status: "Scheduled",
    team: "Team A",
    engineer: "Rajesh Kadam",
  },
  {
    id: "MNT-083",
    title: "Water Quality Testing",
    ward: "Rankala",
    type: "QA",
    date: "11 Sep 2024",
    endDate: "11 Sep 2024",
    priority: "Medium",
    status: "Completed",
    team: "QA Team",
    engineer: "Ravi Kamble",
  },
]

const typeColors: Record<string, string> = {
  Pipeline: "#dbeafe",
  Pump: "#ede9fe",
  Valve: "#dcfce7",
  Reservoir: "#fef3c7",
  Meter: "#f3e8ff",
  QA: "#f0fdf4",
}
const typeTextColors: Record<string, string> = {
  Pipeline: "#1e40af",
  Pump: "#5b21b6",
  Valve: "#166534",
  Reservoir: "#92400e",
  Meter: "#7c3aed",
  QA: "#166534",
}

export default function MaintenanceSchedule() {
  const [view, setView] = useState<"list" | "calendar">("list")
  const [filter, setFilter] = useState("All")

  const tabs = ["All", "Scheduled", "In Progress", "Completed"]
  const filtered =
    filter === "All"
      ? activities
      : activities.filter((a) => a.status === filter)

  const scheduled = activities.filter((a) => a.status === "Scheduled").length
  const inProgress = activities.filter((a) => a.status === "In Progress").length
  const completed = activities.filter((a) => a.status === "Completed").length
  const critical = activities.filter(
    (a) => a.priority === "Critical" || a.priority === "High",
  ).length

  // Build calendar for Sep 2024
  const calDays = Array.from({ length: 30 }, (_, i) => i + 1)
  const getDayActivities = (day: number) =>
    activities.filter((a) => {
      const start = parseInt(a.date.split(" ")[0])
      const end = parseInt(a.endDate.split(" ")[0])
      return day >= start && day <= end
    })

  return (
    <div>
      <PageHeader
        title="Maintenance Schedule"
        subtitle="Planned pipeline and infrastructure maintenance tasks — September 2024"
        actions={
          <>
            <OutlineButton icon="print">Print Schedule</OutlineButton>
            <PrimaryButton icon="add">Schedule Activity</PrimaryButton>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Scheduled Tasks",
            value: scheduled,
            icon: "event",
            color: "#1e40af",
            bg: "#dbeafe",
          },
          {
            label: "In Progress",
            value: inProgress,
            icon: "construction",
            color: "#92400e",
            bg: "#fef3c7",
          },
          {
            label: "Completed Tasks",
            value: completed,
            icon: "task_alt",
            color: "#166534",
            bg: "#dcfce7",
          },
          {
            label: "High / Critical Priority",
            value: critical,
            icon: "priority_high",
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

      <Card className="mb-4 px-4 py-3 flex items-center justify-between">
        <div className="flex gap-0">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className="px-4 py-1.5 text-sm font-medium border-b-2 transition-colors"
              style={
                filter === t
                  ? { borderColor: "#0061a5", color: "#0061a5" }
                  : { borderColor: "transparent", color: "#6b7280" }
              }
            >
              {t}
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-gray-100">
                {t === "All"
                  ? activities.length
                  : activities.filter((a) => a.status === t).length}
              </span>
            </button>
          ))}
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(["list", "calendar"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-3 py-1.5 text-xs font-medium capitalize transition-colors flex items-center gap-1"
              style={
                view === v
                  ? { backgroundColor: "#0061a5", color: "#fff" }
                  : { backgroundColor: "#fff", color: "#6b7280" }
              }
            >
              <span className="material-symbols-outlined text-sm">
                {v === "list" ? "list" : "calendar_month"}
              </span>
              {v}
            </button>
          ))}
        </div>
      </Card>

      {view === "list" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    "Task ID",
                    "Maintenance Task",
                    "Ward",
                    "Type",
                    "Start Date",
                    "Target Date",
                    "Priority",
                    "Assigned Personnel",
                    "Status",
                    "Actions",
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
                {filtered.map((a, i) => (
                  <tr
                    key={a.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      i % 2 === 1 ? "bg-gray-50/30" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {a.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{a.title}</div>
                      <div className="text-xs text-gray-400">{a.team}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{a.ward}</td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: typeColors[a.type] ?? "#f3f4f6",
                          color: typeTextColors[a.type] ?? "#374151",
                        }}
                      >
                        {a.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {a.date}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {a.endDate}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={a.priority} />
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {a.engineer}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={a.status} />
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1.5 rounded hover:bg-blue-50 transition-colors">
                        <span className="material-symbols-outlined text-blue-600 text-sm">
                          edit
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {view === "calendar" && (
        <Card className="p-4">
          <div className="text-center font-semibold text-gray-800 mb-4">
            September 2024
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="text-center text-xs font-semibold text-gray-400 py-1"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calDays.map((day) => {
              const dayActs = getDayActivities(day)
              const isToday = day === 11
              return (
                <div
                  key={day}
                  className="min-h-16 rounded-lg border p-1 text-xs"
                  style={{
                    borderColor: isToday ? "#0061a5" : "#f3f4f6",
                    backgroundColor: isToday ? "#e8f0fe" : "#fafafa",
                  }}
                >
                  <div
                    className={`font-semibold mb-1 ${
                      isToday ? "text-blue-700" : "text-gray-600"
                    }`}
                  >
                    {day}
                  </div>
                  {dayActs.slice(0, 2).map((a) => (
                    <div
                      key={a.id}
                      className="px-1 py-0.5 rounded text-xs mb-0.5 truncate"
                      style={{
                        backgroundColor: typeColors[a.type] ?? "#f3f4f6",
                        color: typeTextColors[a.type] ?? "#374151",
                      }}
                    >
                      {a.title.split(" — ")[0]}
                    </div>
                  ))}
                  {dayActs.length > 2 && (
                    <div className="text-gray-400 text-xs">
                      +{dayActs.length - 2} more
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {Object.entries(typeColors).map(([type, bg]) => (
              <div
                key={type}
                className="flex items-center gap-1.5 text-xs text-gray-600"
              >
                <div
                  className="w-3 h-3 rounded"
                  style={{
                    backgroundColor: bg,
                    border: `1px solid ${typeTextColors[type]}`,
                  }}
                />
                {type}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
