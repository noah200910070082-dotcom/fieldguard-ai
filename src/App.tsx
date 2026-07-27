import { useAppStore } from '@/stores/app-store'
import Topbar from '@/components/layout/Topbar'
import ZoneRail from '@/components/layout/ZoneRail'
import Toast from '@/components/layout/Toast'
import FeatureDrawer from '@/components/layout/FeatureDrawer'
import AlertBar from '@/components/layout/AlertBar'
import OverviewPanel from '@/features/digital-twin/OverviewPanel'
import AlertsPanel from '@/features/alerts/AlertsPanel'
import RobotPanel from '@/features/robot/RobotPanel'
import SensorsPanel from '@/features/sensors/SensorsPanel'
import IntegrationPanel from '@/features/integration/IntegrationPanel'

function PanelRouter() {
  const activePanel = useAppStore((s) => s.activePanel)

  switch (activePanel) {
    case 'overview':
      return <OverviewPanel />
    case 'alerts':
      return <AlertsPanel />
    case 'robot':
      return <RobotPanel />
    case 'sensors':
      return <SensorsPanel />
    case 'integration':
      return <IntegrationPanel />
    default:
      return <OverviewPanel />
  }
}

export default function App() {
  return (
    <main className="min-h-screen bg-[#edf0e8] text-ink relative">

      <Topbar />

      <div className="min-h-[calc(100vh-84px)] grid grid-cols-[84px_1fr] max-[900px]:grid-cols-1">
        <ZoneRail />
        <section className="min-w-0 p-7 max-[900px]:p-5 max-[620px]:p-3.5">
          <PanelRouter />
        </section>
      </div>

      <FeatureDrawer />
      <Toast />
      <AlertBar />
    </main>
  )
}
