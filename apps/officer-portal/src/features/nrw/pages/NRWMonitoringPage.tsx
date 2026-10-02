import { Card, PageHeader, OutlineButton, Badge } from "@/components/Shared"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

const wardNRW = [
  {
    ward: "Kasba Bawada",
    nrw: 38.4,
    input: 290,
    billed: 178,
    loss: 112,
    status: "Critical",
  },
  {
    ward: "Mangalwar Peth",
    nrw: 34.2,
    input: 260,
    billed: 171,
    loss: 89,
    status: "Critical",
  },
  {
    ward: "Shiroli",
    nrw: 31.8,
    input: 210,
    billed: 143,
    loss: 67,
    status: "High",
  },
  {
    ward: "Bindu Chowk",
    nrw: 29.1,
    input: 190,
    billed: 135,
    loss: 55,
    status: "High",
  },
  {
    ward: "Subhash Nagar",
    nrw: 26.7,
    input: 310,
    billed: 227,
    loss: 83,
    status: "Medium",
  },
  {
    ward: "New Shahupuri",
    nrw: 24.5,
    input: 280,
    billed: 211,
    loss: 69,
    status: "Medium",
  },
  {
    ward: "Karpewadi",
    nrw: 22.3,
    input: 240,
    billed: 186,
    loss: 54,
    status: "Medium",
  },
  {
    ward: "Shahu Mill Area",
    nrw: 20.1,
    input: 220,
    billed: 176,
    loss: 44,
    status: "Medium",
  },
  {
    ward: "Shivaji Peth",
    nrw: 18.6,
    input: 420,
    billed: 342,
    loss: 78,
    status: "Low",
  },
  {
    ward: "Rajarampuri",
    nrw: 16.9,
    input: 380,
    billed: 316,
    loss: 64,
    status: "Low",
  },
  {
    ward: "Shahupuri",
    nrw: 15.4,
    input: 510,
    billed: 431,
    loss: 79,
    status: "Low",
  },
  {
    ward: "Tarabai Park",
    nrw: 14.2,
    input: 455,
    billed: 390,
    loss: 65,
    status: "Low",
  },
  {
    ward: "Laxmipuri",
    nrw: 13.8,
    input: 340,
    billed: 293,
    loss: 47,
    status: "Low",
  },
  {
    ward: "Rankala",
    nrw: 13.1,
    input: 320,
    billed: 278,
    loss: 42,
    status: "Low",
  },
  {
    ward: "Padmarajnagar",
    nrw: 12.4,
    input: 375,
    billed: 329,
    loss: 46,
    status: "Low",
  },
  {
    ward: "Sangamwadi",
    nrw: 11.8,
    input: 200,
    billed: 176,
    loss: 24,
    status: "Low",
  },
  {
    ward: "Rajendra Nagar",
    nrw: 10.2,
    input: 180,
    billed: 162,
    loss: 18,
    status: "Low",
  },
]

const nrwColor = (nrw: number) => {
  if (nrw >= 30) return "#ba1a1a"
  if (nrw >= 22) return "#d97706"
  return "#16a34a"
}

const CustomBar = (props: any) => {
  const { x, y, width, height, nrw } = props
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={nrwColor(nrw ?? 0)}
      rx={3}
    />
  )
}

