import { NextResponse } from 'next/server';
import { historianData } from '@/lib/historians';

export async function GET() {
  // Return static historian data - no database needed
  const historians = historianData.map((h, i) => ({ 
    ...h, 
    id: h.name.toLowerCase().replace(/\s+/g, '-') 
  }));
  
  return NextResponse.json(historians);
}
