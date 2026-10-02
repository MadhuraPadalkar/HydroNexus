import { useState } from "react"
import { Card, PageHeader, OutlineButton, Badge } from "@/components/Shared"

const notifications = [
  {
    id: "NOT-2024-0201",
    type: "Supply",
    title: "Supply Suspension Notice — Rajarampuri",
    wards: ["Rajarampuri", "New Shahupuri"],
    sent: "11 Sep 2024, 08:30",
    sentBy: "Suresh Patil",
    channels: ["SMS", "App"],
    delivered: 4820,
    failed: 43,
    opened: 3210,
    status: "Delivered",
  },
  {
    id: "NOT-2024-0200",
    type: "Shortage",
    title: "Water Shortage Alert — East Zone",
    wards: ["Kasba Bawada", "Bindu Chowk", "Sangamwadi"],
    sent: "10 Sep 2024, 17:15",
    sentBy: "Rajesh Kadam",
    channels: ["SMS", "App", "IVR Call"],
    delivered: 5180,
    failed: 122,
    opened: 4020,
    status: "Delivered",
  },
  {
    id: "NOT-2024-0199",
    type: "General",
    title: "KMC Water Bill Payment Reminder",
    wards: ["All Wards"],
    sent: "10 Sep 2024, 10:00",
    sentBy: "Suresh Patil",
    channels: ["SMS", "Email"],
    delivered: 58200,
    failed: 1840,
    opened: 31400,
    status: "Delivered",
  },
  {
    id: "NOT-2024-0198",
    type: "Maintenance",
    title: "Emergency Feeder Maintenance Notice",
    wards: ["Rankala", "Shivaji Peth", "Laxmipuri"],
    sent: "09 Sep 2024, 22:00",
    sentBy: "Deepak Kulkarni",
    channels: ["SMS", "App", "IVR Call"],
    delivered: 12480,
    failed: 204,
    opened: 9840,
    status: "Delivered",
  },
  {
    id: "NOT-2024-0197",
    type: "Supply",
    title: "Maintenance Shutdown — Tarabai Park",
    wards: ["Tarabai Park"],
    sent: "09 Sep 2024, 07:00",
    sentBy: "Priya Shinde",
    channels: ["SMS", "App"],
    delivered: 4920,
    failed: 31,
    opened: 3680,
    status: "Delivered",
  },
  {
    id: "NOT-2024-0196",
    type: "General",
    title: "New Water Connection Portal Launch",
    wards: ["All Wards"],
    sent: "07 Sep 2024, 12:00",
    sentBy: "Suresh Patil",
    channels: ["SMS", "App", "Email"],
    delivered: 57800,
    failed: 2100,
    opened: 28400,
    status: "Delivered",
  },
  {
    id: "NOT-2024-0195",
    type: "Shortage",
    title: "Pump Failure — Subhash Nagar",
    wards: ["Subhash Nagar", "Karpewadi"],
    sent: "06 Sep 2024, 14:30",
    sentBy: "Anil Jadhav",
    channels: ["SMS", "App"],
    delivered: 5820,
    failed: 88,
    opened: 4210,
    status: "Delivered",
  },
  {
    id: "NOT-2024-0194",
    type: "Supply",
    title: "Water Quality Test Results — Safe",
    wards: ["Rankala", "Padmarajnagar", "Shahu Mill Area"],
    sent: "05 Sep 2024, 16:00",
    sentBy: "Ravi Kamble",
    channels: ["SMS"],
    delivered: 10020,
    failed: 156,
    opened: 6800,
    status: "Delivered",
  },
]

type NotificationTypeColor = {
  bg: string
  text: string
  icon: string
}

const TYPE_COLORS: Record<string, NotificationTypeColor> = {
  Supply: { bg: "#dbeafe", text: "#1e40af", icon: "water_drop" },
  Shortage: { bg: "#fee2e2", text: "#991b1b", icon: "warning" },
  Maintenance: { bg: "#dcfce7", text: "#166534", icon: "build" },
  General: { bg: "#f3f4f6", text: "#374151", icon: "campaign" },
}

