import { useTranslation } from 'react-i18next'
import { CircleHelp } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { zones } from '@/lib/mock-data'

export default function ZoneRail() {
  const { t } = useTranslation()
  const selectedZoneId = useAppStore((s) => s.selectedZoneId)
  const setSelectedZoneId = useAppStore((s) => s.setSelectedZoneId)
  const setHelpOpen = useAppStore((s) => s.setHelpOpen)

  return (
    <aside className="bg-ink/97 text-white w-[84px] flex flex-col items-center gap-2.5 py-6 px-3 sticky top-[84px] h-[calc(100vh-84px)] z-20 max-md:hidden">
      <span className="font-mono text-[11px] text-[#86a096] tracking-[0.12em] mb-2">
        {t('selectedPlot')}
      </span>

      {zones.map((zone) => (
        <button
          key={zone.id}
          onClick={() => setSelectedZoneId(zone.id)}
          className={`w-[58px] h-[58px] border-0 border-b-[3px] border-[#0d281f] rounded-md bg-[#2c5144] text-[#d9e3dd] flex flex-col items-center justify-center
            hover:-translate-y-px hover:bg-[#3a6253]
            active:translate-y-0.5 active:border-b
            ${selectedZoneId === zone.id ? '!bg-lime !text-ink !border-[#7d9336] shadow-[0_0_0_3px_rgba(200,225,101,0.14)]' : ''}
          `}
        >
          <strong className="font-mono text-[13px]">{zone.id}</strong>
          <small
            className={`font-mono text-[10px] opacity-65 ${
              zone.status === 'danger' && selectedZoneId !== zone.id ? '!text-[#f6a38f] !opacity-100' : ''
            }`}
          >
            {zone.risk}
          </small>
        </button>
      ))}

      <i className="flex-1 w-px bg-white/10" />

      <button
        onClick={() => setHelpOpen(true)}
        className="bg-transparent border border-white/10 rounded-md text-white flex flex-col items-center gap-1 p-2"
      >
        <CircleHelp className="w-[18px]" />
        <span className="text-[10px]">{t('help')}</span>
      </button>
    </aside>
  )
}
