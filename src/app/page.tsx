'use client';

import { useState, useEffect } from 'react';
import { isTelegramWebApp, getTelegramWebApp } from '@/lib/telegram';
import UserProfile from '@/components/UserProfile';
import GameList from '@/components/GameList';
import RouletteGame from '@/components/RouletteGame';
import LandingPage from '@/components/LandingPage';

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

  // Check if we're in Telegram WebApp
  const isTelegram = isTelegramWebApp();

  useEffect(() => {
    if (!isTelegram) {
      setIsLoading(false);
      return;
    }

    const initApp = async () => {
      try {
        const webApp = getTelegramWebApp();
        if (!webApp) {
          setError('Telegram WebApp не доступен');
          setIsLoading(false);
          return;
        }

        // Initialize Telegram WebApp
        webApp.ready();
        webApp.expand();

        // Authenticate user
        const response = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            initData: webApp.initData,
          }),
        });

        if (!response.ok) {
          throw new Error('Ошибка авторизации');
        }

        const data = await response.json();
        setUser(data.user);
        setCurrentGame(data.currentGame);
        
        // Set up polling for game updates
        const interval = setInterval(async () => {
          try {
            const gameResponse = await fetch('/api/game/current');
            if (gameResponse.ok) {
              const gameData = await gameResponse.json();
              setCurrentGame(gameData.game);
            }
          } catch (error) {
            console.error('Game update error:', error);
          }
        }, 5000); // Update every 5 seconds

        return () => clearInterval(interval);

      } catch (error) {
        console.error('App initialization error:', error);
        setError('Ошибка инициализации приложения');
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, [isTelegram]);

  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId);
  };

  const handleBackToGames = () => {
    setSelectedGame(null);
  };

  const handleBetPlaced = async () => {
    // Refresh user data and current game
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

  // Show landing page if not in Telegram
  if (!isTelegram) {
    return <LandingPage />;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Загрузка приложения...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Ошибка
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // Show main app
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🎰 RollIt
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Мини-игра в рулетку
          </p>
        </div>

        {/* User Profile */}
        {user && (
          <div className="mb-6">
            <UserProfile user={user} />
          </div>
        )}

        {/* Game Content */}
        {selectedGame === 'roulette' && currentGame ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleBackToGames}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                ← Назад к играм
              </button>
            </div>
            <RouletteGame
              game={currentGame}
              currentUser={user!}
              onBetPlaced={handleBetPlaced}
            />
          </div>
        ) : (
          <GameList onGameSelect={handleGameSelect} />
        )}
      </div>
    </div>
  );
}
