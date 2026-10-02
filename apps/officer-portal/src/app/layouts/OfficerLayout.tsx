import { useState, useEffect } from "react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

interface NavChild {
  id: string
  label: string
  path: string
}

interface NavItem {
  id: string
  label: string
  icon: string
  path?: string
  children?: NavChild[]
}

const NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/" },
  {
    id: "supply",
    label: "Supply",
    icon: "water_drop",
    children: [
      {
        id: "supply-schedule",
        label: "Supply Schedule",
        path: "/supply/schedule",
      },
      {
        id: "outage-management",
        label: "Outage Management",
        path: "/supply/outages",
      },
      {
        id: "maintenance-schedule",
        label: "Maintenance",
        path: "/supply/maintenance",
      },
    ],
  },
  {
    id: "complaints",
    label: "Complaints",
    icon: "report_problem",
    path: "/complaints",
  },
  { id: "gis", label: "GIS Network", icon: "map", path: "/gis" },
  {
    id: "nrw",
    label: "NRW",
    icon: "leak_add",
    children: [
      {
        id: "nrw-monitoring",
        label: "NRW Monitoring",
        path: "/nrw/monitoring",
      },
      {
        id: "zone-accounting",
        label: "Zone Accounting",
        path: "/nrw/zone-accounting",
      },
      {
        id: "leakage-analysis",
        label: "Leakage Analysis",
        path: "/nrw/leakage",
      },
      {
        id: "multi-ward-compare",
        label: "Ward Comparison",
        path: "/nrw/ward-comparison",
      },
    ],
  },
  {
    id: "citizens",
    label: "Citizens",
    icon: "people",
    children: [
      {
        id: "citizen-management",
        label: "Citizen Mgmt",
        path: "/citizens/directory",
      },
      {
        id: "ward-zone-mgmt",
        label: "Ward/Zone Mgmt",
        path: "/citizens/wards",
      },
      {
        id: "water-connections",
        label: "Connections",
        path: "/citizens/connections",
      },
      {
        id: "service-requests",
        label: "Service Requests",
        path: "/citizens/service-requests",
      },
    ],
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: "notifications",
    children: [
      {
        id: "notification-composer",
        label: "Compose",
        path: "/notifications/composer",
      },
      {
        id: "notification-history",
        label: "History",
        path: "/notifications/history",
      },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "bar_chart",
    path: "/analytics",
  },
  {
    id: "emergency",
    label: "Flood Monitoring",
    icon: "flood",
    path: "/emergency/flood",
  },
  {
    id: "admin",
    label: "Administration",
    icon: "admin_panel_settings",
    children: [
      { id: "admin-users", label: "Officer Users", path: "/admin/users" },
      { id: "admin-roles", label: "Role Permissions", path: "/admin/roles" },
      {
        id: "admin-settings",
        label: "System Settings",
        path: "/admin/settings",
      },
      { id: "admin-audit", label: "Audit Logs", path: "/admin/audit-logs" },
    ],
  },
  { id: "profile", label: "Profile", icon: "account_circle", path: "/profile" },
]

