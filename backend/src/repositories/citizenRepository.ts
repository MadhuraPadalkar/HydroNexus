// Shared citizen repository.
// Citizen-side (Person 2): self-lookup, registration, profile updates.
// Officer-side (Person 3): directory search, connection applications, service requests.
// Both read/write the same db.citizens / db.connectionApplications / db.serviceRequests.
// Person 4's Prisma swap replaces only the internals of these functions.

import type {
  CitizenRecord,
  ServiceRequest,
  WaterConnectionApplication,
} from "../../../packages/types/src/index"
import { db } from "./store"

export type ConnectionDecision = "approve" | "reject" | "inspection"

export const citizenRepository = {
  // ---------- Citizen-side (self lookups) ----------
  findById(id: string): CitizenRecord | undefined {
    return db.citizens.find((c) => c.id === id || c.consumerNumber === id)
  },

  findByPhone(phone: string): CitizenRecord | undefined {
    return db.citizens.find((c) => c.phone === phone)
  },

  findByConsumerNumber(consumerNumber: string): CitizenRecord | undefined {
    return db.citizens.find((c) => c.consumerNumber === consumerNumber)
  },

  create(input: { name: string; phone: string; ward?: string; address?: string }): CitizenRecord {
    const n = db.citizens.length + 78193
    const record: CitizenRecord = {
      id: `CIT-${n}`,
      consumerNumber: `KMC-CON-${90215 + db.citizens.length}`,
      name: input.name,
      phone: input.phone,
      email: "",
      ward: input.ward || "Ward 12 - Rankala",
      address: input.address || "",
      connectionType: "Domestic",
      meterNumber: `MTR-${7700 + db.citizens.length}`,
      status: "Pending Verification",
      currentBalance: 0,
    }
    db.citizens.push(record)
    return record
  },

  update(
    id: string,
    patch: Partial<Pick<CitizenRecord, "name" | "email" | "ward" | "address">>,
  ): CitizenRecord | undefined {
    const record = db.citizens.find((c) => c.id === id)
    if (!record) return undefined
    if (patch.name !== undefined) record.name = patch.name
    if (patch.email !== undefined) record.email = patch.email
    if (patch.ward !== undefined) record.ward = patch.ward
    if (patch.address !== undefined) record.address = patch.address
    return record
  },

  // ---------- Officer-side (directory, applications, service requests) ----------
  findCitizen(id: string): CitizenRecord | undefined {
    return db.citizens.find((c) => c.id === id || c.consumerNumber === id)
  },

  search(query?: unknown): CitizenRecord[] {
    const search = typeof query === "string" ? query : undefined
    return citizenRepository.listCitizens({ search })
  },

  listCitizens(
    filters: { search?: string; ward?: string; status?: string } = {},
  ): CitizenRecord[] {
    let items = [...db.citizens]
    if (filters.search) {
      const q = filters.search.toLowerCase()
      items = items.filter((c) =>
        [c.name, c.phone, c.consumerNumber, c.email, c.ward, c.address]
          .filter(Boolean)
          .some((f) => String(f).toLowerCase().includes(q)),
      )
    }
    if (filters.ward) items = items.filter((c) => c.ward === filters.ward)
    if (filters.status) items = items.filter((c) => c.status === filters.status)
    return items
  },

  listApplications(filters: { status?: string } = {}): WaterConnectionApplication[] {
    let items = [...db.connectionApplications]
    if (filters.status) items = items.filter((a) => a.status === filters.status)
    return items
  },

  decideApplication(
    id: string,
    action: ConnectionDecision,
    actor: string,
  ): WaterConnectionApplication | undefined {
    const app = db.connectionApplications.find((a) => a.id === id)
    if (!app) return undefined
    app.status =
      action === "approve" ? "Approved" : action === "reject" ? "Rejected" : "Site Inspection"
    app.approvedBy = actor
    return app
  },

  listServiceRequests(
    filters: { status?: string; serviceType?: string } = {},
  ): ServiceRequest[] {
    let items = [...db.serviceRequests]
    if (filters.status) items = items.filter((r) => r.status === filters.status)
    if (filters.serviceType) items = items.filter((r) => r.serviceType === filters.serviceType)
    return items
  },

  updateServiceRequest(
    id: string,
    patch: Pick<ServiceRequest, "status"> &
      Partial<Pick<ServiceRequest, "vehicleNumber" | "driverName" | "notes">>,
  ): ServiceRequest | undefined {
    const item = db.serviceRequests.find((r) => r.id === id)
    if (!item) return undefined
    Object.assign(item, patch)
    return item
  },
}

export type CitizenRepository = typeof citizenRepository
