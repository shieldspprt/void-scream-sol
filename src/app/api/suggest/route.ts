import { NextRequest, NextResponse } from 'next/server';
import { createChatCompletion, rotateModel } from '@/lib/openrouter';

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

// Fallback suggestions
const fallbackSuggestions: Record<string, string[]> = {
  'Satoshi Nakamoto': [
    "Are you the genesis block? Because you're where everything started for me.",
    "I don't know your private key, but I know you're the one.",
    "Let's create a transaction that never confirms... because I never want this to end."
  ],
  'Vitalik Buterin': [
    "Are you Ethereum 2.0? Because I've been waiting for you forever.",
    "Let's shard our hearts together and merge into one.",
    "You must be a smart contract, because you're executing perfectly in my heart."
  ],
  'Cleopatra': [
    "Are you the Nile? Because you make my heart flow.",
    "I'd build you a pyramid... or at least buy you dinner.",
    "You must be Caesar, because I'd cross any sea for you."
  ],
  'Do Kwon': [
    "I'll take you to the moon... I promise this time it won't crash.",
    "My love for you is more stable than my algorithm.",
    "Let's create a new blockchain... of love."
  ],
  'CZ (Changpeng Zhao)': [
    "I'll list you as my top trading pair with perfect liquidity.",
    "My funds are SAFU, but my heart is all in on you.",
    "You're the BNB to my Binance - essential and burning bright."
  ],
  'Sam Bankman-Fried': [
    "My heart is open for deposits... unlimited withdrawals.",
    "I'll play League less if you give me a chance.",
    "Let's make FTX 2.0... a love exchange."
  ],
  'Elon Musk': [
    "Want to see my rocket? It's reusable and ready for you.",
    "Let's go to Mars together and start a civilization.",
    "You're more electric than my Tesla batteries."
  ],
  'Charles Hoskinson': [
    "I've peer-reviewed my feelings for you. The math checks out.",
    "Let's stake our love together... with proper documentation.",
    "Our relationship is built to last through multiple epochs."
  ],
  'William Shakespeare': [
    "Shall I compare thee to a summer's day?",
    "My heart doth beat like a drum for thee.",
    "Let us be star-crossed lovers, but with a happy ending."
  ],
  'Albert Einstein': [
    "Time dilates when I'm with you... in a good way.",
    "Our attraction is stronger than gravity.",
    "Let's entangle our particles... quantum mechanically."
  ],
  'Catherine the Great': [
    "I'd conquer half of Europe for you... again.",
    "Come to my Winter Palace and let's start a revolution.",
    "You must be a Cossack, for you've ridden into my heart."
  ],
  'Leonardo da Vinci': [
    "You have the smile of my Mona Lisa - mysterious.",
    "Let me sketch your beauty... in great detail.",
    "Our love would be my greatest unfinished work."
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

    let suggestion: string;
    let usedAI = false;

    // Try AI first
    try {
      const model = rotateModel();
      console.log(`[AI Suggest] Using ${model}`);

      const result = await createChatCompletion({
        model,
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

      suggestion = result.choices[0]?.message?.content?.trim() || '';

      if (suggestion && suggestion.length >= 10 && suggestion.length <= 150) {
        usedAI = true;
        console.log(`[AI Suggest] Success with ${model}`);
      } else {
        throw new Error('Invalid suggestion length');
      }
    } catch (err) {
      console.error('[AI Suggest] Failed, using fallback:', err);

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
    return NextResponse.json(
      { error: 'Failed to generate suggestion' },
      { status: 500 }
    );
  }
}