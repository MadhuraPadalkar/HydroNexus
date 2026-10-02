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

const connections = [
  {
    id: "KMC-2024-0892",
    citizen: "Ramesh Shinde",
    ward: "Shivaji Peth",
    type: "Residential",
    size: "15mm",
    applied: "01 Sep 2024",
    approved: "05 Sep 2024",
    status: "Active",
    meter: "KMC-M-2921",
  },
  {
    id: "KMC-2024-0891",
    citizen: "Sunita Patil",
    ward: "Rajarampuri",
    type: "Residential",
    size: "15mm",
    applied: "28 Aug 2024",
    approved: "02 Sep 2024",
    status: "Active",
    meter: "KMC-M-2920",
  },
  {
    id: "KMC-2024-0890",
    citizen: "Ganesh Sawant",
    ward: "Sangamwadi",
    type: "Residential",
    size: "15mm",
    applied: "02 Sep 2024",
    approved: "—",
    status: "Pending",
    meter: "—",
  },
  {
    id: "KMC-2024-0889",
    citizen: "Vaishali Kamble",
    ward: "Shahupuri",
    type: "Commercial",
    size: "25mm",
    applied: "20 Aug 2024",
    approved: "26 Aug 2024",
    status: "Active",
    meter: "KMC-M-2918",
  },
  {
    id: "KMC-2024-0888",
    citizen: "Prakash Deshpande",
    ward: "Mangalwar Peth",
    type: "Commercial",
    size: "25mm",
    applied: "25 Jul 2024",
    approved: "—",
    status: "Inactive",
    meter: "KMC-M-2917",
  },
  {
    id: "KMC-2024-0887",
    citizen: "Anita Deshmukh",
    ward: "Tarabai Park",
    type: "Residential",
    size: "15mm",
    applied: "05 Sep 2024",
    approved: "—",
    status: "Pending",
    meter: "—",
  },
  {
    id: "KMC-2024-0886",
    citizen: "Kiran Kulkarni",
    ward: "Padmarajnagar",
    type: "Industrial",
    size: "50mm",
    applied: "10 Aug 2024",
    approved: "18 Aug 2024",
    status: "Active",
    meter: "KMC-M-2916",
  },
  {
    id: "KMC-2024-0885",
    citizen: "Sarita Pawar",
    ward: "New Shahupuri",
    type: "Residential",
    size: "15mm",
    applied: "06 Sep 2024",
    approved: "—",
    status: "Pending",
    meter: "—",
  },
  {
    id: "KMC-2024-0884",
    citizen: "Mahadeo Gaikwad",
    ward: "Kasba Bawada",
    type: "Residential",
    size: "15mm",
    applied: "01 Jul 2024",
    approved: "10 Jul 2024",
    status: "Inactive",
    meter: "KMC-M-2914",
  },
  {
    id: "KMC-2024-0883",
    citizen: "Sunil More",
    ward: "Rankala",
    type: "Residential",
    size: "15mm",
    applied: "15 Aug 2024",
    approved: "22 Aug 2024",
    status: "Active",
    meter: "KMC-M-2913",
  },
]

const CONN_TYPES = ["Residential", "Commercial", "Industrial", "Bulk"]
const SIZES = ["15mm", "20mm", "25mm", "32mm", "50mm", "80mm"]

