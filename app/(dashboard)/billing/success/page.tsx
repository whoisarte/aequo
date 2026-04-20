'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/toast/index';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const toast = useToast();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    let pollAttempts = 0;
    const maxAttempts = 30;
    const planId = new URLSearchParams(window.location.search).get('planId');

    async function checkSubscription() {
      try {
        const url = planId ? `/api/billing/check-subscription?planId=${planId}` : '/api/billing/check-subscription';
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to check subscription');
        
        const data = await response.json();
        return data.isActive;
      } catch (error) {
        console.error('Error checking subscription:', error);
        return false;
      }
    }

    async function poll() {
      pollAttempts++;
      setPollCount(pollAttempts);
      console.log(`Poll attempt ${pollAttempts}/${maxAttempts}`);

      if (await checkSubscription()) {
        // Subscription is active; success!
        console.log('Subscription verified');
        setStatus('success');
        // Auto-redirect to billing page after 1 second to show success
        setTimeout(() => {
          router.push('/billing?refresh=true');
        }, 1000);
        return;
      }

      if (pollAttempts >= maxAttempts) {
        // Timeout after 30 attempts; assume success (webhook likely processing)
        console.log('Max attempts reached, assuming webhook will process');
        toast.success('Tu membresía está siendo activada');
        setStatus('success');
        // Auto-redirect to billing page after 1 second
        setTimeout(() => {
          router.push('/billing?refresh=true');
        }, 1000);
        return;
      }

      // Wait 1 second and poll again
      setTimeout(poll, 1000);
    }

    poll();
  }, [toast, router]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '24px',
        borderRadius: 'var(--radius)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '28rem',
        width: '100%'
      }}>
        {status === 'verifying' ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid var(--color-info)',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <h1 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--color-info)',
              margin: 0
            }}>
              Verificando pago...
            </h1>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '12px',
              margin: '8px 0 0 0'
            }}>
              ({pollCount}s)
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden'
          }}>
            <svg style={{ width: '48px', height: '48px', color: 'var(--color-success)', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--color-success)',
              margin: 0,
              textAlign: 'center'
            }}>
              ¡Pago Exitoso!
            </h1>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              margin: 0
            }}>
              Gracias por tu compra. Tu membresía ha sido activada.
            </p>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '12px',
              margin: 0
            }}>
              Redirigiendo en 1 segundo...
            </p>
            <a href="/billing?refresh=true" style={{
              display: 'block',
              width: '100%',
              padding: '12px 16px',
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              fontWeight: '600',
              borderRadius: 'var(--radius)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'none',
              textAlign: 'center',
              transition: 'opacity 0.15s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Ir ahora a Membresía
            </a>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
