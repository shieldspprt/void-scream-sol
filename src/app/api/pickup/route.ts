import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { historianData } from '@/lib/historians';

// Response type probabilities - 70% roast, 30% flirt
const getResponseType = () => Math.random() < 0.7 ? 'roast' : 'flirt';

// Fallback responses for when AI fails
const fallbackResponses: Record<string, { roast: string[], flirt: string[] }> = {
  'Cleopatra': {
    roast: [
      "Charming. I've had 14 lovers and Caesar's empire. You have... a Phantom wallet. Keep trying, peasant.",
      "Is that the best the modern era offers? My asp has more venom than your pickup line.",
      "I've bathed in milk and ruled Egypt. You can't even rule a conversation."
    ],
    flirt: [
      "You've intrigued me more than Mark Antony ever did. Perhaps you could be my next conquest.",
      "Your words have the power of the Nile itself - flowing, unstoppable, and utterly captivating.",
      "I haven't felt this drawn to someone since Caesar. Would you like to rule an empire with me?"
    ]
  },
  'Einstein': {
    roast: [
      "E = mc², but your charm equals zero. The universe has constants more exciting than your pickup line.",
      "I've explained relativity to the world, but I can't explain why you thought that would work.",
      "Time is relative, but my lack of interest in you is absolute."
    ],
    flirt: [
      "You and I are like two particles entangled across space and time. Inseparable, connected, quantum.",
      "My theory of relativity was groundbreaking, but you make my heart accelerate faster than light.",
      "Let's create our own theory of everything - together, we could solve the mysteries of love."
    ]
  },
  'Aristotle': {
    roast: [
      "According to my syllogism: All good pickup lines charm. Your line does not charm. Therefore...",
      "I've studied virtue for decades. Your line displays none of the golden mean - it's just mediocre.",
      "In my Nicomachean Ethics, I never found a category for 'cringe.' Until now."
    ],
    flirt: [
      "You are the telos of my existence - the final cause that gives my life meaning and purpose.",
      "My soul recognizes in you the perfection of form and substance. True beauty, truly actualized.",
      "Let us practice eudaimonia together - flourishing, happiness, and excellence in each other's company."
    ]
  },
  'Tesla': {
    roast: [
      "Your charm has less current than a dying battery. I've seen more electricity in a static shock.",
      "Alternating current revolutionized the world. Your pickup line? Not so revolutionary.",
      "My coils produce 10 million volts. Your line produces zero sparks."
    ],
    flirt: [
      "Our connection resonates at the perfect frequency - wireless, boundless, electrifying.",
      "You light up my world brighter than any Tesla coil I've ever built in my Colorado Springs lab.",
      "The voltage between us could power cities. Let's conduct this experiment together."
    ]
  },
  'Shakespeare': {
    roast: [
      "Thou art as charming as a dunghill, and thy words smell worse. Exit, pursued by a bear.",
      "To date you or not to date you? That is not even a question. The answer is clearly no.",
      "All the world's a stage, and you're playing the fool most convincingly."
    ],
    flirt: [
      "Shall I compare thee to a summer's day? Thou art more lovely and more temperate, indeed.",
      "My heart beats in iambic pentameter whenever you are near. Let us write our own love sonnet.",
      "If love be the food of life, play on. Give me excess of it, that surfeiting, the appetite may sicken, and so die... of happiness."
    ]
  },
  'Mozart': {
    roast: [
      "Your pickup line is more off-key than a beginner's first piano lesson. And less memorable.",
      "I've composed 600 works of genius. You couldn't compose a coherent sentence.",
      "Don Giovanni had more luck with women, and he was dragged to hell. Think about that."
    ],
    flirt: [
      "You are the Eine kleine Nachtmusik of my heart - sweet, perfect, and playing on repeat.",
      "Our love could be my greatest composition yet - a symphony of two hearts in perfect harmony.",
      "Let us make music together that would make the angels weep with joy."
    ]
  },
  'Napoleon': {
    roast: [
      "I've conquered most of Europe. You couldn't conquer a conversation. Retreat immediately.",
      "Your strategic planning is as effective as my invasion of Russia. In winter. Disastrous.",
      "I built an empire. You built... awkward silence. Impressive."
    ],
    flirt: [
      "You have conquered my heart faster than I took Paris. Josephine who?",
      "Together, we could build an empire of love that would make history itself jealous.",
      "Surrender your heart to me, and I promise a glorious reign together."
    ]
  },
  'Da Vinci': {
    roast: [
      "I've painted masterpieces and invented flying machines. Your pickup line invents only cringe.",
      "The proportions of your charm are as off as a poorly drawn stick figure. Back to anatomy class.",
      "My notebooks contain 13,000 pages of genius. Your line belongs in the recycling bin."
    ],
    flirt: [
      "You are the sfumato of my existence - soft, mysterious, and perfectly blended into my life.",
      "Let me paint your portrait and capture your beauty for eternity, my living masterpiece.",
      "Our love could be the eighth wonder of the world - more miraculous than any of my inventions."
    ]
  }
};

