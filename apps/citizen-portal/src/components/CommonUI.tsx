import React from "react"
import { useLanguage } from "@/i18n/LanguageContext"
import { localizeStatus } from "@/i18n/translations"

// Icon Component
export function Icon({
  name,
  size = 24,
  filled = false,
  className = "",
  style,
}: {
  name: string
  size?: number
  filled?: boolean
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <span
      className={`material-symbols-outlined ${
        filled ? "material-symbols-filled" : ""
      } ${className}`}
      style={{ fontSize: size, ...style }}
    >
      {name}
    </span>
  )
}

// Status Badge
export function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage()
  const cls =
    status === "Open"
      ? "status-open"
      : status === "In Progress"
        ? "status-inprogress"
        : "status-resolved"
  return (
    <span className={`${cls} text-xs font-semibold px-3 py-1 rounded-full`}>
      {localizeStatus(status, t)}
    </span>
  )
}

// Alert Card
export function AlertCard({
  alert,
}: {
  alert: {
    id: number | string
    severity: string
    icon: string
    title: string
    body: string
    time: string
  }
}) {
  const cls =
    alert.severity === "critical"
      ? "alert-critical"
      : alert.severity === "warning"
        ? "alert-warning"
        : alert.severity === "success"
          ? "alert-success"
          : "alert-info"
  const iconColor =
    alert.severity === "critical"
      ? "text-[#ba1a1a]"
      : alert.severity === "warning"
        ? "text-[#7c5800]"
        : alert.severity === "success"
          ? "text-[#1a6936]"
          : "text-[#0061a5]"

  return (
    <div className={`${cls} rounded-2xl p-4 mb-3`}>
      <div className="flex gap-3">
        <Icon
          name={alert.icon}
          size={22}
          className={`${iconColor} mt-0.5 flex-shrink-0`}
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[#1a1d24] text-sm mb-1">
            {alert.title}
          </div>
          <div className="text-xs text-[#4a5060] leading-relaxed mb-2">
            {alert.body}
          </div>
          <div className="text-xs text-[#8a909c]">{alert.time}</div>
        </div>
      </div>
    </div>
  )
}

// Screen Header
export function ScreenHeader({
  title,
  onBack,
  action,
  onMenu,
}: {
  title: string
  onBack?: () => void
  action?: React.ReactNode
  onMenu?: () => void
}) {
  return (
    <header className="flex items-center gap-3 px-4 pt-4 pb-3 bg-white sticky top-0 z-10 border-b border-gray-100">
      {onMenu && !onBack && (
        <button
          onClick={onMenu}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          style={{ background: "none", border: "none", cursor: "pointer" }}
          aria-label="Open Navigation Menu"
        >
          <Icon name="menu" size={24} className="text-[#002045]" />
        </button>
      )}
      {onBack && (
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          style={{ background: "none", border: "none", cursor: "pointer" }}
          aria-label="Go Back"
        >
          <Icon name="arrow_back" size={22} className="text-[#002045]" />
        </button>
      )}
      <h1 className="flex-1 text-lg font-bold text-[#002045]">{title}</h1>
      {action}
    </header>
  )
}
