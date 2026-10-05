export interface AnalyticsBundle {
  supply: Array<{ month: string; supply: number; target: number }>
  complaintsByCategory: Array<{
    category: string
    count: number
    resolved: number
  }>
  nrwTrend: Array<{ month: string; nrw: number }>
  consumption: Array<{
    month: string
    residential: number
    commercial: number
    industrial: number
  }>
  wardScores: Array<{ ward: string; score: number }>
}
