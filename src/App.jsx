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
import { I18nProvider, useI18n, LANGUAGES } from './i18n'
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

const missionItems = [
  { time: '10:42', titleKey: 'b01Spray', detailKey: 'b01SprayDetail', state: 'running' },
  { time: '10:54', titleKey: 'a02Grasp', detailKey: 'a02GraspDetail', state: 'waiting' },
  { time: '11:20', titleKey: 'cRoute', detailKey: 'cRouteDetail', state: 'scheduled' },
]

function AppContent() {
  const { t, lang, setLanguage } = useI18n()

  const navItems = useMemo(() => [
    { key: 'overview', label: t('nav1'), icon: Activity },
    { key: 'alerts', label: t('nav2'), icon: ShieldCheck },
    { key: 'robot', label: t('nav3'), icon: Bot },
    { key: 'sensors', label: t('nav4'), icon: Radio },
    { key: 'integration', label: t('nav5'), icon: PlugZap },
  ], [t])

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
    if (risk < 30) return { key: 'healthy', label: t('lowRisk'), color: '#5f9b6c', action: t('regularMonitor'), icon: Activity }
    if (risk < 50) return { key: 'watch', label: t('needAttention'), color: '#c5a542', action: t('sendCarCheck'), icon: ScanLine }
    if (risk < 70) return { key: 'warning', label: t('warning'), color: '#db883f', action: t('mechGrasp'), icon: Bot }
    return { key: 'danger', label: t('highRisk'), color: '#d7654e', action: t('preciseSpray'), icon: Droplets }
  }, [risk, t])

  const dashboardSubText = useMemo(() => {
    return t('dashboardSub')
  }, [t])

  const executeAction = () => {
    showNotice(`${selectedZoneId}：${riskState.action}${t('taskAdded')}`)
    if (risk >= 70) window.setTimeout(() => setRisk((value) => Math.max(0, value - 18)), 700)
  }

  const timeStr = now.toLocaleTimeString(lang === 'en' ? 'en-US' : lang === 'zh-CN' ? 'zh-CN' : 'zh-TW', { hour12: false })

  return (
    <main className="control-app">
      <div className="control-motion-bg" aria-hidden="true"><i /><i /><i /></div>

      <header className="control-topbar">
        <div className="control-brand">
          <span><Leaf /></span>
          <div><strong>{t('brand')}</strong><small>{t('brandSub')}</small></div>
        </div>
        <nav className={mobileMenu ? 'control-nav open' : 'control-nav'} aria-label="控制台功能">
          {navItems.map((item) => (
            <button key={item.key} className={activePanel === item.key ? 'active' : ''} onClick={() => { setActivePanel(item.key); setMobileMenu(false) }}>
              <item.icon />{item.label}{item.key === 'alerts' && <b>2</b>}
            </button>
          ))}
        </nav>
        <div className="control-top-actions">
          <div className="lang-switcher-top">
            {Object.entries(LANGUAGES).map(([code, info]) => (
              <button key={code} className={lang === code ? 'active' : ''} onClick={() => setLanguage(code)} title={info.name}>
                {info.label}
              </button>
            ))}
          </div>
          <span className="system-live"><i />{t('systemOnline')}</span>
          <button className="help-top-button" onClick={() => setHelpOpen(true)}><CircleHelp />{t('help')}</button>
          <button className="control-menu-button" onClick={() => setMobileMenu((value) => !value)} aria-label="開啟功能選單">{mobileMenu ? <X /> : <Menu />}</button>
        </div>
      </header>

      <div className="control-body">
        <aside className="zone-rail" aria-label="地塊切換">
          <span>{t('selectedPlot')}</span>
          {zones.map((zone) => <button key={zone.id} className={`${zone.status} ${selectedZoneId === zone.id ? 'active' : ''}`} onClick={() => selectZone(zone.id)}><strong>{zone.id}</strong><small>{zone.risk}</small></button>)}
          <i />
          <button className="rail-help" onClick={() => setHelpOpen(true)}><CircleHelp /><span>{t('help')}</span></button>
        </aside>

        <section className="control-workspace">
          {activePanel === 'overview' ? (
            <OverviewPanel
              now={now}
              timeStr={timeStr}
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
              t={t}
            />
          ) : (
            <DashboardPanels activePanel={activePanel} patrolling={patrolling} setPatrolling={setPatrolling} notify={showNotice} t={t} />
          )}
        </section>
      </div>

      {helpOpen && <FeatureDrawer onClose={() => setHelpOpen(false)} setActivePanel={setActivePanel} t={t} />}
      {notice && <div className="toast control-toast"><Check />{notice}</div>}
    </main>
  )
}

