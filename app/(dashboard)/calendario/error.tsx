'use client'

import ErrorFallback from '@/components/ErrorFallback'

export default function CalendarioError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorFallback
      error={error}
      reset={reset}
      title="Error en Calendario"
      description="Hubo un problema al cargar el calendario. Por favor intenta nuevamente."
    />
  )
}
