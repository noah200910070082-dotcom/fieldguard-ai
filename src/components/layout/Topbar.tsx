import { useTranslation } from 'react-i18next'
import { Activity, Bot, CircleHelp, Leaf, Menu, PlugZap, Radio, ShieldCheck, X } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import type { PanelKey } from '@/types'

const navItems: { key: PanelKey; labelKey: string; icon: typeof Activity }[] = [
  { key: 'overview', labelKey: 'nav1', icon: Activity },
  { key: 'alerts', labelKey: 'nav2', icon: ShieldCheck },
  { key: 'robot', labelKey: 'nav3', icon: Bot },
  { key: 'sensors', labelKey: 'nav4', icon: Radio },
  { key: 'integration', labelKey: 'nav5', icon: PlugZap },
]

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'zh-CN', label: '简' },
  { code: 'zh-TW', label: '繁' },
] as const

const accent = '#00e676'
const border = 'rgba(0,200,100,0.15)'

export default function Topbar() {
  const { t, i18n } = useTranslation()
  const activePanel = useAppStore((s) => s.activePanel)
  const setActivePanel = useAppStore((s) => s.setActivePanel)
  const mobileMenu = useAppStore((s) => s.mobileMenu)
  const setMobileMenu = useAppStore((s) => s.setMobileMenu)
  const setHelpOpen = useAppStore((s) => s.setHelpOpen)
  const currentLang = i18n.language

  return (
    <header
      className="h-[68px] px-6 flex items-center gap-6 sticky top-0 z-60 backdrop-blur-lg"
      style={{
        background: 'linear-gradient(180deg, rgba(8,20,30,0.97), rgba(6,22,16,0.95))',
        borderBottom: `1px solid ${border}`,
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 min-w-[180px]">
        <span
          className="w-[36px] h-[36px] rounded-[8px_8px_8px_2px] grid place-items-center"
          style={{ background: accent, color: '#0a1018' }}
        >
          <Leaf className="w-[20px]" />
        </span>
        <div className="flex flex-col">
          <strong
            className="text-[22px] font-extrabold tracking-[-0.04em] font-heading leading-none"
            style={{ color: accent }}
          >
            {t('brand')}
          </strong>
          <small className="font-mono text-[9px] tracking-[0.12em]" style={{ color: 'rgba(0,210,100,0.45)' }}>
            {t('brandSub')}
          </small>
        </div>
      </div>

      {/* Nav */}
      <nav
        className={`flex items-stretch gap-1 mr-auto ${mobileMenu ? 'fixed left-0 right-0 top-[68px] p-2 grid grid-cols-2 z-50' : 'max-md:hidden'}`}
        style={mobileMenu ? { background: 'rgba(8,20,30,0.98)', borderBottom: `1px solid ${border}` } : undefined}
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activePanel === item.key
          return (
            <button
              key={item.key}
              onClick={() => setActivePanel(item.key)}
              className="min-w-[100px] px-3 flex items-center justify-center gap-2 text-[14px] font-ui border-0 border-b-[3px] transition-all rounded-none"
              style={{
                color: isActive ? accent : 'rgba(180,210,190,0.55)',
                background: isActive ? 'rgba(0,230,118,0.06)' : 'transparent',
                borderColor: isActive ? accent : 'transparent',
                fontWeight: isActive ? 700 : 500,
              }}
            >
              <Icon className="w-[16px]" />
              {t(item.labelKey)}
              {item.key === 'alerts' && (
                <b
                  className="min-w-[18px] h-[18px] px-1 rounded-[9px] grid place-items-center font-mono text-[9px]"
                  style={{ background: '#ff3535', color: '#fff' }}
                >
                  2
                </b>
              )}
            </button>
          )
        })}
      </nav>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Lang */}
        <div className="flex gap-0.5">
          {languages.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => i18n.changeLanguage(code)}
              className="min-w-[34px] h-[30px] px-2 rounded-md text-[14px] font-ui transition-all"
              style={{
                background: currentLang === code ? accent : 'transparent',
                color: currentLang === code ? '#0a1018' : 'rgba(180,210,190,0.5)',
                border: `1px solid ${currentLang === code ? accent : 'rgba(255,255,255,0.08)'}`,
                fontWeight: currentLang === code ? 700 : 500,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Online */}
        <span className="flex items-center gap-2 font-mono text-[10px] whitespace-nowrap max-md:hidden" style={{ color: 'rgba(180,210,190,0.5)' }}>
          <i
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: accent, boxShadow: `0 0 6px ${accent}` }}
          />
          {t('systemOnline')}
        </span>

        {/* Help */}
        <button
          onClick={() => setHelpOpen(true)}
          className="h-[36px] px-3 rounded-md flex items-center gap-2 text-[13px] font-ui transition-all hover:brightness-110"
          style={{ background: 'rgba(0,230,118,0.1)', color: accent, border: `1px solid ${border}` }}
        >
          <CircleHelp className="w-[16px]" />
          <span className="max-[620px]:hidden">{t('help')}</span>
        </button>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="hidden max-md:grid w-9 h-9 place-items-center border-0 bg-transparent"
          style={{ color: accent }}
          aria-label="Toggle menu"
        >
          {mobileMenu ? <X className="w-5" /> : <Menu className="w-5" />}
        </button>
      </div>
    </header>
  )
}
