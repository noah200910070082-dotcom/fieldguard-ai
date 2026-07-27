# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

FieldGuard AI（智護田）—— 多模态感知与 AI 驱动的农作物病虫害智能防治系统 Web 可视化大屏。澳门濠江中学中学生科创竞赛作品。React 18 + TypeScript + Vite + Tailwind CSS 4 单页应用，部署于 GitHub Pages。

## 常用命令

```bash
npm run dev          # 开发服务器 (--host 0.0.0.0，局域网可访问)
npm run build        # tsc 类型检查 + vite 构建，输出到 dist/
npm run preview      # 预览构建产物
npm run lint         # ESLint 检查
npm run format       # Prettier 格式化 (write 模式)
npm run test         # Vitest 单元测试
npm run type-check   # 仅 TypeScript 类型检查 (不构建)
```

## 路径别名

`@/` 映射到 `src/`，在 import 和 Vite 配置中均已设置。

```ts
import { useAppStore } from '@/stores/app-store'
```

## 架构

### 应用入口

- [src/main.tsx](src/main.tsx) — 挂载 React，启动 i18n，启动 WebSocket 模拟器，渲染 `<App />`
- [src/App.tsx](src/App.tsx) — 全局布局：`Topbar` + `ZoneRail`（左侧导航栏）+ `PanelRouter` + `FeatureDrawer` + `Toast` + `AlertBar`

### 面板路由 (Panel Router)

不使用 React Router 做页面切换。通过 Zustand `activePanel` 状态切换 5 个功能面板（相当于 5 个"页面"），每个面板位于 `src/features/<name>/`：

| Panel Key | 组件 | 功能 |
|---|---|---|
| `overview` | `features/digital-twin/OverviewPanel` | 3D 数字孪生 + AI 研判 |
| `alerts` | `features/alerts/AlertsPanel` | 预警中心 |
| `robot` | `features/robot/RobotPanel` | 机器人/巡逻车控制 |
| `sensors` | `features/sensors/SensorsPanel` | 传感器网络状态 |
| `integration` | `features/integration/IntegrationPanel` | 设备接入/集成 |

### 状态管理 (Zustand)

两个全局 Store：

1. **`stores/app-store`** (`useAppStore`) — 导航 (`activePanel`)、地块选择 (`selectedZoneId`)、风险评分、巡逻状态、Toast 通知、帮助抽屉、移动端菜单
2. **`stores/sensor-store`** (`useSensorStore`) — 实时传感器遥测数据。接收 WebSocket 模拟器推送，维护 `devices`（设备状态字典）、`chartHistory`（每地块最近 60 个图表数据点）、`alerts`（活跃告警队列）

### 数据流：传感器 → Store → UI

```
wsSimulator (services/websocket-sim.ts)
  每 2-3 秒广播 31 条 SensorReading
    ↓
useSensorStore.updateReading()
  更新 devices / latestByZone
  状态 → danger 时自动 push SensorAlert
  每 5 条消息产一个 ChartPoint 写入 chartHistory
    ↓
各 Panel 通过 useSensorStore 订阅渲染
```

`wsSimulator` 是全局单例，在 `main.tsx` 中调用 `wsSimulator.start()` 启动。真实部署时替换为 WebSocket / MQTT 连接即可。

### 类型定义

所有共享类型集中在 [src/types/index.ts](src/types/index.ts)：`Zone`, `SensorReading`, `DeviceState`, `ChartPoint`, `SensorAlert`, `PanelKey` 等。添加新功能时优先在此文件定义类型。

### 国际化 (i18n)

使用 `i18next` + `react-i18next`。语言包在 `src/i18n/locales/`，支持 `zh-TW`（默认）、`zh-CN`、`en` 三种语言。用户选择持久化到 `localStorage` key `fieldguard-lang`。

组件中使用 `useTranslation()` hook：
```tsx
const { t } = useTranslation()
<span>{t('brand')}</span>  // → 智護田 / 智护田 / FieldGuard
```

### 3D 场景

`features/digital-twin/FarmScene3D.tsx` 使用 `@react-three/fiber` + `@react-three/drei` + `three.js` 渲染农场数字孪生。`OverviewPanel` 负责组合 3D 场景与 AI 研判面板。

### 图表

项目同时使用 **ECharts**（`echarts-for-react`）和 **Recharts**（`recharts`），引入新图表时优先复用已有库。

## 代码风格

- **Prettier**: 单引号、无分号、尾逗号、100 字符宽度、2 空格缩进
- **ESLint**: TypeScript ESLint + React Hooks 规则，未使用变量报错（`_` 前缀参数除外）
- **Tailwind CSS 4**: 使用 Vite 插件 `@tailwindcss/vite`，无 `tailwind.config` 文件
- 颜色使用项目中已有的 Tailwind token（如 `bg-[#edf0e8]` `text-ink`），UI 设计规范见 [docs/website-plan.md](docs/website-plan.md)

## 部署

GitHub Actions 自动部署到 GitHub Pages（[deploy-pages.yml](.github/workflows/deploy-pages.yml)）。`vite.config.ts` 中 `base` 根据 `GITHUB_ACTIONS` 环境变量切换：CI 中为 `/fieldguard-ai/`，本地为 `/`。Node 版本 22。

## 数据

静态 mock 数据（地块、任务、传感器）在 [src/lib/mock-data.ts](src/lib/mock-data.ts)。动态模拟数据由 `wsSimulator` 运行时生成。
