import { useState } from "react"
import {
  Card,
  PageHeader,
  PrimaryButton,
  OutlineButton,
  Badge,
  Modal,
  FormField,
  Select,
  WARDS,
} from "@/components/Shared"

const wardsData = [
  {
    id: 1,
    ward: "Shivaji Peth",
    zone: "Central",
    officer: "Rajesh Kadam",
    population: 18420,
    connections: 3840,
    area: "4.2 km²",
    pipelines: "28 km",
    status: "Active",
    reservoirs: 2,
  },
  {
    id: 2,
    ward: "Rajarampuri",
    zone: "North",
    officer: "Priya Shinde",
    population: 22100,
    connections: 4620,
    area: "5.8 km²",
    pipelines: "34 km",
    status: "Active",
    reservoirs: 2,
  },
  {
    id: 3,
    ward: "Kasba Bawada",
    zone: "East",
    officer: "Anil Jadhav",
    population: 14800,
    connections: 2980,
    area: "3.9 km²",
    pipelines: "22 km",
    status: "Active",
    reservoirs: 1,
  },
  {
    id: 4,
    ward: "Shahupuri",
    zone: "Central",
    officer: "Deepak Kulkarni",
    population: 26300,
    connections: 5480,
    area: "6.4 km²",
    pipelines: "42 km",
    status: "Active",
    reservoirs: 3,
  },
  {
    id: 5,
    ward: "Laxmipuri",
    zone: "South",
    officer: "Savita More",
    population: 17200,
    connections: 3540,
    area: "4.7 km²",
    pipelines: "26 km",
    status: "Active",
    reservoirs: 2,
  },
  {
    id: 6,
    ward: "Mangalwar Peth",
    zone: "Central",
    officer: "Ravi Kamble",
    population: 13400,
    connections: 2760,
    area: "3.2 km²",
    pipelines: "18 km",
    status: "Active",
    reservoirs: 1,
  },
  {
    id: 7,
    ward: "Tarabai Park",
    zone: "North",
    officer: "Nanda Pawar",
    population: 23800,
    connections: 4920,
    area: "7.1 km²",
    pipelines: "46 km",
    status: "Active",
    reservoirs: 2,
  },
  {
    id: 8,
    ward: "Rankala",
    zone: "West",
    officer: "Sachin Gaikwad",
    population: 16900,
    connections: 3480,
    area: "4.9 km²",
    pipelines: "31 km",
    status: "Active",
    reservoirs: 2,
  },
  {
    id: 9,
    ward: "New Shahupuri",
    zone: "Central",
    officer: "Rajesh Kadam",
    population: 14200,
    connections: 2860,
    area: "3.4 km²",
    pipelines: "20 km",
    status: "Active",
    reservoirs: 1,
  },
  {
    id: 10,
    ward: "Bindu Chowk",
    zone: "East",
    officer: "Anil Jadhav",
    population: 9800,
    connections: 1920,
    area: "2.1 km²",
    pipelines: "13 km",
    status: "Active",
    reservoirs: 1,
  },
  {
    id: 11,
    ward: "Subhash Nagar",
    zone: "South",
    officer: "Priya Shinde",
    population: 16100,
    connections: 3260,
    area: "5.2 km²",
    pipelines: "29 km",
    status: "Active",
    reservoirs: 2,
  },
  {
    id: 12,
    ward: "Padmarajnagar",
    zone: "West",
    officer: "Deepak Kulkarni",
    population: 19800,
    connections: 4020,
    area: "6.3 km²",
    pipelines: "38 km",
    status: "Active",
    reservoirs: 2,
  },
  {
    id: 13,
    ward: "Sangamwadi",
    zone: "East",
    officer: "Sachin Gaikwad",
    population: 10400,
    connections: 2080,
    area: "2.8 km²",
    pipelines: "15 km",
    status: "Active",
    reservoirs: 1,
  },
  {
    id: 14,
    ward: "Shahu Mill Area",
    zone: "West",
    officer: "Savita More",
    population: 11200,
    connections: 2240,
    area: "3.1 km²",
    pipelines: "17 km",
    status: "Active",
    reservoirs: 1,
  },
  {
    id: 15,
    ward: "Rajendra Nagar",
    zone: "North",
    officer: "Nanda Pawar",
    population: 9400,
    connections: 1880,
    area: "2.6 km²",
    pipelines: "14 km",
    status: "Active",
    reservoirs: 1,
  },
  {
    id: 16,
    ward: "Karpewadi",
    zone: "South",
    officer: "Ravi Kamble",
    population: 12800,
    connections: 2560,
    area: "4.1 km²",
    pipelines: "23 km",
    status: "Active",
    reservoirs: 1,
  },
  {
    id: 17,
    ward: "Shiroli",
    zone: "West",
    officer: "Sachin Gaikwad",
    population: 11600,
    connections: 2320,
    area: "5.8 km²",
    pipelines: "28 km",
    status: "Active",
    reservoirs: 2,
  },
]

type ZoneColor = {
  bg: string
  text: string
}

const ZONE_COLORS: Record<string, ZoneColor> = {
  Central: { bg: "#dbeafe", text: "#1e40af" },
  North: { bg: "#dcfce7", text: "#166534" },
  South: { bg: "#fef3c7", text: "#92400e" },
  East: { bg: "#fee2e2", text: "#991b1b" },
  West: { bg: "#ede9fe", text: "#5b21b6" },
}

