import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import { Icon, ScreenHeader } from "@/components/CommonUI"
import type { CitizenOutletContext } from "@/app/layouts/CitizenLayout"

export default function FaqPage() {
  const { onMenu } = useOutletContext<CitizenOutletContext>()
  const [lang, setLang] = useState<"en" | "mr">("en")
  const [expanded, setExpanded] = useState<number | null>(0)

  const faqs = [
    {
      q: "How do I report a water leak?",
      a: "You can report a leak using the 'Report an Issue' option on the home screen. Provide the location and add photos if possible.",
    },
    {
      q: "What are the new water tariff slabs?",
      a: "The tariff for domestic usage up to 8,000 litres is ₹ 5.50 per 100L. Further usage will be billed at higher slabs.",
    },
    {
      q: "How can I pay my water bill online?",
      a: "Go to the 'Billing & Usage' section, review your current bill, and click 'Pay Now' to complete your payment using UPI, Cards, or Net Banking.",
    },
    {
      q: "Who do I contact for emergency tanker?",
      a: "You can request a tanker via the 'Water Services' section, or call the KMC Toll-Free Helpline at 1800-233-1234.",
    },
  ]

  return (
    <div className="flex flex-col h-full bg-[#f8f9fb]">
      <div className="bg-white">
        <ScreenHeader title="Help & FAQs" onMenu={onMenu} />
      </div>
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 fade-in">
        <div className="flex gap-2 mb-6">
          {(["en", "mr"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all border-none cursor-pointer"
              style={{
                background: lang === l ? "#002045" : "#e2e6ec",
                color: lang === l ? "#fff" : "#4a5060",
              }}
            >
              {l === "en" ? "English" : "मराठी"}
            </button>
          ))}
        </div>

        <div className="relative mb-5">
          <Icon
            name="search"
            size={20}
            className="absolute left-3 top-2.5 text-[#8a909c]"
          />
          <input
            type="text"
            placeholder="Search FAQs..."
            className="input-field w-full pl-10"
          />
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="card-elevated overflow-hidden bg-white">
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full flex items-center justify-between p-4 border-none bg-transparent cursor-pointer text-left"
              >
                <span className="text-sm font-semibold text-[#1a1d24] pr-4">
                  {faq.q}
                </span>
                <Icon
                  name={expanded === i ? "expand_less" : "expand_more"}
                  size={20}
                  className="text-[#8a909c] flex-shrink-0"
                />
              </button>
              {expanded === i && (
                <div className="p-4 pt-0 text-xs text-[#4a5060] border-t border-gray-100 mt-1">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
