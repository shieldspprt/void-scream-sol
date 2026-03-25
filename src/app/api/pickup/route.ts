import { NextRequest, NextResponse } from 'next/server';
import { historianData } from '@/lib/historians';
import ZAI from 'z-ai-web-dev-sdk';

// Response type probabilities - 70% roast, 30% flirt
const getResponseType = () => Math.random() < 0.7 ? 'roast' : 'flirt';

// Rate limiting - simple in-memory store (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

// Content moderation - blocked keywords
const BLOCKED_KEYWORDS = [
  'kill', 'murder', 'die', 'death', 'suicide', 'terrorist', 'bomb', 'attack',
  'rape', 'molest', 'abuse', 'child', 'minor', 'porn', 'sex', 'nude', 'naked',
  'cp', 'gore', 'violence', 'hate', 'nazi', 'hitler', 'racist', 'slur',
  'address', 'password', 'ssn', 'social security', 'credit card', 'cvv',
  'dox', 'swat', 'hack', 'exploit', 'ddos', 'phishing', 'scam'
];

// Check rate limit
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

// Validate content for harmful material
function validateContent(text: string): { valid: boolean; error?: string } {
  // Check length
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Pickup line is required' };
  }
  
  if (text.length > 200) {
    return { valid: false, error: 'Pickup line too long (max 200 characters)' };
  }
  
  if (text.length < 3) {
    return { valid: false, error: 'Pickup line too short' };
  }
  
  // Check for blocked keywords
  const lowerText = text.toLowerCase();
  for (const keyword of BLOCKED_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      return { valid: false, error: 'Content contains inappropriate material' };
    }
  }
  
  // Check for URLs (prevent spam/linking)
  const urlRegex = /(https?:\/\/|www\.)[^\s]+/i;
  if (urlRegex.test(text)) {
    return { valid: false, error: 'Links are not allowed in pickup lines' };
  }
  
  // Check for excessive caps (yelling)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.7 && text.length > 10) {
    return { valid: false, error: 'Please don\'t shout' };
  }
  
  // Check for repeated characters (spam)
  const repeatedCharRegex = /(.)\1{5,}/;
  if (repeatedCharRegex.test(text)) {
    return { valid: false, error: 'Invalid input detected' };
  }
  
  return { valid: true };
}

