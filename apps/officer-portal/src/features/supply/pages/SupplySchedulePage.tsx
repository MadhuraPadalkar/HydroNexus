import { useState } from "react"
import {
  Card,
  PageHeader,
  PrimaryButton,
  OutlineButton,
  Badge,
  Modal,
  FormField,
  Select,
  WARDS,
} from "@/components/Shared"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const initial = [
  {
    ward: "Shivaji Peth",
    zone: "Central",
    schedule: [
      "06:00–09:00",
      "—",
      "06:00–09:00",
      "—",
      "06:00–09:00",
      "—",
      "06:00–09:00",
    ],
    capacity: 420,
    status: "Active",
  },
  {
    ward: "Rajarampuri",
    zone: "North",
    schedule: ["—", "07:00–10:00", "—", "07:00–10:00", "—", "07:00–10:00", "—"],
    capacity: 380,
    status: "Active",
  },
  {
    ward: "Kasba Bawada",
    zone: "East",
    schedule: [
      "17:00–20:00",
      "—",
      "17:00–20:00",
      "—",
      "17:00–20:00",
      "—",
      "17:00–20:00",
    ],
    capacity: 290,
    status: "Active",
  },
  {
    ward: "Shahupuri",
    zone: "Central",
    schedule: [
      "06:00–09:00",
      "17:00–19:00",
      "06:00–09:00",
      "17:00–19:00",
      "06:00–09:00",
      "17:00–19:00",
      "06:00–09:00",
    ],
    capacity: 510,
    status: "Active",
  },
  {
    ward: "Laxmipuri",
    zone: "South",
    schedule: [
      "05:30–08:30",
      "—",
      "05:30–08:30",
      "—",
      "05:30–08:30",
      "—",
      "05:30–08:30",
    ],
    capacity: 340,
    status: "Active",
  },
  {
    ward: "Mangalwar Peth",
    zone: "Central",
    schedule: ["—", "06:00–09:00", "—", "06:00–09:00", "—", "06:00–09:00", "—"],
    capacity: 260,
    status: "Active",
  },
  {
    ward: "Tarabai Park",
    zone: "North",
    schedule: [
      "06:00–10:00",
      "—",
      "06:00–10:00",
      "—",
      "06:00–10:00",
      "—",
      "06:00–10:00",
    ],
    capacity: 455,
    status: "Active",
  },
  {
    ward: "Rankala",
    zone: "West",
    schedule: [
      "07:00–09:00",
      "07:00–09:00",
      "07:00–09:00",
      "07:00–09:00",
      "07:00–09:00",
      "07:00–09:00",
      "07:00–09:00",
    ],
    capacity: 320,
    status: "Active",
  },
  {
    ward: "New Shahupuri",
    zone: "Central",
    schedule: ["—", "17:00–20:00", "—", "17:00–20:00", "—", "17:00–20:00", "—"],
    capacity: 280,
    status: "Active",
  },
  {
    ward: "Bindu Chowk",
    zone: "East",
    schedule: [
      "06:00–08:00",
      "—",
      "06:00–08:00",
      "—",
      "06:00–08:00",
      "—",
      "N/A",
    ],
    capacity: 190,
    status: "Active",
  },
  {
    ward: "Subhash Nagar",
    zone: "South",
    schedule: ["—", "06:00–09:30", "—", "06:00–09:30", "—", "06:00–09:30", "—"],
    capacity: 310,
    status: "Active",
  },
  {
    ward: "Padmarajnagar",
    zone: "West",
    schedule: [
      "07:30–10:30",
      "—",
      "07:30–10:30",
      "—",
      "07:30–10:30",
      "—",
      "07:30–10:30",
    ],
    capacity: 375,
    status: "Active",
  },
]

