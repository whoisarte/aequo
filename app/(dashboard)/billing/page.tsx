import { getPricingPlans, PricingPlan, getUserSubscription } from '@/lib/services/billing-ui';
import PaymentSection from '@/components/billing/PaymentSection';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/server';

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div className="p-8 text-center">Inicia sesión para ver tu membresía.</div>;

  const subscription = await getUserSubscription(user.id);
  const plans: PricingPlan[] = await getPricingPlans();

  if (subscription && subscription.status === 'active') {
    const currentPlan = plans.find(p => p.id === subscription.plan);
    const upgradePlans = plans.filter(p => (currentPlan ? p.price_cents > currentPlan.price_cents : true));

    return (
      <div className="py-16 px-4">
        <div className="max-w-2xl mx-auto bg-white border border-gray-200 p-8 rounded-xl shadow-sm text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu Membresía</h2>
          <div className="text-lg font-semibold text-blue-600 mb-6">{currentPlan?.name || 'Membresía Activa'}</div>
          
          {upgradePlans.length > 0 ? (
            <>
              <p className="text-gray-600 mb-6">¿Quieres más capacidad? Mejora tu plan:</p>
              <div className="grid gap-4">
                {upgradePlans.map(plan => (
                  <form key={plan.id} action="/api/billing/checkout" method="POST" className="border p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <h4 className="font-bold">{plan.name}</h4>
                      <p className="text-sm text-gray-500">${plan.price_cents / 100} MXN / mes</p>
                    </div>
                    <input type="hidden" name="planId" value={plan.id} />
                    <input type="hidden" name="mode" value="subscription" />
                    <Button type="submit">Actualizar</Button>
                  </form>
                ))}
              </div>
            </>
          ) : (
            <p className="text-green-600 font-bold">¡Tienes el plan más avanzado!</p>
          )}
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
      <PaymentSection products={productsForUI} isSubscribed={!!subscription} />
    </div>
  );
}
