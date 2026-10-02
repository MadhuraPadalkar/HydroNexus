import { useOutletContext } from "react-router-dom"
import { ScreenHeader, AlertCard } from "@/components/CommonUI"
import { alerts } from "@/mocks/citizenData"
import type { CitizenOutletContext } from "@/app/layouts/CitizenLayout"

export default function AlertsPage() {
  const { onMenu } = useOutletContext<CitizenOutletContext>()
  return (
    <div className="flex flex-col h-full bg-[#f8f9fb]">
      <div className="bg-white">
        <ScreenHeader title="Alerts & Notifications" onMenu={onMenu} />
        <div className="px-4 pb-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-[#ba1a1a] rounded-full animate-pulse" />
          <span className="text-xs text-[#ba1a1a] font-semibold">
            1 active emergency
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 fade-in">
        {alerts.map((a) => (
          <AlertCard key={a.id} alert={a} />
        ))}
      </div>
    </div>
  )
}
