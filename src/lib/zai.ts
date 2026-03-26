// Z.AI API client - Use FREE GLM-4.7-Flash or GLM-4.5-Flash models
// Pricing: https://docs.z.ai/guides/overview/pricing
// API Ref: https://docs.z.ai/api-reference/llm/chat-completion

const ZAI_BASE_URL = 'https://api.z.ai/api/paas/v4';

export interface ZAIChatOptions {
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  temperature?: number;
  max_tokens?: number;
  model?: 'glm-4.7-flash' | 'glm-4.5-flash';
}

export interface ZAIChatResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export async function zaiChat(options: ZAIChatOptions): Promise<string> {
  const apiKey = process.env.ZAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('ZAI_API_KEY not configured');
  }

  const response = await fetch(`${ZAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model || 'glm-4.7-flash', // ✅ FREE model
      messages: options.messages,
      temperature: options.temperature ?? 0.9,
      max_tokens: options.max_tokens ?? 150,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ZAI API error: ${response.status} - ${error}`);
  }

  const data: ZAIChatResponse = await response.json();
  
  const content = data.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('Empty response from ZAI');
  }

  return content;
}

// Simple helper for pickup line responses
export async function generateResponse(
  historianName: string,
  historianTitle: string,
  historianPersonality: string,
  pickupLine: string,
  isRoast: boolean
): Promise<string> {
  const prompt = `You are ${historianName}, ${historianTitle}.

Personality: ${historianPersonality.slice(0, 300)}

The user just said to you: "${pickupLine}"

You must ${isRoast ? 'ROAST them savagely with wit and sarcasm' : 'FLIRT back charmingly and seductively'} in your unique character voice.

Keep it under 2 sentences. Be creative, memorable, and stay in character! Don't use quotes around your response.`;

  return zaiChat({
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: pickupLine }
    ],
    temperature: 0.95,
    max_tokens: 200,
    model: 'glm-4.7-flash', // ✅ FREE
  });
}

// Generate pickup line suggestions
export async function generateSuggestion(
  historianName: string,
  historianPersonality: string
): Promise<string> {
  const prompt = `Generate ONE clever, witty pickup line that would be appropriate to say to ${historianName}, a famous historical figure.

About ${historianName}: ${historianPersonality.slice(0, 200)}

The pickup line should:
- Be related to their era, work, or famous achievements
- Be clever and memorable
- Not be offensive
- Be under 20 words

Return ONLY the pickup line, nothing else.`;

  return zaiChat({
    messages: [{ role: 'system', content: prompt }],
    temperature: 0.95,
    max_tokens: 60,
    model: 'glm-4.7-flash', // ✅ FREE
  });
}