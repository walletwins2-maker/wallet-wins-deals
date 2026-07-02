-- Revoke EXECUTE from PUBLIC/anon/authenticated on SECURITY DEFINER helper
-- functions in the public schema; only service_role should invoke them.
DO $$
DECLARE
  fn_signature text;
  fns text[] := ARRAY[
    'public.delete_email(text, bigint)',
    'public.read_email_batch(text, integer, integer)',
    'public.enqueue_email(text, jsonb)',
    'public.move_to_dlq(text, text, bigint, jsonb)',
    'public.email_queue_wake()',
    'public.email_queue_dispatch()'
  ];
BEGIN
  FOREACH fn_signature IN ARRAY fns LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', fn_signature);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', fn_signature);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM authenticated', fn_signature);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', fn_signature);
  END LOOP;
END $$;