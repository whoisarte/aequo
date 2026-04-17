'use client'; 

import React from 'react'; 

interface Product {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  features: string[];
  doc_limit: number;
}

export default function PaymentSection({ products }: { products: Product[] }) {
  const individualProduct = products.find(p => p.name.toLowerCase().includes('individual'));

  return (
    <div className="w-full bg-white py-16 px-4">
      <div className="flex flex-row flex-wrap justify-center gap-8 max-w-7xl mx-auto">
        {products.map((plan) => (
          <div
            key={plan.id}
            className="bg-white border border-gray-200 rounded-xl shadow-md p-6 flex flex-col text-center w-full md:w-[300px]"
          >
            <div className="mb-4">
              <h3 className="text-sm font-bold uppercase text-gray-700 mb-1">{plan.name}</h3>
              <p className="text-3xl font-extrabold text-black leading-none">
                {plan.doc_limit.toLocaleString()}
              </p>
              <span className="text-xs text-gray-500 font-semibold">cálculos al mes</span>
            </div>

            <div className="mb-4">
              <p className="text-xl font-black text-black mb-3">
                ${(plan.price_cents / 100).toFixed(0)} <span className="text-sm font-normal text-gray-500">MXN / mes</span>
              </p>
              <form action="/api/billing/checkout" method="POST">
                <input type="hidden" name="planId" value={plan.id} />
                <input type="hidden" name="mode" value="subscription" />
                <button type="submit" className="w-full py-2 px-4 bg-black text-white font-bold rounded-md uppercase text-xs hover:opacity-90 transition-opacity">
                  Suscribirse
                </button>
              </form>
            </div>

            <div className="h-[1px] w-1/4 bg-gray-200 mx-auto mb-4" />

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              Incluye:
            </p>

            <ul className="text-left space-y-2 mb-6 flex-grow">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center text-xs text-gray-600">
                  <svg className="w-4 h-4 text-black mr-2 flex-shrink-0" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {individualProduct && (
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-600 mb-3">
            ¿Solo necesitas un cálculo puntual?
          </p>
          <form action="/api/billing/checkout" method="POST">
            <input type="hidden" name="planId" value={individualProduct.id} />
            <input type="hidden" name="mode" value="payment" />
            <button type="submit" className="text-base font-bold text-black border-b-2 border-black pb-1 hover:opacity-75 transition-opacity">
              Paga por cálculo único $50.00 MXN
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
