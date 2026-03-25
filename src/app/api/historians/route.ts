import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { historianData } from '@/lib/historians';

export async function GET() {
  try {
    // Try to fetch from database first
    const historians = await db.historian.findMany({
      orderBy: { name: 'asc' }
    });
    
    // If we got historians from DB, return them
    if (historians && historians.length > 0) {
      return NextResponse.json(historians);
    }
    
    // Fallback to static data if DB is empty
    throw new Error('No historians in DB');
  } catch (error) {
    console.error('Error fetching historians from DB, using static data:', error);
    
    // Return static data with generated IDs
    const staticHistorians = historianData.map((h, i) => ({ 
      ...h, 
      id: `static-${i}` 
    }));
    
    return NextResponse.json(staticHistorians);
  }
}
