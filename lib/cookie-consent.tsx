'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

const COOKIE_CONSENT_KEY = 'aequo_cookie_consent'

type Consent = 'accepted' | 'essential_only' | null

interface CookieConsentContextValue {
  consent: Consent
  hasConsented: boolean
  acceptAll: () => void
  acceptEssentialOnly: () => void
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null)

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<Consent>(null)

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY) as Consent | null
    setConsent(stored)
  }, [])

  const acceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    setConsent('accepted')
  }

  const acceptEssentialOnly = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'essential_only')
    setConsent('essential_only')
  }

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        hasConsented: consent !== null,
        acceptAll,
        acceptEssentialOnly,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  )
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext)
  if (!context) {
    throw new Error('useCookieConsent must be used within CookieConsentProvider')
  }
  return context
}

export function useHasAcceptedCookies() {
  const { consent } = useCookieConsent()
  return consent === 'accepted'
}
