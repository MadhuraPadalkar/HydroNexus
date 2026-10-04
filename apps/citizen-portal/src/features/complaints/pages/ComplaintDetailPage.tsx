import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Icon, StatusBadge, ScreenHeader } from "@/components/CommonUI"
import { useComplaintDetail } from "@/hooks/useCitizenData"
import { LoadingSpinner, EmptyState, ErrorMessage } from "@water/ui"
import { useLanguage } from "@/i18n/LanguageContext"
import type { AppStrings } from "@/i18n/translations"

function stepLabel(label: string, t: AppStrings): string {
  const map: Record<string, string> = {
    Submitted: t.detail.steps.submitted,
    "Assigned to Officer": t.detail.steps.assigned,
    "In Progress": t.detail.steps.inProgress,
    Resolved: t.detail.steps.resolved,
    Reported: t.detail.steps.reported,
    Assigned: t.detail.steps.assignedShort,
  }
  return map[label] ?? label
}

function stepDate(date: string, t: AppStrings): string {
  if (date === "Today") return t.detail.today
  if (date === "Done") return t.detail.done
  if (date === "Assigned") return t.detail.assignedWord
  return date
}

export default function ComplaintDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const onBack = () => navigate("/complaints")
  const { t } = useLanguage()
  const { complaint, loading, error, refetch } = useComplaintDetail(id)
  const [comment, setComment] = useState("")
  const [rated, setRated] = useState(0)

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-[#f8f9fb]">
        <div className="bg-white">
          <ScreenHeader title={t.detail.title} onBack={onBack} />
        </div>
        <div className="flex-1 px-4 pt-4">
          <LoadingSpinner message={t.detail.loading} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-[#f8f9fb]">
        <div className="bg-white">
          <ScreenHeader title={t.detail.title} onBack={onBack} />
        </div>
        <div className="flex-1 px-4 pt-4">
          <ErrorMessage
            title={t.detail.loadFailed}
            message={error}
            onRetry={refetch}
          />
        </div>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="flex flex-col h-full bg-[#f8f9fb]">
        <div className="bg-white">
          <ScreenHeader title={t.detail.title} onBack={onBack} />
        </div>
        <div className="flex-1 px-4 pt-4">
          <EmptyState
            title={t.detail.notFoundTitle}
            description={t.detail.notFoundBody}
            icon="search_off"
          />
        </div>
      </div>
    )
  }

  const timeline = complaint.timeline
    ? [
        {
          label: "Submitted",
          date: complaint.date || "",
          done: true,
          icon: "send",
        },
        ...complaint.timeline.map((t) => ({
          label: t.status,
          date: t.time,
          done: true,
          icon: "build",
        })),
        ...(complaint.status === "Resolved"
          ? []
          : [
              {
                label: "Resolved",
                date: "—",
                done: false,
                icon: "check_circle",
              },
            ]),
      ]
    : [
        {
          label: "Submitted",
          date: complaint.date || "",
          done: true,
          icon: "send",
        },
        {
          label: "Assigned to Officer",
          date: complaint.assigned ? "Assigned" : "—",
          done: complaint.status !== "Open",
          icon: "person_pin",
        },
        {
          label: "In Progress",
          date:
            complaint.status === "In Progress"
              ? "Today"
              : complaint.status === "Resolved"
                ? complaint.updated || "Done"
                : "—",
          done:
            complaint.status === "In Progress" ||
            complaint.status === "Resolved",
          icon: "build",
        },
        {
          label: "Resolved",
          date: complaint.status === "Resolved" ? complaint.updated || "" : "—",
          done: complaint.status === "Resolved",
          icon: "check_circle",
        },
      ]

  const messages = complaint.messages || []

  return (
    <div className="flex flex-col h-full bg-[#f8f9fb]">
      <div className="bg-white">
        <ScreenHeader title={t.detail.title} onBack={onBack} />
      </div>
      <div className="flex-1 overflow-y-auto pb-6 space-y-4 pt-3 px-4 fade-in">
        {/* Summary Card */}
        <div className="card-elevated p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#e8f1ff] flex items-center justify-center">
                <Icon
                  name={complaint.icon || "report_problem"}
                  size={26}
                  className="text-[#0061a5]"
                />
              </div>
              <div>
                <div className="text-base font-bold text-[#002045]">
                  {complaint.type}
                </div>
                <div className="text-xs text-[#8a909c]">{complaint.id}</div>
              </div>
            </div>
            <StatusBadge status={complaint.status} />
          </div>
          <p className="text-sm text-[#4a5060] leading-relaxed mb-3">
            {complaint.description}
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#8a909c]">
              <Icon name="location_on" size={14} className="text-[#0061a5]" />
              {complaint.location || complaint.address || complaint.ward}
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8a909c]">
              <Icon name="apartment" size={14} className="text-[#0061a5]" />
              {complaint.ward}
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8a909c]">
              <Icon
                name="calendar_today"
                size={14}
                className="text-[#0061a5]"
              />
              {t.detail.filedOn} {complaint.date || complaint.reported || "—"}
            </div>
          </div>
        </div>

        {/* Photo */}
        <div className="card-elevated p-4">
          <div className="text-sm font-bold text-[#002045] mb-3">
            {t.detail.photo}
          </div>
          <div className="w-full h-40 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <div className="text-center text-[#8a909c]">
              <Icon name="photo" size={36} className="text-[#c8cdd6] mb-2" />
              <div className="text-xs">complaint_photo_1.jpg</div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="card-elevated p-5">
          <div className="text-sm font-bold text-[#002045] mb-4">
            {t.detail.timeline}
          </div>
          <div className="space-y-0">
            {timeline.map((step, i) => (
              <div key={step.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      step.done ? "bg-[#002045]" : "bg-[#e2e6ec]"
                    }`}
                  >
                    <Icon
                      name={step.icon}
                      size={16}
                      className={step.done ? "text-white" : "text-[#8a909c]"}
                    />
                  </div>
                  {i < timeline.length - 1 && (
                    <div
                      className="w-0.5 h-8 mt-1"
                      style={{ background: step.done ? "#002045" : "#e2e6ec" }}
                    />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div
                    className={`text-sm font-semibold ${
                      step.done ? "text-[#002045]" : "text-[#8a909c]"
                    }`}
                  >
                    {stepLabel(step.label, t)}
                  </div>
                  <div className="text-xs text-[#8a909c]">
                    {stepDate(step.date, t)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="card-elevated p-5">
          <div className="text-sm font-bold text-[#002045] mb-4">
            {t.detail.communication}
          </div>
          <div className="space-y-3 mb-4">
            {messages.length === 0 && (
              <div className="text-xs text-[#8a909c] text-center py-2">
                {t.detail.noMessages}
              </div>
            )}
            {messages.map((m, i) => {
              const isMe = !m.isOfficer && m.sender === "You"
              return (
                <div
                  key={i}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      isMe
                        ? "bg-[#002045] text-white rounded-tr-sm"
                        : "bg-[#f0f2f5] text-[#1a1d24] rounded-tl-sm"
                    }`}
                  >
                    {!isMe && (
                      <div className="text-[10px] font-bold text-[#0061a5] mb-1">
                        {m.sender}
                      </div>
                    )}
                    <div className="text-sm leading-snug">{m.text}</div>
                    <div
                      className={`text-[10px] mt-1.5 ${
                        isMe ? "text-white/60" : "text-[#8a909c]"
                      }`}
                    >
                      {m.time}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex gap-2">
            <input
              className="input-field flex-1 text-sm"
              placeholder={t.detail.typeMessage}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ padding: "10px 14px" }}
            />
            <button
              className="w-10 h-10 rounded-full bg-[#002045] flex items-center justify-center flex-shrink-0"
              style={{ border: "none", cursor: "pointer" }}
            >
              <Icon name="send" size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Rating */}
        {complaint.status === "Resolved" && (
          <div className="card-elevated p-5">
            <div className="text-sm font-bold text-[#002045] mb-1">
              {t.detail.rateTitle}
            </div>
            <div className="text-xs text-[#8a909c] mb-3">
              {t.detail.rateSub}
            </div>
            <div className="flex gap-2 justify-center mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRated(s)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Icon
                    name="star"
                    size={36}
                    filled={s <= rated}
                    className={s <= rated ? "text-[#f59d00]" : "text-[#c8cdd6]"}
                  />
                </button>
              ))}
            </div>
            {rated > 0 && (
              <button className="btn-tonal w-full text-sm">
                {t.detail.submitRating}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
