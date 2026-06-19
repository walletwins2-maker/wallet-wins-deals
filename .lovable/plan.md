## Add Saving Guides section to homepage

Add a new "Saving Guides" section on the homepage (`src/routes/index.tsx`) placed directly under the hero (the section containing the "Shop Electronics" button), so it sits in the top area of the page above Featured Deals.

### Content
Surface all three existing guides as cards linking to their routes:
- Amazon Bin Stores → `/guides/amazon-bin-stores`
- Costco Coupon Book → `/guides/costco-coupon-book`
- Liquidation Stores → `/guides/liquidation-stores`

Each card shows: guide title, a one-line description, and a "Read guide →" affordance. Cards use the existing `bg-card` / `border-border` / `shadow-card` tokens and the same hover lift used by retailer cards for visual consistency.

### Layout
- Section header: "Saving Guides" with a short subtitle ("Tips and walkthroughs to save more").
- Responsive grid: 1 column on mobile, 2 on `sm`, 3 on `lg`.
- No new routes, data, or backend changes — the guide routes already exist.

### Future-proofing
Define the guide list as a small in-file array (slug, title, description) so adding a new guide is a one-line change. (Optional: extract to `src/lib/guides.ts` later if reused on other pages — not in scope now.)

### Files
- `src/routes/index.tsx` — insert new section between the hero (`</section>`) and `{/* Featured */}`.
