import { useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { Icon, ScreenHeader } from "@/components/CommonUI"
import type { CitizenOutletContext } from "@/app/layouts/CitizenLayout"

export default function TankerRequestPage() {
  const navigate = useNavigate()
  const { onMenu } = useOutletContext<CitizenOutletContext>()
  const onNavigate = (s: string) => navigate("/" + (s === "home" ? "" : s))
  const [urgency, setUrgency] = useState<"Normal" | "Urgent">("Normal")
  const [slot, setSlot] = useState("")
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="flex flex-col h-full bg-white">
        <ScreenHeader title="Tanker Requested" onMenu={onMenu} />
        <div className="flex-1 overflow-y-auto px-6 py-6 fade-in text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-[#b7f0cd] flex items-center justify-center mb-4">
            <Icon
              name="check_circle"
              size={40}
              filled
              className="text-[#1a6936]"
            />
          </div>
          <div className="text-xl font-bold text-[#002045] mb-2">
            Request Submitted
          </div>
          <div className="text-[#8a909c] text-sm leading-relaxed mb-6">
            Your request for a water tanker (Req ID: TNK-2026-892) has been
            received.
          </div>

          <div className="card-filled w-full p-5 text-left mb-6">
            <div className="text-sm font-bold text-[#002045] mb-4">
              Status Tracking
            </div>
            <div className="space-y-0">
              {[
                {
                  label: "Requested",
                  date: "Just now",
                  done: true,
                  icon: "send",
                },
                {
                  label: "Approved",
                  date: "Pending",
                  done: false,
                  icon: "thumb_up",
                },
                {
                  label: "Dispatched",
                  date: "Pending",
                  done: false,
                  icon: "local_shipping",
                },
                {
                  label: "Delivered",
                  date: "Pending",
                  done: false,
                  icon: "done_all",
                },
              ].map((step, i) => (
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
                    {i < 3 && (
                      <div
                        className="w-0.5 h-8 mt-1"
                        style={{
                          background: step.done ? "#002045" : "#e2e6ec",
                        }}
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

          <button
            className="btn-primary"
            onClick={() => onNavigate("home")}
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#f8f9fb]">
      <div className="bg-white">
        <ScreenHeader
          title="Request a Tanker"
          onBack={() => onNavigate("services")}
          onMenu={onMenu}
        />
      </div>
      <div className="flex-1 overflow-y-auto pb-32 px-4 pt-4 space-y-4 fade-in">
        <div className="card-elevated p-4 bg-gray-50">
          <div className="text-xs font-bold text-[#8a909c] uppercase mb-2">
            Delivery Details (Auto-filled)
          </div>
          <div className="text-sm font-semibold text-[#002045]">
            Ward 12 — Rankala
          </div>
          <div className="text-xs text-[#4a5060] mt-1">
            Shivaji Park Colony, Building B, Kolhapur
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="text-sm font-bold text-[#002045] mb-3">
            Urgency Level
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setUrgency("Normal")}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all border-2 border-transparent"
              style={{
                background: urgency === "Normal" ? "#e8f1ff" : "#f0f2f5",
                color: urgency === "Normal" ? "#0061a5" : "#4a5060",
                borderColor: urgency === "Normal" ? "#0061a5" : "transparent",
                cursor: "pointer",
              }}
            >
              Normal
            </button>
            <button
              onClick={() => setUrgency("Urgent")}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all border-2 border-transparent"
              style={{
                background: urgency === "Urgent" ? "#ffdad6" : "#f0f2f5",
                color: urgency === "Urgent" ? "#ba1a1a" : "#4a5060",
                borderColor: urgency === "Urgent" ? "#ba1a1a" : "transparent",
                cursor: "pointer",
              }}
            >
              Urgent
            </button>
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="text-sm font-bold text-[#002045] mb-3">
            Preferred Time Slot
          </div>
          <select
            className="input-field w-full"
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
          >
            <option value="" disabled>
              Select a time slot
            </option>
            <option value="morning">Morning (8 AM - 12 PM)</option>
            <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
            <option value="evening">Evening (4 PM - 8 PM)</option>
          </select>
        </div>

        <div className="card-elevated p-4">
          <div className="text-sm font-bold text-[#002045] mb-3">
            Additional Notes (Optional)
          </div>
          <textarea
            className="input-field w-full resize-none"
            rows={3}
            placeholder="E.g., Park near the community hall..."
          />
        </div>
      </div>

      <div
        className="fixed bottom-16 left-0 right-0 px-4 pb-3 pt-2 bg-white border-t border-gray-100 z-10 safe-area-bottom"
        style={{
          maxWidth: 430,
          margin: "0 auto",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <button
          className="btn-primary"
          onClick={() => setSubmitted(true)}
          disabled={!slot}
        >
          Submit Request
        </button>
      </div>
    </div>
  )
}
