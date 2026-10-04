import { useState, useEffect } from "react"
import { authApi, isMockMode, type UserSession } from "@/services/api"

export function useAuth() {
  const [session, setSession] = useState<UserSession | null>(() =>
    authApi.getSession(),
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // If no session exists, default to mock officer session in mock mode for instant developer experience
    if (!session && authApi.getSession()) {
      setSession(authApi.getSession())
    }
  }, [session])

  const login = async (email: string, pass?: string) => {
    setLoading(true)
    try {
      const res = await authApi.loginOfficer(email, pass)
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
    // Mock mode stays authenticated for instant dev experience; real mode
    // (VITE_USE_MOCKS=false) requires an actual login session.
    isAuthenticated: isMockMode() ? true : !!session,
    loading,
    login,
    logout,
  }
}
