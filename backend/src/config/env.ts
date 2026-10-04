import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback: string): string {
  const value = process.env[name];
  if (value && value.length > 0) return value;
  if (process.env["NODE_ENV"] === "production" && !fallback) {
    throw new Error(`Missing required env var ${name}`);
  }
  return fallback;
}

export const env = {
  port: Number(process.env["PORT"] || 8000),
  nodeEnv: process.env["NODE_ENV"] || "development",
  jwtSecret: required(
    "JWT_SECRET",
    "dev-only-insecure-secret-change-me-64-chars-minimum-length-0123456789",
  ),
  jwtExpiresIn: process.env["JWT_EXPIRES_IN"] || "7d",
  refreshExpiresIn: process.env["JWT_REFRESH_EXPIRES_IN"] || "30d",
  corsOrigins: (process.env["CORS_ORIGINS"] ||
    "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174"
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  isDev: (process.env["NODE_ENV"] || "development") !== "production",
};