const OFFICERS = [
  "Rajesh Kadam",
  "Priya Shinde",
  "Anil Jadhav",
  "Deepak Kulkarni",
  "Savita More",
  "Ravi Kamble",
  "Nanda Pawar",
  "Sachin Gaikwad",
]

export default function WardZoneManagement() {
  const [view, setView] = useState<"list" | "grid">("grid")
  const [editWard, setEditWard] = useState<typeof wardsData[0] | null>(null)

  const zones = ["Central", "North", "South", "East", "West"]
  const totalPop = wardsData.reduce((s, w) => s + w.population, 0)
  const totalConn = wardsData.reduce((s, w) => s + w.connections, 0)

  return (
    <div>
      <PageHeader
        title="Ward & Zone Management"
        subtitle="Administrative boundaries, officer assignments, and infrastructure metadata"
        actions={
          <>
            <OutlineButton icon="download">Export</OutlineButton>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {(["grid", "list"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1"
                  style={
                    view === v
                      ? { backgroundColor: "#0061a5", color: "#fff" }
                      : { backgroundColor: "#fff", color: "#6b7280" }
                  }
                >
                  <span className="material-symbols-outlined text-sm">
                    {v === "grid" ? "grid_view" : "list"}
                  </span>
                  {v}
                </button>
              ))}
            </div>
          </>
        }
      />

      {/* Zone summary */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {zones.map((zone) => {
          const zWards = wardsData.filter((w) => w.zone === zone)
          const zPop = zWards.reduce((s, w) => s + w.population, 0)
          const colors = ZONE_COLORS[zone]
          return (
            <Card key={zone} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-semibold"
                  style={{ color: colors.text }}
                >
                  {zone}
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: colors.bg, color: colors.text }}
                >
                  {zWards.length} wards
                </span>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {zPop.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-gray-500">Population</div>
            </Card>
          )
        })}
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-3 gap-4">
          {wardsData.map((w) => {
            const colors = ZONE_COLORS[w.zone] ?? {
              bg: "#f3f4f6",
              text: "#374151",
            }
            return (
              <Card
                key={w.id}
                className="p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">{w.ward}</div>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {w.zone}
                    </span>
                  </div>
                  <button
                    onClick={() => setEditWard({ ...w })}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-gray-500 text-base">
                      edit
                    </span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-gray-50">
                    <div className="text-gray-400">Officer</div>
                    <div className="font-medium text-gray-700 mt-0.5 truncate">
                      {w.officer}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50">
                    <div className="text-gray-400">Population</div>
                    <div className="font-medium text-gray-700 mt-0.5">
                      {w.population.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50">
                    <div className="text-gray-400">Connections</div>
                    <div className="font-medium text-gray-700 mt-0.5">
                      {w.connections.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50">
                    <div className="text-gray-400">Area</div>
                    <div className="font-medium text-gray-700 mt-0.5">
                      {w.area}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50">
                    <div className="text-gray-400">Pipelines</div>
                    <div className="font-medium text-gray-700 mt-0.5">
                      {w.pipelines}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50">
                    <div className="text-gray-400">Reservoirs</div>
                    <div className="font-medium text-gray-700 mt-0.5">
                      {w.reservoirs}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    "#",
                    "Ward",
                    "Zone",
                    "Officer In-charge",
                    "Population",
                    "Connections",
                    "Area",
                    "Pipelines",
                    "Reservoirs",
                    "",
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
                {wardsData.map((w, i) => {
                  const colors = ZONE_COLORS[w.zone] ?? {
                    bg: "#f3f4f6",
                    text: "#374151",
                  }
                  return (
                    <tr
                      key={w.id}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        i % 2 === 1 ? "bg-gray-50/30" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {w.id}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {w.ward}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: colors.bg,
                            color: colors.text,
                          }}
                        >
                          {w.zone}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{w.officer}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {w.population.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {w.connections.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{w.area}</td>
                      <td className="px-4 py-3 text-gray-600">{w.pipelines}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {w.reservoirs}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setEditWard({ ...w })}
                          className="p-1 rounded hover:bg-blue-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-blue-600 text-base">
                            edit
                          </span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between">
            <span>
              17 wards · Total population: {totalPop.toLocaleString("en-IN")} ·
              Connections: {totalConn.toLocaleString("en-IN")}
            </span>
          </div>
        </Card>
      )}

      <Modal
        open={!!editWard}
        onClose={() => setEditWard(null)}
        title={`Edit Ward — ${editWard?.ward}`}
        width="max-w-lg"
      >
        {editWard && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Zone">
                <Select
                  options={["Central", "North", "South", "East", "West"]}
                  value={editWard.zone}
                  onChange={(v: string) =>
                    setEditWard({ ...editWard, zone: v })
                  }
                />
              </FormField>
              <FormField label="Officer In-charge">
                <Select
                  options={OFFICERS}
                  value={editWard.officer}
                  onChange={(v: string) =>
                    setEditWard({ ...editWard, officer: v })
                  }
                />
              </FormField>
              <FormField label="Area (km²)">
                <input
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                  value={editWard.area}
                  onChange={(e) =>
                    setEditWard({ ...editWard, area: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Pipeline Length">
                <input
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                  value={editWard.pipelines}
                  onChange={(e) =>
                    setEditWard({ ...editWard, pipelines: e.target.value })
                  }
                />
              </FormField>
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <OutlineButton onClick={() => setEditWard(null)}>
                Cancel
              </OutlineButton>
              <PrimaryButton icon="save" onClick={() => setEditWard(null)}>
                Save Changes
              </PrimaryButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
