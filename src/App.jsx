import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  Check,
  CircleHelp,
  CloudSun,
  Droplets,
  Gauge,
  Leaf,
  Menu,
  Pause,
  Play,
  PlugZap,
  Radio,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Target,
  Thermometer,
  Volume2,
  Wifi,
  Wind,
  X,
  Zap,
} from 'lucide-react'
import DashboardPanels from './DashboardPanels'

const FarmScene3D = lazy(() => import('./FarmScene3D'))

const zones = [
  { id: 'A-01', crop: '番茄', risk: 18, trend: -3, status: 'healthy', temp: 25.4, humidity: 68 },
  { id: 'A-02', crop: '番茄', risk: 34, trend: 7, status: 'watch', temp: 26.1, humidity: 72 },
  { id: 'B-01', crop: '白菜', risk: 72, trend: 14, status: 'danger', temp: 27.2, humidity: 81 },
  { id: 'B-02', crop: '白菜', risk: 46, trend: 4, status: 'warning', temp: 26.8, humidity: 76 },
  { id: 'C-01', crop: '玉米', risk: 22, trend: -2, status: 'healthy', temp: 25.9, humidity: 66 },
  { id: 'C-02', crop: '玉米', risk: 29, trend: 1, status: 'healthy', temp: 25.7, humidity: 70 },
]

const navItems = [
  { key: 'overview', label: '數字孿生', icon: Activity },
  { key: 'alerts', label: '預警中心', icon: ShieldCheck },
  { key: 'robot', label: '機器人', icon: Bot },
  { key: 'sensors', label: '感測網路', icon: Radio },
  { key: 'integration', label: '裝置接入', icon: PlugZap },
]

const missionItems = [
  { time: '10:42', title: 'B-01 精準噴灑', detail: '低劑量 18 ml · 回測中', state: 'running' },
  { time: '10:54', title: 'A-02 虫卵抓取', detail: 'SO-101 · 等待執行', state: 'waiting' },
  { time: '11:20', title: 'C 區例行巡檢', detail: '路線 1.2 km · 已排程', state: 'scheduled' },
]

