'use client';

import { useState, useEffect } from 'react';

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<'verifying' | 'success'>('verifying');

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('success');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-6 sm:p-10 rounded-lg shadow-xl text-center max-w-sm w-full">
        {status === 'verifying' ? (
          <div className="flex flex-col items-center">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <h1 className="text-xl sm:text-2xl font-bold text-blue-600">Verificando pago...</h1>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg className="w-5 h-5 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <h1 className="text-xl sm:text-2xl font-bold text-green-600 mb-4">¡Pago Exitoso!</h1>
            <p className="text-gray-700 text-sm sm:text-base mb-6">Gracias por tu compra. Tu membresía ha sido activada.</p>
            <a href="/billing" className="block w-full py-3 bg-black text-white font-bold rounded-lg hover:opacity-90 transition text-sm">
              Ir a Membresía
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
