import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Activity, AlertTriangle, Bell, Check, ShieldCheck } from 'lucide-react'

interface AlertItem {
  id: number
  level: string
  zone: string
  title: string
  time: string
  action: string
  tone: 'danger' | 'warning' | 'healthy'
  open: boolean
}

export default function AlertsPanel() {
  const { t } = useTranslation()

  const [alerts, setAlerts] = useState<AlertItem[]>([
    { id: 1, level: t('highRisk'), zone: 'B-01', title: t('b01Spray'), time: '2 分鐘前', action: t('preciseSpray'), tone: 'danger', open: true },
    { id: 2, level: t('needAttention'), zone: 'A-02', title: t('a02Grasp'), time: '18 分鐘前', action: t('mechGrasp'), tone: 'warning', open: true },
    { id: 3, level: t('completed'), zone: 'C-01', title: t('sensorNetwork'), time: '1 小時前', action: t('completed'), tone: 'healthy', open: false },
  ])

  const openCount = alerts.filter((a) => a.open).length

  const resolve = (id: number) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, open: false, level: t('completed'), tone: 'healthy' as const } : a,
      ),
    )
  }

  return (
    <div className="animate-[workspace-in_0.28s_ease]">
      {/* Title */}
      <div className="min-h-[96px] flex items-center justify-between pt-2.5 pb-5 px-1.5">
        <div>
          <span className="font-mono text-xs text-[#6b9677] tracking-[0.16em]">ALERT CENTER</span>
          <h3 className="my-1.5 text-[36px] tracking-[-0.04em] font-heading">{t('alertCenter')}</h3>
          <p className="m-0 text-[#83908b] text-[15px]">{t('alertDesc')}</p>
        </div>
        <i className="w-[50px] h-[50px] rounded-md bg-[#e7eee4] text-[#4f8060] grid place-items-center shadow-[0_5px_0_#c9d7c9]">
          <Bell className="w-[23px]" />
        </i>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3.5 mb-3.5">
        <article className="min-h-[84px] border border-[#e0e3dc] bg-white rounded-md flex items-center gap-3.5 p-[17px] shadow-[0_5px_0_#e0e4de]">
          <AlertTriangle className="w-[26px] text-[#5c906a]" />
          <span className="flex flex-col">
            <small className="text-[11px] text-[#8a9691]">{t('pending')}</small>
            <strong className="font-mono text-[28px]">{openCount}</strong>
          </span>
        </article>
        <article className="min-h-[84px] border border-[#e0e3dc] bg-white rounded-md flex items-center gap-3.5 p-[17px] shadow-[0_5px_0_#e0e4de]">
          <ShieldCheck className="w-[26px] text-[#5c906a]" />
          <span className="flex flex-col">
            <small className="text-[11px] text-[#8a9691]">{t('todayResolved')}</small>
            <strong className="font-mono text-[28px]">12</strong>
          </span>
        </article>
        <article className="min-h-[84px] border border-[#e0e3dc] bg-white rounded-md flex items-center gap-3.5 p-[17px] shadow-[0_5px_0_#e0e4de]">
          <Activity className="w-[26px] text-[#5c906a]" />
          <span className="flex flex-col">
            <small className="text-[11px] text-[#8a9691]">{t('avgResponse')}</small>
            <strong className="font-mono text-[28px]">3.8 min</strong>
          </span>
        </article>
      </div>

      {/* Alert list */}
      <div className="border border-[#e1e3de] bg-white rounded-[10px] overflow-hidden">
        <div className="min-h-[56px] p-[14px_17px] border-b border-[#ecece7] flex items-center justify-between">
          <strong className="text-xs font-ui">{t('latestAlerts')}</strong>
          <span className="text-[8px] text-[#88948f]">{t('sortedByDanger')}</span>
        </div>
        {alerts.map((a) => (
          <div key={a.id} className={`min-h-[84px] p-[14px_17px] grid grid-cols-[36px_48px_1fr_auto] items-center gap-[11px] border-b border-[#eaebe6] last:border-0 ${a.tone}`}>
            <i className={`w-[33px] h-[33px] rounded-lg grid place-items-center ${
              a.tone === 'danger' ? 'bg-[#f2e5df] text-[#c96a52]' :
              a.tone === 'warning' ? 'bg-[#f4ecd6] text-[#ad8131]' :
              'bg-[#e4efe4] text-[#568963]'
            }`}>
              <AlertTriangle className="w-4" />
            </i>
            <span className={`font-mono text-[11px] font-semibold ${
              a.tone === 'danger' ? 'text-[#bf624d]' :
              a.tone === 'warning' ? 'text-[#a07930]' :
              'text-[#568963]'
            }`}>{a.level}</span>
            <div className="flex flex-col">
              <strong className="text-sm font-ui">{a.zone} · {a.title}</strong>
              <small className="text-[11px] text-[#8b9691] mt-1.5">{a.time} · {t('ruleEngine')}：{a.action}</small>
            </div>
            {a.open ? (
              <button onClick={() => resolve(a.id)} className="min-h-[38px] px-4 rounded-md bg-[#eef1eb] text-[#355e4e] border-b-[3px] border-[#c9d1c9] inline-flex items-center justify-center gap-1.5 text-xs font-bold font-ui hover:-translate-y-px hover:brightness-105 active:translate-y-0.5 active:border-b">
                {t('confirmDispose')} <Check className="w-3.5" />
              </button>
            ) : (
              <span className="flex items-center gap-1.5 text-[#568963] text-[8px]">
                <Check className="w-3.5" /> {t('completed')}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
