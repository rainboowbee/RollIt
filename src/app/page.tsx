'use client';

import { useState, useEffect } from 'react';
import { isTMA, retrieveRawInitData } from '@telegram-apps/sdk-react';
import RouletteGame from '@/components/RouletteGame';
import UsersList from '@/components/UsersList';
import UserProfile from '@/components/UserProfile';
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
  user: User;
}

interface Game {
  id: number;
  status: string;
  totalPool: number;
  createdAt: string;
  gameStartTime: string;
  bets: Bet[];
  winnerId?: number | null;
  winner?: User | null;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showUsers, setShowUsers] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Проверяем Telegram WebApp
  useEffect(() => {
    const checkTelegram = async () => {
      try {
        const isTelegram = await isTMA('complete');
        return isTelegram;
      } catch (error) {
        console.error('Error checking Telegram environment:', error);
        return false;
      }
    };

    const initializeApp = async () => {
      const hasTelegramWebApp = await checkTelegram();
      
      if (hasTelegramWebApp) {
        await authenticateUser();
      } else {
        setIsLoading(false);
        setError('Это приложение работает только в Telegram');
      }
    };

    initializeApp();
  }, []);

  const authenticateUser = async () => {
    try {
      const initDataRaw = retrieveRawInitData();
      console.log('=== Checking Telegram Mini App environment ===');
      console.log('Window location:', window.location.href);
      console.log('User agent:', navigator.userAgent);
      console.log('isTMA check result:', isTMA('complete'));
      console.log('Successfully detected Telegram environment');

      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
          'Authorization': `tma ${initDataRaw}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Auth response:', data);
      console.log('Current game data:', data.currentGame);
      
      // Проверяем структуру currentGame
      if (data.currentGame && typeof data.currentGame === 'object') {
        // Убеждаемся, что bets всегда является массивом
        const gameWithBets = {
          ...data.currentGame,
          bets: Array.isArray(data.currentGame.bets) ? data.currentGame.bets : []
        };
        setCurrentGame(gameWithBets);
      } else {
        setCurrentGame(null);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('App initialization error:', error);
      setError(error instanceof Error ? error.message : 'Ошибка инициализации');
      setIsLoading(false);
    }
  };

  const handleBetPlaced = () => {
    // Обновляем данные игры после размещения ставки
    fetch('/api/game/current')
      .then(response => response.json())
      .then(data => {
        if (data.game && typeof data.game === 'object') {
          // Убеждаемся, что bets всегда является массивом
          const gameWithBets = {
            ...data.game,
            bets: Array.isArray(data.game.bets) ? data.game.bets : []
          };
          setCurrentGame(gameWithBets);
        }
      })
      .catch(error => console.error('Error updating game:', error));
  };

  const handleBackToGames = () => {
    setSelectedGame(null);
    setShowUsers(false);
    setShowProfile(false);
  };

  // Показываем загрузку
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка приложения...</p>
        </div>
      </div>
    );
  }

  // Показываем ошибку
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Ошибка</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Показываем сообщение для не-Telegram пользователей
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Скоро открытие</h1>
          <p className="text-gray-600">Это приложение работает только в Telegram</p>
        </div>
      </div>
    );
  }

  console.log('=== Home component render ===', {
    hasCurrentGame: !!currentGame,
    currentGameStructure: currentGame ? {
      hasId: !!currentGame.id,
      hasStatus: !!currentGame.status,
      hasBets: !!currentGame.bets,
      betsType: currentGame.bets ? typeof currentGame.bets : 'undefined',
      betsLength: currentGame.bets ? currentGame.bets.length : 'N/A'
    } : 'null',
    hasUser: !!user,
    isLoading,
    isTelegram: true
  });

  // Основной UI
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header с профилем и балансом */}
        {user && (
          <div className="mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                {/* Профиль пользователя */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowProfile(true)}
                    className="text-blue-600 text-lg font-medium hover:text-blue-700 transition-colors duration-200"
                  >
                    @{user.username || 'username'}
                  </button>
                </div>

                {/* Баланс звезд */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <div className="text-yellow-500 text-lg">⭐</div>
                    <div className="text-gray-900 font-bold text-lg">
                      {user.balance.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Список кнопок / Game Content / Users List / User Profile */}
        {selectedGame === 'roulette' && currentGame && currentGame.bets ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                🎰 Рулетка
              </h2>
              <button
                onClick={handleBackToGames}
                className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-4 py-2 transition-colors duration-200"
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
        ) : selectedGame === 'roulette' && (!currentGame || !currentGame.bets) ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                🎰 Рулетка
              </h2>
              <button
                onClick={handleBackToGames}
                className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-4 py-2 transition-colors duration-200"
              >
                ← Назад
              </button>
            </div>
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Загрузка игры...</p>
            </div>
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
              className="w-full bg-white hover:bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">👥</span>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Список пользователей
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Посмотреть всех участников
                  </p>
                </div>
                <div className="text-blue-500 text-2xl">→</div>
              </div>
            </button>

            {/* Рулетка */}
            <button
              onClick={() => setSelectedGame('roulette')}
              className="w-full bg-white hover:bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">🎰</span>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Рулетка
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Делайте ставки и выигрывайте призы!
                  </p>
                </div>
                <div className="text-green-500 text-2xl">→</div>
              </div>
            </button>
          </div>
        )}
      </div>
      <DebugPanel user={user} />
    </div>
  );
}
