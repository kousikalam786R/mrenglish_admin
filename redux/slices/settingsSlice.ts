import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  CompanyInfo,
  Role,
  Integration,
  BillingInfo,
  Webhook,
  AppearanceSettings,
  EmailTemplate,
  AuditLog,
  SecuritySettings,
  Localization,
  SettingsFilters,
} from "@/lib/types/settings";

interface SettingsState {
  company: CompanyInfo | null;
  roles: Role[];
  integrations: Integration[];
  billing: BillingInfo | null;
  webhooks: Webhook[];
  templates: EmailTemplate[];
  auditLogs: AuditLog[];
  security: SecuritySettings | null;
  localization: Localization | null;
  loading: boolean;
  errors: Record<string, string>;
  filters: SettingsFilters;
}

const initialState: SettingsState = {
  company: null,
  roles: [],
  integrations: [],
  billing: null,
  webhooks: [],
  templates: [],
  auditLogs: [],
  security: null,
  localization: null,
  loading: false,
  errors: {},
  filters: {},
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setCompany: (state, action: PayloadAction<CompanyInfo>) => {
      state.company = action.payload;
    },
    setRoles: (state, action: PayloadAction<Role[]>) => {
      state.roles = action.payload;
    },
    addRole: (state, action: PayloadAction<Role>) => {
      state.roles.push(action.payload);
    },
    updateRole: (state, action: PayloadAction<Role>) => {
      const index = state.roles.findIndex((r) => r._id === action.payload._id);
      if (index !== -1) {
        state.roles[index] = action.payload;
      }
    },
    removeRole: (state, action: PayloadAction<string>) => {
      state.roles = state.roles.filter((r) => r._id !== action.payload);
    },
    setIntegrations: (state, action: PayloadAction<Integration[]>) => {
      state.integrations = action.payload;
    },
    updateIntegration: (state, action: PayloadAction<Integration>) => {
      const index = state.integrations.findIndex(
        (i) => i._id === action.payload._id
      );
      if (index !== -1) {
        state.integrations[index] = action.payload;
      }
    },
    setBilling: (state, action: PayloadAction<BillingInfo>) => {
      state.billing = action.payload;
    },
    setWebhooks: (state, action: PayloadAction<Webhook[]>) => {
      state.webhooks = action.payload;
    },
    addWebhook: (state, action: PayloadAction<Webhook>) => {
      state.webhooks.push(action.payload);
    },
    updateWebhook: (state, action: PayloadAction<Webhook>) => {
      const index = state.webhooks.findIndex(
        (w) => w._id === action.payload._id
      );
      if (index !== -1) {
        state.webhooks[index] = action.payload;
      }
    },
    removeWebhook: (state, action: PayloadAction<string>) => {
      state.webhooks = state.webhooks.filter((w) => w._id !== action.payload);
    },
    setTemplates: (state, action: PayloadAction<EmailTemplate[]>) => {
      state.templates = action.payload;
    },
    updateTemplate: (state, action: PayloadAction<EmailTemplate>) => {
      const index = state.templates.findIndex(
        (t) => t._id === action.payload._id
      );
      if (index !== -1) {
        state.templates[index] = action.payload;
      }
    },
    setAuditLogs: (state, action: PayloadAction<AuditLog[]>) => {
      state.auditLogs = action.payload;
    },
    setSecurity: (state, action: PayloadAction<SecuritySettings>) => {
      state.security = action.payload;
    },
    setLocalization: (state, action: PayloadAction<Localization>) => {
      state.localization = action.payload;
    },
    setAppearance: (state, action: PayloadAction<AppearanceSettings>) => {
      // Appearance is stored separately or can be merged into company
      // For now, we'll handle it separately
    },
    setFilters: (state, action: PayloadAction<SettingsFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<{ key: string; message: string }>) => {
      state.errors[action.payload.key] = action.payload.message;
    },
    clearError: (state, action: PayloadAction<string>) => {
      delete state.errors[action.payload];
    },
    resetFilters: (state) => {
      state.filters = {};
    },
  },
});

export const {
  setCompany,
  setRoles,
  addRole,
  updateRole,
  removeRole,
  setIntegrations,
  updateIntegration,
  setBilling,
  setWebhooks,
  addWebhook,
  updateWebhook,
  removeWebhook,
  setTemplates,
  updateTemplate,
  setAuditLogs,
  setSecurity,
  setLocalization,
  setAppearance,
  setFilters,
  setLoading,
  setError,
  clearError,
  resetFilters,
} = settingsSlice.actions;

export default settingsSlice.reducer;

