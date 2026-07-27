/**
 * 竞赛展示标题栏 — 叠加在 3D 场景顶部，暗色玻璃质感
 */

interface CompetitionHeaderProps {
  projectName?: string
  schoolName?: string
  competitionName?: string
  teamName?: string
  visible?: boolean
}

export default function CompetitionHeader({
  projectName = '智慧农田植保机器人 · 数字孪生可视化',
  schoolName = '参赛学校',
  competitionName = '中学生科创竞赛 · 智慧农业专题',
  teamName = 'FieldGuard 团队',
  visible = true,
}: CompetitionHeaderProps) {
  if (!visible) return null

  return (
    <div className="absolute top-[52px] left-1/2 -translate-x-1/2 z-10 pointer-events-none">
      <div
        className="px-6 py-2.5 text-center whitespace-nowrap shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(8,20,30,0.92), rgba(6,28,18,0.92))',
          border: '1px solid rgba(0,230,118,0.22)',
          borderRadius: '30px',
          backdropFilter: 'blur(12px)',
        }}
      >
        <span
          className="text-base font-bold tracking-[0.3em]"
          style={{ color: '#00e676' }}
        >
          🌾 {projectName}
        </span>
        <div className="flex items-center justify-center gap-3 mt-1">
          <span className="text-white/50 text-[10px] font-mono tracking-wider">
            {schoolName}
          </span>
          <span className="text-white/20">·</span>
          <span className="text-white/40 text-[10px] font-mono tracking-wider">
            {competitionName}
          </span>
          <span className="text-white/20">·</span>
          <span className="text-[#00e676]/60 text-[10px] font-mono">
            {teamName}
          </span>
        </div>
      </div>
    </div>
  )
}
