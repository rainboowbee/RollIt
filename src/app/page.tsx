'use client';

import { useState, useEffect } from 'react';
import { getTelegramWebApp } from '@/lib/telegram';
import UserProfile from '@/components/UserProfile';
import GameList from '@/components/GameList';
import RouletteGame from '@/components/RouletteGame';
import LandingPage from '@/components/LandingPage';
import DebugInfo from '@/components/DebugInfo';

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

  // Check if we're in Telegram WebApp with better detection
  useEffect(() => {
    const checkTelegram = (): boolean => {
      // Multiple ways to detect Telegram WebApp
      const hasTelegramWebApp = typeof window !== 'undefined' && !!window.Telegram?.WebApp;
      const hasInitData = typeof window !== 'undefined' && !!window.Telegram?.WebApp?.initData;
      const hasUserAgent = typeof window !== 'undefined' && navigator.userAgent.includes('TelegramWebApp');
      
      console.log('Telegram detection:', {
        hasTelegramWebApp,
        hasInitData,
        hasUserAgent,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'N/A'
      });

      return hasTelegramWebApp || hasInitData || hasUserAgent;
    };

    // Check immediately
    const telegramDetected = checkTelegram();
    setIsTelegram(telegramDetected);

    // If not detected immediately, wait a bit and check again
    if (!telegramDetected) {
      const timer = setTimeout(() => {
        const retryCheck = checkTelegram();
        setIsTelegram(retryCheck);
        if (!retryCheck) {
          setIsLoading(false);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (telegramDetected) {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isTelegram === null) return; // Still checking
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

        console.log('Initializing Telegram WebApp:', {
          initData: webApp.initData,
          initDataUnsafe: webApp.initDataUnsafe
        });

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
        console.log('Auth response:', data);
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

  // Show loading state while checking Telegram
  if (isTelegram === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Проверка платформы...</p>
        </div>
      </div>
    );
  }

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
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Попробовать снова
          </button>
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
      
      {/* Debug Info */}
      <DebugInfo />
    </div>
  );
}
