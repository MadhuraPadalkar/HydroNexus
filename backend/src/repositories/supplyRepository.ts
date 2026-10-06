// Supply repository — future tables: supply_schedules, outages,
// maintenance_tasks. One aggregate repository for the supply module.
import type { MaintenanceTask, Outage, SupplyScheduleItem } from "@water/types";
import { maintenanceTasks, outages, supplySchedule } from "../data/store";

export type OutageCreateInput = Omit<Outage, "id">;
export type OutageUpdateInput = Partial<
  Pick<Outage, "status" | "estimatedRestoration" | "tankersDispatched" | "reason">
>;
export type MaintenanceCreateInput = Omit<MaintenanceTask, "id">;
export type MaintenanceUpdateInput = Partial<MaintenanceTask>;

export interface SupplyRepository {
  listSchedules(filters?: { ward?: string; zone?: string }): SupplyScheduleItem[]
  upsertSchedule(row: SupplyScheduleItem): SupplyScheduleItem
  listOutages(filters?: { status?: string; ward?: string }): Outage[]
  findOutage(id: string): Outage | undefined
  createOutage(input: OutageCreateInput): Outage
  updateOutage(id: string, patch: OutageUpdateInput): Outage | undefined
  listMaintenance(filters?: {
    status?: string
    ward?: string
  }): MaintenanceTask[]
  findMaintenanceTask(id: string): MaintenanceTask | undefined
  createMaintenanceTask(input: MaintenanceCreateInput): MaintenanceTask
  updateMaintenanceTask(
    id: string,
    patch: MaintenanceUpdateInput,
  ): MaintenanceTask | undefined
}

export const supplyRepository: SupplyRepository = {
  listSchedules(filters = {}) {
    let items = [...supplySchedule];
    if (filters.ward) {
      const w = filters.ward.toLowerCase();
      items = items.filter((s) => s.ward.toLowerCase().includes(w));
    }
    if (filters.zone) items = items.filter((s) => s.zone === filters.zone);
    return items;
  },

  upsertSchedule(row) {
    const idx = supplySchedule.findIndex((s) => s.ward === row.ward);
    if (idx === -1) supplySchedule.push(row);
    else supplySchedule[idx] = row;
    return row;
  },

  listOutages(filters = {}) {
    let items = [...outages];
    if (filters.status) items = items.filter((o) => o.status === filters.status);
    if (filters.ward) items = items.filter((o) => o.ward === filters.ward);
    return items;
  },

  findOutage(id) {
    return outages.find((o) => o.id === id);
  },

  createOutage(input) {
    const outage: Outage = {
      id: `OUT-2026-${String(Math.floor(100 + Math.random() * 900))}`,
      ...input,
    };
    outages.unshift(outage);
    return outage;
  },

  updateOutage(id, patch) {
    const outage = outages.find((o) => o.id === id);
    if (!outage) return undefined;
    Object.assign(outage, patch);
    return outage;
  },

  listMaintenance(filters = {}) {
    let items = [...maintenanceTasks];
    if (filters.status) items = items.filter((m) => m.status === filters.status);
    if (filters.ward) items = items.filter((m) => m.ward === filters.ward);
    return items;
  },

  findMaintenanceTask(id) {
    return maintenanceTasks.find((m) => m.id === id);
  },

  createMaintenanceTask(input) {
    const task: MaintenanceTask = {
      id: `MNT-${String(Math.floor(100 + Math.random() * 900))}`,
      ...input,
    };
    maintenanceTasks.unshift(task);
    return task;
  },

  updateMaintenanceTask(id, patch) {
    const task = maintenanceTasks.find((m) => m.id === id);
    if (!task) return undefined;
    Object.assign(task, patch);
    return task;
  },
};
