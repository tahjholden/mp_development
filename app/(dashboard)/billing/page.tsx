'use client';
import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  CreditCard,
  DollarSign,
  Receipt,
} from 'lucide-react';
// Zod schemas for validation (commented out as they're not currently used)
// ,
//   name: z.string(),
//   amount: z.number(),
//   status: z.enum(['paid', 'pending', 'overdue', 'cancelled']),
//   date: z.string(),
//   type: z.enum(['subscription', 'one_time', 'refund', 'credit']),
//   description: z.string(),
// });
// ,
//   planName: z.string(),
//   status: z.enum(['active', 'cancelled', 'past_due', 'trialing']),
//   amount: z.number(),
//   interval: z.string(),
//   nextBilling: z.string(),
//   features: z.array(z.string()),
// });
// ,
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
      <DashboardLayout
        left={
          <div className="space-y-4">
            {/* TODO: Port your left sidebar content here */}
          </div>
        }
        center={
          <div className="space-y-4">
            {/* TODO: Port your main content here */}
          </div>
        }
        right={
          <div className="space-y-4">
            {/* TODO: Port your right sidebar content here */}
          </div>
        }
      />
    );
  }

  return (
    <DashboardLayout
      left={
        <div className="space-y-4">
          {/* TODO: Port your left sidebar content here */}
        </div>
      }
      center={
        <div className="space-y-4">
          {/* TODO: Port your main content here */}
        </div>
      }
      right={
        <div className="space-y-4">
          {/* TODO: Port your right sidebar content here */}
        </div>
      }
    />
  );
}
