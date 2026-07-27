import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Radio, Settings2, Wrench } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'

export default function SensorsPanel() {
  const { t } = useTranslation()
  const showNotice = useAppStore((s) => s.showNotice)
  const [testing, setTesting] = useState('')

  const devices = [
    { id: 'ENV-A01', name: `A ${t('esp32Base')}`, type: '溫濕度 / 雨量', value: '25.4°C · 68%', signal: 92, online: true },
    { id: 'SPEC-B01', name: `B ${t('calibrating')}`, type: 'AS7265x · 18 通道', value: '異常指數 0.84', signal: 86, online: true },
    { id: 'CAM-B01', name: 'B 區 RGB 相機', type: '1080P · YOLO', value: '推理 4.2 FPS', signal: 78, online: true },
    { id: 'BASE-C01', name: `C ${t('esp32Base')}`, type: 'ESP32-S3', value: '最後上報 12 分鐘前', signal: 0, online: false },
  ]

  const calibrate = (id: string) => {
    setTesting(id)
    setTimeout(() => {
      setTesting('')
      showNotice(`${id} ${t('calibrated')}`)
    }, 900)
  }

  return (
    <div className="animate-[workspace-in_0.28s_ease]">
      {/* Title */}
      <div className="min-h-[96px] flex items-center justify-between pt-2.5 pb-5 px-1.5">
        <div>
          <span className="font-mono text-xs text-[#6b9677] tracking-[0.16em]">SENSOR NETWORK</span>
          <h3 className="my-1.5 text-[36px] tracking-[-0.04em] font-heading">{t('sensorNodes')}</h3>
          <p className="m-0 text-[#83908b] text-[15px]">{t('sensorDesc')}</p>
        </div>
        <i className="w-[50px] h-[50px] rounded-md bg-[#e7eee4] text-[#4f8060] grid place-items-center shadow-[0_5px_0_#c9d7c9]">
          <Radio className="w-[23px]" />
        </i>
      </div>

      <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
        {devices.map((d) => (
          <article key={d.id} className={`p-4 min-h-[245px] flex flex-col border border-[#e1e3de] bg-white rounded-[10px] ${d.online ? '' : 'opacity-[0.62]'}`}>
            <div className="flex justify-between items-center">
              <i className="w-10 h-10 rounded-md bg-[#e6eee4] grid place-items-center text-[#5a8b68]">
                <Radio className="w-5" />
              </i>
              <span className={`font-mono text-[10px] py-1 px-2.5 rounded-[10px] ${d.online ? 'bg-[#e5f0e5] text-[#558661]' : 'bg-[#eee9e6] text-[#9a736a]'}`}>
                {d.online ? t('onlineStatus') : t('paused')}
              </span>
            </div>
            <span className="mt-[22px] font-mono text-[10px] text-[#8d9893]">{d.id}</span>
            <h4 className="my-1 text-[17px] font-ui">{d.name}</h4>
            <p className="m-0 text-[11px] text-[#8a9691]">{d.type}</p>
            <strong className="mt-5 font-mono text-base">{d.value}</strong>
            <div className="my-auto pb-3.5">
              <span className="text-[10px] text-[#8d9893]">{t('signal')} {d.signal}%</span>
              <i className="block h-[5px] mt-1 bg-[#eceee9] rounded-md overflow-hidden">
                <b className="block h-full bg-[#6da17a]" style={{ width: `${d.signal}%` }} />
              </i>
            </div>
            <button
              disabled={!d.online || testing === d.id}
              onClick={() => calibrate(d.id)}
              className="min-h-[38px] px-4 rounded-md bg-[#eef1eb] text-[#355e4e] border-b-[3px] border-[#c9d1c9] inline-flex items-center gap-1.5 text-xs font-bold font-ui disabled:opacity-45 disabled:cursor-not-allowed hover:-translate-y-px active:translate-y-0.5 active:border-b"
            >
              <Wrench className="w-4" />
              {testing === d.id ? t('calibrating') : t('calibrateDevice')}
            </button>
          </article>
        ))}
      </div>

      <div className="grid gap-3 mt-3.5 grid-cols-[1.25fr_0.75fr] max-[900px]:grid-cols-1">
        {/* Data stream */}
        <article className="border border-[#e1e3de] bg-white rounded-[10px] min-h-[200px]">
          <div className="min-h-[56px] p-[14px_17px] border-b border-[#ecece7] flex items-center justify-between">
            <strong className="text-xs font-ui">{t('realtimeDataStream')}</strong>
            <span className="text-[8px] text-[#88948f]">5{t('secUpdate')}</span>
          </div>
          <div className="h-[135px] flex items-end gap-1.5 px-[22px] py-4">
            {[34, 58, 42, 78, 62, 86, 54, 70, 92, 66, 82, 74].map((h, i) => (
              <i
                key={i}
                className="flex-1 min-w-[6px] rounded-t-sm animate-[stream-pulse_2.5s_ease-in-out_infinite]"
                style={{
                  height: `${h}%`,
                  background: 'linear-gradient(to top, #4e8063, #a7c08a)',
                  animationDelay: `${i % 3 === 0 ? -0.8 : 0}s`,
                }}
              />
            ))}
          </div>
        </article>

        {/* Maintenance */}
        <article className="border border-[#e1e3de] bg-white rounded-[10px] p-[22px] flex flex-col">
          <div className="flex gap-[11px] items-center">
            <Settings2 className="w-5 h-5 text-[#6b8e76]" />
            <span className="flex flex-col">
              <strong className="text-base">{t('nextMaintenance')}</strong>
              <small className="text-[11px] text-[#8b9691]">{t('maintenanceItem')}</small>
            </span>
          </div>
          <b className="mt-8 mb-auto font-mono text-[28px]">{t('daysRemaining')} 6 {t('days')}</b>
          <button
            onClick={() => showNotice(t('maintenanceAdded'))}
            className="min-h-[38px] px-4 rounded-md bg-[#eef1eb] text-[#355e4e] border-b-[3px] border-[#c9d1c9] inline-flex items-center gap-1.5 text-xs font-bold font-ui active:translate-y-0.5 active:border-b"
          >
            {t('addToCalendar')}
          </button>
        </article>
      </div>
    </div>
  )
}
