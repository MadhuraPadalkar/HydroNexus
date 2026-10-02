import { Card } from "@/components/Shared"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  Legend,
} from "recharts"

const complaintTrend = [
  { month: "Apr", new: 134, resolved: 118 },
  { month: "May", new: 158, resolved: 141 },
  { month: "Jun", new: 172, resolved: 155 },
  { month: "Jul", new: 149, resolved: 138 },
  { month: "Aug", new: 163, resolved: 152 },
  { month: "Sep", new: 124, resolved: 119 },
]

const supplyTrend = [
  { day: "Mon", supply: 4210 },
  { day: "Tue", supply: 4380 },
  { day: "Wed", supply: 4120 },
  { day: "Thu", supply: 4490 },
  { day: "Fri", supply: 4280 },
  { day: "Sat", supply: 4350 },
  { day: "Sun", supply: 4480 },
]

const wardSupply = [
  {
    ward: "Shivaji Peth",
    zone: "Central",
    scheduled: "06:00–09:00",
    actual: "06:00–09:10",
    pressure: 82,
    status: "On Time",
  },
  {
    ward: "Rajarampuri",
    zone: "North",
    scheduled: "07:00–10:00",
    actual: "07:12–10:05",
    pressure: 78,
    status: "Delayed",
  },
  {
    ward: "Kasba Bawada",
    zone: "East",
    scheduled: "17:00–20:00",
    actual: "—",
    pressure: 48,
    status: "Disrupted",
  },
  {
    ward: "Shahupuri",
    zone: "Central",
    scheduled: "06:00–09:00",
    actual: "06:00–09:00",
    pressure: 88,
    status: "On Time",
  },
  {
    ward: "Laxmipuri",
    zone: "South",
    scheduled: "05:30–08:30",
    actual: "05:30–08:35",
    pressure: 80,
    status: "On Time",
  },
  {
    ward: "Mangalwar Peth",
    zone: "Central",
    scheduled: "06:00–09:00",
    actual: "06:18–09:00",
    pressure: 54,
    status: "Delayed",
  },
  {
    ward: "Tarabai Park",
    zone: "North",
    scheduled: "06:00–10:00",
    actual: "06:00–10:00",
    pressure: 84,
    status: "On Time",
  },
  {
    ward: "Rankala",
    zone: "West",
    scheduled: "07:00–09:00",
    actual: "07:00–09:00",
    pressure: 86,
    status: "On Time",
  },
]

const alerts = [
  {
    id: "ALT-481",
    type: "Critical",
    icon: "leak_add",
    message: "Pipeline burst reported — Kasba Bawada Feeder Line",
    time: "09:14",
    color: "#ba1a1a",
    bg: "#fee2e2",
  },
  {
    id: "ALT-480",
    type: "Warning",
    icon: "water_drop",
    message: "Low pressure detected — Mangalwar Peth (54 m)",
    time: "08:52",
    color: "#d97706",
    bg: "#fef3c7",
  },
  {
    id: "ALT-479",
    type: "Warning",
    icon: "speed",
    message: "Flow deviation detected — Central Feeder Line #2",
    time: "07:30",
    color: "#0061a5",
    bg: "#e8f0fe",
  },
  {
    id: "ALT-478",
    type: "Info",
    icon: "schedule",
    message: "Maintenance MNT-091 started — Kasba Bawada",
    time: "06:00",
    color: "#0061a5",
    bg: "#e8f0fe",
  },
  {
    id: "ALT-477",
    type: "Info",
    icon: "check_circle",
    message: "Pump inspection complete — Subhash Nagar",
    time: "Yesterday",
    color: "#166534",
    bg: "#dcfce7",
  },
]

type StatusStyle = {
  text: string
  bg: string
}

const STATUS_COLOR: Record<string, StatusStyle> = {
  "On Time": { text: "#166534", bg: "#dcfce7" },
  Delayed: { text: "#92400e", bg: "#fef3c7" },
  Disrupted: { text: "#991b1b", bg: "#fee2e2" },
}

