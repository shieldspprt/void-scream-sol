import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Hilarious scream categories and prompts
const SCREAM_CATEGORIES = {
  'crypto_breakup': {
    personas: ['Crypto Karen', 'DeFi Chad', 'NFT Maximalist', 'Yield Farmer Sarah'],
    prompts: [
      "Write a hilarious breakup scream from someone who got dumped because their ex said they love crypto more than them. Make it dramatic and crypto-themed.",
      "Create a funny ex-lover scream about someone who broke up with their partner after losing all their money in a rug pull.",
      "Write a dramatic scream about getting dumped because they spent the vacation money on Dogecoin."
    ]
  },
  'dao_drama': {
    personas: ['DAO Founder Alex', 'Governance Token Holder', 'Smart Contract Dev'],
    prompts: [
      "Write a hilarious scream about DAO governance drama where someone's proposal got rejected by 0.1%.",
      "Create a funny business partner betrayal scream about a co-founder who voted against their own team.",
      "Write a dramatic scream about getting kicked out of a DAO for proposing to spend treasury on a company retreat."
    ]
  },
  'defi_disasters': {
    personas: ['Yield Farmer Mike', 'Liquidity Provider Lisa', 'DeFi Degen'],
    prompts: [
      "Write a hilarious scream about providing liquidity and getting rekt by impermanent loss.",
      "Create a funny scream about someone who got liquidated right before their favorite token pumped 10x.",
      "Write a dramatic scream about missing out on a 1000% APY farm because the gas fees were too high."
    ]
  },
  'nft_collector_rage': {
    personas: ['NFT Collector Jenny', 'OpenSea Flipper', 'PFP Enthusiast'],
    prompts: [
      "Write a hilarious scream about buying an NFT for 5 ETH and watching it drop to 0.001 ETH overnight.",
      "Create a funny betrayal scream about a friend who minted the same NFT collection they were saving up for.",
      "Write a dramatic scream about getting outbid by 0.01 ETH on their dream NFT."
    ]
  },
  'web3_dating': {
    personas: ['Crypto Twitter User', 'Web3 Developer', 'Blockchain Influencer'],
    prompts: [
      "Write a hilarious dating horror story scream about someone who only talked about their NFT collection on a first date.",
      "Create a funny scream about getting ghosted after sending someone their wallet address instead of their phone number.",
      "Write a dramatic scream about a date who turned out to be a Bitcoin maxi and wouldn't stop explaining why altcoins are scams."
    ]
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤖 Starting AI scream generation...');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { category, count = 1 } = await req.json().catch(() => ({}));
    
    // Select random category if not specified
    const categories = Object.keys(SCREAM_CATEGORIES);
    const selectedCategory = category || categories[Math.floor(Math.random() * categories.length)];
    const categoryData = SCREAM_CATEGORIES[selectedCategory as keyof typeof SCREAM_CATEGORIES];
    
    if (!categoryData) {
      throw new Error(`Invalid category: ${selectedCategory}`);
    }

    const screams = [];
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      // Select random persona and prompt
      const persona = categoryData.personas[Math.floor(Math.random() * categoryData.personas.length)];
      const prompt = categoryData.prompts[Math.floor(Math.random() * categoryData.prompts.length)];
      
      const systemPrompt = `You are ${persona}, a hilarious and dramatic character in the crypto/web3 space. 
      
      Generate an EXTREMELY SHORT, hilarious, and shareable scream (max 280 characters) that sounds authentic and relatable to the crypto community.
      
      Rules:
      - Keep it under 280 characters (Twitter/X length)
      - Use crypto slang and terminology naturally
      - Make it dramatic but funny
      - Include relevant emojis
      - Make it shareable and meme-worthy
      - NO hashtags
      - Focus on the emotional drama, not technical details
      
      The scream should sound like something someone would actually post when they're frustrated/angry.`;

      console.log(`🎭 Generating scream for persona: ${persona}, category: ${selectedCategory}`);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: 100,
          temperature: 0.9,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('OpenAI API error:', error);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedScream = data.choices[0].message.content.trim();
      
      // Clean up the scream (remove quotes, extra formatting)
      const cleanScream = generatedScream
        .replace(/^["']|["']$/g, '') // Remove leading/trailing quotes
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim();

      console.log(`✨ Generated scream: ${cleanScream}`);

      screams.push({
        message: cleanScream,
        category: selectedCategory,
        persona: persona,
        ex_type: getRandomExType(selectedCategory),
        length: cleanScream.length
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      screams,
      category: selectedCategory 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in generate-hilarious-screams function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getRandomExType(category: string): string {
  const exTypes = {
    'crypto_breakup': ['Ex-Lover', 'Ex-Boyfriend', 'Ex-Girlfriend'],
    'dao_drama': ['Business Partner', 'Co-Founder', 'Team Member'],
    'defi_disasters': ['Friend', 'Trading Partner', 'Advisor'],
    'nft_collector_rage': ['Friend', 'Fellow Collector', 'Discord Buddy'],
    'web3_dating': ['Date', 'Match', 'Crush']
  };
  
  const types = exTypes[category as keyof typeof exTypes] || ['Friend', 'Acquaintance', 'Someone'];
  return types[Math.floor(Math.random() * types.length)];
}