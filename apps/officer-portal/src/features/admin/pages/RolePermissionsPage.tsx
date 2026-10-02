import { useState } from "react"
import {
  Card,
  PageHeader,
  PrimaryButton,
  OutlineButton,
} from "@/components/Shared"

const ROLES = ["Admin", "Supervisor", "Engineer", "Operator"]

const PERMISSION_GROUPS = [
  {
    group: "Dashboard & Reports",
    icon: "dashboard",
    permissions: [
      { id: "view_dashboard", label: "View Main Dashboard" },
      { id: "view_analytics", label: "View Analytics" },
      { id: "export_reports", label: "Export Reports" },
    ],
  },
  {
    group: "Water Supply",
    icon: "water_drop",
    permissions: [
      { id: "view_schedule", label: "View Supply Schedule" },
      { id: "edit_schedule", label: "Edit Supply Schedule" },
      { id: "manage_outages", label: "Manage Outages" },
      { id: "maintenance_ops", label: "Maintenance Operations" },
    ],
  },
  {
    group: "Complaints",
    icon: "report_problem",
    permissions: [
      { id: "view_complaints", label: "View Complaints" },
      { id: "assign_complaints", label: "Assign Complaints" },
      { id: "resolve_complaints", label: "Resolve Complaints" },
      { id: "delete_complaints", label: "Delete Complaints" },
    ],
  },
  {
    group: "GIS & Network",
    icon: "map",
    permissions: [
      { id: "view_gis", label: "View GIS Map" },
      { id: "edit_network", label: "Edit Network Data" },
    ],
  },
  {
    group: "NRW Management",
    icon: "leak_add",
    permissions: [
      { id: "view_nrw", label: "View NRW Data" },
      { id: "edit_nrw", label: "Edit NRW Targets" },
      { id: "nrw_analysis", label: "Leakage Analysis Tools" },
    ],
  },
  {
    group: "Citizens & Connections",
    icon: "people",
    permissions: [
      { id: "view_citizens", label: "View Citizens" },
      { id: "edit_citizens", label: "Edit Citizens" },
      { id: "approve_connections", label: "Approve Connections" },
      { id: "manage_service_req", label: "Manage Service Requests" },
    ],
  },
  {
    group: "Notifications",
    icon: "notifications",
    permissions: [
      { id: "view_notifications", label: "View Notification History" },
      { id: "send_notifications", label: "Send Notifications" },
      { id: "bulk_notify", label: "Bulk / City-wide Notify" },
    ],
  },
  {
    group: "Administration",
    icon: "admin_panel_settings",
    permissions: [
      { id: "manage_users", label: "Manage Users" },
      { id: "manage_roles", label: "Manage Roles & Permissions" },
      { id: "view_audit", label: "View Audit Logs" },
      { id: "system_settings", label: "System Settings" },
    ],
  },
]

const DEFAULT_PERMISSIONS: Record<string, Record<string, boolean>> = {
  Admin: {
    view_dashboard: true,
    view_analytics: true,
    export_reports: true,
    view_schedule: true,
    edit_schedule: true,
    manage_outages: true,
    maintenance_ops: true,
    view_complaints: true,
    assign_complaints: true,
    resolve_complaints: true,
    delete_complaints: true,
    view_gis: true,
    edit_network: true,
    view_nrw: true,
    edit_nrw: true,
    nrw_analysis: true,
    view_citizens: true,
    edit_citizens: true,
    approve_connections: true,
    manage_service_req: true,
    view_notifications: true,
    send_notifications: true,
    bulk_notify: true,
    manage_users: true,
    manage_roles: true,
    view_audit: true,
    system_settings: true,
  },
  Supervisor: {
    view_dashboard: true,
    view_analytics: true,
    export_reports: true,
    view_schedule: true,
    edit_schedule: true,
    manage_outages: true,
    maintenance_ops: false,
    view_complaints: true,
    assign_complaints: true,
    resolve_complaints: true,
    delete_complaints: false,
    view_gis: true,
    edit_network: false,
    view_nrw: true,
    edit_nrw: false,
    nrw_analysis: true,
    view_citizens: true,
    edit_citizens: true,
    approve_connections: true,
    manage_service_req: true,
    view_notifications: true,
    send_notifications: true,
    bulk_notify: false,
    manage_users: false,
    manage_roles: false,
    view_audit: true,
    system_settings: false,
  },
  Engineer: {
    view_dashboard: true,
    view_analytics: true,
    export_reports: false,
    view_schedule: true,
    edit_schedule: false,
    manage_outages: false,
    maintenance_ops: true,
    view_complaints: true,
    assign_complaints: false,
    resolve_complaints: true,
    delete_complaints: false,
    view_gis: true,
    edit_network: false,
    view_nrw: true,
    edit_nrw: false,
    nrw_analysis: true,
    view_citizens: true,
    edit_citizens: false,
    approve_connections: false,
    manage_service_req: false,
    view_notifications: true,
    send_notifications: false,
    bulk_notify: false,
    manage_users: false,
    manage_roles: false,
    view_audit: false,
    system_settings: false,
  },
  Operator: {
    view_dashboard: true,
    view_analytics: false,
    export_reports: false,
    view_schedule: true,
    edit_schedule: false,
    manage_outages: false,
    maintenance_ops: false,
    view_complaints: true,
    assign_complaints: false,
    resolve_complaints: false,
    delete_complaints: false,
    view_gis: true,
    edit_network: false,
    view_nrw: false,
    edit_nrw: false,
    nrw_analysis: false,
    view_citizens: true,
    edit_citizens: false,
    approve_connections: false,
    manage_service_req: true,
    view_notifications: true,
    send_notifications: false,
    bulk_notify: false,
    manage_users: false,
    manage_roles: false,
    view_audit: false,
    system_settings: false,
  },
}

