import { NextRequest, NextResponse } from 'next/server';
import { getGameHistory } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');

    const history = await getGameHistory(limit ? parseInt(limit) : 10);

    return NextResponse.json({ history });

  } catch (error) {
    console.error('Get game history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
