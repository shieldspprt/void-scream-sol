import { NextRequest, NextResponse } from 'next/server';
import { historianData } from '@/lib/historians';
import ZAI from 'z-ai-web-dev-sdk';

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const WINDOW = 60000;

// Security patterns
const BLOCKED_PATTERNS = [
  /eval\s*\(/i, /document\.write/i, /<script/i, /javascript:/i,
  /on\w+\s*=/i, /fetch\s*\(/i, /XMLHttpRequest/i,
  /localStorage/i, /sessionStorage/i, /atob\s*\(/i, /btoa\s*\(/i,
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
  if (input.length < 2) return { valid: false, reason: 'Pickup line too short (min 2 chars)' };
  if (input.length > 300) return { valid: false, reason: 'Pickup line too long (max 300 chars)' };
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(input)) return { valid: false, reason: 'Invalid characters' };
  }
  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pickupLine, historianId } = body;

    if (!pickupLine || !historianId) {
      return NextResponse.json(
        { error: 'Missing pickupLine or historianId' },
        { status: 400 }
      );
    }

    // Find historian - be more flexible with ID matching
    let historianIndex = -1;
    
    // Try historian-{index} format first
    const match = historianId.match(/historian-(\d+)|static-(\d+)/);
    if (match) {
      historianIndex = parseInt(match[1] || match[2], 10);
    }
    
    if (historianIndex === -1 || historianIndex >= historianData.length) {
      return NextResponse.json(
        { error: 'Historian not found' },
        { status: 404 }
      );
    }

    // Find historian
    const historian = historianData[historianIndex];
    if (!historian) {
      return NextResponse.json(
        { error: 'Historian not found' },
        { status: 404 }
      );
    }

    // Validate input
    const validation = validateInput(pickupLine);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Rate limit exceeded. Slow down!' }, { status: 429 });
    }

    // Response type - 70% roast, 30% flirt
    const isRoast = Math.random() < 0.7;
    
    let response: string;
    let usedAI = false;

    // Try AI first
    try {
      const zai = await ZAI.create();
      const prompt = `You are ${historian.name}, ${historian.title}. Personality: ${historian.personality.slice(0, 200)}

The user said: "${pickupLine}"

You must ${isRoast ? 'ROAST' : 'FLIRT BACK TO'} this pickup line in your unique voice.
${isRoast ? 'Be savage, witty, and devastating. Make it memorable.' : 'Be seductive, charming, and flirty. Make them feel special.'}

Keep it under 2 sentences. Stay in character. Be creative!`;

      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: pickupLine }
        ],
        temperature: 0.9,
        max_tokens: 150
      });

      const aiResponse = completion.choices[0]?.message?.content?.trim();
      if (aiResponse && aiResponse.length > 10 && aiResponse.length < 250) {
        response = aiResponse;
        usedAI = true;
      } else {
        throw new Error('AI response invalid');
      }
    } catch {
      // Fallback to static responses
      const fallbacks: Record<string, { roast: string; flirt: string }> = {
        'Satoshi Nakamoto': {
          roast: "Your pickup line is as traceable as my identity. Nice try.",
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
    return NextResponse.json(
      { error: 'Failed to process. Try again!' },
      { status: 500 }
    );
  }
}