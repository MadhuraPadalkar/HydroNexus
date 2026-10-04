<<<<<<< HEAD
// Complaint repository — future table: complaints.
// Prisma swap: reimplement each method with prisma.complaint.* ; the
// interface and all callers stay unchanged.
import type { Complaint } from "@water/types";
import { complaints } from "../data/store";

export type ComplaintStatusInput = Complaint["status"] | "Pending" | "Escalated";

export interface ComplaintFilters {
  filter?: string;
  status?: string;
  ward?: string;
  category?: string;
}

export interface CreateComplaintInput {
  type: string;
  ward: string;
  address?: string;
  location?: string;
  description: string;
  priority?: Complaint["priority"];
  citizen?: string;
  phone?: string;
}

export interface UpdateComplaintInput {
  status?: ComplaintStatusInput;
  priority?: Complaint["priority"];
  assigned?: string;
  note?: string;
}

function matchesFilter(c: Complaint, filter: string | undefined): boolean {
  if (!filter || filter === "All") return true;
  const f = filter.toLowerCase();
  return (
    String(c.status).toLowerCase() === f ||
    String(c.priority).toLowerCase() === f ||
    String(c.type).toLowerCase() === f
  );
}

export interface ComplaintRepository {
  findAll(filters?: ComplaintFilters): Complaint[];
  findById(id: string): Complaint | undefined;
  create(input: CreateComplaintInput, actor?: string): Complaint;
  update(id: string, patch: UpdateComplaintInput, actor?: string): Complaint | undefined;
  /** Assignment workflow: sets engineer, advances Open/Pending to In
   * Progress, appends an "Assigned" timeline entry. */
  assign(id: string, engineer: string, actor?: string, notes?: string): Complaint | undefined;
  /** Live leakage-type complaint counts per ward (feeds leakage analysis). */
  countLeakageByWard(): Record<string, number>;
}

