-- Insert sample weird screams for demo purposes
INSERT INTO public.screams (
  message, 
  ex_type, 
  has_audio, 
  action, 
  wallet_address, 
  likes,
  created_at
) VALUES 
(
  'SHE SAID MY POKEMON CARD COLLECTION WASN''T "MATURE ENOUGH" FOR A 30-YEAR-OLD. EXCUSE ME?! THESE ARE INVESTMENTS, KAREN!', 
  'Commitment-phobe', 
  false, 
  'post', 
  '11111111111111111111111111111112',
  42,
  NOW() - INTERVAL '2 hours'
),
(
  'HE BROKE UP WITH ME VIA A SPOTIFY PLAYLIST CALLED "WE NEED TO TALK" AND THE FIRST SONG WAS "SOMEBODY THAT I USED TO KNOW"... I CANT EVEN', 
  'Coward', 
  false, 
  'post', 
  '11111111111111111111111111111113',
  67,
  NOW() - INTERVAL '5 hours'
),
(
  'MY EX GHOSTED ME AND THEN LIKED MY LINKEDIN POST ABOUT PROFESSIONAL COMMUNICATION. THE AUDACITY IS ASTRONOMICAL!!!', 
  'Hypocrite', 
  false, 
  'post', 
  '11111111111111111111111111111114',
  89,
  NOW() - INTERVAL '1 day'
),
(
  'She dumped me because I put pineapple on pizza. PINEAPPLE ON PIZZA! What''s next, breaking up over cereal preferences?!', 
  'Control freak', 
  false, 
  'post', 
  '11111111111111111111111111111115',
  23,
  NOW() - INTERVAL '3 hours'
),
(
  'HE SAID I WAS "TOO EMOTIONALLY AVAILABLE" BRUH WHAT DOES THAT EVEN MEAN?! SORRY FOR HAVING FEELINGS AND COMMUNICATION SKILLS!', 
  'Emotionally unavailable', 
  false, 
  'post', 
  '11111111111111111111111111111116',
  156,
  NOW() - INTERVAL '8 hours'
),
(
  'MY EX RETURNED MY HOODIE... WASHED, FOLDED, AND WITH A THANK YOU NOTE. WHO DOES THAT?! THE PSYCHOLOGICAL WARFARE IS REAL', 
  'Passive-aggressive', 
  false, 
  'post', 
  '11111111111111111111111111111117',
  34,
  NOW() - INTERVAL '6 hours'
),
(
  'SHE BROKE UP WITH ME OVER TEXT WHILE I WAS IN THE MIDDLE OF BUILDING US A MINECRAFT HOUSE. A MINECRAFT HOUSE!!! THE COMMITMENT WAS REAL', 
  'Immature', 
  false, 
  'post', 
  '11111111111111111111111111111118',
  78,
  NOW() - INTERVAL '4 hours'
),
(
  'He said my Star Wars knowledge was "intimidating" and made him feel "intellectually inadequate." SIR, KNOWING THE EXPANDED UNIVERSE IS A GIFT!', 
  'Insecure', 
  false, 
  'post', 
  '11111111111111111111111111111119',
  91,
  NOW() - INTERVAL '12 hours'
),
(
  'MY EX JUST UPDATED THEIR RELATIONSHIP STATUS TO "IN A RELATIONSHIP" 3 DAYS AFTER OUR BREAKUP. THREE. DAYS. THE MATH AIN''T MATHING!', 
  'Cheater', 
  false, 
  'post', 
  '11111111111111111111111111111120',
  203,
  NOW() - INTERVAL '30 minutes'
),
(
  'She said I was "too into" true crime podcasts. APPARENTLY KNOWING HOW TO SPOT A SERIAL KILLER IS A RED FLAG NOW?!', 
  'Judgmental', 
  false, 
  'post', 
  '11111111111111111111111111111121',
  45,
  NOW() - INTERVAL '7 hours'
),
(
  'HE DUMPED ME BECAUSE I CORRECTED HIS GRAMMAR IN TEXTS. SORRY FOR HAVING STANDARDS AND BASIC EDUCATION!', 
  'Narcissist', 
  false, 
  'post', 
  '11111111111111111111111111111122',
  67,
  NOW() - INTERVAL '9 hours'
),
(
  'MY EX SAID I WAS "TOO MUCH" AND NOW THEY''RE DATING SOMEONE WHO POSTS 47 SELFIES A DAY. MAKE IT MAKE SENSE!!!', 
  'Liar', 
  false, 
  'post', 
  '11111111111111111111111111111123',
  112,
  NOW() - INTERVAL '2 days'
)