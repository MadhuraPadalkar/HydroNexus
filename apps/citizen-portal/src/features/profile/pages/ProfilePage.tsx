import { useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { Icon, ScreenHeader } from "@/components/CommonUI"
import type { CitizenOutletContext } from "@/app/layouts/CitizenLayout"

export default function ProfilePage() {
  const navigate = useNavigate()
  const { onMenu } = useOutletContext<CitizenOutletContext>()
  const onNavigate = (s: string) => navigate("/" + (s === "home" ? "" : s))
  const [lang, setLang] = useState<"en" | "mr">("en")
  const [notifSupply, setNotifSupply] = useState(true)
  const [notifBill, setNotifBill] = useState(true)
  const [notifAlerts, setNotifAlerts] = useState(true)

  return (
    <div className="flex flex-col h-full bg-[#f8f9fb]">
      <div className="bg-white">
        <ScreenHeader title="Profile & Settings" onMenu={onMenu} />
      </div>
      <div className="flex-1 overflow-y-auto pb-24 pt-4 px-4 space-y-4 fade-in">
        {/* User Card */}
        <div
          className="rounded-3xl p-5 text-white"
          style={{ background: "linear-gradient(135deg, #002045, #0061a5)" }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-extrabold text-white">SP</span>
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold">Suresh Patil</div>
              <div className="text-white/70 text-sm">+91 98765 43210</div>
              <div className="flex items-center gap-1.5 mt-1">
                <Icon
                  name="verified"
                  size={14}
                  filled
                  className="text-[#66affe]"
                />
                <span className="text-[#66affe] text-xs font-medium">
                  Verified Citizen
                </span>
              </div>
            </div>
            <button
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                cursor: "pointer",
                borderRadius: 12,
                padding: "8px 12px",
              }}
            >
              <Icon name="edit" size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Connection Details */}
        <div className="card-elevated p-5">
          <div className="text-sm font-bold text-[#002045] mb-4">
            Connection Details
          </div>
          {[
            {
              label: "Connection ID",
              value: "KMC-W12-004872",
              icon: "water_drop",
            },
            { label: "Property Type", value: "Residential", icon: "home" },
            { label: "Ward", value: "Ward 12 — Rankala", icon: "location_on" },
            {
              label: "Zone",
              value: "Zone A (Rankala Sub-Division)",
              icon: "map",
            },
            { label: "Meter No.", value: "MET-2204-8472", icon: "speed" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0"
            >
              <Icon
                name={item.icon}
                size={18}
                className="text-[#0061a5] flex-shrink-0"
              />
              <div className="flex-1">
                <div className="text-xs text-[#8a909c]">{item.label}</div>
                <div className="text-sm font-semibold text-[#1a1d24]">
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Language */}
        <div className="card-elevated p-5">
          <div className="text-sm font-bold text-[#002045] mb-3">
            Language / भाषा
          </div>
          <div className="flex gap-2">
            {(["en", "mr"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="flex-1 py-3 rounded-full text-sm font-semibold transition-all"
                style={{
                  background: lang === l ? "#002045" : "#f0f2f5",
                  color: lang === l ? "#fff" : "#4a5060",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {l === "en" ? "English" : "मराठी"}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="card-elevated p-5">
          <div className="text-sm font-bold text-[#002045] mb-4">
            Notification Preferences
          </div>
          {[
            {
              label: "Supply Schedule Updates",
              sub: "Daily supply timings and changes",
              state: notifSupply,
              set: setNotifSupply,
            },
            {
              label: "Bill Reminders",
              sub: "Due dates and payment confirmations",
              state: notifBill,
              set: setNotifBill,
            },
            {
              label: "Emergency Alerts",
              sub: "Outages, quality advisories, floods",
              state: notifAlerts,
              set: setNotifAlerts,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex-1">
                <div className="text-sm font-semibold text-[#1a1d24]">
                  {item.label}
                </div>
                <div className="text-xs text-[#8a909c]">{item.sub}</div>
              </div>
              <button
                onClick={() => item.set(!item.state)}
                className="w-12 h-6 rounded-full transition-all flex-shrink-0 relative"
                style={{
                  background: item.state ? "#002045" : "#c8cdd6",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <div
                  className="absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all"
                  style={{ left: item.state ? "26px" : "2px" }}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="card-elevated overflow-hidden">
          {[
            { icon: "help_outline", label: "Help & Support", color: "#0061a5" },
            { icon: "privacy_tip", label: "Privacy Policy", color: "#0061a5" },
            {
              icon: "description",
              label: "Terms of Service",
              color: "#0061a5",
            },
            { icon: "share", label: "Share App", color: "#1a6936" },
          ].map((item, i) => (
            <button
              key={item.label}
              className="flex items-center gap-4 w-full px-5 py-4 border-b border-gray-100 last:border-0"
              style={{
                background: "#fff",
                borderBottom: "1px solid #f0f2f5",
                cursor: "pointer",
              }}
            >
              <Icon
                name={item.icon}
                size={20}
                className=""
                style={{ color: item.color }}
              />
              <span className="flex-1 text-sm font-medium text-[#1a1d24] text-left">
                {item.label}
              </span>
              <Icon name="chevron_right" size={18} className="text-[#c8cdd6]" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={() => onNavigate("login")}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-[#ba1a1a] font-semibold text-sm"
          style={{ background: "#ffdad6", border: "none", cursor: "pointer" }}
        >
          <Icon name="logout" size={20} className="text-[#ba1a1a]" />
          Sign Out
        </button>

        <div className="text-center pb-2">
          <div className="text-[10px] text-[#8a909c]">
            KMC Smart Water v2.4.1
          </div>
          <div className="text-[10px] text-[#8a909c]">
            Kolhapur Municipal Corporation · AMRUT 2.0
          </div>
        </div>
      </div>
    </div>
  )
}
