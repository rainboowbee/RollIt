'use client';

import { useState, useEffect } from 'react';
import { isTMA, retrieveRawInitData } from '@telegram-apps/sdk-react';
import { Button } from '@telegram-apps/telegram-ui';

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
  const [showProfile, setShowProfile] = useState(false);
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
    setShowProfile(false);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header с профилем и балансом */}
        {user && (
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-cyan-400/30 shadow-lg shadow-cyan-400/20">
              <div className="flex items-center justify-between">
                {/* Профиль пользователя */}
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 p-0.5 animate-pulse">
                      <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                        <span className="text-white text-lg font-bold">
                          {user.firstName?.[0] || user.username?.[0] || 'U'}
                        </span>
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-800 animate-ping"></div>
                  </div>
                  <div>
                    <div className="text-white font-semibold text-lg">
                      {user.firstName || user.username || 'Пользователь'}
                    </div>
                    <button
                      onClick={() => setShowProfile(true)}
                      className="text-cyan-300 text-sm hover:text-cyan-200 transition-colors duration-200"
                    >
                      @{user.username || 'username'}
                    </button>
                  </div>
                </div>

                {/* Баланс звезд */}
                <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-3 border border-cyan-400/50 shadow-lg shadow-cyan-400/20">
                  <div className="flex items-center space-x-2">
                    <div className="text-yellow-400 text-xl">⭐</div>
                    <div className="text-white font-bold text-lg">
                      {user.balance.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-cyan-300 text-xs text-center">звезд</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Список кнопок */}
        {selectedGame === 'roulette' && currentGame ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                🎰 Рулетка
              </h2>
              <button 
                onClick={handleBackToGames} 
                className="bg-gradient-to-r from-slate-600/50 to-slate-700/50 hover:from-slate-500/50 hover:to-slate-600/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-slate-400/30 text-white transition-all duration-200 hover:shadow-lg hover:shadow-slate-400/20"
              >
                ← Назад
              </button>
            </div>
            <RouletteGame
              game={currentGame}
              currentUser={user!}
              onBetPlaced={handleBetPlaced}
            />
          </div>
        ) : showUsers ? (
          <UsersList onBack={handleBackToGames} />
        ) : showProfile ? (
          <UserProfile user={user!} onBack={handleBackToGames} />
        ) : (
          <div className="space-y-4">
            {/* Список пользователей */}
            <button
              onClick={() => setShowUsers(true)}
              className="w-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-400/30 hover:to-blue-400/30 backdrop-blur-md rounded-2xl p-6 border border-cyan-400/50 shadow-lg shadow-cyan-400/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-400/30"
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-400/50">
                  <span className="text-3xl">👥</span>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Список пользователей
                  </h3>
                  <p className="text-cyan-200 text-sm">
                    Посмотреть всех участников
                  </p>
                </div>
                <div className="text-cyan-400 text-2xl">→</div>
              </div>
            </button>

            {/* Рулетка */}
            <button
              onClick={() => setSelectedGame('roulette')}
              className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-400/30 hover:to-pink-400/30 backdrop-blur-md rounded-2xl p-6 border border-purple-400/50 shadow-lg shadow-purple-400/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-400/30"
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-400/50">
                  <span className="text-3xl">🎰</span>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Рулетка
                  </h3>
                  <p className="text-purple-200 text-sm">
                    Делайте ставки и выигрывайте призы!
                  </p>
                </div>
                <div className="text-purple-400 text-2xl">→</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Debug Panel */}
      <DebugPanel user={user} />
    </div>
  );
}
