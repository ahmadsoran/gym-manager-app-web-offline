import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface PWAStore {
  // State
  installPrompt: BeforeInstallPromptEvent | null
  isInstalled: boolean
  isDismissed: boolean
  showInstallModal: boolean

  // Actions
  setInstallPrompt: (prompt: BeforeInstallPromptEvent | null) => void
  setIsInstalled: (installed: boolean) => void
  setIsDismissed: (dismissed: boolean) => void
  setShowInstallModal: (show: boolean) => void
  dismissInstall: () => void
  resetDismissal: () => void
}

export const usePWAStore = create<PWAStore>()(
  persist(
    (set, get) => ({
      // Initial state
      installPrompt: null,
      isInstalled: false,
      isDismissed: false,
      showInstallModal: false,

      // Actions
      setInstallPrompt: (prompt) => set({ installPrompt: prompt }),

      setIsInstalled: (installed) =>
        set({
          isInstalled: installed,
          showInstallModal: installed ? false : get().showInstallModal,
        }),

      setIsDismissed: (dismissed) =>
        set({
          isDismissed: dismissed,
          showInstallModal: dismissed ? false : get().showInstallModal,
        }),

      setShowInstallModal: (show) => {
        const { isInstalled, isDismissed } = get()
        // Only show modal if not installed and not dismissed
        if (!isInstalled && !isDismissed) {
          set({ showInstallModal: show })
        }
      },

      dismissInstall: () =>
        set({
          isDismissed: true,
          showInstallModal: false,
        }),

      resetDismissal: () =>
        set({
          isDismissed: false,
        }),
    }),
    {
      name: 'pwa-store',
      // Only persist these specific fields
      partialize: (state) => ({
        isInstalled: state.isInstalled,
        isDismissed: state.isDismissed,
      }),
    }
  )
)
