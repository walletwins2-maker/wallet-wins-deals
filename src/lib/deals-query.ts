import { queryOptions } from "@tanstack/react-query";
import { fetchDealsServer } from "./deals.functions";
import type { Deal } from "./deals-data";

// Refresh the live deals feed every 2 hours. Keep data "fresh" for the same
// window so route re-mounts don't trigger extra fetches between refreshes.
const TWO_HOURS = 2 * 60 * 60 * 1000;

export const dealsQueryOptions = queryOptions<Deal[]>({
  queryKey: ["deals", "all"],
  queryFn: () => fetchDealsServer(),
  staleTime: TWO_HOURS,
  gcTime: TWO_HOURS * 2,
  refetchInterval: TWO_HOURS,
  refetchIntervalInBackground: true,
  refetchOnWindowFocus: false,
});