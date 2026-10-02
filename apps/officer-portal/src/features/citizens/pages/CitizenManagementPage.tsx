import { useState } from "react"
import {
  Card,
  PageHeader,
  PrimaryButton,
  OutlineButton,
  Badge,
} from "@/components/Shared"

const citizens = [
  {
    id: "KMC-C-00421",
    name: "Ramesh Shinde",
    ward: "Shivaji Peth",
    connId: "KMC-2019-0421",
    phone: "9876543210",
    status: "Active",
    type: "Residential",
    joined: "14 Mar 2019",
    outstanding: "₹0",
    lastBill: "₹1,240",
  },
  {
    id: "KMC-C-00388",
    name: "Sunita Patil",
    ward: "Rajarampuri",
    connId: "KMC-2020-0388",
    phone: "9823456789",
    status: "Active",
    type: "Residential",
    joined: "02 Jul 2020",
    outstanding: "₹2,480",
    lastBill: "₹1,240",
  },
  {
    id: "KMC-C-00512",
    name: "Mahadeo Gaikwad",
    ward: "Kasba Bawada",
    connId: "KMC-2018-0512",
    phone: "9765432109",
    status: "Inactive",
    type: "Residential",
    joined: "20 Jan 2018",
    outstanding: "₹6,200",
    lastBill: "₹1,240",
  },
  {
    id: "KMC-C-00234",
    name: "Vaishali Kamble",
    ward: "Shahupuri",
    connId: "KMC-2021-0234",
    phone: "9934567890",
    status: "Active",
    type: "Commercial",
    joined: "08 Sep 2021",
    outstanding: "₹0",
    lastBill: "₹4,820",
  },
  {
    id: "KMC-C-00611",
    name: "Balasaheb Jadhav",
    ward: "Laxmipuri",
    connId: "KMC-2017-0611",
    phone: "9845678901",
    status: "Active",
    type: "Residential",
    joined: "19 Feb 2017",
    outstanding: "₹0",
    lastBill: "₹980",
  },
  {
    id: "KMC-C-00445",
    name: "Anita Deshmukh",
    ward: "Tarabai Park",
    connId: "KMC-2022-0445",
    phone: "9712345678",
    status: "Pending",
    type: "Residential",
    joined: "30 Nov 2022",
    outstanding: "₹1,240",
    lastBill: "₹1,240",
  },
  {
    id: "KMC-C-00178",
    name: "Sunil More",
    ward: "Rankala",
    connId: "KMC-2016-0178",
    phone: "9856789012",
    status: "Active",
    type: "Residential",
    joined: "05 Jun 2016",
    outstanding: "₹0",
    lastBill: "₹1,120",
  },
  {
    id: "KMC-C-00339",
    name: "Kiran Kulkarni",
    ward: "Padmarajnagar",
    connId: "KMC-2019-0339",
    phone: "9678901234",
    status: "Active",
    type: "Industrial",
    joined: "11 Oct 2019",
    outstanding: "₹18,400",
    lastBill: "₹12,600",
  },
  {
    id: "KMC-C-00290",
    name: "Meena Bhosale",
    ward: "Subhash Nagar",
    connId: "KMC-2020-0290",
    phone: "9901234567",
    status: "Active",
    type: "Residential",
    joined: "14 Apr 2020",
    outstanding: "₹0",
    lastBill: "₹1,060",
  },
  {
    id: "KMC-C-00502",
    name: "Prakash Deshpande",
    ward: "Mangalwar Peth",
    connId: "KMC-2018-0502",
    phone: "9789012345",
    status: "Inactive",
    type: "Commercial",
    joined: "28 Aug 2018",
    outstanding: "₹14,800",
    lastBill: "₹3,700",
  },
  {
    id: "KMC-C-00407",
    name: "Sarita Pawar",
    ward: "New Shahupuri",
    connId: "KMC-2021-0407",
    phone: "9912345670",
    status: "Active",
    type: "Residential",
    joined: "16 Jan 2021",
    outstanding: "₹0",
    lastBill: "₹1,180",
  },
  {
    id: "KMC-C-00566",
    name: "Ganesh Sawant",
    ward: "Sangamwadi",
    connId: "KMC-2022-0566",
    phone: "9823456780",
    status: "Active",
    type: "Residential",
    joined: "09 Mar 2022",
    outstanding: "₹620",
    lastBill: "₹1,240",
  },
]

