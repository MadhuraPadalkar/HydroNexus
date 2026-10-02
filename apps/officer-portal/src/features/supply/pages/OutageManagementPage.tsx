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
} from "@/components/Shared"

const outages = [
  {
    supplyService: "Kasba Bawada Main Feeder",
    reason: "Pipeline Burst",
    start: "12 Sep, 06:00",
    end: "12 Sep, 18:00",
    severity: "Critical",
    status: "Active",
    autoNotify: true,
    engineer: "Rajesh Kadam",
  },
  {
    supplyService: "Central Pressure Zone Line",
    reason: "Valve Replacement",
    start: "11 Sep, 22:00",
    end: "12 Sep, 08:00",
    severity: "Medium",
    status: "Active",
    autoNotify: true,
    engineer: "Priya Shinde",
  },
  {
    supplyService: "Shiroli Sub-station Line",
    reason: "Scheduled Maintenance",
    start: "13 Sep, 09:00",
    end: "13 Sep, 15:00",
    severity: "Low",
    status: "Scheduled",
    autoNotify: false,
    engineer: "Anil Jadhav",
  },
  {
    supplyService: "South Sector Booster Supply",
    reason: "Pump Failure",
    start: "10 Sep, 14:00",
    end: "11 Sep, 10:00",
    severity: "High",
    status: "Completed",
    autoNotify: true,
    engineer: "Deepak Kulkarni",
  },
  {
    supplyService: "North Treatment Feeder",
    reason: "Chlorination",
    start: "14 Sep, 01:00",
    end: "14 Sep, 06:00",
    severity: "Low",
    status: "Scheduled",
    autoNotify: true,
    engineer: "Savita More",
  },
  {
    supplyService: "West Trunk Line Feed",
    reason: "Leakage Repair",
    start: "09 Sep, 09:00",
    end: "09 Sep, 17:00",
    severity: "Medium",
    status: "Completed",
    autoNotify: true,
    engineer: "Ravi Kamble",
  },
  {
    supplyService: "Rankala Primary Transmission",
    reason: "Main Pipeline Upgrade",
    start: "15 Sep, 06:00",
    end: "15 Sep, 20:00",
    severity: "High",
    status: "Scheduled",
    autoNotify: true,
    engineer: "Nanda Pawar",
  },
]

const SUPPLY_SERVICES = [
  "Kasba Bawada Main Feeder",
  "Central Pressure Zone Line",
  "Shiroli Sub-station Line",
  "South Sector Booster Supply",
  "North Treatment Feeder",
  "West Trunk Line Feed",
  "Rankala Primary Transmission",
  "General Distribution Network",
]

const REASONS = [
  "Pipeline Burst",
  "Valve Replacement",
  "Pump Failure",
  "Leakage Repair",
  "Scheduled Maintenance",
  "Chlorination",
  "Main Pipeline Upgrade",
  "Other",
]
const SEVERITIES = ["Low", "Medium", "High", "Critical"]

export default function OutageManagement() {
  const [filter, setFilter] = useState("All")
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    supplyService: SUPPLY_SERVICES[0],
    reason: REASONS[0],
    severity: "Medium",
    startDate: "",
    startTime: "",
    duration: "4",
    autoNotify: true,
    notes: "",
  })

  const tabs = ["All", "Active", "Scheduled", "Completed"]
  const filtered =
    filter === "All" ? outages : outages.filter((o) => o.status === filter)

  const active = outages.filter((o) => o.status === "Active").length
  const scheduled = outages.filter((o) => o.status === "Scheduled").length
  const completed = outages.filter((o) => o.status === "Completed").length

  return (
    <div>
      <PageHeader
        title="Outage Management"
        subtitle="Track active and planned water supply outages and service interruptions"
        actions={
          <>
            <OutlineButton icon="download">Export</OutlineButton>
            <PrimaryButton icon="add" onClick={() => setShowCreate(true)}>
              Create New Outage Notice
            </PrimaryButton>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Active Outages",
            value: String(active),
            icon: "warning",
            bg: "#fee2e2",
            color: "#991b1b",
          },
          {
            label: "Scheduled Outages",
            value: String(scheduled),
            icon: "schedule",
            bg: "#dbeafe",
            color: "#1e40af",
          },
          {
            label: "Completed Outages",
            value: String(completed),
            icon: "check_circle",
            bg: "#dcfce7",
            color: "#166534",
          },
          {
            label: "Avg Resolution Time",
            value: "6.2 hrs",
            icon: "timer",
            bg: "#fef3c7",
            color: "#92400e",
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

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4 gap-0">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className="px-4 py-2.5 text-sm font-medium border-b-2 transition-colors"
            style={
              filter === t
                ? { borderColor: "#0061a5", color: "#0061a5" }
                : { borderColor: "transparent", color: "#6b7280" }
            }
          >
            {t}
            <span
              className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
              style={{ backgroundColor: "#f3f4f6" }}
            >
              {t === "All"
                ? outages.length
                : outages.filter((o) => o.status === t).length}
            </span>
          </button>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {[
                  "Supply / Service Line",
                  "Outage Reason",
                  "Start Timing",
                  "End Timing",
                  "Severity",
                  "Field Engineer",
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
              {filtered.map((o, i) => (
                <tr
                  key={`${o.supplyService}-${i}`}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    i % 2 === 1 ? "bg-gray-50/30" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {o.supplyService}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{o.reason}</td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {o.start}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {o.end}
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={o.severity} />
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {o.engineer}
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={o.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        className="p-1.5 rounded hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-blue-600 text-sm">
                          edit
                        </span>
                      </button>
                      <button
                        className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                        title="Notify"
                      >
                        <span className="material-symbols-outlined text-gray-500 text-sm">
                          notifications
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create New Outage Notice"
        width="max-w-xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Supply / Service Line">
              <Select
                options={SUPPLY_SERVICES}
                value={form.supplyService}
                onChange={(v: string) => setForm({ ...form, supplyService: v })}
              />
            </FormField>
            <FormField label="Outage Reason">
              <Select
                options={REASONS}
                value={form.reason}
                onChange={(v: string) => setForm({ ...form, reason: v })}
              />
            </FormField>
            <FormField label="Severity">
              <Select
                options={SEVERITIES}
                value={form.severity}
                onChange={(v: string) => setForm({ ...form, severity: v })}
              />
            </FormField>
            <FormField label="Estimated Duration (hours)">
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                min="1"
                max="72"
              />
            </FormField>
            <FormField label="Start Date">
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
              />
            </FormField>
            <FormField label="Start Time">
              <input
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
              />
            </FormField>
          </div>
          <FormField label="Operational Notes">
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none"
              placeholder="Additional operational details for field engineers..."
            />
          </FormField>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
            <button
              onClick={() => setForm({ ...form, autoNotify: !form.autoNotify })}
              className="flex items-center gap-2 text-sm font-medium text-blue-800"
            >
              <div
                className={`w-9 h-5 rounded-full transition-colors flex items-center ${
                  form.autoNotify ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${
                    form.autoNotify ? "translate-x-4" : ""
                  }`}
                />
              </div>
              Auto-notify field units & operational control
            </button>
            <span className="text-xs text-blue-600 ml-auto">Recommended</span>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <OutlineButton onClick={() => setShowCreate(false)}>
              Cancel
            </OutlineButton>
            <PrimaryButton icon="send" onClick={() => setShowCreate(false)}>
              Publish Outage Notice
            </PrimaryButton>
          </div>
        </div>
      </Modal>
    </div>
  )
}
