-- =====================================================================
-- Wallet Wins — one-shot Supabase setup
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
-- Safe to re-run (idempotent: IF NOT EXISTS / CREATE OR REPLACE).
-- Assumes existing tables: deals_to_post, retailers, posted_log
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------
create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists unaccent;   -- slug normalization


-- ---------------------------------------------------------------------
-- 1. Slug support for deals_to_post  (no new product table)
--    Adds a generated, URL-safe slug derived from product_name + id.
--    Example: "Dyson V15 Detect" + id 12345  ->  "dyson-v15-detect-12345"
-- ---------------------------------------------------------------------

-- Pure SQL slugifier — immutable so it can power a generated column / index.
create or replace function public.ww_slugify(txt text)
returns text
language sql
immutable
as $$
  select
    case
      when txt is null or length(trim(txt)) = 0 then 'deal'
      else
        trim(both '-' from
          regexp_replace(
            regexp_replace(
              lower(unaccent(txt)),
              '[^a-z0-9]+', '-', 'g'
            ),
            '-{2,}', '-', 'g'
          )
        )
    end
$$;

-- Add slug column if missing. Generated (STORED) so it stays in sync with
-- product_name automatically and never needs n8n changes.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'deals_to_post'
      and column_name = 'slug'
  ) then
    execute $sql$
      alter table public.deals_to_post
      add column slug text
      generated always as (
        public.ww_slugify(coalesce(product_name, '')) || '-' || id::text
      ) stored
    $sql$;
  end if;
end$$;

create unique index if not exists deals_to_post_slug_idx
  on public.deals_to_post (slug);


-- ---------------------------------------------------------------------
-- 2. live_deals view — the public source of truth for the website
--    Pulls only active/recent deals from deals_to_post. The site reads
--    from THIS view, never from deals_to_post directly.
-- ---------------------------------------------------------------------
create or replace view public.live_deals as
select *
from public.deals_to_post
where status in ('pending', 'queued')
  and created_at >= now() - interval '30 days';

-- Allow anon + authenticated to read the public view.
grant select on public.live_deals to anon, authenticated;

-- live_deals inherits RLS from deals_to_post. Make sure anon can read
-- the underlying rows that match the view's filter. If you'd rather keep
-- deals_to_post fully locked and expose only the view, replace this policy
-- with a SECURITY DEFINER function returning the same shape.
alter table public.deals_to_post enable row level security;

drop policy if exists "Public can read active deals" on public.deals_to_post;
create policy "Public can read active deals"
  on public.deals_to_post
  for select
  to anon, authenticated
  using (
    status in ('pending', 'queued')
    and created_at >= now() - interval '7 days'
  );

-- Helpful indexes for the view + filters/sorts used by the site.
create index if not exists deals_to_post_status_created_idx
  on public.deals_to_post (status, created_at desc);

create index if not exists deals_to_post_retailer_idx
  on public.deals_to_post (retailer);

create index if not exists deals_to_post_deal_score_idx
  on public.deals_to_post (deal_score desc nulls last);

CREATE INDEX IF NOT EXISTS deals_to_post_fingerprint_idx
ON public.deals_to_post (product_fingerprint);

CREATE INDEX IF NOT EXISTS deals_to_post_retailer_status_idx
ON public.deals_to_post (retailer, status);

-- If your table has final_score / discount columns, these speed up sorts.
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='deals_to_post'
               and column_name='final_score') then
    execute 'create index if not exists deals_to_post_final_score_idx
             on public.deals_to_post (final_score desc nulls last)';
  end if;
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='deals_to_post'
               and column_name='discount') then
    execute 'create index if not exists deals_to_post_discount_idx
             on public.deals_to_post (discount desc nulls last)';
  end if;
end$$;


-- ---------------------------------------------------------------------
-- 3. affiliate_clicks — click tracking
-- ---------------------------------------------------------------------
create table if not exists public.affiliate_clicks (
  id                  uuid primary key default gen_random_uuid(),
  product_fingerprint text,
  deal_id             bigint,           -- change to uuid if deals_to_post.id is uuid
  retailer            text,
  source_page         text,
  referrer            text,
  user_agent          text,
  ip_hash             text,             -- optional: hashed in app code
  clicked_at          timestamptz not null default now()
);

create index if not exists affiliate_clicks_clicked_at_idx
  on public.affiliate_clicks (clicked_at desc);
create index if not exists affiliate_clicks_retailer_idx
  on public.affiliate_clicks (retailer);
create index if not exists affiliate_clicks_fingerprint_idx
  on public.affiliate_clicks (product_fingerprint);

grant insert on public.affiliate_clicks to anon, authenticated;
grant select on public.affiliate_clicks to authenticated;  -- admin reads

alter table public.affiliate_clicks enable row level security;

drop policy if exists "Anyone can record a click" on public.affiliate_clicks;
create policy "Anyone can record a click"
  on public.affiliate_clicks
  for insert
  to anon, authenticated
  with check (true);

-- Only signed-in users can read clicks (refine to admins via your roles table).
drop policy if exists "Authenticated can read clicks" on public.affiliate_clicks;
create policy "Authenticated can read clicks"
  on public.affiliate_clicks
  for select
  to authenticated
  using (true);


-- ---------------------------------------------------------------------
-- 4. newsletter_subscribers
-- ---------------------------------------------------------------------
-- Store email as plain text and enforce case-insensitive uniqueness via a
-- functional index on lower(email). Avoids the citext extension entirely.
create table if not exists public.newsletter_subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  source_page   text,
  referrer      text,
  user_agent    text,
  confirmed     boolean not null default false,
  unsubscribed  boolean not null default false,
  created_at    timestamptz not null default now()
);

create unique index if not exists newsletter_subscribers_email_lower_uidx
  on public.newsletter_subscribers (lower(email));

create index if not exists newsletter_subscribers_created_idx
  on public.newsletter_subscribers (created_at desc);

grant insert on public.newsletter_subscribers to anon, authenticated;
grant select on public.newsletter_subscribers to authenticated;

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Anyone can subscribe" on public.newsletter_subscribers;
create policy "Anyone can subscribe"
  on public.newsletter_subscribers
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Authenticated can read subscribers" on public.newsletter_subscribers;
create policy "Authenticated can read subscribers"
  on public.newsletter_subscribers
  for select
  to authenticated
  using (true);


-- ---------------------------------------------------------------------
-- 5. Done.
-- After running:
--   • The site will read from public.live_deals
--   • /deal/:slug will resolve via deals_to_post.slug
--   • Get Deal clicks insert into affiliate_clicks
--   • Newsletter signups insert into newsletter_subscribers
-- ---------------------------------------------------------------------