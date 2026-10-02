import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Icon } from "@/components/CommonUI"
import { useAuth } from "@/hooks/useAuth"

export default function OtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyOtp, loading } = useAuth()
  // @ts-ignore
  const phone = location.state?.phone || "9876543210"
  const [otp, setOtp] = useState(["1", "2", "3", "4", "5", "6"])
  const [resendTimer, setResendTimer] = useState(30)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (resendTimer === 0) return
    const t = setTimeout(() => setResendTimer((v) => v - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  const handleOtp = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 5) {
      ;(document.getElementById(`otp-${i + 1}`) as HTMLInputElement)?.focus()
    }
  }

  const handleVerify = async () => {
    const code = otp.join("")
    if (code.length < 6) {
      setError("Please enter the complete 6-digit verification code.")
      return
    }
    setError(null)
    try {
      await verifyOtp(phone, code)
      navigate("/")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid OTP code.")
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div
        className="flex-none px-6 pt-14 pb-6 text-center relative"
        style={{
          background: "linear-gradient(160deg, #002045 0%, #0061a5 100%)",
        }}
      >
        <button
          onClick={() => navigate("/login")}
          className="absolute top-12 left-4 w-10 h-10 flex items-center justify-center rounded-full cursor-pointer"
          style={{ background: "rgba(255,255,255,0.1)", border: "none" }}
          aria-label="Back to Login"
        >
          <Icon name="arrow_back" size={22} className="text-white" />
        </button>
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          <Icon name="sms" size={32} className="text-[#66affe]" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Verify OTP</h1>
        <p className="text-white/65 text-sm">Sent to +91 {phone}</p>
      </div>

      <div className="flex-1 px-5 -mt-4">
        <div className="card-elevated p-6 fade-in shadow-md rounded-2xl bg-white border border-gray-100">
          <p className="text-sm text-[#4a5060] mb-6 text-center">
            Enter the 6-digit code sent to your mobile number
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <Icon name="error" size={16} className="text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2 justify-center mb-6">
            {otp.map((d, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="tel"
                maxLength={1}
                value={d}
                onChange={(e) => handleOtp(i, e.target.value)}
                className="w-11 h-14 text-center text-xl font-bold rounded-xl border-2 border-gray-200 focus:border-[#0061a5] outline-none transition-colors"
                style={{
                  fontFamily: "Inter, sans-serif",
                  background: d ? "#e8f1ff" : "#fff",
                  color: "#002045",
                }}
              />
            ))}
          </div>

          <button
            className="w-full py-3 bg-[#0061a5] hover:bg-[#004f87] text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mb-4 disabled:opacity-60"
            onClick={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Verify & Continue"
            )}
          </button>

          <div className="text-center">
            {resendTimer > 0 ? (
              <span className="text-sm text-[#8a909c]">
                Resend OTP in {resendTimer}s
              </span>
            ) : (
              <button
                className="text-sm font-semibold text-[#0061a5]"
                onClick={() => setResendTimer(30)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Resend OTP
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-gray-50 border border-gray-100 p-4 flex gap-3">
          <Icon
            name="shield"
            size={20}
            className="text-[#1a6936] flex-shrink-0 mt-0.5"
          />
          <p className="text-xs text-[#4a5060] leading-relaxed">
            Your data is secured with end-to-end encryption. KMC will never ask
            for your OTP via call or SMS.
          </p>
        </div>
      </div>
    </div>
  )
}
