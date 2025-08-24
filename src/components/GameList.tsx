'use client';

import { Button } from '@telegram-apps/telegram-ui';

interface GameListProps {
  onGameSelect: (gameId: string) => void;
  onShowUsers: () => void;
}

export default function GameList({ onGameSelect, onShowUsers }: GameListProps) {
  const games = [
    {
      id: 'roulette',
      name: '🎰 Рулетка',
      description: 'Делайте ставки и выигрывайте призы!',
      icon: '🎰',
      color: 'from-red-500 to-pink-500',
      bgColor: 'from-red-50 to-pink-50',
      darkBgColor: 'from-red-900/20 to-pink-900/20'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Секция игр */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          🎮 Доступные игры
        </h2>
        <div className="space-y-3">
          {games.map((game) => (
            <div
              key={game.id}
              className={`bg-gradient-to-r ${game.bgColor} dark:${game.darkBgColor} rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${game.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <span className="text-2xl">{game.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
                      {game.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {game.description}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => onGameSelect(game.id)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                  size="s"
                >
                  Играть
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Секция дополнительных функций */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          🔧 Дополнительно
        </h2>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
                  Список пользователей
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Посмотреть всех участников
                </p>
              </div>
            </div>
            <Button
              onClick={onShowUsers}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"
              size="s"
            >
              Открыть
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
