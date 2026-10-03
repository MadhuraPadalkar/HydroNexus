import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { authApi, isMockMode } from "@/services/api"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const session = authApi.getSession()

  // Mock mode keeps the instant dev experience (no login required).
  // Real mode (VITE_USE_MOCKS=false) requires a valid JWT session.
  const hasAccess = isMockMode() ? true : session !== null

  if (!hasAccess) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
