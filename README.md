# 🌾 智護田 · FieldGuard AI

> **智慧农田植保机器人 Web 数字孪生可视化大屏**  
> 多模态感知 + AI 驱动 + 5G 树莓派联网 + 3D 实时监控  
> 中学生科创竞赛作品 · 答辩展示友好

[![Deploy](https://github.com/noah200910070082-dotcom/fieldguard-ai/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/noah200910070082-dotcom/fieldguard-ai/actions/workflows/deploy-pages.yml)

---

## 🎯 项目简介

FieldGuard AI 是一套面向**智慧农业**的 Web 数字孪生监控平台。系统通过 5G 网络接收树莓派农田传感器数据，在三维可视化场景中实时展示作物健康度、病虫害风险、植保机器人巡检状态，并基于阈值规则自动生成 AI 处置建议。

打开即用，无需后端——内置 WebSocket 模拟器可独立演示完整数据链路。适合**中学生科创竞赛 / 论文答辩 / 项目展示**。

### 核心功能

| 功能 | 说明 |
|------|------|
| 🌐 **3D 数字孪生** | 纯 Three.js 构建：9 格农田 + 玉米/小麦作物 + 树木 + 池塘 + 房屋 + 稻草人 + 拖拉机 |
| 🤖 **植保机器人** | 麦轮底盘 + 双云台摄像头 + 2 关节机械臂 + 超声波传感器 + 巡逻路径动画 |
| 📡 **5G 传感器模拟** | WebSocket 模拟器每 2 秒推送 31 条读数（温湿度 / 土壤 pH / 病害风险 / 机器人电量） |
| 📊 **ECharts 实时看板** | 温湿度趋势折线图 / 土壤 pH 横向柱状图 / 病害风险仪表盘 / 设备在线状态列表 |
| ⚡ **阈值联动告警** | 正常=绿色 / 预警=黄色脉冲 / 危险=红色闪烁 + 底部告警滚动条自动推送 |
| 🌍 **三语切换** | 繁体中文 / 简体中文 / English，右上角一键切换，localStorage 持久化 |
| 📱 **响应式布局** | 桌面 / 平板 / 手机三端适配，Topbar + ZoneRail 自动折叠 |

---

## 🖥️ 在线体验

| 入口 | 地址 |
|------|------|
| **主控制台** | [fieldguard-ai 控制台](https://noah200910070082-dotcom.github.io/fieldguard-ai/) |
| **3D 场景（独立全屏）** | [farm-twin.html](https://noah200910070082-dotcom.github.io/fieldguard-ai/farm-twin.html) |

---

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                   React 18 + TypeScript 5.7              │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────────┐   │
│  │  Topbar  │  │ ZoneRail │  │   FeatureDrawer     │   │
│  │ (暗色顶栏)│  │ (地块切换)│  │   (功能说明抽屉)     │   │
│  └──────────┘  └──────────┘  └─────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │           🌑 3D 数字孪生场景 (iframe)              │   │
│  │      farm-twin.html — Three.js 原生构建            │   │
│  │  · 天空球 + 地形 + 田埂 + 水渠 + 远山              │   │
│  │  · 9 格农田 + 630 株作物 + 300 丛草 + 80 朵野花     │   │
│  │  · 24 棵树 + 栅栏 + 池塘 + 蝴蝶粒子                │   │
│  │  · 麦轮机器人巡逻 + 云台扫描 + 机械臂微动           │   │
│  │  · 4 个暗色玻璃数据卡 (温度/湿度/风险/机器人)       │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌────────┐ ┌──────────┐ ┌───────────────────────┐    │
│  │ 5 指标卡│ │ 6 地块状态│ │ 任务队列 + 资源安全    │    │
│  └────────┘ └──────────┘ └───────────────────────┘    │
│  ┌──────────────────────────────────────────────────┐   │
│  │             AlertBar 告警滚动条 (红色/绿色)        │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│    Zustand Store        i18next        WebSocket Sim   │
│   (app + sensor)       (3 语言)      (31 条 / 2 秒)    │
└─────────────────────────────────────────────────────────┘
```

### 技术栈明细

| 层 | 选型 | 版本 |
|----|------|------|
| 框架 | React + TypeScript | 18.3 / 5.7 |
| 构建 | Vite | 6.x |
| 样式 | Tailwind CSS v4 | 4.x |
| 3D 渲染 | Three.js (独立 HTML) | 0.160 (CDN) |
| 图表 | ECharts | 6.x |
| 状态管理 | Zustand | 5.x |
| 国际化 | i18next + react-i18next | 24.x / 15.x |
| 图标 | Lucide React | 0.468 |
| 测试 | Vitest + Testing Library | 2.x |
| Lint | ESLint 9 + Prettier | - |

---

## 📁 项目结构

```
src/
├── components/
│   ├── layout/              # Topbar, ZoneRail, Toast, FeatureDrawer
│   │                         AlertBar, CompetitionHeader, EChartsOverlay
│   └── shared/              # Factor 因子条
├── features/
│   ├── digital-twin/        # FarmScene3D (iframe 嵌入) + OverviewPanel
│   │                         + DecisionConsole (AI 研判)
│   ├── alerts/              # 预警中心 — 确认/处置/追踪
│   ├── robot/               # 机器人遥控 — 遥测 + 方向键 + 急停
│   ├── sensors/             # 传感网络 — 4 节点 + 数据流 + 维护
│   └── integration/         # 设备接入 — MQTT/REST/Token + 拓扑图
├── i18n/
│   └── locales/             # zh-TW.json / zh-CN.json / en.json (170+ key)
├── lib/                     # mock-data.ts (地块/任务/传感器 模拟数据)
├── services/                # websocket-sim.ts (5G 模拟器 + 阈值判定)
├── stores/                  # app-store.ts (UI 状态) + sensor-store.ts (实时数据)
├── types/                   # TypeScript 类型定义
├── App.tsx                  # 根组件 + PanelRouter
├── main.tsx                 # 入口 + wsSimulator 启动
└── index.css                # Tailwind + @theme token + @keyframes
public/
└── farm-twin.html           # 独立 3D 数字孪生 (1200+ 行纯 Three.js)
```

---

## 🚀 本地运行

```bash
git clone https://github.com/noah200910070082-dotcom/fieldguard-ai.git
cd fieldguard-ai
npm install
npm run dev          # → http://localhost:5173
```

```bash
npm run build        # 生产构建 → dist/
npm run preview      # 预览构建产物
npm run type-check   # TypeScript 类型检查
npm run lint         # ESLint
npm run test         # Vitest
```

---

## 📡 WebSocket 模拟数据

### 数据格式

```ts
interface SensorReading {
  deviceId: string     // "TEMP-A-01", "SOIL-B-01", "PH-C-02" ...
  zoneId: string       // "A-01" ~ "C-02"
  type: SensorType     // soil_moisture | temperature | humidity | ph | disease | battery
  value: number        // 传感器读数
  unit: string         // "%" | "°C" | "pH"
  timestamp: number    // Date.now()
}
```

每轮广播 **31 条**（6 个地块 × 5 种传感器 + 机器人电量），间隔 2~3 秒。

### 阈值判定规则

| 传感器 | 🟢 正常 | 🟡 预警 | 🔴 危险 |
|--------|---------|---------|---------|
| 土壤湿度 | 40–75% | 30–40% 或 75–85% | <30% 或 >85% |
| 温度 | 20–30°C | 15–20°C 或 30–35°C | <15°C 或 >35°C |
| 空气湿度 | 45–75% | 35–45% 或 75–85% | <35% 或 >85% |
| 土壤 pH | 6.0–7.0 | 5.5–6.0 或 7.0–7.5 | <5.5 或 >7.5 |
| 病害风险 | <0.3 | 0.3–0.6 | >0.6 |
| 电池电量 | >40% | 20–40% | <20% |

---

## 🏆 竞赛适配指南

- **页面标题**：修改 `CompetitionHeader` 组件的 `schoolName` / `competitionName` / `teamName` props
- **答辩展示**：打开 `farm-twin.html` 全屏投屏，3D 场景自带暗角电影质感
- **代码可读**：全部文件中英双语注释，初中/高中生友好
- **GitHub Pages**：Push 即自动部署，`.github/workflows/deploy-pages.yml` 已配置

---

## 🔗 硬件对接参考

- 机械臂：[TheRobotStudio/SO-ARM100](https://github.com/TheRobotStudio/SO-ARM100) → 推荐 SO-101
- 机器人学习：[huggingface/lerobot](https://github.com/huggingface/lerobot)
- 完整规划：[docs/website-plan.md](docs/website-plan.md)

---

## 📄 License

MIT — ⭐ Star + 🍴 Fork 欢迎

---

> 🤖 FieldGuard 团队 · Claude AI 辅助开发 · 2026
