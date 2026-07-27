import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bot,
  Cloud,
  Database,
  PlugZap,
  Radio,
  Router,
  Save,
  Server,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { useAppStore } from '@/stores/app-store'

type ConnState = 'idle' | 'testing' | 'success'

export default function IntegrationPanel() {
  const { t } = useTranslation()
  const showNotice = useAppStore((s) => s.showNotice)

  const [config, setConfig] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fieldguard-device-config') || '{}')
    } catch {
      return {}
    }
  })

  const [form, setForm] = useState({
    broker: config.broker || 'wss://broker.example.com:8084/mqtt',
    api: config.api || 'https://api.example.com/v1',
    deviceId: config.deviceId || 'FG-01',
    token: '',
  })

  const [connection, setConnection] = useState<ConnState>('idle')

  useEffect(() => {
    return () => clearTimeout(window.__fieldguardConnectionTimer)
  }, [])

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const testConnection = () => {
    setConnection('testing')
    window.__fieldguardConnectionTimer = setTimeout(() => {
      setConnection('success')
      showNotice(t('connectionSuccess'))
    }, 1000)
  }

  const save = () => {
    const safe = { broker: form.broker, api: form.api, deviceId: form.deviceId }
    localStorage.setItem('fieldguard-device-config', JSON.stringify(safe))
    setConfig(safe)
    showNotice(t('settingsSaved'))
  }

  return (
    <div className="animate-[workspace-in_0.28s_ease]">
      {/* Title */}
      <div className="min-h-[96px] flex items-center justify-between pt-2.5 pb-5 px-1.5">
        <div>
          <span className="font-mono text-xs text-[#6b9677] tracking-[0.16em]">DEVICE INTEGRATION</span>
          <h3 className="my-1.5 text-[36px] tracking-[-0.04em] font-heading">{t('deviceIntegration')}</h3>
          <p className="m-0 text-[#83908b] text-[15px]">{t('integrationDesc')}</p>
        </div>
        <i className="w-[50px] h-[50px] rounded-md bg-[#e7eee4] text-[#4f8060] grid place-items-center shadow-[0_5px_0_#c9d7c9]">
          <PlugZap className="w-[23px]" />
        </i>
      </div>

      <div className="grid gap-3.5 grid-cols-[1.15fr_0.85fr] max-[900px]:grid-cols-1">
        {/* Connection form */}
        <article className="border border-[#e1e3de] bg-white rounded-[10px] pb-[17px]">
          <div className="min-h-[56px] p-[14px_17px] border-b border-[#ecece7] flex items-center justify-between">
            <strong className="text-xs font-ui">{t('connectionSettings')}</strong>
            <span className={`py-1.5 px-2.5 rounded-xl text-[11px] ${
              connection === 'success' ? 'bg-[#e4f0e4] text-[#4e875c]' :
              connection === 'testing' ? 'bg-[#f6ecd6] text-[#a4782f]' :
              'bg-[#eceee9]'
            }`}>
              {connection === 'success' ? t('connected') : connection === 'testing' ? t('testing') : t('notTested')}
            </span>
          </div>

          <label className="block mx-[17px] mt-3.5">
            <span className="flex items-center gap-2 mb-1.5 text-[#5d7269] text-xs"><Router className="w-3.5" /> MQTT WebSocket</span>
            <input value={form.broker} onChange={update('broker')} className="w-full h-[46px] border border-[#dce0d9] bg-[#f8f8f5] rounded-md px-3.5 font-mono text-xs text-[#2c4f42] outline-none focus:border-[#70a17c] focus:shadow-[0_0_0_3px_rgba(77,140,98,0.1)]" />
          </label>
          <label className="block mx-[17px] mt-3.5">
            <span className="flex items-center gap-2 mb-1.5 text-[#5d7269] text-xs"><Cloud className="w-3.5" /> REST API</span>
            <input value={form.api} onChange={update('api')} className="w-full h-[46px] border border-[#dce0d9] bg-[#f8f8f5] rounded-md px-3.5 font-mono text-xs text-[#2c4f42] outline-none focus:border-[#70a17c] focus:shadow-[0_0_0_3px_rgba(77,140,98,0.1)]" />
          </label>
          <div className="grid grid-cols-2 mx-[17px] gap-3.5 mt-3.5 max-[620px]:grid-cols-1">
            <label>
              <span className="flex items-center gap-2 mb-1.5 text-[#5d7269] text-xs"><Bot className="w-3.5" /> Device ID</span>
              <input value={form.deviceId} onChange={update('deviceId')} className="w-full h-[46px] border border-[#dce0d9] bg-[#f8f8f5] rounded-md px-3.5 font-mono text-xs text-[#2c4f42] outline-none focus:border-[#70a17c]" />
            </label>
            <label>
              <span className="flex items-center gap-2 mb-1.5 text-[#5d7269] text-xs"><ShieldCheck className="w-3.5" /> Access Token</span>
              <input type="password" value={form.token} onChange={update('token')} placeholder="Test only" className="w-full h-[46px] border border-[#dce0d9] bg-[#f8f8f5] rounded-md px-3.5 font-mono text-xs text-[#2c4f42] outline-none" />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mx-4 mt-3.5 max-[620px]:grid-cols-1">
            <button onClick={testConnection} disabled={connection === 'testing'} className="min-h-12 rounded-lg flex items-center justify-center gap-2.5 text-[13px] font-bold font-ui border-0 border-b-[4px] border-[#214a38] bg-[#376d52] text-white disabled:opacity-60 disabled:cursor-wait hover:-translate-y-0.5 active:translate-y-[3px] active:border-b">
              <Zap className="w-[18px]" />{connection === 'testing' ? t('testing') : t('testConnection')}
            </button>
            <button onClick={save} className="min-h-12 rounded-lg flex items-center justify-center gap-2.5 text-[13px] font-bold font-ui border-0 border-b-[4px] border-[#c8d0c7] bg-[#edf0ea] text-[#315b4c] hover:-translate-y-0.5 active:translate-y-[3px] active:border-b">
              <Save className="w-[18px]" />{t('saveSettings')}
            </button>
          </div>

          <p className="flex items-start gap-2 mx-5 mt-[18px] p-3 bg-[#f4f0df] text-[#796a3b] rounded-md text-[10px] leading-relaxed">
            <ShieldCheck className="w-[13px] flex-none" />
            {t('securityNote')}
          </p>
        </article>

        {/* Deployment topology */}
        <article className="border border-[#e1e3de] bg-white rounded-[10px] min-h-[450px] pb-3.5">
          <div className="min-h-[56px] p-[14px_17px] border-b border-[#ecece7] flex items-center justify-between">
            <strong className="text-xs font-ui">{t('deployTopo')}</strong>
            <span className="text-[8px] text-[#88948f]">{t('topoHint')}</span>
          </div>

          <div className="mt-5 mx-auto w-[76%] min-h-[72px] p-3.5 border border-[#dae0d9] border-b-[4px] border-[#c0cdc1] rounded-lg flex items-center gap-3 bg-[#f8faf6]">
            <Server className="w-5 h-5 text-[#568667]" />
            <span className="flex flex-col"><strong className="text-sm font-ui">{t('cloudApi')}</strong><small className="font-mono text-[10px] text-[#84908b]">{t('webDashboard')}</small></span>
          </div>
          <i className="block w-0.5 h-[30px] bg-[#9bb0a0] mx-auto relative after:content-[''] after:absolute after:-bottom-0.5 after:-left-[3px] after:border-l-[4px] after:border-l-transparent after:border-r-[4px] after:border-r-transparent after:border-t-[6px] after:border-t-[#9bb0a0]" />
          <div className="mx-auto w-[76%] min-h-[72px] p-3.5 border border-[#dae0d9] border-b-[4px] border-[#c0cdc1] rounded-lg flex items-center gap-3 bg-[#eaf0e3]">
            <Database className="w-5 h-5 text-[#568667]" />
            <span className="flex flex-col"><strong className="text-sm font-ui">{t('fieldEdge')}</strong><small className="font-mono text-[10px] text-[#84908b]">{t('mqttBroker')}</small></span>
          </div>
          <div className="w-[44%] mx-auto h-[28px] border-t-2 border-[#9bb0a0] relative">
            <i className="absolute w-0.5 h-[28px] bg-[#9bb0a0] top-0 left-0" />
            <i className="absolute w-0.5 h-[28px] bg-[#9bb0a0] top-0 right-0" />
          </div>
          <div className="grid grid-cols-2 gap-2 mx-4">
            <div className="p-3 border border-[#dce1da] rounded-md flex gap-2 items-center">
              <Radio className="w-4 text-[#638c70]" />
              <span className="flex flex-col text-[11px] font-bold">{t('esp32Base')}<small className="font-mono text-[10px] text-[#8b9691] font-normal">telemetry</small></span>
            </div>
            <div className="p-3 border border-[#dce1da] rounded-md flex gap-2 items-center">
              <Bot className="w-4 text-[#638c70]" />
              <span className="flex flex-col text-[11px] font-bold">{t('fg01Rover')}<small className="font-mono text-[10px] text-[#8b9691] font-normal">state / command</small></span>
            </div>
          </div>
        </article>
      </div>

      {/* MQTT Topics */}
      <article className="border border-[#e1e3de] bg-white rounded-[10px] mt-3.5">
        <div className="min-h-[56px] p-[14px_17px] border-b border-[#ecece7] flex items-center justify-between">
          <strong className="text-xs font-ui">{t('mqttTopics')}</strong>
          <span className="text-[8px] text-[#88948f]">{t('mqttHint')}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 p-[15px] max-[620px]:grid-cols-1">
          <code className="p-3 rounded-md bg-[#203e35] text-[#cde27f] font-mono text-[11px] truncate">fieldguard/demo/sensors/+/telemetry</code>
          <code className="p-3 rounded-md bg-[#203e35] text-[#cde27f] font-mono text-[11px] truncate">fieldguard/demo/vision/+/detections</code>
          <code className="p-3 rounded-md bg-[#203e35] text-[#cde27f] font-mono text-[11px] truncate">fieldguard/demo/robots/FG-01/state</code>
          <code className="p-3 rounded-md bg-[#203e35] text-[#cde27f] font-mono text-[11px] truncate">fieldguard/demo/robots/FG-01/command</code>
        </div>
      </article>
    </div>
  )
}
