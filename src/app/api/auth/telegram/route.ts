import { NextRequest, NextResponse } from 'next/server';
import { validateInitData, extractUserFromInitData } from '@/lib/telegram';
import { createOrUpdateUser } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Telegram Auth API Called ===');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { initData } = body;

    if (!initData) {
      console.error('No initData provided');
      return NextResponse.json(
        { error: 'Init data is required' },
        { status: 400 }
      );
    }

    console.log('InitData received:', initData);

    // Validate init data
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('Bot token found, validating init data...');

    if (!validateInitData(initData, botToken)) {
      console.error('Init data validation failed');
      return NextResponse.json(
        { error: 'Invalid init data signature' },
        { status: 401 }
      );
    }

    console.log('Init data validation successful');

    // Extract user data
    const telegramUser = extractUserFromInitData(initData);
    if (!telegramUser) {
      console.error('Failed to extract user data from initData');
      return NextResponse.json(
        { error: 'Failed to extract user data' },
        { status: 400 }
      );
    }

    console.log('Telegram user extracted:', telegramUser);

    // Create or update user in database
    console.log('Creating/updating user in database...');
    const user = await createOrUpdateUser(telegramUser);
    console.log('User created/updated:', user);

    // Create initial game if none exists
    const { getCurrentGame } = await import('@/lib/db');
    let currentGame = await getCurrentGame();
    
    if (!currentGame) {
      console.log('No current game found, creating new one...');
      const { prisma } = await import('@/lib/db');
      await prisma.game.create({
        data: {
          status: 'waiting',
          totalPool: 0,
        }
      });
      
      // Get the created game with bets included
      currentGame = await getCurrentGame();
      console.log('New game created:', currentGame);
    } else {
      console.log('Current game found:', currentGame);
    }

    const response = {
      user: {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
        balance: user.balance,
      },
      currentGame: currentGame ? {
        id: currentGame.id,
        status: currentGame.status,
        totalPool: currentGame.totalPool,
        createdAt: currentGame.createdAt,
      } : null
    };

    console.log('Sending response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Telegram auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
