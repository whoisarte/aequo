'use client'

import { useEffect } from 'react'
import { useBrandingStore } from '@/store/brandingStore'
import { ChatWidget } from '@/components/chatbot/ChatWidget'
import { CookieConsentProvider } from '@/lib/cookie-consent'
import CookieConsent from '@/components/CookieConsent'

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { theme } = useBrandingStore()

  useEffect(() => {
    const root = window.document.documentElement

    const applyTheme = (themeValue: string) => {
      if (themeValue === 'dark') {
        root.classList.add('dark')
      } else if (themeValue === 'light') {
        root.classList.remove('dark')
      } else {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'

        if (systemTheme === 'dark') {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }
    }

    applyTheme(theme)

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyTheme('system')

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  return (
    <CookieConsentProvider>
      {children}
      <CookieConsent />
      <ChatWidget />
    </CookieConsentProvider>
  )
}