export default function OfficerLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { session, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const s = new Set<string>()
    for (const item of NAV) {
      if (item.children?.some((c) => location.pathname.startsWith(c.path))) {
        s.add(item.id)
      }
    }
    return s
  })

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const getParentLabel = () => {
    for (const item of NAV) {
      if (item.path === location.pathname) return item.label
      if (item.children) {
        const child = item.children.find((c) => location.pathname === c.path)
        if (child) return `${item.label} / ${child.label}`
      }
    }
    return "Dashboard"
  }

  useEffect(() => {
    const pageLabel = getParentLabel()
    document.title = `${pageLabel} | HydroNexus Officer Portal`
  }, [location.pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6f9]">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 md:static md:flex flex-col shrink-0 overflow-y-auto transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{ backgroundColor: "#002045" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#0061a5]">
              <span className="material-symbols-outlined text-white text-lg">
                water
              </span>
            </div>
            <div>
              <div className="text-white font-semibold text-sm leading-tight">
                KMC Smart
              </div>
              <div className="text-blue-300 text-xs">Water Portal</div>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-white/60 hover:text-white"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {NAV.map((item) => (
            <div key={item.id}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer group"
                    style={{
                      color: item.children.some(
                        (c) => location.pathname === c.path,
                      )
                        ? "#66affe"
                        : "rgba(255,255,255,0.7)",
                      backgroundColor: item.children.some(
                        (c) => location.pathname === c.path,
                      )
                        ? "rgba(102,175,254,0.12)"
                        : undefined,
                    }}
                  >
                    <span className="material-symbols-outlined text-xl shrink-0">
                      {item.icon}
                    </span>
                    <span className="flex-1 text-sm font-medium">
                      {item.label}
                    </span>
                    <span className="material-symbols-outlined text-base shrink-0">
                      {expanded.has(item.id) ? "expand_less" : "expand_more"}
                    </span>
                  </button>
                  {expanded.has(item.id) && (
                    <div className="ml-6 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.id}
                          to={child.path}
                          onClick={() => setMobileOpen(false)}
                          className={({ isActive }) =>
                            `block w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                              isActive
                                ? "font-semibold text-[#66affe] bg-[rgba(102,175,254,0.15)]"
                                : "text-white/60 hover:bg-white/5"
                            }`
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path!}
                  end={item.path === "/"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      isActive
                        ? "font-semibold text-[#66affe] bg-[rgba(102,175,254,0.15)]"
                        : "text-white/70 hover:bg-white/5"
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-xl shrink-0">
                    {item.icon}
                  </span>
                  <span className="flex-1 text-sm font-medium">
                    {item.label}
                  </span>
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        {/* User Info / Logout */}
        <div className="px-3 py-3 border-t border-white/10 flex items-center gap-2">
          <button
            onClick={() => {
              navigate("/profile")
              setMobileOpen(false)
            }}
            className="flex-1 flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-colors hover:bg-white/10 cursor-pointer"
            style={{
              backgroundColor:
                location.pathname === "/profile"
                  ? "rgba(102,175,254,0.18)"
                  : "rgba(255,255,255,0.06)",
            }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white bg-[#0061a5]">
              {session?.user.name
                ? session.user.name.slice(0, 2).toUpperCase()
                : "SP"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-medium truncate">
                {session?.user.name || "Suresh Patil"}
              </div>
              <div className="text-blue-300 text-xs truncate">
                {session?.user.role || "Admin"}
              </div>
            </div>
          </button>
          <button
            onClick={async () => {
              await logout()
              navigate("/login")
            }}
            className="p-2 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Sign Out"
          >
            <span className="material-symbols-outlined text-base">logout</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 flex items-center justify-between gap-4 px-4 md:px-6 bg-white border-b border-gray-200 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-gray-600 hover:text-gray-900"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <div>
              <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                KMC Smart Water Portal
              </div>
              <div className="text-gray-800 font-semibold text-sm leading-tight">
                {getParentLabel()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-xs w-52">
              <span className="material-symbols-outlined text-base">
                search
              </span>
              <span>Search complaints, wards...</span>
            </div>

            <button
              onClick={() => navigate("/notifications/history")}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-gray-500 text-xl">
                notifications
              </span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200 hover:opacity-80 transition-opacity cursor-pointer"
              title="View Profile"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white bg-[#0061a5]">
                {session?.user.name
                  ? session.user.name.slice(0, 2).toUpperCase()
                  : "SP"}
              </div>
              <div className="text-xs text-left">
                <div className="font-medium text-gray-800">
                  {session?.user.name || "Suresh Patil"}
                </div>
                <div className="text-gray-400">
                  {session?.user.role || "Executive Officer"}
                </div>
              </div>
            </button>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#f4f6f9]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