export async function POST(request: NextRequest) {
  try {
    const { pickupLine, historianId, walletAddress, txSignature } = await request.json();

    if (!pickupLine || !historianId) {
      return NextResponse.json(
        { error: 'Pickup line and historian are required' },
        { status: 400 }
      );
    }

    // Get historian data (from DB or static fallback)
    let historian = null;
    try {
      historian = await db.historian.findUnique({
        where: { id: historianId }
      });
    } catch (dbError) {
      console.log('DB unavailable, using static historian data');
    }
    
    // Fallback to static data if DB fails or historian not found
    if (!historian) {
      const staticId = historianId.replace('static-', '');
      const index = parseInt(staticId);
      if (!isNaN(index) && historianData[index]) {
        historian = {
          id: historianId,
          ...historianData[index]
        };
      } else {
        // Find by partial match
        const found = historianData.find(h => historianId.toLowerCase().includes(h.name.toLowerCase()));
        if (found) {
          historian = { id: historianId, ...found };
        }
      }
    }

    if (!historian) {
      return NextResponse.json(
        { error: 'Historian not found' },
        { status: 404 }
      );
    }

    // Determine response type
    const responseType = getResponseType();

    // Try AI first, fallback to pre-written responses
    let response = '';
    let usedAI = false;
    
    try {
      // Dynamic import to avoid issues if package is missing
      const ZAIModule = await import('z-ai-web-dev-sdk').catch(() => null);
      
      if (ZAIModule && ZAIModule.default) {
        const ZAI = ZAIModule.default;
        const zai = await ZAI.create();
        
        const systemPrompt = `You are ${historian.name}, the famous ${historian.era} figure known as "${historian.title}".

Your personality: ${historian.personality}

${responseType === 'roast' ? `
You must ROAST this pickup line in your unique style!
Roast style: ${historian.roastStyle}
Be witty, clever, and devastatingly funny. Make it memorable but not cruel. Keep it under 2-3 sentences.
` : `
You must respond with a FLIRTY YES to this pickup line!
Flirt style: ${historian.flirtStyle}
Be seductive, charming, and make them feel special. Show genuine interest. Keep it under 2-3 sentences.
`}

Stay completely in character as ${historian.name}. Use references to your era, work, and famous quotes when appropriate.
Be creative and memorable - your response might be shared on social media!`;

        const completion = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: pickupLine }
          ],
          temperature: 0.9,
          max_tokens: 150
        });

        const aiResponse = completion.choices[0]?.message?.content?.trim();
        if (aiResponse) {
          response = aiResponse;
          usedAI = true;
        }
      }
    } catch (aiError) {
      console.log('AI SDK failed, using fallback responses:', aiError);
    }
    
    // Use fallback if AI failed or wasn't available
    if (!response) {
      const fallbacks = fallbackResponses[historian.name] || {
        roast: [
          `I've seen better attempts at humor in my ${historian.era} times. Try again, perhaps with some wit?`,
          `Your pickup line has all the charm of a failed experiment. I expected better from this era.`,
          `Is that the best modern civilization can offer? Disappointing, truly.`
        ],
        flirt: [
          `You've intrigued me, despite my usual high standards. Perhaps there's something to this modern era after all.`,
          `Your words carry a certain charm that transcends time itself. I find myself... interested.`,
          `Against my better judgment, you've caught my attention. Shall we explore this connection further?`
        ]
      };
      
      const responses = responseType === 'roast' ? fallbacks.roast : fallbacks.flirt;
      response = responses[Math.floor(Math.random() * responses.length)];
    }

    // Try to save submission to database (but don't fail if DB is down)
    let submissionId = `fallback-${Date.now()}`;
    try {
      const submission = await db.submission.create({
        data: {
          walletAddress: walletAddress || null,
          pickupLine,
          response,
          responseType,
          historianId: historian.id,
          txSignature: txSignature || null
        }
      });
      submissionId = submission.id;
    } catch (dbError) {
      console.log('Failed to save to DB (continuing anyway):', dbError);
    }

    return NextResponse.json({
      success: true,
      submissionId,
      response,
      responseType,
      usedAI,
      historian: {
        name: historian.name,
        emoji: historian.emoji,
        color: historian.color
      }
    });

  } catch (error) {
    console.error('Error processing pickup line:', error);
    return NextResponse.json(
      { error: 'Failed to process pickup line', success: false },
      { status: 500 }
    );
  }
}
