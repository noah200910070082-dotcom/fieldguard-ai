// ========== 农场数据 ==========
export interface Zone {
  id: string
  crop: string
  risk: number
  trend: number
  status: 'healthy' | 'watch' | 'warning' | 'danger'
  temp: number
  humidity: number
}

export interface Mission {
  time: string
  titleKey: string
  detailKey: string
  state: 'running' | 'waiting' | 'scheduled'
}

// ========== 预警 ==========
export interface Alert {
  id: number
  level: string
  zone: string
  title: string
  time: string
  action: string
  tone: 'danger' | 'warning' | 'healthy'
  open: boolean
}

// ========== 传感器 ==========
export interface SensorDevice {
  id: string
  name: string
  type: string
  value: string
  signal: number
  online: boolean
}

// ========== 机器人 ==========
export type RobotMode = 'auto' | 'manual'
export type MoveDirection = 'forward' | 'left' | 'stop' | 'right' | 'backward'

// ========== 风险分数 ==========
export interface RiskState {
  key: 'healthy' | 'watch' | 'warning' | 'danger'
  label: string
  color: string
  action: string
  icon: string
}

// ========== 导航 ==========
export type PanelKey = 'overview' | 'alerts' | 'robot' | 'sensors' | 'integration'

// ========== 3D 设备状态 ==========
export type Device3DStatus = 'normal' | 'warning' | 'danger'

// ========== 实时传感器遥测 ==========
export type SensorType = 'soil_moisture' | 'temperature' | 'humidity' | 'ph' | 'disease' | 'battery'

export interface SensorReading {
  deviceId: string
  zoneId: string
  type: SensorType
  value: number
  unit: string
  timestamp: number
}

export interface DeviceState {
  deviceId: string
  zoneId: string
  online: boolean
  status: Device3DStatus
  lastReading: SensorReading | null
  battery?: number
  signal: number
}

// ========== 图表数据点 ==========
export interface ChartPoint {
  time: string
  temperature: number
  humidity: number
  soilMoisture: number
  ph: number
  diseaseRisk: number
}

// ========== 实时告警 ==========
export interface SensorAlert {
  id: string
  deviceId: string
  zoneId: string
  message: string
  level: 'warning' | 'danger'
  timestamp: number
  acknowledged: boolean
}
