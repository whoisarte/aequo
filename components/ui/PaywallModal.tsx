'use client'

import React, { useState } from 'react';
import Button from './Button';
import { useToast } from '@/lib/toast/index';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  singleProduct: { id: string; price_cents: number } | null;
}

export default function PaywallModal({ isOpen, onClose, singleProduct }: PaywallModalProps) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handlePaymentClick = async () => {
    if (!singleProduct) return;

    try {
      setIsLoading(true);
      toast.success('Redirigiendo a pago...');

      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: singleProduct.id,
          mode: 'payment'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el pago');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Payment error:', error);
      const message = error instanceof Error ? error.message : 'Error al procesar el pago';
      toast.error(message);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1001,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />
      <div style={{
        position: 'relative',
        background: 'var(--bg-card)',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '448px',
        width: '100%',
        padding: '32px',
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg style={{ width: '32px', height: '32px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}>Acceso Requerido</h2>
          <p style={{
            color: 'var(--text-secondary)',
            marginTop: '8px',
          }}>
            Para descargar o guardar este reporte, necesitas una suscripción activa o adquirir un acceso individual.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <a
            href="/billing"
            style={{
              display: 'block',
              width: '100%',
              padding: '12px 24px',
              background: 'var(--color-primary)',
              color: '#fff',
              fontWeight: 700,
              borderRadius: '12px',
              transition: 'background 0.2s',
              textDecoration: 'none',
            }}
          >
            Ver Planes de Membresía
          </a>

          {singleProduct && (
            <button
              onClick={handlePaymentClick}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 24px',
                border: '2px solid var(--border)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                borderRadius: '12px',
                background: isLoading ? 'var(--bg-surface)' : 'transparent',
                opacity: isLoading ? 0.5 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s, opacity 0.2s',
              }}
            >
              {isLoading ? 'Procesando...' : `Pagar Generación Individual ($${(singleProduct.price_cents / 100).toFixed(0)} MXN)`}
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              fontSize: '13px',
              color: 'var(--text-hint)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
