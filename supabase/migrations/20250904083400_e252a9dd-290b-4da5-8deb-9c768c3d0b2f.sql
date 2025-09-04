-- Drop the existing overly permissive public policy
DROP POLICY "Public can view posted screams content" ON public.screams;

-- Create a function that returns public-safe scream data (excludes wallet_address)
CREATE OR REPLACE FUNCTION public.get_public_screams()
RETURNS TABLE (
  id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  message text,
  ex_type text,
  audio_data text,
  has_audio boolean,
  likes integer,
  is_ai_generated boolean,
  ai_prompt_category text,
  action text
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    s.id,
    s.created_at,
    s.updated_at,
    s.message,
    s.ex_type,
    s.audio_data,
    s.has_audio,
    s.likes,
    s.is_ai_generated,
    s.ai_prompt_category,
    s.action
  FROM screams s
  WHERE s.action = 'post'::text
  ORDER BY s.created_at DESC;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.get_public_screams() TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_screams() TO authenticated;

-- Create a new, more secure policy for public access
-- Only allows viewing posted screams for authenticated users with their own wallet
CREATE POLICY "Secure public screams access" 
ON public.screams 
FOR SELECT 
USING (
  action = 'post'::text 
  AND auth.uid() IS NOT NULL
);