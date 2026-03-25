import { NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function GET() {
  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a test assistant. Respond in 1 sentence.' },
        { role: 'user', content: 'Say "AI is working!" if you can hear me.' }
      ],
      temperature: 0.5,
      max_tokens: 50
    });

    const response = completion.choices[0]?.message?.content?.trim();
    
    return NextResponse.json({
      status: 'success',
      aiResponse: response || 'No response',
      working: response ? true : false
    });
  } catch (error: any) {
    console.error('AI test failed:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Unknown error',
      stack: error.stack?.slice(0, 500)
    }, { status: 500 });
  }
}
