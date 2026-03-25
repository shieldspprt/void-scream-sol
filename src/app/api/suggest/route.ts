import { NextRequest, NextResponse } from 'next/server';
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
  if (input.length > 100) {
    return { valid: false, reason: 'Input too long' };
  }
  
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(input)) {
      return { valid: false, reason: 'Invalid input' };
    }
  }
  
  return { valid: true };
}

// Fallback suggestions by historian
const fallbackSuggestions: Record<string, string[]> = {
  'Satoshi Nakamoto': [
    "Are you the genesis block? Because you're where everything started for me.",
    "I don't know your private key, but I know you're the one.",
    "Let's create a transaction that never confirms... because I never want this to end.",
  ],
  'Vitalik Buterin': [
    "Are you Ethereum 2.0? Because I've been waiting for you forever and you're worth it.",
    "Let's shard our hearts together and merge into one.",
    "You must be a smart contract, because you're executing perfectly in my heart.",
  ],
  'Cleopatra': [
    "Are you the Nile? Because you make my heart flow.",
    "I'd build you a pyramid... or at least buy you dinner.",
    "You must be Caesar, because I'd cross any sea for you.",
  ],
  'Do Kwon': [
    "I'll take you to the moon... I promise this time it won't crash.",
    "My love for you is more stable than my algorithm.",
    "Let's create a new blockchain... of love.",
  ],
  'CZ (Changpeng Zhao)': [
    "I'll list you as my top trading pair.",
    "My funds are SAFU, but my heart is all in on you.",
    "You're the BNB to my Binance - essential and burning bright.",
  ],
  'SBF (Sam Bankman-Fried)': [
    "My heart is open for deposits... unlimited withdrawals.",
    "I'll play League less if you give me a chance.",
    "Let's make FTX 2.0... a love exchange.",
  ],
  'Elon Musk': [
    "Want to see my rocket? It's reusable.",
    "Let's go to Mars together and start a civilization.",
    "You're more electric than my Tesla batteries.",
  ],
  'Charles Hoskinson': [
    "I've peer-reviewed my feelings for you. The math checks out.",
    "Let's stake our love together... with proper documentation.",
    "Our relationship is built to last through multiple epochs.",
  ],
  'Shakespeare': [
    "Shall I compare thee to a summer's day?",
    "My heart doth beat like a drum for thee.",
    "Let us be star-crossed lovers, but with a happy ending.",
  ],
  'Einstein': [
    "Time dilates when I'm with you... in a good way.",
    "Our attraction is stronger than gravity.",
    "Let's entangle our particles.",
  ],
  'Catherine the Great': [
    "I'd conquer half of Europe for you... again.",
    "Come to my Winter Palace and let's start a revolution.",
    "You must be a Cossack, for you've ridden into my heart.",
  ],
  'Da Vinci': [
    "You have the smile of my Mona Lisa.",
    "Let me sketch your beauty... in detail.",
    "Our love would be my greatest masterpiece.",
  ]
};

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const { historianName, historianPersonality } = await request.json();

    if (!historianName) {
      return NextResponse.json(
        { error: 'Historian name required' },
        { status: 400 }
      );
    }

    // Validate input
    const validation = validateInput(historianName);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.reason },
        { status: 400 }
      );
    }

    let suggestion: string;

    // Try AI first
    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `Generate ONE clever, witty pickup line for ${historianName}. Make it relevant to their era, work, or achievements. Under 20 words. Be creative and funny.`
          },
          {
            role: 'user',
            content: `Generate a pickup line for ${historianName}. About them: ${historianPersonality?.slice(0, 100) || 'famous figure'}`
          }
        ],
        temperature: 0.95,
        max_tokens: 60
      });

      suggestion = completion.choices[0]?.message?.content?.trim() || '';
      
      // Validate
      if (!suggestion || suggestion.length < 10 || suggestion.length > 150) {
        throw new Error('Invalid AI response');
      }
    } catch {
      // Use fallback
      const fallbacks = fallbackSuggestions[historianName];
      if (fallbacks) {
        suggestion = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      } else {
        suggestion = "Are you history? Because I want to make you with me.";
      }
    }

    return NextResponse.json({ suggestion });

  } catch (error) {
    console.error('Error generating suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestion' },
      { status: 500 }
    );
  }
}