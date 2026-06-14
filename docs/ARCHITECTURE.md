# 架构说明 — tju.app

## 总览

单仓库 Next.js（App Router）应用 + 一个瘦 Python 桥接脚本。**无数据库、无 Docker、自托管**，刻意保持最轻。

```
浏览器 (响应式 Web + PWA)
   │
   ▼
Next.js (前端 + Route Handlers 后端)
   │
   ├── features/* 业务逻辑（calendar / links 静态/内置数据）
   ├── lib/ai     课表截图 → Claude 视觉解析
   ├── lib/cache  文件 JSON 缓存（data/cache/*.json）
   └── lib/tju    课表数据源
          │  child_process.spawn
          ▼
       scripts/tju_cli.py  ──→  tju 库  ──→  SSO + EAMS（需校园网/VPN）
```

## 为什么这样设计

用户要求：**复用 `tju` 库（不造轮子）、不要重数据库、不要 Docker、最简单**。由此：

- **课表/成绩/考试**等需登录的数据：全部交给成熟的 `tju` Python 库（封装了 CAS 登录、验证码、HTML 解析）。我们只写一个**瘦桥接** `scripts/tju_cli.py`。
- **集成方式**：Next.js Route Handler 用 `child_process.spawn` 按需调用 Python 脚本，读其 stdout 的 JSON。无常驻 Python 服务、无 Docker。
- **存储**：文件 JSON 缓存替代数据库。课表一学期基本不变，「实时抓一次 + 缓存 + 手动刷新」足够，且零运维。
- **部署**：tju 需校园网/VPN → **不能用 Vercel**（云服务器无校园网），须自托管在能连校园网的机器（个人电脑 / 校内服务器 / 带校园 VPN 的 NAS）。

## 关键模块

| 模块 | 职责 |
|---|---|
| `scripts/tju_cli.py` | 读 `TJU_USER/TJU_PASS` 登录，按子命令查询，输出统一 JSON（`{ok,data}`/`{ok:false,error,code}`） |
| `src/lib/tju/client.ts` | `spawn` python，超时控制，解析 JSON，失败抛 `TjuError`（带 code） |
| `src/lib/tju/types.ts` | tju dump 输出的 TS 镜像类型 + `TjuError` |
| `src/lib/tju/schedule-store.ts` | `readCachedSchedule()`（仅读缓存）/ `refreshSchedule()`（抓取+映射+写缓存），`server-only` |
| `src/lib/cache/file-cache.ts` | `readCache/writeCache/readCacheWithMeta`，可选 TTL，防目录穿越 |
| `src/features/schedule/mapping.ts` | tju Course（多段 arrange）→ 扁平 `Course[]`；含 `parseWeeksString` |

## 课表数据流

1. **SSR**：`schedule/page.tsx`（`dynamic`）调用 `readCachedSchedule()` —— 只读文件缓存，**不联网**，秒开。
2. 有缓存 → `ScheduleView`（周次切换 + 刷新）；无缓存 → `ScheduleEmpty`（引导抓取）。
3. 用户点「从教务刷新」→ `useRefreshSchedule` → `GET /api/schedule?refresh=1`。
4. 路由调 `refreshSchedule()` → `client.ts` spawn `tju_cli.py schedule` → `mapTjuSchedule` → `writeCache`。
5. 成功 → `router.refresh()` 重新 SSR，展示新数据 + 「更新于 …」。
6. 失败 → `TjuError.code` 映射 HTTP（login→401 / usage→503 / 其他→502），前端显示中文错误。

首页今日课程同样读缓存 + `getTodayCourses(courses, currentWeek)`。

## 凭据与安全

- `TJU_USER/TJU_PASS` 仅存 `.env.local`（gitignore），由 Next.js 进程经 env 透传给 Python 子进程。
- 缓存文件只存课表数据，**不含凭据**。
- 自托管单用户场景，无多用户凭据管理负担。开放多用户前需另设鉴权与隔离。

## PWA

Serwist（`app/sw.ts`）预缓存 + 运行时缓存；`manifest.ts` 可安装元信息。开发禁用 SW。

## 已知约束

- **构建用 webpack**（`--webpack`）：Serwist 暂不支持 Turbopack。
- **Python 环境**：需 `pnpm py:setup` 建 `.venv`；`TJU_PYTHON` 可指向其它解释器。
- **GPL-3.0**：tju 为 GPL-3.0。本项目通过独立进程（spawn）调用，属聚合；`scripts/tju_cli.py` 直接 import tju，如对外分发需遵守 GPL。
