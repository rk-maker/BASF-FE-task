import { configureStore } from "@reduxjs/toolkit";
import auth from "../features/auth/store/authSlice";
import filters from "../features/overview/store/filtersSlice";
import stores from "../features/overview/store/storesSlice";
import transactions from "../features/overview/store/transactionsSlice";

export const store = configureStore({
  reducer: {
    auth,
    filters,
    stores,
    transactions,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
