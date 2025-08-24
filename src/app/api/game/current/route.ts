import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Находим текущую активную игру
    const currentGame = await prisma.game.findFirst({
      where: {
        status: {
          in: ['waiting', 'active']
        }
      },
      include: {
        bets: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                photoUrl: true,
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        winner: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!currentGame) {
      return NextResponse.json(
        { error: 'No active game found' },
        { status: 404 }
      );
    }

    // Рассчитываем общий пул
    const totalPool = currentGame.bets.reduce((sum, bet) => sum + bet.amount, 0);

    // Рассчитываем проценты выигрыша для каждого участника
    const betsWithPercentages = currentGame.bets.map(bet => ({
      ...bet,
      winPercentage: totalPool > 0 ? ((bet.amount / totalPool) * 100).toFixed(1) : '0.0'
    }));

    // Рассчитываем время до начала игры
    const now = new Date();
    const gameStart = new Date(currentGame.gameStartTime);
    const timeUntilStart = Math.max(0, Math.floor((gameStart.getTime() - now.getTime()) / 1000));

    // Определяем статус игры
    let gameStatus = currentGame.status;
    if (currentGame.status === 'waiting' && timeUntilStart === 0) {
      gameStatus = 'active';
    }

    const gameData = {
      ...currentGame,
      totalPool,
      bets: betsWithPercentages,
      timeUntilStart,
      gameStatus,
      // Добавляем статистику
      stats: {
        totalBets: currentGame.bets.length,
        totalPool,
        averageBet: currentGame.bets.length > 0 ? Math.round(totalPool / currentGame.bets.length) : 0,
        minBet: currentGame.bets.length > 0 ? Math.min(...currentGame.bets.map(b => b.amount)) : 0,
        maxBet: currentGame.bets.length > 0 ? Math.max(...currentGame.bets.map(b => b.amount)) : 0,
      }
    };

    return NextResponse.json({
      game: gameData,
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error('Get current game error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
