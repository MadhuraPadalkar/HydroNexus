import type {
  Alert,
  Bill,
  CitizenRecord,
  Complaint,
  Notice,
  ServiceRequest,
  UsageDataPoint,
  WaterConnectionApplication,
} from "../../../packages/types/src/index";

/**
 * TEMPORARY in-memory data store.
 * Person 4 will swap this for a real Prisma + PostgreSQL client.
 * All data access MUST go through src/repositories/* so the swap
 * only touches the repository layer, never routes or services.
 */

export interface OtpEntry {
  phone: string;
  otp: string;
  expiresAt: number;
  attempts: number;
}

export interface RefreshTokenEntry {
  token: string;
  citizenId: string;
  expiresAt: number;
}

export interface WardConservationStat {
  ward: string;
  averageUsageKL: number;
  period: string;
  sampleSize: number;
}

export interface DbShape {
  citizens: CitizenRecord[];
  complaints: Complaint[];
  bills: Bill[];
  usageByConsumer: Record<string, UsageDataPoint[]>;
  serviceRequests: ServiceRequest[];
  connectionApplications: WaterConnectionApplication[];
  alerts: Alert[];
  notices: Notice[];
  /** citizenId -> set of alert ids marked read */
  alertReads: Record<string, Array<string | number>>;
  otps: Map<string, OtpEntry>;
  refreshTokens: Map<string, RefreshTokenEntry>;
  wardAverages: WardConservationStat[];
  complaintSeq: number;
  serviceSeq: number;
}

