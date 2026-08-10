//endpoint for overview page
import { api } from "@/api/client";

export async function fetchStores(): Promise<unknown> {
  const res = await api.get<unknown>("/stores");
  return res.data;
}

export async function fetchTransactions(params: {
  storeId: string;
  from?: string;
  to?: string;
  limit?: number;
}): Promise<unknown> {
  const res = await api.get<unknown>("/transactions", { params });
  return res.data;
}

export async function fetchDailyRevenue(params: {
  storeIds: string[];
  from: string;
  to: string;
}): Promise<unknown> {
  const res = await api.get<unknown>("/daily-revenue", {
    params: { ...params, storeIds: params.storeIds.join(",") },
  });
  return res.data;
}
