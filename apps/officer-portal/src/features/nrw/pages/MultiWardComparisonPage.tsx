import { useState } from "react"
import { Card, PageHeader, OutlineButton, WARDS } from "@/components/Shared"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from "recharts"

const wardData: Record<string, {
  nrw: number
  complaints: number
  resolution: number
  supply: number
  pressure: number
  coverage: number
}> = {
  "Shivaji Peth": {
    nrw: 18.6,
    complaints: 24,
    resolution: 2.1,
    supply: 96,
    pressure: 78,
    coverage: 98,
  },
  Rajarampuri: {
    nrw: 16.9,
    complaints: 18,
    resolution: 1.8,
    supply: 98,
    pressure: 82,
    coverage: 99,
  },
  "Kasba Bawada": {
    nrw: 38.4,
    complaints: 68,
    resolution: 4.8,
    supply: 74,
    pressure: 48,
    coverage: 82,
  },
  Shahupuri: {
    nrw: 15.4,
    complaints: 15,
    resolution: 1.5,
    supply: 99,
    pressure: 85,
    coverage: 100,
  },
  Laxmipuri: {
    nrw: 13.8,
    complaints: 12,
    resolution: 1.4,
    supply: 97,
    pressure: 80,
    coverage: 98,
  },
  "Mangalwar Peth": {
    nrw: 34.2,
    complaints: 52,
    resolution: 4.2,
    supply: 79,
    pressure: 54,
    coverage: 85,
  },
  "Tarabai Park": {
    nrw: 14.2,
    complaints: 14,
    resolution: 1.6,
    supply: 98,
    pressure: 83,
    coverage: 99,
  },
  Rankala: {
    nrw: 13.1,
    complaints: 10,
    resolution: 1.3,
    supply: 99,
    pressure: 86,
    coverage: 100,
  },
  "New Shahupuri": {
    nrw: 24.5,
    complaints: 36,
    resolution: 3.1,
    supply: 88,
    pressure: 64,
    coverage: 91,
  },
  "Bindu Chowk": {
    nrw: 29.1,
    complaints: 44,
    resolution: 3.8,
    supply: 82,
    pressure: 58,
    coverage: 87,
  },
  "Subhash Nagar": {
    nrw: 26.7,
    complaints: 40,
    resolution: 3.4,
    supply: 85,
    pressure: 61,
    coverage: 89,
  },
  Padmarajnagar: {
    nrw: 12.4,
    complaints: 9,
    resolution: 1.2,
    supply: 99,
    pressure: 87,
    coverage: 100,
  },
}

const COLORS = ["#0061a5", "#16a34a", "#d97706", "#7c3aed"]
const allWards = Object.keys(wardData)

