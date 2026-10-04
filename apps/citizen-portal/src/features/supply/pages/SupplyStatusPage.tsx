import { useOutletContext } from "react-router-dom"
import { Icon, ScreenHeader } from "@/components/CommonUI"
import { useCitizenSupply } from "@/hooks/useCitizenData"
import { LoadingSpinner, EmptyState, ErrorMessage } from "@water/ui"
import type { CitizenOutletContext } from "@/app/layouts/CitizenLayout"

export default function SupplyStatusPage() {
  const { onMenu } = useOutletContext<CitizenOutletContext>()
  const { schedules, outages, loading, error, refetch } = useCitizenSupply()
  const myZone = schedules[0]
  const supplyOn = !outages.some(
    (o) => o.status === "Active" && o.type === "Emergency",
  )

  return (
    <div className="flex flex-col h-full bg-[#f8f9fb]">
      <div className="bg-white">
        <ScreenHeader title="Water Supply Status" onMenu={onMenu} />
      </div>
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 space-y-4 fade-in">
        {loading && <LoadingSpinner message="Fetching supply status..." />}
        {error && (
          <ErrorMessage
            title="Could not load supply status"
            message={error}
            onRetry={refetch}
          />
        )}
        {!loading && !error && schedules.length === 0 && (
          <EmptyState
            title="No supply schedule"
            description="Supply schedule information is not available right now."
            icon="schedule"
          />
        )}

        {!loading && !error && schedules.length > 0 && (
          <>
            <div className="card-elevated p-6 flex flex-col items-center justify-center text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
                style={{
                  background: supplyOn ? "#b7f0cd" : "#ffdad6",
                  border: "4px solid #e8f0e0",
                }}
              >
                <Icon
                  name="water_drop"
                  size={40}
                  filled
                  className={supplyOn ? "text-[#1a6936]" : "text-[#ba1a1a]"}
                />
              </div>
              <div className="text-xl font-bold text-[#002045]">
                {supplyOn ? "Supply is ON" : "Supply Disrupted"}
              </div>
              <div className="text-sm text-[#4a5060] mt-1">
                {myZone ? `${myZone.ward} — ${myZone.zone} Zone` : "Ward 12 — Rankala"}
              </div>
            </div>

            <div className="card-elevated p-5">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="schedule" size={20} className="text-[#0061a5]" />
                <span className="font-bold text-[#002045] text-sm">
                  Supply Schedule
                </span>
              </div>
              {schedules.map((s) => (
                <div
                  key={`${s.ward}-${s.zone}`}
                  className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0"
                >
                  <div
                    className="w-1.5 h-8 rounded-full flex-shrink-0"
                    style={{
                      background:
                        s.status === "On Time" ? "#0061a5" : "#c8cdd6",
                    }}
                  />
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-[#002045]">
                      {s.ward} · {s.zone}
                    </div>
                    <div className="text-xs text-[#8a909c] mt-0.5">
                      {s.scheduled} · Pressure {s.pressure}%
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      s.status === "On Time"
                        ? "bg-[#e8f1ff] text-[#0061a5]"
                        : "bg-[#f0f2f5] text-[#8a909c]"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            </div>

            {outages.length > 0 && (
              <div>
                <div className="text-xs font-bold text-[#ba1a1a] uppercase tracking-widest mb-3">
                  Water Shortage Information
                </div>
                {outages.map((o) => (
                  <div
                    key={o.id}
                    className="alert-critical rounded-2xl p-4 flex gap-3 items-start mb-3"
                  >
                    <Icon
                      name="warning"
                      size={20}
                      className="text-[#ba1a1a] flex-shrink-0 mt-0.5"
                    />
                    <div>
                      <div className="text-sm font-bold text-[#ba1a1a] mb-1">
                        {o.type === "Emergency" ? "Outage" : "Planned work"} —{" "}
                        {o.ward}
                      </div>
                      <div className="text-xs text-[#4a5060] leading-relaxed">
                        {o.reason}. Started {o.startTime}. Expected restoration:{" "}
                        {o.estimatedRestoration}.
                        {o.tankersDispatched > 0 &&
                          ` ${o.tankersDispatched} tanker(s) dispatched.`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
