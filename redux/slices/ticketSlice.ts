import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Ticket, TicketFilters, TicketStats } from "@/lib/types/ticket";

interface TicketState {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  loading: boolean;
  filters: TicketFilters;
  stats: TicketStats;
  selectedTicketIds: string[]; // For bulk actions
}

const initialState: TicketState = {
  tickets: [],
  selectedTicket: null,
  loading: false,
  filters: {
    priority: "all",
    status: "all",
    type: "all",
    assignedTo: "all",
  },
  stats: {
    unassigned: 0,
    open: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    avgResponseTime: 0,
    slaBreaches: 0,
  },
  selectedTicketIds: [],
};

const ticketSlice = createSlice({
  name: "ticket",
  initialState,
  reducers: {
    setTickets: (state, action: PayloadAction<Ticket[]>) => {
      state.tickets = action.payload;
    },
    setSelectedTicket: (state, action: PayloadAction<Ticket | null>) => {
      state.selectedTicket = action.payload;
    },
    setFilters: (state, action: PayloadAction<TicketFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setStats: (state, action: PayloadAction<TicketStats>) => {
      state.stats = action.payload;
    },
    updateTicketInList: (state, action: PayloadAction<Ticket>) => {
      const index = state.tickets.findIndex(
        (t) => t._id === action.payload._id
      );
      if (index !== -1) {
        state.tickets[index] = action.payload;
      }
      if (state.selectedTicket?._id === action.payload._id) {
        state.selectedTicket = action.payload;
      }
    },
    removeTickets: (state, action: PayloadAction<string[]>) => {
      state.tickets = state.tickets.filter(
        (t) => !action.payload.includes(t._id)
      );
    },
    addTicket: (state, action: PayloadAction<Ticket>) => {
      state.tickets.unshift(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    toggleTicketSelection: (state, action: PayloadAction<string>) => {
      const index = state.selectedTicketIds.indexOf(action.payload);
      if (index === -1) {
        state.selectedTicketIds.push(action.payload);
      } else {
        state.selectedTicketIds.splice(index, 1);
      }
    },
    selectAllTickets: (state) => {
      state.selectedTicketIds = state.tickets.map((t) => t._id);
    },
    clearSelection: (state) => {
      state.selectedTicketIds = [];
    },
    resetFilters: (state) => {
      state.filters = {
        priority: "all",
        status: "all",
        type: "all",
        assignedTo: "all",
      };
    },
  },
});

export const {
  setTickets,
  setSelectedTicket,
  setFilters,
  setStats,
  updateTicketInList,
  removeTickets,
  addTicket,
  setLoading,
  toggleTicketSelection,
  selectAllTickets,
  clearSelection,
  resetFilters,
} = ticketSlice.actions;

export default ticketSlice.reducer;

