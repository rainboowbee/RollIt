import { NextRequest, NextResponse } from 'next/server';
import { validateInitData, extractUserFromInitData } from '@/lib/telegram';
import { createOrUpdateUser } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { initData } = await request.json();

    if (!initData) {
      return NextResponse.json(
        { error: 'Init data is required' },
        { status: 400 }
      );
    }

    // Validate init data
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!validateInitData(initData, botToken)) {
      return NextResponse.json(
        { error: 'Invalid init data signature' },
        { status: 401 }
      );
    }

    // Extract user data
    const telegramUser = extractUserFromInitData(initData);
    if (!telegramUser) {
      return NextResponse.json(
        { error: 'Failed to extract user data' },
        { status: 400 }
      );
    }

    // Create or update user in database
    const user = await createOrUpdateUser(telegramUser);

    // Create initial game if none exists
    const { getCurrentGame } = await import('@/lib/db');
    let currentGame = await getCurrentGame();
    
    if (!currentGame) {
      const { prisma } = await import('@/lib/db');
      currentGame = await prisma.game.create({
        data: {
          status: 'waiting',
          totalPool: 0,
        }
      });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
        balance: user.balance,
      },
      currentGame: {
        id: currentGame.id,
        status: currentGame.status,
        totalPool: currentGame.totalPool,
        createdAt: currentGame.createdAt,
      }
    });

  } catch (error) {
    console.error('Telegram auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
