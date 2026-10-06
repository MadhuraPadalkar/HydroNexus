// Work-order repository — future table: work_orders (new table for Person 4).
import { workOrders } from "../data/store";
import type { WorkOrder, WorkOrderStatus } from "../domain";

export interface WorkOrderFilters {
  status?: string;
  ward?: string;
  assignee?: string;
}

export interface CreateWorkOrderInput {
  complaintId?: string;
  title: string;
  ward: string;
  assignedTo: string;
  priority?: WorkOrder["priority"];
  notes?: string;
}

export interface UpdateWorkOrderInput {
  status?: WorkOrderStatus;
  assignedTo?: string;
  notes?: string;
}

let seq = 3;
function nextId(): string {
  seq += 1;
  return `WO-2026-${String(seq).padStart(3, "0")}`;
}

export interface WorkOrderRepository {
  findAll(filters?: WorkOrderFilters): WorkOrder[];
  findById(id: string): WorkOrder | undefined;
  create(input: CreateWorkOrderInput): WorkOrder;
  update(id: string, patch: UpdateWorkOrderInput): WorkOrder | undefined;
}

export const workOrderRepository: WorkOrderRepository = {
  findAll(filters = {}) {
    let items = [...workOrders];
    if (filters.status) items = items.filter((w) => w.status === filters.status);
    if (filters.ward) items = items.filter((w) => w.ward === filters.ward);
    if (filters.assignee) items = items.filter((w) => w.assignedTo === filters.assignee);
    return items;
  },

  findById(id) {
    return workOrders.find((w) => w.id === id);
  },

  create(input) {
    const wo: WorkOrder = {
      id: nextId(),
      status: "Open",
      createdAt: "Just now",
      updatedAt: "Just now",
      priority: "Medium",
      notes: "",
      ...input,
    };
    workOrders.unshift(wo);
    return wo;
  },

  update(id, patch) {
    const wo = workOrders.find((w) => w.id === id);
    if (!wo) return undefined;
    Object.assign(wo, patch, { updatedAt: "Just now" });
    return wo;
  },
};
