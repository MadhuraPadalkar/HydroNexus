import { useState } from "react"
import {
  Card,
  PageHeader,
  PrimaryButton,
  OutlineButton,
  WARDS,
} from "@/components/Shared"

const TYPES = [
  {
    id: "supply",
    label: "Supply Update",
    icon: "water_drop",
    color: "#0061a5",
    bg: "#e8f0fe",
  },
  {
    id: "outage",
    label: "Outage Notice",
    icon: "warning",
    color: "#991b1b",
    bg: "#fee2e2",
  },
  {
    id: "maintenance",
    label: "Maintenance Alert",
    icon: "build",
    color: "#166534",
    bg: "#dcfce7",
  },
  {
    id: "citizen",
    label: "Citizen Service",
    icon: "campaign",
    color: "#4b5563",
    bg: "#f3f4f6",
  },
]

const CHANNELS = ["SMS", "App Notification", "Email", "IVR Call"]

const TEMPLATES: Record<string, string> = {
  supply:
    "शिवाजी पेठ वॉर्डात उद्या {date} रोजी सकाळी {time} ते {endTime} पाणी पुरवठा नियोजित वेळेनुसार राहील. | Water supply in {ward} will proceed as scheduled tomorrow on {date} from {time} to {endTime}.",
  outage:
    "अपरिहार्य कारणामुळे जलवाहिनी दुरुस्तीसाठी {ward} भागात पाणीपुरवठा खंडित राहील. दिलगिरी व्यक्त करतो. | Due to emergency feeder line repairs, water supply in {ward} will remain temporarily suspended.",
  maintenance:
    "पाईपलाईन व व्हॉल्व्ह देखभाल कामासाठी {ward} मध्ये पाणीपुरवठा कमी दाबाने सुरू राहील. | Scheduled pipeline & valve maintenance in {ward}. Low pressure expected during work hours.",
  citizen:
    "नागरिकांसाठी सूचना: नवीन पाणी जोडणी व टँकर मागणीसाठी KMC पोर्टलचा वापर करावा. | Citizen Advisory: Use KMC Smart Portal for prompt water connection verification and tanker booking.",
}

export default function NotificationComposer() {
  const [notifType, setNotifType] = useState("supply")
  const [selectedWards, setSelectedWards] = useState<string[]>([
    "Shivaji Peth",
    "Rajarampuri",
  ])
  const [message, setMessage] = useState(TEMPLATES.supply)
  const [channels, setChannels] = useState<string[]>([
    "SMS",
    "App Notification",
  ])
  const [allWards, setAllWards] = useState(false)

  const toggleWard = (ward: string) => {
    setSelectedWards((prev) =>
      prev.includes(ward) ? prev.filter((w) => w !== ward) : [...prev, ward],
    )
  }
  const toggleChannel = (ch: string) => {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch],
    )
  }

  const handleTypeChange = (id: string) => {
    setNotifType(id)
    setMessage(TEMPLATES[id] ?? "")
  }

  return (
    <div>
      <PageHeader
        title="Notification Composer"
        subtitle="Create and broadcast water-supply, outage, maintenance, and citizen-service notifications"
      />

      <div className="max-w-4xl mx-auto space-y-4">
        {/* Type selector */}
        <Card className="p-4">
          <div className="text-sm font-semibold text-gray-700 mb-3">
            Notification Category
          </div>
          <div className="grid grid-cols-4 gap-3">
            {TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTypeChange(t.id)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all"
                style={
                  notifType === t.id
                    ? { borderColor: t.color, backgroundColor: t.bg }
                    : { borderColor: "#e5e7eb", backgroundColor: "#fafafa" }
                }
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: notifType === t.id ? t.bg : "#f3f4f6",
                  }}
                >
                  <span
                    className="material-symbols-outlined text-lg"
                    style={{ color: t.color }}
                  >
                    {t.icon}
                  </span>
                </div>
                <span
                  className="text-xs font-medium text-center"
                  style={{ color: notifType === t.id ? t.color : "#374151" }}
                >
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* Ward selection */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-semibold text-gray-700">
                Target Wards
              </div>
              <div className="text-xs text-gray-400">
                Select wards or choose city-wide broadcast
              </div>
            </div>
            <button
              onClick={() => {
                setAllWards(!allWards)
                setSelectedWards(allWards ? [] : [...WARDS])
              }}
              className="flex items-center gap-2 text-sm font-medium"
            >
              <div
                className={`w-9 h-5 rounded-full transition-colors flex items-center ${
                  allWards ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${
                    allWards ? "translate-x-4" : ""
                  }`}
                />
              </div>
              All Wards
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {WARDS.map((ward: string) => (
              <button
                key={ward}
                onClick={() => !allWards && toggleWard(ward)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                style={
                  selectedWards.includes(ward)
                    ? {
                        backgroundColor: "#0061a5",
                        color: "#fff",
                        borderColor: "#0061a5",
                      }
                    : {
                        backgroundColor: "#f9fafb",
                        color: "#374151",
                        borderColor: "#e5e7eb",
                      }
                }
              >
                {ward}
              </button>
            ))}
          </div>
        </Card>

        {/* Message */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-gray-700">
              Message Content
            </div>
            <div className="text-xs text-gray-400">
              {message.length} characters
            </div>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2"
            placeholder="Type your notification message in Marathi and/or English..."
          />
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-400">Templates:</span>
            {Object.entries(TEMPLATES).map(
              ([id, tmpl]) =>
                tmpl && (
                  <button
                    key={id}
                    onClick={() => setMessage(TEMPLATES[id])}
                    className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Load {TYPES.find((t) => t.id === id)?.label}
                  </button>
                ),
            )}
          </div>
        </Card>

        {/* Channels */}
        <Card className="p-4">
          <div className="text-sm font-semibold text-gray-700 mb-3">
            Delivery Channels
          </div>
          <div className="grid grid-cols-4 gap-3">
            {CHANNELS.map((ch) => (
              <label
                key={ch}
                className="flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all"
                style={
                  channels.includes(ch)
                    ? { borderColor: "#0061a5", backgroundColor: "#e8f0fe" }
                    : { borderColor: "#e5e7eb" }
                }
              >
                <input
                  type="checkbox"
                  checked={channels.includes(ch)}
                  onChange={() => toggleChannel(ch)}
                  className="accent-blue-600"
                />
                <span className="text-xs font-medium text-gray-700">{ch}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <OutlineButton icon="save">Save Draft</OutlineButton>
          <PrimaryButton icon="send">Send Notification</PrimaryButton>
        </div>
      </div>
    </div>
  )
}
