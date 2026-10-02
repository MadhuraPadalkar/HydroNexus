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

type Status = "Requested" | "Approved" | "Dispatched" | "Delivered"

const requests = [
  {
    id: "SR-2024-0441",
    type: "Tanker",
    citizen: "Balasaheb Jadhav",
    ward: "Laxmipuri",
    phone: "9845678901",
    volume: "5000L",
    date: "11 Sep, 09:00",
    status: "Dispatched" as Status,
    driver: "Prakash Mane",
    vehicle: "MH-09-T-4521",
    priority: "High",
  },
  {
    id: "SR-2024-0440",
    type: "Tanker",
    citizen: "Anita Deshmukh",
    ward: "Tarabai Park",
    phone: "9712345678",
    volume: "10000L",
    date: "11 Sep, 10:30",
    status: "Approved" as Status,
    driver: "Santosh Shinde",
    vehicle: "MH-09-T-3814",
    priority: "Medium",
  },
  {
    id: "SR-2024-0439",
    type: "Service",
    citizen: "Sunil More",
    ward: "Rankala",
    phone: "9856789012",
    volume: "—",
    date: "11 Sep, 08:15",
    status: "Delivered" as Status,
    driver: "—",
    vehicle: "—",
    priority: "Low",
  },
  {
    id: "SR-2024-0438",
    type: "Tanker",
    citizen: "Meena Bhosale",
    ward: "Subhash Nagar",
    phone: "9901234567",
    volume: "5000L",
    date: "11 Sep, 11:00",
    status: "Requested" as Status,
    driver: "—",
    vehicle: "—",
    priority: "High",
  },
  {
    id: "SR-2024-0437",
    type: "Service",
    citizen: "Ganesh Sawant",
    ward: "Sangamwadi",
    phone: "9823456780",
    volume: "—",
    date: "10 Sep, 16:45",
    status: "Delivered" as Status,
    driver: "—",
    vehicle: "—",
    priority: "Low",
  },
  {
    id: "SR-2024-0436",
    type: "Tanker",
    citizen: "Prakash Deshpande",
    ward: "Mangalwar Peth",
    phone: "9789012345",
    volume: "10000L",
    date: "11 Sep, 12:30",
    status: "Requested" as Status,
    driver: "—",
    vehicle: "—",
    priority: "Critical",
  },
  {
    id: "SR-2024-0435",
    type: "Tanker",
    citizen: "Kiran Kulkarni",
    ward: "Padmarajnagar",
    phone: "9678901234",
    volume: "5000L",
    date: "10 Sep, 14:00",
    status: "Delivered" as Status,
    driver: "Ramesh Kadam",
    vehicle: "MH-09-T-2241",
    priority: "Medium",
  },
  {
    id: "SR-2024-0434",
    type: "Service",
    citizen: "Vaishali Kamble",
    ward: "Shahupuri",
    phone: "9934567890",
    volume: "—",
    date: "10 Sep, 10:00",
    status: "Delivered" as Status,
    driver: "—",
    vehicle: "—",
    priority: "Low",
  },
]

const STATUS_STEPS: Status[] = [
  "Requested",
  "Approved",
  "Dispatched",
  "Delivered",
]

