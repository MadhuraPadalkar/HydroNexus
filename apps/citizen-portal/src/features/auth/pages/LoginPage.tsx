import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Icon } from "@/components/CommonUI"
import { useAuth } from "@/hooks/useAuth"
import { useLanguage } from "@/i18n/LanguageContext"

export default function LoginPage() {
  const navigate = useNavigate()
  const { requestOtp, loading } = useAuth()
  const { t } = useLanguage()
  const [phone, setPhone] = useState("9876543210")
  const [error, setError] = useState<string | null>(null)

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError(t.login.invalidPhone)
      return
    }
    setError(null)
    try {
      await requestOtp(phone)
      navigate("/verify-otp", { state: { phone } })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.login.sendFailed)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top */}
      <div
        className="flex-none px-6 pt-16 pb-8 flex flex-col items-center"
        style={{
          background: "linear-gradient(160deg, #002045 0%, #0061a5 100%)",
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "1.5px solid rgba(255,255,255,0.2)",
          }}
        >
          <Icon name="water_drop" size={36} filled className="text-[#66affe]" />
        </div>
        <div className="text-2xl font-extrabold text-white">
          KMC Smart Water
        </div>
        <div className="text-white/65 text-sm mt-1">
          Kolhapur Municipal Corporation
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 px-5 -mt-4">
        <div className="card-elevated p-6 fade-in shadow-md rounded-2xl bg-white border border-gray-100">
          <h2 className="text-xl font-bold text-[#002045] mb-1">
            {t.login.title}
          </h2>
          <p className="text-sm text-[#8a909c] mb-6">{t.login.subtitle}</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <Icon name="error" size={16} className="text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <label className="block text-xs font-semibold text-[#4a5060] mb-2 tracking-wide uppercase">
            {t.login.mobileNumber}
          </label>
          <div className="flex gap-2 mb-4">
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-3.5 bg-gray-50">
              <span className="text-sm font-semibold text-[#4a5060]">
                🇮🇳 +91
              </span>
            </div>
            <input
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0061a5]"
              type="tel"
              placeholder="98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={10}
            />
          </div>

          <div className="bg-[#e8f1ff] rounded-xl p-3 mb-6 flex gap-2">
            <Icon
              name="info"
              size={18}
              className="text-[#0061a5] flex-shrink-0 mt-0.5"
            />
            <p className="text-xs text-[#0061a5]">{t.login.otpInfo}</p>
          </div>

          <button
            className="btn-primary"
            onClick={handleSendOtp}
            disabled={loading}
          >
            {loading ? <span className="btn-spinner" /> : t.login.sendOtp}
          </button>

          <div className="mt-4 text-center">
            <span className="text-sm text-[#8a909c]">{t.login.newUser} </span>
            <button
              onClick={() => navigate("/services")}
              className="text-sm font-semibold text-[#0061a5]"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              {t.login.register}
            </button>
          </div>
        </div>

        <div className="mt-5 text-center">
          <div className="text-xs text-[#8a909c]">{t.login.agree}</div>
          <div className="text-xs text-[#0061a5] mt-0.5">{t.login.terms}</div>
        </div>
      </div>

      <div className="pb-8 text-center">
        <div className="text-[10px] text-[#8a909c]">{t.login.footer}</div>
      </div>
    </div>
  )
}
