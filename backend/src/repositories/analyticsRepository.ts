// Analytics + shared read-only mirrors.
// Future tables: analytics series (or materialized views), bills,
// gauge_stations, rainfall_records. Billing writes belong to Person 2.
import type { Bill, GaugeStation, RainfallData, UsageDataPoint } from "@water/types";
import { analytics, bills, gaugeStations, rainfall, usageSeries } from "../data/store";
import type { AnalyticsBundle } from "../data/store";

export interface AnalyticsRepository {
  getBundle(): AnalyticsBundle;
  listBills(): Bill[];
  listUsage(): UsageDataPoint[];
  listGauges(): GaugeStation[];
  listRainfall(): RainfallData[];
}

export const analyticsRepository: AnalyticsRepository = {
  getBundle() {
    return analytics;
  },

  listBills() {
    return [...bills];
  },

  listUsage() {
    return [...usageSeries];
  },

  listGauges() {
    return [...gaugeStations];
  },

  listRainfall() {
    return [...rainfall];
  },
};
