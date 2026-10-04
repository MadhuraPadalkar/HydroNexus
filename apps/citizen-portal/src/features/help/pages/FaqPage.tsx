import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import { Icon, ScreenHeader } from "@/components/CommonUI"
import { useLanguage } from "@/i18n/LanguageContext"
import type { CitizenOutletContext } from "@/app/layouts/CitizenLayout"

export default function FaqPage() {
  const { onMenu } = useOutletContext<CitizenOutletContext>()
  const { lang, setLang, t } = useLanguage()
  const [expanded, setExpanded] = useState<number | null>(0)
  const [query, setQuery] = useState("")

  const q = query.trim().toLowerCase()
  const faqs =
    q.length === 0
      ? t.faq.faqs
      : t.faq.faqs.filter(
          (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q),
        )

  return (
    <div className="flex flex-col h-full bg-[#f8f9fb]">
      <div className="bg-white">
        <ScreenHeader title={t.faq.title} onMenu={onMenu} />
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
              {l === "en" ? t.profile.english : t.profile.marathi}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-5 card-elevated px-3">
          <Icon
            name="search"
            size={20}
            className="text-[#8a909c] flex-shrink-0"
          />
          <input
            type="text"
            placeholder={t.faq.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 py-3 text-sm bg-transparent outline-none border-none text-[#1a1d24] placeholder:text-[#8a909c]"
          />
        </div>

        {faqs.length === 0 ? (
          <div className="card-elevated p-6 text-center">
            <Icon name="search_off" size={32} className="text-[#c8cdd6] mb-2" />
            <div className="text-sm font-bold text-[#002045] mb-1">
              {t.faq.noResultsTitle}
            </div>
            <div className="text-xs text-[#8a909c]">{t.faq.noResultsBody}</div>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  )
}
