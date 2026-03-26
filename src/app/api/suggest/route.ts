import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const FREE_MODELS = ['deepseek/deepseek-r1:free', 'meta-llama/llama-3.3-70b-instruct:free', 'qwen/qwen-2-7b-instruct:free'];

export async function POST(request: NextRequest) {
  try {
    const { historianName, historianPersonality } = await request.json();
    if (!historianName) return NextResponse.json({ error: 'Historian name required' }, { status: 400 });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 500 });

    // Try OpenRouter
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
              { role: 'system', content: `Generate ONE clever pickup line for ${historianName}. Make it relevant to their era/work. Under 20 words. Be creative!` },
              { role: 'user', content: `Generate for: ${historianName}. About: ${historianPersonality?.slice(0, 100) || 'famous figure'}` }
            ],
            temperature: 0.95,
            max_tokens: 60,
          }),
        });

        if (!res.ok) continue;
        const data = await res.json();
        const suggestion = data.choices?.[0]?.message?.content?.trim();
        if (suggestion && suggestion.length > 10 && suggestion.length < 150) {
          return NextResponse.json({ suggestion });
        }
      } catch { continue; }
    }

    // Fallback
    const fallbacks: Record<string, string[]> = {
      'Satoshi Nakamoto': ["Are you the genesis block? Because you're where everything started for me."],
      'Vitalik Buterin': ["Are you Ethereum 2.0? Because I've been waiting for you forever."],
      'Cleopatra': ["Are you the Nile? Because you make my heart flow."],
      'Do Kwon': ["I'll take you to the moon... I promise this time it won't crash."],
      'CZ (Changpeng Zhao)': ["You're the BNB to my Binance - essential and burning bright."],
      'Sam Bankman-Fried': ["My heart is open for deposits... unlimited withdrawals."],
      'Elon Musk': ["Want to see my rocket? It's reusable."],
      'Charles Hoskinson': ["I've peer-reviewed my feelings for you. The math checks out."],
      'Shakespeare': ["Shall I compare thee to a summer's day?"],
      'Einstein': ["Time dilates when I'm with you... in a good way."],
      'Catherine the Great': ["I conquered half of Europe for you... again."],
      'Da Vinci': ["You have the smile of my Mona Lisa."]
    };
    
    const fb = fallbacks[historianName];
    if (fb) return NextResponse.json({ suggestion: fb[Math.floor(Math.random() * fb.length)] });
    
    return NextResponse.json({ suggestion: "Are you history? Because I want to make you with me." });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ suggestion: "Let's make history together!" });
  }
}
