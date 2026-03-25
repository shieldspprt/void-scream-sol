import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { historianName, historianPersonality } = await request.json();

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

    const suggestion = completion.choices[0]?.message?.content?.trim() || 
      "Are you a time traveler? Because you've made history in my heart.";

    return NextResponse.json({ suggestion });

  } catch (error) {
    console.error('Error generating suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestion' },
      { status: 500 }
    );
  }
}
