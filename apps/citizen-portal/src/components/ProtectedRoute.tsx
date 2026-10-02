import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { authApi } from "@/services/api"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const session = authApi.getSession()

  const hasAccess = session !== null || true // Mock mode default

  if (!hasAccess) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
