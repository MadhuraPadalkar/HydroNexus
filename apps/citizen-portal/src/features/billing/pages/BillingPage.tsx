import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import { Icon, ScreenHeader } from "@/components/CommonUI"
import { billHistory, usageData } from "@/mocks/citizenData"
import type { CitizenOutletContext } from "@/app/layouts/CitizenLayout"

export default function BillingPage() {
  const { onMenu } = useOutletContext<CitizenOutletContext>()
  const quota = 8000
  const currentUsage = 3200

  return (
    <div className="flex flex-col h-full bg-[#f8f9fb]">
      <div className="bg-white">
        <ScreenHeader title="Billing & Usage" onMenu={onMenu} />
      </div>
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 space-y-4 fade-in">
        {/* Current Bill */}
        <div
          className="rounded-3xl p-6 text-white"
          style={{ background: "linear-gradient(135deg, #002045, #0061a5)" }}
        >
          <div className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">
            September 2026 Bill
          </div>
          <div className="text-4xl font-extrabold mb-0.5">₹ 480</div>
          <div className="text-white/70 text-sm mb-5">
            Due by 20 September 2026
          </div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div
              className="rounded-2xl p-3"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              <div className="text-white/65 text-xs mb-1">Connection ID</div>
              <div className="text-white text-sm font-bold">KMC-W12-004872</div>
            </div>
            <div
              className="rounded-2xl p-3"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              <div className="text-white/65 text-xs mb-1">Usage This Month</div>
              <div className="text-white text-sm font-bold">
                3,200 L of 8,000 L
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              className="flex-1 py-3 rounded-full text-sm font-bold text-[#002045]"
              style={{
                background: "#66affe",
                border: "none",
                cursor: "pointer",
              }}
            >
              Pay Now
            </button>
            <button
              className="flex-none px-4 py-3 rounded-full text-sm font-semibold text-white"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1.5px solid rgba(255,255,255,0.3)",
                cursor: "pointer",
              }}
            >
              Download Receipt
            </button>
          </div>
        </div>

        {/* Usage vs Quota */}
        <div className="card-elevated p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-[#002045]">
              Monthly Usage vs. Quota
            </div>
            <div className="text-xs text-[#8a909c]">
              {Math.round((currentUsage / quota) * 100)}% used
            </div>
          </div>
          <div className="w-full h-3 rounded-full bg-[#e2e6ec] mb-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#0061a5] transition-all"
              style={{ width: `${(currentUsage / quota) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#8a909c]">
            <span>{currentUsage.toLocaleString()} L used</span>
            <span>{(quota - currentUsage).toLocaleString()} L remaining</span>
          </div>

          <div className="mt-4">
            <div className="text-sm font-bold text-[#002045] mb-3">
              6-Month Usage (Litres)
            </div>
            <div className="flex items-end gap-2 h-24">
              {usageData.map((d) => (
                <div
                  key={d.month}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div className="text-[9px] font-semibold text-[#4a5060]">
                    {d.month !== "Sep"
                      ? Math.round(d.usage / 100) / 10 + "k"
                      : ""}
                  </div>
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{
                      height: `${(d.usage / maxUsage) * 72}px`,
                      background:
                        d.month === "Sep"
                          ? "linear-gradient(to top, #002045, #0061a5)"
                          : "#c8cdd6",
                    }}
                    data-maxUsage={Math.max(...usageData.map((d) => d.usage))}
                  />
                  <span className="text-[9px] text-[#8a909c]">{d.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tariff Info */}
        <div className="bg-[#e8f1ff] rounded-2xl p-4 flex gap-3">
          <Icon
            name="info"
            size={20}
            className="text-[#0061a5] flex-shrink-0 mt-0.5"
          />
          <div>
            <div className="text-xs font-bold text-[#002045] mb-1">
              Tariff Slab (Domestic)
            </div>
            <div className="text-xs text-[#4a5060]">
              0–8,000 L: ₹ 5.50/100L · 8,001–12,000 L: ₹ 8.00/100L · Above
              12,000 L: ₹ 12.00/100L
            </div>
          </div>
        </div>

        {/* Bill History */}
        <div className="card-elevated p-5">
          <div className="text-sm font-bold text-[#002045] mb-4">
            Bill History
          </div>
          <div className="space-y-0">
            {billHistory.map((b, i) => (
              <div
                key={b.month}
                className={`flex items-center gap-4 py-3 ${
                  i < billHistory.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-[#b7f0cd] flex items-center justify-center flex-shrink-0">
                  <Icon name="receipt" size={20} className="text-[#1a6936]" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[#1a1d24]">
                    {b.month}
                  </div>
                  <div className="text-xs text-[#8a909c]">Paid on {b.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#002045]">
                    ₹ {b.amount}
                  </div>
                  <span className="text-xs font-semibold text-[#1a6936]">
                    {b.status}
                  </span>
                </div>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Icon name="download" size={18} className="text-[#8a909c]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const maxUsage = Math.max(...usageData.map((d) => d.usage))
