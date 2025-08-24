'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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

interface RouletteGameProps {
  game: Game;
  currentUser: User;
  onBetPlaced: () => void;
}

export default function RouletteGame({ game, currentUser, onBetPlaced }: RouletteGameProps) {
  const [betAmount, setBetAmount] = useState('');
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [rouletteRotation, setRouletteRotation] = useState(0);
  const [showInsufficientFunds, setShowInsufficientFunds] = useState(false);

  // Таймер
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const gameStart = new Date(game.gameStartTime).getTime();
      const timeUntilStart = Math.max(0, Math.floor((gameStart - now) / 1000));

      setTimeLeft(timeUntilStart);

      if (timeUntilStart === 0 && !isGameActive) {
        setIsGameActive(true);
        setRouletteRotation(prev => prev + 3600);

        setTimeout(async () => {
          setIsGameActive(false);
          setRouletteRotation(0);

          try {
            await fetch('/api/game/finish', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            });
            onBetPlaced();
          } catch (error) {
            console.error('Error finishing game:', error);
          }
        }, 5000);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [game.gameStartTime, isGameActive, onBetPlaced]);

  // Медленное вращение
  useEffect(() => {
    if (!isGameActive) {
      const interval = setInterval(() => setRouletteRotation(prev => prev + 1), 100);
      return () => clearInterval(interval);
    }
  }, [isGameActive]);

  const handlePlaceBet = async () => {
    const amount = Number(betAmount);

    if (!amount || amount <= 0) return alert('Введите корректную ставку');
    if (amount > currentUser.balance) {
      setShowInsufficientFunds(true);
      setTimeout(() => setShowInsufficientFunds(false), 3000);
      return;
    }

    setIsPlacingBet(true);
    try {
      const response = await fetch('/api/bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, gameId: game.id, amount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при ставке');
      }

      setBetAmount('');
      onBetPlaced();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Ошибка при ставке');
    } finally {
      setIsPlacingBet(false);
    }
  };

  const getDisplayName = (u: User) => u.username || u.firstName || `ID: ${u.id}`;
  const formatBalance = (b: number) => b.toLocaleString();

  // Рулетка
  const sectors = (() => {
    if (!game.bets.length) return [];
    let currentAngle = 0;
    return game.bets.map((bet, i) => {
      const percent = (bet.amount / game.totalPool) * 100;
      const angle = (percent / 100) * 360;
      const sector = {
        id: bet.user.id,
        start: currentAngle,
        end: currentAngle + angle,
        color: `hsl(${(i * 137.5) % 360}, 70%, 60%)`,
        user: bet.user,
        percent: percent.toFixed(1),
      };
      currentAngle += angle;
      return sector;
    });
  })();

  return (
    <div className="space-y-6">
      {/* Таймер */}
      <div className="text-center">
        <div className="text-5xl font-bold text-blue-600">{timeLeft}s</div>
        <div className="text-gray-500 text-sm">до начала розыгрыша</div>
      </div>

      {/* Ставка */}
      <div className="flex items-center gap-3">
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          placeholder="Ставка..."
          className="flex-1 border rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handlePlaceBet}
          disabled={isPlacingBet || !betAmount || timeLeft === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg"
        >
          {isPlacingBet ? '...' : 'Вступить'}
        </button>
      </div>
      <div className="text-sm text-gray-500">
        Баланс: {formatBalance(currentUser.balance)} ⭐
      </div>

      {/* Рулетка */}
      <div className="relative w-64 h-64 mx-auto">
        {/* Указатель */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-16 border-transparent border-b-red-500 z-10" />
        <motion.div
          className="w-full h-full rounded-full"
          style={{ transform: `rotate(${rouletteRotation}deg)` }}
          transition={{ duration: isGameActive ? 5 : 0.1, ease: 'easeOut' }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {sectors.map((s) => {
              const start = (s.start * Math.PI) / 180;
              const end = (s.end * Math.PI) / 180;
              const r = 90;
              const x1 = 100 + r * Math.cos(start);
              const y1 = 100 + r * Math.sin(start);
              const x2 = 100 + r * Math.cos(end);
              const y2 = 100 + r * Math.sin(end);
              const largeArc = s.end - s.start > 180 ? 1 : 0;
              return (
                <path
                  key={s.id}
                  d={`M100,100 L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`}
                  fill={s.color}
                />
              );
            })}
            <circle cx="100" cy="100" r="8" fill="#111" />
          </svg>
        </motion.div>
      </div>

      {/* Участники */}
      <div>
        <h3 className="text-center font-semibold mb-2">Участники ({game.bets.length})</h3>
        {game.bets.length === 0 ? (
          <div className="text-center text-gray-500">⏳ Ждем игроков...</div>
        ) : (
          <div className="space-y-2">
            {game.bets.map((bet, i) => (
              <div key={bet.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">#{i + 1}</span>
                  <span className="font-medium">{getDisplayName(bet.user)}</span>
                </div>
                <span className="font-bold text-blue-600">{formatBalance(bet.amount)} ⭐</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ошибка */}
      {showInsufficientFunds && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <h3 className="text-lg font-bold mb-2">Недостаточно звезд</h3>
            <p className="text-gray-600 mb-4">Пополните баланс</p>
            <button
              onClick={() => setShowInsufficientFunds(false)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
