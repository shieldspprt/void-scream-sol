-- Fix security issue: Set search_path for system wallet function
DROP FUNCTION IF EXISTS public.get_system_wallet_address();

CREATE OR REPLACE FUNCTION public.get_system_wallet_address()
RETURNS text AS $$
BEGIN
  RETURN 'SYSTEM_AI_WALLET_11111111111111111111111111111';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;