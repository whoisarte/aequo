import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { validateEnv } from '@/lib/env'
import ToastContainer from '@/components/ui/toast/ToastContainer'
import ThemeProvider from '@/components/layout/ThemeProvider'
import './globals.css'

// Validate environment variables at startup
validateEnv()

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
    <html lang="es">
      <script
        dangerouslySetInnerHTML={{
          __html: `
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
              } else { // 'system'
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  root.classList.add('dark');
                } else {
                  root.classList.remove('dark');
                }
              }
            })();
          `,
        }}
      />
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <ToastContainer />
      </body>
    </html>
  )
}
