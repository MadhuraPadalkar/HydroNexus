import crypto from "crypto"
import jwt from "jsonwebtoken"
import type { UserSession } from "../../../packages/types/src/index"
import { env } from "../config/env"
import { signAccessToken, signRefreshToken } from "../middleware/auth"
import { citizenRepository } from "../repositories/citizenRepository"
import { db } from "../repositories/store"

const OTP_TTL_MS = 5 * 60 * 1000
const OTP_MAX_ATTEMPTS = 5
const DEV_OTP = "123456"

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  return digits.length === 12 && digits.startsWith("91")
    ? digits.slice(2)
    : digits.slice(-10)
}

function issueSession(
  citizenId: string,
): UserSession & { refreshToken: string } {
  const citizen = citizenRepository.findById(citizenId)
  if (!citizen) throw new Error("Citizen not found")
  const access = signAccessToken({
    sub: citizen.id,
    role: "Citizen",
    phone: citizen.phone,
    consumerId: citizen.consumerNumber,
    ward: citizen.ward,
  })
  const refresh = signRefreshToken({ sub: citizen.id, role: "Citizen" })
  db.refreshTokens.set(refresh, {
    token: refresh,
    citizenId: citizen.id,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  })
  return {
    token: access,
    refreshToken: refresh,
    user: {
      id: citizen.id,
      name: citizen.name,
      role: "Citizen",
      phone: citizen.phone,
      ward: citizen.ward,
      consumerId: citizen.consumerNumber,
    },
  }
}

export const authService = {
  requestOtp(phone: string): { otpSent: boolean } {
    const normalized = normalizePhone(phone)
    const otp = env.isDev ? DEV_OTP : String(crypto.randomInt(100000, 999999))
    db.otps.set(normalized, {
      phone: normalized,
      otp,
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
    })
    // SMS gateway integration point (SMS_GATEWAY_API_KEY). Dev logs the OTP.
    // eslint-disable-next-line no-console
    console.log(`[otp] ${normalized}: ${otp}`)
    return { otpSent: true }
  },

  verifyOtp(
    phone: string,
    otp: string,
    name?: string,
    ward?: string,
  ): UserSession & { refreshToken: string } {
    const normalized = normalizePhone(phone)
    const entry = db.otps.get(normalized)
    if (!entry || Date.now() > entry.expiresAt) {
      throw Object.assign(new Error("OTP expired or not requested"), {
        status: 401,
        code: "AUTH_OTP_EXPIRED",
      })
    }
    entry.attempts += 1
    if (entry.attempts > OTP_MAX_ATTEMPTS) {
      db.otps.delete(normalized)
      throw Object.assign(new Error("Too many OTP attempts"), {
        status: 401,
        code: "AUTH_OTP_LOCKED",
      })
    }
    if (otp !== entry.otp) {
      throw Object.assign(new Error("Invalid OTP"), {
        status: 401,
        code: "AUTH_INVALID_OTP",
      })
    }
    db.otps.delete(normalized)
    let citizen = citizenRepository.findByPhone(normalized)
    if (!citizen) {
      citizen = citizenRepository.create({
        name: name || "New Citizen",
        phone: normalized,
        ward,
      })
    }
    return issueSession(citizen.id)
  },

  refresh(refreshToken: string): { token: string; refreshToken: string } { {
    let sub = ""
    try {
      const payload = jwt.verify(refreshToken, env.jwtSecret) as {
        sub: string
        type?: string
      }
      if (payload.type !== "refresh") throw new Error("not a refresh token")
      sub = payload.sub
    } catch {
      throw Object.assign(new Error("Invalid refresh token"), {
        status: 401,
        code: "AUTH_UNAUTHORIZED",
      })
    }
    const stored = db.refreshTokens.get(refreshToken)
    if (!stored || stored.citizenId !== sub || Date.now() > stored.expiresAt) {
      throw Object.assign(new Error("Refresh token expired"), {
        status: 401,
        code: "AUTH_UNAUTHORIZED",
      })
    }
    db.refreshTokens.delete(refreshToken)
    const citizen = citizenRepository.findById(sub)
    if (!citizen) {
      throw Object.assign(new Error("Citizen not found"), {
        status: 401,
        code: "AUTH_UNAUTHORIZED",
      })
    }
    const access = signAccessToken({
      sub: citizen.id,
      role: "Citizen",
      phone: citizen.phone,
      consumerId: citizen.consumerNumber,
      ward: citizen.ward,
    })
    const next = signRefreshToken({ sub: citizen.id, role: "Citizen" })
    db.refreshTokens.set(next, {
      token: next,
      citizenId: citizen.id,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    })
    return { token: access, refreshToken: next }
  }
},}
