'use client';

import { useState, useEffect } from 'react';
import { isTMA, retrieveRawInitData } from '@telegram-apps/sdk-react';
import { Section, Cell, Button } from '@telegram-apps/telegram-ui';

import UserProfile from '@/components/UserProfile';
import GameList from '@/components/GameList';
import RouletteGame from '@/components/RouletteGame';
import DebugPanel from '@/components/DebugPanel';

interface User {
  id: number;
  telegramId: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  photoUrl?: string | null;
  balance: number;
  createdAt: string;
}

interface Bet {
  id: number;
  amount: number;
  createdAt: string;
  user: {
    id: number;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    photoUrl?: string | null;
  };
}

interface Game {
  id: number;
  status: string;
  totalPool: number;
  createdAt: string;
  bets: Bet[];
  winnerId?: number | null;
  winner?: {
    id: number;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTelegram, setIsTelegram] = useState<boolean | null>(null);

  // Проверяем, что мы в Telegram Mini App
  useEffect(() => {
    const checkTelegram = async () => {
      try {
        const inTMA = await isTMA('complete');
        setIsTelegram(inTMA);
        if (!inTMA) setIsLoading(false);
      } catch (err) {
        console.error('Telegram check error:', err);
        setIsTelegram(false);
        setIsLoading(false);
      }
    };
    checkTelegram();
  }, []);

  // Инициализация приложения (авторизация и загрузка текущей игры)
  useEffect(() => {
    if (isTelegram !== true) return;

    let gameInterval: ReturnType<typeof setInterval>;

    const initApp = async () => {
      const initDataRaw = retrieveRawInitData();
      if (!initDataRaw) {
        setError('Не удалось получить данные пользователя Telegram');
        setIsLoading(false);
        return;
      }

      console.log('=== Starting initialization ===');
      console.log('Raw init data:', initDataRaw);

      try {
        const res = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `tma ${initDataRaw}`,
          },
          body: JSON.stringify({}),
        });

        console.log('Auth response status:', res.status);

        if (!res.ok) {
          const errorData = await res.text();
          console.error('Auth error response:', errorData);
          throw new Error('Ошибка авторизации');
        }

        const data = await res.json();
        console.log('Auth success data:', data);
        
        setUser(data.user);
        setCurrentGame(data.currentGame);

        // Запуск пуллинга текущей игры каждые 5 секунд
        gameInterval = setInterval(async () => {
          try {
            const gameRes = await fetch('/api/game/current');
            if (gameRes.ok) {
              const gameData = await gameRes.json();
              setCurrentGame(gameData.game);
            }
          } catch (err) {
            console.error('Game polling error:', err);
          }
        }, 5000);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Ошибка инициализации');
      } finally {
        setIsLoading(false);
      }
    };

    initApp();

    return () => {
      if (gameInterval) clearInterval(gameInterval);
    };
  }, [isTelegram]);

  // Обновление данных после ставки
  const handleBetPlaced = async () => {
    try {
      if (user) {
        const userRes = await fetch(`/api/user/me?userId=${user.id}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);
        }
      }
      const gameRes = await fetch('/api/game/current');
      if (gameRes.ok) {
        const gameData = await gameRes.json();
        setCurrentGame(gameData.game);
      }
    } catch (err) {
      console.error('Refresh error:', err);
    }
  };

  // --- UI ---
  if (isTelegram === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Проверка платформы...</p>
        </div>
      </div>
    );
  }

  if (!isTelegram) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Приложение доступно только в Telegram
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Откройте приложение через Telegram бота
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Загрузка приложения...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Ошибка
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-md">
        <Section header="🎰 RollIt - Мини-игра в рулетку">
          <Cell subtitle="Делайте ставки и выигрывайте призы!">
            Добро пожаловать в игру
          </Cell>
        </Section>

        {user && (
          <Section header="Ваш профиль">
            <UserProfile user={user} />
          </Section>
        )}

        {selectedGame === 'roulette' && currentGame ? (
          <div>
            <Section header="Игра в рулетку">
              <Button onClick={() => setSelectedGame(null)} className="mb-4">
                ← Назад к играм
              </Button>
            </Section>
            <RouletteGame
              game={currentGame}
              currentUser={user!}
              onBetPlaced={handleBetPlaced}
            />
          </div>
        ) : (
          <GameList onGameSelect={setSelectedGame} />
        )}
      </div>

      {/* Debug Panel */}
      <DebugPanel user={user} />
    </div>
  );
}
