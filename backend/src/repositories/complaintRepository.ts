// Shared complaint repository.
// Citizen routes (Person 2) create/read complaints.
// Officer routes (Person 3) update status, assign engineers, read analytics.
// Both operate on the same db.complaints records.
// Prisma swap (Person 4): reimplement each method with prisma.complaint.*;
// the method names and callers stay unchanged.

import type { Complaint } from "../../../packages/types/src/index"
import { db } from "./store"

/**
 * Status union is derived from Complaint["status"], not re-typed.
 * KNOWN CONTRACT DRIFT: openapi.yaml uses Pending/In Progress/Resolved/
 * Escalated while packages/types uses Open/In Progress/Resolved.
 * "Pending" is normalized to "Open" on write (kept in the timeline note
 * so the original requested value isn't lost).
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

export interface ComplaintFilters {
  filter?: string | undefined
  status?: string | undefined
  type?: string | undefined
  ward?: string | undefined
  category?: string | undefined
  citizenName?: string | undefined
}

export interface CreateComplaintInput {
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
}

export interface UpdateComplaintInput {
  status?: ComplaintStatus
  priority?: Complaint["priority"]
  assigned?: string
  note?: string
}

function matchesFilter(c: Complaint, filter: string | undefined): boolean {
  if (!filter || filter === "All") return true
  const f = filter.toLowerCase()
  return (
    String(c.status).toLowerCase() === f ||
    String(c.priority).toLowerCase() === f ||
    String(c.type).toLowerCase() === f
  )
}

function timestamp(): string {
  return new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const complaintRepository = {
  findAll(filters: ComplaintFilters = {}): Complaint[] {
    let items = db.complaints.filter((c) => matchesFilter(c, filters.filter))
    if (filters.status && filters.status !== "All") {
      items = items.filter((c) => c.status === filters.status)
    }
    if (filters.type && filters.type !== "All") {
      items = items.filter((c) => c.type === filters.type)
    }
    if (filters.ward) {
      const w = filters.ward.toLowerCase()
      items = items.filter((c) => c.ward.toLowerCase().includes(w))
    }
    if (filters.category) {
      const cat = filters.category.toLowerCase()
      items = items.filter((c) => c.type.toLowerCase() === cat)
    }
    if (filters.citizenName) {
      items = items.filter((c) => c.citizen === filters.citizenName)
    }
    return items
  },

  /** Citizen-side alias used by api/routes/complaints.ts */
  list(filters: ComplaintFilters = {}): Complaint[] {
    return complaintRepository.findAll(filters)
  },

  findById(id: string): Complaint | undefined {
    return db.complaints.find((c) => c.id === id)
  },

  create(input: CreateComplaintInput): Complaint {
    db.complaintSeq += 1
    const stamp = timestamp()
    const complaint: Complaint = {
      id: `CMP-2026-${String(db.complaintSeq).padStart(4, "0")}`,
      type: input.type,
      citizen: input.citizen || "",
      ward: input.ward,
      address: input.address,
      location: input.location || input.address,
      phone: input.phone,
      reported: stamp,
      date: new Date().toLocaleDateString("en-IN", {
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
        extra["gps"] = { latitude: input.latitude, longitude: input.longitude }
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
    patch: UpdateComplaintInput,
    actor?: string,
  ): Complaint | undefined {
    const complaint = db.complaints.find((c) => c.id === id)
    if (!complaint) return undefined

    if (patch.status !== undefined) {
      const normalized = patch.status === "Pending" ? "Open" : patch.status
      ;(complaint as { status: string }).status = normalized
      const stamp = timestamp()
      complaint.updated = stamp
      complaint.timeline = [
        ...(complaint.timeline || []),
        {
          status: patch.status,
          time: stamp,
          note:
            patch.note ||
            `Status changed to ${patch.status} by ${actor || "officer"}`,
        },
      ]
    }
    if (patch.priority !== undefined) complaint.priority = patch.priority
    if (patch.assigned !== undefined) complaint.assigned = patch.assigned
    return complaint
  },

  /** Assignment workflow: sets engineer, advances Open/Pending to In
   * Progress, appends an "Assigned" timeline entry. */
  assign(
    id: string,
    engineer: string,
    actor?: string,
    notes?: string,
  ): Complaint | undefined {
    const complaint = db.complaints.find((c) => c.id === id)
    if (!complaint) return undefined
    complaint.assigned = engineer
    if (
      complaint.status === "Open" ||
      complaint.status as string === "Pending"
    ) {
      ;(complaint as { status: string }).status = "In Progress"
    }
    const stamp = timestamp()
    complaint.updated = stamp
    complaint.timeline = [
      ...(complaint.timeline || []),
      {
        status: "Assigned",
        time: stamp,
        note: notes || `Assigned to ${engineer} by ${actor || "officer"}`,
      },
    ]
    return complaint
  },

  /** Live leakage-type complaint counts per ward (feeds leakage analysis). */
  countLeakageByWard(): Record<string, number> {
    const counts: Record<string, number> = {}
    for (const c of db.complaints) {
      if (["Leakage", "No Supply", "Low Pressure"].includes(c.type)) {
        counts[c.ward] = (counts[c.ward] || 0) + 1
      }
    }
    return counts
  },
}

export type ComplaintRepository = typeof complaintRepository
