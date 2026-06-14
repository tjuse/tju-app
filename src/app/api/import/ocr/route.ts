import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseScheduleImage } from "@/lib/ai";

export const runtime = "nodejs";
// 视觉模型解析较慢，提高超时（Vercel Pro 可用；Hobby 上限 60s）
export const maxDuration = 60;

const requestSchema = z.object({
  image: z.string().min(1), // base64（不含 data: 前缀）
  mediaType: z.enum(["image/jpeg", "image/png", "image/webp"]).default("image/jpeg"),
});

/**
 * POST /api/import/ocr
 * 接收课表截图 base64，调用 Claude 视觉解析为结构化课程。
 * 返回解析结果供前端预览确认后再入库（不直接写 DB）。
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await parseScheduleImage(parsed.data.image, parsed.data.mediaType);
    return NextResponse.json({ data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "OCR parsing failed";
    // 不泄露内部细节给客户端，仅记录到服务端日志
    console.error("[OCR] parse error:", message);
    return NextResponse.json({ error: "课表识别失败，请重试或手动录入" }, { status: 500 });
  }
}
