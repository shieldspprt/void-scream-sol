import { NextRequest, NextResponse } from 'next/server';

// Fallback suggestions by historian name
const fallbackSuggestions: Record<string, string[]> = {
  'Cleopatra': [
    "Are you the Nile? Because you make my heart flood with emotion.",
    "You must be a pyramid scheme, because you've got me invested.",
    "Is your name Cleopatra? Because you've conquered my heart like you conquered empires."
  ],
  'Einstein': [
    "Are you a black hole? Because you've pulled me in with irresistible force.",
    "You must be the theory of everything, because you explain my entire existence.",
    "Is your love relative? Because time stops when I'm with you."
  ],
  'Aristotle': [
    "Are you the unmoved mover? Because you've set my world in motion.",
    "You must be the final cause, because you're the purpose of my existence.",
    "Is your beauty eternal? Because it transcends all change."
  ],
  'Tesla': [
    "Are you AC current? Because you make my heart oscillate.",
    "You must be wireless electricity, because you're transmitting straight to my heart.",
    "Is this a Tesla coil? Because you're electrifying my world."
  ],
  'Shakespeare': [
    "Shall I compare thee to a summer's day? Thou art more lovely and more temperate.",
    "If music be the food of love, play on - for you are my melody.",
    "Parting is such sweet sorrow, that I shall say good night till it be morrow... with you."
  ],
  'Mozart': [
    "Are you a symphony? Because you're the music of my heart.",
    "You must be my magnum opus, because you're my greatest work.",
    "Is this a concerto? Because you've got me in perfect harmony."
  ],
  'Napoleon': [
    "I came, I saw, I fell for you - conquering my heart like you conquered empires.",
    "You must be Josephine, because you're the only one I surrender to.",
    "Is your love an empire? Because I want to build it with you."
  ],
  'Da Vinci': [
    "Are you the Mona Lisa? Because your smile is mysterious and captivating.",
    "You must be the golden ratio, because you're perfectly beautiful.",
    "Is your love a flying machine? Because you've taken me to new heights."
  ]
};

export async function POST(request: NextRequest) {
  try {
    const { historianName } = await request.json();

    // Try AI first
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default;
      const zai = await ZAI.create();
      
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a pickup line generator. Generate ONE clever, witty pickup line that would be appropriate to say to ${historianName}, a famous historical figure.

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
    } catch (aiError) {
      console.log('AI SDK failed, using fallback suggestion:', aiError);
    }

    // Return fallback suggestion
    const suggestions = fallbackSuggestions[historianName] || [
      "Are you a historical figure? Because you've made history in my heart."
    ];
    const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

    return NextResponse.json({ suggestion });

  } catch (error) {
    console.error('Error generating suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestion' },
      { status: 500 }
    );
  }
}
