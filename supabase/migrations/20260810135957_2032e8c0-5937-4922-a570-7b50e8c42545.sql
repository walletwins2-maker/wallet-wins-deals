CREATE TABLE public.deal_checks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id text NOT NULL UNIQUE,
  product_url text,
  last_checked_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.deal_checks TO service_role;

ALTER TABLE public.deal_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage deal checks"
  ON public.deal_checks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER set_deal_checks_updated_at
  BEFORE UPDATE ON public.deal_checks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();