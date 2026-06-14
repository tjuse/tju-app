# AGENTS.md — tju.app

> 本文件是给 AI 编码代理（以及人类协作者）的工作约定。开始任何改动前请通读。

## 项目简介

tju.app 是面向**天津大学**的现代化校园 Dashboard：融合**课程表、校历、校园卡消费、电费、校内常用链接**。目标是 **美观、交互一流、功能全面**，对标主流 SaaS 产品的 UI/UX。

当前阶段：**先自用、架构预留多用户开放**。数据策略为**公开数据优先**，需登录的敏感功能（课表自动同步 / 校园卡 / 电费）后置到 Phase 2。

## 技术栈

- **框架**：Next.js 16 (App Router) · React 19 · TypeScript (strict)
- **样式**：Tailwind CSS v4（设计 token 驱动，见 `src/app/globals.css`）
- **组件**：shadcn 风格自建组件（`src/components/ui`，基于 Radix UI）+ `lucide-react`
- **动效**：Framer Motion（克制、流畅，见 `src/components/motion`）
- **主题**：next-themes（默认 **dark**）
- **数据**：TanStack Query（请求缓存）+ Zustand（轻量客户端状态）
- **校验**：Zod（API 入参、表单、env）
- **数据库**：Prisma 6 + PostgreSQL（本地 Docker / 生产 Neon/Vercel Postgres）
- **鉴权**：Auth.js (NextAuth v5)
- **PWA**：Serwist（`src/app/sw.ts`）
- **AI**：`@anthropic-ai/sdk`，模型默认 `claude-opus-4-8`（课表截图解析）
- **质量**：Biome（lint + format）· Vitest（单元）· Playwright（e2e）
- **包管理**：pnpm

> ⚠️ **构建用 webpack**：Next 16 默认 Turbopack，但 Serwist 暂不支持，故 `dev`/`build` 均加 `--webpack`。待 Serwist 支持 Turbopack 或迁移到 configurator 模式后可移除。

## 目录约定

```
src/
  app/                  路由 + Route Handlers（后端）
    (dashboard)/        主仪表盘布局与各功能页面
    api/                后端接口（calendar/links 公开；import/ocr；auth）
    globals.css         设计系统 token
    manifest.ts  sw.ts  PWA
  components/
    ui/                 基础组件（button/card/badge/skeleton…）
    dashboard/          业务组件（sidebar/header/widgets…）
    motion/             动效封装
  features/             各功能业务逻辑（calendar/schedule/links/…）
  lib/
    connectors/tju/     ★ 数据来源解耦层（CAS 登录与抓取，Phase 2）
    ai/                 Anthropic 客户端 + 课表解析
    db/                 Prisma client 单例
    auth/  env.ts  utils.ts
  types/                全局类型
```

**核心原则**：新功能按 **feature 模块** 组织；**UI 不直接依赖具体数据来源**，只依赖 `lib/connectors` 的接口类型，以便 Phase 2 抓取逻辑可独立演进/迁移（应对 Vercel Serverless 抓取的 IP/超时限制）。

## 设计系统（必须遵守）

极简现代（Linear/Vercel 风）· **深色为主** · 大留白 · 克制微动效 · 强调色 = **天大北洋蓝**。

- 间距 8px 基准；卡片 `rounded-[var(--radius-lg)]`（16px）；边框低对比 + `card-glow` 微弱内发光。
- 文本三档对比：`--color-text-high/mid/low`。强调色仅用于主操作、激活态、数据高亮。
- 状态必备：加载（骨架屏 `Skeleton`）/ 空态 / 错误态，一律精心设计，不留空白。
- 入场动效用 `FadeIn`（opacity + 微小 translateY，~220ms ease-out）；列表用 stagger。
- 可访问性：WCAG AA 对比度、`:focus-visible`、键盘可达、`prefers-reduced-motion` 降级。
- 全部颜色走 CSS 变量（`var(--color-*)`），**不要硬编码十六进制**（课程色板等数据色除外）。

详见 `docs/DESIGN_SYSTEM.md`。

## 命令

```bash
pnpm dev          # 开发（webpack）
pnpm build        # 生产构建（webpack）
pnpm typecheck    # tsc --noEmit
pnpm lint         # biome check（注意：不要传 . 路径参数）
pnpm lint:fix     # biome check --write
pnpm test         # vitest run
pnpm test:e2e     # playwright
pnpm db:migrate   # prisma migrate dev
pnpm db:studio    # prisma studio
docker compose up -d   # 本地 Postgres
```

> Biome 2.x 注意：命令**不要带 `.` 路径参数**（会被误判为 ignored）；依赖 `.gitignore`，需在 git 仓库内运行。

## 编码规范

- TypeScript **strict**；优先 **Server Components**，仅交互处用 `"use client"`。
- 所有 API 入参用 **Zod** 校验；错误响应不泄露内部细节。
- UI 文案用**中文**。
- 提交前必须通过：`pnpm typecheck && pnpm lint && pnpm test`。
- 优先复用 `src/components/ui` 与 `src/lib/utils` 中既有工具（如 `cn`、`slotToTime`、`formatCNY`），不造轮子。

## 分阶段边界

- **Phase 1（当前）**：仅做公开 / 无需登录的数据 —— 常用链接、校历、课表（手动录入 / ICS 导入 / 截图 AI 识别）。
- **Phase 2**：CAS 统一身份认证登录 + 课表自动同步 + 校园卡 + 电费。
  - 除非明确进入 Phase 2，**不要实现真实抓取逻辑**；但要保持 `lib/connectors/tju` 接口就绪（当前为占位，调用即抛 "Phase 2 not implemented"）。

## 安全红线（强制）

- 校内凭据**永不**明文存储 / 打印 / 写日志；用 AES-GCM 加密（`CREDENTIAL_ENC_KEY`）或仅存短期会话。
- 只抓取**用户本人授权**的数据；请求低频、带缓存、尊重学校系统。
- 密钥只放 `.env.local`（已 gitignore），仓库仅保留 `.env.example`。
- 公开服务化前必须补：隐私声明、数据最小化、用户可删除、限流、会话隔离。

## AI 模型

默认 `claude-opus-4-8`（视觉能力强，课表识别准）。课表截图解析用**视觉 + tool use**（结构化 JSON schema），见 `src/lib/ai/index.ts`。模型 ID 可经 `ANTHROPIC_MODEL` 配置（opus / sonnet / haiku）。
