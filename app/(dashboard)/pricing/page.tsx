import { Check } from 'lucide-react';

export default async function PricingPage() {
  // Mock data since Stripe is not implemented yet
  const basePlan = { name: 'Base', id: 'prod_base' };
  const plusPlan = { name: 'Plus', id: 'prod_plus' };

  const basePrice = {
    id: 'price_base',
    unitAmount: 800,
    interval: 'month',
    trialPeriodDays: 7,
  };
  const plusPrice = {
    id: 'price_plus',
    unitAmount: 1200,
    interval: 'month',
    trialPeriodDays: 7,
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid md:grid-cols-2 gap-8 max-w-xl mx-auto">
        <PricingCard
          name={basePlan?.name || 'Base'}
          price={basePrice?.unitAmount || 800}
          interval={basePrice?.interval || 'month'}
          trialDays={basePrice?.trialPeriodDays || 7}
          features={[
            'Unlimited Usage',
            'Unlimited Workspace Members',
            'Email Support',
          ]}
        />
        <PricingCard
          name={plusPlan?.name || 'Plus'}
          price={plusPrice?.unitAmount || 1200}
          interval={plusPrice?.interval || 'month'}
          trialDays={plusPrice?.trialPeriodDays || 7}
          features={[
            'Everything in Base, and:',
            'Early Access to New Features',
            '24/7 Support + Slack Access',
          ]}
        />
      </div>
    </main>
  );
}

function PricingCard({
  name,
  price,
  interval,
  trialDays,
  features,
}: {
  name: string;
  price: number;
  interval: string;
  trialDays: number;
  features: string[];
}) {
  return (
    <div className="pt-6">
      <h2 className="text-2xl font-medium text-gray-900 mb-2">{name}</h2>
      <p className="text-sm text-gray-600 mb-4">
        with {trialDays} day free trial
      </p>
      <p className="text-4xl font-medium text-gray-900 mb-6">
        ${price / 100}{' '}
        <span className="text-xl font-normal text-gray-600">
          per user / {interval}
        </span>
      </p>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-4">
          Payment integration coming soon
        </p>
        <button
          type="button"
          className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
          disabled
        >
          Coming Soon
        </button>
      </div>
    </div>
  );
}
