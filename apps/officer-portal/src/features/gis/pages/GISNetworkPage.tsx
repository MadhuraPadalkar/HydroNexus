import { useState } from "react"
import { Card, PageHeader, OutlineButton, Badge } from "@/components/Shared"

type NodeType = "pump" | "valve" | "reservoir" | "junction" | "burst" | "meter"

interface NetworkNode {
  id: string
  label: string
  type: NodeType
  x: number
  y: number
  ward: string
  status: string
  pressure?: number
  flow?: number
}

const NODES: NetworkNode[] = [
  {
    id: "N-001",
    label: "Rankala Pump Stn",
    type: "pump",
    x: 70,
    y: 200,
    ward: "Rankala",
    status: "Active",
    pressure: 12.4,
    flow: 840,
  },
  {
    id: "N-002",
    label: "Shahupuri Res.",
    type: "reservoir",
    x: 200,
    y: 120,
    ward: "Shahupuri",
    status: "Active",
    pressure: 10.8,
    flow: 0,
  },
  {
    id: "N-003",
    label: "Shivaji Peth Jn.",
    type: "junction",
    x: 320,
    y: 140,
    ward: "Shivaji Peth",
    status: "Active",
    pressure: 9.2,
    flow: 520,
  },
  {
    id: "N-004",
    label: "Rajarampuri Res.",
    type: "reservoir",
    x: 460,
    y: 90,
    ward: "Rajarampuri",
    status: "Active",
    pressure: 11.2,
    flow: 0,
  },
  {
    id: "N-005",
    label: "Kasba Bawada Jn.",
    type: "junction",
    x: 390,
    y: 230,
    ward: "Kasba Bawada",
    status: "Fault",
    pressure: 3.2,
    flow: 180,
  },
  {
    id: "N-006",
    label: "Mangalwar Valve",
    type: "valve",
    x: 240,
    y: 240,
    ward: "Mangalwar Peth",
    status: "Warning",
    pressure: 7.1,
    flow: 310,
  },
  {
    id: "N-007",
    label: "Tarabai Res.",
    type: "reservoir",
    x: 500,
    y: 180,
    ward: "Tarabai Park",
    status: "Active",
    pressure: 10.4,
    flow: 0,
  },
  {
    id: "N-008",
    label: "Burst — Kasba Sec 4",
    type: "burst",
    x: 435,
    y: 275,
    ward: "Kasba Bawada",
    status: "Critical",
    pressure: 0,
    flow: 0,
  },
  {
    id: "N-009",
    label: "Laxmipuri Meter",
    type: "meter",
    x: 150,
    y: 310,
    ward: "Laxmipuri",
    status: "Active",
    pressure: 9.8,
    flow: 210,
  },
  {
    id: "N-010",
    label: "Subhash Nagar Jn.",
    type: "junction",
    x: 310,
    y: 310,
    ward: "Subhash Nagar",
    status: "Active",
    pressure: 8.6,
    flow: 290,
  },
  {
    id: "N-011",
    label: "Rankala Valve",
    type: "valve",
    x: 130,
    y: 220,
    ward: "Rankala",
    status: "Active",
    pressure: 11.8,
    flow: 760,
  },
  {
    id: "N-012",
    label: "New Shahupuri Jn.",
    type: "junction",
    x: 265,
    y: 185,
    ward: "New Shahupuri",
    status: "Active",
    pressure: 8.9,
    flow: 400,
  },
]

const PIPES = [
  { from: "N-001", to: "N-011", status: "active" },
  { from: "N-011", to: "N-002", status: "active" },
  { from: "N-002", to: "N-012", status: "active" },
  { from: "N-012", to: "N-003", status: "active" },
  { from: "N-003", to: "N-004", status: "active" },
  { from: "N-004", to: "N-007", status: "active" },
  { from: "N-007", to: "N-005", status: "active" },
  { from: "N-005", to: "N-008", status: "burst" },
  { from: "N-002", to: "N-006", status: "warning" },
  { from: "N-006", to: "N-010", status: "active" },
  { from: "N-010", to: "N-005", status: "active" },
  { from: "N-011", to: "N-009", status: "active" },
  { from: "N-009", to: "N-010", status: "active" },
  { from: "N-003", to: "N-010", status: "active" },
]

