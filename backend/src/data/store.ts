// TEMPORARY in-memory persistence.
// This module is an implementation detail of the repository layer ONLY:
// route handlers and services must never import it — they go through
// src/repositories/*. When Person 4's Prisma + PostgreSQL client lands,
// each repository's internals are swapped to Prisma calls; this file is
// deleted and no route/service file changes.
//
// Table mapping is documented per collection (all tables MISSING from
// infra/database — flagged in README-officer.md).
import bcrypt from "bcryptjs"
import type {
  Alert,
  AuditLog,
  Bill,
  CitizenRecord,
  Complaint,
  GaugeStation,
  LeakageIncident,
  MaintenanceTask,
  Notice,
  NRWZoneMetric,
  OfficerUser,
  Outage,
  RainfallData,
  RolePermissions,
  ServiceRequest,
  SupplyScheduleItem,
  SystemSettingsConfig,
  UsageDataPoint,
  Ward,
  WaterConnectionApplication,
  WorkOrder,
} from "@water/types"
import type { OfficerCredential, WardStats } from "../domain"

// officer_users (MISSING)
export const officers: OfficerUser[] = [
  {
    id: "USR-001",
    name: "Suresh Patil",
    email: "suresh.patil@kmcwater.gov.in",
    phone: "+91 98220 12345",
    role: "Admin",
    department: "Water Supply Operations",
    zone: "Central Zone",
    status: "Active",
    lastActive: "Online now",
  },
  {
    id: "USR-002",
    name: "Anil Jadhav",
    email: "anil.jadhav@kmcwater.gov.in",
    phone: "+91 98220 23456",
    role: "Engineer",
    department: "Pipeline Maintenance",
    zone: "East Zone",
    status: "Active",
    lastActive: "15m ago",
  },
  {
    id: "USR-003",
    name: "Deepak Kulkarni",
    email: "deepak.k@kmcwater.gov.in",
    phone: "+91 98220 34567",
    role: "Supervisor",
    department: "Distribution & Valves",
    zone: "South Zone",
    status: "Active",
    lastActive: "1h ago",
  },
  {
    id: "USR-004",
    name: "Priya Shinde",
    email: "priya.s@kmcwater.gov.in",
    phone: "+91 98220 45678",
    role: "Supervisor",
    department: "Consumer Grievance",
    zone: "Central Zone",
    status: "Active",
    lastActive: "45m ago",
  },
]
// Dev-only credentials: every seed officer logs in with Password123!
export const officerCredentials: Record<string, OfficerCredential> = {}
for (const o of officers) {
  officerCredentials[o.email.toLowerCase()] = {
    hash: bcrypt.hashSync("Password123!", 10),
    officerId: o.id,
  }
}

