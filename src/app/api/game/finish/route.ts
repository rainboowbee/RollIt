import { NextRequest, NextResponse } from 'next/server';
import { finishGame } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Game finish API called ===');
    
    // Получаем текущую игру
    const { getCurrentGame } = await import('@/lib/db');
    const currentGame = await getCurrentGame();
    
    if (!currentGame) {
      return NextResponse.json(
        { error: 'No active game found' },
        { status: 404 }
      );
    }

    console.log('Finishing game:', currentGame.id);
    
    // Завершаем игру
    const finishedGame = await finishGame(currentGame.id);
    
    console.log('Game finished successfully:', finishedGame);

    return NextResponse.json({
      success: true,
      game: finishedGame
    });

  } catch (error) {
    console.error('Finish game error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
