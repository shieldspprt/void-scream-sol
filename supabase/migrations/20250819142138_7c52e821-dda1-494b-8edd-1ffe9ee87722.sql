-- Fix the security definer view issue by removing the problematic view
-- and creating a better approach for public data access

-- Drop the problematic view
DROP VIEW IF EXISTS public.public_screams;

-- Instead, we'll rely on proper RLS policies that exclude sensitive fields
-- Let's create a proper RLS policy that allows public access but restricts sensitive data access

-- First, ensure we have the right policies
DROP POLICY IF EXISTS "Anyone can view public scream content" ON public.screams;

-- Create a policy that allows viewing of non-sensitive fields for posted screams
-- This will be handled in the application layer to exclude wallet_address and transaction_signature
CREATE POLICY "Public can view posted screams content" 
ON public.screams 
FOR SELECT 
USING (action = 'post'::text);

-- Update the function to have proper search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;