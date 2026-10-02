import { Card, PageHeader, OutlineButton } from "@/components/Shared"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

const zones = [
  {
    zone: "Central Kolhapur",
    wards: 4,
    input: 1480,
    billed: 1102,
    nrw: 25.5,
    loss: 378,
    authorized: 140,
    physical: 238,
    status: "High",
  },
  {
    zone: "North Kolhapur",
    wards: 3,
    input: 1215,
    billed: 975,
    nrw: 19.8,
    loss: 240,
    authorized: 90,
    physical: 150,
    status: "Medium",
  },
  {
    zone: "South Kolhapur",
    wards: 3,
    input: 970,
    billed: 799,
    nrw: 17.6,
    loss: 171,
    authorized: 62,
    physical: 109,
    status: "Medium",
  },
  {
    zone: "East Kolhapur",
    wards: 4,
    input: 760,
    billed: 521,
    nrw: 31.4,
    loss: 239,
    authorized: 88,
    physical: 151,
    status: "Critical",
  },
  {
    zone: "West Kolhapur",
    wards: 3,
    input: 895,
    billed: 717,
    nrw: 19.9,
    loss: 178,
    authorized: 65,
    physical: 113,
    status: "Medium",
  },
]

const nrwColor = (nrw: number) => {
  if (nrw >= 30) return "#ba1a1a"
  if (nrw >= 22) return "#d97706"
  if (nrw >= 15) return "#ca8a04"
  return "#16a34a"
}
const nrwBg = (nrw: number) => {
  if (nrw >= 30) return "#fee2e2"
  if (nrw >= 22) return "#fef3c7"
  if (nrw >= 15) return "#fef9c3"
  return "#dcfce7"
}

const chartData = zones.map((z) => ({
  name: z.zone.replace(" Kolhapur", ""),
  Input: z.input,
  Billed: z.billed,
  Loss: z.loss,
}))

export default function ZoneWaterAccounting() {
  return (
    <div>
      <PageHeader
        title="Zone-wise Water Accounting"
        subtitle="Input vs. Billed volume comparison by distribution zone"
        actions={<OutlineButton icon="download">Export Excel</OutlineButton>}
      />

      <div className="grid grid-cols-5 gap-3 mb-6">
        {zones.map((z) => (
          <Card
            key={z.zone}
            className="p-3"
            style={{ borderLeft: `3px solid ${nrwColor(z.nrw)}` }}
          >
            <div className="text-xs font-semibold text-gray-800">{z.zone}</div>
            <div
              className="text-2xl font-bold mt-1"
              style={{ color: nrwColor(z.nrw) }}
            >
              {z.nrw}%
            </div>
            <div className="text-xs text-gray-400 mt-0.5">NRW</div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full"
                style={{
                  width: `${Math.min(z.nrw * 2.5, 100)}%`,
                  backgroundColor: nrwColor(z.nrw),
                }}
              />
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="font-semibold text-gray-900 mb-4">
          Zone-wise Volume Comparison (KL/day)
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ left: -10 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6"
            />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Input" fill="#66affe" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Billed" fill="#0061a5" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Loss" fill="#ba1a1a" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-900">
          Detailed Zone Accounting
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {[
                  "Zone",
                  "Wards",
                  "Input (KL/d)",
                  "Billed (KL/d)",
                  "NRW Loss",
                  "NRW %",
                  "Auth. Unb.",
                  "Physical Loss",
                  "Severity",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {zones.map((z, i) => (
                <tr
                  key={z.zone}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    i % 2 === 1 ? "bg-gray-50/30" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {z.zone}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{z.wards}</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">
                    {z.input.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {z.billed.toLocaleString("en-IN")}
                  </td>
                  <td
                    className="px-4 py-3 font-medium"
                    style={{ color: nrwColor(z.nrw) }}
                  >
                    {z.loss.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: nrwBg(z.nrw),
                        color: nrwColor(z.nrw),
                      }}
                    >
                      {z.nrw}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{z.authorized} KL</td>
                  <td className="px-4 py-3 text-gray-600">{z.physical} KL</td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: nrwBg(z.nrw),
                        color: nrwColor(z.nrw),
                      }}
                    >
                      {z.status}
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-4 py-3 text-gray-900">
                  Total / City Average
                </td>
                <td className="px-4 py-3 text-gray-700">17</td>
                <td className="px-4 py-3 text-gray-900">
                  {zones
                    .reduce((s, z) => s + z.input, 0)
                    .toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 text-gray-900">
                  {zones
                    .reduce((s, z) => s + z.billed, 0)
                    .toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3" style={{ color: "#ba1a1a" }}>
                  {zones
                    .reduce((s, z) => s + z.loss, 0)
                    .toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                    22.4%
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {zones.reduce((s, z) => s + z.authorized, 0)} KL
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {zones.reduce((s, z) => s + z.physical, 0)} KL
                </td>
                <td className="px-4 py-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                    High
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
