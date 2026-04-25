import { create } from 'zustand'
import { getCachedUserId, setCachedBranding } from '@/lib/auth/cache'
import type { Branding } from '@/lib/pdf/branding'

export type Theme = 'light' | 'dark' | 'system'

interface AccessState {
  canGenerate: boolean
  reason?: string | null
  used?: number
  limit?: number
  cachedAt?: number
}

const initialAccessState: AccessState = {
  canGenerate: false,
}

interface BrandingStore {
  branding: Branding
  setBranding: (branding: Partial<Branding>) => void
  resetear: () => void
  // Access state cache
  accessState: AccessState
  setAccessState: (state: AccessState) => void
  getAccessState: () => AccessState | null
  // Theme state
  theme: Theme
  setTheme: (theme: Theme) => void
}

const brandingInicial: Branding = {
  nombreDespacho: '',
  nombreAbogado: '',
  cedula: '',
  correo: '',
  direccion: '',
  logoUrl: '',
  colorPrimario: '#0a0a0a',
  porcentajeConciliacion: 50,
}

const ACCESS_CACHE_TTL_MS = 30 * 1000 // 30 seconds

export const useBrandingStore = create<BrandingStore>((set, get) => ({
  branding: brandingInicial,
  setBranding: (partial) =>
    set((state) => {
      const branding = { ...state.branding, ...partial }
      const userId = getCachedUserId()
      if (userId) {
        setCachedBranding(userId, branding)
      }
      return { branding }
    }),
  resetear: () =>
    set({ branding: brandingInicial, accessState: initialAccessState }),

  // Access state caching
  accessState: initialAccessState,
  setAccessState: (state) =>
    set(() => ({
      accessState: {
        ...state,
        cachedAt: Date.now(),
      },
    })),
  getAccessState: () => {
    const state = get().accessState
    // Check if cache is still valid
    if (!state.cachedAt) return null
    const age = Date.now() - state.cachedAt
    if (age > ACCESS_CACHE_TTL_MS) return null
    return state
  },

  // Theme management
  theme: 'system',
  setTheme: (theme) => set({ theme }),
}))
