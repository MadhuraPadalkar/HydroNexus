import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading } = useAuth()
  const [email, setEmail] = useState("suresh.patil@kmcwater.gov.in")
  const [password, setPassword] = useState("••••••••••••")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
      // @ts-ignore
      const from = location.state?.from?.pathname || "/"
      navigate(from, { replace: true })
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid credentials. Please try again.",
      )
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f9] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#0061a5]">
            <span className="material-symbols-outlined text-white text-2xl">
              water
            </span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              KMC Smart Water
            </h1>
            <p className="text-xs text-blue-600 font-medium">
              Officer Portal Login
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-xs font-semibold text-gray-700 mb-1"
              htmlFor="officer-email"
            >
              Official Email ID
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-lg">
                badge
              </span>
              <input
                id="officer-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="officer@kmcwater.gov.in"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-xs font-semibold text-gray-700 mb-1"
              htmlFor="officer-password"
            >
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-lg">
                lock
              </span>
              <input
                id="officer-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Remember this workstation</span>
            </label>
            <a href="#forgot" className="text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#0061a5] hover:bg-[#004f87] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign in to Dashboard</span>
                <span className="material-symbols-outlined text-base">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center text-xs text-gray-400">
          Kolhapur Municipal Corporation — Water Works Department
        </div>
      </div>
    </div>
  )
}
