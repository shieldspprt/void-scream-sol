import { NextResponse } from 'next/server';

export async function GET() {
  // This runs server-side, so we can access non-public env vars
  const heliusRpc = process.env.HELIUS_RPC || process.env.HELIUS_API_KEY 
    ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
    : null;
  
  if (!heliusRpc) {
    return NextResponse.json({ error: 'No RPC configured' }, { status: 500 });
  }
  
  return NextResponse.json({ rpc: heliusRpc });
}