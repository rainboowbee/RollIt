import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function createOrUpdateUser(telegramUser: {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}) {
  console.log('=== createOrUpdateUser called ===');
  console.log('Input telegramUser:', telegramUser);
  
  try {
    const result = await prisma.user.upsert({
      where: { telegramId: telegramUser.id.toString() },
      update: {
        username: telegramUser.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        photoUrl: telegramUser.photo_url,
      },
      create: {
        telegramId: telegramUser.id.toString(),
        username: telegramUser.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        photoUrl: telegramUser.photo_url,
        balance: 1000,
      },
    });
    
    console.log('User upsert result:', result);
    return result;
  } catch (error) {
    console.error('Error in createOrUpdateUser:', error);
    throw error;
  }
}

export async function getCurrentGame() {
  try {
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
      return null;
    }

    // Рассчитываем общий пул
    const totalPool = currentGame.bets.reduce((sum: number, bet: { amount: number }) => sum + bet.amount, 0);
    
    // Обновляем totalPool в базе данных если он изменился
    if (currentGame.totalPool !== totalPool) {
      await prisma.game.update({
        where: { id: currentGame.id },
        data: { totalPool }
      });
    }

    return {
      ...currentGame,
      totalPool
    };
  } catch (error) {
    console.error('Error getting current game:', error);
    return null;
  }
}

export async function createBet(userId: number, gameId: number, amount: number): Promise<{
  id: number;
  amount: number;
  createdAt: Date;
  user: {
    id: number;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    photoUrl?: string | null;
  };
}> {
  // Check if user has enough balance
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || user.balance < amount) {
    throw new Error('Insufficient balance');
  }

  // Check if user already has a bet in this game
  const existingBet = await prisma.bet.findFirst({
    where: {
      userId,
      gameId
    }
  });

  // Create or update bet and update user balance in transaction
  return await prisma.$transaction(async (tx: PrismaClient) => {
    let bet;
    
    if (existingBet) {
      // Update existing bet
      bet = await tx.bet.update({
        where: { id: existingBet.id },
        data: {
          amount: { increment: amount }
        },
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
        }
      });
    } else {
      // Create new bet
      bet = await tx.bet.create({
        data: {
          userId,
          gameId,
          amount,
        },
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
        }
      });
    }

    await tx.user.update({
      where: { id: userId },
      data: { balance: { decrement: amount } }
    });

    // Update game total pool
    await tx.game.update({
      where: { id: gameId },
      data: { totalPool: { increment: amount } }
    });

    return bet;
  });
}

export async function finishGame(gameId: number): Promise<{
  id: number;
  status: string;
  createdAt: Date;
  gameStartTime: Date;
  finishedAt: Date | null;
  totalPool: number;
  commission: number;
  winnerId: number | null;
}> {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      bets: {
        include: {
          user: true
        }
      }
    }
  });

  if (!game || game.status === 'finished') {
    throw new Error('Game not found or already finished');
  }

  if (game.bets.length === 0) {
    // No bets, just finish the game
    return await prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'finished',
        finishedAt: new Date(),
      }
    });
  }

  // Calculate winner based on bet amounts (higher bet = higher chance)
  const totalBets = game.bets.reduce((sum: number, bet: { amount: number }) => sum + bet.amount, 0);
  let random = Math.random() * totalBets;
  
  let winner: typeof game.bets[0] | null = null;
  for (const bet of game.bets) {
    random -= bet.amount;
    if (random <= 0) {
      winner = bet;
      break;
    }
  }

  if (!winner) {
    winner = game.bets[game.bets.length - 1];
  }

  // Calculate commission (5%)
  const commission = Math.floor(game.totalPool * 0.05);
  const prizeAmount = game.totalPool - commission;

  // Update winner balance and game status
  return await prisma.$transaction(async (tx: PrismaClient) => {
    // Update winner balance (winner gets the prize)
    await tx.user.update({
      where: { id: winner.userId },
      data: { balance: { increment: prizeAmount } }
    });

    // Return bets to all players (they get their bets back)
    for (const bet of game.bets) {
      await tx.user.update({
        where: { id: bet.userId },
        data: { balance: { increment: bet.amount } }
      });
    }

    // Finish the game
    const finishedGame = await tx.game.update({
      where: { id: gameId },
      data: {
        status: 'finished',
        finishedAt: new Date(),
        winnerId: winner.userId,
        commission,
      }
    });

    // Create new game with proper gameStartTime
    const gameStartTime = new Date();
    gameStartTime.setSeconds(gameStartTime.getSeconds() + 30); // Игра начнется через 30 секунд
    
    await tx.game.create({
      data: {
        status: 'waiting',
        gameStartTime: gameStartTime,
        totalPool: 0,
        commission: 0,
      }
    });

    return finishedGame;
  });
}

export async function getGameHistory(limit = 10) {
  return await prisma.game.findMany({
    where: { status: 'finished' },
    include: {
      winner: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        }
      },
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
    orderBy: { finishedAt: 'desc' },
    take: limit,
  });
}
