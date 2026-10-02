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

const officers = [
  {
    id: "USR-001",
    name: "Suresh Patil",
    email: "suresh.patil@kmcwater.gov.in",
    role: "Admin",
    ward: "All",
    phone: "9876543210",
    joined: "01 Apr 2019",
    lastLogin: "11 Sep 2024, 08:12",
    status: "Active",
    permissions: 32,
  },
  {
    id: "USR-002",
    name: "Rajesh Kadam",
    email: "rajesh.kadam@kmcwater.gov.in",
    role: "Engineer",
    ward: "Central",
    phone: "9765432109",
    joined: "15 Jun 2020",
    lastLogin: "11 Sep 2024, 09:34",
    status: "Active",
    permissions: 18,
  },
  {
    id: "USR-003",
    name: "Priya Shinde",
    email: "priya.shinde@kmcwater.gov.in",
    role: "Supervisor",
    ward: "North / South",
    phone: "9823456789",
    joined: "22 Jan 2021",
    lastLogin: "10 Sep 2024, 17:22",
    status: "Active",
    permissions: 24,
  },
  {
    id: "USR-004",
    name: "Anil Jadhav",
    email: "anil.jadhav@kmcwater.gov.in",
    role: "Engineer",
    ward: "East",
    phone: "9934567890",
    joined: "08 Mar 2022",
    lastLogin: "11 Sep 2024, 07:55",
    status: "Active",
    permissions: 18,
  },
  {
    id: "USR-005",
    name: "Deepak Kulkarni",
    email: "deepak.kulkarni@kmcwater.gov.in",
    role: "Supervisor",
    ward: "Central / West",
    phone: "9845678901",
    joined: "03 Aug 2020",
    lastLogin: "09 Sep 2024, 14:18",
    status: "Active",
    permissions: 24,
  },
  {
    id: "USR-006",
    name: "Savita More",
    email: "savita.more@kmcwater.gov.in",
    role: "Engineer",
    ward: "South",
    phone: "9712345678",
    joined: "19 Sep 2022",
    lastLogin: "11 Sep 2024, 10:01",
    status: "Active",
    permissions: 18,
  },
  {
    id: "USR-007",
    name: "Ravi Kamble",
    email: "ravi.kamble@kmcwater.gov.in",
    role: "Operator",
    ward: "West",
    phone: "9856789012",
    joined: "11 Nov 2021",
    lastLogin: "08 Sep 2024, 08:44",
    status: "Active",
    permissions: 10,
  },
  {
    id: "USR-008",
    name: "Nanda Pawar",
    email: "nanda.pawar@kmcwater.gov.in",
    role: "Supervisor",
    ward: "North",
    phone: "9678901234",
    joined: "02 Feb 2023",
    lastLogin: "10 Sep 2024, 11:30",
    status: "Active",
    permissions: 24,
  },
  {
    id: "USR-009",
    name: "Sachin Gaikwad",
    email: "sachin.gaikwad@kmcwater.gov.in",
    role: "Operator",
    ward: "East / West",
    phone: "9901234567",
    joined: "25 May 2023",
    lastLogin: "07 Sep 2024, 16:20",
    status: "Inactive",
    permissions: 10,
  },
]

type RoleColor = {
  bg: string
  text: string
}

const ROLES = ["Admin", "Supervisor", "Engineer", "Operator"]
const ROLE_COLORS: Record<string, RoleColor> = {
  Admin: { bg: "#ede9fe", text: "#5b21b6" },
  Supervisor: { bg: "#dcfce7", text: "#166534" },
  Engineer: { bg: "#dbeafe", text: "#1e40af" },
  Operator: { bg: "#f3f4f6", text: "#374151" },
}

