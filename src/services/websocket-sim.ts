/**
 * WebSocket 模拟器 — 模拟树莓派 5G 上传传感器数据
 *
 * 中学生理解要点:
 * - 真实部署时，替换为 WebSocket/MQTT 连接即可
 * - 每个地块有 5 种传感器 + 机器人电量
 * - 每 2-3 秒生成一轮数据并推送给订阅者
 * - 数据基于"基准值 + 随机漂移"模拟真实传感器波动
 */

import type { SensorReading, SensorType, Device3DStatus } from '@/types'

// 6 个地块的基准传感器值 (土壤湿度 / 温度 / 湿度 / pH / 病害置信度)
const ZONE_BASELINES: Record<string, { soil: number; temp: number; hum: number; ph: number; disease: number }> = {
  'A-01': { soil: 55, temp: 25.4, hum: 68, ph: 6.5, disease: 0.12 },
  'A-02': { soil: 48, temp: 26.1, hum: 72, ph: 6.3, disease: 0.25 },
  'B-01': { soil: 35, temp: 27.2, hum: 81, ph: 5.8, disease: 0.72 },
  'B-02': { soil: 42, temp: 26.8, hum: 76, ph: 5.9, disease: 0.45 },
  'C-01': { soil: 62, temp: 25.9, hum: 66, ph: 6.6, disease: 0.18 },
  'C-02': { soil: 58, temp: 25.7, hum: 70, ph: 6.7, disease: 0.22 },
}

// 传感器类型对应的随机漂移幅度
const DRIFT: Record<SensorType, number> = {
  soil_moisture: 3,
  temperature: 0.5,
  humidity: 3,
  ph: 0.15,
  disease: 0.06,
  battery: 0,
}

// 传感器单位
const UNITS: Record<SensorType, string> = {
  soil_moisture: '%',
  temperature: '°C',
  humidity: '%',
  ph: 'pH',
  disease: '',
  battery: '%',
}

// 阈值判定: 正常范围 / 预警范围，之外为危险
function judgeStatus(type: SensorType, value: number): Device3DStatus {
  switch (type) {
    case 'soil_moisture':
      if (value >= 40 && value <= 75) return 'normal'
      if ((value >= 30 && value < 40) || (value > 75 && value <= 85)) return 'warning'
      return 'danger'
    case 'temperature':
      if (value >= 20 && value <= 30) return 'normal'
      if ((value >= 15 && value < 20) || (value > 30 && value <= 35)) return 'warning'
      return 'danger'
    case 'humidity':
      if (value >= 45 && value <= 75) return 'normal'
      if ((value >= 35 && value < 45) || (value > 75 && value <= 85)) return 'warning'
      return 'danger'
    case 'ph':
      if (value >= 6.0 && value <= 7.0) return 'normal'
      if ((value >= 5.5 && value < 6.0) || (value > 7.0 && value <= 7.5)) return 'warning'
      return 'danger'
    case 'disease':
      if (value < 0.3) return 'normal'
      if (value >= 0.3 && value < 0.6) return 'warning'
      return 'danger'
    case 'battery':
      if (value > 40) return 'normal'
      if (value >= 20 && value <= 40) return 'warning'
      return 'danger'
    default:
      return 'normal'
  }
}

type MessageCallback = (reading: SensorReading) => void

export class WebSocketSimulator {
  private callbacks: Set<MessageCallback> = new Set()
  private timer: ReturnType<typeof setTimeout> | null = null
  private battery = 78

  /** 订阅传感器数据更新，返回取消订阅函数 */
  onMessage(cb: MessageCallback): () => void {
    this.callbacks.add(cb)
    return () => this.callbacks.delete(cb)
  }

  /** 开始广播，每 2-3 秒生成一轮数据 */
  start(): void {
    if (this.timer) return
    const tick = () => {
      const readings = this.generateReadings()
      for (const reading of readings) {
        for (const cb of this.callbacks) cb(reading)
      }
      // 随机间隔 2000-3000ms，模拟真实传感器上报频率
      this.timer = setTimeout(tick, 2000 + Math.random() * 1000)
    }
    tick()
  }

  /** 停止广播 */
  stop(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  isRunning(): boolean {
    return this.timer !== null
  }

  /** 生成一轮传感器数据 (6区 × 5传感器类型 + 机器人电量 = 31条) */
  private generateReadings(): SensorReading[] {
    const now = Date.now()
    const readings: SensorReading[] = []

    // 模拟电量自然消耗
    this.battery = Math.max(10, this.battery - (0.05 + Math.random() * 0.1))
    readings.push({
      deviceId: 'FG-01',
      zoneId: 'B-01',
      type: 'battery',
      value: Math.round(this.battery * 10) / 10,
      unit: '%',
      timestamp: now,
    })

    for (const [zoneId, base] of Object.entries(ZONE_BASELINES)) {
      // 土壤湿度
      readings.push(this.makeReading(zoneId, `SOIL-${zoneId}`, 'soil_moisture', base.soil, now))
      // 温度
      readings.push(this.makeReading(zoneId, `TEMP-${zoneId}`, 'temperature', base.temp, now))
      // 湿度
      readings.push(this.makeReading(zoneId, `HUM-${zoneId}`, 'humidity', base.hum, now))
      // pH
      readings.push(this.makeReading(zoneId, `PH-${zoneId}`, 'ph', base.ph, now))
      // 病害
      readings.push(this.makeReading(zoneId, `DISEASE-${zoneId}`, 'disease', base.disease, now))
    }

    return readings
  }

  private makeReading(
    zoneId: string,
    deviceId: string,
    type: SensorType,
    base: number,
    timestamp: number,
  ): SensorReading {
    const drift = DRIFT[type]
    // 带方向的随机漂移，避免数据越界
    let delta = (Math.random() - 0.5) * 2 * drift
    // 如果当前值接近边界，调整漂移方向
    if (base + delta < 0) delta = Math.abs(delta)
    let value = Math.round((base + delta) * 10) / 10

    // 边界钳制
    switch (type) {
      case 'soil_moisture':
      case 'humidity':
        value = Math.max(0, Math.min(100, value))
        break
      case 'temperature':
        value = Math.max(-10, Math.min(50, value))
        break
      case 'ph':
        value = Math.max(0, Math.min(14, value))
        break
      case 'disease':
        value = Math.max(0, Math.min(1, value))
        break
    }

    // 更新基准值以产生平滑曲线
    switch (type) {
      case 'soil_moisture':
        ZONE_BASELINES[zoneId].soil = value
        break
      case 'temperature':
        ZONE_BASELINES[zoneId].temp = value
        break
      case 'humidity':
        ZONE_BASELINES[zoneId].hum = value
        break
      case 'ph':
        ZONE_BASELINES[zoneId].ph = value
        break
      case 'disease':
        ZONE_BASELINES[zoneId].disease = value
        break
    }

    return { deviceId, zoneId, type, value, unit: UNITS[type], timestamp }
  }
}

// 导出全局单例，方便任何组件引入
export { judgeStatus }
export const wsSimulator = new WebSocketSimulator()
