<<<<<<< HEAD
// Citizen repository (officer half) — future tables: citizens,
// connection_applications, service_requests.
import type {
  CitizenRecord,
  ServiceRequest,
  WaterConnectionApplication,
} from "@water/types";
import { citizens, connectionApplications, serviceRequests } from "../data/store";

export type ConnectionDecision = "approve" | "reject" | "inspection";

export interface CitizenRepository {
  listCitizens(filters?: { search?: string; ward?: string; status?: string }): CitizenRecord[];
  findCitizen(id: string): CitizenRecord | undefined;
  listApplications(filters?: { status?: string }): WaterConnectionApplication[];
  decideApplication(id: string, action: ConnectionDecision, actor: string): WaterConnectionApplication | undefined;
  listServiceRequests(filters?: { status?: string; serviceType?: string }): ServiceRequest[];
  updateServiceRequest(
    id: string,
    patch: Pick<ServiceRequest, "status"> & Partial<Pick<ServiceRequest, "vehicleNumber" | "driverName" | "notes">>,
  ): ServiceRequest | undefined;
}

export const citizenRepository: CitizenRepository = {
  listCitizens(filters = {}) {
    let items = [...citizens];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter((c) =>
        [c.name, c.phone, c.consumerNumber, c.email, c.ward, c.address]
          .filter(Boolean)
          .some((f) => String(f).toLowerCase().includes(q)),
      );
    }
    if (filters.ward) items = items.filter((c) => c.ward === filters.ward);
    if (filters.status) items = items.filter((c) => c.status === filters.status);
    return items;
  },

  findCitizen(id) {
    return citizens.find((c) => c.id === id || c.consumerNumber === id);
  },

  listApplications(filters = {}) {
    let items = [...connectionApplications];
    if (filters.status) items = items.filter((a) => a.status === filters.status);
    return items;
  },

  decideApplication(id, action, actor) {
    const app = connectionApplications.find((a) => a.id === id);
    if (!app) return undefined;
    app.status =
      action === "approve" ? "Approved" : action === "reject" ? "Rejected" : "Site Inspection";
    app.approvedBy = actor;
    return app;
  },

  listServiceRequests(filters = {}) {
    let items = [...serviceRequests];
    if (filters.status) items = items.filter((r) => r.status === filters.status);
    if (filters.serviceType) items = items.filter((r) => r.serviceType === filters.serviceType);
    return items;
  },

  updateServiceRequest(id, patch) {
    const item = serviceRequests.find((r) => r.id === id);
    if (!item) return undefined;
    Object.assign(item, patch);
    return item;
  },
};
=======
import type { CitizenRecord } from "../../../packages/types/src/index"
import { db } from "./store"

/**
 * SHARED repository. Officer routes (Person 3) and citizen routes
 * read/write the same citizen records. Person 4's Prisma swap
 * replaces the internals of these functions only.
 */
export const citizenRepository = {
  findByPhone(phone: string): CitizenRecord | undefined {
    return db.citizens.find((c) => c.phone === phone)
  },
  findById(id: string): CitizenRecord | undefined {
    return db.citizens.find((c) => c.id === id)
  },
  findByConsumerNumber(consumerNumber: string): CitizenRecord | undefined {
    return db.citizens.find((c) => c.consumerNumber === consumerNumber)
  },
  search(query?: string): CitizenRecord[] {
    if (!query) return [...db.citizens]
    const q = query.toLowerCase()
    return db.citizens.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.consumerNumber.toLowerCase().includes(q),
    )
  },
  create(input: {
    name: string
    phone: string
    ward?: string
    address?: string
  }): CitizenRecord {
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
}
>>>>>>> main
