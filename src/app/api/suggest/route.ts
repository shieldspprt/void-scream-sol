import { NextRequest, NextResponse } from 'next/server';

// Fallback suggestions by historian name
const fallbackSuggestions: Record<string, string[]> = {
  'Cleopatra': [
    "Are you the Nile? Because you make my heart flood with emotion.",
    "You must be a pyramid scheme, because you've got me invested.",
    "Is your name Cleopatra? Because you've conquered my heart like Egypt."
  ],
  'Einstein': [
    "Are you a black hole? Because you're pulling me in with your gravity.",
    "You must be the theory of everything, because you're the answer to all my questions.",
    "Is your love relative? Because time slows down when I'm with you."
  ],
  'Aristotle': [
    "Are you virtue itself? Because you're the mean between my extremes.",
    "You must be the unmoved mover, because you set my heart in motion.",
    "Is this the good life? Because happiness is activity with you."
  ],
  'Tesla': [
    "Are you AC current? Because you alternate my heart in cycles.",
    "You must be wireless power, because you energize me from a distance.",
    "Is your name Tesla? Because you've electrified my world."
  ],
  'Shakespeare': [
    "Are thou a summer's day? Because thou art more lovely and temperate.",
    "Thou must be a sonnet, because you've got perfect structure and rhyme.",
    "Is this a dagger I see? No, just my heart pounding for thee."
  ],
  'Mozart': [
    "Are you a symphony? Because you make my heart crescendo.",
    "You must be middle C, because you're the key to my heart.",
    "Is this the Magic Flute? Because you've enchanted me completely."
  ],
  'Napoleon': [
    "Are you Russia? Because I'd invade your heart despite the winter.",
    "You must be my Waterloo, because I've met my match in you.",
    "Is your love an empire? Because I surrender completely to it."
  ],
  'Da Vinci': [
    "Are you the Mona Lisa? Because your smile is a mystery I want to solve.",
    "You must be my Vitruvian Man, because you're perfectly proportioned.",
    "Is this the Last Supper? Because I've been waiting for someone like you."
  ]
};

export async function POST(request: NextRequest) {
  try {
    const { historianName, historianPersonality } = await request.json();

    // Try AI SDK first
    try {
      // Dynamic import to avoid issues if package is missing
      const ZAIModule = await import('z-ai-web-dev-sdk').catch(() => null);
      
      if (ZAIModule && ZAIModule.default) {
        const ZAI = ZAIModule.default;
        const zai = await ZAI.create();
        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `You are a pickup line generator. Generate ONE clever, witty pickup line that would be appropriate to say to ${historianName}, a famous historical figure.
              
About ${historianName}: ${historianPersonality}

The pickup line should:
- Be related to their era, work, or famous achievements
- Be clever and memorable
- Not be inappropriate or offensive
- Be under 20 words

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

        const suggestion = completion.choices[0]?.message?.content?.trim();
        if (suggestion) {
          return NextResponse.json({ suggestion });
        }
      }
    } catch (aiError) {
      console.log('AI SDK failed, using fallback:', aiError);
    }

    // Fallback to pre-written suggestions
    const suggestions = fallbackSuggestions[historianName] || [
      `Are you ${historianName}? Because you've made history in my heart.`,
      `I must be a time traveler, because I see my future with you.`,
      `You're more legendary than all the history books combined.`
    ];
    
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    
    return NextResponse.json({ suggestion: randomSuggestion });

  } catch (error) {
    console.error('Error generating suggestion:', error);
    return NextResponse.json(
      { suggestion: "Are you a time traveler? Because you've made history in my heart." },
      { status: 200 } // Return 200 with fallback instead of 500
    );
  }
}
