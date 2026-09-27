'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { descargarPDF } from '@/lib/pdf/generator';

export default function DownloadContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [data, setData] = useState<{ datos: any; resultado: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('aequo_calculo_temporal');
    if (!saved) {
      setLoading(false);
      setError(true);
      return;
    }

    const parsed = JSON.parse(saved);
    setData(parsed);

    if (!sessionId) {
      setLoading(false);
      return;
    }

    fetch(`/api/purchases/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then(res => res.json())
      .then(result => {
        if (result.valid) {
          setVerified(true);
          void descargarPDF(parsed, `aequo-${parsed.datos.nombreEmpleado || 'calculo'}`);
        } else {
          setError(true);
        }
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sessionId]);

  const spinnerStyle = {
    width: '20px',
    height: '20px',
    border: '3px solid var(--border)',
    borderTopColor: 'var(--color-primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'var(--bg-base)',
    textAlign: 'center' as const,
    padding: '16px',
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={spinnerStyle} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '16px' }}>
          Preparando tu documento...
        </h1>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <svg style={{ width: '20px', height: '20px', color: 'var(--color-error)', marginBottom: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-error)', marginBottom: '16px' }}>
          No se encontró tu compra
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Si crees que esto es un error, contacta a soporte.
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <svg style={{ width: '20px', height: '20px', color: 'var(--color-success)', marginBottom: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-success)', marginBottom: '16px' }}>
        ¡Pago exitoso!
      </h1>
      <p style={{ color: 'var(--text-primary)' }}>Tu descarga ha comenzado.</p>
      <p style={{ fontSize: '14px', color: 'var(--text-hint)', marginTop: '8px' }}>
        Si la descarga no comenzó,{' '}
        <button
          onClick={async () => {
            if (data) {
              await descargarPDF(data, `aequo-${data.datos.nombreEmpleado || 'calculo'}`);
            }
          }}
          style={{ color: 'var(--color-primary)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
        >
          haz clic aquí para descargar
        </button>.
      </p>
    </div>
  );
}
