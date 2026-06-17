import { queryOptions } from "@tanstack/react-query";
import { fetchDealsServer } from "./deals.functions";
import type { Deal } from "./deals-data";

export const dealsQueryOptions = queryOptions<Deal[]>({
  queryKey: ["deals", "all"],
  queryFn: () => fetchDealsServer(),
  staleTime: 60_000,
});