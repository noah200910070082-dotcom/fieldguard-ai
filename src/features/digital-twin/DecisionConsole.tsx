import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Activity,
  ArrowRight,
  Bot,
  Droplets,
  ScanLine,
  Sparkles,
} from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { zones } from '@/lib/mock-data'
import type { RiskState } from '@/types'
import Factor from '@/components/shared/Factor'

const riskIcons: Record<RiskState['key'], typeof Activity> = {
  healthy: Activity,
  watch: ScanLine,
  warning: Bot,
  danger: Droplets,
}

export default function DecisionConsole() {
  const { t } = useTranslation()
  const selectedZoneId = useAppStore((s) => s.selectedZoneId)
  const risk = useAppStore((s) => s.risk)
  const setRisk = useAppStore((s) => s.setRisk)
  const showNotice = useAppStore((s) => s.showNotice)

  const zone = useMemo(
    () => zones.find((z) => z.id === selectedZoneId) ?? zones[0],
    [selectedZoneId],
  )

  const riskState = useMemo<RiskState>(() => {
    if (risk < 30)
      return {
        key: 'healthy',
        label: t('lowRisk'),
        color: '#5f9b6c',
        action: t('regularMonitor'),
        icon: 'Activity',
      }
    if (risk < 50)
      return {
        key: 'watch',
        label: t('needAttention'),
        color: '#c5a542',
        action: t('sendCarCheck'),
        icon: 'ScanLine',
      }
    if (risk < 70)
      return {
        key: 'warning',
        label: t('warning'),
        color: '#db883f',
        action: t('mechGrasp'),
        icon: 'Bot',
      }
    return {
      key: 'danger',
      label: t('highRisk'),
      color: '#d7654e',
      action: t('preciseSpray'),
      icon: 'Droplets',
    }
  }, [risk, t])

  const ActionIcon = riskIcons[riskState.key]

  const executeAction = () => {
    showNotice(`${selectedZoneId}：${riskState.action}${t('taskAdded')}`)
    if (risk >= 70) setTimeout(() => setRisk(Math.max(0, risk - 18)), 700)
  }

  return (
    <aside className="min-h-[560px] p-[22px] border border-[#d8ded6] rounded-xl bg-paper shadow-[0_8px_0_#d8ddd6,0_20px_40px_rgba(24,55,46,0.09)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <span className="font-mono text-[10px] text-[#699174] tracking-[0.13em]">
            {t('aiDecision')}
          </span>
          <h2 className="mt-1.5 text-[26px] font-heading">
            {selectedZoneId} {t('intelligentAssessment')}
          </h2>
        </div>
        <b
          className={`py-1.5 px-3 rounded-[13px] text-xs font-bold`}
          style={{ backgroundColor: `${riskState.color}18`, color: riskState.color }}
        >
          {riskState.label}
        </b>
      </div>

      {/* Risk gauge */}
      <div
        className="w-[160px] h-[160px] mx-auto my-[26px] border-[13px] rounded-full grid place-items-center relative"
        style={{
          borderColor: riskState.color,
          boxShadow: `inset 0 0 0 10px #edf0ea, 0 10px 20px rgba(24,55,46,0.1)`,
        }}
      >
        <div className="flex items-baseline">
          <strong className="font-mono text-[44px]">{risk}</strong>
          <span className="font-mono text-xs text-[#8b9691]">/100</span>
        </div>
      </div>

      {/* Risk slider */}
      <label className="block">
        <span className="flex justify-between text-[#667970] text-xs mb-1">
          {t('riskSim')} <b className="font-mono text-xs">{risk}</b>
        </span>
        <input
          type="range"
          min="0"
          max="100"
          value={risk}
          style={{ accentColor: riskState.color }}
          className="w-full cursor-pointer"
          onChange={(e) => setRisk(Number(e.target.value))}
          aria-label="Adjust risk simulation value"
        />
      </label>

      {/* Decision factors */}
      <div className="mt-4 grid gap-2.5">
        <Factor label={t('spectralAnomaly')} value={Math.min(100, risk + 12)} />
        <Factor label={t('diseaseArea')} value={Math.max(4, risk - 8)} />
        <Factor label={t('envRisk')} value={zone.humidity} />
        <Factor label={t('spreadRate')} value={Math.max(8, risk - 18)} />
      </div>

      {/* AI explanation */}
      <div className="flex gap-2.5 mt-[18px] mb-4 p-3.5 bg-[#edf2e7] border-l-[3px] border-[#8eab5b] rounded-md">
        <Sparkles className="w-[18px] text-[#638d53] flex-none" />
        <p className="m-0 flex flex-col">
          <strong className="text-xs">{t('aiExplain')}</strong>
          <span className="mt-1 text-xs text-[#66786f] leading-relaxed">
            {risk >= 70
              ? t('explainHigh')
              : risk >= 30
                ? t('explainMid')
                : t('explainLow')}
          </span>
        </p>
      </div>

      {/* Action button */}
      <button
        onClick={executeAction}
        className="w-full h-[52px] mt-auto border-0 border-b-[6px] border-[#0e2a20] rounded-lg bg-[#1f4b3b] text-white flex items-center justify-center gap-2.5 text-sm font-bold font-ui hover:-translate-y-0.5 active:translate-y-1 active:border-b"
      >
        <ActionIcon className="w-[18px]" />
        {riskState.action}
        <ArrowRight className="w-[18px] ml-auto mr-3" />
      </button>
    </aside>
  )
}