function OverviewPanel({ now, timeStr, selectedZone, selectedZoneId, risk, setRisk, riskState, sceneZones, selectZone, patrolling, setPatrolling, executeAction, showNotice, t }) {
  const ActionIcon = riskState.icon
  return (
    <div className="twin-dashboard">
      <div className="workspace-commandbar">
        <div><span>{t('rtDigitalTwin')}</span><h1>{t('dashboardTitle')}</h1><p>{timeStr} · {t('dashboardSub')}</p></div>
        <div className="command-actions">
          <button className="control-3d neutral" onClick={() => showNotice(t('reportGenerated'))}><Sparkles />{t('aiReport')}</button>
          <button className={`control-3d ${patrolling ? 'red' : 'green'}`} onClick={() => { setPatrolling((value) => !value); showNotice(patrolling ? t('patrolPaused') : t('patrolResumed')) }}>
            {patrolling ? <Pause /> : <Play />}{patrolling ? t('pausePatrol') : t('resumePatrol')}
          </button>
        </div>
      </div>

      <div className="digital-twin-grid">
        <article className="twin-scene-card">
          <div className="scene-toolbar"><span><i />3D LIVE</span><p>{t('dragRotate')}</p><button onClick={() => showNotice('3D ' + t('viewAngle'))}><Target />{t('viewAngle')}</button></div>
          <Suspense fallback={<div className="scene-loading"><Bot /><span>{t('load3D')}</span></div>}>
            <FarmScene3D zones={sceneZones} selectedZoneId={selectedZoneId} patrolling={patrolling} onSelectZone={selectZone} />
          </Suspense>
          <div className="scene-status-strip">
            <div><span>{t('selectedPlot')}</span><strong>{selectedZoneId}</strong><small>{selectedZone.crop}</small></div>
            <div><span>{t('patrolC')}</span><strong>FG-01</strong><small>{patrolling ? t('autoCruising') : t('paused')}</small></div>
            <div><span>SO-101</span><strong>READY</strong><small>{t('graspStrategy')}</small></div>
            <div><span>{t('posPrecision')}</span><strong>±4 cm</strong><small>{t('rtkNormal')}</small></div>
          </div>
        </article>

        <aside className="decision-console">
          <div className="decision-head"><div><span>{t('aiDecision')}</span><h2>{selectedZoneId} {t('intelligentAssessment')}</h2></div><b className={riskState.key}>{riskState.label}</b></div>
          <div className="risk-orbit" style={{ '--risk': `${risk * 3.6}deg`, '--risk-color': riskState.color }}><div><strong>{risk}</strong><span>/100</span></div></div>
          <label className="risk-simulator"><span>{t('riskSim')} <b>{risk}</b></span><input aria-label="調整風險模擬值" type="range" min="0" max="100" value={risk} onChange={(event) => setRisk(Number(event.target.value))} /></label>
          <div className="decision-factors">
            <Factor label={t('spectralAnomaly')} value={Math.min(100, risk + 12)} />
            <Factor label={t('diseaseArea')} value={Math.max(4, risk - 8)} />
            <Factor label={t('envRisk')} value={selectedZone.humidity} />
            <Factor label={t('spreadRate')} value={Math.max(8, risk - 18)} />
          </div>
          <div className="ai-explanation"><Sparkles /><p><strong>{t('aiExplain')}</strong><span>{risk >= 70 ? t('explainHigh') : risk >= 30 ? t('explainMid') : t('explainLow')}</span></p></div>
          <button className="decision-action-3d" onClick={executeAction}><ActionIcon />{riskState.action}<ArrowRight /></button>
        </aside>
      </div>

      <div className="twin-metrics">
        <article><span className="metric-symbol green"><Leaf /></span><p><small>{t('cropHealth')}</small><strong>86.4%</strong><b>{t('vsYesterday')} +2.1%</b></p></article>
        <article><span className="metric-symbol amber"><AlertTriangle /></span><p><small>{t('unprocessedAlerts')}</small><strong>2</strong><b>{t('highest')} B-01</b></p></article>
        <article><span className="metric-symbol blue"><Bot /></span><p><small>{t('todayCoverage')}</small><strong>78%</strong><b>2.8 / 3.6 ha</b></p></article>
        <article><span className="metric-symbol purple"><Droplets /></span><p><small>{t('preciseSpraySave')}</small><strong>64%</strong><b>{t('vsTradSpray')}</b></p></article>
        <article><span className="metric-symbol cyan"><CloudSun /></span><p><small>{t('bestWindow')}</small><strong>11:30</strong><b>{t('noRain4h')}</b></p></article>
      </div>

      <div className="operations-grid">
        <article className="ops-panel field-status-panel">
          <div className="ops-head"><div><strong>{t('plotStatus')}</strong><span>{t('realtimeRisk')}</span></div><span className="live-mini"><i />5{t('secUpdate')}</span></div>
          <div className="compact-zone-grid">{sceneZones.map((zone) => <button key={zone.id} className={`${zone.status} ${zone.id === selectedZoneId ? 'selected' : ''}`} onClick={() => selectZone(zone.id)}><span>{zone.id}<small>{zone.crop}</small></span><strong>{zone.risk}</strong><i><b style={{ width: `${zone.risk}%` }} /></i><em><Thermometer />{zone.temp}° <Droplets />{zone.humidity}%</em></button>)}</div>
        </article>

        <article className="ops-panel mission-panel">
          <div className="ops-head"><div><strong>{t('missionQueue')}</strong><span>{t('ruleEngine')}</span></div><button onClick={() => showNotice(t('taskAdded'))}><Zap />{t('addNew')}</button></div>
          <div className="mission-list">
            {missionItems.map((item) => (
              <div key={item.time}><i className={item.state} /><time>{item.time}</time><p><strong>{t(item.titleKey)}</strong><small>{t(item.detailKey)}</small></p><button onClick={() => showNotice(`${t(item.titleKey)}`)}><ArrowRight /></button></div>
            ))}
          </div>
        </article>

        <article className="ops-panel resource-panel">
          <div className="ops-head"><div><strong>{t('resourceSafety')}</strong><span>{t('chemicalPowerGeo')}</span></div><ShieldCheck /></div>
          <div className="resource-list">
            <div><Droplets /><span><small>{t('chemicalsRemaining')}</small><strong>6.8 L</strong></span><i><b style={{ width: '68%' }} /></i></div>
            <div><Gauge /><span><small>{t('patrolBattery')}</small><strong>78%</strong></span><i><b style={{ width: '78%' }} /></i></div>
            <div><Wifi /><span><small>{t('edgeNode')}</small><strong>{t('onlineStatus')}</strong></span><em>12 ms</em></div>
            <div><Volume2 /><span><small>{t('soundLightRepel')}</small><strong>{t('standby')}</strong></span><em>{t('standby')}</em></div>
          </div>
          <button className="geofence-button" onClick={() => showNotice(t('geofenceEnabled'))}><ShieldCheck />{t('geofenceEnabled')} <span>2 {t('noSprayZones')}</span></button>
        </article>
      </div>
    </div>
  )
}

