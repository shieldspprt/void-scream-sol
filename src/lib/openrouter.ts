// Free AI via OpenRouter - 50 requests/day on :free models
// No credit card required, OpenAI-compatible API

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Free models available (rate limited but free!)
export const FREE_MODELS = [
  'deepseek/deepseek-r1:free',        // Reasoning model
  'meta-llama/llama-3.3-70b-instruct:free',  // General chat
  'qwen/qwen-2-7b-instruct:free',     // Fast responses
  'mistralai/mistral-7b-instruct:free', // Creative tasks
  'google/gemma-2-9b-it:free',          // Google's open model
] as const;

export async function generateAIResponse(
  systemPrompt: string,
  userMessage: string,
  apiKey: string
): Promise<{ response: string; model: string }> {
  // Try each free model in order until one works
  const models = [...FREE_MODELS];
  
  for (const model of models) {
    try {
      const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://yellex.fun', // Required by OpenRouter
          'X-Title': 'Yellex - Historical Pickup Game',
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

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        // Rate limit or model unavailable - try next model
        if (res.status === 429 || error.error?.code === 'model_not_found') {
          console.log(`[OpenRouter] ${model} unavailable, trying next...`);
          continue;
        }
        throw new Error(`OpenRouter error: ${res.status}`);
      }

      const data = await res.json();
      const response = data.choices?.[0]?.message?.content?.trim();
      
      if (response && response.length > 10) {
        return { response, model };
      }
    } catch (err) {
      console.log(`[OpenRouter] ${model} failed:`, err);
      continue; // Try next model
    }
  }
  
  throw new Error('All free models exhausted');
}

export async function generateSuggestion(
  historianName: string,
  historianPersonality: string,
  apiKey: string
): Promise<string> {
  const systemPrompt = `Generate ONE clever, witty pickup line for ${historianName}. Make it relevant to their era, work, or achievements. Under 20 words. Be creative and funny.`;
  
  const userMessage = `Generate a pickup line for ${historianName}. About them: ${historianPersonality?.slice(0, 100) || 'famous figure'}`;
  
  const { response } = await generateAIResponse(systemPrompt, userMessage, apiKey);
  return response;
}