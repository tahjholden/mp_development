'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  CreditCard,
  DollarSign,
  Receipt,
} from 'lucide-react';
import { Sidebar } from '@/components/ui/Sidebar';
import { ComingSoonOverlay } from '@/components/ComingSoonOverlay';
// import { z } from 'zod'; // Unused import

// Zod schemas for validation (commented out as they're not currently used)
// const BillingItemSchema = z.object({
//   id: z.string(),
//   name: z.string(),
//   amount: z.number(),
//   status: z.enum(['paid', 'pending', 'overdue', 'cancelled']),
//   date: z.string(),
//   type: z.enum(['subscription', 'one_time', 'refund', 'credit']),
//   description: z.string(),
// });
// const SubscriptionSchema = z.object({
//   id: z.string(),
//   planName: z.string(),
//   status: z.enum(['active', 'cancelled', 'past_due', 'trialing']),
//   amount: z.number(),
//   interval: z.string(),
//   nextBilling: z.string(),
//   features: z.array(z.string()),
// });

// const PaymentMethodSchema = z.object({
//   id: z.string(),
//   type: z.enum(['card', 'bank_account']),
//   last4: z.string(),
//   brand: z.string().optional(),
//   expiryMonth: z.number().optional(),
//   expiryYear: z.number().optional(),
//   isDefault: z.boolean(),
// });

// Types for billing
interface BillingItem {
  id: string;
  name: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  date: string;
  type: 'subscription' | 'one_time' | 'refund' | 'credit';
  description: string;
}

