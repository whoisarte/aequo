'use client'

import ErrorFallback from '@/components/ErrorFallback'

export default function BillingError({
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
      title="Error en Facturación"
      description="Hubo un problema al cargar la información de facturación. Por favor intenta nuevamente."
    />
  )
}
