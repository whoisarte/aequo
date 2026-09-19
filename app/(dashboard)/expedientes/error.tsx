'use client'

import ErrorFallback from '@/components/ErrorFallback'

export default function ExpedientesError({
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
      title="Error en Expedientes"
      description="Hubo un problema al cargar tus expedientes. Por favor intenta nuevamente."
    />
  )
}
