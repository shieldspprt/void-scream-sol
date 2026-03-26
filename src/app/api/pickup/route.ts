import { NextRequest, NextResponse } from 'next/server';
import { historianData } from '@/lib/historians';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const FREE_MODELS = ['deepseek/deepseek-r1:free', 'meta-llama/llama-3.3-70b-instruct:free', 'qwen/qwen-2-7b-instruct:free'];

async function fetchOpenRouter(systemPrompt: string, userMessage: string): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;
  
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
          temperature: 0.95,
          max_tokens: 150,
        }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const response = data.choices?.[0]?.message?.content?.trim();
      if (response && response.length > 10) return response;
    } catch { continue; }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { pickupLine, historianId } = await request.json();
    if (!pickupLine || !historianId) {
      return NextResponse.json({ error: 'Missing pickupLine or historianId' }, { status: 400 });
    }

    const match = historianId.match(/historian-(\d+)|static-(\d+)/);
    const historianIndex = match ? parseInt(match[1] || match[2], 10) : -1;
    
    if (historianIndex === -1 || historianIndex >= historianData.length) {
      return NextResponse.json({ error: 'Historian not found' }, { status: 404 });
    }

    const historian = historianData[historianIndex];
    const isRoast = Math.random() < 0.7;
    
    const systemPrompt = `You are ${historian.name}, ${historian.title}. Personality: ${historian.personality.slice(0, 200)}. You must ${isRoast ? 'ROAST' : 'FLIRT BACK TO'} this pickup line. ${isRoast ? 'Be savage and witty (2-3 sentences).' : 'Be seductive and charming (2-3 sentences).'} Stay in character!`;
    
    // Try OpenRouter first
    let response = await fetchOpenRouter(systemPrompt, pickupLine);
    let usedAI = !!response;
    
    // Fallback if AI fails
    if (!response) {
      const fallbacks: Record<string, { roast: string; flirt: string }> = {
        'Satoshi Nakamoto': { roast: "Your pickup line is as traceable as my identity. Nice try.", flirt: "You've found something rarer than my Bitcoin - my attention." },
        'Vitalik Buterin': { roast: "I've calculated 47 proofs why this won't work.", flirt: "Our chemistry is more stable than Ethereum 2.0 staking." },
        'Cleopatra': { roast: "You bring less value than dust under my chariot.", flirt: "I've conquered Egypt, but you've conquered my heart." },
        'Do Kwon': { roast: "Your line has the stability of my LUNA after depeg.", flirt: "Let's go to moon together - this time no crash!" },
        'CZ (Changpeng Zhao)': { roast: "Your line was delisted due to lack of liquidity.", flirt: "You're the BNB to my Binance - essential." },
        'Sam Bankman-Fried': { roast: "Your line is worth more than my FTT token... says nothing.", flirt: "My heart is open for deposits. Unlimited withdrawals!" },
        'Elon Musk': { roast: "Your attempt is less valuable than my tweets.", flirt: "Want to see my rocket? It's reusable for you." },
        'Charles Hoskinson': { roast: "Your line needs 5 years peer review.", flirt: "I've published a whitepaper on our compatibility." },
        'Shakespeare': { roast: "Thou art a boil! Away, peasant!", flirt: "Shall I compare thee to a summer's day?" },
        'Einstein': { roast: "Your approach slower than light in black hole.", flirt: "Time dilates when I'm with you." },
        'Catherine the Great': { roast: "Not fit to polish my throne!", flirt: "I've conquered Europe, but you've conquered me." },
        'Leonardo da Vinci': { roast: "Your proportions all wrong!", flirt: "You have smile of my Mona Lisa." }
      };
      const fb = fallbacks[historian.name] || { roast: "Historically bad pickup line.", flirt: "You've piqued my interest!" };
      response = isRoast ? fb.roast : fb.flirt;
    }

    return NextResponse.json({
      success: true,
      response,
      responseType: isRoast ? 'roast' : 'flirt',
      aiGenerated: usedAI,
      historian: { name: historian.name, emoji: historian.emoji, color: historian.color }
    });

  } catch (error) {
    console.error('Pickup error:', error);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
