import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  SubscriptionMetrics,
  Plan,
  Payment,
  Refund,
  SubscriptionFilters,
} from "@/lib/types/subscription";

interface SubscriptionState {
  metrics: SubscriptionMetrics | null;
  plans: Plan[];
  payments: Payment[];
  refunds: Refund[];
  loading: boolean;
  filters: SubscriptionFilters;
}

const initialState: SubscriptionState = {
  metrics: null,
  plans: [],
  payments: [],
  refunds: [],
  loading: false,
  filters: {},
};

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    setMetrics: (state, action: PayloadAction<SubscriptionMetrics>) => {
      state.metrics = action.payload;
    },
    setPlans: (state, action: PayloadAction<Plan[]>) => {
      state.plans = action.payload;
    },
    addPlan: (state, action: PayloadAction<Plan>) => {
      state.plans.push(action.payload);
    },
    updatePlan: (state, action: PayloadAction<Plan>) => {
      const index = state.plans.findIndex(
        (p) => p._id === action.payload._id
      );
      if (index !== -1) {
        state.plans[index] = action.payload;
      }
    },
    archivePlan: (state, action: PayloadAction<string>) => {
      const plan = state.plans.find((p) => p._id === action.payload);
      if (plan) {
        plan.status = "Archived";
      }
    },
    setPayments: (state, action: PayloadAction<Payment[]>) => {
      state.payments = action.payload;
    },
    addPayment: (state, action: PayloadAction<Payment>) => {
      state.payments.unshift(action.payload);
    },
    updatePayment: (state, action: PayloadAction<Payment>) => {
      const index = state.payments.findIndex(
        (p) => p._id === action.payload._id
      );
      if (index !== -1) {
        state.payments[index] = action.payload;
      }
    },
    setRefunds: (state, action: PayloadAction<Refund[]>) => {
      state.refunds = action.payload;
    },
    updateRefund: (state, action: PayloadAction<Refund>) => {
      const index = state.refunds.findIndex(
        (r) => r._id === action.payload._id
      );
      if (index !== -1) {
        state.refunds[index] = action.payload;
      }
    },
    setFilters: (state, action: PayloadAction<SubscriptionFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    resetFilters: (state) => {
      state.filters = {};
    },
  },
});

export const {
  setMetrics,
  setPlans,
  addPlan,
  updatePlan,
  archivePlan,
  setPayments,
  addPayment,
  updatePayment,
  setRefunds,
  updateRefund,
  setFilters,
  setLoading,
  resetFilters,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;

