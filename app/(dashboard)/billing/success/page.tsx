// app/(dashboard)/billing/success/page.tsx
'use client'; // Este es un Client Component para acceder a los parámetros de la URL

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Aquí es donde realizarías la verificación del lado del servidor
    // haciendo una llamada a tu propia API para confirmar la sesión de Stripe
    async function verifyStripeSession() {
      if (!sessionId) {
        setVerificationStatus('failed');
        setErrorMessage('No se encontró el ID de la sesión de pago.');
        return;
      }

      try {
        // --- LLAMADA A TU API PARA VERIFICACIÓN DE SESIÓN (SERVER-SIDE) ---
        // Crearás una nueva API Route (ej: /api/verify-checkout-session)
        // que recibirá el sessionId, consultará a Stripe de forma segura (con clave secreta)
        // y confirmará el estado del pago. También actualizaría tu DB (Supabase).
        //
        // Ejemplo de cómo sería la llamada:
        // const response = await fetch('/api/verify-checkout-session', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ sessionId }),
        // });
        //
        // const data = await response.json();
        // if (!response.ok || data.error) {
        //   throw new Error(data.error || 'Fallo la verificación de la sesión en el servidor.');
        // }
        //
        // setVerificationStatus('success');
        // --- FIN LLAMADA A TU API ---

        // Por ahora, solo simulamos el éxito después de un pequeño retraso
        // ¡ESTO NO ES SEGURO PARA PRODUCCIÓN! Siempre verifica en el servidor.
        await new Promise(resolve => setTimeout(resolve, 2000));
        setVerificationStatus('success');

      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error al verificar el estado del pago.';
        console.error('Error verifying session:', error);
        setVerificationStatus('failed');
        setErrorMessage(message);
      }
    }

    verifyStripeSession();
  }, [sessionId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white p-10 rounded-lg shadow-xl text-center max-w-md w-full">
        {verificationStatus === 'verifying' && (
          <>
            <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h1 className="text-3xl font-bold text-blue-600 mb-4">Verificando tu pago...</h1>
            <p className="text-gray-700 text-lg">Por favor, no cierres esta página.</p>
          </>
        )}

        {verificationStatus === 'success' && (
          <>
            <svg className="w-16 h-16 text-green-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h1 className="text-3xl font-bold text-green-600 mb-4">¡Pago Exitoso!</h1>
            <p className="text-gray-700 text-lg mb-4">Gracias por tu compra. Tu suscripción ha sido activada.</p>
            {sessionId && (
              <p className="text-sm text-gray-500">ID de Sesión: {sessionId}</p>
            )}
            <a href="/billing" className="mt-6 inline-block bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-300">
              Ir a tu Panel
            </a>
          </>
        )}

        {verificationStatus === 'failed' && (
          <>
            <svg className="w-16 h-16 text-red-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h1 className="text-3xl font-bold text-red-600 mb-4">¡Fallo el Pago!</h1>
            <p className="text-gray-700 text-lg mb-4">
              Hubo un problema al procesar o verificar tu pago. {errorMessage}
            </p>
            <a href="/billing" className="mt-6 inline-block bg-red-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors duration-300">
              Volver a Intentar
            </a>
          </>
        )}
      </div>
    </div>
  );
}
