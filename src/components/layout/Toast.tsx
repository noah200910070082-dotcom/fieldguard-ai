import { Check } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'

export default function Toast() {
  const notice = useAppStore((s) => s.notice)

  if (!notice) return null

  return (
    <div className="fixed right-7 bottom-7 z-120 rounded-md bg-ink text-white shadow-xl py-4 px-5 flex items-center gap-3 text-[13px] font-ui animate-[toast-in_0.25s_ease]">
      <Check className="w-4" />
      {notice}
    </div>
  )
}
