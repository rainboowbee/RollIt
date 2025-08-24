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
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl p-6 border border-cyan-400/50 shadow-lg shadow-cyan-400/20">
        <div className="text-center">
          <div className="text-4xl mb-3">🎰</div>
          <h3 className="text-xl font-bold text-white mb-3">
            Игра #{game.id}
          </h3>
          <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full text-white text-sm font-medium mb-3 shadow-lg shadow-cyan-400/50">
            {game.status === 'waiting' ? '⏳ Ожидание' : 
             game.status === 'active' ? '🎯 Активна' : '🏁 Завершена'}
          </div>
          <div className="text-2xl font-bold text-cyan-400 mb-1">
            {formatBalance(game.totalPool)} ⭐
          </div>
          <div className="text-cyan-200 text-sm">
            Общий пул
          </div>
        </div>
      </div>

      {/* Баланс пользователя */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-2xl p-6 border border-green-400/50 shadow-lg shadow-green-400/20">
        <div className="text-center">
          <div className="text-3xl mb-2">💰</div>
          <h3 className="text-lg font-semibold text-green-200 mb-2">
            Ваш баланс
          </h3>
          <div className="text-2xl font-bold text-green-400 mb-1">
            {formatBalance(currentUser.balance)} ⭐
          </div>
          <div className="text-green-200 text-sm">
            Доступно для ставок
          </div>
        </div>
      </div>

      {/* Размещение ставки */}
      {game.status === 'waiting' && (
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-6 border border-purple-400/50 shadow-lg shadow-purple-400/20">
          <div className="text-center mb-4">
            <div className="text-3xl mb-2">🎲</div>
            <h3 className="text-lg font-semibold text-white mb-3">
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
              className="text-center text-lg bg-white/10 border-purple-400/50 text-white placeholder-purple-200/70"
            />
            <button
              onClick={handlePlaceBet}
              disabled={isPlacingBet || !betAmount}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-purple-400/50 transition-all duration-200 hover:shadow-xl hover:shadow-purple-400/70 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlacingBet ? '🎯 Размещение...' : '🎯 Сделать ставку'}
            </button>
          </div>
        </div>
      )}

      {/* Участники */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-slate-400/30 shadow-lg shadow-slate-400/20">
        <div className="text-center mb-4">
          <div className="text-2xl mb-2">👥</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Участники ({game.bets.length})
          </h3>
        </div>
        
        {game.bets.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">⏳</div>
            <p className="text-slate-300">Ожидание игроков...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {game.bets.map((bet, index) => (
              <div
                key={bet.id}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-600/20 to-slate-700/20 backdrop-blur-sm rounded-xl border border-slate-400/30 hover:border-slate-300/50 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-cyan-400/50">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {getDisplayName(bet.user)}
                    </div>
                    <div className="text-xs text-slate-300">
                      Ставка: {formatBalance(bet.amount)} ⭐
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-full border border-cyan-400/50 shadow-lg shadow-cyan-400/20">
                    <span className="text-cyan-400 font-bold text-sm">
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
        <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 backdrop-blur-md rounded-2xl p-6 border border-yellow-400/50 shadow-lg shadow-yellow-400/20">
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ duration: 1, type: "spring" }}
            className="text-center"
          >
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Победитель!
            </h3>
            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full p-4 mb-4 shadow-lg shadow-yellow-400/50">
              <div className="text-4xl">👑</div>
            </div>
            <div className="text-xl font-semibold text-white mb-2">
              {getDisplayName(game.winner)}
            </div>
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {formatBalance(game.totalPool)} ⭐
            </div>
            <div className="text-yellow-200 text-sm">
              Выигрыш
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
