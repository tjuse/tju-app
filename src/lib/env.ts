/**
 * 环境变量验证（Zod）。在导入时即校验，避免运行时神秘 undefined。
 *
 * 注：tju 真实查询需要 TJU_USER/TJU_PASS 且处于校园网/VPN 环境；
 * 这些在开发机（无校园网）可缺省，仅在实际抓取时必需。
 */
import { z } from "zod";

const envSchema = z.object({
  // ─── TJU 凭据（自用；传给 Python 子进程） ───────────────
  TJU_USER: z.string().optional(),
  TJU_PASS: z.string().optional(),

  // Python 解释器路径（默认项目内 venv）
  TJU_PYTHON: z.string().default(".venv/bin/python"),

  // ─── Anthropic（课表截图 OCR，可选） ────────────────────
  ANTHROPIC_API_KEY: z.string().startsWith("sk-ant-").optional(),
  ANTHROPIC_MODEL: z
    .enum(["claude-opus-4-8", "claude-sonnet-4-6", "claude-haiku-4-5-20251001"])
    .default("claude-opus-4-8"),

  // ─── App ────────────────────────────────────────────────
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

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