export default function Dashboard() {
  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Total Supply Today",
            value: "4,480 KL",
            trend: "+3.2%",
            up: true,
            icon: "water",
            sub: "Target: 4,500 KL",
          },
          {
            label: "Active Complaints",
            value: "28",
            trend: "-12%",
            up: false,
            icon: "report_problem",
            sub: "5 critical priority",
          },
          {
            label: "City NRW %",
            value: "22.4%",
            trend: "-4.4%",
            up: false,
            icon: "leak_add",
            sub: "Target: ≤ 15%",
          },
          {
            label: "Citizens Served",
            value: "2,24,000",
            trend: "+0.8%",
            up: true,
            icon: "people",
            sub: "17 wards covered",
          },
        ].map((k) => (
          <Card key={k.label} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#e8f0fe" }}
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={{ color: "#0061a5" }}
                >
                  {k.icon}
                </span>
              </div>
              <span
                className={`text-xs font-medium flex items-center gap-0.5 ${
                  k.up ? "text-green-600" : "text-red-600"
                }`}
              >
                <span className="material-symbols-outlined text-xs">
                  {k.up ? "trending_up" : "trending_down"}
                </span>
                {k.trend} vs last week
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-500 mt-0.5 font-medium">
              {k.label}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{k.sub}</div>
          </Card>
        ))}
      </div>

      {/* Row 2: supply chart + alerts */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold text-gray-900">
                Daily Supply This Week
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                Total KL distributed across all wards
              </div>
            </div>
            <div className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-50 text-green-700">
              Live
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={supplyTrend} margin={{ left: -10 }}>
              <defs>
                <linearGradient id="supGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0061a5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0061a5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[3800, 4600]} />
              <Tooltip
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [
                  `${Number(v).toLocaleString("en-IN")} KL`,
                  "Supply",
                ]}
              />
              <Area
                type="monotone"
                dataKey="supply"
                stroke="#0061a5"
                fill="url(#supGrad)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#0061a5" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4 flex flex-col">
          <div className="font-semibold text-gray-900 mb-3">Recent Alerts</div>
          <div className="flex-1 space-y-2">
            {alerts.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-2.5 p-2.5 rounded-xl"
                style={{ backgroundColor: a.bg }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${a.color}22` }}
                >
                  <span
                    className="material-symbols-outlined text-sm"
                    style={{ color: a.color }}
                  >
                    {a.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs font-medium leading-snug"
                    style={{ color: a.color }}
                  >
                    {a.message}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
            View all alerts{" "}
            <span className="material-symbols-outlined text-sm">
              chevron_right
            </span>
          </button>
        </Card>
      </div>

      {/* Row 3: ward table + complaint chart */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="font-semibold text-gray-900">
              Ward-wise Supply Status
            </div>
            <div className="flex items-center gap-1.5 text-xs text-green-700 font-medium bg-green-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
              Live — 11 Sep 2024
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  {[
                    "Ward",
                    "Zone",
                    "Scheduled",
                    "Actual Start",
                    "Pressure",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {wardSupply.map((w, i) => {
                  const sc = STATUS_COLOR[w.status]
                  return (
                    <tr
                      key={w.ward}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        i % 2 === 1 ? "bg-gray-50/30" : ""
                      }`}
                    >
                      <td className="px-4 py-2.5 font-medium text-gray-900">
                        {w.ward}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                          {w.zone}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 text-xs">
                        {w.scheduled}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 text-xs">
                        {w.actual}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full"
                              style={{
                                width: `${w.pressure}%`,
                                backgroundColor:
                                  w.pressure < 60
                                    ? "#ba1a1a"
                                    : w.pressure < 75
                                      ? "#d97706"
                                      : "#16a34a",
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">
                            {w.pressure}m
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: sc.bg, color: sc.text }}
                        >
                          {w.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-4">
          <div className="font-semibold text-gray-900 mb-1">
            Complaint Trend
          </div>
          <div className="text-xs text-gray-400 mb-4">
            New vs resolved (Apr–Sep)
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={complaintTrend} margin={{ left: -15 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey="new"
                fill="#66affe"
                radius={[3, 3, 0, 0]}
                name="New"
              />
              <Bar
                dataKey="resolved"
                fill="#0061a5"
                radius={[3, 3, 0, 0]}
                name="Resolved"
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 p-2.5 rounded-xl bg-green-50 text-xs text-green-800 font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">
              trending_down
            </span>
            Complaints down 28% vs June peak
          </div>
        </Card>
      </div>

      {/* Row 4: GIS preview + quick actions */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2 overflow-hidden" style={{ minHeight: 200 }}>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="font-semibold text-gray-900">
              GIS Network Preview
            </div>
            <button
              className="text-xs px-3 py-1 rounded-lg font-medium text-white"
              style={{ backgroundColor: "#0061a5" }}
            >
              Open Full Map
            </button>
          </div>
          <div className="relative bg-slate-100 h-48 overflow-hidden">
            {/* Stylised pseudo-map */}
            <svg className="w-full h-full" viewBox="0 0 600 200">
              <rect width="600" height="200" fill="#e8f0f8" />
              {/* Grid lines */}
              {[40, 80, 120, 160].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="600"
                  y2={y}
                  stroke="#c8d8e8"
                  strokeWidth="0.5"
                />
              ))}
              {[60, 120, 180, 240, 300, 360, 420, 480, 540].map((x) => (
                <line
                  key={x}
                  x1={x}
                  y1="0"
                  x2={x}
                  y2="200"
                  stroke="#c8d8e8"
                  strokeWidth="0.5"
                />
              ))}
              {/* Main pipelines */}
              <path
                d="M 60 100 L 150 60 L 280 80 L 420 60 L 540 90"
                stroke="#0061a5"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 150 60 L 160 140 L 300 150 L 420 130"
                stroke="#0061a5"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 280 80 L 290 160"
                stroke="#66affe"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M 420 60 L 410 140"
                stroke="#66affe"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M 60 100 L 70 160 L 170 165"
                stroke="#66affe"
                strokeWidth="2"
                fill="none"
              />
              {/* Burst pipe */}
              <path
                d="M 290 160 L 360 170"
                stroke="#ba1a1a"
                strokeWidth="3"
                strokeDasharray="6 3"
                fill="none"
              />
              {/* Nodes */}
              {[
                [60, 100, "#16a34a"],
                [150, 60, "#16a34a"],
                [280, 80, "#16a34a"],
                [420, 60, "#16a34a"],
                [540, 90, "#16a34a"],
                [160, 140, "#16a34a"],
                [300, 150, "#16a34a"],
                [420, 130, "#16a34a"],
                [290, 160, "#ba1a1a"],
                [360, 170, "#ba1a1a"],
              ].map(([x, y, c], i) => (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="6"
                  fill={c as string}
                  stroke="white"
                  strokeWidth="2"
                />
              ))}
              {/* Labels */}
              <text x="62" y="92" fontSize="8" fill="#374151">
                Rankala
              </text>
              <text x="152" y="52" fontSize="8" fill="#374151">
                Shahupuri
              </text>
              <text x="282" y="72" fontSize="8" fill="#374151">
                Shivaji Peth
              </text>
              <text x="422" y="52" fontSize="8" fill="#374151">
                Rajarampuri
              </text>
              <text
                x="292"
                y="178"
                fontSize="8"
                fill="#ba1a1a"
                fontWeight="bold"
              >
                ⚠ Burst
              </text>
            </svg>
            <div className="absolute bottom-2 left-2 flex gap-2 text-xs">
              <span className="flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Normal
              </span>
              <span className="flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                Alert
              </span>
              <span className="flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded">
                <span className="w-3 h-0.5 bg-blue-600 inline-block" />
                Main Line
              </span>
              <span className="flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded">
                <span
                  className="w-3 h-0.5 bg-red-500 inline-block"
                  style={{ borderTop: "2px dashed #ba1a1a", height: 0 }}
                />
                Burst
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="font-semibold text-gray-900 mb-3">Quick Actions</div>
          <div className="space-y-2">
            {[
              {
                label: "Create Outage Notice",
                icon: "warning",
                screen: "outage-management",
                color: "#991b1b",
                bg: "#fee2e2",
              },
              {
                label: "Send Notification",
                icon: "notifications",
                screen: "notification-composer",
                color: "#0061a5",
                bg: "#e8f0fe",
              },
              {
                label: "Schedule Maintenance",
                icon: "build",
                screen: "maintenance-schedule",
                color: "#166534",
                bg: "#dcfce7",
              },
              {
                label: "Approve Connections",
                icon: "plumbing",
                screen: "water-connections",
                color: "#5b21b6",
                bg: "#ede9fe",
              },
              {
                label: "View NRW Report",
                icon: "analytics",
                screen: "nrw-monitoring",
                color: "#92400e",
                bg: "#fef3c7",
              },
            ].map((a) => (
              <button
                key={a.label}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 hover:shadow-sm transition-all text-left bg-gray-50 hover:bg-white"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: a.bg }}
                >
                  <span
                    className="material-symbols-outlined text-base"
                    style={{ color: a.color }}
                  >
                    {a.icon}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {a.label}
                </span>
                <span className="material-symbols-outlined text-gray-400 text-base ml-auto">
                  chevron_right
                </span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
