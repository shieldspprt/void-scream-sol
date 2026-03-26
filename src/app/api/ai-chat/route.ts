import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Free models (rate limited but free!)
const FREE_MODELS = [
  'deepseek/deepseek-r1:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen-2-7b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
];

export async function POST(request: NextRequest) {
  try {
    const { systemPrompt, userMessage } = await request.json();
    
    // Get API key from env (server-side only!)
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI not configured' },
        { status: 500 }
      );
    }

    // Try each model until one works
    for (const model of FREE_MODELS) {
      try {
        const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://yellex.fun',
            'X-Title': 'Yellex',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage }
            ],
            temperature: 0.9,
            max_tokens: 150,
          }),
        });

        if (!res.ok) continue; // Try next model

        const data = await res.json();
        const response = data.choices?.[0]?.message?.content?.trim();
        
        if (response) {
          return NextResponse.json({ response, model });
        }
      } catch {
        continue; // Try next model
      }
    }
    
    return NextResponse.json(
      { error: 'All AI models busy' },
      { status: 503 }
    );

  } catch (error) {
    console.error('AI error:', error);
    return NextResponse.json(
      { error: 'AI service error' },
      { status: 500 }
    );
  }
}