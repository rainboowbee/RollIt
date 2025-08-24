'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@telegram-apps/telegram-ui';

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
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="text-center">
          <div className="text-4xl mb-3">🎰</div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Игра #{game.id}
          </h3>
          <div className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-3">
            {game.status === 'waiting' ? '⏳ Ожидание' : 
             game.status === 'active' ? '🎯 Активна' : '🏁 Завершена'}
          </div>
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {formatBalance(game.totalPool)} ⭐
          </div>
          <div className="text-gray-600 text-sm">
            Общий пул
          </div>
        </div>
      </div>

      {/* Баланс пользователя */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="text-center">
          <div className="text-3xl mb-2">💰</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ваш баланс
          </h3>
          <div className="text-2xl font-bold text-green-600 mb-1">
            {formatBalance(currentUser.balance)} ⭐
          </div>
          <div className="text-gray-600 text-sm">
            Доступно для ставок
          </div>
        </div>
      </div>

      {/* Размещение ставки */}
      {game.status === 'waiting' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-center mb-4">
            <div className="text-3xl mb-2">🎲</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
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
              className="text-center text-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handlePlaceBet}
              disabled={isPlacingBet || !betAmount}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl transition-colors duration-200 disabled:cursor-not-allowed"
            >
              {isPlacingBet ? '🎯 Размещение...' : '🎯 Сделать ставку'}
            </button>
          </div>
        </div>
      )}

      {/* Участники */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="text-center mb-4">
          <div className="text-2xl mb-2">👥</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Участники ({game.bets.length})
          </h3>
        </div>
        
        {game.bets.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">⏳</div>
            <p className="text-gray-600">Ожидание игроков...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {game.bets.map((bet, index) => (
              <div
                key={bet.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {getDisplayName(bet.user)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Ставка: {formatBalance(bet.amount)} ⭐
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

      {/* Победитель */}
      {game.status === 'finished' && game.winner && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ duration: 1, type: "spring" }}
            className="text-center"
          >
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Победитель!
            </h3>
            <div className="bg-yellow-100 rounded-full p-4 mb-4 border border-yellow-200">
              <div className="text-4xl">👑</div>
            </div>
            <div className="text-xl font-semibold text-gray-900 mb-2">
              {getDisplayName(game.winner)}
            </div>
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {formatBalance(game.totalPool)} ⭐
            </div>
            <div className="text-gray-600 text-sm">
              Выигрыш
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
