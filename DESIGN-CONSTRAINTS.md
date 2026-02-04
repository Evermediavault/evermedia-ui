# Evermedia Vault 后台管理面板 - 设计约束

本文档约束 **ui**（Quasar 后台管理面板）的视觉与交互设计，与 **frontend-main** 主站风格保持一致，便于维护与扩展。

---

## 1. 设计原则

- **一致性**：与 frontend-main 主站共享主色、深色背景、玻璃态与高亮效果。
- **单一数据源**：所有主题变量定义在 `src/css/_theme-tokens.scss`，Quasar 与 Tailwind 均由此派生。
- **对比度**：正文与次要文字在深色背景上需保证可读性（`$foreground-muted`、`$foreground-subtle` 满足约 7:1 以上对比）；边框、玻璃描边、焦点环需清晰可辨。
- **安全与可维护**：不散落魔数，新增主题项只改 token 与本文档。

---

## 2. 主题变量（Token）

### 2.1 颜色

| 用途 | Token / CSS 变量 | 值 | 说明 |
|------|------------------|-----|------|
| 主色 | `$primary` / `--ev-color-primary` | `#0a4dd3` | 与主站主按钮渐变起点一致 |
| 主色亮 | `$primary-light` | `#06bad9` | 主按钮渐变终点 |
| 辅助/强调 | `$accent` | `#8b5cf6` | 与主站紫/点缀一致 |
| 背景 | `$background` | `#000000` | 页面底 |
| 背景抬升 | `$background-elevated` | `#0b0711` | 侧栏、抽屉等 |
| 表面 | `$surface` | `#121212` | 卡片、区块 |
| 表面 hover | `$surface-hover` | `rgba(255,255,255,0.08)` | 行/卡片 hover |
| 主文字 | `$foreground` | `#ffffff` | 正文 |
| 次要文字 | `$foreground-muted` | `#e2e8f0` | 说明、副标题（对比度增强） |
| 弱化文字 | `$foreground-subtle` | `#94a3b8` | 占位、禁用（对比度增强） |
| 边框 | `$border` | `rgba(255,255,255,0.12)` | 默认边框 |
| 边框强调 | `$border-strong` | `rgba(255,255,255,0.2)` | 表头、分隔线等 |
| 玻璃背景 | `$glass-bg` | `rgba(255,255,255,0.06)` | 玻璃态 |
| 玻璃边框 | `$glass-border` / `$glass-border-subtle` | 0.12 / 0.08 | 玻璃态边框；subtle 用于默认态 |
| 主色浅底（弱） | `$primary-tint-bg-subtle` | `rgba(6,186,217,0.06)` | 表头等弱渐变 |
| 节点装饰 | `$node-dot` | `rgba(255,255,255,0.04)` | 去中心化节点背景点阵 |
| 成功/正 | `$positive` | `#21ba45` | 成功状态 |
| 错误/负 | `$negative` | `#c10015` | 错误、危险 |
| 错误浅底 | `$negative-tint` | `rgba(193,0,21,0.12)` | 错误提示背景 |
| 信息 | `$info` | `#31ccec` | 提示 |
| 警告 | `$warning` | `#f2c037` | 警告 |
| 滚动条拇指 | `$scrollbar-thumb` / `$scrollbar-thumb-hover` | accent 系半透明 | `.ev-scrollbar` 拇指色 |
| 遮罩/描边 | `$mask-light` | `#ffffff` | mask / -webkit-mask 描边 |
| 弱化遮罩 | `$overlay-muted` | `rgba(255,255,255,0.4)` | 进度图标等描边 |
| 错误条文字 | `$foreground` 或 `--ev-color-foreground` | 与主文字同 | 错误 banner 前景，保证对比度 |

### 2.2 字体

| 用途 | Token / CSS 变量 | 值 |
|------|------------------|-----|
| 无衬线 | `$font-sans` | `'Roboto', -apple-system, …` |
| 等宽 | `$font-mono` | `ui-monospace, 'Cascadia Code', …` |
| 字号 xs/sm/base/lg/xl/2xl | `$font-size-*` | 12px / 14px / 16px / 18px / 20px / 24px |
| 字重 | `$font-weight-normal/medium/semibold/bold` | 400 / 500 / 600 / 700 |
| 行高 | `$line-height-tight/normal/relaxed` | 1.25 / 1.5 / 1.625 |
| 标题图标 | `$title-icon-size` | 1.5rem | 页面标题左侧图标 |

### 2.3 间距

与 4px 基准一致：`$space-1`(4px) ~ `$space-12`(48px)。详见 `_theme-tokens.scss`。

### 2.4 圆角

- `$radius-sm`: 4px  
- `$radius-md`: 6px  
- `$radius-lg`: 8px  
- `$radius-xl`: 12px  

### 2.5 阴影与动效

- 阴影（层次清晰、主操作突出）：`$shadow-sm` / `$shadow-md`；`$shadow-lg`（中性底 + 弱青蓝）；`$shadow-glow`（40px、0.15）；`$shadow-primary` / `$shadow-primary-hover`（主按钮）；`$shadow-uppy-item`（Uppy 项）。
- 渐变：`$card-border-gradient`（玻璃卡 hover 描边）；`$card-border-gradient-subtle`（玻璃卡默认描边）；`$gradient-primary-subtle`（标题等弱对比装饰）。
- 动效：`$transition-fast`(150ms)、`$transition-base`(300ms)，缓动 `cubic-bezier(0.4, 0, 0.2, 1)`；`$button-lift`(2px) 主按钮/卡片 hover 上浮位移。
- 玻璃模糊：`$glass-blur`(20px)、`$glass-blur-sm`(12px)，禁止在页面/组件中写死 blur 数值。