export default function WaterConnections() {
  const [filter, setFilter] = useState("All")
  const [showApprove, setShowApprove] = useState<typeof connections[0] | null>(
    null,
  )
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState({
    citizen: "",
    ward: WARDS[0],
    type: CONN_TYPES[0],
    size: SIZES[0],
    phone: "",
    address: "",
  })

  const tabs = ["All", "Active", "Pending", "Inactive"]
  const filtered =
    filter === "All"
      ? connections
      : connections.filter((c) => c.status === filter)

  return (
    <div>
      <PageHeader
        title="Water Connection Management"
        subtitle="Connection registry, status management, and new connection approvals"
        actions={
          <>
            <OutlineButton icon="download">Export</OutlineButton>
            <PrimaryButton icon="add" onClick={() => setShowNew(true)}>
              New Connection
            </PrimaryButton>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Connections",
            value: connections.length,
            icon: "plumbing",
            color: "#0061a5",
            bg: "#e8f0fe",
          },
          {
            label: "Active",
            value: connections.filter((c) => c.status === "Active").length,
            icon: "check_circle",
            color: "#166534",
            bg: "#dcfce7",
          },
          {
            label: "Pending Approval",
            value: connections.filter((c) => c.status === "Pending").length,
            icon: "pending",
            color: "#92400e",
            bg: "#fef3c7",
          },
          {
            label: "Inactive",
            value: connections.filter((c) => c.status === "Inactive").length,
            icon: "cancel",
            color: "#374151",
            bg: "#f3f4f6",
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

      {/* Pending approvals alert */}
      {connections.some((c) => c.status === "Pending") && (
        <div
          className="mb-4 p-3 rounded-xl flex items-center gap-3"
          style={{
            backgroundColor: "#fef3c7",
            borderLeft: "4px solid #d97706",
          }}
        >
          <span className="material-symbols-outlined text-amber-600">
            pending_actions
          </span>
          <div className="text-sm text-amber-800 font-medium">
            {connections.filter((c) => c.status === "Pending").length}{" "}
            connections pending approval — review and approve below
          </div>
          <button
            onClick={() => setFilter("Pending")}
            className="ml-auto text-xs px-3 py-1 rounded-lg bg-amber-600 text-white font-medium"
          >
            Review Now
          </button>
        </div>
      )}

      <div className="flex border-b border-gray-200 mb-4">
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
            <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-gray-100">
              {t === "All"
                ? connections.length
                : connections.filter((c) => c.status === t).length}
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
                  "Connection ID",
                  "Citizen Name",
                  "Ward",
                  "Type",
                  "Pipe Size",
                  "Applied",
                  "Approved",
                  "Meter ID",
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
              {filtered.map((c, i) => (
                <tr
                  key={c.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    i % 2 === 1 ? "bg-gray-50/30" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {c.id}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {c.citizen}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.ward}</td>
                  <td className="px-4 py-3 text-gray-600">{c.type}</td>
                  <td className="px-4 py-3 text-gray-600">{c.size}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {c.applied}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {c.approved}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {c.meter}
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={c.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {c.status === "Pending" && (
                        <button
                          onClick={() => setShowApprove(c)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium text-white transition-colors"
                          style={{ backgroundColor: "#0061a5" }}
                        >
                          Approve
                        </button>
                      )}
                      <button className="p-1.5 rounded hover:bg-gray-100 transition-colors">
                        <span className="material-symbols-outlined text-gray-500 text-base">
                          edit
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

      {/* Approve modal */}
      <Modal
        open={!!showApprove}
        onClose={() => setShowApprove(null)}
        title="Approve Water Connection"
      >
        {showApprove && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-50 space-y-2 text-sm">
              {[
                ["Applicant", showApprove.citizen],
                ["Ward", showApprove.ward],
                ["Connection Type", showApprove.type],
                ["Pipe Size", showApprove.size],
                ["Applied on", showApprove.applied],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium text-gray-800">{v}</span>
                </div>
              ))}
            </div>
            <FormField label="Assign Meter ID">
              <input
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                placeholder="e.g. KMC-M-2922"
              />
            </FormField>
            <FormField label="Remarks">
              <textarea
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none"
                placeholder="Optional approval remarks..."
              />
            </FormField>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowApprove(null)}
                className="px-4 py-2 rounded-lg border border-red-200 text-red-700 text-sm font-medium hover:bg-red-50"
              >
                Reject
              </button>
              <OutlineButton onClick={() => setShowApprove(null)}>
                Cancel
              </OutlineButton>
              <PrimaryButton
                icon="check_circle"
                onClick={() => setShowApprove(null)}
              >
                Approve Connection
              </PrimaryButton>
            </div>
          </div>
        )}
      </Modal>

      {/* New connection modal */}
      <Modal
        open={showNew}
        onClose={() => setShowNew(false)}
        title="New Connection Application"
        width="max-w-xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Citizen Name">
              <input
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                value={newForm.citizen}
                onChange={(e) =>
                  setNewForm({ ...newForm, citizen: e.target.value })
                }
                placeholder="Full name"
              />
            </FormField>
            <FormField label="Phone">
              <input
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                value={newForm.phone}
                onChange={(e) =>
                  setNewForm({ ...newForm, phone: e.target.value })
                }
                placeholder="10-digit mobile"
              />
            </FormField>
            <FormField label="Ward">
              <Select
                options={WARDS}
                value={newForm.ward}
                onChange={(v: string) => setNewForm({ ...newForm, ward: v })}
              />
            </FormField>
            <FormField label="Connection Type">
              <Select
                options={CONN_TYPES}
                value={newForm.type}
                onChange={(v: string) => setNewForm({ ...newForm, type: v })}
              />
            </FormField>
            <FormField label="Pipe Size">
              <Select
                options={SIZES}
                value={newForm.size}
                onChange={(v: string) => setNewForm({ ...newForm, size: v })}
              />
            </FormField>
          </div>
          <FormField label="Address">
            <textarea
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none"
              value={newForm.address}
              onChange={(e) =>
                setNewForm({ ...newForm, address: e.target.value })
              }
              placeholder="Full property address"
            />
          </FormField>
          <div className="flex justify-end gap-3 pt-1">
            <OutlineButton onClick={() => setShowNew(false)}>
              Cancel
            </OutlineButton>
            <PrimaryButton icon="send" onClick={() => setShowNew(false)}>
              Submit Application
            </PrimaryButton>
          </div>
        </div>
      </Modal>
    </div>
  )
}
