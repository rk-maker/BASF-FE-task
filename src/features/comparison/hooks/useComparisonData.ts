import { useEffect, useState } from "react";
import type { Dayjs } from "dayjs";
import { fetchDailyRevenue } from "@/features/overview/api";
import type { DailyRevenuePoint } from "@/types";
import { getPreviousRange } from "../utils/dateRange";

interface UseComparisonDataResult {
  revenueData: DailyRevenuePoint[];
  previousRevenueData: DailyRevenuePoint[];
  loading: boolean;
  error: string | undefined;
}

/** Fetches current + previous-period revenue for the given stores/range.
 * `enabled` mirrors the old `validSelection` guard. Requests are cancelled
 * on cleanup so a fast store/range change can't have an older, slower
 * response overwrite a newer one. */
export function useComparisonData(
  storeIds: string[],
  range: [Dayjs, Dayjs],
  enabled: boolean,
): UseComparisonDataResult {
  const [revenueData, setRevenueData] = useState<DailyRevenuePoint[]>([]);
  const [previousRevenueData, setPreviousRevenueData] = useState<
    DailyRevenuePoint[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const from = range[0].format("YYYY-MM-DD");
  const to = range[1].format("YYYY-MM-DD");
  const storeKey = storeIds.join(",");

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const [prevFrom, prevTo] = getPreviousRange(range);

    setLoading(true);
    setError(undefined);

    Promise.all([
      fetchDailyRevenue({ storeIds, from, to }),
      fetchDailyRevenue({
        storeIds,
        from: prevFrom.format("YYYY-MM-DD"),
        to: prevTo.format("YYYY-MM-DD"),
      }),
    ])
      .then(([current, previous]) => {
        if (cancelled) return;
        setRevenueData(current as DailyRevenuePoint[]);
        setPreviousRevenueData(previous as DailyRevenuePoint[]);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err?.message ||
            "Unable to load store comparison data. Please try again or refresh the page.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeKey, from, to, enabled]);

  return { revenueData, previousRevenueData, loading, error };
}
