import { Check } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
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
    <DashboardLayout
      left={
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Pricing</h2>
          </div>
        </div>
      }
      center={
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Pricing Plans</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold mb-4">{basePlan.name}</h3>
              <div className="text-3xl font-bold mb-4">
                ${basePrice.unitAmount / 100}/month
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Basic features
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Up to 10 players
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Standard support
                </li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                Choose {basePlan.name}
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold mb-4">{plusPlan.name}</h3>
              <div className="text-3xl font-bold mb-4">
                ${plusPrice.unitAmount / 100}/month
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  All basic features
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Unlimited players
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Priority support
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Advanced analytics
                </li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                Choose {plusPlan.name}
              </button>
            </div>
          </div>
        </div>
      }
      right={
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="font-semibold mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                Contact Sales
              </button>
              <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                View Features
              </button>
            </div>
          </div>
        </div>
      }
    />
  );
}
