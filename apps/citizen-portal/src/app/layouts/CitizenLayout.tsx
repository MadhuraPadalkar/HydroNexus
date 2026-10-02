import { useState, useEffect } from "react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { Icon } from "@/components/CommonUI"

interface MenuItem {
  path: string
  icon: string
  label: string
}

const MENU_ITEMS: MenuItem[] = [
  { path: "/", icon: "home", label: "Dashboard" },
  { path: "/services", icon: "water_drop", label: "Water Services" },
  { path: "/supply-status", icon: "schedule", label: "Supply Status" },
  { path: "/report", icon: "report_problem", label: "Report Issue" },
  { path: "/complaints", icon: "assignment", label: "My Complaints" },
  { path: "/billing", icon: "receipt_long", label: "Billing & Usage" },
  { path: "/conservation", icon: "eco", label: "Water Conservation" },
  { path: "/map", icon: "map", label: "Interactive Map" },
  { path: "/alerts", icon: "notifications", label: "Alerts" },
  { path: "/noticeboard", icon: "campaign", label: "Notice Board" },
  { path: "/faq", icon: "help", label: "Help & FAQs" },
  { path: "/profile", icon: "person", label: "Profile" },
]

const BOTTOM_TABS = [
  { path: "/", icon: "home", label: "Home" },
  { path: "/report", icon: "add_circle", label: "Report" },
  { path: "/complaints", icon: "assignment", label: "Complaints" },
  { path: "/alerts", icon: "notifications", label: "Alerts" },
  { path: "/profile", icon: "person", label: "Profile" },
]

export interface CitizenOutletContext {
  onMenu: () => void
}

export default function CitizenLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const isTabActive = (path: string) => {
    if (path === "/") return location.pathname === "/"
    return location.pathname.startsWith(path)
  }

  useEffect(() => {
    const activeItem = MENU_ITEMS.find((m) => m.path === location.pathname)
    const title = activeItem ? activeItem.label : "Citizen Services"
    document.title = `${title} | HydroNexus Citizen Portal`
  }, [location.pathname])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1d24]">
      {/* 430px mobile shell container */}
      <div
        className="relative w-full min-h-screen flex flex-col bg-white overflow-hidden shadow-2xl"
        style={{ maxWidth: 430, fontFamily: "Inter, sans-serif" }}
      >
        {/* Main Content Area */}
        <div className="flex-1 pb-20 overflow-y-auto">
          <Outlet context={{ onMenu: () => setIsSidebarOpen(true) }} />
        </div>

        {/* Bottom Navigation Bar */}
        <nav
          className="fixed bottom-0 z-30 w-full max-w-[430px] bg-white/95 backdrop-blur-md border-t border-gray-100 flex items-center justify-around py-2 px-1 shadow-lg"
          style={{ maxWidth: 430 }}
        >
          {BOTTOM_TABS.map((tab) => {
            const active = isTabActive(tab.path)
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                end={tab.path === "/"}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                  active
                    ? "text-[#0061a5]"
                    : "text-[#8a909c] hover:text-[#4a5060]"
                }`}
              >
                <Icon name={tab.icon} size={24} filled={active} />
                <span
                  className={`text-[10px] mt-0.5 ${
                    active ? "font-bold" : "font-medium"
                  }`}
                >
                  {tab.label}
                </span>
              </NavLink>
            )
          })}
        </nav>

        {/* Sidebar Navigation Drawer */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <div
          className={`fixed top-0 bottom-0 left-0 w-4/5 max-w-[320px] bg-white z-50 transition-transform duration-300 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } shadow-2xl flex flex-col`}
        >
          {/* Drawer Header */}
          <div className="p-6 pt-12 pb-6 bg-[#002045] text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/10 border border-white/20">
                <Icon
                  name="water_drop"
                  size={26}
                  filled
                  className="text-[#66affe]"
                />
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            <div className="text-xl font-bold mb-0.5">KMC Smart Water</div>
            <div className="text-white/70 text-xs">
              Kolhapur Municipal Corporation
            </div>
          </div>

          {/* Drawer Menu List */}
          <div className="flex-1 overflow-y-auto py-3">
            {MENU_ITEMS.map((item) => {
              const active = isTabActive(item.path)
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path)
                    setIsSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-4 px-6 py-3 text-left transition-colors cursor-pointer ${
                    active
                      ? "text-[#002045] bg-[#e8f1ff] font-bold"
                      : "text-[#4a5060] font-medium hover:bg-gray-50"
                  }`}
                  style={{ border: "none" }}
                >
                  <Icon
                    name={item.icon}
                    size={22}
                    className={active ? "text-[#002045]" : "text-[#8a909c]"}
                    filled={active}
                  />
                  <span className="text-sm">{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* Drawer Footer / Sign Out */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => {
                navigate("/login")
                setIsSidebarOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-[#ba1a1a] hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              style={{ border: "none" }}
            >
              <Icon name="logout" size={22} />
              <span className="text-sm font-semibold">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
