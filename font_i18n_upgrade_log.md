# fieldguard-ai 字体增大 + 多语言切换 + 主题字体 改动记录

## 日期
2026-01-14 (构建完成)

## 目标
1. 保持现有 UI 风格，全局增大字体
2. 搜索并选用贴合农业科技主题的美观字体
3. 右上角增加 EN / 简 / 繁 三语切换

## 字体体系
选用 5 款 Google Fonts，按 CSS 变量分层：

| 变量 | 字体 | 用途 |
|------|------|------|
| `--font-display` | **Playfair Display** + Noto Serif TC | Hero 大标题、最终 CTA |
| `--font-heading` | **Noto Serif TC** (思源宋体) | 所有中文标题、面板标题 |
| `--font-body` | **Noto Sans TC** (思源黑体) + Inter | 正文、段落 |
| `--font-ui` | **Inter** + Noto Sans TC | 按钮、导航、小标签 |
| `--font-mono` | **DM Mono** | 数字、代码、指标数据 |

### 字体设计理念
- **Playfair Display**: 优雅现代衬线体，给 Hero 带来"自然+科技"的融合感
- **Noto Serif TC**: 思源宋体繁体/简体自适应，为农业仪表盘赋予稳重专业的质感
- **Noto Sans TC**: 思源黑体，正文清晰易读，适配三语（繁/简/EN）
- **Inter**: 经典 UI 字体，按钮和交互元素的光滑无衬线
- **DM Mono**: 等宽字体，数据指标和代码块

## 字号调整策略
- `html { font-size: 18px }` — 基准从默认 16px 提升至 18px (+12.5%)
- Hero h1: 84px (原约 64px)
- 面板标题: 27-29px
- Section 标题: 60px (原约 48px)
- 正文: 13-16px 区间
- 数字指标: DM Mono 保持紧凑但增大到 19-30px 区间
- 所有 CSS 的 font-size 硬编码值均比原先增大 15-30%

## 国际化架构
### 文件结构
- `src/i18n.jsx` — 翻译字典 + I18nProvider Context + useI18n Hook
- 支持 zh-TW（繁体，默认）、zh-CN（简体）、en（英文）
- 语言选择持久化到 localStorage (`fieldguard-lang`)

### 翻译覆盖范围 (~150+ keys)
- 品牌名称（智護田/智护田/FieldGuard AI）
- 导航栏 5 项
- Hero / Dashboard 标题和描述
- 风险等级标签 (低風險/需關注/預警/高風險)
- AI 决策解释文字（3 种风险级别各有独立解释）
- 按钮文字（AI日报、暂停巡逻、继续巡逻等）
- 所有面板（预警中心、机器人控制、传感节点、装置接入）
- 方向键（前进/后退/左转/右转/停止）
- 功能说明抽屉
- 安全原则提示

## 语言切换器 UI
- 位于右上角 header-actions 区域
- 三个按钮: EN | 简 | 繁
- 当前语言高亮（ink 背景 + lime 色文字）
- 切换即时生效，所有组件由 useI18n() Hook 驱动

## 改动文件清单
| 文件 | 改动 |
|------|------|
| `index.html` | 新增 Google Fonts link preconnect + <link> |
| `src/i18n.jsx` | **新增** 国际化模块 |
| `src/styles.css` | 全局字号上调 + CSS 变量字体家族 + .lang-switcher 样式 |
| `src/control-center.css` | 字号上调 + 字体变量引用 + .lang-switcher-top 样式 |
| `src/App.jsx` | I18nProvider 包裹 + 语言切换按钮 + 全部硬编码文字 → t() 调用 |
| `src/DashboardPanels.jsx` | 接收 t prop + 文字国际化 |

## 构建状态
✅ `npm run build` 成功 (370ms)
- dist/assets/index.css: 68 KB (gzip 15 KB)
- dist/assets/index.js: 248 KB (gzip 79 KB)
- dist/assets/FarmScene3D.js: 560 KB (gzip 141 KB)

Dev server 运行在 http://localhost:5173/