export default function NRWMonitoring() {
  const cityNRW = 22.4
  const totalInput = wardNRW.reduce((s, w) => s + w.input, 0)
  const totalBilled = wardNRW.reduce((s, w) => s + w.billed, 0)
  const totalLoss = totalInput - totalBilled

  return (
    <div>
      <PageHeader
        title="NRW Monitoring"
        subtitle="Non-Revenue Water tracking — Kolhapur Municipal Corporation"
        actions={<OutlineButton icon="download">Export Report</OutlineButton>}
      />

      {/* Hero NRW card */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card
          className="col-span-1 p-6 flex flex-col items-center justify-center text-center"
          style={{
            background: "linear-gradient(135deg, #002045 0%, #0061a5 100%)",
          }}
        >
          <div className="text-white/70 text-sm font-medium uppercase tracking-wide mb-2">
            City-wide NRW %
          </div>
          <div className="text-6xl font-bold text-white mb-1">{cityNRW}%</div>
          <div className="text-blue-200 text-sm mb-4">Target: ≤ 15%</div>
          <div className="w-full bg-white/20 rounded-full h-2.5 mb-1">
            <div
              className="h-2.5 rounded-full bg-yellow-400"
              style={{ width: `${Math.min((cityNRW / 50) * 100, 100)}%` }}
            />
          </div>
          <div className="text-white/60 text-xs">Needs Urgent Attention</div>
        </Card>

        <div className="col-span-2 grid grid-cols-3 gap-4">
          {[
            {
              label: "Total Input",
              value: `${totalInput.toLocaleString("en-IN")} KL/day`,
              icon: "input",
              color: "#0061a5",
              bg: "#e8f0fe",
            },
            {
              label: "Billed Volume",
              value: `${totalBilled.toLocaleString("en-IN")} KL/day`,
              icon: "receipt_long",
              color: "#166534",
              bg: "#dcfce7",
            },
            {
              label: "Water Loss",
              value: `${totalLoss.toLocaleString("en-IN")} KL/day`,
              icon: "water_loss",
              color: "#991b1b",
              bg: "#fee2e2",
            },
            {
              label: "Critical Wards",
              value: wardNRW.filter((w) => w.status === "Critical").length,
              icon: "warning",
              color: "#991b1b",
              bg: "#fee2e2",
            },
            {
              label: "High Risk Wards",
              value: wardNRW.filter((w) => w.status === "High").length,
              icon: "report",
              color: "#92400e",
              bg: "#fef3c7",
            },
            {
              label: "Low NRW Wards",
              value: wardNRW.filter((w) => w.status === "Low").length,
              icon: "check_circle",
              color: "#166534",
              bg: "#dcfce7",
            },
          ].map((s) => (
            <Card key={s.label} className="p-4 flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: s.bg }}
              >
                <span
                  className="material-symbols-outlined text-lg"
                  style={{ color: s.color }}
                >
                  {s.icon}
                </span>
              </div>
              <div>
                <div className="text-xs text-gray-500">{s.label}</div>
                <div className="text-sm font-bold text-gray-900 mt-0.5">
                  {s.value}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Chart */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold text-gray-900">
              Ward-wise NRW % (Sorted by Highest Loss)
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Red ≥ 30% · Orange 22–30% · Green &lt; 22%
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded inline-block bg-red-600" />{" "}
              Critical (≥30%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded inline-block bg-amber-500" />{" "}
              High (22–30%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded inline-block bg-green-600" /> Low
              (&lt;22%)
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={wardNRW} margin={{ left: -10, right: 10 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6"
            />
            <XAxis
              dataKey="ward"
              tick={{ fontSize: 10 }}
              angle={-35}
              textAnchor="end"
              height={70}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 45]}
            />
            <Tooltip
              formatter={(v) => [`${v}%`, "NRW"]}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
            />
            <Bar
              dataKey="nrw"
              radius={[4, 4, 0, 0]}
              shape={(props: any) => <CustomBar {...props} nrw={props.nrw} />}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Table */}
      <Card>
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="font-semibold text-gray-900">
            Ward-wise NRW Detail
          </div>
          <div className="text-xs text-gray-400">Data as of 11 Sep 2024</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {[
                  "#",
                  "Ward",
                  "Input (KL/day)",
                  "Billed (KL/day)",
                  "Loss (KL/day)",
                  "NRW %",
                  "Risk Level",
                  "Action",
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
              {wardNRW.map((w, i) => (
                <tr
                  key={w.ward}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {w.ward}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {w.input.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {w.billed.toLocaleString("en-IN")}
                  </td>
                  <td
                    className="px-4 py-3 font-medium"
                    style={{ color: "#ba1a1a" }}
                  >
                    {w.loss.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${w.nrw * 2}%`,
                            backgroundColor: nrwColor(w.nrw),
                          }}
                        />
                      </div>
                      <span
                        className="font-semibold text-xs"
                        style={{ color: nrwColor(w.nrw) }}
                      >
                        {w.nrw}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={w.status} />
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-xs px-2 py-1 rounded border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
