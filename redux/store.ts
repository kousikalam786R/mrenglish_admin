import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import userListReducer from "./slices/userListSlice";
import subscriptionReducer from "./slices/subscriptionSlice";
import ticketReducer from "./slices/ticketSlice";
import contentReducer from "./slices/contentSlice";
import analyticsReducer from "./slices/analyticsSlice";
import marketingReducer from "./slices/marketingSlice";
import developerReducer from "./slices/developerSlice";
import settingsReducer from "./slices/settingsSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    userList: userListReducer,
    subscription: subscriptionReducer,
    ticket: ticketReducer,
    content: contentReducer,
    analytics: analyticsReducer,
    marketing: marketingReducer,
    developer: developerReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

