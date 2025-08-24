'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/types';

interface UsersListProps {
  onBack: () => void;
}

export default function UsersList({ onBack }: UsersListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (user.username && user.username.toLowerCase().includes(query)) ||
      user.telegramId.includes(query) ||
      user.id.toString().includes(query)
    );
  });

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleBackToList = () => {
    setSelectedUser(null);
  };

  if (selectedUser) {
    return (
      <div className="space-y-6">
        {/* Заголовок профиля */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Профиль пользователя
          </h2>
          <button
            onClick={handleBackToList}
            className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-4 py-2 transition-colors duration-200"
          >
            ← Назад
          </button>
        </div>

        {/* Профиль пользователя */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {selectedUser.username ? `@${selectedUser.username}` : `Пользователь #${selectedUser.id}`}
            </h3>
          </div>

          {/* Балансы */}
          <div className="grid grid-cols-2 gap-4">
            {/* Баланс звезд */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="text-center">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Баланс</h4>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {selectedUser.balance.toLocaleString()}
                </div>
                <div className="text-xl">⭐</div>
              </div>
            </div>

            {/* Roll Point */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="text-center">
                <h4 className="text-sm font-medium text-gray-600 mb-2">RollPoint</h4>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {(selectedUser.balance * 1.254).toFixed(0)}
                </div>
                <div className="text-xl">🎯</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок с кнопкой назад */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          👥 Список пользователей
        </h2>
        <button
          onClick={onBack}
          className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-4 py-2 transition-colors duration-200"
        >
          ← Назад
        </button>
      </div>

      {/* Поиск */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <input
          type="text"
          placeholder="Поиск по username, ID или Telegram ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
        />
      </div>

      {/* Статистика */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {filteredUsers.length}
          </div>
          <div className="text-gray-600 text-sm">
            Пользователей найдено
          </div>
        </div>
      </div>

      {/* Список пользователей */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3 animate-pulse">⏳</div>
            <p className="text-gray-600">Загрузка пользователей...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-600">
              {searchQuery ? 'Пользователи не найдены' : 'Пользователи не найдены'}
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserClick(user)}
              className="w-full bg-white hover:bg-gray-50 rounded-xl p-4 shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                    {user.id}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-lg">
                      {user.username ? `@${user.username}` : `Пользователь #${user.id}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      Регистрация: {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
                <div className="text-blue-500 text-xl">→</div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
