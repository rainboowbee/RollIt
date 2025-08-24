'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Input } from '@telegram-apps/telegram-ui';

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

interface RouletteGameProps {
  game: Game;
  currentUser: User;
  onBetPlaced: () => void;
}

export default function RouletteGame({ game, currentUser, onBetPlaced }: RouletteGameProps) {
  const [betAmount, setBetAmount] = useState('');
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  const handlePlaceBet = async () => {
    if (!betAmount || isNaN(Number(betAmount))) {
      alert('Введите корректную сумму ставки');
      return;
    }

    const amount = Number(betAmount);
    if (amount <= 0 || amount > currentUser.balance) {
      alert('Недостаточно средств для ставки');
      return;
    }

    setIsPlacingBet(true);
    try {
      const response = await fetch('/api/bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: game.id,
          amount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при размещении ставки');
      }

      setBetAmount('');
      onBetPlaced();
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

  return (
    <div className="space-y-6">
      {/* Статус игры */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <div className="text-4xl mb-3">🎰</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Игра #{game.id}
          </h3>
          <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white text-sm font-medium mb-3">
            {game.status === 'waiting' ? '⏳ Ожидание' : 
             game.status === 'active' ? '🎯 Активна' : '🏁 Завершена'}
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatBalance(game.totalPool)} монет
          </div>
          <div className="text-gray-600 dark:text-gray-300 text-sm">
            Общий пул
          </div>
        </div>
      </div>

      {/* Баланс пользователя */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <div className="text-3xl mb-2">💰</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Ваш баланс
          </h3>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
            {formatBalance(currentUser.balance)} монет
          </div>
          <div className="text-gray-600 dark:text-gray-300 text-sm">
            Доступно для ставок
          </div>
        </div>
      </div>

      {/* Размещение ставки */}
      {game.status === 'waiting' && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="text-center mb-4">
            <div className="text-3xl mb-2">🎲</div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Разместить ставку
            </h3>
          </div>
          <div className="space-y-4">
            <Input
              type="number"
              placeholder="Сумма ставки"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              min="1"
              max={currentUser.balance}
              className="text-center text-lg"
            />
            <Button
              onClick={handlePlaceBet}
              disabled={isPlacingBet || !betAmount}
              loading={isPlacingBet}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg"
            >
              {isPlacingBet ? 'Размещение...' : '🎯 Сделать ставку'}
            </Button>
          </div>
        </div>
      )}

      {/* Участники */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="text-center mb-4">
          <div className="text-2xl mb-2">👥</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Участники ({game.bets.length})
          </h3>
        </div>
        
        {game.bets.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">⏳</div>
            <p className="text-gray-600 dark:text-gray-300">Ожидание игроков...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {game.bets.map((bet, index) => (
              <div
                key={bet.id}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white">
                      {getDisplayName(bet.user)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Ставка: {formatBalance(bet.amount)} монет
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                      {formatBalance(bet.amount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Победитель */}
      {game.status === 'finished' && game.winner && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ duration: 1, type: "spring" }}
            className="text-center"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
              Победитель!
            </h3>
            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full p-4 mb-4">
              <div className="text-4xl">👑</div>
            </div>
            <div className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              {getDisplayName(game.winner)}
            </div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {formatBalance(game.totalPool)} монет
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              Выигрыш
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
