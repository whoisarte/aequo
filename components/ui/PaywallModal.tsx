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
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-200">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Acceso Requerido</h2>
          <p className="text-gray-600 mt-2">
            Para descargar o guardar este reporte, necesitas una suscripción activa o adquirir un acceso individual.
          </p>
        </div>

        <div className="space-y-4">
          {/* Opción 1: Suscripción */}
          <a 
            href="/billing" 
            className="block w-full py-3 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
          >
            Ver Planes de Membresía
          </a>

          {/* Opción 2: Pago Único */}
          {singleProduct && (
            <button
              onClick={handlePaymentClick}
              disabled={isLoading}
              className="w-full py-3 px-6 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Procesando...' : `Pagar Generación Individual ($${(singleProduct.price_cents / 100).toFixed(0)} MXN)`}
            </button>
          )}

          <button 
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-gray-600 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
