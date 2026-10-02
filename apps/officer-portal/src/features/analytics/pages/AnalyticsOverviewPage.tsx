import { useState } from "react"
import { Card, PageHeader, OutlineButton } from "@/components/Shared"
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
  Legend,
  AreaChart,
  Area,
} from "recharts"

const supplyData = [
  { month: "Apr", supply: 4210, target: 4500 },
  { month: "May", supply: 4380, target: 4500 },
  { month: "Jun", supply: 4120, target: 4500 },
  { month: "Jul", supply: 3980, target: 4500 },
  { month: "Aug", supply: 4290, target: 4500 },
  { month: "Sep", supply: 4480, target: 4500 },
]

const complaintData = [
  { category: "Leakage", count: 241, resolved: 198 },
  { category: "Low Pressure", count: 189, resolved: 164 },
  { category: "No Supply", count: 156, resolved: 142 },
  { category: "Quality", count: 98, resolved: 92 },
  { category: "Billing", count: 74, resolved: 68 },
  { category: "Other", count: 42, resolved: 38 },
]

const nrwTrend = [
  { month: "Apr", nrw: 26.8 },
  { month: "May", nrw: 25.4 },
  { month: "Jun", nrw: 24.9 },
  { month: "Jul", nrw: 23.8 },
  { month: "Aug", nrw: 23.1 },
  { month: "Sep", nrw: 22.4 },
]

const consumptionData = [
  { month: "Apr", residential: 2840, commercial: 820, industrial: 340 },
  { month: "May", residential: 2960, commercial: 870, industrial: 360 },
  { month: "Jun", residential: 2780, commercial: 810, industrial: 320 },
  { month: "Jul", residential: 2690, commercial: 780, industrial: 310 },
  { month: "Aug", residential: 2880, commercial: 840, industrial: 350 },
  { month: "Sep", residential: 3020, commercial: 910, industrial: 380 },
]

const wardComparison = [
  { ward: "Shivaji Peth", score: 88 },
  { ward: "Rajarampuri", score: 91 },
  { ward: "Kasba Bawada", score: 52 },
  { ward: "Shahupuri", score: 94 },
  { ward: "Laxmipuri", score: 89 },
  { ward: "Mangalwar Peth", score: 58 },
  { ward: "Tarabai Park", score: 92 },
]

const DATE_RANGES = [
  "Last 7 days",
  "Last 30 days",
  "Last 6 months",
  "Last 1 year",
  "Custom",
]

