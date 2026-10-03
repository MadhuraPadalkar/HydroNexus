// Typed accessors for Express path/query params (string|string[] in v5 types).
import type { Request } from "express";

export function pathParam(req: Request, name: string): string {
  const v: unknown = req.params[name];
  if (Array.isArray(v)) return String(v[0]);
  return String(v);
}

export function queryParams(req: Request): Record<string, string | undefined> {
  const raw = req.query as Record<string, unknown>;
  const out: Record<string, string | undefined> = {};
  for (const k of Object.keys(raw)) {
    const v: unknown = raw[k];
    out[k] = typeof v === "string" ? v : Array.isArray(v) && typeof v[0] === "string" ? v[0] : undefined;
  }
  return out;
}
