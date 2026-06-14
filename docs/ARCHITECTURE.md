# 架构说明 — tju.app

## 总览

单仓库 Next.js（App Router）全栈应用。前端 + 后端（Route Handlers）同处一个项目，按 **feature 模块**组织，**数据来源（connector）层与 UI 层解耦**。

```
浏览器 (响应式 Web + PWA)
   │  TanStack Query
   ▼
Next.js Route Handlers (/api/*)      ← 后端
   │
   ├── features/* 业务逻辑（公开数据：calendar / links）
   ├── lib/ai     课表截图 → Claude 视觉解析
   ├── lib/db     Prisma → PostgreSQL（用户 / 课程 / 自定义链接）
   └── lib/connectors/tju  ★ CAS 登录 + 教务/校园卡/电费抓取（Phase 2）
```

## 分层

| 层 | 位置 | 职责 |
|---|---|---|
| 页面 / UI | `app/(dashboard)/*`、`components/*` | 渲染、交互、动效。Server Component 优先 |
| 业务逻辑 | `features/*` | 纯函数 / hooks，与渲染解耦，易测试 |
| API | `app/api/*` | Zod 校验入参，调用 features/lib，返回 JSON |
| 数据来源 | `lib/connectors/tju/*` | **接口稳定、实现可替换**的抓取层 |
| 持久化 | `lib/db` + `prisma/schema.prisma` | Prisma 单例 + 数据模型 |
| 基础设施 | `lib/{ai,auth,env,utils}` | AI、鉴权、env 校验、工具 |

## Connector 解耦（关键设计）

`lib/connectors/tju/*` 暴露**纯函数接口**：输入凭据 / 会话，输出结构化数据（`TjuCourse`、`CardBalance` 等）。上层 API 只依赖这些类型，不关心实现。

**为什么**：Phase 2 要抓取校内系统。部署在 **Vercel Serverless** 时可能遇到：
- 函数超时（Hobby 60s / Pro 可调 `maxDuration`）
- 出口 IP 被学校系统限制 / 封禁
- 冷启动

一旦受限，可把 connector 整体搬到**独立自托管 worker**（通过队列 / webhook 调用），**主应用与 UI 零改动**。这是把"抓取"与"产品"隔离的保险。

## 数据流示例

- **校历**（公开）：`features/calendar/calendar-data.ts`（静态）→ `app/api/calendar` → 页面。
- **课表截图导入**：前端上传图片 → `POST /api/import/ocr` → `lib/ai.parseScheduleImage`（Claude 视觉 + tool use）→ 返回结构化课程 → 前端预览确认 → 写入 DB（`Course`，`source=ocr`）。
- **课表自动同步**（Phase 2）：`lib/connectors/tju/cas.casLogin` → `schedule.fetchScheduleFromTju` → 落库（`source=sync`）。

## 鉴权

Auth.js (NextAuth v5)，数据库会话策略，Prisma adapter。MVP 单用户即可；多用户开放时复用同一套（数据按 `userId` 隔离）。

## PWA

Serwist（`app/sw.ts`）预缓存 + 运行时缓存；`manifest.ts` 提供可安装元信息。开发模式禁用 SW 避免缓存干扰。

## 已知约束

- **构建用 webpack**（`--webpack`）：Serwist 暂不支持 Turbopack。
- Biome 2.x：命令不带 `.` 路径参数；需在 git 仓库内运行（依赖 `.gitignore`）。
