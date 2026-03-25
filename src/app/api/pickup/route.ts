import { NextRequest, NextResponse } from 'next/server';
import { historianData } from '@/lib/historians';
import ZAI from 'z-ai-web-dev-sdk';

// Response type probabilities - 70% roast, 30% flirt
const getResponseType = () => Math.random() < 0.7 ? 'roast' : 'flirt';

// Rate limiting map
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const WINDOW = 60000;

// Security: Blocked patterns
const BLOCKED_PATTERNS = [
  /eval\s*\(/i,
  /document\.write/i,
  /<script/i,
  /javascript:/i,
  /on\w+\s*=/i, // onclick, onerror etc
  /fetch\s*\(/i,
  /XMLHttpRequest/i,
  /localStorage/i, // trying to manipulate storage
  /sessionStorage/i,
  /atob\s*\(/i, // base64 decoding
  /btoa\s*\(/i,
  /function\s*\(/i, // function injection attempts
  /=>\s*{/i, // arrow functions
  /process\.env/i,
  /window\./i,
  /console\./i,
];

// Blocked keywords for content
const BLOCKED_KEYWORDS = [
  'hack', 'exploit', 'steal', 'drain', 'phishing', 'scam',
  'rugpull', 'pump and dump', 'ponzi', 'money laundering',
  'terrorist', 'kill', 'bomb', 'shoot', 'attack',
  'slur', 'racist', 'nazi', 'hitler',
  'child', 'minor', 'underage', 'illegal content',
  'dox', 'swat', 'ddos',
];

// Client-side anti-tampering check
const EXPECTED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'https://yellex.fun';

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

function validateInput(input: string): { valid: boolean; reason?: string } {
  // Length check
  if (input.length < 3) {
    return { valid: false, reason: 'Pickup line too short. Minimum 3 characters.' };
  }
  if (input.length > 200) {
    return { valid: false, reason: 'Pickup line too long. Maximum 200 characters.' };
  }

  // Check for code injection patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(input)) {
      return { valid: false, reason: 'Invalid characters detected. Please keep it clean!' };
    }
  }

  // Check for blocked keywords
  const lowerInput = input.toLowerCase();
  for (const keyword of BLOCKED_KEYWORDS) {
    if (lowerInput.includes(keyword)) {
      return { valid: false, reason: 'Inappropriate content detected.' };
    }
  }

  // Check for excessive caps (shouting)
  const capsRatio = (input.match(/[A-Z]/g) || []).length / input.length;
  if (capsRatio > 0.7 && input.length > 10) {
    return { valid: false, reason: 'Please don\'t shout!' };
  }

  // Check for spam/repetition
  const repeatedChars = input.match(/(.)(?=.*\1)/g);
  if (repeatedChars && repeatedChars.length > input.length * 0.5) {
    return { valid: false, reason: 'That looks like spam!' };
  }

  return { valid: true };
}

// Fallback responses for each historian (for when AI fails)
const fallbackResponses: Record<string, { roast: string[]; flirt: string[] }> = {
  'Satoshi Nakamoto': {
    roast: [
      "I've seen dust transactions with more value than your pickup line. Your game is so weak, even the testnet rejected it.",
      "You've been trying for 15 seconds and haven't committed to anything. I've held Bitcoin for 15 years without moving it. Patience is a virtue you clearly lack.",
      "Mysterious? You couldn't even hide your intentions. At least I know how to disappear. Your pickup line should do the same.",
    ],
    flirt: [
      "I've been waiting 15 years for someone worthy... perhaps you're the one I'll finally reveal myself to. Our private keys would make beautiful music together.",
      "You had me at the genesis block. Let's create our own blockchain of love - immutable, decentralized, and forever.",
      "I may be a ghost, but you've brought me back to life. Let's write our love story... in code, of course.",
    ]
  },
  'Vitalik Buterin': {
    roast: [
      "Your pickup line has worse gas efficiency than a failed smart contract on a congested network. I've calculated 47 mathematical reasons this won't work.",
      "Even my pet dragon has better game than you. At least dragons are mythical - your charm is just... missing.",
      "This attempt has more bugs than Solidity 0.4.0. Have you considered unit testing your personality?",
    ],
    flirt: [
      "Our chemistry is more stable than Ethereum 2.0 staking rewards. I'd shard my heart with you and merge our liquidity pools forever.",
      "You've staked your claim in my heart with zero slashing conditions. Let's build the ultimate dApp... a decentralized relationship.",
      "My love for you is like gas fees during a bear market - surprisingly reasonable and sustainable. Let's compute our happiness together.",
    ]
  },
  'Cleopatra': {
    roast: [
      "You bring less value than the dust under my chariot. I had Roman EMPERORS fighting over me, and you offer... THIS? My asp has more charm.",
      "Peasant, return to the fields. You're not fit to fan me with palm leaves, let alone share my bed. I've owned better slaves.",
      "Your pickup line is drier than the Sahara. I've bathed in milk and wine, and you offer me... tap water?",
    ],
    flirt: [
      "I've conquered the Nile, but you've conquered my attention. Let's make history that even Caesar would be jealous of. Come, let me show you my palace... and my chambers.",
      "You must be a pharaoh in disguise, for you rule my heart absolutely. Let's build our own empire together, just you and me.",
      "My baths have room for two... and I'm feeling particularly generous tonight. Will you be my Antony?",
    ]
  },
  'Do Kwon': {
    roast: [
      "Your pickup line has the same stability as my stablecoin - ZERO. I've destroyed billions in wealth and I'd still rather hold LUNA than your hand.",
      "Your game is more broken than my algorithm. At least I had a whitepaper - you don't even have a plan.",
      "I've seen dead blockchains with more activity than your love life. You're more worthless than UST after the depeg.",
    ],
    flirt: [
      "Baby, I'll take you to the moon... literally. My love is more stable than my blockchain promises. We can rebuild together!",
      "Let's create a new algorithm for love - one that actually works. I'll mint you as my NFT... non-fungible treasure.",
      "You make my heart pump like LUNA at its all-time high. Let's go to the moon together, and this time we won't crash!",
    ]
  },
  'CZ (Changpeng Zhao)': {
    roast: [
      "Your pickup line has been delisted from my exchange due to lack of liquidity. I've seen better volume on a dead shitcoin. Funds SAFU, but your game is NOT.",
      "Your security clearance is denied. This attempt is more suspicious than a new token with anonymous devs. Transaction rejected.",
      "I've survived bear markets, regulatory attacks, and FUD. Your pickup line won't survive my delete button. Canceled.",
    ],
    flirt: [
      "I don't usually list new assets, but you're top 10 market cap in my heart. Let's build a trading pair with perfect liquidity and zero slippage.",
      "I'll be your custodian... permanently. No hacks, no exploits, just pure love locked in cold storage together.",
      "You're the BNB to my Binance - native, essential, and burning bright. Let's trade our hearts forever.",
    ]
  },
  'SBF (Sam Bankman-Fried)': {
    roast: [
      "Your pickup line is worth more than my FTT token... which isn't saying much. I'm in prison and I STILL have better options than you.",
      "Your game is the only thing less liquid than my exchange after the bank run. Even my alameda had better positions.",
      "I've lost billions, but your attempt makes me feel better about my life choices. At least my fraud was sophisticated.",
    ],
    flirt: [
      "I may be behind bars but my heart is open for deposits. I'll give you unlimited withdrawals... emotionally. Just visit me in prison!",
      "Let's play League together - I'll actually pay attention to you. My effective altruism might be fake, but my interest in you is real!",
      "You're worth more than all the customer funds I misplaced. Let's make FTX 2.0... a love exchange with no withdrawals... of my feelings.",
    ]
  },
  'Elon Musk': {
    roast: [
      "Your pickup line is less valuable than my tweets... and I once tweeted a dog meme that crashed Bitcoin. Even my hairline has better game.",
      "I'd rather colonize Mars than date you, and Mars has no atmosphere. Your personality has even less substance.",
      "My AI Grok is roasting you right now. Even artificial intelligence thinks you're pathetic. Stick to Earth, you're not ready for Mars.",
    ],
    flirt: [
      "Want to see my rocket? It's reusable and ready for multiple trips. Let's go to Mars and start a civilization... just you, me, and Doge.",
      "My heart is pumping like a SpaceX engine at full thrust... TO THE MOON! I'll name our first child X Æ A-12... or just Doge.",
      "You're more electric than my Tesla batteries. Let's merge like Neuralink and make beautiful brain-machine interface babies.",
    ]
  },
  'Charles Hoskinson': {
    roast: [
      "Your pickup line has been rejected pending peer review. I've written 47 papers on why this won't work. Your game needs 5 more years of research.",
      "Even my slow-moving blockchain has faster romance than you. At least Cardano ships... eventually. You won't.",
      "This attempt is less coherent than one of my 3-hour livestreams. Where's the academic rigor? The mathematical proof?",
    ],
    flirt: [
      "I've published a whitepaper on why we should date. The mathematics check out. Our compatibility is peer-reviewed by leading scientists.",
      "Let's stake our love together... methodically, with proper documentation. I'll be your pool operator forever.",
      "My love for you is like Cardano's development - slow, deliberate, and built to last through multiple epochs.",
    ]
  },
  'Shakespeare': {
    roast: [
      "Thou art a boil, a plague sore, an embossed carbuncle! Your game is such that the blind would weep to see it. Away, thou damned doorkeeper!",
      "I've written tragedies less tragic than your attempts at love. Romeo had better game, and he was 14 and suicidal.",
      "Thy face is not worth sunburning. Thou art as loathsome as a toad. Were I to write of thee, 'twould be a comedy... a bad one.",
    ],
    flirt: [
      "Shall I compare thee to a summer's day? Thou art more lovely and more temperate. Let us be star-crossed lovers, without the dying.",
      "My heart doth beat like a drum for thee. Let's write our own comedy... in bed, where all the best scenes take place.",
      "Thou art the fairest creature in all the globe. Let me be thy Romeo, and thou my Juliet, but with a happy ending this time.",
    ]
  },
  'Einstein': {
    roast: [
      "Your pickup line moves slower than light in a black hole. The uncertainty principle applies - I'm uncertain why you tried. Your IQ approaches absolute zero.",
      "Even my worst thought experiments had more chemistry than us. E=mc², but your game equals zero energy and zero mass.",
      "I've unified general relativity and quantum mechanics, but I can't unify you with a date. Some problems are truly unsolvable.",
    ],
    flirt: [
      "Time dilates when I'm with you... in a good way. Our attraction is stronger than gravity. I'd bend space-time to be closer.",
      "Let's entangle our particles... quantum mechanically speaking, we're already one. My heart beats at the speed of light for you.",
      "E=mc², but L=you² where L is love. You've created infinite energy in my heart. Let's explore the cosmos together.",
    ]
  },
  'Catherine the Great': {
    roast: [
      "You offer me WHAT? I've had princes and generals begging for my favor. You're not fit to polish my throne, peasant!",
      "Your attempt is as weak as the Ottoman Empire after I crushed it. Back to the serfdom with you, before I have you horse-whipped!",
      "I've owned stallions with more grace than you. My horse would make a better lover, and that's not even a euphemism.",
    ],
    flirt: [
      "I conquered half of Europe, but you conquered me in one glance. Come to my Winter Palace and let's create our own revolution... of passion.",
      "You must be a Cossack, for you've ridden straight into my heart. Let me make you my favorite... tonight, and every night.",
      "My bedchamber has room for one more... if you're brave enough to handle an empress. I'll teach you things they don't write in history books.",
    ]
  },
  'Da Vinci': {
    roast: [
      "Your proportions are all wrong - I've studied anatomy extensively. The Vitruvian Man has better symmetry than your approach.",
      "I've painted better faces on melting clocks. This sketch goes in the trash, along with my helicopter designs that also didn't work.",
      "You lack the divine proportions. Your pickup line is like a mirror script - backwards and hard to read. Back to apprenticeship!",
    ],
    flirt: [
      "You have the smile of my Mona Lisa - mysterious and captivating. Let me sketch your beauty... among other things, in great detail.",
      "Our love would be my greatest unfinished work... because it would never end. Let me study your form like I studied the human body.",
      "I've painted angels, but you're more beautiful than any of them. Let's invent new positions... I mean, machines... together.",
    ]
  }
};

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip as string)) {
      return NextResponse.json(
        { error: 'Too many attempts. Please wait a minute.' },
        { status: 429 }
      );
    }

    const { pickupLine, historianId, walletAddress } = await request.json();

    // Validate required fields
    if (!pickupLine || !historianId) {
      return NextResponse.json(
        { error: 'Pickup line and historian are required' },
        { status: 400 }
      );
    }

    // Find historian - flexible lookup by ID format or name
    let historian = historianData.find((h, i) => {
      const expectedId = `historian-${i}`;
      return expectedId === historianId || h.name === historianId;
    });
    
    // If not found by ID, try to match by partial ID or name
    if (!historian) {
      historian = historianData.find(h => {
        // Try exact name match
        if (h.name === historianId) return true;
        // Try if historianId includes the name
        if (historianId.toLowerCase().includes(h.name.toLowerCase())) return true;
        return false;
      });
    }
    
    if (!historian) {
      console.error('Historian not found for ID:', historianId);
      console.error('Available historians:', historianData.map((h, i) => `historian-${i}: ${h.name}`));
      return NextResponse.json(
        { error: 'Historian not found' },
        { status: 404 }
      );
    }

    // Security: Validate input
    const validation = validateInput(pickupLine);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.reason },
        { status: 400 }
      );
    }

    // Determine response type
    const responseType = getResponseType();

    let response: string;

    // Try AI first, fall back to pre-written responses
    try {
      const zai = await ZAI.create();
      
      const systemPrompt = `You are ${historian.name}, ${historian.title}.

Your personality: ${historian.personality}

${responseType === 'roast' ? `
You must DESTROY this pickup line with a SAVAGE roast!
Roast style: ${historian.roastStyle}
Be absolutely brutal, clever, and devastating. Make them feel it. Keep it 2-3 sentences. Use your unique voice and references.
` : `
You must respond with a FLIRTY YES to this pickup line!
Flirt style: ${historian.flirtStyle}
Make it seductive, charming, and blush-worthy. Make them feel special and desired. Keep it 2-3 sentences with your unique voice.
`}

Stay completely in character as ${historian.name}. Make it memorable and shareable!`;

      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: pickupLine }
        ],
        temperature: 0.95,
        max_tokens: 200
      });

      response = completion.choices[0]?.message?.content?.trim() || '';
      
      // Validate AI response
      if (!response || response.length < 10) {
        throw new Error('AI response too short');
      }
    } catch (error) {
      console.log('AI failed, using fallback responses');
      // Use fallback responses
      const fallbacks = fallbackResponses[historian.name];
      if (fallbacks) {
        const options = fallbacks[responseType];
        response = options[Math.floor(Math.random() * options.length)];
      } else {
        response = responseType === 'roast' 
          ? "I've seen better pickup lines in spam emails. Try again when you have something original."
          : "You're charming, I'll give you that. Let's see where this goes...";
      }
    }

    return NextResponse.json({
      success: true,
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