// This file contains the Redux slice for transactions, including actions and reducers for loading and filtering transactions.
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { fetchTransactions } from "@/features/overview/api";
import type { Transaction } from "../types";

interface TransactionsState {
  items: Transaction[];
  filtered: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  items: [],
  filtered: [],
  loading: false,
  error: null,
};

export const loadTransactions = createAsyncThunk(
  "transactions/load",
  async (params: { storeId: string; from: string; to: string }) => {
    return fetchTransactions(params) as Promise<Transaction[]>;
  },
);

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    filteredUpdated(state, action: PayloadAction<Transaction[]>) {
      state.filtered = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTransactions.fulfilled, (state, action) => {
        state.items = action.payload;
        state.filtered = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(loadTransactions.rejected, (state, action) => {
        state.loading = false;
        state.items = [];
        state.filtered = [];
        state.error = action.error.message ?? "Failed to load transactions.";
      });
  },
});

export const { filteredUpdated } = transactionsSlice.actions;
export default transactionsSlice.reducer;