// complaints (MISSING)
export const complaints: Complaint[] = [
  {
    id: "CMP-2024-0891",
    type: "Leakage",
    citizen: "Ramesh Shinde",
    ward: "Kasba Bawada",
    address: "Plot 14, Sector 4, Kasba Bawada",
    location: "Kasba Bawada Chowk",
    phone: "9876543210",
    reported: "11 Sep, 07:40",
    date: "11 Sep 2026",
    assigned: "Anil Jadhav",
    priority: "Critical",
    status: "In Progress",
    description:
      "Major pipeline burst near Kasba Bawada chowk. Road flooded. Water flowing into shops.",
    updated: "11 Sep, 09:00",
    icon: "water_damage",
    timeline: [
      {
        status: "Reported",
        time: "11 Sep, 07:40",
        note: "Complaint logged via Citizen Portal",
      },
      {
        status: "Assigned",
        time: "11 Sep, 08:10",
        note: "Assigned to Ward Engineer Anil Jadhav",
      },
      {
        status: "In Progress",
        time: "11 Sep, 09:00",
        note: "Field team dispatched with excavation equipment",
      },
    ],
    messages: [
      {
        sender: "Citizen",
        time: "07:40 AM",
        text: "Water is gushing out of the main valve near the grocery store.",
      },
      {
        sender: "Anil Jadhav",
        time: "08:15 AM",
        text: "Our maintenance van is en route. Isolating feeder valve 4B.",
        isOfficer: true,
      },
    ],
  },
  {
    id: "CMP-2024-0890",
    type: "Low Pressure",
    citizen: "Sunita Patil",
    ward: "Rajarampuri",
    address: "B-12, Green Park Apts, 5th Lane",
    location: "5th Lane, Rajarampuri",
    phone: "9822334455",
    reported: "11 Sep, 06:15",
    date: "11 Sep 2026",
    assigned: "Deepak Kulkarni",
    priority: "High",
    status: "In Progress",
    description:
      "Pressure barely 0.3 bar since yesterday morning. Overhead tanks not filling.",
    updated: "11 Sep, 08:30",
    icon: "compress",
    timeline: [
      {
        status: "Reported",
        time: "11 Sep, 06:15",
        note: "Grievance submitted",
      },
      {
        status: "In Progress",
        time: "11 Sep, 08:30",
        note: "Pressure log checked. Booster pump scheduled for inspection.",
      },
    ],
  },
  {
    id: "CMP-2024-0889",
    type: "Dirty Water",
    citizen: "Mahesh Jadhav",
    ward: "Shahupuri",
    address: "Near Old Post Office, Shahupuri",
    location: "Shahupuri 3rd Lane",
    phone: "9423112233",
    reported: "10 Sep, 18:20",
    date: "10 Sep 2026",
    assigned: "Rajesh Kadam",
    priority: "Critical",
    status: "Open",
    description:
      "Brown muddy water from tap for past 2 days. Multiple households affected in lane 3.",
    updated: "10 Sep, 18:20",
    icon: "science",
  },
  {
    id: "CMP-2024-0888",
    type: "Billing Dispute",
    citizen: "Prakash Mane",
    ward: "Tarabai Park",
    address: "Flat 402, Sai Residency",
    location: "Tarabai Park",
    phone: "9890123456",
    reported: "10 Sep, 14:10",
    date: "10 Sep 2026",
    assigned: "Priya Shinde",
    priority: "Medium",
    status: "In Progress",
    description:
      "Bill amount 3x average without change in consumption. Meter inspection requested.",
    updated: "11 Sep, 07:00",
    icon: "receipt_long",
  },
  {
    id: "CMP-2024-0887",
    type: "No Supply",
    citizen: "Kavita Desai",
    ward: "Mangalwar Peth",
    address: "House 88, Near Maruti Temple",
    location: "Mangalwar Peth",
    phone: "9765432109",
    reported: "10 Sep, 11:30",
    date: "10 Sep 2026",
    assigned: "Deepak Kulkarni",
    priority: "High",
    status: "Resolved",
    description:
      "No supply for 3 consecutive scheduled slots. Valve stuck closed in branch line.",
    updated: "10 Sep, 16:45",
    icon: "do_not_disturb",
  },
]

// work_orders (MISSING — new table needed)
export const workOrders: WorkOrder[] = [
  {
    id: "WO-2026-001",
    complaintId: "CMP-2024-0891",
    title: "Repair feeder valve 4B — Kasba Bawada",
    ward: "Kasba Bawada",
    assignedTo: "Anil Jadhav",
    priority: "Critical",
    status: "In Progress",
    createdAt: "11 Sep 2026, 08:10",
    updatedAt: "11 Sep 2026, 09:00",
    notes: "Excavation equipment dispatched",
  },
  {
    id: "WO-2026-002",
    complaintId: "CMP-2024-0890",
    title: "Booster pump inspection — Rajarampuri",
    ward: "Rajarampuri",
    assignedTo: "Deepak Kulkarni",
    priority: "High",
    status: "Open",
    createdAt: "11 Sep 2026, 08:30",
    updatedAt: "11 Sep 2026, 08:30",
    notes: "",
  },
]

