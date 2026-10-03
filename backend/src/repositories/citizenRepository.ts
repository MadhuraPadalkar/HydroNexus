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
