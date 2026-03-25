import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const historians = await db.historian.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(historians);
  } catch (error) {
    console.error('Error fetching historians:', error);
    return NextResponse.json({ error: 'Failed to fetch historians' }, { status: 500 });
  }
}