// supply_schedules (MISSING)
export const supplySchedule: SupplyScheduleItem[] = [
  {
    ward: "Shivaji Peth",
    zone: "Central",
    scheduled: "06:00–09:00",
    actual: "06:00–09:10",
    pressure: 82,
    status: "On Time",
  },
  {
    ward: "Rajarampuri",
    zone: "North",
    scheduled: "07:00–10:00",
    actual: "07:12–10:05",
    pressure: 78,
    status: "Delayed",
  },
  {
    ward: "Kasba Bawada",
    zone: "East",
    scheduled: "17:00–20:00",
    actual: "—",
    pressure: 48,
    status: "Disrupted",
  },
  {
    ward: "Shahupuri",
    zone: "Central",
    scheduled: "06:00–09:00",
    actual: "06:00–09:00",
    pressure: 88,
    status: "On Time",
  },
  {
    ward: "Laxmipuri",
    zone: "South",
    scheduled: "05:30–08:30",
    actual: "05:30–08:35",
    pressure: 80,
    status: "On Time",
  },
  {
    ward: "Mangalwar Peth",
    zone: "Central",
    scheduled: "06:00–09:00",
    actual: "06:18–09:00",
    pressure: 54,
    status: "Delayed",
  },
  {
    ward: "Tarabai Park",
    zone: "North",
    scheduled: "06:00–10:00",
    actual: "06:00–10:00",
    pressure: 84,
    status: "On Time",
  },
  {
    ward: "Rankala",
    zone: "West",
    scheduled: "07:00–09:00",
    actual: "07:00–09:00",
    pressure: 86,
    status: "On Time",
  },
]

// outages (MISSING)
export const outages: Outage[] = [
  {
    id: "OUT-2024-089",
    ward: "Kasba Bawada",
    zone: "East Zone",
    reason: "Emergency feeder line valve breakdown",
    type: "Emergency",
    startTime: "Today, 07:15 AM",
    estimatedRestoration: "Today, 03:00 PM",
    status: "Active",
    affectedPopulation: 14800,
    tankersDispatched: 4,
  },
  {
    id: "OUT-2024-088",
    ward: "Mangalwar Peth",
    zone: "Central Zone",
    reason: "Planned reservoir scrubbing & chlorination",
    type: "Scheduled",
    startTime: "Tomorrow, 06:00 AM",
    estimatedRestoration: "Tomorrow, 01:00 PM",
    status: "Scheduled",
    affectedPopulation: 13400,
    tankersDispatched: 2,
  },
  {
    id: "OUT-2024-087",
    ward: "Laxmipuri",
    zone: "South Zone",
    reason: "Distribution ring main joint replacement",
    type: "Emergency",
    startTime: "Yesterday, 10:00 AM",
    estimatedRestoration: "Yesterday, 04:30 PM",
    status: "Resolved",
    affectedPopulation: 17200,
    tankersDispatched: 3,
  },
]

// maintenance_tasks (MISSING)
export const maintenanceTasks: MaintenanceTask[] = [
  {
    id: "MNT-091",
    title: "Main pump station overhaul - Kasba Bawada",
    type: "Preventive",
    ward: "Kasba Bawada",
    scheduledDate: "Today",
    status: "In Progress",
    priority: "High",
    assignedTeam: "Unit A - Mechanical",
  },
  {
    id: "MNT-092",
    title: "Valve chamber cleaning & greasing",
    type: "Preventive",
    ward: "Shivaji Peth",
    scheduledDate: "12 Sep 2026",
    status: "Scheduled",
    priority: "Medium",
    assignedTeam: "Unit B - Pipeline",
  },
  {
    id: "MNT-093",
    title: "Telemetry sensor calibration",
    type: "Inspection",
    ward: "Rankala",
    scheduledDate: "13 Sep 2026",
    status: "Scheduled",
    priority: "Low",
    assignedTeam: "SCADA Automation",
  },
  {
    id: "MNT-094",
    title: "Booster pump impellor replacement",
    type: "Corrective",
    ward: "Rajarampuri",
    scheduledDate: "10 Sep 2026",
    status: "Completed",
    priority: "Critical",
    assignedTeam: "Emergency Response",
  },
]

