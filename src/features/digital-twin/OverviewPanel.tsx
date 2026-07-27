import { useMemo, useState, useEffect, memo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  CloudSun,
  Droplets,
  Gauge,
  Leaf,
  Pause,
  Play,
  ScanLine,
  Sparkles,
  Thermometer,
  Volume2,
  Wifi,
  Zap,
  ShieldCheck,
} from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { zones, missions } from '@/lib/mock-data'
import FarmScene3D from './FarmScene3D'

export default function OverviewPanel() {
  const { t } = useTranslation()
  const selectedZoneId = useAppStore((s) => s.selectedZoneId)
  const risk = useAppStore((s) => s.risk)
  const patrolling = useAppStore((s) => s.patrolling)
  const togglePatrolling = useAppStore((s) => s.togglePatrolling)
  const showNotice = useAppStore((s) => s.showNotice)
  const selectZone = useAppStore((s) => s.setSelectedZoneId)

  const sceneZones = useMemo(
    () => zones.map((z) => (z.id === selectedZoneId ? { ...z, risk } : z)),
    [selectedZoneId, risk],
  )

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Command bar */}
      <div className="min-h-[90px] flex justify-between items-center gap-6 mb-5 max-[620px]:flex-col max-[620px]:items-start">
        <div>
          <span className="font-mono text-[11px] text-[#5f8f6b] tracking-[0.15em]">
            {t('rtDigitalTwin')}
          </span>
          <h1 className="my-1 text-[38px] leading-tight tracking-[-0.055em] font-heading max-[620px]:text-[32px] text-ink">
            {t('dashboardTitle')}
          </h1>
          <p className="text-sm text-[#7c8c85]">
            <ClockDisplay /> · {t('dashboardSub')}
          </p>
        </div>
        <div className="flex gap-3 max-[620px]:w-full">
          <button
            onClick={() => showNotice(t('reportGenerated'))}
            className="min-w-[136px] h-12 px-[18px] rounded-lg bg-[#edf0ea] text-[#315b4c] flex items-center justify-center gap-2 text-[13px] font-bold font-ui hover:-translate-y-0.5 active:translate-y-1"
          >
            <Sparkles className="w-[18px]" />
            {t('aiReport')}
          </button>
          <button
            onClick={() => { togglePatrolling(); showNotice(patrolling ? t('patrolPaused') : t('patrolResumed')) }}
            className={`min-w-[136px] h-12 px-[18px] rounded-lg flex items-center justify-center gap-2 text-[13px] font-bold font-ui hover:-translate-y-0.5 active:translate-y-1
              ${patrolling ? 'bg-[#d56552] text-white' : 'bg-[#376d52] text-white'}`}
          >
            {patrolling ? <Pause className="w-[18px]" /> : <Play className="w-[18px]" />}
            {patrolling ? t('pausePatrol') : t('resumePatrol')}
          </button>
        </div>
      </div>

      {/* 3D 场景 + AI 研判 */}
      <div className="grid gap-[18px] grid-cols-[1fr_370px] max-[900px]:grid-cols-1">
        <article className="relative overflow-hidden rounded-xl border border-[#c5cfc5] bg-black shadow-lg" style={{ minHeight: '520px' }}>
          <FarmScene3D />
        </article>
        <DecisionSidebar t={t} risk={risk} setRisk={setRisk} selectedZoneId={selectedZoneId} showNotice={showNotice} />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-5 gap-3.5 my-[22px] max-[1180px]:grid-cols-3 max-[620px]:grid-cols-2">
        <MetricCard icon={Leaf} color="bg-[#e4eee1] text-[#508461]" label={t('cropHealth')} value="86.4%" sub={`${t('vsYesterday')} +2.1%`} />
        <MetricCard icon={AlertTriangle} color="bg-[#f2ead6] text-[#aa7a2c]" label={t('unprocessedAlerts')} value="2" sub={`${t('highest')} B-01`} />
        <MetricCard icon={Bot} color="bg-[#e0ebef] text-[#4c7997]" label={t('todayCoverage')} value="78%" sub="2.8 / 3.6 ha" />
        <MetricCard icon={Droplets} color="bg-[#eae6ef] text-[#725f94]" label={t('preciseSpraySave')} value="64%" sub={t('vsTradSpray')} />
        <MetricCard icon={CloudSun} color="bg-[#e0edeb] text-[#4d817a]" label={t('bestWindow')} value="11:30" sub={t('noRain4h')} />
      </div>

      {/* Operations grid */}
      <div className="grid gap-4 grid-cols-[1.15fr_1fr_0.9fr] max-[1180px]:grid-cols-2 max-[620px]:grid-cols-1">
        <PlotStatusPanel zones={sceneZones} selectedZoneId={selectedZoneId} selectZone={selectZone} t={t} />
        <MissionQueuePanel t={t} showNotice={showNotice} />
        <ResourcePanel t={t} showNotice={showNotice} />
      </div>
    </div>
  )
}

