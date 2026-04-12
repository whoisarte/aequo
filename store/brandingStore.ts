import { create } from 'zustand'
import { getCachedUserId, setCachedBranding } from '@/lib/auth/cache'
import type { Branding } from '@/lib/pdf/branding'

interface BrandingStore {
  branding: Branding
  setBranding: (branding: Partial<Branding>) => void
  resetear: () => void
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

export const useBrandingStore = create<BrandingStore>((set) => ({
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
  resetear: () => set({ branding: brandingInicial }),
}))
