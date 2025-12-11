export interface SubscriptionMetrics {
  totalRevenue: number;
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  activeSubscriptions: number;
  churnRate: number;
  period: string; // "monthly" | "yearly"
}

export interface Plan {
  _id: string;
  name: string;
  price: number;
  billingCycle: "Monthly" | "Yearly";
  activeSubscribers: number;
  status: "Active" | "Archived";
  description?: string;
  features?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  _id: string;
  transactionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: "Paid" | "Failed" | "Refunded" | "Pending";
  date: string;
  receiptUrl?: string;
  refundable?: boolean;
}

export interface Refund {
  _id: string;
  paymentId: string;
  transactionId: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  reason: string;
  status: "Pending" | "Resolved" | "Rejected";
  date: string;
  resolvedAt?: string;
  notes?: string;
}

export interface SubscriptionFilters {
  dateFrom?: string;
  dateTo?: string;
  country?: string;
  planType?: "Monthly" | "Yearly" | "Trial" | "all";
  status?: string;
}

export interface PlanRevenue {
  planName: string;
  subscribers: number;
  revenue: number;
  avgRevenuePerUser: number;
}

