'use client';

import { useState, useEffect } from 'react';
import { isTMA, retrieveRawInitData } from '@telegram-apps/sdk-react';
import { Section, Cell, Button } from '@telegram-apps/telegram-ui';

import UserProfile from '@/components/UserProfile';
import GameList from '@/components/GameList';
import RouletteGame from '@/components/RouletteGame';
import UsersList from '@/components/UsersList';
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
  const [showUsers, setShowUsers] = useState(false);
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

  const handleBackToGames = () => {
    setSelectedGame(null);
    setShowUsers(false);
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

  // Основной UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header с красивым дизайном */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <span className="text-3xl">🎰</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            RollIt
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Увлекательная мини-игра в рулетку
          </p>
        </div>

        {/* User Profile с улучшенным дизайном */}
        {user && (
          <div className="mb-6">
            <UserProfile user={user} />
          </div>
        )}

        {/* Game Content */}
        {selectedGame === 'roulette' && currentGame ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                🎰 Игра в рулетку
              </h2>
              <Button 
                onClick={handleBackToGames} 
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                size="s"
              >
                ← Назад
              </Button>
            </div>
            <RouletteGame
              game={currentGame}
              currentUser={user!}
              onBetPlaced={handleBetPlaced}
            />
          </div>
        ) : showUsers ? (
          <UsersList onBack={handleBackToGames} />
        ) : (
          <GameList 
            onGameSelect={setSelectedGame} 
            onShowUsers={() => setShowUsers(true)}
          />
        )}
      </div>

      {/* Debug Panel */}
      <DebugPanel user={user} />
    </div>
  );
}
