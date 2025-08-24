import { NextRequest, NextResponse } from 'next/server';
import { createBet, getCurrentGame } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId, gameId, amount } = await request.json();

    if (!userId || !gameId || !amount) {
      return NextResponse.json(
        { error: 'User ID, Game ID and amount are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    // Get current game
    const currentGame = await getCurrentGame();
    if (!currentGame) {
      return NextResponse.json(
        { error: 'No active game found' },
        { status: 404 }
      );
    }

    if (currentGame.status === 'finished') {
      return NextResponse.json(
        { error: 'Game is already finished' },
        { status: 400 }
      );
    }

    // Create bet
    const bet = await createBet(parseInt(userId), currentGame.id, amount);

    // Get updated game info
    const updatedGame = await getCurrentGame();

    return NextResponse.json({
      bet: {
        id: bet.id,
        amount: bet.amount,
        createdAt: bet.createdAt,
        user: bet.user,
      },
      game: updatedGame,
    });

  } catch (error) {
    console.error('Create bet error:', error);
    
    if (error instanceof Error && error.message === 'Insufficient balance') {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
