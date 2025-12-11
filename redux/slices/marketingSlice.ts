import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Campaign,
  Template,
  Segment,
  ABTest,
  ScheduledCampaign,
  MarketingFilters,
} from "@/lib/types/marketing";

interface MarketingState {
  campaigns: Campaign[];
  templates: Template[];
  segments: Segment[];
  abtests: ABTest[];
  scheduled: ScheduledCampaign[];
  loading: boolean;
  filters: MarketingFilters;
  selectedCampaign: Campaign | null;
}

const initialState: MarketingState = {
  campaigns: [],
  templates: [],
  segments: [],
  abtests: [],
  scheduled: [],
  loading: false,
  filters: {
    type: "all",
    status: "all",
  },
  selectedCampaign: null,
};

const marketingSlice = createSlice({
  name: "marketing",
  initialState,
  reducers: {
    setCampaigns: (state, action: PayloadAction<Campaign[]>) => {
      state.campaigns = action.payload;
    },
    addCampaign: (state, action: PayloadAction<Campaign>) => {
      state.campaigns.unshift(action.payload);
    },
    updateCampaign: (state, action: PayloadAction<Campaign>) => {
      const index = state.campaigns.findIndex(
        (c) => c._id === action.payload._id
      );
      if (index !== -1) {
        state.campaigns[index] = action.payload;
      }
      if (state.selectedCampaign?._id === action.payload._id) {
        state.selectedCampaign = action.payload;
      }
    },
    setTemplates: (state, action: PayloadAction<Template[]>) => {
      state.templates = action.payload;
    },
    addTemplate: (state, action: PayloadAction<Template>) => {
      state.templates.unshift(action.payload);
    },
    setSegments: (state, action: PayloadAction<Segment[]>) => {
      state.segments = action.payload;
    },
    addSegment: (state, action: PayloadAction<Segment>) => {
      state.segments.unshift(action.payload);
    },
    setABTests: (state, action: PayloadAction<ABTest[]>) => {
      state.abtests = action.payload;
    },
    addABTest: (state, action: PayloadAction<ABTest>) => {
      state.abtests.unshift(action.payload);
    },
    setScheduled: (state, action: PayloadAction<ScheduledCampaign[]>) => {
      state.scheduled = action.payload;
    },
    setFilters: (state, action: PayloadAction<MarketingFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedCampaign: (state, action: PayloadAction<Campaign | null>) => {
      state.selectedCampaign = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    resetFilters: (state) => {
      state.filters = {
        type: "all",
        status: "all",
      };
    },
  },
});

export const {
  setCampaigns,
  addCampaign,
  updateCampaign,
  setTemplates,
  addTemplate,
  setSegments,
  addSegment,
  setABTests,
  addABTest,
  setScheduled,
  setFilters,
  setSelectedCampaign,
  setLoading,
  resetFilters,
} = marketingSlice.actions;

export default marketingSlice.reducer;

