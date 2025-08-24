import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

    // Проверяем, что игра существует и активна
    const game = await prisma.game.findUnique({
      where: { id: parseInt(gameId) },
      include: {
        bets: true
      }
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    if (game.status === 'finished') {
      return NextResponse.json(
        { error: 'Game is already finished' },
        { status: 400 }
      );
    }

    // Проверяем баланс пользователя
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Проверяем, не делал ли пользователь уже ставку в этой игре
    const existingBet = game.bets.find(bet => bet.userId === parseInt(userId));
    if (existingBet) {
      return NextResponse.json(
        { error: 'User already placed a bet in this game' },
        { status: 400 }
      );
    }

    // Создаем ставку в транзакции
    const result = await prisma.$transaction(async (tx) => {
      // Создаем ставку
      const bet = await tx.bet.create({
        data: {
          userId: parseInt(userId),
          gameId: parseInt(gameId),
          amount: parseInt(amount)
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

      // Уменьшаем баланс пользователя
      const updatedUser = await tx.user.update({
        where: { id: parseInt(userId) },
        data: {
          balance: {
            decrement: parseInt(amount)
          }
        }
      });

      return { bet, updatedUser };
    });

    // Получаем обновленную информацию об игре
    const updatedGame = await prisma.game.findUnique({
      where: { id: parseInt(gameId) },
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
        }
      }
    });

    // Рассчитываем общий пул
    const totalPool = updatedGame!.bets.reduce((sum, bet) => sum + bet.amount, 0);

    return NextResponse.json({
      success: true,
      bet: result.bet,
      user: result.updatedUser,
      game: {
        ...updatedGame,
        totalPool
      }
    });

  } catch (error) {
    console.error('Join game error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
