# 路线图 — tju.app

> 架构已调整为：**复用 `tju` 库抓课表 + 文件缓存 + 自托管**，无数据库/无 Docker。

## 已完成 ✅

- [x] Next.js 16 + TS + Tailwind v4 + pnpm 脚手架
- [x] Biome / Vitest / Playwright / GitHub Actions CI
- [x] 设计系统 token + 深色主题 + 浅色切换
- [x] Dashboard 布局壳（侧边栏 / 移动端 Tab / Header / 主题切换）+ FadeIn 动效
- [x] UI 基础组件（Button/Card/Badge/Skeleton）
- [x] PWA（manifest + Serwist + 图标）
- [x] 常用链接页（内置 TJU 站点，按分类）
- [x] 校历页（学期 / 当前周 / 事件时间线）+ `/api/calendar`
- [x] **课表链路打通**：`tju` 库 → `scripts/tju_cli.py` → spawn → 映射 → 文件缓存 → 周视图 + 刷新
- [x] 首页今日课程接真实缓存数据
- [x] 课表截图 AI 解析后端（`/api/import/ocr` + Claude 视觉）
- [x] 移除 Postgres/Prisma/Auth/Docker，改文件缓存
- [x] **公共课表（全校课程库）**：`courses` 子命令爬本研全量 → 按学期缓存 → 服务端过滤分页 → `/courses` 页面（学期/搜索/本研/校区/类别/分页）
- [x] 凭据复用：`TJU_ENV_FILE` 只读外部 .env（不复制凭据进仓库）
- [x] **课程详情 + 大纲**：点卡片开 Dialog，全字段 + 懒加载大纲 markdown（`query_syllabus`，按 lession_id 缓存）
- [x] **收藏**：localStorage（zustand persist）存课程快照，星标 + `/courses/favorites` 跨学期收藏视图
- [x] **更细筛选 + 排序**：上课星期 / 仅看有大纲 / 学分·课程名排序
- [x] **课程统计**：`/courses/stats` 本研构成 / 类别 / 校区 / 学分 / 星期 / Top 教师（Recharts）+ 浏览·收藏·统计 子导航
- [x] 历史学期：学期下拉（2021–2027），各学期独立缓存

> 注：`query_course_info`（开课院系）当前 tju 解析失效（HtmlParseError），暂以大纲 + LibCourse 字段替代。

## 进行中 🚧

- [ ] 课表截图导入**前端**：上传 → OCR → 预览/编辑确认 → 写入缓存（合并 tju 数据）
- [ ] 课表手动录入 / 编辑（覆盖个别课）
- [ ] ICS 导入（node-ical）/ 导出（ics 包）
- [ ] 成绩页（tju `score` 已就绪，加 CLI 子命令 + 页面）
- [ ] 考试页（tju `exam` 已就绪）
- [ ] 常用链接自定义增删 + 拖拽排序（localStorage 持久化）
- [ ] 天气卡片（公开 API）
- [ ] 空/错/载状态全覆盖 + 响应式打磨 + Lighthouse PWA 验收

## 未来

- [ ] 校园卡、电费（**tju 不覆盖**，独立系统，另接；见 `lib/connectors/tju` 占位）
- [ ] 空教室查询（tju `free_classrooms`）
- [ ] 通知/提醒（上课提醒）、设置中心、更多 Widget
- [ ] 若开放多用户：鉴权、数据隔离、隐私声明、限流
