'use client'

import { useEffect } from 'react'
import { useBrandingStore } from '@/store/brandingStore'

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
        // System preference
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

    // Listener for system changes if 'system' is selected
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyTheme('system')
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  return <>{children}</>
}
