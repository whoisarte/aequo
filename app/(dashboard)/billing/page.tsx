'use client'

import { useEffect, useState } from 'react'
import PaymentSection from '@/components/billing/PaymentSection'
import Button from '@/components/ui/Button'
import { useToast } from '@/lib/toast/index'
import { getBillingPageData } from '@/lib/services/billing-actions.server'

interface Plan {
  id: string
  name: string
  description: string | null
  price_cents: number
  features: string[]
  doc_limit: number
  currency: string
}

interface GenerationUsage {
  canGenerate: boolean
  used?: number
  limit?: number
  reason?: string | null
}

export default function BillingPage() {
  const toast = useToast()
  
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [upgradePlans, setUpgradePlans] = useState<Plan[]>([])
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null)
  const [generationUsage, setGenerationUsage] = useState<GenerationUsage | null>(null)
  const [error, setError] = useState('')
  const [updatingPlanId, setUpdatingPlanId] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError('')
        
        const result = await getBillingPageData()
        
        if (result.error) {
          setError(result.error)
          toast.error('Error al cargar datos de membresía')
          return
        }

        if (!result.user) {
          setUser(null)
          setLoading(false)
          return
        }

        setUser(result.user)
        setSubscription(result.subscription)
        setGenerationUsage(result.generationUsage)

        const plansWithCurrency = result.plans.map(p => ({
          ...p,
          currency: 'mxn'
        })) as Plan[]
        
        setPlans(plansWithCurrency)

        if (result.subscription && result.subscription.status === 'active') {
          const current = plansWithCurrency.find(p => p.id.trim() === (result.subscription?.plan || '').trim())
          setCurrentPlan(current || null)
          
          const upgrades = plansWithCurrency.filter(p => 
            (current ? p.price_cents > current.price_cents : true)
          )
          setUpgradePlans(upgrades)
        }
      } catch (err) {
        console.error('Error loading billing data:', err)
        setError('No se pudo cargar los datos de membresía. Intenta nuevamente.')
        toast.error('Error al cargar datos de membresía')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  async function handleUpgrade(planId: string) {
    setUpdatingPlanId(planId)
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          planId,
          mode: 'subscription'
        }).toString()
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      if (url) {
        toast.success('Redirigiendo a pago...')
        window.location.href = url
      }
    } catch (err) {
      console.error('Error upgrading plan:', err)
      toast.error('Error al procesar la actualización. Intenta nuevamente.')
    } finally {
      setUpdatingPlanId(null)
    }
  }

  async function handleRetry() {
    setLoading(true)
    setError('')
    const result = await getBillingPageData()
    if (!result.error) {
      setUser(result.user)
      setSubscription(result.subscription)
      setGenerationUsage(result.generationUsage)
      setPlans(result.plans.map(p => ({ ...p, currency: 'mxn' })) as Plan[])
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  // Loading
  if (loading) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text-secondary)'
      }}>
        <p>Cargando datos de membresía...</p>
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px',
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        background: '#fafafa'
      }}>
        <p>Inicia sesión para ver tu membresía.</p>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div style={{
        border: '1px solid #fecaca',
        borderRadius: 'var(--radius)',
        padding: '24px',
        background: '#fef2f2',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <p style={{ color: '#b91c1c' }}>{error}</p>
        <div>
          <button
            type="button"
            onClick={() => void handleRetry()}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius)',
              border: '1px solid #fecaca',
              background: '#fff',
              color: '#991b1b',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  // Active subscription with upgrade options
  if (subscription && subscription.status === 'active') {
    const usedPercentage = generationUsage?.used && generationUsage?.limit 
      ? Math.round((generationUsage.used / generationUsage.limit) * 100)
      : 0

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '560px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
            Tu Membresía
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Plan activo: {currentPlan?.name || 'Membresía Activa'}
          </p>
        </div>

        {/* Generation Usage */}
        {generationUsage && (
          <div style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '4px'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Generaciones disponibles
              </h3>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                {generationUsage.used || 0} de {generationUsage.limit || 0}
              </span>
            </div>
            
            {/* Progress bar */}
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${usedPercentage}%`,
                backgroundColor: usedPercentage > 80 ? '#ef4444' : '#3b82f6',
                transition: 'width 0.3s ease'
              }} />
            </div>
            
            <p style={{ fontSize: '12px', color: 'var(--text-hint)' }}>
              {generationUsage.limit ? `${generationUsage.limit - (generationUsage.used || 0)} generaciones restantes` : 'Cargando...'}
            </p>
          </div>
        )}

        {upgradePlans.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              ¿Quieres más capacidad? Mejora tu plan:
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upgradePlans.map(plan => {
                const docCount = plan.features
                  ?.find((f: string) => f.toLowerCase().includes('generaciones') || f.toLowerCase().includes('documentos'))
                  ?.match(/\d+/)
                  ?.[0] || 'Ilimitado'

                return (
                  <div
                    key={plan.id}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      padding: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                      <h4 style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        {plan.name}
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {docCount} generaciones/mes • ${plan.price_cents / 100} MXN
                      </p>
                    </div>
                    <Button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={updatingPlanId === plan.id}
                    >
                      {updatingPlanId === plan.id ? 'Procesando...' : 'Actualizar'}
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius)',
            background: '#dcfce7',
            border: '1px solid #86efac'
          }}>
            <p style={{ color: '#166534', fontWeight: '500' }}>
              ¡Tienes el plan más avanzado!
            </p>
          </div>
        )}
      </div>
    )
  }

  // No subscription - show plans
  const productsForUI = plans.map(p => {
    const docCount = p.features
      ?.find((f: string) => f.toLowerCase().includes('generaciones') || f.toLowerCase().includes('documentos'))
      ?.match(/\d+/)
      ?.[0] || 'Ilimitado'

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      price_cents: p.price_cents,
      currency: 'mxn',
      features: p.features,
      doc_limit: p.doc_limit,
      displayLimit: docCount
    }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
          Planes y Membresías
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Elige el plan que mejor se adapte a tu despacho.
        </p>
      </div>
      <PaymentSection products={productsForUI} isSubscribed={!!subscription} />
    </div>
  )
}
