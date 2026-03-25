import { NextRequest, NextResponse } from 'next/server';
import { historianData } from '@/lib/historians';

// Response type probabilities - 70% roast, 30% flirt
const getResponseType = () => Math.random() < 0.7 ? 'roast' : 'flirt';

// Pre-written responses for each historian (no AI needed as fallback)
const fallbackResponses: Record<string, { roast: string[]; flirt: string[] }> = {
  'Cleopatra': {
    roast: [
      "Charming. I had 14 lovers and two empires. You have... what, exactly? A pickup line and a dream?",
      "I ruled Egypt while you struggle to rule your own emotions. Come back when you've conquered something.",
      "Caesar crossed the Rubicon for me. You can't even cross the room without stumbling."
    ],
    flirt: [
      "A pyramid scheme I actually want to invest in. Consider this your invitation to my royal chamber.",
      "You intrigue me more than Mark Antony ever did. Shall we discuss empires... privately?",
      "Finally, someone worthy of the throne. I might just make you my 15th."
    ]
  },
  'Einstein': {
    roast: [
      "E=mc² describes energy, not your pickup skills. The mass of your approach is... disappointingly light.",
      "According to relativity, time slows near massive objects. Your line is so lightweight, time didn't notice.",
      "I developed the theory of relativity. You're relatively... unimpressive."
    ],
    flirt: [
      "You've created a gravitational pull stronger than any black hole. I'm drawn to your event horizon.",
      "Our chemistry has more energy than nuclear fusion. Let's explore this reaction further.",
      "Space and time bend around you. You've warped my reality completely."
    ]
  },
  'Aristotle': {
    roast: [
      "Your logic has more holes than my theories after 2000 years of scientific progress.",
      "I defined virtue. You defined... awkwardness. This is not the good life.",
      "All men desire to know. Yet you desire... this? Philosophy weeps."
    ],
    flirt: [
      "Your beauty is the final cause of my existence. Everything in nature exists for you.",
      "In the hierarchy of beings, you are the unmoved mover of my heart.",
      "Virtue is the golden mean, and you are perfectly balanced excellence."
    ]
  },
  'Tesla': {
    roast: [
      "My alternating current powers cities. Your current energy level couldn't power a lightbulb.",
      "I invented wireless transmission. Your signals aren't reaching my frequency.",
      "1500 patents and revolutionary technology. You have... a pickup line. Groundbreaking."
    ],
    flirt: [
      "You've created a resonance in my coils that oscillates at the frequency of love.",
      "Our connection is stronger than any wireless transmission I've ever conceived.",
      "You electrify me more than 10,000 volts. Consider my heart fully charged."
    ]
  },
  'Shakespeare': {
    roast: [
      "Shall I compare thee to a summer's day? Thou art more wilted and less temperate.",
      "A rose by any other name would smell as sweet. You, however, do not.",
      "To be or not to be? With that line, definitely not to be."
    ],
    flirt: [
      "Let me write you a sonnet that will outlive us both. You are my immortal beloved.",
      "If music be the food of love, you are a symphony that nourishes my soul.",
      "My words have moved millions, but you move me more than all my plays combined."
    ]
  },
  'Mozart': {
    roast: [
      "I composed 600 works by age 35. You've composed... one pickup line. And it's dissonant.",
      "That line has no harmony, no rhythm, and definitely no crescendo. Fortissimo NO.",
      "Even my worst compositions had better structure than your approach."
    ],
    flirt: [
      "You've struck a chord in my heart that resonates like the overture to Don Giovanni.",
      "Our duet would be the greatest composition of the classical era. Shall we rehearse?",
      "You are the music, and I am merely the instrument you play so masterfully."
    ]
  },
  'Napoleon': {
    roast: [
      "I conquered Europe. You conquered... my patience. Waterloo was less humiliating.",
      "Your strategic approach needs revision. This is not how one builds an empire.",
      "I placed my crown on my own head. You can't even place a decent pickup line."
    ],
    flirt: [
      "I would conquer the world again just to lay it at your feet. Josephine who?",
      "Surrender to me? No, I surrender to you. My empire is yours to command.",
      "An army marches on its stomach, but my heart marches only for you."
    ]
  },
  'Da Vinci': {
    roast: [
      "I painted the Mona Lisa and designed flying machines. You're painting... a sad picture.",
      "Your proportions are all wrong. Vitruvian Man has better symmetry than your approach.",
      "I sketched helicopters 500 years before they existed. You couldn't sketch a decent date."
    ],
    flirt: [
      "You are the masterpiece I've been searching for all my life. Let me study your beauty.",
      "If I painted you, the canvas would blush. You are beyond any artistic representation.",
      "My notebooks are filled with inventions, but you're the only discovery that matters."
    ]
  }
};

export async function POST(request: NextRequest) {
  try {
    const { pickupLine, historianId, walletAddress } = await request.json();

    if (!pickupLine || !historianId) {
      return NextResponse.json(
        { error: 'Pickup line and historian are required' },
        { status: 400 }
      );
    }

    // Find historian from static data
    const historian = historianData.find(h => 
      historianId.includes(h.name.toLowerCase()) || 
      historianId === h.name.toLowerCase().replace(/\s+/g, '-')
    );

    if (!historian) {
      return NextResponse.json(
        { error: 'Historian not found' },
        { status: 404 }
      );
    }

    // Determine response type
    const responseType = getResponseType();
    
    // Get pre-written response
    const responses = fallbackResponses[historian.name];
    const responseList = responses ? responses[responseType] : null;
    const response = responseList 
      ? responseList[Math.floor(Math.random() * responseList.length)]
      : `${historian.name} seems speechless...`;

    // Try AI if available, otherwise use fallback
    let finalResponse = response;
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default;
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
        finalResponse = aiResponse;
      }
    } catch (aiError) {
      // AI failed, use pre-written fallback
      console.log('AI SDK failed, using fallback response:', aiError);
    }

    return NextResponse.json({
      success: true,
      submissionId: `local-${Date.now()}`,
      response: finalResponse,
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
      { error: 'Failed to process pickup line' },
      { status: 500 }
    );
  }
}