// ═══ AI 研判侧边栏 ═══
function DecisionSidebar({ t, risk, setRisk, selectedZoneId, showNotice }: {
  t: (k: string) => string; risk: number; setRisk: (v: number) => void
  selectedZoneId: string; showNotice: (m: string) => void
}) {
  const { icon: Icon, label, color, action } = useMemo(() => {
    if (risk < 30) return { icon: Activity, label: t('lowRisk'), color: '#5f9b6c', action: t('regularMonitor') }
    if (risk < 50) return { icon: ScanLine, label: t('needAttention'), color: '#c5a542', action: t('sendCarCheck') }
    if (risk < 70) return { icon: Bot, label: t('warning'), color: '#db883f', action: t('mechGrasp') }
    return { icon: Droplets, label: t('highRisk'), color: '#d7654e', action: t('preciseSpray') }
  }, [risk, t])

  const executeAction = () => {
    showNotice(`${selectedZoneId}：${action}${t('taskAdded')}`)
    if (risk >= 70) setTimeout(() => setRisk(Math.max(0, risk - 18)), 700)
  }

  const zone = zones.find(z => z.id === selectedZoneId) ?? zones[0]

  return (
    <aside className="p-5 border border-[#d8ded6] rounded-xl bg-[#fafaf6] shadow-[0_4px_0_#d8ddd6] flex flex-col gap-3 max-[900px]:min-h-0">
      <div className="flex justify-between items-start">
        <div><span className="font-mono text-[10px] text-[#699174] tracking-[0.13em]">{t('aiDecision')}</span>
          <h2 className="mt-1 text-[22px] font-heading text-ink">{selectedZoneId} {t('intelligentAssessment')}</h2>
        </div>
        <b className="py-1.5 px-3 rounded-[13px] text-xs font-bold" style={{ background: `${color}18`, color }}>{label}</b>
      </div>

      {/* Risk gauge */}
      <div className="w-[120px] h-[120px] mx-auto border-[10px] rounded-full grid place-items-center" style={{ borderColor: color, boxShadow: `inset 0 0 0 8px #edf0ea` }}>
        <div><strong className="font-mono text-[34px]">{risk}</strong><span className="font-mono text-[10px] text-[#8b9691]">/100</span></div>
      </div>

      {/* Slider */}
      <label><span className="flex justify-between text-xs text-[#667970]">{t('riskSim')} <b className="font-mono">{risk}</b></span>
        <input type="range" min="0" max="100" value={risk} onChange={e => setRisk(Number(e.target.value))} className="w-full cursor-pointer" style={{ accentColor: color }} />
      </label>

      {/* Factors */}
      <div className="grid gap-2">
        {[
          [t('spectralAnomaly'), Math.min(100, risk + 12)],
          [t('diseaseArea'), Math.max(4, risk - 8)],
          [t('envRisk'), zone.humidity],
          [t('spreadRate'), Math.max(8, risk - 18)],
        ].map(([l, v]) => (
          <div key={l as string} className="grid grid-cols-[68px_1fr_26px] items-center gap-2">
            <span className="text-xs text-[#6b7b74]">{l as string}</span>
            <i className="h-[5px] bg-[#e7eae4] rounded-full overflow-hidden"><b className="block h-full bg-[#6a9673]" style={{ width: `${v}%` }} /></i>
            <strong className="text-right font-mono text-xs">{v as number}</strong>
          </div>
        ))}
      </div>

      {/* AI explanation */}
      <div className="flex gap-2 p-3 bg-[#edf2e7] border-l-[3px] border-[#8eab5b] rounded-md text-xs">
        <Sparkles className="w-[16px] text-[#638d53] flex-none mt-0.5" />
        <p className="m-0"><strong>{t('aiExplain')}</strong><br />
          <span className="text-[#66786f]">{risk >= 70 ? t('explainHigh') : risk >= 30 ? t('explainMid') : t('explainLow')}</span>
        </p>
      </div>

      {/* Action button */}
      <button onClick={executeAction} className="w-full h-11 border-0 rounded-lg bg-[#1f4b3b] text-white flex items-center justify-center gap-2 text-sm font-bold font-ui hover:-translate-y-0.5 active:translate-y-0.5">
        <Icon className="w-[16px]" />{action}<ArrowRight className="w-[16px] ml-auto mr-2" />
      </button>
    </aside>
  )
}

