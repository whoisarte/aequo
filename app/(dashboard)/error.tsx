'use client'

import ErrorFallback from '@/components/ErrorFallback'

export default function DashboardError({
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
      title="Algo salió mal"
      description="Se produjo un error inesperado en el dashboard. Intenta nuevamente o contacta a soporte."
    />
  )
}
