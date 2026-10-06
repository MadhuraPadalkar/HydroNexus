// Environment + shared configuration.
import dotenv from "dotenv";

dotenv.config();

function csv(value: string | undefined, fallback: string[]): string[] {
  if (!value) return fallback;
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

export interface BackendConfig {
  port: number;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigins: string[];
}

export const config: BackendConfig = {
  port: parseInt(process.env.PORT || "8000", 10),
  jwtSecret: process.env.JWT_SECRET || "dev-only-insecure-jwt-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigins: csv(process.env.CORS_ORIGINS, [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
  ]),
};

if (!process.env.JWT_SECRET) {
  console.warn("[warn] JWT_SECRET not set — using insecure dev fallback. Set JWT_SECRET in backend/.env");
}
