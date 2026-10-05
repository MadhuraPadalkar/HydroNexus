// NRW repository — future tables: nrw_zones, sensor_telemetry, ward_stats.
// Pure data access: computed roll-ups (city summary) live here; cross-entity
// blending with live complaints lives in nrwService.
import type { LeakageIncident, NRWZoneMetric } from "@water/types";
import { leakageIncidents, nrwMetrics, wardStats } from "../data/store";
import type { WardStats } from "../domain";

export interface CityNrwSummary {
  inputVolumeKL: number;
  billedVolumeKL: number;
  nrwVolumeKL: number;
  nrwPercentage: number;
  zoneCount: number;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Derived water accounting: nrwVolumeKL = input - billed,
 * nrwPercentage = round1(volume / input * 100), guarded for input = 0. */
function withDerived(z: NRWZoneMetric): NRWZoneMetric {
  const volume = z.inputVolumeKL - z.billedVolumeKL;
  return {
    ...z,
    nrwVolumeKL: volume,
    nrwPercentage: z.inputVolumeKL > 0 ? round1((volume / z.inputVolumeKL) * 100) : 0,
  };
}

export interface NrwRepository {
  listMetrics(): NRWZoneMetric[];
  citySummary(): CityNrwSummary;
  listLeakages(filters?: { status?: string; ward?: string }): LeakageIncident[];
  listWardStats(): Record<string, WardStats>;
  getWardStat(ward: string): WardStats | undefined;
  /** Updates input/billed volumes for a zone; undefined when unknown. */
  updateZoneVolumes(
    zone: string,
    input: { inputVolumeKL: number; billedVolumeKL: number },
  ): NRWZoneMetric | undefined;
}

export const nrwRepository: NrwRepository = {
  listMetrics() {
    return nrwMetrics.map(withDerived);
  },

  citySummary() {
    const input = nrwMetrics.reduce((s, z) => s + z.inputVolumeKL, 0);
    const billed = nrwMetrics.reduce((s, z) => s + z.billedVolumeKL, 0);
    const nrw = input - billed;
    return {
      inputVolumeKL: input,
      billedVolumeKL: billed,
      nrwVolumeKL: nrw,
      nrwPercentage: input === 0 ? 0 : round1((nrw / input) * 100),
      zoneCount: nrwMetrics.length,
    };
  },

  listLeakages(filters = {}) {
    let items = [...leakageIncidents];
    if (filters.status) items = items.filter((l) => l.status === filters.status);
    if (filters.ward) items = items.filter((l) => l.ward === filters.ward);
    return items;
  },

  listWardStats() {
    return { ...wardStats };
  },

  getWardStat(ward) {
    return wardStats[ward];
  },

  updateZoneVolumes(zone, input) {
    const row = nrwMetrics.find(
      (z) => z.zone === zone || z.zone.toLowerCase() === zone.toLowerCase(),
    );
    if (!row) return undefined;
    row.inputVolumeKL = input.inputVolumeKL;
    row.billedVolumeKL = input.billedVolumeKL;
    return withDerived(row);
  },
};
