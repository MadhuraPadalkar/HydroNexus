import { Card, PageHeader, OutlineButton, Badge } from "@/components/Shared"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

const trendData = [
  { month: "Oct'23", Central: 12, North: 8, South: 6, East: 18, West: 9 },
  { month: "Nov'23", Central: 14, North: 9, South: 7, East: 20, West: 10 },
  { month: "Dec'23", Central: 11, North: 7, South: 5, East: 17, West: 8 },
  { month: "Jan'24", Central: 13, North: 10, South: 8, East: 22, West: 11 },
  { month: "Feb'24", Central: 16, North: 8, South: 6, East: 24, West: 10 },
  { month: "Mar'24", Central: 18, North: 12, South: 9, East: 28, West: 13 },
  { month: "Apr'24", Central: 22, North: 14, South: 11, East: 32, West: 15 },
  { month: "May'24", Central: 24, North: 13, South: 10, East: 30, West: 14 },
  { month: "Jun'24", Central: 28, North: 16, South: 13, East: 35, West: 17 },
  { month: "Jul'24", Central: 32, North: 19, South: 15, East: 40, West: 20 },
  { month: "Aug'24", Central: 29, North: 17, South: 12, East: 38, West: 18 },
  { month: "Sep'24", Central: 26, North: 15, South: 11, East: 36, West: 16 },
]

const highRiskZones = [
  {
    zone: "East Kolhapur",
    wards: ["Kasba Bawada", "Bindu Chowk"],
    leaks: 36,
    nrw: 31.4,
    trend: "up",
    risk: "Critical",
    lastInspection: "08 Sep 2024",
  },
  {
    zone: "Central Kolhapur",
    wards: ["Mangalwar Peth", "New Shahupuri"],
    leaks: 26,
    nrw: 25.5,
    trend: "down",
    risk: "High",
    lastInspection: "10 Sep 2024",
  },
  {
    zone: "North Kolhapur",
    wards: ["Rajarampuri"],
    leaks: 15,
    nrw: 19.8,
    trend: "stable",
    risk: "Medium",
    lastInspection: "09 Sep 2024",
  },
  {
    zone: "West Kolhapur",
    wards: ["Shiroli", "Padmarajnagar"],
    leaks: 16,
    nrw: 19.9,
    trend: "down",
    risk: "Medium",
    lastInspection: "11 Sep 2024",
  },
]

const zoneColors: Record<string, string> = {
  Central: "#0061a5",
  North: "#16a34a",
  South: "#ca8a04",
  East: "#ba1a1a",
  West: "#7c3aed",
}

export default function LeakageAnalysis() {
  return (
    <div>
      <PageHeader
        title="Leakage Analysis"
        subtitle="Leak complaint frequency trend by zone — Oct 2023 to Sep 2024"
        actions={
          <>
            <OutlineButton icon="schedule">Schedule Inspection</OutlineButton>
            <OutlineButton icon="download">Export</OutlineButton>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Leaks (Sep)",
            value: "104",
            icon: "leak_add",
            color: "#991b1b",
            bg: "#fee2e2",
          },
          {
            label: "Resolved (Sep)",
            value: "79",
            icon: "check_circle",
            color: "#166534",
            bg: "#dcfce7",
          },
          {
            label: "Pending",
            value: "25",
            icon: "pending",
            color: "#92400e",
            bg: "#fef3c7",
          },
          {
            label: "High-risk Zones",
            value: "2",
            icon: "warning",
            color: "#991b1b",
            bg: "#fee2e2",
          },
        ].map((s) => (
          <Card key={s.label} className="p-4 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
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
            </div>
          </Card>
        ))}
      </div>

      {/* Trend chart */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold text-gray-900">
              Leak Complaint Frequency by Zone
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Monthly count of reported pipeline leaks per zone
            </div>
          </div>
          <div className="flex gap-3 text-xs">
            {Object.entries(zoneColors).map(([zone, color]) => (
              <span key={zone} className="flex items-center gap-1.5">
                <span
                  className="w-8 h-0.5 inline-block rounded"
                  style={{ backgroundColor: color }}
                />
                {zone}
              </span>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData} margin={{ left: -10, right: 10 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6"
            />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              label={{
                value: "Complaints",
                angle: -90,
                position: "insideLeft",
                offset: 10,
                style: { fontSize: 10, fill: "#9ca3af" },
              }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                fontSize: 12,
                border: "1px solid #e2e8f0",
              }}
            />
            <Line
              type="monotone"
              dataKey="Central"
              stroke={zoneColors.Central}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="North"
              stroke={zoneColors.North}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="South"
              stroke={zoneColors.South}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="East"
              stroke={zoneColors.East}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              strokeDasharray="0"
            />
            <Line
              type="monotone"
              dataKey="West"
              stroke={zoneColors.West}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* High-risk zones */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 text-lg">
              warning
            </span>
            <div className="font-semibold text-gray-900">High-Risk Zones</div>
          </div>
          <div className="divide-y divide-gray-50">
            {highRiskZones.map((z) => (
              <div
                key={z.zone}
                className="px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{z.zone}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Wards: {z.wards.join(", ")}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Last inspection: {z.lastInspection}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge status={z.risk} />
                    <div className="text-xs text-gray-500 mt-1">
                      {z.leaks} leaks/mo
                    </div>
                    <div
                      className="text-xs font-medium mt-0.5"
                      style={{ color: z.nrw >= 30 ? "#ba1a1a" : "#d97706" }}
                    >
                      NRW: {z.nrw}%
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <div className="flex items-center gap-1 text-xs">
                    <span
                      className="material-symbols-outlined text-sm"
                      style={{
                        color:
                          z.trend === "up"
                            ? "#ba1a1a"
                            : z.trend === "down"
                              ? "#16a34a"
                              : "#9ca3af",
                      }}
                    >
                      {z.trend === "up"
                        ? "trending_up"
                        : z.trend === "down"
                          ? "trending_down"
                          : "trending_flat"}
                    </span>
                    <span
                      className={
                        z.trend === "up"
                          ? "text-red-600"
                          : z.trend === "down"
                            ? "text-green-600"
                            : "text-gray-400"
                      }
                    >
                      {z.trend === "up"
                        ? "Worsening"
                        : z.trend === "down"
                          ? "Improving"
                          : "Stable"}
                    </span>
                  </div>
                  <button className="ml-auto text-xs px-2 py-0.5 rounded border border-blue-200 text-blue-700 hover:bg-blue-50">
                    Schedule Audit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-900">
            Recommended Actions
          </div>
          <div className="p-4 space-y-3">
            {[
              {
                icon: "plumbing",
                title: "Emergency pipe replacement in East Kolhapur",
                due: "Within 48 hrs",
                priority: "Critical",
              },
              {
                icon: "search",
                title: "Pressure zone audit — Kasba Bawada DMA",
                due: "15 Sep 2024",
                priority: "High",
              },
              {
                icon: "analytics",
                title: "Deploy acoustic leak detectors — Mangalwar Peth",
                due: "20 Sep 2024",
                priority: "Medium",
              },
              {
                icon: "build",
                title: "Night flow measurement — Central zone",
                due: "18 Sep 2024",
                priority: "Medium",
              },
              {
                icon: "water_meter",
                title: "Bulk meter calibration — 3 DMA points",
                due: "25 Sep 2024",
                priority: "Low",
              },
            ].map((r, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-sm shrink-0">
                  <span
                    className="material-symbols-outlined text-base"
                    style={{ color: "#0061a5" }}
                  >
                    {r.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800">
                    {r.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Due: {r.due}
                  </div>
                </div>
                <Badge status={r.priority} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
