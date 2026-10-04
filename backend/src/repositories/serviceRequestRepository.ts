import type {
  ServiceRequest,
  WaterConnectionApplication,
} from "../../../packages/types/src/index";
import { db } from "./store";

/**
 * SHARED repository: citizen routes create requests here, officer routes
 * (Person 3) read/update the SAME queue. Do not create a parallel store.
 * Citizen lifecycle: Requested -> Approved -> Dispatched -> Delivered,
 * mapped onto the shared ServiceRequest statuses
 * (Pending -> Assigned -> En Route -> Completed) used by packages/types.
 */
export const CITIZEN_TO_SHARED_STATUS: Record<string, ServiceRequest["status"]> = {
  Requested: "Pending",
  Approved: "Assigned",
  Dispatched: "En Route",
  Delivered: "Completed",
};

export const SHARED_TO_CITIZEN_STATUS: Record<string, string> = {
  Pending: "Requested",
  Assigned: "Approved",
  "En Route": "Dispatched",
  Completed: "Delivered",
};

export const serviceRequestRepository = {
  list(filter?: { ward?: string; serviceType?: string; phone?: string }): ServiceRequest[] {
    let items = [...db.serviceRequests];
    if (filter?.ward) items = items.filter((r) => r.ward === filter.ward);
    if (filter?.serviceType) items = items.filter((r) => r.serviceType === filter.serviceType);
    if (filter?.phone) items = items.filter((r) => r.phone === filter.phone);
    return items;
  },
  findById(id: string): ServiceRequest | undefined {
    return db.serviceRequests.find((r) => r.id === id);
  },
  create(input: {
    citizenName: string;
    phone: string;
    ward: string;
    address: string;
    serviceType: ServiceRequest["serviceType"];
    urgency?: string;
    timeSlot?: string;
    capacityKL?: number;
    notes?: string;
  }): ServiceRequest {
    db.serviceSeq += 1;
    const req: ServiceRequest = {
      id: `SRQ-${db.serviceSeq}`,
      citizenName: input.citizenName,
      phone: input.phone,
      ward: input.ward,
      address: input.address,
      serviceType: input.serviceType,
      requestedDate: new Date().toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
      }),
      status: "Pending",
      notes: [input.notes, input.urgency ? `Urgency: ${input.urgency}` : "", input.timeSlot ? `Slot: ${input.timeSlot}` : ""]
        .filter(Boolean)
        .join(" | ") || undefined,
    };
    if (input.capacityKL !== undefined) {
      (req as unknown as Record<string, unknown>)["capacityKL"] = input.capacityKL;
    }
    if (input.timeSlot !== undefined) {
      (req as unknown as Record<string, unknown>)["timeSlot"] = input.timeSlot;
    }
    if (input.urgency !== undefined) {
      (req as unknown as Record<string, unknown>)["urgency"] = input.urgency;
    }
    db.serviceRequests.unshift(req);
    return req;
  },
  citizenStatusOf(req: ServiceRequest): string {
    return SHARED_TO_CITIZEN_STATUS[req.status] || req.status;
  },
  applications(): WaterConnectionApplication[] {
    return [...db.connectionApplications];
  },
};
