import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import ToastContainer from '@/components/ui/toast/ToastContainer'
import ThemeProvider from '@/components/layout/ThemeProvider'
import CookieConsent from '@/components/CookieConsent'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Aequo',
  description: 'Calculadora de finiquito y liquidación',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function() {
              const THEME_STORAGE_KEY = 'aequo_theme';
              function getInitialTheme() {
                const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
                if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
                  return storedTheme;
                }
                return 'system';
              }
              const theme = getInitialTheme();
              const root = document.documentElement;
              if (theme === 'dark') {
                root.classList.add('dark');
              } else if (theme === 'light') {
                root.classList.remove('dark');
              } else {
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  root.classList.add('dark');
                } else {
                  root.classList.remove('dark');
                }
              }
            })();
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <ToastContainer />
        <CookieConsent />
      </body>
    </html>
  )
}