export default function NotificationHistory() {
  const [typeFilter, setTypeFilter] = useState("All")
  const [search, setSearch] = useState("")

  const types = ["All", "Supply", "Shortage", "Maintenance", "General"]
  const filtered = notifications.filter((n) => {
    const matchType = typeFilter === "All" || n.type === typeFilter
    const matchSearch =
      !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.wards.some((w) => w.toLowerCase().includes(search.toLowerCase()))
    return matchType && matchSearch
  })

  const totalDelivered = notifications.reduce((s, n) => s + n.delivered, 0)
  const totalFailed = notifications.reduce((s, n) => s + n.failed, 0)
  const avgOpen = Math.round(
    notifications.reduce((s, n) => s + (n.opened / n.delivered) * 100, 0) /
      notifications.length,
  )

  return (
    <div>
      <PageHeader
        title="Notification History"
        subtitle="Log of all sent notifications — KMC Smart Water Portal"
        actions={<OutlineButton icon="download">Export Log</OutlineButton>}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Sent",
            value: notifications.length,
            icon: "send",
            color: "#0061a5",
            bg: "#e8f0fe",
          },
          {
            label: "Citizens Reached",
            value: totalDelivered.toLocaleString("en-IN"),
            icon: "people",
            color: "#166534",
            bg: "#dcfce7",
          },
          {
            label: "Failed Deliveries",
            value: totalFailed.toLocaleString("en-IN"),
            icon: "error",
            color: "#991b1b",
            bg: "#fee2e2",
          },
          {
            label: "Avg Open Rate",
            value: `${avgOpen}%`,
            icon: "open_in_new",
            color: "#5b21b6",
            bg: "#ede9fe",
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

      {/* Filters */}
      <Card className="p-3 mb-4 flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white flex-1">
          <span className="material-symbols-outlined text-gray-400 text-base">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or ward..."
            className="flex-1 text-sm outline-none bg-transparent"
          />
        </div>
        <div className="flex gap-1">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={
                typeFilter === t
                  ? { backgroundColor: "#002045", color: "#fff" }
                  : { backgroundColor: "#f3f4f6", color: "#374151" }
              }
            >
              {t}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {[
                  "ID",
                  "Type",
                  "Title",
                  "Target Wards",
                  "Sent At",
                  "Sent By",
                  "Channels",
                  "Delivered",
                  "Failed",
                  "Opened",
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
              {filtered.map((n, i) => {
                const tc = TYPE_COLORS[n.type] ?? TYPE_COLORS.General
                const openRate = Math.round((n.opened / n.delivered) * 100)
                return (
                  <tr
                    key={n.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      i % 2 === 1 ? "bg-gray-50/30" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                      {n.id}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: tc.bg, color: tc.text }}
                      >
                        <span className="material-symbols-outlined text-xs">
                          {tc.icon}
                        </span>
                        {n.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 max-w-48 truncate">
                        {n.title}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-36">
                        {n.wards.length <= 2 ? (
                          n.wards.map((w) => (
                            <span
                              key={w}
                              className="inline-block text-xs text-gray-600 mr-1"
                            >
                              {w}
                            </span>
                          ))
                        ) : (
                          <>
                            <span className="text-xs text-gray-600">
                              {n.wards[0]}
                            </span>{" "}
                            <span className="text-xs text-gray-400">
                              +{n.wards.length - 1}
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
                      {n.sent}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {n.sentBy}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {n.channels.map((c) => (
                          <span
                            key={c}
                            className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-green-700 font-medium">
                      {n.delivered.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-red-600 text-xs">
                      {n.failed}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-blue-500"
                            style={{ width: `${openRate}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {openRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50">
                        Resend
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
          Showing {filtered.length} of {notifications.length} notifications
        </div>
      </Card>
    </div>
  )
}
