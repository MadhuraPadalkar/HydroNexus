// Officer/admin repository — future tables: officer_users, audit_logs,
// system settings. Credential lookup stays here; hashing/JWT in the route.
// Audit listing delegates to auditRepository (single newest-first source).
import bcrypt from "bcryptjs"
import type {
  AuditLog,
  OfficerUser,
  RolePermissions,
  SystemSettingsConfig,
} from "@water/types"
import {
  officerCredentials,
  officers,
  rolePermissions,
  systemSettings,
} from "../data/store"
import type { OfficerCredential, OfficerRole } from "../domain"
import { auditRepository, type AuditFilters } from "./auditRepository"

export interface CreateOfficerInput {
  name: string
  email: string
  phone: string
  role: OfficerRole
  department: string
  zone: string
}

export interface UpdateOfficerInput {
  role?: OfficerRole
  department?: string
  zone?: string
  status?: OfficerUser["status"]
}

export interface OfficerRepository {
  findByEmail(email: string): OfficerUser | undefined
  findById(id: string): OfficerUser | undefined
  getCredential(email: string): OfficerCredential | undefined
  listOfficers(): OfficerUser[]
  createOfficer(input: CreateOfficerInput): OfficerUser | undefined
  updateOfficer(id: string, patch: UpdateOfficerInput): OfficerUser | undefined
  listPermissions(): RolePermissions[]
  updatePermissions(
    role: string,
    body: RolePermissions,
  ): RolePermissions | undefined
  getSettings(): SystemSettingsConfig
  updateSettings(patch: Partial<SystemSettingsConfig>): SystemSettingsConfig
  listAuditLogs(filters?: AuditFilters): AuditLog[]
}

let officerSeq = 5

export const officerRepository: OfficerRepository = {
  findByEmail(email) {
    return officers.find((o) => o.email.toLowerCase() === email.toLowerCase())
  },

  findById(id) {
    return officers.find((o) => o.id === id)
  },

  getCredential(email) {
    return officerCredentials[email.toLowerCase()]
  },

  listOfficers() {
    return [...officers]
  },

  createOfficer(input) {
    if (
      officers.some((o) => o.email.toLowerCase() === input.email.toLowerCase())
    ) {
      return undefined
    }
    const officer: OfficerUser = {
      id: `USR-${String(officerSeq).padStart(3, "0")}`,
      status: "Active",
      lastActive: "Never",
      ...input,
    }
    officerSeq += 1
    officers.push(officer)
    officerCredentials[officer.email.toLowerCase()] = {
      hash: bcrypt.hashSync("Password123!", 10),
      officerId: officer.id,
    }
    return officer
  },

  updateOfficer(id, patch) {
    const officer = officers.find((o) => o.id === id)
    if (!officer) return undefined
    Object.assign(officer, patch)
    return officer
  },

  listPermissions() {
    return [...rolePermissions]
  },

  updatePermissions(role, body) {
    const entry = rolePermissions.find((r) => r.role === role)
    if (!entry) return undefined
    Object.assign(entry, body, { role })
    return entry
  },

  getSettings() {
    return { ...systemSettings }
  },

  updateSettings(patch) {
    Object.assign(systemSettings, patch)
    return { ...systemSettings }
  },

  listAuditLogs(filters) {
    return auditRepository.list(filters)
  },
}
