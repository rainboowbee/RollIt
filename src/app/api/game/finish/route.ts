import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Улучшенная функция взвешенного рандома
function weightedRandomWinner(bets: Array<{ userId: number; amount: number }>) {
  if (bets.length === 0) return null;
  
  const totalWeight = bets.reduce((sum, bet) => sum + bet.amount, 0);
  let random = Math.random() * totalWeight;
  
  for (const bet of bets) {
    random -= bet.amount;
    if (random <= 0) {
      return bet.userId;
    }
  }
  
  // Fallback - возвращаем последнего участника
  return bets[bets.length - 1].userId;
}

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
        bets: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              }
            }
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

    let winnerId = null;
    let totalPool = 0;
    let commission = 0;

    // Если есть ставки, выбираем победителя
    if (currentGame.bets.length > 0) {
      // Рассчитываем общий пул
      totalPool = currentGame.bets.reduce((sum, bet) => sum + bet.amount, 0);
      
      // Выбираем победителя
      winnerId = weightedRandomWinner(currentGame.bets);
      
      // Рассчитываем комиссию (5%)
      commission = Math.floor(totalPool * 0.05);
      
      console.log(`Game ${currentGame.id} finished. Winner: ${winnerId}, Pool: ${totalPool}, Commission: ${commission}`);
    }

    // Обновляем текущую игру как завершенную
    await prisma.game.update({
      where: { id: currentGame.id },
      data: {
        status: 'finished',
        finishedAt: new Date(),
        totalPool,
        winnerId,
        commission,
      }
    });

    // Начисляем выигрыш победителю
    if (winnerId && totalPool > 0) {
      const winAmount = totalPool - commission;
      
      await prisma.user.update({
        where: { id: winnerId },
        data: {
          balance: {
            increment: winAmount
          }
        }
      });

      console.log(`Winner ${winnerId} received ${winAmount} coins`);
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

    console.log(`New game ${newGame.id} created, starting at ${gameStartTime}`);

    return NextResponse.json({
      message: 'Game finished and new game created',
      finishedGame: {
        id: currentGame.id,
        winnerId,
        totalPool,
        commission,
        finishedAt: new Date()
      },
      newGame: {
        id: newGame.id,
        gameStartTime: newGame.gameStartTime
      }
    });

  } catch (error) {
    console.error('Finish game error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