export default function SupplySchedule() {
  const [rows, setRows] = useState(initial)
  const [editRow, setEditRow] = useState<typeof initial[0] | null>(null)
  const [filterZone, setFilterZone] = useState("All")
  const [view, setView] = useState<"table" | "calendar">("table")

  const zones = ["All", "Central", "North", "South", "East", "West"]
  const filtered =
    filterZone === "All" ? rows : rows.filter((r) => r.zone === filterZone)

  const saveEdit = () => {
    if (!editRow) return
    setRows((prev) => prev.map((r) => (r.ward === editRow.ward ? editRow : r)))
    setEditRow(null)
  }

  return (
    <div>
      <PageHeader
        title="Water Supply Schedule"
        subtitle="Ward-wise daily supply timing — Kolhapur Municipal Corporation"
        actions={
          <>
            <OutlineButton icon="download">Export</OutlineButton>
            <PrimaryButton icon="add">Add Ward Schedule</PrimaryButton>
          </>
        }
      />

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Wards", value: "17", icon: "location_city" },
          { label: "Active Schedules", value: "17", icon: "check_circle" },
          { label: "Total Capacity", value: "4,920 KL", icon: "water_drop" },
          { label: "Coverage", value: "94.2%", icon: "percent" },
        ].map((s) => (
          <Card key={s.label} className="p-4 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#e8f0fe" }}
            >
              <span
                className="material-symbols-outlined text-xl"
                style={{ color: "#0061a5" }}
              >
                {s.icon}
              </span>
            </div>
            <div>
              <div className="text-xs text-gray-500">{s.label}</div>
              <div className="text-lg font-bold text-gray-900">{s.value}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters + view toggle */}
      <Card className="mb-4 p-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-gray-400 text-lg">
            filter_list
          </span>
          <span className="text-sm text-gray-600 font-medium">Zone:</span>
          {zones.map((z) => (
            <button
              key={z}
              onClick={() => setFilterZone(z)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={
                filterZone === z
                  ? { backgroundColor: "#0061a5", color: "#fff" }
                  : { backgroundColor: "#f3f4f6", color: "#374151" }
              }
            >
              {z}
            </button>
          ))}
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(["table", "calendar"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-3 py-1.5 text-xs font-medium capitalize transition-colors"
              style={
                view === v
                  ? { backgroundColor: "#0061a5", color: "#fff" }
                  : { backgroundColor: "#fff", color: "#6b7280" }
              }
            >
              {v}
            </button>
          ))}
        </div>
      </Card>

      {/* Table */}
      {view === "table" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Ward
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Zone
                  </th>
                  {DAYS.map((d) => (
                    <th
                      key={d}
                      className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide"
                    >
                      {d}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Capacity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr
                    key={row.ward}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      i % 2 === 0 ? "" : "bg-gray-50/30"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {row.ward}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                        {row.zone}
                      </span>
                    </td>
                    {row.schedule.map((slot, j) => (
                      <td key={j} className="px-3 py-3 text-center">
                        {slot === "—" || slot === "N/A" ? (
                          <span className="text-gray-300 text-xs">{slot}</span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 whitespace-nowrap">
                            {slot}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-gray-700">
                      {row.capacity} KL
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditRow({ ...row })}
                        className="flex items-center gap-1 ml-auto px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">
                          edit
                        </span>
                        Edit Schedule
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Calendar view */}
      {view === "calendar" && (
        <div className="grid grid-cols-7 gap-3">
          {DAYS.map((day, di) => (
            <Card key={day} className="p-3">
              <div className="text-sm font-semibold text-gray-800 mb-3 text-center pb-2 border-b border-gray-100">
                {day}
              </div>
              <div className="space-y-2">
                {filtered.map((r) =>
                  r.schedule[di] !== "—" && r.schedule[di] !== "N/A" ? (
                    <div
                      key={r.ward}
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: "#e8f0fe" }}
                    >
                      <div className="text-xs font-medium text-gray-800 truncate">
                        {r.ward}
                      </div>
                      <div className="text-xs text-blue-700 font-medium mt-0.5">
                        {r.schedule[di]}
                      </div>
                    </div>
                  ) : null,
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit modal */}
      <Modal
        open={!!editRow}
        onClose={() => setEditRow(null)}
        title={`Edit Schedule — ${editRow?.ward}`}
        width="max-w-2xl"
      >
        {editRow && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Zone">
                <Select
                  options={["Central", "North", "South", "East", "West"]}
                  value={editRow.zone}
                  onChange={(v: string) => setEditRow({ ...editRow, zone: v })}
                />
              </FormField>
              <FormField label="Daily Capacity (KL)">
                <input
                  type="number"
                  value={editRow.capacity}
                  onChange={(e) =>
                    setEditRow({ ...editRow, capacity: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                />
              </FormField>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Timings
              </label>
              <div className="grid grid-cols-7 gap-2">
                {DAYS.map((day, di) => (
                  <div key={day}>
                    <div className="text-xs font-medium text-gray-500 mb-1 text-center">
                      {day}
                    </div>
                    <input
                      type="text"
                      value={editRow.schedule[di]}
                      onChange={(e) => {
                        const s = [...editRow.schedule]
                        s[di] = e.target.value
                        setEditRow({ ...editRow, schedule: s })
                      }}
                      className="w-full px-2 py-1.5 rounded border border-gray-200 text-xs text-center"
                      placeholder="—"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <OutlineButton onClick={() => setEditRow(null)}>
                Cancel
              </OutlineButton>
              <PrimaryButton onClick={saveEdit} icon="save">
                Save Schedule
              </PrimaryButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
