# 开发计划 — tju.app

本文件是可执行的开发拆解，配合 `ROADMAP.md`（阶段）与 `ARCHITECTURE.md`（结构）使用。

## 当前状态

**Phase 0 完成，Phase 1 进行中。** 应用可构建、可启动，静态数据驱动的页面（概览 / 校历 / 链接 / 课表骨架）已就绪。下一步是接入数据库做持久化与交互。

## Phase 1 任务拆解（按推荐顺序）

### 1. 数据库接通
- 起本地 Postgres：`docker compose up -d`
- 配 `.env.local` 的 `DATABASE_URL`、`AUTH_SECRET`（`openssl rand -hex 32`）
- `pnpm db:migrate`（首次建表）→ `pnpm db:seed`（灌入内置链接 + 校历，可选）
- **验收**：`pnpm db:studio` 能看到表结构

### 2. 登录（最小可用）
- Auth.js 已脚手架（Resend magic link）。开发期可临时加 Credentials provider 便于本地。
- 加 `/login` 页 + 会话守卫（dashboard 需登录）
- **验收**：登录后 `auth()` 能拿到 `user.id`

### 3. 课程表 CRUD
- `features/schedule/`：service 函数（list/create/update/delete，按 `userId`）
- `/api/schedule` Route Handlers（Zod 校验）
- 手动录入表单（react-hook-form + zod + Dialog）
- 复用已有 `Timetable` 组件渲染；首页 `TodayCoursesWidget` 接真实数据（用 `slotToTime` 补时间）
- **验收**：添加/编辑/删除课程，刷新后持久；今日课程正确高亮"进行中"

### 4. 课表导入
- **ICS**：上传 → node-ical 解析 → 映射为 `Course[]`（`source=ics`）→ 预览确认 → 入库
- **截图**：复用 `/api/import/ocr`（已实现 Claude 视觉解析）→ 前端预览/编辑识别结果 → 入库（`source=ocr`）
- **ICS 导出**：用 `ics` 包导出当前课表
- **验收**：导入一个真实 `.ics` 与一张课表截图，结果正确入库

### 5. 链接管理
- `/api/links`：合并内置 + 用户自定义（需登录）
- 自定义增删改 + 拖拽排序（持久化 `order`）
- **验收**：自定义链接增删与排序刷新后保留

### 6. 打磨
- 天气卡片接公开 API
- 全页空/错/载状态、移动端体验、Lighthouse（PWA 可安装 + 性能/可访问性分）

## 质量门禁（每次提交）

```bash
pnpm typecheck && pnpm lint && pnpm test
```
CI（`.github/workflows/ci.yml`）执行相同检查 + `pnpm build`。

## Phase 2 / 3

见 `ROADMAP.md` 与 `CONNECTORS.md`。进入 Phase 2 前务必先用隔离脚本验证 CAS 登录可行性。
