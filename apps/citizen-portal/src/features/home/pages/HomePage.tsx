import { useNavigate, useOutletContext } from "react-router-dom"
import { Icon, StatusBadge } from "@/components/CommonUI"
import { usageData, complaints, supplySchedule } from "@/mocks/citizenData"
import type { CitizenOutletContext } from "@/app/layouts/CitizenLayout"

export default function HomePage() {
  const navigate = useNavigate()
  const { onMenu } = useOutletContext<CitizenOutletContext>()
  const onNavigate = (screen: string) =>
    navigate("/" + (screen === "home" ? "" : screen))
  const onComplaintDetail = (c: any) => navigate("/complaints/" + c.id)
  const maxUsage = Math.max(...usageData.map((d) => d.usage))

  return (
    <div className="flex flex-col h-full bg-[#f8f9fb]">
      <div className="overflow-y-auto flex-1 pb-8">
        {/* Top header */}
        <div
          className="px-5 pt-12 pb-6"
          style={{
            background: "linear-gradient(135deg, #002045 0%, #0061a5 100%)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={onMenu}
              className="w-10 h-10 flex items-center justify-center rounded-full"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Icon name="menu" size={24} className="text-white" />
            </button>
            <div className="flex-1">
              <div className="text-white/70 text-xs font-medium mb-0.5">
                Good morning,
              </div>
              <div className="text-white text-xl font-bold">Suresh Patil</div>
            </div>
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center relative"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                cursor: "pointer",
              }}
              onClick={() => onNavigate("alerts")}
            >
              <Icon name="notifications" size={22} className="text-white" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full" />
            </button>
          </div>
          <div className="flex items-center gap-1.5 mb-4">
            <Icon name="location_on" size={13} className="text-[#66affe]" />
            <span className="text-[#66affe] text-xs font-medium">
              Ward 12 — Rankala, Kolhapur
            </span>
          </div>

          {/* Connection ID */}
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2.5"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Icon
              name="water_drop"
              size={16}
              filled
              className="text-[#66affe]"
            />
            <span className="text-white/80 text-xs">Connection ID:</span>
            <span className="text-white text-xs font-bold">KMC-W12-004872</span>
          </div>
        </div>

        <div className="px-4 -mt-3 space-y-4">
          {/* Active Alert Banner */}
          <div className="alert-critical rounded-2xl p-4 flex gap-3 items-start fade-in">
            <Icon
              name="warning"
              size={20}
              className="text-[#ba1a1a] flex-shrink-0 mt-0.5"
            />
            <div className="flex-1">
              <div className="text-sm font-bold text-[#ba1a1a]">
                Emergency Outage — Wards 10–14
              </div>
              <div className="text-xs text-[#4a5060] mt-0.5">
                Pipeline burst on Shahupuri Ring Road. Tankers deployed.
              </div>
            </div>
            <button
              onClick={() => onNavigate("alerts")}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <Icon name="chevron_right" size={18} className="text-[#ba1a1a]" />
            </button>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="text-xs font-bold text-[#8a909c] uppercase tracking-widest mb-3">
              Quick Actions
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: "water_drop",
                  label: "Water Services",
                  screen: "services",
                  color: "#002045",
                  bg: "#e8f1ff",
                },
                {
                  icon: "schedule",
                  label: "Supply Status",
                  screen: "supply-status",
                  color: "#1a6936",
                  bg: "#b7f0cd",
                },
                {
                  icon: "plumbing",
                  label: "Report an Issue",
                  screen: "report",
                  color: "#ba1a1a",
                  bg: "#ffdad6",
                },
                {
                  icon: "assignment",
                  label: "My Complaints",
                  screen: "complaints",
                  color: "#0061a5",
                  bg: "#e8f1ff",
                },
                {
                  icon: "receipt_long",
                  label: "View Bill",
                  screen: "billing",
                  color: "#1a6936",
                  bg: "#b7f0cd",
                },
                {
                  icon: "notifications_active",
                  label: "Alerts",
                  screen: "alerts",
                  color: "#7c5800",
                  bg: "#ffdea3",
                },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={() => onNavigate(a.screen)}
                  className="card-elevated p-4 flex flex-col items-start gap-3 text-left transition-transform active:scale-95"
                  style={{
                    border: "none",
                    cursor: "pointer",
                    background: "#fff",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: a.bg }}
                  >
                    <Icon name={a.icon} size={22} style={{ color: a.color }} />
                  </div>
                  <span className="text-sm font-semibold text-[#1a1d24] leading-tight">
                    {a.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Supply Schedule */}
          <div className="card-elevated p-5">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="schedule" size={20} className="text-[#0061a5]" />
              <span className="font-bold text-[#002045] text-sm">
                Today's Supply Schedule
              </span>
              <span className="ml-auto text-xs text-[#8a909c]">
                10 Sep 2026
              </span>
            </div>
            {supplySchedule.map((s) => (
              <div
                key={s.zone}
                className={`flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 ${
                  s.today ? "rounded-xl px-3 -mx-3" : ""
                }`}
                style={s.today ? { background: "#e8f1ff" } : {}}
              >
                <div
                  className="w-1.5 h-8 rounded-full flex-shrink-0"
                  style={{ background: s.today ? "#0061a5" : "#c8cdd6" }}
                />
                <div className="flex-1">
                  <div
                    className={`text-xs font-semibold ${
                      s.today ? "text-[#002045]" : "text-[#4a5060]"
                    }`}
                  >
                    {s.zone}{" "}
                    {s.today && (
                      <span className="text-[#0061a5] text-[10px] ml-1">
                        ● Your Zone
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#8a909c] mt-0.5">
                    {s.morning} · Eve: {s.evening}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Usage Chart */}
          <div className="card-elevated p-5">
            <div className="flex items-center gap-2 mb-1">
              <Icon
                name="water_drop"
                size={20}
                filled
                className="text-[#0061a5]"
              />
              <span className="font-bold text-[#002045] text-sm">
                Monthly Usage
              </span>
              <span className="ml-auto text-xs text-[#8a909c]">Litres</span>
            </div>
            <div className="text-xs text-[#8a909c] mb-4">
              Monthly quota: 8,000 L · Current: 3,200 L
            </div>
            <div className="flex items-end gap-1.5 h-20">
              {usageData.map((d) => (
                <div
                  key={d.month}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${(d.usage / maxUsage) * 64}px`,
                      background: d.month === "Sep" ? "#0061a5" : "#c8cdd6",
                    }}
                  />
                  <span className="text-[9px] text-[#8a909c]">{d.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#0061a5]" />
                <span className="text-xs text-[#4a5060]">Current month</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#c8cdd6]" />
                <span className="text-xs text-[#4a5060]">Previous</span>
              </div>
            </div>
          </div>

          {/* Recent Complaint */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-[#8a909c] uppercase tracking-widest">
                Recent Complaint
              </div>
              <button
                onClick={() => onNavigate("complaints")}
                className="text-xs font-semibold text-[#0061a5]"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                View All →
              </button>
            </div>
            {complaints.slice(0, 1).map((c) => (
              <button
                key={c.id}
                onClick={() => onComplaintDetail(c)}
                className="card-elevated p-4 flex items-center gap-4 w-full text-left transition-transform active:scale-[0.98]"
                style={{
                  background: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 bg-[#e8f1ff]">
                  <Icon name={c.icon} size={22} className="text-[#0061a5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#1a1d24] truncate">
                    {c.type}
                  </div>
                  <div className="text-xs text-[#8a909c] truncate">
                    {c.description}
                  </div>
                  <div className="text-xs text-[#8a909c] mt-0.5">{c.date}</div>
                </div>
                <StatusBadge status={c.status} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
