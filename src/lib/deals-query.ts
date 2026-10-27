import { queryOptions } from "@tanstack/react-query";
import { fetchDealsServer } from "./deals.functions";
import type { Deal } from "./deals-data";

// Refresh the live deals feed once a day. Keep data "fresh" for the same
// window so route re-mounts don't trigger extra fetches between refreshes.
const ONE_DAY = 24 * 60 * 60 * 1000;

export const dealsQueryOptions = queryOptions<Deal[]>({
  queryKey: ["deals", "all", "amazon-deals-to-post-min20-2026-10-27"],
  queryFn: () => fetchDealsServer(),
  staleTime: ONE_DAY,
  gcTime: ONE_DAY * 2,
  refetchInterval: ONE_DAY,
  refetchIntervalInBackground: true,
  refetchOnWindowFocus: false,
});