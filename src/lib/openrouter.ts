// OpenRouter - FREE tier with MiniMax 2.5 & Nvidia Nemotron 3
// No API key needed for free models, or use your key for higher limits

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

// FREE models (no API key required, or use your key for higher limits):
// - minimax/minimax-01: MiniMax 2.5 (unlimited free tier)
// - nvidia/llama-3.1-nemotron-70b-instruct: Nvidia Nemotron 3 (unlimited free tier)

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function openRouterChat(
  messages: OpenRouterMessage[],
  options: OpenRouterOptions = {}
): Promise<string | null> {
  const {
    model = "minimax/minimax-01", // MiniMax 2.5 (FREE)
    temperature = 0.9,
    maxTokens = 200
  } = options;

  // Try with API key if user has one, otherwise free tier
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_KEY;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "HTTP-Referer": "https://yellex.fun",
    "X-Title": "Yellex - Historical Pickup Game"
  };
  
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter error:", error);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error("OpenRouter fetch error:", err);
    return null;
  }
}

// Alias for backward compatibility with Z.AI naming
export const zaiChat = openRouterChat;
