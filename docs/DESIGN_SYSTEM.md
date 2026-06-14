# 设计系统 — tju.app

**风格**：极简现代（Linear / Vercel 风）· 深色为主 · 大留白 · 克制微动效 · 天大北洋蓝强调色。

所有 token 定义在 `src/app/globals.css` 的 `@theme` 块，通过 `var(--*)` 使用。**禁止硬编码颜色**（课程色板等纯数据色除外）。

## 色彩

### 背景分层（深色）
| Token | 值 | 用途 |
|---|---|---|
| `--color-bg-base` | `#0a0a0b` | 最底层页面背景 |
| `--color-bg-subtle` | `#111113` | 卡片背景 |
| `--color-bg-muted` | `#18181b` | 悬停态、次层 |
| `--color-bg-overlay` | `#1f1f24` | 弹窗、下拉 |

### 文本（三档对比）
| Token | 用途 |
|---|---|
| `--color-text-high` | 主内容标题/正文 |
| `--color-text-mid` | 次要说明 |
| `--color-text-low` | 占位 / 禁用 / 时间戳 |

### 边框
`--color-border`（默认低对比）· `--color-border-strong`（hover / 强调）

### 强调色（天大北洋蓝）
| Token | 深色值 | 用途 |
|---|---|---|
| `--color-accent` | `#3b82f6` | 主操作、激活态、图标高亮 |
| `--color-accent-hover` | `#60a5fa` | hover |
| `--color-accent-muted` | `#1d3a6e` | 低饱和背景 |
| `--color-accent-subtle` | `#172554` | 极淡背景（徽章、当前列） |

> 浅色模式在 `.light` class 下重定义同名变量（accent 用更深的 `#1d4ed8` 保证对比度）。

### 状态色
`--color-success` · `--color-warning` · `--color-danger` · `--color-info`

## 间距 & 圆角

- 间距：**8px 基准**（Tailwind 默认 scale 即对应）。
- 圆角：`--radius-sm 6` · `md 10` · **`lg 16`（主卡片）** · `xl 24` · `full`。

## 排版

- 无衬线：Geist → Inter → 系统 → PingFang/思源黑（中文回退）。
- 字阶（Tailwind）：标题 `text-2xl/lg font-semibold tracking-tight`，正文 `text-sm`，说明 `text-[13px]`，caption `text-[12px]/[11px]`。
- 数字用 `tabular-nums`（时间、金额、天数对齐）。

## 组件

- 基础组件在 `src/components/ui`：`Button`（6 variant）、`Card`、`Badge`、`Skeleton`。
- 卡片统一用 `.card` + `.card-glow`（`Card` 组件已封装）。
- 工具类：`.gradient-text`（北洋蓝渐变标题）、`.skeleton`（骨架屏动画）、`.text-pretty/.text-balance`。

## 动效（Framer Motion）

- 入场：`<FadeIn delay={...}>` —— opacity + translateY(8px)，220ms ease-out。
- 列表：`staggerContainer` / `staggerItem`（间隔 0.05s）。
- 微交互：按钮 `active:scale-[0.98]`；卡片 hover 边框提亮 / 轻微 lift。
- 原则：**克制、流畅、无炫技**。尊重 `prefers-reduced-motion`（globals.css 已全局降级）。

## 状态设计（强制）

每个数据视图必须覆盖：
1. **加载**：`Skeleton` 骨架屏，形状贴近真实内容。
2. **空态**：友好文案 + 引导行动（如"去添加课程 →"）。
3. **错误态**：可读的中文提示 + 重试入口。

## 可访问性

- 对比度 ≥ WCAG AA。
- `:focus-visible` 已全局加 2px 北洋蓝描边。
- 触控目标 ≥ 44px（移动端）。
- 图标按钮必须有 `aria-label`。

## 响应式

移动端单列堆叠（底部 Tab 栏）→ `md` 起显示侧边栏 + 多列 Bento 网格。断点用 Tailwind 默认（`sm/md/lg`）。
