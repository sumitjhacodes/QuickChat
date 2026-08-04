import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(8000),
  MONGODB_URI: z.string().min(1).default("mongodb://127.0.0.1:27017/chat-app"),
  JWT_SECRET: z
    .string()
    .min(32)
    .default("chat-app-super-secret-key-please-change-me"),
  JWT_EXPIRES_IN: z.string().min(1).default("15m"),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:3000"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables");
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
