import { useNavigate, useOutletContext } from "react-router-dom"
import { Icon, ScreenHeader } from "@/components/CommonUI"
import type { CitizenOutletContext } from "@/app/layouts/CitizenLayout"

export default function ServicesPage() {
  const navigate = useNavigate()
  const { onMenu } = useOutletContext<CitizenOutletContext>()
  const onNavigate = (s: string) =>
    navigate(
      "/" +
        (s === "home"
          ? ""
          : s === "tanker-request"
            ? "services/tanker-request"
            : s),
    )
  const services = [
    {
      id: "connection",
      screen: "profile",
      label: "Water Connection",
      desc: "View or manage your account details",
      icon: "settings_input_component",
      bg: "#e8f1ff",
      color: "#0061a5",
    },
    {
      id: "meter-services",
      screen: "report",
      label: "Water Meter Services",
      desc: "Report meter issues or request replacement",
      icon: "speed",
      bg: "#e8f1ff",
      color: "#0061a5",
    },
    {
      id: "tanker-request",
      screen: "tanker-request",
      label: "Request a Tanker",
      desc: "Book an emergency water tanker",
      icon: "local_shipping",
      bg: "#ffdea3",
      color: "#7c5800",
    },
    {
      id: "other-requests",
      screen: "report",
      label: "Other Service Requests",
      desc: "General requests and queries",
      icon: "assignment",
      bg: "#f0f2f5",
      color: "#4a5060",
    },
  ]

  return (
    <div className="flex flex-col h-full bg-[#f8f9fb]">
      <div className="bg-white">
        <ScreenHeader title="Water Services" onMenu={onMenu} />
      </div>
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 space-y-3 fade-in">
        {services.map((s) => (
          <button
            key={s.id}
            onClick={() => onNavigate(s.screen)}
            className="card-elevated p-5 flex items-center gap-4 w-full text-left transition-transform active:scale-95 border-none cursor-pointer bg-white"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: s.bg }}
            >
              <Icon name={s.icon} size={28} style={{ color: s.color }} />
            </div>
            <div className="flex-1">
              <div className="text-base font-bold text-[#1a1d24] mb-1">
                {s.label}
              </div>
              <div className="text-xs text-[#8a909c]">{s.desc}</div>
            </div>
            <Icon name="chevron_right" size={20} className="text-[#c8cdd6]" />
          </button>
        ))}
      </div>
    </div>
  )
}
