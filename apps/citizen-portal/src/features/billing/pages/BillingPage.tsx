import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import { Icon, ScreenHeader } from "@/components/CommonUI"
import { useCitizenBills, useCitizenUsage } from "@/hooks/useCitizenData"
import { LoadingSpinner, EmptyState, ErrorMessage } from "@water/ui"
import { useLanguage } from "@/i18n/LanguageContext"
import { localizeStatus } from "@/i18n/translations"
import type { CitizenOutletContext } from "@/app/layouts/CitizenLayout"

const QUOTA_L = 8000

export default function BillingPage() {
  const { onMenu } = useOutletContext<CitizenOutletContext>()
  const { t } = useLanguage()
  const {
    bills,
    loading: billsLoading,
    error: billsError,
    refetch: refetchBills,
    payBill,
  } = useCitizenBills()
  const {
    usage,
    loading: usageLoading,
    error: usageError,
    refetch: refetchUsage,
  } = useCitizenUsage()
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

  const loading = billsLoading || usageLoading
  const currentBill = bills.find((b) => b.status !== "Paid") || bills[0]
  const history = bills.slice(1)
  const usageLitres = usage.map((d) => ({
    month: d.month,
    usage: d.usage * 1000,
  }))
  const maxUsage = Math.max(...usageLitres.map((d) => d.usage), 1)
  const currentUsage =
    usageLitres.length > 0 ? usageLitres[usageLitres.length - 1]!.usage : 0

  const handlePay = async () => {
    if (!currentBill || paying) return
    setPaying(true)
    setPayError(null)
    try {
      await payBill(currentBill.id)
      await refetchBills()
    } catch (err: unknown) {
      setPayError(err instanceof Error ? err.message : t.billing.payFailed)
    } finally {
      setPaying(false)
    }
  }

  const retryAll = () => {
    refetchBills()
    refetchUsage()
  }

  return (
    <div className="flex flex-col h-full bg-[#f8f9fb]">
      <div className="bg-white">
        <ScreenHeader title={t.billing.title} onMenu={onMenu} />
      </div>
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 space-y-4 fade-in">
        {loading && <LoadingSpinner message={t.billing.loading} />}
        {!loading && billsError && (
          <ErrorMessage
            title={t.billing.loadFailed}
            message={billsError}
            onRetry={retryAll}
          />
        )}
        {!loading && !billsError && !currentBill && (
          <EmptyState
            title={t.billing.emptyTitle}
            description={t.billing.emptyBody}
            icon="receipt_long"
          />
        )}

        {!loading && !billsError && currentBill && (
          <>
            {/* Current Bill */}
            <div
              className="rounded-3xl p-6 text-white"
              style={{
                background: "linear-gradient(135deg, #002045, #0061a5)",
              }}
            >
              <div className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">
                {currentBill.period} {t.billing.billSuffix}
              </div>
              <div className="text-4xl font-extrabold mb-0.5">
                ₹ {currentBill.amount}
              </div>
              <div className="text-white/70 text-sm mb-5">
                {currentBill.status === "Paid"
                  ? `${t.billing.paidOn} ${currentBill.billDate}`
                  : `${t.billing.dueBy} ${currentBill.dueDate}`}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div
                  className="rounded-2xl p-3"
                  style={{ background: "rgba(255,255,255,0.12)" }}
                >
                  <div className="text-white/65 text-xs mb-1">
                    {t.billing.connectionId}
                  </div>
                  <div className="text-white text-sm font-bold">
                    {currentBill.consumerNumber}
                  </div>
                </div>
                <div
                  className="rounded-2xl p-3"
                  style={{ background: "rgba(255,255,255,0.12)" }}
                >
                  <div className="text-white/65 text-xs mb-1">
                    {t.billing.usageMonth}
                  </div>
                  <div className="text-white text-sm font-bold">
                    {currentUsage.toLocaleString()} {t.billing.unit}{" "}
                    {t.billing.of} {QUOTA_L.toLocaleString()} {t.billing.unit}
                  </div>
                </div>
              </div>
              {payError && (
                <div className="text-xs bg-red-500/20 rounded-xl px-3 py-2 mb-3">
                  {payError}
                </div>
              )}
              <div className="flex gap-3">
                {currentBill.status !== "Paid" ? (
                  <button
                    onClick={handlePay}
                    disabled={paying}
                    className="btn-primary flex-1"
                  >
                    {paying ? (
                      <span className="btn-spinner" />
                    ) : (
                      t.billing.payNow
                    )}
                  </button>
                ) : (
                  <div className="flex-1 py-3 rounded-xl text-sm font-bold text-center bg-[#b7f0cd] text-[#1a6936]">
                    {t.billing.paid}
                  </div>
                )}
                <button
                  className="flex-none px-4 py-3 rounded-xl text-sm font-semibold text-white"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1.5px solid rgba(255,255,255,0.3)",
                    cursor: "pointer",
                  }}
                >
                  {t.billing.receipt}
                </button>
              </div>
            </div>

            {/* Usage vs Quota */}
            <div className="card-elevated p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-[#002045]">
                  {t.billing.quotaTitle}
                </div>
                <div className="text-xs text-[#8a909c]">
                  {Math.round((currentUsage / QUOTA_L) * 100)}%{" "}
                  {t.billing.usedPct}
                </div>
              </div>
              <div className="w-full h-3 rounded-full bg-[#e2e6ec] mb-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#0061a5] transition-all"
                  style={{
                    width: `${Math.min((currentUsage / QUOTA_L) * 100, 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-[#8a909c]">
                <span>
                  {currentUsage.toLocaleString()} {t.billing.unit}{" "}
                  {t.billing.used}
                </span>
                <span>
                  {Math.max(QUOTA_L - currentUsage, 0).toLocaleString()}{" "}
                  {t.billing.unit} {t.billing.remaining}
                </span>
              </div>

              <div className="mt-4">
                <div className="text-sm font-bold text-[#002045] mb-3">
                  {t.billing.sixMonth}
                </div>
                {usageError ? (
                  <ErrorMessage
                    title={t.billing.usageFailed}
                    message={usageError}
                    onRetry={refetchUsage}
                  />
                ) : usageLitres.length === 0 ? (
                  <EmptyState
                    title={t.billing.noUsage}
                    description={t.billing.noUsageBody}
                    icon="water_drop"
                  />
                ) : (
                  <div className="flex items-end gap-2 h-24">
                    {usageLitres.map((d, i) => (
                      <div
                        key={d.month}
                        className="flex-1 flex flex-col items-center gap-1"
                      >
                        <div className="text-[9px] font-semibold text-[#4a5060]">
                          {i !== usageLitres.length - 1
                            ? Math.round(d.usage / 100) / 10 + "k"
                            : ""}
                        </div>
                        <div
                          className="w-full rounded-t-lg transition-all"
                          style={{
                            height: `${Math.max((d.usage / maxUsage) * 72, 4)}px`,
                            background:
                              i === usageLitres.length - 1
                                ? "linear-gradient(to top, #002045, #0061a5)"
                                : "#c8cdd6",
                          }}
                        />
                        <span className="text-[9px] text-[#8a909c]">
                          {d.month}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
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
                  {t.billing.tariffTitle}
                </div>
                <div className="text-xs text-[#4a5060]">
                  {t.billing.tariffBody}
                </div>
              </div>
            </div>

            {/* Bill History */}
            <div className="card-elevated p-5">
              <div className="text-sm font-bold text-[#002045] mb-4">
                {t.billing.history}
              </div>
              {history.length === 0 ? (
                <div className="text-xs text-[#8a909c] text-center py-2">
                  {t.billing.noHistory}
                </div>
              ) : (
                <div className="space-y-0">
                  {history.map((b, i) => (
                    <div
                      key={b.id}
                      className={`flex items-center gap-4 py-3 ${
                        i < history.length - 1 ? "border-b border-gray-100" : ""
                      }`}
                    >
                      <div className="w-10 h-10 rounded-2xl bg-[#b7f0cd] flex items-center justify-center flex-shrink-0">
                        <Icon
                          name="receipt"
                          size={20}
                          className="text-[#1a6936]"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-[#1a1d24]">
                          {b.period}
                        </div>
                        <div className="text-xs text-[#8a909c]">
                          {b.status === "Paid"
                            ? `${t.billing.paidSep} ${b.billDate}`
                            : `${t.billing.due} ${b.dueDate}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-[#002045]">
                          ₹ {b.amount}
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            b.status === "Paid"
                              ? "text-[#1a6936]"
                              : "text-[#ba1a1a]"
                          }`}
                        >
                          {localizeStatus(b.status, t)}
                        </span>
                      </div>
                      <button
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <Icon
                          name="download"
                          size={18}
                          className="text-[#8a909c]"
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