// nrw_zones (MISSING)
export const nrwMetrics: NRWZoneMetric[] = [
  {
    zone: "East Zone",
    inputVolumeKL: 1250,
    billedVolumeKL: 880,
    nrwVolumeKL: 370,
    nrwPercentage: 29.6,
    targetPercentage: 15.0,
    trend: "+1.2%",
  },
  {
    zone: "Central Zone",
    inputVolumeKL: 1640,
    billedVolumeKL: 1290,
    nrwVolumeKL: 350,
    nrwPercentage: 21.3,
    targetPercentage: 15.0,
    trend: "-0.8%",
  },
  {
    zone: "North Zone",
    inputVolumeKL: 980,
    billedVolumeKL: 820,
    nrwVolumeKL: 160,
    nrwPercentage: 16.3,
    targetPercentage: 15.0,
    trend: "-1.4%",
  },
  {
    zone: "South Zone",
    inputVolumeKL: 820,
    billedVolumeKL: 660,
    nrwVolumeKL: 160,
    nrwPercentage: 19.5,
    targetPercentage: 15.0,
    trend: "+0.4%",
  },
  {
    zone: "West Zone",
    inputVolumeKL: 710,
    billedVolumeKL: 590,
    nrwVolumeKL: 120,
    nrwPercentage: 16.9,
    targetPercentage: 15.0,
    trend: "-0.2%",
  },
]

// sensor_telemetry — leakage incidents (MISSING)
export const leakageIncidents: LeakageIncident[] = [
  {
    id: "LK-2026-042",
    location: "Kasba Bawada Main Chowk",
    ward: "Kasba Bawada",
    detectedAt: "11 Sep, 07:30",
    estimatedLossLPS: 18.5,
    severity: "Critical",
    status: "Assigned",
    dma: "DMA-04",
  },
  {
    id: "LK-2026-041",
    location: "Shahupuri 2nd Cross",
    ward: "Shahupuri",
    detectedAt: "10 Sep, 16:15",
    estimatedLossLPS: 6.2,
    severity: "Moderate",
    status: "Investigating",
    dma: "DMA-02",
  },
  {
    id: "LK-2026-040",
    location: "Rankala Lake Road",
    ward: "Rankala",
    detectedAt: "08 Sep, 09:00",
    estimatedLossLPS: 12.0,
    severity: "Severe",
    status: "Repaired",
    dma: "DMA-07",
  },
]

