'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const DownloadContent = dynamic(() => import('./_content'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg-base)',
    }}>
      <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>Cargando...</p>
    </div>
  )
});

export default function DownloadPage() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-base)',
      }}>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>Cargando...</p>
      </div>
    }>
      <DownloadContent />
    </Suspense>
  );
}
