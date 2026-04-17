import { getPricingPlans, PricingPlan, getUserSubscription } from '@/lib/services/billing-ui';
import PaymentSection from '@/components/billing/PaymentSection';
import { createClient } from '@/lib/supabase/server';

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div className="p-8 text-center">Inicia sesión para ver tu membresía.</div>;

  const subscription = await getUserSubscription(user.id);
  const plans: PricingPlan[] = await getPricingPlans();

  if (subscription && subscription.status === 'active') {
    const planDetails = plans.find(p => p.id === subscription.plan) || { name: 'Membresía' };
    return (
      <div className="py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-green-50 border border-green-200 p-8 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold text-green-800 mb-2">¡Tienes una membresía activa!</h2>
          <p className="text-green-600 mb-6">Tu plan está al día.</p>
          <div className="text-left bg-white p-4 rounded border border-green-100">
            <p className="font-semibold text-gray-700">Plan: {planDetails.name}</p>
            <p className="text-sm text-gray-500">Estado: Activo</p>
          </div>
          <a href="/calculadora" className="mt-8 block w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">
            Ir a la Calculadora
          </a>
        </div>
      </div>
    );
  }

  const productsForUI = plans.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price_cents: p.price_cents,
    currency: 'mxn',
    features: p.features,
    doc_limit: p.doc_limit
  }));

  return (
    <div className="py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-black mb-4">Planes y Membresías</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Elige el plan que mejor se adapte a tu despacho.
        </p>
      </div>
      <PaymentSection products={productsForUI} />
    </div>
  );
}
