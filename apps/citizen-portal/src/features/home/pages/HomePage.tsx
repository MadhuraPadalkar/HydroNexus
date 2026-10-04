import { useNavigate, useOutletContext } from "react-router-dom"
import { Icon, StatusBadge } from "@/components/CommonUI"
import {
  useCitizenComplaints,
  useCitizenSupply,
  useCitizenUsage,
} from "@/hooks/useCitizenData"
import { LoadingSpinner, ErrorMessage } from "@water/ui"
import { useLanguage } from "@/i18n/LanguageContext"
import type { CitizenOutletContext } from "@/app/layouts/CitizenLayout"

export default function HomePage() {
  const navigate = useNavigate()
  const { onMenu } = useOutletContext<CitizenOutletContext>()
  const { t } = useLanguage()
  const onNavigate = (screen: string) =>
    navigate("/" + (screen === "home" ? "" : screen))
  const onComplaintDetail = (c: { id: string }) =>
    navigate("/complaints/" + c.id)

  const {
    complaints,
    loading: complaintsLoading,
    error: complaintsError,
    refetch: refetchComplaints,
  } = useCitizenComplaints()
  const {
    schedules,
    outages,
    loading: supplyLoading,
    error: supplyError,
    refetch: refetchSupply,
  } = useCitizenSupply()
  const {
    usage,
    loading: usageLoading,
    error: usageError,
    refetch: refetchUsage,
  } = useCitizenUsage()

  const allLoading = complaintsLoading && supplyLoading && usageLoading
  const anyError = complaintsError || supplyError || usageError
  const retryAll = () => {
    refetchComplaints()
    refetchSupply()
    refetchUsage()
  }

  const usageLitres = usage.map((d) => d.usage * 1000)
  const maxUsage = Math.max(...usageLitres, 1)
  const emergencyOutage = outages.find(
    (o) => o.status === "Active" && o.type === "Emergency",
  )
  const recentComplaint = complaints[0]

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
                {t.home.greeting}
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
            <span className="text-white/80 text-xs">{t.home.connectionId}</span>
            <span className="text-white text-xs font-bold">KMC-W12-004872</span>
          </div>
        </div>

        <div className="px-4 -mt-3 space-y-4">
          {allLoading && <LoadingSpinner message={t.home.loadingDashboard} />}
          {!allLoading && anyError && (
            <ErrorMessage
              title={t.home.sectionsFailed}
              message={
                complaintsError || supplyError || usageError || undefined
              }
              onRetry={retryAll}
            />
          )}

          {/* Active Alert Banner */}
          {!supplyLoading && emergencyOutage && (
            <div className="alert-critical rounded-2xl p-4 flex gap-3 items-start fade-in">
              <Icon
                name="warning"
                size={20}
                className="text-[#ba1a1a] flex-shrink-0 mt-0.5"
              />
              <div className="flex-1">
                <div className="text-sm font-bold text-[#ba1a1a]">
                  {t.home.emergencyOutage} — {emergencyOutage.ward}
                </div>
                <div className="text-xs text-[#4a5060] mt-0.5">
                  {emergencyOutage.reason}. {t.home.tankersDeployed}
                </div>
              </div>
              <button
                onClick={() => onNavigate("alerts")}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <Icon name="chevron_right" size={18} className="text-[#ba1a1a]" />
              </button>
            </div>
          )}

          {/* Quick Actions */}
          <div>
            <div className="text-xs font-bold text-[#8a909c] uppercase tracking-widest mb-3">
              {t.home.quickActions}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  {
                    icon: "water_drop",
                    key: "services",
                    screen: "services",
                    color: "#002045",
                    bg: "#e8f1ff",
                  },
                  {
                    icon: "schedule",
                    key: "supply",
                    screen: "supply-status",
                    color: "#1a6936",
                    bg: "#b7f0cd",
                  },
                  {
                    icon: "plumbing",
                    key: "report",
                    screen: "report",
                    color: "#ba1a1a",
                    bg: "#ffdad6",
                  },
                  {
                    icon: "assignment",
                    key: "complaints",
                    screen: "complaints",
                    color: "#0061a5",
                    bg: "#e8f1ff",
                  },
                  {
                    icon: "receipt_long",
                    key: "billing",
                    screen: "billing",
                    color: "#1a6936",
                    bg: "#b7f0cd",
                  },
                  {
                    icon: "notifications_active",
                    key: "alerts",
                    screen: "alerts",
                    color: "#7c5800",
                    bg: "#ffdea3",
                  },
                ] as const
              ).map((a) => (
                <button
                  key={a.screen}
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
                    {t.home.actions[a.key]}
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
                {t.home.scheduleTitle}
              </span>
              <span className="ml-auto text-xs text-[#8a909c]">
                10 Sep 2026
              </span>
            </div>
            {supplyLoading && <LoadingSpinner message={t.home.loadingSchedule} />}
            {!supplyLoading && !supplyError && schedules.length === 0 && (
              <div className="text-xs text-[#8a909c] text-center py-2">
                {t.home.noSchedule}
              </div>
            )}
            {schedules.slice(0, 3).map((s, i) => (
              <div
                key={`${s.ward}-${s.zone}`}
                className={`flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 ${
                  i === 0 ? "rounded-xl px-3 -mx-3" : ""
                }`}
                style={i === 0 ? { background: "#e8f1ff" } : {}}
              >
                <div
                  className="w-1.5 h-8 rounded-full flex-shrink-0"
                  style={{ background: i === 0 ? "#0061a5" : "#c8cdd6" }}
                />
                <div className="flex-1">
                  <div
                    className={`text-xs font-semibold ${
                      i === 0 ? "text-[#002045]" : "text-[#4a5060]"
                    }`}
                  >
                    {s.ward} ({s.zone})
                    {i === 0 && (
                      <span className="text-[#0061a5] text-[10px] ml-1">
                        {t.home.yourZone}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#8a909c] mt-0.5">
                    {s.scheduled} · {s.status}
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
                {t.home.usageTitle}
              </span>
              <span className="ml-auto text-xs text-[#8a909c]">{t.home.litres}</span>
            </div>
            <div className="text-xs text-[#8a909c] mb-4">
              {t.home.quotaLine}{" "}
              {usageLitres.length > 0
                ? usageLitres[usageLitres.length - 1]!.toLocaleString()
                : "—"}{" "}
              {t.home.litreSuffix}
            </div>
            {usageLoading && <LoadingSpinner message={t.home.loadingUsage} />}
            {!usageLoading && !usageError && usage.length === 0 && (
              <div className="text-xs text-[#8a909c] text-center py-2">
                {t.home.noUsage}
              </div>
            )}
            {usage.length > 0 && (
              <>
                <div className="flex items-end gap-1.5 h-20">
                  {usage.map((d, i) => (
                    <div
                      key={d.month}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div
                        className="w-full rounded-t-md transition-all"
                        style={{
                          height: `${Math.max((usageLitres[i]! / maxUsage) * 64, 4)}px`,
                          background:
                            i === usage.length - 1 ? "#0061a5" : "#c8cdd6",
                        }}
                      />
                      <span className="text-[9px] text-[#8a909c]">
                        {d.month}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-[#0061a5]" />
                    <span className="text-xs text-[#4a5060]">{t.home.currentMonth}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-[#c8cdd6]" />
                    <span className="text-xs text-[#4a5060]">{t.home.previous}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Recent Complaint */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-[#8a909c] uppercase tracking-widest">
                {t.home.recentComplaint}
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
                {t.home.viewAll}
              </button>
            </div>
            {complaintsLoading && (
              <LoadingSpinner message={t.home.loadingComplaints} />
            )}
            {!complaintsLoading && !complaintsError && !recentComplaint && (
              <div className="text-xs text-[#8a909c] text-center py-2">
                {t.home.noComplaints}
              </div>
            )}
            {recentComplaint && (
              <button
                onClick={() => onComplaintDetail(recentComplaint)}
                className="card-elevated p-4 flex items-center gap-4 w-full text-left transition-transform active:scale-[0.98]"
                style={{
                  background: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 bg-[#e8f1ff]">
                  <Icon
                    name={recentComplaint.icon || "report_problem"}
                    size={22}
                    className="text-[#0061a5]"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#1a1d24] truncate">
                    {recentComplaint.type}
                  </div>
                  <div className="text-xs text-[#8a909c] truncate">
                    {recentComplaint.description}
                  </div>
                  <div className="text-xs text-[#8a909c] mt-0.5">
                    {recentComplaint.date || recentComplaint.reported}
                  </div>
                </div>
                <StatusBadge status={recentComplaint.status} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