### 2.6 布局与组件尺寸

- `$header-height`：顶栏高度（3.5rem）。
- `$drawer-width`：侧栏宽度（15rem，约 240px）。
- `$nav-item-height` / `$nav-icon-size` / `$nav-icon-inner` / `$avatar-size`：导航项高度（2.75rem）、导航图标容器（2.25rem）、导航图标内尺寸（1.25rem）、用户头像（2rem）。
- `$nav-indicator-width` / `$nav-indicator-height`：侧栏激活指示条宽（3px）、高（1.25rem）。
- `$button-height`：主按钮高度（2.75rem）。
- `$scrollbar-size`：滚动条宽高（8px）。
- `$content-max-width-sm`：小内容区最大宽度（28rem），错误页/小卡片用。
- `$dashboard-height` / `$dashboard-max-height`：上传 Dashboard 高度（30rem）、最大高度基准（40rem）。
- `$spinner-size-lg`：大号加载 spinner（2.5rem）。
- `$login-card-max-width`、`$glow-size-lg/md/sm`、`$blur-glow`、`$glow-3-bottom`/`$glow-3-right`、`$title-display-size`：登录卡与光晕等。
- `$glow-opacity` / `$glow-opacity-subtle`：背景光晕不透明度（0.2 / 0.1），高级感下更克制。

---

## 3. 文件职责

| 文件 | 职责 |
|------|------|
| `src/css/_theme-tokens.scss` | **唯一**主题数据源（SCSS 变量），新增/修改 token 只改此文件。 |
| `src/css/app.scss` | 引入 Tailwind、将 token 写入 `:root` 的 `--ev-*`、Tailwind v4 `@theme`、base 与工具类。 |
| `src/css/quasar.variables.scss` | 从 `_theme-tokens` 引用并赋值给 Quasar 的 `$primary`、`$dark` 等，不在此处写魔数。 |

---

## 4. 使用约定

### 4.1 在 Vue/SCSS 中

- **优先使用 CSS 变量**：`var(--ev-color-primary)`、`var(--ev-space-4)` 等，保证与 token 同步。
- **需用 Quasar 组件时**：依赖 Quasar 主题（已由 `quasar.variables.scss` 对接 token），无需再写颜色魔数。
- **需用 Tailwind 时**：使用项目配置的 prefix（若有）及 `@theme` 中定义的 token 对应工具类（如 `tw-bg-primary`、`tw-text-foreground-muted`）。

### 4.2 工具类

- **滚动条**：`.ev-scrollbar`（与 frontend-main 风格一致，尺寸用 `$scrollbar-size`）。
- **玻璃卡片**：`.ev-glass-card`（背景、边框、hover 阴影；模糊用 `$glass-blur`）。
- **主按钮**：`.ev-btn-primary`（主色渐变、高度与阴影由 token 控制）。
- **列表页**：`.ev-list-card`（列表根卡片）、`.ev-table-theme`（表格统一样式）、`.ev-table-pagination`（分页）、`.ev-banner-error`（错误条）、`.ev-table-empty-state`（无数据插槽样式），禁止在列表页中重复写卡片/表/分页魔数。

### 4.3 焦点与动效偏好

- **焦点**：可聚焦控件 `:focus-visible` 时使用 `var(--ev-focus-ring)` 或与设计一致的 2px 外描边。
- **prefers-reduced-motion**：在 `@media (prefers-reduced-motion: reduce)` 下对 `transform`/`transition` 做降级（如时长为 0、去掉 translateY），保留焦点环与颜色变化。

### 4.4 禁止

- 不在组件或页面中写与 token 冲突的颜色/间距/字号魔数；玻璃模糊、滚动条尺寸、内容区最大宽度、Dashboard/Spinner 等尺寸一律使用 token。
- 不在 `quasar.variables.scss` 中写新的魔数，只从 `_theme-tokens` 引用。

---

## 5. 与 frontend-main 的对应关系

| 主站 | 后台面板 |
|------|----------|
| 主按钮渐变 `#0A4DD3` → `#06BAD9` | `$primary` / `$primary-light`，主操作按钮 |
| 背景黑 + 侧栏 `#0B0711` | `$background` / `$background-elevated` |
| 紫/紫罗兰点缀 `#8b5cf6`、`#667eea` | `$accent`，强调、滚动条等 |
| 玻璃卡、发光阴影 | `$glass-*`、`$shadow-glow`、`.ev-glass-card` |
| Poppins（主站） | 后台使用 Roboto（Quasar 默认），保持无衬线与可读性 |

---

## 6. 新增/修改主题项流程

1. 在 `_theme-tokens.scss` 中新增或修改 SCSS 变量。  
2. 若需暴露给全局：在 `app.scss` 的 `:root` 中增加对应 `--ev-*`。  
3. 若需 Tailwind 工具类：在 `app.scss` 的 `@theme` 中增加对应条目。  
4. 若影响 Quasar 主题：在 `quasar.variables.scss` 中从 token 引用。  
5. **同步更新本文档**「主题变量」与「使用约定」对应小节；若为「高级感」相关（阴影、渐变、光晕透明度等），在 §2.5 / §2.6 中注明用途。

---

*最后更新：对比度增强（文字、边框、玻璃描边）；阴影与焦点环更清晰；设计原则补充「对比度」一条。*
