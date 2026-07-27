import { create } from 'zustand'
import type { PanelKey } from '@/types'
import { zones } from '@/lib/mock-data'

interface AppState {
  // Navigation
  activePanel: PanelKey
  setActivePanel: (panel: PanelKey) => void

  // Zone selection
  selectedZoneId: string
  setSelectedZoneId: (id: string) => void

  // Risk simulation
  risk: number
  setRisk: (risk: number) => void
  resetRisk: () => void

  // Patrol
  patrolling: boolean
  setPatrolling: (v: boolean) => void
  togglePatrolling: () => void

  // Toast
  notice: string
  showNotice: (msg: string, duration?: number) => void
  clearNotice: () => void

  // Help drawer
  helpOpen: boolean
  setHelpOpen: (v: boolean) => void

  // Mobile menu
  mobileMenu: boolean
  setMobileMenu: (v: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  activePanel: 'overview',
  setActivePanel: (panel) => set({ activePanel: panel, mobileMenu: false }),

  selectedZoneId: 'B-01',
  setSelectedZoneId: (id) => {
    const zone = zones.find((z) => z.id === id)
    set({ selectedZoneId: id, risk: zone?.risk ?? 0 })
  },

  risk: 72,
  setRisk: (risk) => set({ risk }),
  resetRisk: () => {
    const zone = zones.find((z) => z.id === useAppStore.getState().selectedZoneId)
    set({ risk: zone?.risk ?? 0 })
  },

  patrolling: true,
  setPatrolling: (v) => set({ patrolling: v }),
  togglePatrolling: () =>
    set((s) => ({ patrolling: !s.patrolling })),

  notice: '',
  showNotice: (msg, duration = 3600) => {
    set({ notice: msg })
    setTimeout(() => set({ notice: '' }), duration)
  },
  clearNotice: () => set({ notice: '' }),

  helpOpen: false,
  setHelpOpen: (v) => set({ helpOpen: v }),

  mobileMenu: false,
  setMobileMenu: (v) => set({ mobileMenu: v }),
}))
