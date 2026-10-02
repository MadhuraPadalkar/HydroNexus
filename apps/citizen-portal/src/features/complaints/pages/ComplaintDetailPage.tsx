import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Icon, StatusBadge, ScreenHeader } from "@/components/CommonUI"
import { complaints, type Complaint } from "@/mocks/citizenData"

export default function ComplaintDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const onBack = () => navigate("/complaints")
  const complaint = complaints.find((c) => c.id === id) || complaints[0]
  const [comment, setComment] = useState("")
  const [rated, setRated] = useState(0)

  const timeline = [
    { label: "Submitted", date: complaint.date, done: true, icon: "send" },
    {
      label: "Assigned to Officer",
      date: "9 Sep 2026",
      done: complaint.status !== "Open",
      icon: "person_pin",
    },
    {
      label: "In Progress",
      date:
        complaint.status === "In Progress"
          ? "Today"
          : complaint.status === "Resolved"
            ? "10 Sep 2026"
            : "—",
      done:
        complaint.status === "In Progress" || complaint.status === "Resolved",
      icon: "build",
    },
    {
      label: "Resolved",
      date: complaint.status === "Resolved" ? "11 Sep 2026" : "—",
      done: complaint.status === "Resolved",
      icon: "check_circle",
    },
  ]

  const messages = [
    {
      from: "officer",
      name: "Jr. Eng. Ramesh Kulkarni",
      time: "9 Sep, 2:15 PM",
      text: "Complaint received and assigned. Our team will inspect the site by tomorrow morning.",
    },
    {
      from: "me",
      name: "You",
      time: "9 Sep, 2:30 PM",
      text: "Thank you. The leak is getting worse — water is spreading to the road.",
    },
    {
      from: "officer",
      name: "Jr. Eng. Ramesh Kulkarni",
      time: "10 Sep, 9:00 AM",
      text: "Team has been dispatched. ETA: 30 minutes. Please ensure access to the pipeline area.",
    },
  ]

  return (
    <div className="flex flex-col h-full bg-[#f8f9fb]">
      <div className="bg-white">
        <ScreenHeader title="Complaint Detail" onBack={onBack} />
      </div>
      <div className="flex-1 overflow-y-auto pb-6 space-y-4 pt-3 px-4 fade-in">
        {/* Summary Card */}
        <div className="card-elevated p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#e8f1ff] flex items-center justify-center">
                <Icon
                  name={complaint.icon}
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
              {complaint.location}
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
              Filed on {complaint.date}
            </div>
          </div>
        </div>

        {/* Photo */}
        <div className="card-elevated p-4">
          <div className="text-sm font-bold text-[#002045] mb-3">
            Attached Photo
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
            Status Timeline
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
                    {step.label}
                  </div>
                  <div className="text-xs text-[#8a909c]">{step.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="card-elevated p-5">
          <div className="text-sm font-bold text-[#002045] mb-4">
            Communication
          </div>
          <div className="space-y-3 mb-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.from === "me" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    m.from === "me"
                      ? "bg-[#002045] text-white rounded-tr-sm"
                      : "bg-[#f0f2f5] text-[#1a1d24] rounded-tl-sm"
                  }`}
                >
                  {m.from !== "me" && (
                    <div className="text-[10px] font-bold text-[#0061a5] mb-1">
                      {m.name}
                    </div>
                  )}
                  <div className="text-sm leading-snug">{m.text}</div>
                  <div
                    className={`text-[10px] mt-1.5 ${
                      m.from === "me" ? "text-white/60" : "text-[#8a909c]"
                    }`}
                  >
                    {m.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="input-field flex-1 text-sm"
              placeholder="Type a message..."
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
              Rate this Resolution
            </div>
            <div className="text-xs text-[#8a909c] mb-3">
              Help us improve our service quality
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
                Submit Rating
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