function App() {
  const [activePanel, setActivePanel] = useState('overview')
  const [selectedZoneId, setSelectedZoneId] = useState('B-01')
  const [risk, setRisk] = useState(72)
  const [patrolling, setPatrolling] = useState(true)
  const [notice, setNotice] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const selectedZone = useMemo(() => zones.find((zone) => zone.id === selectedZoneId) || zones[0], [selectedZoneId])
  const sceneZones = useMemo(() => zones.map((zone) => zone.id === selectedZoneId ? { ...zone, risk } : zone), [selectedZoneId, risk])

  const selectZone = useCallback((zoneId) => {
    const zone = zones.find((item) => item.id === zoneId)
    if (!zone) return
    setSelectedZoneId(zoneId)
    setRisk(zone.risk)
  }, [])

  const showNotice = useCallback((message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3600)
  }, [])

  const riskState = useMemo(() => {
    if (risk < 30) return { key: 'healthy', label: '低風險', color: '#5f9b6c', action: '常規監測', icon: Activity }
    if (risk < 50) return { key: 'watch', label: '需關注', color: '#c5a542', action: '派車近距確認', icon: ScanLine }
    if (risk < 70) return { key: 'warning', label: '預警', color: '#db883f', action: '機械抓取或驅離', icon: Bot }
    return { key: 'danger', label: '高風險', color: '#d7654e', action: '執行精準施藥', icon: Droplets }
  }, [risk])

  const executeAction = () => {
    showNotice(`${selectedZoneId}：${riskState.action}任務已加入佇列`)
    if (risk >= 70) window.setTimeout(() => setRisk((value) => Math.max(0, value - 18)), 700)
  }

  return (
    <main className="control-app">
      <div className="control-motion-bg" aria-hidden="true"><i /><i /><i /></div>

      <header className="control-topbar">
        <div className="control-brand"><span><Leaf /></span><div><strong>智護田</strong><small>FIELDGUARD CONTROL</small></div></div>
        <nav className={mobileMenu ? 'control-nav open' : 'control-nav'} aria-label="控制台功能">
          {navItems.map((item) => (
            <button key={item.key} className={activePanel === item.key ? 'active' : ''} onClick={() => { setActivePanel(item.key); setMobileMenu(false) }}><item.icon />{item.label}{item.key === 'alerts' && <b>2</b>}</button>
          ))}
        </nav>
        <div className="control-top-actions">
          <span className="system-live"><i />全部系統在線</span>
          <button className="help-top-button" onClick={() => setHelpOpen(true)}><CircleHelp />功能說明</button>
          <button className="control-menu-button" onClick={() => setMobileMenu((value) => !value)} aria-label="開啟功能選單">{mobileMenu ? <X /> : <Menu />}</button>
        </div>
      </header>

      <div className="control-body">
        <aside className="zone-rail" aria-label="地塊切換">
          <span>地塊</span>
          {zones.map((zone) => <button key={zone.id} className={`${zone.status} ${selectedZoneId === zone.id ? 'active' : ''}`} onClick={() => selectZone(zone.id)}><strong>{zone.id}</strong><small>{zone.risk}</small></button>)}
          <i />
          <button className="rail-help" onClick={() => setHelpOpen(true)}><CircleHelp /><span>說明</span></button>
        </aside>

        <section className="control-workspace">
          {activePanel === 'overview' ? (
            <OverviewPanel
              now={now}
              selectedZone={selectedZone}
              selectedZoneId={selectedZoneId}
              risk={risk}
              setRisk={setRisk}
              riskState={riskState}
              sceneZones={sceneZones}
              selectZone={selectZone}
              patrolling={patrolling}
              setPatrolling={setPatrolling}
              executeAction={executeAction}
              showNotice={showNotice}
            />
          ) : (
            <DashboardPanels activePanel={activePanel} patrolling={patrolling} setPatrolling={setPatrolling} notify={showNotice} />
          )}
        </section>
      </div>

      {helpOpen && <FeatureDrawer onClose={() => setHelpOpen(false)} setActivePanel={setActivePanel} />}
      {notice && <div className="toast control-toast"><Check />{notice}</div>}
    </main>
  )
}

