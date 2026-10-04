import { useOutletContext } from "react-router-dom"
import { Icon, ScreenHeader } from "@/components/CommonUI"
import { useCitizenNotices } from "@/hooks/useCitizenData"
import { LoadingSpinner, EmptyState, ErrorMessage } from "@water/ui"
import type { CitizenOutletContext } from "@/app/layouts/CitizenLayout"

export default function NoticeBoardPage() {
  const { onMenu } = useOutletContext<CitizenOutletContext>()
  const { notices, loading, error, refetch } = useCitizenNotices()
  const catColors: Record<string, string> = {
    General: "bg-[#e8f1ff] text-[#0061a5]",
    Tariff: "bg-[#b7f0cd] text-[#1a6936]",
    Maintenance: "bg-[#ffdea3] text-[#7c5800]",
    Emergency: "bg-[#ffdad6] text-[#ba1a1a]",
  }

  return (
    <div className="flex flex-col h-full bg-[#f8f9fb]">
      <div className="bg-white">
        <ScreenHeader title="Community Notice Board" onMenu={onMenu} />
        <div className="px-4 pb-3 text-xs text-[#8a909c]">
          Ward 12 — Rankala · Official Announcements
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 space-y-3 fade-in">
        {loading && <LoadingSpinner message="Fetching notices..." />}
        {error && (
          <ErrorMessage
            title="Could not load notices"
            message={error}
            onRetry={refetch}
          />
        )}
        {!loading && !error && notices.length === 0 && (
          <EmptyState
            title="No notices yet"
            description="There are no official announcements at the moment."
            icon="campaign"
          />
        )}
        {!loading &&
          !error &&
          notices.map((n) => (
            <div key={n.id} className="card-elevated p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${catColors[n.category] || "bg-gray-100 text-gray-600"}`}
                >
                  {n.category}
                </span>
                <span className="text-xs text-[#8a909c] flex-shrink-0">
                  {n.date}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#002045] mb-2 leading-snug">
                {n.title}
              </h3>
              <p className="text-xs text-[#4a5060] leading-relaxed">
                {n.content}
              </p>
              <div className="flex items-center gap-1.5 mt-3">
                <div className="w-5 h-5 rounded-full bg-[#002045] flex items-center justify-center">
                  <Icon name="business" size={12} className="text-white" />
                </div>
                <span className="text-[10px] text-[#8a909c] font-medium">
                  Kolhapur Municipal Corporation
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
