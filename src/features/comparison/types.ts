import type { Store } from "@/types";

export interface ComparisonRow {
  storeId: string;
  storeName: string;
  region: Store["region"];
  totalRevenue: number;
  totalTransactions: number;
  avgBasket: number;
  changePct?: number;
  previousRevenue: number;
}
