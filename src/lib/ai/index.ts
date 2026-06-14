/**
 * Anthropic client 单例 + 课表截图解析
 * 使用 claude-opus-4-8（默认）的视觉能力 + tool use 输出结构化课程数据。
 */
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

// 延迟初始化，避免在没有 API key 的情况下报错（Phase 1 OCR 可选）
let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set — required for OCR import");
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

// ─── 课程解析输出 Schema ─────────────────────────────────────────

export const ParsedCourseSchema = z.object({
  name: z.string(),
  teacher: z.string().optional(),
  location: z.string().optional(),
  weekday: z.number().int().min(1).max(7),
  startSlot: z.number().int().min(1).max(11),
  endSlot: z.number().int().min(1).max(11),
  weeks: z.array(z.number().int().min(1).max(30)),
  color: z.string().optional(),
});

export type ParsedCourse = z.infer<typeof ParsedCourseSchema>;

const courseListSchema = z.object({
  courses: z.array(ParsedCourseSchema),
  semester: z.string().optional(), // 如 "2025-2026-2"
  notes: z.string().optional(), // 解析备注或警告
});

// ─── 课表截图解析 ────────────────────────────────────────────────

/**
 * 将课表截图（base64 图像）发送给 Claude，返回结构化课程列表。
 * @param imageBase64 - base64 编码的图像数据（不含 data:image/... 前缀）
 * @param mediaType - 图像类型（默认 jpeg）
 */
export async function parseScheduleImage(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg",
): Promise<{ courses: ParsedCourse[]; semester?: string; notes?: string }> {
  const client = getClient();
  const model = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    tools: [
      {
        name: "extract_courses",
        description:
          "从课表截图中提取所有课程信息，返回结构化课程列表。weekday: 1=周一…7=周日；startSlot/endSlot: 节次（1-11）；weeks: 上课周次数组。",
        input_schema: {
          type: "object" as const,
          properties: {
            courses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "课程名称" },
                  teacher: { type: "string", description: "教师姓名（可选）" },
                  location: { type: "string", description: "上课地点（可选）" },
                  weekday: { type: "number", description: "星期几，1=周一，7=周日" },
                  startSlot: { type: "number", description: "开始节次（1-11）" },
                  endSlot: { type: "number", description: "结束节次（含，1-11）" },
                  weeks: {
                    type: "array",
                    items: { type: "number" },
                    description: "上课周次列表，如 [1,2,...,16]",
                  },
                },
                required: ["name", "weekday", "startSlot", "endSlot", "weeks"],
              },
            },
            semester: { type: "string", description: "学期，如 2025-2026-2（可选）" },
            notes: { type: "string", description: "解析备注或不确定项（可选）" },
          },
          required: ["courses"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "extract_courses" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: "请仔细识别这张课程表截图，提取所有课程信息。注意：天津大学课表节次：1-4节为上午，5-8节为下午，9-11节为晚上。如果周次信息显示为「1-16周」则 weeks 为 [1,2,...,16]；「单周」则为奇数周；「双周」则为偶数周。尽量准确，如有不确定请在 notes 中说明。",
          },
        ],
      },
    ],
  });

  // 提取 tool use 结果
  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (toolUse?.type !== "tool_use") {
    throw new Error("Claude did not return tool use result for course parsing");
  }

  const parsed = courseListSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    throw new Error(`Course parsing schema validation failed: ${parsed.error.message}`);
  }

  return parsed.data;
}
