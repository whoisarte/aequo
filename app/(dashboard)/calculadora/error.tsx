'use client'

import ErrorFallback from '@/components/ErrorFallback'

export default function CalculadoraError({
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
      title="Error en la Calculadora"
      description="Hubo un problema al cargar la calculadora. Por favor intenta nuevamente."
    />
  )
}
