import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SCREAM_CATEGORIES = {
  crypto_breakup: {
    personas: ['Crypto Ex-Boyfriend', 'DeFi Disaster Dan', 'Rugpull Rachel', 'NFT Heartbreak Hannah', 'Yield Farm Yolanda'],
    prompts: [
      'Write about crypto destroying a relationship and causing emotional chaos',
      'Express the pain of losing money and love simultaneously in crypto',
      'Rant about a partner who chose DeFi over romance',
      'Scream about discovering your ex sold your shared NFTs',
      'Vent about a breakup caused by different crypto investment strategies'
    ]
  },
  dao_drama: {
    personas: ['DAO Founder Alex', 'Governance Token Gary', 'Smart Contract Dev', 'Community Manager Casey', 'Discord Moderator Mike'],
    prompts: [
      'Complain about DAO governance politics and voting drama',
      'Rant about community infighting over protocol changes',
      'Express frustration with whale voters controlling decisions',
      'Scream about being voted out of your own DAO',
      'Vent about endless Discord arguments and proposal spam'
    ]
  },
  nft_nightmares: {
    personas: ['JPEG Collector Jamie', 'OpenSea Ollie', 'Mint Disaster Mia', 'Floor Price Frank', 'Royalty Rights Rita'],
    prompts: [
      'Rage about NFT floor prices crashing overnight',
      'Express horror at discovering your rare NFT is now worthless',
      'Rant about gas wars during mint events',
      'Scream about failed NFT marketplace transactions',
      'Vent about creators abandoning their NFT projects'
    ]
  },
  defi_disasters: {
    personas: ['Liquidity Pool Larry', 'Impermanent Loss Lisa', 'Yield Farmer Yuki', 'Flash Loan Felix', 'Sandwich Attack Sam'],
    prompts: [
      'Cry about impermanent loss eating your profits',
      'Rage about being sandwiched by MEV bots',
      'Express panic about smart contract exploits',
      'Scream about yield farming rewards disappearing',
      'Vent about complex DeFi protocols draining your wallet'
    ]
  },
  web3_woes: {
    personas: ['Metaverse Max', 'Web3 Warrior Wendy', 'Blockchain Builder Bob', 'Crypto Karen', 'Decentralized Dan'],
    prompts: [
      'Complain about Web3 promises vs reality disappointments',
      'Rant about overhyped metaverse experiences',
      'Express frustration with slow blockchain transactions',
      'Scream about wallet connection failures',
      'Vent about the complexity of using dApps'
    ]
  },
  trading_trauma: {
    personas: ['Degen Trader Tyler', 'Paper Hands Paula', 'Diamond Hands Diana', 'Leverage Larry', 'FOMO Frances'],
    prompts: [
      'Rage about perfectly timed bad trades',
      'Express regret about selling before massive pumps',
      'Scream about getting liquidated on leverage',
      'Vent about FOMO buying at the top',
      'Cry about losing life savings to meme coins'
    ]
  },
  gas_fee_fury: {
    personas: ['Gas Fee Greg', 'Transaction Tim', 'Network Nancy', 'Ethereum Eddie', 'L2 Solution Sally'],
    prompts: [
      'Rage about absurd gas fees for simple transactions',
      'Express shock at paying more in fees than the actual transaction',
      'Scream about failed transactions that still cost gas',
      'Vent about network congestion during important trades',
      'Cry about being priced out by high gas costs'
    ]
  },
  influencer_insanity: {
    personas: ['Crypto Influencer Ian', 'YouTube Yasmin', 'Twitter Trendy Tom', 'TikTok Trader Tina', 'Podcast Paul'],
    prompts: [
      'Rant about following bad crypto advice from influencers',
      'Express anger at influencers pumping and dumping',
      'Scream about sponsored content leading to losses',
      'Vent about fake trading results and lifestyle flexing',
      'Cry about trusting social media financial advice'
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
      const selectedPersona = categoryData.personas[Math.floor(Math.random() * categoryData.personas.length)];
      const selectedPrompt = categoryData.prompts[Math.floor(Math.random() * categoryData.prompts.length)];
      
      console.log(`🎭 Generating scream for persona: ${selectedPersona}, category: ${selectedCategory}`);

      const systemPrompt = `You are ${selectedPersona}, a dramatic and hilarious character in the crypto/Web3 space. 

CRITICAL REQUIREMENTS:
- Write a single, raw scream/rant under 280 characters
- Be extremely creative and unique - avoid repetitive patterns
- Mix humor with genuine frustration
- Use varied emotional expressions (🚨🤯💔😱🔥💸🎭👻⚡️🌪️💀🎪🎢)
- Include diverse crypto slang and scenarios
- Make it feel authentic and personal
- NO quotation marks, NO explanations, just the raw scream
- Vary sentence structure and pacing dramatically
- Reference specific crypto events, tokens, or situations randomly
- Use different tones: angry, sad, confused, panicked, dramatic, sarcastic

STYLE VARIETY:
- Sometimes use ALL CAPS for emphasis
- Sometimes use lowercase for despair  
- Mix short punchy sentences with longer rants
- Include random crypto terms: rugpull, ape, moon, diamond hands, paper hands, HODL, rekt, fren, gm, wagmi, ngmi, ser, alpha, copium, hopium
- Reference popular chains: Ethereum, Solana, Polygon, Avalanche, BSC
- Mention random tokens or projects (real or fictional)
- Include trading terminology: leverage, liquidation, margin, futures, spot, CEX, DEX

Make each scream completely different in style, emotion, and content. Be wildly creative!`;

      const userPrompt = selectedPrompt;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5-2025-08-07',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_completion_tokens: 120,
          temperature: 1.2,
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
        persona: selectedPersona,
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
    'crypto_breakup': ['Ex-Lover', 'Ex-Boyfriend', 'Ex-Girlfriend', 'Former Partner', 'Ex-Fiance'],
    'dao_drama': ['Business Partner', 'Co-Founder', 'Team Member', 'Colleague', 'Advisor'],
    'nft_nightmares': ['Friend', 'Fellow Collector', 'Discord Buddy', 'Trading Partner', 'Artist'],
    'defi_disasters': ['Friend', 'Trading Partner', 'Advisor', 'Mentor', 'Pool Partner'],
    'web3_woes': ['Developer Friend', 'Community Member', 'Beta Tester', 'Early Adopter', 'Tech Buddy'],
    'trading_trauma': ['Trading Buddy', 'Signal Provider', 'Mentor', 'Fellow Degen', 'Investment Partner'],
    'gas_fee_fury': ['Network User', 'Fellow Trader', 'DeFi Friend', 'Transaction Partner', 'Gas Victim'],
    'influencer_insanity': ['Follower', 'Subscriber', 'Fan', 'Course Student', 'Community Member']
  };
  
  const types = exTypes[category as keyof typeof exTypes] || ['Friend', 'Acquaintance', 'Someone'];
  return types[Math.floor(Math.random() * types.length)];
}