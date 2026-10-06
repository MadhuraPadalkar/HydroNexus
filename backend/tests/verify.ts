// Endpoint verification: boots the app on an ephemeral port and exercises
// every officer-facing route, asserting HTTP status + packages/types shape
// markers. Run: `npm run verify`. Mirrors officer-portal.http 1:1.
import type { AddressInfo } from "net"
import jwt from "jsonwebtoken"
import app from "../src/index"
import { config } from "../src/config"

interface CheckResult {
  name: string
  pass: boolean
  extra?: string
}

const results: CheckResult[] = []
function check(name: string, cond: boolean, extra?: string): void {
  results.push({ name, pass: cond, extra })
  if (!cond) console.error(`FAIL  ${name}${extra ? " — " + extra : ""}`)
  else console.log(`ok    ${name}`)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any

async function req(
  base: string,
  method: string,
  path: string,
  body?: unknown,
  token?: string,
): Promise<{ status: number; json: Json }> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(base + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  let json: Json = null
  try {
    json = await res.json()
  } catch {
    /* non-JSON */
  }

  return { status: res.status, json }
}
;(async () => {
  const server = app.listen(0)
  await new Promise<void>((r) => server.on("listening", () => r()))
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/v1`

  try {
    let r = await req(base, "GET", "/complaints")
    check(
      "guard rejects anonymous",
      r.status === 401 && r.json?.success === false,
      `got ${r.status}`,
    )

    r = await req(base, "POST", "/auth/officer/login", {
      email: "suresh.patil@kmcwater.gov.in",
      password: "Password123!",
    })
    check("POST /auth/officer/login 200", r.status === 200, `got ${r.status}`)
    const token = r.json?.data?.token as string | undefined
    check(
      "login returns UserSession shape",
      !!(token && r.json?.data?.user && r.json.data.user.role === "Admin"),
      JSON.stringify(r.json).slice(0, 160),
    )
    if (!token) throw new Error("no token — aborting")

    r = await req(base, "POST", "/auth/officer/login", {
      email: "suresh.patil@kmcwater.gov.in",
      password: "wrong",
    })
    check("login rejects bad password", r.status === 401, `got ${r.status}`)

    const T = (m: string, p: string, b?: unknown) => req(base, m, p, b, token)

    r = await T("GET", "/dashboard/summary")
    check(
      "GET /dashboard/summary",
      r.status === 200 &&
        typeof r.json?.data?.cityNrwPct === "number" &&
        typeof r.json?.data?.activeComplaints === "number",
      `got ${r.status}`,
    )
    r = await T("GET", "/dashboard/water-status")
    check(
      "GET /dashboard/water-status",
      r.status === 200 && Array.isArray(r.json?.data?.wards),
      `got ${r.status}`,
    )

    r = await T("GET", "/complaints")
    check(
      "GET /complaints list (Complaint[])",
      r.status === 200 &&
        Array.isArray(r.json?.data) &&
        r.json.data[0]?.id &&
        r.json.data[0]?.ward,
      `got ${r.status}`,
    )
    r = await T(
      "GET",
      "/complaints?filter=In%20Progress&ward=Kasba%20Bawada&category=Leakage",
    )
    check(
      "GET /complaints filtered",
      r.status === 200 &&
        r.json?.data?.length === 1 &&
        r.json.data[0]?.id === "CMP-2024-0891",
      `got ${JSON.stringify(r.json?.data).slice(0, 120)}`,
    )
    r = await T("GET", "/complaints/CMP-2024-0891")
    check(
      "GET /complaints/:id",
      r.status === 200 && r.json?.data?.id === "CMP-2024-0891",
      `got ${r.status}`,
    )
    r = await T("GET", "/complaints/NOPE")
    check(
      "GET /complaints/:id 404 envelope",
      r.status === 404 && r.json?.success === false,
      `got ${r.status}`,
    )
    r = await T("POST", "/complaints/CMP-2024-0889/assign", {
      engineer: "Anil Jadhav",
    })
    check(
      "POST /complaints/:id/assign",
      r.status === 200 &&
        r.json?.data?.workOrder &&
        r.json?.data?.complaint?.assigned === "Anil Jadhav",
      `got ${r.status}`,
    )

    const woId = r.json?.data?.workOrder?.id as string
    r = await T("PATCH", "/complaints/CMP-2024-0889", { status: "Resolved" })
    check(
      "PATCH /complaints/:id status",
      r.status === 200 && r.json?.data?.status === "Resolved",
      `got ${r.status}`,
    )
    r = await T("PATCH", "/complaints/CMP-2024-0889", { status: "Bogus" })
    check(
      "PATCH /complaints/:id rejects bad enum",
      r.status === 422 && r.json?.success === false,
      `got ${r.status}`,
    )

    r = await T("POST", "/work-orders", {
      title: "Test WO",
      ward: "Rankala",
      assignedTo: "Deepak Kulkarni",
    })
    check(
      "POST /work-orders 201",
      r.status === 201 && String(r.json?.data?.id).startsWith("WO-"),
      `got ${r.status}`,
    )
    r = await T("GET", "/work-orders")
    check(
      "GET /work-orders",
      r.status === 200 && r.json?.data?.length >= 3,
      `got ${r.status}`,
    )
    r = await T("GET", `/work-orders/${woId}`)
    check(
      "GET /work-orders/:id + complaint join",
      r.status === 200 && r.json?.data?.complaint !== undefined,
      `got ${r.status}`,
    )
    r = await T("PATCH", `/work-orders/${woId}`, { status: "Completed" })
    check(
      "PATCH /work-orders/:id",
      r.status === 200 && r.json?.data?.status === "Completed",
      `got ${r.status}`,
    )

    r = await T("GET", "/supply/schedule")
    check(
      "GET /supply/schedule (SupplyScheduleItem[])",
      r.status === 200 &&
        r.json?.data?.[0]?.scheduled &&
        typeof r.json?.data?.[0]?.pressure === "number",
      `got ${r.status}`,
    )
    r = await T("PUT", "/supply/schedule", {
      ward: "Rankala",
      zone: "West",
      scheduled: "07:00–09:00",
      actual: "07:00–09:00",
      pressure: 86,
      status: "On Time",
    })
    check(
      "PUT /supply/schedule",
      r.status === 200 && r.json?.data?.ward === "Rankala",
      `got ${r.status}`,
    )
    r = await T("GET", "/supply/outages")
    check(
      "GET /supply/outages (Outage[])",
      r.status === 200 && r.json?.data?.[0]?.estimatedRestoration !== undefined,
      `got ${r.status}`,
    )

    const alertsBefore = (await T("GET", "/alerts")).json?.data
      ?.length as number
    r = await T("POST", "/supply/outages", {
      ward: "Rankala",
      zone: "West Zone",
      reason: "Valve work",
      type: "Scheduled",
      startTime: "12 Sep, 06:00 AM",
      estimatedRestoration: "12 Sep, 02:00 PM",
      autoNotify: true,
    })
    check(
      "POST /supply/outages 201 + autoNotify",
      r.status === 201 &&
        r.json?.data?.outage?.id &&
        r.json?.data?.notification,
      `got ${r.status}`,
    )

    const outageId = r.json?.data?.outage?.id as string
    const alertsAfter = (await T("GET", "/alerts")).json?.data?.length as number
    check(
      "autoNotify wrote citizen-visible alert",
      alertsAfter === alertsBefore + 1,
      `${alertsBefore} -> ${alertsAfter}`,
    )
    r = await T("PATCH", `/supply/outages/${outageId}`, { status: "Active" })
    check(
      "PATCH /supply/outages/:id",
      r.status === 200 && r.json?.data?.status === "Active",
      `got ${r.status}`,
    )
    r = await T("GET", "/supply/maintenance")
    check(
      "GET /supply/maintenance",
      r.status === 200 && r.json?.data?.[0]?.assignedTeam !== undefined,
      `got ${r.status}`,
    )
    r = await T("POST", "/supply/maintenance", {
      title: "T",
      type: "Preventive",
      ward: "Rankala",
      scheduledDate: "15 Sep 2026",
      assignedTeam: "SCADA",
    })
    check("POST /supply/maintenance 201", r.status === 201, `got ${r.status}`)

    const mntId = r.json?.data?.id as string
    r = await T("PATCH", `/supply/maintenance/${mntId}`, {
      status: "Completed",
    })
    check(
      "PATCH /supply/maintenance/:id",
      r.status === 200 && r.json?.data?.status === "Completed",
      `got ${r.status}`,
    )

    r = await T("GET", "/nrw/metrics")
    check(
      "GET /nrw/metrics (NRWZoneMetric[])",
      r.status === 200 &&
        typeof r.json?.data?.[0]?.nrwPercentage === "number" &&
        typeof r.json?.data?.[0]?.inputVolumeKL === "number",
      `got ${r.status}`,
    )
    r = await T("GET", "/nrw/summary")
    check(
      "GET /nrw/summary computed",
      r.status === 200 && typeof r.json?.data?.nrwPercentage === "number",
      `got ${r.status} ${JSON.stringify(r.json?.data)}`,
    )
    r = await T("GET", "/nrw/leakages")
    check(
      "GET /nrw/leakages",
      r.status === 200 &&
        typeof r.json?.data?.[0]?.estimatedLossLPS === "number",
      `got ${r.status}`,
    )
    r = await T("GET", "/nrw/leakage-analysis")
    check(
      "GET /nrw/leakage-analysis flags high-risk",
      r.status === 200 &&
        (r.json?.data?.highRiskZones as string[])?.includes("Kasba Bawada"),
      `got ${r.status}`,
    )
    r = await T("POST", "/nrw/compare", {
      wards: ["Kasba Bawada", "Shahupuri"],
    })
    check(
      "POST /nrw/compare 2 wards",
      r.status === 200 &&
        r.json?.data?.length === 2 &&
        typeof r.json?.data?.[0]?.nrw === "number",
      `got ${r.status}`,
    )
    r = await T("POST", "/nrw/compare", { wards: ["Only One"] })
    check(
      "POST /nrw/compare rejects <2 wards",
      r.status === 422,
      `got ${r.status}`,
    )
    r = await T("POST", "/nrw/compare", { wards: ["A", "B", "C", "D", "E"] })
    check(
      "POST /nrw/compare rejects >4 wards",
      r.status === 422,
      `got ${r.status}`,
    )

    r = await T("GET", "/citizens?search=9876543210")
    check(
      "GET /citizens search (CitizenRecord[])",
      r.status === 200 &&
        r.json?.data?.[0]?.consumerNumber &&
        r.json?.data?.[0]?.meterNumber !== undefined,
      `got ${r.status}`,
    )
    r = await T("GET", "/citizens/CIT-01")
    check(
      "GET /citizens/:id",
      r.status === 200 && r.json?.data?.id === "CIT-01",
      `got ${r.status}`,
    )
    r = await T("GET", "/wards")
    check(
      "GET /wards",
      r.status === 200 && r.json?.data?.length >= 8,
      `got ${r.status}`,
    )
    r = await T("GET", "/wards/ward-03")
    check(
      "GET /wards/:id",
      r.status === 200 && r.json?.data?.name === "Kasba Bawada",
      `got ${r.status}`,
    )
    r = await T("PATCH", "/wards/ward-03", { coveragePct: 84 })
    check(
      "PATCH /wards/:id",
      r.status === 200 && r.json?.data?.coveragePct === 84,
      `got ${r.status}`,
    )
    r = await T("GET", "/citizens/applications")
    check(
      "GET /citizens/applications",
      r.status === 200 && r.json?.data?.[0]?.applicantName !== undefined,
      `got ${r.status}`,
    )
    r = await T("PATCH", "/citizens/applications/APP-2026-104", {
      action: "approve",
    })
    check(
      "PATCH applications approve",
      r.status === 200 && r.json?.data?.status === "Approved",
      `got ${r.status}`,
    )
    r = await T("PATCH", "/citizens/applications/APP-2026-103", {
      action: "reject",
    })
    check(
      "PATCH applications reject",
      r.status === 200 && r.json?.data?.status === "Rejected",
      `got ${r.status}`,
    )
    r = await T("GET", "/citizens/requests")
    check(
      "GET /citizens/requests (ServiceRequest[])",
      r.status === 200 && r.json?.data?.[0]?.serviceType !== undefined,
      `got ${r.status}`,
    )
    r = await T("PATCH", "/citizens/requests/SR-2024-0440", {
      status: "En Route",
      vehicleNumber: "MH-09-T-4521",
      driverName: "Ravi Kamble",
    })
    check(
      "PATCH requests dispatch",
      r.status === 200 && r.json?.data?.status === "En Route",
      `got ${r.status}`,
    )
    r = await T("PATCH", "/citizens/requests/SR-2024-0440", {
      status: "Completed",
    })
    check(
      "PATCH requests mark-delivered",
      r.status === 200 && r.json?.data?.status === "Completed",
      `got ${r.status}`,
    )

    r = await T("POST", "/alerts", {
      title: "T",
      body: "B",
      type: "Supply",
      targetWards: ["Rankala"],
    })
    check(
      "POST /alerts 201 (Alert)",
      r.status === 201 &&
        r.json?.data?.severity === "info" &&
        Array.isArray(r.json?.data?.targetWards),
      `got ${r.status}`,
    )
    r = await T("POST", "/alerts", { title: "T" })
    check(
      "POST /alerts rejects empty body",
      r.status === 422,
      `got ${r.status}`,
    )
    r = await T("GET", "/alerts")
    check(
      "GET /alerts history",
      r.status === 200 && r.json?.data?.length >= 5,
      `got ${r.status}`,
    )
    r = await T("GET", "/notices")
    check(
      "GET /notices",
      r.status === 200 && Array.isArray(r.json?.data),
      `got ${r.status}`,
    )

    for (const p of ["supply", "complaints", "nrw", "consumption"]) {
      r = await T("GET", `/analytics/${p}`)
      check(
        `GET /analytics/${p}`,
        r.status === 200 && r.json?.data !== undefined,
        `got ${r.status}`,
      )
    }
    r = await T(
      "GET",
      "/analytics/ward-comparison?wards=Kasba%20Bawada,Shahupuri",
    )
    check(
      "GET /analytics/ward-comparison",
      r.status === 200 &&
        r.json?.data?.length === 2 &&
        typeof r.json?.data?.[0]?.score === "number",
      `got ${r.status}`,
    )

    // NOTE: /billing/* routes were removed (Person 2 owns billing).
    for (const p of [
      "admin/officers",
      "admin/permissions",
      "admin/settings",
      "admin/audit-logs",
      "flood/gauges",
      "flood/rainfall",
    ]) {
      r = await T("GET", `/${p}`)
      check(
        `GET /${p}`,
        r.status === 200 && r.json?.success === true,
        `got ${r.status}`,
      )
    }

    // FIX 1: password is required — missing password -> 401, not 422.
    r = await req(base, "POST", "/auth/officer/login", {
      email: "suresh.patil@kmcwater.gov.in",
    })
    check(
      "login without password -> 401",
      r.status === 401 && r.json?.error?.code === "AUTH_INVALID_CREDENTIALS",
      `got ${r.status}`,
    )

    // FIX 9: error bodies carry message at both levels.
    r = await T("GET", "/complaints/NOPE")
    check(
      "error carries top-level message",
      r.status === 404 &&
        typeof r.json?.message === "string" &&
        r.json.message === r.json?.error?.message,
      JSON.stringify(r.json).slice(0, 140),
    )

    // FIX 2: public notices; citizen-role reads; unknown paths -> 404.
    r = await req(base, "GET", "/notices")
    check(
      "GET /notices public (no token)",
      r.status === 200 && Array.isArray(r.json?.data),
      `got ${r.status}`,
    )
    const citizenToken = jwt.sign(
      { sub: "CIT-01", role: "Citizen" },
      config.jwtSecret,
      { expiresIn: "1h" },
    )
    const C = (m: string, p: string, b?: unknown) =>
      req(base, m, p, b, citizenToken)
    r = await C("GET", "/alerts")
    check(
      "citizen GET /alerts 200",
      r.status === 200 && Array.isArray(r.json?.data),
      `got ${r.status}`,
    )
    r = await C("POST", "/alerts", { title: "x", body: "y", severity: "info" })
    check("citizen POST /alerts 403", r.status === 403, `got ${r.status}`)
    r = await C("GET", "/admin/audit-logs")
    check(
      "citizen GET /admin/audit-logs 403",
      r.status === 403,
      `got ${r.status}`,
    )
    r = await req(base, "GET", "/alerts")
    check("GET /alerts anonymous 401", r.status === 401, `got ${r.status}`)
    r = await req(base, "GET", "/no-such-route")
    check(
      "unknown route without token -> 404",
      r.status === 404 && r.json?.success === false,
      `got ${r.status}`,
    )

    // FIX 8: malformed JSON -> 400, not 500.
    {
      const bad = await fetch(base + "/supply/outages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: "{bad json",
      })
      const bj = (await bad.json()) as {
        error?: { code?: string }
        message?: string
      }
      check(
        "malformed JSON -> 400 BAD_REQUEST",
        bad.status === 400 &&
          bj?.error?.code === "BAD_REQUEST" &&
          typeof bj?.message === "string",
        `got ${bad.status}`,
      )
    }

    // FIX 5: Engineer role.
    const engLogin = await req(base, "POST", "/auth/officer/login", {
      email: "anil.jadhav@kmcwater.gov.in",
      password: "Password123!",
    })
    check(
      "engineer login 200",
      engLogin.status === 200,
      `got ${engLogin.status}`,
    )
    const engToken = engLogin.json?.data?.token as string
    const E = (m: string, p: string, b?: unknown) =>
      req(base, m, p, b, engToken)
    r = await E("POST", "/supply/outages", {
      ward: "Rankala",
      zone: "West Zone",
      reason: "Valve work",
      type: "Scheduled",
      startTime: "12 Sep 2026, 06:00 AM",
      estimatedRestoration: "12 Sep 2026, 02:00 PM",
    })
    check(
      "engineer POST /supply/outages 201",
      r.status === 201,
      `got ${r.status}`,
    )
    r = await E("PUT", "/admin/settings", { nrwWarningThreshold: "22" })
    check(
      "engineer PUT /admin/settings 403",
      r.status === 403,
      `got ${r.status}`,
    )
    r = await E("POST", "/alerts", { title: "t", body: "b", severity: "info" })
    check("engineer POST /alerts 403", r.status === 403, `got ${r.status}`)
    r = await E("PUT", "/nrw/zones/North%20Zone", {
      inputVolumeKL: 1000,
      billedVolumeKL: 800,
    })
    check(
      "engineer PUT /nrw/zones 200 recomputed",
      r.status === 200 &&
        r.json?.data?.nrwPercentage === 20 &&
        r.json?.data?.nrwVolumeKL === 200,
      `got ${r.status} ${JSON.stringify(r.json?.data)}`,
    )

    // FIX 5: Supervisor role.
    const supLogin = await req(base, "POST", "/auth/officer/login", {
      email: "priya.s@kmcwater.gov.in",
      password: "Password123!",
    })
    const supToken = supLogin.json?.data?.token as string
    const S = (m: string, p: string, b?: unknown) =>
      req(base, m, p, b, supToken)
    r = await S("GET", "/admin/officers")
    check(
      "supervisor GET /admin/officers 200",
      r.status === 200,
      `got ${r.status}`,
    )
    r = await S("POST", "/alerts", {
      title: "Supervisor notice",
      body: "Scheduled work",
      severity: "warning",
      targetWards: ["Rankala"],
    })
    check("supervisor POST /alerts 201", r.status === 201, `got ${r.status}`)

    // FIX 4: admin writes.
    r = await T("PUT", "/admin/settings", { nrwWarningThreshold: "22" })
    check(
      "admin PUT /admin/settings 200",
      r.status === 200 && r.json?.data?.nrwWarningThreshold === "22",
      `got ${r.status}`,
    )
    r = await T("PUT", "/admin/permissions/Operator", {
      role: "Operator",
      manageUsers: false,
      manageRoles: false,
      viewAudit: false,
      systemSettings: false,
      editSchedules: false,
      approveRequests: false,
    })
    check(
      "admin PUT /admin/permissions/Operator 200",
      r.status === 200,
      `got ${r.status}`,
    )
    r = await T("PUT", "/admin/permissions/NoSuchRole", {
      role: "NoSuchRole",
      manageUsers: false,
      manageRoles: false,
      viewAudit: false,
      systemSettings: false,
      editSchedules: false,
      approveRequests: false,
    })
    check(
      "PUT /admin/permissions unknown role 404",
      r.status === 404,
      `got ${r.status}`,
    )
    r = await T("POST", "/admin/officers", {
      name: "Ops Tester",
      email: "ops.tester@kmcwater.gov.in",
      phone: "+91 9000000000",
      role: "Operator",
      department: "Tanker Ops",
      zone: "West Zone",
    })
    check(
      "admin POST /admin/officers 201",
      r.status === 201 && typeof r.json?.data?.id === "string",
      `got ${r.status} ${JSON.stringify(r.json?.data)?.slice(0, 120)}`,
    )
    r = await T("PATCH", "/admin/officers/USR-001", { status: "Inactive" })
    check("self-deactivation rejected 403", r.status === 403, `got ${r.status}`)

    // FIX 5: Operator is read-only except service-request actions.
    const opLogin = await req(base, "POST", "/auth/officer/login", {
      email: "ops.tester@kmcwater.gov.in",
      password: "Password123!",
    })
    const opToken = opLogin.json?.data?.token as string
    const O = (m: string, p: string, b?: unknown) => req(base, m, p, b, opToken)
    r = await O("GET", "/admin/audit-logs")
    check(
      "operator GET /admin/audit-logs 403",
      r.status === 403,
      `got ${r.status}`,
    )
    r = await O("POST", "/alerts", { title: "t", body: "b", severity: "info" })
    check("operator POST /alerts 403", r.status === 403, `got ${r.status}`)
    r = await O("POST", "/supply/outages", {
      ward: "Rankala",
      zone: "West Zone",
      reason: "T",
      type: "Scheduled",
      startTime: "12 Sep 2026, 06:00 AM",
      estimatedRestoration: "12 Sep 2026, 02:00 PM",
    })
    check(
      "operator POST /supply/outages 403",
      r.status === 403,
      `got ${r.status}`,
    )
    r = await O("PATCH", "/citizens/requests/SR-2024-0440", {
      status: "Assigned",
    })
    check(
      "operator PATCH service request 200",
      r.status === 200 && r.json?.data?.status === "Assigned",
      `got ${r.status}`,
    )
    r = await O("GET", "/supply/schedule")
    check(
      "operator GET schedule 200 (reads allowed)",
      r.status === 200,
      `got ${r.status}`,
    )

    // Deactivated officers cannot log in (do this after role tests).
    r = await T("PATCH", "/admin/officers/USR-002", { status: "Inactive" })
    check(
      "admin deactivates USR-002 200",
      r.status === 200 && r.json?.data?.status === "Inactive",
      `got ${r.status}`,
    )
    r = await req(base, "POST", "/auth/officer/login", {
      email: "anil.jadhav@kmcwater.gov.in",
      password: "Password123!",
    })
    check("deactivated officer login 403", r.status === 403, `got ${r.status}`)

    // FIX 3: audit trail grows, newest-first, filters.
    const logsBefore = (await T("GET", "/admin/audit-logs")).json
      ?.data as Array<{
      id: string
      action: string
      module: string
    }>
    r = await T("PUT", "/supply/schedule", {
      ward: "Rankala",
      zone: "West",
      scheduled: "07:00–09:00",
      actual: "07:00–09:00",
      pressure: 86,
      status: "On Time",
    })
    check(
      "schedule PUT for audit probe 200",
      r.status === 200,
      `got ${r.status}`,
    )
    const logsAfter = (await T("GET", "/admin/audit-logs")).json
      ?.data as Array<{
      id: string
      action: string
      module: string
    }>
    check(
      "audit count increases + newest first",
      logsAfter?.length === logsBefore?.length + 1 &&
        logsAfter?.[0]?.action === "SCHEDULE_UPDATED",
      `${logsBefore?.length} -> ${logsAfter?.length}, first=${logsAfter?.[0]?.action}`,
    )
    r = await T("GET", "/admin/audit-logs?module=Supply")
    check(
      "audit ?module= filter",
      r.status === 200 &&
        (r.json?.data as Array<{ module: string }>)?.every(
          (l) => l.module === "Supply",
        ),
      `got ${r.status}`,
    )
    r = await T("GET", "/admin/audit-logs?q=SCHEDULE_UPDATED")
    check(
      "audit ?q= filter",
      r.status === 200 && (r.json?.data as unknown[])?.length >= 1,
      `got ${r.status}`,
    )

    // FIX 7: status alias reuses the same service.
    r = await T("PATCH", "/complaints/CMP-2024-0890/status", {
      status: "Resolved",
    })
    check(
      "PATCH /complaints/:id/status 200",
      r.status === 200 && r.json?.data?.status === "Resolved",
      `got ${r.status}`,
    )
    r = await T("PATCH", "/complaints/CMP-2024-0890/status", {
      status: "Bogus",
    })
    check(
      "PATCH /complaints/:id/status rejects bad enum 422",
      r.status === 422,
      `got ${r.status}`,
    )

    // FIX 11: outage/maintenance date validation.
    const badDateOutage = {
      ward: "Rankala",
      zone: "West Zone",
      reason: "T",
      type: "Scheduled",
      startTime: "not-a-date",
      estimatedRestoration: "12 Sep 2026, 02:00 PM",
    }
    r = await T("POST", "/supply/outages", badDateOutage)
    check("invalid outage date -> 422", r.status === 422, `got ${r.status}`)
    r = await T("POST", "/supply/outages", {
      ward: "Rankala",
      zone: "West Zone",
      reason: "T",
      type: "Scheduled",
      startTime: "12 Sep 2026, 02:00 PM",
      estimatedRestoration: "12 Sep 2026, 06:00 AM",
    })
    check("outage end-before-start -> 422", r.status === 422, `got ${r.status}`)
    r = await T("POST", "/supply/maintenance", {
      title: "T",
      type: "Preventive",
      ward: "Rankala",
      scheduledDate: "garbage",
      assignedTeam: "SCADA",
    })
    check(
      "invalid maintenance date -> 422",
      r.status === 422,
      `got ${r.status}`,
    )

    // FIX 10: NRW zone update recomputes; guards enforced.
    r = await T("PUT", "/nrw/zones/East%20Zone", {
      inputVolumeKL: 1000,
      billedVolumeKL: 800,
    })
    check(
      "NRW zone PUT recomputes",
      r.status === 200 &&
        r.json?.data?.nrwPercentage === 20 &&
        r.json?.data?.nrwVolumeKL === 200,
      `got ${r.status} ${JSON.stringify(r.json?.data)}`,
    )
    r = await T("PUT", "/nrw/zones/East%20Zone", {
      inputVolumeKL: 500,
      billedVolumeKL: 600,
    })
    check("NRW billed > input -> 422", r.status === 422, `got ${r.status}`)
    r = await T("PUT", "/nrw/zones/Nope%20Zone", {
      inputVolumeKL: 100,
      billedVolumeKL: 50,
    })
    check("NRW unknown zone -> 404", r.status === 404, `got ${r.status}`)
    r = await T("POST", "/nrw/compare", { wards: ["Shahupuri", "Shahupuri"] })
    check(
      "NRW compare duplicate wards -> 422",
      r.status === 422,
      `got ${r.status}`,
    )
  } catch (e) {
    console.error("HARNESS ERROR:", (e as Error).message)
    process.exitCode = 1
  } finally {
    server.close()
  }

  const failed = results.filter((x) => !x.pass)
  console.log(
    `\n${results.length - failed.length}/${results.length} checks passed`,
  )
  if (failed.length) process.exitCode = 1
})()
