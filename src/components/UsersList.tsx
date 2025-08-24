'use client';

import { useState, useEffect } from 'react';
import { Button, Avatar } from '@telegram-apps/telegram-ui';

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
        <Button onClick={onBack} size="s">
          ← Назад
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок с кнопкой назад */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          👥 Список пользователей
        </h2>
        <Button 
          onClick={onBack} 
          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
          size="s"
        >
          ← Назад
        </Button>
      </div>

      {/* Статистика */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
            {users.length}
          </div>
          <div className="text-gray-600 dark:text-gray-300 text-sm">
            Всего пользователей
          </div>
        </div>
      </div>

      {/* Список пользователей */}
      <div className="space-y-3">
        {users.map((user, index) => (
          <div
            key={user.id}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              {/* Аватар с красивой рамкой */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-0.5">
                  <Avatar
                    size={44}
                    src={user.photoUrl || undefined}
                    className="w-full h-full rounded-full"
                  />
                </div>
                {index < 3 && (
                  <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                  }`}>
                    {index + 1}
                  </div>
                )}
              </div>

              {/* Информация о пользователе */}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    {user.firstName} {user.lastName}
                  </h3>
                  {user.username && (
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                      @{user.username}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>ID: {user.telegramId}</span>
                  <span>Баланс: {user.balance} монет</span>
                </div>
                
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Регистрация: {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                </div>
              </div>

              {/* Баланс с красивым дизайном */}
              <div className="text-right">
                <div className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full">
                  <span className="text-green-600 dark:text-green-400 font-bold text-sm">
                    {user.balance}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
