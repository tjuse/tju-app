# 路线图 — tju.app

## Phase 0 — 项目骨架 ✅（已完成）

- [x] Next.js 16 + TS + Tailwind v4 + pnpm 脚手架
- [x] Biome（lint+format）、Vitest、Playwright 配置
- [x] Prisma 6 + schema（User / Credential / Course / Link + Auth.js 表）
- [x] Auth.js (NextAuth v5) 脚手架
- [x] 设计系统 token + 深色主题 + 浅色切换
- [x] Dashboard 布局壳（侧边栏 / 移动端 Tab / Header / 主题切换）
- [x] UI 基础组件（Button/Card/Badge/Skeleton）+ 动效封装（FadeIn）
- [x] PWA（manifest + Serwist + 图标）
- [x] AGENTS.md + docs + .env.example + docker-compose + CI

## Phase 1 — MVP（公开数据，可用且漂亮）🚧 进行中

> 骨架与静态数据已就绪；待接入 DB 持久化与交互。

- [x] 概览首页（Bento 聚合卡片：今日课程 / 本周 / 校历 / 链接 + Phase2 占位）
- [x] 常用链接页（内置 TJU 站点，按分类展示）
- [x] 校历页（学期 / 当前周 / 事件时间线）+ `/api/calendar`
- [x] 课程表页（周视图 timetable + 空态）
- [x] 课表截图 AI 解析后端（`/api/import/ocr` + Claude 视觉）
- [ ] **接入 DB**：登录 + 课程/自定义链接持久化（CRUD）
- [ ] 课表：手动录入表单、ICS 导入（node-ical）、截图导入前端走查确认流
- [ ] 课表 ICS 导出（ics 包）
- [ ] 链接：用户自定义增删改 + 拖拽排序
- [ ] 天气卡片（接公开天气 API）
- [ ] 空/错/载状态全覆盖 + 响应式打磨 + Lighthouse PWA 验收

## Phase 2 — 敏感功能（CAS 登录 + 抓取）

- [ ] CAS 模拟登录可行性脚本验证（`lib/connectors/tju/cas.ts`）
- [ ] 凭据 AES-GCM 加密存储 / 短期会话；日志脱敏
- [ ] 课表自动同步（`source=sync`）
- [ ] 校园卡：余额 + 流水 + Recharts 趋势/分类
- [ ] 电费：余额 + 用量趋势 + 低额提醒
- [ ] 若 Vercel 抓取受限 → connector 迁独立 worker

## Phase 3 — 增强与开放

- [ ] 多用户开放（注册、数据隔离、限流、隐私声明）
- [ ] 通知/提醒（上课提醒、电费低）
- [ ] 设置中心、主题定制、更多 Widget
- [ ] 可观测性（错误上报）、E2E 覆盖、性能预算
