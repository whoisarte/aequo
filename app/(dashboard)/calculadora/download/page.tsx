'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Forzamos que este componente solo cargue en el cliente
const DownloadContent = dynamic(() => import('./_content'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <p className="text-lg text-gray-600">Cargando...</p>
    </div>
  )
});

export default function DownloadPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">Cargando...</p>
      </div>
    }>
      <DownloadContent />
    </Suspense>
  );
}
