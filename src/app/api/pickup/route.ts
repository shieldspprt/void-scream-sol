import { NextRequest, NextResponse } from 'next/server';
import { historianData } from '@/lib/historians';
import { openRouterChat } from '@/lib/openrouter';

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 50; // 50 requests per minute
const WINDOW = 60000;

// Security patterns only (keep it minimal for performance)
const BLOCKED_PATTERNS = [
  /<script/i, /javascript:/i, /on\w+\s*=/i, /eval\s*\(/i,
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
  if (input.length < 2) return { valid: false, reason: 'Too short (min 2 chars)' };
  if (input.length > 300) return { valid: false, reason: 'Too long (max 300 chars)' };
  
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(input)) return { valid: false, reason: 'Invalid characters' };
  }
  return { valid: true };
}

// Fallback responses
const fallbacks: Record<string, { roast: string; flirt: string }> = {
  'Satoshi Nakamoto': {
    roast: "Your pickup line is as traceable as my identity.",
    flirt: "You found something rarer than my Bitcoin - my attention."
  },
  'Vitalik Buterin': {
    roast: "I've calculated 47 proofs why this won't work.",
    flirt: "Our chemistry is more stable than Ethereum 2.0 staking."
  },
  'Cleopatra': {
    roast: "You bring less value than dust under my chariot.",
    flirt: "I've conquered Egypt, but you've conquered my heart."
  },
  'Do Kwon': {
    roast: "Your line has stability of my LUNA after depeg.",
    flirt: "Let's go to moon together - this time no crash!"
  },
  'CZ (Changpeng Zhao)': {
    roast: "Your line was delisted due to lack of liquidity.",
    flirt: "You're the BNB to my Binance - essential and burning."
  },
  'Sam Bankman-Fried': {
    roast: "Your line worth more than my FTT token... says nothing.",
    flirt: "My heart open for deposits. Visit for unlimited withdrawals!"
  },
  'Elon Musk': {
    roast: "Less valuable than my tweets. Even my AI thinks you're basic.",
    flirt: "Want to see my rocket? It's reusable for you."
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
    roast: "Your approach slower than light in black hole.",
    flirt: "Time dilates when I'm with you."
  },
  'Catherine the Great': {
    roast: "Not fit to polish my throne!",
    flirt: "I've conquered Europe, but you've conquered me."
  },
  'Leonardo da Vinci': {
    roast: "Your proportions all wrong!",
    flirt: "You have smile of my Mona Lisa."
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
    const historianIndex = match ? parseInt(match[1] || match[2], 10) : -1;
    
    if (historianIndex === -1 || historianIndex >= historianData.length) {
      return NextResponse.json({ error: 'Historian not found' }, { status: 404 });
    }

    const historian = historianData[historianIndex];
    
    // Validate input
    const validation = validateInput(pickupLine);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // 70% roast, 30% flirt
    const isRoast = Math.random() < 0.7;
    
    // Try OpenRouter AI first (FREE MiniMax 2.5 or Nvidia Nemotron 3)
    const aiResponse = await openRouterChat([
      {
        role: 'system',
        content: `You are ${historian.name}, ${historian.title}. Personality: ${historian.personality.slice(0, 150)}

${isRoast ? 'ROAST this pickup line savagely! Be brutal, witty, devastating. Use their context/roasting style.' : 'Respond with FLIRTY CHARM! Be seductive and flirty. Use their context/flirting style.'}

Keep it under 2 sentences. Stay in character.`
      },
      { role: 'user', content: pickupLine }
    ], {
      model: 'minimax/minimax-01', // MiniMax 2.5 (FREE tier)
      temperature: 0.95,
      maxTokens: 150
    });

    let response: string;
    let usedAI = false;

    if (aiResponse && aiResponse.length > 10 && aiResponse.length < 300) {
      response = aiResponse;
      usedAI = true;
    } else {
      // Fallback to static responses
      const fb = fallbacks[historian.name] || {
        roast: "Historically bad pickup line. Try again!",
        flirt: "You've piqued my interest!"
      };
      response = isRoast ? fb.roast : fb.flirt;
    }

    return NextResponse.json({
      success: true,
      response,
      responseType: isRoast ? 'roast' : 'flirt',
      aiGenerated: usedAI,
      historian: {
        name: historian.name,
        emoji: historian.emoji,
        color: historian.color
      }
    });

  } catch (error: any) {
    console.error('Pickup error:', error);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