function OverviewPanel({ now, selectedZone, selectedZoneId, risk, setRisk, riskState, sceneZones, selectZone, patrolling, setPatrolling, executeAction, showNotice }) {
  const ActionIcon = riskState.icon
  return (
    <div className="twin-dashboard">
      <div className="workspace-commandbar">
        <div><span>REAL-TIME DIGITAL TWIN</span><h1>農田數字孿生控制台</h1><p>{now.toLocaleTimeString('zh-Hant', { hour12: false })} · 示範農場 · 6 個地塊 · 8 個設備在線</p></div>
        <div className="command-actions">
          <button className="control-3d neutral" onClick={() => showNotice('已生成今日巡檢與處置報告')}><Sparkles />AI 日報</button>
          <button className={`control-3d ${patrolling ? 'red' : 'green'}`} onClick={() => { setPatrolling((value) => !value); showNotice(patrolling ? '巡田任務已暫停' : '巡田任務已繼續') }}>{patrolling ? <Pause /> : <Play />}{patrolling ? '暫停巡田' : '繼續巡田'}</button>
        </div>
      </div>

      <div className="digital-twin-grid">
        <article className="twin-scene-card">
          <div className="scene-toolbar"><span><i />3D LIVE</span><p>拖動旋轉 · 滾輪縮放 · 點擊地塊</p><button onClick={() => showNotice('3D 視角已保持，拖動場景即可自由查看')}><Target />視角</button></div>
          <Suspense fallback={<div className="scene-loading"><Bot /><span>載入 3D 農田場景…</span></div>}>
            <FarmScene3D zones={sceneZones} selectedZoneId={selectedZoneId} patrolling={patrolling} onSelectZone={selectZone} />
          </Suspense>
          <div className="scene-status-strip">
            <div><span>選中地塊</span><strong>{selectedZoneId}</strong><small>{selectedZone.crop}</small></div>
            <div><span>巡田車</span><strong>FG-01</strong><small>{patrolling ? '自主巡航中' : '已暫停'}</small></div>
            <div><span>SO-101</span><strong>READY</strong><small>抓取策略 v1.4</small></div>
            <div><span>定位精度</span><strong>±4 cm</strong><small>RTK 正常</small></div>
          </div>
        </article>

        <aside className="decision-console">
          <div className="decision-head"><div><span>AI DECISION</span><h2>{selectedZoneId} 智能研判</h2></div><b className={riskState.key}>{riskState.label}</b></div>
          <div className="risk-orbit" style={{ '--risk': `${risk * 3.6}deg`, '--risk-color': riskState.color }}><div><strong>{risk}</strong><span>/100</span></div></div>
          <label className="risk-simulator"><span>風險模擬 <b>{risk}</b></span><input aria-label="調整風險模擬值" type="range" min="0" max="100" value={risk} onChange={(event) => setRisk(Number(event.target.value))} /></label>
          <div className="decision-factors">
            <Factor label="光譜異常" value={Math.min(100, risk + 12)} />
            <Factor label="病斑面積" value={Math.max(4, risk - 8)} />
            <Factor label="環境風險" value={selectedZone.humidity} />
            <Factor label="擴散速率" value={Math.max(8, risk - 18)} />
          </div>
          <div className="ai-explanation"><Sparkles /><p><strong>AI 解釋</strong><span>{risk >= 70 ? '近紅外反射下降且濕度持續偏高，病害風險快速上升。' : risk >= 30 ? '環境條件需關注，建議加密採樣並近距確認。' : '各項指標接近健康基線，維持常規監測。'}</span></p></div>
          <button className="decision-action-3d" onClick={executeAction}><ActionIcon />{riskState.action}<ArrowRight /></button>
        </aside>
      </div>

      <div className="twin-metrics">
        <article><span className="metric-symbol green"><Leaf /></span><p><small>作物健康度</small><strong>86.4%</strong><b>較昨日 +2.1%</b></p></article>
        <article><span className="metric-symbol amber"><AlertTriangle /></span><p><small>未處理預警</small><strong>2</strong><b>最高 B-01</b></p></article>
        <article><span className="metric-symbol blue"><Bot /></span><p><small>今日巡檢覆蓋</small><strong>78%</strong><b>2.8 / 3.6 ha</b></p></article>
        <article><span className="metric-symbol purple"><Droplets /></span><p><small>精準施藥節省</small><strong>64%</strong><b>較傳統全田噴灑</b></p></article>
        <article><span className="metric-symbol cyan"><CloudSun /></span><p><small>最佳作業窗口</small><strong>11:30</strong><b>未來 4 小時無雨</b></p></article>
      </div>

      <div className="operations-grid">
        <article className="ops-panel field-status-panel">
          <div className="ops-head"><div><strong>地塊狀態</strong><span>即時風險與微氣候</span></div><span className="live-mini"><i />5 秒更新</span></div>
          <div className="compact-zone-grid">{sceneZones.map((zone) => <button key={zone.id} className={`${zone.status} ${zone.id === selectedZoneId ? 'selected' : ''}`} onClick={() => selectZone(zone.id)}><span>{zone.id}<small>{zone.crop}</small></span><strong>{zone.risk}</strong><i><b style={{ width: `${zone.risk}%` }} /></i><em><Thermometer />{zone.temp}° <Droplets />{zone.humidity}%</em></button>)}</div>
        </article>

        <article className="ops-panel mission-panel">
          <div className="ops-head"><div><strong>任務佇列</strong><span>規則引擎自動排程</span></div><button onClick={() => showNotice('已建立新的巡檢任務')}><Zap />新增</button></div>
          <div className="mission-list">{missionItems.map((item) => <div key={item.time}><i className={item.state} /><time>{item.time}</time><p><strong>{item.title}</strong><small>{item.detail}</small></p><button onClick={() => showNotice(`${item.title} 詳情已載入`)}><ArrowRight /></button></div>)}</div>
        </article>

        <article className="ops-panel resource-panel">
          <div className="ops-head"><div><strong>資源與安全</strong><span>藥劑、電量與地理圍欄</span></div><ShieldCheck /></div>
          <div className="resource-list">
            <div><Droplets /><span><small>藥劑餘量</small><strong>6.8 L</strong></span><i><b style={{ width: '68%' }} /></i></div>
            <div><Gauge /><span><small>巡田車電量</small><strong>78%</strong></span><i><b style={{ width: '78%' }} /></i></div>
            <div><Wifi /><span><small>邊緣節點</small><strong>在線</strong></span><em>12 ms</em></div>
            <div><Volume2 /><span><small>聲光驅離</small><strong>待機</strong></span><em>安全</em></div>
          </div>
          <button className="geofence-button" onClick={() => showNotice('地理圍欄正常：水源區與人員通道已禁止噴藥')}><ShieldCheck />地理圍欄已啟用 <span>2 個禁噴區</span></button>
        </article>
      </div>
    </div>
  )
}