// ward_stats (MISSING) — per-ward aggregates backing analysis + comparison.
export const wardStats: Record<string, WardStats> = {
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

// citizens (MISSING)
export const citizens: CitizenRecord[] = [
  {
    id: "CIT-01",
    consumerNumber: "KMC-CON-90214",
    name: "Sunita Anand Patil",
    phone: "9876543210",
    email: "sunita.patil@gmail.com",
    ward: "Ward 12 - Rankala",
    address: "Plot 12, Lake View Colony, Rankala",
    connectionType: "Domestic",
    meterNumber: "MTR-7721",
    status: "Active",
    currentBalance: 420,
  },
  {
    id: "CIT-02",
    consumerNumber: "KMC-CON-88412",
    name: "Rajendra Deshmukh",
    phone: "9822114477",
    email: "rajendra.d@yahoo.com",
    ward: "Ward 04 - Rajarampuri",
    address: "B-4, 7th Lane, Rajarampuri",
    connectionType: "Commercial",
    meterNumber: "MTR-8104",
    status: "Active",
    currentBalance: 1850,
  },
  {
    id: "CIT-03",
    consumerNumber: "KMC-CON-77631",
    name: "Vandana Shinde",
    phone: "9422001122",
    email: "vandana.shinde@rediffmail.com",
    ward: "Ward 08 - Shahupuri",
    address: "House 45, Near Post Office",
    connectionType: "Domestic",
    meterNumber: "MTR-6430",
    status: "Active",
    currentBalance: 0,
  },
]

// connection_applications (MISSING)
export const connectionApplications: WaterConnectionApplication[] = [
  {
    id: "APP-2026-104",
    applicantName: "Sachin Gaikwad",
    ward: "Kasba Bawada",
    address: "Survey 41/2, Near Sugar Mill",
    type: "Domestic",
    appliedDate: "09 Sep 2026",
    status: "Under Review",
  },
  {
    id: "APP-2026-103",
    applicantName: "Hotel Panchganga Deluxe",
    ward: "Shahupuri",
    address: "Station Road",
    type: "Commercial",
    appliedDate: "05 Sep 2026",
    status: "Site Inspection",
    approvedBy: "Suresh Patil",
  },
  {
    id: "APP-2026-102",
    applicantName: "Pooja Kulkarni",
    ward: "Tarabai Park",
    address: "Flat 101, Anand Vihar",
    type: "Domestic",
    appliedDate: "28 Aug 2026",
    status: "Approved",
    approvedBy: "Suresh Patil",
  },
]

// service_requests (MISSING)
export const serviceRequests: ServiceRequest[] = [
  {
    id: "SR-2024-0441",
    citizenName: "Prakash Mane",
    phone: "9890123456",
    ward: "Kasba Bawada",
    address: "Plot 14, Kasba Bawada",
    serviceType: "Tanker Request",
    requestedDate: "Today, 08:30 AM",
    status: "En Route",
    vehicleNumber: "MH-09-T-4521",
    driverName: "Ravi Kamble",
  },
  {
    id: "SR-2024-0440",
    citizenName: "Anand Kadam",
    phone: "9765432100",
    ward: "Rajarampuri",
    address: "Lane 3, Bungalow 5",
    serviceType: "Pressure Check",
    requestedDate: "Yesterday",
    status: "Assigned",
  },
  {
    id: "SR-2024-0439",
    citizenName: "Shalini Joshi",
    phone: "9422331122",
    ward: "Shivaji Peth",
    address: "Near Vithal Temple",
    serviceType: "Water Quality Testing",
    requestedDate: "09 Sep 2026",
    status: "Completed",
    notes: "Potability verified. Residual chlorine 0.4 ppm.",
  },
]

// wards (MISSING)
export const wards: Ward[] = [
  {
    id: "ward-01",
    name: "Shivaji Peth",
    zone: "Central",
    population: 18500,
    households: 4200,
    coveragePct: 98,
    supplyHours: "06:00–09:00",
    status: "Normal",
  },
  {
    id: "ward-02",
    name: "Rajarampuri",
    zone: "North",
    population: 22000,
    households: 5100,
    coveragePct: 99,
    supplyHours: "07:00–10:00",
    status: "Normal",
  },
  {
    id: "ward-03",
    name: "Kasba Bawada",
    zone: "East",
    population: 14800,
    households: 3400,
    coveragePct: 82,
    supplyHours: "17:00–20:00",
    status: "Disrupted",
  },
  {
    id: "ward-04",
    name: "Shahupuri",
    zone: "Central",
    population: 26000,
    households: 6000,
    coveragePct: 100,
    supplyHours: "06:00–09:00",
    status: "Normal",
  },
  {
    id: "ward-05",
    name: "Laxmipuri",
    zone: "South",
    population: 19800,
    households: 4600,
    coveragePct: 98,
    supplyHours: "05:30–08:30",
    status: "Normal",
  },
  {
    id: "ward-06",
    name: "Mangalwar Peth",
    zone: "Central",
    population: 13400,
    households: 3100,
    coveragePct: 85,
    supplyHours: "06:00–09:00",
    status: "Watch",
  },
  {
    id: "ward-07",
    name: "Tarabai Park",
    zone: "North",
    population: 17200,
    households: 4000,
    coveragePct: 99,
    supplyHours: "06:00–10:00",
    status: "Normal",
  },
  {
    id: "ward-08",
    name: "Rankala",
    zone: "West",
    population: 15600,
    households: 3600,
    coveragePct: 100,
    supplyHours: "07:00–09:00",
    status: "Normal",
  },
]

// alerts + notices (MISSING)
export const alerts: Alert[] = [
  {
    id: 1,
    severity: "critical",
    icon: "warning",
    title: "Emergency Water Outage",
    body: "Due to a major pipeline burst on Shahupuri Ring Road, water supply to Wards 10–14 is suspended until further notice. Emergency tankers deployed.",
    time: "Today, 9:15 AM",
    targetWards: ["Kasba Bawada", "Shahupuri"],
  },
  {
    id: 2,
    severity: "warning",
    icon: "construction",
    title: "Planned Maintenance — Sept 12",
    body: "Water supply to Ward 12 (Rankala zone) will be interrupted from 6 AM to 2 PM on 12 September 2026 for annual pipeline maintenance.",
    time: "Yesterday, 4:00 PM",
    targetWards: ["Rankala"],
  },
  {
    id: 3,
    severity: "info",
    icon: "science",
    title: "Water Quality Advisory",
    body: "Panchganga River levels have risen. As a precaution, please boil drinking water before consumption until further advisories are lifted.",
    time: "8 Sep, 11:30 AM",
    targetWards: ["All Wards"],
  },
  {
    id: 4,
    severity: "success",
    icon: "check_circle",
    title: "Supply Restored — Laxmipuri",
    body: "Water supply has been restored to Laxmipuri after repairs to the Rajarampuri distribution main were completed ahead of schedule.",
    time: "7 Sep, 3:00 PM",
    targetWards: ["Laxmipuri"],
  },
]

export const notices: Notice[] = [
  {
    id: "NOT-01",
    title: "Annual Water Tariff Revision Policy 2026-27",
    category: "Tariff",
    date: "01 Sep 2026",
    content:
      "Kolhapur Municipal Corporation has published the revised domestic and commercial water slab schedules effective October 1.",
    priority: "Normal",
  },
  {
    id: "NOT-02",
    title: "Mandatory Rainwater Harvesting for Properties > 2000 sq ft",
    category: "General",
    date: "25 Aug 2026",
    content:
      "Citizens are requested to submit rainwater harvesting compliance certificates before 31st October to avail 5% rebate.",
    priority: "High",
  },
]

// Admin / reference mirrors (Person 2 / Person 4 own the writes).
export const rolePermissions: RolePermissions[] = [
  {
    role: "Admin",
    manageUsers: true,
    manageRoles: true,
    viewAudit: true,
    systemSettings: true,
    editSchedules: true,
    approveRequests: true,
  },
  {
    role: "Engineer",
    manageUsers: false,
    manageRoles: false,
    viewAudit: true,
    systemSettings: false,
    editSchedules: true,
    approveRequests: true,
  },
  {
    role: "Supervisor",
    manageUsers: false,
    manageRoles: false,
    viewAudit: false,
    systemSettings: false,
    editSchedules: true,
    approveRequests: false,
  },
  {
    role: "Operator",
    manageUsers: false,
    manageRoles: false,
    viewAudit: false,
    systemSettings: false,
    editSchedules: false,
    approveRequests: false,
  },
]

export const systemSettings: SystemSettingsConfig = {
  autoFloodAlert: true,
  floodMinor: "2.5",
  floodModerate: "4.0",
  floodMajor: "5.5",
  nrwWarningThreshold: "20",
  slaCriticalHours: "4",
  slaGeneralHours: "24",
}

export const auditLogs: AuditLog[] = [
  {
    id: "LOG-10441",
    user: "Suresh Patil",
    role: "Admin",
    action: "OUTAGE_CREATED",
    module: "Outage Mgmt",
    target: "OUT-2024-089 (Kasba Bawada)",
    ip: "10.0.1.42",
    time: "11 Sep 2026, 09:14:22",
    severity: "Info",
  },
  {
    id: "LOG-10440",
    user: "Rajesh Kadam",
    role: "Engineer",
    action: "MAINTENANCE_UPDATED",
    module: "Maintenance",
    target: "MNT-091 Status → In Progress",
    ip: "10.0.1.55",
    time: "11 Sep 2026, 08:58:11",
    severity: "Info",
  },
  {
    id: "LOG-10439",
    user: "Priya Shinde",
    role: "Supervisor",
    action: "NOTIFICATION_SENT",
    module: "Notifications",
    target: "NOT-2024-0201 (Rajarampuri)",
    ip: "10.0.1.33",
    time: "11 Sep 2026, 08:30:04",
    severity: "Info",
  },
]

export const bills: Bill[] = [
  {
    id: "BILL-SEP-26",
    consumerNumber: "KMC-CON-90214",
    period: "August 2026",
    billDate: "01 Sep 2026",
    dueDate: "25 Sep 2026",
    amount: 420,
    consumptionKL: 14.5,
    status: "Unpaid",
  },
  {
    id: "BILL-AUG-26",
    consumerNumber: "KMC-CON-90214",
    period: "July 2026",
    billDate: "01 Aug 2026",
    dueDate: "25 Aug 2026",
    amount: 390,
    consumptionKL: 13.8,
    status: "Paid",
  },
]

export const usageSeries: UsageDataPoint[] = [
  { month: "Apr", usage: 12.4, cost: 360 },
  { month: "May", usage: 15.8, cost: 460 },
  { month: "Jun", usage: 15.2, cost: 440 },
  { month: "Jul", usage: 13.8, cost: 390 },
  { month: "Aug", usage: 14.5, cost: 420 },
  { month: "Sep", usage: 3.2, cost: 95 },
]

export const gaugeStations: GaugeStation[] = [
  {
    id: "GS-01",
    name: "Panchganga @ Rajwada Ghat",
    level: 4.1,
    change: "+0.3m",
    status: "Moderate",
    maxSafe: 5.5,
    danger: 6.0,
  },
  {
    id: "GS-02",
    name: "Panchganga @ Jaysingpur Bridge",
    level: 3.8,
    change: "+0.2m",
    status: "Watch",
    maxSafe: 5.0,
    danger: 5.5,
  },
]

export const rainfall: RainfallData[] = [
  { day: "Mon", rainfall: 12.4, forecast: 8 },
  { day: "Tue", rainfall: 34.8, forecast: 20 },
  { day: "Wed", rainfall: 18.2, forecast: 25 },
  { day: "Thu", rainfall: 42.6, forecast: 30 },
  { day: "Fri", rainfall: 28.1, forecast: 40 },
]

export interface AnalyticsBundle {
  supply: Array<{ month: string supply: number target: number }>
  complaintsByCategory: Array<{
    category: string
    count: number
    resolved: number
  }>
  nrwTrend: Array<{ month: string nrw: number }>
  consumption: Array<{
    month: string
    residential: number
    commercial: number
    industrial: number
  }>
  wardScores: Array<{ ward: string score: number }>
}

export const analytics: AnalyticsBundle = {
  supply: [
    { month: "Apr", supply: 4210, target: 4500 },
    { month: "May", supply: 4380, target: 4500 },
    { month: "Jun", supply: 4120, target: 4500 },
    { month: "Jul", supply: 3980, target: 4500 },
    { month: "Aug", supply: 4290, target: 4500 },
    { month: "Sep", supply: 4480, target: 4500 },
  ],
  complaintsByCategory: [
    { category: "Leakage", count: 241, resolved: 198 },
    { category: "Low Pressure", count: 189, resolved: 164 },
    { category: "No Supply", count: 156, resolved: 142 },
    { category: "Quality", count: 98, resolved: 92 },
    { category: "Billing", count: 74, resolved: 68 },
    { category: "Other", count: 42, resolved: 38 },
  ],
  nrwTrend: [
    { month: "Apr", nrw: 26.8 },
    { month: "May", nrw: 25.4 },
    { month: "Jun", nrw: 24.9 },
    { month: "Jul", nrw: 23.8 },
    { month: "Aug", nrw: 23.1 },
    { month: "Sep", nrw: 22.4 },
  ],
  consumption: [
    { month: "Apr", residential: 2840, commercial: 820, industrial: 340 },
    { month: "May", residential: 2960, commercial: 870, industrial: 360 },
    { month: "Jun", residential: 2780, commercial: 810, industrial: 320 },
    { month: "Jul", residential: 2690, commercial: 780, industrial: 310 },
    { month: "Aug", residential: 2880, commercial: 840, industrial: 350 },
    { month: "Sep", residential: 3020, commercial: 910, industrial: 380 },
  ],
  wardScores: [
    { ward: "Shivaji Peth", score: 88 },
    { ward: "Rajarampuri", score: 91 },
    { ward: "Kasba Bawada", score: 52 },
    { ward: "Shahupuri", score: 94 },
    { ward: "Laxmipuri", score: 89 },
    { ward: "Mangalwar Peth", score: 58 },
    { ward: "Tarabai Park", score: 92 },
  ],
}
