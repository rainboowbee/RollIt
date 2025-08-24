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
          <h2 className="text-2xl font-bold text-white">
            Профиль пользователя
          </h2>
          <button
            onClick={handleBackToList}
            className="bg-gradient-to-r from-slate-600/50 to-slate-700/50 hover:from-slate-500/50 hover:to-slate-600/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-slate-400/30 text-white transition-all duration-200 hover:shadow-lg hover:shadow-slate-400/20"
          >
            ← Назад
          </button>
        </div>

        {/* Профиль пользователя */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-cyan-400/30 shadow-lg shadow-cyan-400/20">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              {selectedUser.username ? `@${selectedUser.username}` : `Пользователь #${selectedUser.id}`}
            </h3>
          </div>

          {/* Балансы */}
          <div className="grid grid-cols-2 gap-4">
            {/* Баланс звезд */}
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl p-4 border border-cyan-400/50 shadow-lg shadow-cyan-400/20">
              <div className="text-center">
                <div className="text-3xl mb-2">⭐</div>
                <h4 className="text-sm font-semibold text-cyan-200 mb-2">Баланс</h4>
                <div className="text-2xl font-bold text-white">
                  {selectedUser.balance.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Roll Point */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-4 border border-purple-400/50 shadow-lg shadow-purple-400/20">
              <div className="text-center">
                <div className="text-3xl mb-2">🎯</div>
                <h4 className="text-sm font-semibold text-purple-200 mb-2">RollPoint</h4>
                <div className="text-2xl font-bold text-white">
                  {(selectedUser.balance * 1.254).toFixed(0)}
                </div>
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

      {/* Поиск */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-slate-400/30 shadow-lg shadow-slate-400/20">
        <input
          type="text"
          placeholder="Поиск по username, ID или Telegram ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/10 border border-slate-400/50 rounded-lg px-4 py-2 text-white placeholder-slate-300 focus:outline-none focus:border-cyan-400/50 transition-colors duration-200"
        />
      </div>

      {/* Статистика */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl p-4 border border-cyan-400/50 shadow-lg shadow-cyan-400/20">
        <div className="text-center">
          <div className="text-3xl font-bold text-cyan-400 mb-1">
            {filteredUsers.length}
          </div>
          <div className="text-cyan-200 text-sm">
            Пользователей найдено
          </div>
        </div>
      </div>

      {/* Список пользователей */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3 animate-pulse">⏳</div>
            <p className="text-slate-300">Загрузка пользователей...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-slate-300">
              {searchQuery ? 'Пользователи не найдены' : 'Пользователи не найдены'}
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserClick(user)}
              className="w-full bg-white/10 backdrop-blur-md rounded-xl p-4 border border-slate-400/30 shadow-lg shadow-slate-400/20 hover:shadow-xl hover:shadow-slate-400/30 transition-all duration-200 hover:scale-105 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-cyan-400/50">
                    {user.id}
                  </div>
                  <div>
                    <div className="font-medium text-white text-lg">
                      {user.username ? `@${user.username}` : `Пользователь #${user.id}`}
                    </div>
                    <div className="text-xs text-slate-300">
                      Регистрация: {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
                <div className="text-cyan-400 text-xl">→</div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