function Factor({ label, value }) {
  return <div><span>{label}</span><i><b style={{ width: `${value}%` }} /></i><strong>{value}</strong></div>
}

function FeatureDrawer({ onClose, setActivePanel, t }) {
  const openPanel = (key) => { setActivePanel(key); onClose() }
  return (
    <div className="feature-drawer-backdrop" role="dialog" aria-modal="true" aria-label={t('featureGuide')}>
      <aside className="feature-drawer">
        <div className="drawer-head"><div><span>{t('controlGuide')}</span><h2>{t('featureGuide')}</h2></div><button onClick={onClose} aria-label="close"><X /></button></div>
        <p className="drawer-intro">{t('guideIntro')}</p>
        <div className="feature-links">
          <button onClick={() => openPanel('overview')}><Activity /><span><strong>{t('twin3d')}</strong><small>{t('twin3dDesc')}</small></span><ArrowRight /></button>
          <button onClick={() => openPanel('alerts')}><ShieldCheck /><span><strong>{t('ruleAlert')}</strong><small>{t('ruleAlertDesc')}</small></span><ArrowRight /></button>
          <button onClick={() => openPanel('robot')}><Bot /><span><strong>{t('remoteControl')}</strong><small>{t('remoteControlDesc')}</small></span><ArrowRight /></button>
          <button onClick={() => openPanel('sensors')}><Radio /><span><strong>{t('sensorNetwork')}</strong><small>{t('sensorNetworkDesc')}</small></span><ArrowRight /></button>
          <button onClick={() => openPanel('integration')}><PlugZap /><span><strong>{t('deviceAccess')}</strong><small>{t('deviceAccessDesc')}</small></span><ArrowRight /></button>
        </div>
        <div className="learned-features"><strong>{t('newFeatures')}</strong><div>{t('featureTags').map ? t('featureTags').map((tag, i) => <span key={i}>{tag}</span>) : []}</div></div>
        <div className="drawer-note"><ShieldCheck /><p><strong>{t('safetyPrinciple')}</strong><span>{t('safetyDesc')}</span></p></div>
      </aside>
    </div>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  )
}