export default function ServiceRequests() {
  const [filter, setFilter] = useState<"All" | "Tanker" | "Service">("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [assignModal, setAssignModal] = useState<typeof requests[0] | null>(
    null,
  )
  const [assignDriver, setAssignDriver] = useState("Prakash Mane")
  const [assignVehicle, setAssignVehicle] = useState("MH-09-T-4521")

  const DRIVERS = [
    "Prakash Mane",
    "Santosh Shinde",
    "Ramesh Kadam",
    "Vijay Patil",
  ]
  const VEHICLES = [
    "MH-09-T-4521",
    "MH-09-T-3814",
    "MH-09-T-2241",
    "MH-09-T-1180",
  ]

  const filtered = requests.filter((r) => {
    const matchType = filter === "All" || r.type === filter
    const matchStatus = statusFilter === "All" || r.status === statusFilter
    return matchType && matchStatus
  })

  const getStepColor = (step: Status, current: Status) => {
    const stepIdx = STATUS_STEPS.indexOf(step)
    const currIdx = STATUS_STEPS.indexOf(current)
    if (stepIdx < currIdx)
      return { bg: "#dcfce7", text: "#166534", border: "#86efac" }
    if (stepIdx === currIdx)
      return { bg: "#0061a5", text: "#fff", border: "#0061a5" }
    return { bg: "#fff", text: "#9ca3af", border: "#e5e7eb" }
  }

  return (
    <div>
      <PageHeader
        title="Service & Tanker Requests"
        subtitle="Unified queue for tanker dispatch and general service requests"
        actions={
          <>
            <OutlineButton icon="download">Export</OutlineButton>
            <PrimaryButton icon="local_shipping">
              New Tanker Request
            </PrimaryButton>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Requests",
            value: requests.length,
            icon: "queue",
            color: "#0061a5",
            bg: "#e8f0fe",
          },
          {
            label: "Pending/Requested",
            value: requests.filter((r) => r.status === "Requested").length,
            icon: "hourglass_top",
            color: "#92400e",
            bg: "#fef3c7",
          },
          {
            label: "Dispatched",
            value: requests.filter((r) => r.status === "Dispatched").length,
            icon: "local_shipping",
            color: "#5b21b6",
            bg: "#ede9fe",
          },
          {
            label: "Delivered Today",
            value: requests.filter((r) => r.status === "Delivered").length,
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

      {/* Status pipeline visualization */}
      <Card className="p-4 mb-4">
        <div className="text-sm font-semibold text-gray-700 mb-3">
          Status Pipeline
        </div>
        <div className="flex items-center gap-0">
          {STATUS_STEPS.map((step, i) => {
            const count = requests.filter((r) => r.status === step).length
            return (
              <div key={step} className="flex items-center flex-1">
                <div
                  onClick={() =>
                    setStatusFilter(statusFilter === step ? "All" : step)
                  }
                  className="flex-1 py-3 px-4 cursor-pointer transition-all hover:opacity-80 text-center"
                  style={{
                    backgroundColor:
                      statusFilter === step ? "#002045" : "#f8fafc",
                    borderRadius:
                      i === 0
                        ? "12px 0 0 12px"
                        : i === STATUS_STEPS.length - 1
                          ? "0 12px 12px 0"
                          : "0",
                    border: "1px solid #e5e7eb",
                    borderRight:
                      i < STATUS_STEPS.length - 1
                        ? "none"
                        : "1px solid #e5e7eb",
                  }}
                >
                  <div
                    className="text-xl font-bold"
                    style={{
                      color: statusFilter === step ? "#66affe" : "#374151",
                    }}
                  >
                    {count}
                  </div>
                  <div
                    className="text-xs font-medium mt-0.5"
                    style={{
                      color: statusFilter === step ? "#fff" : "#6b7280",
                    }}
                  >
                    {step}
                  </div>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <span className="material-symbols-outlined text-gray-300 text-xl z-10 -mx-2">
                    chevron_right
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Type filter + table */}
      <Card className="mb-3 px-4 py-2 flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Type:</span>
        {(["All", "Tanker", "Service"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
            style={
              filter === t
                ? { backgroundColor: "#0061a5", color: "#fff" }
                : { backgroundColor: "#f3f4f6", color: "#374151" }
            }
          >
            {t}
          </button>
        ))}
        {statusFilter !== "All" && (
          <button
            onClick={() => setStatusFilter("All")}
            className="ml-auto flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            <span className="material-symbols-outlined text-sm">close</span>
            Clear filter: {statusFilter}
          </button>
        )}
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {[
                  "ID",
                  "Type",
                  "Citizen",
                  "Ward",
                  "Volume",
                  "Date",
                  "Priority",
                  "Driver",
                  "Vehicle",
                  "Status",
                  "Action",
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
              {filtered.map((r, i) => (
                <tr
                  key={r.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    i % 2 === 1 ? "bg-gray-50/30" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {r.id}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.type === "Tanker"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">
                        {r.type === "Tanker" ? "local_shipping" : "build"}
                      </span>
                      {r.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{r.citizen}</div>
                    <div className="text-xs text-gray-400">{r.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.ward}</td>
                  <td className="px-4 py-3 text-gray-600">{r.volume}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {r.date}
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={r.priority} />
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {r.driver}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {r.vehicle}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {STATUS_STEPS.map((step, idx) => {
                        const currIdx = STATUS_STEPS.indexOf(r.status)
                        const isActive = idx === currIdx
                        const isDone = idx < currIdx
                        return (
                          <div
                            key={step}
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: isDone
                                ? "#16a34a"
                                : isActive
                                  ? "#0061a5"
                                  : "#e5e7eb",
                            }}
                            title={step}
                          />
                        )
                      })}
                      <span
                        className="ml-1 text-xs font-medium"
                        style={{
                          color:
                            r.status === "Delivered"
                              ? "#166534"
                              : r.status === "Requested"
                                ? "#92400e"
                                : "#1e40af",
                        }}
                      >
                        {r.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {r.status === "Requested" && (
                      <button
                        onClick={() => setAssignModal(r)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium text-white transition-colors whitespace-nowrap"
                        style={{ backgroundColor: "#0061a5" }}
                      >
                        Assign &amp; Approve
                      </button>
                    )}
                    {r.status === "Approved" && (
                      <button className="px-2.5 py-1 rounded-lg text-xs font-medium border border-blue-200 text-blue-700 hover:bg-blue-50 whitespace-nowrap">
                        Mark Dispatched
                      </button>
                    )}
                    {r.status === "Dispatched" && (
                      <button className="px-2.5 py-1 rounded-lg text-xs font-medium border border-green-200 text-green-700 hover:bg-green-50 whitespace-nowrap">
                        Mark Delivered
                      </button>
                    )}
                    {r.status === "Delivered" && (
                      <span className="text-xs text-gray-400">Done</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Assign modal */}
      <Modal
        open={!!assignModal}
        onClose={() => setAssignModal(null)}
        title={`Assign & Approve — ${assignModal?.id}`}
      >
        {assignModal && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-blue-50 text-sm text-blue-800">
              <strong>{assignModal.citizen}</strong> · {assignModal.ward} ·{" "}
              {assignModal.volume !== "—"
                ? assignModal.volume
                : "Service Request"}
            </div>
            <FormField label="Assign Driver">
              <Select
                options={DRIVERS}
                value={assignDriver}
                onChange={setAssignDriver}
              />
            </FormField>
            <FormField label="Assign Vehicle">
              <Select
                options={VEHICLES}
                value={assignVehicle}
                onChange={setAssignVehicle}
              />
            </FormField>
            <FormField label="Notes">
              <textarea
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none"
                placeholder="Optional dispatch notes..."
              />
            </FormField>
            <div className="flex justify-end gap-3">
              <OutlineButton onClick={() => setAssignModal(null)}>
                Cancel
              </OutlineButton>
              <PrimaryButton
                icon="local_shipping"
                onClick={() => setAssignModal(null)}
              >
                Approve & Dispatch
              </PrimaryButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
