<div align="center">

# tju.app

**天津大学校园 Dashboard** — 公共课表 · 课程表 · 校历 · 成绩 · 考试 · 常用链接

美观、可交互、功能大而全。极简现代设计，深色为主，PWA 可安装。

[English README](./README.md) · [AGENTS.md](./AGENTS.md) · [路线图](./docs/ROADMAP.md)

</div>

---

## ✨ 特性

- 🎨 **一流 UI/UX** — 极简现代设计系统（Linear/Vercel 风），深色为主 + 北洋蓝强调色，流畅微动效
- 📚 **公共课表** — 全校课程库（每学期 5000+ 门），历史学期检索，筛选/统计/趋势分析
- ⭐ **收藏 + 冲突检测** — 收藏课程后自动检测时间冲突
- 📅 **课程表** — 截图 AI 识别（Claude 视觉）/ 手动录入导入，周视图
- 🗓 **校历** — 学期周次、考试周、假期一目了然
- 🔗 **常用链接** — 内置 TJU 高频入口（教务、图书馆、SSO、邮件…）
- 🎓 **成绩** — 完整历史成绩 + GPA 汇总（本地凭据）
- 📝 **考试** — 考试时间/地点/座位安排（本地凭据）
- 📱 **PWA** — 可安装、离线缓存，响应式适配手机/桌面

## 🛠 技术栈

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 · shadcn 风格组件 · Zustand · Recharts · Serwist (PWA) · Anthropic SDK · Biome · Vitest / Playwright · pnpm

课表数据源：**[`tju`](https://github.com/tjuse/tju-python)** Python 库（封装 SSO + EAMS），经 `scripts/tju_cli.py` 桥接。**无数据库、无 Docker**，文件 JSON 缓存。

## 🚀 快速开始

### 云端部署（演示模式）

在 **Vercel** 或 **Netlify** 上 import `https://github.com/tjuse/tju-app` 即可一键部署，无需额外配置（已内置 `netlify.toml`）。课程库、统计、趋势、冲突检测、课程对比开箱即用（内置演示数据）。个人功能（课程表、成绩、考试）在配置凭据前显示演示提示。

### 本地运行（全功能）

```bash
# 1. 安装 JS 依赖
pnpm install

# 2. 安装 Python 依赖（创建 .venv + 安装 tju）
pnpm py:setup

# 3. 配置环境变量
cp .env.example .env.local
#   编辑 .env.local：
#   - TJU_USER / TJU_PASS  — 学号与统一认证密码（实时抓取用）
#   - TJU_ENV_FILE          — 或指向已有 .env 文件
#   - ANTHROPIC_API_KEY     — 可选，课表截图识别

# 4. 开发
pnpm dev          # http://localhost:3000

# 抓取当前学期公共课表（需校园网/VPN）
pnpm tju:courses
```

## 常用命令

| 命令 | 说明 |
|---|---|
| `pnpm dev` | 开发服务器（webpack） |
| `pnpm build` | 生产构建 |
| `pnpm typecheck` | TypeScript 检查 |
| `pnpm lint` / `pnpm lint:fix` | Biome 检查 / 自动修复 |
| `pnpm test` | 单元测试（Vitest） |
| `pnpm test:e2e` | 端到端测试（Playwright） |
| `pnpm py:setup` | 创建 .venv 并安装 tju |
| `pnpm tju:schedule` | 命令行抓课表（调试） |

> **注**：构建用 `--webpack`（Serwist 暂不支持 Turbopack）。Biome 命令不要带 `.` 路径参数。

## 📁 项目结构 / 文档

- [AGENTS.md](./AGENTS.md) — 协作约定
- [docs/ROADMAP.md](./docs/ROADMAP.md) — 路线图
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — 架构
- [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) — 设计系统
- [docs/CONNECTORS.md](./docs/CONNECTORS.md) — TJU 数据接入

## ⚠️ 说明

非官方项目。需登录的功能仅抓取**用户本人授权**的数据；凭据只存 `.env.local`，绝不写日志或缓存文件。课表数据源 [`tju`](https://github.com/tjuse/tju-python) 为 GPL-3.0 协议。
