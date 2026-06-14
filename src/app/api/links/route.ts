import { NextResponse } from "next/server";
import { builtInLinks } from "@/features/links/builtin-links";

/**
 * GET /api/links
 * Phase 1：返回内置链接。
 * Phase 2：合并用户自定义链接（需鉴权，从 DB 读取）。
 */
export function GET() {
  return NextResponse.json({ data: builtInLinks });
}