export default function CitizenManagement() {
  const [search, setSearch] = useState("")
  const [wardFilter, setWardFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [selected, setSelected] = useState<typeof citizens[0] | null>(null)

  const filtered = citizens.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.connId.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    const matchWard = wardFilter === "All" || c.ward === wardFilter
    const matchStatus = statusFilter === "All" || c.status === statusFilter
    return matchSearch && matchWard && matchStatus
  })

  const wards = ["All", ...Array.from(new Set(citizens.map((c) => c.ward)))]

  return (
    <div>
      <PageHeader
        title="Citizen Management"
        subtitle={`${citizens.length} registered connections — Kolhapur Municipal Corporation`}
        actions={
          <>
            <OutlineButton icon="upload">Import</OutlineButton>
            <PrimaryButton icon="person_add">Add Citizen</PrimaryButton>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Connections",
            value: citizens.length,
            icon: "people",
            color: "#0061a5",
            bg: "#e8f0fe",
          },
          {
            label: "Active",
            value: citizens.filter((c) => c.status === "Active").length,
            icon: "check_circle",
            color: "#166534",
            bg: "#dcfce7",
          },
          {
            label: "Pending",
            value: citizens.filter((c) => c.status === "Pending").length,
            icon: "pending",
            color: "#92400e",
            bg: "#fef3c7",
          },
          {
            label: "Outstanding Bills",
            value: "₹43,740",
            icon: "account_balance_wallet",
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
      <Card className="p-3 mb-4 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white">
          <span className="material-symbols-outlined text-gray-400 text-lg">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, connection ID, or phone..."
            className="flex-1 text-sm outline-none bg-transparent"
          />
        </div>
        <select
          value={wardFilter}
          onChange={(e) => setWardFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
        >
          {wards.map((w) => (
            <option key={w}>{w}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
        >
          {["All", "Active", "Inactive", "Pending"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </Card>

      <div className={`flex gap-4 ${selected ? "" : ""}`}>
        {/* Table */}
        <Card className={`${selected ? "flex-1" : "w-full"} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    "Conn. ID",
                    "Name",
                    "Ward",
                    "Type",
                    "Phone",
                    "Outstanding",
                    "Status",
                    "",
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
                    onClick={() =>
                      setSelected(selected?.id === c.id ? null : c)
                    }
                    className={`border-b border-gray-50 hover:bg-blue-50/50 transition-colors cursor-pointer ${
                      selected?.id === c.id
                        ? "bg-blue-50"
                        : i % 2 === 1
                          ? "bg-gray-50/30"
                          : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {c.connId}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                          style={{ backgroundColor: "#0061a5" }}
                        >
                          {c.name[0]}
                        </div>
                        <span className="font-medium text-gray-900">
                          {c.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.ward}</td>
                    <td className="px-4 py-3 text-gray-600">{c.type}</td>
                    <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          c.outstanding === "₹0"
                            ? "text-green-700 font-medium"
                            : "text-red-700 font-semibold"
                        }
                      >
                        {c.outstanding}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={c.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="material-symbols-outlined text-gray-400 text-lg">
                        chevron_right
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
            Showing {filtered.length} of {citizens.length} records
          </div>
        </Card>

        {/* Detail panel */}
        {selected && (
          <Card className="w-80 shrink-0 p-0 overflow-hidden flex flex-col">
            <div
              className="px-5 py-4 flex items-center justify-between border-b border-gray-100"
              style={{ backgroundColor: "#002045" }}
            >
              <div className="text-white font-semibold text-sm">
                Citizen Details
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-5 border-b border-gray-100 text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white mx-auto mb-3"
                  style={{ backgroundColor: "#0061a5" }}
                >
                  {selected.name[0]}
                </div>
                <div className="font-semibold text-gray-900">
                  {selected.name}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {selected.type} Connection
                </div>
                <div className="mt-2">
                  <Badge status={selected.status} />
                </div>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { label: "Connection ID", value: selected.connId },
                  { label: "Ward", value: selected.ward },
                  { label: "Phone", value: selected.phone },
                  { label: "Member Since", value: selected.joined },
                  { label: "Last Bill", value: selected.lastBill },
                  { label: "Outstanding", value: selected.outstanding },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between items-start"
                  >
                    <span className="text-xs text-gray-500">{row.label}</span>
                    <span className="text-xs font-medium text-gray-900 text-right max-w-40">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-5 pt-0 space-y-2 border-t border-gray-100 mt-2 pt-4">
                <button
                  className="w-full py-2 rounded-lg text-sm font-medium text-white transition-colors"
                  style={{ backgroundColor: "#0061a5" }}
                >
                  Edit Details
                </button>
                <button className="w-full py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                  View Bill History
                </button>
                <button className="w-full py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                  Complaint History
                </button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
