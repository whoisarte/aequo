'use client'

import ErrorFallback from '@/components/ErrorFallback'

export default function EstiloError({
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
      title="Error en Personalización"
      description="Hubo un problema al cargar la personalización. Por favor intenta nuevamente."
    />
  )
}