export default function AnalyticsOverview() {
  const [dateRange, setDateRange] = useState("Last 6 months")

  return (
    <div>
      <PageHeader
        title="Analytics Overview"
        subtitle="Water supply, complaint, NRW, and consumption analytics — KMC"
        actions={
          <>
            <OutlineButton icon="download">Export Report</OutlineButton>
            <OutlineButton icon="print">Print</OutlineButton>
          </>
        }
      />

      {/* Date range */}
      <Card className="p-3 mb-6 flex items-center gap-3">
        <span className="material-symbols-outlined text-gray-500 text-lg">
          date_range
        </span>
        <span className="text-sm font-medium text-gray-700">Date Range:</span>
        <div className="flex gap-1">
          {DATE_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={
                dateRange === r
                  ? { backgroundColor: "#002045", color: "#fff" }
                  : { backgroundColor: "#f3f4f6", color: "#374151" }
              }
            >
              {r}
            </button>
          ))}
        </div>
        <div className="ml-auto text-xs text-gray-400">
          Data updated: 11 Sep 2024, 06:00 IST
        </div>
      </Card>

      {/* KPI row */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          {
            label: "Avg Daily Supply",
            value: "4,410 KL",
            trend: "+3.2%",
            up: true,
            icon: "water",
          },
          {
            label: "Total Complaints",
            value: "800",
            trend: "-8.4%",
            up: false,
            icon: "report_problem",
          },
          {
            label: "Resolution Rate",
            value: "92.8%",
            trend: "+1.2%",
            up: true,
            icon: "task_alt",
          },
          {
            label: "City NRW %",
            value: "22.4%",
            trend: "-4.4%",
            up: false,
            icon: "leak_add",
          },
          {
            label: "Total Consumption",
            value: "14,140 KL",
            trend: "+4.1%",
            up: true,
            icon: "analytics",
          },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#e8f0fe" }}
              >
                <span
                  className="material-symbols-outlined text-base"
                  style={{ color: "#0061a5" }}
                >
                  {s.icon}
                </span>
              </div>
              <span
                className={`text-xs font-medium flex items-center gap-0.5 ${
                  s.up ? "text-green-600" : "text-red-600"
                }`}
              >
                <span className="material-symbols-outlined text-xs">
                  {s.up ? "trending_up" : "trending_down"}
                </span>
                {s.trend}
              </span>
            </div>
            <div className="text-lg font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card className="p-4">
          <div className="font-semibold text-gray-900 mb-1">
            Water Supply Analytics
          </div>
          <div className="text-xs text-gray-400 mb-4">
            Daily average supply vs. target (KL/day)
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={supplyData} margin={{ left: -10 }}>
              <defs>
                <linearGradient id="supplyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0061a5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0061a5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[3500, 5000]} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="supply"
                stroke="#0061a5"
                fill="url(#supplyGrad)"
                strokeWidth={2}
                name="Supply"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#ba1a1a"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                name="Target"
                dot={false}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <div className="font-semibold text-gray-900 mb-1">
            Complaint Analytics
          </div>
          <div className="text-xs text-gray-400 mb-4">
            Complaints by category — received vs. resolved
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={complaintData}
              layout="vertical"
              margin={{ left: 20, right: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#f3f4f6"
              />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                dataKey="category"
                type="category"
                tick={{ fontSize: 11 }}
                width={80}
              />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="count"
                fill="#66affe"
                radius={[0, 3, 3, 0]}
                name="Received"
              />
              <Bar
                dataKey="resolved"
                fill="#0061a5"
                radius={[0, 3, 3, 0]}
                name="Resolved"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="p-4">
          <div className="font-semibold text-gray-900 mb-1">NRW Trend</div>
          <div className="text-xs text-gray-400 mb-4">
            City-wide NRW % over time
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={nrwTrend} margin={{ left: -10 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                domain={[18, 30]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(v) => [`${v}%`, "NRW"]}
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="nrw"
                stroke="#ba1a1a"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#ba1a1a" }}
              />
              <Line
                type="monotone"
                dataKey={() => 15}
                stroke="#16a34a"
                strokeDasharray="4 4"
                strokeWidth={1}
                dot={false}
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="text-xs text-green-700 font-medium flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-sm">
              trending_down
            </span>
            Improving — down 4.4% since April
          </div>
        </Card>

        <Card className="p-4">
          <div className="font-semibold text-gray-900 mb-1">
            Consumption Analytics
          </div>
          <div className="text-xs text-gray-400 mb-4">By sector (KL/month)</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={consumptionData} margin={{ left: -10 }}>
              <defs>
                {[
                  ["res", "#0061a5"],
                  ["com", "#66affe"],
                  ["ind", "#002045"],
                ].map(([id, color]) => (
                  <linearGradient
                    key={id}
                    id={`grad-${id}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="residential"
                stroke="#0061a5"
                fill="url(#grad-res)"
                strokeWidth={1.5}
                name="Residential"
              />
              <Area
                type="monotone"
                dataKey="commercial"
                stroke="#66affe"
                fill="url(#grad-com)"
                strokeWidth={1.5}
                name="Commercial"
              />
              <Area
                type="monotone"
                dataKey="industrial"
                stroke="#002045"
                fill="url(#grad-ind)"
                strokeWidth={1.5}
                name="Industrial"
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <div className="font-semibold text-gray-900 mb-1">
            Ward Performance Score
          </div>
          <div className="text-xs text-gray-400 mb-4">
            Composite score (0–100)
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={wardComparison}
              layout="vertical"
              margin={{ left: 20, right: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#f3f4f6"
              />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
              <YAxis
                dataKey="ward"
                type="category"
                tick={{ fontSize: 10 }}
                width={80}
              />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]} name="Score">
                {wardComparison.map((entry, i) => (
                  <rect
                    key={i}
                    fill={
                      entry.score >= 80
                        ? "#16a34a"
                        : entry.score >= 65
                          ? "#ca8a04"
                          : "#ba1a1a"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-3 text-xs mt-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-green-600 inline-block" />
              Good (≥80)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-yellow-500 inline-block" />
              Fair
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-red-600 inline-block" />
              Poor
            </span>
          </div>
        </Card>
      </div>
    </div>
  )
}
