// Bystrík Plus – Stripe webhook (Supabase Edge Function)
// Tajomstvá (Supabase → Edge Functions → Secrets): STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
// SUPABASE_URL a SUPABASE_SERVICE_ROLE_KEY dodá Supabase automaticky.
// Stripe → Developers → Webhooks → endpoint: https://<projekt>.supabase.co/functions/v1/stripe-webhook
// udalosti: checkout.session.completed, customer.subscription.created/updated/deleted
// Pri nasadení vypnúť overovanie JWT (Stripe neposiela token): supabase functions deploy stripe-webhook --no-verify-jwt
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2025-02-24.acacia' });
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

// cena → plán podľa intervalu (ročná licencia pre učiteľa má v Stripe metadata plan=teacher)
function planOf(sub: Stripe.Subscription): string {
  const price = sub.items.data[0]?.price;
  if (price?.metadata?.plan) return price.metadata.plan;
  return price?.recurring?.interval === 'year' ? 'year' : 'month';
}

async function saveSub(sub: Stripe.Subscription, userId?: string | null) {
  const row: Record<string, unknown> = {
    status: sub.status, plan: planOf(sub), stripe_customer: String(sub.customer), stripe_subscription: sub.id,
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(), updated_at: new Date().toISOString(),
  };
  if (userId) {
    const { error } = await db.from('plus').upsert({ user_id: userId, ...row }, { onConflict: 'user_id' });
    if (error) throw error;
  } else {
    const { error } = await db.from('plus').update(row).eq('stripe_customer', String(sub.customer));
    if (error) throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('ok');
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();
  let ev: Stripe.Event;
  try {
    ev = await stripe.webhooks.constructEventAsync(body, sig!, Deno.env.get('STRIPE_WEBHOOK_SECRET')!);
  } catch (e) {
    return new Response('bad signature', { status: 400 });
  }
  try {
    if (ev.type === 'checkout.session.completed') {
      const s = ev.data.object as Stripe.Checkout.Session;
      const uid = s.client_reference_id; // apka posiela id prihláseného rodiča
      if (uid && s.subscription) await saveSub(await stripe.subscriptions.retrieve(String(s.subscription)), uid);
    } else if (ev.type.startsWith('customer.subscription.')) {
      await saveSub(ev.data.object as Stripe.Subscription);
    }
  } catch (e) {
    console.error(e);
    return new Response('error', { status: 500 });
  }
  return new Response(JSON.stringify({ received: true }), { headers: { 'content-type': 'application/json' } });
});
