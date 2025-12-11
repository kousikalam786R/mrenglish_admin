import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AdminUser, AdminRole } from "@/lib/types";

interface UserState {
  name: string;
  role: AdminRole;
  email: string;
  permissions: string[];
  isAuthenticated: boolean;
}

const initialState: UserState = {
  name: "Super Admin",
  role: "super_admin",
  email: "admin@mre.com",
  permissions: [],
  isAuthenticated: true,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AdminUser>) => {
      state.name = action.payload.name;
      state.role = action.payload.role;
      state.email = action.payload.email;
      state.isAuthenticated = true;
    },
    setPermissions: (state, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;
    },
    clearUser: (state) => {
      state.name = "";
      state.role = "super_admin";
      state.email = "";
      state.permissions = [];
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, setPermissions, clearUser } = userSlice.actions;
export default userSlice.reducer;

