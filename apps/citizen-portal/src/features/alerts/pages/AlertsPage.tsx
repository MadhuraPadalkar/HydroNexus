import { useOutletContext } from "react-router-dom"
import { ScreenHeader, AlertCard } from "@/components/CommonUI"
import { useCitizenAlerts } from "@/hooks/useCitizenData"
import { LoadingSpinner, EmptyState, ErrorMessage } from "@water/ui"
import { useLanguage } from "@/i18n/LanguageContext"
import type { CitizenOutletContext } from "@/app/layouts/CitizenLayout"

export default function AlertsPage() {
  const { onMenu } = useOutletContext<CitizenOutletContext>()
  const { t } = useLanguage()
  const { alerts, loading, error, refetch } = useCitizenAlerts()
  const activeEmergencies = alerts.filter(
    (a) => a.severity === "critical",
  ).length

  return (
    <div className="flex flex-col h-full bg-[#f8f9fb]">
      <div className="bg-white">
        <ScreenHeader title={t.alerts.title} onMenu={onMenu} />
        {!loading && !error && activeEmergencies > 0 && (
          <div className="px-4 pb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-[#ba1a1a] rounded-full animate-pulse" />
            <span className="text-xs text-[#ba1a1a] font-semibold">
              {(activeEmergencies === 1
                ? t.alerts.activeSingle
                : t.alerts.activeMany
              ).replace("{n}", String(activeEmergencies))}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 fade-in">
        {loading && <LoadingSpinner message={t.alerts.loading} />}
        {error && (
          <ErrorMessage
            title={t.alerts.loadFailed}
            message={error}
            onRetry={refetch}
          />
        )}
        {!loading && !error && alerts.length === 0 && (
          <EmptyState
            title={t.alerts.emptyTitle}
            description={t.alerts.emptyBody}
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
