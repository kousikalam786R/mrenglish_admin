import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  KPIs,
  TrendData,
  FunnelStep,
  CohortData,
  HeatmapData,
  TopUser,
  AnalyticsFilters,
} from "@/lib/types/analytics";

interface AnalyticsState {
  kpis: KPIs | null;
  trends: Record<string, TrendData>;
  funnel: FunnelStep[];
  cohorts: CohortData[];
  heatmap: HeatmapData[];
  topUsers: TopUser[];
  filters: AnalyticsFilters;
  loading: boolean;
}

const initialState: AnalyticsState = {
  kpis: null,
  trends: {},
  funnel: [],
  cohorts: [],
  heatmap: [],
  topUsers: [],
  filters: {
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    dateTo: new Date().toISOString().split("T")[0],
    platform: "all",
    plan: "all",
  },
  loading: false,
};

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    setKPIs: (state, action: PayloadAction<KPIs>) => {
      state.kpis = action.payload;
    },
    setTrends: (state, action: PayloadAction<Record<string, TrendData>>) => {
      state.trends = action.payload;
    },
    setFunnel: (state, action: PayloadAction<FunnelStep[]>) => {
      state.funnel = action.payload;
    },
    setCohorts: (state, action: PayloadAction<CohortData[]>) => {
      state.cohorts = action.payload;
    },
    setHeatmap: (state, action: PayloadAction<HeatmapData[]>) => {
      state.heatmap = action.payload;
    },
    setTopUsers: (state, action: PayloadAction<TopUser[]>) => {
      state.topUsers = action.payload;
    },
    setFilters: (state, action: PayloadAction<AnalyticsFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    resetFilters: (state) => {
      state.filters = {
        dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        dateTo: new Date().toISOString().split("T")[0],
        platform: "all",
        plan: "all",
      };
    },
  },
});

export const {
  setKPIs,
  setTrends,
  setFunnel,
  setCohorts,
  setHeatmap,
  setTopUsers,
  setFilters,
  setLoading,
  resetFilters,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;

