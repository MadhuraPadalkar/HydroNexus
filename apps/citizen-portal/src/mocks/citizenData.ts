export interface Complaint {
  id: string
  type: string
  icon: string
  description: string
  status: "Open" | "In Progress" | "Resolved"
  date: string
  ward: string
  location: string
}

export const complaints: Complaint[] = [
  {
    id: "KMC-2024-3847",
    type: "Pipe Leak",
    icon: "water_damage",
    description: "Major pipe leak near Rankala Lake Road causing water wastage",
    status: "In Progress",
    date: "8 Sep 2026",
    ward: "Ward 12 - Rankala",
    location: "Rankala Lake Road, near Gate No. 3",
  },
  {
    id: "KMC-2024-3821",
    type: "Low Pressure",
    icon: "compress",
    description: "Very low water pressure in morning supply — barely a trickle",
    status: "Open",
    date: "5 Sep 2026",
    ward: "Ward 12 - Rankala",
    location: "Shivaji Park Colony, Building B",
  },
  {
    id: "KMC-2024-3756",
    type: "No Supply",
    icon: "do_not_disturb",
    description: "No water supply for 3 consecutive days without any notice",
    status: "Resolved",
    date: "28 Aug 2026",
    ward: "Ward 12 - Rankala",
    location: "Rajaram Road, Plot 14",
  },
  {
    id: "KMC-2024-3701",
    type: "Water Quality",
    icon: "science",
    description: "Muddy, discolored water with foul smell coming from tap",
    status: "Resolved",
    date: "20 Aug 2026",
    ward: "Ward 12 - Rankala",
    location: "Laxmipuri Main Road",
  },
]

export const alerts = [
  {
    id: 1,
    severity: "critical",
    icon: "warning",
    title: "Emergency Water Outage",
    body: "Due to a major pipeline burst on Shahupuri Ring Road, water supply to Wards 10–14 is suspended until further notice. Emergency tankers deployed.",
    time: "Today, 9:15 AM",
  },
  {
    id: 2,
    severity: "warning",
    icon: "construction",
    title: "Planned Maintenance — Sept 12",
    body: "Water supply to Ward 12 (Rankala zone) will be interrupted from 6 AM to 2 PM on 12 September 2026 for annual pipeline maintenance.",
    time: "Yesterday, 4:00 PM",
  },
  {
    id: 3,
    severity: "info",
    icon: "science",
    title: "Water Quality Advisory",
    body: "Panchganga River levels have risen. As a precaution, please boil drinking water before consumption until further advisories are lifted.",
    time: "8 Sep, 11:30 AM",
  },
  {
    id: 4,
    severity: "success",
    icon: "check_circle",
    title: "Supply Restored — Laxmipuri",
    body: "Water supply has been restored to Laxmipuri after repairs to the Rajarampuri distribution main were completed ahead of schedule.",
    time: "7 Sep, 3:00 PM",
  },
  {
    id: 5,
    severity: "warning",
    icon: "thunderstorm",
    title: "Heavy Rainfall Alert",
    body: "IMD has issued a yellow alert for Kolhapur district. Citizens are advised to avoid areas near Panchganga River ghat. Water supply schedule may be affected.",
    time: "6 Sep, 8:00 AM",
  },
]

export const notices = [
  {
    id: 1,
    title: "Water Conservation Drive — September 2026",
    date: "9 Sep 2026",
    category: "Awareness",
    body: "KMC urges all citizens to adopt water-saving practices this September. Residents in Rankala, Rajarampuri, and Shahupuri are encouraged to report any leaks immediately.",
  },
  {
    id: 2,
    title: "New Smart Meter Installation Program",
    date: "5 Sep 2026",
    category: "Infrastructure",
    body: "KMC is installing smart water meters across Ward 8 to 16 from October 1. Field engineers will visit between 9 AM and 5 PM. No disruption to supply expected.",
  },
  {
    id: 3,
    title: "Revised Water Tariff from October 2026",
    date: "1 Sep 2026",
    category: "Billing",
    body: "Revised water tariff slabs will be effective from 1 October 2026. Domestic consumers using up to 8,000 litres/month will continue to receive subsidized rates.",
  },
  {
    id: 4,
    title: "NRW Reduction Campaign — Ward 12",
    date: "25 Aug 2026",
    category: "Infrastructure",
    body: "As part of AMRUT 2.0, KMC is conducting a Non-Revenue Water audit in Ward 12. Citizens may notice engineers inspecting pipelines and meters in the area.",
  },
]

export const mapPins = [
  {
    id: 1,
    type: "Leak",
    status: "In Progress",
    x: 42,
    y: 38,
    label: "Rankala Lake Rd",
  },
  {
    id: 2,
    type: "Low Pressure",
    status: "Open",
    x: 68,
    y: 52,
    label: "Shivaji Park",
  },
  {
    id: 3,
    type: "No Supply",
    status: "Resolved",
    x: 55,
    y: 65,
    label: "Rajaram Road",
  },
  { id: 4, type: "Leak", status: "Open", x: 30, y: 60, label: "Kasaba Bawada" },
  {
    id: 5,
    type: "Water Quality",
    status: "Open",
    x: 75,
    y: 30,
    label: "Laxmipuri",
  },
  {
    id: 6,
    type: "Leak",
    status: "In Progress",
    x: 20,
    y: 45,
    label: "Shahupuri",
  },
]

export const supplySchedule = [
  {
    zone: "Zone A (Rankala)",
    morning: "6:00–8:30 AM",
    evening: "6:00–8:00 PM",
    today: true,
  },
  {
    zone: "Zone B (Laxmipuri)",
    morning: "7:00–9:30 AM",
    evening: "—",
    today: false,
  },
  {
    zone: "Zone C (Shahupuri)",
    morning: "5:30–8:00 AM",
    evening: "5:30–7:30 PM",
    today: false,
  },
]

export const billHistory = [
  { month: "August 2026", amount: 420, status: "Paid", date: "5 Sep 2026" },
  { month: "July 2026", amount: 390, status: "Paid", date: "4 Aug 2026" },
  { month: "June 2026", amount: 450, status: "Paid", date: "3 Jul 2026" },
  { month: "May 2026", amount: 360, status: "Paid", date: "2 Jun 2026" },
]

export const usageData = [
  { month: "Apr", usage: 6200 },
  { month: "May", usage: 5800 },
  { month: "Jun", usage: 7100 },
  { month: "Jul", usage: 6400 },
  { month: "Aug", usage: 6800 },
  { month: "Sep", usage: 3200 },
]
