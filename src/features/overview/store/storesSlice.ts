import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchStores } from "@/features/overview/api";
import type { Store } from "../types";

interface StoresState {
  items: Store[];
  loading: boolean;
  error: string | null;
}

const initialState: StoresState = {
  items: [],
  loading: false,
  error: null,
};

export const loadStores = createAsyncThunk("stores/load", async () => {
  return fetchStores() as Promise<Store[]>;
});

const storesSlice = createSlice({
  name: "stores",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadStores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadStores.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(loadStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load stores.";
      });
  },
});

export default storesSlice.reducer;
