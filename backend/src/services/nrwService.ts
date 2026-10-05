// NRW computed views: leakage analysis + multi-ward comparison.
// Blends nrwRepository zone stats with live complaint counts.
import type { WardStats } from "../domain";
import { complaintRepository } from "../repositories/complaintRepository";
import { nrwRepository } from "../repositories/nrwRepository";

export interface LeakageZoneEntry extends WardStats {
  ward: string;
  baselineComplaints: number;
  liveLeakageComplaints: number;
  avgResolutionDays: number;
  risk: "High" | "Medium" | "Low";
}

export interface LeakageAnalysis {
  generatedAt: string;
  highRiskZones: string[];
  zones: LeakageZoneEntry[];
}

export type WardComparisonEntry = WardStats & { ward: string };

export function leakageAnalysis(): LeakageAnalysis {
  const liveCounts = complaintRepository.countLeakageByWard();
  const zones: LeakageZoneEntry[] = Object.entries(nrwRepository.listWardStats())
    .map(([ward, s]) => {
      const highRisk = s.nrw >= 25 || s.complaints >= 40;
      return {
        ward,
        ...s,
        baselineComplaints: s.complaints,
        liveLeakageComplaints: liveCounts[ward] || 0,
        avgResolutionDays: s.resolution,
        risk: (highRisk ? "High" : s.nrw >= 20 ? "Medium" : "Low") as LeakageZoneEntry["risk"],
      };
    })
    .sort((a, b) => b.nrw - a.nrw);
  return {
    generatedAt: "Just now",
    highRiskZones: zones.filter((z) => z.risk === "High").map((z) => z.ward),
    zones,
  };
}

/** Returns entries for known wards, or the unknown names when any are missing. */
export function compareWards(
  names: string[],
): { unknown: string[]; comparison?: WardComparisonEntry[] } {
  const unknown = names.filter((w) => !nrwRepository.getWardStat(w));
  if (unknown.length) return { unknown };
  return {
    unknown: [],
    comparison: names.map((ward) => ({
      ward,
      ...(nrwRepository.getWardStat(ward) as WardStats),
    })),
  };
}
