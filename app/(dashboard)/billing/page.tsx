'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import PaymentSection from '@/components/billing/PaymentSection'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Heading from '@/components/ui/Heading'
import { useToast } from '@/lib/toast/index'
import { getBillingPageData } from '@/lib/services/billing-actions.server'
import { cancelSubscriptionAction } from '@/lib/services/billing-actions'

interface Plan {
  id: string
  name: string
  description: string | null
  price_cents: number
  features: string[]
  doc_limit: number
  currency: string
  plan_type?: string
}

interface GenerationUsage {
  canGenerate: boolean
  used?: number
  limit?: number
  reason?: string | null
}

// Placeholder types (assuming these are defined elsewhere)
type User = any;
type Subscription = { plan: any; status: any; current_period_end: any; };

// Define the structure for a successful result from getBillingPageData
type BillingPageSuccessResult = {
  user: User;
  subscription: Subscription | null;
  plans: Plan[];
  generationUsage: GenerationUsage | null;
};

// Define the structure for an error result from getBillingPageData
type BillingPageErrorResult = {
  error: string;
  user: null;
  subscription: null;
  plans: [];
  generationUsage: null;
};

// Union type for the return value of getBillingPageData
type BillingPageResult = BillingPageSuccessResult | BillingPageErrorResult;


export default function BillingPage() {
  const toast = useToast()
  const searchParams = useSearchParams()
  
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [upgradePlans, setUpgradePlans] = useState<Plan[]>([])
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null)
  const [generationUsage, setGenerationUsage] = useState<GenerationUsage | null>(null)
  const [error, setError] = useState('')
  const [updatingPlanId, setUpdatingPlanId] = useState<string | null>(null)
  const [canceling, setCanceling] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError('')
        
        const result = await getBillingPageData()
        
        if ('error' in result && result.error) {
            setError(result.error);
            toast.error('Error al cargar datos de membresía');
            setLoading(false);
            return;
        }

        if (!result.user) {
            setUser(null);
            setLoading(false);
            return;
        }
        
        setUser(result.user);
        setSubscription(result.subscription);
        setGenerationUsage(result.generationUsage);

        const plansWithCurrency = result.plans.map(p => ({
          ...p,
          currency: 'mxn'
        })) as Plan[]
        
        setPlans(plansWithCurrency)

        if (result.subscription && (result.subscription.status === 'active' || result.subscription.status === 'trialing')) {
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
  }, [toast, searchParams])

  async function handleCancelSubscription() {
    if (!window.confirm('¿Estás seguro de que deseas cancelar tu membresía? Seguirás teniendo acceso hasta el final del periodo facturado.')) {
      return
    }

    setCanceling(true)
    try {
      const result = await cancelSubscriptionAction()
      if (result.success) {
        toast.success('Tu membresía ha sido cancelada y no se renovará.')
        // Refresh data
        const freshData = await getBillingPageData()
        if (!('error' in freshData)) {
          setSubscription(freshData.subscription)
        }
      } else {
        toast.error(result.error || 'No se pudo cancelar la membresía')
      }
    } catch (err) {
      console.error('Error in handleCancelSubscription:', err)
      toast.error('Ocurrió un error inesperado.')
    } finally {
      setCanceling(false)
    }
  }

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

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar la actualización')
      }

      if (data.url) {
        toast.success('Redirigiendo a pago...')
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err) {
      console.error('Error upgrading plan:', err)
      const message = err instanceof Error ? err.message : 'Error al procesar la actualización. Intenta nuevamente.'
      toast.error(message)
    } finally {
      setUpdatingPlanId(null)
    }
  }

  async function handleRetry() {
    setLoading(true)
    setError('')
    const result = await getBillingPageData()
    if ('error' in result && result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    if (!result.user) {
      setUser(null);
      setLoading(false);
      return;
    }
    setUser(result.user);
    setSubscription(result.subscription);
    setGenerationUsage(result.generationUsage);
    setPlans(result.plans.map(p => ({ ...p, currency: 'mxn' })) as Plan[]);
    setLoading(false);
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>Cargando datos de membresía...</p>
      </div>
    )
  }

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

  if (error) {
    return (
      <div style={{
        border: '1px solid var(--color-error-border)',
        borderRadius: 'var(--radius)',
        padding: '24px',
        background: 'var(--color-error-light)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <p style={{ color: 'var(--color-error-text)' }}>{error}</p>
        <div>
          <button
            type="button"
            onClick={() => void handleRetry()}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-error-border)',
              background: '#fff',
              color: 'var(--color-error-text)',
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

  if (subscription && (subscription.status === 'active' || subscription.status === 'trialing')) {
    const usedPercentage = generationUsage?.used && generationUsage?.limit 
      ? Math.round((generationUsage.used / generationUsage.limit) * 100)
      : 0

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '560px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Heading level={1} style={{ marginBottom: '4px' }}>
              Tu Membresía
            </Heading>
            <p style={{ color: 'var(--text-secondary)' }}>
              Plan activo: {currentPlan?.name || 'Membresía Activa'}
            </p>
          </div>
          <Button 
            variant="secondary" 
            onClick={handleCancelSubscription}
            disabled={canceling}
          >
            {canceling ? 'Cancelando...' : 'Cancelar membresía'}
          </Button>
        </div>

        {generationUsage && (
          <Card variant="outline" padding="md">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '4px'
            }}>
              <Heading level={3}>
                Generaciones disponibles
              </Heading>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                {generationUsage.used || 0} de {generationUsage.limit || 0}
              </span>
            </div>
            
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
                backgroundColor: usedPercentage > 80 ? 'var(--color-error)' : 'var(--color-info)',
                transition: 'width 0.3s ease'
              }} />
            </div>
            
            <p style={{ fontSize: '12px', color: 'var(--text-hint)' }}>
              {generationUsage.limit ? `${generationUsage.limit - (generationUsage.used || 0)} generaciones restantes` : 'Cargando...'}
            </p>
          </Card>
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
                  <Card key={plan.id} variant="outline" padding="md">
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '16px'
                    }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                      <Heading level={4}>
                        {plan.name}
                      </Heading>
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
                  </Card>
                )
              })}
            </div>
          </div>
        ) : (
          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius)',
            background: 'var(--color-success-light)',
            border: '1px solid var(--color-success-border)'
          }}>
            <p style={{ color: 'var(--color-success)', fontWeight: '500' }}>
              ¡Tienes el plan más avanzado!
            </p>
          </div>
        )}
      </div>
    )
  }

  const productsForUI = plans.map(p => {
    const docCount = p.features
      ?.find((f: string) => f.toLowerCase().includes('generaciones') || f.toLowerCase().includes('documentos') || f.toLowerCase().includes('generations'))
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
      plan_type: p.plan_type,
      displayLimit: docCount
    }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <div>
        <Heading level={1} style={{ marginBottom: '4px' }}>
          Planes y Membresías
        </Heading>
        <p style={{ color: 'var(--text-secondary)' }}>
          Elige el plan que mejor se adapte a tu despacho.
        </p>
      </div>
      <PaymentSection products={productsForUI} isSubscribed={!!subscription} />
    </div>
  )
}
