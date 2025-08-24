'use client';

import { useState, useEffect } from 'react';

interface User {
  id: number;
  telegramId: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  photoUrl?: string | null;
  balance: number;
  createdAt: string;
}

interface UsersListProps {
  onBack: () => void;
}

export default function UsersList({ onBack }: UsersListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Не удалось загрузить пользователей');
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Загрузка пользователей...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-4xl mb-2">⚠️</div>
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button 
          onClick={onBack} 
          className="bg-gradient-to-r from-slate-600/50 to-slate-700/50 hover:from-slate-500/50 hover:to-slate-600/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-slate-400/30 text-white transition-all duration-200 hover:shadow-lg hover:shadow-slate-400/20"
        >
          ← Назад
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок с кнопкой назад */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          👥 Список пользователей
        </h2>
        <button 
          onClick={onBack} 
          className="bg-gradient-to-r from-slate-600/50 to-slate-700/50 hover:from-slate-500/50 hover:to-slate-600/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-slate-400/30 text-white transition-all duration-200 hover:shadow-lg hover:shadow-slate-400/20"
        >
          ← Назад
        </button>
      </div>

      {/* Статистика */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl p-6 border border-cyan-400/50 shadow-lg shadow-cyan-400/20">
        <div className="text-center">
          <div className="text-4xl font-bold text-cyan-400 mb-2">
            {users.length}
          </div>
          <div className="text-cyan-200 text-lg">
            Всего пользователей
          </div>
        </div>
      </div>

      {/* Список пользователей */}
      <div className="space-y-3">
        {users.map((user, index) => (
          <div
            key={user.id}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-slate-400/30 shadow-lg shadow-slate-400/20 hover:shadow-xl hover:shadow-slate-400/30 transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center space-x-4">
              {/* Аватар с красивой рамкой */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {user.firstName?.[0] || user.username?.[0] || 'U'}
                    </span>
                  </div>
                </div>
                {index < 3 && (
                  <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    index === 0 ? 'bg-yellow-400' : 
                    index === 1 ? 'bg-slate-400' : 'bg-amber-600'
                  }`}>
                    {index + 1}
                  </div>
                )}
              </div>

              {/* Информация о пользователе */}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-white text-lg">
                    {user.firstName} {user.lastName}
                  </h3>
                  {user.username && (
                    <span className="text-cyan-300 text-sm font-medium">
                      @{user.username}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-300 mb-2">
                  <span>ID: {user.telegramId}</span>
                  <span>Рег: {new Date(user.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>

              {/* Баланс с красивым дизайном */}
              <div className="text-right">
                <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-full border border-green-400/50 shadow-lg shadow-green-400/20">
                  <span className="text-green-400 font-bold text-sm">
                    {user.balance}
                  </span>
                  <span className="text-green-300 text-xs ml-1">⭐</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
