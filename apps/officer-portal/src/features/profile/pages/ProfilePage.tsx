import { useState } from "react"
import {
  Card,
  PageHeader,
  PrimaryButton,
  OutlineButton,
  Badge,
  Modal,
  FormField,
} from "@/components/Shared"

interface ProfileData {
  name: string
  designation: string
  department: string
  wardZone: string
  email: string
  phone: string
  officeLocation: string
  employeeId: string
  role: string
  accountStatus: string
  joinedDate: string
  lastLogin: string
  emergencyContact: string
  languagePreference: string
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData>({
    name: "Suresh Patil",
    designation: "Executive Water Works Officer",
    department: "Water Supply & Sewerage Department (KMC)",
    wardZone: "Central Administrative Zone (All Kolhapur Wards)",
    email: "suresh.patil@kmcwater.gov.in",
    phone: "+91 98765 43210",
    officeLocation:
      "KMC Main Administrative Building, Bhausinghji Road, Kolhapur 416002",
    employeeId: "KMC-WW-0104",
    role: "Officer / Municipal Administrator",
    accountStatus: "Active & Verified",
    joinedDate: "01 Apr 2019",
    lastLogin: "Today, 08:12 AM (IP: 10.20.44.18)",
    emergencyContact: "+91 98220 12345 (Control Room Dispatch)",
    languagePreference: "Marathi / English (द्विभाषिक)",
  })

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editForm, setEditForm] = useState<ProfileData>(profile)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleOpenEdit = () => {
    setEditForm(profile)
    setIsEditOpen(true)
  }

  const handleSave = () => {
    setProfile(editForm)
    setIsEditOpen(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Officer Profile"
        subtitle="Manage personal, departmental, contact, and system access details"
        actions={
          <PrimaryButton icon="edit" onClick={handleOpenEdit}>
            Edit Profile
          </PrimaryButton>
        }
      />

      {saveSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-green-600">
            check_circle
          </span>
          Profile details updated successfully.
        </div>
      )}

      {/* Main Hero Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-md"
              style={{ backgroundColor: "#002045" }}
            >
              SP
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-white"
              title="Active"
            >
              <span className="material-symbols-outlined text-sm">check</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                {profile.designation}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                {profile.accountStatus}
              </span>
            </div>

            <div className="text-sm text-gray-600 mt-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-gray-400">
                corporate_fare
              </span>
              {profile.department}
            </div>

            <div className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-gray-400">
                location_on
              </span>
              {profile.wardZone}
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <OutlineButton icon="badge" onClick={handleOpenEdit}>
              Update Details
            </OutlineButton>
          </div>
        </div>
      </Card>

      {/* Detailed Grid: Contact & Department / Account Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact & Department Information */}
        <Card className="p-5">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
            <span className="material-symbols-outlined text-blue-700">
              contacts
            </span>
            <h3 className="font-semibold text-gray-900">
              Contact & Department Information
            </h3>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Official Email
              </div>
              <div className="font-medium text-gray-800 mt-0.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400 text-sm">
                  mail
                </span>
                {profile.email}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Mobile Contact
              </div>
              <div className="font-medium text-gray-800 mt-0.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400 text-sm">
                  call
                </span>
                {profile.phone}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Department
              </div>
              <div className="font-medium text-gray-800 mt-0.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400 text-sm">
                  domain
                </span>
                {profile.department}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Assigned Ward / Zone
              </div>
              <div className="font-medium text-gray-800 mt-0.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400 text-sm">
                  map
                </span>
                {profile.wardZone}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Office Location
              </div>
              <div className="font-medium text-gray-800 mt-0.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400 text-sm">
                  home_work
                </span>
                {profile.officeLocation}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Emergency Dispatch Contact
              </div>
              <div className="font-medium text-gray-800 mt-0.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400 text-sm">
                  emergency
                </span>
                {profile.emergencyContact}
              </div>
            </div>
          </div>
        </Card>

        {/* Account & Security Information */}
        <Card className="p-5">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
            <span className="material-symbols-outlined text-blue-700">
              shield_person
            </span>
            <h3 className="font-semibold text-gray-900">
              Account & Security Information
            </h3>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Employee ID
              </div>
              <div className="font-medium text-gray-800 mt-0.5 font-mono">
                {profile.employeeId}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                System Role
              </div>
              <div className="font-medium text-gray-800 mt-0.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-sm">
                  verified_user
                </span>
                {profile.role}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Portal Joining Date
              </div>
              <div className="font-medium text-gray-800 mt-0.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400 text-sm">
                  calendar_today
                </span>
                {profile.joinedDate}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Last Login Session
              </div>
              <div className="font-medium text-gray-800 mt-0.5 flex items-center gap-2 text-xs">
                <span className="material-symbols-outlined text-gray-400 text-sm">
                  history
                </span>
                {profile.lastLogin}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Portal Language Preference
              </div>
              <div className="font-medium text-gray-800 mt-0.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400 text-sm">
                  translate
                </span>
                {profile.languagePreference}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Two-Factor Authentication
              </div>
              <div className="font-medium text-emerald-700 mt-0.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-600 text-sm">
                  lock
                </span>
                Enabled (KMC Gov Mobile OTP)
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Operational Responsibilities */}
      <Card className="p-5">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100">
          <span className="material-symbols-outlined text-blue-700">
            engineering
          </span>
          <h3 className="font-semibold text-gray-900">
            Operational Responsibilities
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
            <div className="text-xs font-semibold text-blue-900 flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-blue-600 text-base">
                water_drop
              </span>
              Supply & Outage Approvals
            </div>
            <div className="text-xs text-gray-600">
              Authorized to publish ward supply shifts, approve maintenance
              shutdowns, and trigger citizen notices.
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <div className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-emerald-600 text-base">
                leak_add
              </span>
              NRW & Leakage Governance
            </div>
            <div className="text-xs text-gray-600">
              Oversees DMAs, flow accounting, pressure stabilization, and
              telemetry across all 17 municipal wards.
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100">
            <div className="text-xs font-semibold text-purple-900 flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-purple-600 text-base">
                local_shipping
              </span>
              Service & Citizen Requests
            </div>
            <div className="text-xs text-gray-600">
              Supervises municipal water tanker dispatches and new
              residential/commercial connection verifications.
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Profile Details"
        width="max-w-xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full Name">
              <input
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
              />
            </FormField>

            <FormField label="Designation">
              <input
                type="text"
                value={editForm.designation}
                onChange={(e) =>
                  setEditForm({ ...editForm, designation: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
              />
            </FormField>

            <FormField label="Official Email">
              <input
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
              />
            </FormField>

            <FormField label="Phone Number">
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
              />
            </FormField>

            <FormField label="Department">
              <input
                type="text"
                value={editForm.department}
                onChange={(e) =>
                  setEditForm({ ...editForm, department: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
              />
            </FormField>

            <FormField label="Assigned Ward / Zone">
              <input
                type="text"
                value={editForm.wardZone}
                onChange={(e) =>
                  setEditForm({ ...editForm, wardZone: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
              />
            </FormField>
          </div>

          <FormField label="Office Address">
            <input
              type="text"
              value={editForm.officeLocation}
              onChange={(e) =>
                setEditForm({ ...editForm, officeLocation: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
            />
          </FormField>

          <FormField label="Emergency Contact">
            <input
              type="text"
              value={editForm.emergencyContact}
              onChange={(e) =>
                setEditForm({ ...editForm, emergencyContact: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <OutlineButton onClick={() => setIsEditOpen(false)}>
              Cancel
            </OutlineButton>
            <PrimaryButton icon="save" onClick={handleSave}>
              Save Changes
            </PrimaryButton>
          </div>
        </div>
      </Modal>
    </div>
  )
}
