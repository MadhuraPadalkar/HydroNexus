import { Card, PageHeader, OutlineButton, Badge } from "@/components/Shared"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from "recharts"

const riverLevelData = [
  { time: "00:00", level: 3.2 },
  { time: "02:00", level: 3.4 },
  { time: "04:00", level: 3.6 },
  { time: "06:00", level: 3.8 },
  { time: "08:00", level: 3.9 },
  { time: "10:00", level: 4.1 },
  { time: "12:00", level: 4.3 },
  { time: "14:00", level: 4.2 },
  { time: "16:00", level: 4.1 },
  { time: "18:00", level: 3.9 },
  { time: "20:00", level: 3.8 },
  { time: "22:00", level: 3.7 },
]

const rainfallData = [
  { day: "Mon", rainfall: 12.4, forecast: 8 },
  { day: "Tue", rainfall: 34.8, forecast: 20 },
  { day: "Wed", rainfall: 18.2, forecast: 25 },
  { day: "Thu", rainfall: 42.6, forecast: 30 },
  { day: "Fri", rainfall: 28.1, forecast: 40 },
  { day: "Sat", rainfall: 0, forecast: 55 },
  { day: "Sun", rainfall: 0, forecast: 35 },
]

const gaugeStations = [
  {
    id: "GS-01",
    name: "Panchganga @ Rajwada",
    level: 4.1,
    change: "+0.3m",
    status: "Moderate",
    maxSafe: 5.5,
    danger: 6.0,
  },
  {
    id: "GS-02",
    name: "Panchganga @ Jaysingpur Bridge",
    level: 3.8,
    change: "+0.2m",
    status: "Watch",
    maxSafe: 5.0,
    danger: 5.5,
  },
  {
    id: "GS-03",
    name: "Kasari River @ Shivaji Bridge",
    level: 2.4,
    change: "+0.1m",
    status: "Normal",
    maxSafe: 4.0,
    danger: 4.8,
  },
  {
    id: "GS-04",
    name: "Bhogawati @ Nrusinhwadi",
    level: 2.9,
    change: "+0.4m",
    status: "Watch",
    maxSafe: 4.2,
    danger: 5.0,
  },
]

const riskWards = [
  {
    ward: "Rankala",
    risk: "High",
    population: 16900,
    lowLying: true,
    evacuation: "Standby",
    shelter: "Shivaji Vidyalaya",
  },
  {
    ward: "Shivaji Peth",
    risk: "Medium",
    population: 18420,
    lowLying: true,
    evacuation: "Not Required",
    shelter: "Town Hall",
  },
  {
    ward: "Kasba Bawada",
    risk: "Medium",
    population: 14800,
    lowLying: false,
    evacuation: "Not Required",
    shelter: "—",
  },
  {
    ward: "Laxmipuri",
    risk: "Low",
    population: 17200,
    lowLying: false,
    evacuation: "Not Required",
    shelter: "—",
  },
  {
    ward: "Mangalwar Peth",
    risk: "High",
    population: 13400,
    lowLying: true,
    evacuation: "Standby",
    shelter: "KMC Hall Mangalwar Peth",
  },
]

type RiskColor = {
  bg: string
  text: string
  border: string
}

