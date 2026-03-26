import { NextRequest, NextResponse } from 'next/server';
import { chatWithAI } from '@/lib/openrouter';

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
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

// Fallback suggestions
const fallbackSuggestions: Record<string, string[]> = {
  'Satoshi Nakamoto': [
    "Are you the genesis block? Because you're where everything started for me.",
    "Let's create a transaction that never confirms... because I never want this to end.",
  ],
  'Vitalik Buterin': [
    "Are you Ethereum 2.0? Because I've been waiting for you forever.",
    "Let's shard our hearts together and merge into one.",
  ],
  'Cleopatra': [
    "Are you the Nile? Because you make my heart flow.",
    "I'd cross any sea for you, just like Caesar did for me.",
  ],
  'Do Kwon': [
    "I'll take you to the moon... I promise this time it won't crash.",
    "My love for you is more stable than my algorithm.",
  ],
  'CZ (Changpeng Zhao)': [
    "You're the BNB to my Binance - essential and burning bright.",
    "My funds are SAFU, but my heart is all in on you.",
  ],
  'Sam Bankman-Fried': [
    "My heart is open for deposits... unlimited withdrawals.",
    "Let's make FTX 2.0... a love exchange.",
  ],
  'Elon Musk': [
    "Want to see my rocket? It's reusable.",
    "Let's go to Mars together and start a civilization.",
  ],
  'Charles Hoskinson': [
    "I've peer-reviewed my feelings for you. The math checks out.",
    "Let's stake our love together... with proper documentation.",
  ],
  'William Shakespeare': [
    "Shall I compare thee to a summer's day?",
    "My heart doth beat like a drum for thee.",
  ],
  'Albert Einstein': [
    "Time dilates when I'm with you... in a good way.",
    "Our attraction is stronger than gravity.",
  ],
  'Catherine the Great': [
    "I'd conquer half of Europe for you... again.",
    "Come to my Winter Palace and let's start a revolution.",
  ],
  'Leonardo da Vinci': [
    "You have the smile of my Mona Lisa - mysterious.",
    "Our love would be my greatest masterpiece.",
  ]
};

export async function POST(request: NextRequest) {
  try {
    const { historianName, historianPersonality } = await request.json();

    if (!historianName) {
      return NextResponse.json({ error: 'Historian name required' }, { status: 400 });
    }

    // Rate limit
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    let suggestion: string;
    let usedAI = false;

    // Try AI with Nemotron 3 Super
    try {
      console.log('[Suggest AI] Using Nemotron 3 Super...');
      
      const result = await chatWithAI([
        {
          role: 'system',
          content: `Generate ONE clever, witty pickup line for ${historianName}. Make it relevant to their era, work, or achievements. Under 20 words. Be creative and funny.`
        },
        {
          role: 'user',
          content: `Generate a pickup line for ${historianName}. About them: ${historianPersonality?.slice(0, 100) || 'famous figure'}`
        }
      ], 60);

      if (result.content && result.content.length > 10) {
        suggestion = result.content;
        usedAI = true;
        console.log('[Suggest AI] Success');
      } else {
        throw new Error('Empty AI response');
      }
    } catch {
      console.warn('[Suggest AI] Failed, using fallback');
      // Use fallback
      const fallbacks = fallbackSuggestions[historianName];
      if (fallbacks) {
        suggestion = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      } else {
        suggestion = "Are you history? Because I want to make some with you.";
      }
    }

    return NextResponse.json({ suggestion, aiGenerated: usedAI });

  } catch (error) {
    console.error('Error generating suggestion:', error);
    return NextResponse.json({ error: 'Failed to generate suggestion' }, { status: 500 });
  }
}