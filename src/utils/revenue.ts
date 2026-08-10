import type { Transaction } from "@/types";

export interface DayMethodPoint {
  date: string; // YYYY-MM-DD
  method: Transaction["paymentMethod"];
  revenue: number;
}

function localDateFromTimestamp(timestamp: string): string {
  return timestamp.split("T")[0] ?? timestamp;
}

/** Group transactions into revenue per calendar day and payment method. */
export function groupByDayAndMethod(
  transactions: Transaction[],
): DayMethodPoint[] {
  const buckets = new Map<string, DayMethodPoint>();
  for (const t of transactions) {
    const date = localDateFromTimestamp(t.timestamp);
    const key = `${date}|${t.paymentMethod}`;
    let b = buckets.get(key);
    if (!b) {
      b = { date, method: t.paymentMethod, revenue: 0 };
      buckets.set(key, b);
    }
    b.revenue = Math.round((b.revenue + t.amount) * 100) / 100;
  }

  return [...buckets.values()].sort((a, b) => {
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    return a.method.localeCompare(b.method);
  });
}

export interface Summary {
  totalRevenue: number;
  totalTransactions: number;
  avgBasket: number;
  busiestDay: string;
}

/** Aggregate stats for the current selection. */
export function computeSummary(transactions: Transaction[]): Summary {
  let totalRevenue = 0;
  const perDay = new Map<string, number>();
  const seen = new Set<string>();

  for (const t of transactions) {
    if (seen.has(t.id)) continue;
    seen.add(t.id);

    totalRevenue += t.amount;
    const day = localDateFromTimestamp(t.timestamp);
    perDay.set(day, (perDay.get(day) ?? 0) + t.amount);
  }

  let busiestDay = "";
  let max = -1;
  for (const [day, rev] of perDay) {
    if (rev > max) {
      max = rev;
      busiestDay = day;
    }
  }

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalTransactions: seen.size,
    avgBasket: seen.size
      ? Math.round((totalRevenue / seen.size) * 100) / 100
      : 0,
    busiestDay,
  };
}
