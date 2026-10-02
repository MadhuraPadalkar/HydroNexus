import React from "react"

export function Card({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

export function PrimaryButton({
  children,
  onClick,
  icon,
}: {
  children: React.ReactNode
  onClick?: () => void
  icon?: string
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 shadow-sm"
      style={{ backgroundColor: "#0061a5" }}
    >
      {icon && (
        <span className="material-symbols-outlined text-base">{icon}</span>
      )}
      {children}
    </button>
  )
}

export function OutlineButton({
  children,
  onClick,
  icon,
}: {
  children: React.ReactNode
  onClick?: () => void
  icon?: string
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all hover:bg-gray-50"
      style={{ borderColor: "#0061a5", color: "#0061a5" }}
    >
      {icon && (
        <span className="material-symbols-outlined text-base">{icon}</span>
      )}
      {children}
    </button>
  )
}

type ColorStyle = {
  bg: string
  text: string
}

const statusColors: Record<string, ColorStyle> = {
  Active: { bg: "#dcfce7", text: "#166534" },
  active: { bg: "#dcfce7", text: "#166534" },
  Completed: { bg: "#dcfce7", text: "#166534" },
  completed: { bg: "#dcfce7", text: "#166534" },
  Delivered: { bg: "#dcfce7", text: "#166534" },
  Approved: { bg: "#dbeafe", text: "#1e40af" },
  approved: { bg: "#dbeafe", text: "#1e40af" },
  Scheduled: { bg: "#dbeafe", text: "#1e40af" },
  Dispatched: { bg: "#e0e7ff", text: "#3730a3" },
  "In Progress": { bg: "#fef9c3", text: "#854d0e" },
  in_progress: { bg: "#fef9c3", text: "#854d0e" },
  Pending: { bg: "#fef3c7", text: "#92400e" },
  pending: { bg: "#fef3c7", text: "#92400e" },
  Requested: { bg: "#fef3c7", text: "#92400e" },
  Inactive: { bg: "#f3f4f6", text: "#374151" },
  inactive: { bg: "#f3f4f6", text: "#374151" },
  Resolved: { bg: "#dcfce7", text: "#166534" },
  Critical: { bg: "#fee2e2", text: "#991b1b" },
  critical: { bg: "#fee2e2", text: "#991b1b" },
  High: { bg: "#fee2e2", text: "#991b1b" },
  Medium: { bg: "#fef3c7", text: "#92400e" },
  Low: { bg: "#dcfce7", text: "#166534" },
  Admin: { bg: "#ede9fe", text: "#5b21b6" },
  Engineer: { bg: "#dbeafe", text: "#1e40af" },
  Supervisor: { bg: "#dcfce7", text: "#166534" },
  Operator: { bg: "#f3f4f6", text: "#374151" },
  Supply: { bg: "#dbeafe", text: "#1e40af" },
  Shortage: { bg: "#fee2e2", text: "#991b1b" },
  Flood: { bg: "#e0e7ff", text: "#3730a3" },
  General: { bg: "#f3f4f6", text: "#374151" },
}

export function Badge({ status }: { status: string }) {
  const color = statusColors[status] ?? { bg: "#f3f4f6", text: "#374151" }
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {status}
    </span>
  )
}

export function StatCard({
  label,
  value,
  unit,
  icon,
  trend,
  trendUp,
}: {
  label: string
  value: string
  unit?: string
  icon: string
  trend?: string
  trendUp?: boolean
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {label}
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
          </div>
          {trend && (
            <div
              className={`mt-1 flex items-center gap-1 text-xs font-medium ${
                trendUp ? "text-green-600" : "text-red-600"
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {trendUp ? "trending_up" : "trending_down"}
              </span>
              {trend}
            </div>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "#e8f0fe" }}
        >
          <span
            className="material-symbols-outlined text-xl"
            style={{ color: "#0061a5" }}
          >
            {icon}
          </span>
        </div>
      </div>
    </Card>
  )
}

export function TableHead({ cols }: { cols: string[] }) {
  return (
    <thead>
      <tr className="border-b border-gray-100">
        {cols.map((col) => (
          <th
            key={col}
            className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
          >
            {col}
          </th>
        ))}
      </tr>
    </thead>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-lg",
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: string
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`relative bg-white rounded-2xl shadow-xl w-full mx-4 ${width} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-gray-500 text-lg">
              close
            </span>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export function FormField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  )
}

export function Input({
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  placeholder?: string
  value?: string
  onChange?: (v: string) => void
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
      style={{ "--tw-ring-color": "#0061a5" } as React.CSSProperties}
    />
  )
}

export function Select({
  options,
  value,
  onChange,
}: {
  options: string[]
  value?: string
  onChange?: (v: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white"
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  )
}

export const WARDS = [
  "Shivaji Peth",
  "Rajarampuri",
  "Kasba Bawada",
  "Shahupuri",
  "Laxmipuri",
  "Mangalwar Peth",
  "Tarabai Park",
  "Rankala",
  "New Shahupuri",
  "Bindu Chowk",
  "Subhash Nagar",
  "Padmarajnagar",
  "Sangamwadi",
  "Shahu Mill Area",
  "Rajendra Nagar",
  "Karpewadi",
  "Shiroli",
]
