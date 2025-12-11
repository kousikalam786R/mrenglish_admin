import {
  SubscriptionMetrics,
  Plan,
  Payment,
  Refund,
  SubscriptionFilters,
  PlanRevenue,
} from "@/lib/types/subscription";

// Mock subscription metrics
export async function fetchSubscriptionMetrics(
  filters: SubscriptionFilters
): Promise<SubscriptionMetrics> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    totalRevenue: 125000,
    mrr: 45000,
    arr: 540000,
    activeSubscriptions: 1250,
    churnRate: 2.5,
    period: "monthly",
  };
}

// Mock plans
export async function fetchPlans(): Promise<Plan[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return [
    {
      _id: "1",
      name: "Basic Plan",
      price: 9.99,
      billingCycle: "Monthly",
      activeSubscribers: 450,
      status: "Active",
      description: "Perfect for beginners",
      features: ["Basic features", "Email support"],
      createdAt: "2024-01-01",
    },
    {
      _id: "2",
      name: "Pro Plan",
      price: 19.99,
      billingCycle: "Monthly",
      activeSubscribers: 600,
      status: "Active",
      description: "For professionals",
      features: ["All basic features", "Priority support", "Advanced analytics"],
      createdAt: "2024-01-15",
    },
    {
      _id: "3",
      name: "Enterprise Plan",
      price: 99.99,
      billingCycle: "Yearly",
      activeSubscribers: 200,
      status: "Active",
      description: "For enterprises",
      features: [
        "All pro features",
        "24/7 support",
        "Custom integrations",
        "Dedicated account manager",
      ],
      createdAt: "2024-02-01",
    },
    {
      _id: "4",
      name: "Starter Plan",
      price: 4.99,
      billingCycle: "Monthly",
      activeSubscribers: 0,
      status: "Archived",
      description: "Discontinued plan",
      createdAt: "2023-12-01",
    },
  ];
}

export async function createPlan(plan: Omit<Plan, "_id" | "createdAt" | "updatedAt">): Promise<Plan> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    ...plan,
    _id: Date.now().toString(),
    activeSubscribers: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function updatePlan(
  planId: string,
  data: Partial<Plan>
): Promise<Plan> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const plans = await fetchPlans();
  const plan = plans.find((p) => p._id === planId);
  if (!plan) throw new Error("Plan not found");

  return {
    ...plan,
    ...data,
    updatedAt: new Date().toISOString(),
  };
}

// Mock payments
export async function fetchPayments(
  filters: SubscriptionFilters
): Promise<Payment[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return [
    {
      _id: "1",
      transactionId: "TXN-2024-001",
      userId: "user-1",
      userName: "John Doe",
      userEmail: "john@example.com",
      planId: "1",
      planName: "Basic Plan",
      amount: 9.99,
      currency: "USD",
      paymentMethod: "Stripe",
      status: "Paid",
      date: "2024-12-01T10:30:00Z",
      refundable: true,
    },
    {
      _id: "2",
      transactionId: "TXN-2024-002",
      userId: "user-2",
      userName: "Jane Smith",
      userEmail: "jane@example.com",
      planId: "2",
      planName: "Pro Plan",
      amount: 19.99,
      currency: "USD",
      paymentMethod: "Razorpay",
      status: "Paid",
      date: "2024-12-02T14:20:00Z",
      refundable: true,
    },
    {
      _id: "3",
      transactionId: "TXN-2024-003",
      userId: "user-3",
      userName: "Bob Johnson",
      userEmail: "bob@example.com",
      planId: "3",
      planName: "Enterprise Plan",
      amount: 99.99,
      currency: "USD",
      paymentMethod: "Stripe",
      status: "Failed",
      date: "2024-12-03T09:15:00Z",
      refundable: false,
    },
    {
      _id: "4",
      transactionId: "TXN-2024-004",
      userId: "user-4",
      userName: "Alice Williams",
      userEmail: "alice@example.com",
      planId: "1",
      planName: "Basic Plan",
      amount: 9.99,
      currency: "USD",
      paymentMethod: "PayPal",
      status: "Refunded",
      date: "2024-11-28T16:45:00Z",
      refundable: false,
    },
  ];
}

export async function refundPayment(
  paymentId: string,
  reason: string
): Promise<{ success: boolean; refundId?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    refundId: `REF-${Date.now()}`,
  };
}

// Mock refunds
export async function fetchRefunds(): Promise<Refund[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return [
    {
      _id: "1",
      paymentId: "4",
      transactionId: "TXN-2024-004",
      userId: "user-4",
      userName: "Alice Williams",
      amount: 9.99,
      currency: "USD",
      reason: "Customer requested refund",
      status: "Resolved",
      date: "2024-11-29T10:00:00Z",
      resolvedAt: "2024-11-29T14:30:00Z",
      notes: "Refund processed successfully",
    },
    {
      _id: "2",
      paymentId: "5",
      transactionId: "TXN-2024-005",
      userId: "user-5",
      userName: "Charlie Brown",
      amount: 19.99,
      currency: "USD",
      reason: "Service not as expected",
      status: "Pending",
      date: "2024-12-05T11:20:00Z",
    },
  ];
}

// Top plans by revenue
export async function fetchTopPlansByRevenue(): Promise<PlanRevenue[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return [
    {
      planName: "Pro Plan",
      subscribers: 600,
      revenue: 11994,
      avgRevenuePerUser: 19.99,
    },
    {
      planName: "Basic Plan",
      subscribers: 450,
      revenue: 4495.5,
      avgRevenuePerUser: 9.99,
    },
    {
      planName: "Enterprise Plan",
      subscribers: 200,
      revenue: 19998,
      avgRevenuePerUser: 99.99,
    },
  ];
}

