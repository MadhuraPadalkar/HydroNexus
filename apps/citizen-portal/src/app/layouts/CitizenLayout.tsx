import { useState, useEffect } from "react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { Icon } from "@/components/CommonUI"
import { useLanguage } from "@/i18n/LanguageContext"
import type { AppStrings } from "@/i18n/translations"

interface MenuItem {
  path: string
  icon: string
  labelKey: keyof AppStrings["layout"]["menu"]
}

const MENU_ITEMS: MenuItem[] = [
  { path: "/", icon: "home", labelKey: "dashboard" },
  { path: "/services", icon: "water_drop", labelKey: "services" },
  { path: "/supply-status", icon: "schedule", labelKey: "supply" },
  { path: "/report", icon: "report_problem", labelKey: "report" },
  { path: "/complaints", icon: "assignment", labelKey: "complaints" },
  { path: "/billing", icon: "receipt_long", labelKey: "billing" },
  { path: "/conservation", icon: "eco", labelKey: "conservation" },
  { path: "/alerts", icon: "notifications", labelKey: "alerts" },
  { path: "/noticeboard", icon: "campaign", labelKey: "noticeboard" },
  { path: "/faq", icon: "help", labelKey: "faq" },
  { path: "/profile", icon: "person", labelKey: "profile" },
]

const BOTTOM_TABS: Array<{
  path: string
  icon: string
  labelKey: keyof AppStrings["layout"]["tabs"]
}> = [
  { path: "/", icon: "home", labelKey: "home" },
  { path: "/report", icon: "add_circle", labelKey: "report" },
  { path: "/complaints", icon: "assignment", labelKey: "complaints" },
  { path: "/alerts", icon: "notifications", labelKey: "alerts" },
  { path: "/profile", icon: "person", labelKey: "profile" },
]

export interface CitizenOutletContext {
  onMenu: () => void
}

export default function CitizenLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { lang, setLang, t } = useLanguage()

  const isTabActive = (path: string) => {
    if (path === "/") return location.pathname === "/"
    return location.pathname.startsWith(path)
  }

  useEffect(() => {
    const activeItem = MENU_ITEMS.find((m) => m.path === location.pathname)
    const title = activeItem
      ? t.layout.menu[activeItem.labelKey]
      : t.layout.defaultTitle
    document.title = `${title} | HydroNexus Citizen Portal`
  }, [location.pathname, t])

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
          className="fixed bottom-0 z-30 w-full max-w-[430px] bg-white/95 backdrop-blur-md border-t border-gray-100 flex items-center justify-around py-2 px-1 shadow-lg safe-area-bottom"
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
                  {t.layout.tabs[tab.labelKey]}
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
                  <span className="text-sm">
                    {t.layout.menu[item.labelKey]}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Drawer Footer / Language + Sign Out */}
          <div className="p-4 border-t border-gray-100 space-y-2">
            <div className="flex gap-2">
              {(["en", "mr"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: lang === l ? "#002045" : "#f0f2f5",
                    color: lang === l ? "#fff" : "#4a5060",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {l === "en" ? t.profile.english : t.profile.marathi}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                navigate("/login")
                setIsSidebarOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-[#ba1a1a] hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              style={{ border: "none" }}
            >
              <Icon name="logout" size={22} />
              <span className="text-sm font-semibold">{t.layout.signOut}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