export const complaintRepository: ComplaintRepository = {
  findAll(filters = {}) {
    let items = complaints.filter((c) => matchesFilter(c, filters.filter));
    if (filters.status) items = items.filter((c) => c.status === filters.status);
    if (filters.ward) {
      const w = filters.ward.toLowerCase();
      items = items.filter((c) => c.ward.toLowerCase().includes(w));
    }
    if (filters.category) {
      const cat = filters.category.toLowerCase();
      items = items.filter((c) => c.type.toLowerCase() === cat);
    }
    return items;
  },

  findById(id) {
    return complaints.find((c) => c.id === id);
  },

  create(input, actor) {
    const item: Complaint = {
      id: `CMP-2026-${String(Math.floor(1000 + Math.random() * 9000))}`,
      type: input.type,
      citizen: input.citizen || actor || "Unknown",
=======
import type { Complaint } from "../../../packages/types/src/index"
import { db } from "./store"

/**
 * SHARED repository: citizen routes create/read, officer routes
 * (Person 3) update status/assignment on the SAME records.
 * Lifecycle: Open -> Assigned -> In Progress -> Resolved.
 * NOTE contract drift: openapi.yaml uses Pending/In Progress/Resolved/
 * Escalated while packages/types uses Open/In Progress/Resolved.
 * This repo accepts both vocabularies; "Pending" is treated as "Open".
 *
 * Status union is derived from Complaint["status"], not re-typed.
 */
export type ComplaintStatus = Complaint["status"] | "Assigned" | "Pending" | "Escalated"

const TERMINAL: ComplaintStatus[] = ["Resolved"]

const ALLOWED_TRANSITIONS: Record<string, ComplaintStatus[]> = {
  Open: ["Assigned", "In Progress", "Resolved", "Escalated", "Pending"],
  Pending: ["Assigned", "In Progress", "Resolved", "Escalated", "Open"],
  Assigned: ["In Progress", "Resolved", "Escalated"],
  "In Progress": ["Resolved", "Escalated"],
  Escalated: ["Assigned", "In Progress", "Resolved"],
  Resolved: [],
}

export function normalizeStatus(
  s: ComplaintStatus,
): Complaint["status"] | "Assigned" | "Escalated" | "Pending" {
  return s
}

export const complaintRepository = {
  list(filter?: {
    status?: string
    type?: string
    citizenName?: string
  }): Complaint[] {
    let items = [...db.complaints]
    if (filter?.status && filter.status !== "All") {
      items = items.filter((c) => c.status === filter.status)
    }
    if (filter?.type && filter.type !== "All") {
      items = items.filter((c) => c.type === filter.type)
    }
    if (filter?.citizenName) {
      items = items.filter((c) => c.citizen === filter.citizenName)
    }
    return items
  },
  findById(id: string): Complaint | undefined {
    return db.complaints.find((c) => c.id === id)
  },
  create(input: {
    type: string
    ward: string
    description: string
    address?: string
    location?: string
    priority?: Complaint["priority"]
    citizen?: string
    phone?: string
    photoUrl?: string
    latitude?: number
    longitude?: number
  }): Complaint {
    db.complaintSeq += 1
    const now = new Date()
    const stamp = now.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
    const complaint: Complaint = {
      id: `CMP-2026-${String(db.complaintSeq).padStart(4, "0")}`,
      type: input.type,
      citizen: input.citizen || "",
>>>>>>> main
      ward: input.ward,
      address: input.address,
      location: input.location || input.address,
      phone: input.phone,
<<<<<<< HEAD
      reported: "Just now",
      date: "Today",
      priority: input.priority || "Medium",
      status: "Open",
      description: input.description,
      updated: "Just now",
      icon: "report_problem",
      timeline: [{ status: "Reported", time: "Just now", note: "Complaint logged" }],
    };
    complaints.unshift(item);
    return item;
  },

  update(id, patch, actor) {
    const item = complaints.find((c) => c.id === id);
    if (!item) return undefined;
    if (patch.status) {
      // Accepts the openapi.yaml vocabulary too ("Pending" ~= "Open").
      // The cast is intentional: storage follows @water/types Complaint.
      const normalized = patch.status === "Pending" ? "Open" : patch.status;
      item.status = normalized as Complaint["status"];
      item.timeline = item.timeline || [];
      item.timeline.push({
        status: patch.status,
        time: "Just now",
        note: patch.note || `Status changed to ${patch.status} by ${actor || "officer"}`,
      });
    }
    if (patch.priority) item.priority = patch.priority;
    if (patch.assigned) item.assigned = patch.assigned;
    item.updated = "Just now";
    return item;
  },

  assign(id, engineer, actor, notes) {
    const item = complaints.find((c) => c.id === id);
    if (!item) return undefined;
    item.assigned = engineer;
    if (item.status === "Open" || (item.status as string) === "Pending") {
      item.status = "In Progress";
    }
    item.updated = "Just now";
    item.timeline = item.timeline || [];
    item.timeline.push({
      status: "Assigned",
      time: "Just now",
      note: notes || `Assigned to ${engineer} by ${actor || "officer"}`,
    });
    return item;
  },

  countLeakageByWard() {
    const counts: Record<string, number> = {};
    for (const c of complaints) {
      if (["Leakage", "No Supply", "Low Pressure"].includes(c.type)) {
        counts[c.ward] = (counts[c.ward] || 0) + 1;
      }
    }
    return counts;
  },
};
=======
      reported: stamp,
      date: now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      priority: input.priority || "Medium",
      status: "Open",
      description: input.description,
      updated: stamp,
      icon: "report_problem",
      timeline: [
        {
          status: "Open",
          time: stamp,
          note: "Complaint logged via Citizen Portal",
        },
      ],
    }
    if (input.photoUrl || input.latitude !== undefined) {
      const extra = complaint as unknown as Record<string, unknown>
      extra["photoUrl"] = input.photoUrl
      if (input.latitude !== undefined) {
        extra["gps"] = {
          latitude: input.latitude,
          longitude: input.longitude,
        }
      }
    }
    db.complaints.unshift(complaint)
    return complaint
  },
  canTransition(from: string, to: ComplaintStatus): boolean {
    if (from === to) return true
    return (ALLOWED_TRANSITIONS[from] || []).includes(to)
  },
  isTerminal(status: string): boolean {
    return TERMINAL.includes(status as ComplaintStatus)
  },
  update(
    id: string,
    patch: {
      status?: ComplaintStatus
      priority?: Complaint["priority"]
      assigned?: string
      note?: string
    },
  ): Complaint | undefined {
    const complaint = db.complaints.find((c) => c.id === id)
    if (!complaint) return undefined
    if (patch.status !== undefined) {
      ;(complaint as { status: string }).status = patch.status
      const stamp = new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
      complaint.updated = stamp
      complaint.timeline = [
        ...(complaint.timeline || []),
        {
          status: patch.status,
          time: stamp,
          note: patch.note || `Status changed to ${patch.status}`,
        },
      ]
    }
    if (patch.priority !== undefined) complaint.priority = patch.priority
    if (patch.assigned !== undefined) complaint.assigned = patch.assigned
    return complaint
  },
}
>>>>>>> main
