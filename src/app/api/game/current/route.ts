import { NextResponse } from 'next/server';
import { getCurrentGame } from '@/lib/db';

export async function GET() {
  try {
    const currentGame = await getCurrentGame();

    if (!currentGame) {
      return NextResponse.json(
        { error: 'No active game found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ game: currentGame });

  } catch (error) {
    console.error('Get current game error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
