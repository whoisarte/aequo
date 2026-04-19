import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { validateEnv } from '@/lib/env'
import ToastContainer from '@/components/ui/toast/ToastContainer'
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
      <body className={inter.className}>
        {children}
        <ToastContainer />
      </body>
    </html>
  )
}