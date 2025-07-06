-- Create screams table for storing user submissions
CREATE TABLE public.screams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT,
  ex_type TEXT,
  has_audio BOOLEAN DEFAULT FALSE,
  audio_data TEXT, -- base64 encoded audio data
  action TEXT NOT NULL CHECK (action IN ('burn', 'post')),
  wallet_address TEXT NOT NULL,
  transaction_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  likes INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE public.screams ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (anonymous posting)
CREATE POLICY "Anyone can view posted screams" 
ON public.screams 
FOR SELECT 
USING (action = 'post');

CREATE POLICY "Anyone can insert screams" 
ON public.screams 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update likes on posted screams" 
ON public.screams 
FOR UPDATE 
USING (action = 'post')
WITH CHECK (action = 'post');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_screams_updated_at
BEFORE UPDATE ON public.screams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_screams_action_created_at ON public.screams(action, created_at DESC);
CREATE INDEX idx_screams_wallet_address ON public.screams(wallet_address);