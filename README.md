<div align="center">

# tju.app

**天津大学校园 Dashboard** — 课程表 · 校历 · 校园卡 · 电费 · 常用链接

美观、可交互、功能大而全。极简现代设计，深色为主，PWA 可安装。

</div>

---

## ✨ 特性

- 🎨 **一流 UI/UX** —— 极简现代设计系统（Linear/Vercel 风），深色为主 + 北洋蓝强调色，流畅微动效
- 📅 **课程表** —— 手动录入 / ICS 导入 / **截图 AI 识别**（Claude 视觉），周视图、当前课程高亮
- 🗓 **校历** —— 学期周次、考试周、假期一目了然，"今天第几周"
- 🔗 **常用链接** —— 内置 TJU 高频入口 + 自定义
- 💳 **校园卡 / ⚡ 电费** —— 余额与消费趋势（Phase 2，需校园认证）
- 📱 **PWA** —— 添加到主屏幕、离线缓存，响应式适配手机/桌面

## 🛠 技术栈

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn 风格组件 · Framer Motion · TanStack Query · Prisma + PostgreSQL · Auth.js · Serwist (PWA) · Anthropic SDK · Biome · Vitest / Playwright · pnpm

## 🚀 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env.local
#   - DATABASE_URL：本地 docker Postgres 默认值即可
#   - AUTH_SECRET：openssl rand -hex 32
#   - ANTHROPIC_API_KEY：用截图导入时需要

# 3. 起本地数据库 + 建表
docker compose up -d
pnpm db:migrate

# 4. 开发
pnpm dev          # http://localhost:3000
```

## 常用命令

| 命令 | 作用 |
|---|---|
| `pnpm dev` | 开发服务器（webpack） |
| `pnpm build` | 生产构建 |
| `pnpm typecheck` | TypeScript 检查 |
| `pnpm lint` / `pnpm lint:fix` | Biome 检查 / 自动修复 |
| `pnpm test` | 单元测试（Vitest） |
| `pnpm test:e2e` | 端到端测试（Playwright） |
| `pnpm db:studio` | Prisma Studio |

> **注**：构建用 `--webpack`（Serwist 暂不支持 Turbopack）。Biome 命令不要带 `.` 路径参数。

## 📁 项目结构 / 文档

- [AGENTS.md](./AGENTS.md) — 协作约定（必读）
- [docs/ROADMAP.md](./docs/ROADMAP.md) — 分阶段路线图
- [docs/DEV_PLAN.md](./docs/DEV_PLAN.md) — 开发任务拆解
- [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) — 设计系统
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — 架构
- [docs/CONNECTORS.md](./docs/CONNECTORS.md) — TJU 数据接入（Phase 2）

## ⚠️ 说明

非官方项目。需登录的功能仅抓取**用户本人授权**的数据，凭据加密存储、绝不明文记录。校历等静态数据需每学期核对官方发布更新。

可部署到 Vercel（Phase 2 校内抓取可能受 Serverless IP/超时限制，详见架构文档的 connector 解耦方案）。
