# 开发计划 — tju.app

配合 `ROADMAP.md`（阶段）与 `ARCHITECTURE.md`（结构）使用。

## 当前状态

**课表主链路已打通**：`tju` 库 → `scripts/tju_cli.py` → Next.js spawn → 映射 → 文件缓存 → 课表周视图 + 首页今日课程。已移除数据库/Docker。

> 本环境无校园网,无法端到端跑真实抓取;代码层(typecheck/lint/test/build)全绿。**需在校园网/VPN 环境用真实账号验证**(见下)。

## 立即要做的端到端验证（在校园网机器上）

1. `pnpm install && pnpm py:setup`
2. `.env.local` 填 `TJU_USER` / `TJU_PASS`
3. `pnpm tju:schedule` —— 确认能登录并打印课表 JSON（`{"ok":true,...}`）
4. `pnpm dev` → 打开课表页 → 点「从教务抓取课表」→ 确认课表渲染、周次切换正确、首页今日课程正确
5. 若字段映射有偏差，调整 `src/features/schedule/mapping.ts`（天大节次/周次格式）

## 接下来的任务（推荐顺序）

### 1. 课表截图导入（前端闭环）
- 上传图片 → `POST /api/import/ocr`（已实现 Claude 解析）→ 预览/编辑识别结果 → 合并进缓存
- `mapping.ts` 已有 `parseWeeksString` 可复用

### 2. 成绩 / 考试页
- `scripts/tju_cli.py` 的 `score` / `exam` 子命令已就绪 → 加 `lib/tju/client.ts` 封装 + 缓存 + 页面
- 成绩可做 GPA 概览、按学期分组；考试做时间线 + 倒计时

### 3. 课表手动编辑 / ICS
- 手动新增/编辑课程（覆盖或补充 tju 数据），source 标记区分
- ICS 导入（node-ical）/ 导出（ics）

### 4. 链接自定义 + 打磨
- 自定义链接增删 + 拖拽排序，localStorage 持久化
- 天气卡片、全页空/错/载状态、移动端、Lighthouse

## 质量门禁（每次提交）

```bash
pnpm typecheck && pnpm lint && pnpm test
```
CI（`.github/workflows/ci.yml`）执行相同检查 + `pnpm build`。

## 加新的 tju 查询（模式）

1. `scripts/tju_cli.py` 加子命令（调用 `client.xxx()`，`_ok(...)` 输出）
2. `lib/tju/types.ts` 加类型；`lib/tju/client.ts` 加 `fetchXxx()`
3. 需持久化 → 经 `lib/cache` 落文件；页面 SSR 读缓存 + 客户端刷新按钮

## 未来：校园卡 / 电费

tju 不覆盖,属独立系统。占位在 `lib/connectors/tju/{card,electricity}.ts`。沿用「抓取 + 文件缓存」模式另接。