// Fallback responses by historian
const fallbackResponses: Record<string, { roast: string[]; flirt: string[] }> = {
  'Cleopatra': {
    roast: [
      "My dear, I've had better pickup lines from my palace cats. At least they purr with sincerity.",
      "You approach me with that? I ruled Egypt, child. Bring me gold, not rust.",
      "Charming. I haven't heard such mediocrity since Marc Antony's drinking songs."
    ],
    flirt: [
      "Oh, you smooth-talking mortal! You remind me of Caesar's charm... but with better timing.",
      "Perhaps I could use another admirer in my court. Tell me more over some imported wine.",
      "You've caught the Pharaoh's eye. Such boldness deserves a royal reward..."
    ]
  },
  'Einstein': {
    roast: [
      "Relative to other pickup lines, yours moves at the speed of light... away from success.",
      "E=mc², but your charm equals zero. Try again with more energy.",
      "Space-time is curved, but your approach is painfully linear."
    ],
    flirt: [
      "Our chemistry could power a thousand suns! Let me show you my unified theory... of us.",
      "You make my heart race faster than light. Relatively speaking, you're perfect.",
      "In an infinite universe of possibilities, I'm glad our paths have intersected."
    ]
  },
  'Aristotle': {
    roast: [
      "Logically speaking, your premises are flawed and your conclusion is... solitude.",
      "The unexamined pickup line is not worth using. Yours requires much examination.",
      "According to my Nicomachean Ethics, that was neither virtuous nor effective."
    ],
    flirt: [
      "You embody the golden mean of beauty and wit. Shall we pursue eudaimonia together?",
      "My philosophy has always sought truth, and I've found it in your eyes.",
      "Let us walk together in the Lyceum gardens and discuss the nature of love."
    ]
  },
  'Tesla': {
    roast: [
      "Your pickup line has less energy than my unappreciated Wardenclyffe tower.",
      "Alternating current? More like alternating between bad and worse.",
      "Edison would steal that line just to discredit it."
    ],
    flirt: [
      "You resonate with my frequency! Our connection could wirelessly power the world.",
      "My coils have never sparked like this before. You electrify my very soul.",
      "Forget free energy - you're the only power source I need."
    ]
  },
  'Shakespeare': {
    roast: [
      "Thou art as welcome as a flea at a royal banquet. Away with thee!",
      "To date or not to date? With that line, definitely NOT.",
      "Methinks thou dost try too hard. Simplicity is the soul of wit."
    ],
    flirt: [
      "Shall I compare thee to a summer's day? Thou art more lovely and more temperate!",
      "All the world's a stage, and I want you to be my leading lady.",
      "My love for thee is infinite, boundless as the sea. Say you'll be mine!"
    ]
  },
  'Mozart': {
    roast: [
      "That pickup line was like a symphony... in the key of F-flat FAILURE.",
      "I've heard better melodies from street buskers. Try again, amateur.",
      "Your timing is off, your pitch is flat. Stick to the audience, not the stage."
    ],
    flirt: [
      "You've struck a chord in my heart! Let's compose a love duet together.",
      "My heart beats in 4/4 time whenever you're near. Dance with me?",
      "You inspire me more than any muse. Let's make beautiful music together!"
    ]
  },
  'Napoleon': {
    roast: [
      "I have conquered Europe, and yet you cannot conquer a conversation.",
      "Retreat! Your forces are clearly outmatched. Better luck at Waterloo.",
      "That was a strategic disaster. I would exile you to Elba for that."
    ],
    flirt: [
      "I see victory in your eyes! Together we shall build an empire of love.",
      "You have captured my heart without firing a single shot. Brilliant strategy!",
      "Josephine who? You shall be my new empress. All of Europe will envy us!"
    ]
  },
  'Da Vinci': {
    roast: [
      "That approach lacks perspective, proportion, and quite frankly, genius.",
      "I've painted the Mona Lisa, designed flying machines, but I cannot fix that line.",
      "Vitruvian Man has perfect proportions. Your pickup line does not."
    ],
    flirt: [
      "You are a masterpiece worthy of the Louvre! May I sketch your beauty?",
      "Our love would be the greatest invention since... well, since all my inventions!",
      "I've studied anatomy, but your beauty defies all scientific understanding."
    ]
  }
};

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    
    const { pickupLine, historianId, walletAddress, txSignature } = await request.json();

    // Validate inputs
    if (!pickupLine || !historianId) {
      return NextResponse.json(
        { error: 'Pickup line and historian are required' },
        { status: 400 }
      );
    }

    // Content validation
    const validation = validateContent(pickupLine);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Find historian
    const historian = historianData.find(h => 
      h.name.toLowerCase().replace(/\s+/g, '-') === historianId ||
      h.name === historianId
    );

    if (!historian) {
      return NextResponse.json(
        { error: 'Historian not found' },
        { status: 404 }
      );
    }

    // Determine response type
    const responseType = getResponseType();

    let response: string;

    // Try AI first, fallback to static responses
    try {
      const zai = await ZAI.create();
      
      const systemPrompt = `You are ${historian.name}, the famous ${historian.era} figure known as "${historian.title}".

Your personality: ${historian.personality}

${responseType === 'roast' ? `
You must ROAST this pickup line in your unique style!
Roast style: ${historian.roastStyle}
Be witty, clever, and devastatingly funny. Keep it under 2 sentences.
` : `
You must respond with a FLIRTY YES to this pickup line!
Flirt style: ${historian.flirtStyle}
Be seductive, charming. Keep it under 2 sentences.
`}

Stay completely in character as ${historian.name}. Use era-appropriate references. Be memorable and quotable.`;

      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: pickupLine }
        ],
        temperature: 0.9,
        max_tokens: 120
      });

      response = completion.choices[0]?.message?.content?.trim() || '';
      
      // Validate AI response isn't empty or too long
      if (!response || response.length > 300) {
        throw new Error('Invalid AI response');
      }
      
    } catch (aiError) {
      console.log('AI failed, using fallback response');
      // Use fallback response
      const fallbacks = fallbackResponses[historian.name];
      const responses = responseType === 'roast' ? fallbacks.roast : fallbacks.flirt;
      response = responses[Math.floor(Math.random() * responses.length)];
    }

    return NextResponse.json({
      success: true,
      submissionId: `ylx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      response,
      responseType,
      historian: {
        name: historian.name,
        emoji: historian.emoji,
        color: historian.color
      }
    });

  } catch (error) {
    console.error('Error processing pickup line:', error);
    return NextResponse.json(
      { error: 'Failed to process pickup line. Please try again.' },
      { status: 500 }
    );
  }
}
