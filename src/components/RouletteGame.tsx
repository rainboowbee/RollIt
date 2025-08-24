'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameUpdates } from '@/hooks/useGameUpdates';

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
  winPercentage: string;
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
  gameStartTime: string;
  bets: Bet[];
  winnerId?: number | null;
  winner?: {
    id: number;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  timeUntilStart: number;
  gameStatus: string;
  stats: {
    totalBets: number;
    totalPool: number;
    averageBet: number;
    minBet: number;
    maxBet: number;
  };
}

interface RouletteGameProps {
  game: Game;
  currentUser: User;
  onBetPlaced: () => void;
}

export default function RouletteGame({ game, currentUser, onBetPlaced }: RouletteGameProps) {
  const [betAmount, setBetAmount] = useState('');
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [showInsufficientFunds, setShowInsufficientFunds] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [rouletteRotation, setRouletteRotation] = useState(0);
  const [winner, setWinner] = useState<any>(null);

  // Используем WebSocket для real-time обновлений
  const {
    isConnected,
    game: realtimeGame,
    totalPool: realtimeTotalPool,
    bets: realtimeBets,
    timeUntilStart: realtimeTimeUntilStart,
    error: connectionError
  } = useGameUpdates({
    gameId: game.id,
    onUpdate: (update) => {
      if (update.type === 'game_update') {
        console.log('Real-time game update received');
        // Обновляем состояние игры
        onBetPlaced();
      }
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    },
    enabled: true
  });

  // Используем real-time данные или fallback на props
  const currentGame = realtimeGame || game;
  const totalPool = realtimeTotalPool || game.totalPool;
  const bets = realtimeBets || game.bets;
  const timeUntilStart = realtimeTimeUntilStart ?? game.timeUntilStart;

  // Таймер игры
  useEffect(() => {
    if (!currentGame) return;
    
    const updateTimer = () => {
      if (timeUntilStart <= 0 && !isGameActive) {
        console.log('Game timer expired, starting game!');
        setIsGameActive(true);
        // Запускаем быстрое вращение рулетки
        setRouletteRotation(prev => prev + 3600); // 10 полных оборотов
        
        // Через 5 секунд (время вращения) создаем новую игру
        setTimeout(async () => {
          console.log('Game animation finished, finishing game');
          setIsGameActive(false);
          setRouletteRotation(0);
          
          try {
            // Завершаем текущую игру и создаем новую
            const response = await fetch('/api/game/finish', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log('Game finished successfully:', data);
              
              // Показываем победителя
              if (data.finishedGame.winnerId) {
                const winningBet = bets.find((bet: Bet) => bet.user.id === data.finishedGame.winnerId);
                if (winningBet) {
                  setWinner(winningBet.user);
                  setTimeout(() => setWinner(null), 5000); // Скрываем через 5 секунд
                }
              }
              
              // Обновляем данные игры и пользователя
              onBetPlaced();
            } else {
              console.error('Failed to finish game');
            }
          } catch (error) {
            console.error('Error finishing game:', error);
          }
        }, 5000);
      }
    };

    // Обновляем таймер каждую секунду
    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [timeUntilStart, isGameActive, onBetPlaced, bets, currentGame]);

  // Медленное вращение рулетки во время ожидания
  useEffect(() => {
    if (!currentGame || isGameActive) return;
    
    const interval = setInterval(() => {
      setRouletteRotation(prev => prev + 1);
    }, 100);
    return () => clearInterval(interval);
  }, [currentGame, isGameActive]);

  // Быстрое вращение рулетки во время активной игры
  useEffect(() => {
    if (!currentGame || !isGameActive) return;
    
    console.log('Starting fast roulette rotation');
    const interval = setInterval(() => {
      setRouletteRotation(prev => prev + 10); // Быстрое вращение
    }, 50); // Каждые 50мс для плавности
    
    return () => clearInterval(interval);
  }, [currentGame, isGameActive]);

  // Проверяем, что game существует
  if (!currentGame) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-gray-600">Игра не найдена</p>
      </div>
    );
  }

  const handlePlaceBet = async () => {
    if (!betAmount || isNaN(Number(betAmount))) {
      alert('Введите корректную сумму ставки');
      return;
    }

    const amount = Number(betAmount);
    if (amount <= 0) {
      alert('Сумма ставки должна быть больше 0');
      return;
    }

    if (amount > currentUser.balance) {
      setShowInsufficientFunds(true);
      setTimeout(() => setShowInsufficientFunds(false), 3000);
      return;
    }

    setIsPlacingBet(true);
    try {
      // Используем новый API endpoint для присоединения к игре
      const response = await fetch('/api/game/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          gameId: currentGame.id,
          amount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при размещении ставки');
      }

      const data = await response.json();
      console.log('Bet placed successfully:', data);
      
      // Обновляем баланс пользователя в UI
      if (data.user && data.user.balance !== undefined) {
        // Обновляем баланс через callback
        onBetPlaced();
      }
      
      setBetAmount('');
      alert('Ставка размещена успешно!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Ошибка при размещении ставки');
    } finally {
      setIsPlacingBet(false);
    }
  };

  const getDisplayName = (user: { username?: string | null; firstName?: string | null; lastName?: string | null }) => {
    return user.username || user.firstName || 'Неизвестный игрок';
  };

  const formatBalance = (balance: number) => {
    return balance.toLocaleString();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Расчет процента выигрыша для текущего пользователя
  const currentUserBet = bets?.find((bet: Bet) => bet.user.id === currentUser.id);
  const currentUserWinPercentage = currentUserBet && totalPool > 0
    ? ((currentUserBet.amount / totalPool) * 100).toFixed(1)
    : '0.0';

  // Создание секторов рулетки
  const createRouletteSectors = (): Array<{
    id: number;
    startAngle: number;
    endAngle: number;
    percentage: string;
    color: string;
    user: {
      id: number;
      username?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      photoUrl?: string | null;
    };
  }> => {
    if (!bets || bets.length === 0) return [];
    
    const sectors: Array<{
      id: number;
      startAngle: number;
      endAngle: number;
      percentage: string;
      color: string;
      user: {
        id: number;
        username?: string | null;
        firstName?: string | null;
        lastName?: string | null;
        photoUrl?: string | null;
      };
    }> = [];
    let currentAngle = 0;
    
    bets.forEach((bet: Bet, index: number) => {
      const percentage = totalPool > 0 ? (bet.amount / totalPool) * 100 : 0;
      const angle = (percentage / 100) * 360;
      
      sectors.push({
        id: bet.user.id,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        percentage: percentage.toFixed(1),
        color: `hsl(${(index * 137.5) % 360}, 70%, 60%)`,
        user: bet.user
      });
      
      currentAngle += angle;
    });
    
    return sectors;
  };

  const sectors = createRouletteSectors();

  return (
    <div className="space-y-6">
      {/* Connection status */}
      {connectionError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <p className="text-red-600 text-sm">
            Ошибка соединения: {connectionError}
          </p>
        </div>
      )}

      {/* Header с username и таймером */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-blue-600 text-lg font-medium">
            {currentUser.username ? `@${currentUser.username}` : `ID: ${currentUser.id}`}
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatTime(timeUntilStart)}
            </div>
            <div className={`text-sm ${isGameActive ? 'text-red-600' : 'text-green-600'}`}>
              {isGameActive ? '🎰 Игра активна!' : '⏳ Ожидание...'}
            </div>
          </div>
        </div>
      </div>

      {/* Блок ставки */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4 mb-4">
          {/* Поле ввода ставки */}
          <div className="flex-1">
            <input
              type="number"
              placeholder="Звезды..."
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              min="1"
              max={currentUser.balance}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <div className="text-sm text-gray-500 mt-2">
              Баланс: {formatBalance(currentUser.balance)} ⭐
            </div>
          </div>
          
          {/* Кнопка вступить */}
          <button
            onClick={handlePlaceBet}
            disabled={isPlacingBet || !betAmount || timeUntilStart === 0 || isGameActive}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {isPlacingBet ? 'Вступление...' : 
             isGameActive ? 'Игра активна' : 
             timeUntilStart === 0 ? 'Время вышло' : 
             'Вступить'}
          </button>
        </div>

        {/* Общий пул и процент выигрыша */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatBalance(totalPool)}
            </div>
            <div className="text-sm text-gray-600">Общий пул</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {currentUserWinPercentage}%
            </div>
            <div className="text-sm text-gray-600">Процент выигрыша</div>
          </div>
        </div>

        {/* Статистика игры */}
        {currentGame.stats && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-4 gap-2 text-xs text-center">
              <div>
                <div className="font-semibold text-gray-900">{currentGame.stats.totalBets}</div>
                <div className="text-gray-500">Ставок</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">{formatBalance(currentGame.stats.averageBet)}</div>
                <div className="text-gray-500">Средняя</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">{formatBalance(currentGame.stats.minBet)}</div>
                <div className="text-gray-500">Мин.</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">{formatBalance(currentGame.stats.maxBet)}</div>
                <div className="text-gray-500">Макс.</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Победитель */}
      {winner && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-xl font-bold text-yellow-800 mb-2">
            Победитель!
          </h3>
          <p className="text-yellow-700">
            {getDisplayName(winner)} выиграл {formatBalance(totalPool)} ⭐!
          </p>
        </div>
      )}

      {/* Рулетка */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Рулетка</h3>
        </div>
        
        {/* ID пользователей над рулеткой */}
        <div className="flex justify-center mb-4">
          <div className="flex space-x-2 text-xs text-gray-600">
            {sectors.map((sector) => (
              <div key={sector.id} className="text-center">
                <div className="font-medium">
                  {getDisplayName(sector.user)}
                </div>
                <div className="text-xs">{sector.percentage}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Визуализация рулетки */}
        <div className="relative w-64 h-64 mx-auto">
          <motion.div
            className="w-full h-full"
            style={{
              transform: `rotate(${rouletteRotation}deg)`,
              transformOrigin: 'center center'
            }}
            transition={{ duration: isGameActive ? 5 : 0.1, ease: "easeOut" }}
          >
            {/* Круглая рулетка */}
            <svg width="100%" height="100%" viewBox="0 0 200 200">
              <defs>
                <linearGradient id="sectorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
              
              {/* Фон круга */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="url(#sectorGradient)"
                stroke="#1e40af"
                strokeWidth="2"
              />
              
              {/* Секторы */}
              {sectors.map((sector) => {
                const startAngle = (sector.startAngle * Math.PI) / 180;
                const endAngle = (sector.endAngle * Math.PI) / 180;
                const radius = 80;
                
                const x1 = 100 + radius * Math.cos(startAngle);
                const y1 = 100 + radius * Math.sin(startAngle);
                const x2 = 100 + radius * Math.cos(endAngle);
                const y2 = 100 + radius * Math.sin(endAngle);
                
                const largeArcFlag = sector.endAngle - sector.startAngle > 180 ? 1 : 0;
                
                return (
                  <path
                    key={sector.id}
                    d={`M100,100 L${x1},${y1} A${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2} Z`}
                    fill={sector.color}
                    stroke="#1e40af"
                    strokeWidth="1"
                  />
                );
              })}
              
              {/* Центральная точка */}
              <circle cx="100" cy="100" r="8" fill="#1e40af" />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Участники */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Участники ({bets?.length || 0})</h3>
        </div>
        
        {/* Debug info */}
        <div className="text-xs text-gray-500 mb-4">
          Debug: bets array length = {bets?.length || 'undefined'}, 
          totalPool = {totalPool}, 
          game status = {currentGame.status}
        </div>
        
        {!bets || bets.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">⏳</div>
            <p className="text-gray-600">Ожидание игроков...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bets.map((bet: Bet) => (
              <div
                key={bet.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                    {bet.user.username ? bet.user.username.charAt(0).toUpperCase() : bet.user.id}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {getDisplayName(bet.user)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Ставка: {formatBalance(bet.amount)} ⭐ ({bet.winPercentage}%)
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center px-2 py-1 bg-blue-100 rounded-full border border-blue-200">
                    <span className="text-blue-600 font-bold text-sm">
                      {formatBalance(bet.amount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Всплывающее окно недостаточно звезд */}
      {showInsufficientFunds && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 mx-4 max-w-sm">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Недостаточно звезд
              </h3>
              <p className="text-gray-600 mb-4">
                У вас недостаточно звезд для этой ставки
              </p>
              <button
                onClick={() => setShowInsufficientFunds(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
