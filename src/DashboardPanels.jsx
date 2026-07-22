import { useEffect, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bell,
  Bot,
  Check,
  Cloud,
  Database,
  Droplets,
  Gauge,
  MapPin,
  Pause,
  Play,
  PlugZap,
  Power,
  Radio,
  RotateCcw,
  Router,
  Save,
  Server,
  Settings2,
  ShieldCheck,
  Thermometer,
  Wifi,
  Wind,
  Wrench,
  X,
  Zap,
} from 'lucide-react'

const initialAlerts = [
  { id: 1, level: '嚴重', zone: 'B-01', title: '光譜與 RGB 雙通道確認異常', time: '2 分鐘前', action: '精準施藥', tone: 'danger', open: true },
  { id: 2, level: '關注', zone: 'A-02', title: '發現菜青蟲卵塊，等待近距覆核', time: '18 分鐘前', action: '機械抓取', tone: 'warning', open: true },
  { id: 3, level: '已恢復', zone: 'C-01', title: '濕度回落，環境風險已解除', time: '1 小時前', action: '查看記錄', tone: 'healthy', open: false },
]

const sensorDevices = [
  { id: 'ENV-A01', name: 'A 區環境站', type: '溫濕度 / 雨量', value: '25.4°C · 68%', signal: 92, online: true },
  { id: 'SPEC-B01', name: 'B 區多光譜站', type: 'AS7265x · 18 通道', value: '異常指數 0.84', signal: 86, online: true },
  { id: 'CAM-B01', name: 'B 區 RGB 相機', type: '1080P · YOLO', value: '推理 4.2 FPS', signal: 78, online: true },
  { id: 'BASE-C01', name: 'C 區固定基站', type: 'ESP32-S3', value: '最後上報 12 分鐘前', signal: 0, online: false },
]

export default function DashboardPanels({ activePanel, patrolling, setPatrolling, notify }) {
  if (activePanel === 'alerts') return <AlertsPanel notify={notify} />
  if (activePanel === 'robot') return <RobotPanel patrolling={patrolling} setPatrolling={setPatrolling} notify={notify} />
  if (activePanel === 'sensors') return <SensorsPanel notify={notify} />
  if (activePanel === 'integration') return <IntegrationPanel notify={notify} />
  return null
}

function PanelTitle({ eyebrow, title, description, icon: Icon }) {
  return (
    <div className="workspace-title">
      <div><span>{eyebrow}</span><h3>{title}</h3><p>{description}</p></div>
      <i><Icon /></i>
    </div>
  )
}

