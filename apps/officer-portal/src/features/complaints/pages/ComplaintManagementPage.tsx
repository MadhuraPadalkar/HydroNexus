import { useState } from "react"
import {
  Card,
  PageHeader,
  PrimaryButton,
  OutlineButton,
  Badge,
} from "@/components/Shared"
import { useComplaintsData } from "@/hooks/useDataHooks"
import { LoadingSpinner, EmptyState, ErrorMessage } from "@water/ui"

const initialComplaints = [
  {
    id: "CMP-2024-0891",
    type: "Leakage",
    citizen: "Ramesh Shinde",
    ward: "Kasba Bawada",
    address: "Plot 14, Sector 4, Kasba Bawada",
    phone: "9876543210",
    reported: "11 Sep, 07:40",
    assigned: "Anil Jadhav",
    priority: "Critical",
    status: "In Progress",
    description:
      "Major pipeline burst near Kasba Bawada chowk. Road flooded. Water flowing into shops.",
    updated: "11 Sep, 09:00",
  },
  {
    id: "CMP-2024-0890",
    type: "No Supply",
    citizen: "Vaishali Kamble",
    ward: "Mangalwar Peth",
    address: "22, Mangalwar Peth, near Mahal",
    phone: "9934567890",
    reported: "11 Sep, 06:15",
    assigned: "Rajesh Kadam",
    priority: "High",
    status: "In Progress",
    description:
      "No water supply since yesterday morning. Three households affected.",
    updated: "11 Sep, 08:30",
  },
  {
    id: "CMP-2024-0889",
    type: "Low Pressure",
    citizen: "Sunita Patil",
    ward: "Rajarampuri",
    address: "B-12, Rajarampuri Colony",
    phone: "9823456789",
    reported: "10 Sep, 18:30",
    assigned: "Priya Shinde",
    priority: "Medium",
    status: "Pending",
    description:
      "Very low pressure during morning supply hours. Water barely reaches first floor.",
    updated: "10 Sep, 18:30",
  },
  {
    id: "CMP-2024-0888",
    type: "Quality",
    citizen: "Sunil More",
    ward: "Rankala",
    address: "Opp. Rankala Lake, Shivaji Park",
    phone: "9856789012",
    reported: "10 Sep, 14:20",
    assigned: "Ravi Kamble",
    priority: "High",
    status: "Pending",
    description:
      "Water has unusual odour and yellowish colour. Suspect contamination near pump station.",
    updated: "10 Sep, 14:20",
  },
  {
    id: "CMP-2024-0887",
    type: "Billing",
    citizen: "Balasaheb Jadhav",
    ward: "Laxmipuri",
    address: "45, Laxmipuri, Behind Mahalaxmi Temple",
    phone: "9845678901",
    reported: "10 Sep, 12:00",
    assigned: "Savita More",
    priority: "Low",
    status: "Resolved",
    description:
      "Incorrect meter reading — bill shows 3x actual usage. Meter may be faulty.",
    updated: "11 Sep, 09:15",
  },
  {
    id: "CMP-2024-0886",
    type: "Leakage",
    citizen: "Anita Deshmukh",
    ward: "Tarabai Park",
    address: "7, Tarabai Park, Near KMC School",
    phone: "9712345678",
    reported: "09 Sep, 16:10",
    assigned: "Nanda Pawar",
    priority: "Medium",
    status: "Resolved",
    description:
      "Underground pipeline seepage creating waterlogging in backyard.",
    updated: "10 Sep, 14:00",
  },
  {
    id: "CMP-2024-0885",
    type: "No Supply",
    citizen: "Kiran Kulkarni",
    ward: "Padmarajnagar",
    address: "102, Padmarajnagar Phase 2",
    phone: "9678901234",
    reported: "09 Sep, 08:00",
    assigned: "Deepak Kulkarni",
    priority: "Low",
    status: "Resolved",
    description:
      "Water supply missed on Sunday. No alert or prior notice received.",
    updated: "09 Sep, 17:30",
  },
  {
    id: "CMP-2024-0884",
    type: "Other",
    citizen: "Ganesh Sawant",
    ward: "Sangamwadi",
    address: "33, Sangamwadi Road",
    phone: "9823456780",
    reported: "08 Sep, 11:30",
    assigned: "Sachin Gaikwad",
    priority: "Low",
    status: "Resolved",
    description: "Manhole cover near water main is broken — safety hazard.",
    updated: "09 Sep, 10:00",
  },
]

type TypeColor = {
  bg: string
  text: string
}

const TYPE_COLORS: Record<string, TypeColor> = {
  Leakage: { bg: "#fee2e2", text: "#991b1b" },
  "No Supply": { bg: "#fef3c7", text: "#92400e" },
  "Low Pressure": { bg: "#dbeafe", text: "#1e40af" },
  Quality: { bg: "#ede9fe", text: "#5b21b6" },
  Billing: { bg: "#dcfce7", text: "#166534" },
  Other: { bg: "#f3f4f6", text: "#374151" },
}