export default function OfficerUserManagement() {
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("All")
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: ROLES[1],
    ward: WARDS[0],
  })

  const filtered = officers.filter((o) => {
    const matchSearch =
      !search ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === "All" || o.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <div>
      <PageHeader
        title="Officer & User Management"
        subtitle="System users — admins, engineers, supervisors, and operators"
        actions={
          <>
            <OutlineButton icon="download">Export</OutlineButton>
            <PrimaryButton icon="person_add" onClick={() => setShowAdd(true)}>
              Add New Officer
            </PrimaryButton>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Officers",
            value: officers.length,
            icon: "group",
            color: "#0061a5",
            bg: "#e8f0fe",
          },
          {
            label: "Active",
            value: officers.filter((o) => o.status === "Active").length,
            icon: "check_circle",
            color: "#166534",
            bg: "#dcfce7",
          },
          {
            label: "Online Today",
            value: 7,
            icon: "circle",
            color: "#16a34a",
            bg: "#dcfce7",
          },
          {
            label: "Roles",
            value: 4,
            icon: "badge",
            color: "#5b21b6",
            bg: "#ede9fe",
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

      <Card className="p-3 mb-4 flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white flex-1">
          <span className="material-symbols-outlined text-gray-400 text-base">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="flex-1 text-sm outline-none bg-transparent"
          />
        </div>
        <span className="text-sm text-gray-600">Role:</span>
        {["All", ...ROLES].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={
              roleFilter === r
                ? { backgroundColor: "#002045", color: "#fff" }
                : { backgroundColor: "#f3f4f6", color: "#374151" }
            }
          >
            {r}
          </button>
        ))}
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {[
                  "Officer",
                  "Email",
                  "Role",
                  "Ward/Zone",
                  "Phone",
                  "Permissions",
                  "Joined",
                  "Last Login",
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
              {filtered.map((o, i) => {
                const rc = ROLE_COLORS[o.role] ?? ROLE_COLORS.Operator
                return (
                  <tr
                    key={o.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      i % 2 === 1 ? "bg-gray-50/30" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                          style={{ backgroundColor: "#0061a5" }}
                        >
                          {o.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {o.name}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">
                            {o.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {o.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: rc.bg, color: rc.text }}
                      >
                        {o.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {o.ward}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{o.phone}</td>
                    <td className="px-4 py-3 text-gray-700 font-medium">
                      {o.permissions}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {o.joined}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {o.lastLogin}
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
                          <span className="material-symbols-outlined text-blue-600 text-base">
                            edit
                          </span>
                        </button>
                        <button
                          className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                          title="Permissions"
                        >
                          <span className="material-symbols-outlined text-gray-500 text-base">
                            security
                          </span>
                        </button>
                        <button
                          className="p-1.5 rounded hover:bg-red-50 transition-colors"
                          title="Deactivate"
                        >
                          <span className="material-symbols-outlined text-red-400 text-base">
                            block
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add New Officer"
        width="max-w-lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full Name">
              <input
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
              />
            </FormField>
            <FormField label="Phone">
              <input
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="10-digit mobile"
              />
            </FormField>
            <FormField label="Email">
              <input
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm col-span-2"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@kmcwater.gov.in"
              />
            </FormField>
            <FormField label="Role">
              <Select
                options={ROLES}
                value={form.role}
                onChange={(v: string) => setForm({ ...form, role: v })}
              />
            </FormField>
            <FormField label="Assigned Ward/Zone">
              <Select
                options={["All Wards", ...WARDS]}
                value={form.ward}
                onChange={(v: string) => setForm({ ...form, ward: v })}
              />
            </FormField>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-xs text-blue-800 flex items-start gap-2">
            <span className="material-symbols-outlined text-sm shrink-0">
              info
            </span>
            A temporary password will be emailed to the officer. They will be
            prompted to change it on first login.
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <OutlineButton onClick={() => setShowAdd(false)}>
              Cancel
            </OutlineButton>
            <PrimaryButton icon="person_add" onClick={() => setShowAdd(false)}>
              Create Officer Account
            </PrimaryButton>
          </div>
        </div>
      </Modal>
    </div>
  )
}