function Factor({ label, value }) {
  return <div><span>{label}</span><i><b style={{ width: `${value}%` }} /></i><strong>{value}</strong></div>
}

function FeatureDrawer({ onClose, setActivePanel }) {
  const openPanel = (key) => { setActivePanel(key); onClose() }
  return (
    <div className="feature-drawer-backdrop" role="dialog" aria-modal="true" aria-label="功能說明">
      <aside className="feature-drawer">
        <div className="drawer-head"><div><span>CONTROL GUIDE</span><h2>功能說明</h2></div><button onClick={onClose} aria-label="關閉功能說明"><X /></button></div>
        <p className="drawer-intro">控制台整合即時地圖、規則預警、遠端控制、作業排程、數字孿生與設備管理。</p>
        <div className="feature-links">
          <button onClick={() => openPanel('overview')}><Activity /><span><strong>3D 數字孿生</strong><small>旋轉、縮放並點選地塊，追蹤機器人巡航。</small></span><ArrowRight /></button>
          <button onClick={() => openPanel('alerts')}><ShieldCheck /><span><strong>規則預警</strong><small>依風險分級確認、處置與保留審計記錄。</small></span><ArrowRight /></button>
          <button onClick={() => openPanel('robot')}><Bot /><span><strong>遠端控制</strong><small>任務控制、人工接管、路線重規劃與急停。</small></span><ArrowRight /></button>
          <button onClick={() => openPanel('sensors')}><Radio /><span><strong>感測網路</strong><small>設備健康度、訊號、資料流和校準維護。</small></span><ArrowRight /></button>
          <button onClick={() => openPanel('integration')}><PlugZap /><span><strong>裝置接入</strong><small>MQTT、HTTP API、設備 ID 與部署拓撲。</small></span><ArrowRight /></button>
        </div>
        <div className="learned-features"><strong>新增的農場管理能力</strong><div><span>作業排程</span><span>農事記錄</span><span>地理圍欄</span><span>藥劑庫存</span><span>天氣窗口</span><span>AI 可解釋性</span></div></div>
        <div className="drawer-note"><ShieldCheck /><p><strong>安全原则</strong><span>喷药指令必须经过剂量上限、禁喷区与急停检查；Token 由后端环境变量保存。</span></p></div>
      </aside>
    </div>
  )
}

export default App
