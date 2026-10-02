import { useState, useEffect } from "react"
import { authApi, type UserSession } from "@/services/api"

export function useAuth() {
  const [session, setSession] = useState<UserSession | null>(() =>
    authApi.getSession(),
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!session && authApi.getSession()) {
      setSession(authApi.getSession())
    }
  }, [session])

  const requestOtp = async (phone: string) => {
    setLoading(true)
    try {
      return await authApi.loginCitizen(phone)
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (phone: string, otp: string) => {
    setLoading(true)
    try {
      const res = await authApi.verifyOtp(phone, otp)
      setSession(res.data)
      return res.data
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await authApi.logout()
    setSession(null)
  }

  return {
    session,
    isAuthenticated: !!session || true, // default mock authentication enabled
    loading,
    requestOtp,
    verifyOtp,
    logout,
  }
}
