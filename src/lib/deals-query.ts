import { queryOptions } from "@tanstack/react-query";
import { fetchDealsServer } from "./deals.functions";
import type { Deal } from "./deals-data";

// Refresh the live deals feed once a day. Keep data "fresh" for the same
// window so route re-mounts don't trigger extra fetches between refreshes.
const ONE_DAY = 24 * 60 * 60 * 1000;

export const dealsQueryOptions = queryOptions<Deal[]>({
  queryKey: ["deals", "all", "manual-refresh-2026-07-02a"],
  queryFn: () => fetchDealsServer(),
  staleTime: ONE_DAY,
  gcTime: ONE_DAY * 2,
  refetchInterval: ONE_DAY,
  refetchIntervalInBackground: true,
  refetchOnWindowFocus: false,
});