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

export default function DashboardPanels({ activePanel, patrolling, setPatrolling, notify, t }) {
  if (activePanel === 'alerts') return <AlertsPanel notify={notify} t={t} />
  if (activePanel === 'robot') return <RobotPanel patrolling={patrolling} setPatrolling={setPatrolling} notify={notify} t={t} />
  if (activePanel === 'sensors') return <SensorsPanel notify={notify} t={t} />
  if (activePanel === 'integration') return <IntegrationPanel notify={notify} t={t} />
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

function AlertsPanel({ notify, t }) {
  const initialAlerts = [
    { id: 1, level: t('highRisk'), zone: 'B-01', titleKey: 'b01Spray', timeKey: { key: '2m' }, actionKey: 'preciseSpray', tone: 'danger', open: true },
    { id: 2, level: t('needAttention'), zone: 'A-02', titleKey: 'a02Grasp', timeKey: { key: '18m' }, actionKey: 'mechGrasp', tone: 'warning', open: true },
    { id: 3, level: t('completed'), zone: 'C-01', titleKey: 'sensorNetwork', timeKey: { key: '1h' }, actionKey: 'completed', tone: 'healthy', open: false },
  ]

  const alertData = [
    { id: 1, level: t('highRisk'), zone: 'B-01', title: t('b01Spray'), time: '2' + t('secUpdate').replace('秒', ' 分鐘前'), action: t('preciseSpray'), tone: 'danger', open: true },
    { id: 2, level: t('needAttention'), zone: 'A-02', title: t('a02Grasp'), time: '18 分鐘前', action: t('mechGrasp'), tone: 'warning', open: true },
    { id: 3, level: t('completed'), zone: 'C-01', title: t('sensorNetwork'), time: '1 小時前', action: t('completed'), tone: 'healthy', open: false },
  ]
  const [alerts, setAlerts] = useState(alertData)
  const openCount = alerts.filter((item) => item.open).length
  const resolveAlert = (id) => {
    setAlerts((items) => items.map((item) => item.id === id ? { ...item, open: false, level: t('completed'), tone: 'healthy' } : item))
    notify(t('alertConfirmed'))
  }

  return (
    <div className="workspace-panel">
      <PanelTitle eyebrow="ALERT CENTER" title={t('alertCenter')} description={t('alertDesc')} icon={Bell} />
      <div className="workspace-stats">
        <article><AlertTriangle /><span><small>{t('pending')}</small><strong>{openCount}</strong></span></article>
        <article><ShieldCheck /><span><small>{t('todayResolved')}</small><strong>12</strong></span></article>
        <article><Activity /><span><small>{t('avgResponse')}</small><strong>3.8 min</strong></span></article>
      </div>
      <div className="alert-list panel">
        <div className="panel-head"><strong>{t('latestAlerts')}</strong><span>{t('sortedByDanger')}</span></div>
        {alerts.map((alert) => (
          <div className={`alert-item ${alert.tone}`} key={alert.id}>
            <i><AlertTriangle /></i>
            <span className="alert-level">{alert.level}</span>
            <div><strong>{alert.zone} · {alert.title}</strong><small>{alert.time} · {t('ruleEngine')}：{alert.action}</small></div>
            {alert.open ? <button className="mini-3d" onClick={() => resolveAlert(alert.id)}>{t('confirmDispose')} <Check /></button> : <span className="resolved"><Check /> {t('completed')}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function RobotPanel({ patrolling, setPatrolling, notify, t }) {
  const [speed, setSpeed] = useState(42)
  const [mode, setMode] = useState(t('autoPatrol'))
  const [lastMove, setLastMove] = useState(t('stop'))

  useEffect(() => {
    setMode(t('autoPatrol'))
  }, [t])

  const move = (direction) => {
    setLastMove(direction)
    notify(`FG-01: ${direction}`)
  }

  const emergencyStop = () => {
    setPatrolling(false)
    setLastMove(t('emergencyStop'))
    notify(t('emergencyTriggered'))
  }

  return (
    <div className="workspace-panel">
      <PanelTitle eyebrow="ROBOT CONTROL" title={t('robotControl')} description={t('robotDesc')} icon={Bot} />
      <div className="robot-console-grid">
        <article className="panel robot-telemetry">
          <div className="panel-head"><strong>{t('realtimeTelemetry')}</strong><span className="online-copy"><i /> {t('rosBridgeOnline')}</span></div>
          <div className="robot-visual-mini"><Bot /><span className={patrolling ? 'pulse-ring' : ''} /><b>FG-01</b><small>{lastMove}</small></div>
          <div className="telemetry-grid">
            <div><Power /><small>{t('battery')}</small><strong>78%</strong></div>
            <div><Gauge /><small>{t('speed')}</small><strong>{speed}%</strong></div>
            <div><MapPin /><small>{t('location')}</small><strong>± 4cm</strong></div>
            <div><Wifi /><small>{t('signal')}</small><strong>-52 dBm</strong></div>
          </div>
        </article>
        <article className="panel manual-control">
          <div className="panel-head"><strong>{t('manualControl')}</strong><span>{t('manualHint')}</span></div>
          <div className="mode-switch">
            {[t('autoPatrol'), t('manualOverride')].map((item) => <button key={item} className={mode === item ? 'active' : ''} onClick={() => setMode(item)}>{item}</button>)}
          </div>
          <div className="direction-pad">
            <button onClick={() => move(t('forward'))} aria-label={t('forward')}><ArrowUp /></button>
            <button onClick={() => move(t('leftTurn'))} aria-label={t('leftTurn')}><ArrowLeft /></button>
            <button className="stop-center" onClick={() => move(t('stop'))} aria-label={t('stop')}><span /></button>
            <button onClick={() => move(t('rightTurn'))} aria-label={t('rightTurn')}><ArrowRight /></button>
            <button onClick={() => move(t('backward'))} aria-label={t('backward')}><ArrowDown /></button>
          </div>
          <label className="speed-control"><span>{t('drivingSpeed')} <b>{speed}%</b></span><input type="range" min="10" max="100" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} /></label>
          <div className="robot-actions">
            <button className="control-3d green" onClick={() => { setPatrolling((value) => !value); notify(patrolling ? t('patrolPaused') : t('patrolResumed')) }}>{patrolling ? <Pause /> : <Play />}{patrolling ? t('pauseTask') : t('resumeTask')}</button>
            <button className="control-3d red" onClick={emergencyStop}><Power />{t('emergencyStop')}</button>
          </div>
        </article>
      </div>
      <article className="panel task-route">
        <div className="panel-head"><strong>{t('todayRoute')}</strong><button className="mini-3d" onClick={() => notify(t('rerouted'))}><RotateCcw /> {t('reroute')}</button></div>
        <div className="route-progress"><i className="done"><Check /></i><b /><i className="done"><Check /></i><b /><i className="active"><Bot /></i><b /><i>4</i><b /><i>5</i></div>
        <div className="route-labels"><span>A-01<small>{t('complete')}</small></span><span>A-02<small>{t('complete')}</small></span><span>B-01<small>{t('treating')}</small></span><span>B-02<small>{t('pendingInspect')}</small></span><span>C <small>{t('pendingInspect')}</small></span></div>
      </article>
    </div>
  )
}

function SensorsPanel({ notify, t }) {
  const [testing, setTesting] = useState('')

  const sensorDevices = [
    { id: 'ENV-A01', name: 'A ' + t('esp32Base'), type: '溫濕度 / 雨量', value: '25.4°C · 68%', signal: 92, online: true },
    { id: 'SPEC-B01', name: 'B ' + t('calibrating'), type: 'AS7265x · 18 通道', value: '異常指數 0.84', signal: 86, online: true },
    { id: 'CAM-B01', name: 'B 區 RGB 相機', type: '1080P · YOLO', value: '推理 4.2 FPS', signal: 78, online: true },
    { id: 'BASE-C01', name: 'C ' + t('esp32Base'), type: 'ESP32-S3', value: '最後上報 12 分鐘前', signal: 0, online: false },
  ]

  const calibrate = (id) => {
    setTesting(id)
    window.setTimeout(() => { setTesting(''); notify(`${id} ${t('calibrated')}`) }, 900)
  }

  return (
    <div className="workspace-panel">
      <PanelTitle eyebrow="SENSOR NETWORK" title={t('sensorNodes')} description={t('sensorDesc')} icon={Radio} />
      <div className="sensor-grid">
        {sensorDevices.map((device) => (
          <article className={`sensor-card panel ${device.online ? '' : 'offline'}`} key={device.id}>
            <div className="device-top"><i><Radio /></i><span className={device.online ? 'device-online' : 'device-offline'}>{device.online ? t('onlineStatus') : t('paused')}</span></div>
            <span className="device-id">{device.id}</span><h4>{device.name}</h4><p>{device.type}</p><strong>{device.value}</strong>
            <div className="signal-bar"><span>{t('signal')} {device.signal}%</span><i><b style={{ width: `${device.signal}%` }} /></i></div>
            <button className="mini-3d" disabled={!device.online || testing === device.id} onClick={() => calibrate(device.id)}><Wrench />{testing === device.id ? t('calibrating') : t('calibrateDevice')}</button>
          </article>
        ))}
      </div>
      <div className="sensor-bottom-grid">
        <article className="panel data-stream"><div className="panel-head"><strong>{t('realtimeDataStream')}</strong><span>5{t('secUpdate')}</span></div><div className="stream-bars">{[34,58,42,78,62,86,54,70,92,66,82,74].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div></article>
        <article className="panel maintenance-card"><div><Settings2 /><span><strong>{t('nextMaintenance')}</strong><small>{t('maintenanceItem')}</small></span></div><b>{t('daysRemaining')} 6 {t('days')}</b><button className="mini-3d" onClick={() => notify(t('maintenanceAdded'))}>{t('addToCalendar')}</button></article>
      </div>
    </div>
  )
}

function IntegrationPanel({ notify, t }) {
  const [config, setConfig] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem('fieldguard-device-config')) || {} } catch { return {} }
  })
  const [form, setForm] = useState({ broker: config.broker || 'wss://broker.example.com:8084/mqtt', api: config.api || 'https://api.example.com/v1', deviceId: config.deviceId || 'FG-01', token: '' })
  const [connection, setConnection] = useState('idle')

  useEffect(() => () => window.clearTimeout(window.__fieldguardConnectionTimer), [])

  const update = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }))
  const testConnection = () => {
    setConnection('testing')
    window.__fieldguardConnectionTimer = window.setTimeout(() => { setConnection('success'); notify(t('connectionSuccess')) }, 1000)
  }
  const save = () => {
    const safeConfig = { broker: form.broker, api: form.api, deviceId: form.deviceId }
    window.localStorage.setItem('fieldguard-device-config', JSON.stringify(safeConfig))
    setConfig(safeConfig)
    notify(t('settingsSaved'))
  }

  return (
    <div className="workspace-panel">
      <PanelTitle eyebrow="DEVICE INTEGRATION" title={t('deviceIntegration')} description={t('integrationDesc')} icon={PlugZap} />
      <div className="integration-grid">
        <article className="panel integration-form">
          <div className="panel-head"><strong>{t('connectionSettings')}</strong><span className={`connection-state ${connection}`}>{connection === 'success' ? t('connected') : connection === 'testing' ? t('testing') : t('notTested')}</span></div>
          <label><span><Router /> MQTT WebSocket</span><input value={form.broker} onChange={update('broker')} placeholder="wss://broker:8084/mqtt" /></label>
          <label><span><Cloud /> REST API</span><input value={form.api} onChange={update('api')} placeholder="https://api.example.com/v1" /></label>
          <div className="form-pair">
            <label><span><Bot /> {t('devices') !== 'devices' ? t('devices') : 'Device ID'}</span><input value={form.deviceId} onChange={update('deviceId')} /></label>
            <label><span><ShieldCheck /> Access Token</span><input type="password" value={form.token} onChange={update('token')} placeholder="Test only" /></label>
          </div>
          <div className="integration-actions"><button className="control-3d green" onClick={testConnection} disabled={connection === 'testing'}><Zap />{connection === 'testing' ? t('testing') : t('testConnection')}</button><button className="control-3d neutral" onClick={save}><Save />{t('saveSettings')}</button></div>
          <p className="security-note"><ShieldCheck /> {t('securityNote')}</p>
        </article>
        <article className="panel deployment-map">
          <div className="panel-head"><strong>{t('deployTopo')}</strong><span>{t('topoHint')}</span></div>
          <div className="stack-node cloud"><Server /><span><strong>{t('cloudApi')}</strong><small>{t('webDashboard')}</small></span></div>
          <i className="stack-link"><b /></i>
          <div className="stack-node edge"><Database /><span><strong>{t('fieldEdge')}</strong><small>{t('mqttBroker')}</small></span></div>
          <i className="stack-link split"><b /><b /></i>
          <div className="stack-devices"><div><Radio /><span>{t('esp32Base')}<small>telemetry</small></span></div><div><Bot /><span>{t('fg01Rover')}<small>state / command</small></span></div></div>
        </article>
      </div>
      <article className="panel topic-card">
        <div className="panel-head"><strong>{t('mqttTopics')}</strong><span>{t('mqttHint')}</span></div>
        <div className="topic-grid"><code>fieldguard/demo/sensors/+/telemetry</code><code>fieldguard/demo/vision/+/detections</code><code>fieldguard/demo/robots/FG-01/state</code><code>fieldguard/demo/robots/FG-01/command</code></div>
      </article>
    </div>
  )
}