// ═══ 时钟 (独立组件, 避免每秒全页重渲染) ═══
const ClockDisplay = memo(function ClockDisplay() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return <>{now.toLocaleTimeString('zh-TW', { hour12: false })}</>
})

// ═══ MetricCard ═══
function MetricCard({ icon: Icon, color, label, value, sub }: {
  icon: typeof Leaf; color: string; label: string; value: string; sub: string
}) {
  return (
    <article className="min-h-[100px] p-[18px] border border-[#dce1da] rounded-[10px] bg-[#fafaf7] flex items-center gap-3.5 shadow-[0_4px_0_#d8ddd6]">
      <span className={`w-11 h-11 rounded-md grid place-items-center flex-none ${color}`}><Icon className="w-[22px]" /></span>
      <p className="m-0 flex flex-col min-w-0">
        <small className="text-[10px] text-[#87928d]">{label}</small>
        <strong className="font-mono text-2xl my-1 text-ink">{value}</strong>
        <b className="text-[#5d8b69] text-[10px] font-medium">{sub}</b>
      </p>
    </article>
  )
}

// ═══ PlotStatusPanel ═══
function PlotStatusPanel({ zones, selectedZoneId, selectZone, t }: {
  zones: (import('@/types').Zone & { risk: number })[]
  selectedZoneId: string; selectZone: (id: string) => void; t: (key: string) => string
}) {
  return (
    <article className="min-h-[310px] border border-[#dce1da] rounded-[11px] bg-[#fafaf7] overflow-hidden shadow-[0_4px_0_#d8ddd6]">
      <div className="min-h-[62px] p-[15px_18px] border-b border-[#e4e7e1] flex items-center justify-between">
        <div className="flex flex-col">
          <strong className="text-base font-ui text-ink">{t('plotStatus')}</strong>
          <span className="text-[#89948f] text-[11px] mt-1">{t('realtimeRisk')}</span>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] text-[#6b7e76]">
          <i className="w-[7px] h-[7px] rounded-full bg-[#63a972]" />5{t('secUpdate')}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 p-3.5 max-[620px]:grid-cols-1">
        {zones.map((zone) => {
          const isSel = zone.id === selectedZoneId
          const barColor = zone.status === 'danger' ? '#d86e55' : zone.status === 'warning' ? '#d59a49' : '#6a9974'
          return (
            <button key={zone.id} onClick={() => selectZone(zone.id)}
              className={`min-h-[100px] p-3 border border-[#dce2d9] border-b-[3px] border-[#c6cec5] rounded-lg bg-[#f3f5ef] text-left grid grid-cols-[1fr_auto] grid-rows-[auto_8px_auto] gap-x-2.5 gap-y-2
                ${isSel ? '!border-[#7da05f] shadow-[0_0_0_2px_rgba(125,160,95,0.16)]' : ''} active:translate-y-0.5 active:border-b`}
            >
              <span className="flex flex-col font-mono text-xs text-ink">{zone.id}<small className="font-body text-[10px] text-[#7d8984]">{zone.crop}</small></span>
              <strong className="font-mono text-2xl text-ink">{zone.risk}</strong>
              <i className="col-span-2 bg-[#e0e5dc] rounded-md overflow-hidden"><b className="block h-full transition-[width_0.3s]" style={{ width: `${zone.risk}%`, background: barColor }} /></i>
              <em className="col-span-2 flex items-center gap-1.5 text-[#718078] font-mono text-[10px] not-italic"><Thermometer className="w-[13px]" />{zone.temp}° <Droplets className="w-[13px]" />{zone.humidity}%</em>
            </button>
          )
        })}
      </div>
    </article>
  )
}

