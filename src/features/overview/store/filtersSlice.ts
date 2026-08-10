// This file contains the Redux slice for filters in the overview feature, including actions and reducers for selecting stores, changing date ranges, and updating search terms.
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import dayjs, { Dayjs } from "dayjs";

interface FiltersState {
  selectedStoreId: string;
  dateRange: [Dayjs, Dayjs];
  search: string;
}

const initialState: FiltersState = {
  selectedStoreId: "s01",
  dateRange: [dayjs().subtract(13, "day"), dayjs()],
  search: "",
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    storeSelected(state, action: PayloadAction<string>) {
      state.selectedStoreId = action.payload;
    },
    dateRangeChanged(state, action: PayloadAction<[Dayjs, Dayjs]>) {
      state.dateRange = action.payload;
    },
    searchChanged(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
  },
});

export const { storeSelected, dateRangeChanged, searchChanged } =
  filtersSlice.actions;
export default filtersSlice.reducer;
