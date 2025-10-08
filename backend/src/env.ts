import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  REFRESH_JWT_SECRET: z.string().min(1, "REFRESH_JWT_SECRET is required"),
  ACCESS_TTL: z.string().default("15m"),
  REFRESH_TTL: z.string().default("7d"),
  CORS_ORIGIN: z.string().min(1, "CORS_ORIGIN is required"),
  PORT: z.coerce.number().default(4000)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