type NodeIconStyle = {
  icon: string
  color: string
  bg: string
}

const NODE_ICONS: Record<NodeType, NodeIconStyle> = {
  pump: { icon: "water_pump", color: "#0061a5", bg: "#dbeafe" },
  reservoir: { icon: "water", color: "#166534", bg: "#dcfce7" },
  junction: { icon: "hub", color: "#374151", bg: "#f3f4f6" },
  valve: { icon: "settings", color: "#92400e", bg: "#fef3c7" },
  burst: { icon: "warning", color: "#ba1a1a", bg: "#fee2e2" },
  meter: { icon: "speed", color: "#5b21b6", bg: "#ede9fe" },
}

const STATUS_COLORS: Record<string, string> = {
  Active: "#16a34a",
  Warning: "#d97706",
  Fault: "#ba1a1a",
  Critical: "#ba1a1a",
  Inactive: "#9ca3af",
}

const PIPE_COLORS: Record<string, {
  stroke: string
  dasharray?: string
  width: number
}> = {
  active: { stroke: "#0061a5", width: 2 },
  warning: { stroke: "#d97706", width: 2, dasharray: "6 3" },
  burst: { stroke: "#ba1a1a", width: 3, dasharray: "4 3" },
}

export default function GISNetwork() {
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null)
  const [layer, setLayer] = useState<"all" | "pressure" | "flow">("all")
  const [filterStatus, setFilterStatus] = useState("All")

  const nodePos = Object.fromEntries(
    NODES.map((n) => [n.id, { x: n.x, y: n.y }]),
  )

  return (
    <div>
      <PageHeader
        title="GIS Water Network"
        subtitle="Interactive pipeline network map — Kolhapur Municipal Corporation"
        actions={
          <>
            <OutlineButton icon="download">Export KML</OutlineButton>
            <OutlineButton icon="print">Print Map</OutlineButton>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          {
            label: "Total Nodes",
            value: NODES.length,
            icon: "hub",
            color: "#0061a5",
            bg: "#e8f0fe",
          },
          {
            label: "Active Pipelines",
            value: PIPES.filter((p) => p.status === "active").length,
            icon: "check_circle",
            color: "#166534",
            bg: "#dcfce7",
          },
          {
            label: "Faults / Bursts",
            value: NODES.filter(
              (n) => n.status === "Critical" || n.status === "Fault",
            ).length,
            icon: "error",
            color: "#991b1b",
            bg: "#fee2e2",
          },
          {
            label: "Avg Pressure",
            value: "9.6 m",
            icon: "compress",
            color: "#92400e",
            bg: "#fef3c7",
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

      <div className="flex gap-4">
        {/* Map */}
        <div className="flex-1 min-w-0">
          <Card className="overflow-hidden">
            {/* Toolbar */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Layer:</span>
              {(["all", "pressure", "flow"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLayer(l)}
                  className="px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors"
                  style={
                    layer === l
                      ? { backgroundColor: "#002045", color: "#fff" }
                      : { backgroundColor: "#f3f4f6", color: "#374151" }
                  }
                >
                  {l === "all"
                    ? "All Layers"
                    : l === "pressure"
                      ? "Pressure"
                      : "Flow Rate"}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                Live network data
              </div>
            </div>

            {/* SVG Map */}
            <div className="relative bg-slate-50" style={{ height: 440 }}>
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 600 420"
                className="absolute inset-0"
              >
                {/* Background grid */}
                <defs>
                  <pattern
                    id="grid"
                    width="30"
                    height="30"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 30 0 L 0 0 0 30"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="600" height="420" fill="url(#grid)" />

                {/* Ward area labels */}
                {[
                  { label: "Rankala", x: 50, y: 250 },
                  { label: "Shahupuri", x: 175, y: 95 },
                  { label: "Shivaji Peth", x: 295, y: 115 },
                  { label: "Rajarampuri", x: 435, y: 65 },
                  { label: "Kasba Bawada", x: 355, y: 205 },
                  { label: "Mangalwar", x: 215, y: 260 },
                  { label: "Tarabai Park", x: 475, y: 155 },
                  { label: "Laxmipuri", x: 100, y: 330 },
                  { label: "Subhash Nagar", x: 275, y: 330 },
                ].map((l) => (
                  <text
                    key={l.label}
                    x={l.x}
                    y={l.y}
                    fontSize="8"
                    fill="#94a3b8"
                    fontWeight="500"
                  >
                    {l.label}
                  </text>
                ))}

                {/* Pipes */}
                {PIPES.map((pipe, i) => {
                  const from = nodePos[pipe.from]
                  const to = nodePos[pipe.to]
                  if (!from || !to) return null
                  const pc = PIPE_COLORS[pipe.status] ?? PIPE_COLORS.active
                  return (
                    <line
                      key={i}
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={pc.stroke}
                      strokeWidth={pc.width}
                      strokeDasharray={pc.dasharray}
                      strokeLinecap="round"
                    />
                  )
                })}

                {/* Flow direction arrows on active pipes */}
                {layer === "flow" &&
                  PIPES.filter((p) => p.status === "active").map((pipe, i) => {
                    const from = nodePos[pipe.from]
                    const to = nodePos[pipe.to]
                    if (!from || !to) return null
                    const mx = (from.x + to.x) / 2
                    const my = (from.y + to.y) / 2
                    return (
                      <circle key={i} cx={mx} cy={my} r="3" fill="#66affe" />
                    )
                  })}

                {/* Nodes */}
                {NODES.map((node) => {
                  const ni = NODE_ICONS[node.type]
                  const sc = STATUS_COLORS[node.status] ?? "#9ca3af"
                  const isSelected = selectedNode?.id === node.id
                  return (
                    <g
                      key={node.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedNode(isSelected ? null : node)}
                    >
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isSelected ? 18 : 14}
                        fill="white"
                        stroke={isSelected ? "#002045" : sc}
                        strokeWidth={isSelected ? 2.5 : 2}
                      />
                      <text
                        x={node.x}
                        y={node.y + 5}
                        fontSize="11"
                        textAnchor="middle"
                        fill={sc}
                      >
                        ●
                      </text>
                      {/* Status dot */}
                      <circle
                        cx={node.x + 10}
                        cy={node.y - 10}
                        r="4"
                        fill={sc}
                        stroke="white"
                        strokeWidth="1.5"
                      />
                      {/* Label */}
                      <text
                        x={node.x}
                        y={node.y + 26}
                        fontSize="7.5"
                        textAnchor="middle"
                        fill="#374151"
                        fontWeight="500"
                      >
                        {node.label.length > 16
                          ? node.label.substring(0, 14) + "…"
                          : node.label}
                      </text>
                      {/* Pressure overlay */}
                      {layer === "pressure" && node.pressure !== undefined && (
                        <text
                          x={node.x}
                          y={node.y - 20}
                          fontSize="8"
                          textAnchor="middle"
                          fill={node.pressure < 5 ? "#ba1a1a" : "#166534"}
                          fontWeight="bold"
                        >
                          {node.pressure}m
                        </text>
                      )}
                    </g>
                  )
                })}
              </svg>

              {/* Legend */}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl p-2.5 shadow-sm border border-gray-100">
                <div className="text-xs font-semibold text-gray-600 mb-2">
                  Legend
                </div>
                <div className="space-y-1.5">
                  {Object.entries(NODE_ICONS)
                    .filter(([t]) => t !== "burst")
                    .map(([type, { color }]) => (
                      <div
                        key={type}
                        className="flex items-center gap-2 text-xs text-gray-600"
                      >
                        <div
                          className="w-3 h-3 rounded-full border-2"
                          style={{
                            borderColor: color,
                            backgroundColor: "white",
                          }}
                        />
                        <span className="capitalize">{type}</span>
                      </div>
                    ))}
                  <div className="flex items-center gap-2 text-xs text-red-600">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    Burst/Fault
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-6 h-0.5 bg-blue-600 rounded" />
                    Active pipe
                  </div>
                  <div className="flex items-center gap-2 text-xs text-amber-600">
                    <div className="w-6 border-b-2 border-amber-500 border-dashed" />
                    Warning
                  </div>
                  <div className="flex items-center gap-2 text-xs text-red-600">
                    <div className="w-6 border-b-2 border-red-600 border-dashed" />
                    Burst
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Side panel */}
        <div className="w-72 shrink-0 space-y-4">
          {/* Node detail */}
          {selectedNode ? (
            <Card className="overflow-hidden">
              <div
                className="px-4 py-3 border-b border-gray-100 flex items-center justify-between"
                style={{ backgroundColor: "#002045" }}
              >
                <div>
                  <div className="text-white font-semibold text-sm">
                    {selectedNode.label}
                  </div>
                  <div className="text-blue-300 text-xs capitalize mt-0.5">
                    {selectedNode.type} Node — {selectedNode.id}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-white/60 hover:text-white"
                >
                  <span className="material-symbols-outlined text-lg">
                    close
                  </span>
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Status</span>
                  <Badge status={selectedNode.status} />
                </div>
                {[
                  { label: "Ward", value: selectedNode.ward },
                  { label: "Node ID", value: selectedNode.id },
                  ...(selectedNode.pressure !== undefined
                    ? [
                        {
                          label: "Pressure",
                          value: `${selectedNode.pressure} m`,
                        },
                      ]
                    : []),
                  ...(selectedNode.flow !== undefined &&
                  selectedNode.type !== "reservoir"
                    ? [
                        {
                          label: "Flow Rate",
                          value: `${selectedNode.flow} KL/hr`,
                        },
                      ]
                    : []),
                ].map((r) => (
                  <div key={r.label} className="flex justify-between text-xs">
                    <span className="text-gray-400">{r.label}</span>
                    <span className="font-medium text-gray-800">{r.value}</span>
                  </div>
                ))}
                {selectedNode.status === "Critical" && (
                  <div className="p-2.5 rounded-xl bg-red-50 text-xs text-red-800 border border-red-100">
                    <strong>Action required:</strong> Pipeline burst detected.
                    Field team dispatched (MNT-091).
                  </div>
                )}
                <div className="space-y-1.5 pt-1">
                  <button
                    className="w-full py-1.5 rounded-lg text-xs font-medium text-white"
                    style={{ backgroundColor: "#0061a5" }}
                  >
                    Log Maintenance
                  </button>
                  <button className="w-full py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50">
                    View History
                  </button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-4">
              <div className="text-sm font-medium text-gray-700 mb-1">
                Click a node to inspect
              </div>
              <div className="text-xs text-gray-400">
                Select any node on the map to view its status, pressure, flow,
                and maintenance options.
              </div>
            </Card>
          )}

          {/* Node list */}
          <Card>
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="font-semibold text-gray-900 text-sm">
                Network Nodes
              </div>
              <div className="flex gap-1 mt-2">
                {["All", "Active", "Warning", "Fault", "Critical"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className="px-2 py-0.5 rounded-full text-xs font-medium transition-colors"
                    style={
                      filterStatus === s
                        ? { backgroundColor: "#002045", color: "#fff" }
                        : { backgroundColor: "#f3f4f6", color: "#374151" }
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
              {NODES.filter(
                (n) => filterStatus === "All" || n.status === filterStatus,
              ).map((node) => {
                const ni = NODE_ICONS[node.type]
                const sc = STATUS_COLORS[node.status] ?? "#9ca3af"
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: ni.bg }}
                    >
                      <span
                        className="material-symbols-outlined text-sm"
                        style={{ color: ni.color }}
                      >
                        {ni.icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-800 truncate">
                        {node.label}
                      </div>
                      <div className="text-xs text-gray-400">{node.ward}</div>
                    </div>
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: sc }}
                    />
                  </button>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
