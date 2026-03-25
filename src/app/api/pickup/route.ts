import { NextRequest, NextResponse } from 'next/server';
import { historianData } from '@/lib/historians';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pickupLine, historianId } = body;

    if (!pickupLine || !historianId) {
      return NextResponse.json(
        { error: 'Missing pickupLine or historianId' },
        { status: 400 }
      );
    }

    // Find historian - be more flexible with ID matching
    let historianIndex = -1;
    
    // Try historian-{index} format first
    const match = historianId.match(/historian-(\d+)|static-(\d+)/);
    if (match) {
      historianIndex = parseInt(match[1] || match[2], 10);
    }
    
    if (historianIndex === -1 || historianIndex >= historianData.length) {
      return NextResponse.json(
        { error: 'Historian not found' },
        { status: 404 }
      );
    }

    const historian = historianData[historianIndex];
    if (!historian) {
      return NextResponse.json(
        { error: 'Historian not found' },
        { status: 404 }
      );
    }

    // Simple response type - random roast or flirt
    const isRoast = Math.random() < 0.7;
    
    // Fallback responses based on historian
    const responses: Record<string, { roast: string; flirt: string }> = {
      'Satoshi Nakamoto': {
        roast: "Your pickup line is as traceable as my identity. Nice try, but I'm unfindable and you're unforgettable... for the wrong reasons.",
        flirt: "You've found the one thing rarer than my Bitcoin - my attention. Perhaps you're worthy of the genesis block."
      },
      'Vitalik Buterin': {
        roast: "I've calculated 47 proofs why this won't work. Your game has more bugs than Solidity 0.4.0.",
        flirt: "Our chemistry is more stable than Ethereum 2.0 staking. Let me shard my heart with you."
      },
      'Cleopatra': {
        roast: "You bring less value than dust under my chariot. I had Roman EMPERORS begging, and you offer THIS?",
        flirt: "I've conquered Egypt, but you've conquered my heart. Let me show you my chambers."
      },
      'Do Kwon': {
        roast: "Your line has the stability of my LUNA after depeg. I've seen better in worthless rugpulls.",
        flirt: "Let's go to the moon together - this time we won't crash!"
      },
      'CZ (Changpeng Zhao)': {
        roast: "Your line was delisted due to lack of liquidity. Funds SAFU, but your game NOT.",
        flirt: "You're the BNB to my Binance - native and burning bright. Let's trade hearts."
      },
      'Sam Bankman-Fried': {
        roast: "Your line is worth more than my FTT token... which says nothing. I'm in prison with better options.",
        flirt: "I may be behind bars, but my heart is open for deposits. Visit me for unlimited withdrawals!"
      },
      'Elon Musk': {
        roast: "Your attempt is less valuable than my tweets. Even my AI thinks you're basic.",
        flirt: "Want to see my rocket? It's reusable like my heart for you."
      },
      'Charles Hoskinson': {
        roast: "Your line needs 5 more years of peer review. 47 papers prove this won't work.",
        flirt: "I've published a whitepaper on our compatibility. The math checks out."
      },
      'William Shakespeare': {
        roast: "Thou art a boil! Thy line is such that fools would weep. Away, peasant!",
        flirt: "Shall I compare thee to a summer's day? Thou art more lovely by far."
      },
      'Albert Einstein': {
        roast: "Your approach moves slower than light in a black hole. E=mc2, your game equals zero.",
        flirt: "Time dilates when I'm with you. Our attraction is stronger than gravity."
      },
      'Catherine the Great': {
        roast: "You offer me WHAT? You're not fit to polish my throne! My horse has more grace.",
        flirt: "I conquered half of Europe, but you've conquered me completely."
      },
      'Leonardo da Vinci': {
        roast: "Your proportions are all wrong! The Vitruvian Man has better symmetry.",
        flirt: "You have the smile of my Mona Lisa - mysterious and captivating."
      }
    };

    const historianResponses = responses[historian.name] || {
      roast: "That pickup line was historically bad. Better luck next time!",
      flirt: "You have piqued my interest! Perhaps we shall write history together."
    };

    const response = isRoast ? historianResponses.roast : historianResponses.flirt;

    return NextResponse.json({
      success: true,
      response,
      responseType: isRoast ? 'roast' : 'flirt',
      historian: {
        name: historian.name,
        emoji: historian.emoji,
        color: historian.color
      }
    });

  } catch (error: any) {
    console.error('Pickup error:', error);
    return NextResponse.json(
      { error: 'Failed to process. Try again!' },
      { status: 500 }
    );
  }
}