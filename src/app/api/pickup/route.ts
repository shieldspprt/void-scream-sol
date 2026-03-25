import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

// Response type probabilities - 70% roast, 30% flirt
const getResponseType = () => Math.random() < 0.7 ? 'roast' : 'flirt';

export async function POST(request: NextRequest) {
  try {
    const { pickupLine, historianId, walletAddress } = await request.json();

    if (!pickupLine || !historianId) {
      return NextResponse.json(
        { error: 'Pickup line and historian are required' },
        { status: 400 }
      );
    }

    // Get historian from database
    const historian = await db.historian.findUnique({
      where: { id: historianId }
    });

    if (!historian) {
      return NextResponse.json(
        { error: 'Historian not found' },
        { status: 404 }
      );
    }

    // Determine response type
    const responseType = getResponseType();

    // Create AI prompt based on historian and response type
    const systemPrompt = `You are ${historian.name}, the famous ${historian.era} figure known as "${historian.title}".

Your personality: ${historian.personality}

${responseType === 'roast' ? `
You must ROAST this pickup line in your unique style!
Roast style: ${historian.roastStyle}
Be witty, clever, and devastatingly funny. Make it memorable but not cruel. Keep it under 2-3 sentences.
` : `
You must respond with a FLIRTY YES to this pickup line!
Flirt style: ${historian.flirtStyle}
Be seductive, charming, and make them feel special. Show genuine interest. Keep it under 2-3 sentences.
`}

Stay completely in character as ${historian.name}. Use references to your era, work, and famous quotes when appropriate.
Be creative and memorable - your response might be shared on social media!`;

    // Call AI
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: pickupLine }
      ],
      temperature: 0.9, // Higher temperature for more creative responses
      max_tokens: 150
    });

    const response = completion.choices[0]?.message?.content || 
      `*${historian.name} seems speechless...*`;

    // Save submission to database
    const submission = await db.submission.create({
      data: {
        walletAddress: walletAddress || null,
        pickupLine,
        response,
        responseType,
        historianId
      }
    });

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      response,
      responseType,
      historian: {
        name: historian.name,
        emoji: historian.emoji,
        color: historian.color
      }
    });

  } catch (error) {
    console.error('Error processing pickup line:', error);
    return NextResponse.json(
      { error: 'Failed to process pickup line' },
      { status: 500 }
    );
  }
}
