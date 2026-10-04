import type { NextFunction, Request, Response } from "express"
import { ZodError, type ZodSchema } from "zod"

/** Validate req.body against a Zod schema; 422 with field details on failure. */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      res.status(422).json({
        success: false,
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          status: 422,
          details: flattenZod(parsed.error),
        },
      })
      return
    }
    req.body = parsed.data
    next()
  }
}

function flattenZod(error: ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "body"
    out[key] = [...(out[key] || []), issue.message]
  }
  return out
}

/** Fallback error handler producing the docs/api-contract.md ApiError envelope. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
)// eslint-disable-next-line @typescript-eslint/no-unused-vars
: void {
  // eslint-disable-next-line no-console
  console.error(err)
  res.status(500).json({
    success: false,
    error: {
      message: "Internal server error",
      code: "INTERNAL_ERROR",
      status: 500,
    },
  })
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      message: "Resource not found",
      code: "RESOURCE_NOT_FOUND",
      status: 404,
    },
  })
}
