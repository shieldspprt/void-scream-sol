'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import * as webllm from '@mlc-ai/web-llm';

interface WebLLMContextType {
  loading: boolean;
  progress: string;
  generateResponse: (historian: string, pickupLine: string, isRoast: boolean) => Promise<string>;
  generateSuggestion: (historian: string) => Promise<string>;
}

const WebLLMContext = createContext<WebLLMContextType | null>(null);

export function WebLLMProvider({ children }: { children: ReactNode }) {
  const [engine, setEngine] = useState<webllm.MLCEngine | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  const initEngine = useCallback(async () => {
    if (isInitialized || loading) return;
    
    setLoading(true);
    try {
      const newEngine = await webllm.CreateMLCEngine(
        'Llama-3.2-1B-Instruct-q4f16_1-MLC',
        {
          initProgressCallback: ({ progress, text }) => {
            setProgress(`${(progress * 100).toFixed(1)}% - ${text}`);
          }
        }
      );
      setEngine(newEngine);
      setIsInitialized(true);
    } catch (error) {
      console.error('WebLLM init error:', error);
      setProgress('Failed to load AI model');
    }
    setLoading(false);
  }, [isInitialized, loading]);

  const generateResponse = useCallback(async (historian: string, pickupLine: string, isRoast: boolean) => {
    if (!engine) {
      await initEngine();
      if (!engine) throw new Error('AI engine not ready');
    }

    const action = isRoast ? 'DESTROY with a savage ROAST' : 'respond with a flirty YES';
    
    const messages: webllm.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are ${historian}. Someone just sent you this pickup line: "${pickupLine}". You must ${action} in 1-2 sentences. Be witty, memorable, and stay in character.`
      },
      {
        role: 'user',
        content: pickupLine
      }
    ];

    const reply = await engine.chat.completions.create({
      messages,
      temperature: 0.9,
      max_tokens: 100
    });

    return reply.choices[0]?.message?.content || '';
  }, [engine, initEngine]);

  const generateSuggestion = useCallback(async (historian: string) => {
    if (!engine) {
      await initEngine();
      if (!engine) throw new Error('AI engine not ready');
    }

    const messages: webllm.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `Generate ONE clever pickup line for ${historian}. Make it relevant to who they are. Max 15 words. Be funny.`
      }
    ];

    const reply = await engine.chat.completions.create({
      messages,
      temperature: 0.95,
      max_tokens: 50
    });

    return reply.choices[0]?.message?.content || '';
  }, [engine, initEngine]);

  return (
    <WebLLMContext.Provider value={{ loading, progress, generateResponse, generateSuggestion }}>
      {children}
    </WebLLMContext.Provider>
  );
}

export const useWebLLM = () => {
  const ctx = useContext(WebLLMContext);
  if (!ctx) throw new Error('useWebLLM must be used within WebLLMProvider');
  return ctx;
};
