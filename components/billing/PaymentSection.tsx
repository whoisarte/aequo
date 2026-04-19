'use client'; 

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { useToast } from '@/lib/toast/index'

interface Product {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  features: string[];
  doc_limit: number;
  displayLimit?: string | number;
}

interface PaymentSectionProps {
  products: Product[];
  isSubscribed: boolean;
}

export default function PaymentSection({ products, isSubscribed }: PaymentSectionProps) {
  const toast = useToast()
  const INDIVIDUAL_PRODUCT_ID = '4aa9fed4-5fb3-4bf2-8bc8-5324319cb021';
  const [updatingPlanId, setUpdatingPlanId] = useState<string | null>(null)

  const handleSubscribe = async (planId: string) => {
    try {
      setUpdatingPlanId(planId)
      toast.success('Redirigiendo a pago...')
      
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, mode: 'subscription' })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al procesar la suscripción')
      setUpdatingPlanId(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {products
          .filter(p => p.id !== INDIVIDUAL_PRODUCT_ID)
          .map((plan) => {
            const generationCount = plan.displayLimit || plan.doc_limit.toLocaleString()
            
            return (
              <div
                key={plan.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                      {plan.name}
                    </h3>
                    {plan.description && (
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                        {plan.description}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                      ${plan.price_cents / 100}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                      MXN / mes
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: 'calc(var(--radius) - 2px)'
                }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, marginBottom: '4px' }}>
                    Incluye:
                  </p>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {plan.features.map((feature, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <span style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }}>✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={updatingPlanId === plan.id}
                  fullWidth
                >
                  {updatingPlanId === plan.id ? 'Procesando...' : 'Suscribirse'}
                </Button>
              </div>
            )
          })}
      </div>
    </div>
  );
}