export default function ComplaintManagement() {
  const { data: apiComplaints, loading, error, refetch } = useComplaintsData()
  const complaints =
    apiComplaints.length > 0
      ? apiComplaints as typeof initialComplaints
      : initialComplaints
  const [selected, setSelected] = useState<typeof initialComplaints[0] | null>(
    complaints[0] || null,
  )
  const [typeFilter, setTypeFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [search, setSearch] = useState("")

  const types = [
    "All",
    "Leakage",
    "No Supply",
    "Low Pressure",
    "Quality",
    "Billing",
    "Other",
  ]
  const statuses = ["All", "Pending", "In Progress", "Resolved"]

  const filtered = complaints.filter((c) => {
    const matchType = typeFilter === "All" || c.type === typeFilter
    const matchStatus = statusFilter === "All" || c.status === statusFilter
    const matchSearch =
      !search ||
      c.citizen.toLowerCase().includes(search.toLowerCase()) ||
      c.ward.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase())
    return matchType && matchStatus && matchSearch
  })

  return (
    <div>
      <PageHeader
        title="Complaint Management"
        subtitle="Citizen complaints — track, assign, and resolve"
        actions={
          <>
            <OutlineButton icon="download">Export</OutlineButton>
            <PrimaryButton icon="add">Log Complaint</PrimaryButton>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          {
            label: "Total (Sep)",
            value: complaints.length,
            icon: "report_problem",
            color: "#0061a5",
            bg: "#e8f0fe",
          },
          {
            label: "Pending",
            value: complaints.filter((c) => c.status === "Pending").length,
            icon: "hourglass_top",
            color: "#92400e",
            bg: "#fef3c7",
          },
          {
            label: "In Progress",
            value: complaints.filter((c) => c.status === "In Progress").length,
            icon: "construction",
            color: "#1e40af",
            bg: "#dbeafe",
          },
          {
            label: "Resolved",
            value: complaints.filter((c) => c.status === "Resolved").length,
            icon: "task_alt",
            color: "#166534",
            bg: "#dcfce7",
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
            placeholder="Search by citizen, ward, ID..."
            className="text-sm outline-none bg-transparent w-44"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
              style={
                typeFilter === t
                  ? { backgroundColor: "#0061a5", color: "#fff" }
                  : { backgroundColor: "#f3f4f6", color: "#374151" }
              }
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
              style={
                statusFilter === s
                  ? { backgroundColor: "#002045", color: "#fff" }
                  : { backgroundColor: "#f3f4f6", color: "#374151" }
              }
            >
              {s}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex gap-4">
        {/* List */}
        <div className="flex-1 min-w-0">
          <Card className="overflow-hidden">
            {loading && (
              <LoadingSpinner
                message="Loading complaints..."
                className="py-8"
              />
            )}
            {error && (
              <ErrorMessage message={error} onRetry={refetch} className="m-3" />
            )}
            {!loading && !error && filtered.length === 0 && (
              <EmptyState
                title="No complaints match filters"
                description="Try clearing your search query or changing the filter selections."
                className="m-3"
              />
            )}
            <div className="divide-y divide-gray-50">
              {filtered.map((c) => {
                const tc = TYPE_COLORS[c.type] ?? TYPE_COLORS.Other
                const isSelected = selected?.id === c.id
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelected(isSelected ? null : c)}
                    className="flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
                    style={{
                      backgroundColor: isSelected ? "#e8f0fe" : undefined,
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: tc.bg }}
                    >
                      <span
                        className="material-symbols-outlined text-base"
                        style={{ color: tc.text }}
                      >
                        {c.type === "Leakage"
                          ? "leak_add"
                          : c.type === "No Supply"
                            ? "water_drop"
                            : c.type === "Low Pressure"
                              ? "compress"
                              : c.type === "Quality"
                                ? "science"
                                : c.type === "Billing"
                                  ? "receipt"
                                  : "info"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-gray-400">
                          {c.id}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: tc.bg, color: tc.text }}
                        >
                          {c.type}
                        </span>
                        <Badge status={c.priority} />
                      </div>
                      <div className="font-medium text-gray-900 mt-0.5">
                        {c.citizen} —{" "}
                        <span className="text-gray-500 font-normal text-sm">
                          {c.ward}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 truncate">
                        {c.description}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                        <span>{c.reported}</span>
                        <span>·</span>
                        <span>Assigned: {c.assigned}</span>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      <Badge status={c.status} />
                      <span className="material-symbols-outlined text-gray-300 text-base">
                        chevron_right
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400">
              {filtered.length} of {complaints.length} complaints
            </div>
          </Card>
        </div>

        {/* Detail panel */}
        {selected && (
          <Card
            className="w-80 shrink-0 flex flex-col overflow-hidden"
            style={{ alignSelf: "start" }}
          >
            <div
              className="px-5 py-4 border-b border-gray-100 flex items-center justify-between"
              style={{ backgroundColor: "#002045" }}
            >
              <div>
                <div className="text-white font-semibold text-sm">
                  {selected.id}
                </div>
                <div className="text-blue-300 text-xs mt-0.5">
                  {selected.type} Complaint
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto">
              <div>
                <div className="text-xs text-gray-400 mb-1">Description</div>
                <div className="text-sm text-gray-700 leading-relaxed">
                  {selected.description}
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Citizen", value: selected.citizen },
                  { label: "Phone", value: selected.phone },
                  { label: "Ward", value: selected.ward },
                  { label: "Address", value: selected.address },
                  { label: "Reported", value: selected.reported },
                  { label: "Last Updated", value: selected.updated },
                  { label: "Assigned To", value: selected.assigned },
                ].map((r) => (
                  <div
                    key={r.label}
                    className="flex justify-between items-start gap-2"
                  >
                    <span className="text-xs text-gray-400 shrink-0">
                      {r.label}
                    </span>
                    <span className="text-xs font-medium text-gray-800 text-right">
                      {r.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge status={selected.priority} />
                <Badge status={selected.status} />
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                {selected.status !== "Resolved" && (
                  <button
                    className="w-full py-2 rounded-lg text-sm font-medium text-white"
                    style={{ backgroundColor: "#0061a5" }}
                  >
                    Mark as Resolved
                  </button>
                )}
                <button className="w-full py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                  Re-assign Complaint
                </button>
                <button className="w-full py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                  Add Field Note
                </button>
                <button className="w-full py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                  Notify Citizen
                </button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
