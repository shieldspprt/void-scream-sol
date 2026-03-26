import { NextRequest, NextResponse } from 'next/server';
import { historianData } from '@/lib/historians';
import { chatWithAI } from '@/lib/openrouter';

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const WINDOW = 60000;

// Security patterns
const BLOCKED_PATTERNS = [
  /eval\s*\(/i, /<script/i, /javascript:/i, /on\w+\s*=/i,
];

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW });
    return true;
  }
  if (record.count >= RATE_LIMIT) return false;
  record.count++;
  return true;
}

function validateInput(input: string): { valid: boolean; reason?: string } {
  if (input.length < 2) return { valid: false, reason: 'Too short' };
  if (input.length > 300) return { valid: false, reason: 'Too long' };
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(input)) return { valid: false, reason: 'Invalid characters' };
  }
  return { valid: true };
}

// Fallback responses when AI fails
const fallbackResponses: Record<string, { roast: string; flirt: string }> = {
  'Satoshi Nakamoto': {
    roast: "Your pickup line is as traceable as my identity. Nice try, but I'm unfindable and you're unforgettable... for the wrong reasons.",
    flirt: "You've found the one thing rarer than my Bitcoin - my attention. Perhaps you're worthy of the genesis block."
  },
  'Vitalik Buterin': {
    roast: "I've calculated 47 proofs why this won't work. Your game has more bugs than Solidity 0.4.0.",
    flirt: "Our chemistry is more stable than Ethereum 2.0 staking. Let me shard my heart with you."
  },
  'Cleopatra': {
    roast: "You bring less value than the dust under my chariot. I had Roman EMPERORS fighting over me, and you offer... THIS?",
    flirt: "I've conquered the Nile, but you've conquered my heart. Let me show you my chambers."
  },
  'Do Kwon': {
    roast: "Your line has the same stability as my stablecoin - ZERO. I've seen better in worthless rugpulls.",
    flirt: "Let's go to the moon together - this time we won't crash!"
  },
  'CZ (Changpeng Zhao)': {
    roast: "Your line was delisted due to lack of liquidity. Funds SAFU, but your game is NOT.",
    flirt: "You're the BNB to my Binance - essential and burning bright. Let's trade hearts."
  },
  'Sam Bankman-Fried': {
    roast: "Your line is worth more than my FTT token... which says nothing. I'm in prison with better options.",
    flirt: "My heart is open for deposits. Visit me for unlimited withdrawals!"
  },
  'Elon Musk': {
    roast: "Less valuable than my tweets. Even my AI thinks you're basic.",
    flirt: "Want to see my rocket? It's reusable like my heart for you."
  },
  'Charles Hoskinson': {
    roast: "Needs 5 years peer review.",
    flirt: "I've published a whitepaper on our compatibility."
  },
  'William Shakespeare': {
    roast: "Thou art a boil! Away, peasant!",
    flirt: "Shall I compare thee to a summer's day?"
  },
  'Albert Einstein': {
    roast: "Your approach slower than light in a black hole.",
    flirt: "Time dilates when I'm with you."
  },
  'Catherine the Great': {
    roast: "Not fit to polish my throne!",
    flirt: "I've conquered Europe, but you've conquered me."
  },
  'Leonardo da Vinci': {
    roast: "Your proportions all wrong!",
    flirt: "You have the smile of my Mona Lisa."
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pickupLine, historianId } = body;

    if (!pickupLine || !historianId) {
      return NextResponse.json({ error: 'Missing pickupLine or historianId' }, { status: 400 });
    }

    // Find historian
    const match = historianId.match(/historian-(\d+)|static-(\d+)/);
    if (!match) {
      return NextResponse.json({ error: 'Invalid historianId' }, { status: 400 });
    }
    
    const historianIndex = parseInt(match[1] || match[2], 10);
    if (historianIndex < 0 || historianIndex >= historianData.length) {
      return NextResponse.json({ error: 'Historian not found' }, { status: 404 });
    }

    const historian = historianData[historianIndex];

    // Validate input
    const validation = validateInput(pickupLine);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }

    // Rate limit
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Rate limit. Slow down!' }, { status: 429 });
    }

    // 70% roast, 30% flirt
    const isRoast = Math.random() < 0.7;
    let response: string;
    let usedAI = false;
    let modelUsed = 'fallback';

    // Try AI first with Nemotron 3 Super
    try {
      console.log('[AI] Using Nemotron 3 Super 120B...');
      
      const systemPrompt = `You are ${historian.name}, ${historian.title}.
Personality: ${historian.personality.slice(0, 200)}

The user said: "${pickupLine}"

You must ${isRoast ? 'ROAST' : 'FLIRT BACK TO'} this pickup line.
${isRoast ? 'Be savage, witty, and memorable. Destroy them.' : 'Be seductive, charming, and flirty. Make them feel special.'}

Keep it under 2 sentences. Stay in character as ${historian.name}.`;

      const result = await chatWithAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: pickupLine }
      ], 150);

      if (result.content && result.content.length > 10) {
        response = result.content;
        usedAI = true;
        modelUsed = result.model;
        console.log('[AI] Success with', modelUsed);
      } else {
        throw new Error('Empty AI response');
      }
    } catch (err) {
      console.warn('[AI] Failed, using fallback:', err);
      // Use fallback
      const fb = fallbackResponses[historian.name] || {
        roast: 'Historically bad pickup line. Try again!',
        flirt: "You've piqued my interest!"
      };
      response = isRoast ? fb.roast : fb.flirt;
    }

    return NextResponse.json({
      success: true,
      response,
      responseType: isRoast ? 'roast' : 'flirt',
      aiGenerated: usedAI,
      model: modelUsed,
      historian: {
        name: historian.name,
        emoji: historian.emoji,
        color: historian.color
      }
    });

  } catch (error: any) {
    console.error('Pickup error:', error);
    return NextResponse.json({ error: 'Failed to process. Try again!' }, { status: 500 });
  }
}