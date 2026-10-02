import { useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { Icon, StatusBadge, ScreenHeader } from "@/components/CommonUI"
import {
  complaints as initialComplaints,
  type Complaint,
} from "@/mocks/citizenData"
import { useCitizenComplaints } from "@/hooks/useCitizenData"
import { LoadingSpinner, EmptyState, ErrorMessage } from "@water/ui"
import type { CitizenOutletContext } from "@/app/layouts/CitizenLayout"

export default function ComplaintsListPage() {
  const navigate = useNavigate()
  const { onMenu } = useOutletContext<CitizenOutletContext>()
  const {
    complaints: apiComplaints,
    loading,
    error,
    refetch,
  } = useCitizenComplaints()
  const complaints =
    apiComplaints.length > 0
      ? apiComplaints as unknown as Complaint[]
      : initialComplaints
  const onComplaintDetail = (c: Complaint) => navigate("/complaints/" + c.id)
  const [filter, setFilter] = useState("All")

  const filters = ["All", "Open", "In Progress", "Resolved"]
  const filtered =
    filter === "All"
      ? complaints
      : complaints.filter((c) => c.status === filter)

  return (
    <div className="flex flex-col h-full bg-[#f8f9fb]">
      <div className="bg-white">
        <ScreenHeader title="My Complaints" onMenu={onMenu} />
        {/* Filter tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="flex-none px-4 py-2 rounded-full text-xs font-semibold transition-all"
              style={{
                background: filter === f ? "#002045" : "#f0f2f5",
                color: filter === f ? "#fff" : "#4a5060",
                border: "none",
                cursor: "pointer",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-3 space-y-3 fade-in">
        {loading && <LoadingSpinner message="Fetching complaints..." />}
        {error && (
          <ErrorMessage
            title="Could not load complaints"
            message={error}
            onRetry={refetch}
          />
        )}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            title="No complaints in this category"
            description="You don't have any reported complaints under this filter status."
            icon="assignment_turned_in"
          />
        )}
        {!loading &&
          filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => onComplaintDetail(c)}
              className="card-elevated p-4 flex gap-4 w-full text-left transition-transform active:scale-[0.98]"
              style={{ background: "#fff", border: "none", cursor: "pointer" }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    c.status === "Open"
                      ? "#ffdad6"
                      : c.status === "In Progress"
                        ? "#e8f1ff"
                        : "#b7f0cd",
                }}
              >
                <Icon
                  name={c.icon}
                  size={24}
                  className={
                    c.status === "Open"
                      ? "text-[#ba1a1a]"
                      : c.status === "In Progress"
                        ? "text-[#0061a5]"
                        : "text-[#1a6936]"
                  }
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-sm font-bold text-[#1a1d24]">
                    {c.type}
                  </span>
                  <StatusBadge status={c.status} />
                </div>
                <div className="text-xs text-[#4a5060] line-clamp-2 mb-1.5">
                  {c.description}
                </div>
                <div className="flex items-center gap-3 text-xs text-[#8a909c]">
                  <span className="flex items-center gap-1">
                    <Icon name="tag" size={12} className="text-[#8a909c]" />
                    {c.id}
                  </span>
                  <span>·</span>
                  <span>{c.date}</span>
                </div>
              </div>
            </button>
          ))}
      </div>
    </div>
  )
}
