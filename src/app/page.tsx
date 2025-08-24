'use client';

import { useState, useEffect } from 'react';
import { initData, useSignal, isTMA, useLaunchParams } from '@telegram-apps/sdk-react';
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

  // Use official Telegram SDK signals
  const initDataUser = useSignal(initData.user);
  const launchParams = useLaunchParams();

  console.log('=== Home component render ===', {
    isTelegram,
    isLoading,
    hasUser: !!user,
    hasCurrentGame: !!currentGame,
    launchParamsAvailable: !!launchParams.tgWebAppData,
    launchParams: launchParams
  });

  // Check if we're in Telegram Mini App
  useEffect(() => {
    console.log('=== First useEffect (checking Telegram) ===');
    const checkTelegram = async () => {
      try {
        console.log('=== Checking Telegram Mini App environment ===');
        console.log('Window location:', window.location.href);
        console.log('User agent:', navigator.userAgent);
        
        // Use official SDK to check if we're in Telegram
        const isInTelegram = await isTMA('complete');
        console.log('isTMA check result:', isInTelegram);
        setIsTelegram(isInTelegram);
        
        if (!isInTelegram) {
          console.log('Not in Telegram environment, showing external message');
          setIsLoading(false);
        } else {
          console.log('Successfully detected Telegram environment');
        }
      } catch (error) {
        console.error('Error checking TMA:', error);
        setIsTelegram(false);
        setIsLoading(false);
      }
    };

    checkTelegram();
  }, []);

  useEffect(() => {
    console.log('=== Second useEffect (initialization) ===', {
      isTelegram,
      isLoading,
      hasLaunchParams: !!launchParams.tgWebAppData
    });
    
    if (isTelegram === null) return; // Still checking
    if (!isTelegram) {
      setIsLoading(false);
      return;
    }

    console.log('=== Telegram environment confirmed, starting initialization ===');
    console.log('Current launch params:', launchParams);
    console.log('tgWebAppData available:', !!launchParams.tgWebAppData);
    console.log('tgWebAppData value:', launchParams.tgWebAppData);

    const initializeApp = async () => {
      try {
        console.log('=== Initializing RollIt App in Telegram ===');
        console.log('Init data user:', initDataUser);
        console.log('Launch params:', launchParams);
        console.log('tgWebAppData:', launchParams.tgWebAppData);

        // Wait for launch params to be available
        if (!launchParams.tgWebAppData) {
          console.log('Waiting for launch params...');
          return;
        }

        console.log('Starting authentication...');
        
        // Authenticate user using tgWebAppData from launch params
        const response = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            initData: launchParams.tgWebAppData,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Ошибка авторизации');
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
        setError(error instanceof Error ? error.message : 'Ошибка инициализации приложения');
      } finally {
        setIsLoading(false);
      }
    };

    // Initialize when we have the required data
    if (launchParams.tgWebAppData) {
      console.log('Launch params available, starting initialization...');
      initializeApp();
    } else {
      console.log('Launch params not available yet, waiting...');
      // Set up a watcher for when launch params become available
      const checkParams = setInterval(() => {
        console.log('Checking launch params...', {
          hasTgWebAppData: !!launchParams.tgWebAppData,
          tgWebAppData: launchParams.tgWebAppData
        });
        
        if (launchParams.tgWebAppData) {
          console.log('Launch params now available, starting initialization...');
          clearInterval(checkParams);
          initializeApp();
        }
      }, 500);
      
      // Cleanup after 10 seconds
      setTimeout(() => {
        clearInterval(checkParams);
        if (!launchParams.tgWebAppData) {
          console.error('Launch params not available after timeout');
          setError('Не удалось получить данные Telegram WebApp');
          setIsLoading(false);
        }
      }, 10000);
    }
  }, [isTelegram, initDataUser, launchParams.tgWebAppData]);

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Проверка платформы...</p>
        </div>
      </div>
    );
  }

  // Show error if not in Telegram
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

  // Show loading state
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

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Ошибка
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  // Show main app
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
              <Button 
                onClick={handleBackToGames}
                className="mb-4"
              >
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
          <GameList onGameSelect={handleGameSelect} />
        )}
      </div>

      {/* Debug Panel */}
      <DebugPanel />
    </div>
  );
}
