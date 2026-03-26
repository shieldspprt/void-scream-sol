// OpenRouter client - FREE models only
// Primary: nvidia/nemotron-3-super-120b-a12b:free (high quality)
// Fallback: minimax/minimax-m2.5:free (reliable)

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Free models (verified working)
const FREE_MODELS = [
  'nvidia/nemotron-3-super-120b-a12b:free', // Primary - 120B params, excellent quality
  'minimax/minimax-m2.5:free',              // Fallback - reliable, fast
];

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chatWithAI(
  messages: ChatMessage[],
  maxTokens: number = 150
): Promise<{ content: string; model: string }> {
  
  // Try each free model in order
  for (const model of FREE_MODELS) {
    try {
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://yellex.fun',
          'X-Title': 'Yellex - AI Pickup Line Game',
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          max_tokens: maxTokens,
          temperature: 0.9,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[OpenRouter] ${model} failed:`, errorText);
        continue; // Try next model
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      
      if (content && content.length > 10) {
        return { content, model };
      }
    } catch (err) {
      console.warn(`[OpenRouter] ${model} error:`, err);
      continue; // Try next model
    }
  }

  throw new Error('All free models failed');
}

// Test function
export async function testOpenRouter(): Promise<boolean> {
  try {
    const result = await chatWithAI([
      { role: 'user', content: 'Say "Yellex AI is working!" and nothing else.' }
    ], 50);
    return result.content.includes('Yellex');
  } catch {
    return false;
  }
}