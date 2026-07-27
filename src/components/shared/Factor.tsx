interface FactorProps {
  label: string
  value: number
}

export default function Factor({ label, value }: FactorProps) {
  return (
    <div className="grid grid-cols-[68px_1fr_26px] items-center gap-2.5">
      <span className="text-xs text-[#6b7b74]">{label}</span>
      <i className="h-[7px] bg-[#e7eae4] rounded-[5px] overflow-hidden">
        <b className="block h-full bg-[#6a9673] transition-[width_0.3s]" style={{ width: `${value}%` }} />
      </i>
      <strong className="text-right font-mono text-xs">{value}</strong>
    </div>
  )
}
