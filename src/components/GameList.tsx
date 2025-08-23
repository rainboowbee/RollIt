'use client';

import { Gamepad2, Users, Zap } from 'lucide-react';

const games = [
  {
    id: 'roulette',
    name: 'Рулетка',
    description: 'Классическая игра в рулетку с шансами по ставкам',
    icon: Gamepad2,
    players: '2-50',
    minBet: 10,
    maxBet: 1000,
  },
  // Можно добавить больше игр в будущем
];

interface GameListProps {
  onGameSelect: (gameId: string) => void;
}

export default function GameList({ onGameSelect }: GameListProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Доступные игры
      </h3>
      
      {games.map((game) => {
        const IconComponent = game.icon;
        
        return (
          <div
            key={game.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onGameSelect(game.id)}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {game.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {game.description}
                </p>
                
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{game.players}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4" />
                    <span>{game.minBet}-{game.maxBet} монет</span>
                  </div>
                </div>
              </div>
              
              <div className="text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
