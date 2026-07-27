import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bot,
  Check,
  Gauge,
  MapPin,
  Pause,
  Play,
  Power,
  RotateCcw,
  Wifi,
} from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import type { RobotMode, MoveDirection } from '@/types'

const MOVE_MAP: Record<MoveDirection, string> = {
  forward: 'forward',
  left: 'leftTurn',
  stop: 'stop',
  right: 'rightTurn',
  backward: 'backward',
}

export default function RobotPanel() {
  const { t } = useTranslation()
  const patrolling = useAppStore((s) => s.patrolling)
  const togglePatrolling = useAppStore((s) => s.togglePatrolling)
  const setPatrolling = useAppStore((s) => s.setPatrolling)
  const showNotice = useAppStore((s) => s.showNotice)

  const [speed, setSpeed] = useState(42)
  const [mode, setMode] = useState<RobotMode>('auto')
  const [lastMove, setLastMove] = useState(t('stop'))

  useEffect(() => {
    setLastMove(t('stop'))
  }, [t])

  const move = (direction: MoveDirection) => {
    const label = t(MOVE_MAP[direction])
    setLastMove(label)
    showNotice(`FG-01: ${label}`)
  }

  const emergencyStop = () => {
    setPatrolling(false)
    setLastMove(t('emergencyStop'))
    showNotice(t('emergencyTriggered'))
  }

  return (
    <div className="animate-[workspace-in_0.28s_ease]">
      {/* Title */}
      <div className="min-h-[96px] flex items-center justify-between pt-2.5 pb-5 px-1.5">
        <div>
          <span className="font-mono text-xs text-[#6b9677] tracking-[0.16em]">ROBOT CONTROL</span>
          <h3 className="my-1.5 text-[36px] tracking-[-0.04em] font-heading">{t('robotControl')}</h3>
          <p className="m-0 text-[#83908b] text-[15px]">{t('robotDesc')}</p>
        </div>
        <i className="w-[50px] h-[50px] rounded-md bg-[#e7eee4] text-[#4f8060] grid place-items-center shadow-[0_5px_0_#c9d7c9]">
          <Bot className="w-[23px]" />
        </i>
      </div>

      <div className="grid gap-3.5 grid-cols-[0.9fr_1.1fr] max-[900px]:grid-cols-1">
        {/* Telemetry */}
        <article className="border border-[#e1e3de] bg-white rounded-[10px] min-h-[440px]">
          <div className="min-h-[56px] p-[14px_17px] border-b border-[#ecece7] flex items-center justify-between">
            <strong className="text-xs font-ui">{t('realtimeTelemetry')}</strong>
            <span className="flex items-center gap-1.5 text-[#579368]">
              <i className="w-1.5 h-1.5 rounded-full bg-[#62ad72]" /> {t('rosBridgeOnline')}
            </span>
          </div>
          <div className="h-[225px] m-4 rounded-md bg-[#e4ead9] relative grid place-items-center overflow-hidden bg-[linear-gradient(rgba(24,55,46,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(24,55,46,0.08)_1px,transparent_1px)] bg-[length:28px_28px]">
            <Bot className="w-[88px] h-[88px] text-[#315b4c] relative z-2 drop-shadow-lg" />
            {patrolling && <span className="absolute w-[115px] h-[115px] border border-[#7ca18a] rounded-full animate-[robot-radar_2.3s_ease-out_infinite]" />}
            <b className="absolute left-[17px] top-[15px] font-mono text-[9px]">FG-01</b>
            <small className="absolute right-[17px] bottom-[14px] text-[8px] text-[#587266]">{lastMove}</small>
          </div>
          <div className="grid grid-cols-4 gap-1 px-4 pb-4">
            <div className="flex flex-col items-center border-r border-[#e6e8e3]"><Power className="w-5 text-[#678b72]" /><small className="text-[10px] text-[#8a9691]">{t('battery')}</small><strong className="font-mono text-[13px]">78%</strong></div>
            <div className="flex flex-col items-center border-r border-[#e6e8e3]"><Gauge className="w-5 text-[#678b72]" /><small className="text-[10px] text-[#8a9691]">{t('speed')}</small><strong className="font-mono text-[13px]">{speed}%</strong></div>
            <div className="flex flex-col items-center border-r border-[#e6e8e3]"><MapPin className="w-5 text-[#678b72]" /><small className="text-[10px] text-[#8a9691]">{t('location')}</small><strong className="font-mono text-[13px]">± 4cm</strong></div>
            <div className="flex flex-col items-center"><Wifi className="w-5 text-[#678b72]" /><small className="text-[10px] text-[#8a9691]">{t('signal')}</small><strong className="font-mono text-[13px]">-52 dBm</strong></div>
          </div>
        </article>

        {/* Manual control */}
        <article className="border border-[#e1e3de] bg-white rounded-[10px] min-h-[440px] pb-4">
          <div className="min-h-[56px] p-[14px_17px] border-b border-[#ecece7] flex items-center justify-between">
            <strong className="text-xs font-ui">{t('manualControl')}</strong>
            <span className="text-[8px] text-[#88948f]">{t('manualHint')}</span>
          </div>

          {/* Mode switch */}
          <div className="grid grid-cols-2 bg-[#eef0eb] p-1 rounded-md m-[15px]">
            <button
              onClick={() => setMode('auto')}
              className={`h-[38px] border-0 rounded-md bg-transparent text-[13px] font-ui ${mode === 'auto' ? 'bg-white shadow-md text-[#3d7253] font-bold' : ''}`}
            >
              {t('autoPatrol')}
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`h-[38px] border-0 rounded-md bg-transparent text-[13px] font-ui ${mode === 'manual' ? 'bg-white shadow-md text-[#3d7253] font-bold' : ''}`}
            >
              {t('manualOverride')}
            </button>
          </div>

          {/* Direction pad */}
          <div className="w-[150px] mx-auto my-2 grid grid-cols-[repeat(3,45px)] grid-rows-[repeat(3,45px)] gap-1.5">
            <button onClick={() => move('forward')} className="col-start-2 border-0 border-b-[4px] border-[#b8c4b9] rounded-lg bg-[#e5ebe3] text-[#345e4e] grid place-items-center active:translate-y-[3px] active:border-b"><ArrowUp className="w-[18px]" /></button>
            <button onClick={() => move('left')} className="col-start-1 row-start-2 border-0 border-b-[4px] border-[#b8c4b9] rounded-lg bg-[#e5ebe3] text-[#345e4e] grid place-items-center active:translate-y-[3px] active:border-b"><ArrowLeft className="w-[18px]" /></button>
            <button onClick={() => move('stop')} className="col-start-2 row-start-2 border-0 border-b-[4px] border-[#d99b8e] rounded-lg bg-[#f1d9d3] grid place-items-center active:translate-y-[3px] active:border-b"><span className="w-3 h-3 bg-[#cb6250] rounded-sm" /></button>
            <button onClick={() => move('right')} className="col-start-3 row-start-2 border-0 border-b-[4px] border-[#b8c4b9] rounded-lg bg-[#e5ebe3] text-[#345e4e] grid place-items-center active:translate-y-[3px] active:border-b"><ArrowRight className="w-[18px]" /></button>
            <button onClick={() => move('backward')} className="col-start-2 row-start-3 border-0 border-b-[4px] border-[#b8c4b9] rounded-lg bg-[#e5ebe3] text-[#345e4e] grid place-items-center active:translate-y-[3px] active:border-b"><ArrowDown className="w-[18px]" /></button>
          </div>

          {/* Speed */}
          <label className="block mx-[18px] mb-4">
            <span className="flex justify-between text-xs">{t('drivingSpeed')} <b className="font-mono text-xs">{speed}%</b></span>
            <input type="range" min="10" max="100" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full accent-[#4d8c62]" />
          </label>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2.5 mx-4">
            <button
              onClick={() => { togglePatrolling(); showNotice(patrolling ? t('patrolPaused') : t('patrolResumed')) }}
              className="min-h-12 rounded-lg flex items-center justify-center gap-2.5 text-[13px] font-bold font-ui border-0 border-b-[4px] border-[#214a38] bg-[#376d52] text-white hover:-translate-y-0.5 hover:brightness-105 active:translate-y-[3px] active:border-b"
            >
              {patrolling ? <Pause className="w-[18px]" /> : <Play className="w-[18px]" />}
              {patrolling ? t('pauseTask') : t('resumeTask')}
            </button>
            <button
              onClick={emergencyStop}
              className="min-h-12 rounded-lg flex items-center justify-center gap-2.5 text-[13px] font-bold font-ui border-0 border-b-[4px] border-[#9f4435] bg-[#d56552] text-white hover:-translate-y-0.5 hover:brightness-105 active:translate-y-[3px] active:border-b"
            >
              <Power className="w-[18px]" />
              {t('emergencyStop')}
            </button>
          </div>
        </article>
      </div>

      {/* Route */}
      <article className="border border-[#e1e3de] bg-white rounded-[10px] mt-3.5 pb-5">
        <div className="min-h-[56px] p-[14px_17px] border-b border-[#ecece7] flex items-center justify-between">
          <strong className="text-xs font-ui">{t('todayRoute')}</strong>
          <button onClick={() => showNotice(t('rerouted'))} className="min-h-[38px] px-4 rounded-md bg-[#eef1eb] text-[#355e4e] border-b-[3px] border-[#c9d1c9] inline-flex items-center gap-1.5 text-xs font-bold font-ui active:translate-y-0.5 active:border-b">
            <RotateCcw className="w-4" /> {t('reroute')}
          </button>
        </div>
        <div className="grid grid-cols-[repeat(9,auto)] items-center pt-6 pb-2.5 px-9">
          <i className="w-[30px] h-[30px] border-2 border-[#d3d8d1] rounded-full grid place-items-center font-mono text-[9px] bg-white z-2 bg-[#5b966a] text-white border-[#5b966a]"><Check className="w-3.5" /></i>
          <b className="h-0.5 bg-[#dce1da]" />
          <i className="w-[30px] h-[30px] border-2 border-[#d3d8d1] rounded-full grid place-items-center font-mono text-[9px] bg-white z-2 bg-[#5b966a] text-white border-[#5b966a]"><Check className="w-3.5" /></i>
          <b className="h-0.5 bg-[#dce1da]" />
          <i className="w-[30px] h-[30px] border-2 border-[#d89b42] rounded-full grid place-items-center font-mono text-[9px] bg-white z-2 text-[#bd7d25] shadow-[0_0_0_6px_#f7ecd7]"><Bot className="w-3.5" /></i>
          <b className="h-0.5 bg-[#dce1da]" />
          <i className="w-[30px] h-[30px] border-2 border-[#d3d8d1] rounded-full grid place-items-center font-mono text-[9px] bg-white z-2">4</i>
          <b className="h-0.5 bg-[#dce1da]" />
          <i className="w-[30px] h-[30px] border-2 border-[#d3d8d1] rounded-full grid place-items-center font-mono text-[9px] bg-white z-2">5</i>
        </div>
        <div className="grid grid-cols-5 px-5">
          <span className="text-center font-mono text-[8px] flex flex-col">A-01<small className="font-body text-[7px] text-[#8b9792]">{t('complete')}</small></span>
          <span className="text-center font-mono text-[8px] flex flex-col">A-02<small className="font-body text-[7px] text-[#8b9792]">{t('complete')}</small></span>
          <span className="text-center font-mono text-[8px] flex flex-col">B-01<small className="font-body text-[7px] text-[#8b9792]">{t('treating')}</small></span>
          <span className="text-center font-mono text-[8px] flex flex-col">B-02<small className="font-body text-[7px] text-[#8b9792]">{t('pendingInspect')}</small></span>
          <span className="text-center font-mono text-[8px] flex flex-col">C<small className="font-body text-[7px] text-[#8b9792]">{t('pendingInspect')}</small></span>
        </div>
      </article>
    </div>
  )
}
