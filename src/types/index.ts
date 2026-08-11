//this file contain the shared types across the application, including store and daily revenue point types.
export interface Store {
  id: string;
  name: string;
  city: string;
  region: "North" | "South" | "East" | "West";
  openedAt: string; // ISO date
}

export interface DailyRevenuePoint {
  date: string; // YYYY-MM-DD
  storeId: string;
  revenue: number;
  transactions: number;
}