interface Subscription {
  id: string;
  planName: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  amount: number;
  interval: string;
  nextBilling: string;
  features: string[];
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

// Role-specific content
const getRoleSpecificContent = (role: string) => {
  switch (role) {
    case 'admin':
    case 'superadmin':
      return {
        title: 'Organization Billing',
        description:
          'Manage subscriptions, payments, and billing for your organization',
        features: [
          'Team Management',
          'Advanced Analytics',
          'Priority Support',
          'Custom Integrations',
        ],
        billingItems: [
          {
            id: '1',
            name: 'Premium Team Plan',
            amount: 299.99,
            status: 'paid' as const,
            date: '2024-01-15',
            type: 'subscription' as const,
            description: 'Monthly subscription for 50 team members',
          },
          {
            id: '2',
            name: 'Custom Training Module',
            amount: 150.0,
            status: 'paid' as const,
            date: '2024-01-10',
            type: 'one_time' as const,
            description: 'One-time purchase for specialized training content',
          },
        ],
      };
    case 'coach':
      return {
        title: 'Team Billing',
        description: "View your team's subscription and billing information",
        features: ['Player Management', 'Basic Analytics', 'Email Support'],
        billingItems: [
          {
            id: '1',
            name: 'Coach Plan',
            amount: 49.99,
            status: 'paid' as const,
            date: '2024-01-15',
            type: 'subscription' as const,
            description: 'Monthly subscription for coaching tools',
          },
        ],
      };
    case 'player':
      return {
        title: 'Player Portal Billing',
        description: 'View your personal subscription and payment history',
        features: ['Personal Dashboard', 'Progress Tracking', 'Basic Support'],
        billingItems: [
          {
            id: '1',
            name: 'Player Plan',
            amount: 19.99,
            status: 'paid' as const,
            date: '2024-01-15',
            type: 'subscription' as const,
            description: 'Monthly subscription for player features',
          },
        ],
      };
    case 'parent':
      return {
        title: 'Family Billing',
        description: "Manage billing for your family's player accounts",
        features: ['Family Dashboard', 'Progress Monitoring', 'Parent Support'],
        billingItems: [
          {
            id: '1',
            name: 'Family Plan',
            amount: 39.99,
            status: 'paid' as const,
            date: '2024-01-15',
            type: 'subscription' as const,
            description: 'Monthly subscription for family features',
          },
        ],
      };
    default:
      return {
        title: 'Billing',
        description: 'Manage your subscription and billing information',
        features: ['Basic Features', 'Email Support'],
        billingItems: [],
      };
  }
};

// Main component
export default function BillingPage() {
  const [billingItems, setBillingItems] = useState<BillingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Subscription and payment method data
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const searchTerm = ''; // Search functionality not implemented yet
  const [statusFilter, setStatusFilter] = useState('all');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Mock user role - in real app this would come from auth context
  const userRole = 'admin'; // This would be dynamic based on user role
  const roleContent = useMemo(
    () => getRoleSpecificContent(userRole),
    [userRole]
  );

  const filteredBillingItems = billingItems.filter(item => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle item selection with toggle functionality
  const handleItemSelect = (itemId: string) => {
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
    } else {
      setSelectedItemId(itemId);
    }
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/session');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get role-specific content inside the effect
        const roleContent = getRoleSpecificContent(userRole);

        // Set role-specific billing items
        setBillingItems(roleContent.billingItems);

        // Mock subscription data
        const mockSubscriptions: Subscription[] = [
          {
            id: '1',
            planName: roleContent.features[0] || 'Basic Plan',
            status: 'active',
            amount: roleContent.billingItems[0]?.amount || 49.99,
            interval: 'monthly',
            nextBilling: '2024-02-15',
            features: roleContent.features,
          },
        ];
        setSubscriptions(mockSubscriptions);

        // Mock payment methods
        const mockPaymentMethods: PaymentMethod[] = [
          {
            id: '1',
            type: 'card',
            last4: '4242',
            brand: 'Visa',
            expiryMonth: 12,
            expiryYear: 2025,
            isDefault: true,
          },
        ];
        setPaymentMethods(mockPaymentMethods);

        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch billing data'
        );
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array - effect runs once on mount

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-zinc-800 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-zinc-800 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-3 gap-6">
              <div className="h-64 bg-zinc-800 rounded"></div>
              <div className="h-64 bg-zinc-800 rounded"></div>
              <div className="h-64 bg-zinc-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="text-red-400">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#d8cc97] mb-2">
            {roleContent.title}
          </h1>
          <p className="text-zinc-400">{roleContent.description}</p>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Billing Items */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#d8cc97] flex items-center gap-2">
                <Receipt size={20} />
                Billing History
              </h2>
              <div className="relative">
                <button
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1 bg-zinc-800 rounded text-sm hover:bg-zinc-700 transition-colors"
                >
                  <Filter size={16} />
                  {statusFilter === 'all' ? 'All' : statusFilter}
                  {isStatusDropdownOpen ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
                {isStatusDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-zinc-800 rounded shadow-lg z-10 min-w-[120px]">
                    {['all', 'paid', 'pending', 'overdue', 'cancelled'].map(
                      status => (
                        <button
                          key={status}
                          onClick={() => {
                            setStatusFilter(status);
                            setIsStatusDropdownOpen(false);
                          }}
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-zinc-700 transition-colors capitalize"
                        >
                          {status}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {filteredBillingItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleItemSelect(item.id)}
                  className={`p-3 rounded border cursor-pointer transition-colors ${
                    selectedItemId === item.id
                      ? 'border-[#d8cc97] bg-zinc-800'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white">{item.name}</h3>
                    <span className="text-[#d8cc97] font-semibold">
                      ${item.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400">{item.date}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs capitalize ${
                        item.status === 'paid'
                          ? 'bg-green-900 text-green-300'
                          : item.status === 'pending'
                            ? 'bg-yellow-900 text-yellow-300'
                            : item.status === 'overdue'
                              ? 'bg-red-900 text-red-300'
                              : 'bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center Column - Subscription Details */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold text-[#d8cc97] mb-4 flex items-center gap-2">
              <CreditCard size={20} />
              Current Subscription
            </h2>

            {subscriptions.length > 0 ? (
              <div className="space-y-4">
                {subscriptions.map(subscription => (
                  <div
                    key={subscription.id}
                    className="border border-zinc-700 rounded p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-white">
                        {subscription.planName}
                      </h3>
                      <span className="text-[#d8cc97] font-bold">
                        ${subscription.amount.toFixed(2)}/
                        {subscription.interval}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`px-2 py-1 rounded text-xs capitalize ${
                          subscription.status === 'active'
                            ? 'bg-green-900 text-green-300'
                            : subscription.status === 'trialing'
                              ? 'bg-blue-900 text-blue-300'
                              : subscription.status === 'past_due'
                                ? 'bg-red-900 text-red-300'
                                : 'bg-zinc-700 text-zinc-300'
                        }`}
                      >
                        {subscription.status}
                      </span>
                      <span className="text-zinc-400 text-sm">
                        Next billing: {subscription.nextBilling}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-zinc-300">
                        Features:
                      </h4>
                      <ul className="space-y-1">
                        {subscription.features.map((feature, index) => (
                          <li
                            key={index}
                            className="text-sm text-zinc-400 flex items-center gap-2"
                          >
                            <div className="w-1.5 h-1.5 bg-[#d8cc97] rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-400">
                <CreditCard size={48} className="mx-auto mb-4 text-zinc-600" />
                <p>No active subscriptions</p>
              </div>
            )}
          </div>

          {/* Right Column - Payment Methods */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold text-[#d8cc97] mb-4 flex items-center gap-2">
              <DollarSign size={20} />
              Payment Methods
            </h2>

            {paymentMethods.length > 0 ? (
              <div className="space-y-3">
                {paymentMethods.map(method => (
                  <div
                    key={method.id}
                    className="border border-zinc-700 rounded p-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-6 bg-zinc-700 rounded flex items-center justify-center">
                          <CreditCard size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {method.brand} •••• {method.last4}
                          </p>
                          {method.expiryMonth && method.expiryYear && (
                            <p className="text-sm text-zinc-400">
                              Expires {method.expiryMonth}/{method.expiryYear}
                            </p>
                          )}
                        </div>
                      </div>
                      {method.isDefault && (
                        <span className="px-2 py-1 bg-[#d8cc97] text-black text-xs rounded font-medium">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-400">
                <DollarSign size={48} className="mx-auto mb-4 text-zinc-600" />
                <p>No payment methods</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Coming Soon Overlay - Hidden for superadmin */}
      {user?.personType !== 'superadmin' && (
        <ComingSoonOverlay
          title="Billing Features Coming Soon!"
          description="We're working on comprehensive billing and subscription management features. Stay tuned for payment processing, invoice management, and advanced billing analytics."
        />
      )}
    </div>
  );
}
