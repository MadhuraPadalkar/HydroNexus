import { useOutletContext } from "react-router-dom"
import { Icon, ScreenHeader } from "@/components/CommonUI"
import { useLanguage } from "@/i18n/LanguageContext"
import type { CitizenOutletContext } from "@/app/layouts/CitizenLayout"

export default function ConservationPage() {
  const { onMenu } = useOutletContext<CitizenOutletContext>()
  const { t } = useLanguage()
  return (
    <div className="flex flex-col h-full bg-[#f8f9fb]">
      <div className="bg-white">
        <ScreenHeader title={t.conservation.title} onMenu={onMenu} />
      </div>
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 space-y-4 fade-in">
        <div className="card-elevated p-6 text-center">
          <div className="text-sm font-bold text-[#002045] mb-1">
            {t.conservation.usageTitle}
          </div>
          <div className="text-xs text-[#8a909c] mb-6">
            {t.conservation.usageSub}
          </div>

          <div className="relative w-full h-8 bg-gray-100 rounded-full mb-3 flex items-center overflow-hidden">
            <div
              className="absolute left-0 top-0 bottom-0 bg-[#0061a5]"
              style={{ width: "40%" }}
            />
            <div className="absolute left-[50%] top-0 bottom-0 w-1 bg-[#ba1a1a] z-10" />
            <span className="relative z-10 text-[10px] font-bold text-white ml-2">
              {t.conservation.youUsage}
            </span>
          </div>

          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[#0061a5]">{t.conservation.efficient}</span>
            <span className="text-[#ba1a1a]">{t.conservation.wardAvg}</span>
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-[#8a909c] uppercase tracking-widest mb-3">
            {t.conservation.tipsTitle}
          </div>
          {[
            { icon: "plumbing", tip: t.conservation.tips[0]! },
            { icon: "opacity", tip: t.conservation.tips[1]! },
            { icon: "local_laundry_service", tip: t.conservation.tips[2]! },
            { icon: "yard", tip: t.conservation.tips[3]! },
          ].map((tip, i) => (
            <div key={i} className="card-elevated p-4 flex gap-4 mb-3">
              <div className="w-12 h-12 rounded-full bg-[#e8f1ff] flex items-center justify-center flex-shrink-0">
                <Icon name={tip.icon} size={22} className="text-[#0061a5]" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#1a1d24] mb-1">
                  {tip.tip.title}
                </div>
                <div className="text-xs text-[#4a5060] leading-relaxed">
                  {tip.tip.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
