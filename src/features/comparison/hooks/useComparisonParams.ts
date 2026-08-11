import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { Dayjs } from "dayjs";
import { normalizeRange } from "../utils/dateRange";

interface StoreLike {
  id: string;
}

/** Owns the `stores`/`from`/`to` query params: parses them, falls back to
 * sane defaults, and keeps the URL explicit so the view is shareable/
 * bookmarkable. Replaces the two separate useEffects + several inline
 * handlers that used to live in the page component. */
export function useComparisonParams(stores: StoreLike[]) {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryStoreIds = useMemo(() => {
    const ids = searchParams.get("stores")?.split(",").filter(Boolean) ?? [];
    return Array.from(new Set(ids));
  }, [searchParams]);

  const selectedRange = useMemo(
    () => normalizeRange(searchParams.get("from"), searchParams.get("to")),
    [searchParams],
  );

  const selectedStoreIds = useMemo(() => {
    if (!stores.length) return queryStoreIds.slice(0, 5);
    const validStoreIds = queryStoreIds.filter((id) =>
      stores.some((store) => store.id === id),
    );
    if (validStoreIds.length >= 2) return validStoreIds.slice(0, 5);
    return stores.slice(0, 2).map((store) => store.id);
  }, [queryStoreIds, stores]);

  const validSelection =
    selectedStoreIds.length >= 2 && selectedStoreIds.length <= 5;

  // Once stores have loaded, settle a bare/partial URL into an explicit
  // ?stores=&from=&to= so it's shareable. `replace: true` avoids stacking
  // browser-history entries for a change the effect made on its own.
  useEffect(() => {
    if (!stores.length) return;

    const next = new URLSearchParams(searchParams);
    next.set("stores", selectedStoreIds.join(","));
    next.set("from", selectedRange[0].format("YYYY-MM-DD"));
    next.set("to", selectedRange[1].format("YYYY-MM-DD"));

    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stores.length, selectedStoreIds.join(","), selectedRange]);

  const setStoreIds = (ids: string[]) => {
    const next = new URLSearchParams(searchParams);
    if (ids.length) {
      next.set("stores", ids.join(","));
    } else {
      next.delete("stores");
    }
    setSearchParams(next);
  };

  const setRange = (range: [Dayjs | null, Dayjs | null] | null) => {
    if (!range?.[0] || !range?.[1]) return;
    const next = new URLSearchParams(searchParams);
    next.set("from", range[0].format("YYYY-MM-DD"));
    next.set("to", range[1].format("YYYY-MM-DD"));
    setSearchParams(next);
  };

  return {
    selectedStoreIds,
    selectedRange,
    validSelection,
    setStoreIds,
    setRange,
  };
}
