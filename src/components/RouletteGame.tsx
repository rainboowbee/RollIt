'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Section, Cell, Button, Input } from '@telegram-apps/telegram-ui';

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
      {/* Game Status */}
      <Section header={`Статус игры: ${game.status === 'waiting' ? 'Ожидание' : game.status === 'active' ? 'Активна' : 'Завершена'}`}>
        <Cell subtitle={`Общий пул: ${formatBalance(game.totalPool)} монет`}>
          Игра #{game.id}
        </Cell>
      </Section>

      {/* User Balance */}
      <Section header="Ваш баланс">
        <Cell subtitle={`Доступно для ставок: ${formatBalance(currentUser.balance)} монет`}>
          💰 Баланс
        </Cell>
      </Section>

      {/* Place Bet */}
      {game.status === 'waiting' && (
        <Section header="Разместить ставку">
          <div className="space-y-4">
            <Input
              type="number"
              placeholder="Сумма ставки"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              min="1"
              max={currentUser.balance}
            />
            <Button
              onClick={handlePlaceBet}
              disabled={isPlacingBet || !betAmount}
              loading={isPlacingBet}
              className="w-full"
            >
              {isPlacingBet ? 'Размещение...' : 'Сделать ставку'}
            </Button>
          </div>
        </Section>
      )}

      {/* Participants */}
      <Section header={`Участники (${game.bets.length})`}>
        {game.bets.length === 0 ? (
          <Cell subtitle="Пока нет участников">Ожидание игроков...</Cell>
        ) : (
          game.bets.map((bet) => (
            <Cell
              key={bet.id}
              before="👤"
              subtitle={`Ставка: ${formatBalance(bet.amount)} монет`}
            >
              {getDisplayName(bet.user)}
            </Cell>
          ))
        )}
      </Section>

      {/* Winner Animation */}
      {game.status === 'finished' && game.winner && (
        <Section header="🎉 Победитель!">
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ duration: 1, type: "spring" }}
            className="text-center"
          >
            <div className="text-6xl mb-4">🎰</div>
            <Cell subtitle={`Выигрыш: ${formatBalance(game.totalPool)} монет`}>
              {getDisplayName(game.winner)}
            </Cell>
          </motion.div>
        </Section>
      )}
    </div>
  );
}
