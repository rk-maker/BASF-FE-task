import type { DailyRevenuePoint } from "@/types";
import type { ComparisonRow } from "../types";

interface StoreLike {
  id: string;
  name: string;
  region?: string;
}

export function indexByStoreAndDate(points: DailyRevenuePoint[]) {
  const map = new Map<string, DailyRevenuePoint>();
  points.forEach((point) => map.set(`${point.storeId}|${point.date}`, point));
  return map;
}

function sumRevenue(points: Array<DailyRevenuePoint | undefined>) {
  return points.reduce((sum, point) => sum + (point?.revenue ?? 0), 0);
}

function sumTransactions(points: Array<DailyRevenuePoint | undefined>) {
  return points.reduce((sum, point) => sum + (point?.transactions ?? 0), 0);
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

interface BuildComparisonRowsArgs {
  storeIds: string[];
  stores: StoreLike[];
  dates: string[];
  revenueData: DailyRevenuePoint[];
  previousDates: string[];
  previousRevenueData: DailyRevenuePoint[];
}

/** Reduces raw daily revenue points (current + previous period) down to one
 * summary row per selected store. Pure and easy to unit test in isolation
 * from React/Redux. */
export function buildComparisonRows({
  storeIds,
  stores,
  dates,
  revenueData,
  previousDates,
  previousRevenueData,
}: BuildComparisonRowsArgs): ComparisonRow[] {
  const revenueMap = indexByStoreAndDate(revenueData);
  const previousRevenueMap = indexByStoreAndDate(previousRevenueData);

  return storeIds.map((storeId) => {
    const store = stores.find((item) => item.id === storeId);
    const currentPoints = dates.map((date) =>
      revenueMap.get(`${storeId}|${date}`),
    );
    const previousPoints = previousDates.map((date) =>
      previousRevenueMap.get(`${storeId}|${date}`),
    );

    const totalRevenue = sumRevenue(currentPoints);
    const totalTransactions = sumTransactions(currentPoints);
    const previousRevenue = sumRevenue(previousPoints);
    const avgBasket = totalTransactions
      ? round2(totalRevenue / totalTransactions)
      : 0;

    // No revenue in the prior period to compare against: if this period also
    // made nothing, call it 0% change; otherwise there's no meaningful
    // percentage (can't divide by zero) so leave it undefined and let the
    // grid render it as e.g. "New".
    const changePct =
      previousRevenue === 0
        ? totalRevenue === 0
          ? 0
          : undefined
        : ((totalRevenue - previousRevenue) / previousRevenue) * 100;

    return {
      storeId,
      storeName: store?.name ?? storeId,
      region: store?.region ?? "North",
      totalRevenue: round2(totalRevenue),
      totalTransactions,
      avgBasket,
      changePct,
      previousRevenue: round2(previousRevenue),
    };
  });
}
