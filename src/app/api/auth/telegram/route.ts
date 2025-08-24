import { NextRequest, NextResponse } from 'next/server';
import { validateInitData, extractUserFromInitData } from '@/lib/telegram';
import { createOrUpdateUser, getCurrentGame, prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header is required' }, { status: 400 });
    }

    const [authType, rawInitData] = authHeader.split(' ');
    if (authType !== 'tma' || !rawInitData) {
      return NextResponse.json({ error: 'Invalid authorization header' }, { status: 400 });
    }

    // Декодируем строку обратно
    const initData = decodeURIComponent(rawInitData);

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Передаём строку
    if (!validateInitData(initData, botToken)) {
      return NextResponse.json({ error: 'Invalid init data signature' }, { status: 401 });
    }

    const telegramUser = extractUserFromInitData(initData);
    if (!telegramUser) {
      return NextResponse.json({ error: 'Failed to extract user data' }, { status: 400 });
    }

    const user = await createOrUpdateUser(telegramUser);

    let currentGame = await getCurrentGame();
    if (!currentGame) {
      await prisma.game.create({
        data: { status: 'waiting', totalPool: 0 },
      });
      currentGame = await getCurrentGame();
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
      currentGame: currentGame
        ? {
            id: currentGame.id,
            status: currentGame.status,
            totalPool: currentGame.totalPool,
            createdAt: currentGame.createdAt,
          }
        : null,
    });
  } catch (error) {
    console.error('Telegram auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
