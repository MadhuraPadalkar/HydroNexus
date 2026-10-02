import { useOutletContext } from "react-router-dom"
import { Icon, ScreenHeader } from "@/components/CommonUI"
import type { CitizenOutletContext } from "@/app/layouts/CitizenLayout"

export default function ConservationPage() {
  const { onMenu } = useOutletContext<CitizenOutletContext>()
  return (
    <div className="flex flex-col h-full bg-[#f8f9fb]">
      <div className="bg-white">
        <ScreenHeader title="Water Conservation" onMenu={onMenu} />
      </div>
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 space-y-4 fade-in">
        <div className="card-elevated p-6 text-center">
          <div className="text-sm font-bold text-[#002045] mb-1">
            Your Monthly Usage
          </div>
          <div className="text-xs text-[#8a909c] mb-6">
            Compared to Ward 12 Average
          </div>

          <div className="relative w-full h-8 bg-gray-100 rounded-full mb-3 flex items-center overflow-hidden">
            <div
              className="absolute left-0 top-0 bottom-0 bg-[#0061a5]"
              style={{ width: "40%" }}
            />
            <div className="absolute left-[50%] top-0 bottom-0 w-1 bg-[#ba1a1a] z-10" />
            <span className="relative z-10 text-[10px] font-bold text-white ml-2">
              You: 3,200L
            </span>
          </div>

          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[#0061a5]">Efficient User!</span>
            <span className="text-[#ba1a1a]">Ward Avg: 4,000L</span>
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-[#8a909c] uppercase tracking-widest mb-3">
            Water Saving Tips
          </div>
          {[
            {
              icon: "plumbing",
              title: "Fix Leaks Promptly",
              desc: "A dripping tap can waste up to 15 litres of water a day.",
            },
            {
              icon: "opacity",
              title: "Turn Off the Tap",
              desc: "Don't leave water running while brushing teeth or shaving.",
            },
            {
              icon: "local_laundry_service",
              title: "Full Loads Only",
              desc: "Run washing machines and dishwashers only with a full load.",
            },
            {
              icon: "yard",
              title: "Water Plants Wisely",
              desc: "Water your garden early morning or late evening to reduce evaporation.",
            },
          ].map((tip, i) => (
            <div key={i} className="card-elevated p-4 flex gap-4 mb-3">
              <div className="w-12 h-12 rounded-full bg-[#e8f1ff] flex items-center justify-center flex-shrink-0">
                <Icon name={tip.icon} size={22} className="text-[#0061a5]" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#1a1d24] mb-1">
                  {tip.title}
                </div>
                <div className="text-xs text-[#4a5060] leading-relaxed">
                  {tip.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
