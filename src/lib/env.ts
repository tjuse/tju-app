/**
 * 环境变量验证（Zod）
 * 在应用启动时立即报错，而不是在运行时出现神秘的 undefined。
 */
import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Auth
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 chars"),

  // Anthropic (optional in dev if you don't use OCR)
  ANTHROPIC_API_KEY: z.string().startsWith("sk-ant-").optional(),
  ANTHROPIC_MODEL: z
    .enum(["claude-opus-4-8", "claude-sonnet-4-6", "claude-haiku-4-5-20251001"])
    .default("claude-opus-4-8"),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Phase 2 (optional until Phase 2)
  CREDENTIAL_ENC_KEY: z.string().length(64).optional(), // 32-byte hex = 64 chars
});

// In Next.js, server-side env is validated at runtime.
// This throws at import time if something is wrong.
function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(result.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables — check .env.local");
  }
  return result.data;
}

export const env = validateEnv();
