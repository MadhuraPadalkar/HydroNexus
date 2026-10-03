// Ward repository — future table: wards.
import { wards } from "../data/store";
import type { Ward } from "../domain";

export type WardUpdateInput = Partial<
  Pick<Ward, "population" | "households" | "coveragePct" | "supplyHours" | "status">
>;

export interface WardRepository {
  findAll(): Ward[];
  findById(id: string): Ward | undefined;
  update(id: string, patch: WardUpdateInput): Ward | undefined;
}

export const wardRepository: WardRepository = {
  findAll() {
    return [...wards];
  },

  findById(id) {
    return wards.find((w) => w.id === id || w.name === id);
  },

  update(id, patch) {
    const ward = wards.find((w) => w.id === id);
    if (!ward) return undefined;
    Object.assign(ward, patch);
    return ward;
  },
};
