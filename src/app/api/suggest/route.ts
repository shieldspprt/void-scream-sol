import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // requests per minute
const RATE_WINDOW = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

// Fallback suggestions by historian
const fallbackSuggestions: Record<string, string[]> = {
  'Cleopatra': [
    "Are you the Nile? Because you make my heart flood with desire.",
    "I don't need a pyramid to know you're a treasure.",
    "Even my royal guard couldn't keep me away from you."
  ],
  'Einstein': [
    "Are you a black hole? Because you're pulling me in with incredible force.",
    "We must be moving at the speed of light, because time stops when I'm with you.",
    "You and I have undeniable chemistry - let's study our reaction."
  ],
  'Aristotle': [
    "According to my observations, you embody the highest form of beauty.",
    "Let us examine the nature of attraction... starting with dinner?",
    "Virtue is the golden mean, and you are perfectly balanced."
  ],
  'Tesla': [
    "You create sparks in my heart that could power a city.",
    "Our frequencies are perfectly aligned - we resonate.",
    "Wireless electricity? I'm feeling a strong connection right now."
  ],
  'Shakespeare': [
    "Shall I compare thee to a summer's day? Thou art more lovely.",
    "All the world's a stage, and I want you as my co-star.",
    "My kingdom for a kiss from your fair lips!"
  ],
  'Mozart': [
    "You make my heart sing in perfect harmony.",
    "Our love could be the greatest symphony ever composed.",
    "Let's write a duet together - our hearts beating as one."
  ],
  'Napoleon': [
    "I would conquer empires just to win your heart.",
    "You have captured me completely, and I surrender to love.",
    "Together we could rule more than just my heart."
  ],
  'Da Vinci': [
    "You are a masterpiece that makes the Mona Lisa jealous.",
    "Let me sketch your beauty and frame it in my heart forever.",
    "The Vitruvian Man has nothing on your perfect proportions."
  ]
};

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const { historianName, historianPersonality } = await request.json();

    if (!historianName) {
      return NextResponse.json(
        { error: 'Historian name is required' },
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
            content: `Generate ONE clever, witty pickup line for ${historianName}. 
            
About them: ${historianPersonality}

Requirements:
- Reference their era, work, or achievements
- Be clever and memorable
- Keep it under 15 words
- Make it flirtatious but respectful

Return ONLY the pickup line, nothing else.`
          },
          {
            role: 'user',
            content: `Generate a pickup line for ${historianName}.`
          }
        ],
        temperature: 0.95,
        max_tokens: 50
      });

      suggestion = completion.choices[0]?.message?.content?.trim() || '';
      
      // Validate suggestion
      if (!suggestion || suggestion.length > 100 || suggestion.length < 5) {
        throw new Error('Invalid AI suggestion');
      }
      
    } catch (aiError) {
      // Use fallback
      const fallbacks = fallbackSuggestions[historianName];
      if (fallbacks) {
        suggestion = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      } else {
        suggestion = "Are you a time traveler? Because you've made history in my heart.";
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
