import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, UserFilters } from "@/lib/types/user";

interface UserListState {
  users: User[];
  loading: boolean;
  filters: UserFilters;
  selectedUser: User | null;
}

const initialState: UserListState = {
  users: [],
  loading: false,
  filters: {
    accountType: "all",
    subscriptionType: "all",
  },
  selectedUser: null,
};

const userListSlice = createSlice({
  name: "userList",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    setFilters: (state, action: PayloadAction<UserFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    resetFilters: (state) => {
      state.filters = {
        accountType: "all",
        subscriptionType: "all",
      };
    },
  },
});

export const {
  setUsers,
  setFilters,
  setSelectedUser,
  setLoading,
  resetFilters,
} = userListSlice.actions;

export default userListSlice.reducer;

