-- Add AI content tracking fields to screams table
ALTER TABLE public.screams 
ADD COLUMN is_ai_generated boolean DEFAULT false,
ADD COLUMN ai_prompt_category text DEFAULT null;

-- Create system wallet constant for AI posts
CREATE OR REPLACE FUNCTION public.get_system_wallet_address()
RETURNS text AS $$
BEGIN
  RETURN 'SYSTEM_AI_WALLET_11111111111111111111111111111';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant necessary permissions for cron jobs
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;