// ═══ MissionQueuePanel ═══
function MissionQueuePanel({ t, showNotice }: { t: (key: string) => string; showNotice: (msg: string) => void }) {
  return (
    <article className="min-h-[310px] border border-[#dce1da] rounded-[11px] bg-[#fafaf7] overflow-hidden shadow-[0_4px_0_#d8ddd6]">
      <div className="min-h-[62px] p-[15px_18px] border-b border-[#e4e7e1] flex items-center justify-between">
        <div className="flex flex-col"><strong className="text-base font-ui text-ink">{t('missionQueue')}</strong><span className="text-[#89948f] text-[11px] mt-1">{t('ruleEngine')}</span></div>
        <button onClick={() => showNotice(t('taskAdded'))} className="py-1.5 px-3 rounded-md bg-[#e9eee6] text-[#4c725f] flex items-center gap-1.5 text-xs font-ui active:translate-y-0.5"><Zap className="w-[15px]" />{t('addNew')}</button>
      </div>
      <div>
        {missions.map((item) => {
          const dot = item.state === 'running' ? 'bg-[#66a774] shadow-[0_0_0_7px_rgba(102,167,116,0.1)]' : item.state === 'waiting' ? 'bg-[#d69c46]' : 'bg-[#adb8b0]'
          return (
            <div key={item.time} className="min-h-[80px] p-3 px-4 grid grid-cols-[10px_42px_1fr_30px] items-center gap-2.5 border-b border-[#e8e9e5] last:border-0">
              <i className={`w-[9px] h-[9px] rounded-full ${dot}`} />
              <time className="font-mono text-xs text-[#72827a]">{item.time}</time>
              <p className="m-0 flex flex-col"><strong className="text-[13px] text-ink">{t(item.titleKey)}</strong><small className="text-[10px] text-[#89948f] mt-1">{t(item.detailKey)}</small></p>
              <button onClick={() => showNotice(t(item.titleKey))} className="w-[30px] h-[30px] border-0 rounded-full bg-[#edf0eb] text-[#587465] grid place-items-center"><ArrowRight className="w-3.5" /></button>
            </div>
          )
        })}
      </div>
    </article>
  )
}

// ═══ ResourcePanel ═══
function ResourcePanel({ t, showNotice }: { t: (key: string) => string; showNotice: (msg: string) => void }) {
  return (
    <article className="min-h-[310px] border border-[#dce1da] rounded-[11px] bg-[#fafaf7] overflow-hidden shadow-[0_4px_0_#d8ddd6]">
      <div className="min-h-[62px] p-[15px_18px] border-b border-[#e4e7e1] flex items-center justify-between">
        <div className="flex flex-col"><strong className="text-base font-ui text-ink">{t('resourceSafety')}</strong><span className="text-[#89948f] text-[11px] mt-1">{t('chemicalPowerGeo')}</span></div>
        <ShieldCheck className="w-[22px] text-[#5e8b69]" />
      </div>
      <div className="p-3 px-4">
        {[
          { icon: Droplets, label: t('chemicalsRemaining'), value: '6.8 L', pct: 68, extra: null as string | null },
          { icon: Gauge, label: t('patrolBattery'), value: '78%', pct: 78, extra: null },
          { icon: Wifi, label: t('edgeNode'), value: t('onlineStatus'), pct: 100, extra: '12 ms' },
          { icon: Volume2, label: t('soundLightRepel'), value: t('standby'), pct: 0, extra: t('standby') },
        ].map((r, i) => (
          <div key={i} className="min-h-[52px] grid grid-cols-[32px_90px_1fr] items-center gap-2.5 border-b border-[#e8eae5] py-1 last:border-0">
            <r.icon className="w-[18px] text-[#61836d]" />
            <span className="flex flex-col"><small className="text-[10px] text-[#8b9691]">{r.label}</small><strong className="font-mono text-[13px] text-ink">{r.value}</strong></span>
            {r.extra ? (
              <em className="text-right font-mono text-xs text-[#5d8c68] not-italic">{r.extra}</em>
            ) : (
              <i className="h-[7px] bg-[#e5e8e2] rounded-md overflow-hidden"><b className="block h-full bg-[#6b9874]" style={{ width: `${r.pct}%` }} /></i>
            )}
          </div>
        ))}
      </div>
      <button onClick={() => showNotice(t('geofenceEnabled'))} className="mx-4 mt-2 mb-3 w-[calc(100%-32px)] min-h-[42px] border border-[#d7dfd5] rounded-md bg-[#edf2e9] text-[#416b56] flex items-center gap-2 px-3 text-xs font-ui active:translate-y-0.5">
        <ShieldCheck className="w-4" />{t('geofenceEnabled')}<span className="ml-auto font-mono text-[10px]">2 {t('noSprayZones')}</span>
      </button>
    </article>
  )
}
