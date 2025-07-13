-- Add YLX token reward tracking columns to screams table
ALTER TABLE public.screams 
ADD COLUMN ylx_tokens_rewarded boolean DEFAULT false,
ADD COLUMN ylx_reward_signature text;