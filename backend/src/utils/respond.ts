// Standard envelopes per docs/api-contract.md.

// Success: { success: true, data } — typed as @water/types ApiResponse<T>.

// Error: message/code/status/details at BOTH levels, because the existing

// api-client reads json.message alongside json.error.message:

// { success: false, message, code, status, details,

//   error: { message, code, status, details } }

import type { Response } from "express"

import type { ApiResponse } from "@water/types"

import type { z } from "zod"

export function ok<T>(res: Response, data: T, status = 200): Response {
  const body: ApiResponse<T> = { success: true, data }

  return res.status(status).json(body)
}

export function fail(
  res: Response,

  status: number,

  message: string,

  code?: string,

  details?: unknown,
): Response {
  const body = {
    success: false as const,

    message,

    code,

    status,

    details,

    error: { message, code, status, details },
  }

  return res.status(status).json(body)
}

export const badRequest = (
  res: Response,
  message = "Invalid request",
  details?: unknown,
): Response => fail(res, 400, message, "BAD_REQUEST", details)

export const unauthorized = (
  res: Response,
  message = "Unauthorized access",
): Response => fail(res, 401, message, "AUTH_UNAUTHORIZED")

export const forbidden = (
  res: Response,
  message = "Forbidden: insufficient role",
): Response => fail(res, 403, message, "AUTH_FORBIDDEN")

export const notFound = (
  res: Response,
  message = "Resource not found",
): Response => fail(res, 404, message, "RESOURCE_NOT_FOUND")

export function zodToDetails(err: z.ZodError): Record<string, string[]> {
  const details: Record<string, string[]> = {}

  for (const issue of err.issues) {
    const key = issue.path.join(".") || "body"

    if (!details[key]) details[key] = []

    details[key].push(issue.message)
  }

  return details
}
