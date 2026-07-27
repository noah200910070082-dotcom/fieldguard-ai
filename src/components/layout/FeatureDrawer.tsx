import { useTranslation } from 'react-i18next'
import { Activity, ArrowRight, Bot, PlugZap, Radio, ShieldCheck, X } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import type { PanelKey } from '@/types'

const featureLinks: { key: PanelKey; icon: typeof Activity; labelKey: string; descKey: string }[] = [
  { key: 'overview', icon: Activity, labelKey: 'twin3d', descKey: 'twin3dDesc' },
  { key: 'alerts', icon: ShieldCheck, labelKey: 'ruleAlert', descKey: 'ruleAlertDesc' },
  { key: 'robot', icon: Bot, labelKey: 'remoteControl', descKey: 'remoteControlDesc' },
  { key: 'sensors', icon: Radio, labelKey: 'sensorNetwork', descKey: 'sensorNetworkDesc' },
  { key: 'integration', icon: PlugZap, labelKey: 'deviceAccess', descKey: 'deviceAccessDesc' },
]

export default function FeatureDrawer() {
  const { t } = useTranslation()
  const helpOpen = useAppStore((s) => s.helpOpen)
  const setHelpOpen = useAppStore((s) => s.setHelpOpen)
  const setActivePanel = useAppStore((s) => s.setActivePanel)

  if (!helpOpen) return null

  const openPanel = (key: PanelKey) => {
    setActivePanel(key)
    setHelpOpen(false)
  }

  const featureTags: string[] = t('featureTags', { returnObjects: true }) ?? []

  return (
    <div
      className="fixed inset-0 z-100 bg-ink/25 backdrop-blur-sm flex justify-end"
      role="dialog"
      aria-modal
      aria-label={t('featureGuide')}
      onClick={() => setHelpOpen(false)}
    >
      <aside
        className="w-[min(460px,100%)] h-full bg-[#f7f8f3] p-8 overflow-y-auto shadow-[-20px_0_60px_rgba(11,35,26,0.2)] animate-[drawer-in_0.25s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <span className="font-mono text-[11px] text-[#65916f] tracking-[0.14em]">
              {t('controlGuide')}
            </span>
            <h2 className="mt-1.5 text-[34px] font-heading">{t('featureGuide')}</h2>
          </div>
          <button
            onClick={() => setHelpOpen(false)}
            className="w-[38px] h-[38px] border-0 rounded-full bg-[#e5eae2] grid place-items-center"
          >
            <X className="w-[18px]" />
          </button>
        </div>

        <p className="text-[#687a72] leading-relaxed text-[15px] my-6">{t('guideIntro')}</p>

        {/* Feature links */}
        <div className="grid gap-2.5">
          {featureLinks.map(({ key, icon: Icon, labelKey, descKey }) => (
            <button
              key={key}
              onClick={() => openPanel(key)}
              className="min-h-[80px] p-3.5 border border-[#dce1da] border-b-[3px] border-[#c7d0c6] rounded-md bg-paper text-[#244b3d] grid grid-cols-[40px_1fr_26px] items-center gap-3 text-left hover:-translate-y-px active:translate-y-0.5 active:border-b"
            >
              <Icon className="w-6 text-[#5c8d69]" />
              <span className="flex flex-col">
                <strong className="text-sm">{t(labelKey)}</strong>
                <small className="text-xs text-[#7d8b85] mt-1 leading-relaxed">
                  {t(descKey)}
                </small>
              </span>
              <ArrowRight className="w-4" />
            </button>
          ))}
        </div>

        {/* Feature tags */}
        <div className="mt-6">
          <strong className="text-sm">{t('newFeatures')}</strong>
          <div className="flex flex-wrap gap-2 mt-3">
            {featureTags.map((tag, i) => (
              <span
                key={i}
                className="py-1.5 px-3 rounded-[13px] bg-[#e5ece2] text-[#496c5d] text-[11px]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Safety note */}
        <div className="flex gap-3 mt-6 p-4 border-l-[3px] border-[#d09a3f] bg-[#f2ecd9] text-[#6d6037]">
          <ShieldCheck className="w-5 flex-none" />
          <p className="m-0 flex flex-col">
            <strong className="text-[13px]">{t('safetyPrinciple')}</strong>
            <span className="mt-1 text-xs leading-relaxed">{t('safetyDesc')}</span>
          </p>
        </div>
      </aside>
    </div>
  )
}
