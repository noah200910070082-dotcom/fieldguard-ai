# 🌾 智護田 · FieldGuard AI

> **多模态感知与 AI 驱动的农作物病虫害智能防治机器人系统**  
> 澳门濠江中学 · 中学生科创竞赛作品  
> Web 数字孪生可视化大屏 | 树莓派边缘 AI | ESP32 多光谱传感网 | 巡逻防治车

[![Deploy](https://github.com/noah200910070082-dotcom/fieldguard-ai/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/noah200910070082-dotcom/fieldguard-ai/actions/workflows/deploy-pages.yml)

---

## 👥 开发团队

| 成员 | GitHub | Gmail |
|------|--------|-------|
| **徐振华** | [@noah200910070082-dotcom](https://github.com/noah200910070082-dotcom) | `noah200910070082@gmail.com` |
| **林杰** | [@Linference](https://github.com/Linference) | `linference@gmail.com` |
| **李靖汐** | [@ljingxi154-code](https://github.com/ljingxi154-code) | `ljingxi154@gmail.com` |

> 学校：**澳门濠江中学** (Macau Hou Kong Middle School)  
> 指导老师：——  
> 日期：2026 年 7 月

---

## 🎯 项目简介

农作物病害、虫害与鸟兽害是全球粮食安全的三大威胁。据 FAO 统计，全球每年因植物病害造成的作物损失达总产量的 20%–40%，经济损失超过 2200 亿美元。传统防治依赖人工巡检和经验判断——发现滞后、覆盖不足、农药滥用。

FieldGuard AI 提出"**感知 → 决策 → 执行 → 反馈**"完整闭环方案：

1. **感知层**：固定式多光谱基站（主力监测）+ 自主巡逻防治车（补充检测与执行），RGB + 多光谱双模态交叉验证
2. **边缘决策层**：树莓派运行压缩 YOLO 病害检测 + 光谱分类模型 + 数学建模风险评分，离线可独立工作
3. **执行层**：三级处置——机械抓手清除虫卵（零农药）→ 声光驱兽（不伤害动物）→ 精准喷药（减少用量）
4. **云端可视化**：Web 物联网仪表盘实时展示农田健康状态、历史趋势、3D 数字孪生

核心目标：**早发现（光谱症状前 3-7 天预警）、早预警（连续风险评分 + 分级响应）、精准处置（因目标而异选择手段）、无人化闭环**。

---

## 🖥️ 在线演示

| 入口 | 地址 |
|------|------|
| 主控制台 | [fieldguard-ai](https://noah200910070082-dotcom.github.io/fieldguard-ai/) |
| 3D 数字孪生（全屏） | [farm-twin.html](https://noah200910070082-dotcom.github.io/fieldguard-ai/farm-twin.html) |

---

## 🔧 硬件架构设计

系统采用 **"上位机 + 下位机"双层协同架构**，为后续硬件接入预留完整框架：

```
┌─────────────────────────────────────────────────────────┐
│                      ☁️ 云端 (Cloud)                     │
│    FastAPI/Flask · PostgreSQL/InfluxDB · 大模型 API     │
│    Web 仪表盘 · 趋势分析 · 预警推送 · 历史存储           │
└──────────────────────┬──────────────────────────────────┘
                       │ MQTT (WiFi / 4G)
┌──────────────────────┴──────────────────────────────────┐
│              🧠 上位机 — 树莓派 (Raspberry Pi)            │
│                                                         │
│  负责：AI 推理 + 任务调度 + 数据汇总 + 与云端通信         │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  YOLO 病害检测 (TFLite INT8, <300ms)             │   │
│  │  光谱分类模型 (SVM / 随机森林 / 轻量 CNN)         │   │
│  │  风险评分模型 (多因素加权, RiskScore ∈ [0,1])     │   │
│  │  任务调度 (给小车下指令 + 调节监测频率)            │   │
│  │  MQTT Broker (与 ESP32 和云端双向通信)            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  型号：Raspberry Pi 4B / 5  · 功耗 <5W · 离线可工作     │
└──────────────────────┬──────────────────────────────────┘
                       │ MQTT / WiFi / Serial
┌──────────────────────┴──────────────────────────────────┐
│            🔌 下位机 — ESP32-S3 (端侧采集与控制)          │
│                                                         │
│  负责：传感器数据采集 + 电机/舵机驱动 + 执行器控制        │
│                                                         │
│  ┌──────────────────┐  ┌──────────────────────────┐    │
│  │  固定基站节点     │  │  巡逻防治车               │    │
│  │                  │  │                          │    │
│  │  ★ AS7265x 多光谱 │  │  RGB 摄像头 (YOLO 输入)   │    │
│  │    (18 通道,      │  │  机械抓手 (舵机驱动)      │    │
│  │    410-940nm)     │  │  声光驱兽 (超声波+爆闪)   │    │
│  │  RGB 摄像头       │  │  喷洒装置 (隔膜泵+喷头)   │    │
│  │  温湿度传感器     │  │  电机驱动 (TB6612)       │    │
│  │  雨量传感器       │  │  GPS + 超声波避障         │    │
│  │  太阳能 + 锂电池  │  │  18650 锂电池组           │    │
│  └──────────────────┘  └──────────────────────────┘    │
│                                                         │
│  通信：WiFi (内置) + 4G 模块 (田间无 WiFi 时兜底)        │
│  固件：C/C++ (Arduino / ESP-IDF)                       │
└─────────────────────────────────────────────────────────┘
```

### 传感器核心：多光谱 AS7265x

| 参数 | 规格 |
|------|------|
| 型号 | AS7265x (AMS OSRAM) |
| 通道数 | 18 通道（可见光 6ch + 近红外 6ch + 白光 6ch） |
| 波长覆盖 | 410nm – 940nm |
| 接口 | I²C (ESP32 直连) |
| 单价 | ~¥80–120（百元级，非数万元实验室高光谱仪） |
| 核心价值 | 检测叶绿素降解、细胞结构破坏引起的 NIR 反射率下降，**早于肉眼症状 3–7 天** |

> **为什么选光谱传感器而不是纯 RGB？**  
> 病害胁迫 → 叶绿素降解 → 红光反射上升 + 近红外反射下降。这些光谱变化在肉眼可见症状前 3–7 天就已出现。RGB 只能看到"已经发生的病变"，光谱能看到"即将发生的病变"——这正是本系统的核心差异化优势。

### 数据流

```
ESP32 采集光谱/RGB/环境数据 ──MQTT──> 树莓派 YOLO + 光谱ML 并行推理
                                           │
                                    风险评分 RiskScore
                                           │
                        ┌──────────────────┼──────────────────┐
                        ▼                  ▼                  ▼
                   RiskScore < 0.3    RiskScore 0.3–0.7   RiskScore > 0.7
                   绿色 · 常规监测    黄/橙 · 派车确认     红色 · 精准施药
                        │                  │                  │
                        ▼                  ▼                  ▼
                   ESP32 继续采集   小车前往补拍确认     小车前往喷药处置
                                                       ESP32 持续监测效果
                                                       评分下降 → 闭环完成
```

---

## 🧠 前端 Web 架构

```
React 18 + TypeScript 5.7
├── 3D 数字孪生 (iframe)    → public/farm-twin.html (Three.js 原生)
├── 实时数据看板            → ECharts 6 (温湿度/pH/病害/设备)
├── 状态管理                → Zustand (app-store + sensor-store)
├── 5G 数据模拟             → WebSocket Simulator (31 条/2 秒)
├── 三语切换                → i18next (繁中/简中/EN)
└── 告警系统                → AlertBar 底部滚动 + 阈值联动
```

---

## 📁 项目结构

```
src/
├── components/layout/       # Topbar, ZoneRail, Toast, FeatureDrawer,
│                              AlertBar, CompetitionHeader, EChartsOverlay
├── features/
│   ├── digital-twin/        # 3D 场景嵌入 + 指标面板
│   ├── alerts/              # 预警中心
│   ├── robot/               # 机器人遥控
│   ├── sensors/             # 传感网络
│   └── integration/         # 设备接入 (MQTT/REST/拓扑)
├── i18n/locales/            # zh-TW.json, zh-CN.json, en.json
├── services/                # websocket-sim.ts (树莓派 5G 模拟器)
├── stores/                  # Zustand stores (app + sensor)
├── types/                   # TypeScript 类型定义
└── public/farm-twin.html    # 独立 3D 数字孪生 (1200+ 行)
```

---

## 🚀 快速开始

```bash
git clone https://github.com/noah200910070082-dotcom/fieldguard-ai.git
cd fieldguard-ai
npm install
npm run dev
```

```bash
npm run build        # 生产构建
npm run type-check   # TypeScript 检查
```

---

## 🏆 创新点

1. **双模态感知融合**：RGB + 多光谱交叉验证；光谱异常 + RGB 正常 = 病害窗口期（核心优势）
2. **三级物理-化学一体化执行**：机械抓取（零农药）+ 声光驱兽（不伤害动物）+ 精准喷药，三合一统一调度
3. **云-边-端三层协同**：ESP32 采集 → 树莓派边缘推理（<300ms，离线可工作）→ 云端趋势分析
4. **连续风险评分 + 处置反馈闭环**：从"有病/没病"升级为 0–1 连续评分 + 处置后效果验证 + 自动纠错

---

## 📡 接口预留

### 树莓派 (上位机) 接入点

```
src/services/websocket-sim.ts   ← 替换为真实 MQTT 连接
src/stores/sensor-store.ts      ← 数据格式已对齐 SensorReading 接口
src/types/index.ts              ← 类型定义已预留所有传感器字段
```

### ESP32 (下位机) 固件预留

```
待开发：esp32-firmware/
├── base-station/     # 固定基站 — AS7265x 光谱采集 + 温湿度 + MQTT 上报
└── rover/            # 巡逻车 — 电机控制 + 舵机驱动 + 喷洒 + 声光 + GPS
```

### MQTT 主题 (与后端对齐)

```
fieldguard/{farmId}/sensors/{deviceId}/telemetry    # ESP32 → 树莓派
fieldguard/{farmId}/vision/{deviceId}/detections     # YOLO 检测结果
fieldguard/{farmId}/robots/{robotId}/state           # 机器人状态
fieldguard/{farmId}/robots/{robotId}/command         # 控制指令
fieldguard/{farmId}/alerts                           # 预警推送
```

---

## 📚 参考文献

本项目研究报告（[docs/website-plan.md](docs/website-plan.md)）引用了 20 篇学术论文，涵盖：

- **多光谱早期检测**：Mahlein et al. (2013), Nagasubramanian et al. (2017), Zarco-Tejada et al. (2018, *Nature Plants*)
- **YOLO 病害识别**：Ochijenu et al. (2025, 准确率 99.31%), Tian et al. (2020, mAP>90%)
- **模型压缩与边缘部署**：Han et al. (2016, *NIPS*), Jacob et al. (2018, *CVPR*), Kouzinopoulos & Manna (2025)
- **树莓派农业 IoT**：Mahmud & Toosi (2021, *IEEE IoT Journal*), Sanchez et al. (2022, *Elsevier*)

---

## 📄 License

MIT — ⭐ Star + 🍴 Fork 欢迎

---

> 🤖 澳门濠江中学 · 徐振华、林杰、李靖汐 · 2026
