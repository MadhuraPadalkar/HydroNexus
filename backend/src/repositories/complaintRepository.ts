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
      ward: input.ward,
      address: input.address,
      location: input.location || input.address,
      phone: input.phone,
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
