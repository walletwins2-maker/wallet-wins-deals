## Refresh the deals data one time

Force the site to pull a fresh set of deals right away, without waiting for the usual daily refresh.

### What changes
- Change the deals cache key in `src/lib/deals-query.ts` from `manual-refresh-2026-07-02b` to `manual-refresh-2026-10-23`. This throws away the old saved batch, so the next visit loads current deals.
- The daily refresh schedule stays as it is. Nothing else changes.

### Check
- Load the homepage and confirm the deal cards show up with the new data.
