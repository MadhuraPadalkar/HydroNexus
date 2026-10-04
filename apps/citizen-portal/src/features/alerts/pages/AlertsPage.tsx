import { useOutletContext } from "react-router-dom"
import { ScreenHeader, AlertCard } from "@/components/CommonUI"
import { useCitizenAlerts } from "@/hooks/useCitizenData"
import { LoadingSpinner, EmptyState, ErrorMessage } from "@water/ui"
import type { CitizenOutletContext } from "@/app/layouts/CitizenLayout"

export default function AlertsPage() {
  const { onMenu } = useOutletContext<CitizenOutletContext>()
  const { alerts, loading, error, refetch } = useCitizenAlerts()
  const activeEmergencies = alerts.filter(
    (a) => a.severity === "critical",
  ).length

  return (
    <div className="flex flex-col h-full bg-[#f8f9fb]">
      <div className="bg-white">
        <ScreenHeader title="Alerts & Notifications" onMenu={onMenu} />
        {!loading && !error && activeEmergencies > 0 && (
          <div className="px-4 pb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-[#ba1a1a] rounded-full animate-pulse" />
            <span className="text-xs text-[#ba1a1a] font-semibold">
              {activeEmergencies} active{" "}
              {activeEmergencies === 1 ? "emergency" : "emergencies"}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 fade-in">
        {loading && <LoadingSpinner message="Fetching alerts..." />}
        {error && (
          <ErrorMessage
            title="Could not load alerts"
            message={error}
            onRetry={refetch}
          />
        )}
        {!loading && !error && alerts.length === 0 && (
          <EmptyState
            title="No alerts right now"
            description="There are no active alerts for your ward. Check back later."
            icon="notifications_off"
          />
        )}
        {!loading &&
          !error &&
          alerts.map((a) => <AlertCard key={a.id} alert={a} />)}
      </div>
    </div>
  )
}