function seed(): DbShape {
  return {
    citizens: [
      {
        id: "CIT-78192",
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
        id: "CIT-10243",
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
    ],
    complaints: [
      {
        id: "CMP-2024-0891",
        type: "Leakage",
        citizen: "Sunita Anand Patil",
        ward: "Ward 12 - Rankala",
        address: "Plot 12, Lake View Colony, Rankala",
        location: "Rankala Lake Road, Gate 3",
        phone: "9876543210",
        reported: "11 Sep, 07:40",
        date: "11 Sep 2026",
        assigned: "Anil Jadhav",
        priority: "Critical",
        status: "In Progress",
        description: "Major pipeline burst near chowk, road flooded.",
        updated: "11 Sep, 09:00",
        icon: "water_damage",
        timeline: [
          { status: "Open", time: "11 Sep, 07:40", note: "Complaint logged via Citizen Portal" },
          { status: "Assigned", time: "11 Sep, 08:10", note: "Assigned to Anil Jadhav" },
          { status: "In Progress", time: "11 Sep, 09:00", note: "Field team dispatched" },
        ],
      },
      {
        id: "CMP-2024-0889",
        type: "Dirty Water",
        citizen: "Sunita Anand Patil",
        ward: "Ward 12 - Rankala",
        address: "Plot 12, Lake View Colony, Rankala",
        location: "Shivaji Park Colony",
        phone: "9876543210",
        reported: "10 Sep, 18:20",
        date: "10 Sep 2026",
        priority: "High",
        status: "Open",
        description: "Brown muddy water from tap for past 2 days.",
        updated: "10 Sep, 18:20",
        icon: "science",
        timeline: [{ status: "Open", time: "10 Sep, 18:20", note: "Complaint logged via Citizen Portal" }],
      },
    ],
    bills: [
      {
        id: "BIL-2026-09-4872",
        consumerNumber: "KMC-CON-90214",
        period: "September 2026",
        billDate: "01 Sep 2026",
        dueDate: "20 September 2026",
        amount: 480,
        consumptionKL: 3.2,
        status: "Unpaid",
      },
      {
        id: "BIL-2026-08-4872",
        consumerNumber: "KMC-CON-90214",
        period: "August 2026",
        billDate: "01 Aug 2026",
        dueDate: "20 August 2026",
        amount: 420,
        consumptionKL: 14.5,
        status: "Paid",
      },
      {
        id: "BIL-2026-07-4872",
        consumerNumber: "KMC-CON-90214",
        period: "July 2026",
        billDate: "01 Jul 2026",
        dueDate: "20 July 2026",
        amount: 390,
        consumptionKL: 13.8,
        status: "Paid",
      },
      {
        id: "BIL-2026-09-8412",
        consumerNumber: "KMC-CON-88412",
        period: "September 2026",
        billDate: "01 Sep 2026",
        dueDate: "20 September 2026",
        amount: 1850,
        consumptionKL: 42.0,
        status: "Overdue",
      },
    ],
    usageByConsumer: {
      "KMC-CON-90214": [
        { month: "Apr", usage: 12.4, cost: 360 },
        { month: "May", usage: 15.8, cost: 460 },
        { month: "Jun", usage: 15.2, cost: 440 },
        { month: "Jul", usage: 13.8, cost: 390 },
        { month: "Aug", usage: 14.5, cost: 420 },
        { month: "Sep", usage: 3.2, cost: 95 },
      ],
      "KMC-CON-88412": [
        { month: "Apr", usage: 38.1, cost: 1620 },
        { month: "May", usage: 41.4, cost: 1780 },
        { month: "Jun", usage: 39.9, cost: 1710 },
        { month: "Jul", usage: 40.6, cost: 1740 },
        { month: "Aug", usage: 43.2, cost: 1890 },
        { month: "Sep", usage: 42.0, cost: 1850 },
      ],
    },
    serviceRequests: [
      {
        id: "SRQ-882",
        citizenName: "Sunita Anand Patil",
        phone: "9876543210",
        ward: "Ward 12 - Rankala",
        address: "Plot 12, Lake View Colony, Rankala",
        serviceType: "Tanker Request",
        requestedDate: "11 Sep 2026",
        status: "Assigned",
        vehicleNumber: "MH-09-CV-2011",
        driverName: "Raju Salokhe",
      },
    ],
    connectionApplications: [
      {
        id: "APP-2026-041",
        applicantName: "Sunita Anand Patil",
        ward: "Ward 12 - Rankala",
        address: "Plot 12, Lake View Colony, Rankala",
        type: "Domestic",
        appliedDate: "02 Sep 2026",
        status: "Site Inspection",
      },
    ],
    alerts: [
      {
        id: "1",
        severity: "critical",
        icon: "warning",
        title: "Emergency Water Outage",
        body: "Pipeline burst on Shahupuri Ring Road. Supply to nearby wards suspended; tankers deployed.",
        time: "Today, 9:15 AM",
        targetWards: ["Ward 10", "Ward 11", "Ward 12 - Rankala"],
      },
      {
        id: "2",
        severity: "warning",
        icon: "construction",
        title: "Planned Maintenance - Sep 12",
        body: "Supply to Ward 12 (Rankala zone) interrupted 6 AM-2 PM for annual maintenance.",
        time: "Yesterday, 4:00 PM",
        targetWards: ["Ward 12 - Rankala"],
      },
      {
        id: "3",
        severity: "info",
        icon: "science",
        title: "Water Quality Advisory",
        body: "Panchganga levels risen; please boil drinking water until further advisory.",
        time: "8 Sep, 11:30 AM",
        targetWards: ["Ward 12 - Rankala", "Ward 04 - Rajarampuri"],
      },
    ],
    notices: [
      {
        id: "1",
        title: "Water Conservation Drive",
        category: "General",
        date: "9 Sep 2026",
        content: "KMC urges citizens to adopt water-saving practices.",
        priority: "Normal",
      },
      {
        id: "2",
        title: "Revised Water Tariff from October 2026",
        category: "Tariff",
        date: "1 Sep 2026",
        content: "Revised slab schedule effective October 1. Up to 8,000 L/month stays subsidised.",
        priority: "High",
      },
    ],
    alertReads: {},
    otps: new Map<string, OtpEntry>(),
    refreshTokens: new Map<string, RefreshTokenEntry>(),
    wardAverages: [
      { ward: "Ward 12 - Rankala", averageUsageKL: 13.9, period: "September 2026", sampleSize: 4120 },
      { ward: "Ward 04 - Rajarampuri", averageUsageKL: 18.4, period: "September 2026", sampleSize: 5210 },
    ],
    complaintSeq: 892,
    serviceSeq: 883,
  };
}

/** Singleton store shared by all repositories (both citizen + officer routes). */
export const db: DbShape = seed();
