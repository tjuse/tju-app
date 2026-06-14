# TJU 数据接入 — connectors（Phase 2）

> ⚠️ 本文档描述 **Phase 2** 的实现计划。当前 `lib/connectors/tju/*` 为占位接口，调用即抛 `Phase 2 not implemented`。**进入 Phase 2 前不要实现真实抓取。**

## 安全红线（先于一切）

- 校内凭据**永不**明文存储 / 打印 / 写日志。
- 用 AES-GCM（`CREDENTIAL_ENC_KEY`，32 字节 hex）加密存储，或仅保留**短期会话 cookie**。
- 仅抓取**用户本人授权**数据；请求低频、带缓存、尊重学校系统，避免高频轮询。

## TJU 系统地图（调研）

| 系统 | 入口 | 说明 |
|---|---|---|
| 统一身份认证 (CAS) | `https://sso.tju.edu.cn/cas/login` | 单点登录网关 |
| 教务处 | `https://oaa.tju.edu.cn/` | 教务 |
| 选课 / 课表 | `http://classes.tju.edu.cn/` | 学号登录，课表来源 |
| 信息门户 | `https://my.tju.edu.cn/` | 一站式服务聚合 |
| 校园卡 | `https://card.tju.edu.cn/` | 余额 / 流水 |
| 社区参考 | `https://wiki.tjubot.cn/` | 北洋维基（端点与流程参考） |

## CAS 登录流程（待实现，`cas.ts`）

典型 CAS 流程：
1. GET 登录页，抓取 `execution`、`lt` 等隐藏字段 + 初始 cookie。
2. POST 学号 / 密码 / 隐藏字段 → 取得 TGT/ST，处理 302 跳转。
3. 携带认证 cookie 访问各业务系统（可能需各系统二次 ST 换取会话）。
4. 缓存会话（带过期时间），复用以减少登录频次。

> 实现前先用**隔离脚本**（不入仓库 / 用 `.env.local` 凭据）验证流程跑通，再落地为 connector。

## 各 connector

- `cas.ts` — `casLogin(creds) → CasSession`、`validateCasSession`。
- `schedule.ts` — `fetchScheduleFromTju(session, semester) → TjuCourse[]`（落库 `source=sync`，复用 Phase 1 的 `Course` 结构）。
- `card.ts` — `fetchCardBalance` / `fetchCardTransactions`（落库做 Recharts 趋势）。
- `electricity.ts` — `fetchElectricityBalance`（余额 + 低额提醒）。

## 部署考量（Vercel）

Serverless 抓取校内系统可能遇超时 / 出口 IP 限制。Connector 接口稳定，必要时把实现搬到**独立自托管 worker**（队列 / webhook 触发），UI 不变。详见 `ARCHITECTURE.md`。

## 验证

进入 Phase 2 后：先脚本验证 CAS 与各系统抓取 → 接 UI → 用真实账号核对课表 / 消费 / 电费正确性 → 确认凭据加密存储、日志无明文。
