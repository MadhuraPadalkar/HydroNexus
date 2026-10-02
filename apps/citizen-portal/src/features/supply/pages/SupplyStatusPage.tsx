import { useOutletContext } from "react-router-dom"
import { Icon, ScreenHeader } from "@/components/CommonUI"
import { supplySchedule } from "@/mocks/citizenData"
import type { CitizenOutletContext } from "@/app/layouts/CitizenLayout"

export default function SupplyStatusPage() {
  const { onMenu } = useOutletContext<CitizenOutletContext>()
  return (
    <div className="flex flex-col h-full bg-[#f8f9fb]">
      <div className="bg-white">
        <ScreenHeader title="Water Supply Status" onMenu={onMenu} />
      </div>
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 space-y-4 fade-in">
        <div className="card-elevated p-6 flex flex-col items-center justify-center text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
            style={{ background: "#b7f0cd", border: "4px solid #e8f0e0" }}
          >
            <Icon
              name="water_drop"
              size={40}
              filled
              className="text-[#1a6936]"
            />
          </div>
          <div className="text-xl font-bold text-[#002045]">Supply is ON</div>
          <div className="text-sm text-[#4a5060] mt-1">Ward 12 — Rankala</div>
        </div>

        <div className="card-elevated p-5">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="schedule" size={20} className="text-[#0061a5]" />
            <span className="font-bold text-[#002045] text-sm">
              Today's Schedule
            </span>
          </div>
          <div className="flex items-center gap-3 py-3 border-b border-gray-100">
            <div className="w-1.5 h-8 rounded-full bg-[#0061a5] flex-shrink-0" />
            <div className="flex-1">
              <div className="text-xs font-semibold text-[#002045]">
                Morning Supply
              </div>
              <div className="text-xs text-[#8a909c] mt-0.5">
                6:00 AM – 8:30 AM
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 bg-[#e8f1ff] text-[#0061a5] rounded-full">
              Completed
            </span>
          </div>
          <div className="flex items-center gap-3 py-3">
            <div className="w-1.5 h-8 rounded-full bg-[#c8cdd6] flex-shrink-0" />
            <div className="flex-1">
              <div className="text-xs font-semibold text-[#4a5060]">
                Evening Supply
              </div>
              <div className="text-xs text-[#8a909c] mt-0.5">
                6:00 PM – 8:00 PM
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 bg-[#f0f2f5] text-[#8a909c] rounded-full">
              Upcoming
            </span>
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-[#ba1a1a] uppercase tracking-widest mb-3">
            Water Shortage Information
          </div>
          <div className="alert-critical rounded-2xl p-4 flex gap-3 items-start">
            <Icon
              name="warning"
              size={20}
              className="text-[#ba1a1a] flex-shrink-0 mt-0.5"
            />
            <div>
              <div className="text-sm font-bold text-[#ba1a1a] mb-1">
                Reduced Pressure Expected
              </div>
              <div className="text-xs text-[#4a5060] leading-relaxed">
                Due to ongoing repairs at the Shingnapur pumping station,
                evening supply may experience lower pressure than usual.
                Expected full restoration by tomorrow morning.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
