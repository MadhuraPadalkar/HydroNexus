import React from "react"

export function Card({
  children,
  className = "",
  style,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 ${
        onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""
      } ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

export function StatusBadge({
  status,
  className = "",
}: {
  status: string
  className?: string
}) {
  const getColors = (s: string) => {
    switch (s.toLowerCase()) {
      case "open":
      case "active":
      case "in progress":
      case "normal":
      case "resolved":
      case "on time":
      case "completed":
      case "approved":
      case "paid":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "delayed":
      case "warning":
      case "watch":
      case "under review":
      case "site inspection":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "disrupted":
      case "critical":
      case "major":
      case "unpaid":
      case "overdue":
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColors(status)} ${className}`}
    >
      {status}
    </span>
  )
}

export function LoadingSpinner({
  message = "Loading data...",
  className = "",
}: {
  message?: string
  className?: string
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 gap-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <span className="text-xs text-gray-500 font-medium">{message}</span>
    </div>
  )
}

export function EmptyState({
  title = "No records found",
  description = "There is currently no data to display.",
  icon = "inbox",
  action,
  className = "",
}: {
  title?: string
  description?: string
  icon?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl bg-gray-50 border border-dashed border-gray-200 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      <p className="text-xs text-gray-500 max-w-xs mt-1 mb-4">{description}</p>
      {action}
    </div>
  )
}

export function ErrorMessage({
  title = "Failed to load content",
  message,
  onRetry,
  className = "",
}: {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div
      className={`p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 ${className}`}
      role="alert"
    >
      <span className="material-symbols-outlined text-xl text-rose-600 shrink-0">
        error
      </span>
      <div className="flex-1">
        <h4 className="text-sm font-medium">{title}</h4>
        {message && <p className="text-xs text-rose-600 mt-0.5">{message}</p>}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-xs font-semibold underline text-rose-800 hover:text-rose-950 cursor-pointer"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}
