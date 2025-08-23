'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Users, Trophy } from 'lucide-react';
import { formatBalance, getDisplayName } from '@/lib/utils';

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

interface RouletteGameProps {
  game: Game;
  currentUser: {
    id: number;
    balance: number;
  };
  onBetPlaced: () => void;
}

export default function RouletteGame({ game, currentUser, onBetPlaced }: RouletteGameProps) {
  const [betAmount, setBetAmount] = useState(10);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const quickAmounts = [10, 25, 50, 100, 250, 500];

  useEffect(() => {
    if (game.status === 'finished' && game.winner) {
      setShowWinner(true);
      setIsSpinning(true);
      
      // Hide winner after 5 seconds
      setTimeout(() => {
        setShowWinner(false);
        setIsSpinning(false);
      }, 5000);
    }
  }, [game.status, game.winner]);

  const handleBet = async () => {
    if (betAmount <= 0 || betAmount > currentUser.balance) return;
    
    setIsPlacingBet(true);
    
    try {
      const response = await fetch('/api/bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          amount: betAmount,
        }),
      });

      if (response.ok) {
        onBetPlaced();
        setBetAmount(10);
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка при создании ставки');
      }
    } catch (error) {
      console.error('Bet error:', error);
      alert('Ошибка при создании ставки');
    } finally {
      setIsPlacingBet(false);
    }
  };

  const getCurrentUserBet = () => {
    return game.bets.find(bet => bet.user.id === currentUser.id);
  };

  const currentUserBet = getCurrentUserBet();

  return (
    <div className="space-y-6">
      {/* Game Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {game.status === 'waiting' ? 'Ожидание игроков' : 'Игра активна'}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">{game.bets.length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-700 dark:text-gray-300">{formatBalance(game.totalPool)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Winner Animation */}
      <AnimatePresence>
        {showWinner && game.winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 text-center text-white"
          >
            <motion.div
              animate={{ rotate: isSpinning ? 360 : 0 }}
              transition={{ duration: 2, repeat: isSpinning ? Infinity : 0 }}
              className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center"
            >
              <Trophy className="w-8 h-8 text-yellow-600" />
            </motion.div>
            <h3 className="text-xl font-bold mb-2">Победитель!</h3>
            <p className="text-lg">
              {getDisplayName(game.winner)} выиграл {formatBalance(game.totalPool)} монет!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Betting Interface */}
      {game.status !== 'finished' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Сделать ставку
          </h3>
          
          <div className="space-y-4">
            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  className={`
                    py-2 px-3 rounded-lg text-sm font-medium transition-colors
                    ${betAmount === amount
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  {amount}
                </button>
              ))}
            </div>

            {/* Custom Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Сумма ставки
              </label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                min="1"
                max={currentUser.balance}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Доступно: {formatBalance(currentUser.balance)} монет
              </p>
            </div>

            {/* Current User Bet */}
            {currentUserBet && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Ваша ставка: <span className="font-medium">{formatBalance(currentUserBet.amount)} монет</span>
                </p>
              </div>
            )}

            {/* Place Bet Button */}
            <button
              onClick={handleBet}
              disabled={isPlacingBet || betAmount <= 0 || betAmount > currentUser.balance}
              className={`
                w-full py-3 px-4 rounded-lg font-medium transition-colors
                ${isPlacingBet || betAmount <= 0 || betAmount > currentUser.balance
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
                }
              `}
            >
              {isPlacingBet ? 'Размещение ставки...' : 'Сделать ставку'}
            </button>
          </div>
        </div>
      )}

      {/* Players List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Участники ({game.bets.length})
        </h3>
        
        {game.bets.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Пока нет участников. Будьте первым!
          </p>
        ) : (
          <div className="space-y-3">
            {game.bets.map((bet) => (
              <div
                key={bet.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {getDisplayName(bet.user).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {getDisplayName(bet.user)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatBalance(bet.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
