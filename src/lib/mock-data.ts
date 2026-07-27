import type { Zone, Mission } from '@/types'

export const zones: Zone[] = [
  { id: 'A-01', crop: '番茄', risk: 18, trend: -3, status: 'healthy', temp: 25.4, humidity: 68 },
  { id: 'A-02', crop: '番茄', risk: 34, trend: 7, status: 'watch', temp: 26.1, humidity: 72 },
  { id: 'B-01', crop: '白菜', risk: 72, trend: 14, status: 'danger', temp: 27.2, humidity: 81 },
  { id: 'B-02', crop: '白菜', risk: 46, trend: 4, status: 'warning', temp: 26.8, humidity: 76 },
  { id: 'C-01', crop: '玉米', risk: 22, trend: -2, status: 'healthy', temp: 25.9, humidity: 66 },
  { id: 'C-02', crop: '玉米', risk: 29, trend: 1, status: 'healthy', temp: 25.7, humidity: 70 },
]

export const missions: Mission[] = [
  { time: '10:42', titleKey: 'b01Spray', detailKey: 'b01SprayDetail', state: 'running' },
  { time: '10:54', titleKey: 'a02Grasp', detailKey: 'a02GraspDetail', state: 'waiting' },
  { time: '11:20', titleKey: 'cRoute', detailKey: 'cRouteDetail', state: 'scheduled' },
]

export const sensorDevices = [
  {
    id: 'ENV-A01',
    nameKey: 'esp32Base',
    prefix: 'A ',
    type: '溫濕度 / 雨量',
    value: '25.4°C · 68%',
    signal: 92,
    online: true,
  },
  {
    id: 'SPEC-B01',
    nameKey: 'calibrating',
    prefix: 'B ',
    type: 'AS7265x · 18 通道',
    value: '異常指數 0.84',
    signal: 86,
    online: true,
  },
  {
    id: 'CAM-B01',
    nameKey: '',
    prefix: 'B 區 RGB 相機',
    type: '1080P · YOLO',
    value: '推理 4.2 FPS',
    signal: 78,
    online: true,
  },
  {
    id: 'BASE-C01',
    nameKey: 'esp32Base',
    prefix: 'C ',
    type: 'ESP32-S3',
    value: '最後上報 12 分鐘前',
    signal: 0,
    online: false,
  },
]
