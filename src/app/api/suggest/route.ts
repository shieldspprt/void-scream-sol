import { NextRequest, NextResponse } from 'next/server';
import { openRouterChat } from '@/lib/openrouter';

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20;
const WINDOW = 60000;

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
  if (input.length > 100) return { valid: false, reason: 'Too long' };
  return { valid: true };
}

// Fallback suggestions
const fallbackSuggestions: Record<string, string[]> = {
  'Satoshi Nakamoto': [
    "Are you the genesis block? You're where everything started for me.",
    "I don't know your private key, but I know you're the one."
  ],
  'Vitalik Buterin': [
    "Are you Ethereum 2.0? I've been waiting for you forever.",
    "Let's shard our hearts together and merge into one."
  ],
  'Cleopatra': [
    "Are you the Nile? Because you make my heart flow.",
    "I'd build you a pyramid... or buy you dinner."
  ],
  'Do Kwon': [
    "I'll take you to the moon... I promise it won't crash.",
    "My love for you is more stable than my algorithm."
  ],
  'CZ (Changpeng Zhao)': [
    "I'll list you as my top trading pair.",
    "My funds are SAFU, but my heart is all in on you."
  ],
  'Sam Bankman-Fried': [
    "My heart is open for deposits... unlimited withdrawals.",
    "I'll play League less if you give me a chance."
  ],
  'Elon Musk': [
    "Want to see my rocket? It's fully reusable for you.",
    "Let's go to Mars together and start a civilization."
  ],
  'Charles Hoskinson': [
    "I've peer-reviewed my feelings. The math checks out.",
    "Let's stake our love together... with proper documentation."
  ],
  'William Shakespeare': [
    "Shall I compare thee to a summer's day?",
    "My heart doth beat like a drum for thee."
  ],
  'Albert Einstein': [
    "Time dilates when I'm with you... in a good way.",
    "Our attraction is stronger than gravity."
  ],
  'Catherine the Great': [
    "I'd conquer half of Europe for you... again.",
    "Come to my Winter Palace and let's start a revolution."
  ],
  'Leonardo da Vinci': [
    "You have the smile of my Mona Lisa - mysterious.",
    "Let me sketch your beauty... in great detail."
  ]
};

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { historianName, historianPersonality } = await request.json();

    if (!historianName) {
      return NextResponse.json({ error: 'Historian name required' }, { status: 400 });
    }

    // Validate
    const validation = validateInput(historianName);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }

    // Try OpenRouter AI (FREE Nvidia Nemotron 3)
    const aiResponse = await openRouterChat([
      {
        role: 'system',
        content: `Generate ONE clever, witty pickup line for ${historianName}. Relevant to their era/achievements. Under 20 words. Creative and funny.`
      },
      {
        role: 'user',
        content: `Generate a pickup line for ${historianName}. About them: ${historianPersonality?.slice(0, 80) || 'famous figure'}`
      }
    ], {
      model: 'nvidia/llama-3.1-nemotron-70b-instruct', // FREE Nvidia Nemotron 3
      temperature: 0.9,
      maxTokens: 60
    });

    let suggestion: string;

    if (aiResponse && aiResponse.length > 10 && aiResponse.length < 150) {
      suggestion = aiResponse;
    } else {
      // Fallback
      const fallbacks = fallbackSuggestions[historianName];
      if (fallbacks) {
        suggestion = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      } else {
        suggestion = "Are you history? Because I want to make you with me.";
      }
    }

    return NextResponse.json({ suggestion });

  } catch (error) {
    console.error('Suggest error:', error);
    return NextResponse.json({ error: 'Failed to generate' }, { status: 500 });
  }
}
