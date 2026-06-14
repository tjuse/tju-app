# 数据接入 — tju.app

## 课表 / 成绩 / 考试 —— 用 `tju` 库（已接入）

复用社区成熟库 **[`tju`](https://github.com/tjuse/tju-python)**（PyPI: `tju`，GPL-3.0），它封装了：
- TJU SSO 单点登录（`sso.tju.edu.cn`）+ EAMS 教务（`classes.tju.edu.cn`）
- CAS 认证、验证码、HTML 解析

**不重复造轮子**：我们只写瘦桥接 `scripts/tju_cli.py`，由 Next.js spawn 调用。

### tju 提供的能力（`Client`）

| 方法 | 说明 | 已接入 CLI |
|---|---|---|
| `client.schedule(semester)` | 个人课表 | ✅ `schedule` |
| `client.profile` | 学生档案 | ✅ `profile` |
| `client.exam(semester)` | 考试安排 | ✅ `exam` |
| `client.score()` | 成绩 | ✅ `score` |
| `client.query_courses(stu_type, semester, page_no, page_size)` | 公开课程库（本研全量分页） | ✅ `courses` |
| `client.free_classrooms(...)` | 空教室 | ⏳ 可加 |

### 数据结构（schedule）

`client.schedule()` 返回 `Course[]`，每门课：`class_id / course_id / name / credit / campus / weeks(原始串如 "1-16") / teacher[] / arrange[]`。
`arrange` 每段：`weekday(1-7) / unit[](节次) / week[](周次) / location / teacher[]`。

映射见 `src/features/schedule/mapping.ts`：一门课按 arrange 展开为多条扁平 `Course`。

### 加一个新查询（步骤）

1. `scripts/tju_cli.py`：在 `choices` 加子命令，调用对应 `client.xxx()`，`_ok(...)` 输出。
2. `src/lib/tju/types.ts`：加返回类型。
3. `src/lib/tju/client.ts`：加 `fetchXxx()`。
4. 需要持久化就经 `lib/cache` 落文件。

### 公共课表（已实现）

- 子命令：`courses --semester 25262 [--stu-type ug|gs|both]`，爬取本科(project 1)+研究生(project 22)全量分页，每条标 `student_type`。
- 一学期约 5000+ 门、~3.7MB → **按学期缓存**（`data/cache/courses-<sem>.json`），**服务端过滤分页**（`src/features/courses/filter.ts`），不下发整包给客户端。
- 页面 `/courses`：学期选择 + 关键词（课名/课号/教师）+ 本研/校区/类别筛选 + 分页，`CoursesBrowser`。
- 学期代码见 `src/features/courses/semesters.ts`（格式同 tju `consts.SEMESTER`，如 `25262`=2025-2026春）。

### 运行前提（凭据）

两种方式：
- **A**：`.env.local` 配 `TJU_USER` / `TJU_PASS` + `pnpm py:setup`（本项目 `.venv` 装 tju）。
- **B（本机当前用）**：复用已有环境，**不复制凭据**：
  - `TJU_ENV_FILE=/data/workspace/tju-python/.env`（只读其中凭据）
  - `TJU_PYTHON=/data/workspace/tju-python/.venv/bin/python`（已装 tju）
- 共同要求：**校园网或 VPN**。
- 命令行调试：`.venv/bin/python scripts/tju_cli.py courses --semester 25262`。

## 校园卡 / 电费 —— 未来另接

**tju 不覆盖**校园卡与电费（独立于 EAMS 的系统）。占位在 `src/lib/connectors/tju/{card,electricity}.ts`，调用即抛「尚未实现」。后续可参考北洋维基（`wiki.tjubot.cn`）单独实现，沿用同样的「spawn/抓取 + 文件缓存」模式。

## 安全

- 凭据只在 `.env.local`，经 env 透传子进程；不打印、不写缓存。
- 只抓本人授权数据；低频、带缓存、尊重学校系统。
