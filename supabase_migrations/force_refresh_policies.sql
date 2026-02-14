-- Force Refresh Policies and Triggers

DO $do$
BEGIN
    -- 1. Ensure `is_admin` is absolutely correct and accessible
    GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
    GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;

    -- 2. Clean up any weird triggers on premium_payments
    -- Check for specific known trigger names or just update updated_at trigger
    DROP TRIGGER IF EXISTS handle_updated_at ON public.premium_payments;
    -- If there's a trigger function
    
    -- 3. Re-apply the UPDATE policy with explicit WITH CHECK
    -- This ensures both old and new rows are validated correctly
    DROP POLICY IF EXISTS "Admins can update payments" ON public.premium_payments;
    
    CREATE POLICY "Admins can update payments"
        ON public.premium_payments
        FOR UPDATE
        USING ( public.is_admin() )
        WITH CHECK ( public.is_admin() );

    -- 4. Ensure admin can SELECT payments (already done but good measure)
    DROP POLICY IF EXISTS "Admins can view all payments" ON public.premium_payments;
    CREATE POLICY "Admins can view all payments"
        ON public.premium_payments FOR SELECT
        USING ( public.is_admin() );

    -- 5. Force Schema Cache Reload
    NOTIFY pgrst, 'reload config';
    
    RAISE NOTICE 'Refreshed policies and triggers for premium_payments';
END $do$;
