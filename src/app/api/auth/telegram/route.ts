import { NextRequest, NextResponse } from 'next/server';
import { validateInitData, extractUserFromInitData } from '@/lib/telegram';
import { createOrUpdateUser, getCurrentGame, prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Telegram Auth API Called ===');
    
    const authHeader = request.headers.get('authorization');
    console.log('Authorization header:', authHeader);
    
    if (!authHeader) {
      console.error('No Authorization header provided');
      return NextResponse.json({ error: 'Authorization header is required' }, { status: 400 });
    }

    const [authType, rawInitData] = authHeader.split(' ');
    console.log('Auth type:', authType);
    console.log('Raw init data length:', rawInitData?.length);
    
    if (authType !== 'tma' || !rawInitData) {
      console.error('Invalid authorization header format');
      return NextResponse.json({ error: 'Invalid authorization header' }, { status: 400 });
    }

    // Декодируем строку обратно
    const initData = decodeURIComponent(rawInitData);
    console.log('Decoded init data length:', initData.length);
    console.log('Decoded init data preview:', initData.substring(0, 200));

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN is not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    console.log('Bot token found, validating init data...');

    // Передаём строку
    if (!validateInitData(initData, botToken)) {
      console.error('Init data validation failed');
      return NextResponse.json({ error: 'Invalid init data signature' }, { status: 401 });
    }

    console.log('Init data validation successful');

    const telegramUser = extractUserFromInitData(initData);
    if (!telegramUser) {
      console.error('Failed to extract user data from initData');
      return NextResponse.json({ error: 'Failed to extract user data' }, { status: 400 });
    }

    console.log('Telegram user extracted:', telegramUser);

    console.log('Creating/updating user in database...');
    const user = await createOrUpdateUser(telegramUser);
    console.log('User created/updated:', user);

    let currentGame = await getCurrentGame();
    if (!currentGame) {
      console.log('No current game found, creating new one...');
      await prisma.game.create({
        data: { status: 'waiting', totalPool: 0 },
      });
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
        createdAt: user.createdAt,
      },
      currentGame: currentGame
        ? {
            id: currentGame.id,
            status: currentGame.status,
            totalPool: currentGame.totalPool,
            createdAt: currentGame.createdAt,
          }
        : null,
    };

    console.log('Sending response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Telegram auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