export default function MultiWardComparison() {
  const [selected, setSelected] = useState<string[]>([
    "Shivaji Peth",
    "Kasba Bawada",
    "Rajarampuri",
    "Mangalwar Peth",
  ])
  const [metric, setMetric] = useState<"nrw" | "complaints" | "resolution">(
    "nrw",
  )

  const toggleWard = (ward: string) => {
    if (selected.includes(ward)) {
      if (selected.length > 2) setSelected(selected.filter((w) => w !== ward))
    } else {
      if (selected.length < 4) setSelected([...selected, ward])
    }
  }

  const barData = selected.map((ward, i) => ({
    ward: ward.replace(" Peth", "").replace(" Nagar", ""),
    NRW: wardData[ward]?.nrw ?? 0,
    Complaints: wardData[ward]?.complaints ?? 0,
    Resolution: wardData[ward]?.resolution ?? 0,
    color: COLORS[i % COLORS.length],
  }))

  const radarData = [
    {
      metric: "Supply %",
      ...Object.fromEntries(
        selected.map((w) => [w.split(" ")[0], wardData[w]?.supply ?? 0]),
      ),
    },
    {
      metric: "Pressure",
      ...Object.fromEntries(
        selected.map((w) => [w.split(" ")[0], wardData[w]?.pressure ?? 0]),
      ),
    },
    {
      metric: "Coverage",
      ...Object.fromEntries(
        selected.map((w) => [w.split(" ")[0], wardData[w]?.coverage ?? 0]),
      ),
    },
    {
      metric: "NRW (inv)",
      ...Object.fromEntries(
        selected.map((w) => [w.split(" ")[0], 100 - (wardData[w]?.nrw ?? 0)]),
      ),
    },
    {
      metric: "Resolution",
      ...Object.fromEntries(
        selected.map((w) => [
          w.split(" ")[0],
          Math.max(0, 10 - (wardData[w]?.resolution ?? 0)) * 10,
        ]),
      ),
    },
  ]

  const metricLabels = {
    nrw: "NRW %",
    complaints: "Complaint Volume",
    resolution: "Avg Resolution (days)",
  }

  return (
    <div>
      <PageHeader
        title="Multi-Ward Comparison"
        subtitle="Compare NRW%, complaint volume, and resolution time across wards"
        actions={
          <OutlineButton icon="download">Export Comparison</OutlineButton>
        }
      />

      {/* Ward selector */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-gray-700">
            Select Wards (2–4)
          </div>
          <div className="text-xs text-gray-400">
            {selected.length}/4 selected
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {allWards.map((ward, i) => {
            const idx = selected.indexOf(ward)
            const isSelected = idx !== -1
            return (
              <button
                key={ward}
                onClick={() => toggleWard(ward)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                style={
                  isSelected
                    ? {
                        backgroundColor: COLORS[idx % COLORS.length],
                        color: "#fff",
                        borderColor: COLORS[idx % COLORS.length],
                      }
                    : {
                        backgroundColor: "#f9fafb",
                        color: "#374151",
                        borderColor: "#e5e7eb",
                      }
                }
              >
                {isSelected && <span className="mr-1">{idx + 1}</span>}
                {ward}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Selected ward summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {selected.map((ward, i) => {
          const d = wardData[ward]
          if (!d) return null
          return (
            <Card
              key={ward}
              className="p-4"
              style={{ borderTop: `3px solid ${COLORS[i % COLORS.length]}` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <div className="font-semibold text-gray-900 text-sm truncate">
                  {ward}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">NRW %</span>
                  <span
                    className="font-semibold"
                    style={{
                      color:
                        d.nrw >= 30
                          ? "#ba1a1a"
                          : d.nrw >= 22
                            ? "#d97706"
                            : "#16a34a",
                    }}
                  >
                    {d.nrw}%
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Complaints/mo</span>
                  <span className="font-semibold text-gray-800">
                    {d.complaints}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Avg Resolution</span>
                  <span className="font-semibold text-gray-800">
                    {d.resolution} days
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Supply Coverage</span>
                  <span className="font-semibold text-green-700">
                    {d.supply}%
                  </span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <Card className="col-span-2 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-gray-900">
              Comparison by Metric
            </div>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {(["nrw", "complaints", "resolution"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className="px-3 py-1 text-xs font-medium transition-colors"
                  style={
                    metric === m
                      ? { backgroundColor: "#0061a5", color: "#fff" }
                      : { backgroundColor: "#fff", color: "#6b7280" }
                  }
                >
                  {metricLabels[m]}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={barData.map((d) => ({
                ward: d.ward,
                value:
                  d[
                    metric === "nrw"
                      ? "NRW"
                      : metric === "complaints"
                        ? "Complaints"
                        : "Resolution"
                  ],
              }))}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis dataKey="ward" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v) => [
                  metric === "nrw"
                    ? `${v}%`
                    : metric === "resolution"
                      ? `${v} days`
                      : v,
                  metricLabels[metric],
                ]}
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {barData.map((entry, i) => (
                  <rect key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <div className="font-semibold text-gray-900 mb-4">
            Performance Radar
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#f3f4f6" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9 }} />
              {selected.map((ward, i) => (
                <Radar
                  key={ward}
                  name={ward.split(" ")[0]}
                  dataKey={ward.split(" ")[0]}
                  stroke={COLORS[i % COLORS.length]}
                  fill={COLORS[i % COLORS.length]}
                  fillOpacity={0.1}
                  strokeWidth={1.5}
                />
              ))}
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Comparison table */}
      <Card>
        <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-900">
          Detailed Comparison Table
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Metric
                </th>
                {selected.map((ward, i) => (
                  <th
                    key={ward}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: COLORS[i % COLORS.length] }}
                  >
                    {ward}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "NRW %", key: "nrw", format: (v: number) => `${v}%` },
                {
                  label: "Monthly Complaints",
                  key: "complaints",
                  format: (v: number) => String(v),
                },
                {
                  label: "Avg Resolution (days)",
                  key: "resolution",
                  format: (v: number) => `${v} days`,
                },
                {
                  label: "Supply Coverage",
                  key: "supply",
                  format: (v: number) => `${v}%`,
                },
                {
                  label: "Network Pressure Score",
                  key: "pressure",
                  format: (v: number) => `${v}/100`,
                },
                {
                  label: "Population Coverage",
                  key: "coverage",
                  format: (v: number) => `${v}%`,
                },
              ].map((row, i) => (
                <tr
                  key={row.label}
                  className={`border-b border-gray-50 ${
                    i % 2 === 1 ? "bg-gray-50/30" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-gray-700">
                    {row.label}
                  </td>
                  {selected.map((ward) => {
                    const val =
                      wardData[ward]?.[
                        (row.key as keyof typeof wardData[string])
                      ] ?? 0
                    return (
                      <td
                        key={ward}
                        className="px-4 py-3 font-semibold text-gray-900"
                      >
                        {row.format(val as number)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
