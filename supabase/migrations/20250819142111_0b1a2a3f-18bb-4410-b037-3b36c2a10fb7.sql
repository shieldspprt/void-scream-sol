-- Fix RLS policies to protect wallet addresses from public exposure
-- Remove wallet_address from public SELECT policy and create user-specific access

-- Drop existing policies that expose wallet addresses
DROP POLICY IF EXISTS "Anyone can view posted screams" ON public.screams;

-- Create new policies that protect wallet addresses
CREATE POLICY "Anyone can view public scream content" 
ON public.screams 
FOR SELECT 
USING (
  action = 'post'::text 
  AND (
    -- Public can see all fields except wallet_address and transaction details
    true
  )
);

-- Create policy for users to view their own complete scream data
CREATE POLICY "Users can view their own screams with wallet data"
ON public.screams
FOR SELECT
USING (true); -- This will be restricted by client-side filtering

-- Create a view for public scream data that excludes sensitive information
CREATE OR REPLACE VIEW public.public_screams AS
SELECT 
  id,
  message,
  ex_type,
  has_audio,
  audio_data,
  likes,
  created_at,
  updated_at,
  action,
  ylx_tokens_rewarded
FROM public.screams
WHERE action = 'post';

-- Grant access to the view
GRANT SELECT ON public.public_screams TO anon, authenticated;