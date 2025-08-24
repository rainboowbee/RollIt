import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    // Находим текущую активную игру
    const currentGame = await prisma.game.findFirst({
      where: {
        status: {
          in: ['waiting', 'active']
        }
      },
      include: {
        bets: true
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

    // Если есть ставки, выбираем победителя
    if (currentGame.bets.length > 0) {
      // Рассчитываем общий пул
      const totalPool = currentGame.bets.reduce((sum, bet) => sum + bet.amount, 0);
      
      // Выбираем победителя на основе веса ставок
      const totalWeight = currentGame.bets.reduce((sum, bet) => sum + bet.amount, 0);
      let random = Math.random() * totalWeight;
      
      let winner = null;
      for (const bet of currentGame.bets) {
        random -= bet.amount;
        if (random <= 0) {
          winner = bet.userId;
          break;
        }
      }

      // Обновляем игру как завершенную
      await prisma.game.update({
        where: { id: currentGame.id },
        data: {
          status: 'finished',
          finishedAt: new Date(),
          totalPool,
          winnerId: winner,
          commission: Math.floor(totalPool * 0.05) // 5% комиссия
        }
      });

      // Начисляем выигрыш победителю
      if (winner) {
        const winAmount = totalPool - Math.floor(totalPool * 0.05);
        await prisma.user.update({
          where: { id: winner },
          data: {
            balance: {
              increment: winAmount
            }
          }
        });
      }
    }

    // Создаем новую игру
    const gameStartTime = new Date();
    gameStartTime.setSeconds(gameStartTime.getSeconds() + 30); // Игра начнется через 30 секунд
    
    const newGame = await prisma.game.create({
      data: {
        status: 'waiting',
        gameStartTime: gameStartTime,
        totalPool: 0,
        commission: 0,
      },
    });

    return NextResponse.json({
      message: 'Game finished and new game created',
      newGameId: newGame.id,
      newGameStartTime: newGame.gameStartTime
    });

  } catch (error) {
    console.error('Finish game error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
