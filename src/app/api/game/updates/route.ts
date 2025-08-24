import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Game } from '@/lib/types';

// Простая реализация WebSocket через Server-Sent Events (SSE)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get('gameId');

  if (!gameId) {
    return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
  }

  // Устанавливаем заголовки для SSE
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  };

  const stream = new ReadableStream({
    start(controller) {
      const sendUpdate = (data: {
        type: string;
        gameId?: string;
        game?: Game;
        message?: string;
        timestamp: number;
      }) => {
        const event = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(new TextEncoder().encode(event));
      };

      // Отправляем начальное состояние
      sendUpdate({ type: 'connected', gameId, timestamp: Date.now() });

      // Функция для отправки обновлений игры
      const sendGameUpdate = async () => {
        try {
          const game = await prisma.game.findUnique({
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
              },
              winner: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                }
              }
            }
          });

          if (game) {
            // Рассчитываем totalPool
            const totalPool = game.bets.reduce((sum, bet) => sum + bet.amount, 0);
            
            sendUpdate({
              type: 'game_update',
              game: {
                ...game,
                totalPool,
                // Добавляем проценты выигрыша для каждого участника
                bets: game.bets.map(bet => ({
                  ...bet,
                  winPercentage: totalPool > 0 ? ((bet.amount / totalPool) * 100).toFixed(1) : '0.0'
                }))
              },
              timestamp: Date.now()
            });
          }
        } catch (error) {
          console.error('Error sending game update:', error);
          sendUpdate({ type: 'error', message: 'Failed to get game update' });
        }
      };

      // Отправляем обновления каждые 2 секунды
      const interval = setInterval(sendGameUpdate, 2000);

      // Очистка при закрытии соединения
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, { headers });
}

// POST endpoint для отправки обновлений всем клиентам
export async function POST(request: NextRequest) {
  try {
    const { type, gameId, data } = await request.json();
    
    // Здесь можно добавить логику для отправки уведомлений всем подключенным клиентам
    // Пока просто логируем
    console.log('Game update received:', { type, gameId, data });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing game update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
