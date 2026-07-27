/**
 * 告警滚动条 — 固定在页面底部，自动推送异常设备编号
 *
 * 中学生理解要点:
 * - 从 sensor-store 读取未确认的告警
 * - 有告警时显示红色滚动条，无告警时显示绿色"全部正常"
 * - CSS 动画实现自动滚动，点击可确认告警
 */

import { ShieldCheck, AlertTriangle, X } from 'lucide-react'
import { useSensorStore } from '@/stores/sensor-store'

export default function AlertBar() {
  const alerts = useSensorStore((s) => s.alerts)
  const acknowledgeAlert = useSensorStore((s) => s.acknowledgeAlert)

  const unacknowledged = alerts.filter((a) => !a.acknowledged)
  const hasDanger = unacknowledged.some((a) => a.level === 'danger')

  if (unacknowledged.length === 0) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-8 bg-[#4ade80]/90 backdrop-blur text-white flex items-center px-4 z-50">
        <ShieldCheck className="w-3.5 h-3.5 mr-2" />
        <span className="font-mono text-[11px] tracking-wide">全部系统正常 · ALL SYSTEMS NORMAL</span>
        <span className="ml-auto font-mono text-[10px] opacity-70">
          {alerts.length > 0 ? `已处理 ${alerts.length} 条告警` : '无告警记录'}
        </span>
      </div>
    )
  }

  const bgClass = hasDanger ? 'bg-[#ef4444]/92' : 'bg-[#f59e0b]/92'

  return (
    <div className={`fixed bottom-0 left-0 right-0 h-8 ${bgClass} backdrop-blur text-white flex items-center z-50 overflow-hidden`}>
      <AlertTriangle className="w-3.5 h-3.5 ml-3 mr-2 flex-none animate-pulse" />
      <div className="flex gap-6 animate-[marquee_20s_linear_infinite] whitespace-nowrap">
        {unacknowledged.map((a) => (
          <span
            key={a.id}
            className="font-mono text-[11px] flex items-center gap-2 cursor-pointer hover:underline"
            onClick={() => acknowledgeAlert(a.id)}
          >
            {a.message}
            <X className="w-3 h-3 opacity-50" />
          </span>
        ))}
        {/* 复制一份实现无缝滚动 */}
        {unacknowledged.map((a) => (
          <span key={`dup-${a.id}`} className="font-mono text-[11px] flex items-center gap-2 opacity-50">
            {a.message}
          </span>
        ))}
        {/* 再复制确保填满 */}
        {unacknowledged.map((a) => (
          <span key={`dup2-${a.id}`} className="font-mono text-[11px] flex items-center gap-2 opacity-50">
            {a.message}
          </span>
        ))}
      </div>
      <span className="ml-auto mr-3 font-mono text-[10px] opacity-70 flex-none">
        {unacknowledged.length} 条未处理
      </span>
    </div>
  )
}
