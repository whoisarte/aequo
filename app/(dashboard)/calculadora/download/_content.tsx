'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useBrandingStore } from '@/store/brandingStore';
import { descargarPDF } from '@/lib/pdf/generator';

export default function DownloadContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { branding } = useBrandingStore();
  const [data, setData] = useState<{ datos: any; resultado: any } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('aequo_calculo_temporal');
    if (saved) {
      const parsed = JSON.parse(saved);
      setData(parsed);
      setLoading(false);

      if (sessionId) {
        descargarPDF(parsed, `aequo-${parsed.datos.nombreEmpleado || 'calculo'}`);
      }
    }
  }, [sessionId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      {loading ? (
        <>
           <svg className="w-5 h-5 animate-spin text-blue-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v4m0 0l-2-2m2 2l2-2m-2 4v4m0 0l-2-2m2 2l2-2m-8 2h16M4 12h16" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-700 mb-4">Preparando tu documento...</h1>
        </>
      ) : (
        <>
          <svg className="w-5 h-5 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <h1 className="text-2xl font-bold text-green-600 mb-4">¡Pago exitoso!</h1>
          <p className="text-gray-700">Tu descarga ha comenzado.</p>
          <p className="text-sm text-gray-500 mt-2">
            Si la descarga no comenzó,{' '}
            <button 
              onClick={() => descargarPDF(data, `aequo-${data?.datos.nombreEmpleado || 'calculo'}`)} 
              className="text-blue-600 underline"
            >
              haz clic aquí para descargar
            </button>.
          </p>
        </>
      )}
    </div>
  );
}
