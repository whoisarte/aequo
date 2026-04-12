import type { Branding } from '@/lib/pdf/branding'

const AUTH_USER_KEY = 'aequo_auth_user_id'
const EXPEDIENTES_KEY = 'aequo_expedientes'
const BRANDING_KEY = 'aequo_branding'

function canUseStorage() {
  return typeof window !== 'undefined'
}

export function getCachedUserId(): string | null {
  if (!canUseStorage()) return null
  return window.localStorage.getItem(AUTH_USER_KEY)
}

export function setCachedUserId(userId: string) {
  if (!canUseStorage()) return
  window.localStorage.setItem(AUTH_USER_KEY, userId)
}

export function clearCachedUserId() {
  if (!canUseStorage()) return
  window.localStorage.removeItem(AUTH_USER_KEY)
}

export function getExpedientesStorageKey(userId: string) {
  return `${EXPEDIENTES_KEY}:${userId}`
}

export function getBrandingStorageKey(userId: string) {
  return `${BRANDING_KEY}:${userId}`
}

export function getCachedBranding(userId: string): Partial<Branding> | null {
  if (!canUseStorage()) return null

  const raw = window.localStorage.getItem(getBrandingStorageKey(userId))
  if (!raw) return null

  try {
    return JSON.parse(raw) as Partial<Branding>
  } catch {
    window.localStorage.removeItem(getBrandingStorageKey(userId))
    return null
  }
}

export function setCachedBranding(userId: string, branding: Branding) {
  if (!canUseStorage()) return
  window.localStorage.setItem(getBrandingStorageKey(userId), JSON.stringify(branding))
}
