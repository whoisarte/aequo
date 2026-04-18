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

  useEffect(() => {
    // 1. Intentar recuperar del localStorage
    const saved = localStorage.getItem('aequo_calculo_temporal');
    if (saved) {
      const parsed = JSON.parse(saved);
      setData(parsed);

      // 2. Ejecutar descarga solo si tenemos sessionId (pago confirmado)
      if (sessionId) {
        descargarPDF(parsed, `aequo-${parsed.datos.nombreEmpleado || 'calculo'}`);
      }
    }
  }, [sessionId]);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
        <p className="text-lg text-gray-600">Preparando tu documento...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <h1 className="text-2xl font-bold text-green-600 mb-4">¡Pago exitoso!</h1>
      <p className="text-gray-700">Tu descarga ha comenzado.</p>
      <p className="text-sm text-gray-500 mt-2">
        Si la descarga no comenzó,{' '}
        <button 
          onClick={() => descargarPDF(data, `aequo-${data.datos.nombreEmpleado || 'calculo'}`)} 
          className="text-blue-600 underline"
        >
          haz clic aquí para descargar
        </button>.
      </p>
    </div>
  );
}
