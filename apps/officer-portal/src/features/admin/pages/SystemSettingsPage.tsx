import { useState } from "react"
import {
  Card,
  PageHeader,
  PrimaryButton,
  OutlineButton,
} from "@/components/Shared"

export default function SystemSettings() {
  const [org, setOrg] = useState({
    name: "Kolhapur Municipal Corporation",
    dept: "Water Supply Department",
    address: "Town Hall, Tarabai Park, Kolhapur - 416003, Maharashtra",
    phone: "0231-2543200",
    email: "water@kolhapurcorporation.gov.in",
    website: "www.kolhapurcorporation.gov.in",
    contactName: "Shri Suresh Patil",
    designation: "Executive Engineer, Water Supply",
  })

  const [notifPrefs, setNotifPrefs] = useState({
    smsEnabled: true,
    appEnabled: true,
    emailEnabled: true,
    ivrEnabled: false,
    autoOutageNotify: true,
    autoFloodAlert: true,
    autoNRWAlert: false,
    billReminder: true,
    reminderDays: "5",
  })

  const [thresholds, setThresholds] = useState({
    nrwCritical: "30",
    nrwHigh: "22",
    nrwTarget: "15",
    floodMinor: "2.5",
    floodModerate: "4.0",
    floodMajor: "5.5",
    pressureMin: "7",
    pressureNormal: "10",
    reservoirLow: "20",
    reservoirCritical: "10",
    complaintSLA: "48",
    tankerSLA: "4",
  })

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <PageHeader
        title="System Settings"
        subtitle="Organization details, notification preferences, and alert thresholds"
        actions={
          <>
            <OutlineButton icon="refresh">Reset to Defaults</OutlineButton>
            <PrimaryButton icon="save" onClick={handleSave}>
              Save Settings
            </PrimaryButton>
          </>
        }
      />

      {saved && (
        <div className="mb-4 p-3 rounded-xl flex items-center gap-3 bg-green-50 border border-green-200">
          <span className="material-symbols-outlined text-green-600">
            check_circle
          </span>
          <span className="text-sm text-green-800 font-medium">
            Settings saved successfully.
          </span>
        </div>
      )}

      <div className="space-y-6">
        {/* Organization Details */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#e8f0fe" }}
            >
              <span
                className="material-symbols-outlined text-lg"
                style={{ color: "#0061a5" }}
              >
                business
              </span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                Organization Details
              </div>
              <div className="text-xs text-gray-400">
                Basic information about KMC Water Department
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: "Organization Name",
                key: "name",
                placeholder: "Municipal Corporation name",
              },
              {
                label: "Department",
                key: "dept",
                placeholder: "Department name",
              },
              {
                label: "Official Phone",
                key: "phone",
                placeholder: "Phone number",
              },
              {
                label: "Official Email",
                key: "email",
                placeholder: "Email address",
              },
              { label: "Website", key: "website", placeholder: "Website URL" },
              {
                label: "Contact Officer",
                key: "contactName",
                placeholder: "Name",
              },
              {
                label: "Designation",
                key: "designation",
                placeholder: "Designation",
              },
            ].map((f) => (
              <div
                key={f.key}
                className={
                  f.key === "dept" || f.key === "designation" ? "" : ""
                }
              >
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {f.label}
                </label>
                <input
                  value={org[(f.key as keyof typeof org)]}
                  onChange={(e) => setOrg({ ...org, [f.key]: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2"
                  placeholder={f.placeholder}
                />
              </div>
            ))}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Office Address
              </label>
              <textarea
                value={org.address}
                onChange={(e) => setOrg({ ...org, address: e.target.value })}
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm resize-none"
              />
            </div>
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#e8f0fe" }}
            >
              <span
                className="material-symbols-outlined text-lg"
                style={{ color: "#0061a5" }}
              >
                notifications
              </span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                Notification Preferences
              </div>
              <div className="text-xs text-gray-400">
                Configure default notification channels and auto-send rules
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-3">
                Delivery Channels
              </div>
              <div className="space-y-3">
                {[
                  {
                    key: "smsEnabled",
                    label: "SMS Notifications",
                    desc: "Send via SMS gateway (SMSC)",
                  },
                  {
                    key: "appEnabled",
                    label: "App Push Notifications",
                    desc: "KMC Citizen App notifications",
                  },
                  {
                    key: "emailEnabled",
                    label: "Email Notifications",
                    desc: "Email via SMTP relay",
                  },
                  {
                    key: "ivrEnabled",
                    label: "IVR Voice Calls",
                    desc: "Automated voice call alerts",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-400">{item.desc}</div>
                    </div>
                    <button
                      onClick={() =>
                        setNotifPrefs((p) => ({
                          ...p,
                          [item.key]: !p[(item.key as keyof typeof p)],
                        }))
                      }
                      className={`w-10 h-5.5 rounded-full transition-colors flex items-center p-0.5 ${
                        notifPrefs[(item.key as keyof typeof notifPrefs)]
                          ? "bg-blue-600"
                          : "bg-gray-300"
                      }`}
                      style={{ height: 22, width: 40 }}
                    >
                      <div
                        className={`w-4.5 h-4 bg-white rounded-full shadow transition-transform ${
                          notifPrefs[(item.key as keyof typeof notifPrefs)]
                            ? "translate-x-4.5"
                            : "translate-x-0"
                        }`}
                        style={{
                          width: 18,
                          height: 18,
                          transform: notifPrefs[
                            (item.key as keyof typeof notifPrefs)
                          ]
                            ? "translateX(18px)"
                            : "translateX(0px)",
                        }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700 mb-3">
                Auto-Send Rules
              </div>
              <div className="space-y-3">
                {[
                  {
                    key: "autoOutageNotify",
                    label: "Auto-notify on Outage",
                    desc: "Send to affected wards automatically",
                  },
                  {
                    key: "autoFloodAlert",
                    label: "Auto Flood Alerts",
                    desc: "When river level exceeds threshold",
                  },
                  {
                    key: "autoNRWAlert",
                    label: "Auto NRW Alerts",
                    desc: "When NRW exceeds critical threshold",
                  },
                  {
                    key: "billReminder",
                    label: "Bill Payment Reminders",
                    desc: `${notifPrefs.reminderDays} days before due date`,
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-400">{item.desc}</div>
                    </div>
                    <button
                      onClick={() =>
                        setNotifPrefs((p) => ({
                          ...p,
                          [item.key]: !p[(item.key as keyof typeof p)],
                        }))
                      }
                      className="flex items-center p-0.5 rounded-full transition-colors"
                      style={{
                        height: 22,
                        width: 40,
                        backgroundColor: notifPrefs[
                          (item.key as keyof typeof notifPrefs)
                        ]
                          ? "#2563eb"
                          : "#d1d5db",
                      }}
                    >
                      <div
                        className="w-4 h-4 bg-white rounded-full shadow transition-transform"
                        style={{
                          transform: notifPrefs[
                            (item.key as keyof typeof notifPrefs)
                          ]
                            ? "translateX(18px)"
                            : "translateX(0px)",
                        }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Threshold Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#fef3c7" }}
            >
              <span className="material-symbols-outlined text-lg text-amber-600">
                tune
              </span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                Alert Thresholds
              </div>
              <div className="text-xs text-gray-400">
                Configure trigger values for NRW, flood, pressure, and SLA
                alerts
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                NRW Thresholds (%)
              </div>
              <div className="space-y-3">
                {[
                  { key: "nrwTarget", label: "Target NRW %", color: "#16a34a" },
                  {
                    key: "nrwHigh",
                    label: "High Alert Threshold",
                    color: "#d97706",
                  },
                  {
                    key: "nrwCritical",
                    label: "Critical Threshold",
                    color: "#ba1a1a",
                  },
                ].map((f) => (
                  <div key={f.key}>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-gray-600">{f.label}</label>
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: f.color }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={thresholds[(f.key as keyof typeof thresholds)]}
                        onChange={(e) =>
                          setThresholds({
                            ...thresholds,
                            [f.key]: e.target.value,
                          })
                        }
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                        min="0"
                        max="60"
                      />
                      <span className="text-sm text-gray-400">%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Flood Levels (metres)
              </div>
              <div className="space-y-3">
                {[
                  {
                    key: "floodMinor",
                    label: "Minor Flood Level",
                    color: "#ca8a04",
                  },
                  {
                    key: "floodModerate",
                    label: "Moderate Flood",
                    color: "#d97706",
                  },
                  {
                    key: "floodMajor",
                    label: "Major Flood (Red)",
                    color: "#ba1a1a",
                  },
                ].map((f) => (
                  <div key={f.key}>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-gray-600">{f.label}</label>
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: f.color }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={thresholds[(f.key as keyof typeof thresholds)]}
                        onChange={(e) =>
                          setThresholds({
                            ...thresholds,
                            [f.key]: e.target.value,
                          })
                        }
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                        step="0.1"
                      />
                      <span className="text-sm text-gray-400">m</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                SLA & Operations
              </div>
              <div className="space-y-3">
                {[
                  { key: "pressureMin", label: "Min. Pressure (m)", unit: "m" },
                  {
                    key: "reservoirLow",
                    label: "Reservoir Low Alert",
                    unit: "%",
                  },
                  {
                    key: "reservoirCritical",
                    label: "Reservoir Critical",
                    unit: "%",
                  },
                  { key: "complaintSLA", label: "Complaint SLA", unit: "hrs" },
                  {
                    key: "tankerSLA",
                    label: "Tanker Dispatch SLA",
                    unit: "hrs",
                  },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs text-gray-600 mb-1">
                      {f.label}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={thresholds[(f.key as keyof typeof thresholds)]}
                        onChange={(e) =>
                          setThresholds({
                            ...thresholds,
                            [f.key]: e.target.value,
                          })
                        }
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                      />
                      <span className="text-sm text-gray-400 w-8">
                        {f.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* System Info */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#f3f4f6" }}
            >
              <span className="material-symbols-outlined text-lg text-gray-600">
                info
              </span>
            </div>
            <div className="font-semibold text-gray-900">
              System Information
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Portal Version", value: "v2.4.1" },
              { label: "Last Updated", value: "01 Sep 2024" },
              { label: "Database", value: "PostgreSQL 15.2" },
              { label: "Environment", value: "Production" },
              { label: "Uptime", value: "99.84%" },
              { label: "Storage Used", value: "142 GB / 500 GB" },
              { label: "Active Users", value: "8 / 25 licensed" },
              { label: "API Status", value: "● Operational" },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-xl bg-gray-50">
                <div className="text-xs text-gray-400">{s.label}</div>
                <div className="text-sm font-semibold text-gray-800 mt-0.5">
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
