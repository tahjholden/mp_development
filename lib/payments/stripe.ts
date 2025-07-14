// import Stripe from 'stripe';
import { redirect } from 'next/navigation';
// NOTE:
// Stripe metadata (customer / subscription / product) is now stored on the
// mpCorePerson model – *not* on mpCoreGroup.  Until we fully re-enable Stripe
// billing, we just keep type-checking correct by importing `Person`.
import { type Person } from '@/lib/db/schema';
import {
  getUser,
  // getTeamByStripeCustomerId,
  // updateTeamSubscription
} from '@/lib/db/queries';

// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2025-04-30.basil'
// });

export async function createCheckoutSession({
  user,
  priceId,
}: {
  user: Person | null;
  priceId: string;
}) {
  // Stripe integration is on the backburner.
  // This function needs to be refactored to use the new schema.
  // Instead of throwing, gracefully redirect the user so the sign-in flow
  // does not break when a checkout is requested.
  console.warn(
    'Stripe Checkout requested but integration is disabled. Redirecting to dashboard instead.'
  );
  redirect('/dashboard');
  /*
  const authUser = await getUser();

  if (!user || !authUser) {
    redirect(`/sign-up?redirect=checkout&priceId=${priceId}`);
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: 'subscription',
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/pricing`,
    customer: user.stripeCustomerId || undefined,
    client_reference_id: authUser.id.toString(),
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 14
    }
  });

  redirect(session.url!);
  */
}

export async function createCustomerPortalSession(user: Person) {
  // Stripe integration is on the backburner.
  // This function needs to be refactored to use the new schema.
  throw new Error('Stripe Customer Portal is temporarily disabled.');
  /*
  if (!user.stripeCustomerId || !user.stripeProductId) {
    redirect('/pricing');
  }

  let configuration: Stripe.BillingPortal.Configuration;
  const configurations = await stripe.billingPortal.configurations.list();

  if (configurations.data.length > 0) {
    configuration = configurations.data[0];
  } else {
    const product = await stripe.products.retrieve(user.stripeProductId);
    if (!product.active) {
      throw new Error("Team's product is not active in Stripe");
    }

    const prices = await stripe.prices.list({
      product: product.id,
      active: true
    });
    if (prices.data.length === 0) {
      throw new Error("No active prices found for the team's product");
    }

    configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'Manage your subscription'
      },
      features: {
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price', 'quantity', 'promotion_code'],
          proration_behavior: 'create_prorations',
          products: [
            {
              product: product.id,
              prices: prices.data.map((price) => price.id)
            }
          ]
        },
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
          cancellation_reason: {
            enabled: true,
            options: [
              'too_expensive',
              'missing_features',
              'switched_service',
              'unused',
              'other'
            ]
          }
        },
        payment_method_update: {
          enabled: true
        }
      }
    });
  }

  return stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.BASE_URL}/dashboard`,
    configuration: configuration.id
  });
  */
}

/*
// This function is disabled as it depends on the old schema.
// It needs to be refactored to use mp_core_group and related tables.
export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  const team = await getTeamByStripeCustomerId(customerId);

  if (!team) {
    console.error('Team not found for Stripe customer:', customerId);
    return;
  }

  if (status === 'active' || status === 'trialing') {
    const plan = subscription.items.data[0]?.plan;
    await updateTeamSubscription(team.id, {
      stripeSubscriptionId: subscriptionId,
      stripeProductId: plan?.product as string,
      planName: (plan?.product as Stripe.Product).name,
      subscriptionStatus: status
    });
  } else if (status === 'canceled' || status === 'unpaid') {
    await updateTeamSubscription(team.id, {
      stripeSubscriptionId: null,
      stripeProductId: null,
      planName: null,
      subscriptionStatus: status
    });
  }
}
*/

export async function getStripePrices() {
  // Stripe integration is on the backburner.
  // Return mock data for now to keep the pricing page functional.
  return [
    {
      id: 'price_base',
      productId: 'prod_base',
      unitAmount: 800,
      currency: 'usd',
      interval: 'month',
      trialPeriodDays: 7,
    },
    {
      id: 'price_plus',
      productId: 'prod_plus',
      unitAmount: 1200,
      currency: 'usd',
      interval: 'month',
      trialPeriodDays: 7,
    },
  ];
}

export async function getStripeProducts() {
  // Stripe integration is on the backburner.
  // Return mock data for now to keep the pricing page functional.
  return [
    {
      id: 'prod_base',
      name: 'Base',
      description: 'Basic plan for small teams',
      defaultPriceId: 'price_base',
    },
    {
      id: 'prod_plus',
      name: 'Plus',
      description: 'Advanced plan for growing teams',
      defaultPriceId: 'price_plus',
    },
  ];
}
//       typeof product.default_price === 'string'
//         ? product.default_price
//         : product.default_price?.id
//   }));
// }