const RISK_COLORS: Record<string, RiskColor> = {
  High: { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
  Medium: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  Low: { bg: "#dcfce7", text: "#166534", border: "#86efac" },
  Normal: { bg: "#dcfce7", text: "#166534", border: "#86efac" },
  Watch: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  Moderate: { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
}

export default function FloodMonitoring() {
  const currentLevel = 4.1
  const minorThreshold = 3.5
  const moderateThreshold = 4.0
  const majorThreshold = 5.5

  const getRiskLevel = (level: number) => {
    if (level >= majorThreshold)
      return { label: "Major Flood", color: "#ba1a1a", bg: "#fee2e2" }
    if (level >= moderateThreshold)
      return { label: "Moderate Watch", color: "#d97706", bg: "#fef3c7" }
    if (level >= minorThreshold)
      return { label: "Minor Watch", color: "#ca8a04", bg: "#fef9c3" }
    return { label: "Normal", color: "#16a34a", bg: "#dcfce7" }
  }

  const risk = getRiskLevel(currentLevel)

  return (
    <div>
      <PageHeader
        title="Flood & Rainfall Monitoring"
        subtitle="Panchganga River — real-time level and rainfall data — 11 Sep 2024"
        actions={
          <>
            <OutlineButton icon="notifications">Send Flood Alert</OutlineButton>
            <OutlineButton icon="download">Download Report</OutlineButton>
          </>
        }
      />

      {/* Alert banner */}
      <div
        className="mb-5 p-4 rounded-2xl flex items-center gap-4"
        style={{
          backgroundColor: risk.bg,
          border: `1px solid ${risk.color}40`,
        }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${risk.color}22` }}
        >
          <span
            className="material-symbols-outlined text-2xl"
            style={{ color: risk.color }}
          >
            flood
          </span>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-lg" style={{ color: risk.color }}>
            {risk.label} Active
          </div>
          <div className="text-sm" style={{ color: risk.color }}>
            Panchganga River at Rajwada: <strong>{currentLevel}m</strong> —
            Moderate threshold ({moderateThreshold}m) exceeded. Monitoring
            continuously.
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs" style={{ color: risk.color }}>
            Next forecast update
          </div>
          <div className="font-semibold" style={{ color: risk.color }}>
            18:00 IST
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          {
            label: "River Level (Rajwada)",
            value: "4.1 m",
            sub: "Moderate threshold: 4.0m",
            icon: "water",
            color: "#d97706",
            bg: "#fef3c7",
          },
          {
            label: "Today's Rainfall",
            value: "42.6 mm",
            sub: "Above normal for Sep",
            icon: "rainy",
            color: "#0061a5",
            bg: "#e8f0fe",
          },
          {
            label: "High-Risk Wards",
            value: "2",
            sub: "Rankala, Mangalwar Peth",
            icon: "warning",
            color: "#991b1b",
            bg: "#fee2e2",
          },
          {
            label: "Reservoir Level",
            value: "78%",
            sub: "Rajaram Reservoir",
            icon: "water_full",
            color: "#166534",
            bg: "#dcfce7",
          },
        ].map((s) => (
          <Card key={s.label} className="p-4 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: s.bg }}
            >
              <span
                className="material-symbols-outlined text-xl"
                style={{ color: s.color }}
              >
                {s.icon}
              </span>
            </div>
            <div>
              <div className="text-xs text-gray-500">{s.label}</div>
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        <Card className="p-4">
          <div className="font-semibold text-gray-900 mb-1">
            River Level — Panchganga @ Rajwada
          </div>
          <div className="text-xs text-gray-400 mb-4">
            Hourly readings today (11 Sep 2024)
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={riverLevelData} margin={{ left: -10 }}>
              <defs>
                <linearGradient id="riverGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0061a5" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0061a5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                domain={[2.5, 6]}
                tickFormatter={(v) => `${v}m`}
              />
              <Tooltip
                formatter={(v) => [`${v}m`, "Level"]}
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
              />
              <ReferenceLine
                y={minorThreshold}
                stroke="#ca8a04"
                strokeDasharray="4 3"
                label={{
                  value: "Minor",
                  position: "right",
                  fontSize: 9,
                  fill: "#ca8a04",
                }}
              />
              <ReferenceLine
                y={moderateThreshold}
                stroke="#d97706"
                strokeDasharray="4 3"
                label={{
                  value: "Moderate",
                  position: "right",
                  fontSize: 9,
                  fill: "#d97706",
                }}
              />
              <ReferenceLine
                y={majorThreshold}
                stroke="#ba1a1a"
                strokeDasharray="4 3"
                label={{
                  value: "Major",
                  position: "right",
                  fontSize: 9,
                  fill: "#ba1a1a",
                }}
              />
              <Area
                type="monotone"
                dataKey="level"
                stroke="#0061a5"
                fill="url(#riverGrad)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#0061a5" }}
                name="Level (m)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <div className="font-semibold text-gray-900 mb-1">
            Rainfall — Actual & 5-day Forecast
          </div>
          <div className="text-xs text-gray-400 mb-4">
            mm/day — Kolhapur district
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={rainfallData} margin={{ left: -10 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}mm`} />
              <Tooltip
                formatter={(v) => [`${v}mm`, ""]}
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey="rainfall"
                fill="#0061a5"
                radius={[3, 3, 0, 0]}
                name="Actual"
              />
              <Bar
                dataKey="forecast"
                fill="#66affe"
                radius={[3, 3, 0, 0]}
                name="Forecast"
                opacity={0.7}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Gauge stations + risk wards */}
      <div className="grid grid-cols-2 gap-5">
        <Card>
          <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-900">
            Gauge Stations
          </div>
          <div className="divide-y divide-gray-50">
            {gaugeStations.map((gs) => {
              const rc = RISK_COLORS[gs.status]
              const pct = Math.min((gs.level / gs.danger) * 100, 100)
              return (
                <div key={gs.id} className="px-4 py-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {gs.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {gs.id}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="text-lg font-bold"
                        style={{ color: rc.text }}
                      >
                        {gs.level}m
                      </div>
                      <div
                        className="text-xs font-medium"
                        style={{ color: rc.text }}
                      >
                        {gs.change} from 00:00
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: rc.text }}
                      />
                      <div
                        className="absolute top-0 h-2 w-0.5 bg-orange-400"
                        style={{ left: `${(gs.maxSafe / gs.danger) * 100}%` }}
                      />
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: rc.bg, color: rc.text }}
                    >
                      {gs.status}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-gray-400">
                    <span>Safe: ≤{gs.maxSafe}m</span>
                    <span>Danger: {gs.danger}m</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="font-semibold text-gray-900">
              Ward Risk Assessment
            </div>
            <span className="text-xs text-gray-400">Updated 12:00 IST</span>
          </div>
          <div className="divide-y divide-gray-50">
            {riskWards.map((w) => {
              const rc = RISK_COLORS[w.risk]
              return (
                <div key={w.ward} className="px-4 py-3 flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: rc.bg }}
                  >
                    <span
                      className="material-symbols-outlined text-base"
                      style={{ color: rc.text }}
                    >
                      {w.risk === "High"
                        ? "warning"
                        : w.risk === "Medium"
                          ? "info"
                          : "check_circle"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-900 text-sm">
                        {w.ward}
                      </div>
                      {w.lowLying && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                          Low-lying
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {w.population.toLocaleString("en-IN")} residents
                      {w.shelter !== "—" && ` · Shelter: ${w.shelter}`}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: rc.bg, color: rc.text }}
                    >
                      {w.risk}
                    </span>
                    <div className="text-xs text-gray-400 mt-1">
                      {w.evacuation}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="px-4 py-3 border-t border-gray-100">
            <button
              className="w-full py-2 rounded-xl text-sm font-medium text-white"
              style={{ backgroundColor: "#ba1a1a" }}
            >
              <span className="material-symbols-outlined text-base mr-1 align-middle">
                notifications
              </span>
              Send Flood Warning to High-Risk Wards
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
