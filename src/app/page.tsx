'use client';

import { useState, useEffect } from 'react';
import { initData, useSignal, isTMA, retrieveRawInitData } from '@telegram-apps/sdk-react';
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

  // Подписка на initData.user из Telegram SDK
  const initDataUser = useSignal(initData.user);

  console.log('=== Home render ===', {
    isTelegram,
    isLoading,
    hasUser: !!user,
    hasCurrentGame: !!currentGame,
    initDataUser: initDataUser,
  });

  // Проверяем среду (Telegram или нет)
  useEffect(() => {
    console.log('=== Checking Telegram environment ===');
    
    const checkTelegram = async () => {
      try {
        // Используем официальный SDK для проверки
        const isInTelegram = await isTMA('complete');
        console.log('isTMA check result:', isInTelegram);
        
        if (isInTelegram) {
          console.log('Detected Telegram Mini App');
          setIsTelegram(true);
        } else {
          console.log('Not in Telegram environment');
          setIsTelegram(false);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking TMA:', error);
        setIsTelegram(false);
        setIsLoading(false);
      }
    };

    checkTelegram();
  }, []);

  // Инициализация приложения
  useEffect(() => {
    if (isTelegram === null) return; // ещё не определили
    if (!isTelegram) return; // не Telegram → выходим
    
    // Проверяем, что initDataUser доступен
    if (!initDataUser) {
      console.log('Waiting for initDataUser...');
      return;
    }

    console.log('=== Starting initialization with Telegram data ===');
    console.log('InitDataUser:', initDataUser);

    let interval: NodeJS.Timeout;

    const initApp = async () => {
      try {
        const initDataRaw = retrieveRawInitData();
        if (!initDataRaw) {
          setError('Не удалось получить данные инициализации');
          setIsLoading(false);
          return;
        }

        console.log('Raw init data:', initDataRaw);

        // Авторизация
        const response = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `tma ${initDataRaw}`,
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Ошибка авторизации');
        }

        const data = await response.json();
        console.log('Auth response:', data);

        setUser(data.user);
        setCurrentGame(data.currentGame);

        // Запускаем обновление текущей игры
        interval = setInterval(async () => {
          try {
            const gameResponse = await fetch('/api/game/current');
            if (gameResponse.ok) {
              const gameData = await gameResponse.json();
              setCurrentGame(gameData.game);
            }
          } catch (err) {
            console.error('Game update error:', err);
          }
        }, 5000);
      } catch (err) {
        console.error('Init error:', err);
        setError(err instanceof Error ? err.message : 'Ошибка инициализации приложения');
      } finally {
        setIsLoading(false);
      }
    };

    initApp();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTelegram, initDataUser]);

  // Обновление данных после ставки
  const handleBetPlaced = async () => {
    try {
      if (user) {
        const userResponse = await fetch(`/api/user/me?userId=${user.id}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user);
        }
      }

      const gameResponse = await fetch('/api/game/current');
      if (gameResponse.ok) {
        const gameData = await gameResponse.json();
        setCurrentGame(gameData.game);
      }
    } catch (error) {
      console.error('Refresh error:', error);
    }
  };

  // UI
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

  // Основной UI
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <Section header="🎰 RollIt - Мини-игра в рулетку">
          <Cell subtitle="Делайте ставки и выигрывайте призы!">
            Добро пожаловать в игру
          </Cell>
        </Section>

        {/* User Profile */}
        {user && (
          <Section header="Ваш профиль">
            <UserProfile user={user} />
          </Section>
        )}

        {/* Game Content */}
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
      <DebugPanel />
    </div>
  );
}