export default function RolePermissions() {
  const [perms, setPerms] = useState(DEFAULT_PERMISSIONS)
  const [activeRole, setActiveRole] = useState("Admin")

  const togglePerm = (role: string, permId: string) => {
    if (role === "Admin") return // Admin always has all
    setPerms((prev) => ({
      ...prev,
      [role]: { ...prev[role], [permId]: !prev[role][permId] },
    }))
  }

  const totalPerms = (role: string) =>
    Object.values(perms[role] ?? {}).filter(Boolean).length

  const ROLE_ICONS: Record<string, string> = {
    Admin: "shield",
    Supervisor: "manage_accounts",
    Engineer: "engineering",
    Operator: "person",
  }
  type RoleColor = {
    bg: string
    text: string
  }
  const ROLE_COLORS: Record<string, RoleColor> = {
    Admin: { bg: "#ede9fe", text: "#5b21b6" },
    Supervisor: { bg: "#dcfce7", text: "#166534" },
    Engineer: { bg: "#dbeafe", text: "#1e40af" },
    Operator: { bg: "#f3f4f6", text: "#374151" },
  }

  return (
    <div>
      <PageHeader
        title="Role & Permission Management"
        subtitle="Configure access control for each system role"
        actions={
          <>
            <OutlineButton icon="history">Reset to Defaults</OutlineButton>
            <PrimaryButton icon="save">Save Changes</PrimaryButton>
          </>
        }
      />

      {/* Role cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {ROLES.map((role) => {
          const rc = ROLE_COLORS[role]
          const count = totalPerms(role)
          const total = PERMISSION_GROUPS.reduce(
            (s, g) => s + g.permissions.length,
            0,
          )
          return (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className="text-left"
            >
              <Card
                className={`p-4 transition-all hover:shadow-md ${
                  activeRole === role ? "ring-2" : ""
                }`}
                style={{ ringColor: rc.text } as any}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: rc.bg }}
                  >
                    <span
                      className="material-symbols-outlined text-xl"
                      style={{ color: rc.text }}
                    >
                      {ROLE_ICONS[role]}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{role}</div>
                    <div className="text-xs text-gray-500">
                      {count}/{total} permissions
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: `${(count / total) * 100}%`,
                      backgroundColor: rc.text,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {Math.round((count / total) * 100)}% access level
                </div>
              </Card>
            </button>
          )
        })}
      </div>

      {/* Permission matrix */}
      <Card>
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">Permissions —</span>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: ROLE_COLORS[activeRole].bg,
                color: ROLE_COLORS[activeRole].text,
              }}
            >
              {activeRole}
            </span>
          </div>
          {activeRole === "Admin" && (
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">lock</span>
              Admin has all permissions
            </div>
          )}
        </div>
        <div className="divide-y divide-gray-50">
          {PERMISSION_GROUPS.map((group) => (
            <div key={group.group} className="px-4 py-4">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="material-symbols-outlined text-base"
                  style={{ color: "#0061a5" }}
                >
                  {group.icon}
                </span>
                <div className="font-medium text-gray-800 text-sm">
                  {group.group}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {group.permissions.map((perm) => {
                  const enabled = perms[activeRole]?.[perm.id] ?? false
                  return (
                    <button
                      key={perm.id}
                      onClick={() => togglePerm(activeRole, perm.id)}
                      disabled={activeRole === "Admin"}
                      className="flex items-center gap-3 p-3 rounded-xl border text-left transition-all"
                      style={{
                        borderColor: enabled ? "#86efac" : "#e5e7eb",
                        backgroundColor: enabled ? "#f0fdf4" : "#fafafa",
                        opacity: activeRole === "Admin" ? 0.8 : 1,
                        cursor:
                          activeRole === "Admin" ? "not-allowed" : "pointer",
                      }}
                    >
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
                          enabled ? "bg-green-500" : "bg-gray-200"
                        }`}
                      >
                        {enabled && (
                          <span className="material-symbols-outlined text-white text-xs">
                            check
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-700">
                        {perm.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
