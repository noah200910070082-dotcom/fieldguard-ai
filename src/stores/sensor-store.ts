/**
 * 传感器数据 Store — 管理实时遥测数据、图表历史、告警队列
 *
 * 用 Zustand 管理 WebSocket 推送的全部传感器状态
 * 中学生理解要点:
 * - devices: 每个传感器的当前状态 (在线/数值/告警等级)
 * - chartHistory: 每个地块最近 60 个数据点 (用于画图表)
 * - alerts: 危险设备自动推送告警消息
 */

import { create } from 'zustand'
import type { SensorReading, DeviceState, ChartPoint, SensorAlert, Device3DStatus } from '@/types'
import { judgeStatus } from '@/services/websocket-sim'

const MAX_HISTORY = 60 // 最多保留 60 个数据点 (约 2 分钟)

let alertCounter = 0

interface LatestReadings {
  soilMoisture: number
  temperature: number
  humidity: number
  ph: number
  diseaseRisk: number
}

interface SensorState {
  // 所有设备状态 (key = deviceId)
  devices: Record<string, DeviceState>

  // 每个地块的图表历史 (key = zoneId, value = 最近60个时间点)
  chartHistory: Record<string, ChartPoint[]>

  // 活跃告警
  alerts: SensorAlert[]

  // 连接统计
  connected: boolean
  messageCount: number

  // 每个地块的最新传感器聚合值 (用于生成图表点)
  latestByZone: Record<string, LatestReadings>

  // ---- Actions ----
  updateReading: (reading: SensorReading) => void
  acknowledgeAlert: (alertId: string) => void
  clearHistory: () => void
  _addChartPoint: (zoneId: string) => void
}

export const useSensorStore = create<SensorState>((set, get) => ({
  devices: {},
  chartHistory: {},
  alerts: [],
  connected: false,
  messageCount: 0,
  latestByZone: {},

  /** 处理一条传感器读数 */
  updateReading: (reading: SensorReading) => {
    const state = get()
    const { deviceId, zoneId, type, value, unit, timestamp } = reading

    // 更新或创建设备状态
    const existing = state.devices[deviceId]
    const status: Device3DStatus = judgeStatus(type, value)

    const device: DeviceState = {
      deviceId,
      zoneId,
      online: true,
      status: existing ? worseStatus(existing.status, status) : status,
      lastReading: reading,
      battery: type === 'battery' ? value : existing?.battery,
      signal: existing?.signal ?? 85 + Math.floor(Math.random() * 15),
    }

    // 更新 latestByZone 聚合值
    const zoneLatest = { ...(state.latestByZone[zoneId] ?? defaultLatest()) }
    switch (type) {
      case 'soil_moisture':
        zoneLatest.soilMoisture = value
        break
      case 'temperature':
        zoneLatest.temperature = value
        break
      case 'humidity':
        zoneLatest.humidity = value
        break
      case 'ph':
        zoneLatest.ph = value
        break
      case 'disease':
        zoneLatest.diseaseRisk = value
        break
    }

    // 如果是危险状态，生成告警
    const newAlerts = [...state.alerts]
    if (status === 'danger' && (!existing || existing.status !== 'danger')) {
      const msg = buildAlertMessage(zoneId, deviceId, type, value, unit)
      newAlerts.push({
        id: `alert-${++alertCounter}`,
        deviceId,
        zoneId,
        message: msg,
        level: 'danger',
        timestamp,
        acknowledged: false,
      })
      // 最多保留 50 条告警
      if (newAlerts.length > 50) newAlerts.splice(0, newAlerts.length - 50)
    }

    set({
      devices: { ...state.devices, [deviceId]: device },
      latestByZone: { ...state.latestByZone, [zoneId]: zoneLatest },
      alerts: newAlerts,
      connected: true,
      messageCount: state.messageCount + 1,
    })

    // 每收到 5 条消息生成一个图表数据点
    if ((state.messageCount + 1) % 5 === 0) {
      get()._addChartPoint(zoneId)
    }
  },

  /** 确认一条告警 (标记为已处理) */
  acknowledgeAlert: (alertId: string) => {
    set((s) => ({
      alerts: s.alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)),
    }))
  },

  /** 清空图表历史 */
  clearHistory: () => set({ chartHistory: {} }),

  /** 生成一个图表数据点 */
  _addChartPoint: (zoneId: string) => {
    const state = get()
    const latest = state.latestByZone[zoneId]
    if (!latest) return

    const now = new Date()
    const point: ChartPoint = {
      time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`,
      temperature: Math.round(latest.temperature * 10) / 10,
      humidity: Math.round(latest.humidity * 10) / 10,
      soilMoisture: Math.round(latest.soilMoisture * 10) / 10,
      ph: Math.round(latest.ph * 100) / 100,
      diseaseRisk: Math.round(latest.diseaseRisk * 100) / 100,
    }

    const prev = state.chartHistory[zoneId] ?? []
    const history = [...prev, point].slice(-MAX_HISTORY)

    set({
      chartHistory: { ...state.chartHistory, [zoneId]: history },
    })
  },
}))

/** 取更严重的状态 */
function worseStatus(a: Device3DStatus, b: Device3DStatus): Device3DStatus {
  const rank: Record<Device3DStatus, number> = { normal: 0, warning: 1, danger: 2 }
  return rank[a] >= rank[b] ? a : b
}

function defaultLatest(): LatestReadings {
  return { soilMoisture: 50, temperature: 25, humidity: 65, ph: 6.5, diseaseRisk: 0.2 }
}

/** 构建告警消息文本 */
function buildAlertMessage(
  zoneId: string,
  deviceId: string,
  type: string,
  value: number,
  unit: string,
): string {
  const typeNames: Record<string, string> = {
    soil_moisture: '土壤湿度',
    temperature: '温度',
    humidity: '空气湿度',
    ph: '土壤pH',
    disease: '病害检测',
    battery: '机器人电量',
  }
  const name = typeNames[type] ?? type
  return `${zoneId} ${name}异常 (${deviceId}: ${value}${unit})`
}
