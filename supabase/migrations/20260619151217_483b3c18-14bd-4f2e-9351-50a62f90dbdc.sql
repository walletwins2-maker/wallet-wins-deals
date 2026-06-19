GRANT INSERT ON TABLE public.newsletter_subscribers TO anon;
GRANT INSERT ON TABLE public.newsletter_subscribers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.newsletter_subscribers TO service_role;