function AlertsPanel({ notify }) {
  const [alerts, setAlerts] = useState(initialAlerts)
  const openCount = alerts.filter((item) => item.open).length
  const resolveAlert = (id) => {
    setAlerts((items) => items.map((item) => item.id === id ? { ...item, open: false, level: '已處理', tone: 'healthy' } : item))
    notify('預警已確認，處置結果已寫入審計記錄')
  }

  return (
    <div className="workspace-panel">
      <PanelTitle eyebrow="ALERT CENTER" title="預警中心" description="集中確認、處置與追蹤所有農田風險。" icon={Bell} />
      <div className="workspace-stats">
        <article><AlertTriangle /><span><small>待處理</small><strong>{openCount}</strong></span></article>
        <article><ShieldCheck /><span><small>今日已處置</small><strong>12</strong></span></article>
        <article><Activity /><span><small>平均響應時間</small><strong>3.8 min</strong></span></article>
      </div>
      <div className="alert-list panel">
        <div className="panel-head"><strong>最新預警</strong><span>按危險程度排序</span></div>
        {alerts.map((alert) => (
          <div className={`alert-item ${alert.tone}`} key={alert.id}>
            <i><AlertTriangle /></i>
            <span className="alert-level">{alert.level}</span>
            <div><strong>{alert.zone} · {alert.title}</strong><small>{alert.time} · 建議：{alert.action}</small></div>
            {alert.open ? <button className="mini-3d" onClick={() => resolveAlert(alert.id)}>確認處置 <Check /></button> : <span className="resolved"><Check /> 已完成</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function RobotPanel({ patrolling, setPatrolling, notify }) {
  const [speed, setSpeed] = useState(42)
  const [mode, setMode] = useState('自主巡田')
  const [lastMove, setLastMove] = useState('停止')

  const move = (direction) => {
    setLastMove(direction)
    notify(`FG-01 已執行：${direction}`)
  }

  const emergencyStop = () => {
    setPatrolling(false)
    setLastMove('緊急停止')
    notify('緊急停止已觸發，底盤與全部執行器已斷開輸出')
  }

  return (
    <div className="workspace-panel">
      <PanelTitle eyebrow="ROBOT CONTROL" title="巡田機器人" description="監看 FG-01 狀態、切換模式並進行安全接管。" icon={Bot} />
      <div className="robot-console-grid">
        <article className="panel robot-telemetry">
          <div className="panel-head"><strong>即時遙測</strong><span className="online-copy"><i /> ROS Bridge 在線</span></div>
          <div className="robot-visual-mini"><Bot /><span className={patrolling ? 'pulse-ring' : ''} /><b>FG-01</b><small>{lastMove}</small></div>
          <div className="telemetry-grid">
            <div><Power /><small>電量</small><strong>78%</strong></div>
            <div><Gauge /><small>速度</small><strong>{speed}%</strong></div>
            <div><MapPin /><small>定位</small><strong>± 4cm</strong></div>
            <div><Wifi /><small>訊號</small><strong>-52 dBm</strong></div>
          </div>
        </article>
        <article className="panel manual-control">
          <div className="panel-head"><strong>人工接管</strong><span>長按實機按鈕時需加入持續心跳</span></div>
          <div className="mode-switch">
            {['自主巡田', '人工接管'].map((item) => <button key={item} className={mode === item ? 'active' : ''} onClick={() => setMode(item)}>{item}</button>)}
          </div>
          <div className="direction-pad">
            <button onClick={() => move('前進')} aria-label="機器人前進"><ArrowUp /></button>
            <button onClick={() => move('左轉')} aria-label="機器人左轉"><ArrowLeft /></button>
            <button className="stop-center" onClick={() => move('停止')} aria-label="停止"><span /></button>
            <button onClick={() => move('右轉')} aria-label="機器人右轉"><ArrowRight /></button>
            <button onClick={() => move('後退')} aria-label="機器人後退"><ArrowDown /></button>
          </div>
          <label className="speed-control"><span>行駛速度 <b>{speed}%</b></span><input type="range" min="10" max="100" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} /></label>
          <div className="robot-actions">
            <button className="control-3d green" onClick={() => { setPatrolling((value) => !value); notify(patrolling ? '巡田任務已暫停' : '巡田任務已繼續') }}>{patrolling ? <Pause /> : <Play />}{patrolling ? '暫停任務' : '繼續任務'}</button>
            <button className="control-3d red" onClick={emergencyStop}><Power />緊急停止</button>
          </div>
        </article>
      </div>
      <article className="panel task-route">
        <div className="panel-head"><strong>今日路線</strong><button className="mini-3d" onClick={() => notify('已重新規劃路線，避開 B-01 施藥區')}><RotateCcw /> 重新規劃</button></div>
        <div className="route-progress"><i className="done"><Check /></i><b /><i className="done"><Check /></i><b /><i className="active"><Bot /></i><b /><i>4</i><b /><i>5</i></div>
        <div className="route-labels"><span>A-01<small>完成</small></span><span>A-02<small>完成</small></span><span>B-01<small>處置中</small></span><span>B-02<small>待巡檢</small></span><span>C 區<small>待巡檢</small></span></div>
      </article>
    </div>
  )
}

function SensorsPanel({ notify }) {
  const [testing, setTesting] = useState('')
  const calibrate = (id) => {
    setTesting(id)
    window.setTimeout(() => { setTesting(''); notify(`${id} 校準完成，基線已更新`) }, 900)
  }

  return (
    <div className="workspace-panel">
      <PanelTitle eyebrow="SENSOR NETWORK" title="感測節點" description="查看固定基站、多光譜與視覺設備的健康狀態。" icon={Radio} />
      <div className="sensor-grid">
        {sensorDevices.map((device) => (
          <article className={`sensor-card panel ${device.online ? '' : 'offline'}`} key={device.id}>
            <div className="device-top"><i><Radio /></i><span className={device.online ? 'device-online' : 'device-offline'}>{device.online ? '在線' : '離線'}</span></div>
            <span className="device-id">{device.id}</span><h4>{device.name}</h4><p>{device.type}</p><strong>{device.value}</strong>
            <div className="signal-bar"><span>訊號 {device.signal}%</span><i><b style={{ width: `${device.signal}%` }} /></i></div>
            <button className="mini-3d" disabled={!device.online || testing === device.id} onClick={() => calibrate(device.id)}><Wrench />{testing === device.id ? '校準中…' : '校準裝置'}</button>
          </article>
        ))}
      </div>
      <div className="sensor-bottom-grid">
        <article className="panel data-stream"><div className="panel-head"><strong>即時資料流</strong><span>每 5 秒更新</span></div><div className="stream-bars">{[34,58,42,78,62,86,54,70,92,66,82,74].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div></article>
        <article className="panel maintenance-card"><div><Settings2 /><span><strong>下一次維護</strong><small>多光譜感測器白板校準</small></span></div><b>剩餘 6 天</b><button className="mini-3d" onClick={() => notify('維護提醒已加入日程')}>加入日程</button></article>
      </div>
    </div>
  )
}

function IntegrationPanel({ notify }) {
  const [config, setConfig] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem('fieldguard-device-config')) || {} } catch { return {} }
  })
  const [form, setForm] = useState({ broker: config.broker || 'wss://broker.example.com:8084/mqtt', api: config.api || 'https://api.example.com/v1', deviceId: config.deviceId || 'FG-01', token: '' })
  const [connection, setConnection] = useState('idle')

  useEffect(() => () => window.clearTimeout(window.__fieldguardConnectionTimer), [])

  const update = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }))
  const testConnection = () => {
    setConnection('testing')
    window.__fieldguardConnectionTimer = window.setTimeout(() => { setConnection('success'); notify('裝置連線測試成功，已收到模擬心跳') }, 1000)
  }
  const save = () => {
    const safeConfig = { broker: form.broker, api: form.api, deviceId: form.deviceId }
    window.localStorage.setItem('fieldguard-device-config', JSON.stringify(safeConfig))
    setConfig(safeConfig)
    notify('接入設定已儲存在此瀏覽器；部署後請改由後端安全保存 Token')
  }

  return (
    <div className="workspace-panel">
      <PanelTitle eyebrow="DEVICE INTEGRATION" title="裝置接入" description="這裡就是部署後連接 Raspberry Pi、ESP32 與巡田車的位置。" icon={PlugZap} />
      <div className="integration-grid">
        <article className="panel integration-form">
          <div className="panel-head"><strong>連線設定</strong><span className={`connection-state ${connection}`}>{connection === 'success' ? '已連線' : connection === 'testing' ? '測試中…' : '尚未測試'}</span></div>
          <label><span><Router /> MQTT WebSocket</span><input value={form.broker} onChange={update('broker')} placeholder="wss://broker:8084/mqtt" /></label>
          <label><span><Cloud /> REST API</span><input value={form.api} onChange={update('api')} placeholder="https://api.example.com/v1" /></label>
          <div className="form-pair">
            <label><span><Bot /> 裝置 ID</span><input value={form.deviceId} onChange={update('deviceId')} /></label>
            <label><span><ShieldCheck /> Access Token</span><input type="password" value={form.token} onChange={update('token')} placeholder="只用于本次测试" /></label>
          </div>
          <div className="integration-actions"><button className="control-3d green" onClick={testConnection} disabled={connection === 'testing'}><Zap />{connection === 'testing' ? '連線中…' : '測試連線'}</button><button className="control-3d neutral" onClick={save}><Save />保存設定</button></div>
          <p className="security-note"><ShieldCheck /> Token 不會寫入 localStorage。正式環境應由後端環境變數管理，不要放進前端或 GitHub。</p>
        </article>
        <article className="panel deployment-map">
          <div className="panel-head"><strong>部署對接位置</strong><span>建議通訊拓撲</span></div>
          <div className="stack-node cloud"><Server /><span><strong>雲端 API</strong><small>/api · Web 儀表盤</small></span></div>
          <i className="stack-link"><b /></i>
          <div className="stack-node edge"><Database /><span><strong>田邊 Raspberry Pi</strong><small>MQTT Broker · AI 推理</small></span></div>
          <i className="stack-link split"><b /><b /></i>
          <div className="stack-devices"><div><Radio /><span>ESP32 基站<small>telemetry</small></span></div><div><Bot /><span>FG-01 巡田車<small>state / command</small></span></div></div>
        </article>
      </div>
      <article className="panel topic-card">
        <div className="panel-head"><strong>MQTT 主題</strong><span>將 farmId 與 deviceId 替換為實際編號</span></div>
        <div className="topic-grid"><code>fieldguard/demo/sensors/+/telemetry</code><code>fieldguard/demo/vision/+/detections</code><code>fieldguard/demo/robots/FG-01/state</code><code>fieldguard/demo/robots/FG-01/command</code></div>
      </article>
    </div>
  )
}
